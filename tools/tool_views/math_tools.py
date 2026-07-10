from django.shortcuts import render, get_object_or_404

from ..models import ToolPage


def percent_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='percent-calculator',
            is_published=True
        )

    context = {
        'page': page,
    }

    return render(
        request,
        'tools/math/percent_calculator.html',
        context
    )

def median_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='median-calculator',
            is_published=True
        )

    context = {
        'page': page,
    }

    return render(
        request,
        'tools/math/median_calculator.html',
        context
    )