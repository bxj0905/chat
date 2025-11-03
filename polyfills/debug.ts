type LogFunction = (...args: unknown[]) => void;

interface DebuggerInstance {
  (...args: unknown[]): void;
  namespace: string;
  useColors: boolean;
  color: string;
  diff?: number;
  prev?: number;
  curr?: number;
  log: LogFunction;
  extend(namespace: string, delimiter?: string): DebuggerInstance;
  destroy(): void;
  enabled: boolean;
}

type Formatter = (this: DebuggerInstance, value: unknown) => string;

interface DebugStatic {
  (namespace: string): DebuggerInstance;
  enable(namespaces: string): void;
  disable(): string;
  enabled(namespace: string): boolean;
  load(): string | undefined;
  save(namespaces?: string): void;
  useColors(): boolean;
  colors: string[];
  formatArgs(this: DebuggerInstance, args: unknown[]): void;
  formatters: Record<string, Formatter>;
  log: LogFunction;
  humanize(value: number): string;
  selectColor(namespace: string): string;
  namespaces: string;
  names: string[];
  skips: string[];
  default: DebugStatic;
  debug: DebugStatic;
  coerce(value: unknown): unknown;
  destroy(): void;
  init?: (debug: DebuggerInstance) => void;
}

const COLORS: string[] = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF',
  '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF',
  '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33',
  '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF',
  '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33',
  '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333',
  '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF',
  '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633',
  '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

const storage = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch (error) {
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('debug polyfill: unable to access localStorage', error);
    }
  }
  return undefined;
})();

const humanize = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 36e5) {
    return `${sign}${trimZero((abs / 36e5).toFixed(1))}h`;
  }

  if (abs >= 6e4) {
    return `${sign}${trimZero((abs / 6e4).toFixed(1))}m`;
  }

  if (abs >= 1e3) {
    return `${sign}${trimZero((abs / 1e3).toFixed(2))}s`;
  }

  return `${sign}${Math.round(abs)}ms`;
};

const trimZero = (value: string): string => value.replace(/\.0+$/, '').replace(/(\.\d+?)0+$/, '$1');

const destroy = (() => {
  let warned = false;
  return () => {
    if (!warned) {
      warned = true;
      console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in a future release.');
    }
  };
})();

const save = (namespaces?: string) => {
  if (!storage) {
    return;
  }

  try {
    if (namespaces && namespaces.length > 0) {
      storage.setItem('debug', namespaces);
    } else {
      storage.removeItem('debug');
    }
  } catch (error) {
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('debug polyfill: unable to persist namespaces', error);
    }
  }
};

const load = (): string | undefined => {
  let result: string | undefined;

  if (storage) {
    try {
      result = storage.getItem('debug') ?? storage.getItem('DEBUG') ?? undefined;
    } catch (error) {
      if (typeof console !== 'undefined' && typeof console.debug === 'function') {
        console.debug('debug polyfill: unable to load namespaces', error);
      }
    }
  }

  if (!result && typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    result = process.env.DEBUG ?? undefined;
  }

  return result;
};

const useColors = (): boolean => {
  if (typeof window !== 'undefined' && (window.process?.type === 'renderer' || window.process?.__nwjs)) {
    return true;
  }

  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent?.toLowerCase() ?? '';
    if (/(edge|trident)\/(\d+)/.test(ua)) {
      return false;
    }
    const firefoxMatch = ua.match(/firefox\/(\d+)/);
    if (firefoxMatch) {
      const version = Number.parseInt(firefoxMatch[1], 10);
      if (Number.isFinite(version) && version >= 31) {
        return true;
      }
    }
    if (/applewebkit\/(\d+)/.test(ua)) {
      return true;
    }
  }

  if (typeof document !== 'undefined' && document.documentElement?.style?.WebkitAppearance) {
    return true;
  }

  if (typeof window !== 'undefined' && window.console) {
    const { console: winConsole } = window;
    if (typeof winConsole.firebug !== 'undefined') {
      return true;
    }
    if (typeof winConsole.exception === 'function' && typeof winConsole.table === 'function') {
      return true;
    }
  }

  return false;
};

const log: LogFunction = (...args: unknown[]) => {
  if (typeof console === 'undefined') {
    return;
  }

  const fn = console.debug || console.log || (() => {});
  fn.apply(console, args as unknown[]);
};

const matchesTemplate = (search: string, template: string): boolean => {
  let searchIndex = 0;
  let templateIndex = 0;
  let starIndex = -1;
  let matchIndex = 0;

  while (searchIndex < search.length) {
    if (
      templateIndex < template.length &&
      (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')
    ) {
      if (template[templateIndex] === '*') {
        starIndex = templateIndex;
        matchIndex = searchIndex;
        templateIndex += 1;
      } else {
        searchIndex += 1;
        templateIndex += 1;
      }
    } else if (starIndex !== -1) {
      templateIndex = starIndex + 1;
      matchIndex += 1;
      searchIndex = matchIndex;
    } else {
      return false;
    }
  }

  while (templateIndex < template.length && template[templateIndex] === '*') {
    templateIndex += 1;
  }

  return templateIndex === template.length;
};

const coerce = (value: unknown): unknown => {
  if (value instanceof Error) {
    return value.stack || value.message;
  }
  return value;
};

const createDebug: DebugStatic = ((namespace: string) => {
  let prevTime: number | undefined;
  let enableOverride: boolean | null = null;
  let namespacesCache: string | undefined;
  let enabledCache = false;

  const debugInstance = ((...args: unknown[]) => {
    if (!debugInstance.enabled) {
      return;
    }

    const self = debugInstance;

    const curr = Date.now();
    const ms = curr - (prevTime ?? curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    if (args.length === 0) {
      args.push('');
    }

    args[0] = createDebug.coerce(args[0]);

    if (typeof args[0] !== 'string') {
      args.unshift('%O');
    }

    let index = 0;
    args[0] = String(args[0]).replace(/%([a-zA-Z%])/g, (match, format) => {
      if (match === '%%') {
        return '%';
      }

      index += 1;
      const formatter = createDebug.formatters[format];

      if (typeof formatter === 'function') {
        const value = args[index];
        const result = formatter.call(self, value);
        args.splice(index, 1);
        index -= 1;
        return result;
      }

      return match;
    });

    createDebug.formatArgs.call(self, args);

    const logFn = self.log || createDebug.log;
    logFn.apply(self, args as unknown[]);
  }) as DebuggerInstance;

  debugInstance.namespace = namespace;
  debugInstance.useColors = createDebug.useColors();
  debugInstance.color = createDebug.selectColor(namespace);
  debugInstance.log = createDebug.log;
  debugInstance.destroy = createDebug.destroy;
  debugInstance.extend = function extend(subNamespace: string, delimiter = ':') {
    const newDebug = createDebug(`${namespace}${delimiter}${subNamespace}`);
    newDebug.log = debugInstance.log;
    return newDebug;
  };

  Object.defineProperty(debugInstance, 'enabled', {
    enumerable: true,
    configurable: true,
    get() {
      if (enableOverride !== null) {
        return enableOverride;
      }

      if (namespacesCache !== createDebug.namespaces) {
        namespacesCache = createDebug.namespaces;
        enabledCache = createDebug.enabled(namespace);
      }

      return enabledCache;
    },
    set(value: boolean) {
      enableOverride = value;
    }
  });

  if (typeof createDebug.init === 'function') {
    createDebug.init(debugInstance);
  }

  return debugInstance;
}) as DebugStatic;

createDebug.names = [];
createDebug.skips = [];
createDebug.namespaces = '';
createDebug.colors = COLORS;
createDebug.formatters = {};
createDebug.log = log;
createDebug.humanize = humanize;
createDebug.selectColor = (namespace: string) => {
  let hash = 0;

  for (let i = 0; i < namespace.length; i += 1) {
    hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0;
  }

  return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
};
createDebug.useColors = useColors;
createDebug.coerce = coerce;
createDebug.destroy = destroy;
createDebug.save = save;
createDebug.load = load;

createDebug.formatArgs = function formatArgs(this: DebuggerInstance, args: unknown[]) {
  const diff = typeof this.diff === 'number' ? this.diff : 0;
  const message = String(args[0]);

  if (this.useColors) {
    const colorStyle = `color: ${this.color}`;
    args[0] = `%c${this.namespace} %c${message}%c +${createDebug.humanize(diff)}`;
    args.splice(1, 0, colorStyle, 'color: inherit', colorStyle);
  } else {
    args[0] = `${this.namespace} ${message} +${createDebug.humanize(diff)}`;
  }
};

createDebug.enable = (namespaces: string) => {
  const cleaned = (namespaces ?? '').trim();
  createDebug.save(cleaned);
  createDebug.namespaces = cleaned;
  createDebug.names = [];
  createDebug.skips = [];

  if (!cleaned) {
    return;
  }

  const split = cleaned.replace(/\s+/g, ',').split(',').filter(Boolean);

  for (const ns of split) {
    if (ns.startsWith('-')) {
      createDebug.skips.push(ns.slice(1));
    } else {
      createDebug.names.push(ns);
    }
  }
};

createDebug.disable = () => {
  const namespaces = [
    ...createDebug.names,
    ...createDebug.skips.map(ns => `-${ns}`)
  ].join(',');
  createDebug.enable('');
  return namespaces;
};

createDebug.enabled = (name: string) => {
  for (const skip of createDebug.skips) {
    if (matchesTemplate(name, skip)) {
      return false;
    }
  }

  for (const ns of createDebug.names) {
    if (matchesTemplate(name, ns)) {
      return true;
    }
  }

  return false;
};

createDebug.debug = createDebug;
createDebug.default = createDebug;

createDebug.formatters.j = function formatter(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return `[UnexpectedJSONParseError]: ${(error as Error).message}`;
  }
};

createDebug.enable(createDebug.load() ?? '');

const debug = createDebug;

export type { DebuggerInstance };
export { debug };
export default debug;

