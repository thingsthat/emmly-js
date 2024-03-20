/**
 * Returns the number of minutes it will take to read a block of text.
 *
 * @param {string} text - The text to count.
 * @returns {number} The number of minutes.
 */
export const calcReadingTime = (text: string): number => {
  const wordsPerMinute = 200 // Average case.
  text = text.trim().replace(/\s+/g, ' ') // Trims and replaces multiple spaces with a single space

  const wordCount = text.split(' ').filter(Boolean).length // Splits by spaces and filters out empty strings
  return wordCount > 0 ? Math.ceil(wordCount / wordsPerMinute) : 1
}
