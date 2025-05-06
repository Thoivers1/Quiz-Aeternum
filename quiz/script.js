let currentQuestion = 0;
let score = 0;
let totalQuestions = 5;
let correctAnswer = "";

function startQuiz() {
    console.log("Quiz started!");
    currentQuestion = 0;
    score = 0;
    document.getElementById("scoreDisplay").textContent = "";
    document.getElementById("quizArea").style.display = "block";
    document.getElementById("restartBtn").style.display = "none";
    loadNextQuestion();
}

function loadNextQuestion() { 
    if (currentQuestion >= totalQuestions) {
        document.getElementById("question").innerHTML = `<strong>Game Over!</strong> Final Score: ${score}/${totalQuestions}`;
        document.getElementById("answersForm").innerHTML = "";
        document.getElementById("restartBtn").style.display = "inline";
        return;
    }

    const category = document.getElementById("category").value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";

    fetch("backend.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("question").textContent = `Q${currentQuestion + 1}: ${data.question}`;
        correctAnswer = data.answer;

        const form = document.getElementById("answersForm");
        form.innerHTML = "";
        data.options.forEach((opt, index) => {
        const id = `option${index}`;
        form.innerHTML += `
            <input type="radio" id="${id}" name="answer" value="${opt}">
            <label class="option-label" for="${id}">${opt}</label>
        `;
        });

    });
}

function submitAnswer() {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) {
        alert("Please select an answer.");
        return;
    }

    if (selected.value.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
        score++;
    }

    currentQuestion++;
    document.getElementById("scoreDisplay").textContent = `Score: ${score}/${currentQuestion}`;
    loadNextQuestion(); 
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded - JS is working");

    document.getElementById("startBtn").addEventListener("click", startQuiz);
    document.getElementById("submitBtn").addEventListener("click", submitAnswer);
    document.getElementById("restartBtn").addEventListener("click", startQuiz);
});

