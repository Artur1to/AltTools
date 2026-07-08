document.addEventListener('DOMContentLoaded', function () {
    const operationSelect = document.getElementById('operation');
    const inputText = document.getElementById('inputText');
    const resultText = document.getElementById('resultText');
    const inputHint = document.getElementById('inputHint');

    const copyButton = document.getElementById('copyResult');
    const downloadButton = document.getElementById('downloadResult');
    const clearButton = document.getElementById('clearInput');
    const swapButton = document.getElementById('swapText');

    if (!operationSelect || !inputText || !resultText) {
        return;
    }

    function updateInputHint() {
        if (operationSelect.value === 'encode') {
            inputHint.textContent = 'Введите обычный текст для кодирования';
            inputText.placeholder = 'Например: Привет, AltTools!';
        } else {
            inputHint.textContent = 'Введите Base64-строку для декодирования';
            inputText.placeholder = 'Например: 0J/RgNC40LLQtdGCLCDQkWx0VG9vbHMh';
        }
    }

    updateInputHint();

    operationSelect.addEventListener('change', updateInputHint);

    if (clearButton) {
        clearButton.addEventListener('click', function () {
            inputText.value = '';
            inputText.focus();
        });
    }

    if (copyButton) {
        copyButton.addEventListener('click', async function () {
            if (!resultText.value) {
                return;
            }

            try {
                await navigator.clipboard.writeText(resultText.value);
                copyButton.textContent = 'Скопировано';

                setTimeout(function () {
                    copyButton.textContent = 'Копировать';
                }, 1600);
            } catch (error) {
                resultText.select();
                document.execCommand('copy');
            }
        });
    }

    if (downloadButton) {
        downloadButton.addEventListener('click', function () {
            if (!resultText.value) {
                return;
            }

            const blob = new Blob([resultText.value], {
                type: 'text/plain;charset=utf-8'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = 'alttools-base64-result.txt';
            link.click();

            URL.revokeObjectURL(url);
        });
    }

    if (swapButton) {
        swapButton.addEventListener('click', function () {
            if (!resultText.value) {
                return;
            }

            inputText.value = resultText.value;

            if (operationSelect.value === 'encode') {
                operationSelect.value = 'decode';
            } else {
                operationSelect.value = 'encode';
            }

            updateInputHint();
            inputText.focus();
        });
    }
});