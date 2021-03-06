from bson import ObjectId
from api.models import db, Education, Video, MentorProfile, MenteeProfile, Image
from api.utils.request_utils import imgur_client
from api.utils.constants import Account


def new_profile(data: dict = {}, profile_type: int = -1):
    """Parses data given by POST request

    Args:
        data (dict): POST Data. Defaults to {}.
        profile_type (int): Type of account parsing. Defaults to -1

    Returns:
        MongoDB Model: Depending on type it returns the respective model object
    """
    if not data or profile_type == -1:
        return None

    new_profile = None

    if profile_type == Account.MENTOR:
        new_profile = MentorProfile(
            firebase_uid=data["firebase_uid"],
            name=data["name"],
            email=data["email"],
            professional_title=data["professional_title"],
            specializations=data["specializations"],
            offers_in_person=data["offers_in_person"],
            offers_group_appointments=data["offers_group_appointments"],
            email_notifications=data.get("email_notifications", True),
            text_notifications=data.get("text_notifications", False),
        )

        new_profile.website = data.get("website")
        new_profile.linkedin = data.get("linkedin")

        if "videos" in data:
            video_data = data.get("videos")
            new_profile.videos = [
                Video(
                    title=video["title"],
                    url=video["url"],
                    tag=video["tag"],
                    date_uploaded=video["date_uploaded"],
                )
                for video in video_data
            ]
    elif profile_type == Account.MENTEE:
        new_profile = MenteeProfile(
            name=data["name"],
            # TODO: Change this to the actual email and remove default
            email=data.get("email", "email@gmail.com"),
            email_notifications=data.get("email_notifications", True),
            text_notifications=data.get("text_notifications", False),
            organization=data["organization"],
            age=data["age"],
            gender=data["gender"],
            is_private=data.get("is_private", True),
        )

        if "video" in data:
            video_data = data.get("video")
            new_profile.video = Video(
                title=video_data["title"],
                url=video_data["url"],
                tag=video_data["tag"],
                date_uploaded=video_data["date_uploaded"],
            )
    else:
        # There is not match with mentee/mentor
        return None

    new_profile.languages = data["languages"]
    new_profile.biography = data.get("biography")
    new_profile.phone_number = data.get("phone_number")
    new_profile.location = data.get("location")

    if "education" in data:
        education_data = data.get("education")
        new_profile.education = [
            Education(
                education_level=education.get("education_level"),
                majors=education.get("majors"),
                school=education.get("school"),
                graduation_year=education.get("graduation_year"),
            )
            for education in education_data
        ]

    return new_profile


def edit_profile(data: dict = {}, profile: object = None):
    """PUT Request Parsing

    Args:
        data (dict, optional): PUT Request data. Defaults to {}.
        profile (MongoDB Model, optional): Edits the model in place. Defaults to None.

    Returns:
        Boolean: True if successful otherwise false
    """
    if not data or not profile:
        return False

    if isinstance(profile, MentorProfile):
        # Edit fields or keep original data if no added data
        profile.professional_title = data.get(
            "professional_title", profile.professional_title
        )
        profile.specializations = data.get("specializations", profile.specializations)
        profile.offers_group_appointments = data.get(
            "offers_group_appointments", profile.offers_group_appointments
        )
        profile.offers_in_person = data.get(
            "offers_in_person", profile.offers_in_person
        )
        profile.linkedin = data.get("linkedin", profile.linkedin)
        profile.website = data.get("website", profile.website)

        # Create video objects for each item in list
        if "videos" in data:
            video_data = data.get("videos")
            profile.videos = [
                Video(
                    title=video.get("title"),
                    url=video.get("url"),
                    tag=video.get("tag"),
                    date_uploaded=video.get("date_uploaded"),
                )
                for video in video_data
            ]
    elif isinstance(profile, MenteeProfile):
        profile.age = data.get("age", profile.age)
        profile.gender = data.get("gender", profile.gender)
        profile.organization = data.get("organization", profile.organization)
        profile.is_private = data.get("is_private", profile.is_private)

        if "video" in data:
            video_data = data.get("video")
            profile.video = Video(
                title=video.get("title"),
                url=video.get("url"),
                tag=video.get("tag"),
                date_uploaded=video.get("date_uploaded"),
            )

    profile.name = data.get("name", profile.name)
    profile.location = data.get("location", profile.location)
    profile.email = data.get("email", profile.email)
    profile.phone_number = data.get("phone_number", profile.phone_number)
    profile.languages = data.get("languages", profile.languages)
    profile.biography = data.get("biography", profile.biography)
    profile.text_notifications = data.get(
        "text_notifications", profile.text_notifications
    )
    profile.email_notifications = data.get(
        "email_notifications", profile.email_notifications
    )

    # Create education object
    if "education" in data:
        education_data = data.get("education")
        profile.education = [
            Education(
                education_level=education.get("education_level"),
                majors=education.get("majors"),
                school=education.get("school"),
                graduation_year=education.get("graduation_year"),
            )
            for education in education_data
        ]

    return True
