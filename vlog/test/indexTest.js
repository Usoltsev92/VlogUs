const quizData = [
    {
        question: "Как объявить переменную в JS?",
        options: ["var x = 5", "variable x = 5", "x := 5", "x = 5"],
        correct: 0
    },
    {
        question: "Что выведет console.log(2 + '2')?",
        options: ["4", "22", "NaN", "Ошибка"],
        correct: 1
    },
    {
        question: "Какой метод добавляет элемент в конец массива?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correct: 0
    }
];

let currentQuestion = 0;
let score = 0;

function loadQuestion() {
    const quizElement = document.getElementById('quiz');
    const current = quizData[currentQuestion];
    
    quizElement.innerHTML = `
        <div class="question">${current.question}</div>
        <div class="options">
            ${current.options.map((option, index) => `
                <button onclick="checkAnswer(${index})">${option}</button>
            `).join('')}
        </div>
    `;
}

function checkAnswer(selectedIndex) {
    const current = quizData[currentQuestion];
    if (selectedIndex === current.correct) {
        score++;
    }
    
    currentQuestion++;
    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    const resultElement = document.getElementById('result');
    const percentage = Math.round((score / quizData.length) * 100);
    
    resultElement.textContent = `Твой результат: ${score} из ${quizData.length} (${percentage}%)`;
    resultElement.style.display = 'block';
}

// Запускаем квиз
loadQuestion();