<template>
  <v-toolbar dense color="secondary" class="top-bar white--text elevation-0">
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="white--text mr-2"
          icon
          v-bind="attrs"
          v-on="on"
          @click.stop="$router.go(-1)"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('back') }}</span>
    </v-tooltip>
    <v-toolbar-title class="font-weight-bold">{{
      $t('routing')
    }}</v-toolbar-title>

    <v-spacer></v-spacer>
    <div v-if="forDateStr" class="d-flex align-center text-h6">
      <v-menu
        ref="dateMenu"
        v-model="dateMenu"
        transition="scale-transition"
        :close-on-content-click="false"
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn small color="primary" class="mr-4" v-bind="attrs" v-on="on">
            <span class="mr-2">{{ forDateStrFormatted }}</span>
            <v-icon small>mdi-calendar</v-icon>
          </v-btn>
        </template>
        <v-date-picker
          v-model="forDateStr"
          color="primary"
          @input="dateMenu = false"
        >
        </v-date-picker>
      </v-menu>
    </div>
    <v-spacer></v-spacer>
    <v-btn small color="success" class="elevation-0 mr-4" @click="handleSave">{{
      $t('save')
    }}</v-btn>
    <v-btn small color="error" outlined>{{ $t('cancel') }}</v-btn>
  </v-toolbar>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapActions, mapMutations, mapGetters } =
  createNamespacedHelpers('routes')
export default {
  name: 'RoutingToolbar',
  data() {
    return { dateMenu: false, loading: false }
  },
  computed: {
    forDateStr: {
      get() {
        return this.$store.state.routes.forDateStr
      },
      set(payload) {
        this.$store.commit('routes/set_forDateStr', { forDateStr: payload })
      },
    },
    forDateStrFormatted() {
      if (!this.forDateStr) {
        return ''
      }
      const [year, month, day] = this.forDateStr.split('-')
      return `${month}-${day}-${year}`
    },
    ...mapState({
      routes: (state) => state.routes,
      savingRoutes: (state) => state.savingRoutes,
      baseOrders: (state) => state.baseOrders,
    }),
    ...mapGetters({
      routesFormatted: 'routesFormatted',
    }),
  },
  watch: {},

  mounted() {
    this.setForDate(new Date())
  },
  methods: {
    ...mapMutations({
      setSavingRoutes: 'set_savingRoutes',
      updateStopsInroute: 'update_stopsInroute',
    }),
    ...mapActions({
      saveRoutes: 'save_routes',
    }),
    setForDate(date) {
      const forDateStr = this.$formatDate(date, { iso: true })

      this.$store.commit('routes/set_forDateStr', { forDateStr })
    },
    getStops(orders) {
      if (!orders.length) {
        return []
      }

      const _stopsOrders = orders.reduce((stops, order) => {
        if (!order) {
          return stops
        }
        const address = `${order.address} ${order.county} ${order.city}, ${order.state} ${order.zip}`

        const current = {
          address,
          propertyId: this.$getPropertyId(order),
        }
        const indexOfCurrent = stops.findIndex(
          (stop) =>
            stop.address.trim().split(' ').join('').toLowerCase() ===
            address.trim().split(' ').join('').toLowerCase()
        )

        if (indexOfCurrent < 0) {
          return [...stops, current]
        }
        return stops
      }, [])

      const stops = _stopsOrders.map(({ address, propertyId }, index) => {
        const _orders = orders.filter((o) => {
          if (o) {
            const _propertyId = this.$getPropertyId(o)
            return _propertyId === propertyId
          }
          return false
        })

        return {
          num: index + 1,
          address,
          orders: _orders.map((o) => o.id),
        }
      })

      return stops
    },

    async handleSave() {
      const hayRoutes = this.routes.length > 0
      const allRoutesHasAssignedTo =
        this.routes.filter((route) => this._.isEmpty(route.assignedTo))
          .length === 0
      const routesHasOrders =
        this.routes.filter((r) => r.orders.length === 0).length === 0

      if (!hayRoutes || !allRoutesHasAssignedTo || !routesHasOrders) {
        this.$mainAlertInfo(this.$t('routesAndOrderComplete'))
        return
      }
      try {
        this.setSavingRoutes(true)

        this.routesFormatted.forEach((route) => {
          const stops = this.getStops(route.orders)
          this.updateStopsInroute({
            stops,
            routeId: route.id,
          })
        })

        await this.saveRoutes({ baseOrders: this.baseOrders })

        this.$mainAlertSuccess(this.$t('routesSaved'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.setSavingRoutes(false)
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
