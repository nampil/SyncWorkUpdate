<template>
  <v-card class="elevation-0">
    <v-toolbar color="primary" dense>
      <v-toolbar-title class="d-flex aling-center">
        <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
        <span class="ma-0 text-h5 white--text">{{
          $t('alertTitle')
        }}</span></v-toolbar-title
      >
    </v-toolbar>
    <v-card-text class="pt-7 pb-5 text-center">
      <span class="text-body-1">
        {{ $t('alertTextChat') }} {{ $t('requirement') }}.</span
      >
      <!-- <v-textarea ref="botonDelete"> </v-textarea> -->
    </v-card-text>

    <v-card-actions class="d-flex justify-end pa-4">
      <v-btn
        ref="botonClose"
        class="mr-4"
        color="error"
        dense
        outlined
        :disabled="loading"
        @keyup.enter.exact="close"
        @click="close"
        >{{ $t('cancel') }}</v-btn
      >
      <v-btn
        class="mr-4"
        dense
        color="secondary"
        :loading="loading"
        @v-on:keyup.enter="deleteConfirm()"
        @click="deleteConfirm()"
        >{{ $t('delete') }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    deletedRequirement: { type: Object, default: () => ({}) },
    orderId: { type: String, default: '' },
    taskId: { type: String, default: '' },
    type: { type: String, default: '' },
  },
  data() {
    return {
      loading: false,
    }
  },
  computed: {},

  mounted() {
    this.$nextTick(() => {
      this.$refs.botonClose.$el.focus()
    })
  },

  methods: {
    async deleteConfirm() {
      this.loading = true

      try {
        await this.$store.dispatch('oos/orders/delete_requirements', {
          orderId: this.orderId,
          taskId: this.taskId,
          deletedRequirement: this.deletedRequirement,
          requirementId: this.deletedRequirement.id,
          type: this.type,
        })
        this.close()
        this.$mainAlertSuccess(this.$t('Success! Requirement updated'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    close() {
      this.showDeleteRequirements = false
      this.$emit('close')
    },
  },
}
</script>

<style></style>
