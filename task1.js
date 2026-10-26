const MIN_VALUE = 1;
const MAX_VALUE = 100;
const MAX_LIVES = 3;
const EQUAL_COUNTS_AS_WIN = true;

let lives = MAX_LIVES;
let streak = 0;
let bestStreak = 0;
let current = 0;
let next = 0;
let isPlaying = false;

const livesEl = document.getElementById("lives");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const currentEl = document.getElementById("current-number");
const messageEl = document.getElementById("message");
const playArea = document.getElementById("play-area");
const gameOverEl = document.getElementById("game-over");
const endTitle = document.getElementById("end-title");
const endMessage = document.getElementById("end-message");
const btnHigher = document.getElementById("btn-higher");
const btnLower = document.getElementById("btn-lower");
const btnRestart = document.getElementById("btn-restart");
const controls = document.getElementById("controls");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateUI() {
  livesEl.textContent = lives;
  streakEl.textContent = streak;
  bestEl.textContent = bestStreak;
  currentEl.textContent = current;
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = "status " + type;
  messageEl.classList.remove("hidden");
}

function hideMessage() {
  messageEl.classList.add("hidden");
}

function startRound() {
  if (!isPlaying) return;
  next = randomInt(MIN_VALUE, MAX_VALUE);
  while (next === current && MAX_VALUE - MIN_VALUE > 0) {
    next = randomInt(MIN_VALUE, MAX_VALUE);
  }
  btnHigher.disabled = false;
  btnLower.disabled = false;
}

function endGame(won) {
  isPlaying = false;
  playArea.classList.add("hidden");
  gameOverEl.classList.remove("hidden");
  if (won) {
    endTitle.textContent = "You Win!";
    endMessage.textContent = "Amazing streak of " + streak + "! Best: " + bestStreak;
  } else {
    endTitle.textContent = "Game Over";
    endMessage.textContent = "Final streak: " + streak + ". Best: " + bestStreak;
  }
}

function handleGuess(guessHigher) {
  if (!isPlaying) return;
  hideMessage();

  const isEqual = next === current;
  const isHigher = next > current;
  const isLower = next < current;

  let correct = false;

  if (isEqual && EQUAL_COUNTS_AS_WIN) {
    correct = true;
  } else if (guessHigher && isHigher) {
    correct = true;
  } else if (!guessHigher && isLower) {
    correct = true;
  }

  if (correct) {
    streak += 1;
    if (streak > bestStreak) {
      bestStreak = streak;
    }
    current = next;
    updateUI();
    if (isEqual) {
      showMessage("Equal! Counts as correct. Next number is " + next, "success");
    } else {
      showMessage("Correct! Next was " + next, "success");
    }
    startRound();
  } else {
    lives -= 1;
    current = next;
    updateUI();
    showMessage("Wrong! It was " + next + ". Lives left: " + lives, "error");
    if (lives <= 0) {
      endGame(false);
    } else {
      startRound();
    }
  }
}

function restart() {
  lives = MAX_LIVES;
  streak = 0;
  isPlaying = true;
  current = randomInt(MIN_VALUE, MAX_VALUE);
  playArea.classList.remove("hidden");
  gameOverEl.classList.add("hidden");
  updateUI();
  startRound();
  showMessage("Guess if the next number is higher or lower!", "info");
}

btnHigher.addEventListener("click", function () {
  if (!isPlaying) return;
  handleGuess(true);
});

btnLower.addEventListener("click", function () {
  if (!isPlaying) return;
  handleGuess(false);
});

btnRestart.addEventListener("click", restart);

restart();
