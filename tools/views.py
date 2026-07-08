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

        # если у тебя уже есть функция barcode_generator:
        # 'barcode-generator': barcode_generator,
    }

    handler = handlers.get(page.slug)

    if handler:
        return handler(request, page=page)

    return render(request, 'tools/tool_detail.html', {'page': page})