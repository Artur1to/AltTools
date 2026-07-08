import json
from datetime import date, datetime, timedelta
from django.shortcuts import render, get_object_or_404
import base64
import uuid as uuid_lib

import re
from random import SystemRandom
from io import BytesIO
from urllib.parse import urlparse
from collections import OrderedDict
from .models import ToolCategory, ToolPage
from django.db.models import Q, Count


import qrcode
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.shortcuts import render
# Create your views here.

RANDOM = SystemRandom()

MAX_COUNT = 500
MAX_RANGE_SIZE = 1_000_000
MAX_UUID_COUNT = 1000
PHONE_RANDOM = SystemRandom()

MAX_PHONE_COUNT = 1000

PHONE_PRESETS = {
    'ru': {
        'title': 'Россия',
        'country_code': '7',
        'national_length': 10,
        'operators': {
            'mts': {
                'title': 'МТС',
                'prefixes': ['910', '915', '916', '917', '918', '919', '980', '985', '986', '987', '988', '989'],
            },
            'beeline': {
                'title': 'Билайн',
                'prefixes': ['903', '905', '906', '909', '960', '961', '962', '963', '964', '965', '966', '967', '968'],
            },
            'megafon': {
                'title': 'МегаФон',
                'prefixes': ['920', '921', '922', '923', '924', '925', '926', '927', '928', '929', '930', '931', '932', '933'],
            },
            'tele2': {
                'title': 'Tele2',
                'prefixes': ['900', '901', '902', '904', '908', '950', '951', '952', '953', '991', '992', '993'],
            },
        },
    },

    'kz': {
        'title': 'Казахстан',
        'country_code': '7',
        'national_length': 10,
        'operators': {
            'beeline_kz': {
                'title': 'Beeline Казахстан',
                'prefixes': ['705', '706', '707', '747', '776', '777'],
            },
            'kcell': {
                'title': 'Kcell / Activ',
                'prefixes': ['701', '702', '775', '778'],
            },
            'tele2_kz': {
                'title': 'Tele2 / Altel',
                'prefixes': ['700', '708', '747', '771'],
            },
        },
    },

    'by': {
        'title': 'Беларусь',
        'country_code': '375',
        'national_length': 9,
        'operators': {
            'a1': {
                'title': 'A1',
                'prefixes': ['29', '44'],
            },
            'mts_by': {
                'title': 'МТС Беларусь',
                'prefixes': ['29', '33'],
            },
            'life_by': {
                'title': 'life:)',
                'prefixes': ['25'],
            },
        },
    },

    'ua': {
        'title': 'Украина',
        'country_code': '380',
        'national_length': 9,
        'operators': {
            'kyivstar': {
                'title': 'Киевстар',
                'prefixes': ['67', '68', '96', '97', '98'],
            },
            'vodafone_ua': {
                'title': 'Vodafone Украина',
                'prefixes': ['50', '66', '95', '99'],
            },
            'lifecell': {
                'title': 'lifecell',
                'prefixes': ['63', '73', '93'],
            },
        },
    },
}


def index(request):
    categories = (
        ToolCategory.objects
        .filter(is_published=True)
        .order_by('sort_order', 'title')
    )

    popular_tools = (
        ToolPage.objects
        .filter(is_published=True, is_popular=True)
        .select_related('category')
        .order_by('sort_order', 'title')[:12]
    )

    latest_tools = (
        ToolPage.objects
        .filter(is_published=True)
        .select_related('category')
        .order_by('-created_at')[:8]
    )

    context = {
        'categories': categories,
        'popular_tools': popular_tools,
        'latest_tools': latest_tools,
    }

    return render(request, 'tools/index.html', context)


def tools(request):
    query = request.GET.get('q', '').strip()

    categories = (
        ToolCategory.objects
        .filter(is_published=True)
        .annotate(
            tools_count=Count(
                'tools',
                filter=Q(tools__is_published=True)
            )
        )
        .order_by('sort_order', 'title')
    )

    tools_list = (
        ToolPage.objects
        .filter(is_published=True)
        .select_related('category')
        .order_by('category__sort_order', 'sort_order', 'title')
    )

    if query:
        tools_list = tools_list.filter(
            Q(title__icontains=query) |
            Q(h1__icontains=query) |
            Q(short_description__icontains=query) |
            Q(section__icontains=query) |
            Q(badge__icontains=query) |
            Q(category__title__icontains=query)
        )

    popular_tools = (
        ToolPage.objects
        .filter(is_published=True, is_popular=True)
        .select_related('category')
        .order_by('sort_order', 'title')[:6]
    )

    context = {
        'categories': categories,
        'tools': tools_list,
        'popular_tools': popular_tools,
        'query': query,
    }

    return render(request, 'tools/tools.html', context)


def build_tool_groups(tools_queryset):
    groups = OrderedDict()

    for tool in tools_queryset:
        group_name = tool.section or 'Все инструменты'

        if group_name not in groups:
            groups[group_name] = []

        groups[group_name].append(tool)

    return groups


def category_detail(request, category_slug):
    category = get_object_or_404(
        ToolCategory,
        slug=category_slug,
        is_published=True
    )

    tools_queryset = (
        category.tools
        .filter(is_published=True)
        .order_by('sort_order', 'title')
    )

    popular_tools = tools_queryset.filter(is_popular=True)[:3]
    tool_groups = build_tool_groups(tools_queryset)

    context = {
        'category': category,
        'tools': tools_queryset,
        'popular_tools': popular_tools,
        'tool_groups': tool_groups,
    }

    return render(request, 'tools/category_detail.html', context)

def about(request):
    return render(request, 'pages/about.html')

def contacts(request):
    return render(request, 'pages/contacts.html')

def privacy(request):
    return render(request, 'pages/privacy.html')

def bmi_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='bmi-calculator',
            is_published=True
        )

    result = None
    category = None
    error = None

    weight = request.GET.get('weight', '')
    height = request.GET.get('height', '')

    if weight and height:
        try:
            weight_num = float(weight.replace(',', '.'))
            height_num = float(height.replace(',', '.'))

            if weight_num <= 0 or height_num <= 0:
                error = 'Введите корректные значения больше нуля.'
            else:
                height_m = height_num / 100
                bmi = weight_num / (height_m ** 2)
                result = round(bmi, 1)

                if result < 18.5:
                    category = 'Недостаточная масса тела'
                elif result < 25:
                    category = 'Нормальная масса тела'
                elif result < 30:
                    category = 'Избыточная масса тела'
                else:
                    category = 'Ожирение'

        except ValueError:
            error = 'Введите числа в поля веса и роста.'

    context = {
        'page': page,
        'result': result,
        'category': category,
        'error': error,
        'weight': weight,
        'height': height,
    }

    return render(request, 'tools/bmi_calculator.html', context)


def normalize_url(value):
    value = value.strip()

    if not value:
        return ''

    parsed = urlparse(value)

    if not parsed.scheme:
        value = 'https://' + value

    return value


def qr_code_generator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='qr-code-generator',
            is_published=True
        )

    qr_image = None
    source_url = ''
    normalized_url = ''
    error = None

    if request.method == 'POST':
        source_url = request.POST.get('url', '').strip()
        normalized_url = normalize_url(source_url)

        if not normalized_url:
            error = 'Введите ссылку для генерации QR-кода.'
        else:
            validator = URLValidator()

            try:
                validator(normalized_url)

                qr = qrcode.QRCode(
                    version=None,
                    error_correction=qrcode.constants.ERROR_CORRECT_M,
                    box_size=10,
                    border=4,
                )

                qr.add_data(normalized_url)
                qr.make(fit=True)

                img = qr.make_image(
                    fill_color='black',
                    back_color='white'
                ).convert('RGB')

                buffer = BytesIO()
                img.save(buffer, format='PNG')

                qr_image = base64.b64encode(buffer.getvalue()).decode('utf-8')

            except ValidationError:
                error = 'Введите корректную ссылку. Например: https://example.com'
            except Exception:
                error = 'Не удалось создать QR-код. Попробуйте ещё раз.'

    context = {
        'page': page,
        'qr_image': qr_image,
        'source_url': source_url,
        'normalized_url': normalized_url,
        'error': error,
    }

    return render(request, 'tools/generators/qr_code_generator.html', context)


def parse_int_list(raw_text, field_name='список'):
    """
    Превращает строку вида:
    1, 2, 3
    или:
    1 2 3
    или:
    1;2;3

    в список чисел [1, 2, 3]
    """
    if not raw_text.strip():
        return []

    parts = re.split(r'[\s,;]+', raw_text.strip())
    numbers = []

    for part in parts:
        if not part:
            continue

        try:
            numbers.append(int(part))
        except ValueError:
            raise ValueError(f'В поле «{field_name}» должны быть только целые числа.')

    return numbers


def unique_preserve_order(numbers):
    """
    Убирает повторы, но сохраняет порядок.
    """
    return list(dict.fromkeys(numbers))


def random_number_generator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='random-number-generator',
            is_published=True
        )

    mode = 'range'
    min_value = '1'
    max_value = '100'
    count = '1'
    numbers_list = ''
    exclude_numbers = ''
    unique = False
    sort_result = 'none'

    results = []
    result_text = ''
    error = None

    if request.method == 'POST':
        mode = request.POST.get('mode', 'range')
        min_value = request.POST.get('min_value', '1').strip()
        max_value = request.POST.get('max_value', '100').strip()
        count = request.POST.get('count', '1').strip()
        numbers_list = request.POST.get('numbers_list', '').strip()
        exclude_numbers = request.POST.get('exclude_numbers', '').strip()
        unique = request.POST.get('unique') == 'on'
        sort_result = request.POST.get('sort_result', 'none')

        try:
            count_int = int(count)

            if count_int < 1:
                error = 'Количество чисел должно быть больше нуля.'
            elif count_int > MAX_COUNT:
                error = f'За один раз можно сгенерировать не больше {MAX_COUNT} чисел.'

            excluded = set(parse_int_list(exclude_numbers, 'исключить числа')) if exclude_numbers else set()

            allowed_numbers = []

            if not error:
                if mode == 'range':
                    min_int = int(min_value)
                    max_int = int(max_value)

                    if min_int > max_int:
                        error = 'Минимальное значение не может быть больше максимального.'
                    else:
                        range_size = max_int - min_int + 1

                        if range_size > MAX_RANGE_SIZE:
                            error = f'Диапазон слишком большой. Максимальный размер диапазона: {MAX_RANGE_SIZE} чисел.'
                        else:
                            allowed_numbers = [
                                number
                                for number in range(min_int, max_int + 1)
                                if number not in excluded
                            ]

                elif mode == 'list':
                    source_numbers = parse_int_list(numbers_list, 'список чисел')

                    if not source_numbers:
                        error = 'Введите список чисел.'
                    else:
                        allowed_numbers = [
                            number
                            for number in source_numbers
                            if number not in excluded
                        ]

                else:
                    error = 'Неизвестный режим генерации.'

            if not error:
                if not allowed_numbers:
                    error = 'После применения исключений не осталось доступных чисел.'
                else:
                    if unique:
                        allowed_numbers = unique_preserve_order(allowed_numbers)

                        if count_int > len(allowed_numbers):
                            error = 'Нельзя сгенерировать столько чисел без повторений. Уменьшите количество или расширьте диапазон.'
                        else:
                            results = RANDOM.sample(allowed_numbers, count_int)
                    else:
                        results = [
                            RANDOM.choice(allowed_numbers)
                            for _ in range(count_int)
                        ]

            if results:
                if sort_result == 'asc':
                    results.sort()
                elif sort_result == 'desc':
                    results.sort(reverse=True)

                result_text = ', '.join(str(number) for number in results)

        except ValueError as exc:
            error = str(exc)
        except Exception:
            error = 'Не удалось сгенерировать числа. Проверьте введённые данные.'

    context = {
        'page': page,

        'mode': mode,
        'min_value': min_value,
        'max_value': max_value,
        'count': count,
        'numbers_list': numbers_list,
        'exclude_numbers': exclude_numbers,
        'unique': unique,
        'sort_result': sort_result,

        'results': results,
        'result_text': result_text,
        'error': error,
    }

    return render(request, 'tools/generators/random_number_generator.html', context)


def format_uuid(value, uppercase=False, without_hyphens=False):
    uuid_text = str(value)

    if without_hyphens:
        uuid_text = uuid_text.replace('-', '')

    if uppercase:
        uuid_text = uuid_text.upper()

    return uuid_text


def uuid_generator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='uuid-generator',
            is_published=True
        )

    count = '1'
    uppercase = False
    without_hyphens = False

    results = []
    result_text = ''
    error = None

    if request.method == 'POST':
        count = request.POST.get('count', '1').strip()
        uppercase = request.POST.get('uppercase') == 'on'
        without_hyphens = request.POST.get('without_hyphens') == 'on'

        try:
            count_int = int(count)

            if count_int < 1:
                error = 'Количество UUID должно быть больше нуля.'
            elif count_int > MAX_UUID_COUNT:
                error = f'За один раз можно создать не больше {MAX_UUID_COUNT} UUID.'
            else:
                results = [
                    format_uuid(
                        uuid_lib.uuid4(),
                        uppercase=uppercase,
                        without_hyphens=without_hyphens
                    )
                    for _ in range(count_int)
                ]

        except ValueError:
            error = 'Введите корректное количество UUID.'
        except Exception:
            error = 'Не удалось создать UUID. Попробуйте ещё раз.'

    else:
        results = [format_uuid(uuid_lib.uuid4())]

    if results:
        result_text = '\n'.join(results)

    context = {
        'page': page,
        'count': count,
        'uppercase': uppercase,
        'without_hyphens': without_hyphens,
        'results': results,
        'result_text': result_text,
        'error': error,
    }

    return render(request, 'tools/generators/uuid_generator.html', context)


FISH_TEXT_LENGTHS = {
    'short': {
        'title': 'Короткий',
        'words': 80,
    },
    'medium': {
        'title': 'Средний',
        'words': 180,
    },
    'long': {
        'title': 'Длинный',
        'words': 350,
    },
    'very_long': {
        'title': 'Очень длинный',
        'words': 700,
    },
}


FISH_TEXT_LANGUAGES = {
    'ru': {
        'title': 'Русский',
        'words': [
            'макет', 'страница', 'текст', 'раздел', 'контент', 'заголовок',
            'описание', 'проект', 'интерфейс', 'пользователь', 'система',
            'данные', 'пример', 'структура', 'элемент', 'блок', 'кнопка',
            'форма', 'дизайн', 'задача', 'результат', 'сервис', 'инструмент',
            'платформа', 'решение', 'процесс', 'модуль', 'функция', 'шаблон',
            'проверка', 'настройка', 'разработка', 'контекст', 'формат',
            'вариант', 'информация', 'параметр', 'страница', 'переход',
            'значение', 'категория', 'содержание', 'примерный', 'удобный',
            'быстрый', 'понятный', 'визуальный', 'полезный', 'готовый',
            'простой', 'современный', 'универсальный', 'аккуратный',
            'создаёт', 'показывает', 'помогает', 'использует', 'формирует',
            'отображает', 'проверяет', 'выбирает', 'добавляет', 'обновляет',
            'для', 'при', 'без', 'после', 'через', 'между', 'внутри',
            'рядом', 'сразу', 'здесь', 'когда', 'если', 'также'
        ],
    },
    'en': {
        'title': 'English',
        'words': [
            'layout', 'page', 'text', 'section', 'content', 'heading',
            'description', 'project', 'interface', 'user', 'system',
            'data', 'example', 'structure', 'element', 'block', 'button',
            'form', 'design', 'task', 'result', 'service', 'tool',
            'platform', 'solution', 'process', 'module', 'function',
            'template', 'check', 'setting', 'development', 'context',
            'format', 'option', 'information', 'parameter', 'screen',
            'value', 'category', 'message', 'simple', 'modern', 'useful',
            'clear', 'quick', 'visual', 'ready', 'flexible', 'creative',
            'creates', 'shows', 'helps', 'uses', 'builds', 'displays',
            'checks', 'selects', 'adds', 'updates', 'for', 'with',
            'without', 'after', 'through', 'between', 'inside', 'near',
            'today', 'when', 'if', 'also'
        ],
    },
    'de': {
        'title': 'Deutsch',
        'words': [
            'layout', 'seite', 'text', 'bereich', 'inhalt', 'überschrift',
            'beschreibung', 'projekt', 'oberfläche', 'benutzer', 'system',
            'daten', 'beispiel', 'struktur', 'element', 'block', 'schaltfläche',
            'formular', 'design', 'aufgabe', 'ergebnis', 'dienst', 'werkzeug',
            'plattform', 'lösung', 'prozess', 'modul', 'funktion', 'vorlage',
            'prüfung', 'einstellung', 'entwicklung', 'kontext', 'format',
            'option', 'information', 'parameter', 'bildschirm', 'wert',
            'kategorie', 'nachricht', 'einfach', 'modern', 'nützlich',
            'klar', 'schnell', 'visuell', 'fertig', 'flexibel', 'kreativ',
            'erstellt', 'zeigt', 'hilft', 'nutzt', 'bildet', 'prüft',
            'wählt', 'fügt', 'aktualisiert', 'für', 'mit', 'ohne',
            'nach', 'durch', 'zwischen', 'innerhalb', 'neben', 'heute',
            'wenn', 'auch'
        ],
    },
    'es': {
        'title': 'Español',
        'words': [
            'diseño', 'página', 'texto', 'sección', 'contenido', 'título',
            'descripción', 'proyecto', 'interfaz', 'usuario', 'sistema',
            'datos', 'ejemplo', 'estructura', 'elemento', 'bloque', 'botón',
            'formulario', 'diseño', 'tarea', 'resultado', 'servicio',
            'herramienta', 'plataforma', 'solución', 'proceso', 'módulo',
            'función', 'plantilla', 'revisión', 'ajuste', 'desarrollo',
            'contexto', 'formato', 'opción', 'información', 'parámetro',
            'pantalla', 'valor', 'categoría', 'mensaje', 'simple',
            'moderno', 'útil', 'claro', 'rápido', 'visual', 'listo',
            'flexible', 'creativo', 'crea', 'muestra', 'ayuda', 'usa',
            'forma', 'comprueba', 'elige', 'añade', 'actualiza', 'para',
            'con', 'sin', 'después', 'mediante', 'entre', 'dentro',
            'cerca', 'hoy', 'cuando', 'si', 'también'
        ],
    },
}


def generate_fish_text(language_key, length_key):
    random = SystemRandom()

    language = FISH_TEXT_LANGUAGES.get(language_key, FISH_TEXT_LANGUAGES['ru'])
    length = FISH_TEXT_LENGTHS.get(length_key, FISH_TEXT_LENGTHS['medium'])

    words = language['words']
    target_words = length['words']

    result_sentences = []
    used_words = 0

    while used_words < target_words:
        sentence_length = random.randint(8, 16)
        sentence_words = [
            random.choice(words)
            for _ in range(sentence_length)
        ]

        sentence_words[0] = sentence_words[0].capitalize()

        sentence = ' '.join(sentence_words)
        sentence += random.choice(['.', '.', '.', '!', '?'])

        result_sentences.append(sentence)
        used_words += sentence_length

    paragraphs = []
    current_paragraph = []

    for index, sentence in enumerate(result_sentences, start=1):
        current_paragraph.append(sentence)

        if index % 4 == 0:
            paragraphs.append(' '.join(current_paragraph))
            current_paragraph = []

    if current_paragraph:
        paragraphs.append(' '.join(current_paragraph))

    return '\n\n'.join(paragraphs)


def fish_text_generator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='fish-text-generator',
            is_published=True
        )

    selected_language = request.GET.get('language', 'ru')
    selected_length = request.GET.get('length', 'medium')

    if selected_language not in FISH_TEXT_LANGUAGES:
        selected_language = 'ru'

    if selected_length not in FISH_TEXT_LENGTHS:
        selected_length = 'medium'

    generated_text = generate_fish_text(
        selected_language,
        selected_length
    )

    context = {
        'page': page,
        'languages': FISH_TEXT_LANGUAGES,
        'lengths': FISH_TEXT_LENGTHS,
        'selected_language': selected_language,
        'selected_length': selected_length,
        'generated_text': generated_text,
    }

    return render(
        request,
        'tools/text/fish_text_generator.html',
        context
    )


def generate_local_phone_number(country_data, operator_data):
    prefix = PHONE_RANDOM.choice(operator_data['prefixes'])
    national_length = country_data['national_length']

    remaining_digits_count = national_length - len(prefix)

    if remaining_digits_count < 1:
        raise ValueError('Некорректные настройки номера.')

    tail = ''.join(
        str(PHONE_RANDOM.randint(0, 9))
        for _ in range(remaining_digits_count)
    )

    return prefix + tail


def format_phone_number(country_key, country_code, local_number, output_format):
    e164_number = f'+{country_code}{local_number}'

    if output_format == 'digits':
        return f'{country_code}{local_number}'

    if output_format == 'national':
        if country_key in ['ru', 'kz']:
            return f'8 ({local_number[:3]}) {local_number[3:6]}-{local_number[6:8]}-{local_number[8:10]}'

        if country_key in ['by', 'ua']:
            return f'0{local_number[:2]} {local_number[2:5]}-{local_number[5:7]}-{local_number[7:9]}'

        return local_number

    if country_key in ['ru', 'kz']:
        return f'+{country_code} ({local_number[:3]}) {local_number[3:6]}-{local_number[6:8]}-{local_number[8:10]}'

    if country_key in ['by', 'ua']:
        return f'+{country_code} ({local_number[:2]}) {local_number[2:5]}-{local_number[5:7]}-{local_number[7:9]}'

    return e164_number


def phone_number_generator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='phone-number-generator',
            is_published=True
        )

    country_key = 'ru'
    operator_key = 'mts'
    count = '10'
    output_format = 'international'
    unique = True

    results = []
    result_text = ''
    error = None

    if request.method == 'POST':
        country_key = request.POST.get('country', 'ru')
        operator_key = request.POST.get('operator', '')
        count = request.POST.get('count', '10').strip()
        output_format = request.POST.get('output_format', 'international')
        unique = request.POST.get('unique') == 'on'

        try:
            if country_key not in PHONE_PRESETS:
                raise ValueError('Выберите корректную страну.')

            country_data = PHONE_PRESETS[country_key]

            if operator_key not in country_data['operators']:
                raise ValueError('Выберите корректного оператора.')

            operator_data = country_data['operators'][operator_key]

            count_int = int(count)

            if count_int < 1:
                raise ValueError('Количество номеров должно быть больше нуля.')

            if count_int > MAX_PHONE_COUNT:
                raise ValueError(f'За один раз можно создать не больше {MAX_PHONE_COUNT} номеров.')

            generated = []
            used = set()
            attempts = 0
            max_attempts = count_int * 20

            while len(generated) < count_int:
                attempts += 1

                if attempts > max_attempts:
                    raise ValueError('Не удалось создать нужное количество уникальных номеров. Уменьшите количество.')

                local_number = generate_local_phone_number(country_data, operator_data)
                e164_number = f'+{country_data["country_code"]}{local_number}'

                if unique and e164_number in used:
                    continue

                used.add(e164_number)

                formatted_number = format_phone_number(
                    country_key=country_key,
                    country_code=country_data['country_code'],
                    local_number=local_number,
                    output_format=output_format,
                )

                generated.append(formatted_number)

            results = generated
            result_text = '\n'.join(results)

        except ValueError as exc:
            error = str(exc)
        except Exception:
            error = 'Не удалось создать номера. Проверьте настройки и попробуйте ещё раз.'

    else:
        country_data = PHONE_PRESETS[country_key]
        operator_data = country_data['operators'][operator_key]

        for _ in range(10):
            local_number = generate_local_phone_number(country_data, operator_data)

            results.append(
                format_phone_number(
                    country_key=country_key,
                    country_code=country_data['country_code'],
                    local_number=local_number,
                    output_format=output_format,
                )
            )

        result_text = '\n'.join(results)

    context = {
        'page': page,
        'phone_presets': PHONE_PRESETS,

        'country_key': country_key,
        'operator_key': operator_key,
        'count': count,
        'output_format': output_format,
        'unique': unique,

        'results': results,
        'result_text': result_text,
        'error': error,
    }

    return render(request, 'tools/generators/phone_number_generator.html', context)


MAX_RANDOM_DATE_COUNT = 1000

DATE_GENERATOR_MODES = {
    'single': 'Одна дата',
    'list': 'Список дат',
    'birthday': 'Дни рождения',
}

DATE_OUTPUT_FORMATS = {
    'dot': 'DD.MM.YYYY',
    'iso': 'YYYY-MM-DD',
    'slash': 'DD/MM/YYYY',
    'text': 'Текстовый формат',
}

DATE_SORT_OPTIONS = {
    'none': 'Как сгенерировано',
    'asc': 'По возрастанию',
    'desc': 'По убыванию',
}

RU_MONTHS = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
]

RU_WEEKDAYS = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
]


def parse_date_input(value, fallback):
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except (TypeError, ValueError):
        return fallback


def parse_int_input(value, default, min_value=None, max_value=None):
    try:
        number = int(value)
    except (TypeError, ValueError):
        number = default

    if min_value is not None:
        number = max(number, min_value)

    if max_value is not None:
        number = min(number, max_value)

    return number


def shift_years(source_date, years):
    try:
        return source_date.replace(year=source_date.year + years)
    except ValueError:
        return source_date.replace(
            year=source_date.year + years,
            month=2,
            day=28
        )


def calculate_age(birthday, today):
    age = today.year - birthday.year

    if (today.month, today.day) < (birthday.month, birthday.day):
        age -= 1

    return age


def random_date_between(start_date, end_date, random):
    days_difference = (end_date - start_date).days
    random_days = random.randint(0, days_difference)

    return start_date + timedelta(days=random_days)


def format_random_date(value, output_format):
    if output_format == 'iso':
        return value.strftime('%Y-%m-%d')

    if output_format == 'slash':
        return value.strftime('%d/%m/%Y')

    if output_format == 'text':
        month = RU_MONTHS[value.month - 1]
        return f'{value.day} {month} {value.year}'

    return value.strftime('%d.%m.%Y')


def build_date_json_item(value, formatted_value, mode, today):
    item = {
        'date': value.isoformat(),
        'value': formatted_value,
        'day_of_week': RU_WEEKDAYS[value.weekday()],
    }

    if mode == 'birthday':
        item['age'] = calculate_age(value, today)

    return item


def random_date_generator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='random-date-generator',
            is_published=True
        )

    today = date.today()
    random = SystemRandom()
    errors = []

    selected_mode = request.GET.get('mode', 'list')
    selected_format = request.GET.get('format', 'dot')
    selected_sort = request.GET.get('sort', 'none')

    if selected_mode not in DATE_GENERATOR_MODES:
        selected_mode = 'list'

    if selected_format not in DATE_OUTPUT_FORMATS:
        selected_format = 'dot'

    if selected_sort not in DATE_SORT_OPTIONS:
        selected_sort = 'none'

    default_start_date = date(today.year - 10, 1, 1)
    default_end_date = today

    start_date = parse_date_input(
        request.GET.get('start_date'),
        default_start_date
    )

    end_date = parse_date_input(
        request.GET.get('end_date'),
        default_end_date
    )

    count = parse_int_input(
        request.GET.get('count'),
        default=10,
        min_value=1,
        max_value=MAX_RANDOM_DATE_COUNT
    )

    min_age = parse_int_input(
        request.GET.get('min_age'),
        default=18,
        min_value=0,
        max_value=120
    )

    max_age = parse_int_input(
        request.GET.get('max_age'),
        default=65,
        min_value=0,
        max_value=120
    )

    unique = request.GET.get('unique') == 'on'

    if selected_mode == 'single':
        count = 1

    if selected_mode == 'birthday':
        if min_age > max_age:
            min_age, max_age = max_age, min_age
            errors.append('Минимальный возраст был больше максимального, поэтому значения поменяны местами.')

        generation_start_date = shift_years(today, -max_age)
        generation_end_date = shift_years(today, -min_age)
    else:
        generation_start_date = start_date
        generation_end_date = end_date

    if generation_start_date > generation_end_date:
        generation_start_date, generation_end_date = generation_end_date, generation_start_date
        errors.append('Начальная дата была позже конечной, поэтому даты поменяны местами.')

    available_days = (generation_end_date - generation_start_date).days + 1

    if unique and count > available_days:
        count = available_days
        errors.append(
            'Количество уникальных дат было больше доступного диапазона, поэтому количество уменьшено.'
        )

    generated_dates = []

    if unique:
        random_offsets = random.sample(
            range(available_days),
            count
        )

        for offset in random_offsets:
            generated_dates.append(
                generation_start_date + timedelta(days=offset)
            )
    else:
        for _ in range(count):
            generated_dates.append(
                random_date_between(
                    generation_start_date,
                    generation_end_date,
                    random
                )
            )

    if selected_sort == 'asc':
        generated_dates.sort()

    if selected_sort == 'desc':
        generated_dates.sort(reverse=True)

    result_items = []

    for generated_date in generated_dates:
        formatted_value = format_random_date(
            generated_date,
            selected_format
        )

        result_items.append({
            'date': generated_date,
            'formatted': formatted_value,
            'json': build_date_json_item(
                generated_date,
                formatted_value,
                selected_mode,
                today
            )
        })

    result_lines = [
        item['formatted']
        for item in result_items
    ]

    json_data = {
        'tool': 'AltTools random date generator',
        'mode': selected_mode,
        'format': selected_format,
        'count': len(result_items),
        'generated_at': datetime.now().isoformat(timespec='seconds'),
        'items': [
            item['json']
            for item in result_items
        ]
    }

    context = {
        'page': page,

        'modes': DATE_GENERATOR_MODES,
        'formats': DATE_OUTPUT_FORMATS,
        'sort_options': DATE_SORT_OPTIONS,

        'selected_mode': selected_mode,
        'selected_format': selected_format,
        'selected_sort': selected_sort,

        'start_date': generation_start_date if selected_mode != 'birthday' else start_date,
        'end_date': generation_end_date if selected_mode != 'birthday' else end_date,

        'count': count,
        'min_age': min_age,
        'max_age': max_age,
        'unique': unique,

        'max_count': MAX_RANDOM_DATE_COUNT,
        'errors': errors,

        'result_items': result_items,
        'result_text': '\n'.join(result_lines),
        'json_data': json_data,
    }

    return render(
        request,
        'tools/generators/random_date_generator.html',
        context
    )


def tool_detail(request, category_slug, tool_slug):
    page = get_object_or_404(
        ToolPage.objects.select_related('category'),
        slug=tool_slug,
        category__slug=category_slug,
        is_published=True,
        category__is_published=True,
    )

    handlers = {
        'qr-code-generator': qr_code_generator,
        'random-number-generator': random_number_generator,
        'uuid-generator': uuid_generator,
        'phone-number-generator': phone_number_generator,
        'bmi-calculator': bmi_calculator,
        'fish-text-generator': fish_text_generator,
        'random-date-generator': random_date_generator,


        # если у тебя уже есть функция barcode_generator:
        # 'barcode-generator': barcode_generator,
    }

    handler = handlers.get(page.slug)

    if handler:
        return handler(request, page=page)

    return render(request, 'tools/tool_detail.html', {'page': page})