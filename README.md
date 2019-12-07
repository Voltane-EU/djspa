# djspa
Django addon for a single page application with dynamically loaded pages

## Installation
Use the python package manager pip to install djutils.

```bash
pip install djspa
```

## Usage
Add 'djspa' to INSTALLED_APPS at the end
```python
INSTALLED_APPS = [
    ...
    'djspa',
]
```

Mark your BasePage (Template Class from that all other templates inherit) with the
@set_baseview decorator of djspa

```python
from django.views import generic
from djspa import set_baseview

@set_baseview
class BaseView(generic.TemplateView):
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['my_global_template_variable'] = 42
        return context
```

Define your dynamic pages by a class, which inherits from your BaseView and the PageMixin.
You have to set at least the `name` property, which is the name of the template and also the url.

Import the djspa urlpatterns after you defined all views
`from djspa.urls import urlpatterns # pylint:disable=C0411; urlpatterns of djspa MUST be loaded after all view definitions`

You have to define at least the index page, otherwise you get an endless redirect loop.
```python
from djspa import PageMixin

class Index(BaseView, PageMixin):
    name = 'index'
```

Include the pages snippet in your index page template
```
{% include 'djspa_pages.html' %}
```

## License
GNU GPLv3, see LICENSE

## Maintainer
This package is maintained by Manuel Stingl.
For more information see https://opensource.voltane.eu
