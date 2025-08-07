const firebaseConfig = {
  apiKey: "AIzaSyBJMbQO7gV2GE5_KtdyUwrjQGyEwC9-li8",
  authDomain: "catch-acm.firebaseapp.com",
  databaseURL: "https://catch-acm-default-rtdb.europe-west1.firebasedatabase.app/", 
  projectId: "catch-acm",
  storageBucket: "catch-acm.firebasestorage.app",
  messagingSenderId: "29606956412",
  appId: "1:29606956412:web:c61a142bb1ee2c337968f9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const logo = document.getElementById("acm-logo");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const scoresList = document.getElementById("scores-list");
const sound = document.getElementById("click-sound");
const music = document.getElementById("bg-music");

let score = 0;
let timeLeft = 30;
let gameInterval, moveInterval;

function startGame() {
  const playerName = document.getElementById("player-name").value.trim();
  if (!playerName) return alert("Please enter your name!");

  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  moveLogo();
  logo.style.display = "block";
  music.play();

  gameInterval = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) endGame(playerName);
  }, 1000);

  moveInterval = setInterval(moveLogo, 800);
}

function endGame(playerName) {
  clearInterval(gameInterval);
  clearInterval(moveInterval);
  logo.style.display = "none";
  music.pause();
  music.currentTime = 0;

  saveScore(playerName, score);
  alert(`Game Over, ${playerName}! Your score: ${score}`);
}

function moveLogo() {
  const game = document.getElementById("game");
  const maxX = game.clientWidth - 80;
  const maxY = game.clientHeight - 80;
  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);
  logo.style.left = `${x}px`;
  logo.style.top = `${y}px`;
}

logo.addEventListener("click", () => {
  score++;
  scoreDisplay.textContent = score;
  sound.currentTime = 0;
  sound.play();
});

function saveScore(name, score) {
  const scoreRef = db.ref("scores").push();
  const userAgent = navigator.userAgent;
  const timestamp = new Date().toISOString();

  const data = { name, score, userAgent, timestamp };

  console.log("Saving score to Firebase:", data);

  scoreRef.set(data)
    .then(() => {
      console.log("✅ Score saved successfully!");
    })
    .catch((error) => {
      console.error("❌ Error saving score:", error);
    });

  loadLeaderboard();
}

function loadLeaderboard() {
  db.ref("scores")
    .orderByChild("score")
    .limitToLast(5)
    .once("value", (snapshot) => {
      const scores = [];
      snapshot.forEach((child) => {
        scores.push(child.val());
      });
      scores.reverse(); // Highest first
      scoresList.innerHTML = "";
      scores.forEach((s, i) => {
        const li = document.createElement("li");
        li.textContent = `#${i + 1}: ${s.name} - ${s.score} pts`;
        scoresList.appendChild(li);
      });
    });
}

loadLeaderboard();
