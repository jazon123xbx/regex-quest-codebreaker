# Regex Quest — Codebreaker Challenge

An educational web game where players decode secret regex patterns by entering strings that match them.

## Project Structure

```
regex-quest/
├── index.html       # Single page with Welcome, Game, and Results screens
├── styles.css       # Codebreaker theme, responsive layout, animations
├── regex-utils.js   # Reusable regex validation helper
├── challenges.js    # Challenge data (9 regular + 1 boss)
├── game.js          # Game engine: state machine, timer, scoring, rendering
├── storage.js       # localStorage high score persistence
└── README.md        # This file
```

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

## How Regex Validation Works

The core matcher in `regex-utils.js` wraps the pattern in a non-capturing group and anchors it:

```js
fullMatch(input, pattern, flags)
// Equivalent to: /^(?:pattern)$/flags.test(input)
```

This enforces that the **entire input** matches the regex, regardless of whether the pattern itself contains anchors. The input is checked for empty strings in the UI layer before calling `fullMatch`, keeping the matcher generic.

## Running Locally

No build step required. Open `index.html` in a browser, or use a local server:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (npx)
npx serve .
```

Then visit `http://localhost:8000`.

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

## GitHub Pages Deployment

1. Push the `main` branch to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose `main` branch, `/ (root)` folder
5. Click **Save**
6. Your game will be live at `https://<username>.github.io/regex-quest/`

## Vercel Deployment

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel will auto-detect this as a static site
4. Click **Deploy**
5. Your game will be live at `https://<project-name>.vercel.app`

## Keyboard Controls

- **Enter** — Submit your answer
- **H** — Not mapped (use the Hint button to avoid accidental triggers while typing)
- **S** — Not mapped (use the Skip button)

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). No dependencies required.
