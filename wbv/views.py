"""
Project specific views
"""
from django.views.generic.base import TemplateView


class HomePageView(TemplateView):

    template_name = "home.html"


class RollcallView(TemplateView):

    template_name = "rollcall.html"


class DCRollcallView(TemplateView):

    template_name = "dc_rollcall.html"


class ExploreView(TemplateView):

    template_name = "explore.html"


class SearchView(TemplateView):

    template_name = "search.html"