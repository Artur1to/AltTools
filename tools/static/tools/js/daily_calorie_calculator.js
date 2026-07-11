document.addEventListener('DOMContentLoaded', function () {
    const genderSelect = document.getElementById('calorieGender');
    const ageInput = document.getElementById('calorieAge');
    const heightInput = document.getElementById('calorieHeight');
    const weightInput = document.getElementById('calorieWeight');
    const activitySelect = document.getElementById('calorieActivity');
    const goalSelect = document.getElementById('calorieGoal');

    const resetButton = document.getElementById('calorieReset');
    const copyButton = document.getElementById('calorieCopyResult');

    const messageBox = document.getElementById('calorieMessage');
    const targetResultBox = document.getElementById('calorieTargetResult');
    const resultNoteBox = document.getElementById('calorieResultNote');

    const bmrResultBox = document.getElementById('calorieBmrResult');
    const maintainResultBox = document.getElementById('calorieMaintainResult');
    const proteinResultBox = document.getElementById('calorieProteinResult');
    const fatResultBox = document.getElementById('calorieFatResult');
    const carbsResultBox = document.getElementById('calorieCarbsResult');
    const goalResultBox = document.getElementById('calorieGoalResult');

    const exampleButtons = document.querySelectorAll('#calorieExamples button');

    let currentResult = null;

    function parseNumber(value) {
        const normalized = String(value)
            .replace(/\s/g, '')
            .replace(',', '.')
            .trim();

        if (!normalized) {
            return null;
        }

        const number = Number(normalized);

        if (!Number.isFinite(number)) {
            return null;
        }

        return number;
    }

    function formatNumber(value) {
        if (!Number.isFinite(value)) {
            return '—';
        }

        return Math.round(value).toLocaleString('ru-RU');
    }

    function formatCalories(value) {
        return `${formatNumber(value)} ккал`;
    }

    function formatGrams(value) {
        return `${formatNumber(value)} г`;
    }

    function setMessage(text, type) {
        messageBox.textContent = text;
        messageBox.classList.remove('calorie-message_error', 'calorie-message_success');

        if (type === 'error') {
            messageBox.classList.add('calorie-message_error');
        }

        if (type === 'success') {
            messageBox.classList.add('calorie-message_success');
        }
    }

    function clearResults() {
        currentResult = null;

        targetResultBox.textContent = '—';
        bmrResultBox.textContent = '—';
        maintainResultBox.textContent = '—';
        proteinResultBox.textContent = '—';
        fatResultBox.textContent = '—';
        carbsResultBox.textContent = '—';
        goalResultBox.textContent = '—';
        resultNoteBox.textContent = 'Введите данные для расчёта.';
    }

    function getGoalData(goal) {
        const goals = {
            maintain: {
                factor: 1,
                title: 'Поддержание веса',
                note: 'Калорийность рассчитана для поддержания текущего веса.'
            },
            lose_slow: {
                factor: 0.9,
                title: 'Плавное похудение',
                note: 'Калорийность рассчитана с умеренным дефицитом около 10%.'
            },
            lose_normal: {
                factor: 0.8,
                title: 'Похудение',
                note: 'Калорийность рассчитана с дефицитом около 20%.'
            },
            gain_slow: {
                factor: 1.1,
                title: 'Плавный набор',
                note: 'Калорийность рассчитана с небольшим профицитом около 10%.'
            },
            gain_normal: {
                factor: 1.15,
                title: 'Набор массы',
                note: 'Калорийность рассчитана с профицитом около 15%.'
            }
        };

        return goals[goal] || goals.maintain;
    }

    function calculateBmr(gender, weight, height, age) {
        if (gender === 'male') {
            return 10 * weight + 6.25 * height - 5 * age + 5;
        }

        return 10 * weight + 6.25 * height - 5 * age - 161;
    }

    function calculateCalories() {
        const gender = genderSelect.value;
        const age = parseNumber(ageInput.value);
        const height = parseNumber(heightInput.value);
        const weight = parseNumber(weightInput.value);
        const activity = Number(activitySelect.value);
        const goalData = getGoalData(goalSelect.value);

        if (age === null || age <= 0 || age > 120) {
            clearResults();
            setMessage('Введите корректный возраст.', 'error');
            return;
        }

        if (height === null || height <= 0 || height > 260) {
            clearResults();
            setMessage('Введите корректный рост.', 'error');
            return;
        }

        if (weight === null || weight <= 0 || weight > 400) {
            clearResults();
            setMessage('Введите корректный вес.', 'error');
            return;
        }

        const bmr = calculateBmr(gender, weight, height, age);
        const maintainCalories = bmr * activity;
        const targetCalories = maintainCalories * goalData.factor;

        const protein = weight * 1.6;
        const fat = weight * 0.9;
        const proteinCalories = protein * 4;
        const fatCalories = fat * 9;
        const carbs = Math.max(0, (targetCalories - proteinCalories - fatCalories) / 4);

        currentResult = {
            gender,
            age,
            height,
            weight,
            activity,
            goalTitle: goalData.title,
            bmr,
            maintainCalories,
            targetCalories,
            protein,
            fat,
            carbs
        };

        targetResultBox.textContent = formatCalories(targetCalories);
        bmrResultBox.textContent = formatCalories(bmr);
        maintainResultBox.textContent = formatCalories(maintainCalories);
        proteinResultBox.textContent = formatGrams(protein);
        fatResultBox.textContent = formatGrams(fat);
        carbsResultBox.textContent = formatGrams(carbs);
        goalResultBox.textContent = goalData.title;

        resultNoteBox.textContent = goalData.note;
        setMessage('Расчёт выполнен.', 'success');
    }

    function resetCalculator() {
        genderSelect.value = 'male';
        ageInput.value = '30';
        heightInput.value = '175';
        weightInput.value = '75';
        activitySelect.value = '1.55';
        goalSelect.value = 'maintain';

        calculateCalories();
    }

    function copyResult() {
        if (!currentResult) {
            setMessage('Нет результата для копирования.', 'error');
            return;
        }

        const genderText = currentResult.gender === 'male' ? 'мужской' : 'женский';

        const lines = [
            'Калькулятор суточной нормы калорий',
            `Пол: ${genderText}`,
            `Возраст: ${currentResult.age}`,
            `Рост: ${currentResult.height} см`,
            `Вес: ${currentResult.weight} кг`,
            `Цель: ${currentResult.goalTitle}`,
            `BMR: ${formatCalories(currentResult.bmr)}`,
            `Поддержание веса: ${formatCalories(currentResult.maintainCalories)}`,
            `Рекомендуемая норма: ${formatCalories(currentResult.targetCalories)}`,
            `Белки: ${formatGrams(currentResult.protein)}`,
            `Жиры: ${formatGrams(currentResult.fat)}`,
            `Углеводы: ${formatGrams(currentResult.carbs)}`
        ];

        navigator.clipboard.writeText(lines.join('\n')).then(function () {
            setMessage('Результат скопирован.', 'success');
        }).catch(function () {
            setMessage('Не удалось скопировать результат.', 'error');
        });
    }

    [
        genderSelect,
        ageInput,
        heightInput,
        weightInput,
        activitySelect,
        goalSelect
    ].forEach(function (element) {
        element.addEventListener('input', calculateCalories);
        element.addEventListener('change', calculateCalories);
    });

    resetButton.addEventListener('click', resetCalculator);
    copyButton.addEventListener('click', copyResult);

    exampleButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            genderSelect.value = button.dataset.gender;
            ageInput.value = button.dataset.age;
            heightInput.value = button.dataset.height;
            weightInput.value = button.dataset.weight;

            calculateCalories();
        });
    });

    calculateCalories();
});