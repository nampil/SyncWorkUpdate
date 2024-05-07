<template>
  <div class="edit-item-for-invoices">
    <v-card class="elevation-0">
      <v-toolbar color="secondary" dense>
        <v-btn icon :disabled="loading" @click.stop="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="d-flex aling-center">
          <!-- <v-icon color="white" class="mr-4">mdi-text-box-edit-outline</v-icon> -->
          {{ $t('editItemForInvoices') }}</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            ref="botonUpdate"
            text
            :loading="loading"
            :disabled="validateData"
            @click="updateItem()"
            >{{ $t('update') }}</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-form ref="formItems" class="mt-5 mb-5" lazy-validation>
          <v-row>
            <v-col class="d-flex" cols="12">
              <v-combobox
                v-model="editTitle"
                :items="itemsForInvoicesBdFormatted"
                item-text="title"
                :label="$t('title')"
                dense
                outlined
                :rules="rulesTitle"
                autofocus
                hide-selected
                hide-details="auto"
                @input="handleTaskTitle($event)"
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

            <v-col cols="4">
              <v-combobox
                v-model="editUnit"
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
                v-model="editQty"
                :label="$t('qty')"
                outlined
                :rules="rulesQty"
                dense
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="editPrice"
                :label="$t('price')"
                prefix="$"
                outlined
                :rules="rulesPrice"
                dense
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
        <div v-if="isOverMaxValue" class="error--text my-2">
          This put you over allowables max value
        </div>
      </v-card-text>

      <!-- <v-card-actions class="btn-actions | d-flex justify-end pb-6">
        <v-btn
          class="mr-4"
          color="error"
          outlined
          :disabled="loading"
          @click="close()"
          >{{ $t('cancel') }}</v-btn
        >
        <v-btn
          ref="botonUpdate"
          class="mr-3"
          color="secondary"
          :loading="loading"
          :disabled="validateData"
          @click="updateItem()"
          >{{ $t('update') }}</v-btn
        >
      </v-card-actions> -->
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'EditItemsForInvoices',
  props: {
    editedItem: { type: Object, default: () => ({}) },
    itemsForInvoicesTask: { type: Array, default: () => [] },
    itemsForInvoicesBd: { type: Array, default: () => [] },
    units: { type: Array, default: () => [] },
    maxValue: { type: Number, default: Number.POSITIVE_INFINITY },
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
        (v) => !!v || this.$t('qtyIsRequired'),
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      rulesUnit: [(v) => !!v || this.$t('unitIsRequired')],
      loading: false,
      editTitle: '',
      editPrice: '',
      editQty: '',
      editUnit: '',
      editId: '',
      search: null,
    }
  },
  computed: {
    isOverMaxValue() {
      const maxPosibleValue =
        this.maxValue +
        parseFloat(this.editedItem.price) * parseFloat(this.editedItem.qty)
      const newQty = parseFloat(this.editQty)
      const newPrice = parseFloat(this.editPrice)
      const newValue = newQty * newPrice
      return newValue > maxPosibleValue
    },
    validateData() {
      if (
        this.editTitle === this.editedItem.title &&
        this.editUnit === this.editedItem.unit &&
        this.editPrice === this.editedItem.price &&
        this.editQty === this.editedItem.qty
      ) {
        return true
      }
      return false
    },
    itemsForInvoicesBdFormatted() {
      return this.itemsForInvoicesBd
    },
  },
  watch: {
    editedItem() {
      this.editTitle = this.editedItem.id
      this.editPrice = this.editedItem.price
      this.editUnit = this.editedItem.unit
      this.editQty = this.editedItem.qty
      this.editId = this.editedItem.id
    },

    validateData(val) {
      this.$emit('update-persistent', !val)
    },
  },

  mounted() {
    this.editTitle = this.editedItem.title
    this.editPrice = this.editedItem.price
    this.editUnit = this.editedItem.unit
    this.editQty = this.editedItem.qty
    this.editId = this.editedItem.id
  },

  methods: {
    updateItem() {
      if (!this.$refs.formItems.validate()) {
        return
      }
      const objectToSend = {
        title: this.editTitle,
        price: this.editPrice,
        unit: this.editUnit.title ? this.editUnit.title : this.editUnit,
        qty: this.editQty,
        id: this.editId,
      }
      this.$emit('update-item', {
        editId: this.editedItem.id,
        editedItem: objectToSend,
      })
      this.close()
    },

    close() {
      this.$emit('close')
    },

    handleTaskTitle(event) {
      if (!event) {
        return
      }
      const indexOf = this.itemsForInvoicesBd.map((i) => i.id).indexOf(event.id)
      if (indexOf === -1) {
        return
      }
      const item = this.itemsForInvoicesBd[indexOf]
      if (item && typeof item === 'object') {
        this.editTitle = item.title
        this.editPrice = item.price
        this.editUnit = item.unit
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
