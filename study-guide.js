document.getElementById("review-questions-answers").addEventListener("click", () => {
  window.location.href = "questions-with-answers.html";
});

document.getElementById("review-questions").addEventListener("click", () => {
    window.location.href = "questions-without-answers.html";
});

document.getElementById("review-uncertain-questions").addEventListener("click", () => {
    // Implement the functionality for reviewing uncertain questions only
});

const randomToggle = document.getElementById("random-toggle");

function generateRandomOrder(length) {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }
  
  randomToggle.addEventListener("change", () => {
    if (randomToggle.checked) {
      // Show questions in random order
      const randomOrder = generateRandomOrder(questions.length);
      const randomQuestions = randomOrder.map(index => questions[index]);
      // Replace 'questions' variable with 'randomQuestions'
    } else {
      // Show questions in order
      // Use the original 'questions' variable
    }
  });
  

  randomToggle.addEventListener("change", () => {
    if (randomToggle.checked) {
      localStorage.setItem("randomOrder", "true");
    } else {
      localStorage.setItem("randomOrder", "false");
    }
  });
  