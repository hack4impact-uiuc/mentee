from api.core import create_response, logger
from api.models import MentorProfile, Users, MenteeProfile
from flask import Blueprint, request
from api.utils.require_auth import admin_only
from firebase_admin import auth as firebase_admin_auth
from api.utils.constants import Account

mentee = Blueprint("mentee", __name__)


@mentee.route("/editFavMentor", methods=["PUT"])
def edit_fav_mentor():
    try:
        data = request.get_json()
        logger.info(data)
        mentor_id = data["mentor_id"]
        mentee_id = data["mentee_id"]
        favorite = bool(data["favorite"])
    except:
        msg = "invalid parameters provided"
        logger.info(msg)
        return create_response(status=422, message=msg)
    print()
    try:
        mentee = MenteeProfile.objects.get(id=mentee_id)
        if not favorite and mentor_id in mentee.favorite_mentors_ids:
            mentee.favorite_mentors_ids.remove(mentor_id)
            msg = (
                f"Deleted mentor: {mentor_id} from mentee: {mentee.name} favorite list"
            )
        elif favorite and mentor_id not in mentee.favorite_mentors_ids:
            mentee.favorite_mentors_ids.append(mentor_id)
            msg = f"Added mentor: {mentor_id} to mentee: {mentee.name} favorite list"
        else:
            msg = "Request already processed"
        mentee.save()
    except:
        msg = "Failed to saved mentor as favorite"
        logger.info(msg)
        return create_response(status=422, message=msg)
    return create_response(status=200, message=msg)


@mentee.route("/favorites/<id>", methods=["GET"])
def get_favorites(id):
    try:
        mentee = MenteeProfile.objects.get(id=id)
    except:
        msg = f"Failed to fetch mentee by id: {id}"
        return create_response(status=422, message=msg)

    favorites = mentee.favorite_mentors_ids
    mentor_list = list()
    for mentor_id in favorites:
        try:
            mentor = MentorProfile.objects.only(
                "name", "professional_title", "id", "image"
            ).get(id=mentor_id)
        except:
            msg = f"failed to fetch mentor by id: {mentor_id}"
            continue
        mentor_list.append(mentor)

    return create_response(
        status=200, data={"favorites": mentor_list}, message="success"
    )
