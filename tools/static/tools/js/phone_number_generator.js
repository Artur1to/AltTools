document.addEventListener('DOMContentLoaded', function () {
    const countrySelect = document.querySelector('.js-country-select');
    const operatorSelect = document.querySelector('.js-operator-select');
    const presetsElement = document.getElementById('phone-presets-data');

    const copyButton = document.querySelector('.js-copy-result');
    const downloadButton = document.querySelector('.js-download-txt');
    const resultText = document.querySelector('.js-result-text');

    let phonePresets = {};

    if (presetsElement) {
        phonePresets = JSON.parse(presetsElement.textContent);
    }

    function updateOperators() {
        if (!countrySelect || !operatorSelect) {
            return;
        }

        const countryKey = countrySelect.value;
        const country = phonePresets[countryKey];

        if (!country || !country.operators) {
            return;
        }

        const selectedOperator = operatorSelect.dataset.selectedOperator;

        operatorSelect.innerHTML = '';

        Object.entries(country.operators).forEach(function ([operatorKey, operatorData]) {
            const option = document.createElement('option');

            option.value = operatorKey;
            option.textContent = operatorData.title;

            if (operatorKey === selectedOperator) {
                option.selected = true;
            }

            operatorSelect.appendChild(option);
        });

        const hasSelected = Array.from(operatorSelect.options).some(function (option) {
            return option.selected;
        });

        if (!hasSelected && operatorSelect.options.length) {
            operatorSelect.options[0].selected = true;
        }
    }

    if (countrySelect) {
        countrySelect.addEventListener('change', function () {
            operatorSelect.dataset.selectedOperator = '';
            updateOperators();
        });
    }

    updateOperators();

    if (copyButton && resultText) {
        copyButton.addEventListener('click', async function () {
            try {
                await navigator.clipboard.writeText(resultText.value.trim());

                copyButton.textContent = 'Скопировано';

                setTimeout(function () {
                    copyButton.textContent = 'Скопировать';
                }, 1800);
            } catch (error) {
                copyButton.textContent = 'Не удалось скопировать';

                setTimeout(function () {
                    copyButton.textContent = 'Скопировать';
                }, 1800);
            }
        });
    }

    if (downloadButton && resultText) {
        downloadButton.addEventListener('click', function () {
            const text = resultText.value.trim();

            if (!text) {
                downloadButton.textContent = 'Нет данных';

                setTimeout(function () {
                    downloadButton.textContent = 'Скачать TXT';
                }, 1800);

                return;
            }

            const blob = new Blob([text + '\n'], {
                type: 'text/plain;charset=utf-8'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = 'alttools-phone-numbers.txt';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            downloadButton.textContent = 'TXT скачан';

            setTimeout(function () {
                downloadButton.textContent = 'Скачать TXT';
            }, 1800);
        });
    }
});