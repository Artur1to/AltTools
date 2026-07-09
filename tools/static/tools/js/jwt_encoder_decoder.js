document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.jwt-tab');
    const decodePanel = document.getElementById('decodePanel');
    const encodePanel = document.getElementById('encodePanel');

    const jwtInput = document.getElementById('jwtInput');
    const decodedHeader = document.getElementById('decodedHeader');
    const decodedPayload = document.getElementById('decodedPayload');
    const decodedSignature = document.getElementById('decodedSignature');
    const decodeStatus = document.getElementById('decodeStatus');
    const jwtMetaGrid = document.getElementById('jwtMetaGrid');

    const decodeButton = document.getElementById('decodeJwt');
    const verifyButton = document.getElementById('verifyJwt');
    const clearJwtButton = document.getElementById('clearJwt');
    const loadExampleJwtButton = document.getElementById('loadExampleJwt');
    const decodeSecret = document.getElementById('decodeSecret');

    const encodeHeader = document.getElementById('encodeHeader');
    const encodePayload = document.getElementById('encodePayload');
    const encodeAlgorithm = document.getElementById('encodeAlgorithm');
    const encodeSecret = document.getElementById('encodeSecret');
    const addTimestamps = document.getElementById('addTimestamps');
    const encodedJwtResult = document.getElementById('encodedJwtResult');
    const encodeStatus = document.getElementById('encodeStatus');

    const encodeButton = document.getElementById('encodeJwt');
    const copyEncodedButton = document.getElementById('copyEncodedJwt');
    const downloadEncodedButton = document.getElementById('downloadEncodedJwt');
    const formatHeaderButton = document.getElementById('formatHeaderJson');
    const formatPayloadButton = document.getElementById('formatPayloadJson');

    const exampleSecret = 'alttools-secret';

    const exampleHeader = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const examplePayload = {
        sub: '1234567890',
        name: 'AltTools User',
        role: 'admin',
        iat: 1710000000,
        exp: 1893456000
    };

    function setStatus(element, text, type) {
        element.textContent = text;
        element.classList.remove('jwt-status_success', 'jwt-status_error');

        if (type === 'success') {
            element.classList.add('jwt-status_success');
        }

        if (type === 'error') {
            element.classList.add('jwt-status_error');
        }
    }

    function base64UrlEncodeString(value) {
        const bytes = new TextEncoder().encode(value);
        let binary = '';

        bytes.forEach(function (byte) {
            binary += String.fromCharCode(byte);
        });

        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
    }

    function base64UrlDecodeToString(value) {
        let normalized = value
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const padding = normalized.length % 4;

        if (padding) {
            normalized += '='.repeat(4 - padding);
        }

        const binary = atob(normalized);
        const bytes = new Uint8Array(binary.length);

        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }

        return new TextDecoder().decode(bytes);
    }

    function base64UrlToBytes(value) {
        let normalized = value
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const padding = normalized.length % 4;

        if (padding) {
            normalized += '='.repeat(4 - padding);
        }

        const binary = atob(normalized);
        const bytes = new Uint8Array(binary.length);

        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }

        return bytes;
    }

    function bytesToBase64Url(bytes) {
        let binary = '';

        bytes.forEach(function (byte) {
            binary += String.fromCharCode(byte);
        });

        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
    }

    async function hmacSha256(message, secret) {
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            {
                name: 'HMAC',
                hash: 'SHA-256'
            },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            new TextEncoder().encode(message)
        );

        return bytesToBase64Url(new Uint8Array(signature));
    }

    function safeJsonParse(value, label) {
        try {
            return JSON.parse(value);
        } catch (error) {
            throw new Error(`Некорректный JSON в блоке ${label}.`);
        }
    }

    function prettyJson(value) {
        return JSON.stringify(value, null, 2);
    }

    function parseJwt(token) {
        const cleanedToken = token.trim();
        const parts = cleanedToken.split('.');

        if (parts.length !== 3) {
            throw new Error('JWT должен состоять из трёх частей: header.payload.signature.');
        }

        const headerJson = base64UrlDecodeToString(parts[0]);
        const payloadJson = base64UrlDecodeToString(parts[1]);

        return {
            token: cleanedToken,
            headerPart: parts[0],
            payloadPart: parts[1],
            signaturePart: parts[2],
            signingInput: `${parts[0]}.${parts[1]}`,
            header: JSON.parse(headerJson),
            payload: JSON.parse(payloadJson)
        };
    }

    function formatUnixTime(value) {
        if (typeof value !== 'number') {
            return 'Нет значения';
        }

        const date = new Date(value * 1000);

        if (Number.isNaN(date.getTime())) {
            return 'Некорректное значение';
        }

        return date.toLocaleString();
    }

    function getTokenState(payload) {
        const now = Math.floor(Date.now() / 1000);

        if (typeof payload.exp === 'number' && payload.exp < now) {
            return 'Истёк';
        }

        if (typeof payload.nbf === 'number' && payload.nbf > now) {
            return 'Ещё не активен';
        }

        return 'Активен по времени';
    }

    function renderClaimsMeta(payload) {
        const items = [
            {
                title: 'Состояние',
                value: getTokenState(payload)
            },
            {
                title: 'Expires exp',
                value: formatUnixTime(payload.exp)
            },
            {
                title: 'Issued at iat',
                value: formatUnixTime(payload.iat)
            },
            {
                title: 'Not before nbf',
                value: formatUnixTime(payload.nbf)
            },
            {
                title: 'Subject sub',
                value: payload.sub || 'Нет значения'
            },
            {
                title: 'Issuer iss',
                value: payload.iss || 'Нет значения'
            },
            {
                title: 'Audience aud',
                value: Array.isArray(payload.aud) ? payload.aud.join(', ') : payload.aud || 'Нет значения'
            }
        ];

        jwtMetaGrid.innerHTML = '';

        items.forEach(function (item) {
            const element = document.createElement('div');
            element.className = 'jwt-meta-item';

            const title = document.createElement('strong');
            title.textContent = item.title;

            const value = document.createElement('span');
            value.textContent = item.value;

            element.appendChild(title);
            element.appendChild(value);

            jwtMetaGrid.appendChild(element);
        });
    }

    function decodeCurrentJwt() {
        const token = jwtInput.value;

        if (!token.trim()) {
            throw new Error('Вставьте JWT для декодирования.');
        }

        const parsed = parseJwt(token);

        decodedHeader.textContent = prettyJson(parsed.header);
        decodedPayload.textContent = prettyJson(parsed.payload);
        decodedSignature.textContent = parsed.signaturePart || 'Подпись отсутствует';

        renderClaimsMeta(parsed.payload);

        setStatus(decodeStatus, 'JWT успешно декодирован. Помните: декодирование не равно проверке подлинности.', 'success');

        return parsed;
    }

    async function verifyCurrentJwt() {
        const parsed = decodeCurrentJwt();

        if (parsed.header.alg !== 'HS256') {
            throw new Error(`Проверка сейчас поддерживает HS256. В токене указан alg: ${parsed.header.alg || 'не указан'}.`);
        }

        const secret = decodeSecret.value;

        if (!secret) {
            throw new Error('Введите secret для проверки HS256.');
        }

        const expectedSignature = await hmacSha256(parsed.signingInput, secret);

        if (expectedSignature === parsed.signaturePart) {
            setStatus(decodeStatus, 'Подпись HS256 корректна. Signature совпадает.', 'success');
        } else {
            setStatus(decodeStatus, 'Подпись HS256 не совпадает. Токен мог быть изменён или secret неверный.', 'error');
        }
    }

    async function createJwtFromJson() {
        const header = safeJsonParse(encodeHeader.value, 'Header');
        const payload = safeJsonParse(encodePayload.value, 'Payload');
        const algorithm = encodeAlgorithm.value;

        if (algorithm === 'HS256') {
            header.alg = 'HS256';
        }

        if (algorithm === 'none') {
            header.alg = 'none';
        }

        header.typ = header.typ || 'JWT';

        if (addTimestamps.checked && typeof payload.iat === 'undefined') {
            payload.iat = Math.floor(Date.now() / 1000);
        }

        const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
        const encodedPayload = base64UrlEncodeString(JSON.stringify(payload));
        const signingInput = `${encodedHeader}.${encodedPayload}`;

        let signature = '';

        if (algorithm === 'HS256') {
            const secret = encodeSecret.value;

            if (!secret) {
                throw new Error('Для HS256 нужен secret.');
            }

            signature = await hmacSha256(signingInput, secret);
        }

        encodedJwtResult.value = `${signingInput}.${signature}`;

        setStatus(encodeStatus, 'JWT успешно создан.', 'success');
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

    function downloadText(value, filename) {
        if (!value) {
            return;
        }

        const blob = new Blob([value], {
            type: 'text/plain;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    function switchTab(tabName) {
        tabs.forEach(function (tab) {
            tab.classList.toggle('jwt-tab_active', tab.dataset.tab === tabName);
        });

        decodePanel.classList.toggle('jwt-panel_active', tabName === 'decode');
        encodePanel.classList.toggle('jwt-panel_active', tabName === 'encode');
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            switchTab(tab.dataset.tab);
        });
    });

    decodeButton.addEventListener('click', function () {
        try {
            decodeCurrentJwt();
        } catch (error) {
            setStatus(decodeStatus, error.message, 'error');
        }
    });

    verifyButton.addEventListener('click', function () {
        verifyCurrentJwt().catch(function (error) {
            setStatus(decodeStatus, error.message, 'error');
        });
    });

    clearJwtButton.addEventListener('click', function () {
        jwtInput.value = '';
        decodedHeader.textContent = '';
        decodedPayload.textContent = '';
        decodedSignature.textContent = '';
        jwtMetaGrid.innerHTML = '';
        setStatus(decodeStatus, 'JWT очищен.', '');
    });

    loadExampleJwtButton.addEventListener('click', async function () {
        encodeHeader.value = prettyJson(exampleHeader);
        encodePayload.value = prettyJson(examplePayload);
        encodeAlgorithm.value = 'HS256';
        encodeSecret.value = exampleSecret;

        await createJwtFromJson();

        jwtInput.value = encodedJwtResult.value;
        decodeSecret.value = exampleSecret;

        switchTab('decode');
        decodeCurrentJwt();

        setStatus(decodeStatus, 'Загружен пример JWT. Secret для проверки: alttools-secret', 'success');
    });

    encodeButton.addEventListener('click', function () {
        createJwtFromJson().catch(function (error) {
            setStatus(encodeStatus, error.message, 'error');
        });
    });

    copyEncodedButton.addEventListener('click', function () {
        copyText(encodedJwtResult.value, copyEncodedButton);
    });

    downloadEncodedButton.addEventListener('click', function () {
        downloadText(encodedJwtResult.value, 'alttools-jwt.txt');
    });

    formatHeaderButton.addEventListener('click', function () {
        try {
            encodeHeader.value = prettyJson(safeJsonParse(encodeHeader.value, 'Header'));
            setStatus(encodeStatus, 'Header JSON отформатирован.', 'success');
        } catch (error) {
            setStatus(encodeStatus, error.message, 'error');
        }
    });

    formatPayloadButton.addEventListener('click', function () {
        try {
            encodePayload.value = prettyJson(safeJsonParse(encodePayload.value, 'Payload'));
            setStatus(encodeStatus, 'Payload JSON отформатирован.', 'success');
        } catch (error) {
            setStatus(encodeStatus, error.message, 'error');
        }
    });

    document.querySelectorAll('[data-copy-target]').forEach(function (button) {
        button.addEventListener('click', function () {
            const target = document.getElementById(button.dataset.copyTarget);

            if (target) {
                copyText(target.textContent, button);
            }
        });
    });
});