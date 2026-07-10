from django.conf import settings


def yandex_metrica(request):
    return {
        'YANDEX_METRICA_ID': getattr(settings, 'YANDEX_METRICA_ID', ''),
    }