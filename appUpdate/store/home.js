import { defineStore } from 'pinia'
import { ref, computed, callWithAsyncErrorHandling } from 'vue'
import { useAuthStore } from '@/store/auth'
import { collection, where, query } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'

export const useHomeStore = defineStore('home', () => {
  const autStore = useAuthStore()
  const db = useFirestore()

  const defaultHeaders = [
    {
      text: 'wo#',
      value: 'woNumber',
      width: '10%',
      align: 'left',
      sortable: true,
    },
    {
      text: 'duedate',
      value: 'dateDueFormatted',
      width: '15%',
      align: 'center',
      cellClass: ['min-width-large'],
      sortable: true,
    },
    {
      text: 'address',
      value: 'address',
      width: '5%',
      align: 'left',
      cellClass: ['truncate'],
      sortable: true,
    },
    {
      text: 'city',
      value: 'city',
      width: '15%',
      align: 'left',
      cellClass: ['min-width-small'],
      sortable: true,
    },
    {
      text: 'zip',
      value: 'zip',
      width: '15%',
      align: 'center',
      cellClass: ['min-width'],
      sortable: true,
    },
    {
      text: 'worktype',
      value: 'workType',
      width: '10%',
      align: 'left',
      cellClass: ['truncate'],
      sortable: true,
    },
    {
      text: 'contractors',
      value: 'contractorList',
      cellClass: ['min-width, truncate'],
      align: 'left',
      sortable: true,
    },
    {
      text: 'status',
      value: 'status',
      width: '10%',
      align: 'center',
      cellClass: ['truncate'],
      sortable: true,
    },
  ]

  const defaultFilters = {
    assigned: false,
    archive: false,
    unassigned: false,
    address: '',
    city: '',
    state: '',
    customer: '',
    client: '',
    county: '',
    zip: '',
    workType: '',
    woNumber: '',
    category: '',
    contractor: null,
    status: ['Ready for office'],
  }

  const qOrderdsProperties = query(
    collection(db, 'admin/config/orderProperties')
  )

  const ordersProperties = useCollection(qOrderdsProperties, { once: true })

  const isAllOrders = ref(false) // unnassigned + assigned

  const filters = ref(defaultFilters)
  const searchText = ref('')

  const duplicateOrders = computed(() => {
    if (!orders.value?.length) return []
    return orders.value.filter(
      (order) =>
        order.woNumber &&
        orders.value.filter((o) => o.woNumber === order.woNumber).length > 1
    )
  })

  // const waiter = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const q = computed(() => {
    const ordersRef = collection(db, 'orders')
    const queryConstraints = []

    const filtersFinal = []
    for (let i = 0; i < Object.entries(filters.value).length; i++) {
      const filter = Object.entries(filters.value)[i]
      const key = filter[0]
      const value = filter[1]
      filtersFinal.push({
        key,
        value,
      })
    }

    if (filtersFinal && filtersFinal.length) {
      filtersFinal.forEach(({ key, value }) => {
        if (key === 'contractor' && value) {
          queryConstraints.push(
            where('contractorsUids', 'array-contains', value.uid)
          )
        }
        if (key === 'status' && value.length > 0) {
          const statusList = value.map((status) => status)
          if (statusList.includes('Inactive')) {
            statusList.push('idle')
          }

          queryConstraints.push(where(key, 'in', statusList))
        }
        if (key === 'archive') {
          queryConstraints.push(where('archive', '==', value))
        }
        if (key === 'unassigned' && value && !isAllOrders.value) {
          queryConstraints.push(where('assigned', '==', false))
        }
        if (
          key !== 'status' &&
          key !== 'contractor' &&
          key !== 'unassigned' &&
          value &&
          !isAllOrders.value
        ) {
          queryConstraints.push(where(key, '==', value))
        }
      })
    }

    return query(ordersRef, ...queryConstraints)
  })
  const {
    // rename the Ref to something more meaningful
    data: orders,
    // is the subscription still pending?
    pending: loadingOrders,
    // did the subscription fail? TODO: handle the error
    error,
    // A promise that resolves or rejects when the initial state is loaded
    promise,
  } = useCollection(q)

  return {
    filters,
    searchText,
    orders,
    duplicateOrders,
    defaultHeaders,
    defaultFilters,
    loadingOrders,
    error,
    ordersProperties,
  }
})
