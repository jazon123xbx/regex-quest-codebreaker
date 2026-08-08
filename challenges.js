export const easyChallenges = [
  {
    id: "e1",
    level: "easy",
    pattern: "hello",
    flags: "",
    title: "Transmission Echo",
    words: "Send the exact word 'hello' to verify the channel",
    hint: "Type the five letters in order — no variations.",
    explanation: "A literal match. The pattern 'hello' only matches the string 'hello' when the full input is checked.",
    pass: ["hello"],
    fail: ["Hello", "helo", "hell o", "123"]
  },
  {
    id: "e2",
    level: "easy",
    pattern: "\\d{3}",
    flags: "",
    title: "Vault Code",
    words: "Enter a three-number security code",
    hint: "Digits only. Exactly three of them.",
    explanation: "\\d matches any digit 0-9. {3} is a quantifier meaning exactly three. So \\d{3} matches any three-digit string.",
    pass: ["000", "123", "999", "456"],
    fail: ["42", "1234", "abc", "12a"]
  },
  {
    id: "e3",
    level: "easy",
    pattern: "[aeiou]",
    flags: "",
    title: "Vowel Beacon",
    words: "Transmit a single vowel signal",
    hint: "Only one character. It must be a, e, i, o, or u.",
    explanation: "[aeiou] is a character class that matches any single vowel. The full-string check means the input must be exactly one vowel.",
    pass: ["a", "e", "i", "o", "u"],
    fail: ["b", "hello", "xyz", "aeiou"]
  },
  {
    id: "e4",
    level: "easy",
    pattern: "[A-Z]",
    flags: "",
    title: "Clearance Required",
    words: "Provide a single uppercase clearance code",
    hint: "One character, A through Z only.",
    explanation: "[A-Z] is a character class matching uppercase letters. The full match means the input must be exactly one uppercase character.",
    pass: ["A", "Z", "B", "M"],
    fail: ["a", "1", "AB", "hello"]
  },
  {
    id: "e5",
    level: "easy",
    pattern: "\\w+",
    flags: "",
    title: "Word Pass",
    words: "Create a username-style string",
    hint: "Use letters, numbers, or underscore. At least one character, no spaces.",
    explanation: "\\w matches any word character: letters, digits, or underscore. + requires one or more characters. The string must contain only word characters.",
    pass: ["a", "hello", "test123", "file_name"],
    fail: ["", "hello world", "no-symbols!", "has space"]
  },
  {
    id: "e6",
    level: "easy",
    pattern: "cat|dog",
    flags: "",
    title: "Pet Patrol",
    words: "Identify the authorized pet: cat or dog",
    hint: "Two options. Type one exactly as shown.",
    explanation: "| is the alternation operator. cat|dog matches either 'cat' or 'dog' exactly.",
    pass: ["cat", "dog"],
    fail: ["bird", "fish", "cattle", "cats"]
  }
];

export const mediumChallenges = [
  {
    id: "m1",
    level: "medium",
    pattern: "\\d{3}-\\d{4}",
    flags: "",
    title: "Agent Code",
    words: "Format a local phone number: three digits, dash, four digits",
    hint: "Digits in two groups. Don't forget the dash between them.",
    explanation: "\\d{3} matches three digits, then a literal -, then \\d{4} matches four digits. Together they enforce exactly the 3-digit-dash-4-digit format.",
    pass: ["555-1234", "000-0000", "999-1000", "123-4567"],
    fail: ["5551234", "555-123", "55-12345", "abc-defg"]
  },
  {
    id: "m2",
    level: "medium",
    pattern: "[a-z]+",
    flags: "",
    title: "Lowercase Lock",
    words: "Enter a word using only lowercase letters",
    hint: "Letters a through z only. One or more characters.",
    explanation: "[a-z]+ matches one or more lowercase letters. Since we check the full string, the entire input must be lowercase letters only.",
    pass: ["a", "hello", "abcxyz", "codebreaker"],
    fail: ["", "Hello", "hello123", "HELLO"]
  },
  {
    id: "m3",
    level: "medium",
    pattern: ".+\\.(jpg|png|gif)",
    flags: "",
    title: "File Extension Gate",
    words: "Name an image file ending in .jpg, .png, or .gif",
    hint: "Must have at least one character before the dot. Then pick one of the three extensions.",
    explanation: ".+ matches one or more characters, \\. matches a literal period, (jpg|png|gif) matches one of those extensions. The input must end with one of those three extensions.",
    pass: ["photo.jpg", "icon.png", "banner.gif", "a.gif"],
    fail: [".jpg", "file.txt", "image.jpeg", "noext"]
  },
  {
    id: "m4",
    level: "medium",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "",
    title: "Comm Link",
    words: "Send a valid email address",
    hint: "Three parts: local part, @, domain with a dot and at least two-letter extension.",
    explanation: "The pattern matches a simplified email format: alphanumeric characters before @, a domain name, a literal dot, and a top-level domain of at least two letters.",
    pass: ["user@example.com", "agent@hq.gov", "test@site.co", "a@b.cc"],
    fail: ["userexample.com", "user@", "@site.com", "user@.com"]
  },
  {
    id: "m5",
    level: "medium",
    pattern: "https?://.*",
    flags: "",
    title: "Secure Tunnel",
    words: "Enter a URL starting with http:// or https://",
    hint: "The 's' is optional. Then comes :// and anything after.",
    explanation: "http matches literal text. s? makes the 's' optional. :// is literal. .* matches anything after the protocol prefix.",
    pass: ["http://site.com", "https://example.org", "https://a.b"],
    fail: ["ftp://files.com", "site.com", "http:", "https//"]
  },
  {
    id: "m6",
    level: "medium",
    pattern: "\\w{4,6}",
    flags: "",
    title: "Word Scanner",
    words: "Submit a short code: 4 to 6 word characters",
    hint: "Length matters — between 4 and 6 characters total.",
    explanation: "\\w{4,6} matches 4 to 6 word characters (letters, digits, underscore). The full match means the entire input must be exactly that length.",
    pass: ["code", "hello", "abcde", "abcdef"],
    fail: ["a", "hi", "ab", "supercali"]
  },
  {
    id: "m7",
    level: "medium",
    pattern: "(?!.*[A-Z])(?=.*\\d)[a-z\\d]{6,}",
    flags: "",
    title: "Cipher Protocol",
    words: "Create a 6+ character password using only lowercase and digits, must include at least one digit",
    hint: "No uppercase letters allowed. Must include a digit. Think about what lookaheads can enforce.",
    explanation: "(?!.*[A-Z]) is a negative lookahead that rejects any uppercase. (?=.*\\d) is a positive lookahead that requires at least one digit. [a-z\\d]{6,} matches 6 or more lowercase letters and digits.",
    pass: ["abc123", "code42", "123456", "hello1"],
    fail: ["Abc123", "abcdef", "abc", "ABC123"]
  },
  {
    id: "m8",
    level: "medium",
    pattern: "[2-9]\\d{9}",
    flags: "",
    title: "Agent ID",
    words: "Enter a 10-digit agent ID",
    hint: "The first digit has a restricted range. Nine digits follow.",
    explanation: "[2-9] matches the first digit (must be 2-9). \\d{9} matches exactly 9 more digits. Together: a 10-digit number not starting with 0 or 1.",
    pass: ["2000000000", "9999999999", "5551234567", "2125551234"],
    fail: ["1234567890", "0123456789", "123456789", "12345678901"]
  },
  {
    id: "m9",
    level: "medium",
    pattern: "(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(?:\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}",
    flags: "",
    title: "IP Lockpick",
    words: "Enter a valid IPv4 address (each part 0-255, four parts separated by dots)",
    hint: "Each number segment is 0-255. Three dots separate four segments.",
    explanation: "Each octet uses alternation to match 0-255: 25[0-5] for 250-255, 2[0-4]\\d for 200-249, [01]?\\d\\d? for 0-199. Four groups separated by literal dots.",
    pass: ["0.0.0.0", "255.255.255.255", "192.168.1.1", "10.0.0.1"],
    fail: ["256.0.0.0", "1.2.3", "1.2.3.4.5", "abc.def.ghi.jkl"]
  }
];

export const hardChallenges = [
  {
    id: "h1",
    level: "hard",
    pattern: "(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}",
    flags: "",
    title: "Vault Passphrase",
    words: "Construct a strong passphrase: letters, digits, symbols, 8+ characters",
    hint: "Four separate conditions must all be true for the string to pass.",
    explanation: "(?=.*[A-Z]) requires uppercase. (?=.*[a-z]) requires lowercase. (?=.*\\d) requires a digit. (?=.*[!@#$%^&*]) requires one of these symbols. .{8,} enforces at least 8 characters.",
    pass: ["Passw0rd!", "MyStr0ng#", "A1b!cdef", "Xyz123$$"],
    fail: ["password", "PASSWORD", "Passw0rd", "Ab1!", "12345678"]
  },
  {
    id: "h2",
    level: "hard",
    pattern: "20[0-2]\\d-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
    flags: "",
    title: "Time Stamp",
    words: "Enter a date between 2000 and 2029 in YYYY-MM-DD format",
    hint: "Year range is limited. The month and day groups validate calendar bounds.",
    explanation: "20[0-2]\\d matches years 2000-2029. (?:0[1-9]|1[0-2]) matches months 01-12. (?:0[1-9]|[12]\\d|3[01]) matches days 01-31.",
    pass: ["2024-01-15", "2000-12-31", "2029-06-01", "2025-02-28"],
    fail: ["2024-13-01", "2024-00-15", "2024-01-32", "2030-01-01", "24-01-15"]
  },
  {
    id: "h3",
    level: "hard",
    pattern: "(?!.*(.)\\1{2})[a-z]{6,}",
    flags: "",
    title: "No Repeats",
    words: "Build a 6+ letter string where no single letter repeats three times in a row",
    hint: "A backreference with a quantifier is looking for three identical letters side by side.",
    explanation: "(?!.*(.)\\1{2}) is a negative lookahead: (.) captures any character, \\1 refers to the same character, {2} means two more of it consecutively. [a-z]{6,} ensures lowercase only, 6+ length.",
    pass: ["abcdef", "aabbcc", "abacab", "abcabc"],
    fail: ["aaa", "aaabbb", "abbbcd", "aabbb"]
  },
  {
    id: "h4",
    level: "hard",
    pattern: "(?!.*(.{2,}).*\\1)[a-z]{4}",
    flags: "",
    title: "No Repeats Anywhere",
    words: "Type exactly four lowercase letters with no repeated 2-char substring",
    hint: "A captured substring is checked against itself — don't let any pair appear twice.",
    explanation: "(?!.*(.{2,}).*\\1) is a negative lookahead that captures any 2+ character substring and checks if it appears again. [a-z]{4} matches exactly 4 lowercase letters.",
    pass: ["abcd", "aefd", "azbc", "aabb"],
    fail: ["aaaa", "abab", "baba"]
  },
  {
    id: "h5",
    level: "hard",
    pattern: "(?=.*[a-z])(?=.*\\d)[a-zA-Z\\d]{16}",
    flags: "",
    title: "Card Blocker",
    words: "Generate a 16-character card number using letters and digits, with at least one of each",
    hint: "Fixed length. Two lookaheads: one for a letter, one for a digit.",
    explanation: "(?=.*[a-z]) requires at least one letter. (?=.*\\d) requires at least one digit. [a-zA-Z\\d]{16} matches exactly 16 alphanumeric characters.",
    pass: ["a1b2c3d4e5f6g7h8", "1a2b3c4d5e6f7g8h", "AbCdEfGh12345678"],
    fail: ["1234567890123456", "abcdefghijklmnop", "short", "toomanycharacter"]
  },
  {
    id: "h6",
    level: "hard",
    pattern: "(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?!.*(\\d)\\1)[a-zA-Z\\d]{8,}",
    flags: "",
    title: "Double Agent",
    words: "Create an 8+ character code with mixed case and digits, but no consecutive repeated digits",
    hint: "Uppercase, lowercase, and digit required. Watch out for doubled digits like '11'.",
    explanation: "Three lookaheads require uppercase, lowercase, and digit. (?!.*(\\d)\\1) rejects any digit appearing twice in a row. [a-zA-Z\\d]{8,} matches 8+ alphanumeric characters.",
    pass: ["Passw0rd", "Str0ngKey", "A1b2c3d4", "MyP4ssw0rd"],
    fail: ["password", "PASSWORD", "a11b2c3d", "11223344"]
  },
  {
    id: "h7",
    level: "hard",
    pattern: "([a-z])\\w{1,3}\\1",
    flags: "",
    title: "Echo Chamber",
    words: "Create a 3-5 character word that starts and ends with the same letter",
    hint: "The first letter is captured. Something at the end must match it.",
    explanation: "([a-z]) captures the first letter. \\w{1,3} matches 1 to 3 word characters in the middle. \\1 ensures the last character is the same as the first.",
    pass: ["aba", "abcba", "axa", "xyzx"],
    fail: ["a", "aa", "ab", "abcc"]
  },
  {
    id: "h8",
    level: "hard",
    pattern: "[a-z](?:[a-z\\d]|-(?!-)){0,18}[a-z\\d]",
    flags: "",
    title: "Domain Encoder",
    words: "Enter a valid domain label: 2-20 lowercase alphanumeric characters with optional single hyphens",
    hint: "Starts and ends with alphanumeric. Hyphens are allowed, but repeated hyphens are blocked.",
    explanation: "[a-z] starts with a letter. (?:[a-z\\d]|-(?!-)){0,18} allows letters, digits, or hyphens (but not two in a row). [a-z\\d] ensures it ends with alphanumeric.",
    pass: ["ab", "my-domain", "a1b2c3", "test-name-here"],
    fail: ["-a", "a-", "a--b", "UPPER", "a"]
  },
  {
    id: "h9",
    level: "hard",
    pattern: "(?!(.)\\1+$)[a-z]{3,6}",
    flags: "",
    title: "Not Just One",
    words: "Enter 3-6 lowercase letters that aren't all the same character",
    hint: "A backreference checks if every character matches the first one — make sure they don't.",
    explanation: "(?!(.)\\1+$) is a negative lookahead: captures the first character, then \\1+ checks if the rest are the same. [a-z]{3,6} matches 3 to 6 lowercase letters.",
    pass: ["abc", "aab", "abcc", "abcde", "abcdef"],
    fail: ["aaa", "bb", "aaaaaa", "aaaa"]
  },
  {
    id: "h10",
    level: "hard",
    pattern: "(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[a-zA-Z\\d]{8,}",
    flags: "",
    title: "Master Key",
    words: "Build a master key: 8+ alphanumeric characters with uppercase, lowercase, and digits",
    hint: "Three independent conditions must all pass. Each is checked separately before the full string is accepted.",
    explanation: "(?=.*[A-Z]) requires uppercase. (?=.*[a-z]) requires lowercase. (?=.*\\d) requires a digit. [a-zA-Z\\d]{8,} matches 8+ alphanumeric characters.",
    pass: ["Passw0rd", "A1b2c3d4", "MyP4ssw0rd", "Str0ngKey"],
    fail: ["password", "PASSWORD", "12345678", "abcdefgh"]
  },
  {
    id: "h11",
    level: "hard",
    pattern: "(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*])(?!.*(\\d)\\1).{8,}",
    flags: "",
    title: "Master Key Plus",
    words: "Craft the ultimate key: letters, digits, symbols, 8+ chars, no consecutive repeated digits",
    hint: "Like Vault Passphrase, but there's an extra rule punishing doubled digits.",
    explanation: "Same four lookaheads as Vault Passphrase, plus (?!.*(\\d)\\1) rejects any digit appearing twice in a row.",
    pass: ["Passw0rd!", "MyStr0ng#", "A1b!cdef", "Xyz123$$"],
    fail: ["password", "PASSWORD", "Passw0rd", "Ab1!", "12345678", "Aa1!2222"]
  }
];

export const bossChallenge = {
  id: "boss",
  level: "boss",
  pattern: "(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*]).{12,}",
  flags: "",
  title: "BOSS: Master Lock",
  words: "Break the final lock — 12+ characters, all four character types required",
  hint: "Four conditions must hold simultaneously. Each check handles one character type, while the final rule enforces enough total length.",
  explanation: "Four positive lookaheads: (?=.*[A-Z]) for uppercase, (?=.*[a-z]) for lowercase, (?=.*\\d) for a digit, (?=.*[!@#$%^&*]) for a symbol. .{12,} enforces at least 12 characters. You need all four character types and enough length.",
  pass: ["BossP4ssw0rd!", "Str0ng#KeyAbc", "V@ultM4st3rKey!", "H4ck3r$Pr00f!"],
  fail: ["short!", "noDIGIT", "n0symbol", "NoSpecial123", "alllowercase123!"]
};

export const allChallenges = [...easyChallenges, ...mediumChallenges, ...hardChallenges];

// ── Pure challenge selection (DOM-free, testable) ──────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

export function buildChallengeSet(
  easy = easyChallenges,
  med = mediumChallenges,
  hard = hardChallenges,
  boss = bossChallenge
) {
  return [...pickRandom(easy, 3), ...pickRandom(med, 3), ...pickRandom(hard, 3), boss];
}

// ── Pool exports for mission builder ───────────────────────────────────────
export const easyPool = easyChallenges;
export const mediumPool = mediumChallenges;
export const hardPool = hardChallenges;
export const poolSizes = { easy: easyChallenges.length, medium: mediumChallenges.length, hard: hardChallenges.length };

// ── Mission builder (all modes) ────────────────────────────────────────────
const MODE_DEFAULTS = {
  rubric: { count: 10, timer: null },
  easy:   { count: 6, timer: 20 },
  medium: { count: 8, timer: 15 },
  hard:   { count: 10, timer: 12 },
  custom: { count: 10, timer: null }
};

export function buildMissionSet(settings = {}) {
  const {
    mode = "rubric",
    difficulty = "mixed",
    questionCount,
    roundLimit
  } = settings;

  const defaults = MODE_DEFAULTS[mode] || MODE_DEFAULTS.rubric;
  const effectiveQuestionCount = questionCount ?? defaults.count;
  const effectiveRoundLimit = roundLimit ?? defaults.timer;

  let selected = [];
  let effectiveCount = effectiveQuestionCount;

  switch (mode) {
    case "rubric": {
      const easy = pickRandom(easyChallenges, 3);
      const med = pickRandom(mediumChallenges, 3);
      const hard = pickRandom(hardChallenges, 3);
      selected = [...easy, ...med, ...hard, bossChallenge];
      effectiveCount = 10;
      break;
    }
    case "easy": {
      effectiveCount = Math.min(effectiveQuestionCount, easyChallenges.length);
      selected = pickRandom(easyChallenges, effectiveCount);
      break;
    }
    case "medium": {
      effectiveCount = Math.min(effectiveQuestionCount, mediumChallenges.length);
      selected = pickRandom(mediumChallenges, effectiveCount);
      break;
    }
    case "hard": {
      effectiveCount = Math.min(effectiveQuestionCount, hardChallenges.length);
      selected = pickRandom(hardChallenges, effectiveCount);
      break;
    }
    case "custom": {
      let pool = [];
      if (difficulty === "easy") pool = easyChallenges;
      else if (difficulty === "medium") pool = mediumChallenges;
      else if (difficulty === "hard") pool = hardChallenges;
      else pool = [...easyChallenges, ...mediumChallenges, ...hardChallenges];

      effectiveCount = Math.min(effectiveQuestionCount, pool.length);
      selected = pickRandom(pool, effectiveCount);
      break;
    }
  }

  return {
    challenges: selected,
    config: {
      mode,
      difficulty: difficulty,
      questionCount: selected.length,
      roundLimit: effectiveRoundLimit
    }
  };
}
