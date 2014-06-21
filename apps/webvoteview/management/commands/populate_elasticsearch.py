# -*- coding: utf-8 -*-
"""
Migrate data from the original MongoDB database
"""
import sys
from pyes import *
from django.core.management.base import BaseCommand, CommandError

from models import Member, RollCall, Party, State


class Command(BaseCommand):
    args = "MongoDB host and port"
    help = "Import data from a MongoDB database"

    def __init__(self):
        super(Command, self).__init__()
        conn = ES('127.0.0.1:9200')

    def import_members(self, db):
        """
        Import Senate/congress members
        """
        print "Importing members"
        members =  db.voteview_members
        for member in members.find():
            state = State.objects.get_or_create(state_id=member.state, abbrv=member.stateAbbr, name=member.stateName)
            party = Party.objects.get_or_create(party_id=member.party, name=member.partyname)
            member = Member.objects.get_or_create(
                member_id=
                name=
                full_name=member.fname,
                state=state,
                party=party
                )

    def import_rollcalls(self, db):
        pass


    def handle(self, *args, **options):
        client = MongoClient('localhost', 27017)
        db = client.voteview
        self.import_members(db)
