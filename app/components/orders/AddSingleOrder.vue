<template>
  <v-container class="add-single-order | h-100">
    <h2 class="my-2">{{ $t('addNewOrder') }}</h2>

    <v-form ref="newOrderForm" class="new-order-form | pb-8" @submit.prevent>
      <v-row>
        <v-col cols="12" md="12">
          <v-text-field
            v-model="newOrder.woNumber"
            outlined
            dense
            hide-details="auto"
            label="WO#"
            :rules="[rules.required, rules.noBlankSpace]"
            :error-messages="errorWONumberField"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="newOrder.address"
            outlined
            dense
            hide-details="auto"
            :label="$t('address')"
            :rules="[rules.required]"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="newOrder.city"
            outlined
            dense
            hide-details="auto"
            :label="$t('city')"
            :rules="[rules.required]"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="newOrder.county"
            outlined
            dense
            hide-details="auto"
            :label="$t('county')"
            :rules="[rules.required]"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="1">
          <v-text-field
            v-model="newOrder.state"
            outlined
            dense
            hide-details="auto"
            :label="$t('state')"
            :rules="[rules.required]"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="newOrder.zip"
            outlined
            dense
            hide-details="auto"
            :label="$t('zip')"
            :rules="[rules.required]"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <gmap-autocomplete
            class="introInput"
            :component-restrictions="componentRestrictions"
            @place_changed="setPlace"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:default="slotProps">
              <v-text-field
                ref="input"
                v-model="mapAddress"
                outlined
                prepend-inner-icon="mdi-map-marker"
                label="Address for Map"
                :placeholder="placeholder"
                :rules="[rules.required]"
                :error="mapAddressSelected === false"
                :append-icon="
                  mapAddressSelected
                    ? 'mdi-check-circle-outline'
                    : 'mdi-help-circle-outline'
                "
                @listeners="slotProps.listeners"
                @attrs="slotProps.attrs"
                @input="mapAddressSelected = null"
                @blur="handleMapAddressInputBlur"
              >
              </v-text-field>
            </template>
          </gmap-autocomplete>
          <div class="address-results">
            <ul>
              <li v-for="(result, i) in addressResults" :key="i">
                {{ result.description }}
              </li>
            </ul>
          </div>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="newOrder.client"
            :items="clientsList"
            item-text="title"
            item-value="title"
            :label="$t('client')"
            dense
            outlined
            :rules="[rules.required]"
            hide-details="auto"
          ></v-select>
          <!-- <v-text-field
            v-model="newOrder.client"
            outlined
            dense
            hide-details="auto"
            label="Client"
            :rules="[rules.required]"
          ></v-text-field> -->
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="newOrder.loanType"
            :items="loanTypeOptions"
            :label="$t('loanType')"
            dense
            outlined
            :rules="[rules.required]"
            hide-details="auto"
          ></v-select>
          <!-- <v-text-field
            v-model="newOrder.loanType"
            outlined
            dense
            hide-details="auto"
            label="Loan Type"
          ></v-text-field> -->
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="newOrder.customer"
            outlined
            dense
            hide-details="auto"
            :label="$t('customer')"
            :rules="[rules.required]"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="3">
          <v-menu
            ref="dateDueMenu"
            v-model="dateDueMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateDueFormatted"
                :label="$t('dateDue')"
                append-icon="mdi-calendar"
                readonly
                outlined
                dense
                hide-details="auto"
                :rules="[rules.required]"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="newOrder.dateDueStr"
              @input="dateDueMenu = false"
            >
            </v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="3">
          <v-menu
            ref="dateReceivedMenu"
            v-model="dateReceivedMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateReceivedFormatted"
                label="Received Date"
                append-icon="mdi-calendar"
                readonly
                outlined
                dense
                hide-details="auto"
                :rules="[rules.required]"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="newOrder.dateReceived"
              @input="dateReceivedMenu = false"
            >
            </v-date-picker>
          </v-menu>
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="newOrder.category"
            :items="categoryOptions"
            item-text="title"
            item-value="title"
            :label="$t('category')"
            dense
            outlined
            :rules="[rules.required]"
            hide-details="auto"
          ></v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="newOrder.workType"
            outlined
            dense
            hide-details="auto"
            :label="$t('workType')"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="newOrder.lockBox"
            outlined
            dense
            hide-details="auto"
            :label="$t('lockbox')"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="newOrder.keyCode"
            outlined
            dense
            hide-details="auto"
            :label="$t('keyCode')"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="newOrder.vps"
            outlined
            dense
            hide-details="auto"
            label="VPS"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-file-input
            v-model="fohFile"
            label="Front of House Picture"
            outlined
            dense
            hide-details="auto"
            prepend-icon=""
            append-icon="mdi-file-image"
          ></v-file-input>
        </v-col>
      </v-row>

      <section class="my-16">
        <v-combobox
          v-model="aditionalInputs"
          :items="aditionalItems"
          item-text="text"
          item-value="value"
          multiple
          oulined
          dense
          chips
          label="Add field"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:selection="{ item, index }">
            <v-chip class="my-1">
              <span>{{ item.text }}</span>
              <v-icon
                class="ml-2"
                small
                @click.stop="removeAditionalInput(index)"
                >mdi-close</v-icon
              >
            </v-chip>
          </template>
        </v-combobox>

        <v-row v-if="aditionalInputs.length">
          <v-col
            v-for="item in aditionalInputs"
            :key="item.value"
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="newOrderAditionals[item.value]"
              :label="item.text"
              dense
              outlined
              :rules="[rules.required]"
              hide-details="auto"
            ></v-text-field>
          </v-col>
        </v-row>
      </section>
      <div class="d-flex justify-end">
        <v-switch v-model="archiveOrder" label="Archivar Esta Orden">
        </v-switch>
      </div>
      <section class="actions | d-flex justify-end">
        <v-btn color="error" class="mr-4" outlined @click="handleCancel">{{
          $t('cancel')
        }}</v-btn>
        <v-btn color="primary" class="mr-4" @click="handleSave">{{
          $t('save')
        }}</v-btn>
      </section>
    </v-form>
    <v-overlay v-if="loading">
      <v-progress-circular :value="20"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import { getGoogleMapsAPI } from 'gmap-vue'
import { mapState } from 'vuex'
export default {
  name: 'AddSingleOrder',
  data() {
    return {
      addressResults: [],
      componentRestrictions: {
        country: 'us',
      },
      loading: false,
      archiveOrder: false,
      fohFile: null,
      newOrder: {
        woNumber: '',
        dateDueStr: '',
        address: '',
        county: '',
        city: '',
        state: '',
        zip: '',
        category: '',
        lockBox: '',
        keyCode: '',
        vps: '',
        client: '',
        customer: '',
        loanType: '',
        workType: '',
        dateReceived: '',
      },
      placeholder: '',
      mapAddressSelected: null,
      mapAddress: '',
      newOrderAditionals: {},
      dateDueMenu: false,
      dateReceivedMenu: false,
      aditionalInputs: [],
      errorWONumberField: [],
      rules: {
        required: (v) => !!v || 'Required',
        noBlankSpace: (v) =>
          (!!v && v.split(' ').length <= 1) || 'No spaces allowed',
      },
    }
  },

  computed: {
    google: getGoogleMapsAPI,

    dateDueFormatted() {
      return this.formatDate(this.newOrder.dateDueStr)
    },
    dateReceivedFormatted() {
      return this.formatDate(this.newOrder.dateReceived)
    },
    ...mapState({
      categoryOptions: (state) => state.categoryOptions,
      dummyOrder: (state) => state.orders.dummyOrder,
      clientsList: (state) => state.clientsList,
    }),
    loanTypeOptions() {
      if (this.newOrder.client && this.clientsList.length) {
        const client = this.clientsList.find(
          (client) => client.title === this.newOrder.client
        )
        return client.loanTypes
      }
      return []
    },
    // categoryOptions() {
    //   return this.$store.state.categoryOptions
    // },
    // dummyOrder() {
    //   return this.$store.state.orders.dummyOrder
    // },

    aditionalItems() {
      if (!this.dummyOrder) {
        return []
      }

      const itemsInNewOrder = Object.keys(this.newOrder)
      return Object.keys(this.dummyOrder)
        .filter((item) => {
          const noList = ['fohImg', 'id', 'propertyId', 'status']

          if (
            noList.includes(item) ||
            typeof this.dummyOrder[item] !== 'string'
          ) {
            return false
          }

          return !itemsInNewOrder.includes(item)
        })
        .map((item) => {
          const wordList = item.split(/(?=[A-Z])/)
          const [firstWordaRaw, ...restWordsRaw] = wordList

          const firstWord =
            firstWordaRaw.charAt(0).toUpperCase() + firstWordaRaw.slice(1)

          const restWords = restWordsRaw.length ? restWordsRaw.join(' ') : ''

          return {
            text: firstWord + ' ' + restWords,
            value: item,
          }
        })
    },
  },
  watch: {
    newOrder: {
      handler(val, oldVal) {
        // let oldAddress, oldCity, oldCounty, oldState, oldZip
        //  let address, city, county, state, zip
        const { address, city, county, state, zip, woNumber } = val

        if (
          (!oldVal && woNumber) ||
          (woNumber && woNumber !== oldVal.woNumber)
        ) {
          this.debouncedWoNumberCheck(woNumber)
        }

        if (!address || !city || !state || !zip) {
          return
        }
        const fullAddres = `${address}, ${city}${
          county ? ', ' + county : ''
        }, ${state} ${zip}`

        if (!oldVal) {
          // const input = this.$refs.input
          // input.$el.value = fullAddres
          this.mapAddress = fullAddres
          this.mapAddressSelected = false
          // this.debounceCheckAddress()
          return
        }

        const { oldAddress, oldCity, oldCounty, oldState, oldZip } = oldVal

        const fullOldAddres = `${oldAddress}, ${oldCity}${
          oldCounty ? ', ' + oldCounty : ''
        }, ${oldState} ${oldZip}`

        if (fullAddres !== fullOldAddres) {
          // const input = this.$refs.input
          // input.$el.value = fullAddres
          this.mapAddress = fullAddres
          this.mapAddressSelected = false
          // this.debounceCheckAddress()
        }
      },
      deep: true,
    },
  },

  created() {
    this.debouncedWoNumberCheck = this._.debounce(this.validateWONumber, 300)
    this.debounceCheckAddress = this._.debounce(this.checkAddress, 300)
  },

  async mounted() {
    await this.$gmapApiPromiseLazy()
    await this.initialize()
    this.placeholder = ''
  },
  methods: {
    async initialize() {
      try {
        this.loading = true

        const _categoryOptionsInStore = this.$store.dispatch(
          'get_categoryOptions'
        )
        const _clientsListInStore = this.$store.dispatch('get_clientsList')

        await Promise.all([_clientsListInStore, _categoryOptionsInStore])
      } catch (error) {
        // eslint-disable-next-line
        console.log('Error initializing component', error)
        this.$store.commit(
          'mainAlert/set_alert_error',
          `Error initializing component', ${error}`
        )
      } finally {
        this.loading = false
      }
    },
    handleMapAddressInputBlur() {
      if (!this.mapAddress || this.mapAddressSelected === null) {
        this.mapAddressSelected = false
      }
    },
    checkAddress() {
      this.addressResults = []
      const service = new this.google.maps.places.AutocompleteService()

      const { address, city, county, state, zip } = this.newOrder

      const fullAddres = `${address}, ${city}${
        county ? ', ' + county : ''
      }, ${state} ${zip}`

      service.getPlacePredictions({ input: fullAddres }, (results, status) => {
        // eslint-disable-next-line
        console.log('status', status)
        if (status === this.google.maps.places.PlacesServiceStatus.OK) {
          this.addressResults = results
        }
      })
    },
    async validateWONumber(v) {
      const res = await this.$store.dispatch('orders/woNumberNotExists', v)

      this.errorWONumberField = res ? [] : 'this WO# is in allready in use'
    },

    setPlace(e) {
      this.mapAddress = e.formatted_address
      this.mapAddressSelected = true

      //   const county = e.address_components.filter(
      //     (component) =>
      //       component.types.includes('administrative_area_level_2') &&
      //       component.types.includes('political')
      //   )
      //   const state = e.address_components.filter(
      //     (component) =>
      //       component.types.includes('administrative_area_level_1') &&
      //       component.types.includes('political')
      //   )
      //   const zip = e.address_components.filter((component) =>
      //     component.types.includes('postal_code')
      //   )
      //   const locality = e.address_components.filter(
      //     (component) =>
      //       component.types.includes('locality') &&
      //       component.types.includes('political')
      //   )
      //   const route = e.address_components.filter((component) =>
      //     component.types.includes('route')
      //   )
      //   const street = e.address_components.filter((component) =>
      //     component.types.includes('street_number')
      //   )

      //   const address = `${street && street.length ? street[0].short_name : ''} ${
      //     route && route.length ? route[0].short_name : ''
      //   }`

      //   const input = this.$refs.input
      //   input.reset()

      //   this.newOrder.address = address
      //   this.newOrder.city =
      //     locality && locality.length ? locality[0].short_name : ''
      //   this.newOrder.state = state && state.length ? state[0].short_name : ''
      //   this.newOrder.zip = zip && zip.length ? zip[0].short_name : ''
      //   this.newOrder.county =
      //     county && county.length
      //       ? county[0].short_name.replace('County', '')
      //       : ''
    },
    formatDate(date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
    },
    removeAditionalInput(index) {
      this.aditionalInputs.splice(index, 1)
    },

    handleCancel() {
      this.$refs.newOrderForm.reset()
    },
    async handleSave() {
      if (!this.$refs.newOrderForm.validate()) {
        return
      }
      try {
        this.loading = true

        const dummyOrder = this._.cloneDeep(this.dummyOrder)

        const newOrder = this._.merge(
          dummyOrder,
          this.newOrder,
          this.newOrderAditionals
        )

        await this.$store.dispatch('orders/add_order', {
          newOrder,
          fohFile: this.fohFile,
          archiveOrder: this.archiveOrder,
        })
        this.$refs.newOrderForm.reset()
      } catch (error) {
        // eslint-disable-next-line
        console.log('error saving new order', error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.add-single-order {
  // overflow-y: auto;
}
</style>
