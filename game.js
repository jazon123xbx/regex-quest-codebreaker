import { fullMatch } from "./regex-utils.js";
import {
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

// ============================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================

// How often the round clock ticks, in milliseconds.
const TIMER_INTERVAL_MS = 1000;

// How long the result text stays up before the next challenge appears.
const ROUND_TRANSITION_MS = 2000;

// Rounds cap at 30 elapsed seconds on the ring display in unlimited modes.
const RING_MAX_ELAPSED_SECONDS = 30;

// Circumference of the timer ring (the SVG circle has radius 42).
const CIRCUMFERENCE = 2 * Math.PI * 42;

// Maximum points for solving one challenge correctly.
const MAX_SCORE_PER_CHALLENGE = 10;

// Display names used on the Results screen and Abort panel.
const MODE_LABELS = {
  rubric: "Rubric",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  custom: "Custom"
};

// Uppercase badges shown in the HUD.
const MODE_BADGE_LABELS = {
  rubric: "RUBRIC",
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
  custom: "CUSTOM"
};

// Names used by the difficulty transition banner.
const DIFFICULTY_TRANSITION_LABELS = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  boss: "Boss"
};

// ============================================================
// 2. GAME STATE
// ============================================================

// Settings chosen on the Mission Select screen.
let gameSettings = {
  mode: "rubric",
  difficulty: "mixed",
  questionCount: 10,
  roundLimit: null
};

// The active mission and its running totals.
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

// Becomes true once a round ends, until the next challenge renders.
// This guarantees a round can only ever be scored/advanced once.
let roundConcluded = false;

// The last shown difficulty, used to detect a difficulty change.
let lastDifficulty = null;

// Generic modal (How to Play / Field Guide) state.
let modalOpen = false;
let modalTriggerButton = null;

// Abort Mission modal state.
let abortModalOpen = false;
let abortTriggerButton = null;

// Pending auto-advance after a round ends, plus timer pause bookkeeping.
let advanceTimeoutId = null;
let timerPausedAt = 0;
let timerPaused = false;

// Sound effects toggle. Sound starts ON by default.
let soundEnabled = true;

// ============================================================
// 3. DOM REFERENCES
// ============================================================

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
const abortBtn = $("#abort-btn");
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
const abortModal = $("#abort-modal");
const modalCloseBtns = document.querySelectorAll("[data-close-modal]");

// Abort modal elements
const abortContinueBtn = $("#abort-continue-btn");
const abortQuitBtn = $("#abort-quit-btn");
const abortModeEl = $("#abort-mode");
const abortRoundEl = $("#abort-round");
const abortScoreEl = $("#abort-score");

// ============================================================
// 4. SOUND SYSTEM
// ============================================================

// Shared Web Audio context, created on first use.
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  // Browsers start a fresh context "suspended" until the first user gesture;
  // resume it so the first tone is audible without ever auto-playing on load.
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Initializes/resumes the audio context on the player's first interaction.
// This is required because browsers block Web Audio until a user gesture.
function unlockAudio() {
  try {
    const ctx = getAudioCtx();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  } catch {
    // Audio unavailable — the game still works silently.
  }
  document.removeEventListener("pointerdown", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}

// Do NOT play audio on load; just mark the context ready after first gesture.
document.addEventListener("pointerdown", unlockAudio);
document.addEventListener("keydown", unlockAudio);

function playTone(freq, duration, type = "sine", volume = 0.15) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
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
    // Audio is unavailable — the game still works silently.
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

// ============================================================
// 5. SCREEN NAVIGATION
// ============================================================

// Shows one screen (e.g. the game screen) and hides all others.
function showScreen(screen) {
  screens.forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

// ============================================================
// 6. MISSION SETUP
// ============================================================

// Selects a mission mode from the menu and updates the card highlights.
function selectMode(mode) {
  gameSettings.mode = mode;
  // Reset to undefined so buildMissionSet uses the mode defaults.
  if (mode !== "custom") {
    gameSettings.questionCount = undefined;
    gameSettings.roundLimit = undefined;
  }
  modeCards.forEach((c) => {
    c.classList.toggle("active", c.dataset.mode === mode);
  });
  // Show/hide the Custom configuration panel.
  if (mode === "custom") {
    customConfig.classList.remove("hidden");
    updateCustomConfig();
  } else {
    customConfig.classList.add("hidden");
  }
}

// Keeps the player from requesting more questions than a pool has.
function updateCustomConfig() {
  const diff = customDifficultySelect.value;
  const poolSize = diff === "mixed"
    ? poolSizes.easy + poolSizes.medium + poolSizes.hard
    : poolSizes[diff] || 0;
  // Disable the "10" option when the pool is smaller than 10.
  const count10Input = count10Option.querySelector("input");
  if (poolSize < 10) {
    count10Input.disabled = true;
    count10Option.classList.add("disabled");
    // If "10" was selected, fall back to "5".
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

// Reads the Custom mode controls into a mission settings object.
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

// Resets every counter/flag that describes one mission or one round.
// This is the single reset any "new game" path goes through.
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
  timerPausedAt = 0;
  timerPaused = false;
  abortModalOpen = false;
  abortTriggerButton = null;
}

/**
 * Builds the challenge list for the selected mission mode.
 * @param {Object} settings Current mission settings.
 * @returns {{ challenges: Array, config: Object }}
 */
function buildGame() {
  const result = buildMissionSet(gameSettings);
  challenges = result.challenges;
  gameSettings.roundLimit = result.config.roundLimit;
}

// Starts a fresh mission: reset state, build challenges, render to screen.
function startGame() {
  resetState();
  buildGame();
  // HUD mode badge.
  hudMode.textContent = MODE_BADGE_LABELS[gameSettings.mode] || "RUBRIC";
  // Timer info.
  if (gameSettings.roundLimit) {
    timerInfoMode.textContent = gameSettings.roundLimit + "s LIMIT";
  } else {
    timerInfoMode.textContent = "UNLIMITED";
  }
  // Reset the ring.
  timerRingProgress.style.strokeDashoffset = "0";
  timerRingProgress.classList.remove("warning", "critical");
  showScreen(gameScreen);
  renderChallenge();
  startTimer();
}

// ============================================================
// 7. TIMER CONTROLLER
// ============================================================

// Starts the round timer at zero.
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(tickTimer, TIMER_INTERVAL_MS);
}

// One clock tick: advance the clock, redraw, and time out at the limit.
function tickTimer() {
  elapsedSeconds++;
  updateTimerDisplay();
  if (gameSettings.roundLimit && elapsedSeconds >= gameSettings.roundLimit) {
    handleTimeout();
  }
}

// Stops the timer and clears any pending auto-advance.
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  if (advanceTimeoutId) {
    clearTimeout(advanceTimeoutId);
    advanceTimeoutId = null;
  }
}

// Redraws the timer number, label, and ring for the current mode.
function updateTimerDisplay() {
  const limit = gameSettings.roundLimit;
  if (limit) {
    // Countdown mode: number goes down, ring depletes, colors warn.
    const remaining = Math.max(0, limit - elapsedSeconds);
    timerValue.textContent = remaining;
    timerLabel.textContent = "REMAINING";
    const pct = elapsedSeconds / limit;
    timerRingProgress.style.strokeDashoffset = String(CIRCUMFERENCE * pct);
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
    // Elapsed mode: number counts up, ring fills to 30s max.
    timerValue.textContent = elapsedSeconds;
    timerLabel.textContent = "ELAPSED";
    const pct = Math.min(elapsedSeconds / RING_MAX_ELAPSED_SECONDS, 1);
    timerRingProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - pct));
    timerRingProgress.classList.remove("warning", "critical");
  }
}

// Ends the round as a timeout when the clock reaches the limit.
function handleTimeout() {
  if (roundConcluded) return;
  concludeRound("timeout");
}

// Pauses the timer. While the Abort modal is open, the pause time must NOT
// count against the player, so the exact elapsed value is remembered.
function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerPausedAt = elapsedSeconds;
    timerPaused = true;
  }
}

// Resumes the paused timer from the exact value it had when paused.
function resumeTimer() {
  if (timerPaused) {
    timerPaused = false;
    elapsedSeconds = timerPausedAt;
    timerPausedAt = 0;
    updateTimerDisplay();
    timerInterval = setInterval(tickTimer, TIMER_INTERVAL_MS);
  }
}

// ============================================================
// 8. CHALLENGE RENDERING
// ============================================================

// Displays the current challenge and resets the input/feedback UI.
function renderChallenge() {
  const ch = challenges[currentChallenge];
  const isBoss = ch.level === "boss";
  roundConcluded = false;

  // Difficulty badge
  const levelLabel = isBoss ? "BOSS" : ch.level.charAt(0).toUpperCase() + ch.level.slice(1);
  difficultyEl.textContent = levelLabel;
  difficultyEl.className = "badge badge-" + (isBoss ? "boss" : ch.level);

  // HUD
  hudChallengeEl.textContent = `${currentChallenge + 1} / ${challenges.length}`;
  progressCounter.textContent = `${currentChallenge + 1} / ${challenges.length}`;

  // Target card
  titleEl.textContent = ch.title;
  wordsEl.textContent = ch.words;
  regexDisplayEl.textContent = ch.pattern;

  // Boss styling
  if (isBoss) {
    targetCardEl.classList.add("boss-card");
    targetLabelEl.textContent = "FINAL VAULT — BOSS REGEX";
  } else {
    targetCardEl.classList.remove("boss-card");
    targetLabelEl.textContent = "TARGET PATTERN";
  }

  // Difficulty transition banner
  if (lastDifficulty && lastDifficulty !== ch.level) {
    showDifficultyTransition(lastDifficulty, ch.level);
  }
  lastDifficulty = ch.level;

  // Progress path
  renderProgress();

  // Reset the answer UI for a fresh round
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

// Shows a short banner when the challenge level changes mid-mission.
function showDifficultyTransition(from, to) {
  const banner = document.createElement("div");
  banner.className = "difficulty-transition";
  banner.textContent = `${DIFFICULTY_TRANSITION_LABELS[from] || from} → ${DIFFICULTY_TRANSITION_LABELS[to] || to}`;
  feedbackEl.parentNode.insertBefore(banner, feedbackEl);
  setTimeout(() => banner.remove(), 1500);
}

// Draws the vault node path: completed / current / upcoming rounds.
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

// ============================================================
// 9. ANSWER VALIDATION
// ============================================================

/**
 * Returns the score for a correctly solved challenge.
 * Required formula: 10 points minus one point per whole elapsed second.
 * @param {number} seconds Seconds spent on the round.
 * @returns {number} Points earned, minimum 0.
 */
function calcScore(seconds) {
  // Elapsed seconds is the scoring authority even when the display counts
  // down — the clock always advances, so the score never goes out of sync.
  return Math.max(0, MAX_SCORE_PER_CHALLENGE - Math.floor(seconds));
}

// Checks the typed answer against the current regex pattern.
function handleSubmit() {
  if (modalOpen || abortModalOpen || roundConcluded) return;

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

// ============================================================
// 10. HINT & SKIP
// ============================================================

// Reveals the hint for the current challenge.
function handleHint() {
  if (modalOpen || abortModalOpen || roundConcluded) return;
  const ch = challenges[currentChallenge];
  hintEl.textContent = ch.hint;
  hintEl.classList.remove("hidden");
  hintBtn.disabled = true;
}

// Skips the current challenge (0 points) and reveals the explanation.
function handleSkip() {
  if (modalOpen || abortModalOpen || roundConcluded) return;
  concludeRound("skip");
}

// ============================================================
// 11. ABORT MISSION
// ============================================================

// Opens the Abort panel. The round timer pauses so dialog time is not
// counted against the player's score.
function openAbortModal() {
  if (abortModalOpen || roundConcluded) return;
  abortModalOpen = true;
  abortTriggerButton = document.activeElement;

  // Pause the timer while the modal is open.
  pauseTimer();

  // Fill in the summary (mode, round, score).
  abortModeEl.textContent = MODE_LABELS[gameSettings.mode] || gameSettings.mode;
  abortRoundEl.textContent = `${currentChallenge + 1} / ${challenges.length}`;
  abortScoreEl.textContent = totalScore;

  modalOverlay.classList.remove("hidden");
  abortModal.classList.remove("hidden");
  abortContinueBtn.focus();
  document.addEventListener("keydown", handleAbortKeydown);
}

// Closes the Abort modal without quitting, resuming the round.
function closeAbortModal() {
  abortModalOpen = false;
  abortModal.classList.add("hidden");
  modalOverlay.classList.add("hidden");
  document.removeEventListener("keydown", handleAbortKeydown);

  // Resume from exactly where the timer paused.
  resumeTimer();

  // Return focus to the abort button.
  if (
    abortTriggerButton &&
    abortTriggerButton.isConnected &&
    typeof abortTriggerButton.focus === "function"
  ) {
    abortTriggerButton.focus();
  }
  abortTriggerButton = null;
}

// Escape closes the modal; Tab is trapped inside it.
function handleAbortKeydown(e) {
  if (e.key === "Escape") {
    closeAbortModal();
    return;
  }
  if (e.key === "Tab") {
    const focusable = abortModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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

// Quits the mission: discards the score, returns to Welcome, resets round
// state but keeps the settings for the next mission.
function executeAbortQuit() {
  closeAbortModal();

  // Cancel any pending auto-advance so a finished round cannot advance a
  // mission that has been aborted.
  if (advanceTimeoutId) {
    clearTimeout(advanceTimeoutId);
    advanceTimeoutId = null;
  }

  // Stop the timer completely.
  stopTimer();

  // Do NOT save the score, do NOT show results — just go home.
  showScreen(welcomeScreen);

  // Reset mission state but keep settings for the next mission.
  resetMissionState();
}

// Clears the mission-round state after an abort (keeps settings).
function resetMissionState() {
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
  elapsedSeconds = 0;
  timerPausedAt = 0;
  timerPaused = false;
  challenges = [];
}

// ============================================================
// 12. ROUND COMPLETION
// ============================================================

// A round can end through Correct, Skip, or Timeout. The roundConcluded
// guard prevents two events from scoring/advancing the same round.
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
      // Timeout gives 0 points because the player lost to the clock.
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

  advanceTimeoutId = setTimeout(() => advanceChallenge(), ROUND_TRANSITION_MS);
}

// Shows why the pattern matched (or why it was a boss).
function showExplanation(ch) {
  const isBoss = ch.level === "boss";
  explanationEl.textContent = (isBoss ? "PATTERN BREAKDOWN: " : "WHY IT MATCHES: ") + ch.explanation;
  explanationEl.classList.remove("hidden");
}

// Moves to the next challenge, or shows results when the mission ends.
function advanceChallenge() {
  currentChallenge++;
  if (currentChallenge < challenges.length) {
    renderChallenge();
    startTimer();
  } else {
    showResults();
  }
}

// ============================================================
// 13. RESULTS & STATISTICS
// ============================================================

// Fills the mission report with final score, stats, and rank.
function showResults() {
  stopTimer();

  const maxPossibleScore = challenges.length * MAX_SCORE_PER_CHALLENGE;
  finalScoreEl.textContent = totalScore;

  // Per-mode high score. High scores are tracked per mode so an "Easy"
  // score does not overwrite a "Rubric" score.
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

  // Also update the legacy high score for backward compatibility.
  const legacyHS = getHighScore();
  if (totalScore > legacyHS) {
    setHighScore(totalScore);
  }

  // Mode label
  statModeEl.textContent = MODE_LABELS[modeKey] || modeKey;
  statQuestionsEl.textContent = challenges.length;
  statCorrectEl.textContent = correctCount;
  statIncorrectEl.textContent = incorrectAttemptCount;
  statSkippedEl.textContent = skippedCount;
  statTimeoutEl.textContent = timeoutCount;
  statBestStreakEl.textContent = bestStreak;

  // Average round time
  if (responseTimes.length > 0) {
    const avg = calculateAverageResponseTime(responseTimes);
    statAvgTimeEl.textContent = avg.toFixed(1) + "s";
  } else {
    statAvgTimeEl.textContent = "—";
  }

  // Accuracy
  statAccuracyEl.textContent = calculateAccuracy(correctCount, challenges.length) + "%";

  // Rank (based on percentage of the max possible score)
  const pct = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  rankEl.textContent = getRankLabel(pct);

  showScreen(resultsScreen);
}

/**
 * Average time spent per answered round.
 * @param {number[]} times The response times of every answered round.
 * @returns {number} The average, or 0 when there were no rounds.
 */
function calculateAverageResponseTime(times) {
  return times.reduce((a, b) => a + b, 0) / times.length;
}

/**
 * Percentage of rounds answered correctly, rounded to an integer.
 * @param {number} correct Count of correct answers.
 * @param {number} total Total rounds in the mission.
 * @returns {number} Accuracy percent.
 */
function calculateAccuracy(correctCount, total) {
  return total > 0 ? Math.round((correctCount / total) * 100) : 0;
}

/**
 * Maps a score percentage (0-1) to its rank title.
 * @param {number} pct Earned score divided by max possible score.
 * @returns {string} The rank title, e.g. "MASTER CODEBREAKER".
 */
function getRankLabel(pct) {
  if (pct >= 0.9) return "MASTER CODEBREAKER";
  else if (pct >= 0.7) return "REGEX SPECIALIST";
  else if (pct >= 0.5) return "CIPHER AGENT";
  else if (pct >= 0.3) return "PATTERN SCOUT";
  else return "ROOKIE DECODER";
}

// ============================================================
// 14. MODALS
// ============================================================

// Opens a generic modal (How to Play / Field Guide).
function openModal(modalEl) {
  modalOpen = true;
  modalTriggerButton = document.activeElement;
  modalOverlay.classList.remove("hidden");
  modalEl.classList.remove("hidden");
  const closeBtn = modalEl.querySelector(".modal-close");
  if (closeBtn) closeBtn.focus();
  document.addEventListener("keydown", handleModalKeydown);
}

// Closes the generic modal and returns focus where it was opened from.
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

// Escape closes the modal; Tab stays trapped inside it.
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

// ============================================================
// 15. EVENT LISTENERS
// ============================================================

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
abortBtn.addEventListener("click", openAbortModal);
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

// Modal close controls (abort modal uses its own path)
modalCloseBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (abortModalOpen) {
      closeAbortModal();
    } else {
      closeModal();
    }
  });
});
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    if (abortModalOpen) {
      closeAbortModal();
    } else {
      closeModal();
    }
  }
});

// Abort modal buttons
abortContinueBtn.addEventListener("click", closeAbortModal);
abortQuitBtn.addEventListener("click", executeAbortQuit);

// ============================================================
// 16. INITIALIZATION
// ============================================================

// Development sanity check: every challenge's pass/fail cases must hold
// when validated with the whole-string matcher.
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