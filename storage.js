// ============================================================
// HIGH SCORE PERSISTENCE (localStorage)
// ============================================================
//
// Scores are stored in two places:
//  - STORAGE_KEY          : the legacy single overall high score (kept for
//                           backward compatibility with older versions).
//  - MODE_STORAGE_KEY     : per-mode high scores kept as a JSON map. High
//                           scores are separated by mode because comparing an
//                           "Easy" score to a "Rubric" score would be unfair.
//
// Every function is error-safe: if localStorage is unavailable (private
// browsing, storage disabled) the game simply treats the score as 0 and
// keeps playing without crashing.

const STORAGE_KEY = "regexquest_highscore";
const MODE_STORAGE_KEY = "regexquest_mode_highscores";

// ── Legacy overall high score ──────────────────────────────────────────────

/**
 * Reads the legacy overall high score.
 * @returns {number} The stored score, or 0 when absent/unreadable.
 */
export function getHighScore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Writes the legacy overall high score.
 * @param {number} score The score to persist.
 */
export function setHighScore(score) {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    // localStorage unavailable — fail silently
  }
}

// ── Per-mode high scores ───────────────────────────────────────────────────

const VALID_MODES = ["rubric", "easy", "medium", "hard", "custom"];

/**
 * Reads the whole per-mode map { mode: bestScore }.
 * @returns {Object} Map of mode -> high score.
 */
function getModeHighScores() {
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persists the whole per-mode map.
 * @param {Object} map Map of mode -> high score.
 */
function saveModeHighScores(map) {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // fail silently
  }
}

/**
 * Reads the best score recorded for one mission mode.
 * @param {string} mode One of the VALID_MODES keys.
 * @returns {number} The stored score, or 0 when none.
 */
export function getModeHighScore(mode) {
  if (!VALID_MODES.includes(mode)) return 0;
  const map = getModeHighScores();
  return map[mode] || 0;
}

/**
 * Records a new best score for a mode, only when it improves the old one.
 * @param {string} mode One of the VALID_MODES keys.
 * @param {number} score The score to persist.
 */
export function setModeHighScore(mode, score) {
  if (!VALID_MODES.includes(mode)) return;
  const map = getModeHighScores();
  if (!map[mode] || score > map[mode]) {
    map[mode] = score;
    saveModeHighScores(map);
  }
}

/**
 * Tells whether a score ties or beats the current best for a mode.
 * Used to decide whether to show the "NEW HIGH SCORE" badge.
 * @param {string} mode One of the VALID_MODES keys.
 * @param {number} score The score to compare.
 * @returns {boolean} true when the score is a (tied or new) high score.
 */
export function isModeHighScore(mode, score) {
  return score > 0 && score >= getModeHighScore(mode);
}