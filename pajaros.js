const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const scoreGameDisplay = document.getElementById("scoreGame");
const timerGameDisplay = document.getElementById("timerGame");
const gameOverText = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const btnStart = document.getElementById("btnStart");

const formSection = document.getElementById("formSection");
const gameSection = document.getElementById("gameSection");
const rankingSection = document.getElementById("rankingSection");

let player = { name: "", formation: "" };
let score = 0;
let timeLeft = 60;
let gameInterval;
let birdInterval;

/* ------------ UTILITIES ------------ */
function showSection(section) {
    // Hide all sections and show only the requested one
    formSection.style.display = "none";
    gameSection.style.display = "none";
    rankingSection.style.display = "none";
    section.style.display = "block";
}

/* ------------ VISUAL EFFECTS ------------ */
function createHitEffect(x, y) {
    const effect = document.createElement("div");
    effect.classList.add("hit-effect");
    effect.style.left = (x - 30) + "px";
    effect.style.top = (y - 30) + "px";
    gameArea.appendChild(effect);
    setTimeout(() => effect.remove(), 500);
}

function createFloatingScore(x, y, points) {
    const floatingScore = document.createElement("div");
    floatingScore.classList.add("floating-score");
    floatingScore.textContent = "+" + points;
    floatingScore.style.left = x + "px";
    floatingScore.style.top = y + "px";
    gameArea.appendChild(floatingScore);
    setTimeout(() => floatingScore.remove(), 1000);
}

/* ------------ BIRD SPAWN ------------ */
function spawnBird() {
    const bird = document.createElement("div");
    bird.classList.add("bird");

    let rand = Math.random();
    if (rand < 0.6) {
        bird.classList.add("blue");
        bird.dataset.points = 1;
    } else if (rand < 0.9) {
        bird.classList.add("yellow");
        bird.dataset.points = 3;
    } else {
        bird.classList.add("special");
        bird.dataset.points = 5;
    }

    let x = Math.random() * (gameArea.clientWidth - 60);
    let y = Math.random() * (gameArea.clientHeight - 60);
    bird.style.left = x + "px";
    bird.style.top = y + "px";

    bird.addEventListener("click", () => {
        const points = parseInt(bird.dataset.points);
        score += points;
        scoreDisplay.textContent = "Score: " + score;
        scoreGameDisplay.textContent = score;

        const rect = bird.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();
        createHitEffect(rect.left - gameRect.left + 24, rect.top - gameRect.top + 24);
        createFloatingScore(rect.left - gameRect.left, rect.top - gameRect.top, points);

        bird.remove();
    });

    gameArea.appendChild(bird);

    let moveInterval = setInterval(() => {
        x = Math.random() * (gameArea.clientWidth - 60);
        y = Math.random() * (gameArea.clientHeight - 60);
        bird.style.left = x + "px";
        bird.style.top = y + "px";
    }, bird.classList.contains("special") ? 500 : 1000);

    setTimeout(() => {
        clearInterval(moveInterval);
        if (bird.parentNode) bird.remove();
    }, 3000);
}

/* ------------ START & END GAME ------------ */
function startGame() {
    score = 0;
    timeLeft = 60;
    scoreDisplay.textContent = "Score: 0";
    timerDisplay.textContent = "Time: 60";
    scoreGameDisplay.textContent = "0";
    timerGameDisplay.textContent = "60";
    gameOverText.style.display = "none";
    gameArea.innerHTML = "";

    birdInterval = setInterval(spawnBird, 1000);
    gameInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = "Time: " + timeLeft;
        timerGameDisplay.textContent = timeLeft;

        if (timeLeft === 40) {
            clearInterval(birdInterval);
            birdInterval = setInterval(spawnBird, 1200);
        }
        if (timeLeft === 20) {
            clearInterval(birdInterval);
            birdInterval = setInterval(spawnBird, 1500);
        }

        if (timeLeft <= 0) endGame();
    }, 1000);
}

function endGame() {
    clearInterval(birdInterval);
    clearInterval(gameInterval);
    gameArea.innerHTML = "";
    finalScore.textContent = score;
    gameOverText.style.display = "block";

    saveScore();
    renderRanking();

    // Show ranking after 2 seconds
    setTimeout(() => showSection(rankingSection), 2000);
}

/* ------------ RANKING ------------ */
function saveScore() {
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    ranking.push({ name: player.name, formation: player.formation, score: score });
    ranking.sort((a, b) => b.score - a.score);
    localStorage.setItem("ranking", JSON.stringify(ranking));
}

function renderRanking() {
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    const rankingList = document.getElementById("rankingList");
    rankingList.innerHTML = "";

    ranking.slice(0, 10).forEach((p, index) => {
        let li = document.createElement("li");
        li.innerHTML = `<strong>${p.name}</strong> (${p.formation}) - <span style="color: #FFD700;">${p.score} pts</span>`;
        rankingList.appendChild(li);
    });
}

/* ------------ FORM ------------ */
document.getElementById("formPlayer").addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("playerName").value.trim();
    const formationInput = document.getElementById("playerFormation").value.trim();

    if (!nameInput || !formationInput) {
        alert("⚠️ Please enter your name and education before continuing.");
        return;
    }

    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    let existingPlayerIndex = ranking.findIndex(
        (p) => p.name.toLowerCase() === nameInput.toLowerCase() &&
            p.formation.toLowerCase() === formationInput.toLowerCase()
    );

    if (existingPlayerIndex !== -1) {
        let confirmReplace = confirm(`⚠️ The player "${nameInput}" is already registered with education "${formationInput}".\nIf you continue, their previous score will be replaced.\nDo you want to continue?`);

        if (!confirmReplace) return; // Cancel and do not proceed to game

        // If accepted, remove previous score
        ranking.splice(existingPlayerIndex, 1);
        localStorage.setItem("ranking", JSON.stringify(ranking));
    }

    player.name = nameInput;
    player.formation = formationInput;

    showSection(gameSection);
    alert("✅ Player saved: " + player.name);
    startGame();
});

/* ------------ SHOW RANKING ON LOAD ------------ */
renderRanking();
