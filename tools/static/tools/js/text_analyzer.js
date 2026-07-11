document.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('textAnalyzerInput');
    const clearButton = document.getElementById('textAnalyzerClear');
    const messageBox = document.getElementById('textAnalyzerMessage');

    const statCharacters = document.getElementById('statCharacters');
    const statCharactersNoSpaces = document.getElementById('statCharactersNoSpaces');
    const statWords = document.getElementById('statWords');
    const statLines = document.getElementById('statLines');
    const statSentences = document.getElementById('statSentences');
    const statParagraphs = document.getElementById('statParagraphs');

    function formatNumber(number) {
        return Number(number).toLocaleString('ru-RU');
    }

    function countWords(text) {
        const matches = text.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)?/gu);
        return matches ? matches.length : 0;
    }

    function countSentences(text) {
        const cleaned = text.trim();

        if (!cleaned) {
            return 0;
        }

        const matches = cleaned.match(/[^.!?…]+[.!?…]+/g);
        const withoutMarks = cleaned.replace(/[^.!?…]+[.!?…]+/g, '').trim();

        let count = matches ? matches.length : 0;

        if (withoutMarks.length > 0) {
            count += 1;
        }

        return count;
    }

    function countLines(text) {
        if (!text) {
            return 0;
        }

        return text.split(/\r\n|\r|\n/).length;
    }

    function countParagraphs(text) {
        const cleaned = text.trim();

        if (!cleaned) {
            return 0;
        }

        return cleaned
            .split(/\n\s*\n+/)
            .map(function (paragraph) {
                return paragraph.trim();
            })
            .filter(Boolean)
            .length;
    }

    function updateStats() {
        const text = textarea.value;

        statCharacters.textContent = formatNumber(text.length);
        statCharactersNoSpaces.textContent = formatNumber(text.replace(/\s/g, '').length);
        statWords.textContent = formatNumber(countWords(text));
        statLines.textContent = formatNumber(countLines(text));
        statSentences.textContent = formatNumber(countSentences(text));
        statParagraphs.textContent = formatNumber(countParagraphs(text));

        if (text.trim()) {
            messageBox.textContent = 'Статистика текста обновлена.';
        } else {
            messageBox.textContent = 'Введите текст, чтобы увидеть статистику.';
        }
    }

    function setText(value, message) {
        textarea.value = value;
        updateStats();

        if (message) {
            messageBox.textContent = message;
        }

        textarea.focus();
    }

    function removeExtraSpaces(text) {
        return text
            .split(/\r\n|\r|\n/)
            .map(function (line) {
                return line.replace(/[ \t]+/g, ' ').trim();
            })
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function removeEmptyLines(text) {
        return text
            .split(/\r\n|\r|\n/)
            .map(function (line) {
                return line.trim();
            })
            .filter(function (line) {
                return line.length > 0;
            })
            .join('\n');
    }

    function toSentenceCase(text) {
        const lower = text.toLowerCase();

        return lower.replace(/(^\s*[а-яёa-z])|([.!?…]\s+[а-яёa-z])/gimu, function (match) {
            return match.toUpperCase();
        });
    }

    function capitalizeWords(text) {
        return text.toLowerCase().replace(/(^|[\s.,;:!?()[\]{}"'«»\-—])([\p{L}])/gu, function (match, separator, letter) {
            return separator + letter.toUpperCase();
        });
    }

    function invertCase(text) {
        return Array.from(text).map(function (char) {
            const upper = char.toUpperCase();
            const lower = char.toLowerCase();

            if (char === upper && char !== lower) {
                return lower;
            }

            if (char === lower && char !== upper) {
                return upper;
            }

            return char;
        }).join('');
    }

    function copyText() {
        const text = textarea.value;

        if (!text) {
            messageBox.textContent = 'Нет текста для копирования.';
            return;
        }

        navigator.clipboard.writeText(text).then(function () {
            messageBox.textContent = 'Текст скопирован.';
        }).catch(function () {
            textarea.select();
            document.execCommand('copy');
            messageBox.textContent = 'Текст скопирован.';
        });
    }

    document.querySelectorAll('[data-action]').forEach(function (button) {
        button.addEventListener('click', function () {
            const action = button.dataset.action;
            const text = textarea.value;

            if (action === 'trim-spaces') {
                setText(removeExtraSpaces(text), 'Лишние пробелы удалены.');
            }

            if (action === 'remove-empty-lines') {
                setText(removeEmptyLines(text), 'Пустые строки удалены.');
            }

            if (action === 'uppercase') {
                setText(text.toUpperCase(), 'Текст переведён в верхний регистр.');
            }

            if (action === 'lowercase') {
                setText(text.toLowerCase(), 'Текст переведён в нижний регистр.');
            }

            if (action === 'sentence-case') {
                setText(toSentenceCase(text), 'Текст приведён к регистру предложений.');
            }

            if (action === 'capitalize-words') {
                setText(capitalizeWords(text), 'Каждое слово начинается с заглавной буквы.');
            }

            if (action === 'invert-case') {
                setText(invertCase(text), 'Регистр текста инвертирован.');
            }

            if (action === 'copy') {
                copyText();
            }
        });
    });

    if (clearButton) {
        clearButton.addEventListener('click', function () {
            setText('', 'Текст очищен.');
        });
    }

    textarea.addEventListener('input', updateStats);

    updateStats();
});