<template>
  <v-card class="elevation-0" min-height="150">
    <v-toolbar color="secondary" dark dense class="flex-grow-0 elevation-0">
      <v-btn icon :disabled="loading" @click.stop="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title class="d-flex aling-center">
        Bids History</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn ref="botonSave" text @click.stop="handleCopy">{{
          $t('copy')
        }}</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-card-text class="pa-4">
      <div
        v-for="(woNumberOrder, i) in Object.keys(bidsHistoryFormatted)"
        :key="i"
        class="pb-4"
      >
        <v-data-table
          v-model="bidsSelected"
          :headers="headers"
          :items="bidsHistoryFormatted[woNumberOrder]"
          class="elevation-0"
          dense
          hide-default-footer
          show-select
          :items-per-page="-1"
          @click:row="handleClickRow"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:top>
            <div class="toolbar-bids | d-flex align-center pa-2">
              <nuxt-link
                :to="`/dispatching/${bidsHistoryFormatted[woNumberOrder][0].orderId}`"
                class="woNumber-link"
                >WO#: {{ woNumberOrder }}</nuxt-link
              >
              <!-- <span class="ml-4 mr-1 subtitle-2">WO#: {{ woNumber }}</span> -->

              <v-divider class="ml-2 mb-2" inset vertical></v-divider>
            </div>
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:item.alternativeTitles="{ item }">
            <div v-for="(title, t) in item.alternativeTitles" :key="t">
              <span>
                CE Title: {{ title.ceTitle }}
                <v-icon small>mdi-arrow-right-thin</v-icon> Code:
                {{ title.code }}
                <v-icon small>mdi-arrow-right-thin</v-icon>
                Price:
                {{ title.price }}
              </span>
            </div>
          </template>
        </v-data-table>
      </div>
      <span
        v-if="!Object.keys(bidsHistoryFormatted).length"
        class="d-flex justify-center mt-2"
        >There are still no bids to copy!</span
      >
    </v-card-text>

    <v-dialog
      v-model="dialog"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card class="elevation-0">
        <v-toolbar color="primary" dense>
          <v-toolbar-title class="d-flex aling-center">
            <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
            <span class="ma-0 text-h5 white--text">{{
              $t('alertTitle')
            }}</span></v-toolbar-title
          >
        </v-toolbar>
        <v-card-text class="pt-10 pb-5 text-center">
          <span class="text-body-1">
            <v-btn
              class="mb-1"
              icon
              small
              :color="copyWithPhotos ? 'primary' : ''"
              @click="copyWithPhotos = !copyWithPhotos"
            >
              <v-icon
                >{{
                  copyWithPhotos
                    ? 'mdi-checkbox-marked'
                    : 'mdi-checkbox-blank-outline'
                }}
              </v-icon>
            </v-btn>

            <span class="text-body-1">
              Do you want to copy with the photos?
            </span>
          </span>
        </v-card-text>

        <v-card-actions class="d-flex justify-end pa-4">
          <v-btn
            class="mr-2"
            color="error"
            small
            outlined
            @click="dialog = !dialog"
            >{{ $t('cancel') }}</v-btn
          >
          <v-btn
            class="mr-2"
            color="secondary"
            :loading="loadingHistory"
            small
            @click="handleSave"
            >{{ $t('copy') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-card>
</template>

<script>
export default {
  name: 'BidsHistory',
  props: {
    propertyId: { type: String, default: '' },
    orderId: { type: String, default: '' },
    woNumber: { type: String, default: '' },
  },
  data() {
    return {
      loadingHistory: false,
      bidsHistory: [],
      headers: [
        { text: this.$t('title'), value: 'title' },
        {
          text: 'Alternative Titles',
          value: 'alternativeTitles',
          width: '20%',
        },
        { text: 'Qty', value: 'qty' },
        { text: 'Contractor Price', value: 'contractorPrice' },
        { text: 'Client Price', value: 'clientPrice' },
        { text: this.$t('description'), value: 'desc', width: '20%' },
      ],
      bidsSelected: [],
      dialog: false,
      copyWithPhotos: false,
    }
  },
  computed: {
    bidsHistoryFormatted() {
      const bids = {}
      for (let i = 0; i < this.bidsHistory.length; i++) {
        const bid = this.bidsHistory[i]
        if (!bids[bid.woNumber]?.length) {
          bids[bid.woNumber] = []
        }
        bids[bid.woNumber].push(bid)
      }
      return bids
    },
  },
  created() {
    this.initialize()
  },
  methods: {
    async initialize() {
      this.loading = true
      try {
        const _items = await this.$store.dispatch('order/get_bidsProperty', {
          propertyId: this.propertyId,
          orderId: this.orderId,
        })
        this.bidsHistory = _items && _items.length ? [..._items] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleCopy() {
      if (!this.bidsSelected.length) {
        this.$mainAlertInfo(`You don't have bids to copy`)
        return
      }
      this.dialog = !this.dialog
    },
    async handleSave() {
      this.loadingHistory = true
      try {
        for (let i = 0; i < this.bidsSelected.length; i++) {
          const bid = this.bidsSelected[i]
          const { id, updatedAt, updatedBy, reports, ..._bid } = bid
          const objectToSend = {
            ..._bid,
            orderId: this.orderId,
            woNumber: this.woNumber,
          }
          await this.$store.dispatch(`order/add_bid`, {
            objectToSend,
            orderId: this.orderId,

            ...(this.copyWithPhotos && {
              reports,
            }),
          })
        }
        this.loadingHistory = false
        this.$mainAlertSuccess('Success! Bid(s) added')
        this.close()
        this.$emit('save')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.loadingHistory = false
        this.$mainAlertError(this.$t('embarrassingError'))
      }
    },
    close() {
      this.$emit('close')
      this.bidsSelected = []
    },
    handleClickRow(item) {
      this.bidsSelected.push(item)
    },
    handleEyeOrder(item) {
      const idx = this.bidsHistory.map((h) => h.woNumber).indexOf(item)
      if (idx === -1) return
      this.$router.push(`/dispatching/${this.bidsHistory[idx].orderId}`)
    },
  },
}
</script>

<style lang="scss" scoped>
.toolbar-bids {
  min-height: 30px;
  font-size: 20px;
  background-color: rgba(59, 71, 99, 0.298);
}
.woNumber-link {
  font-size: 16px;
  color: inherit;
  text-decoration: none;
}
</style>
