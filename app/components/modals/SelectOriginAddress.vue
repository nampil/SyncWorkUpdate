<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card class="elevation-0">
      <v-toolbar color="secondary" dense>
        <v-btn text icon @click="handleCancel(true)">
          <v-icon>mdi-close</v-icon></v-btn
        >
        <v-toolbar-title class="d-flex aling-center">
          Select Address</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn text @click="handleSave">{{ $t('save') }}</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="pt-4">
        <p v-if="route.originAddress">
          <span class="info--text">Origin Address:</span>
          {{ route.originAddress }}
        </p>
        <v-form @submit.prevent>
          <gmap-autocomplete
            class="introInput"
            :value="origin.address"
            :options="options"
            :select-first-on-enter="true"
            @place_changed="setOrigin"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:default="slotProps">
              <v-text-field
                ref="input"
                v-model="mapAddress"
                outlined
                prepend-inner-icon="mdi-map-marker-outline"
                placeholder="New origin address"
                dense
                v-on:listeners="slotProps.listeners"
                v-on:attrs="slotProps.attrs"
              >
              </v-text-field>
            </template>
          </gmap-autocomplete>
        </v-form>
      </v-card-text>
      <!-- <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" outlined @click="handleCancel(true)">Cancel</v-btn>
        <v-btn color="primary" @click="handleSave">Save</v-btn>
      </v-card-actions> -->
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'SelectOriginAddress',
  props: {
    homeLocation: { type: Object, default: () => ({}) },
    show: { type: Boolean, defaul: false },
    google: { type: [Boolean, Object], default: false },
    route: { type: Object, required: true },
  },
  data() {
    return {
      dialog: false,
      origin: {
        location: null,
        address: '',
      },
      mapAddress: '',
      options: {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry', 'icon', 'name'],
        strictBounds: false,
      },
    }
  },
  watch: {
    show(val) {
      this.dialog = val
    },

    dialog(val) {
      if (!val && this.show) {
        this.handleCancel(true)
      }
    },
    route: {
      handler(newVal, oldVal) {
        if (newVal.originAddress !== oldVal?.originAddress) {
          this.origin = {
            location: { ...newVal.originLocation },
            address: newVal.originAddress,
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    setOrigin(event) {
      const lat = event.geometry?.location.lat()
      const lng = event.geometry?.location.lng()

      this.origin = {
        location:
          lat && lng
            ? {
                lat,
                lng,
              }
            : null,
        address: event.formatted_address,
      }
      this.$emit('new-address-preselected', this.origin)
    },
    handleCancel(reset) {
      this.origin = {
        location: null,
        address: '',
      }
      this.$refs.input.reset()
      this.$emit('close', reset)
    },
    handleSave() {
      this.$emit('save-origin-address', this.origin)
      this.$nextTick(() => {
        this.handleCancel()
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
