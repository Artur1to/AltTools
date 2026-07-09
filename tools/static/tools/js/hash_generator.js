document.addEventListener('DOMContentLoaded', function () {
    const hashInput = document.getElementById('hashInput');
    const uppercaseHash = document.getElementById('uppercaseHash');
    const autoHash = document.getElementById('autoHash');
    const generateButton = document.getElementById('generateHash');
    const clearButton = document.getElementById('clearHashInput');
    const exampleButton = document.getElementById('loadHashExample');
    const verifyInput = document.getElementById('hashToVerify');
    const verifyButton = document.getElementById('verifyHash');
    const statusBox = document.getElementById('hashStatus');

    const downloadTxtButton = document.getElementById('downloadHashTxt');
    const downloadJsonButton = document.getElementById('downloadHashJson');

    const outputs = {
        'MD5': document.getElementById('hashMD5'),
        'SHA-1': document.getElementById('hashSHA1'),
        'SHA-256': document.getElementById('hashSHA256'),
        'SHA-384': document.getElementById('hashSHA384'),
        'SHA-512': document.getElementById('hashSHA512')
    };

    function setStatus(text, type) {
        statusBox.textContent = text;
        statusBox.classList.remove('hash-status_success', 'hash-status_error');

        if (type === 'success') {
            statusBox.classList.add('hash-status_success');
        }

        if (type === 'error') {
            statusBox.classList.add('hash-status_error');
        }
    }

    function bytesToHex(buffer) {
        const bytes = new Uint8Array(buffer);

        return Array.from(bytes)
            .map(function (byte) {
                return byte.toString(16).padStart(2, '0');
            })
            .join('');
    }

    async function shaHash(text, algorithm) {
        const data = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm, data);

        return bytesToHex(hashBuffer);
    }

    function md5(inputString) {
        function rotateLeft(value, shift) {
            return (value << shift) | (value >>> (32 - shift));
        }

        function addUnsigned(x, y) {
            const x4 = x & 0x40000000;
            const y4 = y & 0x40000000;
            const x8 = x & 0x80000000;
            const y8 = y & 0x80000000;
            const result = (x & 0x3fffffff) + (y & 0x3fffffff);

            if (x4 & y4) {
                return result ^ 0x80000000 ^ x8 ^ y8;
            }

            if (x4 | y4) {
                if (result & 0x40000000) {
                    return result ^ 0xc0000000 ^ x8 ^ y8;
                }

                return result ^ 0x40000000 ^ x8 ^ y8;
            }

            return result ^ x8 ^ y8;
        }

        function f(x, y, z) {
            return (x & y) | ((~x) & z);
        }

        function g(x, y, z) {
            return (x & z) | (y & (~z));
        }

        function h(x, y, z) {
            return x ^ y ^ z;
        }

        function i(x, y, z) {
            return y ^ (x | (~z));
        }

        function ff(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function gg(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function hh(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function ii(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function convertToWordArray(string) {
            const messageLength = string.length;
            const numberOfWordsTempOne = messageLength + 8;
            const numberOfWordsTempTwo = (numberOfWordsTempOne - (numberOfWordsTempOne % 64)) / 64;
            const numberOfWords = (numberOfWordsTempTwo + 1) * 16;
            const wordArray = Array(numberOfWords - 1);

            let bytePosition = 0;
            let byteCount = 0;

            while (byteCount < messageLength) {
                const wordCount = (byteCount - (byteCount % 4)) / 4;
                bytePosition = (byteCount % 4) * 8;
                wordArray[wordCount] = wordArray[wordCount] | (string.charCodeAt(byteCount) << bytePosition);
                byteCount += 1;
            }

            const wordCount = (byteCount - (byteCount % 4)) / 4;
            bytePosition = (byteCount % 4) * 8;
            wordArray[wordCount] = wordArray[wordCount] | (0x80 << bytePosition);
            wordArray[numberOfWords - 2] = messageLength << 3;
            wordArray[numberOfWords - 1] = messageLength >>> 29;

            return wordArray;
        }

        function wordToHex(value) {
            let wordToHexValue = '';
            let wordToHexValueTemp = '';
            let byte;
            let count;

            for (count = 0; count <= 3; count += 1) {
                byte = (value >>> (count * 8)) & 255;
                wordToHexValueTemp = '0' + byte.toString(16);
                wordToHexValue += wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
            }

            return wordToHexValue;
        }

        function utf8Encode(string) {
            return unescape(encodeURIComponent(string));
        }

        const x = convertToWordArray(utf8Encode(inputString));

        let a = 0x67452301;
        let b = 0xefcdab89;
        let c = 0x98badcfe;
        let d = 0x10325476;

        let aa;
        let bb;
        let cc;
        let dd;

        const s11 = 7;
        const s12 = 12;
        const s13 = 17;
        const s14 = 22;
        const s21 = 5;
        const s22 = 9;
        const s23 = 14;
        const s24 = 20;
        const s31 = 4;
        const s32 = 11;
        const s33 = 16;
        const s34 = 23;
        const s41 = 6;
        const s42 = 10;
        const s43 = 15;
        const s44 = 21;

        for (let k = 0; k < x.length; k += 16) {
            aa = a;
            bb = b;
            cc = c;
            dd = d;

            a = ff(a, b, c, d, x[k + 0], s11, 0xd76aa478);
            d = ff(d, a, b, c, x[k + 1], s12, 0xe8c7b756);
            c = ff(c, d, a, b, x[k + 2], s13, 0x242070db);
            b = ff(b, c, d, a, x[k + 3], s14, 0xc1bdceee);
            a = ff(a, b, c, d, x[k + 4], s11, 0xf57c0faf);
            d = ff(d, a, b, c, x[k + 5], s12, 0x4787c62a);
            c = ff(c, d, a, b, x[k + 6], s13, 0xa8304613);
            b = ff(b, c, d, a, x[k + 7], s14, 0xfd469501);
            a = ff(a, b, c, d, x[k + 8], s11, 0x698098d8);
            d = ff(d, a, b, c, x[k + 9], s12, 0x8b44f7af);
            c = ff(c, d, a, b, x[k + 10], s13, 0xffff5bb1);
            b = ff(b, c, d, a, x[k + 11], s14, 0x895cd7be);
            a = ff(a, b, c, d, x[k + 12], s11, 0x6b901122);
            d = ff(d, a, b, c, x[k + 13], s12, 0xfd987193);
            c = ff(c, d, a, b, x[k + 14], s13, 0xa679438e);
            b = ff(b, c, d, a, x[k + 15], s14, 0x49b40821);

            a = gg(a, b, c, d, x[k + 1], s21, 0xf61e2562);
            d = gg(d, a, b, c, x[k + 6], s22, 0xc040b340);
            c = gg(c, d, a, b, x[k + 11], s23, 0x265e5a51);
            b = gg(b, c, d, a, x[k + 0], s24, 0xe9b6c7aa);
            a = gg(a, b, c, d, x[k + 5], s21, 0xd62f105d);
            d = gg(d, a, b, c, x[k + 10], s22, 0x02441453);
            c = gg(c, d, a, b, x[k + 15], s23, 0xd8a1e681);
            b = gg(b, c, d, a, x[k + 4], s24, 0xe7d3fbc8);
            a = gg(a, b, c, d, x[k + 9], s21, 0x21e1cde6);
            d = gg(d, a, b, c, x[k + 14], s22, 0xc33707d6);
            c = gg(c, d, a, b, x[k + 3], s23, 0xf4d50d87);
            b = gg(b, c, d, a, x[k + 8], s24, 0x455a14ed);
            a = gg(a, b, c, d, x[k + 13], s21, 0xa9e3e905);
            d = gg(d, a, b, c, x[k + 2], s22, 0xfcefa3f8);
            c = gg(c, d, a, b, x[k + 7], s23, 0x676f02d9);
            b = gg(b, c, d, a, x[k + 12], s24, 0x8d2a4c8a);

            a = hh(a, b, c, d, x[k + 5], s31, 0xfffa3942);
            d = hh(d, a, b, c, x[k + 8], s32, 0x8771f681);
            c = hh(c, d, a, b, x[k + 11], s33, 0x6d9d6122);
            b = hh(b, c, d, a, x[k + 14], s34, 0xfde5380c);
            a = hh(a, b, c, d, x[k + 1], s31, 0xa4beea44);
            d = hh(d, a, b, c, x[k + 4], s32, 0x4bdecfa9);
            c = hh(c, d, a, b, x[k + 7], s33, 0xf6bb4b60);
            b = hh(b, c, d, a, x[k + 10], s34, 0xbebfbc70);
            a = hh(a, b, c, d, x[k + 13], s31, 0x289b7ec6);
            d = hh(d, a, b, c, x[k + 0], s32, 0xeaa127fa);
            c = hh(c, d, a, b, x[k + 3], s33, 0xd4ef3085);
            b = hh(b, c, d, a, x[k + 6], s34, 0x04881d05);
            a = hh(a, b, c, d, x[k + 9], s31, 0xd9d4d039);
            d = hh(d, a, b, c, x[k + 12], s32, 0xe6db99e5);
            c = hh(c, d, a, b, x[k + 15], s33, 0x1fa27cf8);
            b = hh(b, c, d, a, x[k + 2], s34, 0xc4ac5665);

            a = ii(a, b, c, d, x[k + 0], s41, 0xf4292244);
            d = ii(d, a, b, c, x[k + 7], s42, 0x432aff97);
            c = ii(c, d, a, b, x[k + 14], s43, 0xab9423a7);
            b = ii(b, c, d, a, x[k + 5], s44, 0xfc93a039);
            a = ii(a, b, c, d, x[k + 12], s41, 0x655b59c3);
            d = ii(d, a, b, c, x[k + 3], s42, 0x8f0ccc92);
            c = ii(c, d, a, b, x[k + 10], s43, 0xffeff47d);
            b = ii(b, c, d, a, x[k + 1], s44, 0x85845dd1);
            a = ii(a, b, c, d, x[k + 8], s41, 0x6fa87e4f);
            d = ii(d, a, b, c, x[k + 15], s42, 0xfe2ce6e0);
            c = ii(c, d, a, b, x[k + 6], s43, 0xa3014314);
            b = ii(b, c, d, a, x[k + 13], s44, 0x4e0811a1);
            a = ii(a, b, c, d, x[k + 4], s41, 0xf7537e82);
            d = ii(d, a, b, c, x[k + 11], s42, 0xbd3af235);
            c = ii(c, d, a, b, x[k + 2], s43, 0x2ad7d2bb);
            b = ii(b, c, d, a, x[k + 9], s44, 0xeb86d391);

            a = addUnsigned(a, aa);
            b = addUnsigned(b, bb);
            c = addUnsigned(c, cc);
            d = addUnsigned(d, dd);
        }

        return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
    }

    function normalizeCase(value) {
        if (uppercaseHash.checked) {
            return value.toUpperCase();
        }

        return value.toLowerCase();
    }

    function getCurrentResults() {
        return {
            'MD5': outputs['MD5'].value,
            'SHA-1': outputs['SHA-1'].value,
            'SHA-256': outputs['SHA-256'].value,
            'SHA-384': outputs['SHA-384'].value,
            'SHA-512': outputs['SHA-512'].value
        };
    }

    async function generateHashes() {
        const text = hashInput.value;

        if (!text) {
            Object.values(outputs).forEach(function (output) {
                output.value = '';
            });

            setStatus('Введите текст для генерации hash.', '');
            return;
        }

        try {
            const results = {
                'MD5': md5(text),
                'SHA-1': await shaHash(text, 'SHA-1'),
                'SHA-256': await shaHash(text, 'SHA-256'),
                'SHA-384': await shaHash(text, 'SHA-384'),
                'SHA-512': await shaHash(text, 'SHA-512')
            };

            outputs['MD5'].value = normalizeCase(results['MD5']);
            outputs['SHA-1'].value = normalizeCase(results['SHA-1']);
            outputs['SHA-256'].value = normalizeCase(results['SHA-256']);
            outputs['SHA-384'].value = normalizeCase(results['SHA-384']);
            outputs['SHA-512'].value = normalizeCase(results['SHA-512']);

            setStatus('Hash успешно сгенерирован.', 'success');
        } catch (error) {
            setStatus('Не удалось сгенерировать hash. Проверьте браузер и введённый текст.', 'error');
        }
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

    function buildTxtOutput() {
        const results = getCurrentResults();
        const lines = [];

        lines.push('AltTools Hash Generator');
        lines.push('');
        lines.push('Input:');
        lines.push(hashInput.value);
        lines.push('');
        lines.push('Hashes:');

        Object.keys(results).forEach(function (algorithm) {
            lines.push(`${algorithm}: ${results[algorithm]}`);
        });

        return lines.join('\n');
    }

    function buildJsonOutput() {
        return JSON.stringify({
            tool: 'AltTools Hash Generator',
            generated_at: new Date().toISOString(),
            input: hashInput.value,
            hashes: getCurrentResults()
        }, null, 2);
    }

    async function verifyHash() {
        if (!hashInput.value) {
            setStatus('Сначала введите исходный текст.', 'error');
            return;
        }

        if (!verifyInput.value.trim()) {
            setStatus('Введите hash для проверки.', 'error');
            return;
        }

        await generateHashes();

        const targetHash = verifyInput.value.trim().toLowerCase();
        const results = getCurrentResults();

        const matchedAlgorithm = Object.keys(results).find(function (algorithm) {
            return results[algorithm].toLowerCase() === targetHash;
        });

        if (matchedAlgorithm) {
            setStatus(`Совпадение найдено: ${matchedAlgorithm}.`, 'success');
        } else {
            setStatus('Совпадений не найдено. Hash не соответствует введённому тексту.', 'error');
        }
    }

    if (generateButton) {
        generateButton.addEventListener('click', generateHashes);
    }

    if (clearButton) {
        clearButton.addEventListener('click', function () {
            hashInput.value = '';
            verifyInput.value = '';

            Object.values(outputs).forEach(function (output) {
                output.value = '';
            });

            setStatus('Поля очищены.', '');
            hashInput.focus();
        });
    }

    if (exampleButton) {
        exampleButton.addEventListener('click', function () {
            hashInput.value = 'Привет, AltTools!';
            generateHashes();
        });
    }

    if (uppercaseHash) {
        uppercaseHash.addEventListener('change', generateHashes);
    }

    if (autoHash) {
        hashInput.addEventListener('input', function () {
            if (autoHash.checked) {
                generateHashes();
            }
        });
    }

    if (verifyButton) {
        verifyButton.addEventListener('click', verifyHash);
    }

    document.querySelectorAll('[data-copy-hash]').forEach(function (button) {
        button.addEventListener('click', function () {
            const algorithm = button.dataset.copyHash;

            if (outputs[algorithm]) {
                copyText(outputs[algorithm].value, button);
            }
        });
    });

    if (downloadTxtButton) {
        downloadTxtButton.addEventListener('click', function () {
            if (!hashInput.value) {
                setStatus('Сначала введите текст и сгенерируйте hash.', 'error');
                return;
            }

            downloadText(
                buildTxtOutput(),
                'alttools-hashes.txt',
                'text/plain;charset=utf-8'
            );
        });
    }

    if (downloadJsonButton) {
        downloadJsonButton.addEventListener('click', function () {
            if (!hashInput.value) {
                setStatus('Сначала введите текст и сгенерируйте hash.', 'error');
                return;
            }

            downloadText(
                buildJsonOutput(),
                'alttools-hashes.json',
                'application/json;charset=utf-8'
            );
        });
    }
});