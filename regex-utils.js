export function fullMatch(input, pattern, flags = "") {
  return new RegExp(`^(?:${pattern})$`, flags).test(input);
}
