from flask import Blueprint, request
import json
from numpy import imag
from werkzeug.utils import secure_filename
from api.core import create_response, logger
from api.models import (
    Event,
    Hub,
    Image,
    MentorProfile,
    MenteeProfile,
    PartnerProfile,
)
from datetime import datetime
from api.utils.translate import (
    get_all_translations,
)
from datetime import datetime
from api.utils.constants import (
    Account,
    EVENT_TEMPLATE,
    TRANSLATIONS,
    TARGET_LANGS,
)
from api.utils.request_utils import send_email, imgur_client

event = Blueprint("event", __name__)  # initialize blueprint


@event.route("events/<role>", methods=["GET"])
def get_events(role):
    lang = request.args.get("lang", "en-US")
    hub_user_id = request.args.get("hub_user_id", None)
    if int(role) == Account.ADMIN:
        events = Event.objects().order_by("-start_datetime")
    elif int(role) == Account.HUB:
        events = Event.objects.filter(
            role__in=[role], hub_id=str(hub_user_id)
        ).order_by("-start_datetime")
    else:
        events = Event.objects(role__in=[role]).order_by("-start_datetime")
    result = []

    if lang in TARGET_LANGS:
        for event in events:
            event_dic = json.loads(event.to_json())
            event_dic["name"] = event.titleTranslated.get(lang, event.title)
            event_dic["description"] = event.descriptionTranslated.get(
                lang, event.description
            )
            result.append(event_dic)
    else:
        result = events

    return create_response(data={"events": result})


@event.route("event/<string:id>", methods=["GET"])
def get_event_by_id(id):
    try:
        event = Event.objects.get(id=id)
    except:
        return create_response(status=422, message="event not found")

    return create_response(data={"event": event})


@event.route("events/delete/<string:id>", methods=["DELETE"])
def delete_train(id):
    try:
        event = Event.objects.get(id=id)
        event.delete()
    except:
        return create_response(status=422, message="event not found")

    return create_response(status=200, message="Successful deletion")


######################################################################
def send_mail_for_event(recipients, role_name, title, eventdate):
    for recipient in recipients:
        res, res_msg = send_email(
            recipient=recipient.email,
            data={
                "eventtitle": title,
                "eventdate": eventdate,
                "role": role_name,
                recipient.preferred_language: True,
                "subject": TRANSLATIONS[recipient.preferred_language]["new_event"],
            },
            template_id=EVENT_TEMPLATE,
        )
        if not res:
            msg = "Failed to send new event data alert email " + res_msg
            logger.error(msg)


@event.route("event_register", methods=["POST"])
def new_event():
    try:
        data = request.get_json()
        event_id = data["event_id"]
        user_id = data["user_id"]
        title = data["title"]
        roles = data["role"]
        titleTranslated = get_all_translations(data["title"])
        description = None
        descriptionTranslated = None
        if "description" in data:
            description = data["description"]
            descriptionTranslated = get_all_translations(data["description"])
        start_datetime = None
        end_datetime = None
        start_datetime_str = ""
        end_datetime_str = ""
        url = None
        hub_id = None
        if "start_datetime" in data:
            start_datetime = data["start_datetime"]
            start_datetime_str = data["start_datetime_str"]
        if "end_datetime" in data:
            end_datetime = data["end_datetime"]
            end_datetime_str = data["end_datetime_str"]
        if "url" in data:
            url = data["url"]
        if "hub_id" in data:
            hub_id = data["hub_id"]

        if event_id == 0:
            event = Event(
                user_id=user_id,
                title=title,
                titleTranslated=titleTranslated,
                description=description,
                descriptionTranslated=descriptionTranslated,
                role=list(roles),
                start_datetime=start_datetime,
                end_datetime=end_datetime,
                url=url,
                hub_id=hub_id,
                date_submitted=datetime.now(),
            )
            event.save()

            role_name = ""
            eventdate = ""
            if start_datetime_str != "":
                eventdate = start_datetime_str + " ~ " + end_datetime_str
            if Account.MENTOR in roles:
                recipients = MentorProfile.objects.only("email", "preferred_language")
                role_name = "MENTOR"
                send_mail_for_event(recipients, role_name, title, eventdate)
            if Account.MENTEE in roles:
                recipients = MenteeProfile.objects.only("email", "preferred_language")
                role_name = "MENTEE"
                send_mail_for_event(recipients, role_name, title, eventdate)
            if Account.PARTNER in roles:
                recipients = PartnerProfile.objects.only("email", "preferred_language")
                role_name = "Partner"
                send_mail_for_event(recipients, role_name, title, eventdate)
            if hub_id is not None:
                role_name = "Hub"
                partners = PartnerProfile.objects.filter(hub_id=hub_id).only(
                    "email", "preferred_language"
                )
                hub_users = Hub.objects(id=hub_id).only("email", "preferred_language")
                recipients = []
                for hub_user in hub_users:
                    recipients.append(hub_user)
                for partner_user in partners:
                    recipients.append(partner_user)
                send_mail_for_event(recipients, role_name, title, eventdate)
        else:
            print("www")
            print(hub_id)
            event = Event.objects.get(id=event_id)
            event.user_id = user_id
            event.title = title
            event.role = list(roles)
            event.titleTranslated = titleTranslated
            event.description = description
            event.descriptionTranslated = descriptionTranslated
            event.start_datetime = start_datetime
            event.end_datetime = end_datetime
            event.url = url
            event.hub_id = hub_id
            event.date_submitted = datetime.now()
            event.save()

    except Exception as e:
        return create_response(status=400, message=f"missing parameters {e}")

    return create_response(status=200, data={"event": event})


@event.route("event_register/<string:id>/image", methods=["PUT"])
def uploadImage(id):
    event = Event.objects.get(id=id)
    if event:
        try:
            if event.image_file is True and event.image_file.image_hash is True:
                image_response = imgur_client.delete_image(event.image_file.image_hash)

            image = request.files["image"]
            image_response = imgur_client.send_image(image)
            new_image = Image(
                url=image_response["data"]["link"],
                image_hash=image_response["data"]["deletehash"],
            )
            event.image_file = new_image
            event.save()
            return create_response(status=200, message=f"Image upload success")
        except:
            return create_response(status=400, message=f"Image upload failed")
    else:
        return create_response(status=400, message=f"Image upload failed")
