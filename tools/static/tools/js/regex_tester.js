document.addEventListener('DOMContentLoaded', function () {
    const patternInput = document.getElementById('regexPattern');
    const flagCheckboxes = document.querySelectorAll('.regex-flag');
    const flagsPreview = document.getElementById('regexFlagsPreview');
    const testText = document.getElementById('regexTestText');
    const replaceInput = document.getElementById('regexReplace');

    const runButton = document.getElementById('runRegex');
    const clearButton = document.getElementById('clearRegex');
    const exampleButton = document.getElementById('loadRegexExample');

    const statusBox = document.getElementById('regexStatus');
    const matchCount = document.getElementById('matchCount');
    const groupCount = document.getElementById('groupCount');
    const regexTime = document.getElementById('regexTime');

    const highlightBox = document.getElementById('regexHighlight');
    const matchesTableBody = document.getElementById('matchesTableBody');
    const replaceResult = document.getElementById('replaceResult');

    const copyJsonButton = document.getElementById('copyMatchesJson');
    const downloadJsonButton = document.getElementById('downloadRegexJson');
    const downloadTxtButton = document.getElementById('downloadMatchesTxt');
    const copyReplaceButton = document.getElementById('copyReplaceResult');
    const copyTextButton = document.getElementById('copyHighlightedText');

    let lastMatches = [];
    let lastReplaceResult = '';

    function setStatus(text, type) {
        statusBox.textContent = text;
        statusBox.classList.remove('regex-status_success', 'regex-status_error');

        if (type === 'success') {
            statusBox.classList.add('regex-status_success');
        }

        if (type === 'error') {
            statusBox.classList.add('regex-status_error');
        }
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getFlags() {
        return Array.from(flagCheckboxes)
            .filter(function (checkbox) {
                return checkbox.checked;
            })
            .map(function (checkbox) {
                return checkbox.value;
            })
            .join('');
    }

    function updateFlagsPreview() {
        flagsPreview.textContent = getFlags() || '—';
    }

    function buildRegex() {
        const pattern = patternInput.value;

        if (!pattern) {
            throw new Error('Введите регулярное выражение.');
        }

        return new RegExp(pattern, getFlags());
    }

    function getGroups(match) {
        const groups = [];

        for (let index = 1; index < match.length; index += 1) {
            groups.push(match[index] === undefined ? null : match[index]);
        }

        return groups;
    }

    function collectMatches(regex, value) {
        const matches = [];
        const isGlobal = regex.flags.includes('g');

        if (isGlobal) {
            let match;

            while ((match = regex.exec(value)) !== null) {
                matches.push({
                    index: match.index,
                    match: match[0],
                    groups: getGroups(match),
                    namedGroups: match.groups || null
                });

                if (match[0] === '') {
                    regex.lastIndex += 1;
                }
            }
        } else {
            const match = regex.exec(value);

            if (match) {
                matches.push({
                    index: match.index,
                    match: match[0],
                    groups: getGroups(match),
                    namedGroups: match.groups || null
                });
            }
        }

        return matches;
    }

    function renderHighlightedText(value, matches) {
        if (!value) {
            highlightBox.textContent = 'Введите тестовый текст.';
            return;
        }

        if (!matches.length) {
            highlightBox.textContent = value;
            return;
        }

        let html = '';
        let cursor = 0;

        matches.forEach(function (item) {
            const start = item.index;
            const end = item.index + item.match.length;

            html += escapeHtml(value.slice(cursor, start));
            html += '<mark>' + escapeHtml(value.slice(start, end) || '∅') + '</mark>';

            cursor = end;
        });

        html += escapeHtml(value.slice(cursor));

        highlightBox.innerHTML = html;
    }

    function renderMatchesTable(matches) {
        matchesTableBody.innerHTML = '';

        if (!matches.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');

            cell.colSpan = 4;
            cell.textContent = 'Совпадений не найдено.';

            row.appendChild(cell);
            matchesTableBody.appendChild(row);
            return;
        }

        matches.forEach(function (item, index) {
            const row = document.createElement('tr');

            const numberCell = document.createElement('td');
            numberCell.textContent = index + 1;

            const matchCell = document.createElement('td');
            const matchCode = document.createElement('code');
            matchCode.textContent = item.match || '∅';
            matchCell.appendChild(matchCode);

            const indexCell = document.createElement('td');
            indexCell.textContent = item.index;

            const groupsCell = document.createElement('td');

            if (item.groups.length || item.namedGroups) {
                const groupsCode = document.createElement('code');

                groupsCode.textContent = JSON.stringify({
                    groups: item.groups,
                    namedGroups: item.namedGroups
                }, null, 2);

                groupsCell.appendChild(groupsCode);
            } else {
                groupsCell.textContent = '—';
            }

            row.appendChild(numberCell);
            row.appendChild(matchCell);
            row.appendChild(indexCell);
            row.appendChild(groupsCell);

            matchesTableBody.appendChild(row);
        });
    }

    function getMaxGroupCount(matches) {
        if (!matches.length) {
            return 0;
        }

        return matches.reduce(function (max, item) {
            return Math.max(max, item.groups.length);
        }, 0);
    }

    function runRegex() {
        const startedAt = performance.now();

        try {
            const regex = buildRegex();
            const value = testText.value;

            lastMatches = collectMatches(regex, value);

            renderHighlightedText(value, lastMatches);
            renderMatchesTable(lastMatches);

            lastReplaceResult = value.replace(regex, replaceInput.value || '');
            replaceResult.value = lastReplaceResult;

            matchCount.textContent = lastMatches.length;
            groupCount.textContent = getMaxGroupCount(lastMatches);
            regexTime.textContent = Math.max(0, Math.round(performance.now() - startedAt)) + ' мс';

            if (lastMatches.length) {
                setStatus('Regex успешно выполнен. Найдено совпадений: ' + lastMatches.length + '.', 'success');
            } else {
                setStatus('Regex выполнен, совпадений не найдено.', '');
            }
        } catch (error) {
            lastMatches = [];
            lastReplaceResult = '';

            matchCount.textContent = '0';
            groupCount.textContent = '0';
            regexTime.textContent = '0 мс';

            highlightBox.textContent = 'Ошибка регулярного выражения.';
            matchesTableBody.innerHTML = '<tr><td colspan="4">Ошибка Regex.</td></tr>';
            replaceResult.value = '';

            setStatus(error.message, 'error');
        }
    }

    function buildJsonOutput() {
        return JSON.stringify({
            tool: 'AltTools Regex Tester',
            generated_at: new Date().toISOString(),
            pattern: patternInput.value,
            flags: getFlags(),
            test_text: testText.value,
            replacement: replaceInput.value,
            matches_count: lastMatches.length,
            matches: lastMatches,
            replace_result: lastReplaceResult
        }, null, 2);
    }

    function buildTxtOutput() {
        const lines = [];

        lines.push('AltTools Regex Tester');
        lines.push('');
        lines.push('Regex: /' + patternInput.value + '/' + getFlags());
        lines.push('');
        lines.push('Matches: ' + lastMatches.length);
        lines.push('');

        lastMatches.forEach(function (item, index) {
            lines.push('#' + (index + 1));
            lines.push('Match: ' + item.match);
            lines.push('Index: ' + item.index);
            lines.push('Groups: ' + JSON.stringify(item.groups));
            lines.push('');
        });

        lines.push('Replace result:');
        lines.push(lastReplaceResult);

        return lines.join('\n');
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

    function loadExample() {
        patternInput.value = '([\\w.-]+)@([\\w.-]+\\.\\w+)';
        testText.value = [
            'Users:',
            'ivan@example.com',
            'admin@alttools.ru',
            'wrong-email',
            'support@test.org'
        ].join('\n');

        replaceInput.value = 'Email: $&';

        flagCheckboxes.forEach(function (checkbox) {
            checkbox.checked = checkbox.value === 'g';
        });

        updateFlagsPreview();
        runRegex();
    }

    document.querySelectorAll('.regex-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.regex-tab').forEach(function (item) {
                item.classList.toggle('regex-tab_active', item === tab);
            });

            document.querySelectorAll('.regex-panel').forEach(function (panel) {
                panel.classList.remove('regex-panel_active');
            });

            const panelId = tab.dataset.tab + 'Panel';
            const panel = document.getElementById(panelId);

            if (panel) {
                panel.classList.add('regex-panel_active');
            }
        });
    });

    flagCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            updateFlagsPreview();
            runRegex();
        });
    });

    patternInput.addEventListener('input', runRegex);
    testText.addEventListener('input', runRegex);
    replaceInput.addEventListener('input', runRegex);

    runButton.addEventListener('click', runRegex);

    clearButton.addEventListener('click', function () {
        patternInput.value = '';
        testText.value = '';
        replaceInput.value = '';
        replaceResult.value = '';
        highlightBox.textContent = 'Совпадения появятся здесь.';
        matchesTableBody.innerHTML = '<tr><td colspan="4">Пока нет совпадений.</td></tr>';

        lastMatches = [];
        lastReplaceResult = '';

        matchCount.textContent = '0';
        groupCount.textContent = '0';
        regexTime.textContent = '0 мс';

        setStatus('Поля очищены.', '');
        patternInput.focus();
    });

    exampleButton.addEventListener('click', loadExample);

    copyJsonButton.addEventListener('click', function () {
        copyText(buildJsonOutput(), copyJsonButton);
    });

    downloadJsonButton.addEventListener('click', function () {
        downloadText(
            buildJsonOutput(),
            'alttools-regex-result.json',
            'application/json;charset=utf-8'
        );
    });

    downloadTxtButton.addEventListener('click', function () {
        downloadText(
            buildTxtOutput(),
            'alttools-regex-result.txt',
            'text/plain;charset=utf-8'
        );
    });

    copyReplaceButton.addEventListener('click', function () {
        copyText(replaceResult.value, copyReplaceButton);
    });

    copyTextButton.addEventListener('click', function () {
        copyText(testText.value, copyTextButton);
    });

    updateFlagsPreview();
});