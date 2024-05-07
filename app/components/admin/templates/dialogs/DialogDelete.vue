<template>
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
      <v-card-text class="pt-10 pb-10 text-center">
        <span class="text-body-1">
          {{ $t('alertTextTemplate') }}
        </span>
      </v-card-text>

      <v-card-actions class="d-flex justify-end pa-4">
        <v-btn
          ref="botonCloseDelete"
          class="mr-4"
          color="error"
          outlined
          @click="$emit('close-delete')"
          >{{ $t('cancel') }}</v-btn
        >
        <v-btn
          class="mr-4"
          :loading="loading"
          color="secondary"
          @click="$emit('delete-item-confirm')"
          >{{ $t('delete') }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DialogDelete',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialog: false,
    }
  },
  watch: {
    show(val) {
      this.dialog = val
    },
  },
}
</script>

<style lang="scss" scoped></style>
