document.addEventListener('DOMContentLoaded', function () {
    const modeSelect = document.getElementById('salaryMode');
    const amountInput = document.getElementById('salaryAmount');
    const amountLabel = document.getElementById('salaryAmountLabel');
    const incomeBeforeInput = document.getElementById('salaryIncomeBefore');
    const deductionInput = document.getElementById('salaryDeduction');
    const withheldInput = document.getElementById('salaryWithheld');
    const roundSelect = document.getElementById('salaryRound');

    const resetButton = document.getElementById('salaryReset');
    const copyButton = document.getElementById('salaryCopyResult');

    const messageBox = document.getElementById('salaryMessage');
    const netResultBox = document.getElementById('salaryNetResult');
    const resultNoteBox = document.getElementById('salaryResultNote');

    const grossResultBox = document.getElementById('salaryGrossResult');
    const baseResultBox = document.getElementById('salaryBaseResult');
    const taxResultBox = document.getElementById('salaryTaxResult');
    const payableTaxResultBox = document.getElementById('salaryPayableTaxResult');
    const yearAfterResultBox = document.getElementById('salaryYearAfterResult');
    const effectiveRateResultBox = document.getElementById('salaryEffectiveRateResult');

    const breakdownBody = document.getElementById('salaryBreakdownBody');
    const exampleButtons = document.querySelectorAll('#salaryExamples button');

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

    function roundValue(value) {
        if (roundSelect.value === 'rubles') {
            return Math.round(value);
        }

        return Math.round(value * 100) / 100;
    }

    function formatMoney(value) {
        if (!Number.isFinite(value)) {
            return '—';
        }

        const rounded = roundValue(value);

        return Number(rounded).toLocaleString('ru-RU', {
            maximumFractionDigits: roundSelect.value === 'rubles' ? 0 : 2
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
            'salary-message_error',
            'salary-message_success'
        );

        if (type === 'error') {
            messageBox.classList.add('salary-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('salary-message_success');
        }
    }

    function clearResults() {
        currentResult = null;

        netResultBox.textContent = '—';
        grossResultBox.textContent = '—';
        baseResultBox.textContent = '—';
        taxResultBox.textContent = '—';
        payableTaxResultBox.textContent = '—';
        yearAfterResultBox.textContent = '—';
        effectiveRateResultBox.textContent = '—';
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

    function calculateFromGross(gross, incomeBefore, deduction, withheld) {
        const currentBase = Math.max(0, gross - deduction);
        const previousBase = incomeBefore;
        const totalBaseAfter = previousBase + currentBase;

        const taxBefore = calculateTaxForBase(previousBase);
        const taxAfter = calculateTaxForBase(totalBaseAfter);
        const tax = Math.max(0, taxAfter - taxBefore);
        const payableTax = Math.max(0, tax - withheld);
        const overpaid = Math.max(0, withheld - tax);
        const net = gross - payableTax;
        const effectiveRate = gross > 0 ? tax / gross * 100 : 0;

        return {
            gross,
            net,
            currentBase,
            previousBase,
            totalBaseAfter,
            tax,
            payableTax,
            overpaid,
            withheld,
            deduction,
            effectiveRate,
            breakdownRows: getBreakdown(previousBase, currentBase)
        };
    }

    function findGrossByNet(targetNet, incomeBefore, deduction, withheld) {
        let low = 0;
        let high = targetNet * 2 + deduction + 100000;

        for (let i = 0; i < 80; i += 1) {
            const mid = (low + high) / 2;
            const result = calculateFromGross(mid, incomeBefore, deduction, withheld);

            if (result.net < targetNet) {
                low = mid;
            } else {
                high = mid;
            }
        }

        return calculateFromGross(high, incomeBefore, deduction, withheld);
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

    function updateModeLabel() {
        if (modeSelect.value === 'gross_to_net') {
            amountLabel.textContent = 'Начисленная зарплата до НДФЛ';
        } else {
            amountLabel.textContent = 'Желаемая зарплата на руки';
        }
    }

    function calculateSalary() {
        updateModeLabel();

        const amount = parseNumber(amountInput.value);
        const incomeBefore = parseNumber(incomeBeforeInput.value) ?? 0;
        const deduction = parseNumber(deductionInput.value) ?? 0;
        const withheld = parseNumber(withheldInput.value) ?? 0;

        if (amount === null || amount < 0) {
            clearResults();
            setMessage('Введите корректную сумму зарплаты.', 'error');
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

        const result = modeSelect.value === 'gross_to_net'
            ? calculateFromGross(amount, incomeBefore, deduction, withheld)
            : findGrossByNet(amount, incomeBefore, deduction, withheld);

        currentResult = result;

        netResultBox.textContent = formatMoney(result.net);
        grossResultBox.textContent = formatMoney(result.gross);
        baseResultBox.textContent = formatMoney(result.currentBase);
        taxResultBox.textContent = formatMoney(result.tax);

        if (result.overpaid > 0) {
            payableTaxResultBox.textContent = `переплата ${formatMoney(result.overpaid)}`;
        } else {
            payableTaxResultBox.textContent = formatMoney(result.payableTax);
        }

        yearAfterResultBox.textContent = formatMoney(result.totalBaseAfter);
        effectiveRateResultBox.textContent = formatPercent(result.effectiveRate);

        if (modeSelect.value === 'gross_to_net') {
            resultNoteBox.textContent = 'Расчёт выполнен от начисленной зарплаты до суммы на руки.';
        } else {
            resultNoteBox.textContent = 'Начисленная зарплата подобрана по желаемой сумме на руки.';
        }

        renderBreakdown(result.breakdownRows);
        setMessage('Расчёт выполнен.', 'success');
    }

    function resetCalculator() {
        modeSelect.value = 'gross_to_net';
        amountInput.value = '100000';
        incomeBeforeInput.value = '0';
        deductionInput.value = '0';
        withheldInput.value = '0';
        roundSelect.value = 'kopecks';

        calculateSalary();
    }

    function copyResult() {
        if (!currentResult) {
            setMessage('Нет результата для копирования.', 'error');
            return;
        }

        const lines = [
            'Калькулятор зарплаты на руки',
            `Начисленная зарплата: ${formatMoney(currentResult.gross)}`,
            `Вычеты: ${formatMoney(currentResult.deduction)}`,
            `Налоговая база: ${formatMoney(currentResult.currentBase)}`,
            `НДФЛ с выплаты: ${formatMoney(currentResult.tax)}`,
            `К удержанию после учёта удержанного: ${formatMoney(currentResult.payableTax)}`,
            `Зарплата на руки: ${formatMoney(currentResult.net)}`,
            `Доход с начала года после выплаты: ${formatMoney(currentResult.totalBaseAfter)}`,
            `Эффективная ставка: ${formatPercent(currentResult.effectiveRate)}`
        ];

        navigator.clipboard.writeText(lines.join('\n')).then(function () {
            setMessage('Результат скопирован.', 'success');
        }).catch(function () {
            setMessage('Не удалось скопировать результат.', 'error');
        });
    }

    [
        modeSelect,
        amountInput,
        incomeBeforeInput,
        deductionInput,
        withheldInput,
        roundSelect
    ].forEach(function (element) {
        element.addEventListener('input', calculateSalary);
        element.addEventListener('change', calculateSalary);
    });

    resetButton.addEventListener('click', resetCalculator);
    copyButton.addEventListener('click', copyResult);

    exampleButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            amountInput.value = button.dataset.salary;
            calculateSalary();
        });
    });

    calculateSalary();
});