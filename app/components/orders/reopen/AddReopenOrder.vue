<template>
  <v-card class="container-reopen-order | elevation-0">
    <v-toolbar color="secondary" dense>
      <v-btn text icon @click.stop="close()"> <v-icon>mdi-close</v-icon></v-btn>
      <v-toolbar-title class="d-flex aling-center">
        <!-- <v-icon color="white" class="mr-4">mdi-text-box-plus-outline</v-icon> -->
        {{ $t('reopenOrder') }}</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text :loading="loading" @click.stop="handleReopen()">{{
          $t('reopen')
        }}</v-btn></v-toolbar-items
      >
    </v-toolbar>
    <div>
      <v-card-text class="mt-1">
        <span class="text-body-2">
          {{ $t('Please explain why you want to reopen this order.') }}
        </span>
        <v-form ref="formReopen" class="task-form mt-5" lazy-validation>
          <v-row class="mb-6">
            <v-col cols="12">
              <v-textarea
                v-model="reopenReason"
                :label="$t('reasonForReopening')"
                outlined
                autofocus
                :rules="rules"
                dense
                hide-details="auto"
                auto-grow
                maxlength="240"
                rows="1"
                @keydown.enter.exact.prevent
              >
              </v-textarea>
            </v-col>
          </v-row>
        </v-form>

        <v-divider></v-divider>
      </v-card-text>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'AddReopenOrder',
  props: {
    orderId: { type: String, default: '' },
    status: { type: String, default: '' },
  },

  data() {
    return {
      rules: [(v) => !!v || this.$t('thisFieldRequired')],
      loading: false,
      reopenReason: '',
    }
  },
  computed: {
    localNeedToSave() {
      return this.reopenReason === '' || !this.reopenReason.trim()
    },
  },

  watch: {
    localNeedToSave: {
      handler(val) {
        this.$emit('update-persistent', !val)
      },
      inmediate: true,
    },
  },

  methods: {
    async handleReopen() {
      if (!this.$refs.formReopen.validate()) {
        return
      }
      this.loading = true
      try {
        await this.$store.dispatch('order/handleReopenOrder', {
          orderId: this.orderId,
          status: this.status,
          isReopen: true,
          reopenReason: this.reopenReason,
        })
        this.$mainAlertSuccess(
          'Success! Reopened and the status of your order was updated'
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
        this.close()
      }
    },

    close() {
      this.$refs.formReopen.resetValidation()
      this.reopenReason = ''
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped></style>
