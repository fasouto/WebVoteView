# -*- coding: utf-8 -*-
"""
Convert mongo dates in strings to date objects
"""
import sys
from datetime import datetime
from pymongo import MongoClient

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    args = "MongoDB host and port"
    help = "Fix the date representation in current mongodb database"

    def __init__(self):
        super(Command, self).__init__()

    def convert_to_date(self, db):
        """
        Store the formatted date in a field called 'datef'
        """
        print "Starting conversion"
        rollcalls =  db.voteview_rollcalls
        for rollcall in rollcalls.find():
            if rollcall['date'] and type(rollcall['date']) is not datetime:
                datef = datetime.strptime(rollcall['date'], '%Y-%m-%d')
                rollcalls.update({'_id':rollcall['_id']},{'$set':{'datef' : datef}})

    def handle(self, *args, **options):
        client = MongoClient('localhost', 27017)
        db = client.voteview
        self.convert_to_date(db)
