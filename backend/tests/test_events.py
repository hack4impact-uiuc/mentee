from api.models import Event
import requests
import os
from dotenv import load_dotenv
from .utils.login_utils import *

load_dotenv()

def test_mentor_events():

    BASE_URL = os.environ.get("BASE_URL")

    jwt_token = os.environ["MENTOR_JWT_TOKEN"]

    mentor_role = int(os.environ.get("TEST_MENTOR_ROLE"))

    url = f"{BASE_URL}/api/events/{mentor_role}"
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": jwt_token,
    }
    response = requests.get(url, headers=headers)

    response_events = response.json()["result"]["events"]
    response_events_count = len(response_events)

    for response_event in response_events:
        assert mentor_role in response_event["role"]

    object_events = Event.objects.filter(role=mentor_role).count()

    assert (
        object_events == response_events_count
    ), "Mentor events retrieved from the api do not match the events retrieved from the database."


def test_mentee_events():

    BASE_URL = os.environ.get("BASE_URL")

    jwt_token = os.environ["MENTEE_JWT_TOKEN"]

    mentee_role = int(os.environ.get("TEST_MENTEE_ROLE"))

    url = f"{BASE_URL}/api/events/{mentee_role}"
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": jwt_token,
    }
    response = requests.get(url, headers=headers)

    response_events = response.json()["result"]["events"]
    response_events_count = len(response_events)

    for response_event in response_events:
        assert mentee_role in response_event["role"]

    object_events = Event.objects.filter(role=mentee_role).count()

    assert (
        object_events == response_events_count
    ), "Mentee events retrieved from the api do not match the events retrieved from the database."


def test_create_event_mentor():

    profile_id = os.environ.get("TEST_MENTOR_PROFILE_ID")
    jwt_token = os.environ["MENTOR_JWT_TOKEN"]

    create_event(profile_id, jwt_token)
    object_events = Event.objects.filter(role=1)

    event_exists = any(event.title == "Test Title" for event in object_events)
    assert event_exists, "Mentor failed to create event"


def test_create_event_mentee():

    profile_id = os.environ.get("TEST_MENTEE_PROFILE_ID")
    jwt_token = os.environ["MENTEE_JWT_TOKEN"]

    create_event(profile_id, jwt_token)
    object_events = Event.objects.filter(role=2)

    event_exists = any(event.title == "Test Title" for event in object_events)
    assert event_exists, "Mentee failed to create event"


def create_event(profile_id, jwt_token):
    BASE_URL = os.environ.get("BASE_URL")

    event_title = "Test Title"
    event_description = "Test"
    event_url = "https://www.google.com"

    json_data = {
        "event_id": 0,
        "user_id": profile_id,
        "title": event_title,
        "role": [
            2,
            1,
        ],
        "start_datetime": "2023-12-05T21:00:00.000Z",
        "start_datetime_str": "2023-12-06 02:00",
        "end_datetime": "2023-12-07T01:00:00.000Z",
        "end_datetime_str": "2023-12-07 06:00",
        "description": event_description,
        "url": event_url,
    }

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Authorization": jwt_token,
    }

    response = requests.post(
        f"{BASE_URL}/api/event_register", headers=headers, json=json_data
    )

    assert response.status_code == 200, "Error creating event"


def test_mentor_delete_events():

    BASE_URL = os.environ.get("BASE_URL")

    profile_id = os.environ.get("TEST_MENTOR_PROFILE_ID")
    jwt_token = os.environ["MENTOR_JWT_TOKEN"]

    user_events = get_events(profile_id, jwt_token, BASE_URL)

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Authorization": jwt_token,
    }

    for event in user_events:
        response = requests.delete(
            f"{BASE_URL}/api/events/delete/{event}", headers=headers
        )
        assert response.status_code == 200, "Unable to delete the created events."


def test_mentee_delete_events():

    BASE_URL = os.environ.get("BASE_URL")

    profile_id = os.environ.get("TEST_MENTEE_PROFILE_ID")
    jwt_token = os.environ["MENTEE_JWT_TOKEN"]

    user_events = get_events(profile_id, jwt_token, BASE_URL)

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Authorization": jwt_token,
    }

    for event in user_events:
        response = requests.delete(
            f"{BASE_URL}/api/events/delete/{event}", headers=headers
        )
        assert response.status_code == 200, "Unable to delete the created events."


def get_events(profile_id, jwt_token, BASE_URL):
    url = f"{BASE_URL}/api/events/1"
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": jwt_token,
    }
    response = requests.get(url, headers=headers)

    events = response.json()["result"]["events"]
    user_events = []

    for event in events:
        if event["user_id"]["$oid"] == profile_id:
            user_events.append(event["_id"]["$oid"])

    return user_events
