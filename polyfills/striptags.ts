const TAG_REGEX = /<\/?([a-z0-9-]+)[^>]*>/gi

export type AllowableTags = string | Iterable<string> | { forEach?(callback: (tag: string) => void): void } | null | undefined

const normalizeAllowable = (input: AllowableTags): Set<string> => {
  if (!input) {
    return new Set()
  }

  if (typeof input === 'string') {
    const result = new Set<string>()
    const matches = input.match(TAG_REGEX) ?? []
    for (const match of matches) {
      const cleaned = match.replace(/[<>\s/].*$/u, '').replace(/[<>]/g, '')
      if (cleaned) {
        result.add(cleaned.toLowerCase())
      }
    }
    return result
  }

  if (typeof (input as Iterable<string>)[Symbol.iterator] === 'function') {
    return new Set(Array.from(input as Iterable<string>, value => value.toLowerCase()))
  }

  if (typeof input === 'object' && typeof input.forEach === 'function') {
    const result = new Set<string>()
    input.forEach((tag) => {
      if (typeof tag === 'string') {
        result.add(tag.toLowerCase())
      }
    })
    return result
  }

  return new Set()
}

const stripHtml = (html: string, allowed: Set<string>, replacement: string): string => {
  return html.replace(TAG_REGEX, (match, tagName: string) => {
    const normalized = tagName.toLowerCase()
    if (allowed.has(normalized)) {
      return match
    }
    return replacement
  })
}

interface StriptagsFn {
  (html: string, allowableTags?: AllowableTags, tagReplacement?: string): string
  init_streaming_mode(allowableTags?: AllowableTags, tagReplacement?: string): (html: string) => string
  initStreamingMode: typeof initStreamingMode
}

export const initStreamingMode = (allowableTags?: AllowableTags, tagReplacement = '') => {
  const allowed = normalizeAllowable(allowableTags)
  let buffer = ''

  return (html: string) => {
    buffer += html
    const output = stripHtml(buffer, allowed, tagReplacement)
    buffer = ''
    return output
  }
}

const striptagsImpl = (html: string, allowableTags?: AllowableTags, tagReplacement = '') => {
  if (typeof html !== 'string') {
    throw new TypeError('`html` parameter must be a string')
  }

  const allowed = normalizeAllowable(allowableTags)
  return stripHtml(html, allowed, tagReplacement)
}

const striptags = striptagsImpl as StriptagsFn

striptags.init_streaming_mode = (allowableTags?: AllowableTags, tagReplacement = '') =>
  initStreamingMode(allowableTags, tagReplacement)

striptags.initStreamingMode = initStreamingMode

export { striptags }

export default striptags
