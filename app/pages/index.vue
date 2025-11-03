<script setup lang="ts">
const input = ref('')
const loading = ref(false)

const { model } = useModels()
const { t, locale } = useI18n()
const runtimeConfig = useRuntimeConfig()

async function createChat(prompt: string) {
  input.value = prompt
  loading.value = true
  const chat = await $fetch('/api/chats', {
    method: 'POST',
    body: { input: prompt }
  })

  refreshNuxtData('chats')
  navigateTo(`/chat/${chat?.id}`)
}

function onSubmit() {
  createChat(input.value)
}

const quickChats = computed(() => {
  const cfg = (runtimeConfig.public as any).quickChats as Array<any> | undefined

  if (Array.isArray(cfg) && cfg.length) {
    return cfg.map(item => {
      // 支持 label 为 { zh,en } 或直接提供 zh/en 字段，也兼容直接给字符串
      const localized = typeof item.label === 'object'
        ? (item.label[locale.value] ?? item.label.zh ?? item.label.en)
        : (item?.[locale.value] ?? item?.zh ?? item?.en ?? item.label)

      return {
        label: localized,
        icon: item.icon
      }
    })
  }

  // 回退到原有的 i18n 方案
  return [
    { label: t('home.quickChats.whyNuxtUI'), icon: 'i-logos-nuxt-icon' },
    { label: t('home.quickChats.createVueComposable'), icon: 'i-logos-vue' },
    { label: t('home.quickChats.aboutUnJS'), icon: 'i-logos-unjs' },
    { label: t('home.quickChats.aboutVueUse'), icon: 'i-logos-vueuse' },
    { label: t('home.quickChats.tailwindBestPractices'), icon: 'i-logos-tailwindcss-icon' },
    { label: t('home.quickChats.weatherInBordeaux'), icon: 'i-lucide-sun' },
    { label: t('home.quickChats.showSalesChart'), icon: 'i-lucide-line-chart' }
  ]
})
</script>

<template>
  <UDashboardPanel id="home" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col justify-center gap-4 sm:gap-6 py-8">
        <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">
          {{ t('home.title') }}
        </h1>

        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          class="[view-transition-name:chat-prompt]"
          variant="subtle"
          @submit="onSubmit"
        >
          <UChatPromptSubmit color="neutral" />

          <template #footer>
            <ModelSelect v-model="model" />
          </template>
        </UChatPrompt>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="quickChat in quickChats"
            :key="quickChat.label"
            :icon="quickChat.icon"
            :label="quickChat.label"
            size="sm"
            color="neutral"
            variant="outline"
            class="rounded-full"
            @click="createChat(quickChat.label)"
          />
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
