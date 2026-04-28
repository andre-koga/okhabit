export const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

/**
 * Extract the first emoji from a string.
 */
export function getFirstEmoji(str: string): string {
  if (!str) return "";
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  for (const { segment } of segmenter.segment(str)) {
    if (EMOJI_REGEX.test(segment)) return segment;
  }
  return "";
}
