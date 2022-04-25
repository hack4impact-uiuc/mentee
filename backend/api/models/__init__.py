# this file structure follows http://flask.pocoo.org/docs/1.0/patterns/appfactories/
# initializing db in api.models.base instead of in api.__init__.py
# to prevent circular dependencies
from .base import db
from .Users import Users
from .Education import Education
from .Video import Video
from .Availability import Availability
from .Image import Image
from .MentorProfile import MentorProfile
from .MenteeApplication import MenteeApplication
from .PartnerApplication import PartnerApplication
from .AppointmentRequest import AppointmentRequest
from .NewMentorApplication import NewMentorApplication
from .VerifiedEmail import VerifiedEmail
from .MenteeProfile import MenteeProfile
from .Message import Message
from .DirectMessage import DirectMessage
from .Admin import Admin
from .DirectMessage import DirectMessage
from .Training import Training
from .PartnerProfile import PartnerProfile
from .MentorApplication import MentorApplication

__all__ = [
    "db",
    "Users",
    "Education",
    "Video",
    "MentorProfile",
    "Availability",
    "AppointmentRequest",
    "Image",
    "VerifiedEmail",
    "NewMentorApplication",
    "MenteeProfile",
    "Message",
    "DirectMessage",
    "Admin",
    "DirectMessage",
    "MenteeApplication",
    "PartnerApplication",
    "Training",
    "PartnerProfile",
    "MentorApplication"
]

# You must import all of the new Models you create to this page
