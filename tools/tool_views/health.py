from django.shortcuts import render, get_object_or_404

from ..models import ToolPage

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

def daily_calorie_calculator(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='daily-calorie-calculator',
            is_published=True
        )

    return render(
        request,
        'tools/health/daily_calorie_calculator.html',
        {
            'page': page,
        }
    )