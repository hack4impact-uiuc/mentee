import os, requests
from dotenv import load_dotenv

load_dotenv()

def test_mentee_messages():

    mentee_jwt_token = os.environ.get("MENTEE_JWT_TOKEN")

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Authorization": mentee_jwt_token,
    }

    BASE_URL = os.environ.get("BASE_URL")

    mentor_profile_id = os.environ.get("TEST_MENTOR_PROFILE_ID")
    mentee_profile_id = os.environ.get("TEST_MENTEE_PROFILE_ID")

    params = {
        "recipient_id": mentee_profile_id,
        "sender_id": mentor_profile_id,
    }

    response = requests.get(
        f"{BASE_URL}/api/messages/direct/", params=params, headers=headers
    )

    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Success"

    assert "Messages" in response.json()["result"]

    for message in response.json()["result"]["Messages"]:
        assert "body" in message
        assert "message_read" in message

        assert (
            message["recipient_id"]["$oid"] == mentee_profile_id
            or message["recipient_id"]["$oid"] == mentor_profile_id
        )
        assert (
            message["sender_id"]["$oid"] == mentor_profile_id
            or message["sender_id"]["$oid"] == mentee_profile_id
        )


def test_mentor_messages():

    mentor_jwt_token = os.environ.get("MENTOR_JWT_TOKEN")

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Authorization": mentor_jwt_token,
    }

    BASE_URL = os.environ.get("BASE_URL")

    mentor_profile_id = os.environ.get("TEST_MENTOR_PROFILE_ID")
    mentee_profile_id = os.environ.get("TEST_MENTEE_PROFILE_ID")

    params = {
        "recipient_id": mentor_profile_id,
        "sender_id": mentee_profile_id,
    }

    response = requests.get(
        f"{BASE_URL}/api/messages/direct/", params=params, headers=headers
    )

    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Success"

    assert "Messages" in response.json()["result"]

    for message in response.json()["result"]["Messages"]:
        assert "body" in message
        assert "message_read" in message

        assert (
            message["recipient_id"]["$oid"] == mentor_profile_id
            or message["recipient_id"]["$oid"] == mentee_profile_id
        )
        assert (
            message["sender_id"]["$oid"] == mentee_profile_id
            or message["sender_id"]["$oid"] == mentor_profile_id
        )
