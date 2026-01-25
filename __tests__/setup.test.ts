import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true)
  })

  it('should have access to DOM matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello'
    expect(element).toHaveTextContent('Hello')
  })
})
