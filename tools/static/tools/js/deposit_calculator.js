document.addEventListener('DOMContentLoaded', function () {
    const amountInput = document.getElementById('depositAmount');
    const rateInput = document.getElementById('depositRate');
    const termInput = document.getElementById('depositTerm');
    const termUnitSelect = document.getElementById('depositTermUnit');
    const capitalizationSelect = document.getElementById('depositCapitalization');
    const topUpInput = document.getElementById('depositTopUp');
    const withdrawalInput = document.getElementById('depositWithdrawal');

    const calculateButton = document.getElementById('depositCalculate');
    const resetButton = document.getElementById('depositReset');
    const copyScheduleButton = document.getElementById('depositCopySchedule');

    const messageBox = document.getElementById('depositMessage');
    const finalAmountBox = document.getElementById('depositFinalAmount');
    const resultNoteBox = document.getElementById('depositResultNote');

    const initialResultBox = document.getElementById('depositInitialResult');
    const interestResultBox = document.getElementById('depositInterestResult');
    const topUpResultBox = document.getElementById('depositTopUpResult');
    const withdrawalResultBox = document.getElementById('depositWithdrawalResult');
    const monthsResultBox = document.getElementById('depositMonthsResult');
    const effectiveRateResultBox = document.getElementById('depositEffectiveRateResult');
    const scheduleBody = document.getElementById('depositScheduleBody');

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
        messageBox.classList.remove('deposit-message_error', 'deposit-message_success');

        if (type === 'error') {
            messageBox.classList.add('deposit-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('deposit-message_success');
        }
    }

    function getMonths(term, unit) {
        if (unit === 'years') {
            return Math.round(term * 12);
        }

        return Math.round(term);
    }

    function validateData(amount, rate, months, topUp, withdrawal) {
        if (amount === null || amount <= 0) {
            return 'Введите корректную начальную сумму вклада.';
        }

        if (rate === null || rate < 0) {
            return 'Введите корректную процентную ставку.';
        }

        if (!months || months <= 0) {
            return 'Введите корректный срок вклада.';
        }

        if (months > 600) {
            return 'Срок слишком большой. Максимум — 600 месяцев.';
        }

        if (topUp === null || topUp < 0) {
            return 'Введите корректную сумму пополнения.';
        }

        if (withdrawal === null || withdrawal < 0) {
            return 'Введите корректную сумму снятия.';
        }

        return '';
    }

    function calculateDeposit() {
        const initialAmount = parseNumber(amountInput.value);
        const annualRate = parseNumber(rateInput.value);
        const term = parseNumber(termInput.value);
        const months = getMonths(term, termUnitSelect.value);
        const capitalization = capitalizationSelect.value;
        const monthlyTopUp = parseNumber(topUpInput.value) ?? 0;
        const monthlyWithdrawal = parseNumber(withdrawalInput.value) ?? 0;

        const error = validateData(initialAmount, annualRate, months, monthlyTopUp, monthlyWithdrawal);

        if (error) {
            setMessage(error, 'error');
            return;
        }

        const monthlyRate = annualRate / 100 / 12;

        let balance = initialAmount;
        let totalInterest = 0;
        let totalTopUp = 0;
        let totalWithdrawal = 0;
        const schedule = [];

        for (let month = 1; month <= months; month += 1) {
            const startBalance = balance;

            let topUp = monthlyTopUp;
            let withdrawal = monthlyWithdrawal;

            balance += topUp;
            totalTopUp += topUp;

            if (withdrawal > balance) {
                setMessage('Сумма ежемесячного снятия превышает доступный баланс вклада.', 'error');
                return;
            }

            balance -= withdrawal;
            totalWithdrawal += withdrawal;

            const interest = balance * monthlyRate;
            totalInterest += interest;

            if (capitalization === 'monthly') {
                balance += interest;
            }

            const endBalance = capitalization === 'monthly'
                ? balance
                : balance + totalInterest;

            schedule.push({
                month,
                startBalance,
                topUp,
                withdrawal,
                interest,
                endBalance
            });
        }

        const finalAmount = capitalization === 'monthly'
            ? balance
            : balance + totalInterest;

        currentSchedule = schedule;

        const effectiveRate = initialAmount > 0
            ? totalInterest / initialAmount * 100
            : 0;

        finalAmountBox.textContent = formatMoney(finalAmount);
        initialResultBox.textContent = formatMoney(initialAmount);
        interestResultBox.textContent = formatMoney(totalInterest);
        topUpResultBox.textContent = formatMoney(totalTopUp);
        withdrawalResultBox.textContent = formatMoney(totalWithdrawal);
        monthsResultBox.textContent = `${formatNumber(months)} мес.`;
        effectiveRateResultBox.textContent = formatPercent(effectiveRate);

        if (capitalization === 'monthly') {
            resultNoteBox.textContent = 'Проценты ежемесячно прибавляются к вкладу.';
        } else {
            resultNoteBox.textContent = 'Проценты считаются отдельно и добавляются к итоговой сумме.';
        }

        renderSchedule(schedule);
        setMessage('Расчёт выполнен.', 'success');
    }

    function renderSchedule(schedule) {
        if (!schedule.length) {
            scheduleBody.innerHTML = '<tr><td colspan="6">Введите данные и выполните расчёт.</td></tr>';
            return;
        }

        scheduleBody.innerHTML = schedule.map(function (row) {
            return `
                <tr>
                    <td>${row.month}</td>
                    <td>${formatMoney(row.startBalance)}</td>
                    <td>${formatMoney(row.topUp)}</td>
                    <td>${formatMoney(row.withdrawal)}</td>
                    <td>${formatMoney(row.interest)}</td>
                    <td>${formatMoney(row.endBalance)}</td>
                </tr>
            `;
        }).join('');
    }

    function resetCalculator() {
        amountInput.value = '500000';
        rateInput.value = '14';
        termInput.value = '1';
        termUnitSelect.value = 'years';
        capitalizationSelect.value = 'monthly';
        topUpInput.value = '0';
        withdrawalInput.value = '0';

        calculateDeposit();
    }

    function copySchedule() {
        if (!currentSchedule.length) {
            setMessage('Нет графика для копирования.', 'error');
            return;
        }

        const header = 'Месяц\tБаланс на начало\tПополнение\tСнятие\tПроценты\tБаланс на конец';

        const rows = currentSchedule.map(function (row) {
            return [
                row.month,
                formatMoney(row.startBalance),
                formatMoney(row.topUp),
                formatMoney(row.withdrawal),
                formatMoney(row.interest),
                formatMoney(row.endBalance)
            ].join('\t');
        });

        const text = [header].concat(rows).join('\n');

        navigator.clipboard.writeText(text).then(function () {
            setMessage('График по вкладу скопирован.', 'success');
        }).catch(function () {
            setMessage('Не удалось скопировать график.', 'error');
        });
    }

    calculateButton.addEventListener('click', calculateDeposit);
    resetButton.addEventListener('click', resetCalculator);
    copyScheduleButton.addEventListener('click', copySchedule);

    [
        amountInput,
        rateInput,
        termInput,
        termUnitSelect,
        capitalizationSelect,
        topUpInput,
        withdrawalInput
    ].forEach(function (element) {
        element.addEventListener('input', calculateDeposit);
        element.addEventListener('change', calculateDeposit);
    });

    calculateDeposit();
});