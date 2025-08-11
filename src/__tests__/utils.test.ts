import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import {
  readFile,
  writeToFile,
  divideFileName,
  getFileType,
  EFileType,
  toList,
  parseTemplatePrompt,
  getPrompt,
  getExampleMessages,
  readYamlFile,
  getMessages,
} from '../utils'

describe('utils', () => {
  const tmpDir = path.join(process.cwd(), '.vitest-tmp')

  beforeEach(() => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
  })

  afterEach(() => {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('readFile returns file content', () => {
    const file = path.join(tmpDir, 'a.txt')
    fs.writeFileSync(file, 'hello')
    expect(readFile(file)).toBe('hello')
  })

  it('writeToFile writes content', () => {
    const file = path.join(tmpDir, 'b.txt')
    writeToFile(file, 'world')
    expect(fs.readFileSync(file, 'utf-8')).toBe('world')
  })

  it('divideFileName returns name and extension', () => {
    expect(divideFileName('/x/y/file.ts')).toEqual({ name: 'file', extension: '.ts' })
  })

  it('getFileType returns file or directory', () => {
    const dir = path.join(tmpDir, 'dir')
    const file = path.join(tmpDir, 'file.txt')
    fs.mkdirSync(dir)
    fs.writeFileSync(file, '')
    expect(getFileType(dir)).toBe(EFileType.Directory)
    expect(getFileType(file)).toBe(EFileType.File)
  })

  it('toList formats list', () => {
    expect(toList(['a', 'b'])).toBe('1. a\r\n2. b')
  })

  it('parseTemplatePrompt replaces placeholders', () => {
    expect(parseTemplatePrompt('a {x} b', { x: 1 })).toBe('a 1 b')
  })

  it('getPrompt builds prompt with defaults', () => {
    const prompt = getPrompt({ content: 'CODE', fileName: 'f.ts' })
    expect(prompt).toContain('f.ts')
    expect(prompt).toContain('CODE')
  })

  it('getExampleMessages turns examples into messages', () => {
    const messages = getExampleMessages(
      { content: 'c', fileName: 'f.ts' },
      [{ fileName: 'e.ts', code: 'x', tests: 'y' }]
    )
    expect(messages.length).toBe(2)
    expect(messages[0].role).toBe('user')
    expect(messages[1].role).toBe('assistant')
  })

  it('readYamlFile parses yaml', () => {
    const file = path.join(tmpDir, 'c.yaml')
    fs.writeFileSync(file, 'a: 1')
    expect(readYamlFile(file)).toEqual({ a: 1 })
  })

  it('getMessages builds message array', () => {
    const messages = getMessages(undefined, 'hi', [])
    expect(messages[0].role).toBe('system')
    expect(messages[messages.length - 1].content).toBe('hi')
  })
})


