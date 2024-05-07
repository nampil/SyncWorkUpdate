<template>
  <header class="routes-toolbar d-flex align-center px-4 gap-8">
    <div class="subtitle-2 d-flex align-center">
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mr-2"
            icon
            small
            v-bind="attrs"
            color="white"
            v-on="on"
            @click.stop="$router.go(-1)"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('back') }}</span>
      </v-tooltip>

      <span class="accent--text">{{ $t('routes') }}:</span>
    </div>

    <div v-if="routesFormatted" class="assigneTo | flex-grow-1 ml-5 pt-2 pb-2">
      <v-btn
        v-for="route in routesFormatted"
        :key="route.id"
        x-small
        class="routes mr-1 ma-1 elevation-0"
        :class="{ routeSelected: selectRoute === route.id }"
        nuxt
        :to="{
          name: 'cdp-route',
          query: {
            selectRoute: route.id,
            selectOrder: route.stops[0].orders[0],
          },
        }"
      >
        <!-- @click="handleSelectRoute(route.id)" -->
        <v-icon x-small class="pr-1">mdi-routes</v-icon>
        <span v-if="route.groupName" class="text-truncate pr-1">
          {{ route.groupName }}
        </span>
        <span
          v-else-if="
            route.assignedTo !== 'undefined' &&
            JSON.stringify(route.assignedTo) !== '{}'
          "
          class="text-truncate pr-1"
          style="max-width: 120px"
        >
          {{ route.assignedTo.fullName }}
        </span>
        <div
          v-if="notificationsByRoutesId[route.id]?.length"
          class="notification-badge"
        ></div>
        <span
          v-if="
            route.assignedTo === 'undefined' ||
            JSON.stringify(route.assignedTo) === '{}'
          "
        >
          {{ $t('routeNotAssigned') }}</span
        >
      </v-btn>

      <div
        v-if="routesFormatted.length == 0"
        class="h-100 d-flex justify-center text-subtitle-2 white--text"
      >
        {{ $t('thereAreNoRoutes') }}
      </div>
    </div>
    <v-spacer></v-spacer>
    <span class="switch-text | text-info">{{
      !showOnlyRoutesAsSupervisor ? 'All Routes' : 'Supervised Routes'
    }}</span>
    <v-switch
      v-model="showOnlyRoutesAsSupervisor"
      hide-details="auto"
      class="pt-0 mt-0"
    >
    </v-switch>

    <!-- <div v-if="selectRoute && routeSelected" class="flex-shrink-0">
      <LeadLocation :route="routeSelected"></LeadLocation>
    </div> -->
  </header>
</template>

<script>
import { mapState } from 'vuex'
// import { getGoogleMapsAPI } from 'gmap-vue'
// import GoogleMap from '../../misc/GoogleMap.vue'
// import RoutesDrawerItem from './routesDrawerItem'
// import LeadLocation from './routesDrawerItem/LeadLocation.vue'

export default {
  name: 'RoutesToolbar',

  data() {
    return {
      showOnlyRoutesAsSupervisor: false,
    }
  },
  computed: {
    ...mapState('oos/routes', { routes: (state) => state.routes }),
    ...mapState('oos/orders', { orders: (state) => state.orders }),
    ...mapState({
      user: (state) => state.auth.user.profile,
    }),

    selectRoute: {
      get() {
        return this.$store.state.oos.routes.selectRoute
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectRoute', val)
      },
    },
    routeSelected() {
      return this.routes.filter((r) => r.id === this.selectRoute)[0]
    },
    routesFormatted() {
      if (!this.routes) {
        return []
      }

      const routesEdit = JSON.parse(JSON.stringify(this.routes))
      const _routes = []
      routesEdit.forEach((route) => {
        // if (route.oosSupervisors.includes(this.user.uid)) {
        //   _routes.push(route)
        // }
        _routes.push({
          ...route,
          isSupervisor: route.oosSupervisors.includes(this.user.uid),
        })
      })

      return _routes
        .filter((r) => {
          if (this.selectRoute === r.id || !this.showOnlyRoutesAsSupervisor) {
            return r
          }

          return r.isSupervisor
        })
        .sort((a, b) => {
          const aCreatedAt = new Date(a.createdAt.seconds * 1000)
          const bCreatedAt = new Date(b.createdAt.seconds * 1000)
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    notificationsByRoutesId() {
      return this.$store.getters['oos/orders/notificationsByRoutesId']
    },
  },

  watch: {
    selectRoute(newVal) {
      this.$store.commit('oos/routes/hide_notification_route_by_id', newVal)
    },
    routesFormatted(newVal) {
      if (newVal.length && this.selectRoute === null) {
        this.handleSelectRoute(newVal[0].id)
      }
    },
  },
  mounted() {
    if (this.selectRoute === null && this.routesFormatted[0]) {
      this.handleSelectRoute(this.routesFormatted[0].id)
    }
    this.$store.commit(
      'oos/routes/hide_notification_route_by_id',
      this.selectRoute
    )
  },
  methods: {
    handleSelectRoute(routeId) {
      // eslint-disable-next-line
      console.log('RouteId Selected', routeId)

      this.selectRoute = routeId
      if (
        this.routesFormatted?.length &&
        this.routesFormatted[0]?.orders?.length
      ) {
        this.$store.commit(
          'oos/routes/set_selectOrder',
          this.routesFormatted[0]?.orders[0]
        )
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.routes-toolbar {
  background-color: var(--v-secondary-base);
  min-height: 48px;
}
.routes {
  background-color: var(--v-secondary-base) !important;
  color: white;
}
.routes:hover {
  background-color: var(--v-background_select-base) !important;
}
.routeSelected {
  background-color: var(--v-background_select-base) !important;
}
// ::v-deep .theme--dark {
//   .routes {
//     background-color: var(--v-primary-base) !important;
//   }
//   .routes:hover {
//     background-color: var(--v-background_select-base) !important;
//   }
//   .routeSelected {
//     background-color: var(--v-background_select-base) !important;
//   }
// }
.notification-badge {
  // position: absolute;
  right: 10px;
  top: 10px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: -3px;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  background-color: var(--v-error-base);
}
.switch-text {
  font-size: 13px;
  color: var(--v-grey);
}
</style>
