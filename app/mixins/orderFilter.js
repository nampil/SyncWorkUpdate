export default {
  data() {
    return {
      filterPriority: 'items',
      filters: [],
    }
  },

  computed: {
    items() {
      const orders = this.$store.state.orders.orders
      const users = this.$store.state.users.users
      const _orders = []

      orders.forEach((order) => {
        if (!order.processor) {
          _orders.push({ ...order })
          return
        }
        _orders.push({
          ...order,
          processor: users.find((u) => u.uid === order.processor)?.fullName,
        })
      })

      return _orders
        .filter((order) => {
          let isFiltered = true

          for (let i = 0; i < this.filters.length; i++) {
            const filter = this.filters[i]
            if (order[filter] !== true) {
              isFiltered = false
            }
          }

          return isFiltered
        })
        .filter((o) => {
          if (this.filterPriority === 'items') {
            return o
          } else {
            return o.category === this.filterPriority
          }
        })
        .filter((o) => {
          if (!this.inModal) {
            return o
          }

          return !this.preselectedOrders.map((pso) => pso.id).includes(o.id)
        })
    },
    itemsHighPriority() {
      return this.$store.state.orders.orders.filter(
        (item) => item.category === 'High'
      )
    },
    itemsMedianPriority() {
      return this.$store.state.orders.orders.filter(
        (item) => item.category === 'Median'
      )
    },
    itemsVeryLowPriority() {
      return this.$store.state.orders.orders.filter(
        (item) => item.category === 'Very Low'
      )
    },
    itemsUltraHighPriority() {
      return this.$store.state.orders.orders.filter(
        (item) => item.category === 'Ultra High'
      )
    },
    itemsLowPriority() {
      return this.$store.state.orders.orders.filter(
        (item) => item.category === 'Low'
      )
    },
  },
  watch: {
    totalEntries(val) {
      if (val) {
        this.orderNew = false
        this.assigned = false
        this.unassigned = false
        this.edited = false
        this.onHold = false
        this.filters = []
      }
    },
    orderNew(val) {
      if (val) {
        this.totalEntries = false
        this.edited = false
        this.onHold = false
        this.filters.push('orderNew')
      } else {
        const index = this.filters.indexOf('orderNew')
        this.filters.splice(index, 1)
      }
    },
    onHold(val) {
      if (val) {
        this.totalEntries = false
        this.edited = false
        this.orderNew = false
        this.filters.push('onHold')
      } else {
        const index = this.filters.indexOf('onHold')
        this.filters.splice(index, 1)
      }
    },
    assigned(val) {
      if (val) {
        this.totalEntries = false
        this.edited = false
        this.unassigned = false
        this.filters.push('assigned')
      } else {
        const index = this.filters.indexOf('assigned')
        this.filters.splice(index, 1)
      }
    },
    unassigned(val) {
      if (val) {
        this.totalEntries = false
        this.edited = false
        this.assigned = false
        this.filters.push('unassigned')
      } else {
        const index = this.filters.indexOf('unassigned')
        this.filters.splice(index, 1)
      }
    },
    edited(val) {
      if (val) {
        this.totalEntries = false
        this.orderNew = false
        this.assigned = false
        this.unassigned = false
        this.onHold = false
        this.filters.push('edited')
      } else {
        const index = this.filters.indexOf('edited')
        this.filters.splice(index, 1)
      }
    },
  },
  mounted() {},
  methods: {
    handleFilterPriority(priority) {
      if (this.filterPriority === priority) {
        this.filterPriority = 'items'
        return
      }

      this.filterPriority = priority
    },
    handleTotalEntriesBtn() {
      this.totalEntries = !this.totalEntries
    },
    handleOrderNewBtn() {
      this.orderNew = !this.orderNew
    },
    handleOnHoldBtn() {
      this.onHold = !this.onHold
    },
    handleAssignedBtn() {
      this.assigned = !this.assigned
    },
    handleUnassignedBtn() {
      this.unassigned = !this.unassigned
    },
    handleEditedBtn() {
      this.edited = !this.edited
    },
  },
}
