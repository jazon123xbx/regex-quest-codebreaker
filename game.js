import { fullMatch } from "./regex-utils.js";
import { buildChallengeSet, allChallenges } from "./challenges.js";
import { getHighScore, setHighScore } from "./storage.js";

// ── State ────────────────────────────────────────────────────────────────────
let currentChallenge = 0;
let challenges = [];
let totalScore = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let streak = 0;
let bestStreak = 0;
let correctCount = 0;
let skippedCount = 0;

// ── DOM refs ─────────────────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const welcomeScreen = $("#welcome-screen");
const gameScreen = $("#game-screen");
const resultsScreen = $("#results-screen");
const startBtn = $("#start-btn");
const playAgainBtn = $("#play-again-btn");
const submitBtn = $("#submit-btn");
const skipBtn = $("#skip-btn");
const hintBtn = $("#hint-btn");
const input = $("#answer-input");

const timerEl = $("#timer");
const scoreEl = $("#score");
const progressEl = $("#progress");
const difficultyEl = $("#difficulty");
const titleEl = $("#challenge-title");
const wordsEl = $("#challenge-words");
const hintEl = $("#hint-box");
const feedbackEl = $("#feedback");
const explanationEl = $("#explanation-box");
const regexDisplayEl = $("#regex-display");

const finalScoreEl = $("#final-score");
const correctEl = $("#stat-correct");
const skippedEl = $("#stat-skipped");
const bestStreakEl = $("#stat-best-streak");
const highScoreEl = $("#stat-high-score");
const rankEl = $("#rank-text");

// ── Helpers ──────────────────────────────────────────────────────────────────
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimerDisplay() {
  timerEl.textContent = elapsedSeconds + "s";
}

function calcScore(seconds) {
  return Math.max(0, 10 - Math.floor(seconds));
}

function showScreen(screen) {
  [welcomeScreen, gameScreen, resultsScreen].forEach((s) => {
    s.classList.remove("active");
  });
  screen.classList.add("active");
}

// ── Game setup ───────────────────────────────────────────────────────────────
function buildGame() {
  challenges = buildChallengeSet();
}

function resetState() {
  currentChallenge = 0;
  totalScore = 0;
  streak = 0;
  bestStreak = 0;
  correctCount = 0;
  skippedCount = 0;
}

// ── Render challenge ─────────────────────────────────────────────────────────
function renderChallenge() {
  const ch = challenges[currentChallenge];
  const isBoss = ch.level === "boss";

  // difficulty badge
  difficultyEl.textContent = isBoss ? "BOSS" : ch.level.charAt(0).toUpperCase() + ch.level.slice(1);
  difficultyEl.className = "badge badge-" + (isBoss ? "boss" : ch.level);

  // progress
  progressEl.textContent = `${currentChallenge + 1} / ${challenges.length}`;

  // content
  titleEl.textContent = ch.title;
  wordsEl.textContent = ch.words;
  regexDisplayEl.textContent = ch.pattern;

  // reset UI
  hintEl.classList.add("hidden");
  hintEl.textContent = "";
  feedbackEl.className = "feedback";
  feedbackEl.textContent = "";
  explanationEl.classList.add("hidden");
  explanationEl.textContent = "";
  input.value = "";
  input.disabled = false;
  input.focus();
  submitBtn.disabled = false;
  skipBtn.disabled = false;
  hintBtn.disabled = false;
  scoreEl.textContent = totalScore;
}

// ── Submit ───────────────────────────────────────────────────────────────────
function handleSubmit() {
  const ch = challenges[currentChallenge];
  const raw = input.value;

  if (raw.trim() === "") {
    feedbackEl.className = "feedback error";
    feedbackEl.textContent = "Enter a string to decode.";
    return;
  }

  const correct = fullMatch(raw, ch.pattern, ch.flags);

  if (correct) {
    stopTimer();
    const points = calcScore(elapsedSeconds);
    totalScore += points;
    scoreEl.textContent = totalScore;
    correctCount++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;

    feedbackEl.className = "feedback correct";
    feedbackEl.textContent = `Correct! +${points} pts`;

    showExplanation(ch);
    input.disabled = true;
    submitBtn.disabled = true;
    skipBtn.disabled = true;
    hintBtn.disabled = true;

    setTimeout(() => advanceChallenge(), 2000);
  } else {
    streak = 0;

    feedbackEl.className = "feedback incorrect";
    feedbackEl.textContent = "Incorrect — try again.";

    // shake animation on input
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 400);
  }
}

function handleSkip() {
  const ch = challenges[currentChallenge];
  stopTimer();
  skippedCount++;
  streak = 0;

  feedbackEl.className = "feedback skip";
  feedbackEl.textContent = "Skipped — 0 pts";

  showExplanation(ch);
  input.disabled = true;
  submitBtn.disabled = true;
  skipBtn.disabled = true;
  hintBtn.disabled = true;

  setTimeout(() => advanceChallenge(), 2000);
}

function handleHint() {
  const ch = challenges[currentChallenge];
  hintEl.textContent = "Hint: " + ch.hint;
  hintEl.classList.remove("hidden");
  hintBtn.disabled = true;
}

function showExplanation(ch) {
  explanationEl.textContent = ch.explanation;
  explanationEl.classList.remove("hidden");
}

function advanceChallenge() {
  currentChallenge++;
  if (currentChallenge < challenges.length) {
    renderChallenge();
    startTimer();
  } else {
    showResults();
  }
}

// ── Results ──────────────────────────────────────────────────────────────────
function showResults() {
  stopTimer();

  finalScoreEl.textContent = totalScore;
  correctEl.textContent = correctCount;
  skippedEl.textContent = skippedCount;
  bestStreakEl.textContent = bestStreak;

  const highScore = getHighScore();
  if (totalScore > highScore) {
    setHighScore(totalScore);
    highScoreEl.textContent = totalScore + " (NEW!)";
  } else {
    highScoreEl.textContent = highScore;
  }

  // rank
  const pct = totalScore / 100;
  if (pct >= 0.9) rankEl.textContent = "S — Codebreaker Elite";
  else if (pct >= 0.7) rankEl.textContent = "A — Vault Cracker";
  else if (pct >= 0.5) rankEl.textContent = "B — Apprentice Hacker";
  else if (pct >= 0.3) rankEl.textContent = "C — Padawan Scripter";
  else rankEl.textContent = "D — Keep Training";

  showScreen(resultsScreen);
}

// ── Init ─────────────────────────────────────────────────────────────────────
function startGame() {
  resetState();
  buildGame();
  showScreen(gameScreen);
  renderChallenge();
  startTimer();
}

startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", handleSubmit);
skipBtn.addEventListener("click", handleSkip);
hintBtn.addEventListener("click", handleHint);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !submitBtn.disabled) {
    handleSubmit();
  }
});

// ── Sanity check (development) ───────────────────────────────────────────────
function runSanityCheck() {
  let failures = 0;
  allChallenges.forEach((ch) => {
    ch.pass.forEach((s) => {
      if (!fullMatch(s, ch.pattern, ch.flags)) {
        console.error(`FAIL pass: "${s}" should match /${ch.pattern}/${ch.flags}`);
        failures++;
      }
    });
    ch.fail.forEach((s) => {
      if (fullMatch(s, ch.pattern, ch.flags)) {
        console.error(`FAIL fail: "${s}" should NOT match /${ch.pattern}/${ch.flags}`);
        failures++;
      }
    });
  });
  if (failures === 0) {
    console.log(`Sanity check passed: ${allChallenges.length} challenges, ${allChallenges.reduce((a, c) => a + c.pass.length + c.fail.length, 0)} test cases`);
  } else {
    console.error(`Sanity check: ${failures} failures`);
  }
}
runSanityCheck();
