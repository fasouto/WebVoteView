# -*- coding: utf-8 -*-

from django.conf import settings
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView

from wbv.views import HomePageView, RollcallView, ExploreView, SearchView


urlpatterns = patterns('',
    url(r'^$', SearchView.as_view(), name='search'),
    url(r'^home/$', TemplateView.as_view(template_name='home.html'), name='home'),
    url(r'^rollcall/(?P<rollcall_id>[-\w]+)/$', 'webvoteview.views.show_rollcall', name='dc_rollcall_display'),
    url(r'^explore/house/$', ExploreView.as_view(chamber="house"), name='explore-house'),
    url(r'^explore/senate/$', ExploreView.as_view(chamber="senate"), name='explore-senate'),
    url(r'^download/(?P<rollcall_id>[-\w]+)/$', 'webvoteview.views.download_excel', name='download_excel'),

    url(r'^about/$', TemplateView.as_view(template_name='about.html'), name='about'),

    # API urls
    url(r'^api/search/$', 'webvoteview.views.ajax_faceted_search', name='api_search'),
    url(r'^api/getvote/(?P<rollcall_id>[-\w]+)/$', 'webvoteview.views.api_get_votes', name='api_get_votes'),
    url(r'^api/getrollcalls/$', 'webvoteview.views.api_get_rollcalls', name='api_get_rollcalls'),

    # Deprecated urls
    url(r'^old_rollcall/$', RollcallView.as_view(), name='rollcall_display'),
    url(r'^voteview/getmemberslist/(?P<session_id>[-\w]+)/$', 'webvoteview.views.get_members', name='get_members'),
    url(r'^voteview/getvote/(?P<rollcall_id>[-\w]+)/$', 'webvoteview.views.get_vote', name='get_vote'),
)

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
