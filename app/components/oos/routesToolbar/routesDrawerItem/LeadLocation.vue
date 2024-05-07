<template>
  <div class="container-lead-location py-2">
    <div class="on-route d-flex">
      <!-- This div is for support mobil app version 0.2.6 and prior  -->
      <div
        v-if="!onRouteData"
        :class="[
          {
            pulse:
              route.tripStarted &&
              duration.value <= 322 &&
              duration.value >= 60,
          },
        ]"
      >
        <!-- v-if="route.tripStarted && duration.value > 322" -->
        <span v-if="route.tripStarted" class="subtitle-2 success--text">{{
          $t('onRoute')
        }}</span>

        <!-- <span
          v-else-if="
            route.tripStarted && duration.value <= 322 && duration.value >= 60
          "
          class="arriving | subtitle-2 error--text"
        >
          {{ $t('arriving') }}
        </span> -->

        <span
          v-else-if="
            route.arrivedAt || (duration.value && duration.value <= 60)
          "
          class="subtitle-2 success--text"
        >
          {{ $t('arrivedAt') }}
        </span>

        <span v-else class="subtitle-2 orange--text"
          >{{ $t('notStarted') }}
        </span>
        <span v-if="route.arrivedAt" class="subtitle-2 success--text mr-2">
          {{ $t('stop') }} {{ route.stopNum }}
        </span>
        <span
          v-else-if="
            route.stopNum && duration.value <= 322 && duration.value >= 60
          "
          class="subtitle-2 error--text"
          >{{ $t('stop') }} {{ route.stopNum }}
        </span>
      </div>
      <div v-else>
        <div
          :class="[
            {
              pulse: onRouteData?.isOnRoute,
            },
          ]"
        >
          <span
            v-if="onRouteData?.isOnRoute"
            class="subtitle-2 success--text"
            >{{ $t('onRoute') + ' to Stop ' + onRouteData.stopNum }}</span
          >

          <span
            v-else-if="onRouteData?.arrived"
            class="subtitle-2 success--text"
          >
            {{ $t('arrivedAt') + ' Stop ' + onRouteData.stopNum }}
          </span>
          <span
            v-else-if="onRouteData?.cancelled"
            class="subtitle-2 success--text"
          >
            {{ 'Trip to Stop ' + onRouteData.stopNum + ' was cancelled' }}
          </span>

          <span v-else class="subtitle-2 orange--text"
            >{{ $t('notStarted') }}
          </span>
        </div>
        <div class="text--xsmall text--secondary">
          <span v-if="onRouteData && onRouteData.isOnRoute">{{
            `${$formatDate(new Date(onRouteData.startedAt.seconds * 1000), {
              onlyTime: true,
            })}`
          }}</span>
          <!-- <span v-if="onRouteData && onRouteData.isOnRoute">{{
            `${$formatDate(onRouteData.startedAt, {
              onlyTime: true,
            })}`
          }}</span> -->
          <span v-else-if="onRouteData && onRouteData.arrived">{{
            `${$formatDate(new Date(onRouteData.arrivedAt.seconds * 1000), {
              onlyTime: true,
            })}`
          }}</span>
          <span
            v-else-if="
              onRouteData && onRouteData.cancelled && onRouteData.arrivedAt
            "
            >{{
              `${$formatDate(new Date(onRouteData.arrivedAt.seconds * 1000), {
                onlyTime: true,
              })}`
            }}</span
          >
        </div>
      </div>

      <!-- <v-spacer></v-spacer>

      <span v-if="route.tripStarted" class="mi-and-mins | ml-4 mr-4">
        {{ distance.text }} -
        {{ duration.text }}
      </span> -->
      <v-spacer></v-spacer>
      <v-menu
        v-if="
          route.assignedTo !== 'undefined' &&
          JSON.stringify(route.assignedTo) !== '{}' &&
          route.tripStarted
        "
        offset-y
        min-width="400px"
        nudge-bottom="10"
        transition="slide-y-transition"
        :close-on-content-click="false"
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                class="btn-map"
                icon
                dark
                small
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
              >
                <v-icon size="18">mdi-map-outline</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('mapView') }}</span>
          </v-tooltip>
        </template>

        <v-list>
          <div
            v-if="
              route.leadLocation &&
              route.leadLocation.lat &&
              route.leadLocation.lng
            "
            class="d-flex flex-column"
          >
            <CalculateDistanceAndTime :route="route" :google="google" />

            <GoogleMap
              class="map ma-2 mb-0"
              :latitude="route.leadLocation.lat"
              :longitude="route.leadLocation.lng"
              :title="'asignado'"
              :icon-marker="iconMarker"
            />
            <div class="pa-2 text-subtitle-2 text-right">
              <span class="info--text font-weight-medium">Updated at: </span>
              <span class="text--secondary">{{
                $formatDate(route.leadLocation.timestamp, { time: true })
              }}</span>
            </div>
          </div>
        </v-list>
      </v-menu>
      <v-menu offset-y nudge-bottom="10" transition="slide-y-transition">
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                class="btn-map"
                icon
                dark
                small
                :disabled="!onRouteData"
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
              >
                <v-icon size="18">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <span>Lead location actions</span>
          </v-tooltip>
        </template>
        <v-list dense>
          <v-list-item
            :disabled="!onRouteData?.isOnRoute"
            @click="handleSetArrived"
          >
            <v-list-item-title>Set Arrived</v-list-item-title>
          </v-list-item>
          <v-list-item
            :disabled="!onRouteData?.isOnRoute"
            @click="handleSetCancelled"
          >
            <v-list-item-title>Set Cancelled</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
import { getGoogleMapsAPI } from 'gmap-vue'
import GoogleMap from '../../../misc/GoogleMap.vue'
import CalculateDistanceAndTime from './CalculateDistanceAndTime.vue'
export default {
  name: 'LeadLocation',
  components: { GoogleMap, CalculateDistanceAndTime },
  props: {
    route: { type: Object, required: true },
  },
  data() {
    return {
      distance: { text: '', value: 0 },
      duration: { text: '', value: 0 },
      leadLocationUnsubscriber: null,
    }
  },
  computed: {
    google: getGoogleMapsAPI,

    stopToGo() {
      return this.route.stopNum
    },
    onRouteR() {
      return this.route.onRouteR
    },
    onRouteData() {
      if (!this.onRouteR) {
        return null
      }
      let res = null
      let isOnRoute = false
      for (const key in this.onRouteR) {
        if (
          this.onRouteR[key].started &&
          !this.onRouteR[key].cancelled &&
          !this.onRouteR[key].arrived
        ) {
          isOnRoute = true
          res = { ...this.onRouteR[key], isOnRoute, stopNum: key }
          break
        }
      }
      if (!res) {
        const cancelledOrdered = Object.keys(this.onRouteR)
          .filter((key) => this.onRouteR[key].cancelled)
          .map((key) => {
            const cancelledAtTimestamp =
              this.onRouteR[key]?.cancelledAt &&
              typeof this.onRouteR[key].cancelledAt.toDate === 'function'
                ? this.onRouteR[key].cancelledAt.toDate().getTime()
                : null
            return {
              ...this.onRouteR[key],
              stopNum: key,
              cancelledAtTimestamp,
            }
          })
          .sort((a, b) => a.cancelledAtTimestamp - b.cancelledAtTimestamp)

        const lastCancelled = cancelledOrdered.length
          ? cancelledOrdered[cancelledOrdered.length - 1]
          : null

        const arrivedOrdered = Object.keys(this.onRouteR)
          .filter(
            (key) => this.onRouteR[key].arrived && this.onRouteR[key].arrivedAt
          )
          .map((key) => {
            const arrivedAtTimestamp =
              this.onRouteR[key]?.arrivedAt &&
              typeof this.onRouteR[key].arrivedAt.toDate === 'function'
                ? this.onRouteR[key].arrivedAt.toDate().getTime()
                : this.onRouteR[key].arrivedAt.seconds
                ? this.onRouteR[key].arrivedAt.seconds * 1000
                : null

            return {
              ...this.onRouteR[key],
              stopNum: key,
              arrivedAtTimestamp,
            }
          })
          .sort((a, b) => a.arrivedAtTimestamp - b.arrivedAtTimestamp)

        const lastArrived = arrivedOrdered.length
          ? arrivedOrdered[arrivedOrdered.length - 1]
          : null

        if (lastCancelled && lastArrived) {
          if (
            lastCancelled.cancelledAtTimestamp > lastArrived.arrivedAtTimestamp
          ) {
            res = {
              ...lastCancelled,
              cancelled: true,
              stopNum: lastCancelled.stopNum,
            }
          } else {
            res = {
              ...lastArrived,
              arrived: true,
              stopNum: lastArrived.stopNum,
            }
          }
        } else if (lastCancelled) {
          res = {
            ...lastCancelled,
            cancelled: true,
            stopNum: lastCancelled.stopNum,
          }
        } else if (lastArrived) {
          res = { ...lastArrived, arrived: true, stopNum: lastArrived.stopNum }
        }
      }

      return res
    },

    leadLocation() {
      return this.route.leadLocation
    },
    iconMarker() {
      return {
        path: 'M186.75,103.75A20.375,20.375,0,1,1,207.25,124,20.38,20.38,0,0,1,186.75,103.75Zm-150,0A20.221,20.221,0,0,1,57,83.25,20.375,20.375,0,1,1,57,124,20.166,20.166,0,0,1,36.75,103.75Zm226.5-.5a1.493,1.493,0,0,1-.586-.13l-.164.13H234.25c0-34.5-53.75-34.75-53.75,0h-97c0-34.75-54-35-54,0H2a1.972,1.972,0,0,1-2-2v-10a1.84,1.84,0,0,1,2-2H4.25V56S5,51,6,50.25C6.75,49.5,11.25,48,11.25,48L36,39.5,59,5s8.5-3.5,12.25-4C74.75.25,88.5,0,88.5,0H267a3.747,3.747,0,0,1,4,3.75l3.75,38v47.5h2.5a1.783,1.783,0,0,1,1.75,2v10a1.932,1.932,0,0,1-1.75,2Zm-152-92.5v29c0,1,.5,1.75,1.5,1.75h147a1.932,1.932,0,0,0,1.75-2L257.25,10.75A1.878,1.878,0,0,0,255.5,9H112.75C111.75,9,111.25,9.75,111.25,10.75ZM43,37l-.25,3.75,43.5-1.5a2.4,2.4,0,0,0,2-2.25V10.5c0-1-1.5-1.75-2.5-1.75h-23Z',
        fillColor: 'red',
        fillOpacity: 0.8,
        strokeWeight: 0,
        rotation: 0,
        scale: 0.15,
        anchor: this.google ? new this.google.maps.Point(140, 62) : null,
      }
    },
  },

  methods: {
    handleSetCancelled() {
      try {
        this.loading = true
        this.$store.dispatch('oos/routes/set_routeCancelled', this.route)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error setting route cancelled', error)
        this.$mainAlertError('Error setting route cancelled')
      } finally {
        this.loading = false
      }
    },
    handleSetArrived() {
      try {
        this.loading = true
        this.$store.dispatch('oos/routes/set_routeArrived', this.route)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error setting route arrived', error)
        this.$mainAlertError('Error setting route arrived')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.mi-and-mins {
  margin-top: 3px;
  font-size: 0.7rem;
  font-weight: bold;
}
.pulse {
  animation-name: pulse;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
@keyframes pulse {
  0% {
    transform: scale(0.97);
  }
  70% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.97);
  }
}
</style>
