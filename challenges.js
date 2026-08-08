export const easyChallenges = [
  {
    id: "e1",
    level: "easy",
    pattern: "hello",
    flags: "",
    title: "Transmission Echo",
    words: "Match the exact word 'hello'",
    hint: "Just type the five letters exactly.",
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
    words: "Exactly three digits",
    hint: "\\d matches any digit (0-9). {3} means exactly three.",
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
    words: "A single vowel character",
    hint: "Square brackets create a character class. This one has all five vowels.",
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
    words: "A single uppercase letter",
    hint: "[A-Z] matches uppercase letters A through Z.",
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
    words: "One or more word characters (letters, digits, underscore)",
    hint: "\\w matches [a-zA-Z0-9_]. + means one or more.",
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
    words: "The exact word 'cat' or 'dog'",
    hint: "| is the OR operator.",
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
    words: "Phone format: three digits, dash, four digits",
    hint: "Use \\d for digits, a literal dash between groups.",
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
    words: "Only lowercase letters, one or more",
    hint: "[a-z] covers lowercase a through z.",
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
    words: "Ends with .jpg, .png, or .gif (with at least one char before the dot)",
    hint: "\\. is a literal dot. The parentheses group alternatives.",
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
    words: "A basic email address",
    hint: "Think: username + @ + domain + . + extension.",
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
    words: "Starts with http:// or https://",
    hint: "The s? makes the 's' optional. // is literal.",
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
    words: "Exactly 4 to 6 word characters",
    hint: "\\w matches word characters. {4,6} is a range quantifier.",
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
    words: "Lowercase + digits, 6+ chars, no uppercase, at least one digit",
    hint: "(?=...) is a positive lookahead. (?!...) is a negative lookahead.",
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
    words: "Exactly 10 digits, first digit is 2-9",
    hint: "The first character range [2-9] sets the constraint.",
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
    words: "A valid IPv4 address (0.0.0.0 - 255.255.255.255)",
    hint: "Each octet matches 0-255: 25[0-5] covers 250-255.",
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
    words: "8+ chars with uppercase, lowercase, digit, and symbol (!@#$%^&*)",
    hint: "Four lookaheads: one for each required character type.",
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
    words: "Date in YYYY-MM-DD format (2000-2029, valid month/day)",
    hint: "Non-capturing groups (?:) organize each segment. Check month 01-12, day 01-31.",
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
    words: "Lowercase only, 6+ chars, no letter appears 3+ times consecutively",
    hint: "(?!.*(.)\\1{2}) uses a backreference to reject three identical consecutive letters.",
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
    words: "Exactly 4 lowercase chars, no 2+ char substring repeats",
    hint: "Backreference \\1 refers to the first capture group.",
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
    words: "Exactly 16 alphanumeric chars with at least one letter and one digit",
    hint: "Two lookaheads ensure both a letter and a digit are present.",
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
    words: "8+ alphanumeric, upper+lower+digit, no consecutive repeated digits",
    hint: "Backreference (\\d)\\1 rejects doubled digits like '11' or '22'.",
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
    words: "Starts and ends with the same letter, total 3-5 chars",
    hint: "\\1 backreferences the first captured letter.",
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
    words: "Valid simple domain label: 2-20 chars, no consecutive hyphens, starts/ends alphanumeric",
    hint: "Non-capturing groups manage the character class and hyphen rules.",
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
    words: "3-6 lowercase chars, not all the same letter",
    hint: "(?!(.)\\1+$) rejects strings where one character repeats throughout.",
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
    words: "8+ alphanumeric, upper+lower+digit required",
    hint: "Three lookaheads enforce case and digit requirements.",
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
    words: "8+ chars, upper+lower+digit+symbol, no doubled digits",
    hint: "Same as Vault Passphrase but also check for doubled digits.",
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
  words: "The Final Cipher: 12+ chars, uppercase, lowercase, digit, and one of !@#$%^&*",
  hint: "Four lookaheads enforce all four character types, plus a minimum length of 12.",
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
