import { createError } from 'h3'
import type { LanguageModelV1 } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

interface ProviderConfig {
  apiKey?: string
  baseURL?: string
}

interface RuntimeConfig {
  ai?: Record<string, ProviderConfig | undefined>
}

function sanitizeBaseURL(baseURL?: string) {
  if (!baseURL) {
    return undefined
  }

  const trimmed = baseURL.trim()
  if (!trimmed) {
    return undefined
  }

  const withoutTrailingSlash = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
  const withoutDoubleV1 = withoutTrailingSlash.endsWith('/v1') ? withoutTrailingSlash.slice(0, -3) : withoutTrailingSlash

  return withoutDoubleV1
}

function requireApiKey(apiKey: string | undefined, provider: string) {
  if (!apiKey) {
    throw createError({
      statusCode: 400,
      statusMessage: `${provider} 未配置 API Key`
    })
  }
}

export function resolveModel(modelId: string, runtimeConfig: RuntimeConfig): LanguageModelV1 {
  const [provider, ...rest] = modelId.split('/')
  const modelName = rest.join('/')

  if (!provider || !modelName) {
    throw createError({
      statusCode: 400,
      statusMessage: `无效的模型标识：${modelId}`
    })
  }

  const aiConfig = runtimeConfig.ai ?? {}

  const normalizedProvider = provider.toLowerCase()

  if (normalizedProvider === 'openai') {
    const config = aiConfig.openai
    const apiKey = config?.apiKey
    requireApiKey(apiKey, 'OpenAI')

    const client = createOpenAI({
      apiKey: apiKey!,
      baseURL: sanitizeBaseURL(config?.baseURL)
    })

    return client(modelName)
  }

  const openaiCompatibleProviders: Record<string, string> = {
    'openai-compatible': 'openaiCompatible',
    'deepseek': 'deepseek',
    'qwen': 'qwen',
    'doubao': 'doubao'
  }

  const mappedKey = openaiCompatibleProviders[normalizedProvider]
  if (mappedKey) {
    const config = aiConfig[mappedKey]
    const apiKey = config?.apiKey
    requireApiKey(apiKey, provider)

    const client = createOpenAI({
      apiKey: apiKey!,
      baseURL: sanitizeBaseURL(config?.baseURL),
      compatibility: 'strict'
    })

    return client.chat(modelName)
  }

  if (normalizedProvider === 'anthropic') {
    const config = aiConfig.anthropic
    const apiKey = config?.apiKey
    requireApiKey(apiKey, 'Anthropic')

    const client = createAnthropic({
      apiKey: apiKey!,
      baseURL: sanitizeBaseURL(config?.baseURL)
    })

    return client(modelName)
  }

  if (normalizedProvider === 'google') {
    const config = aiConfig.google
    const apiKey = config?.apiKey
    requireApiKey(apiKey, 'Google Generative AI')

    const client = createGoogleGenerativeAI({
      apiKey: apiKey!,
      baseURL: sanitizeBaseURL(config?.baseURL)
    })

    return client(modelName)
  }

  throw createError({
    statusCode: 400,
    statusMessage: `暂不支持的模型提供方：${provider}`
  })
}
