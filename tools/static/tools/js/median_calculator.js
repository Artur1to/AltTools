document.addEventListener('DOMContentLoaded', function () {
    const numbersInput = document.getElementById('medianNumbers');
    const resultBox = document.getElementById('medianResult');
    const resultNote = document.getElementById('medianResultNote');
    const countBox = document.getElementById('medianCount');
    const typeBox = document.getElementById('medianType');
    const sortedBox = document.getElementById('medianSorted');
    const messageBox = document.getElementById('medianMessage');
    const stepsBox = document.getElementById('medianSteps');

    const exampleButton = document.getElementById('loadMedianExample');
    const clearButton = document.getElementById('clearMedian');

    function parseNumbers(value) {
        const matches = String(value).match(/[-+]?\d+(?:[.,]\d+)?/g);

        if (!matches) {
            return [];
        }

        return matches
            .map(function (item) {
                return Number(item.replace(',', '.'));
            })
            .filter(function (number) {
                return Number.isFinite(number);
            });
    }

    function formatNumber(value) {
        if (!Number.isFinite(value)) {
            return '—';
        }

        return Number(value.toFixed(10)).toLocaleString('ru-RU', {
            maximumFractionDigits: 10
        });
    }

    function formatArray(numbers) {
        return numbers.map(formatNumber).join(', ');
    }

    function setMessage(text, type) {
        messageBox.textContent = text;
        messageBox.classList.remove('median-message_error', 'median-message_success');

        if (type === 'error') {
            messageBox.classList.add('median-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('median-message_success');
        }
    }

    function renderDefaultSteps() {
        stepsBox.innerHTML = `
            <div>
                <strong>1. Введите числа</strong>
                <span>Например: 7, 2, 10, 4, 9</span>
            </div>

            <div>
                <strong>2. Отсортируйте ряд</strong>
                <span>Получится: 2, 4, 7, 9, 10</span>
            </div>

            <div>
                <strong>3. Найдите середину</strong>
                <span>В нечётном ряду медиана — центральное число.</span>
            </div>
        `;
    }

    function renderSteps(sortedNumbers, median) {
        const count = sortedNumbers.length;

        if (count === 0) {
            renderDefaultSteps();
            return;
        }

        if (count % 2 === 1) {
            const middleIndex = Math.floor(count / 2);
            const position = middleIndex + 1;

            stepsBox.innerHTML = `
                <div>
                    <strong>1. Сначала сортируем числа</strong>
                    <span>${formatArray(sortedNumbers)}</span>
                </div>

                <div>
                    <strong>2. Количество чисел нечётное</strong>
                    <span>Всего чисел: ${count}. Значит, медиана — одно центральное значение.</span>
                </div>

                <div>
                    <strong>3. Берём число посередине</strong>
                    <span>Центральная позиция: ${position}. Медиана = ${formatNumber(median)}.</span>
                </div>
            `;

            return;
        }

        const rightIndex = count / 2;
        const leftIndex = rightIndex - 1;

        const leftValue = sortedNumbers[leftIndex];
        const rightValue = sortedNumbers[rightIndex];

        stepsBox.innerHTML = `
            <div>
                <strong>1. Сначала сортируем числа</strong>
                <span>${formatArray(sortedNumbers)}</span>
            </div>

            <div>
                <strong>2. Количество чисел чётное</strong>
                <span>Всего чисел: ${count}. Значит, нужно взять два центральных значения.</span>
            </div>

            <div>
                <strong>3. Находим среднее двух центральных чисел</strong>
                <span>(${formatNumber(leftValue)} + ${formatNumber(rightValue)}) / 2 = ${formatNumber(median)}.</span>
            </div>
        `;
    }

    function calculateMedian() {
        const numbers = parseNumbers(numbersInput.value);

        if (numbers.length === 0) {
            resultBox.textContent = '—';
            resultNote.textContent = 'Результат появится после ввода чисел.';
            countBox.textContent = '—';
            typeBox.textContent = '—';
            sortedBox.textContent = '—';
            setMessage('Введите числа, чтобы рассчитать медиану.', '');
            renderDefaultSteps();
            return;
        }

        const sortedNumbers = numbers.slice().sort(function (a, b) {
            return a - b;
        });

        const count = sortedNumbers.length;
        let median = 0;

        if (count % 2 === 1) {
            median = sortedNumbers[Math.floor(count / 2)];
            typeBox.textContent = 'Нечётный';
            resultNote.textContent = 'Медиана — центральное число отсортированного ряда.';
        } else {
            const rightIndex = count / 2;
            const leftIndex = rightIndex - 1;

            median = (sortedNumbers[leftIndex] + sortedNumbers[rightIndex]) / 2;
            typeBox.textContent = 'Чётный';
            resultNote.textContent = 'Медиана — среднее двух центральных чисел.';
        }

        resultBox.textContent = formatNumber(median);
        countBox.textContent = String(count);
        sortedBox.textContent = formatArray(sortedNumbers);

        setMessage('Медиана рассчитана.', 'success');
        renderSteps(sortedNumbers, median);
    }

    numbersInput.addEventListener('input', calculateMedian);

    exampleButton.addEventListener('click', function () {
        numbersInput.value = '7, 2, 10, 4, 9';
        calculateMedian();
    });

    clearButton.addEventListener('click', function () {
        numbersInput.value = '';
        calculateMedian();
        numbersInput.focus();
    });

    calculateMedian();
});