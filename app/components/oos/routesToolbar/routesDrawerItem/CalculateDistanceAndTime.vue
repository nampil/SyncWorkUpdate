<template>
  <div class="pa-2 d-flex justify-space-between">
    <v-btn color="primary" text small @click="getDistanceTime">{{
      `${distance ? 'Update' : 'Get'} Arriving Estimate`
    }}</v-btn>
    <v-progress-circular
      v-if="loading"
      indeterminate
      :size="20"
      color="primary"
    ></v-progress-circular>
    <p v-else-if="distance && duration" class="ma-0">
      <span>{{ distance.text }} - {{ duration.text }}</span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'CalculateDistanceAndTime',
  props: {
    route: {
      type: Object,
      required: true,
    },
    google: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      distance: null,
      duration: null,
      loading: false,
    }
  },

  methods: {
    async getDistanceTime() {
      if (!this.google) {
        return
      }
      if (!this.route.tripStarted) {
        return
      }
      const lat = this.route.leadLocation?.lat
      const lng = this.route.leadLocation?.lng
      if (!lat || !lng) {
        this.distance = { text: '', value: 0 }
        this.duration = { text: '', value: 0 }
        return
      }
      const service = new this.google.maps.DistanceMatrixService()
      const stop = this.route.stops.find((s) => s.num === this.route.stopNum)
      const destinationAddress = stop.address

      try {
        this.loading = true

        await service.getDistanceMatrix(
          {
            origins: [new this.google.maps.LatLng(lat, lng)],
            destinations: [destinationAddress],
            travelMode: 'DRIVING',
            unitSystem: this.google.maps.UnitSystem.IMPERIAL,
          },
          (response, status) => {
            if (!response) {
              return
            }
            this.distance = {
              text: response.rows[0].elements[0].distance?.text || 'N/A',
              value: response.rows[0].elements[0].distance?.value,
            }
            this.duration = {
              text: response.rows[0].elements[0].duration?.text || 'N/A',
              value: response.rows[0].elements[0].duration?.value,
            }
          }
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting distance and duration', error)

        this.$mainAlertError('Error getting distance and duration')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
