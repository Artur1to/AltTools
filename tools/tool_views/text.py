from random import SystemRandom

from django.shortcuts import render, get_object_or_404

from ..models import ToolPage

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

def text_analyzer(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='text-analyzer',
            is_published=True
        )

    return render(
        request,
        'tools/text/text_analyzer.html',
        {
            'page': page,
        }
    )