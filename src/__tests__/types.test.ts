import { describe, it, expect } from 'vitest'
import { examplesSchema, ERole } from '../types'

describe('types', () => {
  it('examplesSchema describes an array of examples', () => {
    expect(examplesSchema.type).toBe('array')
    expect(examplesSchema.items?.type).toBe('object')
    expect((examplesSchema.items as any).required).toContain('fileName')
  })

  it('ERole enum has expected values', () => {
    expect(ERole.User).toBe('user')
    expect(ERole.System).toBe('system')
    expect(ERole.Assistant).toBe('assistant')
  })
})


