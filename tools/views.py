from collections import OrderedDict

from django.db.models import Q, Count
from django.shortcuts import render, get_object_or_404

from .models import ToolCategory, ToolPage

from .tool_views.generators import (
    qr_code_generator,
    random_number_generator,
    uuid_generator,
    phone_number_generator,
    random_date_generator,
)

from .tool_views.text import (
    fish_text_generator,
)

from .tool_views.it import (
    base64_converter,
    url_encoder_decoder,
    jwt_encoder_decoder,
    hash_generator,
    regex_tester,
    css_formatter,
    javascript_formatter,
)

from .tool_views.health import (
    bmi_calculator,
)

from .tool_views.converters import (
    unit_converter,
    UNIT_CONVERTER_SLUGS,
)


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


TOOL_HANDLERS = {
    'qr-code-generator': qr_code_generator,
    'random-number-generator': random_number_generator,
    'uuid-generator': uuid_generator,
    'phone-number-generator': phone_number_generator,
    'random-date-generator': random_date_generator,

    'fish-text-generator': fish_text_generator,

    'base64-converter': base64_converter,
    'url-encoder-decoder': url_encoder_decoder,
    'jwt-encoder-decoder': jwt_encoder_decoder,
    'hash-generator': hash_generator,
    'regex-tester': regex_tester,
    'css-formatter': css_formatter,
    'javascript-formatter': javascript_formatter,

    'bmi-calculator': bmi_calculator,
}

for converter_slug in UNIT_CONVERTER_SLUGS:
    TOOL_HANDLERS[converter_slug] = unit_converter

def tool_detail(request, category_slug, tool_slug):
    page = get_object_or_404(
        ToolPage.objects.select_related('category'),
        slug=tool_slug,
        category__slug=category_slug,
        is_published=True,
        category__is_published=True,
    )

    handler = TOOL_HANDLERS.get(page.slug)

    if handler:
        return handler(request, page=page)

    return render(request, 'tools/tool_detail.html', {'page': page})