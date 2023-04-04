import { orderedQuestions } from "./script-questions.js";

function getQuestion(index) {
  return orderedQuestions[index];
}

function getTotalQuestions() {
  return orderedQuestions.length;
}

export { getQuestion, getTotalQuestions };
