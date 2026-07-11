document.addEventListener('DOMContentLoaded', function () {
    const initialAmountInput = document.getElementById('compoundInitialAmount');
    const rateInput = document.getElementById('compoundRate');
    const termInput = document.getElementById('compoundTerm');
    const termUnitSelect = document.getElementById('compoundTermUnit');
    const frequencySelect = document.getElementById('compoundFrequency');
    const monthlyContributionInput = document.getElementById('compoundMonthlyContribution');
    const contributionTimingSelect = document.getElementById('compoundContributionTiming');

    const calculateButton = document.getElementById('compoundCalculate');
    const resetButton = document.getElementById('compoundReset');
    const copyScheduleButton = document.getElementById('compoundCopySchedule');

    const messageBox = document.getElementById('compoundMessage');
    const finalAmountBox = document.getElementById('compoundFinalAmount');
    const resultNoteBox = document.getElementById('compoundResultNote');

    const initialResultBox = document.getElementById('compoundInitialResult');
    const contributionsResultBox = document.getElementById('compoundContributionsResult');
    const interestResultBox = document.getElementById('compoundInterestResult');
    const monthsResultBox = document.getElementById('compoundMonthsResult');
    const effectiveRateResultBox = document.getElementById('compoundEffectiveRateResult');
    const investedResultBox = document.getElementById('compoundInvestedResult');
    const scheduleBody = document.getElementById('compoundScheduleBody');

    let currentSchedule = [];

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

    function formatNumber(value) {
        return Number(value).toLocaleString('ru-RU');
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
        messageBox.classList.remove('compound-message_error', 'compound-message_success');

        if (type === 'error') {
            messageBox.classList.add('compound-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('compound-message_success');
        }
    }

    function getMonths(term, unit) {
        if (unit === 'years') {
            return Math.round(term * 12);
        }

        return Math.round(term);
    }

    function getFrequencyLabel(frequency) {
        if (frequency === 365) {
            return 'ежедневной капитализацией';
        }

        if (frequency === 12) {
            return 'ежемесячной капитализацией';
        }

        if (frequency === 4) {
            return 'ежеквартальной капитализацией';
        }

        return 'ежегодной капитализацией';
    }

    function validateData(initialAmount, annualRate, months, monthlyContribution) {
        if (initialAmount === null || initialAmount < 0) {
            return 'Введите корректную начальную сумму.';
        }

        if (annualRate === null || annualRate < 0) {
            return 'Введите корректную процентную ставку.';
        }

        if (!months || months <= 0) {
            return 'Введите корректный срок.';
        }

        if (months > 1200) {
            return 'Срок слишком большой. Максимум — 1200 месяцев.';
        }

        if (monthlyContribution === null || monthlyContribution < 0) {
            return 'Введите корректную сумму ежемесячного пополнения.';
        }

        if (initialAmount === 0 && monthlyContribution === 0) {
            return 'Введите начальную сумму или ежемесячное пополнение.';
        }

        return '';
    }

    function calculateCompoundInterest() {
        const initialAmount = parseNumber(initialAmountInput.value);
        const annualRate = parseNumber(rateInput.value);
        const term = parseNumber(termInput.value);
        const months = getMonths(term, termUnitSelect.value);
        const frequency = Number(frequencySelect.value);
        const monthlyContribution = parseNumber(monthlyContributionInput.value);
        const contributionTiming = contributionTimingSelect.value;

        const error = validateData(initialAmount, annualRate, months, monthlyContribution);

        if (error) {
            setMessage(error, 'error');
            return;
        }

        const annualRateDecimal = annualRate / 100;
        const monthlyEffectiveRate = Math.pow(1 + annualRateDecimal / frequency, frequency / 12) - 1;
        const effectiveAnnualRate = (Math.pow(1 + annualRateDecimal / frequency, frequency) - 1) * 100;

        let balance = initialAmount;
        let totalContributions = 0;
        let totalInterest = 0;
        const schedule = [];

        for (let month = 1; month <= months; month += 1) {
            const startBalance = balance;
            let contribution = monthlyContribution;

            if (contributionTiming === 'beginning') {
                balance += contribution;
                totalContributions += contribution;
            }

            const interest = balance * monthlyEffectiveRate;
            balance += interest;
            totalInterest += interest;

            if (contributionTiming === 'end') {
                balance += contribution;
                totalContributions += contribution;
            }

            schedule.push({
                month,
                startBalance,
                contribution,
                interest,
                endBalance: balance
            });
        }

        const invested = initialAmount + totalContributions;

        currentSchedule = schedule;

        finalAmountBox.textContent = formatMoney(balance);
        initialResultBox.textContent = formatMoney(initialAmount);
        contributionsResultBox.textContent = formatMoney(totalContributions);
        interestResultBox.textContent = formatMoney(totalInterest);
        monthsResultBox.textContent = `${formatNumber(months)} мес.`;
        effectiveRateResultBox.textContent = formatPercent(effectiveAnnualRate);
        investedResultBox.textContent = formatMoney(invested);

        resultNoteBox.textContent = `Расчёт выполнен с ${getFrequencyLabel(frequency)}.`;

        renderSchedule(schedule);
        setMessage('Расчёт выполнен.', 'success');
    }

    function renderSchedule(schedule) {
        if (!schedule.length) {
            scheduleBody.innerHTML = '<tr><td colspan="5">Введите данные и выполните расчёт.</td></tr>';
            return;
        }

        scheduleBody.innerHTML = schedule.map(function (row) {
            return `
                <tr>
                    <td>${row.month}</td>
                    <td>${formatMoney(row.startBalance)}</td>
                    <td>${formatMoney(row.contribution)}</td>
                    <td>${formatMoney(row.interest)}</td>
                    <td>${formatMoney(row.endBalance)}</td>
                </tr>
            `;
        }).join('');
    }

    function resetCalculator() {
        initialAmountInput.value = '100000';
        rateInput.value = '15';
        termInput.value = '5';
        termUnitSelect.value = 'years';
        frequencySelect.value = '12';
        monthlyContributionInput.value = '10000';
        contributionTimingSelect.value = 'beginning';

        calculateCompoundInterest();
    }

    function copySchedule() {
        if (!currentSchedule.length) {
            setMessage('Нет графика для копирования.', 'error');
            return;
        }

        const header = 'Месяц\tБаланс на начало\tПополнение\tПроценты\tБаланс на конец';

        const rows = currentSchedule.map(function (row) {
            return [
                row.month,
                formatMoney(row.startBalance),
                formatMoney(row.contribution),
                formatMoney(row.interest),
                formatMoney(row.endBalance)
            ].join('\t');
        });

        const text = [header].concat(rows).join('\n');

        navigator.clipboard.writeText(text).then(function () {
            setMessage('График роста капитала скопирован.', 'success');
        }).catch(function () {
            setMessage('Не удалось скопировать график.', 'error');
        });
    }

    calculateButton.addEventListener('click', calculateCompoundInterest);
    resetButton.addEventListener('click', resetCalculator);
    copyScheduleButton.addEventListener('click', copySchedule);

    [
        initialAmountInput,
        rateInput,
        termInput,
        termUnitSelect,
        frequencySelect,
        monthlyContributionInput,
        contributionTimingSelect
    ].forEach(function (element) {
        element.addEventListener('input', calculateCompoundInterest);
        element.addEventListener('change', calculateCompoundInterest);
    });

    calculateCompoundInterest();
});