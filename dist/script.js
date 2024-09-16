"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const quizMenu = document.getElementById("quiz-menu");
const quizQuestion = document.getElementById("question-wrapper");
const quizCompleted = document.getElementById("quiz-completed");
const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question-text");
const optionsContainer = document.querySelector(".options");
const submitButton = document.getElementById("submit-answer");
const scoreElement = document.getElementById("score");
const themeToggle = document.getElementById("theme-toggle");
const nextButton = document.getElementById("next-question");
const quizHeader = document.getElementById("quiz-category");
let quizzes = [];
// Fetch the quiz data from the JSON file
function fetchQuizData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("./dist/data.json");
            if (!response.ok) {
                throw new Error("Failed to fetch quiz data");
            }
            const data = yield response.json();
            quizzes = data.quizzes;
            startQuiz();
        }
        catch (error) {
            console.error("Error fetching quiz data:", error);
        }
    });
}
document.addEventListener("DOMContentLoaded", fetchQuizData);
function toggleTheme() {
    document.body.classList.toggle("dark-theme");
    const currentTheme = document.body.classList.contains("dark-theme")
        ? "dark"
        : "light";
    localStorage.setItem("theme", currentTheme);
}
// Function to load the theme preference from localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    }
    else {
        document.body.classList.remove("dark-theme");
    }
}
// Function to toggle theme for quiz buttons
function toggleQuizButtonTheme() {
    const quizButtons = document.querySelectorAll(".quiz-button");
    const quizImageButtons = document.querySelectorAll(".butt-image-h, .butt-image-c, .butt-image-j, .butt-image-a");
    quizButtons.forEach((button) => {
        button.classList.toggle("dark-theme");
    });
    quizImageButtons.forEach((button) => {
        button.classList.toggle("dark-theme");
    });
}
function toggleThemeAndButtons() {
    toggleTheme();
    toggleQuizButtonTheme();
    // Store the current theme preference in localStorage
    const currentTheme = document.body.classList.contains("dark-theme")
        ? "dark"
        : "light";
    localStorage.setItem("theme", currentTheme);
}
// Function to start the quiz
function startQuiz() {
    let currentQuestion = 0;
    let score = 0;
    let currentCategory;
    // Load theme preference from localStorage
    loadTheme();
    themeToggle.addEventListener("click", toggleThemeAndButtons);
    // Event listener for quiz menu buttons
    quizMenu.addEventListener("click", (e) => {
        if (e.target instanceof HTMLButtonElement) {
            const category = e.target.dataset.category;
            if (category) {
                showQuestion(category);
                const welcome = document.getElementById("welcome");
                if (welcome) {
                    welcome.style.display = "none";
                }
                // Hide the quiz menu
                quizMenu.style.display = "none";
                quizQuestion.style.display = "flex";
            }
        }
    });
    // Function to generate the HTML for the quiz menu
    function generateQuizMenu(quizzes) {
        const quizMenu = document.getElementById("quiz-menu");
        if (quizMenu) {
            const ul = document.createElement("ul");
            quizzes.forEach((quiz) => {
                const li = document.createElement("li");
                const button = document.createElement("button");
                const buttonText = document.createTextNode(quiz.title);
                button.classList.add("quiz-button");
                button.dataset.category = quiz.title;
                button.appendChild(buttonText);
                li.appendChild(button);
                const imageButton = document.createElement("button");
                const image = document.createElement("img");
                image.src = `./src${quiz.icon.substring(1)}`;
                imageButton.classList.add(`butt-image-${quiz.title.toLowerCase().charAt(0)}`);
                imageButton.appendChild(image);
                li.appendChild(imageButton);
                ul.appendChild(li);
            });
            quizMenu.appendChild(ul);
        }
    }
    generateQuizMenu(quizzes);
    // Function to display question
    function showQuestion(category) {
        currentCategory = category;
        quizHeader.style.display = "block";
        const currentQuiz = quizzes.find((quiz) => quiz.title === category);
        if (currentQuiz) {
            // Displaying category title with icon
            const iconPath = `./src/${currentQuiz.icon}`;
            quizHeader.innerHTML = `<button class="icon-button"><img src="${iconPath}" alt="${category}" /></button> ${category}`;
            const currentQuestionData = currentQuiz.questions[currentQuestion];
            questionNumber.textContent = `Question ${currentQuestion + 1} of ${currentQuiz.questions.length}`;
            questionText.textContent = currentQuestionData.question;
            optionsContainer.innerHTML = "";
            const optionLabels = ["A", "B", "C", "D"];
            currentQuestionData.options.forEach((option, index) => {
                const label = document.createElement("label");
                const input = document.createElement("input");
                input.type = "radio";
                input.name = "answer";
                input.value = option;
                label.appendChild(input);
                const optionLabelSpan = document.createElement("span");
                optionLabelSpan.className = "option-label";
                optionLabelSpan.textContent = optionLabels[index];
                label.appendChild(optionLabelSpan);
                label.appendChild(document.createTextNode(`${option}`));
                optionsContainer.appendChild(label);
                input.addEventListener("change", () => {
                    // Remove highlight class from all labels
                    document.querySelectorAll(".options label").forEach((label) => {
                        label.classList.remove("highlight");
                    });
                    document
                        .querySelectorAll(".option-label")
                        .forEach((optionLabelSpan) => {
                        optionLabelSpan.classList.remove("highlight");
                    });
                    // Add highlight class to the clicked label and its corresponding option-label
                    if (input.checked) {
                        label.classList.add("highlight");
                        optionLabelSpan.classList.add("highlight");
                    }
                });
            });
            adjustLoaderWidth();
        }
    }
    // Function to submit answer
    function submitAnswer() {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (!selectedOption) {
            showAlert("Please select an answer!");
            return;
        }
        const currentQuiz = quizzes.find((quiz) => quiz.title === currentCategory);
        if (currentQuiz) {
            const correctAnswer = currentQuiz.questions[currentQuestion].answer;
            if (selectedOption.value === correctAnswer) {
                score++;
            }
            const options = document.querySelectorAll('input[name="answer"]');
            options.forEach((option) => {
                var _a, _b, _c;
                (_a = option.parentElement) === null || _a === void 0 ? void 0 : _a.classList.remove("correct", "wrong");
                if (option.value === correctAnswer) {
                    (_b = option.parentElement) === null || _b === void 0 ? void 0 : _b.classList.add("correct");
                    document.querySelectorAll(".options label").forEach((label) => {
                        label.classList.remove("highlight");
                    });
                    document
                        .querySelectorAll(".option-label")
                        .forEach((optionLabelSpan) => {
                        optionLabelSpan.classList.remove("highlight");
                    });
                }
                else if (option.checked && option.value !== correctAnswer) {
                    (_c = option.parentElement) === null || _c === void 0 ? void 0 : _c.classList.add("wrong");
                    document.querySelectorAll(".options label").forEach((label) => {
                        label.classList.remove("highlight");
                    });
                    document
                        .querySelectorAll(".option-label")
                        .forEach((optionLabelSpan) => {
                        optionLabelSpan.classList.remove("highlight");
                    });
                }
            });
            submitButton.style.display = "none";
            nextButton.style.display = "block";
            clearAlert(); // Clear alert message when option is selected
        }
    }
    // Function to show alert message
    function showAlert(message) {
        const alertDiv = document.getElementById("alert");
        if (alertDiv) {
            const alertMessage = document.createElement("div");
            alertMessage.classList.add("alert-message");
            alertMessage.textContent = message;
            alertDiv.innerHTML = "";
            alertDiv.appendChild(alertMessage);
        }
        else {
            alert(message);
        }
    }
    // Function to clear alert message
    function clearAlert() {
        const alertDiv = document.getElementById("alert");
        if (alertDiv) {
            alertDiv.innerHTML = "";
        }
    }
    nextButton.addEventListener("click", () => {
        const currentQuiz = quizzes.find((quiz) => quiz.title === currentCategory);
        if (currentQuiz) {
            if (currentQuestion < currentQuiz.questions.length - 1) {
                currentQuestion++;
                showQuestion(currentCategory);
                submitButton.style.display = "block";
                nextButton.style.display = "none";
            }
            else {
                showCompleted();
                submitButton.style.display = "none";
                nextButton.style.display = "none";
            }
        }
    });
    // Function to show quiz completion
    function showCompleted() {
        quizQuestion.style.display = "none";
        quizCompleted.style.display = "block";
        const currentQuiz = quizzes.find((quiz) => quiz.title === currentCategory);
        if (currentQuiz) {
            const iconPath = `./src/${currentQuiz.icon}`;
            const categoryHTML = `<div class="score-details-top" ><img src="${iconPath}" alt="${currentCategory}" /> <div>${currentCategory}</div></div>`;
            scoreElement.innerHTML = `<div class="score-details">${categoryHTML}<br><span class="score-main">${score}</span></div><br> <span class="score-divider">out of <span class="question-count">${currentQuiz.questions.length}</span></span>`;
        }
    }
    // Function to play again
    function playAgain() {
        currentQuestion = 0;
        score = 0;
        showQuestion(currentCategory);
        quizCompleted.style.display = "none";
        quizQuestion.style.display = "flex";
        submitButton.style.display = "block";
    }
    // Function to adjust the width of the loader
    function adjustLoaderWidth() {
        const loader = document.getElementById("loader");
        const currentQuiz = quizzes.find((quiz) => quiz.title === currentCategory);
        if (currentQuiz) {
            const loaderWidth = ((currentQuestion + 1) / currentQuiz.questions.length) * 100;
            loader.style.width = `${loaderWidth}%`;
        }
    }
    // Event Listeners
    submitButton.addEventListener("click", submitAnswer);
    document.getElementById("play-again").addEventListener("click", playAgain);
}
//# sourceMappingURL=script.js.map