<template>
  <div class="flex-grow-1 pa-2">
    <v-data-table-virtual
      v-model="ordersSelected"
      height="100%"
      :headers="headers"
      :items="homeStore.orders"
      item-key="id"
      :loading="homeStore.loadingOrders"
    >
    </v-data-table-virtual>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/store/auth'
import { useHomeStore } from '~/store/home'

const homeStore = useHomeStore()
const authStore = useAuthStore()

const headers = computed(() => {
  if (!authStore.userPreferences?.headers) {
    return homeStore.defaultHeaders.map((header) => {
      return {
        title: header.text,
        key: header.value,
        align: 'left',
        sortable: false,
        width: '5%',
        class: 'header-text',
      }
    })
  }

  const _headers = JSON.parse(JSON.stringify(authStore.userPreferences.headers))
  _headers.forEach((element) => {
    element.title = element.text
    element.key = element.value
    if (!element.width || !element.width.includes('%')) {
      element.width = '5%'
    }
    if (element.text === 'contractors') {
      element.width = '15%'
      element.cellClass = ['truncate']
    }
    if (element.text === 'Status') {
      element.cellClass = ['truncate']
    }

    element.class = 'header-text ' + `${element.class ?? ''}`
    if (element.text === 'Processor') {
      element.value = 'processorName'
    }
    if (element.text === 'ZIP Code' || element.text === 'Date Received') {
      element.cellClass = []
      element.width = '5%'
    }

    if (element.text === 'Date Received') {
      element.text = 'Received'
    }
  })

  // add actions column
  _headers.push({
    text: 'Actions',
    value: 'actions',
    align: 'left',
    sortable: false,
    width: '5%',
    class: 'header-text',
  })

  return _headers
})
const ordersSelected = ref([])
</script>

<style lang="scss" scoped></style>
