# pageST
## Django addon for dynamically loaded pages.

## How to implement pagest in your django project

Add 'pagest' to INSTALLED_APPS at the end
```
INSTALLED_APPS = [
    ...
    'pagest',
]
```

Mark your BasePage (Template Class from that all other templates inherit) with the
@set_basepage decorator of pagest

Define your dynamic pages by a class, which inherits from PageMixin.
You have to set at least the `name` property, which is the name of the template and also the url.

Import the pagest urlpatterns after you defined all views
`from pagest.urls import urlpatterns # pylint:disable=C0411; urlpatterns of pagest MUST be loaded after all view definitions`
