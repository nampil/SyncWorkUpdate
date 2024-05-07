<template>
  <div class="cdp-history | h-100 d-flex flex-column">
    <v-toolbar dense color="secondary">
      <v-toolbar-title>CDP History</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        :return-value.sync="date"
        transition="scale-transition"
        offset-y
        left
        min-width="auto"
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            prepend-icon="mdi-calendar"
            small
            color="primary"
            v-bind="attrs"
            v-on="on"
          >
            {{ dateRangeText || 'Select Date' }}
          </v-btn>
        </template>
        <v-date-picker v-model="date" no-title scrollable :max="today">
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
          <v-btn text color="primary" @click="handleSetDate"> OK </v-btn>
        </v-date-picker>
      </v-menu>
    </v-toolbar>
    <div class="cdp-history-content | flex-grow-1">
      <div class="routes-grid">
        <div v-if="loading">
          <LoaderOverlay />
        </div>
        <div v-else-if="routesFormated.length === 0">
          <v-alert type="info" outlined> No CDP history found </v-alert>
        </div>
        <div v-else class="dates-list | h-100">
          <div class="routes-list | d-flex flex-column h-100">
            <div class="routes | pa-4">
              <EditRoutes
                v-for="route in routesFormated"
                :key="route.id"
                :edit-route="route"
                :editing="false"
                :is-history="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoaderOverlay from '~/components/misc/LoaderOverlay.vue'
import EditRoutes from '~/components/oos/editRoutesContent/EditRoutes.vue'

export default {
  name: 'CdpHistory',
  components: {
    EditRoutes,
    LoaderOverlay,
  },
  data() {
    return {
      loading: false,
      menu: false,
      date: null,
      today: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 10),
    }
  },
  computed: {
    cdpHistory() {
      return this.$store.state.cdpHistory.history
    },
    users() {
      return this.$store.state.users.users
    },
    routesFormated() {
      if (!this.cdpHistory.length) return []

      return this.cdpHistory.map((route) => {
        const contractors = route.contractors.map((c) => {
          const user = this.users.find((u) => u.uid === c)
          return user || c
        })

        const oosSupervisors = route.oosSupervisors.map((c) => {
          const user = this.users.find((u) => u.uid === c)
          return user || c
        })

        return {
          ...route,
          contractors,
          oosSupervisors,
        }
      })
    },
    dateRangeText() {
      if (!this.date) return null
      const [year, month, day] = this.date.split('-')

      return `${month}/${day}/${year}`
    },
  },
  watch: {
    $route(val) {},
    dates: {
      handler(val) {
        this.validateRange(val)
      },
      deep: true,
    },
  },
  mounted() {
    if (this.$route.query.cdpHistoryDate) {
      const _dateStr = this.$route.query.cdpHistoryDate
      if (
        _dateStr.match(/^\d{4}-\d{2}-\d{2}$/) &&
        !isNaN(Date.parse(_dateStr)) &&
        _dateStr <= this.today &&
        _dateStr >= '2024-03-01'
      ) {
        this.date = _dateStr
        this.getHistory()
      }
    }
  },
  methods: {
    handleSetDate() {
      this.$refs.menu.save(this.date)
      this.menu = false

      if (this.date !== this.$route.query.cdpHistoryDate) {
        this.$router.replace({
          query: {
            cdpHistoryDate: this.date,
          },
        })

        this.getHistory()
      }
    },

    async getHistory() {
      try {
        this.loading = true
        await this.$store.dispatch('cdpHistory/get_history', {
          date: this.date,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('Error getting CDP history', error)
        this.$mainAlertError('Error getting CDP history')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.cdp-history-content {
  height: 100%;

  position: relative;
}
.routes-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  inset: 0;
  overflow-y: auto;
}
.routes {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
}
</style>
