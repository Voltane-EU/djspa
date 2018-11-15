import logging
from django.http import HttpResponseForbidden, HttpResponseNotFound, HttpResponseRedirect, HttpResponseServerError
from django.template.exceptions import TemplateDoesNotExist
from . import BaseView, PageMixin, exceptions

_logger = logging.getLogger(__name__)

_pages = {page.name: page for page in PageMixin.__subclasses__()}

_logger.info("Loaded %d pages", len(_pages))
_logger.info("BaseView is %s", BaseView)

def is_page_allowed(request, page, subpage=None):
    if page not in _pages:
        raise exceptions.PageNotFound

    if _pages[page].authenticated_only and not request.user.is_authenticated:
        raise exceptions.PageNotAllowed

    if _pages[page].subpage and not subpage:
        raise exceptions.PageNotAllowed

def uac_page_allowed(page, subpage=None):
    def wrapper_def(f):
        def wrapper(request, *args, **kwargs):
            try:
                is_page_allowed(request, page, kwargs.get(subpage) if subpage else None)
            except exceptions.PageNotAllowed as error:
                return HttpResponseForbidden(error.message)
            return f(request, *args, **kwargs)
        return wrapper
    return wrapper_def

def get_page(request, page):
    if page not in _pages:
        return HttpResponseNotFound()

    try:
        is_page_allowed(request, page, subpage=True)
    except exceptions.PageNotAllowed as error:
        return HttpResponseForbidden(error.message)

    try:
        return _pages[page](request=request).get(request)
    except TemplateDoesNotExist:
        return HttpResponseServerError()

class IndexView(BaseView):
    template_name = 'index.html'

    def dispatch(self, request, *args, **kwargs):
        try:
            is_page_allowed(self.request, kwargs.get('page', 'index'), kwargs.get('subpage'))
        except exceptions.PageNotAllowed as error:
            if error.redirect:
                return HttpResponseRedirect(error.redirect)
            return HttpResponseForbidden(error.message)

        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        page = kwargs.get('page', 'index')
        context['current_page'] = page
        context['pages'] = _pages

        return context
