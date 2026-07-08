document.addEventListener('DOMContentLoaded', function () {
    const modeInputs = document.querySelectorAll('input[name="mode"]');
    const rangePanel = document.querySelector('.js-range-panel');
    const listPanel = document.querySelector('.js-list-panel');
    const copyButton = document.querySelector('.js-copy-result');
    const resultText = document.querySelector('.js-result-text');

    function updateModePanels() {
        const checkedMode = document.querySelector('input[name="mode"]:checked');

        if (!checkedMode || !rangePanel || !listPanel) {
            return;
        }

        if (checkedMode.value === 'range') {
            rangePanel.classList.remove('random-panel_hidden');
            listPanel.classList.add('random-panel_hidden');
        } else {
            rangePanel.classList.add('random-panel_hidden');
            listPanel.classList.remove('random-panel_hidden');
        }
    }

    modeInputs.forEach(function (input) {
        input.addEventListener('change', updateModePanels);
    });

    updateModePanels();

    if (copyButton && resultText) {
        copyButton.addEventListener('click', async function () {
            try {
                await navigator.clipboard.writeText(resultText.value);
                copyButton.textContent = 'Результат скопирован';

                setTimeout(function () {
                    copyButton.textContent = 'Скопировать результат';
                }, 1800);
            } catch (error) {
                copyButton.textContent = 'Не удалось скопировать';

                setTimeout(function () {
                    copyButton.textContent = 'Скопировать результат';
                }, 1800);
            }
        });
    }
});