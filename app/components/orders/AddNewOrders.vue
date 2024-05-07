<template>
  <div class="add-new-orders | h-100">
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-card tile class="d-flex flex-column h-100">
      <v-toolbar color="primary" dense falt class="elevation-0 flex-grow-0">
        <v-toolbar-title>{{ $t('addOrders') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            dark
            text
            :disabled="!rawData || ordersNoOK.length > 0"
            @click="handleSaveOrders"
          >
            {{ $t('save') }}
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text class="card-text | pt-8">
        <div
          ref="dropzone"
          class="dropzone mb-4"
          @drop.prevent="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
        >
          <div
            class="innner-dropzone d-flex flex-column justify-center align-center"
          >
            <v-btn
              v-if="rawData"
              class="closeBtn"
              icon
              color="red"
              @click.stop="handleClose"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <h4 v-if="!rawData">{{ $t('dropFileHere') }}</h4>
            <p v-if="fileName" class="text-h4">{{ fileName }}</p>
            <p v-if="rawData" class="text-subtitle-1">
              {{ parsedOrders.length }} {{ $t('ordersInThisFile') }}
            </p>
          </div>
        </div>

        <div class="actions">
          <v-switch v-model="archiveOrders" label="Archivar Ordenes">
          </v-switch>
        </div>

        <v-data-table
          dense
          :headers="headerFormated"
          :items="parsedOrders"
          item-key="name"
          :item-class="
            (item) =>
              ordersNoOK.map((o) => o.woNumber).includes(item.woNumber)
                ? 'error white--text'
                : ''
          "
          class="elevation-1 px-2"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:item.comment="{ item }">
            {{ item && item.comment && item.comment.substring(0, 60) + '...' }}
          </template>
          <!-- eslint-disable-next-line -->
          <template v-slot:item.action="{ item }">
            <div
              v-if="ordersNoOK.map((o) => o.woNumber).includes(item.woNumber)"
            >
              <v-btn icon @click="deleteOrder(item)"
                ><v-icon>mdi-delete</v-icon></v-btn
              >
              <ErrorReason
                :reason="
                  ordersNoOK.filter((o) => o.woNumber === item.woNumber)[0]
                    .reason
                "
              />
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { getGoogleMapsAPI } from 'gmap-vue'
import xlsxParser from 'xlsx-parse-json'
import ErrorReason from './ErrorReason.vue'

export default {
  name: 'AddNewOrderModal',
  components: { ErrorReason },
  data() {
    return {
      loading: false,
      disabled: false,
      archiveOrders: false,
      rawData: null,
      dataValidated: false,
      fileName: '',
      ordersNoOK: [],
      headers: [
        {
          text: this.$t('address'),
          value: 'Address',
        },
        { text: this.$t('category'), value: 'Category' },
        { text: this.$t('city'), value: 'City' },
        { text: this.$t('county'), value: 'County' },
        { text: this.$t('customer'), value: 'Customer' },
        { text: this.$t('dateDue'), value: 'Date Due' },
        {
          text: this.$t('estimatedCompleteDate'),
          value: 'Estimated Complete Date',
        },
        { text: this.$t('photos'), value: 'Photos' },
        { text: 'WO #', value: 'woNumber' },
        { text: this.$t('workType'), value: 'Work Type' },
        { text: this.$t('zip'), value: 'Zip' },
        { text: 'Actions' },
      ],
    }
  },
  computed: {
    google: getGoogleMapsAPI,
    dummyOrder() {
      return this.$store.state.orders.dummyOrder
    },
    headerFormated() {
      if (!this.rawData) {
        return []
      }

      const rawKeys = []

      this.rawData.Worksheet.forEach((item) => {
        const keys = Object.keys(item)
        keys.forEach((key) => {
          rawKeys.push(key)
        })
      })
      const finalKeys = [...new Set(rawKeys), 'action']
      return finalKeys.map((key) => {
        const value = key
          .split(' ')
          .map((word, i) => {
            if (i > 0) {
              return word.charAt(0).toUpperCase() + word.substr(1)
            }
            return word.toLowerCase()
          })
          .join('')
          .replace('.', '')
          .replace('#', 'Number')
          .replace('-', '')

        return { text: key, value }
      })
    },
    parsedOrders() {
      if (!this.rawData) {
        return []
      }

      return this.rawData.Worksheet.map((order) => {
        const newOrder = Object.fromEntries(
          Object.entries(order).map(([key, value]) => {
            const _key = key
              .split(' ')
              .map((word, i) => {
                if (i > 0) {
                  return word.charAt(0).toUpperCase() + word.substring(1)
                }
                return word.toLowerCase()
              })
              .join('')
              .replace('.', '')
              .replace('#', 'Number')
              .replace('-', '')
            return [_key, value]
          })
        )

        return newOrder
      })
    },
    addNewOrderModal: {
      get() {
        return this.$store.state.orders.addNewOrderModal
      },
      set(payload) {
        this.$store.commit('orders/set_addNewOrderModal', payload)
      },
    },
  },
  async mounted() {
    await this.$gmapApiPromiseLazy()
  },
  methods: {
    deleteOrder(order) {
      const woNumber = order.woNumber
      const indexToDelete = this.rawData.Worksheet.findIndex(
        (o) => o['WO #'] === woNumber
      )
      const indexToDeleteOrderNoOk = this.ordersNoOK.findIndex(
        (o) => o.woNumber === woNumber
      )
      if (indexToDelete > -1) {
        this.rawData.Worksheet.splice(indexToDelete, 1)
      }
      if (indexToDeleteOrderNoOk > -1) {
        this.ordersNoOK.splice(indexToDeleteOrderNoOk, 1)
      }
    },
    async handleSaveOrders() {
      if (!this.parsedOrders.length) {
        return
      }
      try {
        this.loading = true

        const nOrderToUpdload = await this.$store.dispatch(
          'orders/add_ordersBatch',
          { newOrders: this.parsedOrders, archiveOrders: this.archiveOrders }
        )

        this.rawData = null
        this.fileName = ''
        this.$refs.dropzone.classList.remove('dragover')

        this.$mainAlert(`Success! ${nOrderToUpdload} orders registered `, {
          showAlert: true,
          color: 'success',
        })

        this.loading = false
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.error(error)
      }
    },
    handleDrop(e) {
      const file = e.dataTransfer.files[0]
      this.fileName = file.name
      xlsxParser
        .onFileSelection(file, { showNullProperties: true })
        .then((data) => {
          this.rawData = data
          //
          this.validateData()
        })
    },
    async validateData() {
      this.loading = true
      for (let idx = 0; idx < this.parsedOrders.length; idx++) {
        const order = this.parsedOrders[idx]

        try {
          await this.checkAddress(order)
        } catch (error) {
          // eslint-disable-next-line
          console.log('Error checking address in order', order.woNumber, error)
          this.ordersNoOK.push({ ...order, reason: 'Address not found' })
        }

        const res = await this.$store.dispatch(
          'orders/woNumberNotExists',
          order.woNumber
        )

        if (!res) {
          this.ordersNoOK.push({ ...order, reason: 'Order already exists' })
        }

        if (!order.dateDue) {
          this.ordersNoOK.push({ ...order, reason: 'dateDue not found' })
        }

        const _orders = this.parsedOrders.filter(
          (o) => o.woNumber !== order.woNumber
        )

        const isDuplicate =
          _orders.length &&
          _orders.map((o) => o.woNumber).includes(order.woNumber) &&
          !this.ordersNoOK.map((o) => o.woNumber).includes(order.woNumber)

        if (isDuplicate) {
          this.ordersNoOK.push({ ...order, reason: 'Duplicated order' })
        }
      }
      this.loading = false
    },
    checkAddress(order) {
      return new Promise((resolve, reject) => {
        const service = new this.google.maps.places.AutocompleteService()

        const { address, city, state, zip } = order

        const fullAddres = `${address}, ${city}, ${state} ${zip}`

        service.getPlacePredictions(
          { input: fullAddres },
          (results, status) => {
            if (status === this.google.maps.places.PlacesServiceStatus.OK) {
              resolve()
            }
            reject(new Error('Error Check Address'))
          }
        )
      })
    },

    handleFileInput() {},
    handleClose() {
      this.fileName = ''
      this.rawData = null
      this.$refs.dropzone.classList.remove('dragover')
    },

    handleDragOver() {
      if (this.disabled) {
        return
      }
      this.$refs.dropzone.classList.add('dragover')
    },
    handleDragLeave() {
      if (this.disabled) {
        return
      }
      this.$refs.dropzone.classList.remove('dragover')
    },
  },
}
</script>

<style lang="scss" scoped>
.dropzone {
  border: 1px dashed #333;
  height: 150px;
  .innner-dropzone {
    height: 100%;
    position: relative;
  }

  &.dragover {
    border: 1px solid rgba($color: #000000, $alpha: 0.3);
    background-color: #bbdefb;
  }
  .closeBtn {
    position: absolute;
    top: 5px;
    right: 5px;
  }
}
.card-text {
  overflow: auto;
}
</style>
