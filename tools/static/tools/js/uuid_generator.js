document.addEventListener('DOMContentLoaded', function () {
    const copyButton = document.querySelector('.js-copy-result');
    const downloadButton = document.querySelector('.js-download-txt');
    const resultText = document.querySelector('.js-result-text');

    if (copyButton && resultText) {
        copyButton.addEventListener('click', async function () {
            try {
                await navigator.clipboard.writeText(resultText.value);

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
            link.download = 'alttools-uuid-list.txt';

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