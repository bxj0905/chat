type PlainObject = Record<string, unknown>

const isPlainObject = (value: unknown): value is PlainObject => {
  if (value === null || typeof value !== 'object') {
    return false
  }

  return Object.prototype.toString.call(value) === '[object Object]'
}

const cloneValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(item => cloneValue(item))
  }

  if (isPlainObject(value)) {
    const result: PlainObject = {}
    for (const key of Object.keys(value)) {
      result[key] = cloneValue(value[key])
    }
    return result
  }

  return value
}

const mergeValue = (deep: boolean, target: unknown, source: unknown): unknown => {
  if (!deep) {
    return source
  }

  if (Array.isArray(source)) {
    if (Array.isArray(target)) {
      return source.map((item, index) => mergeValue(true, target[index], item))
    }
    return source.map(item => cloneValue(item))
  }

  if (isPlainObject(source)) {
    const base = isPlainObject(target) ? { ...target } : {}
    for (const key of Object.keys(source)) {
      const nextValue = mergeValue(true, base[key], source[key])
      base[key] = nextValue
    }
    return base
  }

  return source
}

const assign = (deep: boolean, target: PlainObject, source: unknown) => {
  if (source === null || typeof source !== 'object') {
    return
  }

  const keys = Object.keys(source as PlainObject)
  for (const key of keys) {
    const current = (source as PlainObject)[key]
    if (current === undefined) {
      continue
    }

    const merged = mergeValue(deep, target[key], current)
    if (key === '__proto__') {
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: merged
      })
    } else {
      target[key] = merged
    }
  }
}

interface ExtendFunction {
  <T extends PlainObject, S extends Array<PlainObject | undefined>>(target: T, ...sources: S): T & S[number]
  <T extends PlainObject, S extends Array<PlainObject | undefined>>(deep: boolean, target: T, ...sources: S): T & S[number]
  extend: ExtendFunction
  default: ExtendFunction
}

const extendImplementation = ((...args: unknown[]) => {
  let deep = false
  let index = 0

  if (typeof args[0] === 'boolean') {
    deep = args[0]
    index = 1
  }

  const initialTarget = (args[index] ?? {}) as PlainObject
  const target = isPlainObject(initialTarget) ? initialTarget : {}

  for (let position = index + 1; position < args.length; position += 1) {
    assign(deep, target, args[position])
  }

  return target
}) as ExtendFunction

extendImplementation.extend = extendImplementation
extendImplementation.default = extendImplementation

export const extend = extendImplementation

export default extendImplementation
