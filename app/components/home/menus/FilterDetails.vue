<template>
  <div class="container-filter-details">
    <v-menu
      v-model="showFilter"
      offset-y
      left
      nudge-bottom="20"
      transition="slide-y-transition"
      :close-on-content-click="false"
      :close-on-click="validate()"
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn text x-small v-bind="attrs" v-on="on">
          <span class="white--text"
            ><v-icon small> mdi-filter-outline </v-icon>
            {{ $t('filters') }}
          </span>
        </v-btn>
      </template>
      <div class="filter-details">
        <v-card class="elevation-0" max-width="880">
          <v-card-text class="text-center mr-8 ml-2">
            <v-form ref="formFilter" lazy-validation>
              <v-row dense>
                <v-col cols="12" md="3">
                  <v-checkbox
                    v-model="assigned"
                    dense
                    hide-details
                    :label="$t('assigned')"
                  >
                  </v-checkbox>
                </v-col>
                <v-col cols="12" md="3">
                  <v-checkbox
                    v-model="unassigned"
                    dense
                    hide-details
                    :label="$t('unassigned')"
                  >
                  </v-checkbox>
                </v-col>
                <v-col cols="12" md="3" class="">
                  <v-checkbox
                    v-model="archive"
                    :label="$t('archived')"
                    hide-details
                    dense
                  >
                  </v-checkbox>
                </v-col>

                <v-col
                  v-for="s in Object.keys(status)"
                  :key="s"
                  cols="12"
                  md="3"
                >
                  <v-checkbox
                    v-model="status[s]"
                    :label="$truncate(s, 20)"
                    dense
                    hide-details
                  >
                  </v-checkbox>
                </v-col>

                <!-- <v-col cols="12" md="2">
                  <v-checkbox v-model="inField" :label="$t('InField')" dense>
                  </v-checkbox>
                </v-col>
                <v-col cols="12" md="2">
                  <v-checkbox
                    v-model="readyOffice"
                    :label="$t('readyForOffice')"
                    dense
                  >
                  </v-checkbox>
                </v-col>
                <v-col cols="12" md="2">
                  <v-checkbox v-model="invoiced" :label="$t('invoiced')" dense>
                  </v-checkbox>
                </v-col>
                <v-col cols="12" md="2">
                  <v-checkbox v-model="inactive" :label="$t('inactive')" dense>
                  </v-checkbox>
                </v-col>
                <v-col cols="12" md="2" class="margin">
                  <v-checkbox v-model="closed" :label="$t('closed')" dense>
                  </v-checkbox>
                </v-col> -->
              </v-row>
              <v-row dense>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="address"
                    outlined
                    dense
                    hide-details="auto"
                    :label="$t('address')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-combobox
                    v-model="contractor"
                    outlined
                    dense
                    clearable
                    :items="contractorsFormatted"
                    :label="$t('contractor')"
                    hide-details="auto"
                  ></v-combobox>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="client"
                    :items="clientsList"
                    item-text="title"
                    item-value="title"
                    class="mr-4"
                    :label="$t('client')"
                    dense
                    clearable
                    outlined
                    hide-details="auto"
                  >
                  </v-select>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="city"
                    outlined
                    dense
                    hide-details="auto"
                    :label="$t('city')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-combobox
                    v-model="state"
                    outlined
                    :items="statesList"
                    dense
                    clearable
                    hide-details="auto"
                    :label="$t('state')"
                  ></v-combobox>
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field
                    v-model="zipCode"
                    outlined
                    dense
                    hide-details="auto"
                    :label="$t('zip')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="county"
                    class="mr-4"
                    outlined
                    dense
                    hide-details="auto"
                    :label="$t('county')"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="woNumber"
                    outlined
                    dense
                    label="WO #"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3"
                  ><v-text-field
                    v-model="customer"
                    outlined
                    dense
                    :label="$t('customer')"
                    hide-details="auto"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="3"
                  ><v-text-field
                    v-model="workType"
                    outlined
                    dense
                    :label="$t('workType')"
                    hide-details="auto"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="3"
                  ><v-combobox
                    v-model="category"
                    class="mr-4"
                    outlined
                    dense
                    clearable
                    :items="categoryOptions"
                    :label="$t('category')"
                    hide-details="auto"
                  ></v-combobox
                ></v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions class="d-flex justify-end pt-3 pb-5">
            <v-btn class="mr-4" color="error" outlined @click="cancel()">{{
              $t('cancel')
            }}</v-btn>
            <v-btn
              class="mr-4"
              color="secondary"
              :loading="loading"
              @click="handleSendFilters()"
              >{{ $t('save') }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </div>
    </v-menu>
    <v-snackbar v-model="snackbar" :timeout="timeout">
      {{ text }}
      <!-- eslint-disable-next-line -->
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          {{ $t('close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'FilterDetails',
  props: {
    filtersDefault: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      showFilter: false,
      closed: false,
      invoiced: false,
      readyOffice: false,
      assigned: false,
      archive: false,
      unassigned: false,
      inField: false,
      address: '',
      city: '',
      state: '',
      loading: false,
      customer: '',
      client: '',
      county: '',
      zipCode: '',
      workType: '',
      woNumber: '',
      category: '',
      contractorsList: [],
      contractor: null,
      inactive: false,
      statesList: [
        'AL',
        'AK',
        'AZ',
        'AR',
        'CA',
        'CO',
        'CT',
        'DE',
        'FL',
        'GA',
        'HI',
        'ID',
        'IL',
        'IN',
        'IA',
        'KS',
        'KY',
        'LA',
        'ME',
        'MD',
        'MA',
        'MI',
        'MN',
        'MS',
        'MO',
        'MT',
        'NE',
        'NV',
        'NH',
        'NJ',
        'NM',
        'NY',
        'NC',
        'ND',
        'OH',
        'OK',
        'OR',
        'PA',
        'RI',
        'SC',
        'SD',
        'TN',
        'TX',
        'UT',
        'VT',
        'VA',
        'WA',
        'WI',
        'WY',
        'WV',
      ],
      snackbar: false,
      text: this.$t('You must select at least one filter'),
      timeout: 2000,
      status: {},
      orderStatusList: [],
    }
  },
  computed: {
    ordersFilters() {
      return this.$store.state.auth.user.preferences.ordersFilters
    },
    clientsList() {
      return this.$store.state.clientsList
    },
    categoryOptions() {
      return this.$store.state.categoryOptions.map((option) => {
        return option.title
      })
    },
    contractorsFormatted() {
      return this.contractorsList.map((option) => {
        return { text: option.fullName, value: option.uid }
      })
    },

    statusFilter() {
      return Object.keys(this.status).filter((key) => this.status[key])
    },

    validateObjectFiltersBD() {
      if (!this.ordersFilters) {
        return true
      }
      let contador = 0
      const filters = Object.entries(this.ordersFilters)
      if (filters.length === 0) {
        return true
      }
      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i]
        const value = filter[1]
        if (value === '' || value === false || value === null) {
          contador++
        }
        if (Array.isArray(value) && value.length === 0) {
          contador++
        }
      }
      return filters.length === contador
    },
  },
  watch: {
    orderStatusList: {
      handler(val) {
        if (val.length > 0) {
          this.$nextTick(() => {
            this.initializeData('watcher orderStatusList')
          })
        }
      },
      deep: true,
    },
    ordersFilters: {
      handler(val) {
        if (val !== null) {
          this.initializeData('watcher ordersFilters')
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.initializeClientsList()
    this.initializeCategory()
    this.initializeContractorsList()
    this.initializeOrdersStatus()
    this.initializeData('mounted')
  },
  methods: {
    valiateNotEmptyFields() {
      let val = false
      const statusEmpty = Object.values(this.status).every(
        (element) => element === false
      )
      if (
        this.showFilter &&
        !this.woNumber &&
        !this.assigned &&
        !this.archive &&
        !this.unassigned &&
        !this.address &&
        !this.city &&
        !this.state &&
        !this.customer &&
        !this.client &&
        !this.county &&
        !this.zipCode &&
        !this.workType &&
        !this.category &&
        !this.contractor &&
        statusEmpty
      ) {
        val = true
      }
      return val
    },
    validate() {
      const newOrdersFilters = this.validateObjectFiltersBD
        ? this.filtersDefault
        : this.ordersFilters

      let validateContractor = true
      if (this.contractor && newOrdersFilters.contractor) {
        validateContractor =
          this.contractor.value === newOrdersFilters.contractor.uid
      }
      if (!this.contractor && newOrdersFilters.contractor) {
        validateContractor = false
      }
      if (this.contractor && !newOrdersFilters.contractor) {
        validateContractor = false
      }

      function validateStatus(status) {
        const selectedStatus = []
        for (const key in status) {
          if (status[key]) {
            selectedStatus.push(key)
          }
        }
        return (
          selectedStatus.length === newOrdersFilters.status.length &&
          selectedStatus.every((element) =>
            newOrdersFilters.status.includes(element)
          )
        )
      }

      return (
        newOrdersFilters.woNumber === this.woNumber &&
        newOrdersFilters.assigned === this.assigned &&
        newOrdersFilters.archive === this.archive &&
        newOrdersFilters.unassigned === this.unassigned &&
        newOrdersFilters.address === this.address &&
        newOrdersFilters.city === this.city &&
        newOrdersFilters.state === this.state &&
        newOrdersFilters.customer === this.customer &&
        newOrdersFilters.client === this.client &&
        newOrdersFilters.county === this.county &&
        newOrdersFilters.zip === this.zipCode &&
        newOrdersFilters.workType === this.workType &&
        newOrdersFilters.category === this.category &&
        validateContractor &&
        validateStatus(this.status)
      )
    },

    async initializeOrdersStatus() {
      if (this.orderStatusList.length > 0) {
        return
      }
      try {
        this.orderStatusList = await this.$store.dispatch(
          'get_orderStatusListActive'
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async initializeClientsList() {
      try {
        await this.$store.dispatch('get_clientsList')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async initializeCategory() {
      try {
        await this.$store.dispatch('get_categoryOptions')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async initializeContractorsList() {
      try {
        this.contractorsList = await this.$store.dispatch('get_contractors')
      } catch (error) {
        this.$mainAlertError(this.$t('oopsProblem'))
        // eslint-disable-next-line
        console.log('error: ', error)
      }
    },
    initializeData(from) {
      const newOrdersFilters = this.validateObjectFiltersBD
        ? this.filtersDefault
        : this.ordersFilters

      this.assigned = newOrdersFilters.assigned
        ? newOrdersFilters.assigned
        : false
      this.archive = newOrdersFilters.archive ? newOrdersFilters.archive : false
      this.unassigned = newOrdersFilters.unassigned
        ? newOrdersFilters.unassigned
        : false
      this.address = newOrdersFilters.address ? newOrdersFilters.address : ''
      this.city = newOrdersFilters.city ? newOrdersFilters.city : ''
      this.state = newOrdersFilters.state ? newOrdersFilters.state : ''
      this.customer = newOrdersFilters.customer ? newOrdersFilters.customer : ''
      this.client = newOrdersFilters.client ? newOrdersFilters.client : ''
      this.county = newOrdersFilters.county ? newOrdersFilters.county : ''
      this.zipCode = newOrdersFilters.zip ? newOrdersFilters.zip : ''
      this.workType = newOrdersFilters.workType ? newOrdersFilters.workType : ''
      this.woNumber = newOrdersFilters.woNumber ? newOrdersFilters.woNumber : ''
      this.category = newOrdersFilters.category ? newOrdersFilters.category : ''
      this.contractor = newOrdersFilters.contractor
        ? {
            text: newOrdersFilters.contractor.fullName,
            value: newOrdersFilters.contractor.uid,
          }
        : null

      if (this.orderStatusList.length > 0) {
        this.orderStatusList.forEach((status) => {
          this.status[status.title] = newOrdersFilters.status.includes(
            status.title
          )
        })
      }

      // this.inField = newOrdersFilters.status.includes('In Field')
      // this.readyOffice = newOrdersFilters.status.includes('Ready for office')
      // this.invoiced = newOrdersFilters.status.includes('Invoiced')
      // this.inactive = newOrdersFilters.status.includes('Inactive')
      // this.closed = newOrdersFilters.status.includes('Closed')
    },
    cancel() {
      this.showFilter = false
      this.initializeData()
    },
    async handleSendFilters() {
      if (this.valiateNotEmptyFields()) {
        this.handleSnackbar()
        return
      }
      if (this.validate()) {
        this.showFilter = false
        return
      }

      this.loading = true
      const status = []

      for (const key in this.status) {
        if (this.status[key]) {
          status.push(key)
        }
      }
      const objectToSend = {
        assigned: this.assigned,
        archive: this.archive,
        unassigned: this.unassigned,
        status,
        address: this.address,
        city: this.city,
        state: this.state,
        customer: this.customer,
        client: this.client,
        zip: this.zipCode,
        county: this.county,
        workType: this.workType,
        woNumber: this.woNumber,
        category: this.category,
        contractor: this.contractor
          ? { uid: this.contractor.value, fullName: this.contractor.text }
          : null,
      }
      try {
        await this.$store.dispatch('home/set_ordersFilters', objectToSend)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
        this.showFilter = false
      }
    },
    handleSnackbar() {
      this.snackbar = true
    },
  },
}
</script>
<style lang="scss" scoped>
.margin {
  margin-top: -2rem;
}
.margin-row {
  margin-top: -1.3rem;
}
</style>
