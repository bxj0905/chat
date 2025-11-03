/* eslint-disable @typescript-eslint/unified-signatures */

const STATE_PLAINTEXT = Symbol('plaintext');
const STATE_HTML = Symbol('html');
const STATE_COMMENT = Symbol('comment');

const ALLOWED_TAGS_REGEX = /<([\w-]+)>/g;
const NORMALIZE_TAG_REGEX = /<\/?([^\s/>]+)/;

export type AllowableTags = string | Iterable<string> | { forEach?: (callback: (tag: string) => void) => void } | null | undefined;

export interface StripTagsContext {
  allowableTags: Set<string>;
  tagReplacement: string;
  state: symbol;
  tagBuffer: string;
  depth: number;
  inQuoteChar: string;
}

const initContext = (allowableTags: AllowableTags, tagReplacement: string): StripTagsContext => ({
  allowableTags: parseAllowableTags(allowableTags),
  tagReplacement,
  state: STATE_PLAINTEXT,
  tagBuffer: '',
  depth: 0,
  inQuoteChar: ''
});

export const initStreamingMode = (allowableTags?: AllowableTags, tagReplacement = '') => {
  const context = initContext(allowableTags ?? [], tagReplacement);

  return (html: string) => internalStripTags(html ?? '', context);
};

interface StriptagsFn {
  (html: string, allowableTags?: AllowableTags, tagReplacement?: string): string;
  init_streaming_mode(allowableTags?: AllowableTags, tagReplacement?: string): (html: string) => string;
  initStreamingMode: typeof initStreamingMode;
}

const striptagsImpl = (html: string, allowableTags?: AllowableTags, tagReplacement = '') => {
  const safeHtml = html ?? '';
  const context = initContext(allowableTags ?? [], tagReplacement);

  return internalStripTags(safeHtml, context);
};

const striptags = striptagsImpl as StriptagsFn;

const internalStripTags = (html: string, context: StripTagsContext): string => {
  if (typeof html !== 'string') {
    throw new TypeError("'html' parameter must be a string");
  }

  const allowableTags = context.allowableTags;
  const tagReplacement = context.tagReplacement;

  let { state, tagBuffer, depth, inQuoteChar } = context;
  let output = '';

  for (let index = 0; index < html.length; index++) {
    const char = html[index];

    if (state === STATE_PLAINTEXT) {
      if (char === '<') {
        state = STATE_HTML;
        tagBuffer += char;
      } else {
        output += char;
      }
      continue;
    }

    if (state === STATE_HTML) {
      switch (char) {
        case '<':
          if (!inQuoteChar) {
            depth += 1;
          }
          break;
        case '>':
          if (inQuoteChar) {
            break;
          }
          if (depth > 0) {
            depth -= 1;
            break;
          }
          inQuoteChar = '';
          state = STATE_PLAINTEXT;
          tagBuffer += '>';

          if (allowableTags.has(normalizeTag(tagBuffer))) {
            output += tagBuffer;
          } else {
            output += tagReplacement;
          }

          tagBuffer = '';
          break;
        case '"':
        case '\'':
          if (char === inQuoteChar) {
            inQuoteChar = '';
          } else {
            inQuoteChar = inQuoteChar || char;
          }
          tagBuffer += char;
          break;
        case '-':
          tagBuffer += char;
          if (tagBuffer === '<!-') {
            state = STATE_COMMENT;
          }
          break;
        case ' ':
        case '\n':
          if (tagBuffer === '<') {
            state = STATE_PLAINTEXT;
            output += '< ';
            tagBuffer = '';
            break;
          }
          tagBuffer += char;
          break;
        default:
          tagBuffer += char;
          break;
      }
      continue;
    }

    if (state === STATE_COMMENT) {
      if (char === '>' && tagBuffer.endsWith('--')) {
        state = STATE_PLAINTEXT;
        tagBuffer = '';
      } else {
        tagBuffer += char;
      }
    }
  }

  context.state = state;
  context.tagBuffer = tagBuffer;
  context.depth = depth;
  context.inQuoteChar = inQuoteChar;

  return output;
};

const parseAllowableTags = (allowableTags: AllowableTags): Set<string> => {
  if (!allowableTags) {
    return new Set();
  }

  if (typeof allowableTags === 'string') {
    const set = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = ALLOWED_TAGS_REGEX.exec(allowableTags))) {
      set.add(match[1]);
    }
    return set;
  }

  if (typeof (allowableTags as Iterable<string>)[Symbol.iterator] === 'function') {
    return new Set(allowableTags as Iterable<string>);
  }

  if (typeof allowableTags === 'object' && typeof allowableTags.forEach === 'function') {
    const set = new Set<string>();
    allowableTags.forEach((tag: string) => set.add(tag));
    return set;
  }

  return new Set();
};

const normalizeTag = (tagBuffer: string): string | null => {
  const match = NORMALIZE_TAG_REGEX.exec(tagBuffer);
  return match ? match[1].toLowerCase() : null;
};

export { striptags };

striptags.init_streaming_mode = (allowableTags?: AllowableTags, tagReplacement = '') =>
  initStreamingMode(allowableTags, tagReplacement);

striptags.initStreamingMode = initStreamingMode;

export default striptags;

/* eslint-enable @typescript-eslint/unified-signatures */

