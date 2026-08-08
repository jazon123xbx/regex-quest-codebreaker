// ============================================================
// REGEX VALIDATION HELPER
// ============================================================

/**
 * Checks whether a player's input matches a challenge pattern exactly.
 *
 * WHY whole-input anchoring: a pattern like "hello" or "\\d{3}" would
 * otherwise succeed while scanning the middle of a longer string. Wrapping
 * the pattern in an anchored group — /^(?:pattern)$/ — means the ENTIRE
 * typed string must satisfy the regex, so students can only enter a full
 * match, never an accidental substring.
 *
 * @param {string} input   The string the player typed.
 * @param {string} pattern The challenge's regex pattern (no delimiters).
 * @param {string} flags   Optional regex flags such as "i".
 * @returns {boolean} true when the whole input matches the pattern.
 */
export function fullMatch(input, pattern, flags = "") {
  return new RegExp(`^(?:${pattern})$`, flags).test(input);
}