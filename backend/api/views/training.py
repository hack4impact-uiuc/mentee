from flask import Blueprint, request
from werkzeug.utils import secure_filename
from api.core import create_response, logger
from api.models import (
    Training,
    MentorProfile,
    MenteeProfile,
    PartnerProfile,
    Translations,
)
from datetime import datetime
from PyPDF2 import PdfReader
from api.utils.require_auth import admin_only, all_users
from api.utils.google_translate import (
    document_translate_all_languages,
    populate_translation_field,
    get_translation_document,
)
from datetime import datetime
from flask import send_file
from io import BytesIO
from api.utils.constants import (
    Account,
    NEW_TRAINING_TEMPLATE,
    TRANSLATIONS,
    I18N_LANGUAGES,
    TRANSLATION_COST_PER_PAGE,
)
from api.utils.request_utils import send_email

training = Blueprint("training", __name__)  # initialize blueprint


@training.route("/<role>", methods=["GET"])
def get_trainings(role):
    trainings = Training.objects(role=str(role))
    trainings = list(trainings)
    for train in trainings:
        train.id = train.id

    return create_response(data={"trainings": trainings})


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

    if lang in I18N_LANGUAGES:
        if lang == "en-US":
            document = train.filee.read()
        else:
            document = get_translation_document(train.translations, lang)
    else:
        return create_response(status=422, message="Language requested not supported")

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

    # try:
    train = Training.objects.get(id=id)
    train.name = request.form["name"]
    train.description = request.form["description"]
    train.role = str(request.form["role"])
    train.typee = request.form["typee"]
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
        train.url = request.form["url"]

    train.save()

    # except:
    #   return create_response(status=422, message="training not found")

    return create_response(status=200, data={"train": train})


######################################################################
@training.route("/<role>", methods=["POST"])
@admin_only
def new_train(role):
    try:
        name = request.form["name"]
        description = request.form["description"]
        typee = request.form["typee"]
        isVideo = True if request.form["isVideo"] == "true" else False

        train = Training(
            name=name,
            description=description,
            role=str(role),
            typee=typee,
            isVideo=isVideo,
            date_submitted=datetime.now(),
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
        else:
            recipients = PartnerProfile.objects.only("email", "preferred_language")
        front_url = request.form["front_url"]
        target_url = front_url + "new_training/" + role + "/" + str(new_train_id)

        for recipient in recipients:
            # if not recipient.preferred_language:
            #     recipient.preferred_language = "en-US"
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


@training.route("/translateCost/<string:id>", methods=["GET"])
@admin_only
def get_translation_cost(id):
    try:
        training = Training.objects.get(id=id)
    except Exception as e:
        return create_response(
            status=400, message=f"Could not find training object {e}"
        )

    try:
        document = training.filee
        reader = PdfReader(document)
        pages = len(reader.pages)
        cost = pages * TRANSLATION_COST_PER_PAGE * (len(I18N_LANGUAGES) - 1)
    except Exception as e:
        return create_response(
            status=500, message=f"Failed to calculate translation cost {e}"
        )

    return create_response(status=200, data={"cost": cost})


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
