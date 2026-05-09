/**
 * Extract a JSON object from model output (Markdown fences, surrounding prose).
 */

export function stripCodeFences(text: string): string {
  let t = text.trim()
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(t)
  if (fenced?.[1]) t = fenced[1].trim()
  return t
}

function findBalancedObjectEnd(s: string, start: number): number {
  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/** First `{` that begins a balanced `{...}` span (string-aware), searching from `from`. */
function findNextObjectStart(s: string, from: number): number {
  let inString = false
  let escape = false

  for (let i = from; i < s.length; i++) {
    const ch = s[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') {
      const end = findBalancedObjectEnd(s, i)
      if (end >= 0) return i
    }
  }
  return -1
}

export function extractJsonObjectString(raw: string): string | null {
  const t = stripCodeFences(raw)
  let from = 0
  while (from < t.length) {
    const start = findNextObjectStart(t, from)
    if (start < 0) return null
    const end = findBalancedObjectEnd(t, start)
    if (end < 0) {
      from = start + 1
      continue
    }
    const slice = t.slice(start, end + 1)
    try {
      const data = JSON.parse(slice)
      if (data && typeof data === 'object' && !Array.isArray(data)) return slice
    } catch {
      // Try next candidate `{` after this block
    }
    from = start + 1
  }
  return null
}

export function parseModelJsonObject(raw: string): Record<string, unknown> | null {
  const candidate = extractJsonObjectString(raw)
  if (!candidate) return null
  try {
    const data = JSON.parse(candidate) as Record<string, unknown>
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null
  } catch {
    return null
  }
}
