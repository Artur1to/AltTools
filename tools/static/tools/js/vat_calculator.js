document.addEventListener('DOMContentLoaded', function () {
    const amountInput = document.getElementById('vatAmount');
    const modeSelect = document.getElementById('vatMode');
    const rateSelect = document.getElementById('vatRate');
    const customRateWrap = document.getElementById('vatCustomRateWrap');
    const customRateInput = document.getElementById('vatCustomRate');

    const resetButton = document.getElementById('vatReset');
    const copyButton = document.getElementById('vatCopyResult');

    const messageBox = document.getElementById('vatMessage');
    const mainLabelBox = document.getElementById('vatMainLabel');
    const mainResultBox = document.getElementById('vatMainResult');
    const resultNoteBox = document.getElementById('vatResultNote');

    const netAmountBox = document.getElementById('vatNetAmount');
    const taxAmountBox = document.getElementById('vatTaxAmount');
    const grossAmountBox = document.getElementById('vatGrossAmount');
    const rateResultBox = document.getElementById('vatRateResult');

    const exampleButtons = document.querySelectorAll('#vatExamples button');

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
        messageBox.classList.remove('vat-message_error', 'vat-message_success');

        if (type === 'error') {
            messageBox.classList.add('vat-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('vat-message_success');
        }
    }

    function getRate() {
        if (rateSelect.value === 'custom') {
            return parseNumber(customRateInput.value);
        }

        return Number(rateSelect.value);
    }

    function updateCustomRateVisibility() {
        if (rateSelect.value === 'custom') {
            customRateWrap.classList.add('vat-custom-rate_visible');
        } else {
            customRateWrap.classList.remove('vat-custom-rate_visible');
        }
    }

    function clearResults() {
        currentResult = null;

        mainResultBox.textContent = '—';
        netAmountBox.textContent = '—';
        taxAmountBox.textContent = '—';
        grossAmountBox.textContent = '—';
        rateResultBox.textContent = '—';
        resultNoteBox.textContent = 'Введите сумму для расчёта.';
    }

    function calculateVat() {
        updateCustomRateVisibility();

        const amount = parseNumber(amountInput.value);
        const rate = getRate();
        const mode = modeSelect.value;

        if (amount === null || amount < 0) {
            clearResults();
            setMessage('Введите корректную сумму.', 'error');
            return;
        }

        if (rate === null || rate < 0) {
            clearResults();
            setMessage('Введите корректную ставку НДС.', 'error');
            return;
        }

        let netAmount = 0;
        let taxAmount = 0;
        let grossAmount = 0;

        if (mode === 'add') {
            netAmount = amount;
            taxAmount = netAmount * rate / 100;
            grossAmount = netAmount + taxAmount;

            mainLabelBox.textContent = 'Сумма с НДС';
            mainResultBox.textContent = formatMoney(grossAmount);
            resultNoteBox.textContent = `НДС начислен сверху по ставке ${formatPercent(rate)}.`;
        } else {
            grossAmount = amount;

            if (rate === 0) {
                taxAmount = 0;
                netAmount = grossAmount;
            } else {
                taxAmount = grossAmount * rate / (100 + rate);
                netAmount = grossAmount - taxAmount;
            }

            mainLabelBox.textContent = 'Сумма без НДС';
            mainResultBox.textContent = formatMoney(netAmount);
            resultNoteBox.textContent = `НДС выделен из суммы по расчётной ставке ${formatPercent(rate)} / ${100 + rate}.`;
        }

        currentResult = {
            mode,
            amount,
            rate,
            netAmount,
            taxAmount,
            grossAmount
        };

        netAmountBox.textContent = formatMoney(netAmount);
        taxAmountBox.textContent = formatMoney(taxAmount);
        grossAmountBox.textContent = formatMoney(grossAmount);
        rateResultBox.textContent = formatPercent(rate);

        setMessage('Расчёт выполнен.', 'success');
    }

    function resetCalculator() {
        amountInput.value = '100000';
        modeSelect.value = 'add';
        rateSelect.value = '22';
        customRateInput.value = '22';

        calculateVat();
    }

    function copyResult() {
        if (!currentResult) {
            setMessage('Нет результата для копирования.', 'error');
            return;
        }

        const modeText = currentResult.mode === 'add'
            ? 'Начислить НДС сверху'
            : 'Выделить НДС из суммы';

        const text = [
            'Калькулятор НДС',
            `Режим: ${modeText}`,
            `Ставка: ${formatPercent(currentResult.rate)}`,
            `Сумма без НДС: ${formatMoney(currentResult.netAmount)}`,
            `Сумма НДС: ${formatMoney(currentResult.taxAmount)}`,
            `Сумма с НДС: ${formatMoney(currentResult.grossAmount)}`
        ].join('\n');

        navigator.clipboard.writeText(text).then(function () {
            setMessage('Результат скопирован.', 'success');
        }).catch(function () {
            setMessage('Не удалось скопировать результат.', 'error');
        });
    }

    amountInput.addEventListener('input', calculateVat);
    modeSelect.addEventListener('change', calculateVat);
    rateSelect.addEventListener('change', calculateVat);
    customRateInput.addEventListener('input', calculateVat);

    resetButton.addEventListener('click', resetCalculator);
    copyButton.addEventListener('click', copyResult);

    exampleButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            amountInput.value = button.dataset.amount;
            calculateVat();
        });
    });

    calculateVat();
});