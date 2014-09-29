"""
Create excel reports from roll call objects
"""
import xlwt

from pymongo.connection import Connection


class ExcelReport(object):
    """
    Create a report of several roll calls with the associated votes
    """

    def __init__(self, rollcall_ids):
        self.db = Connection().voteview
        self.rollcall_ids = rollcall_ids
        self.ROLLCALL_LIMIT = 10

        # Define xlwt styles
        self.default_style = xlwt.Style.default_style
        self.datetime_style = xlwt.easyxf(num_format_str='dd/mm/yyyy hh:mm')
        self.date_style = xlwt.easyxf(num_format_str='dd/mm/yyyy')

    def write_headers(self, rollcalls, sheet_vote, sheet_rollcall):
        """
        Write the headers of the different sheets
        """
        vote_matrix_cols = ['ICSPR', 'State', 'State Abbr', 'District', 'CQ label', 'Name', 'Full name', 'Party code', 'Party name']
        vote_matrix_cols.extend(rollcalls.keys())

        rollcall_desc_cols = ['Vote', 'Chamber', 'Congress', 'Date', 'Rollnumber', 'Description']
        for col, title in enumerate(vote_matrix_cols):
            sheet_vote.write(0, col, title, style=self.default_style)
        for col, title in enumerate(rollcall_desc_cols):
            sheet_rollcall.write(0, col, title, style=self.default_style)

    def create_excel(self):
        """
        Download an excel with the rollcall
        """
        # Roll calls are associated between sheets with a code V1, V2...
        rollcalls = {}
        for i, rollcall in enumerate(self.rollcall_ids):
            rollcalls["V" + str(i + 1)] = rollcall

        # Create the excel workbook and sheets and define the basic styles
        book = xlwt.Workbook(encoding='utf8')
        sheet_vote = book.add_sheet('Vote Matrix')
        sheet_rollcall = book.add_sheet('Roll Call Descriptions')

        # Write the headers
        self.write_headers(rollcalls, sheet_vote, sheet_rollcall)

        members_matrix = {}
        for rollcall_index, rollcall_id in enumerate(rollcalls, start=1):
            rollcall = self.db.voteview_rollcalls.find({'id': rollcalls[rollcall_id]})[0]

            # Write the rollcall descriptions sheet
            sheet_rollcall.write(rollcall_index, 0, rollcall_id, style=self.default_style)
            sheet_rollcall.write(rollcall_index, 1, rollcall['chamber'], style=self.default_style)
            sheet_rollcall.write(rollcall_index, 2, rollcall['session'], style=self.default_style)
            sheet_rollcall.write(rollcall_index, 3, rollcall['date'], style=self.default_style)
            sheet_rollcall.write(rollcall_index, 4, rollcall['rollnumber'], style=self.default_style)
            sheet_rollcall.write(rollcall_index, 5, rollcall['description'], style=self.default_style)

            # Populate the members matrix
            for member_id in rollcall['votes']:
                member = self.db.voteview_members.find_one({'id': member_id})
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
            sheet_vote.write(row_index, 0, members_matrix[member]['ICSPR'], style=self.default_style)
            sheet_vote.write(row_index, 1, members_matrix[member]['State'], style=self.default_style)
            sheet_vote.write(row_index, 2, members_matrix[member]['State Abbr'], style=self.default_style)
            sheet_vote.write(row_index, 3, members_matrix[member]['District'], style=self.default_style)
            sheet_vote.write(row_index, 4, members_matrix[member]['CQ label'], style=self.default_style)
            sheet_vote.write(row_index, 5, members_matrix[member]['Name'], style=self.default_style)
            sheet_vote.write(row_index, 6, members_matrix[member]['Full name'], style=self.default_style)
            sheet_vote.write(row_index, 7, members_matrix[member]['Party code'], style=self.default_style)
            sheet_vote.write(row_index, 8, members_matrix[member]['Party name'], style=self.default_style)
            for idx_vote, rollcall_key in enumerate(rollcalls.keys(), start=9):
                try:
                    sheet_vote.write(row_index, idx_vote, members_matrix[member][rollcall_key] or 0, style=self.default_style)
                except:
                    sheet_vote.write(row_index, idx_vote, 0, style=self.default_style)


        return book
