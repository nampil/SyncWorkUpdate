<template>
  <div>
    <v-menu
      v-model="showFilter"
      offset-y
      left
      nudge-bottom="10"
      transition="slide-y-transition"
      :close-on-content-click="false"
    >
      <v-spacer></v-spacer>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="ma-2 elevation-0"
          x-small
          color="secondary"
          v-bind="attrs"
          v-on="on"
        >
          <span class="white--text"
            ><v-icon small> mdi-filter-outline </v-icon>
            {{ $t('filters') }}
          </span>
        </v-btn>
      </template>
      <div class="filter-details">
        <v-card class="elevation-0" max-width="700" min-width="700">
          <v-card-text class="text-center">
            <v-form ref="formFilter" lazy-validation>
              <v-row>
                <v-col cols="4" md="4">
                  <v-select
                    v-model="filter"
                    class="select-filter | mt-2"
                    label="Invoice Date"
                    :items="filterOptions"
                    dense
                    color="primary"
                    hide-details="auto"
                    outlined
                  ></v-select>

                  <span v-if="dates.length" class="text-dates"
                    >{{ datesFormatted[0] }}
                    <v-icon>mdi-arrow-right-thin</v-icon>
                    {{ datesFormatted[1] }}
                    <v-btn icon x-small @click="handleEditDate"
                      ><v-icon x-small color="primary"
                        >mdi-pencil</v-icon
                      ></v-btn
                    >
                  </span>
                  <v-dialog
                    v-model="showSelectRange"
                    width="290px"
                    transition="dialog-transition"
                    persistent
                  >
                    <v-card>
                      <v-date-picker
                        v-model="datesPicker"
                        range
                        scrollable
                        :min="validateMindatesPicker"
                        :max="$formatDate(new Date(), { iso: true })"
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          x-small
                          class="mr-1"
                          color="error"
                          outlined
                          @click="handleCancelDate()"
                          >cancel</v-btn
                        ><v-btn
                          x-small
                          class="mr-1"
                          color="primary"
                          @click="handleOkDate(datesPicker)"
                          >Ok</v-btn
                        >
                      </v-date-picker>
                    </v-card>
                  </v-dialog>

                  <!-- <v-text-field
                      label="Invoice #"
                      class="mt-3"
                      outlined
                      dense
                    ></v-text-field> -->

                  <v-select
                    v-model="clientsSelected"
                    :label="$t('clients')"
                    :items="clientsList"
                    item-text="title"
                    item-value="title"
                    class="mt-3"
                    outlined
                    multiple
                    clearable
                    hide-details="auto"
                    dense
                  ></v-select>

                  <v-select
                    v-model="customersSelected"
                    :label="$t('customers')"
                    class="mt-3"
                    :items="customersList"
                    item-text="title"
                    item-value="title"
                    outlined
                    multiple
                    clearable
                    hide-details="auto"
                    dense
                  ></v-select>

                  <!-- <v-select
                        :label="$t('category')"
                        class="mt-3"
                        outlined
                        multiple
                        clearable
                        hide-details="auto"
                        dense
                      ></v-select> -->

                  <v-select
                    v-model="contractorsSelected"
                    :items="contractorsList"
                    :label="$t('contractors')"
                    class="mt-3"
                    item-text="fullName"
                    item-value="uid"
                    outlined
                    multiple
                    clearable
                    hide-details="auto"
                    dense
                  ></v-select>

                  <v-select
                    v-model="processorsSelected"
                    :items="processorsList"
                    :label="$t('processors')"
                    class="mt-3"
                    outlined
                    item-text="fullName"
                    item-value="fullName"
                    multiple
                    clearable
                    hide-details="auto"
                    dense
                  ></v-select>

                  <v-select
                    v-model="statesSelected"
                    :items="statesList"
                    :label="$t('states')"
                    class="mt-3"
                    outlined
                    multiple
                    clearable
                    hide-details="auto"
                    dense
                  ></v-select>
                </v-col>
                <v-spacer></v-spacer>

                <v-col cols="4" md="4">
                  <span class="text-subtitle-1 d-flex justify-start info--text">
                    Date Type
                  </span>
                  <v-radio-group
                    v-model="typeSelected"
                    dense
                    hide-details="auto"
                    class="mt-1"
                  >
                    <v-radio
                      v-for="type in types"
                      :key="type"
                      :label="type"
                      :value="type"
                      @click="handleTypeSelected(typeSelected)"
                    ></v-radio>
                  </v-radio-group>

                  <span
                    class="text-subtitle-1 d-flex justify-start mt-5 info--text"
                  >
                    Status</span
                  >
                  <v-checkbox
                    v-model="readyForOffice"
                    label="Ready for Office"
                    dense
                    hide-details="auto"
                  >
                  </v-checkbox>
                </v-col>

                <v-spacer></v-spacer>
                <v-col cols="3" md="3">
                  <span class="text-subtitle-1 d-flex justify-start info--text">
                    Group By</span
                  >

                  <v-radio-group
                    v-model="groupSelected"
                    dense
                    hide-details="auto"
                    class="mt-1"
                  >
                    <v-radio
                      v-for="group in groups"
                      :key="group"
                      :label="group"
                      :value="group"
                      @click="handleGroupSelected(groupSelected)"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions class="d-flex justify-end pt-3 mb-1">
            <v-btn
              class="mr-1"
              small
              color="error"
              outlined
              @click="cancel()"
              >{{ $t('cancel') }}</v-btn
            >
            <v-btn
              class="mr-1"
              color="secondary"
              :loading="loading"
              small
              @click="handleSendFilters()"
              >{{ $t('save') }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </div>
    </v-menu>
  </div>
</template>

<script>
export default {
  props: { loading: { type: Boolean, default: false } },
  data() {
    return {
      showFilter: false,
      filter: '',
      filterOptions: [
        {
          text: 'Last 7 days',
          value: 'default',
        },
        { text: 'Last 30 days', value: 'month' },
        { text: 'Last 60 days', value: 'sixtyDays' },
        { text: 'Last 90 days', value: 'ninetyDays' },
        {
          text: 'Select Range',
          value: 'range',
        },
      ],
      showSelectRange: false,
      dates: [],
      datesPicker: [],
      fromDate: '',
      toDate: '',
      clientGroup: false,
      processorGroup: false,
      contractorsGroup: false,
      statesSelected: [],
      clientsSelected: [],
      customersSelected: [],
      invoiceCreated: true,
      invoiceCompleted: false,
      invoiceSenttoClient: false,
      statesList: [
        'Carabobo',
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
      range: true,
      contractorsSelected: [],
      processorsSelected: [],
      readyForOffice: false,
      types: ['Invoice Created', 'Invoice Completed', 'Invoice Sent to Client'],
      typeSelected: 'Invoice Created',
      groups: ['Client', 'Processor', 'Contractor'],
      groupSelected: '',
    }
  },
  computed: {
    clientsList() {
      return this.$store.state.clientsList
    },
    customersList() {
      return this.$store.state.customersList
    },
    contractorsList() {
      return this.$store.state.contractorsList
    },
    processorsList() {
      return this.$store.state.processorsList
    },
    datesFormatted() {
      const [year, month, day] = this.dates[0]?.split('-')
      const [year1, month1, day1] = this.dates[1]?.split('-')
      return [`${month}/${day}/${year}`, `${month1}/${day1}/${year1}`]
    },
    validateMindatesPicker() {
      const min = new Date('04/05/2024')
      if (!this.showSelectRange) {
        return
      }

      if (this.datesPicker[0]) {
        return this.datesPicker[0]
      }

      const minDate = new Date(new Date().setDate(new Date().getDate() - 90))

      if (min.getTime() >= minDate.getTime()) {
        return this.$formatDate(min, {
          iso: true,
        })
      }

      return this.$formatDate(minDate, {
        iso: true,
      })
    },
  },
  watch: {
    filter(val) {
      if (val === 'range') {
        this.showSelectRange = true
      }
      if (val === 'default') {
        this.fromDate = new Date(new Date().setDate(new Date().getDate() - 7))
      }
      if (val === 'month') {
        this.fromDate = new Date(new Date().setDate(new Date().getDate() - 30))
      }
      if (val === 'sixtyDays') {
        this.fromDate = new Date(new Date().setDate(new Date().getDate() - 60))
      }
      if (val === 'ninetyDays') {
        this.fromDate = new Date(new Date().setDate(new Date().getDate() - 90))
      }

      if (val !== 'range') {
        this.dates = []
        this.showSelectRange = false
      }
      this.toDate = ''
      this.range = true
    },
    dates(val) {
      if (val && !val[1]) {
        return
      }
      const _fromDate = val[0]
      const [fromY, fromM, fromD] = _fromDate.split('-')
      this.fromDate = new Date(Number(fromY), Number(fromM) - 1, Number(fromD))
      const _toDate = val[1]
      const [toY, toM, toD] = _toDate.split('-')
      this.toDate = new Date(Number(toY), Number(toM) - 1, Number(toD))
      this.range = true
    },
  },
  mounted() {
    this.filter = 'default'
    if (!this.clientsList.length) {
      this.get_clientsList()
    }
    if (!this.customersList.length) {
      this.get_customersList()
    }
    if (!this.contractorsList.length) {
      this.get_contractorsList()
    }
    if (!this.processorsList.length) {
      this.get_processorsList()
    }
  },

  methods: {
    cancel() {
      this.showFilter = false
    },
    handleTypeSelected(type) {
      this.range = true
      this.invoiceCreated = type === 'Invoice Created'
      this.invoiceCompleted = type === 'Invoice Completed'
      this.invoiceSenttoClient = type === 'Invoice Sent to Client'
    },
    handleGroupSelected(group) {
      this.processorGroup = group === 'Processor'
      this.clientGroup = group === 'Client'
      this.contractorsGroup = group === 'Contractor'
    },
    async get_clientsList() {
      try {
        await this.$store.dispatch('get_clientsList')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async get_customersList() {
      try {
        await this.$store.dispatch('get_customersList')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async get_contractorsList() {
      try {
        await this.$store.dispatch('get_contractors')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async get_processorsList() {
      try {
        await this.$store.dispatch('get_processors')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    handleOkDate(dates) {
      this.dates = dates
      this.showSelectRange = false
      this.datesPicker = []
    },
    handleCancelDate() {
      this.datesPicker = []
      this.showSelectRange = false
      this.filter = 'default'
    },
    handleEditDate() {
      this.showSelectRange = true
    },
    handleSendFilters() {
      if (!this.$refs.formFilter.validate()) {
        return
      }
      this.$emit('handle-send-filters', {
        fromDate: this.fromDate,
        toDate: this.toDate,
        statesSelected: this.statesSelected,
        invoiceCreated: this.invoiceCreated,
        invoiceCompleted: this.invoiceCompleted,
        invoiceSenttoClient: this.invoiceSenttoClient,
        clientsSelected: this.clientsSelected,
        customersSelected: this.customersSelected,
        range: this.range,
        clientGroup: this.clientGroup,
        processorGroup: this.processorGroup,
        contractorsGroup: this.contractorsGroup,
        contractorsSelected: this.contractorsSelected,
        processorsSelected: this.processorsSelected,
        readyForOffice: this.readyForOffice,
      })

      this.range = false
      this.showFilter = false
    },
  },
}
</script>

<style lang="scss" scoped>
.select-filter {
  max-width: 220px;
}
.text-dates {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
