document.addEventListener('DOMContentLoaded', function () {
    const propertyPriceInput = document.getElementById('propertyPrice');
    const downPaymentInput = document.getElementById('downPayment');
    const downPaymentTypeSelect = document.getElementById('downPaymentType');
    const rateInput = document.getElementById('mortgageRate');
    const termInput = document.getElementById('mortgageTerm');
    const termUnitSelect = document.getElementById('mortgageTermUnit');
    const paymentTypeSelect = document.getElementById('mortgagePaymentType');

    const calculateButton = document.getElementById('mortgageCalculate');
    const resetButton = document.getElementById('mortgageReset');
    const copyScheduleButton = document.getElementById('mortgageCopySchedule');

    const messageBox = document.getElementById('mortgageMessage');
    const monthlyPaymentBox = document.getElementById('mortgageMonthlyPayment');
    const paymentNoteBox = document.getElementById('mortgagePaymentNote');

    const propertyPriceResultBox = document.getElementById('propertyPriceResult');
    const downPaymentResultBox = document.getElementById('downPaymentResult');
    const mortgageAmountResultBox = document.getElementById('mortgageAmountResult');
    const monthsResultBox = document.getElementById('mortgageMonthsResult');
    const totalPaymentBox = document.getElementById('mortgageTotalPayment');
    const overpaymentBox = document.getElementById('mortgageOverpayment');
    const scheduleBody = document.getElementById('mortgageScheduleBody');

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
        messageBox.classList.remove('mortgage-message_error', 'mortgage-message_success');

        if (type === 'error') {
            messageBox.classList.add('mortgage-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('mortgage-message_success');
        }
    }

    function getMonths(term, unit) {
        if (unit === 'years') {
            return Math.round(term * 12);
        }

        return Math.round(term);
    }

    function getDownPayment(propertyPrice, downPaymentValue, downPaymentType) {
        if (downPaymentType === 'percent') {
            return propertyPrice * downPaymentValue / 100;
        }

        return downPaymentValue;
    }

    function validateData(propertyPrice, downPaymentValue, downPayment, mortgageAmount, annualRate, months) {
        if (propertyPrice === null || propertyPrice <= 0) {
            return 'Введите корректную стоимость недвижимости.';
        }

        if (downPaymentValue === null || downPaymentValue < 0) {
            return 'Введите корректный первоначальный взнос.';
        }

        if (downPaymentTypeSelect.value === 'percent' && downPaymentValue > 100) {
            return 'Первоначальный взнос в процентах не может быть больше 100%.';
        }

        if (downPayment >= propertyPrice) {
            return 'Первоначальный взнос должен быть меньше стоимости недвижимости.';
        }

        if (mortgageAmount <= 0) {
            return 'Сумма ипотеки должна быть больше нуля.';
        }

        if (annualRate === null || annualRate < 0) {
            return 'Введите корректную процентную ставку.';
        }

        if (!months || months <= 0) {
            return 'Введите корректный срок ипотеки.';
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

    function calculateMortgage() {
        const propertyPrice = parseNumber(propertyPriceInput.value);
        const downPaymentValue = parseNumber(downPaymentInput.value);
        const annualRate = parseNumber(rateInput.value);
        const term = parseNumber(termInput.value);
        const months = getMonths(term, termUnitSelect.value);
        const downPayment = getDownPayment(propertyPrice || 0, downPaymentValue || 0, downPaymentTypeSelect.value);
        const mortgageAmount = (propertyPrice || 0) - downPayment;
        const paymentType = paymentTypeSelect.value;

        const error = validateData(
            propertyPrice,
            downPaymentValue,
            downPayment,
            mortgageAmount,
            annualRate,
            months
        );

        if (error) {
            setMessage(error, 'error');
            return;
        }

        const schedule = paymentType === 'annuity'
            ? calculateAnnuity(mortgageAmount, annualRate, months)
            : calculateDifferentiated(mortgageAmount, annualRate, months);

        currentSchedule = schedule;

        const totalPayment = schedule.reduce(function (sum, row) {
            return sum + row.payment;
        }, 0);

        const overpayment = totalPayment - mortgageAmount;
        const firstPayment = schedule[0].payment;
        const lastPayment = schedule[schedule.length - 1].payment;

        if (paymentType === 'annuity') {
            monthlyPaymentBox.textContent = formatMoney(firstPayment);
            paymentNoteBox.textContent = 'Аннуитетный платёж одинаковый почти каждый месяц.';
        } else {
            monthlyPaymentBox.textContent = `${formatMoney(firstPayment)} → ${formatMoney(lastPayment)}`;
            paymentNoteBox.textContent = 'Дифференцированный платёж уменьшается каждый месяц.';
        }

        propertyPriceResultBox.textContent = formatMoney(propertyPrice);
        downPaymentResultBox.textContent = formatMoney(downPayment);
        mortgageAmountResultBox.textContent = formatMoney(mortgageAmount);
        monthsResultBox.textContent = `${formatNumber(months)} мес.`;
        totalPaymentBox.textContent = formatMoney(totalPayment);
        overpaymentBox.textContent = formatMoney(overpayment);

        renderSchedule(schedule);
        setMessage('Расчёт выполнен.', 'success');
    }

    function resetCalculator() {
        propertyPriceInput.value = '8000000';
        downPaymentInput.value = '20';
        downPaymentTypeSelect.value = 'percent';
        rateInput.value = '16';
        termInput.value = '20';
        termUnitSelect.value = 'years';
        paymentTypeSelect.value = 'annuity';

        calculateMortgage();
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

    calculateButton.addEventListener('click', calculateMortgage);
    resetButton.addEventListener('click', resetCalculator);
    copyScheduleButton.addEventListener('click', copySchedule);

    [
        propertyPriceInput,
        downPaymentInput,
        downPaymentTypeSelect,
        rateInput,
        termInput,
        termUnitSelect,
        paymentTypeSelect
    ].forEach(function (element) {
        element.addEventListener('input', calculateMortgage);
        element.addEventListener('change', calculateMortgage);
    });

    calculateMortgage();
});