document.addEventListener('DOMContentLoaded', function () {
    const amountInput = document.getElementById('loanAmount');
    const rateInput = document.getElementById('loanRate');
    const termInput = document.getElementById('loanTerm');
    const termUnitSelect = document.getElementById('loanTermUnit');
    const paymentTypeSelect = document.getElementById('loanPaymentType');

    const calculateButton = document.getElementById('loanCalculate');
    const resetButton = document.getElementById('loanReset');
    const copyScheduleButton = document.getElementById('loanCopySchedule');

    const messageBox = document.getElementById('loanMessage');
    const monthlyPaymentBox = document.getElementById('loanMonthlyPayment');
    const paymentNoteBox = document.getElementById('loanPaymentNote');
    const principalResultBox = document.getElementById('loanPrincipalResult');
    const monthsResultBox = document.getElementById('loanMonthsResult');
    const totalPaymentBox = document.getElementById('loanTotalPayment');
    const overpaymentBox = document.getElementById('loanOverpayment');
    const scheduleBody = document.getElementById('loanScheduleBody');

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

    function setMessage(text, type) {
        messageBox.textContent = text;
        messageBox.classList.remove('loan-message_error', 'loan-message_success');

        if (type === 'error') {
            messageBox.classList.add('loan-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('loan-message_success');
        }
    }

    function getMonths(term, unit) {
        if (unit === 'years') {
            return Math.round(term * 12);
        }

        return Math.round(term);
    }

    function validateData(principal, annualRate, months) {
        if (principal === null || principal <= 0) {
            return 'Введите корректную сумму кредита.';
        }

        if (annualRate === null || annualRate < 0) {
            return 'Введите корректную процентную ставку.';
        }

        if (!months || months <= 0) {
            return 'Введите корректный срок кредита.';
        }

        if (months > 600) {
            return 'Срок слишком большой. Максимум — 600 месяцев.';
        }

        return '';
    }

    function calculateAnnuity(principal, annualRate, months) {
        const monthlyRate = annualRate / 100 / 12;
        let monthlyPayment = 0;

        if (monthlyRate === 0) {
            monthlyPayment = principal / months;
        } else {
            const coefficient = Math.pow(1 + monthlyRate, months);
            monthlyPayment = principal * monthlyRate * coefficient / (coefficient - 1);
        }

        let balance = principal;
        const schedule = [];

        for (let month = 1; month <= months; month += 1) {
            const interest = balance * monthlyRate;
            let principalPart = monthlyPayment - interest;

            if (month === months) {
                principalPart = balance;
                monthlyPayment = principalPart + interest;
            }

            balance = Math.max(0, balance - principalPart);

            schedule.push({
                month,
                payment: monthlyPayment,
                principalPart,
                interest,
                balance
            });
        }

        return schedule;
    }

    function calculateDifferentiated(principal, annualRate, months) {
        const monthlyRate = annualRate / 100 / 12;
        const principalPart = principal / months;
        let balance = principal;
        const schedule = [];

        for (let month = 1; month <= months; month += 1) {
            const interest = balance * monthlyRate;
            const payment = principalPart + interest;

            balance = Math.max(0, balance - principalPart);

            schedule.push({
                month,
                payment,
                principalPart,
                interest,
                balance
            });
        }

        return schedule;
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
                    <td>${formatMoney(row.payment)}</td>
                    <td>${formatMoney(row.principalPart)}</td>
                    <td>${formatMoney(row.interest)}</td>
                    <td>${formatMoney(row.balance)}</td>
                </tr>
            `;
        }).join('');
    }

    function calculateLoan() {
        const principal = parseNumber(amountInput.value);
        const annualRate = parseNumber(rateInput.value);
        const term = parseNumber(termInput.value);
        const months = getMonths(term, termUnitSelect.value);
        const paymentType = paymentTypeSelect.value;

        const error = validateData(principal, annualRate, months);

        if (error) {
            setMessage(error, 'error');
            return;
        }

        const schedule = paymentType === 'annuity'
            ? calculateAnnuity(principal, annualRate, months)
            : calculateDifferentiated(principal, annualRate, months);

        currentSchedule = schedule;

        const totalPayment = schedule.reduce(function (sum, row) {
            return sum + row.payment;
        }, 0);

        const overpayment = totalPayment - principal;
        const firstPayment = schedule[0].payment;
        const lastPayment = schedule[schedule.length - 1].payment;

        if (paymentType === 'annuity') {
            monthlyPaymentBox.textContent = formatMoney(firstPayment);
            paymentNoteBox.textContent = 'Аннуитетный платёж одинаковый почти каждый месяц.';
        } else {
            monthlyPaymentBox.textContent = `${formatMoney(firstPayment)} → ${formatMoney(lastPayment)}`;
            paymentNoteBox.textContent = 'Дифференцированный платёж уменьшается каждый месяц.';
        }

        principalResultBox.textContent = formatMoney(principal);
        monthsResultBox.textContent = `${formatNumber(months)} мес.`;
        totalPaymentBox.textContent = formatMoney(totalPayment);
        overpaymentBox.textContent = formatMoney(overpayment);

        renderSchedule(schedule);
        setMessage('Расчёт выполнен.', 'success');
    }

    function resetCalculator() {
        amountInput.value = '1000000';
        rateInput.value = '18';
        termInput.value = '5';
        termUnitSelect.value = 'years';
        paymentTypeSelect.value = 'annuity';

        calculateLoan();
    }

    function copySchedule() {
        if (!currentSchedule.length) {
            setMessage('Нет графика для копирования.', 'error');
            return;
        }

        const header = 'Месяц\tПлатёж\tОсновной долг\tПроценты\tОстаток';

        const rows = currentSchedule.map(function (row) {
            return [
                row.month,
                formatMoney(row.payment),
                formatMoney(row.principalPart),
                formatMoney(row.interest),
                formatMoney(row.balance)
            ].join('\t');
        });

        const text = [header].concat(rows).join('\n');

        navigator.clipboard.writeText(text).then(function () {
            setMessage('График платежей скопирован.', 'success');
        }).catch(function () {
            setMessage('Не удалось скопировать график.', 'error');
        });
    }

    calculateButton.addEventListener('click', calculateLoan);
    resetButton.addEventListener('click', resetCalculator);
    copyScheduleButton.addEventListener('click', copySchedule);

    [amountInput, rateInput, termInput, termUnitSelect, paymentTypeSelect].forEach(function (element) {
        element.addEventListener('input', calculateLoan);
        element.addEventListener('change', calculateLoan);
    });

    calculateLoan();
});