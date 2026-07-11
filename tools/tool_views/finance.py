from django.shortcuts import render, get_object_or_404

from ..models import ToolPage


def loan_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='loan-calculator',
            is_published=True
        )

    return render(
        request,
        'tools/finance/loan_calculator.html',
        {
            'page': page,
        }
    )

def mortgage_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='mortgage-calculator',
            is_published=True
        )

    return render(
        request,
        'tools/finance/mortgage_calculator.html',
        {
            'page': page,
        }
    )

def deposit_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='deposit-calculator',
            is_published=True
        )

    return render(
        request,
        'tools/finance/deposit_calculator.html',
        {
            'page': page,
        }
    )

def compound_interest_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='compound-interest-calculator',
            is_published=True
        )

    return render(
        request,
        'tools/finance/compound_interest_calculator.html',
        {
            'page': page,
        }
    )

def vat_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='vat-calculator',
            is_published=True
        )

    return render(
        request,
        'tools/finance/vat_calculator.html',
        {
            'page': page,
        }
    )

def usn_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='usn-calculator',
            is_published=True
        )

    return render(
        request,
        'tools/finance/usn_calculator.html',
        {
            'page': page,
        }
    )

def self_employed_tax_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='self-employed-tax-calculator',
            is_published=True
        )

    return render(
        request,
        'tools/finance/self_employed_tax_calculator.html',
        {
            'page': page,
        }
    )