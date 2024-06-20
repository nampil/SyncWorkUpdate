import { defineStore } from 'pinia'

export const useOrdersStore =
  ('orders',
  () => {
    const orders = ref([])

    return { orders }
  })
