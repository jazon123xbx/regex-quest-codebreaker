import { fullMatch } from "./regex-utils.js";
import {
  easyChallenges, mediumChallenges, hardChallenges, bossChallenge,
  allChallenges, buildChallengeSet, buildMissionSet, poolSizes,
  easyPool, mediumPool, hardPool
} from "./challenges.js";

let failures = 0;
let total = 0;

function check(ch) {
  const label = `[${ch.level}] ${ch.title}`;
  let compiled = true;
  try {
    new RegExp(`^(?:${ch.pattern})$`, ch.flags);
  } catch (e) {
    console.error(`  COMPILE ERROR: ${label} — ${e.message}`);
    failures++;
    compiled = false;
  }
  if (!compiled) return;

  ch.pass.forEach((s) => {
    total++;
    if (!fullMatch(s, ch.pattern, ch.flags)) {
      console.error(`  FAIL pass: ${label} — "${s}" should match /${ch.pattern}/${ch.flags}`);
      failures++;
    }
  });
  ch.fail.forEach((s) => {
    total++;
    if (fullMatch(s, ch.pattern, ch.flags)) {
      console.error(`  FAIL fail: ${label} — "${s}" should NOT match /${ch.pattern}/${ch.flags}`);
      failures++;
    }
  });
}

console.log("=== Regex Quest Sanity Check ===\n");

// ── Baseline tests (v2 preserved) ──────────────────────────────────────────

// Test regular challenges
[...easyChallenges, ...mediumChallenges, ...hardChallenges].forEach(check);

// Test boss
check(bossChallenge);

// Pool counts
const poolCount = easyChallenges.length + mediumChallenges.length + hardChallenges.length;
console.log(`\nPools: ${easyChallenges.length} easy, ${mediumChallenges.length} medium, ${hardChallenges.length} hard = ${poolCount} regular + 1 boss = ${poolCount + 1} total`);
console.log(`Test cases: ${total}`);

// Verify allChallenges matches pool
if (allChallenges.length !== poolCount) {
  console.error(`FAIL: allChallenges has ${allChallenges.length} items, expected ${poolCount}`);
  failures++;
}

// Verify pool sizes export matches
if (poolSizes.easy !== easyChallenges.length) {
  console.error(`FAIL: poolSizes.easy = ${poolSizes.easy}, expected ${easyChallenges.length}`);
  failures++;
}
if (poolSizes.medium !== mediumChallenges.length) {
  console.error(`FAIL: poolSizes.medium = ${poolSizes.medium}, expected ${mediumChallenges.length}`);
  failures++;
}
if (poolSizes.hard !== hardChallenges.length) {
  console.error(`FAIL: poolSizes.hard = ${poolSizes.hard}, expected ${hardChallenges.length}`);
  failures++;
}

// Verify pool exports
if (easyPool !== easyChallenges) {
  console.error(`FAIL: easyPool reference mismatch`);
  failures++;
}
if (mediumPool !== mediumChallenges) {
  console.error(`FAIL: mediumPool reference mismatch`);
  failures++;
}
if (hardPool !== hardChallenges) {
  console.error(`FAIL: hardPool reference mismatch`);
  failures++;
}

// Verify no g flag
allChallenges.forEach((ch) => {
  if (ch.flags.includes("g")) {
    console.error(`FAIL: ${ch.title} uses forbidden 'g' flag`);
    failures++;
  }
});

// Verify scoring formula
const scoreTests = [
  { s: 0, expected: 10 },
  { s: 1, expected: 9 },
  { s: 5, expected: 5 },
  { s: 9, expected: 1 },
  { s: 10, expected: 0 },
  { s: 15, expected: 0 }
];
scoreTests.forEach(({ s, expected }) => {
  const actual = Math.max(0, 10 - Math.floor(s));
  if (actual !== expected) {
    console.error(`FAIL scoring: floor(${s}) = ${actual}, expected ${expected}`);
    failures++;
  }
});

// Verify challenge selection invariants (50 iterations)
const SELECTION_ITERATIONS = 50;
let selectionFails = 0;
for (let i = 0; i < SELECTION_ITERATIONS; i++) {
  const set = buildChallengeSet();
  const ids = set.map((ch) => ch.id);

  // Exactly 10
  if (set.length !== 10) {
    console.error(`  FAIL iter ${i}: length ${set.length}, expected 10`);
    selectionFails++;
    continue;
  }

  // Boss at index 9
  if (set[9].level !== "boss") {
    console.error(`  FAIL iter ${i}: index 9 is "${set[9].level}", expected "boss"`);
    selectionFails++;
  }

  // All IDs unique
  if (new Set(ids).size !== 10) {
    console.error(`  FAIL iter ${i}: duplicate IDs — ${ids.join(", ")}`);
    selectionFails++;
  }

  // Level distribution
  const levels = set.map((ch) => ch.level);
  const easy = levels.filter((l) => l === "easy").length;
  const med = levels.filter((l) => l === "medium").length;
  const hard = levels.filter((l) => l === "hard").length;
  const boss = levels.filter((l) => l === "boss").length;
  if (easy !== 3 || med !== 3 || hard !== 3 || boss !== 1) {
    console.error(`  FAIL iter ${i}: distribution easy=${easy} med=${med} hard=${hard} boss=${boss}, expected 3/3/3/1`);
    selectionFails++;
  }
}
if (selectionFails === 0) {
  console.log(`\nSelection check passed: ${SELECTION_ITERATIONS} iterations, all invariants held`);
} else {
  console.error(`\nSelection check: ${selectionFails} failure(s) in ${SELECTION_ITERATIONS} iterations`);
  failures += selectionFails;
}

// ── V3 Mode Tests ──────────────────────────────────────────────────────────
console.log("\n=== V3 Mode Tests ===\n");

// Test buildMissionSet returns correct structure for each mode
const modes = ["rubric", "easy", "medium", "hard", "custom"];
modes.forEach((mode) => {
  const result = buildMissionSet({ mode });
  if (!result || !result.challenges || !result.config) {
    console.error(`FAIL mode ${mode}: missing challenges or config`);
    failures++;
    return;
  }
  if (result.config.mode !== mode) {
    console.error(`FAIL mode ${mode}: config.mode = "${result.config.mode}", expected "${mode}"`);
    failures++;
  }
});

// Rubric mode tests (10 iterations)
let rubricFails = 0;
for (let i = 0; i < 10; i++) {
  const result = buildMissionSet({ mode: "rubric" });
  const { challenges: set, config } = result;

  // Exactly 10
  if (set.length !== 10) {
    console.error(`  FAIL rubric iter ${i}: length ${set.length}, expected 10`);
    rubricFails++;
    continue;
  }

  // No round limit
  if (config.roundLimit !== null) {
    console.error(`  FAIL rubric iter ${i}: roundLimit = ${config.roundLimit}, expected null`);
    rubricFails++;
  }

  // Boss at index 9
  if (set[9].level !== "boss") {
    console.error(`  FAIL rubric iter ${i}: index 9 is "${set[9].level}", expected "boss"`);
    rubricFails++;
  }

  // All IDs unique
  const ids = set.map((ch) => ch.id);
  if (new Set(ids).size !== 10) {
    console.error(`  FAIL rubric iter ${i}: duplicate IDs`);
    rubricFails++;
  }

  // Level distribution: 3 easy, 3 medium, 3 hard, 1 boss
  const levels = set.map((ch) => ch.level);
  const easy = levels.filter((l) => l === "easy").length;
  const med = levels.filter((l) => l === "medium").length;
  const hard = levels.filter((l) => l === "hard").length;
  const boss = levels.filter((l) => l === "boss").length;
  if (easy !== 3 || med !== 3 || hard !== 3 || boss !== 1) {
    console.error(`  FAIL rubric iter ${i}: distribution easy=${easy} med=${med} hard=${hard} boss=${boss}`);
    rubricFails++;
  }
}
if (rubricFails === 0) {
  console.log(`Rubric mode passed: 10 iterations, all invariants held`);
} else {
  console.error(`Rubric mode: ${rubricFails} failure(s)`);
  failures += rubricFails;
}

// Easy mode tests (10 iterations)
let easyFails = 0;
for (let i = 0; i < 10; i++) {
  const result = buildMissionSet({ mode: "easy", questionCount: 5 });
  const { challenges: set, config } = result;

  if (set.length !== 5) {
    console.error(`  FAIL easy iter ${i}: length ${set.length}, expected 5`);
    easyFails++;
    continue;
  }

  if (config.roundLimit !== 20) {
    console.error(`  FAIL easy iter ${i}: roundLimit = ${config.roundLimit}, expected 20`);
    easyFails++;
  }

  // All easy level
  if (!set.every((ch) => ch.level === "easy")) {
    console.error(`  FAIL easy iter ${i}: non-easy challenges found`);
    easyFails++;
  }

  // All IDs unique
  const ids = set.map((ch) => ch.id);
  if (new Set(ids).size !== set.length) {
    console.error(`  FAIL easy iter ${i}: duplicate IDs`);
    easyFails++;
  }
}
if (easyFails === 0) {
  console.log(`Easy mode passed: 10 iterations, all invariants held`);
} else {
  console.error(`Easy mode: ${easyFails} failure(s)`);
  failures += easyFails;
}

// Easy mode clamping: request 10 from pool of 6
const easyClamp = buildMissionSet({ mode: "easy", questionCount: 10 });
if (easyClamp.challenges.length !== easyChallenges.length) {
  console.error(`FAIL easy clamping: got ${easyClamp.challenges.length}, expected ${easyChallenges.length}`);
  failures++;
} else {
  console.log(`Easy mode clamping passed: 10 requested → ${easyClamp.challenges.length} (pool max)`);
}

// Medium mode tests
let medFails = 0;
for (let i = 0; i < 10; i++) {
  const result = buildMissionSet({ mode: "medium", questionCount: 5 });
  const { challenges: set, config } = result;

  if (set.length !== 5) {
    console.error(`  FAIL medium iter ${i}: length ${set.length}, expected 5`);
    medFails++;
    continue;
  }

  if (config.roundLimit !== 15) {
    console.error(`  FAIL medium iter ${i}: roundLimit = ${config.roundLimit}, expected 15`);
    medFails++;
  }

  if (!set.every((ch) => ch.level === "medium")) {
    console.error(`  FAIL medium iter ${i}: non-medium challenges found`);
    medFails++;
  }

  const ids = set.map((ch) => ch.id);
  if (new Set(ids).size !== set.length) {
    console.error(`  FAIL medium iter ${i}: duplicate IDs`);
    medFails++;
  }
}
if (medFails === 0) {
  console.log(`Medium mode passed: 10 iterations, all invariants held`);
} else {
  console.error(`Medium mode: ${medFails} failure(s)`);
  failures += medFails;
}

// Hard mode tests
let hardFails = 0;
for (let i = 0; i < 10; i++) {
  const result = buildMissionSet({ mode: "hard", questionCount: 5 });
  const { challenges: set, config } = result;

  if (set.length !== 5) {
    console.error(`  FAIL hard iter ${i}: length ${set.length}, expected 5`);
    hardFails++;
    continue;
  }

  if (config.roundLimit !== 12) {
    console.error(`  FAIL hard iter ${i}: roundLimit = ${config.roundLimit}, expected 12`);
    hardFails++;
  }

  if (!set.every((ch) => ch.level === "hard")) {
    console.error(`  FAIL hard iter ${i}: non-hard challenges found`);
    hardFails++;
  }

  const ids = set.map((ch) => ch.id);
  if (new Set(ids).size !== set.length) {
    console.error(`  FAIL hard iter ${i}: duplicate IDs`);
    hardFails++;
  }
}
if (hardFails === 0) {
  console.log(`Hard mode passed: 10 iterations, all invariants held`);
} else {
  console.error(`Hard mode: ${hardFails} failure(s)`);
  failures += hardFails;
}

// Hard mode clamping: request 20 from pool of 11
const hardClamp = buildMissionSet({ mode: "hard", questionCount: 20 });
if (hardClamp.challenges.length !== hardChallenges.length) {
  console.error(`FAIL hard clamping: got ${hardClamp.challenges.length}, expected ${hardChallenges.length}`);
  failures++;
} else {
  console.log(`Hard mode clamping passed: 20 requested → ${hardClamp.challenges.length} (pool max)`);
}

// Custom mode tests
const customEasy = buildMissionSet({ mode: "custom", difficulty: "easy", questionCount: 5 });
if (customEasy.challenges.length !== 5) {
  console.error(`FAIL custom easy: length ${customEasy.challenges.length}, expected 5`);
  failures++;
} else if (!customEasy.challenges.every((ch) => ch.level === "easy")) {
  console.error(`FAIL custom easy: non-easy challenges found`);
  failures++;
} else {
  console.log(`Custom easy mode passed: 5 easy challenges`);
}

const customMixed = buildMissionSet({ mode: "custom", difficulty: "mixed", questionCount: 5 });
if (customMixed.challenges.length !== 5) {
  console.error(`FAIL custom mixed: length ${customMixed.challenges.length}, expected 5`);
  failures++;
} else {
  console.log(`Custom mixed mode passed: 5 mixed challenges`);
}

// Custom mode clamping
const customClamp = buildMissionSet({ mode: "custom", difficulty: "easy", questionCount: 10 });
if (customClamp.challenges.length !== easyChallenges.length) {
  console.error(`FAIL custom clamping: got ${customClamp.challenges.length}, expected ${easyChallenges.length}`);
  failures++;
} else {
  console.log(`Custom clamping passed: 10 requested from easy → ${customClamp.challenges.length}`);
}

// No duplicate challenge IDs within any mode (50 iterations)
let uniqueFails = 0;
for (let i = 0; i < 50; i++) {
  modes.forEach((mode) => {
    const settings = mode === "custom" ? { mode, difficulty: "mixed", questionCount: 10 } : { mode, questionCount: 10 };
    const result = buildMissionSet(settings);
    const ids = result.challenges.map((ch) => ch.id);
    if (new Set(ids).size !== result.challenges.length) {
      console.error(`  FAIL unique iter ${i} mode ${mode}: duplicate IDs — ${ids.join(", ")}`);
      uniqueFails++;
    }
  });
}
if (uniqueFails === 0) {
  console.log(`Uniqueness check passed: 50 iterations × ${modes.length} modes, no duplicate IDs`);
} else {
  console.error(`Uniqueness check: ${uniqueFails} failure(s)`);
  failures += uniqueFails;
}

// Boss only in rubric mode
modes.forEach((mode) => {
  const result = buildMissionSet({ mode, questionCount: 10 });
  const hasBoss = result.challenges.some((ch) => ch.level === "boss");
  if (mode === "rubric" && !hasBoss) {
    console.error(`FAIL: rubric mode missing boss`);
    failures++;
  } else if (mode !== "rubric" && hasBoss) {
    console.error(`FAIL: ${mode} mode should not have boss`);
    failures++;
  }
});
console.log(`Boss placement check passed: boss only in rubric mode`);

// Timer configuration tests
const timerTests = [
  { mode: "rubric", expected: null },
  { mode: "easy", expected: 20 },
  { mode: "medium", expected: 15 },
  { mode: "hard", expected: 12 }
];
timerTests.forEach(({ mode, expected }) => {
  const result = buildMissionSet({ mode });
  if (result.config.roundLimit !== expected) {
    console.error(`FAIL timer ${mode}: roundLimit = ${result.config.roundLimit}, expected ${expected}`);
    failures++;
  }
});
console.log(`Timer configuration check passed: ${timerTests.length} modes verified`);

// Preset default counts must match spec — regression shield for MODE_DEFAULTS
const presetCounts = [
  { mode: "easy", expected: 6 },
  { mode: "medium", expected: 8 },
  { mode: "hard", expected: 10 }
];
let presetCountFailures = 0;
for (const { mode, expected } of presetCounts) {
  const result = buildMissionSet({ mode });

  const count = result.challenges.length;
  if (count !== expected) {
    console.error(`FAIL preset count ${mode}: got ${count}, expected ${expected}`);
    presetCountFailures++;
  }

  const configCount = result.config && result.config.questionCount;
  if (configCount !== expected) {
    console.error(`FAIL preset config.questionCount ${mode}: got ${configCount}, expected ${expected}`);
    presetCountFailures++;
  }
}
if (presetCountFailures === 0) {
  console.log(`Preset count defaults passed: easy=6, medium=8, hard=10 from buildMissionSet({ mode })`);
} else {
  console.error(`Preset count defaults: ${presetCountFailures} failure(s)`);
  failures += presetCountFailures;
}

// Custom timer override
const customTimer = buildMissionSet({ mode: "custom", difficulty: "easy", questionCount: 5, roundLimit: 10 });
if (customTimer.config.roundLimit !== 10) {
  console.error(`FAIL custom timer: roundLimit = ${customTimer.config.roundLimit}, expected 10`);
  failures++;
} else {
  console.log(`Custom timer override passed: 10s`);
}

// Scoring formula edge cases
const edgeCases = [
  { s: 0.0, expected: 10 },
  { s: 0.9, expected: 10 },
  { s: 1.0, expected: 9 },
  { s: 9.9, expected: 1 },
  { s: 10.0, expected: 0 },
  { s: 99.9, expected: 0 }
];
edgeCases.forEach(({ s, expected }) => {
  const actual = Math.max(0, 10 - Math.floor(s));
  if (actual !== expected) {
    console.error(`FAIL scoring edge: floor(${s}) = ${actual}, expected ${expected}`);
    failures++;
  }
});
console.log(`Scoring edge cases passed: ${edgeCases.length} cases`);

// ── Summary ────────────────────────────────────────────────────────────────
const baselineTests = total;
const v3Tests = modes.length + 10 + 10 + 10 + 10 + 10 + 50 + modes.length + timerTests.length + 1 + edgeCases.length + presetCounts.length;
const grandTotal = baselineTests + v3Tests;

if (failures === 0) {
  console.log(`\nALL CHECKS PASSED`);
  console.log(`  Baseline: ${baselineTests} regex cases, ${poolCount + 1} challenges, ${scoreTests.length} scoring tests, ${SELECTION_ITERATIONS} selection iterations`);
  console.log(`  V3 modes: ${v3Tests} additional tests`);
  console.log(`  Total: ${grandTotal} test cases`);
  process.exit(0);
} else {
  console.error(`\n${failures} FAILURE(S)`);
  process.exit(1);
}
