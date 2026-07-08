from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name='home'),
    path('tools/', views.tools, name='tools'),
    path('about/', views.about, name='about'),
    path('contacts/', views.contacts, name='contacts'),
    path('privacy/', views.privacy, name='privacy'),
    # path('tools/finance/', views.finance_tools, name='finance_tools'),
    # path('tools/generators/', views.generators, name='generators'),
    # path('tools/generators/qr-code-generator/', views.qr_code_generator, name='qr_code_generator'),
    # path('tools/generators/random-number-generator/', views.random_number_generator, name='random_number_generator'),
    # path('tools/generators/uuid-generator/', views.uuid_generator, name='uuid_generator'),
    # path('tools/generators/phone-number-generator/', views.phone_number_generator, name='phone_number_generator'),
    path('tools/bmi-calculator/', views.bmi_calculator, name='bmi_calculator'),
    path('tools/<slug:category_slug>/<slug:tool_slug>/', views.tool_detail, name='tool_detail'),
    path('tools/<slug:category_slug>/', views.category_detail, name='category_detail'),
]