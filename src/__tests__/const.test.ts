import { describe, it, expect } from 'vitest'
import { CONFIG_FILE_NAME, DEFAULT_MODEL } from '../const'

describe('const', () => {
  it('exposes constants', () => {
    expect(CONFIG_FILE_NAME).toBe('testgpt.config.yaml')
    expect(DEFAULT_MODEL).toBe('gpt-3.5-turbo-16k')
  })
})


