const STORAGE_KEY = "regexquest_highscore";
const MODE_STORAGE_KEY = "regexquest_mode_highscores";

export function getHighScore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export function setHighScore(score) {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    // localStorage unavailable — fail silently
  }
}

// ── Per-mode high scores ───────────────────────────────────────────────────
const VALID_MODES = ["rubric", "easy", "medium", "hard", "custom"];

function getModeHighScores() {
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveModeHighScores(map) {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // fail silently
  }
}

export function getModeHighScore(mode) {
  if (!VALID_MODES.includes(mode)) return 0;
  const map = getModeHighScores();
  return map[mode] || 0;
}

export function setModeHighScore(mode, score) {
  if (!VALID_MODES.includes(mode)) return;
  const map = getModeHighScores();
  if (!map[mode] || score > map[mode]) {
    map[mode] = score;
    saveModeHighScores(map);
  }
}

export function isModeHighScore(mode, score) {
  return score > 0 && score >= getModeHighScore(mode);
}
