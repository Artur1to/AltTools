(function () {
    const STORAGE_KEY = 'alttools_cookie_notice_seen';

    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');

    function showBanner() {
        if (!banner) return;

        banner.classList.add('cookie-banner_visible');
        banner.setAttribute('aria-hidden', 'false');
    }

    function hideBanner() {
        if (!banner) return;

        banner.classList.remove('cookie-banner_visible');
        banner.setAttribute('aria-hidden', 'true');
    }

    function loadYandexMetrika() {
        const counterId = window.ALTTOOLS_METRIKA_ID;

        if (!counterId || String(counterId) === '0' || String(counterId) === '00000000') {
            return;
        }

        if (window.alttoolsMetrikaLoaded) {
            return;
        }

        window.alttoolsMetrikaLoaded = true;

        (function (m, e, t, r, i, k, a) {
            m[i] = m[i] || function () {
                (m[i].a = m[i].a || []).push(arguments);
            };

            m[i].l = 1 * new Date();

            k = e.createElement(t);
            a = e.getElementsByTagName(t)[0];

            k.async = 1;
            k.src = r;

            a.parentNode.insertBefore(k, a);
        })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

        ym(counterId, 'init', {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: false
        });
    }

    // Метрика запускается сразу при загрузке страницы
    loadYandexMetrika();

    const noticeSeen = localStorage.getItem(STORAGE_KEY);

    if (noticeSeen === 'yes') {
        hideBanner();
    } else {
        showBanner();
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', function () {
            localStorage.setItem(STORAGE_KEY, 'yes');
            hideBanner();
        });
    }
})();