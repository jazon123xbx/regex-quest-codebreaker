import { fullMatch } from "./regex-utils.js";
import {
  buildChallengeSet,
  buildMissionSet,
  allChallenges,
  poolSizes
} from "./challenges.js";
import {
  getHighScore,
  setHighScore,
  getModeHighScore,
  setModeHighScore,
  isModeHighScore
} from "./storage.js";

// ── Settings ───────────────────────────────────────────────────────────────
let gameSettings = {
  mode: "rubric",
  difficulty: "mixed",
  questionCount: 10,
  roundLimit: null
};

// ── State ──────────────────────────────────────────────────────────────────
let currentChallenge = 0;
let challenges = [];
let totalScore = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let currentStreak = 0;
let bestStreak = 0;
let correctCount = 0;
let skippedCount = 0;
let timeoutCount = 0;
let incorrectAttemptCount = 0;
let responseTimes = [];
let roundConcluded = false;
let modalOpen = false;
let modalTriggerButton = null;
let soundEnabled = false;
let lastDifficulty = null;

// ── DOM refs ───────────────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);

// Screens
const welcomeScreen = $("#welcome-screen");
const missionSelectScreen = $("#mission-select-screen");
const gameScreen = $("#game-screen");
const resultsScreen = $("#results-screen");
const screens = [welcomeScreen, missionSelectScreen, gameScreen, resultsScreen];

// Welcome
const enterArenaBtn = $("#enter-arena-btn");
const howToPlayBtn = $("#how-to-play-btn");
const fieldGuideBtn = $("#field-guide-btn");

// Mission Select
const beginMissionBtn = $("#begin-mission-btn");
const backToWelcomeBtn = $("#back-to-welcome-btn");
const modeCards = document.querySelectorAll(".mode-card");
const customConfig = $("#custom-config");
const customDifficultySelect = $("#custom-difficulty");
const count10Option = $("#count-10-option");
const customValidation = $("#custom-validation");

// Game HUD
const hudMode = $("#hud-mode");
const difficultyEl = $("#difficulty");
const hudChallengeEl = $("#hud-challenge");
const scoreEl = $("#score");
const soundToggle = $("#sound-toggle");

// Timer
const timerRingProgress = $("#timer-ring-progress");
const timerValue = $("#timer-value");
const timerLabel = $("#timer-label");
const timerInfoMode = $("#timer-info-mode");

// Challenge
const targetCardEl = $("#target-card");
const targetLabelEl = $("#target-label");
const titleEl = $("#challenge-title");
const wordsEl = $("#challenge-words");
const regexDisplayEl = $("#regex-display");

// Input
const input = $("#answer-input");
const submitBtn = $("#submit-btn");
const skipBtn = $("#skip-btn");
const hintBtn = $("#hint-btn");
const hintEl = $("#hint-box");
const explanationEl = $("#explanation-box");
const feedbackEl = $("#feedback");

// Streak
const streakValueEl = $("#streak-value");
const bestStreakValueEl = $("#best-streak-value");

// Progress
const vaultProgressEl = $("#vault-progress");
const progressCounter = $("#progress-counter");

// Results
const finalScoreEl = $("#final-score");
const statHighScoreEl = $("#stat-high-score");
const newHsBadge = $("#new-hs-badge");
const statModeEl = $("#stat-mode");
const statQuestionsEl = $("#stat-questions");
const statCorrectEl = $("#stat-correct");
const statIncorrectEl = $("#stat-incorrect");
const statSkippedEl = $("#stat-skipped");
const statTimeoutEl = $("#stat-timeout");
const statBestStreakEl = $("#stat-best-streak");
const statAvgTimeEl = $("#stat-avg-time");
const statAccuracyEl = $("#stat-accuracy");
const rankEl = $("#rank-text");
const playSameModeBtn = $("#play-same-mode-btn");
const changeMissionBtn = $("#change-mission-btn");
const resultsFieldGuideBtn = $("#results-field-guide-btn");

// Modals
const modalOverlay = $("#modal-overlay");
const howToPlayModal = $("#how-to-play-modal");
const fieldGuideModal = $("#field-guide-modal");
const modalCloseBtns = document.querySelectorAll("[data-close-modal]");

// ── Sound system ───────────────────────────────────────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type = "sine", volume = 0.15) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // audio unavailable
  }
}

function playCorrect() {
  playTone(523, 0.12);
  setTimeout(() => playTone(659, 0.12), 80);
  setTimeout(() => playTone(784, 0.18), 160);
}

function playSkip() {
  playTone(400, 0.15, "triangle");
  setTimeout(() => playTone(300, 0.15, "triangle"), 100);
}

function playTimeout() {
  playTone(200, 0.3, "sawtooth", 0.1);
}

function playIncorrect() {
  playTone(180, 0.15, "square", 0.08);
}

// ── Timer ──────────────────────────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 42; // r=42

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    updateTimerDisplay();
    if (gameSettings.roundLimit && elapsedSeconds >= gameSettings.roundLimit) {
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimerDisplay() {
  const limit = gameSettings.roundLimit;
  if (limit) {
    // Countdown mode
    const remaining = Math.max(0, limit - elapsedSeconds);
    timerValue.textContent = remaining;
    timerLabel.textContent = "REMAINING";
    // Ring shows time depleting
    const pct = elapsedSeconds / limit;
    timerRingProgress.style.strokeDashoffset = String(CIRCUMFERENCE * pct);
    // Color states
    if (remaining <= 3) {
      timerRingProgress.classList.add("critical");
      timerRingProgress.classList.remove("warning");
    } else if (remaining <= 6) {
      timerRingProgress.classList.add("warning");
      timerRingProgress.classList.remove("critical");
    } else {
      timerRingProgress.classList.remove("warning", "critical");
    }
  } else {
    // Elapsed mode
    timerValue.textContent = elapsedSeconds;
    timerLabel.textContent = "ELAPSED";
    // Ring fills up to 30s max display
    const pct = Math.min(elapsedSeconds / 30, 1);
    timerRingProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - pct));
    timerRingProgress.classList.remove("warning", "critical");
  }
}

function handleTimeout() {
  if (roundConcluded) return;
  concludeRound("timeout");
}

// ── Helpers ────────────────────────────────────────────────────────────────
function calcScore(seconds) {
  return Math.max(0, 10 - Math.floor(seconds));
}

function showScreen(screen) {
  screens.forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

// ── Mission Select ─────────────────────────────────────────────────────────
function selectMode(mode) {
  gameSettings.mode = mode;
  // Reset to undefined so buildMissionSet uses mode defaults
  if (mode !== "custom") {
    gameSettings.questionCount = undefined;
    gameSettings.roundLimit = undefined;
  }
  modeCards.forEach((c) => {
    c.classList.toggle("active", c.dataset.mode === mode);
  });
  // Show/hide custom config
  if (mode === "custom") {
    customConfig.classList.remove("hidden");
    updateCustomConfig();
  } else {
    customConfig.classList.add("hidden");
  }
}

function updateCustomConfig() {
  const diff = customDifficultySelect.value;
  const poolSize = diff === "mixed"
    ? poolSizes.easy + poolSizes.medium + poolSizes.hard
    : poolSizes[diff] || 0;
  // Disable 10 option if pool < 10
  const count10Input = count10Option.querySelector("input");
  if (poolSize < 10) {
    count10Input.disabled = true;
    count10Option.classList.add("disabled");
    // If 10 is checked, switch to 5
    if (count10Input.checked) {
      count10Input.checked = false;
      document.querySelector('input[name="custom-count"][value="5"]').checked = true;
    }
    customValidation.textContent = `Max ${poolSize} questions for ${diff.toUpperCase()} pool`;
    customValidation.classList.remove("hidden");
  } else {
    count10Input.disabled = false;
    count10Option.classList.remove("disabled");
    customValidation.classList.add("hidden");
  }
}

function getCustomSettings() {
  const diff = customDifficultySelect.value;
  const countInput = document.querySelector('input[name="custom-count"]:checked');
  const timerInput = document.querySelector('input[name="custom-timer"]:checked');
  const count = countInput ? Number(countInput.value) : 5;
  const timerVal = timerInput ? timerInput.value : "unlimited";
  return {
    mode: "custom",
    difficulty: diff,
    questionCount: count,
    roundLimit: timerVal === "unlimited" ? null : Number(timerVal)
  };
}

// ── Progress rendering ─────────────────────────────────────────────────────
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

    if (i < challenges.length - 1) {
      const line = document.createElement("div");
      line.className = "vault-line";
      if (isCompleted) line.classList.add("completed");
      vaultProgressEl.appendChild(line);
    }
  }
}

// ── Game setup ─────────────────────────────────────────────────────────────
function resetState() {
  currentChallenge = 0;
  totalScore = 0;
  currentStreak = 0;
  bestStreak = 0;
  correctCount = 0;
  skippedCount = 0;
  timeoutCount = 0;
  incorrectAttemptCount = 0;
  responseTimes = [];
  roundConcluded = false;
  lastDifficulty = null;
}

function buildGame() {
  const result = buildMissionSet(gameSettings);
  challenges = result.challenges;
  gameSettings.roundLimit = result.config.roundLimit;
}

// ── Render challenge ───────────────────────────────────────────────────────
function renderChallenge() {
  const ch = challenges[currentChallenge];
  const isBoss = ch.level === "boss";
  roundConcluded = false;

  // difficulty badge
  const levelLabel = isBoss ? "BOSS" : ch.level.charAt(0).toUpperCase() + ch.level.slice(1);
  difficultyEl.textContent = levelLabel;
  difficultyEl.className = "badge badge-" + (isBoss ? "boss" : ch.level);

  // HUD
  hudChallengeEl.textContent = `${currentChallenge + 1} / ${challenges.length}`;
  progressCounter.textContent = `${currentChallenge + 1} / ${challenges.length}`;

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

  // difficulty transition banner
  if (lastDifficulty && lastDifficulty !== ch.level) {
    showDifficultyTransition(lastDifficulty, ch.level);
  }
  lastDifficulty = ch.level;

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
  streakValueEl.textContent = currentStreak;
  bestStreakValueEl.textContent = bestStreak;
}

function showDifficultyTransition(from, to) {
  const labels = { easy: "Easy", medium: "Medium", hard: "Hard", boss: "Boss" };
  const banner = document.createElement("div");
  banner.className = "difficulty-transition";
  banner.textContent = `${labels[from] || from} → ${labels[to] || to}`;
  feedbackEl.parentNode.insertBefore(banner, feedbackEl);
  setTimeout(() => banner.remove(), 1500);
}

// ── Submit ─────────────────────────────────────────────────────────────────
function handleSubmit() {
  if (modalOpen || roundConcluded) return;

  const ch = challenges[currentChallenge];
  const raw = input.value;

  if (raw.trim() === "") {
    feedbackEl.className = "feedback error";
    feedbackEl.textContent = "Enter a string to decode.";
    return;
  }

  const correct = fullMatch(raw, ch.pattern, ch.flags);

  if (correct) {
    concludeRound("correct");
  } else {
    incorrectAttemptCount++;
    playIncorrect();
    feedbackEl.className = "feedback incorrect";
    feedbackEl.textContent = "ACCESS DENIED — TRY AGAIN";
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 400);
  }
}

function handleSkip() {
  if (modalOpen || roundConcluded) return;
  concludeRound("skip");
}

function handleHint() {
  if (modalOpen || roundConcluded) return;
  const ch = challenges[currentChallenge];
  hintEl.textContent = ch.hint;
  hintEl.classList.remove("hidden");
  hintBtn.disabled = true;
}

// ── Round conclusion (single guard) ───────────────────────────────────────
function concludeRound(type) {
  if (roundConcluded) return;
  roundConcluded = true;
  stopTimer();

  const ch = challenges[currentChallenge];
  let points = 0;

  switch (type) {
    case "correct":
      points = calcScore(elapsedSeconds);
      totalScore += points;
      correctCount++;
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
      responseTimes.push(elapsedSeconds);
      playCorrect();
      feedbackEl.className = "feedback correct";
      feedbackEl.textContent = "ACCESS GRANTED — +" + points + " pts";
      break;

    case "skip":
      skippedCount++;
      currentStreak = 0;
      responseTimes.push(elapsedSeconds);
      playSkip();
      feedbackEl.className = "feedback skip";
      feedbackEl.textContent = "SKIPPED — 0 pts";
      break;

    case "timeout":
      timeoutCount++;
      currentStreak = 0;
      responseTimes.push(elapsedSeconds);
      playTimeout();
      feedbackEl.className = "feedback timeout";
      feedbackEl.textContent = "TIMEOUT — 0 pts";
      break;
  }

  showExplanation(ch, type);
  input.disabled = true;
  submitBtn.disabled = true;
  skipBtn.disabled = true;
  hintBtn.disabled = true;
  scoreEl.textContent = totalScore;
  streakValueEl.textContent = currentStreak;
  bestStreakValueEl.textContent = bestStreak;

  setTimeout(() => advanceChallenge(), 2000);
}

function showExplanation(ch, type) {
  const label = type === "correct" ? "WHY IT MATCHES: " : "PATTERN BREAKDOWN: ";
  explanationEl.textContent = label + ch.explanation;
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

// ── Results ────────────────────────────────────────────────────────────────
function showResults() {
  stopTimer();

  const maxPossibleScore = challenges.length * 10;
  finalScoreEl.textContent = totalScore;

  // Per-mode high score
  const modeKey = gameSettings.mode;
  const wasHighScore = isModeHighScore(modeKey, totalScore);
  if (wasHighScore) {
    setModeHighScore(modeKey, totalScore);
    statHighScoreEl.textContent = totalScore;
    newHsBadge.classList.remove("hidden");
  } else {
    statHighScoreEl.textContent = getModeHighScore(modeKey);
    newHsBadge.classList.add("hidden");
  }

  // Also update legacy high score for compatibility
  const legacyHS = getHighScore();
  if (totalScore > legacyHS) {
    setHighScore(totalScore);
  }

  // Mode label
  const modeLabels = {
    rubric: "Rubric",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    custom: "Custom"
  };
  statModeEl.textContent = modeLabels[modeKey] || modeKey;
  statQuestionsEl.textContent = challenges.length;
  statCorrectEl.textContent = correctCount;
  statIncorrectEl.textContent = incorrectAttemptCount;
  statSkippedEl.textContent = skippedCount;
  statTimeoutEl.textContent = timeoutCount;
  statBestStreakEl.textContent = bestStreak;

  // Average round time
  if (responseTimes.length > 0) {
    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    statAvgTimeEl.textContent = avg.toFixed(1) + "s";
  } else {
    statAvgTimeEl.textContent = "—";
  }

  // Accuracy
  const accuracy = challenges.length > 0
    ? Math.round((correctCount / challenges.length) * 100)
    : 0;
  statAccuracyEl.textContent = accuracy + "%";

  // Rank (based on percentage of max possible score)
  const pct = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  if (pct >= 0.9) rankEl.textContent = "MASTER CODEBREAKER";
  else if (pct >= 0.7) rankEl.textContent = "REGEX SPECIALIST";
  else if (pct >= 0.5) rankEl.textContent = "CIPHER AGENT";
  else if (pct >= 0.3) rankEl.textContent = "PATTERN SCOUT";
  else rankEl.textContent = "ROOKIE DECODER";

  showScreen(resultsScreen);
}

// ── Modals (preserved from v2) ─────────────────────────────────────────────
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

// ── Start game ─────────────────────────────────────────────────────────────
function startGame() {
  resetState();
  buildGame();
  // Set HUD mode badge
  const modeLabels = { rubric: "RUBRIC", easy: "EASY", medium: "MEDIUM", hard: "HARD", custom: "CUSTOM" };
  hudMode.textContent = modeLabels[gameSettings.mode] || "RUBRIC";
  // Set timer info
  if (gameSettings.roundLimit) {
    timerInfoMode.textContent = gameSettings.roundLimit + "s LIMIT";
  } else {
    timerInfoMode.textContent = "UNLIMITED";
  }
  // Reset ring
  timerRingProgress.style.strokeDashoffset = "0";
  timerRingProgress.classList.remove("warning", "critical");
  showScreen(gameScreen);
  renderChallenge();
  startTimer();
}

// ── Event listeners ────────────────────────────────────────────────────────
// Welcome
enterArenaBtn.addEventListener("click", () => showScreen(missionSelectScreen));
howToPlayBtn.addEventListener("click", () => openModal(howToPlayModal));
fieldGuideBtn.addEventListener("click", () => openModal(fieldGuideModal));

// Mission Select
modeCards.forEach((card) => {
  card.addEventListener("click", () => selectMode(card.dataset.mode));
});
customDifficultySelect.addEventListener("change", updateCustomConfig);
beginMissionBtn.addEventListener("click", startGame);
backToWelcomeBtn.addEventListener("click", () => showScreen(welcomeScreen));

// Game
submitBtn.addEventListener("click", handleSubmit);
skipBtn.addEventListener("click", handleSkip);
hintBtn.addEventListener("click", handleHint);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !submitBtn.disabled) handleSubmit();
});

// Sound toggle
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
  soundToggle.classList.toggle("active", soundEnabled);
});

// Results
playSameModeBtn.addEventListener("click", startGame);
changeMissionBtn.addEventListener("click", () => showScreen(missionSelectScreen));
resultsFieldGuideBtn.addEventListener("click", () => openModal(fieldGuideModal));

// Modal close (preserved)
modalCloseBtns.forEach((btn) => btn.addEventListener("click", closeModal));
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

// ── Sanity check (development) ─────────────────────────────────────────────
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
