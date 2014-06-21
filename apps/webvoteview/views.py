from pymongo import MongoClient
import json

from django.template import loader, Context
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.shortcuts import render
from django.utils import simplejson

from utils import render_block_to_string


def search(request):
    return render(request, 'search.html')

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
    rollcalls = vw_db.voteview_rollcalls.find(query)
    rollcalls_page = list(rollcalls[:15])
    # Build the template
    context = Context({'rollcalls': rollcalls_page, 'request':request})
    return_str = render_block_to_string('search_list.html', 'results', context)
    return HttpResponse(return_str)


###################################################
## FROM NOW ON IM EMULATING EXISTING APIS, MUST REFACTOR LATER
from bson.json_util import dumps
from mongoengine import connect

def get_vote(request, rollcall_id):
    client = MongoClient('localhost', 27017)
    vw_db = client.voteview
    rollcalls_col = vw_db.voteview_rollcalls
    rollcall = rollcalls_col.find_one({'id': rollcall_id})
    print rollcall
    return (
        HttpResponse(
            dumps(rollcall),
            content_type='application/json; charset=utf8')
    )

def get_members(request, session_id):
    client = MongoClient('localhost', 27017)
    vw_db = client.voteview
    members_col = vw_db.voteview_members
    members = members_col.find({'session': int(session_id)})
    print members
    return (
        HttpResponse(
            dumps(members),
            content_type='application/json; charset=utf8')
    )
