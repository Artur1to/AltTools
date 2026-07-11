document.addEventListener('DOMContentLoaded', function () {
    const amountInput = document.getElementById('incomeTaxAmount');
    const periodSelect = document.getElementById('incomeTaxPeriod');
    const incomeBeforeInput = document.getElementById('incomeTaxBefore');
    const deductionInput = document.getElementById('incomeTaxDeduction');
    const withheldInput = document.getElementById('incomeTaxWithheld');

    const resetButton = document.getElementById('incomeTaxReset');
    const copyButton = document.getElementById('incomeTaxCopyResult');

    const messageBox = document.getElementById('incomeTaxMessage');
    const taxResultBox = document.getElementById('incomeTaxResult');
    const resultNoteBox = document.getElementById('incomeTaxResultNote');

    const grossResultBox = document.getElementById('incomeTaxGrossResult');
    const baseResultBox = document.getElementById('incomeTaxBaseResult');
    const netResultBox = document.getElementById('incomeTaxNetResult');
    const effectiveRateResultBox = document.getElementById('incomeTaxEffectiveRateResult');
    const yearAfterResultBox = document.getElementById('incomeTaxYearAfterResult');
    const payableResultBox = document.getElementById('incomeTaxPayableResult');

    const breakdownBody = document.getElementById('incomeTaxBreakdownBody');
    const exampleButtons = document.querySelectorAll('#incomeTaxExamples button');

    const BRACKETS = [
        {
            from: 0,
            to: 2400000,
            rate: 13
        },
        {
            from: 2400000,
            to: 5000000,
            rate: 15
        },
        {
            from: 5000000,
            to: 20000000,
            rate: 18
        },
        {
            from: 20000000,
            to: 50000000,
            rate: 20
        },
        {
            from: 50000000,
            to: Infinity,
            rate: 22
        }
    ];

    let currentResult = null;

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
        messageBox.classList.remove(
            'income-tax-message_error',
            'income-tax-message_success'
        );

        if (type === 'error') {
            messageBox.classList.add('income-tax-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('income-tax-message_success');
        }
    }

    function clearResults() {
        currentResult = null;

        taxResultBox.textContent = '—';
        grossResultBox.textContent = '—';
        baseResultBox.textContent = '—';
        netResultBox.textContent = '—';
        effectiveRateResultBox.textContent = '—';
        yearAfterResultBox.textContent = '—';
        payableResultBox.textContent = '—';
        resultNoteBox.textContent = 'Введите данные для расчёта.';

        breakdownBody.innerHTML = '<tr><td colspan="3">Введите данные для расчёта.</td></tr>';
    }

    function calculateTaxForBase(base) {
        let tax = 0;

        BRACKETS.forEach(function (bracket) {
            const taxablePart = Math.max(
                0,
                Math.min(base, bracket.to) - bracket.from
            );

            if (taxablePart > 0) {
                tax += taxablePart * bracket.rate / 100;
            }
        });

        return tax;
    }

    function getBreakdown(previousBase, currentBase) {
        const rows = [];

        BRACKETS.forEach(function (bracket) {
            const start = Math.max(previousBase, bracket.from);
            const end = Math.min(previousBase + currentBase, bracket.to);
            const taxablePart = Math.max(0, end - start);

            if (taxablePart > 0) {
                rows.push({
                    rate: bracket.rate,
                    taxablePart,
                    tax: taxablePart * bracket.rate / 100
                });
            }
        });

        return rows;
    }

    function renderBreakdown(rows) {
        if (!rows.length) {
            breakdownBody.innerHTML = '<tr><td colspan="3">Нет налоговой базы для расчёта.</td></tr>';
            return;
        }

        breakdownBody.innerHTML = rows.map(function (row) {
            return `
                <tr>
                    <td>${formatPercent(row.rate)}</td>
                    <td>${formatMoney(row.taxablePart)}</td>
                    <td>${formatMoney(row.tax)}</td>
                </tr>
            `;
        }).join('');
    }

    function calculateIncomeTax() {
        const income = parseNumber(amountInput.value);
        const incomeBefore = parseNumber(incomeBeforeInput.value) ?? 0;
        const deduction = parseNumber(deductionInput.value) ?? 0;
        const withheld = parseNumber(withheldInput.value) ?? 0;
        const period = periodSelect.value;

        if (income === null || income < 0) {
            clearResults();
            setMessage('Введите корректную сумму дохода.', 'error');
            return;
        }

        if (incomeBefore < 0) {
            clearResults();
            setMessage('Введите корректный доход с начала года.', 'error');
            return;
        }

        if (deduction < 0) {
            clearResults();
            setMessage('Введите корректную сумму вычетов.', 'error');
            return;
        }

        if (withheld < 0) {
            clearResults();
            setMessage('Введите корректную сумму уже удержанного НДФЛ.', 'error');
            return;
        }

        const currentTaxBase = Math.max(0, income - deduction);
        const previousTaxBase = period === 'year' ? 0 : incomeBefore;
        const totalTaxBaseAfter = previousTaxBase + currentTaxBase;

        const taxBefore = calculateTaxForBase(previousTaxBase);
        const taxAfter = calculateTaxForBase(totalTaxBaseAfter);
        const currentTax = Math.max(0, taxAfter - taxBefore);

        const netIncome = income - currentTax;
        const payable = Math.max(0, currentTax - withheld);
        const overpaid = Math.max(0, withheld - currentTax);
        const effectiveRate = income > 0 ? currentTax / income * 100 : 0;

        const breakdownRows = getBreakdown(previousTaxBase, currentTaxBase);

        currentResult = {
            income,
            incomeBefore: previousTaxBase,
            deduction,
            currentTaxBase,
            totalTaxBaseAfter,
            currentTax,
            netIncome,
            withheld,
            payable,
            overpaid,
            effectiveRate,
            breakdownRows
        };

        taxResultBox.textContent = formatMoney(currentTax);
        grossResultBox.textContent = formatMoney(income);
        baseResultBox.textContent = formatMoney(currentTaxBase);
        netResultBox.textContent = formatMoney(netIncome);
        effectiveRateResultBox.textContent = formatPercent(effectiveRate);
        yearAfterResultBox.textContent = formatMoney(totalTaxBaseAfter);
        payableResultBox.textContent = overpaid > 0
            ? `переплата ${formatMoney(overpaid)}`
            : formatMoney(payable);

        if (period === 'year') {
            resultNoteBox.textContent = 'Расчёт выполнен как для годового дохода.';
        } else {
            resultNoteBox.textContent = 'Расчёт выполнен с учётом дохода с начала года до этой выплаты.';
        }

        renderBreakdown(breakdownRows);
        setMessage('Расчёт выполнен.', 'success');
    }

    function resetCalculator() {
        amountInput.value = '200000';
        periodSelect.value = 'payment';
        incomeBeforeInput.value = '0';
        deductionInput.value = '0';
        withheldInput.value = '0';

        calculateIncomeTax();
    }

    function copyResult() {
        if (!currentResult) {
            setMessage('Нет результата для копирования.', 'error');
            return;
        }

        const lines = [
            'Калькулятор НДФЛ',
            `Доход до налога: ${formatMoney(currentResult.income)}`,
            `Доход с начала года до расчёта: ${formatMoney(currentResult.incomeBefore)}`,
            `Вычеты: ${formatMoney(currentResult.deduction)}`,
            `Налоговая база: ${formatMoney(currentResult.currentTaxBase)}`,
            `НДФЛ: ${formatMoney(currentResult.currentTax)}`,
            `Сумма на руки: ${formatMoney(currentResult.netIncome)}`,
            `Эффективная ставка: ${formatPercent(currentResult.effectiveRate)}`,
            `Уже удержано: ${formatMoney(currentResult.withheld)}`,
            `К доплате: ${formatMoney(currentResult.payable)}`,
            `Переплата: ${formatMoney(currentResult.overpaid)}`
        ];

        navigator.clipboard.writeText(lines.join('\n')).then(function () {
            setMessage('Результат скопирован.', 'success');
        }).catch(function () {
            setMessage('Не удалось скопировать результат.', 'error');
        });
    }

    [
        amountInput,
        periodSelect,
        incomeBeforeInput,
        deductionInput,
        withheldInput
    ].forEach(function (element) {
        element.addEventListener('input', calculateIncomeTax);
        element.addEventListener('change', calculateIncomeTax);
    });

    resetButton.addEventListener('click', resetCalculator);
    copyButton.addEventListener('click', copyResult);

    exampleButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            amountInput.value = button.dataset.income;
            calculateIncomeTax();
        });
    });

    calculateIncomeTax();
});