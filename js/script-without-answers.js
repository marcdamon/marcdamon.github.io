import { getQuestion, getTotalQuestions } from "./dataAccess.js";

function saveMarkedQuestions() {
  localStorage.setItem('markedQuestions', JSON.stringify(Array.from(markedQuestions)));
}

function loadMarkedQuestions() {
  const loadedMarkedQuestions = localStorage.getItem('markedQuestions');
  if (loadedMarkedQuestions) {
    const parsedMarkedQuestions = JSON.parse(loadedMarkedQuestions);
    parsedMarkedQuestions.forEach((questionIndex) => {
      markedQuestions.add(questionIndex);
    });
  }
}

let currentQuestionIndex = 0;

const questionElement = document.getElementById("question");
const questionLabelElement = document.getElementById("question-label");
const answerElement = document.getElementById("answer");

function showQuestion() {
  const currentQuestion = getQuestion(currentQuestionIndex);
  questionElement.textContent = currentQuestion.question;
  answerElement.textContent = currentQuestion.answer;
  questionLabelElement.textContent = `Question ${currentQuestionIndex + 1} of ${getTotalQuestions()}`;
  updateMarkForReviewBtn();

  // Set the visibility of the answers
  answerElement.hidden = true; // Always hide the answers on the page without answers
  document.getElementById("show-answer").textContent = "Show Answer";
}


document.getElementById("show-answer").addEventListener("click", () => {
  answerElement.hidden = !answerElement.hidden;
  if (answerElement.hidden) {
    document.getElementById("show-answer").textContent = "Show Answer";
  } else {
    document.getElementById("show-answer").textContent = "Hide Answer";
  }
});

document.getElementById("prev-question").addEventListener("click", () => {
  currentQuestionIndex--;
  if (currentQuestionIndex >= 0) {
    showQuestion();
  } else {
    currentQuestionIndex = 0;
    alert("You've reached the beginning of the questions.");
  }
});

document.getElementById("next-question").addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < getTotalQuestions()) {
    showQuestion();
  } else {
    currentQuestionIndex = orderedQuestions.length - 1;
    alert("You've reached the end of the questions.");
  }
});

const markForReviewBtn = document.getElementById("mark-for-review");
const markedQuestions = new Set();

function updateMarkForReviewBtn() {
  if (markedQuestions.has(currentQuestionIndex)) {
    markForReviewBtn.textContent = "Unmark for review";
  } else {
    markForReviewBtn.textContent = "Mark for review";
  }
}

markForReviewBtn.addEventListener("click", () => {
  if (markedQuestions.has(currentQuestionIndex)) {
    markedQuestions.delete(currentQuestionIndex);
  } else {
    markedQuestions.add(currentQuestionIndex);
  }
  updateMarkForReviewBtn();
  saveMarkedQuestions();
});

// Load marked questions from localStorage.
loadMarkedQuestions();

showQuestion();
