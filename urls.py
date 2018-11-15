from django.urls import path
from . import views

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('get_page/<page>', views.get_page, name='get_page'),
    path('<page>/<subpage>', views.IndexView.as_view(), name='subpage_catchall'),
    path('<page>', views.IndexView.as_view(), name='page_catchall'),
]
