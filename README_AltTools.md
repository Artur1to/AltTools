# AltTools

AltTools — Django-сайт с онлайн-инструментами: калькуляторами, конвертерами, генераторами и утилитами для повседневных задач, SEO-трафика и монетизации через рекламные сети.

Проект сделан как каталог отдельных инструментов. Каждый инструмент имеет свою страницу, SEO-метаданные, отдельный HTML-шаблон, CSS и JS. Основная логика большинства инструментов работает на фронтенде через JavaScript, а Django отвечает за страницы, маршрутизацию, категории, SEO-структуру, шаблоны и админку.

---

## 1. Основная идея проекта

Цель проекта — собрать большой сайт онлайн-инструментов, который может получать поисковый трафик по низко- и среднечастотным запросам.

Примеры запросов:

- кредитный калькулятор онлайн;
- калькулятор НДС;
- калькулятор УСН;
- калькулятор зарплаты на руки;
- калькулятор калорий;
- конвертер длины;
- генератор QR-кода;
- генератор UUID;
- анализ текста онлайн;
- Base64 декодер онлайн.

Проект должен быть простым, быстрым, понятным пользователю и удобным для дальнейшего расширения.

---

## 2. Технологический стек

Основной стек:

- Python
- Django
- PostgreSQL
- HTML
- CSS
- JavaScript
- Nginx
- Gunicorn
- Certbot / Let's Encrypt
- Яндекс.Метрика

Локальная разработка:

- Windows
- PyCharm
- PostgreSQL локально
- виртуальное окружение `.venv`

Продакшен:

- VPS на Ubuntu
- Django + Gunicorn
- Nginx как reverse proxy
- PostgreSQL на сервере
- SSL-сертификат через Certbot

---

## 3. Структура проекта

Примерная структура:

```text
AltTools/
├── .venv/
└── alttools/
    ├── alttools/
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── asgi.py
    │
    ├── templates/
    │   ├── base.html
    │   └── 404.html
    │
    ├── tools/
    │   ├── models.py
    │   ├── views.py
    │   ├── urls.py
    │   ├── context_processors.py
    │   │
    │   ├── tool_views/
    │   │   ├── __init__.py
    │   │   ├── finance.py
    │   │   ├── health.py
    │   │   ├── math_tools.py
    │   │   ├── converters.py
    │   │   ├── generators.py
    │   │   ├── it.py
    │   │   └── text.py
    │   │
    │   ├── templates/tools/
    │   │   ├── finance/
    │   │   ├── health/
    │   │   ├── math/
    │   │   ├── converters/
    │   │   ├── generators/
    │   │   ├── it/
    │   │   └── text/
    │   │
    │   └── static/tools/
    │       ├── css/
    │       ├── js/
    │       └── images/
    │
    ├── manage.py
    ├── requirements.txt
    ├── .env
    └── .gitignore
```

---

## 4. Главные Django-модели

В проекте используются две ключевые модели:

### ToolCategory

Категория инструментов.

Примеры категорий:

- Финансы
- Математика
- Конвертеры величин
- IT, веб и разработка
- Работа с текстом
- Генераторы
- Здоровье

Основные поля:

- `title` — название категории;
- `slug` — URL категории;
- `description` — описание;
- `icon` — иконка;
- `sort_order` — порядок сортировки;
- `is_published` — опубликована ли категория.

### ToolPage

Страница конкретного инструмента.

Основные поля:

- `category` — связь с категорией;
- `title` — название инструмента;
- `slug` — URL инструмента;
- `h1` — заголовок H1;
- `short_description` — краткое описание;
- `icon` — иконка;
- `section` — раздел внутри категории;
- `badge` — короткая метка;
- `meta_title` — SEO title;
- `meta_description` — SEO description;
- `robots` — robots meta;
- `related_tools` — похожие инструменты;
- `is_popular` — популярный инструмент;
- `is_published` — опубликован ли инструмент;
- `sort_order` — сортировка.

---

## 5. URL-структура

Основные URL:

```text
/                         главная
/tools/                   все инструменты
/tools/<category_slug>/   категория
/tools/<category_slug>/<tool_slug>/   конкретный инструмент
/about/                   о сайте
/contacts/                контакты
/privacy/                 политика конфиденциальности
```

Примеры:

```text
/tools/finance/loan-calculator/
/tools/finance/mortgage-calculator/
/tools/finance/vat-calculator/
/tools/health/daily-calorie-calculator/
/tools/math/percent-calculator/
/tools/unit-converters/length-converter/
/tools/it-web-development/base64-converter/
/tools/text/text-analyzer/
```

---

## 6. Главная маршрутизация инструментов

В `tools/views.py` используется словарь `TOOL_HANDLERS`.

Пример:

```python
TOOL_HANDLERS = {
    'loan-calculator': loan_calculator,
    'mortgage-calculator': mortgage_calculator,
    'deposit-calculator': deposit_calculator,
    'compound-interest-calculator': compound_interest_calculator,
    'vat-calculator': vat_calculator,
    'usn-calculator': usn_calculator,
    'self-employed-tax-calculator': self_employed_tax_calculator,
    'income-tax-calculator': income_tax_calculator,
    'salary-net-calculator': salary_net_calculator,

    'bmi-calculator': bmi_calculator,
    'daily-calorie-calculator': daily_calorie_calculator,

    'percent-calculator': percent_calculator,
    'median-calculator': median_calculator,

    'base64-converter': base64_converter,
    'url-encoder-decoder': url_encoder_decoder,
    'jwt-encoder-decoder': jwt_encoder_decoder,
    'hash-generator': hash_generator,
    'regex-tester': regex_tester,
    'css-formatter': css_formatter,
    'javascript-formatter': javascript_formatter,

    'fish-text-generator': fish_text_generator,
    'text-analyzer': text_analyzer,

    'qr-code-generator': qr_code_generator,
    'random-number-generator': random_number_generator,
    'uuid-generator': uuid_generator,
    'phone-number-generator': phone_number_generator,
    'random-date-generator': random_date_generator,
}
```

Если пользователь открывает страницу инструмента, Django ищет `ToolPage` в базе, затем по `slug` находит функцию в `TOOL_HANDLERS`.

Если handler найден — отрисовывается индивидуальная страница инструмента. Если handler не найден — можно показать общий шаблон `tool_detail.html`.

---

## 7. Как добавить новый инструмент

### Шаг 1. Добавить запись в БД

Нужно создать или обновить `ToolPage`.

Пример SQL:

```sql
INSERT INTO tools_toolpage (
    category_id,
    title,
    slug,
    h1,
    short_description,
    icon,
    section,
    badge,
    meta_title,
    meta_description,
    robots,
    is_popular,
    is_published,
    sort_order,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM tools_toolcategory WHERE slug = 'finance'),
    'Название инструмента',
    'tool-slug',
    'H1 инструмента',
    'Краткое описание инструмента.',
    '₽',
    'Раздел',
    'Бейдж',
    'SEO Title',
    'SEO Description',
    'index, follow',
    TRUE,
    TRUE,
    100,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    title = EXCLUDED.title,
    h1 = EXCLUDED.h1,
    short_description = EXCLUDED.short_description,
    icon = EXCLUDED.icon,
    section = EXCLUDED.section,
    badge = EXCLUDED.badge,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    robots = EXCLUDED.robots,
    is_popular = EXCLUDED.is_popular,
    is_published = EXCLUDED.is_published,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();
```

### Шаг 2. Создать view

Например в `tools/tool_views/finance.py`:

```python
def example_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='example-calculator',
            is_published=True
        )

    return render(
        request,
        'tools/finance/example_calculator.html',
        {
            'page': page,
        }
    )
```

### Шаг 3. Подключить view в `tools/views.py`

```python
from .tool_views.finance import example_calculator
```

В `TOOL_HANDLERS`:

```python
'example-calculator': example_calculator,
```

### Шаг 4. Создать HTML

```text
tools/templates/tools/finance/example_calculator.html
```

### Шаг 5. Создать CSS

```text
tools/static/tools/css/example_calculator.css
```

### Шаг 6. Создать JS

```text
tools/static/tools/js/example_calculator.js
```

---

## 8. Правила оформления инструментов

Каждый инструмент должен иметь:

- H1;
- короткое описание;
- форму / сам инструмент;
- блок результата;
- пояснение, как работает расчёт;
- формулы, если они реально полезны;
- таблицы или примеры, если они дают SEO и пользу;
- нормальный `meta_title`;
- нормальный `meta_description`;
- адаптивную верстку;
- понятные кнопки;
- отсутствие лишней воды.

Не нужно добавлять:

- мусорный FAQ с очевидными вопросами;
- кнопку «Конвертировать», если результат обновляется автоматически;
- скачивание TXT/JSON там, где оно не нужно;
- фразы вроде «данные не отправляются на сервер» в каждом простом калькуляторе;
- лишние декоративные элементы, которые не помогают пользователю.

---

## 9. Общий дизайн страниц инструментов

Стиль страниц сделан в единой структуре:

```text
*-page
*-hero
*-hero__content
*-hero__card
*-tool
*-columns
*-panel
*-panel__head
*-form
*-result
*-stats
*-info
*-rules
```

Пример для калькулятора калорий:

```text
calorie-page
calorie-hero
calorie-tool
calorie-columns
calorie-panel
calorie-result
calorie-info
```

Пример для финансового инструмента:

```text
vat-page
vat-hero
vat-tool
vat-columns
vat-panel
vat-result
vat-info
```

---

## 10. SEO

### Canonical и OG URL

Canonical должен формироваться централизованно через `base.html`.

В `settings.py`:

```python
SITE_URL = os.getenv('SITE_URL', 'http://127.0.0.1:8000').rstrip('/')
```

В `.env` на продакшене:

```env
SITE_URL=https://alttools.ru
```

В `tools/context_processors.py`:

```python
from django.conf import settings


def yandex_metrica(request):
    site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    current_path = getattr(request, 'path', '/') or '/'

    return {
        'YANDEX_METRICA_ID': getattr(settings, 'YANDEX_METRICA_ID', ''),
        'SITE_URL': site_url,
        'CANONICAL_URL': f'{site_url}{current_path}',
    }
```

В `base.html`:

```django
<meta property="og:url" content="{{ CANONICAL_URL }}">
<link rel="canonical" href="{{ CANONICAL_URL }}">
```

В дочерних шаблонах не нужно прописывать:

```django
{% block canonical %}
{% block og_url %}
```

Если такие блоки остались со старым `example.com`, они не должны использоваться после исправления `base.html`, но лучше удалить их для чистоты.

---

## 11. Robots.txt и Sitemap

Для SEO нужно иметь:

```text
/robots.txt
/sitemap.xml
```

Пример `robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://alttools.ru/sitemap.xml
```

В sitemap должны попадать:

- главная;
- страница всех инструментов;
- категории;
- опубликованные инструменты;
- информационные страницы.

---

## 12. Яндекс.Метрика и cookies

Метрика подключается через `cookies.js`.

Важно:

- Метрика может запускаться сразу при загрузке страницы.
- Cookie banner только информирует пользователя.
- Кнопка «Понятно» скрывает баннер.
- Вебвизор лучше держать выключенным.

В `cookies.js`:

```javascript
ym(counterId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false
});
```

Причина: на сайте много полей ввода — JWT, Base64, текст, калькуляторы. Вебвизор может записывать лишние данные.

---

## 13. Безопасность

В продакшене:

```env
DJANGO_DEBUG=False
```

Обязательно настроить:

```env
DJANGO_SECRET_KEY=сложный_секретный_ключ
DJANGO_ALLOWED_HOSTS=alttools.ru,www.alttools.ru
DJANGO_CSRF_TRUSTED_ORIGINS=https://alttools.ru,https://www.alttools.ru
SITE_URL=https://alttools.ru
```

Нельзя коммитить:

- `.env`;
- пароли;
- секретные ключи;
- дампы базы;
- логи;
- `.venv`;
- `staticfiles`;
- приватные файлы.

---

## 14. `.env` пример

```env
DJANGO_SECRET_KEY=replace_me
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost

DJANGO_CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000

DB_ENGINE=django.db.backends.postgresql
DB_NAME=AltTools_db
DB_USER=postgres
DB_PASSWORD=replace_me
DB_HOST=localhost
DB_PORT=5432

SITE_URL=http://127.0.0.1:8000

YANDEX_METRICA_ID=0

EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=
```

---

## 15. `.gitignore`

```gitignore
.env
.env.local
.env.production

*.sqlite3
*.log
logs/

__pycache__/
*.pyc

.venv/
venv/
env/

.vscode/
.idea/

media/
staticfiles/
static_root/

.DS_Store
Thumbs.db
```

---

## 16. Локальный запуск

Перейти в папку, где лежит `manage.py`:

```powershell
cd C:\Users\artur\PycharmProjects\AltTools\alttools
```

Создать виртуальное окружение:

```powershell
py -m venv ..\.venv
```

Активировать:

```powershell
..\.venv\Scripts\Activate.ps1
```

Установить зависимости:

```powershell
pip install -r requirements.txt
```

Проверить проект:

```powershell
python manage.py check
```

Применить миграции:

```powershell
python manage.py migrate
```

Создать суперпользователя:

```powershell
python manage.py createsuperuser
```

Запустить сервер:

```powershell
python manage.py runserver
```

Открыть:

```text
http://127.0.0.1:8000/
```

---

## 17. Проверка перед коммитом

Перед каждым коммитом:

```powershell
python manage.py check
python manage.py runserver
```

Проверить вручную:

- главную;
- `/tools/`;
- несколько категорий;
- несколько инструментов;
- 404-страницу;
- static-файлы;
- favicon;
- canonical;
- og:url;
- формы инструментов.

Коммит:

```powershell
git add .
git commit -m "Update project"
git push
```

---

## 18. Деплой на VPS

Продакшен-схема:

```text
Пользователь
↓
Nginx
↓
Gunicorn
↓
Django
↓
PostgreSQL
```

На сервере обычно используется такая структура:

```text
/var/www/alttools/
├── repo/
├── venv/
├── logs/
└── backups/
```

Основные шаги:

1. Купить домен.
2. Купить VPS на Ubuntu.
3. Направить DNS A-записи домена на IP сервера.
4. Подключиться по SSH.
5. Обновить сервер.
6. Установить Python, PostgreSQL, Nginx, Git.
7. Создать пользователя для проекта.
8. Склонировать репозиторий.
9. Создать `.env` на сервере.
10. Создать базу PostgreSQL.
11. Установить зависимости.
12. Выполнить миграции.
13. Собрать статику.
14. Настроить Gunicorn systemd service.
15. Настроить Nginx.
16. Получить SSL через Certbot.
17. Проверить `DEBUG=False`.
18. Настроить бэкапы.
19. Подключить Метрику.
20. Проверить sitemap, robots, canonical.

---

## 19. Gunicorn systemd пример

```ini
[Unit]
Description=AltTools Gunicorn daemon
After=network.target

[Service]
User=alttools
Group=www-data
WorkingDirectory=/var/www/alttools/repo
EnvironmentFile=/var/www/alttools/repo/.env
ExecStart=/var/www/alttools/venv/bin/gunicorn alttools.wsgi:application \
    --bind unix:/run/alttools.sock \
    --workers 3

[Install]
WantedBy=multi-user.target
```

Команды:

```bash
sudo systemctl daemon-reload
sudo systemctl enable alttools
sudo systemctl start alttools
sudo systemctl status alttools
```

---

## 20. Nginx пример

```nginx
server {
    listen 80;
    server_name alttools.ru www.alttools.ru;

    location /static/ {
        alias /var/www/alttools/repo/staticfiles/;
    }

    location /media/ {
        alias /var/www/alttools/repo/media/;
    }

    location / {
        proxy_pass http://unix:/run/alttools.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Проверка:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

SSL:

```bash
sudo certbot --nginx -d alttools.ru -d www.alttools.ru
```

---

## 21. Бэкапы

Минимально нужно бэкапить:

- PostgreSQL;
- `.env`;
- загруженные медиафайлы, если появятся;
- репозиторий уже хранится в Git.

Пример бэкапа PostgreSQL:

```bash
pg_dump -U alttools_user AltTools_db > /var/www/alttools/backups/alttools_$(date +%F).sql
```

---

## 22. Текущие категории и инструменты

### Финансы

- Кредитный калькулятор
- Ипотечный калькулятор
- Калькулятор вкладов
- Калькулятор сложного процента
- Калькулятор НДС
- Калькулятор УСН
- Калькулятор налога самозанятого
- Калькулятор НДФЛ
- Калькулятор зарплаты на руки

### Здоровье

- Калькулятор ИМТ
- Калькулятор суточной нормы калорий

### Математика

- Калькулятор процентов
- Калькулятор медианы

### Конвертеры величин

- Конвертер длины
- Конвертер веса
- Конвертер температуры
- Конвертер площади
- Конвертер объёма
- Конвертер скорости
- Конвертер давления
- Конвертер энергии
- Конвертер мощности
- Конвертер времени

### IT, веб и разработка

- Base64 конвертер
- URL encoder / decoder
- JWT encoder / decoder
- Генератор хэшей
- Regex tester
- CSS formatter
- JavaScript formatter

### Работа с текстом

- РыбаТекст генератор
- Анализ текста

### Генераторы

- Генератор QR-кода
- Генератор случайных чисел
- Генератор UUID
- Генератор телефонных номеров
- Генератор случайных дат

---

## 23. Что стоит доделать

Перед полноценным релизом желательно проверить:

- canonical и `og:url`;
- отсутствие `example.com`;
- рабочий sitemap;
- рабочий robots.txt;
- реальные ссылки в футере;
- мобильную версию;
- отсутствие 404 по static;
- `DEBUG=False`;
- красивую 404;
- favicon;
- Метрику;
- скорость загрузки;
- уникальность title и description;
- перелинковку похожих инструментов;
- страницы категорий;
- бэкапы.

---

## 24. Стиль разработки

Проект лучше развивать постепенно:

1. Добавлять новые инструменты группами.
2. Не усложнять backend без необходимости.
3. Расчёты по возможности делать в JS.
4. Данные из банков и внешних API подключать только там, где это реально нужно.
5. Не парсить сайты банков без необходимости.
6. Не добавлять бесполезные функции.
7. Не делать мусорные FAQ.
8. Проверять каждый инструмент вручную.
9. Следить за SEO и скоростью.
10. После каждого крупного изменения делать git commit.

---

## 25. Промт для нейросетей, чтобы быстро вникнуть в проект

Скопируй этот промт и отправь другой нейросети, если нужно продолжить разработку AltTools.

```text
Ты работаешь с проектом AltTools.

AltTools — Django-сайт онлайн-инструментов: калькуляторы, конвертеры, генераторы, IT-утилиты, инструменты для текста и здоровья. Цель проекта — SEO-трафик по страницам отдельных инструментов и дальнейшая монетизация через рекламные сети.

Технический стек:
- Python
- Django
- PostgreSQL
- HTML
- CSS
- JavaScript
- Nginx
- Gunicorn
- Certbot
- Яндекс.Метрика

Проект работает как каталог инструментов. В базе есть модели ToolCategory и ToolPage. ToolCategory хранит категории, ToolPage хранит страницы инструментов с SEO-метаданными. Конкретная страница инструмента открывается через URL вида:

/tools/<category_slug>/<tool_slug>/

В tools/views.py есть словарь TOOL_HANDLERS, где slug инструмента связан с Python-view функцией. View получает page и рендерит индивидуальный шаблон инструмента.

Структура:
- tools/models.py — модели ToolCategory и ToolPage
- tools/views.py — главные страницы, категории, tool_detail и TOOL_HANDLERS
- tools/tool_views/ — отдельные view по группам:
  - finance.py
  - health.py
  - math_tools.py
  - converters.py
  - generators.py
  - it.py
  - text.py
- tools/templates/tools/ — HTML-шаблоны инструментов
- tools/static/tools/css/ — CSS инструментов
- tools/static/tools/js/ — JS инструментов
- templates/base.html — базовый шаблон
- tools/context_processors.py — Метрика, SITE_URL, CANONICAL_URL

Важное правило SEO:
canonical и og:url должны формироваться централизованно в base.html через CANONICAL_URL, а не прописываться вручную в каждом инструменте. В дочерних шаблонах не нужно использовать block canonical и block og_url, особенно с example.com.

Правильная логика:
settings.py:
SITE_URL = os.getenv('SITE_URL', 'http://127.0.0.1:8000').rstrip('/')

context_processors.py:
CANONICAL_URL = SITE_URL + request.path

base.html:
<meta property="og:url" content="{{ CANONICAL_URL }}">
<link rel="canonical" href="{{ CANONICAL_URL }}">

Стиль страниц:
Каждый инструмент обычно имеет:
- breadcrumbs
- hero-блок
- H1
- short_description
- карточку справа
- основной блок инструмента
- форму
- блок результата
- поясняющие SEO-блоки снизу
- отдельный CSS
- отдельный JS

Классы обычно строятся по префиксу инструмента:
- vat-page
- vat-hero
- vat-tool
- vat-panel
- vat-result
- vat-info

Для нового инструмента нужно:
1. Добавить ToolPage в БД через SQL.
2. Создать view в нужном файле tools/tool_views/.
3. Импортировать view в tools/views.py.
4. Добавить slug в TOOL_HANDLERS.
5. Создать HTML-шаблон.
6. Создать CSS.
7. Создать JS.
8. Проверить python manage.py check.
9. Проверить страницу в браузере.
10. Сделать git commit.

Текущие категории:
- finance
- health
- math
- unit-converters
- it-web-development
- text
- generators

Финансовые инструменты:
- loan-calculator
- mortgage-calculator
- deposit-calculator
- compound-interest-calculator
- vat-calculator
- usn-calculator
- self-employed-tax-calculator
- income-tax-calculator
- salary-net-calculator

Здоровье:
- bmi-calculator
- daily-calorie-calculator

Математика:
- percent-calculator
- median-calculator

Конвертеры величин:
- length-converter
- weight-converter
- temperature-converter
- area-converter
- volume-converter
- speed-converter
- pressure-converter
- energy-converter
- power-converter
- time-converter

IT:
- base64-converter
- url-encoder-decoder
- jwt-encoder-decoder
- hash-generator
- regex-tester
- css-formatter
- javascript-formatter

Текст:
- fish-text-generator
- text-analyzer

Генераторы:
- qr-code-generator
- random-number-generator
- uuid-generator
- phone-number-generator
- random-date-generator

Стиль ответа пользователю:
- Писать по-русски.
- Давать готовый код файлами.
- Не лить много теории.
- Если нужно изменить файл — писать «замени файл целиком» или «добавь этот блок».
- Для новых инструментов давать SQL, view, подключение в TOOL_HANDLERS, HTML, CSS, JS и проверку.
- Не добавлять мусорные FAQ.
- Не добавлять кнопку «Конвертировать» там, где результат обновляется автоматически.
- Не добавлять скачивание TXT/JSON без смысла.
- Не писать в каждом инструменте «данные не отправляются на сервер».
- Делать дизайн единым, современным, аккуратным и адаптивным.

Перед ответом всегда учитывай, что проект уже большой, поэтому лучше не ломать существующую структуру. Если предлагаешь изменение архитектуры, оно должно быть безопасным и поэтапным.
```
