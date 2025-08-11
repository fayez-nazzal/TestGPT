import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { autoTest } from '../utils'

describe('autoTest', () => {
  const tmpDir = path.join(process.cwd(), '.vitest-tmp-auto')

  beforeEach(() => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
  })

  afterEach(() => {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('writes response text when using modelEndpoint', async () => {
    const input = path.join(tmpDir, 'in.ts')
    const output = path.join(tmpDir, 'out.test.ts')
    fs.writeFileSync(input, 'export const x = 1')

    const mockFetch = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      text: async () => 'TEST_CONTENT'
    } as any)

    await autoTest({
      inputFile: input,
      outputFile: output,
      apiKey: 'k',
      model: 'gpt-3.5-turbo-16k',
      systemMessage: undefined,
      promptTemplate: undefined,
      examples: [],
      techs: [],
      instructions: [],
      stream: false,
      modelEndpoint: 'http://local/mock'
    })

    expect(fs.readFileSync(output, 'utf-8')).toBe('TEST_CONTENT')
    mockFetch.mockRestore()
  })
})


