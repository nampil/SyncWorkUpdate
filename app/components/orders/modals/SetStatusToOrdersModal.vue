<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t('setStatusToOrders') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="status"
                :items="statusOption"
                :label="$t('status')"
                dense
                outlined
                :rules="[rules.required]"
                hide-details="auto"
              >
              </v-select>
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
import { ORDER_STATUS } from '@/utils/dictionaries'
export default {
  name: 'SetStatusToOrdersModal',
  props: {
    orderIds: { type: Array, default: () => [] },
    show: { type: Boolean, default: false },
  },
  data() {
    return {
      ORDER_STATUS: null,
      loading: false,
      dialog: false,
      status: '',
      rules: {
        required: (v) => !!v || this.$t('thisFieldRequired'),
      },
      statusOption: [
        'Inactive',
        'In Field',
        'Ready For Office',
        'Invoiced',
        'Closed',
      ],
    }
  },

  watch: {
    show(val) {
      this.dialog = val
    },
  },
  created() {
    this.ORDER_STATUS = ORDER_STATUS
  },
  methods: {
    handleClose() {
      this.loading = false
      this.$emit('close')
    },
    orderStatus() {
      let statusText = ''
      switch (this.status) {
        case 'Inactive':
          statusText = ORDER_STATUS.inactive
          break
        case 'InField':
          statusText = ORDER_STATUS.inField
          break
        case 'Ready For Office':
          statusText = ORDER_STATUS.readyForOffice
          break
        case 'Invoiced':
          statusText = ORDER_STATUS.invoiced
          break
        case 'Closed':
          statusText = ORDER_STATUS.closed
          break
      }
      this.status = statusText
    },
    async handleSave() {
      try {
        this.loading = true
        this.orderStatus()

        const promises = []
        const objectToSend = {
          status: this.status,
        }

        for (let index = 0; index < this.orderIds.length; index++) {
          const orderId = this.orderIds[index]

          const promise = this.$store.dispatch('order/update_order', {
            orderId,
            objectToSend,
          })

          promises.push(promise)
        }

        await Promise.all(promises)

        this.loading = false

        this.$mainAlertSuccess(this.$t('contractorAssigned'))
        this.handleClose()
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

<style lang="scss" scoped></style>
