<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t('assignContractor') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="8">
              <v-autocomplete
                v-model="contractorsSelected"
                :items="contractorsListFiltered"
                :label="$t('contractor')"
                dense
                outlined
                multiple
                hide-selected
              ></v-autocomplete>
            </v-col>
            <v-col cols="4">
              <v-btn color="primary" @click="addContractorToList">{{
                $t('addContractor')
              }}</v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div
                :class="[
                  'assignedTo-box',
                  { 'show-content': localOrder.assigned },
                ]"
              >
                <div class="grid mb-4">
                  <div class="header contractor-name">
                    <div class="text-h6">{{ $t('contractor') }}</div>
                  </div>
                  <div class="header">
                    <div v-if="inRoute" class="text-h6 text-center">
                      {{ $t('lead') }}
                    </div>
                  </div>
                </div>
                <div
                  v-for="item in contractorsInOrders"
                  :key="item.uid"
                  class="grid grid-row"
                >
                  <div class="contractor-name">{{ item.fullName }}</div>
                  <div v-if="inRoute" class="contractor-lead-btn">
                    <v-radio-group v-model="lead" dense hide-details>
                      <v-radio :value="item"></v-radio>
                    </v-radio-group>
                  </div>

                  <v-btn
                    small
                    icon
                    :disabled="
                      !contractorsInOrders.length || (inRoute && !lead.fullName)
                    "
                    class="contractor-closeBtn"
                    @click="handleRemoveContractor(item)"
                  >
                    <v-btn icon small>
                      <v-icon small color="red">mdi-close</v-icon>
                    </v-btn>
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="mr-2 mb-2" outlined color="error" @click="handleClose"
          >{{ $t('close') }}
        </v-btn>
        <v-btn
          class="mb-2 mr-2"
          color="secondary"
          :loading="loading"
          @click="handleSave"
        >
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AssignOrderModal',
  props: {
    show: { type: Boolean, default: false },
    order: { type: Object, default: () => ({}) },
    orders: { type: Array, default: () => [] },
    inRoute: { type: Boolean, default: false },
    routeLead: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      dialog: false,
      loading: false,
      contractorsList: [],
      contractors: [],
      contractorsSelected: [],
      localOrder: {},
      localOrders: [],
      lead: {},
    }
  },

  computed: {
    contractorsInOrders() {
      let contractorsInOrder = []

      if (this.inRoute && this.localOrders.length) {
        let _contractors = []
        this.localOrders.forEach((order) => {
          _contractors = _contractors.concat(order.contractors)
        })

        contractorsInOrder = [..._contractors]
      } else if (
        this.localOrder.contractors &&
        this.localOrder.contractors.length
      ) {
        contractorsInOrder = this.localOrder.contractors
      }

      const contractorIds = contractorsInOrder.map((c) => c.uid)
      const uniqs = this._.uniqWith(contractorIds, this._.isEqual)

      return uniqs.map((uid) => {
        const index = contractorsInOrder.map((c) => c.uid).indexOf(uid)
        return contractorsInOrder[index]
      })
    },
    contractorsListFiltered() {
      if (
        (!this.localOrder || !this.localOrder.contractors) &&
        !this.localOrders.length
      ) {
        return []
      }

      const _contractors = this.contractorsList.filter((c) => {
        return !this.contractorsInOrders.map((c) => c.fullName).includes(c.text)
      })

      return _contractors
    },
  },

  watch: {
    show(val) {
      if (val && !this.contractorsListFiltered.length) {
        this.setInitialState()
      }
      this.dialog = val
    },
    order(val) {
      this.localOrder = JSON.parse(JSON.stringify(val))
    },
    orders(val) {
      this.localOrders = JSON.parse(JSON.stringify(val))
    },
  },
  mounted() {
    this.setInitialState()
  },
  methods: {
    async setInitialState() {
      if (this.order && this.order.id) {
        this.localOrder = JSON.parse(JSON.stringify(this.order))
      }
      if (this.orders && this.orders.length) {
        this.localOrders = JSON.parse(JSON.stringify(this.orders))
      }
      if (this.routeLead && this.routeLead.uid) {
        this.lead = this.routeLead
      }
      try {
        this.loading = true
        const _contractorList = await this.$store.dispatch('get_contractors')
        this.contractorsList = _contractorList.map((c) => ({
          value: c,
          text: c.fullName,
        }))
        this.loading = false
      } catch (error) {
        this.$mainAlertError(this.$t('oopsProblem'))
        // eslint-disable-next-line
        console.log('error: ', error)
      }
    },
    handleClose() {
      this.contractors = []
      this.contractorsSelected = []
      this.localOrder = {}
      this.localOrders = []
      this.lead = {}

      this.$emit('close')
    },
    addContractorToList() {
      if (this.inRoute) {
        this.localOrders.forEach((order) => {
          order.contractors = [
            ...order.contractors,
            ...this.contractorsSelected,
          ]
        })
      } else {
        this.localOrder.contractors = [
          ...this.localOrder.contractors,
          ...this.contractorsSelected,
        ]
      }

      this.contractorsSelected = []
    },
    handleRemoveContractor(contractor) {
      if (this.inRoute) {
        for (let i = 0; i < this.localOrders.length; i++) {
          const order = this.localOrders[i]
          const index = order.contractors
            .map((c) => c.uid)
            .indexOf(contractor.uid)
          if (index > -1) {
            order.contractors.splice(index, 1)
          }
        }
      } else {
        const index = this.localOrder.contractors
          .map((c) => c.uid)
          .indexOf(contractor.uid)
        this.localOrder.contractors.splice(index, 1)
      }
    },
    async handleSave() {
      try {
        this.loading = true

        if (this.inRoute) {
          for (let i = 0; i < this.localOrders.length; i++) {
            const order = this.localOrders[i]

            const objectToSend = {
              contractorsUids: this.contractorsInOrders.map(
                (contractor) => contractor.uid
              ),
              contractors: this.contractorsInOrders,
              assigned: order.contractors.length > 0,
            }

            await this.$store.dispatch('order/update_order', {
              orderId: order.id,
              objectToSend,
            })

            this.$emit('update-orders', this.localOrders)
            this.$emit('save', {
              lead: this.lead,
              contractors: this.contractorsInOrders,
            })
          }
        } else {
          const objectToSend = {
            contractorsUids: this.localOrder.contractors.map(
              (contractor) => contractor.uid
            ),
            contractors: this.localOrder.contractors,
            assigned: this.localOrder.contractors.length > 0,
          }
          await this.$store.dispatch('order/update_order', {
            orderId: this.localOrder.id,
            objectToSend,
          })
        }

        this.loading = false

        this.$emit('close')

        this.$mainAlertSuccess(this.$t('contractorAssigned'))
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 60px 60px;
  grid-template-rows: 1fr;
  align-items: center;
  justify-items: center;
}
.grid-row {
  padding-block: 0.5rem;
}
.contractor-name {
  justify-self: start;
}
.grid::v-deep .v-input--selection-controls {
  margin-top: 0;
  padding-top: 0;
}
</style>
