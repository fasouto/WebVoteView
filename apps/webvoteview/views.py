import json
from datetime import datetime
import xlwt

from pymongo.connection import Connection
from django.template import loader, Context
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.shortcuts import render
from bson.json_util import dumps

from utils import render_block_to_string

db = Connection().voteview


def show_rollcall(request, rollcall_id):
    rollcalls_col = db.voteview_rollcalls
    rollcall = rollcalls_col.find_one({'id': rollcall_id})
    return render(request, 'dc_rollcall.html', {'rollcall': rollcall})


def download_excel(request):
    """
    Download an excel with the rollcall
    """
    rollcall_params = request.GET.getlist('rollcall')

    rollcalls = {}
    for i,rollcall in enumerate(rollcall_params):
        rollcalls["V" + str(i+1)] = rollcall

    # Create the excel workbook and sheets and define the basic styles
    book = xlwt.Workbook(encoding='utf8')
    sheet_vote = book.add_sheet('Vote Matrix')
    sheet_rollcall = book.add_sheet('Roll Call Descriptions')
    default_style = xlwt.Style.default_style
    datetime_style = xlwt.easyxf(num_format_str='dd/mm/yyyy hh:mm')
    date_style = xlwt.easyxf(num_format_str='dd/mm/yyyy')

    # Let's write the headers
    vote_matrix_cols = ['ICSPR', 'State', 'State Abbr','District', 'CQ label', 'Name', 'Full name', 'Party code', 'Party name']
    vote_matrix_cols.extend(rollcalls.keys())

    rollcall_desc_cols = ['Vote', 'Chamber', 'Congress', 'Date', 'Rollnumber', 'Description']
    for col, title in enumerate(vote_matrix_cols):
        sheet_vote.write(0, col, title, style=default_style)
    for col, title in enumerate(rollcall_desc_cols):
        sheet_rollcall.write(0, col, title, style=default_style)


    members_matrix = {}

    for rollcall_index, rollcall_id in enumerate(rollcalls, start=1):
        rollcall = db.voteview_rollcalls.find({'id': rollcalls[rollcall_id]})[0]

        # Write the rollcall descriptions sheet
        sheet_rollcall.write(rollcall_index, 0, rollcall_id, style=default_style)
        sheet_rollcall.write(rollcall_index, 1, rollcall['chamber'], style=default_style)
        sheet_rollcall.write(rollcall_index, 2, rollcall['session'], style=default_style)
        sheet_rollcall.write(rollcall_index, 3, rollcall['date'], style=default_style)
        sheet_rollcall.write(rollcall_index, 4, rollcall['rollnumber'], style=default_style)
        sheet_rollcall.write(rollcall_index, 5, rollcall['description'], style=default_style)

        # Populate the members matrix
        for member_id in rollcall['votes']:
            member = db.voteview_members.find_one({'id':member_id})
            if member['icpsr'] not in members_matrix.keys():
                members_matrix[member['icpsr']] = {}
            members_matrix[member['icpsr']]['ICSPR'] = member['icpsr']
            members_matrix[member['icpsr']]['State'] = member['state']
            members_matrix[member['icpsr']]['State Abbr'] = member['stateAbbr']
            members_matrix[member['icpsr']]['District'] = member['districtCode']
            members_matrix[member['icpsr']]['CQ label'] = member['cqlabel']
            members_matrix[member['icpsr']]['Name'] = member['name']
            members_matrix[member['icpsr']]['Full name'] = member['fname']
            members_matrix[member['icpsr']]['Party code'] = member['party']
            members_matrix[member['icpsr']]['Party name'] = member['partyname']
            members_matrix[member['icpsr']][rollcall_id] = rollcall['votes'][member_id]

    # Write the vote matrix sheet
    for row_index, member in enumerate(members_matrix, start=1):
        # print members_matrix[member]
        sheet_vote.write(row_index, 0, members_matrix[member]['ICSPR'], style=default_style)
        sheet_vote.write(row_index, 1, members_matrix[member]['State'], style=default_style)
        sheet_vote.write(row_index, 2, members_matrix[member]['State Abbr'], style=default_style)
        sheet_vote.write(row_index, 3, members_matrix[member]['District'], style=default_style)
        sheet_vote.write(row_index, 4, members_matrix[member]['CQ label'], style=default_style)
        sheet_vote.write(row_index, 5, members_matrix[member]['Name'], style=default_style)
        sheet_vote.write(row_index, 6, members_matrix[member]['Full name'], style=default_style)
        sheet_vote.write(row_index, 7, members_matrix[member]['Party code'], style=default_style)
        sheet_vote.write(row_index, 8, members_matrix[member]['Party name'], style=default_style)
        for idx_vote, rollcall_key in enumerate(rollcalls.keys(), start=9):
            sheet_vote.write(row_index, idx_vote, members_matrix[member][rollcall_key] or 0, style=default_style)

    # Download the excel file
    response = HttpResponse(mimetype='application/vnd.ms-excel')
    response['Content-Disposition'] = 'attachment; filename=rollcalls.xls'
    book.save(response)
    return response


def ajax_faceted_search(request):
    """
    Return a paginated list of rollcalls that match the parameters
    """
    query = {}
    if request.POST.get('search-string', ''):
        query['description'] = {'$regex': request.POST['search-string'].upper()}
    if request.POST.get('chamber'):
        query['chamber'] = {'$in': request.POST.getlist('chamber')}
    if request.POST.get('clausen'):
        query['code.Clausen'] = {'$in': request.POST.getlist('clausen')}
    if request.POST.get('peltzman'):
        query['code.Peltzman'] = {'$in': request.POST.getlist('peltzman')}

    # Filter by session
    if request.POST.get('from-session'):
        from_session = int(request.POST.get('from-session'))
        if 'session' in query:
            query['session']['$gte'] = int(from_session)
        else:
            query['session'] = { '$gte': int(from_session) }
    if request.POST.get('to-session'):
        to_session = int(request.POST.get('to-session'))
        if 'session' in query:
            query['session']['$lte'] = int(to_session)
        else:
            query['session'] = {'$lte': int(to_session)}

    # Filter by date range
    if request.POST.get('from-date'):
        from_year = int(request.POST.get('from-date'))
        if 'datef' in query:
            query['datef']["$gte"] = datetime(from_year, 1, 1)
        else:
            query['datef'] = { "$gte": datetime(from_year, 1, 1) }            
    if request.POST.get('to-date'):
        to_year = int(request.POST.get('to-date'))
        # We get the rollcalls of these year too
        if 'datef' in query:
            query['datef']["$lt"] = datetime(to_year + 1, 1, 1)
        else:
            query['datef'] = {"$lt": datetime(to_year + 1, 1, 1)}

    # Sort the results
    order = request.POST.get('sort', None)
    if order == 'date-asc':
        sorting = ('datef', 1)
    elif order == 'date-desc':
        sorting = ('datef', -1)
    elif order == 'session':
        sorting = ('session', -1)

    rollcalls = db.voteview_rollcalls.find(query).sort(*sorting)
    rollcalls_page = list(rollcalls[:20])

    # Build the template
    context = Context({'rollcalls': rollcalls_page, 'request':request})
    return_str = render_block_to_string('search_list.html', 'results', context)
    return HttpResponse(return_str)

def api_get_rollcalls(request):
    """
    Get all the rollcalls
    """
    chamber = request.GET.get('chamber', 'senate').title()

    rollcalls_col = db.voteview_rollcalls
    rollcalls = rollcalls_col.find({'chamber': chamber})[:5000]

    result = []
    for rollcall in rollcalls:
        try:
            clausen = rollcall['code']['Clausen'][0]
        except IndexError:
            clausen = 'None'
        result.append({
            'clausen': clausen,
            'chamber': rollcall['chamber'],
            'result': rollcall['finalresult'],
            'date': rollcall['date'],
            'session': rollcall['session'],
            'rcnum': rollcall['rollnumber'],
            'desc': rollcall['shortdescription'] 
        })
    return (
        HttpResponse(
            dumps(result),
            content_type='application/json; charset=utf8')
    ) 

def _get_yeanayabs(vote_id):
    """
    Map vote ids with the propper values
    Yea -> [1..3], Nay -> [4..6], Abs -> [7..9]
    """
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
    rollcalls_col = db.voteview_rollcalls
    members_col = db.voteview_members

    rollcall = rollcalls_col.find_one({'id': rollcall_id})
    result = []
    for vote in rollcall['votes']:
        member = members_col.find_one({'id': vote})
        v = {
            'vote': _get_yeanayabs(rollcall['votes'][vote]),
            'name': member['fname'],
            'id': member['id'],
            'party': member['partyname'],
            'state': member['stateAbbr']
        }
        if member['nominate']['oneDimNominate']:
            v['x'] = member['nominate']['oneDimNominate']
            v['y'] = member['nominate']['twoDimNominate']

        if member['districtCode'] > 70:
            v['district'] = "%s00" % member['stateAbbr']
        elif member['districtCode'] and member['districtCode'] <= 70:
            v['district'] = "%s%02d" % (member['stateAbbr'], member['districtCode'])
        result.append(v)
    return (
        HttpResponse(
            dumps({'votes': result, 'nominate': rollcall['nominate']}),
            content_type='application/json; charset=utf8')
    )

def get_vote(request, rollcall_id):
    """Deprecated"""
    rollcalls_col = db.voteview_rollcalls
    rollcall = rollcalls_col.find_one({'id': rollcall_id})
    return (
        HttpResponse(
            dumps(rollcall),
            content_type='application/json; charset=utf8')
    )

## DEPRECATED USED ONLY TO CHECK IF THE CHARTS ARE LIKE THE OLD ONES
def get_members(request, session_id):
    members_col = db.voteview_members
    members = members_col.find({'session': int(session_id)})
    print members
    return (
        HttpResponse(
            dumps(members),
            content_type='application/json; charset=utf8')
    )
