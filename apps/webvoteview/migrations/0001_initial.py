# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'State'
        db.create_table(u'webvoteview_state', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('state_id', self.gf('django.db.models.fields.IntegerField')()),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('abbrv', self.gf('django.db.models.fields.CharField')(max_length=5)),
        ))
        db.send_create_signal(u'webvoteview', ['State'])

        # Adding model 'Party'
        db.create_table(u'webvoteview_party', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('abbrv', self.gf('django.db.models.fields.CharField')(max_length=5)),
        ))
        db.send_create_signal(u'webvoteview', ['Party'])

        # Adding model 'RollCall'
        db.create_table(u'webvoteview_rollcall', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('rollcall_id', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('roll_number', self.gf('django.db.models.fields.IntegerField')()),
            ('session', self.gf('django.db.models.fields.IntegerField')()),
            ('code_clausen', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('code_peltzman', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('code_issue', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('description', self.gf('django.db.models.fields.TextField')(null=True)),
            ('sponsor', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('bill', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('question', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('chamber', self.gf('django.db.models.fields.IntegerField')(max_length=1)),
            ('jsondata', self.gf('jsonfield.fields.JSONField')()),
        ))
        db.send_create_signal(u'webvoteview', ['RollCall'])

        # Adding model 'Member'
        db.create_table(u'webvoteview_member', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('member_id', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('full_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('state', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['webvoteview.State'])),
            ('party', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['webvoteview.Party'])),
            ('start_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('end_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('icpsr', self.gf('django.db.models.fields.IntegerField')()),
            ('districtcode', self.gf('django.db.models.fields.IntegerField')()),
            ('occupancy', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('session', self.gf('django.db.models.fields.IntegerField')()),
            ('cqlabel', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('nominate_geoMeanProbability', self.gf('django.db.models.fields.FloatField')()),
            ('nominate_oneDimNominate', self.gf('django.db.models.fields.FloatField')()),
            ('nominate_numberOfVotes', self.gf('django.db.models.fields.FloatField')()),
            ('nominate_twoDimNominateBSE', self.gf('django.db.models.fields.FloatField')()),
            ('nominate_oneDimNominateBSE', self.gf('django.db.models.fields.FloatField')()),
            ('nominate_twoDimNominate', self.gf('django.db.models.fields.FloatField')()),
            ('nominate_dimensionCorrelation', self.gf('django.db.models.fields.FloatField')()),
            ('nominate_logLikelihood', self.gf('django.db.models.fields.FloatField')()),
            ('nominate_numberOfErrors', self.gf('django.db.models.fields.FloatField')()),
            ('jsondata', self.gf('jsonfield.fields.JSONField')()),
        ))
        db.send_create_signal(u'webvoteview', ['Member'])

        # Adding model 'Votes'
        db.create_table(u'webvoteview_votes', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('member', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['webvoteview.Member'])),
            ('rollcall', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['webvoteview.RollCall'])),
            ('vote', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal(u'webvoteview', ['Votes'])


    def backwards(self, orm):
        # Deleting model 'State'
        db.delete_table(u'webvoteview_state')

        # Deleting model 'Party'
        db.delete_table(u'webvoteview_party')

        # Deleting model 'RollCall'
        db.delete_table(u'webvoteview_rollcall')

        # Deleting model 'Member'
        db.delete_table(u'webvoteview_member')

        # Deleting model 'Votes'
        db.delete_table(u'webvoteview_votes')


    models = {
        u'webvoteview.member': {
            'Meta': {'object_name': 'Member'},
            'cqlabel': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'districtcode': ('django.db.models.fields.IntegerField', [], {}),
            'end_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'full_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'icpsr': ('django.db.models.fields.IntegerField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'jsondata': ('jsonfield.fields.JSONField', [], {}),
            'member_id': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'nominate_dimensionCorrelation': ('django.db.models.fields.FloatField', [], {}),
            'nominate_geoMeanProbability': ('django.db.models.fields.FloatField', [], {}),
            'nominate_logLikelihood': ('django.db.models.fields.FloatField', [], {}),
            'nominate_numberOfErrors': ('django.db.models.fields.FloatField', [], {}),
            'nominate_numberOfVotes': ('django.db.models.fields.FloatField', [], {}),
            'nominate_oneDimNominate': ('django.db.models.fields.FloatField', [], {}),
            'nominate_oneDimNominateBSE': ('django.db.models.fields.FloatField', [], {}),
            'nominate_twoDimNominate': ('django.db.models.fields.FloatField', [], {}),
            'nominate_twoDimNominateBSE': ('django.db.models.fields.FloatField', [], {}),
            'occupancy': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'party': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['webvoteview.Party']"}),
            'session': ('django.db.models.fields.IntegerField', [], {}),
            'start_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['webvoteview.State']"})
        },
        u'webvoteview.party': {
            'Meta': {'object_name': 'Party'},
            'abbrv': ('django.db.models.fields.CharField', [], {'max_length': '5'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'webvoteview.rollcall': {
            'Meta': {'object_name': 'RollCall'},
            'bill': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'chamber': ('django.db.models.fields.IntegerField', [], {'max_length': '1'}),
            'code_clausen': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'code_issue': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'code_peltzman': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'jsondata': ('jsonfield.fields.JSONField', [], {}),
            'question': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'roll_number': ('django.db.models.fields.IntegerField', [], {}),
            'rollcall_id': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'session': ('django.db.models.fields.IntegerField', [], {}),
            'sponsor': ('django.db.models.fields.CharField', [], {'max_length': '500'})
        },
        u'webvoteview.state': {
            'Meta': {'object_name': 'State'},
            'abbrv': ('django.db.models.fields.CharField', [], {'max_length': '5'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'state_id': ('django.db.models.fields.IntegerField', [], {})
        },
        u'webvoteview.votes': {
            'Meta': {'object_name': 'Votes'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'member': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['webvoteview.Member']"}),
            'rollcall': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['webvoteview.RollCall']"}),
            'vote': ('django.db.models.fields.IntegerField', [], {})
        }
    }

    complete_apps = ['webvoteview']