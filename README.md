# Regex Quest — Codebreaker Protocol

A polished cybersecurity-themed regex challenge game. Break the pattern. Crack the vault. Become the Codebreaker.

## Project Structure

```
regex-quest/
├── index.html       # Welcome, Game, Results screens + modals
├── styles.css       # Codebreaker visual system, responsive layout, animations
├── regex-utils.js   # Reusable regex validation helper
├── challenges.js    # Challenge data (9 regular + 1 boss)
├── game.js          # Game engine: state machine, timer, scoring, progress, modals
├── storage.js       # localStorage high score persistence
├── test.mjs         # Automated challenge & selection verification
└── README.md        # This file
```

## Features

- 10-vault mission: 3 Easy + 3 Medium + 3 Hard + 1 Boss
- Vault progress path with visual state tracking
- Boss round with distinct amber/gold styling
- ACCESS GRANTED / ACCESS DENIED feedback
- Regex explanation panel after each answer
- How to Play and Regex Field Guide modals
- Mission report with average round time
- Rank system: Rookie Decoder → Master Codebreaker
- Local high score persistence
- Fully responsive (1440px down to 390px)
- Reduced motion support
- Zero dependencies

## Scoring

Each challenge uses an elapsed-count-up timer:

```
challengeScore = max(0, 10 - floor(elapsedSeconds))
totalScore     = sum of all 10 challenge scores
```

- Answer instantly = 10 points
- After 10 seconds = 0 points
- Incorrect answers let you retry (timer keeps running)
- Skip = 0 points for that challenge
- No lives, no timeout, no streak bonuses

## Rank Thresholds

| Score % | Rank |
|---------|------|
| 90–100  | MASTER CODEBREAKER |
| 70–89   | REGEX SPECIALIST |
| 50–69   | CIPHER AGENT |
| 30–49   | PATTERN SCOUT |
| 0–29    | ROOKIE DECODER |

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

Verifies all challenge patterns compile, pass/fail cases are correct, selection invariants hold (50 iterations), and scoring formula is accurate.

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
