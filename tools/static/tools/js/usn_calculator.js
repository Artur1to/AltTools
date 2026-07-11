document.addEventListener('DOMContentLoaded', function () {
    const objectSelect = document.getElementById('usnObject');
    const periodSelect = document.getElementById('usnPeriod');

    const incomeInput = document.getElementById('usnIncome');
    const expensesInput = document.getElementById('usnExpenses');
    const rateInput = document.getElementById('usnRate');
    const advancesPaidInput = document.getElementById('usnAdvancesPaid');
    const taxpayerTypeSelect = document.getElementById('usnTaxpayerType');
    const insuranceInput = document.getElementById('usnInsurance');

    const expensesWrap = document.getElementById('usnExpensesWrap');
    const taxpayerWrap = document.getElementById('usnTaxpayerWrap');
    const insuranceWrap = document.getElementById('usnInsuranceWrap');

    const resetButton = document.getElementById('usnReset');
    const copyButton = document.getElementById('usnCopyResult');

    const messageBox = document.getElementById('usnMessage');
    const payableResultBox = document.getElementById('usnPayableResult');
    const resultNoteBox = document.getElementById('usnResultNote');

    const baseResultBox = document.getElementById('usnBaseResult');
    const taxBeforeResultBox = document.getElementById('usnTaxBeforeResult');
    const reductionResultBox = document.getElementById('usnReductionResult');
    const minTaxResultBox = document.getElementById('usnMinTaxResult');
    const advancesResultBox = document.getElementById('usnAdvancesResult');
    const finalTaxResultBox = document.getElementById('usnFinalTaxResult');

    const reductionStat = document.getElementById('usnReductionStat');
    const minTaxStat = document.getElementById('usnMinTaxStat');

    const exampleButtons = document.querySelectorAll('#usnExamples button');

    let currentResult = null;
    let previousObject = objectSelect.value;

    function parseNumber(value) {
        const normalized = String(value)
            .replace(/\s/g, '')
            .replace(',', '.')
            .trim();

        if (!normalized) {
            return null;
        }

        const number = Number(normalized);

        if (!Number.isFinite(number)) {
            return null;
        }

        return number;
    }

    function formatMoney(value) {
        if (!Number.isFinite(value)) {
            return '—';
        }

        return Number(value.toFixed(2)).toLocaleString('ru-RU', {
            maximumFractionDigits: 2
        }) + ' ₽';
    }

    function formatPercent(value) {
        if (!Number.isFinite(value)) {
            return '—';
        }

        return Number(value.toFixed(2)).toLocaleString('ru-RU', {
            maximumFractionDigits: 2
        }) + '%';
    }

    function setMessage(text, type) {
        messageBox.textContent = text;
        messageBox.classList.remove('usn-message_error', 'usn-message_success');

        if (type === 'error') {
            messageBox.classList.add('usn-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('usn-message_success');
        }
    }

    function clearResults() {
        currentResult = null;

        payableResultBox.textContent = '—';
        baseResultBox.textContent = '—';
        taxBeforeResultBox.textContent = '—';
        reductionResultBox.textContent = '—';
        minTaxResultBox.textContent = '—';
        advancesResultBox.textContent = '—';
        finalTaxResultBox.textContent = '—';
        resultNoteBox.textContent = 'Введите данные для расчёта.';
    }

    function updateVisibility() {
        const objectType = objectSelect.value;

        if (objectType === 'income') {
            expensesWrap.classList.add('usn-field_hidden');
            taxpayerWrap.classList.remove('usn-field_hidden');
            insuranceWrap.classList.remove('usn-field_hidden');

            reductionStat.classList.remove('usn-stat_hidden');
            minTaxStat.classList.add('usn-stat_hidden');
        } else {
            expensesWrap.classList.remove('usn-field_hidden');
            taxpayerWrap.classList.add('usn-field_hidden');
            insuranceWrap.classList.add('usn-field_hidden');

            reductionStat.classList.add('usn-stat_hidden');
            minTaxStat.classList.remove('usn-stat_hidden');
        }
    }

    function updateRateOnObjectChange() {
        const currentObject = objectSelect.value;

        if (currentObject !== previousObject) {
            if (currentObject === 'income') {
                rateInput.value = '6';
            } else {
                rateInput.value = '15';
            }

            previousObject = currentObject;
        }
    }

    function calculateIncomeUsn(income, rate, advancesPaid, insurance, taxpayerType) {
        const taxBefore = income * rate / 100;

        const maxReduction = taxpayerType === 'ip_no_employees'
            ? taxBefore
            : taxBefore * 0.5;

        const reduction = Math.min(insurance, maxReduction);
        const finalTax = Math.max(0, taxBefore - reduction);
        const payable = Math.max(0, finalTax - advancesPaid);

        return {
            objectType: 'income',
            income,
            expenses: 0,
            rate,
            base: income,
            taxBefore,
            reduction,
            minTax: 0,
            finalTax,
            advancesPaid,
            payable,
            note: taxpayerType === 'ip_no_employees'
                ? 'УСН «Доходы»: налог уменьшен на страховые взносы без ограничения до суммы налога.'
                : 'УСН «Доходы»: уменьшение на взносы ограничено 50% от исчисленного налога.'
        };
    }

    function calculateIncomeExpensesUsn(income, expenses, rate, advancesPaid, period) {
        const base = Math.max(0, income - expenses);
        const calculatedTax = base * rate / 100;

        let minTax = 0;
        let finalTax = calculatedTax;
        let note = 'УСН «Доходы минус расходы»: налог рассчитан с разницы между доходами и расходами.';

        if (period === 'year') {
            minTax = income * 0.01;
            finalTax = Math.max(calculatedTax, minTax);

            if (minTax > calculatedTax) {
                note = 'По итогам года сработал минимальный налог 1% от доходов.';
            } else {
                note = 'Обычный налог больше минимального, поэтому применяется расчёт с базы «доходы минус расходы».';
            }
        } else {
            note = 'Для авансового периода минимальный налог не применяется. Минимальный налог проверяется по итогам года.';
        }

        const payable = Math.max(0, finalTax - advancesPaid);

        return {
            objectType: 'income_expenses',
            income,
            expenses,
            rate,
            base,
            taxBefore: calculatedTax,
            reduction: 0,
            minTax,
            finalTax,
            advancesPaid,
            payable,
            note
        };
    }

    function calculateUsn() {
        updateRateOnObjectChange();
        updateVisibility();

        const objectType = objectSelect.value;
        const period = periodSelect.value;

        const income = parseNumber(incomeInput.value);
        const expenses = parseNumber(expensesInput.value) ?? 0;
        const rate = parseNumber(rateInput.value);
        const advancesPaid = parseNumber(advancesPaidInput.value) ?? 0;
        const insurance = parseNumber(insuranceInput.value) ?? 0;
        const taxpayerType = taxpayerTypeSelect.value;

        if (income === null || income < 0) {
            clearResults();
            setMessage('Введите корректную сумму доходов.', 'error');
            return;
        }

        if (rate === null || rate < 0) {
            clearResults();
            setMessage('Введите корректную налоговую ставку.', 'error');
            return;
        }

        if (expenses < 0) {
            clearResults();
            setMessage('Введите корректную сумму расходов.', 'error');
            return;
        }

        if (advancesPaid < 0) {
            clearResults();
            setMessage('Введите корректную сумму уплаченных авансов.', 'error');
            return;
        }

        if (insurance < 0) {
            clearResults();
            setMessage('Введите корректную сумму страховых взносов.', 'error');
            return;
        }

        const result = objectType === 'income'
            ? calculateIncomeUsn(income, rate, advancesPaid, insurance, taxpayerType)
            : calculateIncomeExpensesUsn(income, expenses, rate, advancesPaid, period);

        currentResult = result;

        payableResultBox.textContent = formatMoney(result.payable);
        baseResultBox.textContent = formatMoney(result.base);
        taxBeforeResultBox.textContent = formatMoney(result.taxBefore);
        reductionResultBox.textContent = formatMoney(result.reduction);
        minTaxResultBox.textContent = result.objectType === 'income_expenses'
            ? formatMoney(result.minTax)
            : '—';
        advancesResultBox.textContent = formatMoney(result.advancesPaid);
        finalTaxResultBox.textContent = formatMoney(result.finalTax);
        resultNoteBox.textContent = result.note;

        setMessage('Расчёт выполнен.', 'success');
    }

    function resetCalculator() {
        objectSelect.value = 'income';
        periodSelect.value = 'year';

        incomeInput.value = '3000000';
        expensesInput.value = '1800000';
        rateInput.value = '6';
        advancesPaidInput.value = '0';
        taxpayerTypeSelect.value = 'ip_no_employees';
        insuranceInput.value = '50000';

        previousObject = 'income';

        calculateUsn();
    }

    function copyResult() {
        if (!currentResult) {
            setMessage('Нет результата для копирования.', 'error');
            return;
        }

        const objectText = currentResult.objectType === 'income'
            ? 'УСН Доходы'
            : 'УСН Доходы минус расходы';

        const lines = [
            'Калькулятор УСН',
            `Объект: ${objectText}`,
            `Доходы: ${formatMoney(currentResult.income)}`,
            `Расходы: ${formatMoney(currentResult.expenses)}`,
            `Ставка: ${formatPercent(currentResult.rate)}`,
            `Налоговая база: ${formatMoney(currentResult.base)}`,
            `Налог до уменьшения: ${formatMoney(currentResult.taxBefore)}`,
            `Уменьшение на взносы: ${formatMoney(currentResult.reduction)}`,
            `Минимальный налог: ${formatMoney(currentResult.minTax)}`,
            `Итоговый налог: ${formatMoney(currentResult.finalTax)}`,
            `Уплаченные авансы: ${formatMoney(currentResult.advancesPaid)}`,
            `К уплате: ${formatMoney(currentResult.payable)}`
        ];

        navigator.clipboard.writeText(lines.join('\n')).then(function () {
            setMessage('Результат скопирован.', 'success');
        }).catch(function () {
            setMessage('Не удалось скопировать результат.', 'error');
        });
    }

    [
        objectSelect,
        periodSelect,
        incomeInput,
        expensesInput,
        rateInput,
        advancesPaidInput,
        taxpayerTypeSelect,
        insuranceInput
    ].forEach(function (element) {
        element.addEventListener('input', calculateUsn);
        element.addEventListener('change', calculateUsn);
    });

    resetButton.addEventListener('click', resetCalculator);
    copyButton.addEventListener('click', copyResult);

    exampleButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            incomeInput.value = button.dataset.income;
            calculateUsn();
        });
    });

    calculateUsn();
});