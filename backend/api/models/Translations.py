from api.core import Mixin
from .base import db
from mongoengine import *


class Translations(EmbeddedDocument, Mixin):
    """Model for Translated Languages"""

    es_US = FileField(db_field="es-US")
    pt_BR = FileField(db_field="pt-BR")
    ar = FileField(db_field="ar")
    fa_AF = FileField(db_field="fa-AF")
