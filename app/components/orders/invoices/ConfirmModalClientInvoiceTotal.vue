<template>
  <v-dialog
    v-model="dialog"
    persistent
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

      <v-card-text class="pt-7 pb-5">
        <p class="text-body-1">Add the client invoice amount.</p>
        <div class="text-body-1">
          <v-form ref="formAmount" lazy-validation>
            <v-text-field
              v-model="clientInvoiceAmount"
              label="Client Invoice Amount"
              outlined
              dense
              hide-details="auto"
              :rules="rulesAmount"
              required
            ></v-text-field>
          </v-form>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end pa-4">
        <v-btn
          color="error"
          :disabled="loading"
          class="mr-2"
          outlined
          small
          @click="handleCancel"
          >{{ $t('cancel') }}</v-btn
        >
        <v-btn
          class="mr-3"
          color="secondary"
          small
          :loading="loading"
          @click="confirm"
          >Confirm</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConfirmModalClientInvoiceTotal',
  props: {
    show: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    clientInvoiceTotal: { type: String, default: '' },
  },
  data() {
    return {
      dialog: false,
      clientInvoiceAmount: '',
      rulesAmount: [
        (v) => !!v || 'Required',
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
    }
  },
  watch: {
    show(val) {
      this.dialog = val
      if (val) {
        this.clientInvoiceAmount = ''
      }
      if (this.$refs.formAmount) {
        this.$refs.formAmount.resetValidation()
      }
    },
  },
  methods: {
    confirm() {
      if (!this.$refs.formAmount.validate()) {
        return
      }

      this.$emit(
        'confirm',
        parseFloat(this.clientInvoiceAmount).toFixed(2) ===
          this.clientInvoiceTotal
      )
    },
    handleCancel() {
      this.clientInvoiceAmount = ''
      this.$emit('cancel')
    },
  },
}
</script>
<style lang="scss" scoped></style>
