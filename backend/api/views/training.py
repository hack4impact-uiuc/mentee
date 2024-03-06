from flask import Blueprint, request
import json
from werkzeug.utils import secure_filename
from api.core import create_response, logger
from api.models import (
    Hub,
    Training,
    MentorProfile,
    MenteeProfile,
    PartnerProfile,
    Translations,
)
from datetime import datetime
from PyPDF2 import PdfReader
from api.utils.require_auth import admin_only, all_users
from api.utils.translate import (
    document_translate_all_languages,
    populate_translation_field,
    get_translation_document,
    get_all_translations,
)
from datetime import datetime
from flask import send_file
from io import BytesIO
from api.utils.constants import (
    Account,
    NEW_TRAINING_TEMPLATE,
    TRANSLATIONS,
    TARGET_LANGS,
    TRANSLATION_COST_PER_PAGE,
)
from api.utils.request_utils import send_email

training = Blueprint("training", __name__)  # initialize blueprint


@training.route("/<role>", methods=["GET"])
def get_trainings(role):
    lang = request.args.get("lang", "en-US")
    trainings = Training.objects(role=str(role))
    result = []

    Hub_users = Hub.objects()
    Hub_users_object = {}
    for hub_user in Hub_users:
        Hub_users_object[str(hub_user.id)] = {
            "name": hub_user.name,
            "url": hub_user.url,
            "email": hub_user.email,
            "image": hub_user.image,
        }

    temp = []
    for training in trainings:
        if training.hub_id is not None:
            training.hub_user = Hub_users_object[str(training.hub_id)]
        temp.append(training)
    trainings = temp

    if lang in TARGET_LANGS:
        for training in trainings:
            training_dict = json.loads(training.to_json())
            training_dict["name"] = training.nameTranslated.get(lang, training.name)
            training_dict["description"] = training.descriptionTranslated.get(
                lang, training.description
            )
            result.append(training_dict)
    else:
        result = trainings

    return create_response(data={"trainings": result})


@training.route("/<string:id>", methods=["DELETE"])
@admin_only
def delete_train(id):
    try:
        train = Training.objects.get(id=id)
        train.delete()
    except:
        return create_response(status=422, message="training not found")

    return create_response(status=200, message="Successful deletion")


################################################################################
@training.route("/train/<string:id>", methods=["GET"])
# @admin_only
def get_train(id):
    try:
        train = Training.objects.get(id=id)
    except:
        return create_response(status=422, message="training not found")

    return create_response(status=200, data={"train": train})


##################################################################################
@training.route("/trainVideo/<string:id>", methods=["GET"])
# @all_users
def get_train_file(id):
    lang = request.args.get("lang", "en-US")
    try:
        train = Training.objects.get(id=id)
    except:
        return create_response(status=422, message="training not found")

    if lang in TARGET_LANGS:
        document = get_translation_document(train.translations, lang)
    else:
        document = train.filee.read()

    content_type = train.filee.content_type

    if not document:
        return create_response(status=422, message="No document found")
    return send_file(
        BytesIO(document), download_name=train.file_name, mimetype=content_type
    )


#############################################################################
@training.route("/<string:id>", methods=["PUT"])
@admin_only
def get_train_id_edit(id):
    isVideo = True if request.form["isVideo"] == "true" else False

    try:
        train = Training.objects.get(id=id)
    except Exception as e:
        return create_response(status=422, message=f"Failed to get training: {e}")

    new_name = request.form.get("name", train.name)
    new_description = request.form.get("description", train.description)

    hub_id = None
    if "hub_id" in request.form:
        hub_id = request.form["hub_id"]
    train.hub_id = hub_id

    if train.name != new_name:
        train.name = new_name
        train.nameTranslated = get_all_translations(new_name)
    if train.description != new_description:
        train.description = new_description
        train.descriptionTranslated = get_all_translations(new_description)

    train.role = str(request.form.get("role", train.role))
    train.typee = request.form.get("typee", train.typee)
    train.isVideo = isVideo
    if not isVideo and request.form.get("isNewDocument", False) == "true":
        document = request.files.get("document", None)
        if not document:
            return create_response(status=400, message="Missing file")
        file_name = secure_filename(document.filename)
        if file_name == "":
            return create_response(status=400, message="Missing file name")

        train.filee.replace(document, filename=file_name)
        train.file_name = file_name
    else:
        train.url = request.form.get("url", train.url)

    train.save()

    return create_response(status=200, data={"train": train})


######################################################################
@training.route("/<role>", methods=["POST"])
@admin_only
def new_train(role):
    try:
        name = request.form["name"]
        nameTranslated = get_all_translations(request.form["description"])
        description = request.form["description"]
        descriptionTranslated = get_all_translations(request.form["description"])
        typee = request.form["typee"]
        isVideo = True if request.form["isVideo"] == "true" else False
        hub_id = None

        if "hub_id" in request.form:
            hub_id = request.form["hub_id"]

        train = Training(
            name=name,
            nameTranslated=nameTranslated,
            description=description,
            descriptionTranslated=descriptionTranslated,
            role=str(role),
            typee=typee,
            isVideo=isVideo,
            date_submitted=datetime.now(),
            hub_id=hub_id,
        )
        if not isVideo:
            document = request.files.get("document", None)
            if not document:
                return create_response(status=400, message="Missing file")

            file_name = secure_filename(document.filename)
            if file_name == "":
                return create_response(status=400, message="Missing file name")

            train.file_name = file_name
            train.filee.put(document, filename=file_name)
        else:
            train.url = request.form["url"]

        train.save()

        # TODO: Remove this so that it is a job in the background
        new_train_id = train.id
        if int(role) == Account.MENTOR:
            recipients = MentorProfile.objects.only("email", "preferred_language")
        elif int(role) == Account.MENTEE:
            recipients = MenteeProfile.objects.only("email", "preferred_language")
        elif int(role) == Account.PARTNER:
            recipients = PartnerProfile.objects.only("email", "preferred_language")
        else:
            hub_users = Hub.objects.filter(id=hub_id).only(
                "email", "preferred_language"
            )
            partners = PartnerProfile.objects.filter(hub_id=hub_id).only(
                "email", "preferred_language"
            )
            recipients = []
            for hub_user in hub_users:
                recipients.append(hub_user)
            for partner_user in partners:
                recipients.append(partner_user)
            print("www", recipients)

        front_url = request.form["front_url"]
        target_url = front_url + "new_training/" + role + "/" + str(new_train_id)

        for recipient in recipients:
            res, res_msg = send_email(
                recipient=recipient.email,
                data={
                    "link": target_url,
                    recipient.preferred_language: True,
                    "subject": TRANSLATIONS[recipient.preferred_language][
                        "new_training"
                    ],
                },
                template_id=NEW_TRAINING_TEMPLATE,
            )
        if not res:
            msg = "Failed to send new traing data alert email " + res_msg
            logger.error(msg)

    except Exception as e:
        return create_response(status=400, message=f"missing parameters {e}")

    return create_response(status=200, data={"train": train})


# TODO: Find a way to optimize this
# @training.route("/translateCost/<string:id>", methods=["GET"])
# @admin_only
# def get_translation_cost(id):
#     try:
#         training = Training.objects.get(id=id)
#     except Exception as e:
#         return create_response(
#             status=400, message=f"Could not find training object {e}"
#         )

#     try:
#         document = training.filee
#         reader = PdfReader(document)
#         pages = len(reader.pages)
#         cost = pages * TRANSLATION_COST_PER_PAGE * len(TARGET_LANGS)
#     except Exception as e:
#         return create_response(
#             status=500, message=f"Failed to calculate translation cost {e}"
#         )

#     return create_response(status=200, data={"cost": cost})


@training.route("/translate/<string:id>", methods=["PUT"])
@admin_only
def translate_training(id):
    try:
        training = Training.objects.get(id=id)
    except Exception as e:
        return create_response(
            status=400, message=f"Could not find training object {e}"
        )

    try:
        document = training.filee
        translations = document_translate_all_languages(document, training.file_name)
        new_translations = Translations()
        new_translations = populate_translation_field(
            new_translations, translations, training.file_name
        )
        training.translations = new_translations
        training.save()
    except Exception as e:
        return create_response(status=500, message=f"Failed to translate languages {e}")

    return create_response(status=200, message="Successful translation")
