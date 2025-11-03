import type { Plugin } from 'vite'

const DEFAULT_EXPORT_PRESENT = /\bexport\s+default\b/
const MODULE_EXPORTS_PRESENT = /\bmodule\.exports\b/
const SENTINEL = '__nuxt_cjs_default__'

const COMMONJS_PROXY_RE = /var\s+([a-zA-Z_$][\w$]*)\s*=\s*__commonJS/
const TO_COMMONJS_RE = /const\s+([a-zA-Z_$][\w$]*)\s*=\s*__toCommonJS/

const appendDefaultExport = (code: string, expression: string) => {
  return `${code}\nexport default ${expression}\n`
}

export const nuxtCommonjsDefaultExport = (): Plugin => ({
  name: 'nuxt-commonjs-default-export',
  enforce: 'post',
  transform(code, id) {
    if (!id.includes('node_modules')) {
      return null
    }

    if (DEFAULT_EXPORT_PRESENT.test(code)) {
      return null
    }

    if (MODULE_EXPORTS_PRESENT.test(code)) {
      if (code.includes(SENTINEL)) {
        return null
      }
      return {
        code: `${code}\nconst ${SENTINEL} = module.exports\nexport default ${SENTINEL}\n`,
        map: null
      }
    }

    if (id.includes('?commonjs-exports')) {
      const matchProxy = code.match(COMMONJS_PROXY_RE)
      if (matchProxy) {
        return {
          code: appendDefaultExport(code, matchProxy[1]),
          map: null
        }
      }
      const matchToCommonJs = code.match(TO_COMMONJS_RE)
      if (matchToCommonJs) {
        return {
          code: appendDefaultExport(code, matchToCommonJs[1]),
          map: null
        }
      }
    }

    if (id.includes('?commonjs-module')) {
      const match = code.match(COMMONJS_PROXY_RE)
      if (match) {
        return {
          code: appendDefaultExport(code, match[1]),
          map: null
        }
      }
    }

    return null
  }
})

export default nuxtCommonjsDefaultExport
