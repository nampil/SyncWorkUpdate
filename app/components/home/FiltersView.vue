<template>
  <div
    v-if="filters && filtersView"
    class="container-filters-view | d-flex flex-wrap"
  >
    <div v-for="(filter, i) in filtersView" :key="i" class="pl-4">
      <div class="item-filter">
        <span class="texto">
          {{
            typeof filter.value === 'string'
              ? `${
                  filter.key.charAt(0).toUpperCase() + filter.key.substr(1)
                }: ${filter.value}`
              : filter.key.charAt(0).toUpperCase() + filter.key.substr(1)
          }}
        </span>
        <v-btn icon x-small @click="handleOrdersFilters(filter)">
          <v-icon class="icon-close mt-1" x-small color="error"
            >mdi-close-circle-outline</v-icon
          >
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FiltersView',
  data() {
    return {}
  },
  computed: {
    filters() {
      return this.$store.state.auth.user.preferences.ordersFilters
    },
    filtersView() {
      const array = Object.keys(this.filters)
      const _filters = []

      for (let index = 0; index < array.length; index++) {
        const element = array[index]
        if (
          this.filters[element] &&
          element !== 'status' &&
          element !== 'contractor' &&
          element !== 'woNumber' &&
          this.filters[element] !== ''
        ) {
          _filters.push({ value: this.filters[element], key: element })
        }

        if (element === 'status') {
          const array = this.filters[element]
          for (let i = 0; i < array.length; i++) {
            const e = array[i]
            _filters.push({ value: e, key: 'status' })
          }
        }
        if (
          element === 'contractor' &&
          this.filters[element] &&
          this.filters[element].uid
        ) {
          _filters.push({
            value: this.filters[element].fullName,
            key: 'contractor',
          })
        }
        if (this.filters[element] && element === 'woNumber') {
          _filters.push({ value: this.filters[element], key: 'WO #' })
        }
      }

      return _filters
    },
  },

  methods: {
    async handleOrdersFilters(filter) {
      let _ordersFilters = Object.assign({}, this.filters)
      if (filter.key === 'assigned' || filter.key === 'unassigned') {
        _ordersFilters[filter.key] = false
      }
      if (
        filter.key !== 'assigned' &&
        filter.key !== 'unassigned' &&
        filter.key !== 'status' &&
        filter.key !== 'contractor' &&
        filter.key !== 'archive'
      ) {
        _ordersFilters[filter.key] = ''
      }
      if (filter.key === 'archive') {
        _ordersFilters[filter.key] = false
      }
      if (filter.key === 'WO #') {
        _ordersFilters.woNumber = ''
        const { 'WO #': WO, ..._filters } = _ordersFilters
        _ordersFilters = _filters
      }
      if (filter.key === 'contractor') {
        _ordersFilters[filter.key] = null
      }
      if (filter.key === 'status' && _ordersFilters[filter.key]) {
        const _status = JSON.parse(JSON.stringify(_ordersFilters[filter.key]))
        const indexOfStatu = _status.findIndex((f) => f === filter.value)
        _status.splice(indexOfStatu, 1)
        _ordersFilters[filter.key] = _status
      }

      try {
        await this.$store.dispatch('home/update_ordersFilters', {
          ordersFilters: _ordersFilters,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.texto {
  font-size: 0.8rem;
  opacity: 0.8;
  color: var(--v-accent-base);
}
.icon-close {
  display: none;
}
.item-filter:hover {
  .icon-close {
    display: block;
  }
}
</style>
