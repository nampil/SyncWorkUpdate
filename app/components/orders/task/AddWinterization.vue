<template>
  <v-card>
    <v-toolbar dark color="secondary" class="flex-grow-0" dense>
      <v-btn icon dark @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>Add Winterization </v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- <v-toolbar-items>
        <v-btn ref="btnSave" dark text @click.stop="handleSave">
          {{ $t('save') }}
        </v-btn>
    
      </v-toolbar-items> -->
    </v-toolbar>
    <v-card-text>
      <div class="pa-8 d-flex gap-8 justify-center">
        <v-btn
          :disabled="loading"
          :loading="loading"
          @click="handleAddWinterization"
          >Add Full Winterization</v-btn
        >
        <!-- <v-btn @click="handleAddCheckWinterization"
          >Add Check Winterization</v-btn
        > -->
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'AddWinterization',

  props: {
    order: { type: Object, default: () => ({}) },
    jobType: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleAddCheckWinterization() {},
    async handleAddWinterization() {
      try {
        this.loading = true
        await this.$store.dispatch('order/add_winterization', {
          orderId: this.order.id,
          addWinterization: true,
        })
        this.handleClose()
      } catch (error) {
        // eslint-disable-next-line
        console.log('error adding winterization', error)
        this.$mainAlertError(
          'Error adding winterization, please try later. If problem persist, call tech support'
        )
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
