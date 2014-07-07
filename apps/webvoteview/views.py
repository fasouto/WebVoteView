from pymongo import MongoClient
import json

from django.template import loader, Context
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.shortcuts import render
from django.utils import simplejson

from utils import render_block_to_string


def search(request):
    return render(request, 'search.html')


def show_rollcall(request, rollcall_id):
    client = MongoClient('localhost', 27017)
    vw_db = client.voteview
    rollcalls_col = vw_db.voteview_rollcalls
    rollcall = rollcalls_col.find_one({'id': rollcall_id})
    return render(request, 'dc_rollcall.html', {'rollcall': rollcall})


def ajax_faceted_search(request):
    """
    Return a paginated list of rollcalls that match the parameters
    """
    client = MongoClient('localhost', 27017)
    vw_db = client.voteview
    query = {}
    if request.POST.get('search-string', ''):
        query['description'] = {'$regex': request.POST['search-string'].upper()}
    if request.POST.get('chamber'):
        query['chamber'] = {'$in': request.POST.getlist('chamber')}
    if request.POST.get('clausen'):
        query['code.Clausen'] = {'$in': request.POST.getlist('clausen')}
    if request.POST.get('result'):
        query['finalresult'] = {'$in': request.POST.getlist('result')}
    rollcalls = vw_db.voteview_rollcalls.find(query)
    rollcalls_page = list(rollcalls[:15])
    # Build the template
    context = Context({'rollcalls': rollcalls_page, 'request':request})
    return_str = render_block_to_string('search_list.html', 'results', context)
    return HttpResponse(return_str)


def api_get_rollcalls(request):
    """
    Get all the rollcalls
    """
    client = MongoClient('localhost', 27017)
    vw_db = client.voteview
    rollcalls_col = vw_db.voteview_rollcalls
    import random
    result = []
    rollcalls = rollcalls_col.find({'chamber':'Senate'})[:2000]
    for rollcall in rollcalls:
        res = {}
        res['chamber'] = rollcall['chamber']
        try:
            res['clausen'] = rollcall['code']['Clausen'][0]
        except IndexError:
            res['clausen'] = 'None'
        res['result'] = random.choice(['Yea', 'Nay', 'Abs'])
        res['date'] = rollcall['date']
        res['session'] = rollcall['session']
        res['rcnum'] = rollcall['rollnumber']
        res['desc'] = rollcall['shortdescription']
        result.append(res)
    return (
        HttpResponse(
            dumps(result),
            content_type='application/json; charset=utf8')
    ) 


def get_yeanayabs(vote_id):
    if vote_id < 4:
        return "Yea"
    elif vote_id < 7:
        return "Nay"
    elif vote_id < 10:
        return "Abs"


def api_get_votes(request, rollcall_id):
    """
    Refactor
    Returns a list of all votes for a rollcall
    """
    session = rollcall_id[2:4]

    client = MongoClient('localhost', 27017)
    vw_db = client.voteview
    rollcalls_col = vw_db.voteview_rollcalls
    members_col = vw_db.voteview_members


    rollcall = rollcalls_col.find_one({'id': rollcall_id})
    result = []
    for vote in rollcall['votes']:
        temp = {}
        temp['vote'] = get_yeanayabs(rollcall['votes'][vote])
        member = members_col.find_one({'id': vote})
        temp['name'] = member['fname']
        temp['party'] = member['partyname']
        temp['state'] = member['stateAbbr']
        if member['nominate']['oneDimNominate']:
            temp['x'] = member['nominate']['oneDimNominate']
            temp['y'] = member['nominate']['twoDimNominate']
        if member['districtCode']:
            temp['district'] = "%s%02d" % (member['stateAbbr'], member['districtCode'])
        result.append(temp)

    res = {}
    res['votes'] = result
    res['nominate'] = rollcall['nominate']
    return (
        HttpResponse(
            dumps(res),
            content_type='application/json; charset=utf8')
    )

###################################################
## FROM NOW ON IM EMULATING EXISTING APIS, MUST REFACTOR LATER
from bson.json_util import dumps
from mongoengine import connect

def get_vote(request, rollcall_id):
    client = MongoClient('localhost', 27017)
    vw_db = client.voteview
    rollcalls_col = vw_db.voteview_rollcalls
    rollcall = rollcalls_col.find_one({'id': rollcall_id})
    return (
        HttpResponse(
            dumps(rollcall),
            content_type='application/json; charset=utf8')
    )
