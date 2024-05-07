<template>
  <div class="map">
    <GmapMap
      ref="gmap"
      :center="homeLocation"
      :zoom="11"
      map-type-id="roadmap"
      style="width: 100%; height: 100%"
      :options="{
        styles: $vuetify.theme.dark ? mapStyles : [],
      }"
    >
      <gmap-marker
        v-for="m in markersFiltered"
        :key="m.id"
        :position="m.position"
        :title="m.title"
        :icon="m.icon"
        :label="m.label"
        :optimized="m.optimized"
        :animation="m.animation"
      >
      </gmap-marker>
    </GmapMap>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { getGoogleMapsAPI } from 'gmap-vue'
import { mapStyles } from '@/utils/constans'
import { ROUTES_FILTER_OPTIONS } from '~/utils/dictionaries'
const { mapState, /* mapActions,  */ mapMutations, mapGetters } =
  createNamespacedHelpers('routes')
export default {
  name: 'MapPanel',
  data() {
    return {
      mapStyles,
      map: null,
      directionsService: null,
      directionsRenderer: null,
    }
  },
  computed: {
    ...mapState({
      markers: (state) => state.markers,
      showRouteInMap: (state) => state.showRouteInMap,
      routeSelected: (state) => state.routeSelected,
    }),
    ...mapGetters({
      markersFiltered: 'markersFiltered',
      routeSelectedFormatted: 'routeSelectedFormatted',
    }),
    google: getGoogleMapsAPI,

    homeLocation() {
      return this.$store.state.config.homeLocation
    },
  },
  watch: {
    showRouteInMap(val) {
      this.handleShowRouteInMap(val)
    },
  },

  async mounted() {
    await this.$gmapApiPromiseLazy()

    const google = getGoogleMapsAPI()

    this.$store.commit('routes/set_google', { google })
    this.$nextTick(async () => {
      const map = await this.$refs.gmap.$mapPromise

      this.map = map

      this.directionsService = new this.google.maps.DirectionsService()
      this.directionsRenderer = new this.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
      })

      const marker = new this.google.maps.Marker({
        position: this.homeLocation,
        title: 'Daytona Home Office',
        label: {
          // eslint-disable-next-line
          text: '\u{F02DC}',
          fontFamily: 'Material Design Icons',
          color: '#ffffff',
          fontSize: '18px',
        },
        optimized: true,
      })

      marker.setMap(map)
    })
  },
  methods: {
    ...mapMutations({
      setFilter: 'set_filter',
      setRouteSelected: 'set_routeSelected',
    }),
    handleShowRouteInMap(val) {
      if (!val) {
        this.setFilter({ filter: null })
        this.setRouteSelected(null)
        this.directionsRenderer.set('directions', null)
        return
      }

      this.setFilter({ filter: ROUTES_FILTER_OPTIONS.route })
      this.$nextTick(() => {
        const ordersId = this.routeSelectedFormatted.orders.map((o) => o.id)
        const wayPoints = ordersId.map((orderId) => {
          const marker = this.markers.filter((m) => {
            return m.orderId === orderId
          })[0]
          return {
            label: marker.label,
            location: marker.position,
          }
        })
        // this.markers
        //   .filter((m) => {
        //     return m.orderId && ordersId.includes(m.orderId)
        //   })
        //   .map((w) => {
        //     return {
        //       location: w.position,
        //     }
        //   })

        if (!wayPoints.length) return

        const origin =
          this.routeSelectedFormatted.originAddress || this.homeLocation
        const destination = wayPoints.pop().location

        this.directionsService
          .route({
            origin,
            destination,
            ...(wayPoints.length && {
              waypoints: wayPoints.map((wp) => ({ location: wp.location })),
            }),
            travelMode: this.google.maps.TravelMode.DRIVING,
          })
          .then((results) => {
            this.directionsRenderer.setDirections(results)
          })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
