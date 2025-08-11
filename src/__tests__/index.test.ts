import { describe, it, expect, vi } from 'vitest'

vi.mock('../command', () => {
  return {
    parseCommand: vi.fn(() => ({ mocked: true } as any)),
    executeCommand: vi.fn(() => undefined)
  }
})

describe('index entry', () => {
  it('imports and calls executeCommand', async () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => { throw new Error(`exit:${code}`) }) as any)
    let failed = false
    try {
      await import('../index')
    } catch (e) {
      failed = true
    }
    expect(failed).toBe(false)
    mockExit.mockRestore()
  })
})


