import { orderedQuestions } from "./script-questions.js";

function saveMarkedQuestions(markedQuestions) {
  localStorage.setItem('markedQuestions', JSON.stringify(Array.from(markedQuestions)));
}

document.addEventListener("DOMContentLoaded", () => {
  let currentQuestionIndex = 0;

  const questionElement = document.getElementById("question");
  const questionLabelElement = document.getElementById("question-label");
  const answerElement = document.getElementById("answer");

  function showQuestion() {
    questionElement.textContent = orderedQuestions[currentQuestionIndex].question;
    answerElement.textContent = orderedQuestions[currentQuestionIndex].answer;
    answerElement.hidden = false;
    questionLabelElement.textContent = `Question ${currentQuestionIndex + 1} of ${orderedQuestions.length}`;
    updateMarkForReviewBtn();
  }

  // ...

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
    saveMarkedQuestions(markedQuestions);
  });

  // Load marked questions from localStorage.
  const loadedMarkedQuestions = localStorage.getItem('markedQuestions');
  if (loadedMarkedQuestions) {
    const parsedMarkedQuestions = JSON.parse(loadedMarkedQuestions);
    parsedMarkedQuestions.forEach((questionIndex) => {
      markedQuestions.add(questionIndex);
    });
  }

  showQuestion();
});
