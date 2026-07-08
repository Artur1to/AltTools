document.addEventListener('DOMContentLoaded', function () {
    const copyUrlButton = document.querySelector('.js-copy-url');
    const copyQrButton = document.querySelector('.js-copy-qr');

    if (copyUrlButton) {
        copyUrlButton.addEventListener('click', async function () {
            const url = copyUrlButton.dataset.url;

            try {
                await navigator.clipboard.writeText(url);
                copyUrlButton.textContent = 'Ссылка скопирована';

                setTimeout(function () {
                    copyUrlButton.textContent = 'Скопировать ссылку';
                }, 1800);
            } catch (error) {
                copyUrlButton.textContent = 'Не удалось скопировать';

                setTimeout(function () {
                    copyUrlButton.textContent = 'Скопировать ссылку';
                }, 1800);
            }
        });
    }

    if (copyQrButton) {
        copyQrButton.addEventListener('click', async function () {
            const qrImage = document.querySelector('.qr-preview img');

            if (!qrImage) {
                copyQrButton.textContent = 'QR-код не найден';

                setTimeout(function () {
                    copyQrButton.textContent = 'Скопировать QR-код';
                }, 1800);

                return;
            }

            if (!navigator.clipboard || !window.ClipboardItem) {
                copyQrButton.textContent = 'Копирование недоступно';

                setTimeout(function () {
                    copyQrButton.textContent = 'Скопировать QR-код';
                }, 1800);

                return;
            }

            try {
                const response = await fetch(qrImage.src);
                const blob = await response.blob();

                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);

                copyQrButton.textContent = 'QR-код скопирован';

                setTimeout(function () {
                    copyQrButton.textContent = 'Скопировать QR-код';
                }, 1800);
            } catch (error) {
                copyQrButton.textContent = 'Не удалось скопировать';

                setTimeout(function () {
                    copyQrButton.textContent = 'Скопировать QR-код';
                }, 1800);
            }
        });
    }
});