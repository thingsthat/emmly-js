import { calcReadingTime } from './helpers'

describe('calcReadingTime', () => {
  test('returns 1 for empty string', () => {
    const words = ''
    const result = calcReadingTime(words)
    expect(result).toBe(1)
  })

  test('calculates correct time for standard text', () => {
    const words = 'word '.repeat(200) // 200 words
    const result = calcReadingTime(words)
    expect(result).toBe(1)
  })

  test('calculates correct time for long text', () => {
    const words = 'word '.repeat(1000) // 1000 words
    const result = calcReadingTime(words)
    expect(result).toBe(5)
  })

  test('calculates correct time for very short text', () => {
    const words = 'word '.repeat(10) // 10 words
    const result = calcReadingTime(words)
    expect(result).toBe(1)
  })

  test('handles special characters and numbers correctly', () => {
    const words = 'word123! '.repeat(200)
    const result = calcReadingTime(words)
    expect(result).toBe(1)
  })
})
