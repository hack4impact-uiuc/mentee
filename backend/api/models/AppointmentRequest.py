from api.core import Mixin
from .base import db
from mongoengine import *
from flask_mongoengine import Document
from api.models import Availability


class AppointmentRequest(Document, Mixin):
    """Appointment Request Collection."""

    mentor_id = ObjectIdField(required=True)
    timeslot = EmbeddedDocumentField(Availability, required=True)
    accepted = BooleanField(required=True)
    name = StringField(required=True)
    email = StringField(required=True)
    phone_number = StringField()
    languages = ListField(StringField(), required=True)
    age = StringField(required=True)
    gender = StringField(required=True)
    location = StringField()
    specialist_categories = ListField(StringField(), required=True)
    message = StringField()
    organization = StringField(required=True)
    allow_texts = BooleanField(required=True)
    allow_calls = BooleanField(required=True)

    def __repr__(self):
        return f"""<AppointmentRequest mentor_id: {self.mentor_id}
                \n timeslot: {self.timeslot}
                \n accepted: {self.accepted}
                \n name: {self.name}
                \n email: {self.email}
                \n phone_number: {self.phone_number}
                \n languages: {self.languages} 
                \n age: {self.age}
                \n gender: {self.gender}
                \n location: {self.location}
                \n specialist_categories: {self.specialist_categories}
                \n message: {self.message}
                \n organization: {self.organization}
                \n allows_texts: {self.allow_texts}
                \n allows_calls: {self.allow_calls}>"""
