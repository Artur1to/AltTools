from django.conf import settings


def yandex_metrica(request):
    site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    current_path = getattr(request, 'path', '/') or '/'

    return {
        'YANDEX_METRICA_ID': getattr(settings, 'YANDEX_METRICA_ID', ''),
        'SITE_URL': site_url,
        'CANONICAL_URL': f'{site_url}{current_path}',
    }