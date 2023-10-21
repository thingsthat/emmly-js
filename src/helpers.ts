/**
 * Returns the number of minutes it will take to read a block of text.
 *
 * @param {string} words - The words to count.
 */
export const calcReadingTime = (words: string) => {
  const wordsPerMinute = 200 // Average case.
  let result = 1

  const textLength = words.split(' ').length // Split by words
  if (textLength > 0) {
    result = Math.ceil(textLength / wordsPerMinute)
  }

  return result
}
