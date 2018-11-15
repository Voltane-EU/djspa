class PageSTError(Exception):
    def __init__(self, message="", code=None, status_code=None, **kw):
        super().__init__(**kw)
        self.message = message
        self.code = code
        self.status_code = status_code


class PageNotAllowed(PageSTError):
    def __init__(self, message="", code=None, status_code=None, redirect='/', **kw):
        super().__init__(message, code, status_code, **kw)
        self.redirect = redirect

class PageNotFound(PageNotAllowed):
    pass
