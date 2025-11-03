<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

interface LocaleItem {
  code: string
  name?: string
}

const { locale, locales, setLocale } = useI18n()

const normalizedLocales = computed<LocaleItem[]>(() => {
  if (!Array.isArray(locales.value)) {
    return []
  }

  return locales.value
    .filter((item): item is LocaleItem => {
      return typeof item === 'object' && item !== null && 'code' in item
    })
    .map((item) => {
      return { code: item.code, name: item.name }
    })
})

const currentLocaleName = computed(() => {
  const current = normalizedLocales.value.find((item) => {
    return item.code === locale.value
  })
  return current?.name || locale.value
})

const items = computed<DropdownMenuItem[][]>(() => [[
  ...normalizedLocales.value.map((item) => {
    return {
      label: item.name || item.code,
      icon: item.code === 'zh' ? 'i-lucide-languages' : 'i-lucide-globe',
      type: 'checkbox' as const,
      checked: locale.value === item.code,
      async onSelect(event: Event) {
        event.preventDefault()
        if (locale.value !== item.code) {
          await setLocale(item.code)
        }
      }
    }
  })
]])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end', collisionPadding: 12 }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      :icon="locale === 'zh' ? 'i-lucide-languages' : 'i-lucide-globe'"
      :label="currentLocaleName"
    />
  </UDropdownMenu>
</template>
