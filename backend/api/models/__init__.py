# this file structure follows http://flask.pocoo.org/docs/1.0/patterns/appfactories/
# initializing db in api.models.base instead of in api.__init__.py
# to prevent circular dependencies
from .base import db
from .Users import Users
from .Education import Education
from .Video import Video
from .Availability import Availability
from .Image import Image
from .Translations import Translations
from .MentorProfile import MentorProfile
from .MenteeApplication import MenteeApplication
from .PartnerApplication import PartnerApplication
from .AppointmentRequest import AppointmentRequest
from .NewMentorApplication import NewMentorApplication
from .VerifiedEmail import VerifiedEmail
from .MenteeProfile import MenteeProfile
from .Message import Message
from .DirectMessage import DirectMessage
from .GroupMessage import GroupMessage
from .PartnerGroupMessage import PartnerGroupMessage
from .Admin import Admin
from .Training import Training
from .Event import Event
from .Hub import Hub
from .PartnerProfile import PartnerProfile
from .MentorApplication import MentorApplication
from .Notifications import Notifications
from .Languages import Languages
from .Countries import Countries
from .Specializations import Specializations
from .Guest import Guest
from .Support import Support
from .Moderator import Moderator
from .SignOrigin import SignOrigin
from .SignedDocs import SignedDocs
from .Announcement import Announcement
from .CommunityLibrary import CommunityLibrary

__all__ = [
    "db",
    "Users",
    "Education",
    "Video",
    "MentorProfile",
    "Availability",
    "AppointmentRequest",
    "Translations",
    "Image",
    "VerifiedEmail",
    "NewMentorApplication",
    "MenteeProfile",
    "Message",
    "DirectMessage",
    "Admin",
    "MenteeApplication",
    "PartnerApplication",
    "Training",
    "Event",
    "Hub",
    "PartnerProfile",
    "MentorApplication",
    "Notifications",
    "Languages",
    "Countries",
    "Specializations",
    "Guest",
    "Support",
    "Moderator",
    "SignOrigin",
    "SignedDocs",
    "GroupMessage",
    "PartnerGroupMessage",
    "Announcement",
    "CommunityLibrary",
]

# You must import all of the new Models you create to this page
