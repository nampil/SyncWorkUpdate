<template>
  <div
    v-if="itemsFormatted && itemsFormatted.length"
    class="items-for-invoices-view | pt-0 pb-0"
  >
    <v-row no-gutters class="text-right info--text">
      <v-col cols="1" md="1" offset="8">{{ $t('unit') }}</v-col>
      <v-col cols="1" md="1">{{ $t('qty') }} </v-col>
      <v-col cols="1" md="1">{{ $t('price') }}</v-col>
      <v-col cols="1" md="1">{{ $t('actions') }}</v-col>
    </v-row>

    <div v-for="(item, i) in itemsFormatted" :key="i" class="pb-2">
      <v-row no-gutters class="text-right">
        <v-col cols="7" md="7" class="text-left">
          <v-icon size="14" color="grey">mdi-brightness-1 </v-icon>
          <span>{{ item.title }}</span>
        </v-col>
        <v-col cols="2" md="2"> {{ item.unit }} </v-col>
        <v-col cols="1" md="1"> {{ item.qty }} </v-col>
        <v-col cols="1" md="1"> {{ item.price }} </v-col>
        <v-col cols="1" md="1">
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="ml-1"
                icon
                color="primary"
                x-small
                v-bind="attrs"
                v-on="on"
                @click="handleEditItem(item)"
              >
                <v-icon size="17">mdi-text-box-edit-outline</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('editItemForInvoices') }}</span>
          </v-tooltip>
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line  -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="mr-2"
                icon
                x-small
                v-bind="attrs"
                v-on="on"
                @click="handleDeleteItem(item)"
              >
                <v-icon color="error" size="17">mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('deleteItemForInvoices') }}</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>
    <div class="totals | text-right font-weight-bold">
      <v-row no-gutters>
        <v-col cols="2" offset="7">Total</v-col>
        <v-col cols="2">{{ sumaItems }}</v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItemsForInvoiceView',
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    itemsForInvoices: {
      type: Array,
      default: () => [],
    },
    maxValue: { type: Number, default: Number.POSITIVE_INFINITY },
  },
  data() {
    return {}
  },
  computed: {
    itemsFormatted() {
      /* const _itemsForInvoices = JSON.parse( JSON.stringify(this.itemsForInvoices))
      return _itemsForInvoices.filter((item) => {
        return this.items.includes(item.id)
      }) */

      return this.items
    },
    isOverMaxValue() {
      return false
    },
    sumaItems() {
      return this.itemsFormatted.reduce((acc, item) => {
        const price = parseFloat(item.price)
        const qty = parseFloat(item.qty)
        const val = price * qty
        return acc + val
      }, 0)
    },
  },
  methods: {
    handleDeleteItem(item) {
      this.$emit('delete-items', item)
    },
    handleEditItem(item) {
      this.$emit('edit-item', item)
    },
  },
}
</script>
<style lang="scss" scoped></style>
