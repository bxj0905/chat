<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { locale, locales, setLocale } = useI18n()

const currentLocaleName = computed(() => {
  const current = locales.value.find((l: any) => l.code === locale.value)
  return current?.name || locale.value
})

const items = computed<DropdownMenuItem[][]>(() => [[
  ...locales.value.map((l: any) => ({
    label: l.name || l.code,
    icon: l.code === 'zh' ? 'i-lucide-languages' : 'i-lucide-globe',
    type: 'checkbox' as const,
    checked: locale.value === l.code,
    async onSelect(e: Event) {
      e.preventDefault()
      if (locale.value !== l.code) {
        await setLocale(l.code)
      }
    }
  }))
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
