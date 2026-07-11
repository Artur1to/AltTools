document.addEventListener('DOMContentLoaded', function () {
    const incomeIndividualsInput = document.getElementById('npdIncomeIndividuals');
    const incomeCompaniesInput = document.getElementById('npdIncomeCompanies');
    const bonusLeftInput = document.getElementById('npdBonusLeft');
    const yearIncomeBeforeInput = document.getElementById('npdYearIncomeBefore');

    const resetButton = document.getElementById('npdReset');
    const copyButton = document.getElementById('npdCopyResult');

    const messageBox = document.getElementById('npdMessage');
    const taxPayableBox = document.getElementById('npdTaxPayable');
    const resultNoteBox = document.getElementById('npdResultNote');

    const totalIncomeBox = document.getElementById('npdTotalIncome');
    const taxBeforeBonusBox = document.getElementById('npdTaxBeforeBonus');
    const bonusUsedBox = document.getElementById('npdBonusUsed');
    const bonusRemainingBox = document.getElementById('npdBonusRemaining');
    const incomeAfterTaxBox = document.getElementById('npdIncomeAfterTax');
    const effectiveRateBox = document.getElementById('npdEffectiveRate');

    const breakdownBody = document.getElementById('npdBreakdownBody');
    const exampleButtons = document.querySelectorAll('#npdExamples button');

    const YEAR_LIMIT = 2400000;

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
            'npd-message_error',
            'npd-message_success',
            'npd-message_warning'
        );

        if (type === 'error') {
            messageBox.classList.add('npd-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('npd-message_success');
        }

        if (type === 'warning') {
            messageBox.classList.add('npd-message_warning');
        }
    }

    function clearResults() {
        currentResult = null;

        taxPayableBox.textContent = '—';
        totalIncomeBox.textContent = '—';
        taxBeforeBonusBox.textContent = '—';
        bonusUsedBox.textContent = '—';
        bonusRemainingBox.textContent = '—';
        incomeAfterTaxBox.textContent = '—';
        effectiveRateBox.textContent = '—';
        resultNoteBox.textContent = 'Введите данные для расчёта.';

        breakdownBody.innerHTML = '<tr><td colspan="6">Введите данные для расчёта.</td></tr>';
    }

    function calculateRow(title, income, rate, bonusRate, availableBonus) {
        const taxBeforeBonus = income * rate / 100;
        const possibleBonus = income * bonusRate / 100;
        const bonusUsed = Math.min(possibleBonus, availableBonus);
        const taxPayable = Math.max(0, taxBeforeBonus - bonusUsed);

        return {
            title,
            income,
            rate,
            bonusRate,
            taxBeforeBonus,
            possibleBonus,
            bonusUsed,
            taxPayable
        };
    }

    function renderBreakdown(rows) {
        breakdownBody.innerHTML = rows.map(function (row) {
            return `
                <tr>
                    <td>${row.title}</td>
                    <td>${formatMoney(row.income)}</td>
                    <td>${formatPercent(row.rate)}</td>
                    <td>${formatMoney(row.taxBeforeBonus)}</td>
                    <td>${formatMoney(row.bonusUsed)}</td>
                    <td>${formatMoney(row.taxPayable)}</td>
                </tr>
            `;
        }).join('');
    }

    function calculateNpd() {
        const incomeIndividuals = parseNumber(incomeIndividualsInput.value) ?? 0;
        const incomeCompanies = parseNumber(incomeCompaniesInput.value) ?? 0;
        const bonusLeft = parseNumber(bonusLeftInput.value) ?? 0;
        const yearIncomeBefore = parseNumber(yearIncomeBeforeInput.value) ?? 0;

        if (incomeIndividuals < 0) {
            clearResults();
            setMessage('Введите корректный доход от физических лиц.', 'error');
            return;
        }

        if (incomeCompanies < 0) {
            clearResults();
            setMessage('Введите корректный доход от ИП и юрлиц.', 'error');
            return;
        }

        if (bonusLeft < 0) {
            clearResults();
            setMessage('Введите корректный остаток налогового бонуса.', 'error');
            return;
        }

        if (yearIncomeBefore < 0) {
            clearResults();
            setMessage('Введите корректный доход с начала года.', 'error');
            return;
        }

        const totalIncome = incomeIndividuals + incomeCompanies;

        if (totalIncome <= 0) {
            clearResults();
            setMessage('Введите доход для расчёта налога.', 'error');
            return;
        }

        let availableBonus = Math.min(bonusLeft, 10000);

        const individualsRow = calculateRow(
            'Доход от физических лиц',
            incomeIndividuals,
            4,
            1,
            availableBonus
        );

        availableBonus -= individualsRow.bonusUsed;

        const companiesRow = calculateRow(
            'Доход от ИП и юрлиц',
            incomeCompanies,
            6,
            2,
            availableBonus
        );

        availableBonus -= companiesRow.bonusUsed;

        const rows = [individualsRow, companiesRow];

        const taxBeforeBonus = rows.reduce(function (sum, row) {
            return sum + row.taxBeforeBonus;
        }, 0);

        const bonusUsed = rows.reduce(function (sum, row) {
            return sum + row.bonusUsed;
        }, 0);

        const taxPayable = rows.reduce(function (sum, row) {
            return sum + row.taxPayable;
        }, 0);

        const bonusRemaining = Math.max(0, bonusLeft - bonusUsed);
        const incomeAfterTax = totalIncome - taxPayable;
        const effectiveRate = totalIncome > 0 ? taxPayable / totalIncome * 100 : 0;

        const yearIncomeAfter = yearIncomeBefore + totalIncome;
        const yearLimitLeft = YEAR_LIMIT - yearIncomeAfter;

        currentResult = {
            incomeIndividuals,
            incomeCompanies,
            totalIncome,
            taxBeforeBonus,
            bonusUsed,
            bonusRemaining,
            taxPayable,
            incomeAfterTax,
            effectiveRate,
            yearIncomeBefore,
            yearIncomeAfter,
            yearLimitLeft
        };

        taxPayableBox.textContent = formatMoney(taxPayable);
        totalIncomeBox.textContent = formatMoney(totalIncome);
        taxBeforeBonusBox.textContent = formatMoney(taxBeforeBonus);
        bonusUsedBox.textContent = formatMoney(bonusUsed);
        bonusRemainingBox.textContent = formatMoney(bonusRemaining);
        incomeAfterTaxBox.textContent = formatMoney(incomeAfterTax);
        effectiveRateBox.textContent = formatPercent(effectiveRate);

        renderBreakdown(rows);

        if (yearIncomeAfter > YEAR_LIMIT) {
            resultNoteBox.textContent = `Доход с начала года после этого расчёта: ${formatMoney(yearIncomeAfter)}. Лимит НПД превышен.`;
            setMessage('Внимание: годовой лимит НПД 2,4 млн ₽ превышен.', 'warning');
            return;
        }

        resultNoteBox.textContent = `До лимита НПД осталось: ${formatMoney(yearLimitLeft)}.`;
        setMessage('Расчёт выполнен.', 'success');
    }

    function resetCalculator() {
        incomeIndividualsInput.value = '50000';
        incomeCompaniesInput.value = '100000';
        bonusLeftInput.value = '10000';
        yearIncomeBeforeInput.value = '0';

        calculateNpd();
    }

    function copyResult() {
        if (!currentResult) {
            setMessage('Нет результата для копирования.', 'error');
            return;
        }

        const lines = [
            'Калькулятор налога самозанятого',
            `Доход от физических лиц: ${formatMoney(currentResult.incomeIndividuals)}`,
            `Доход от ИП и юрлиц: ${formatMoney(currentResult.incomeCompanies)}`,
            `Общий доход: ${formatMoney(currentResult.totalIncome)}`,
            `Налог до бонуса: ${formatMoney(currentResult.taxBeforeBonus)}`,
            `Бонус использован: ${formatMoney(currentResult.bonusUsed)}`,
            `Бонус останется: ${formatMoney(currentResult.bonusRemaining)}`,
            `Налог к уплате: ${formatMoney(currentResult.taxPayable)}`,
            `Доход после налога: ${formatMoney(currentResult.incomeAfterTax)}`,
            `Эффективная ставка: ${formatPercent(currentResult.effectiveRate)}`,
            `Доход с начала года после расчёта: ${formatMoney(currentResult.yearIncomeAfter)}`
        ];

        navigator.clipboard.writeText(lines.join('\n')).then(function () {
            setMessage('Результат скопирован.', 'success');
        }).catch(function () {
            setMessage('Не удалось скопировать результат.', 'error');
        });
    }

    [
        incomeIndividualsInput,
        incomeCompaniesInput,
        bonusLeftInput,
        yearIncomeBeforeInput
    ].forEach(function (element) {
        element.addEventListener('input', calculateNpd);
        element.addEventListener('change', calculateNpd);
    });

    resetButton.addEventListener('click', resetCalculator);
    copyButton.addEventListener('click', copyResult);

    exampleButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            incomeIndividualsInput.value = button.dataset.individuals;
            incomeCompaniesInput.value = button.dataset.companies;
            calculateNpd();
        });
    });

    calculateNpd();
});