<template>
  <div class="container-details-toolbar">
    <div class="content-toolbar elevation-0 pa-2 pr-1 d-flex align-center">
      <action-details
        :orders-selected="ordersSelected"
        @actions-events="handleActions"
      ></action-details>

      <columns-details></columns-details>
      <filter-details :filters-default="filtersDefault"></filter-details>
      <filters-view></filters-view>

      <v-spacer></v-spacer>
      <div class="d-flex">
        <div :class="['search-box d-flex', { open: openSearch }]">
          <v-slide-x-transition>
            <v-text-field
              v-show="openSearch"
              ref="searchInput"
              v-model="search"
              class="search-input"
              dense
              outlined
              :placeholder="$t('search')"
              hide-details="auto"
              @input="updateSearch"
            ></v-text-field>
          </v-slide-x-transition>
        </div>
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              class="mr-3"
              :ripple="false"
              v-bind="attrs"
              small
              v-on="on"
              @click="handleSearch"
            >
              <v-icon color="white" size="20">{{
                openSearch ? 'mdi-close' : 'mdi-magnify'
              }}</v-icon>
            </v-btn>
          </template>
          <span>{{ !openSearch ? $t('search') : $t('close') }}</span>
        </v-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import FilterDetails from './menus/FilterDetails.vue'
import ActionDetails from './menus/ActionDetails.vue'
import ColumnsDetails from './menus/ColumnsDetails.vue'
import FiltersView from './FiltersView.vue'
export default {
  name: 'DetailsToolbar',
  components: {
    FilterDetails,
    FiltersView,
    ActionDetails,
    ColumnsDetails,
  },

  data() {
    return {
      showFilter: false,
      search: '',
      openSearch: false,
    }
  },
  computed: {
    ordersSelected() {
      return this.$store.state.home.ordersSelected
    },
    headersDefault() {
      return this.$store.state.home.headersDefault.map((header) => ({
        ...header,
        text: this.$t(header.text),
      }))
    },
    filtersDefault() {
      return this.$store.state.home.filtersDefault
    },
  },
  methods: {
    handleSearch() {
      this.openSearch = !this.openSearch
      this.$nextTick(() => {
        if (this.openSearch) {
          this.$refs.searchInput.focus()
        } else {
          this.$refs.searchInput.blur()
          this.search = ''
        }
      })
      this.$emit('update-search', '')
    },
    updateSearch() {
      this.$store.commit('home/set_search', this.search)
    },
    handleActions(action) {
      this.$emit('actions-events', action)
    },
  },
}
</script>

<style lang="scss" scoped>
.content-toolbar {
  z-index: 5;
  min-height: 48px;
  background-color: var(--v-secondary-base);
}
.search-box {
  max-width: 0;
  margin: -5px 0 -5px 0;
  position: relative;
  transition: max-width 150ms ease-in;
  .search-input {
    width: 200px;
  }
  &.open {
    transition: max-width 150ms ease-in;
    max-width: 1000px;
  }
}
</style>
