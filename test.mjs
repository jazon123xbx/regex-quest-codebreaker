import { fullMatch } from "./regex-utils.js";
import { easyChallenges, mediumChallenges, hardChallenges, bossChallenge, allChallenges, buildChallengeSet } from "./challenges.js";

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

if (failures === 0) {
  console.log(`\nALL CHECKS PASSED (${total} test cases, ${poolCount + 1} challenges, ${scoreTests.length} scoring tests)`);
  process.exit(0);
} else {
  console.error(`\n${failures} FAILURE(S)`);
  process.exit(1);
}
