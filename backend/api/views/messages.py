from os import path
from flask import Blueprint, request, jsonify
from api.models import MentorProfile, MenteeProfile, Users, Message, DirectMessage
from api.utils.request_utils import MessageForm, is_invalid_form, send_email
from api.utils.constants import MENTOR_CONTACT_ME
from api.core import create_response, serialize_list, logger
from api.models import db
import json
from datetime import datetime
from api import socketio
from mongoengine.queryset.visitor import Q
from flask_socketio import join_room, leave_room


messages = Blueprint("messages", __name__)


@messages.route("/", methods=["GET"])
def get_messages():
    try:
        messages = Message.objects.filter(**request.args)
    except:
        msg = "Invalid parameters provided"
        logger.info(msg)
        return create_response(status=422, message=msg)
    msg = "Success"
    if not messages:
        msg = "Messages could not be found with parameters provided"
    return create_response(data={"Messages": messages}, status=200, message=msg)


@messages.route("/<string:message_id>", methods=["DELETE"])
def delete_message(message_id):
    try:
        message = Message.objects.get(id=message_id)
    except:
        msg = "Invalid message id"
        logger.info(msg)
        return create_response(status=422, message=msg)
    try:
        message.delete()
        return create_response(
            status=200, message=f"message_id: {message_id} deleted successfully"
        )
    except:
        msg = "Failed to delete message"
        logger.info(msg)
        return create_response(status=422, message=msg)


@messages.route("/<string:message_id>", methods=["PUT"])
def update_message(message_id):
    try:
        message = Message.objects.get(id=message_id)
    except:
        msg = "Invalid message id"
        logger.info(msg)
        return create_response(status=422, message=msg)
    try:
        body = request.get_json()
        for field in body:
            message[field] = body[field]
        message.save()
        return create_response(
            status=200,
            message=f"message_id: {message_id} field: {field} updated with: {body[field]}",
        )
    except:
        msg = "Failed to update message"
        logger.info(msg)
        return create_response(status=422, message=msg)


@messages.route("/", methods=["POST"])
def create_message():
    data = request.get_json()

    try:
        message = DirectMessage(
            body=data["message"],
            message_read=False,
            sender_id=data["user_id"],
            recipient_id=data["recipient_id"],
            created_at=data.get("time"),
        )
    except Exception as e:
        msg = "Invalid parameter provided"
        logger.info(e)
        return create_response(status=422, message=msg)
    try:
        message.save()
    except:
        msg = "Failed to save message"
        logger.info(msg)
        return create_response(status=422, message=msg)

    socketio.emit(data["recipient_id"], json.loads(message.to_json()))
    return create_response(
        status=201,
        message=f"Successfully saved message",
    )


@messages.route("/mentor/<string:mentor_id>", methods=["POST"])
def contact_mentor(mentor_id):
    data = request.get_json()
    if "mentee_id" not in data:
        return create_response(status=422, message="missing mentee_id")

    mentee_id = data["mentee_id"]
    try:
        mentor = MentorProfile.objects.get(id=mentor_id)
        mentee = MenteeProfile.objects.get(id=mentee_id)
    except:
        msg = "Could not find mentor or mentee for given ids"
        return create_response(status=422, message=msg)

    res, res_msg = send_email(
        mentor.email,
        data={
            "response_email": mentee.email,
            "interest_areas": data.get("interest_areas", ""),
            "communication_method": data.get("communication_method", ""),
            "message": data.get("message", ""),
            "name": mentee.name,
        },
        template_id=MENTOR_CONTACT_ME,
    )
    if not res:
        msg = "Failed to send mentee email " + res_msg
        logger.info(msg)
        return create_response(status=500, message="Failed to send message")

    try:
        message = DirectMessage(
            body=data.get("message", "Hello"),
            message_read=False,
            sender_id=mentee_id,
            recipient_id=mentor_id,
            created_at=datetime.today().isoformat(),
        )

        socketio.emit(mentor_id, json.loads(message.to_json()))
    except Exception as e:
        msg = "Invalid parameter provided"
        logger.info(e)
        return create_response(status=422, message=msg)
    try:
        message.save()
    except:
        msg = "Failed to save message"
        logger.info(msg)
        return create_response(status=422, message=msg)

    return create_response(status=200, message="successfully sent email message")


@messages.route("/contacts/<string:user_id>", methods=["GET"])
def get_sidebar(user_id):
    try:
        print(user_id)
        sentMessages = DirectMessage.objects.filter(
            Q(sender_id=user_id) | Q(recipient_id=user_id)
        ).order_by("-created_at")

        contacts = []
        sidebarContacts = set()
        for message in sentMessages:
            otherId = message["recipient_id"]
            # print(otherId + " " + user_id)

            if str(otherId) == user_id:
                otherId = message["sender_id"]
            # if otherId == user_id:
            #     continue

            if otherId not in sidebarContacts:
                otherUser = None
                try:
                    otherUser = MentorProfile.objects.get(id=otherId)
                except:
                    pass
                if not otherUser:
                    try:
                        otherUser = MenteeProfile.objects.get(id=otherId)
                    except:
                        msg = "Could not find mentor or mentee for given ids"
                        return create_response(status=422, message=msg)

                otherUser = json.loads(otherUser.to_json())
                otherUserObj = {
                    "name": otherUser["name"],
                }

                if "image" in otherUser:
                    otherUserObj["image"] = otherUser["image"]["url"]

                sidebarObject = {
                    "otherId": str(otherId),
                    "otherUser": otherUserObj,
                    "latestMessage": json.loads(message.to_json()),
                }

                contacts.append(sidebarObject)
                sidebarContacts.add(otherId)

        return create_response(data={"data": contacts}, status=200, message="res")
    except Exception as e:
        logger.info(e)
        return create_response(status=422, message=str(e))


@messages.route("/direct/", methods=["GET"])
def get_direct_messages():
    try:
        messages = DirectMessage.objects(
            Q(sender_id=request.args.get("sender_id"))
            & Q(recipient_id=request.args.get("recipient_id"))
            | Q(sender_id=request.args.get("recipient_id"))
            & Q(recipient_id=request.args.get("sender_id"))
        )
    except:
        msg = "Invalid parameters provided"
        logger.info(msg)
        return create_response(status=422, message=msg)
    msg = "Success"
    if not messages:
        msg = request.args
    return create_response(data={"Messages": messages}, status=200, message=msg)


@socketio.on("send")
def chat(msg, methods=["POST"]):
    # print("here")
    try:
        message = DirectMessage(
            body=msg["body"],
            message_read=msg["message_read"],
            sender_id=msg["sender_id"],
            recipient_id=msg["recipient_id"],
            created_at=msg["time"],
        )
        # msg['created_at'] = time
        logger.info(msg["recipient_id"])
        socketio.emit(msg["recipient_id"], json.loads(message.to_json()))

    except Exception as e:
        # msg="Invalid parameter provided"
        logger.info(e)
        return create_response(status=500, message="Failed to send message")
    try:
        message.save()
        msg = "successfully sent message"
    except:
        msg = "Error in meessage"
        logger.info(msg)
        return create_response(status=500, message="Failed to send message")
    return create_response(status=200, message="successfully sent message")
