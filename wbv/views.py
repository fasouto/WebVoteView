"""
Webvoteview specific views
"""
from django.views.generic.base import TemplateView


class HomePageView(TemplateView):

    template_name = "home.html"


class RollcallView(TemplateView):

    template_name = "rollcall.html"


class DCRollcallView(TemplateView):

    template_name = "dc_rollcall.html"


class ExploreView(TemplateView):

    chamber = "senate"
    template_name = "explore.html"

    def get_context_data(self, **kwargs):
        context = super(ExploreView, self).get_context_data(**kwargs)
        context['chamber'] = self.chamber
        return context


class SearchView(TemplateView):

    template_name = "search.html"