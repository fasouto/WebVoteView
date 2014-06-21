from django.db import models

from jsonfield import JSONField


class State(models.Model):
    """
    US States
    """
    state_id = models.IntegerField()
    name = models.CharField(max_length=100)
    abbrv = models.CharField(max_length=5)

    def __unicode__(self):
        return self.name


class Party(models.Model):
    """
    US political parties
    """
    party_id = models.IntegerField()
    name = models.CharField(max_length=100)
    abbrv = models.CharField(max_length=5)    

    def __unicode__(self):
        return self.name


class RollCall(models.Model):
    """
    Represent an US Roll RollCall
    """
    CHAMBERS = (
        (0, 'Congress'),
        (1, 'Senate'))

    rollcall_id = models.CharField(max_length=50)
    roll_number = models.IntegerField()
    session = models.IntegerField()
    code_clausen = models.CharField(max_length=500)
    code_peltzman = models.CharField(max_length=500)
    code_issue = models.CharField(max_length=500)
    description = models.TextField(null=True)
    sponsor = models.CharField(max_length=500)
    date = models.DateField(blank=True, null=True)
    bill = models.CharField(max_length=50)
    question = models.CharField(max_length=100)
    chamber = models.IntegerField(max_length=1, choices=CHAMBERS)

    jsondata = JSONField()

    def __unicode__(self):
        return self.rollcall_id


class Member(models.Model):
    """
    Represents a member of the congress or senate
    FIXIT a member could be part of several parties, states and districts
    """
    member_id = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=100)
    state = models.ForeignKey(State)
    party = models.ForeignKey(Party)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    icpsr = models.IntegerField()
    districtcode = models.IntegerField()
    occupancy = models.CharField(blank=True, null=True, max_length=200) # it's null all the time
    session = models.IntegerField()
    cqlabel = models.CharField(max_length=100)

    # nominate fields
    nominate_geoMeanProbability = models.FloatField()
    nominate_oneDimNominate = models.FloatField()
    nominate_numberOfVotes = models.FloatField()
    nominate_twoDimNominateBSE = models.FloatField()
    nominate_oneDimNominateBSE = models.FloatField()
    nominate_twoDimNominate = models.FloatField()
    nominate_dimensionCorrelation = models.FloatField()
    nominate_logLikelihood = models.FloatField()
    nominate_numberOfErrors = models.FloatField()

    jsondata = JSONField()

    def __unicode__(self):
        return self.full_name


class Votes(models.Model):
    """
    Member votes for rollcalls
    """
    VOTE_CHOICES = (
        (1, "Yea"),
        (2, "Yea"),
        (3, "Yea"),
        (4, "Nay"),
        (5, "Nay"),
        (6, "Nay"),
        (7, "Abs"),
        (8, "Abs"),
        (9, "Abs"),
    )

    member = models.ForeignKey(Member)
    rollcall = models.ForeignKey(RollCall)
    vote = models.IntegerField(choices=VOTE_CHOICES)

    def __unicode__(self):
        return "%s - %s" %(self.member.full_name, self.rollcall.rollcall_id)
