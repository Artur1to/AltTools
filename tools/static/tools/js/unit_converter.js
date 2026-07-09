document.addEventListener('DOMContentLoaded', function () {
    const config = JSON.parse(
        document.getElementById('unitConverterConfig').textContent
    );

    const valueInput = document.getElementById('unitValue');
    const fromUnitSelect = document.getElementById('fromUnit');
    const toUnitSelect = document.getElementById('toUnit');
    const precisionSelect = document.getElementById('precision');

    const mainResult = document.getElementById('mainResult');
    const allResultsTable = document.getElementById('allResultsTable');
    const statusBox = document.getElementById('unitStatus');

    const clearButton = document.getElementById('clearUnit');
    const swapButton = document.getElementById('swapUnits');
    const copyMainButton = document.getElementById('copyMainResult');

    let lastResultData = null;

    function setStatus(text, type) {
        statusBox.textContent = text;
        statusBox.classList.remove('unit-status_success', 'unit-status_error');

        if (type === 'success') {
            statusBox.classList.add('unit-status_success');
        }

        if (type === 'error') {
            statusBox.classList.add('unit-status_error');
        }
    }

    function fillSelect(select, selectedKey) {
        select.innerHTML = '';

        config.units.forEach(function (unit) {
            const option = document.createElement('option');
            option.value = unit.key;
            option.textContent = `${unit.title} (${unit.short})`;

            if (unit.key === selectedKey) {
                option.selected = true;
            }

            select.appendChild(option);
        });
    }

    function getUnit(key) {
        return config.units.find(function (unit) {
            return unit.key === key;
        });
    }

    function parseNumber(value) {
        const normalized = value.replace(',', '.').trim();

        if (!normalized) {
            return null;
        }

        const number = Number(normalized);

        if (!Number.isFinite(number)) {
            return null;
        }

        return number;
    }

    function toCelsius(value, unitKey) {
        if (unitKey === 'c') {
            return value;
        }

        if (unitKey === 'f') {
            return (value - 32) * 5 / 9;
        }

        if (unitKey === 'k') {
            return value - 273.15;
        }

        return value;
    }

    function fromCelsius(value, unitKey) {
        if (unitKey === 'c') {
            return value;
        }

        if (unitKey === 'f') {
            return value * 9 / 5 + 32;
        }

        if (unitKey === 'k') {
            return value + 273.15;
        }

        return value;
    }

    function convertValue(value, fromKey, toKey) {
        if (config.type === 'temperature') {
            const celsius = toCelsius(value, fromKey);
            return fromCelsius(celsius, toKey);
        }

        const fromUnit = getUnit(fromKey);
        const toUnit = getUnit(toKey);

        const baseValue = value * fromUnit.factor;

        return baseValue / toUnit.factor;
    }

    function formatNumber(value) {
        const precision = Number(precisionSelect.value);

        if (!Number.isFinite(value)) {
            return '—';
        }

        if (value === 0) {
            return '0';
        }

        const absolute = Math.abs(value);

        if (absolute >= 1e12 || absolute < 1e-6) {
            return value.toExponential(precision);
        }

        return Number(value.toFixed(precision)).toLocaleString('ru-RU', {
            maximumFractionDigits: precision
        });
    }

    function getRawFormatted(value) {
        const precision = Number(precisionSelect.value);

        if (!Number.isFinite(value)) {
            return '';
        }

        if (value === 0) {
            return '0';
        }

        const absolute = Math.abs(value);

        if (absolute >= 1e12 || absolute < 1e-6) {
            return value.toExponential(precision);
        }

        return Number(value.toFixed(precision)).toString();
    }

    function renderAllResults(value, fromKey) {
        allResultsTable.innerHTML = '';

        const rows = [];

        config.units.forEach(function (unit) {
            const convertedValue = convertValue(value, fromKey, unit.key);

            rows.push({
                key: unit.key,
                title: unit.title,
                short: unit.short,
                value: convertedValue,
                formatted: getRawFormatted(convertedValue)
            });

            const row = document.createElement('tr');

            const unitCell = document.createElement('td');
            const unitTitle = document.createElement('strong');
            const unitShort = document.createElement('span');

            unitTitle.textContent = unit.title;
            unitShort.textContent = unit.short;

            unitCell.appendChild(unitTitle);
            unitCell.appendChild(document.createElement('br'));
            unitCell.appendChild(unitShort);

            const valueCell = document.createElement('td');
            valueCell.textContent = formatNumber(convertedValue);

            row.appendChild(unitCell);
            row.appendChild(valueCell);

            allResultsTable.appendChild(row);
        });

        return rows;
    }

    function convert() {
        const value = parseNumber(valueInput.value);

        if (value === null) {
            mainResult.textContent = '—';
            allResultsTable.innerHTML = '<tr><td colspan="2">Введите корректное число.</td></tr>';
            setStatus('Введите корректное число. Можно использовать точку или запятую.', 'error');
            lastResultData = null;
            return;
        }

        const fromKey = fromUnitSelect.value;
        const toKey = toUnitSelect.value;

        const fromUnit = getUnit(fromKey);
        const toUnit = getUnit(toKey);

        const result = convertValue(value, fromKey, toKey);
        const formattedResult = formatNumber(result);

        mainResult.textContent = `${formattedResult} ${toUnit.short}`;

        const allResults = renderAllResults(value, fromKey);

        lastResultData = {
            tool: 'AltTools Unit Converter',
            converter: config.title,
            input: {
                value: value,
                unit: fromUnit.title,
                unit_short: fromUnit.short
            },
            output: {
                value: result,
                formatted: getRawFormatted(result),
                unit: toUnit.title,
                unit_short: toUnit.short
            },
            all_results: allResults,
            generated_at: new Date().toISOString()
        };

        setStatus('Конвертация выполнена.', 'success');
    }

    function buildTxtOutput() {
        if (!lastResultData) {
            return '';
        }

        const lines = [];

        lines.push('AltTools Unit Converter');
        lines.push(lastResultData.converter);
        lines.push('');
        lines.push('Input:');
        lines.push(`${lastResultData.input.value} ${lastResultData.input.unit_short}`);
        lines.push('');
        lines.push('Result:');
        lines.push(`${lastResultData.output.formatted} ${lastResultData.output.unit_short}`);
        lines.push('');
        lines.push('All results:');

        lastResultData.all_results.forEach(function (item) {
            lines.push(`${item.title} (${item.short}): ${item.formatted}`);
        });

        return lines.join('\n');
    }

    function copyText(value, button) {
        if (!value) {
            return;
        }

        navigator.clipboard.writeText(value).then(function () {
            const oldText = button.textContent;
            button.textContent = 'Скопировано';

            setTimeout(function () {
                button.textContent = oldText;
            }, 1600);
        }).catch(function () {
            const textarea = document.createElement('textarea');
            textarea.value = value;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    }

    function downloadText(value, filename, type) {
        if (!value) {
            return;
        }

        const blob = new Blob([value], {
            type: type
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    fillSelect(fromUnitSelect, config.default_from);
    fillSelect(toUnitSelect, config.default_to);

    valueInput.addEventListener('input', convert);
    fromUnitSelect.addEventListener('change', convert);
    toUnitSelect.addEventListener('change', convert);
    precisionSelect.addEventListener('change', convert);

    clearButton.addEventListener('click', function () {
        valueInput.value = '';
        mainResult.textContent = '—';
        allResultsTable.innerHTML = '<tr><td colspan="2">Результаты появятся после ввода значения.</td></tr>';
        lastResultData = null;
        setStatus('Поля очищены.', '');
        valueInput.focus();
    });

    swapButton.addEventListener('click', function () {
        const oldFrom = fromUnitSelect.value;

        fromUnitSelect.value = toUnitSelect.value;
        toUnitSelect.value = oldFrom;

        convert();
    });

    copyMainButton.addEventListener('click', function () {
        copyText(mainResult.textContent, copyMainButton);
    });

    convert();
});