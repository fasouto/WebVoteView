# -*- coding: utf-8 -*-

from django.conf import settings
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView

from wbv.views import HomePageView, RollcallView

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$',  HomePageView.as_view(), name='home'),
    url(r'^search/$', 'webvoteview.views.search', name='search'),
    url(r'^rollcall/$', RollcallView.as_view(), name='rollcall_display'),
    url(r'^about/$', TemplateView.as_view(template_name='about.html'), name='about'),

    # API urls
    url(r'^api/search/$', 'webvoteview.views.ajax_faceted_search', name='api_search'),
    url(r'^voteview/getvote/(?P<rollcall_id>[-\w]+)/$', 'webvoteview.views.get_vote', name='get_vote'),
    url(r'^voteview/getmemberslist/(?P<session_id>[-\w]+)/$', 'webvoteview.views.get_members', name='get_members'),

    url(r'^admin/', include(admin.site.urls)),
)

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
