import { describe, expect, it } from 'vitest'
import { parseModelJsonObject, stripCodeFences } from '@/lib/parse-json-block'

describe('parse-json-block', () => {
  it('parses raw JSON object', () => {
    expect(parseModelJsonObject('{"a":1,"confidence":0.9}')).toEqual({
      a: 1,
      confidence: 0.9,
    })
  })

  it('parses fenced JSON blocks', () => {
    expect(
      parseModelJsonObject(
        '```json\n{\n  "full_name": "Jane Doe",\n  "confidence": 0.95\n}\n```'
      )?.full_name
    ).toBe('Jane Doe')
  })

  it('finds JSON after prose', () => {
    const txt = `Here is the extracted record:
{"full_name":"X Y","confidence":1}`
    expect(parseModelJsonObject(txt)?.full_name).toBe('X Y')
  })

  it('skips invalid brace noise then parses valid JSON', () => {
    const txt = 'Note { invalid } final: {"confidence": 0.5, "full_name":"A"}'
    expect(parseModelJsonObject(txt)?.full_name).toBe('A')
  })

  it('stripCodeFences handles trailing content', () => {
    expect(stripCodeFences('```\n{"a":1}\n```')).toBe('{"a":1}')
  })
})
