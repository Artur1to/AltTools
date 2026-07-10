document.addEventListener('DOMContentLoaded', function () {
    const precisionSelect = document.getElementById('percentPrecision');
    const resetButton = document.getElementById('resetPercentCalculator');

    const inputs = document.querySelectorAll('[data-input]');
    const results = {
        percentOf: document.querySelector('[data-result="percent-of"]'),
        partPercent: document.querySelector('[data-result="part-percent"]'),
        addPercent: document.querySelector('[data-result="add-percent"]'),
        subtractPercent: document.querySelector('[data-result="subtract-percent"]')
    };

    function getInput(name) {
        return document.querySelector(`[data-input="${name}"]`);
    }

    function parseNumber(value) {
        const normalized = String(value).replace(',', '.').trim();

        if (!normalized) {
            return null;
        }

        const number = Number(normalized);

        if (!Number.isFinite(number)) {
            return null;
        }

        return number;
    }

    function formatNumber(value, suffix) {
        const precision = Number(precisionSelect.value);

        if (!Number.isFinite(value)) {
            return '—';
        }

        const rounded = Number(value.toFixed(precision));

        const formatted = rounded.toLocaleString('ru-RU', {
            maximumFractionDigits: precision
        });

        return suffix ? `${formatted}${suffix}` : formatted;
    }

    function setResult(element, value, suffix) {
        if (!element) {
            return;
        }

        if (value === null || !Number.isFinite(value)) {
            element.textContent = '—';
            return;
        }

        element.textContent = formatNumber(value, suffix);
    }

    function calculatePercentOf() {
        const percent = parseNumber(getInput('percent-of-percent').value);
        const number = parseNumber(getInput('percent-of-number').value);

        if (percent === null || number === null) {
            setResult(results.percentOf, null);
            return;
        }

        setResult(results.percentOf, number * percent / 100);
    }

    function calculatePartPercent() {
        const part = parseNumber(getInput('part-number').value);
        const whole = parseNumber(getInput('whole-number').value);

        if (part === null || whole === null || whole === 0) {
            setResult(results.partPercent, null);
            return;
        }

        setResult(results.partPercent, part / whole * 100, '%');
    }

    function calculateAddPercent() {
        const percent = parseNumber(getInput('add-percent').value);
        const number = parseNumber(getInput('add-number').value);

        if (percent === null || number === null) {
            setResult(results.addPercent, null);
            return;
        }

        setResult(results.addPercent, number * (1 + percent / 100));
    }

    function calculateSubtractPercent() {
        const percent = parseNumber(getInput('subtract-percent').value);
        const number = parseNumber(getInput('subtract-number').value);

        if (percent === null || number === null) {
            setResult(results.subtractPercent, null);
            return;
        }

        setResult(results.subtractPercent, number * (1 - percent / 100));
    }

    function calculateAll() {
        calculatePercentOf();
        calculatePartPercent();
        calculateAddPercent();
        calculateSubtractPercent();
    }

    inputs.forEach(function (input) {
        input.addEventListener('input', calculateAll);
    });

    precisionSelect.addEventListener('change', calculateAll);

    resetButton.addEventListener('click', function () {
        inputs.forEach(function (input) {
            input.value = '';
        });

        calculateAll();
    });

    calculateAll();
});