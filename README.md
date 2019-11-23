# djspa
## Django addon for a single page application with dynamically loaded pages

## How to implement djspa in your django project

Add 'djspa' to INSTALLED_APPS at the end
```
INSTALLED_APPS = [
    ...
    'djspa',
]
```

Mark your BasePage (Template Class from that all other templates inherit) with the
@set_basepage decorator of djspa

Define your dynamic pages by a class, which inherits from PageMixin.
You have to set at least the `name` property, which is the name of the template and also the url.

Import the djspa urlpatterns after you defined all views
`from djspa.urls import urlpatterns # pylint:disable=C0411; urlpatterns of djspa MUST be loaded after all view definitions`

You have to define at least the index page, otherwise you get an endless redirect loop.
```
from djspa import PageMixin

class Index(PageMixin):
    name = 'index'
```
