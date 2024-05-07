<template>
  <v-card
    class="container-add-items-for-invoices | d-flex flex-column overflow-hidden elevation-0"
  >
    <v-toolbar color="secondary" dense class="flex-grow-0">
      <v-btn icon :disabled="loading" @click.stop="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title class="d-flex aling-center">
        <!-- <v-icon color="white" class="mr-4">mdi-text-box-plus-outline</v-icon> -->
        {{ $t('addItemsForInvoices') }}</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          ref="botonSave"
          text
          :loading="loading"
          @click.stop="handleSave()"
          >{{ $t('save') }}</v-btn
        >
      </v-toolbar-items>
    </v-toolbar>
    <div class="flex-grow-1 overflow-y-auto">
      <v-card-text class="text-center">
        <v-form ref="formItems" class="mt-5" lazy-validation>
          <v-row v-for="(item, i) in itemsForInvoices" :key="i" class="">
            <v-col
              class="d-flex"
              :cols="itemsForInvoices.length !== 1 ? '11' : '12'"
            >
              <v-combobox
                v-model="item.title"
                :items="itemsForInvoicesBdFormatted"
                item-text="title"
                :label="$t('title')"
                dense
                outlined
                :rules="rulesTitle"
                autofocus
                hide-details="auto"
                @input="handleTaskTitle($event, i)"
              >
                <!-- eslint-disable-next-line -->
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ $t('No results matching what was') }}
                        "<strong>{{ $t('added') }}</strong
                        >",
                        {{ $t('Press') }}
                        <kbd>{{ $t('enter') }}</kbd>
                        {{ $t('to create a new one') }}.
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-combobox>
            </v-col>
            <v-col
              v-if="!item.id !== '' && itemsForInvoices.length !== 1"
              cols="1"
            >
              <v-btn
                icon
                small
                class="btn-delete mt-1"
                @click="delete_items(i)"
              >
                <v-icon color="error">mdi-delete</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-combobox
                v-model="item.unit"
                :label="$t('unit')"
                outlined
                :items="units"
                item-text="title"
                item-value="id"
                :rules="rulesUnit"
                dense
                clearable
                hide-details="auto"
                @keydown.enter.exact.prevent
              ></v-combobox>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="item.qty"
                :label="$t('qty')"
                outlined
                :rules="rulesQty"
                dense
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="item.price"
                :label="$t('price')"
                prefix="$"
                outlined
                :rules="rulesPrice"
                dense
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-divider></v-divider>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center py-4">
        <v-btn icon :disabled="validateData" @click="addItems()"
          ><v-icon>mdi-plus-circle-outline</v-icon></v-btn
        >
      </v-card-actions>

      <!-- <v-card-actions class="btn-actions | d-flex justify-end pb-6">
        <v-btn
          class="mr-4"
          color="error"
          outlined
          :disabled="loading"
          @click.stop="close()"
          >{{ $t('cancel') }}</v-btn
        >
        <v-btn
          ref="botonSave"
          class="mr-3"
          color="secondary"
          :loading="loading"
          :disabled="validateData"
          @click.stop="handleSave()"
          >{{ $t('save') }}</v-btn
        >
      </v-card-actions> -->
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'AddItemsForInvoices',
  props: {
    itemsForInvoicesTask: { type: Array, default: () => [] },
    itemsForInvoicesBd: { type: Array, default: () => [] },
    units: { type: Array, default: () => [] },
  },
  data() {
    return {
      rulesTitle: [(v) => !!v || this.$t('titleRequired')],
      rulesPrice: [
        (v) => !!v || this.$t('priceRequired'),
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      rulesQty: [
        (v) => !!v || 'Qty is required',
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      rulesUnit: [(v) => !!v || 'Unit is required'],

      newItems: {
        id: '',
        title: '',
        price: '',
        unit: '',
        qty: '',
      },
      loading: false,
      itemsForInvoices: [],
      search: null,
    }
  },
  computed: {
    validateData() {
      if (this.itemsForInvoices && this.itemsForInvoices.length) {
        return this.itemsForInvoices.some((item) => {
          return !(
            item.price !== '' &&
            item.title !== '' &&
            item.unit !== '' &&
            item.qty !== ''
          )
        })
      }
      return true
    },
    itemsForInvoicesBdFormatted() {
      return this.itemsForInvoicesBd
      // return this.itemsForInvoicesBd.filter((item) => {
      //   return (
      //     !this.itemsForInvoicesTask.includes(item.id) &&
      //     !this.itemsForInvoices.map((e) => e.id).includes(item.id)
      //   )
      // })
    },
  },
  watch: {
    validateData(val) {
      this.$emit('update-persistent', !val)
    },
  },
  mounted() {
    this.addItems()
  },

  methods: {
    addItems() {
      const _items = { ...this.newItems }
      _items.id =
        '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
      _items.title = ''
      _items.price = ''
      _items.unit = ''
      _items.qty = ''
      this.itemsForInvoices.push(_items)
    },
    close() {
      this.$refs.formItems.reset()
      this.$emit('close')
    },
    handleSave() {
      if (!this.$refs.formItems.validate()) {
        return
      }
      this.$emit('new-items', this.itemsForInvoices)
      this.$emit('close')
    },
    delete_items(index) {
      this.itemsForInvoices.splice(index, 1)
    },
    handleTaskTitle(event, i) {
      if (!event) {
        return
      }
      const indexOf = this.itemsForInvoicesBd.map((i) => i.id).indexOf(event.id)
      if (indexOf === -1) {
        return
      }
      const item = this.itemsForInvoicesBd[indexOf]

      if (item && typeof item === 'object') {
        this.itemsForInvoices[i].price = item.price
        this.itemsForInvoices[i].title = item.title
        this.itemsForInvoices[i].unit = item.unit
        this.itemsForInvoices[i].qty = '1'
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
