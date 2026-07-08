(function () {
    const STORAGE_KEY = 'alttools_cookie_consent';

    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');

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

        if (!counterId || counterId === 00000000) {
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
            webvisor: true
        });
    }

    const consent = localStorage.getItem(STORAGE_KEY);

    if (consent === 'accepted') {
        hideBanner();
        loadYandexMetrika();
    } else if (consent === 'rejected') {
        hideBanner();
    } else {
        showBanner();
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', function () {
            localStorage.setItem(STORAGE_KEY, 'accepted');
            hideBanner();
            loadYandexMetrika();
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', function () {
            localStorage.setItem(STORAGE_KEY, 'rejected');
            hideBanner();
        });
    }
})();