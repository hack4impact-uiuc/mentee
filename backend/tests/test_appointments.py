import requests
import os
from dotenv import load_dotenv
from api.models import AppointmentRequest
from .utils.login_utils import *
from datetime import datetime, timedelta, timezone

load_dotenv()


# test the appointments for a mentor
def test_mentor_appointments(client):
    login_response = login_mentor(client)
    first_token = login_response.get_json()["result"]["token"]
    role = login_response.get_json()["result"]["role"]

    profile_id = os.environ.get("TEST_MENTOR_PROFILE_ID")

    refresh_token = get_refresh_token(first_token)
    jwt_token = get_access_token(refresh_token)

    os.environ["MENTOR_JWT_TOKEN"] = jwt_token

    url = f"/api/appointment/{role}/{profile_id}"
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": jwt_token,
    }
    response = client.get(url, headers=headers)

    appointments = response.get_json()["result"]["requests"]

    for appointment in appointments:
        assert appointment["mentor_id"]["$oid"] == profile_id


def test_mentee_appointments(client):
    login_response = login_mentee(client)
    first_token = login_response.get_json()["result"]["token"]
    role = login_response.get_json()["result"]["role"]

    profile_id = os.environ.get("TEST_MENTEE_PROFILE_ID")

    refresh_token = get_refresh_token(first_token)
    jwt_token = get_access_token(refresh_token)

    os.environ["MENTEE_JWT_TOKEN"] = jwt_token

    url = f"/api/appointment/{role}/{profile_id}"
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": jwt_token,
    }
    response = client.get(url, headers=headers)

    appointments = response.get_json()["result"]["requests"]

    for appointment in appointments:
        assert appointment["mentee_id"]["$oid"] == profile_id


def test_create_appointment(client):
    mentor_jwt_token = os.environ.get("MENTOR_JWT_TOKEN")
    mentor_profile_id = os.environ.get("TEST_MENTOR_PROFILE_ID")
    mentee_profile_id = os.environ.get("TEST_MENTEE_PROFILE_ID")

    now = datetime.now()
    start_time = now + timedelta(hours=1)
    end_time = now + timedelta(hours=2)
    start_time_str = start_time.replace(microsecond=0, tzinfo=timezone.utc).isoformat()
    end_time_str = end_time.replace(microsecond=0, tzinfo=timezone.utc).isoformat()

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Authorization": mentor_jwt_token,
        "Content-Type": "application/json",
    }

    json_data = {
        "mentor_id": mentor_profile_id,
        "mentee_id": mentee_profile_id,
        "topic": "Conflict Studies",
        "message": "Test",
        "status": "accepted",
        "timeslot": {
            "start_time": start_time_str,
            "end_time": end_time_str,
        },
    }

    response = client.post("/api/appointment/", headers=headers, json=json_data)

    assert response.status_code == 200
    assert response.get_json()["success"] == True

    json_data = {
        "mentor_id": "y6trhgytrg4d",
        "mentee_id": "6yrhtgter4re",
        "topic": "Conflict Studies",
        "message": "Test",
        "status": "accepted",
        "timeslot": {
            "start_time": start_time_str,
            "end_time": end_time_str,
        },
    }

    response = client.post("/api/appointment/", headers=headers, json=json_data)

    assert response.status_code != 200
