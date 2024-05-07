<template>
  <div :class="['drawer-wrapper overflow-hidden', { open: open }]">
    <transition>
      <v-navigation-drawer
        v-if="open"
        v-model="open"
        right
        width="400"
        absolute
      >
        <v-toolbar
          class="elevation-0 info--text text"
          color="rgba(128, 128, 128, 0.067)"
          dense
        >
          <v-toolbar-title class="">Job Notes</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                color="primary"
                :ripple="false"
                class="mr-4"
                v-bind="attrs"
                v-on="on"
                @click.stop="handleSearch"
              >
                <v-icon size="21">{{
                  openSearch ? 'mdi-close' : 'mdi-magnify'
                }}</v-icon>
              </v-btn>
            </template>
            <span v-if="!openSearch">Search</span>
            <span v-else>Close</span>
          </v-tooltip>

          <div :class="['search-box d-flex', { open: openSearch }]">
            <v-slide-x-transition>
              <v-text-field
                v-show="openSearch"
                ref="searchInput"
                v-model="search"
                class="search-input ma-0"
                dense
                outlined
                :placeholder="$t('search')"
                hide-details="auto"
              ></v-text-field>
            </v-slide-x-transition>
          </div>

          <v-menu
            ref="menu"
            v-model="showDatePicker"
            offset-y
            :close-on-content-click="false"
            transition="scale-transition"
            max-width="290px"
            min-width="290px"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on: menu, attrs }">
              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn
                    icon
                    small
                    color="primary"
                    :ripple="false"
                    class="mr-4"
                    v-bind="attrs"
                    v-on="{ ...tooltip, ...menu }"
                    @click.stop="showDatePicker = !showDatePicker"
                  >
                    <v-icon size="21">{{
                      showDatePicker ? 'mdi-close' : 'mdi-calendar-range'
                    }}</v-icon>
                  </v-btn>
                </template>
                <span>Calendar</span>
              </v-tooltip>
            </template>
            <v-date-picker
              v-model="dates"
              range
              @input="showDatePicker = dates.length !== 2"
            ></v-date-picker>
          </v-menu>
          <v-menu offset-y>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on: menu, attrs }">
              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line  -->
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn
                    small
                    icon
                    color="primary"
                    class="mr-4"
                    v-bind="attrs"
                    v-on="{ ...tooltip, ...menu }"
                    ><v-icon size="21">mdi-order-bool-ascending</v-icon></v-btn
                  >
                </template>
                <span>Order</span>
              </v-tooltip>
            </template>
            <v-list class="" dense>
              <v-list-item dense link>
                <v-list-item-title
                  @click="typeFilter('Work Order Then Property')"
                  >Work Order Then Property</v-list-item-title
                >
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item dense link>
                <v-list-item-title
                  @click="typeFilter('Property Then Work Order')"
                  >Property Then Work Order</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-y>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on: menu, attrs }">
              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line  -->
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn
                    small
                    icon
                    color="primary"
                    class="mr-2"
                    v-bind="attrs"
                    v-on="{ ...tooltip, ...menu }"
                    ><v-icon>mdi-filter-variant</v-icon></v-btn
                  >
                </template>
                <span>Filter Job Notes</span>
              </v-tooltip>
            </template>
            <v-list class="" dense>
              <v-list-item dense link>
                <v-list-item-title @click="typeFilter('All')"
                  >All</v-list-item-title
                >
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item dense link>
                <v-list-item-title @click="typeFilter('Work Order')"
                  >Work Order</v-list-item-title
                >
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item dense link>
                <v-list-item-title @click="typeFilter('Property')"
                  >Property</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                small
                icon
                color="dark secondary"
                class="ml-2 mr-2"
                v-bind="attrs"
                v-on="on"
                @click="showAddJobNote = true"
              >
                <v-icon color="primary">mdi-plus-circle</v-icon>
              </v-btn>
            </template>
            <span>Add Job Notes</span>
          </v-tooltip>
        </v-toolbar>
        <v-divider></v-divider>

        <job-notes
          v-if="open && order && order.id"
          :order="order"
          :type-filter="typeFilterJobNotes"
          :search="search"
          :data-filter="dateFormatted"
          class="list | h-100"
          @clearFilterData="dates = []"
        ></job-notes>
        <addJobNote
          v-if="order && order.id"
          :show="showAddJobNote"
          :order-id="order.id"
          :property-id="order.propertyId"
          @close="showAddJobNote = false"
        ></addJobNote>
      </v-navigation-drawer>
    </transition>
  </div>
</template>

<script>
import JobNotes from './JobNotes.vue'
import AddJobNote from './AddJobNote.vue'

export default {
  components: { JobNotes, AddJobNote },
  props: {
    order: {
      type: [Object, null],
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      typeFilterJobNotes: 'Work Order Then Property',
      showAddJobNote: false,
      openSearch: false,
      search: '',
      showDatePicker: false,
      dates: [],
      open: false,
    }
  },
  computed: {
    dateRangeText() {
      return this.dates.join(' ~ ')
    },
    dateFormatted() {
      return this.formatDate(this.dates)
    },
  },

  watch: {
    show: {
      handler(val) {
        this.open = val
      },
      immediate: true,
    },
  },
  methods: {
    typeFilter(type) {
      this.typeFilterJobNotes = type
    },
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
    },
    formatDate(date) {
      if (!date) return []
      const newDateFormatted = []
      date = date.forEach((element) => {
        const [year, month, day] = element.split('-')
        newDateFormatted.push(`${month}/${day}/${year}`)
      })
      return newDateFormatted
    },
  },
}
</script>

<style lang="scss" scoped>
.drawer-wrapper {
  width: 0;
  transition: width 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  &.open {
    width: 400px;
    flex-shrink: 0;
    transition: width 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}
.list {
  overflow-y: auto;
  background-color: rgba(128, 128, 128, 0.067);
}
::v-deep .v-navigation-drawer__content,
.list {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
::v-deep .v-navigation-drawer__content::-webkit-scrollbar,
.list::-webkit-scrollbar {
  display: none; /* Chrome */
}
::v-deep .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.search-box {
  max-width: 0;
  position: relative;

  transition: max-width 150ms ease-in;
  .search-input {
    width: 120px;
  }
  &.open {
    transition: max-width 150ms ease-in;
    max-width: 200px;
    margin-right: 1rem;
  }
}
.v-enter-active,
.v-leave-active {
  transition: all 250ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.v-enter,
.v-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
