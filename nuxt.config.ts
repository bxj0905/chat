// https://nuxt.com/docs/api/configuration/nuxt-config
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineNuxtConfig } from 'nuxt/config'

import nuxtCommonjsDefaultExport from './build/nuxt-commonjs-default-export'

const currentDir = dirname(fileURLToPath(import.meta.url))
const resolveFromRoot = (path: string) => resolve(currentDir, path)

const openaiModel = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
const openaiCompatibleProvider = process.env.OPENAI_COMPATIBLE_PROVIDER ?? 'openai-compatible'
const openaiCompatibleModel = process.env.OPENAI_COMPATIBLE_MODEL ?? 'gpt-4o-mini'
const deepseekModel = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat'
const qwenModel = process.env.QWEN_MODEL ?? 'qwen-max'
const doubaoModel = process.env.DOUBAO_MODEL ?? 'doubao-pro'
const anthropicModel = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4.5'
const googleModel = process.env.GOOGLE_MODEL ?? 'gemini-2.5-flash'

const configuredModels = [
  {
    label: 'DeepSeek Chat',
    value: `deepseek/${deepseekModel}`,
    logo: '/logos/deepseek.svg',
    description: 'DeepSeek 官方兼容接口',
    enabled: Boolean(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_BASE_URL)
  },
  {
    label: 'OpenAI GPT-4o Mini',
    value: `openai/${openaiModel}`,
    icon: 'i-logos-openai',
    description: '直接调用 OpenAI 官方接口',
    enabled: Boolean(process.env.OPENAI_API_KEY)
  },
  {
    label: 'OpenAI 兼容模式',
    value: `${openaiCompatibleProvider}/${openaiCompatibleModel}`,
    icon: 'i-lucide-plug',
    description: '通过自定义 OpenAI 兼容接口访问',
    enabled: Boolean(process.env.OPENAI_COMPATIBLE_BASE_URL && process.env.OPENAI_COMPATIBLE_API_KEY)
  },
  {
    label: 'Qwen Max',
    value: `qwen/${qwenModel}`,
    logo: '/logos/qwen.png',
    description: '通义千问 DashScope 兼容接口',
    enabled: Boolean(process.env.QWEN_API_KEY && process.env.QWEN_BASE_URL)
  },
  {
    label: '豆包 Pro',
    value: `doubao/${doubaoModel}`,
    logo: '/logos/doubao.png',
    description: '火山方舟豆包兼容接口',
    enabled: Boolean(process.env.DOUBAO_API_KEY && process.env.DOUBAO_BASE_URL)
  },
  {
    label: 'Anthropic Claude 4.5 Haiku',
    value: `anthropic/${anthropicModel}`,
    icon: 'i-logos-anthropic',
    description: '直接调用 Anthropic 官方接口',
    enabled: Boolean(process.env.ANTHROPIC_API_KEY)
  },
  {
    label: 'Google Gemini 2.5 Flash',
    value: `google/${googleModel}`,
    icon: 'i-logos-google',
    description: '直接调用 Google Generative AI 接口',
    enabled: Boolean(process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  }
]

const preferredDefaultModel = `deepseek/${deepseekModel}`
const firstEnabledModel = configuredModels.find(model => model.enabled !== false)?.value ?? preferredDefaultModel
const defaultModel = process.env.DEFAULT_MODEL
  ?? (configuredModels.find(model => model.value === preferredDefaultModel && model.enabled !== false)?.value ?? firstEnabledModel)

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '@nuxtjs/i18n',
    'nuxt-auth-utils',
    'nuxt-charts'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  mdc: {
    headings: {
      anchorLinks: false
    },
    highlight: {
      // noApiRoute: true
      shikiEngine: 'javascript'
    }
  },

  runtimeConfig: {
    ai: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY ?? '',
        baseURL: process.env.OPENAI_BASE_URL ?? ''
      },
      openaiCompatible: {
        baseURL: process.env.OPENAI_COMPATIBLE_BASE_URL ?? '',
        apiKey: process.env.OPENAI_COMPATIBLE_API_KEY ?? '',
        provider: openaiCompatibleProvider,
        model: openaiCompatibleModel
      },
      deepseek: {
        baseURL: process.env.DEEPSEEK_BASE_URL ?? '',
        apiKey: process.env.DEEPSEEK_API_KEY ?? ''
      },
      qwen: {
        baseURL: process.env.QWEN_BASE_URL ?? '',
        apiKey: process.env.QWEN_API_KEY ?? ''
      },
      doubao: {
        baseURL: process.env.DOUBAO_BASE_URL ?? '',
        apiKey: process.env.DOUBAO_API_KEY ?? ''
      },
      anthropic: {
        baseURL: process.env.ANTHROPIC_BASE_URL ?? '',
        apiKey: process.env.ANTHROPIC_API_KEY ?? ''
      },
      google: {
        baseURL: process.env.GOOGLE_API_BASE_URL ?? '',
        apiKey: process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? ''
      }
    },
    public: {
      defaultModel,
      models: configuredModels,
      quickChats: [
        { zh: '为什么选择会 Nuxt UI？', en: 'Why choose Nuxt UI?', icon: 'i-logos-nuxt-icon' },
        { zh: '如何编写一个 Vue 组合式函数？', en: 'Create a Vue composable', icon: 'i-logos-vue' },
        { zh: 'UnJS 有哪些项目？', en: 'About UnJS projects', icon: 'i-logos-unjs' },
        { zh: 'VueUse 有哪些常用工具？', en: 'About VueUse utilities', icon: 'i-logos-vueuse' },
        { zh: 'Tailwind 最佳实践', en: 'Tailwind best practices', icon: 'i-logos-tailwindcss-icon' },
        { zh: '今天的天气如何？', en: 'What is the weather today?', icon: 'i-lucide-sun' },
        { zh: '展示一个销售折线图', en: 'Show a sales line chart', icon: 'i-lucide-line-chart' }
      ]
    }
  },

  alias: {
    'extend': resolveFromRoot('polyfills/extend.ts'),
    'debug': resolveFromRoot('polyfills/debug.ts'),
    'to-px': resolveFromRoot('polyfills/to-px.ts'),
    'striptags': resolveFromRoot('polyfills/striptags.ts')
  },

  experimental: {
    viewTransition: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  vite: {
    plugins: [nuxtCommonjsDefaultExport()]
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    langDir: 'locales',
    locales: [
      {
        code: 'zh',
        language: 'zh-CN',
        file: 'zh-CN.json',
        name: '中文'
      },
      {
        code: 'en',
        language: 'en-US',
        file: 'en-US.json',
        name: 'English'
      }
    ],
    defaultLocale: 'zh',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    vueI18n: './i18n.config.ts'
  }
})
