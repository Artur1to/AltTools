document.addEventListener('DOMContentLoaded', function () {
    const jsInput = document.getElementById('jsInput');
    const jsOutput = document.getElementById('jsOutput');

    const formatMode = document.getElementById('formatMode');
    const indentSize = document.getElementById('indentSize');
    const keepComments = document.getElementById('keepComments');
    const semicolons = document.getElementById('semicolons');
    const autoFormat = document.getElementById('autoFormat');

    const formatButton = document.getElementById('formatJs');
    const clearButton = document.getElementById('clearJs');
    const exampleButton = document.getElementById('loadJsExample');
    const swapButton = document.getElementById('swapJs');
    const copyButton = document.getElementById('copyJs');
    const downloadButton = document.getElementById('downloadJs');

    const originalSize = document.getElementById('originalSize');
    const resultSize = document.getElementById('resultSize');
    const linesCount = document.getElementById('linesCount');
    const functionsCount = document.getElementById('functionsCount');
    const statusBox = document.getElementById('jsStatus');

    function setStatus(text, type) {
        statusBox.textContent = text;
        statusBox.classList.remove('jsfmt-status_success', 'jsfmt-status_error');

        if (type === 'success') {
            statusBox.classList.add('jsfmt-status_success');
        }

        if (type === 'error') {
            statusBox.classList.add('jsfmt-status_error');
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

    function normalizeNewlines(code) {
        return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    function stripComments(code) {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/(^|[^:])\/\/.*$/gm, '$1');
    }

    function trimRightLines(code) {
        return code
            .split('\n')
            .map(function (line) {
                return line.trimEnd();
            })
            .join('\n');
    }

    function beautifyJavaScript(sourceCode) {
        let code = normalizeNewlines(sourceCode);

        if (!keepComments.checked) {
            code = stripComments(code);
        }

        let result = '';
        let buffer = '';
        let indentLevel = 0;
        let quote = null;
        let inLineComment = false;
        let inBlockComment = false;
        let inTemplate = false;

        function appendLine(text, extraIndent) {
            const cleanText = text.trim();

            if (!cleanText) {
                return;
            }

            result += repeatIndent(indentLevel + (extraIndent || 0)) + cleanText + '\n';
        }

        function flushBuffer(extraIndent) {
            appendLine(buffer, extraIndent || 0);
            buffer = '';
        }

        for (let index = 0; index < code.length; index += 1) {
            const char = code[index];
            const nextChar = code[index + 1];

            if (inLineComment) {
                buffer += char;

                if (char === '\n') {
                    flushBuffer();
                    inLineComment = false;
                }

                continue;
            }

            if (inBlockComment) {
                buffer += char;

                if (char === '*' && nextChar === '/') {
                    buffer += nextChar;
                    index += 1;
                    flushBuffer();
                    inBlockComment = false;
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

            if (inTemplate) {
                buffer += char;

                if (char === '\\') {
                    if (nextChar) {
                        buffer += nextChar;
                        index += 1;
                    }

                    continue;
                }

                if (char === '`') {
                    inTemplate = false;
                }

                continue;
            }

            if (char === '"' || char === "'") {
                quote = char;
                buffer += char;
                continue;
            }

            if (char === '`') {
                inTemplate = true;
                buffer += char;
                continue;
            }

            if (char === '/' && nextChar === '/') {
                if (buffer.trim()) {
                    flushBuffer();
                }

                buffer = '//';
                index += 1;
                inLineComment = true;
                continue;
            }

            if (char === '/' && nextChar === '*') {
                if (buffer.trim()) {
                    flushBuffer();
                }

                buffer = '/*';
                index += 1;
                inBlockComment = true;
                continue;
            }

            if (char === '{') {
                buffer = buffer.trim();

                if (buffer) {
                    appendLine(buffer + ' {');
                } else {
                    appendLine('{');
                }

                buffer = '';
                indentLevel += 1;
                continue;
            }

            if (char === '}') {
                flushBuffer();

                indentLevel -= 1;
                buffer = '}';

                const after = code.slice(index + 1).trimStart();

                if (after.startsWith('else') || after.startsWith('catch') || after.startsWith('finally') || after.startsWith('while')) {
                    buffer += ' ';
                } else {
                    flushBuffer();
                }

                continue;
            }

            if (char === ';') {
                buffer = buffer.trim();

                if (semicolons.checked) {
                    buffer += ';';
                }

                flushBuffer();
                continue;
            }

            if (char === ',') {
                buffer = buffer.trim() + ',';
                flushBuffer();
                continue;
            }

            if (char === '\n') {
                if (buffer.trim()) {
                    flushBuffer();
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

        flushBuffer();

        return trimRightLines(result)
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function shouldKeepSpace(prev, next) {
        if (!prev || !next) {
            return false;
        }

        return /[a-zA-Z0-9_$]/.test(prev) && /[a-zA-Z0-9_$]/.test(next);
    }

    function minifyJavaScript(sourceCode) {
        let code = normalizeNewlines(sourceCode);

        if (!keepComments.checked) {
            code = stripComments(code);
        }

        let result = '';
        let quote = null;
        let inTemplate = false;
        let inLineComment = false;
        let inBlockComment = false;
        let pendingSpace = false;

        for (let index = 0; index < code.length; index += 1) {
            const char = code[index];
            const nextChar = code[index + 1];

            if (inLineComment) {
                if (keepComments.checked) {
                    result += char;
                }

                if (char === '\n') {
                    inLineComment = false;
                }

                continue;
            }

            if (inBlockComment) {
                if (keepComments.checked) {
                    result += char;
                }

                if (char === '*' && nextChar === '/') {
                    if (keepComments.checked) {
                        result += nextChar;
                    }

                    index += 1;
                    inBlockComment = false;
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

            if (inTemplate) {
                result += char;

                if (char === '\\') {
                    if (nextChar) {
                        result += nextChar;
                        index += 1;
                    }

                    continue;
                }

                if (char === '`') {
                    inTemplate = false;
                }

                continue;
            }

            if (char === '"' || char === "'") {
                if (pendingSpace && shouldKeepSpace(result[result.length - 1], char)) {
                    result += ' ';
                }

                quote = char;
                result += char;
                pendingSpace = false;
                continue;
            }

            if (char === '`') {
                if (pendingSpace && shouldKeepSpace(result[result.length - 1], char)) {
                    result += ' ';
                }

                inTemplate = true;
                result += char;
                pendingSpace = false;
                continue;
            }

            if (char === '/' && nextChar === '/') {
                if (keepComments.checked) {
                    if (pendingSpace && shouldKeepSpace(result[result.length - 1], '/')) {
                        result += ' ';
                    }

                    result += '//';
                }

                index += 1;
                pendingSpace = false;
                inLineComment = true;
                continue;
            }

            if (char === '/' && nextChar === '*') {
                if (keepComments.checked) {
                    if (pendingSpace && shouldKeepSpace(result[result.length - 1], '/')) {
                        result += ' ';
                    }

                    result += '/*';
                }

                index += 1;
                pendingSpace = false;
                inBlockComment = true;
                continue;
            }

            if (/\s/.test(char)) {
                pendingSpace = true;
                continue;
            }

            if ('{}[]();,:?+-*/%=!<>|&^~'.includes(char)) {
                result = result.trimEnd();

                if (char === ';' && !semicolons.checked) {
                    pendingSpace = false;
                    continue;
                }

                result += char;
                pendingSpace = false;
                continue;
            }

            if (pendingSpace && shouldKeepSpace(result[result.length - 1], char)) {
                result += ' ';
            }

            result += char;
            pendingSpace = false;
        }

        return result.trim();
    }

    function checkBracketsBalance(code) {
        const pairs = {
            '{': '}',
            '[': ']',
            '(': ')'
        };

        const stack = [];
        let quote = null;
        let inTemplate = false;
        let inLineComment = false;
        let inBlockComment = false;

        for (let index = 0; index < code.length; index += 1) {
            const char = code[index];
            const nextChar = code[index + 1];

            if (inLineComment) {
                if (char === '\n') {
                    inLineComment = false;
                }

                continue;
            }

            if (inBlockComment) {
                if (char === '*' && nextChar === '/') {
                    index += 1;
                    inBlockComment = false;
                }

                continue;
            }

            if (quote) {
                if (char === '\\') {
                    index += 1;
                    continue;
                }

                if (char === quote) {
                    quote = null;
                }

                continue;
            }

            if (inTemplate) {
                if (char === '\\') {
                    index += 1;
                    continue;
                }

                if (char === '`') {
                    inTemplate = false;
                }

                continue;
            }

            if (char === '/' && nextChar === '/') {
                index += 1;
                inLineComment = true;
                continue;
            }

            if (char === '/' && nextChar === '*') {
                index += 1;
                inBlockComment = true;
                continue;
            }

            if (char === '"' || char === "'") {
                quote = char;
                continue;
            }

            if (char === '`') {
                inTemplate = true;
                continue;
            }

            if (pairs[char]) {
                stack.push(pairs[char]);
                continue;
            }

            if (char === '}' || char === ']' || char === ')') {
                const expected = stack.pop();

                if (expected !== char) {
                    return 'Внимание: возможно, в коде есть ошибка со скобками.';
                }
            }
        }

        if (stack.length) {
            return 'Внимание: не все скобки закрыты.';
        }

        return '';
    }

    function countLines(code) {
        if (!code) {
            return 0;
        }

        return code.split('\n').length;
    }

    function countFunctions(code) {
        const functionCount = (code.match(/\bfunction\b/g) || []).length;
        const arrowCount = (code.match(/=>/g) || []).length;

        return functionCount + arrowCount;
    }

    function updateStats(input, output) {
        originalSize.textContent = input.length;
        resultSize.textContent = output.length;
        linesCount.textContent = countLines(output);
        functionsCount.textContent = countFunctions(output);
    }

    function processJs() {
        const input = jsInput.value;

        if (!input.trim()) {
            jsOutput.value = '';
            updateStats('', '');
            setStatus('Вставьте JavaScript-код для обработки.', '');
            return;
        }

        let output = '';

        if (formatMode.value === 'minify') {
            output = minifyJavaScript(input);
        } else {
            output = beautifyJavaScript(input);
        }

        jsOutput.value = output;
        updateStats(input, output);

        const warning = checkBracketsBalance(input);

        if (warning) {
            setStatus(warning, 'error');
        } else {
            setStatus('JavaScript успешно обработан.', 'success');
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
            type: 'text/javascript;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    function loadExample() {
        jsInput.value = 'const users=[{name:"Ivan",age:25},{name:"Anna",age:30}];function getAdults(list){return list.filter(user=>user.age>=18).map(user=>({name:user.name,isAdult:true}));}console.log(getAdults(users));';
        processJs();
    }

    formatButton.addEventListener('click', processJs);

    clearButton.addEventListener('click', function () {
        jsInput.value = '';
        jsOutput.value = '';
        updateStats('', '');
        setStatus('Поля очищены.', '');
        jsInput.focus();
    });

    exampleButton.addEventListener('click', loadExample);

    swapButton.addEventListener('click', function () {
        if (!jsOutput.value) {
            return;
        }

        jsInput.value = jsOutput.value;
        processJs();
    });

    copyButton.addEventListener('click', function () {
        copyText(jsOutput.value, copyButton);
    });

    downloadButton.addEventListener('click', function () {
        downloadText(jsOutput.value, 'alttools-formatted.js');
    });

    [
        formatMode,
        indentSize,
        keepComments,
        semicolons
    ].forEach(function (element) {
        element.addEventListener('change', function () {
            if (autoFormat.checked) {
                processJs();
            }
        });
    });

    jsInput.addEventListener('input', function () {
        if (autoFormat.checked) {
            processJs();
        }
    });

    autoFormat.addEventListener('change', function () {
        if (autoFormat.checked) {
            processJs();
        }
    });

    updateStats('', '');
});