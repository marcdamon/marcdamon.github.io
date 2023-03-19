
  const questions = [
    {
      question: "What are the requirements for a pilot to carry passengers as PIC?",
      answer: "The pilot must have completed 3 takeoffs & landings in the same category, class, and type (if a type rating is required) within the last 90 days."
    },
    {
      question: "What are the requirements for night currency to carry passengers as PIC?",
      answer: "The pilot must have completed 3 takeoffs & landings to a full stop within 1 hour after sunset to 1 hour before sunrise."
    },
    {
    question: "What are the \"6 HITS\" required to act as PIC under IFR or in weather conditions less than VFR minimums?",
    answer: "Within the 6 calendar months preceding the month of flight, the pilot must have completed 6 instrument approaches, holding procedures & tasks, and intercepting & tracking courses through the use of navigational electronic systems."
  },
  {
    question: "Can a pilot use a flight simulator or FTD to meet flight review requirements?",
    answer: "Yes, as long as it is used in an approved course by a training center under Part 142 and represents an aircraft for which the pilot is rated."
  },
  {
    question: "What must be recorded in a pilot's logbook to meet recent instrument experience requirements?",
    answer: "The location and type of each instrument approach accomplished, and the name of the safety pilot, if required."
  },
  {
    question: "What are the requirements for a safety pilot?",
    answer: "A safety pilot must hold at least a private pilot certificate with the appropriate category and class, have adequate vision forward and to each side of the aircraft, and the aircraft must have a dual control system."
  },
  {
    question: "If a pilot is not IFR current for more than 6 months, what is required to regain currency?",
    answer: "An Instrument Proficiency Check (IPC) administered by a CFII, examiner, or other approved person is required."
  },
  {
    question: "What are the minimum aeronautical experience requirements for an airplane-instrument rating?",
    answer: "50 hours of cross-country PIC time (with at least 10 hours in airplanes), 40 hours of actual or simulated instrument time (with at least 15 hours with a CFII), and specific cross-country and approach requirements detailed in the data provided."
  },
  {
    question: "What is the required frequency of a flight review to act as PIC?",
    answer: "A flight review is required since the beginning of the 24 calendar months before the month of the flight, consisting of a minimum of 1 hour of flight training and 1 hour of ground training conducted by an authorized instructor."
  }

    
  ];
  
  let currentQuestionIndex = 0;
  let reviewQuestions = [];
  
  const questionElement = document.getElementById("question");
  const questionLabelElement = document.getElementById("question-label");
  const answerElement = document.getElementById("answer");
  
  function showQuestion() {
    questionElement.textContent = questions[currentQuestionIndex].question;
    answerElement.textContent = questions[currentQuestionIndex].answer;
    answerElement.hidden = true;
    questionLabelElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  }
  
  document.getElementById("show-answer").addEventListener("click", () => {
    answerElement.hidden = !answerElement.hidden;
  });
  
  document.getElementById("save-for-review").addEventListener("click", () => {
    reviewQuestions.push(questions[currentQuestionIndex]);
  });
  
  document.getElementById("next-question").addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      alert("You've reached the end of the questions.");
    }
  });
  
  showQuestion();






// Add event listeners for the previous and next question buttons
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
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    currentQuestionIndex = questions.length - 1;
    alert("You've reached the end of the questions.");
  }
});

/*-----------------------------------------------------------
Study Guide home page
*/
document.getElementById("review-questions-answers").addEventListener("click", () => {
    // Implement the functionality for reviewing all questions with answers shown
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
  