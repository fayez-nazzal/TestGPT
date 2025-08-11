import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseCommand, executeCommand, executeForFile } from '../command'

const mockExit = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => { throw new Error(`exit:${code}`) }) as any)
const mockCwd = vi.spyOn(process, 'cwd')

describe('command', () => {
  const tmpDir = path.join(process.cwd(), '.vitest-tmp-cmd')

  beforeEach(() => {
    vi.restoreAllMocks()
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
    mockCwd.mockReturnValue(tmpDir)
  })

  afterEach(() => {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('executeForFile errors without inputFile', async () => {
    await expect(async () => {
      await executeForFile({
        inputFile: '' as any,
        outputFile: path.join(tmpDir, 'out.test.ts'),
        apiKey: 'k',
        model: 'gpt-3.5-turbo-16k',
        systemMessage: '',
        promptTemplate: '',
        techs: '',
        instructions: '',
        examples: [],
        stream: false as any,
        modelEndpoint: ''
      } as any)
    }).rejects.toThrow()
  })
})


