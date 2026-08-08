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
let responseTimes = [];
let modalOpen = false;
let modalTriggerButton = null;

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
const hudChallengeEl = $("#hud-challenge");
const difficultyEl = $("#difficulty");
const titleEl = $("#challenge-title");
const wordsEl = $("#challenge-words");
const hintEl = $("#hint-box");
const feedbackEl = $("#feedback");
const explanationEl = $("#explanation-box");
const regexDisplayEl = $("#regex-display");
const targetCardEl = $("#target-card");
const targetLabelEl = $("#target-label");
const highScoreGameEl = $("#high-score-game");
const vaultProgressEl = $("#vault-progress");

const finalScoreEl = $("#final-score");
const correctEl = $("#stat-correct");
const skippedEl = $("#stat-skipped");
const bestStreakEl = $("#stat-best-streak");
const highScoreEl = $("#stat-high-score");
const avgTimeEl = $("#stat-avg-time");
const rankEl = $("#rank-text");

// Modal refs
const modalOverlay = $("#modal-overlay");
const howToPlayModal = $("#how-to-play-modal");
const fieldGuideModal = $("#field-guide-modal");
const howToPlayBtn = $("#how-to-play-btn");
const fieldGuideBtn = $("#field-guide-btn");
const modalCloseBtns = document.querySelectorAll("[data-close-modal]");

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

// ── Progress rendering ──────────────────────────────────────────────────────
function renderProgress() {
  vaultProgressEl.innerHTML = "";
  for (let i = 0; i < challenges.length; i++) {
    const ch = challenges[i];
    const isBoss = ch.level === "boss";
    const isCompleted = i < currentChallenge;
    const isCurrent = i === currentChallenge;

    const node = document.createElement("div");
    node.className = "vault-node";

    const dot = document.createElement("div");
    dot.className = "vault-dot";
    if (isBoss) dot.classList.add("boss-node");
    if (isCompleted) dot.classList.add("completed");
    else if (isCurrent) dot.classList.add("current");
    else dot.classList.add("upcoming");

    dot.textContent = isBoss ? "★" : (i + 1);
    node.appendChild(dot);

    vaultProgressEl.appendChild(node);

    // Connector line (not after last node)
    if (i < challenges.length - 1) {
      const line = document.createElement("div");
      line.className = "vault-line";
      if (isCompleted) line.classList.add("completed");
      vaultProgressEl.appendChild(line);
    }
  }
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
  responseTimes = [];
}

// ── Render challenge ─────────────────────────────────────────────────────────
function renderChallenge() {
  const ch = challenges[currentChallenge];
  const isBoss = ch.level === "boss";

  // difficulty badge
  difficultyEl.textContent = isBoss ? "BOSS" : ch.level.charAt(0).toUpperCase() + ch.level.slice(1);
  difficultyEl.className = "badge badge-" + (isBoss ? "boss" : ch.level);

  // HUD
  hudChallengeEl.textContent = `${currentChallenge + 1} / ${challenges.length}`;
  highScoreGameEl.textContent = getHighScore();

  // target card
  titleEl.textContent = ch.title;
  wordsEl.textContent = ch.words;
  regexDisplayEl.textContent = ch.pattern;

  // boss styling
  if (isBoss) {
    targetCardEl.classList.add("boss-card");
    targetLabelEl.textContent = "FINAL VAULT — BOSS REGEX";
  } else {
    targetCardEl.classList.remove("boss-card");
    targetLabelEl.textContent = "TARGET PATTERN";
  }

  // progress
  renderProgress();

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
  if (modalOpen) return;

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
    responseTimes.push(elapsedSeconds);

    feedbackEl.className = "feedback correct";
    feedbackEl.textContent = "ACCESS GRANTED — +" + points + " pts";

    showExplanation(ch);
    input.disabled = true;
    submitBtn.disabled = true;
    skipBtn.disabled = true;
    hintBtn.disabled = true;

    setTimeout(() => advanceChallenge(), 2000);
  } else {
    streak = 0;

    feedbackEl.className = "feedback incorrect";
    feedbackEl.textContent = "ACCESS DENIED — TRY AGAIN";

    // shake animation on input
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 400);
  }
}

function handleSkip() {
  if (modalOpen) return;

  const ch = challenges[currentChallenge];
  stopTimer();
  skippedCount++;
  streak = 0;
  responseTimes.push(elapsedSeconds);

  feedbackEl.className = "feedback skip";
  feedbackEl.textContent = "SKIPPED — 0 pts";

  showExplanation(ch);
  input.disabled = true;
  submitBtn.disabled = true;
  skipBtn.disabled = true;
  hintBtn.disabled = true;

  setTimeout(() => advanceChallenge(), 2000);
}

function handleHint() {
  if (modalOpen) return;

  const ch = challenges[currentChallenge];
  hintEl.textContent = "Hint: " + ch.hint;
  hintEl.classList.remove("hidden");
  hintBtn.disabled = true;
}

function showExplanation(ch) {
  const isBoss = ch.level === "boss";
  explanationEl.textContent = (isBoss ? "PATTERN BREAKDOWN: " : "WHY IT MATCHES: ") + ch.explanation;
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

  // average round time
  if (responseTimes.length > 0) {
    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    avgTimeEl.textContent = avg.toFixed(1) + "s";
  } else {
    avgTimeEl.textContent = "—";
  }

  // high score
  const highScore = getHighScore();
  if (totalScore > highScore) {
    setHighScore(totalScore);
    highScoreEl.textContent = totalScore + " (NEW!)";
  } else {
    highScoreEl.textContent = highScore;
  }

  // rank (display only, never modifies score)
  const pct = totalScore / 100;
  if (pct >= 0.9)      rankEl.textContent = "MASTER CODEBREAKER";
  else if (pct >= 0.7) rankEl.textContent = "REGEX SPECIALIST";
  else if (pct >= 0.5) rankEl.textContent = "CIPHER AGENT";
  else if (pct >= 0.3) rankEl.textContent = "PATTERN SCOUT";
  else                  rankEl.textContent = "ROOKIE DECODER";

  showScreen(resultsScreen);
}

// ── Modals ───────────────────────────────────────────────────────────────────
function openModal(modalEl) {
  modalOpen = true;
  modalTriggerButton = document.activeElement;
  modalOverlay.classList.remove("hidden");
  modalEl.classList.remove("hidden");
  const closeBtn = modalEl.querySelector(".modal-close");
  if (closeBtn) closeBtn.focus();
  document.addEventListener("keydown", handleModalKeydown);
}

function closeModal() {
  modalOpen = false;
  howToPlayModal.classList.add("hidden");
  fieldGuideModal.classList.add("hidden");
  modalOverlay.classList.add("hidden");
  document.removeEventListener("keydown", handleModalKeydown);
  if (
    modalTriggerButton &&
    modalTriggerButton.isConnected &&
    typeof modalTriggerButton.focus === "function"
  ) {
    modalTriggerButton.focus();
  }

  modalTriggerButton = null;
}

function handleModalKeydown(e) {
  if (e.key === "Escape") {
    closeModal();
    return;
  }
  // Trap focus inside open modal
  if (e.key === "Tab") {
    const activeModal = howToPlayModal.classList.contains("hidden") ? fieldGuideModal : howToPlayModal;
    const focusable = activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
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

howToPlayBtn.addEventListener("click", () => openModal(howToPlayModal));
fieldGuideBtn.addEventListener("click", () => openModal(fieldGuideModal));
modalCloseBtns.forEach((btn) => btn.addEventListener("click", closeModal));
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
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
