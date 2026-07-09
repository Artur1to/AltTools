from django.shortcuts import render, get_object_or_404

from ..models import ToolPage


UNIT_CONVERTER_CONFIGS = {
    'length-converter': {
        'type': 'length',
        'title': 'Конвертер длины',
        'label': 'Длина',
        'base_unit': 'Метр',
        'default_from': 'm',
        'default_to': 'cm',
        'info_title': 'Как работает конвертер длины?',
        'info_text': 'Конвертер длины переводит значения между метрическими, британскими и морскими единицами. Он подходит для расчётов в быту, строительстве, доставке, учебных задачах и технических проектах.',
        'note': 'Для точных инженерных расчётов всегда проверяйте исходные единицы измерения в документации.',
        'units': [
            {'key': 'mm', 'title': 'Миллиметр', 'short': 'мм', 'factor': 0.001},
            {'key': 'cm', 'title': 'Сантиметр', 'short': 'см', 'factor': 0.01},
            {'key': 'm', 'title': 'Метр', 'short': 'м', 'factor': 1},
            {'key': 'km', 'title': 'Километр', 'short': 'км', 'factor': 1000},
            {'key': 'in', 'title': 'Дюйм', 'short': 'in', 'factor': 0.0254},
            {'key': 'ft', 'title': 'Фут', 'short': 'ft', 'factor': 0.3048},
            {'key': 'yd', 'title': 'Ярд', 'short': 'yd', 'factor': 0.9144},
            {'key': 'mi', 'title': 'Миля', 'short': 'mi', 'factor': 1609.344},
            {'key': 'nmi', 'title': 'Морская миля', 'short': 'nmi', 'factor': 1852},
        ],
    },

    'weight-converter': {
        'type': 'weight',
        'title': 'Конвертер веса',
        'label': 'Вес и масса',
        'base_unit': 'Килограмм',
        'default_from': 'kg',
        'default_to': 'g',
        'info_title': 'Как работает конвертер веса?',
        'info_text': 'Конвертер веса переводит значения между миллиграммами, граммами, килограммами, тоннами, унциями, фунтами и стоунами. Технически корректнее говорить “масса”, но в быту чаще используют слово “вес”.',
        'note': 'Фунты, унции и стоуны часто встречаются в зарубежных характеристиках товаров и доставке.',
        'units': [
            {'key': 'mg', 'title': 'Миллиграмм', 'short': 'мг', 'factor': 0.000001},
            {'key': 'g', 'title': 'Грамм', 'short': 'г', 'factor': 0.001},
            {'key': 'kg', 'title': 'Килограмм', 'short': 'кг', 'factor': 1},
            {'key': 't', 'title': 'Тонна', 'short': 'т', 'factor': 1000},
            {'key': 'oz', 'title': 'Унция', 'short': 'oz', 'factor': 0.028349523125},
            {'key': 'lb', 'title': 'Фунт', 'short': 'lb', 'factor': 0.45359237},
            {'key': 'st', 'title': 'Стоун', 'short': 'st', 'factor': 6.35029318},
        ],
    },

    'temperature-converter': {
        'type': 'temperature',
        'title': 'Конвертер температуры',
        'label': 'Температура',
        'base_unit': 'Градус Цельсия',
        'default_from': 'c',
        'default_to': 'f',
        'info_title': 'Как работает конвертер температуры?',
        'info_text': 'Конвертер температуры переводит значения между градусами Цельсия, Фаренгейта и Кельвинами. В отличие от большинства единиц, температура переводится не простым умножением, а формулой со смещением.',
        'note': 'Кельвин не использует знак градуса. 0 K — абсолютный ноль.',
        'units': [
            {'key': 'c', 'title': 'Градус Цельсия', 'short': '°C'},
            {'key': 'f', 'title': 'Градус Фаренгейта', 'short': '°F'},
            {'key': 'k', 'title': 'Кельвин', 'short': 'K'},
        ],
    },

    'area-converter': {
        'type': 'area',
        'title': 'Конвертер площади',
        'label': 'Площадь',
        'base_unit': 'Квадратный метр',
        'default_from': 'm2',
        'default_to': 'ha',
        'info_title': 'Как работает конвертер площади?',
        'info_text': 'Конвертер площади помогает переводить квадратные единицы, гектары и акры. Он полезен для недвижимости, земельных участков, ремонта, строительства и учебных расчётов.',
        'note': 'Площадь растёт квадратично: 1 м² — это не 100 см², а 10 000 см².',
        'units': [
            {'key': 'mm2', 'title': 'Квадратный миллиметр', 'short': 'мм²', 'factor': 0.000001},
            {'key': 'cm2', 'title': 'Квадратный сантиметр', 'short': 'см²', 'factor': 0.0001},
            {'key': 'm2', 'title': 'Квадратный метр', 'short': 'м²', 'factor': 1},
            {'key': 'km2', 'title': 'Квадратный километр', 'short': 'км²', 'factor': 1000000},
            {'key': 'ha', 'title': 'Гектар', 'short': 'га', 'factor': 10000},
            {'key': 'acre', 'title': 'Акр', 'short': 'acre', 'factor': 4046.8564224},
            {'key': 'ft2', 'title': 'Квадратный фут', 'short': 'ft²', 'factor': 0.09290304},
            {'key': 'yd2', 'title': 'Квадратный ярд', 'short': 'yd²', 'factor': 0.83612736},
            {'key': 'mi2', 'title': 'Квадратная миля', 'short': 'mi²', 'factor': 2589988.110336},
        ],
    },

    'volume-converter': {
        'type': 'volume',
        'title': 'Конвертер объёма',
        'label': 'Объём',
        'base_unit': 'Литр',
        'default_from': 'l',
        'default_to': 'ml',
        'info_title': 'Как работает конвертер объёма?',
        'info_text': 'Конвертер объёма переводит жидкостные и кубические единицы: миллилитры, литры, кубические метры, галлоны, пинты, кварты и чашки.',
        'note': 'Американские бытовые единицы вроде cup, pint и gallon отличаются от метрических единиц.',
        'units': [
            {'key': 'ml', 'title': 'Миллилитр', 'short': 'мл', 'factor': 0.001},
            {'key': 'l', 'title': 'Литр', 'short': 'л', 'factor': 1},
            {'key': 'cm3', 'title': 'Кубический сантиметр', 'short': 'см³', 'factor': 0.001},
            {'key': 'm3', 'title': 'Кубический метр', 'short': 'м³', 'factor': 1000},
            {'key': 'tsp', 'title': 'Чайная ложка США', 'short': 'tsp', 'factor': 0.00492892159},
            {'key': 'tbsp', 'title': 'Столовая ложка США', 'short': 'tbsp', 'factor': 0.0147867648},
            {'key': 'cup', 'title': 'Чашка США', 'short': 'cup', 'factor': 0.2365882365},
            {'key': 'floz', 'title': 'Жидкая унция США', 'short': 'fl oz', 'factor': 0.0295735295625},
            {'key': 'pint', 'title': 'Пинта США', 'short': 'pt', 'factor': 0.473176473},
            {'key': 'quart', 'title': 'Кварта США', 'short': 'qt', 'factor': 0.946352946},
            {'key': 'gallon', 'title': 'Галлон США', 'short': 'gal', 'factor': 3.785411784},
        ],
    },

    'speed-converter': {
        'type': 'speed',
        'title': 'Конвертер скорости',
        'label': 'Скорость',
        'base_unit': 'Метр в секунду',
        'default_from': 'kmh',
        'default_to': 'mps',
        'info_title': 'Как работает конвертер скорости?',
        'info_text': 'Конвертер скорости переводит значения между метрами в секунду, километрами в час, милями в час, футами в секунду и узлами.',
        'note': 'Узлы часто используются в авиации, навигации и морской тематике.',
        'units': [
            {'key': 'mps', 'title': 'Метр в секунду', 'short': 'м/с', 'factor': 1},
            {'key': 'kmh', 'title': 'Километр в час', 'short': 'км/ч', 'factor': 0.2777777777777778},
            {'key': 'mph', 'title': 'Миля в час', 'short': 'mph', 'factor': 0.44704},
            {'key': 'fps', 'title': 'Фут в секунду', 'short': 'ft/s', 'factor': 0.3048},
            {'key': 'knot', 'title': 'Узел', 'short': 'kn', 'factor': 0.5144444444444445},
        ],
    },

    'pressure-converter': {
        'type': 'pressure',
        'title': 'Конвертер давления',
        'label': 'Давление',
        'base_unit': 'Паскаль',
        'default_from': 'bar',
        'default_to': 'pa',
        'info_title': 'Как работает конвертер давления?',
        'info_text': 'Конвертер давления переводит паскали, килопаскали, мегапаскали, бары, атмосферы, миллиметры ртутного столба и PSI.',
        'note': 'PSI часто встречается в автомобильных шинах и зарубежной технической документации.',
        'units': [
            {'key': 'pa', 'title': 'Паскаль', 'short': 'Па', 'factor': 1},
            {'key': 'kpa', 'title': 'Килопаскаль', 'short': 'кПа', 'factor': 1000},
            {'key': 'mpa', 'title': 'Мегапаскаль', 'short': 'МПа', 'factor': 1000000},
            {'key': 'bar', 'title': 'Бар', 'short': 'bar', 'factor': 100000},
            {'key': 'mbar', 'title': 'Миллибар', 'short': 'mbar', 'factor': 100},
            {'key': 'atm', 'title': 'Атмосфера', 'short': 'atm', 'factor': 101325},
            {'key': 'mmhg', 'title': 'Миллиметр ртутного столба', 'short': 'мм рт. ст.', 'factor': 133.322387415},
            {'key': 'psi', 'title': 'Фунт на квадратный дюйм', 'short': 'psi', 'factor': 6894.757293168},
        ],
    },

    'energy-converter': {
        'type': 'energy',
        'title': 'Конвертер энергии',
        'label': 'Энергия',
        'base_unit': 'Джоуль',
        'default_from': 'kwh',
        'default_to': 'j',
        'info_title': 'Как работает конвертер энергии?',
        'info_text': 'Конвертер энергии переводит джоули, килоджоули, калории, килокалории, ватт-часы, киловатт-часы и BTU.',
        'note': 'Киловатт-часы часто используются в электроэнергии, а килокалории — в питании.',
        'units': [
            {'key': 'j', 'title': 'Джоуль', 'short': 'Дж', 'factor': 1},
            {'key': 'kj', 'title': 'Килоджоуль', 'short': 'кДж', 'factor': 1000},
            {'key': 'wh', 'title': 'Ватт-час', 'short': 'Вт⋅ч', 'factor': 3600},
            {'key': 'kwh', 'title': 'Киловатт-час', 'short': 'кВт⋅ч', 'factor': 3600000},
            {'key': 'cal', 'title': 'Калория', 'short': 'cal', 'factor': 4.184},
            {'key': 'kcal', 'title': 'Килокалория', 'short': 'kcal', 'factor': 4184},
            {'key': 'btu', 'title': 'BTU', 'short': 'BTU', 'factor': 1055.05585262},
            {'key': 'ev', 'title': 'Электронвольт', 'short': 'eV', 'factor': 1.602176634e-19},
        ],
    },

    'power-converter': {
        'type': 'power',
        'title': 'Конвертер мощности',
        'label': 'Мощность',
        'base_unit': 'Ватт',
        'default_from': 'kw',
        'default_to': 'hp_metric',
        'info_title': 'Как работает конвертер мощности?',
        'info_text': 'Конвертер мощности переводит ватты, киловатты, мегаватты, лошадиные силы и BTU в час.',
        'note': 'Лошадиные силы могут отличаться по стандарту. В инструменте есть метрическая и механическая hp.',
        'units': [
            {'key': 'w', 'title': 'Ватт', 'short': 'Вт', 'factor': 1},
            {'key': 'kw', 'title': 'Киловатт', 'short': 'кВт', 'factor': 1000},
            {'key': 'mw', 'title': 'Мегаватт', 'short': 'МВт', 'factor': 1000000},
            {'key': 'hp_metric', 'title': 'Лошадиная сила метрическая', 'short': 'л.с.', 'factor': 735.49875},
            {'key': 'hp_mech', 'title': 'Лошадиная сила механическая', 'short': 'hp', 'factor': 745.699872},
            {'key': 'btu_h', 'title': 'BTU в час', 'short': 'BTU/h', 'factor': 0.29307107},
        ],
    },

    'time-converter': {
        'type': 'time',
        'title': 'Конвертер времени',
        'label': 'Время',
        'base_unit': 'Секунда',
        'default_from': 'hour',
        'default_to': 'minute',
        'info_title': 'Как работает конвертер времени?',
        'info_text': 'Конвертер времени переводит длительность между миллисекундами, секундами, минутами, часами, днями, неделями, месяцами и годами.',
        'note': 'Месяц и год в этом конвертере считаются усреднённо, поэтому для календарных дат лучше использовать отдельный календарный расчёт.',
        'units': [
            {'key': 'ns', 'title': 'Наносекунда', 'short': 'нс', 'factor': 0.000000001},
            {'key': 'us', 'title': 'Микросекунда', 'short': 'мкс', 'factor': 0.000001},
            {'key': 'ms', 'title': 'Миллисекунда', 'short': 'мс', 'factor': 0.001},
            {'key': 's', 'title': 'Секунда', 'short': 'с', 'factor': 1},
            {'key': 'minute', 'title': 'Минута', 'short': 'мин', 'factor': 60},
            {'key': 'hour', 'title': 'Час', 'short': 'ч', 'factor': 3600},
            {'key': 'day', 'title': 'День', 'short': 'дн', 'factor': 86400},
            {'key': 'week', 'title': 'Неделя', 'short': 'нед', 'factor': 604800},
            {'key': 'month', 'title': 'Месяц средний', 'short': 'мес', 'factor': 2629800},
            {'key': 'year', 'title': 'Год средний', 'short': 'год', 'factor': 31557600},
        ],
    },
}


UNIT_CONVERTER_SLUGS = tuple(UNIT_CONVERTER_CONFIGS.keys())


def unit_converter(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug__in=UNIT_CONVERTER_SLUGS,
            is_published=True
        )

    converter_config = UNIT_CONVERTER_CONFIGS.get(page.slug)

    if converter_config is None:
        converter_config = UNIT_CONVERTER_CONFIGS['length-converter']

    context = {
        'page': page,
        'converter_config': converter_config,
    }

    return render(
        request,
        'tools/converters/unit_converter.html',
        context
    )