# Regex Quest — Codebreaker Arena

A cybersecurity-themed regex challenge game with multiple mission modes, circular countdown timers, and a command-center interface. Break the pattern. Crack the vault. Become the Codebreaker.

**Mission Operators:** Redido · Tamboboy · Sanchez

## Project Structure

```
regex-quest/
├── index.html       # Welcome, Mission Select, Game, Results screens + modals
├── styles.css       # Codebreaker Arena visual system, responsive layout, animations
├── regex-utils.js   # Reusable regex validation helper (DO NOT MODIFY)
├── challenges.js    # Challenge data pools + buildMissionSet() builder
├── game.js          # Game engine: mode router, timer, scoring, progress, modals
├── storage.js       # localStorage high score persistence (legacy + per-mode)
├── test.mjs         # Automated challenge, selection, and mode verification
└── README.md        # This file
```

## Mission Modes

| Mode | Questions | Timer | Description |
|------|-----------|-------|-------------|
| **Rubric** | 10 (3E + 3M + 3H + Boss) | Unlimited | Default/teacher-safe mode covering all difficulty levels |
| **Easy** | Up to 6 | 20s per round | Focus on beginner patterns |
| **Medium** | Up to 9 | 15s per round | Intermediate patterns |
| **Hard** | Up to 11 | 12s per round | Advanced patterns |
| **Custom** | 5 or 10 | 10s / 15s / 20s / Unlimited | Configure difficulty, question count, and timer |

## Features

- 5 mission modes with unique pool sizes and timer configurations
- Command-center grid layout (responsive: desktop → tablet → mobile)
- Circular SVG timer with countdown/elapsed modes and warning/critical states
- Dynamic progress path matching question count
- Difficulty transition banners between challenge levels
- Boss round with distinct amber/gold styling (Rubric mode only)
- Sound effects (toggle-able) for correct/incorrect/skip/timeout
- ACCESS GRANTED / ACCESS DENIED / TIMEOUT feedback
- Regex explanation panel after each answer
- How to Play and Regex Field Guide modals
- Per-mode high score tracking
- Mission report with expanded statistics
- Rank system: Rookie Decoder → Master Codebreaker
- Team credits display
- Fully responsive (1440px down to 390px)
- Reduced motion support
- Zero dependencies

## Scoring

Each challenge scores based on elapsed time:

```
challengeScore = max(0, 10 - floor(elapsedSeconds))
totalScore     = sum of all challenge scores
```

- Answer instantly = 10 points
- After 10 seconds = 0 points
- Incorrect answers let you retry (timer keeps running)
- Skip = 0 points for that challenge
- Timeout = 0 points for that challenge (timed modes only)

**Internal scoring ALWAYS uses elapsedSeconds**, even when the timer displays countdown.

## Rank Thresholds

Rank is calculated against the maximum possible score for the mission:

```
scorePercentage = finalScore / (questionCount × 10)
```

| Score % | Rank |
|---------|------|
| 90–100  | MASTER CODEBREAKER |
| 70–89   | REGEX SPECIALIST |
| 50–69   | CIPHER AGENT |
| 30–49   | PATTERN SCOUT |
| 0–29    | ROOKIE DECODER |

## Challenge Pools

| Pool | Count | IDs |
|------|-------|-----|
| Easy | 6 | e1–e6 |
| Medium | 9 | m1–m9 |
| Hard | 11 | h1–h11 |
| Boss | 1 | boss |
| **Total** | **27** | |

## How Regex Validation Works

The core matcher in `regex-utils.js` wraps the pattern in a non-capturing group and anchors it:

```js
fullMatch(input, pattern, flags)
// Equivalent to: /^(?:pattern)$/flags.test(input)
```

This enforces that the **entire input** matches the regex, regardless of whether the pattern itself contains anchors.

## Running Locally

No build step required. Open `index.html` in a browser, or use a local server:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Running Tests

```bash
node test.mjs
```

Verifies:
- All 216 challenge pass/fail cases compile and match correctly
- Selection invariants hold across 50 iterations (Rubric mode)
- All 5 mission modes produce correct structure, pool sizes, and timer configs
- Pool uniqueness across 50 iterations × 5 modes
- Boss placement only in Rubric mode
- Scoring formula edge cases
- **Total: 337 automated test cases**

## Architecture

### buildMissionSet(settings)

Pure function in `challenges.js` that generates challenges for any mode:

```js
buildMissionSet({ mode: "rubric" })
buildMissionSet({ mode: "easy", questionCount: 5 })
buildMissionSet({ mode: "custom", difficulty: "hard", questionCount: 10, roundLimit: 12 })
```

Returns `{ challenges: [...], config: { mode, difficulty, questionCount, roundLimit } }`.

### Storage Keys

- `regexquest_highscore` — legacy high score (backward compatible)
- `regexquest_mode_highscores` — per-mode high scores as JSON map

## Adding Challenges

Open `challenges.js` and add an entry to the appropriate pool (`easyChallenges`, `mediumChallenges`, or `hardChallenges`):

```js
{
  id: "e7",
  level: "easy",
  pattern: "\\d+",
  flags: "",
  title: "Digit Counter",
  words: "One or more digits",
  hint: "\\d matches any digit. + means one or more.",
  explanation: "\\d matches 0–9. + requires one or more.",
  pass: ["1", "42", "100"],
  fail: ["abc", "12a", ""]
}
```

Every challenge must include `pass` and `fail` arrays for automated verification.

## Deployment

### GitHub Pages
1. Push the `main` branch to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose `main` branch, `/ (root)` folder
5. Click **Save**

### Vercel
1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Click **Deploy**

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). No dependencies required.
