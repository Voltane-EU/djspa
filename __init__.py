import os.path
from django.views import generic
from django.http import HttpResponseRedirect
from django.template.loader import get_template

BaseView = None
page_not_found = HttpResponseRedirect('/')

def set_baseview(cls):
    global BaseView
    assert not BaseView, "A BaseView is already defined! You can only define ONE BaseView."
    BaseView = cls
    return cls

class PageMixin(generic.TemplateView):
    name = None
    subpage = False
    authenticated_only = False
    cache = True
    _modified = None

    @property
    def _file(self):
        return get_template(self.template_name).origin.name

    @property
    def modified(self):
        if not self._modified:
            self._modified = int(os.path.getmtime(self._file))
        return self._modified

    @property
    def template_name(self):
        return 'page/%s.html' % self.name
