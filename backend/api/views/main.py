from flask import Blueprint, request
from bson import ObjectId
from api.models import (
    db,
    MentorProfile,
    MenteeProfile,
    AppointmentRequest,
    Users,
    Image,
)
from api.core import create_response, logger
from api.utils.request_utils import (
    MentorForm,
    MenteeForm,
    EducationForm,
    VideoForm,
    is_invalid_form,
    imgur_client,
)
from api.utils.profile_parse import new_profile, edit_profile
from api.utils.constants import Account

main = Blueprint("main", __name__)  # initialize blueprint

# GET request for /accounts/<type>
@main.route("/accounts/<int:level>", methods=["GET"])
def get_accounts(level):
    accounts = None
    if level == Account.MENTOR:
        accounts = MentorProfile.objects().exclude("availability", "videos")
    elif level == Account.MENTEE:
        accounts = MenteeProfile.objects().exclude("video", "phone_number", "email")
    else:
        msg = "Given parameter does not match the current exiting levels of accounts"
        return create_response(status=422, message=msg) 

    return create_response(data={"accounts": accounts})


# GET request for specific account based on id
@main.route("/account/<string:account_id>", methods=["GET"])
def get_account(account_id):
    try:
        level = int(request.args["level"])
    except:
        msg = "level parameter is not an int or missing level parameter"
        return create_response(status=422, message=msg)
    
    account = None
    if level == Account.MENTOR:
        try:
            account = MentorProfile.objects.get(id=account_id)
        except:
            msg = "No mentors currently exist with ID " + account_id
            logger.info(msg)
            return create_response(status=422, message=msg)
    elif level == Account.MENTEE:
        try:
            account = MenteeProfile.objects.get(id=account_id)
        except:
            msg = "No mentee currently exists with ID " + account_id
            logger.info(msg)
            return create_response(status=422, message=msg)
    else:
        msg = "Given level parameter does not match type of accounts"
        return create_response(status=422, message=msg)

    return create_response(data={"account": account})


# POST request for a new account profile
@main.route("/account", methods=["POST"])
def create_mentor_profile():
    data = request.json

    try:
        level = int(data["level"])
    except:
        msg = "missing level param or level param is not an int"
        return create_response(status=422, message=msg)
    

    validate_data = None
    if level == Account.MENTOR:
        validate_data = MentorForm.from_json(data)
    elif level == Account.MENTEE:
        validate_data = MenteeForm.from_json(data)
    else:
        msg = "level param does not match existing account types"
        return create_response(status=422, message=msg)

    msg, is_invalid = is_invalid_form(validate_data)
    if is_invalid:
        return create_response(status=422, message=msg)

    if "videos" in data and level == Account.MENTOR:
        for video in data["videos"]:
            validate_video = VideoForm.from_json(video)

            msg, is_invalid = is_invalid_form(validate_video)
            if is_invalid:
                return create_response(status=422, message=msg)
    elif "video" in data and level == Account.MENTEE:
        validate_video = VideoForm.from_json(data["video"])

        msg, is_invalid = is_invalid_form(validate_video)
        if is_invalid:
            return create_response(status=422, message=msg)

    if "education" in data:
        for education in data["education"]:
            validate_education = EducationForm.from_json(education)

            msg, is_invalid = is_invalid_form(validate_education)
            if is_invalid:
                return create_response(status=422, message=msg)

    user = Users.objects.get(id=data["user_id"])
    data["email"] = user.email

    new_account = new_profile(data=data, profile_type=level)

    if not new_account:
        msg = "Could not parse Account Data"
        create_response(status=400, message=msg)

    new_account.save()
    return create_response(
        message=f"Successfully created Mentor Profile {new_account.name}",
        data={"mentorId": str(new_account.id)},
    )


# PUT requests for /mentor
@main.route("/mentor/<id>", methods=["PUT"])
def edit_mentor(id):
    data = request.get_json()

    # Try to retrieve Mentor profile from database
    try:
        mentor = MentorProfile.objects.get(id=id)
    except:
        msg = "No mentor with that id"
        logger.info(msg)
        return create_response(status=422, message=msg)

    if not edit_profile(data, mentor):
        msg = "Couldn't update profile"
        return create_response(status=500, message=msg)

    mentor.save()

    return create_response(status=200, message=f"Success")


# PUT requests for /mentee
@main.route("/mentee/<id>", methods=["PUT"])
def edit_mentee(id):
    data = request.get_json()

    # Try to retrieve Mentor profile from database
    try:
        mentee = MenteeProfile.objects.get(id=id)
    except:
        msg = "No mentee with that id"
        logger.info(msg)
        return create_response(status=422, message=msg)

    if not edit_profile(data, mentee):
        msg = "Couldn't update profile"
        return create_response(status=500, message=msg)

    mentee.save()

    return create_response(status=200, message=f"Success")


@main.route("/account/<id>/image", methods=["PUT"])
def uploadImage(id):
    image = request.files["image"]
    account_type = request.form["type"]
    account = None

    try:
        image_response = imgur_client.send_image(image)
    except:
        return create_response(status=400, message=f"Image upload failed")
    try:
        if account_type == "mentee":
            account = MenteeProfile.objects.get(id=id)
        elif account_type == "mentor":
            account = MentorProfile.objects.get(id=id)
    except:
        msg = "No account with that id"
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

    account.save()
    return create_response(status=200, message=f"Success")
