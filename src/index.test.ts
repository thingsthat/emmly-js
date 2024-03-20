import { EmmlyClient } from './'

describe('EmmlyClient buildUrl', () => {
  const client = new EmmlyClient()

  test('should return the same URL if no parameters are provided', () => {
    const url = 'https://api.emmly.co'
    expect(client.buildUrl(url)).toBe(url)
  })

  test('should append a single parameter correctly', () => {
    const url = 'https://api.emmly.co'
    const parameters = { param1: 'value1' }
    expect(client.buildUrl(url, parameters)).toBe(
      'https://api.emmly.co?param1=value1',
    )
  })

  test('should append multiple parameters correctly', () => {
    const url = 'https://api.emmly.co'
    const parameters = { param1: 'value1', param2: 'value2' }
    expect(client.buildUrl(url, parameters)).toBe(
      'https://api.emmly.co?param1=value1&param2=value2',
    )
  })

  test('should encode URL parameters', () => {
    const url = 'https://api.emmly.co'
    const parameters = { param1: 'value&value' }
    expect(client.buildUrl(url, parameters)).toBe(
      'https://api.emmly.co?param1=value%26value',
    )
  })

  test('should handle URLs with existing parameters', () => {
    const url = 'https://api.emmly.co?existing=param'
    const parameters = { param1: 'value1' }
    expect(client.buildUrl(url, parameters)).toBe(
      'https://api.emmly.co?existing=param&param1=value1',
    )
  })
})
