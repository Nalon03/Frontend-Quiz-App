// Define quiz questions and answers interface
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

let quizzes: Quiz[] = []; // Initialize empty array

// Fetch the quiz data from the JSON file
async function fetchQuizData() {
  try {
    const response = await fetch('./dist/data.json'); // Fetch the data.json file
    if (!response.ok) {
      throw new Error('Failed to fetch quiz data');
    }
    const data = await response.json(); // Parse the JSON response
    quizzes = data.quizzes; // Assign quizzes array
    
    // Once data is fetched, start the quiz or perform other actions
    startQuiz(); // Example: call a function to start the quiz
  } catch (error) {
    console.error('Error fetching quiz data:', error);
  }
}

// Call fetchQuizData to fetch the data when the DOM content is loaded
document.addEventListener("DOMContentLoaded", fetchQuizData);

// Function to toggle theme
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  // Store the current theme preference in localStorage
  const currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
  localStorage.setItem("theme", currentTheme);
}

// Function to load the theme preference from localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
}

// Function to start the quiz
function startQuiz() {
  let currentQuestion = 0;
  let score = 0;
  let currentCategory: string;

  // Elements
  const quizMenu = document.getElementById("quiz-menu")!;
  const quizQuestion = document.getElementById("quiz-question")!;
  const quizCompleted = document.getElementById("quiz-completed")!;
  const questionNumber = document.getElementById("question-number")!;
  const questionText = document.getElementById("question-text")!;
  const optionsContainer = document.querySelector(".options")!;
  const submitButton = document.getElementById("submit-answer")!;
  const scoreElement = document.getElementById("score")!;
  const themeToggle = document.getElementById("theme-toggle");

  // Load theme preference from localStorage
  loadTheme();

  themeToggle!.addEventListener("click", toggleTheme);

  // Function to display question
  function showQuestion(category: string) {
    currentCategory = category;
    const currentQuiz = quizzes.find(quiz => quiz.title === category);
    if (currentQuiz) {
      const currentQuestionData = currentQuiz.questions[currentQuestion];
      questionNumber.textContent = `Question ${currentQuestion + 1} of ${currentQuiz.questions.length}`;
      questionText.textContent = currentQuestionData.question;
      optionsContainer.innerHTML = '';

      currentQuestionData.options.forEach((option) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = option; // Assign the option value as the answer
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${option}`));
        optionsContainer.appendChild(label);
      });
    }
  }

  // Function to submit answer
  function submitAnswer() {
    const selectedOption = document.querySelector<HTMLInputElement>('input[name="answer"]:checked');
    if (!selectedOption) {
      alert("Please select an answer!");
      return;
    }

    const answer = selectedOption.value;
    const currentQuiz = quizzes.find(quiz => quiz.title === currentCategory);
    if (currentQuiz) {
      const correctAnswer = currentQuiz.questions[currentQuestion].answer;
      if (answer === correctAnswer) {
        score++;
      }
      currentQuestion++;
      if (currentQuestion < currentQuiz.questions.length) {
        showQuestion(currentCategory);
      } else {
        showCompleted();
      }
    }
  }

  // Function to show quiz completion
  function showCompleted() {
    quizQuestion.style.display = "none";
    quizCompleted.style.display = "block";
    scoreElement.textContent = `You scored ${score} out of ${quizzes.find(quiz => quiz.title === currentCategory)?.questions.length ?? 0}`;
  }

  // Function to play again
  function playAgain() {
    currentQuestion = 0;
    score = 0;
    showQuestion(currentCategory);
    quizCompleted.style.display = "none";
    quizQuestion.style.display = "block";
  }

  // Event Listeners
  quizMenu.addEventListener("click", (e) => {
    if (e.target instanceof HTMLButtonElement) {
      const category = e.target.dataset.category; // Get category from data-category attribute
      if (category) {
        showQuestion(category);
        quizMenu.style.display = "none";
        quizQuestion.style.display = "block";
      }
    }
  });

  submitButton.addEventListener("click", submitAnswer);

  document.getElementById("play-again")!.addEventListener("click", playAgain);
}
