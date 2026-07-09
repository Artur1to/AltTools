document.addEventListener('DOMContentLoaded', function () {
    const cssInput = document.getElementById('cssInput');
    const cssOutput = document.getElementById('cssOutput');

    const formatMode = document.getElementById('formatMode');
    const indentSize = document.getElementById('indentSize');
    const keepComments = document.getElementById('keepComments');
    const breakSelectors = document.getElementById('breakSelectors');
    const autoFormat = document.getElementById('autoFormat');

    const formatButton = document.getElementById('formatCss');
    const clearButton = document.getElementById('clearCss');
    const exampleButton = document.getElementById('loadCssExample');
    const swapButton = document.getElementById('swapCss');
    const copyButton = document.getElementById('copyCss');
    const downloadButton = document.getElementById('downloadCss');

    const originalSize = document.getElementById('originalSize');
    const resultSize = document.getElementById('resultSize');
    const rulesCount = document.getElementById('rulesCount');
    const declarationsCount = document.getElementById('declarationsCount');
    const statusBox = document.getElementById('cssStatus');

    function setStatus(text, type) {
        statusBox.textContent = text;
        statusBox.classList.remove('cssfmt-status_success', 'cssfmt-status_error');

        if (type === 'success') {
            statusBox.classList.add('cssfmt-status_success');
        }

        if (type === 'error') {
            statusBox.classList.add('cssfmt-status_error');
        }
    }

    function getIndentUnit() {
        if (indentSize.value === 'tab') {
            return '\t';
        }

        return ' '.repeat(Number(indentSize.value));
    }

    function repeatIndent(level) {
        return getIndentUnit().repeat(Math.max(0, level));
    }

    function stripComments(css) {
        return css.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    function normalizeNewlines(css) {
        return css.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    function compactWhitespace(value) {
        return value.replace(/\s+/g, ' ').trim();
    }

    function beautifyCss(sourceCss) {
        let css = normalizeNewlines(sourceCss);

        if (!keepComments.checked) {
            css = stripComments(css);
        }

        let result = '';
        let buffer = '';
        let indentLevel = 0;
        let quote = null;
        let inComment = false;

        function flushBuffer(forceNewLine) {
            const text = compactWhitespace(buffer);

            if (text) {
                result += repeatIndent(indentLevel) + text;

                if (forceNewLine) {
                    result += '\n';
                }
            }

            buffer = '';
        }

        for (let index = 0; index < css.length; index += 1) {
            const char = css[index];
            const nextChar = css[index + 1];

            if (inComment) {
                buffer += char;

                if (char === '*' && nextChar === '/') {
                    buffer += nextChar;
                    index += 1;
                    inComment = false;

                    flushBuffer(true);
                }

                continue;
            }

            if (quote) {
                buffer += char;

                if (char === '\\') {
                    if (nextChar) {
                        buffer += nextChar;
                        index += 1;
                    }

                    continue;
                }

                if (char === quote) {
                    quote = null;
                }

                continue;
            }

            if (char === '"' || char === "'") {
                quote = char;
                buffer += char;
                continue;
            }

            if (char === '/' && nextChar === '*') {
                flushBuffer(true);
                inComment = true;
                buffer = '/*';
                index += 1;
                continue;
            }

            if (char === '{') {
                const selector = compactWhitespace(buffer);

                if (selector) {
                    if (breakSelectors.checked && selector.includes(',')) {
                        const parts = selector.split(',').map(function (part) {
                            return part.trim();
                        });

                        result += repeatIndent(indentLevel) + parts.join(',\n' + repeatIndent(indentLevel)) + ' {\n';
                    } else {
                        result += repeatIndent(indentLevel) + selector + ' {\n';
                    }
                } else {
                    result += repeatIndent(indentLevel) + '{\n';
                }

                buffer = '';
                indentLevel += 1;
                continue;
            }

            if (char === '}') {
                flushBuffer(true);
                indentLevel -= 1;

                if (result.endsWith('\n\n')) {
                    result = result.slice(0, -1);
                }

                result += repeatIndent(indentLevel) + '}\n\n';
                buffer = '';
                continue;
            }

            if (char === ';') {
                buffer = compactWhitespace(buffer);

                if (buffer) {
                    result += repeatIndent(indentLevel) + buffer.replace(/\s*:\s*/g, ': ') + ';\n';
                }

                buffer = '';
                continue;
            }

            if (char === ',') {
                buffer += ',';

                if (breakSelectors.checked && indentLevel === 0) {
                    buffer += '\n';
                }

                continue;
            }

            if (/\s/.test(char)) {
                if (buffer && !/\s$/.test(buffer)) {
                    buffer += ' ';
                }

                continue;
            }

            buffer += char;
        }

        flushBuffer(false);

        return result
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function shouldKeepSpace(prev, next) {
        if (!prev || !next) {
            return false;
        }

        return /[a-zA-Z0-9_-]/.test(prev) && /[a-zA-Z0-9_-]/.test(next);
    }

    function minifyCss(sourceCss) {
        let css = normalizeNewlines(sourceCss);

        if (!keepComments.checked) {
            css = stripComments(css);
        }

        let result = '';
        let quote = null;
        let inComment = false;
        let pendingSpace = false;

        for (let index = 0; index < css.length; index += 1) {
            const char = css[index];
            const nextChar = css[index + 1];

            if (inComment) {
                result += char;

                if (char === '*' && nextChar === '/') {
                    result += nextChar;
                    index += 1;
                    inComment = false;
                }

                continue;
            }

            if (quote) {
                result += char;

                if (char === '\\') {
                    if (nextChar) {
                        result += nextChar;
                        index += 1;
                    }

                    continue;
                }

                if (char === quote) {
                    quote = null;
                }

                continue;
            }

            if (char === '"' || char === "'") {
                if (pendingSpace && shouldKeepSpace(result[result.length - 1], char)) {
                    result += ' ';
                }

                pendingSpace = false;
                quote = char;
                result += char;
                continue;
            }

            if (char === '/' && nextChar === '*') {
                if (keepComments.checked) {
                    if (pendingSpace && shouldKeepSpace(result[result.length - 1], char)) {
                        result += ' ';
                    }

                    result += '/*';
                    inComment = true;
                }

                pendingSpace = false;
                index += 1;
                continue;
            }

            if (/\s/.test(char)) {
                pendingSpace = true;
                continue;
            }

            if ('{}:;,>+~'.includes(char)) {
                result = result.trimEnd();
                result += char;
                pendingSpace = false;
                continue;
            }

            if (pendingSpace && shouldKeepSpace(result[result.length - 1], char)) {
                result += ' ';
            }

            pendingSpace = false;
            result += char;
        }

        return result.trim();
    }

    function countRules(css) {
        return (css.match(/{/g) || []).length;
    }

    function countDeclarations(css) {
        return (css.match(/:/g) || []).length;
    }

    function checkCssBalance(css) {
        const openBraces = (css.match(/{/g) || []).length;
        const closeBraces = (css.match(/}/g) || []).length;

        if (openBraces !== closeBraces) {
            return 'Внимание: количество открывающих и закрывающих фигурных скобок не совпадает.';
        }

        return '';
    }

    function updateStats(input, output) {
        originalSize.textContent = input.length;
        resultSize.textContent = output.length;
        rulesCount.textContent = countRules(output);
        declarationsCount.textContent = countDeclarations(output);
    }

    function processCss() {
        const input = cssInput.value;

        if (!input.trim()) {
            cssOutput.value = '';
            updateStats('', '');
            setStatus('Вставьте CSS-код для обработки.', '');
            return;
        }

        let output = '';

        if (formatMode.value === 'minify') {
            output = minifyCss(input);
        } else {
            output = beautifyCss(input);
        }

        cssOutput.value = output;
        updateStats(input, output);

        const warning = checkCssBalance(input);

        if (warning) {
            setStatus(warning, 'error');
        } else {
            setStatus('CSS успешно обработан.', 'success');
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

    function downloadText(value, filename) {
        if (!value) {
            return;
        }

        const blob = new Blob([value], {
            type: 'text/css;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    function loadExample() {
        cssInput.value = 'body{margin:0;padding:0;font-family:Arial,sans-serif}.container{max-width:1200px;margin:0 auto;padding:24px}.card,.box{display:flex;gap:16px;color:#111;background:#fff;border-radius:16px}@media(max-width:768px){.container{padding:16px}.card{flex-direction:column}}';
        processCss();
    }

    formatButton.addEventListener('click', processCss);

    clearButton.addEventListener('click', function () {
        cssInput.value = '';
        cssOutput.value = '';
        updateStats('', '');
        setStatus('Поля очищены.', '');
        cssInput.focus();
    });

    exampleButton.addEventListener('click', loadExample);

    swapButton.addEventListener('click', function () {
        if (!cssOutput.value) {
            return;
        }

        cssInput.value = cssOutput.value;
        processCss();
    });

    copyButton.addEventListener('click', function () {
        copyText(cssOutput.value, copyButton);
    });

    downloadButton.addEventListener('click', function () {
        downloadText(cssOutput.value, 'alttools-formatted.css');
    });

    [
        formatMode,
        indentSize,
        keepComments,
        breakSelectors
    ].forEach(function (element) {
        element.addEventListener('change', function () {
            if (autoFormat.checked) {
                processCss();
            }
        });
    });

    cssInput.addEventListener('input', function () {
        if (autoFormat.checked) {
            processCss();
        }
    });

    autoFormat.addEventListener('change', function () {
        if (autoFormat.checked) {
            processCss();
        }
    });

    updateStats('', '');
});