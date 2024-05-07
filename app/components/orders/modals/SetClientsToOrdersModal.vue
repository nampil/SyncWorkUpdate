<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t('setClientToOrders') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="client"
                :items="clientsList"
                item-text="title"
                item-value="title"
                :label="$t('client')"
                dense
                outlined
                :rules="[rules.required]"
                hide-details="auto"
              >
              </v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="loanType"
                :items="loanTypeOptions"
                item-text="title"
                item-value="title"
                :label="$t('loanType')"
                dense
                outlined
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
import { mapState } from 'vuex'

export default {
  name: 'SetClientsToOrdersModal',
  props: {
    orderIds: { type: Array, default: () => [] },
    show: { type: Boolean, default: false },
  },
  data() {
    return {
      client: '',
      loanType: '',
      loading: false,
      dialog: false,
      rules: {
        required: (v) => !!v || this.$t('thisFieldRequired'),
      },
    }
  },
  computed: {
    ...mapState({
      clientsList: (state) => state.clientsList,
    }),
    loanTypeOptions() {
      if (this.client && this.clientsList.length) {
        const _client = this.clientsList.find(
          (client) => client.title === this.client
        )
        return _client.loanTypes
      }
      return []
    },
  },
  watch: {
    show(val) {
      this.dialog = val
    },
  },
  async mounted() {
    if (!this.clientsList.length) {
      try {
        this.loading = true
        await this.$store.dispatch('get_clientsList')
      } catch (error) {
        // eslint-disable-next-line
        console.log('Error', error)

        this.$mainAlertError('Error loading data for this component')
      } finally {
        this.loading = false
      }
    }
  },
  methods: {
    handleClose() {
      this.client = ''
      this.loanType = ''
      this.loading = false
      this.$emit('close')
    },
    async handleSave() {
      try {
        this.loading = true

        const promises = []
        const objectToSend = {
          client: this.client,
          loanType: this.loanType,
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

        this.$mainAlertSuccess('Orders updated successfully')
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
