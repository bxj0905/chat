export interface ModelOption {
  label: string
  value: string
  icon?: string
  logo?: string
  description?: string
  enabled?: boolean
  avatar?: {
    src: string
    alt?: string
  }
}

const FALLBACK_DEFAULT_MODEL = 'deepseek/deepseek-chat'
const FALLBACK_MODELS: ModelOption[] = [
  {
    label: 'DeepSeek Chat',
    value: FALLBACK_DEFAULT_MODEL,
    logo: '/logos/deepseek.svg'
  },
  {
    label: 'OpenAI GPT-4o Mini',
    value: 'openai/gpt-4o-mini',
    icon: 'i-logos-openai'
  },
  {
    label: 'OpenAI 兼容模式',
    value: 'openai-compatible/gpt-4o-mini',
    icon: 'i-lucide-plug',
    description: '通过自定义 OpenAI 兼容接口访问'
  },
  {
    label: 'Qwen Max',
    value: 'qwen/qwen-max',
    logo: '/logos/qwen.png'
  },
  {
    label: '豆包 Pro',
    value: 'doubao/doubao-pro',
    logo: '/logos/doubao.png'
  },
  {
    label: 'Anthropic Claude 4.5 Haiku',
    value: 'anthropic/claude-haiku-4.5',
    icon: 'i-logos-anthropic'
  },
  {
    label: 'Google Gemini 2.5 Flash',
    value: 'google/gemini-2.5-flash',
    icon: 'i-logos-google'
  }
]

export function useModels() {
  const runtimeConfig = useRuntimeConfig()
  const configuredModels = runtimeConfig.public.models as ModelOption[] | undefined

  const enabledModels = configuredModels?.filter((model) => {
    return model.enabled !== false
  })
  const sanitizedModels = enabledModels?.map(({ enabled, ...rest }) => rest)

  const baseModels = sanitizedModels?.length ? sanitizedModels : FALLBACK_MODELS
  const models = baseModels.map((model) => {
    const logo = model.logo
    const avatar = logo
      ? {
          src: logo,
          alt: model.label
        }
      : model.avatar

    return {
      ...model,
      avatar
    }
  })

  const configuredDefaultModel = runtimeConfig.public.defaultModel as string | undefined
  const defaultModel = configuredDefaultModel && models.some((model) => {
    return model.value === configuredDefaultModel
  })
    ? configuredDefaultModel
    : models[0]?.value ?? FALLBACK_DEFAULT_MODEL

  const model = useCookie<string>('model', { default: () => defaultModel })

  if (!model.value || !models.some((item) => {
    return item.value === model.value
  })) {
    model.value = defaultModel
  }

  return {
    models,
    model
  }
}
