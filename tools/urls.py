from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name='home'),
    path('tools/', views.tools, name='tools'),
    path('about/', views.about, name='about'),
    path('contacts/', views.contacts, name='contacts'),
    path('privacy/', views.privacy, name='privacy'),
    path('tools/bmi-calculator/', views.bmi_calculator, name='bmi_calculator'),
    path('tools/<slug:category_slug>/<slug:tool_slug>/', views.tool_detail, name='tool_detail'),
    path('tools/<slug:category_slug>/', views.category_detail, name='category_detail'),
]