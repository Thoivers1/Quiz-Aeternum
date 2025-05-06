let currentQuestion = 0;
let score = 0;
let totalQuestions = 5;
let correctAnswer = "";
let wrongAnswers = []; // Stores incorrect answers for review

// Starts or restarts the quiz
function startQuiz() {
  currentQuestion = 0;
  score = 0;
  wrongAnswers = [];
  document.getElementById("scoreDisplay").textContent = "";
  document.getElementById("quizArea").style.display = "block";
  document.getElementById("restartBtn").style.display = "none";
  document.getElementById("reviewArea").innerHTML = "";
  loadNextQuestion();
}

// Loads a new question by fetching from the backend
function loadNextQuestion() {
    if (currentQuestion >= totalQuestions) {
      showFinalScore();
      return;
    }
    
    const category = document.getElementById("category").value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";
  
    document.getElementById("loader").style.display = "block"; // Show loader
  
    fetch("backend.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, difficulty })
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById("loader").style.display = "none"; // Hide loader
  
        document.getElementById("question").textContent = `Q${currentQuestion + 1}: ${data.question}`;
        correctAnswer = data.answer;
  
        const form = document.getElementById("answersForm");
        form.innerHTML = "";
        data.options.forEach((opt, index) => {
          const id = `option${index}`;
          form.innerHTML += `
            <input type="radio" id="${id}" name="answer" value="${opt}">
            <label class="option-label" for="${id}">${opt}</label><br>
          `;
        });
  
        form.dataset.question = data.question;
        form.dataset.correct = data.answer;
        form.dataset.options = JSON.stringify(data.options);
      });
  }

// Handles user answer submission
function submitAnswer() {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    alert("Please select an answer.");
    return;
  }

  const form = document.getElementById("answersForm");
  const userAnswer = selected.value;
  const correct = form.dataset.correct;
  const questionText = form.dataset.question;
  const options = JSON.parse(form.dataset.options);

  if (userAnswer.trim().toLowerCase() === correct.trim().toLowerCase()) {
    score++;
  } else {
    wrongAnswers.push({ question: questionText, correct, user: userAnswer, options });
  }

  currentQuestion++;
  document.getElementById("scoreDisplay").textContent = `Score: ${score}/${currentQuestion}`;
  loadNextQuestion();
}

// Displays final score and triggers explanation fetch if needed
function showFinalScore() {
  document.getElementById("question").innerHTML = `<strong>Game Over!</strong> Final Score: ${score}/${totalQuestions}`;
  document.getElementById("answersForm").innerHTML = "";
  document.getElementById("restartBtn").style.display = "inline";

  if (wrongAnswers.length > 0) {
    document.querySelector("#loader p").textContent = "Generating review... Please wait.";
    document.getElementById("loader").style.display = "block";
  
    fetch("review.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wrongAnswers })
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById("loader").style.display = "none";

      const reviewArea = document.getElementById("reviewArea");
      reviewArea.innerHTML = "<h3>Review of Incorrect Answers:</h3>";
      data.explanations.forEach((ex, i) => {
        reviewArea.innerHTML += `
          <div class="review-card">
            <p><strong>Q:</strong> ${wrongAnswers[i].question}</p>
            <p><strong>Your Answer:</strong> ${wrongAnswers[i].user}</p>
            <p><strong>Correct Answer:</strong> ${wrongAnswers[i].correct}</p>
            <p><strong>Explanation:</strong> ${ex}</p>
          </div>
        `;
      });
    });
  } 
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", startQuiz);
  document.getElementById("submitBtn").addEventListener("click", submitAnswer);
  document.getElementById("restartBtn").addEventListener("click", startQuiz);
});
