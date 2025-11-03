const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;
const defineProp = Object.defineProperty;
const getOwnPropDescriptor = Object.getOwnPropertyDescriptor;

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const isPlainObject = (value: unknown): value is Record<string, any> => {
  if (!value || toStr.call(value) !== '[object Object]') {
    return false;
  }

  const hasOwnConstructor = hasOwn.call(value, 'constructor');
  const prototype = (value as Record<string, any>).constructor?.prototype;
  const hasIsPrototypeOf = prototype && hasOwn.call(prototype, 'isPrototypeOf');

  if ((value as Record<string, any>).constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  let key: string | undefined;
  /* eslint-disable no-restricted-syntax */
  for (key in value as Record<string, any>) {
    // Intentional iteration to detect last key
  }
  /* eslint-enable no-restricted-syntax */

  return typeof key === 'undefined' || hasOwn.call(value, key);
};

interface SetPropertyOptions {
  name: string;
  newValue: unknown;
}

const setProperty = (target: Record<string, any>, options: SetPropertyOptions) => {
  if (defineProp && options.name === '__proto__') {
    defineProp(target, options.name, {
      enumerable: true,
      configurable: true,
      value: options.newValue,
      writable: true
    });
  } else {
    target[options.name] = options.newValue;
  }
};

const getProperty = (target: Record<string, any>, name: string) => {
  if (name === '__proto__') {
    if (!hasOwn.call(target, name)) {
      return undefined;
    }

    if (getOwnPropDescriptor) {
      return getOwnPropDescriptor(target, name)?.value;
    }
  }

  return target[name];
};

interface ExtendFunction {
  (...args: any[]): any;
  extend: ExtendFunction;
  default: ExtendFunction;
}

const extendFunc = function extend(...args: any[]): any {
  let target = args[0];
  let i = 1;
  const length = args.length;
  let deep = false;

  if (typeof target === 'boolean') {
    deep = target;
    target = args[1] ?? {};
    i = 2;
  }

  if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
    target = {};
  }

  const output = target as Record<string, any>;

  for (; i < length; i++) {
    const options = args[i];

    if (options == null) {
      continue;
    }

    for (const name in options) {
      if (!hasOwn.call(options, name)) {
        continue;
      }

      const src = getProperty(output, name);
      const copy = getProperty(options as Record<string, any>, name);

      if (output === copy) {
        continue;
      }

      if (
        deep &&
        copy &&
        (isPlainObject(copy) || (Array.isArray(copy) && copy !== undefined))
      ) {
        const copyIsArray = Array.isArray(copy);
        const clone = copyIsArray
          ? (Array.isArray(src) ? src : [])
          : (isPlainObject(src) ? src : {});

        const merged = extendFunc(deep, clone, copy);
        setProperty(output, { name, newValue: merged });
      } else if (copy !== undefined) {
        setProperty(output, { name, newValue: copy });
      }
    }
  }

  return output;
} as ExtendFunction;

extendFunc.extend = extendFunc;
extendFunc.default = extendFunc;

export const extend = extendFunc;

export default extendFunc;

