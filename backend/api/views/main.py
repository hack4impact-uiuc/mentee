from flask import Blueprint, request
from sqlalchemy import true
from api.views.auth import create_firebase_user
from api.utils.request_utils import PartnerForm
from bson import ObjectId
from datetime import datetime

from api.models import (
    db,
    MentorProfile,
    MenteeProfile,
    AppointmentRequest,
    Users,
    Image,
    Video,
    PartnerProfile,
    Notifications,
)
from api.utils.constants import PROFILE_COMPLETED
from api.utils.request_utils import send_email
from api.core import create_response, logger
from api.utils.request_utils import (
    MentorForm,
    MenteeForm,
    EducationForm,
    VideoForm,
    is_invalid_form,
    imgur_client,
    application_model,
)
from api.utils.constants import NEW_APPLICATION_STATUS
from api.utils.profile_parse import new_profile, edit_profile
from api.utils.constants import Account
from firebase_admin import auth as firebase_admin_auth


main = Blueprint("main", __name__)  # initialize blueprint


# GET request for /accounts/<type>
@main.route("/accounts/<int:account_type>", methods=["GET"])
def get_accounts(account_type):
    accounts = None
    if account_type == Account.MENTOR:
        accounts = MentorProfile.objects().exclude("availability", "videos")
    elif account_type == Account.MENTEE:
        accounts = MenteeProfile.objects(is_private=False).exclude(
            "video", "phone_number", "email"
        )
    elif account_type == Account.PARTNER:
        accounts = PartnerProfile.objects()
    else:
        msg = "Given parameter does not match the current exiting account_types of accounts"
        return create_response(status=422, message=msg)

    return create_response(data={"accounts": accounts})


# GET request for specific account based on id
@main.route("/account/<string:id>", methods=["GET"])
def get_account(id):
    try:
        account_type = int(request.args["account_type"])
    except:
        msg = "Missing account_type param or account_type param is not an int"
        return create_response(status=422, message=msg)

    account = None
    try:
        if account_type == Account.MENTEE:
            account = MenteeProfile.objects.get(id=id)
        elif account_type == Account.MENTOR:
            account = MentorProfile.objects.get(id=id)
        elif account_type == Account.PARTNER:
            account = PartnerProfile.objects.get(id=id)
        else:
            msg = "Level param doesn't match existing account types"
            return create_response(status=422, message=msg)
    except:
        msg = ""
        if account_type == Account.MENTEE:
            msg = "No mentee with that id"
        elif account_type == Account.MENTOR:
            msg = "No mentor with that id"
        logger.info(msg)
        return create_response(status=422, message=msg)

    return create_response(data={"account": account})


# POST request for a new account profile
@main.route("/account", methods=["POST"])
def create_mentor_profile():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    try:
        account_type = int(data["account_type"])
    except:
        msg = "Missing account_type param or account_type param is not an int"
        logger.info(msg)
        return create_response(status=422, message=msg)
    data["firebase_uid"] = "temp"
    if account_type == Account.MENTOR:
        data["taking_appointments"] = True

    validate_data = None
    if account_type == Account.MENTOR:
        validate_data = MentorForm.from_json(data)
    elif account_type == Account.MENTEE:
        validate_data = MenteeForm.from_json(data)
    elif account_type == Account.PARTNER:
        validate_data = PartnerForm.from_json(data)
    else:
        msg = "Level param does not match existing account types"
        logger.info(msg)
        return create_response(status=422, message=msg)

    msg, is_invalid = is_invalid_form(validate_data)
    if is_invalid:
        logger.info(msg)
        return create_response(status=422, message=msg)

    if "videos" in data and account_type == Account.MENTOR:
        for video in data["videos"]:
            validate_video = VideoForm.from_json(video)

            msg, is_invalid = is_invalid_form(validate_video)
            if is_invalid:
                logger.info(msg)
                return create_response(status=422, message=msg)

    elif "video" in data and account_type == Account.MENTEE:
        validate_video = VideoForm.from_json(data["video"])

        msg, is_invalid = is_invalid_form(validate_video)
        if is_invalid:
            logger.info(msg)
            return create_response(status=422, message=msg)
        video_data = data.get("video")
        data["video"] = Video(
            title=video_data.get("title"),
            url=video_data.get("url"),
            tag=video_data.get("tag"),
            date_uploaded=video_data.get("date_uploaded"),
        )
    if "video" in data and account_type == Account.MENTOR:
        validate_video = VideoForm.from_json(data["video"])

        msg, is_invalid = is_invalid_form(validate_video)
        if is_invalid:
            logger.info(msg)
            return create_response(status=422, message=msg)
        video_data = data.get("video")
        data["video"] = Video(
            title=video_data.get("title"),
            url=video_data.get("url"),
            tag=video_data.get("tag"),
            date_uploaded=video_data.get("date_uploaded"),
        )
    if "education" in data:
        for education in data["education"]:
            validate_education = EducationForm.from_json(education)

            msg, is_invalid = is_invalid_form(validate_education)
            if is_invalid:
                return create_response(status=422, message=msg)

    logger.info(data)
    new_account = new_profile(data=data, profile_type=account_type)

    if not new_account:
        msg = "Could not parse Account Data"
        logger.info(msg)
        create_response(status=400, message=msg)
    firebase_user, error_http_response = create_firebase_user(email, password)
    if error_http_response:
        return error_http_response

    firebase_uid = firebase_user.uid
    data["firebase_uid"] = firebase_uid
    new_account.save()
    user = Users(
        firebase_uid=firebase_uid,
        email=email,
        role="{}".format(account_type),
        verified=False,
    )
    user.save()
    if account_type != Account.PARTNER:
        try:
            application = application_model(account_type)
            exist_application = application.objects.get(email=email)
            exist_application["application_state"] = NEW_APPLICATION_STATUS.COMPLETED
            exist_application.save()
        except:
            pass
    ########
    success, msg = send_email(
        recipient=email,
        subject="Your account have been successfully Created " + email,
        template_id=PROFILE_COMPLETED,
    )
    notify = Notifications(
        message="New Mentor with name(" + new_account.name + ") has created profile"
        if account_type != Account.PARTNER
        else "New Partner with name("
        + new_account.person_name
        + ") has created profile",
        mentorId=str(new_account.id),
        readed=False,
        date_submitted=datetime.now(),
    )
    notify.save()
    if not success:
        logger.info(msg)
    return create_response(
        message=f"Successfully created {account_type} Profile account {new_account.email}",
        data={
            "mentorId": str(new_account.id),
            "token": firebase_admin_auth.create_custom_token(
                firebase_uid, {"role": account_type}
            ).decode("utf-8"),
        },
    )


@main.route("/accountProfile", methods=["POST"])
def create_profile_existing_account():
    data = request.json
    email = data.get("email")
    user = firebase_admin_auth.get_user_by_email(email)
    data["firebase_uid"] = user.uid
    try:
        account_type = int(data["account_type"])
    except:
        msg = "Missing account_type param or account_type param is not an int"
        logger.info(msg)
        return create_response(status=422, message=msg)

    validate_data = None
    if account_type == Account.MENTOR:
        validate_data = MentorForm.from_json(data)
    elif account_type == Account.MENTEE:
        validate_data = MenteeForm.from_json(data)
    elif account_type == Account.PARTNER:
        validate_data = PartnerForm.from_json(data)
    else:
        msg = "Level param does not match existing account types"
        logger.info(msg)
        return create_response(status=422, message=msg)

    msg, is_invalid = is_invalid_form(validate_data)
    if is_invalid:
        logger.info(msg)
        return create_response(status=422, message=msg)

    if "videos" in data and account_type == Account.MENTOR:
        for video in data["videos"]:
            validate_video = VideoForm.from_json(video)

            msg, is_invalid = is_invalid_form(validate_video)
            if is_invalid:
                logger.info(msg)
                return create_response(status=422, message=msg)

    elif "video" in data and account_type == Account.MENTEE:
        validate_video = VideoForm.from_json(data["video"])

        msg, is_invalid = is_invalid_form(validate_video)
        if is_invalid:
            logger.info(msg)
            return create_response(status=422, message=msg)
        video_data = data.get("video")
        data["video"] = Video(
            title=video_data.get("title"),
            url=video_data.get("url"),
            tag=video_data.get("tag"),
            date_uploaded=video_data.get("date_uploaded"),
        )

    if "video" in data and account_type == Account.MENTOR:
        validate_video = VideoForm.from_json(data["video"])

        msg, is_invalid = is_invalid_form(validate_video)
        if is_invalid:
            logger.info(msg)
            return create_response(status=422, message=msg)
        video_data = data.get("video")
        data["video"] = Video(
            title=video_data.get("title"),
            url=video_data.get("url"),
            tag=video_data.get("tag"),
            date_uploaded=video_data.get("date_uploaded"),
        )
    if "education" in data:
        for education in data["education"]:
            validate_education = EducationForm.from_json(education)

            msg, is_invalid = is_invalid_form(validate_education)
            if is_invalid:
                return create_response(status=422, message=msg)

    logger.info(data)
    new_account = new_profile(data=data, profile_type=account_type)

    if not new_account:
        msg = "Could not parse Account Data"
        logger.info(msg)
        create_response(status=400, message=msg)

    new_account.save()
    return create_response(
        message=f"Successfully created {account_type} Profile for existing account {new_account.email}",
        data={
            "mentorId": str(new_account.id),
            "token": firebase_admin_auth.create_custom_token(
                new_account.firebase_uid, {"role": account_type}
            ).decode("utf-8"),
        },
    )


# PUT requests for /account
@main.route("/account/<id>", methods=["PUT"])
def edit_mentor(id):
    data = request.get_json()

    try:
        account_type = int(request.args["account_type"])
    except:
        msg = "Level param doesn't exist or isn't an int"
        return create_response(status=422, message=msg)

    # Try to retrieve account profile from database
    account = None
    try:
        if account_type == Account.MENTEE:
            account = MenteeProfile.objects.get(id=id)
        elif account_type == Account.MENTOR:
            account = MentorProfile.objects.get(id=id)
        elif account_type == Account.PARTNER:
            account = PartnerProfile.objects.get(id=id)
        else:
            msg = "Level param doesn't match existing account types"
            return create_response(status=422, message=msg)
    except:
        msg = ""
        if account_type == Account.MENTEE:
            msg = "No mentee with that id"
        elif account_type == Account.MENTOR:
            msg = "No mentor with that id"
        logger.info(msg)
        return create_response(status=422, message=msg)

    if not edit_profile(data, account):
        msg = "Couldn't update profile"
        return create_response(status=500, message=msg)

    account.save()

    return create_response(status=200, message=f"Success")


@main.route("/account/<id>/image", methods=["PUT"])
def uploadImage(id):
    image = request.files["image"]
    try:
        account_type = int(request.form["account_type"])
    except:
        msg = "Level param doesn't exist or isn't an int"
        return create_response(status=422, message=msg)

    account = None

    try:
        image_response = imgur_client.send_image(image)
    except:
        return create_response(status=400, message=f"Image upload failed")

    try:
        if account_type == Account.MENTEE:
            account = MenteeProfile.objects.get(id=id)
        elif account_type == Account.MENTOR:
            account = MentorProfile.objects.get(id=id)
        elif account_type == Account.PARTNER:
            account = PartnerProfile.objects.get(id=id)
        else:
            msg = "Level param doesn't match existing account types"
            return create_response(status=422, message=msg)
    except:
        msg = ""
        if account_type == Account.MENTEE:
            msg = "No mentee with that id"
        elif account_type == Account.MENTOR:
            msg = "No mentor with that id"
        logger.info(msg)
        return create_response(status=422, message=msg)

    try:
        if account.image is True and account.image.image_hash is True:
            image_response = imgur_client.delete_image(account.image.image_hash)
    except:
        logger.info("Failed to delete image but saving new image")

    new_image = Image(
        url=image_response["data"]["link"],
        image_hash=image_response["data"]["deletehash"],
    )

    account.image = new_image
    if account_type == Account.MENTOR and "taking_appointments" not in account:
        account.taking_appointments = False
    account.save()
    return create_response(status=200, message=f"Success")


# GET request for /account/<id>/private
@main.route("/account/<id>/private", methods=["GET"])
def is_mentee_account_private(id):
    try:
        mentee = MenteeProfile.objects.get(id=id)
    except:
        msg = "No mentee with that id"
        logger.info(msg)
        return create_response(status=422, message=msg)

    return create_response(data={"private": True if mentee.is_private else False})
