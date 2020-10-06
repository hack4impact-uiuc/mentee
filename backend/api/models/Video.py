from api.core import Mixin
from .base import db
from mongoengine import *


class Video(EmbeddedDocument, Mixin):
    """Video Collection"""

    # def __init__(self, title, url, tag):
    #     self.title = title
    #     self.url = url
    #     self.tag = tag

    title = StringField(required=True)
    url = StringField(required=True)
    tag = StringField(required=True)

    def __repr__(self):
        return f"<Video title: {self.title}, URL: {self.url}, tag: {self.tag}>"
