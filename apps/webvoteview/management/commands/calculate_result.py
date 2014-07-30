# -*- coding: utf-8 -*-
"""
Cache the result of the rollcalls
"""
import sys
from pymongo import MongoClient

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    args = "MongoDB host and port"
    help = "Calculate rollcall result, Yea, Nay or Abs"

    def __init__(self):
        super(Command, self).__init__()

    def calculate_result(self, db):
        """
        Simply calculate the predominant result in the rollcalls and store it in the document
        1,2,3 -> Yea
        4,5,6 -> Nay
        7,8,9 -> Abs
        """
        print "Starting calculation"
        rollcalls =  db.voteview_rollcalls
        for rollcall in rollcalls.find():
            votes = {}
            votes['yea'] = sum([rollcall['result']['1'], rollcall['result']['2'], rollcall['result']['3']])
            votes['nay'] = sum([rollcall['result']['4'], rollcall['result']['5'], rollcall['result']['6']])
            votes['abs'] = sum([rollcall['result']['7'], rollcall['result']['8'], rollcall['result']['9']])
            rollcall['finalresult'] = max(votes, key=votes.get)
            rollcalls.update({'_id':rollcall['_id']}, rollcall)

    def handle(self, *args, **options):
        client = MongoClient('localhost', 27017)
        db = client.voteview
        self.calculate_result(db)
