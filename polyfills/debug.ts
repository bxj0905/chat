type LogFunction = (...args: unknown[]) => void

interface DebuggerInstance {
  (...args: unknown[]): void
  namespace: string
  enabled: boolean
  extend(namespace: string, delimiter?: string): DebuggerInstance
  log: LogFunction
}

interface DebugStatic {
  (namespace: string): DebuggerInstance
  enable(namespaces: string): void
  disable(): string
  enabled(namespace: string): boolean
  load(): string | undefined
  save(namespaces?: string): void
  namespaces: string
  names: string[]
  skips: string[]
  default: DebugStatic
  debug: DebugStatic
  log: LogFunction
}

const storage = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage
    }
  } catch (error) {
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('debug polyfill: unable to access localStorage', error)
    }
  }
  return undefined
})()

const save = (namespaces?: string) => {
  if (!storage) {
    return
  }

  try {
    if (namespaces) {
      storage.setItem('debug', namespaces)
    } else {
      storage.removeItem('debug')
    }
  } catch (error) {
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('debug polyfill: unable to persist namespaces', error)
    }
  }
}

const load = (): string | undefined => {
  if (!storage) {
    return undefined
  }

  try {
    return storage.getItem('debug') ?? storage.getItem('DEBUG') ?? undefined
  } catch (error) {
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('debug polyfill: unable to load namespaces', error)
    }
    return undefined
  }
}

const toRegExp = (pattern: string) => {
  const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, '\\$&').replace(/\*/g, '.*?')
  return new RegExp(`^${escaped}$`)
}

const log: LogFunction = (...args: unknown[]) => {
  if (typeof console === 'undefined') {
    return
  }

  const fn = console.debug ?? console.log ?? (() => {})
  fn(...args)
}

const createDebug: DebugStatic = ((namespace: string) => {
  const instance = ((...args: unknown[]) => {
    if (!createDebug.enabled(namespace)) {
      return
    }
    instance.log(`[${namespace}]`, ...args)
  }) as DebuggerInstance

  instance.namespace = namespace
  instance.log = createDebug.log

  Object.defineProperty(instance, 'enabled', {
    get() {
      return createDebug.enabled(namespace)
    },
    set(value: boolean) {
      if (!value) {
        return
      }
      const segments = new Set(createDebug.namespaces.split(',').filter(Boolean))
      segments.add(namespace)
      createDebug.enable(Array.from(segments).join(','))
    }
  })

  instance.extend = (subNamespace: string, delimiter = ':') => {
    return createDebug(`${namespace}${delimiter}${subNamespace}`)
  }

  return instance
}) as DebugStatic

createDebug.namespaces = ''
createDebug.names = []
createDebug.skips = []
createDebug.log = log
createDebug.save = save
createDebug.load = load

createDebug.enable = (namespaces: string) => {
  const value = namespaces.trim()
  createDebug.save(value)
  createDebug.namespaces = value
  createDebug.names = []
  createDebug.skips = []

  if (!value) {
    return
  }

  const parts = value.replace(/\s+/g, ',').split(',').filter(Boolean)
  for (const part of parts) {
    if (part.startsWith('-')) {
      createDebug.skips.push(part.slice(1))
    } else {
      createDebug.names.push(part)
    }
  }
}

createDebug.disable = () => {
  const namespaces = [
    ...createDebug.names,
    ...createDebug.skips.map(item => `-${item}`)
  ].join(',')
  createDebug.enable('')
  return namespaces
}

createDebug.enabled = (name: string) => {
  for (const skip of createDebug.skips) {
    if (toRegExp(skip).test(name)) {
      return false
    }
  }

  for (const pattern of createDebug.names) {
    if (toRegExp(pattern).test(name)) {
      return true
    }
  }

  return false
}

createDebug.default = createDebug
createDebug.debug = createDebug
createDebug.enable(createDebug.load() ?? '')

const debug = createDebug

export type { DebuggerInstance }
export { debug }

export default debug
