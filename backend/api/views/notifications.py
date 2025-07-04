from flask.globals import request
from api.core import create_response, logger
from flask import Blueprint
from api.models.MenteeProfile import MenteeProfile, MentorProfile
from mongoengine.queryset.visitor import Q
from api.models import DirectMessage, PartnerProfile, Hub
from api.utils.request_utils import send_email, send_sms
from api.utils.constants import (
    WEEKLY_NOTIF_REMINDER,
    UNREAD_MESSAGE_TEMPLATE,
    GROUPCHAT_TAGGED_MESSAGE_TEMPLATE,
    NEW_GROUPCHAT_TEMPLATE,
    REPLY_GROUPCHAT_TEMPLATE,
    TRANSLATIONS,
)
from api.utils.require_auth import all_users

notifications = Blueprint("notifications", __name__)


@notifications.route("/<id>", methods=["GET"])
@all_users
def get_unread_dm_count(id):
    try:
        notifications = DirectMessage.objects(
            Q(recipient_id=id) & Q(message_read=False)
        )
        unread_message_number = 0
        checked_ids = set()
        for message_item in notifications:
            sender_id = message_item["sender_id"]
            if sender_id not in checked_ids:
                try:
                    sender = MentorProfile.objects.get(id=sender_id)
                    if sender:
                        unread_message_number = unread_message_number + 1
                        continue
                except:
                    try:
                        sender = MenteeProfile.objects.get(id=sender_id)
                        if sender:
                            unread_message_number = unread_message_number + 1
                            continue
                    except:
                        try:
                            sender = PartnerProfile.objects.get(id=sender_id)
                            if sender:
                                unread_message_number = unread_message_number + 1
                                continue
                        except:
                            try:
                                sender = Hub.objects.get(id=sender_id)
                                if sender:
                                    unread_message_number = unread_message_number + 1
                                    continue
                            except:
                                continue
            else:
                unread_message_number = unread_message_number + 1
                continue

    except Exception as e:
        msg = "No mentee with that id"
        logger.info(e)
        return create_response(status=422, message=msg)

    return create_response(data={"notifications": unread_message_number})


@notifications.route("/unread_alert_group/<id>", methods=["GET"])
def send_unread_alert_group(id):
    tagged = request.args.get("tagged")
    new_message_flag = request.args.get("new_message_flag")
    front_url = request.args.get("front_url", "")
    title = request.args.get("title", "")
    try:
        email = None
        user_record = PartnerProfile.objects(Q(id=id)).first()
        if user_record is not None:
            email = user_record.email
        else:
            user_record = Hub.objects(Q(id=id)).first()
            if user_record is not None:
                email = user_record.email
        if user_record is not None:
            if tagged == "true":
                res, res_msg = send_email(
                    recipient=email,
                    data={
                        "number_unread": "1",
                        user_record.preferred_language: True,
                        "subject": TRANSLATIONS[user_record.preferred_language][
                            "unread_message"
                        ],
                    },
                    template_id=GROUPCHAT_TAGGED_MESSAGE_TEMPLATE,
                )
                if not res:
                    msg = "Failed to send unread message alert email " + res_msg
                    logger.info(msg)
            if new_message_flag == "true":
                res, res_msg = send_email(
                    recipient=email,
                    data={
                        "link": front_url,
                        "group_chat_title": title,
                        "subject": TRANSLATIONS[user_record.preferred_language][
                            "new_group_message"
                        ],
                    },
                    template_id=NEW_GROUPCHAT_TEMPLATE,
                )
                if not res:
                    msg = "Failed to send new group message alert email " + res_msg
                    logger.info(msg)
            else:
                res, res_msg = send_email(
                    recipient=email,
                    data={
                        "link": front_url,
                        "title": title,
                        "subject": TRANSLATIONS[user_record.preferred_language][
                            "reply_group_message"
                        ],
                    },
                    template_id=REPLY_GROUPCHAT_TEMPLATE,
                )
                if not res:
                    msg = "Failed to send reply group message alert email " + res_msg
                    logger.info(msg)

    except Exception as e:
        logger.info(e)
        return create_response(status=422, message="failed")

    return create_response(status=200, message="Success")


@notifications.route("/unread_alert/<id>", methods=["GET"])
# @all_users
def send_unread_alert(id):
    try:
        notifications_count = DirectMessage.objects(
            Q(recipient_id=id) & Q(message_read=False)
        ).count()
        email = None
        phone_number = None
        if notifications_count > 0:
            user_record = MenteeProfile.objects(Q(id=id)).first()
            if user_record is not None:
                email = user_record.email
                if "phone_number" in user_record:
                    phone_number = user_record.phone_number
            else:
                user_record = MentorProfile.objects(Q(id=id)).first()
                if user_record is not None:
                    email = user_record.email
                    if "phone_number" in user_record:
                        phone_number = user_record.phone_number
                else:
                    user_record = PartnerProfile.objects(Q(id=id)).first()
                    if user_record is not None:
                        email = user_record.email
                        if "phone_number" in user_record:
                            phone_number = user_record.phone_number
            if user_record is not None:
                if email is not None:
                    res, res_msg = send_email(
                        recipient=email,
                        data={
                            "number_unread": str(notifications_count),
                            user_record.preferred_language: True,
                            "subject": TRANSLATIONS[user_record.preferred_language][
                                "unread_message"
                            ],
                        },
                        template_id=UNREAD_MESSAGE_TEMPLATE,
                    )
                    if not res:
                        msg = "Failed to send unread message alert email " + res_msg
                        logger.info(msg)

                if phone_number is not None:
                    res, res_msg = send_sms(
                        text="You have received a new message on your Mentee Portal!\nYou have "
                        + str(notifications_count)
                        + " messages on your Mentee! messages inbox",
                        recipient=phone_number,
                    )
                    if not res:
                        msg = "Failed to send unread message alert email " + res_msg
                        logger.info(msg)

    except Exception as e:
        msg = "No mentee with that id"
        logger.info(e)
        return create_response(status=422, message=msg)

    return create_response(status=200, message="Success")


@notifications.route("/update", methods=["PUT"])
@all_users
def update_unread_count():
    data = request.get_json()
    if not data:
        return create_response(status=422, message="Missing data from PUT request")

    recipient = data.get("recipient", None)
    sender = data.get("sender", None)
    if not recipient or not sender:
        return create_response(status=422, message="Missing IDs for recipient/sender")

    try:
        messages = DirectMessage.objects(
            Q(recipient_id=recipient) & Q(message_read=False) & Q(sender_id=sender)
        )
    except Exception as e:
        msg = "Mongoengine: failed to fetch message objects"
        logger.info(e)
        return create_response(status=422, message=msg)
    messages.update(set__message_read=True)
    return create_response(status=200, message="Success")


@notifications.route("/weeklyemails", methods=["GET"])
# @all_users -- Commented as it was failing to send emails due to JWT token issues
def send_weekly_emails():
    try:
        mentee_users = MenteeProfile.objects()
        mentor_users = MentorProfile.objects()
    except Exception as e:
        msg = "error"
        logger.info(e)
        return create_response(status=422, message=msg)
    for user in mentee_users:
        try:
            notifications_count = DirectMessage.objects(
                Q(recipient_id=user.id) & Q(message_read=False)
            ).count()
        except Exception as e:
            msg = "No mentee with that id"
            logger.info(e)
            return create_response(status=422, message=msg)
        if notifications_count > 0:
            res, res_msg = send_email(
                recipient=user.email,
                data={
                    "number_unread": str(notifications_count),
                    user.preferred_language: True,
                    "subject": TRANSLATIONS[user.preferred_language]["weekly_notif"],
                },
                template_id=WEEKLY_NOTIF_REMINDER,
            )
            if not res:
                msg = "Failed to send mentee email " + res_msg
                logger.info(msg)

    for user in mentor_users:
        try:
            notifications_count = DirectMessage.objects(
                Q(recipient_id=user.id) & Q(message_read=False)
            ).count()
        except Exception as e:
            msg = "No mentor with that id"
            logger.info(e)
            return create_response(status=422, message=msg)
        if notifications_count > 0:
            res, res_msg = send_email(
                recipient=user.email,
                template_id=WEEKLY_NOTIF_REMINDER,
                data={
                    "number_unread": str(notifications_count),
                    user.preferred_language: True,
                    "subject": TRANSLATIONS[user.preferred_language]["weekly_notif"],
                },
            )
            if not res:
                msg = "Failed to send mentee email " + res_msg
                logger.info(msg)
    return create_response(message="Successfully sent weekly notification emails")
