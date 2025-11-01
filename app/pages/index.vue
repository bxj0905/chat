<script setup lang="ts">
const input = ref('')
const loading = ref(false)

const { model } = useModels()
const { t } = useI18n()

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

const quickChats = computed(() => [
  {
    label: t('home.quickChats.whyNuxtUI'),
    icon: 'i-logos-nuxt-icon'
  },
  {
    label: t('home.quickChats.createVueComposable'),
    icon: 'i-logos-vue'
  },
  {
    label: t('home.quickChats.aboutUnJS'),
    icon: 'i-logos-unjs'
  },
  {
    label: t('home.quickChats.aboutVueUse'),
    icon: 'i-logos-vueuse'
  },
  {
    label: t('home.quickChats.tailwindBestPractices'),
    icon: 'i-logos-tailwindcss-icon'
  },
  {
    label: t('home.quickChats.weatherInBordeaux'),
    icon: 'i-lucide-sun'
  },
  {
    label: t('home.quickChats.showSalesChart'),
    icon: 'i-lucide-line-chart'
  }
])
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
