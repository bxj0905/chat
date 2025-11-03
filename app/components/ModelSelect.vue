<script setup lang="ts">
const { model, models } = useModels()

const fallbackIcon = 'i-lucide-cpu'

const items = computed(() => models.map((item) => {
  const hasAvatar = Boolean(item.avatar?.src)

  return {
    ...item,
    avatar: hasAvatar
      ? {
          src: item.avatar!.src,
          alt: item.avatar!.alt || item.label
        }
      : undefined,
    icon: hasAvatar ? undefined : (item.icon || fallbackIcon)
  }
}))

const selectedItem = computed(() => {
  return items.value.find((item) => {
    return item.value === model.value
  })
})
const selectedIcon = computed(() => selectedItem.value?.icon ?? (selectedItem.value?.avatar ? undefined : fallbackIcon))
const selectedAvatar = computed(() => selectedItem.value?.avatar)
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="items"
    :icon="selectedIcon"
    :avatar="selectedAvatar"
    variant="ghost"
    value-key="value"
    class="hover:bg-default focus:bg-default data-[state=open]:bg-default min-w-56 sm:min-w-72"
    :ui="{
      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
      content: 'min-w-[18rem] sm:min-w-[22rem]'
    }"
  />
</template>
