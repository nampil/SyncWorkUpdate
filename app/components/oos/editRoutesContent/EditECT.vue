<template>
  <div class="container-edit-ect">
    <v-card class="elevation-0">
      <v-toolbar dark color="secondary" dense>
        <v-btn icon :disabled="loading" @click.stop="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title> Edit ECT </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            text
            class="white--text"
            :loading="loading"
            @click="handleUpdateECT()"
            >{{ $t('update') }}</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="text-center">
        <v-form ref="formEditECT" class="mt-2 mb-2" lazy-validation>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="newEctHours"
                label="Horas"
                outlined
                autofocus
                dense
                hide-details="auto"
                :rules="rulesECT"
                @keydown.enter.exact.prevent
              >
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="newEctMin"
                label="Minutes"
                outlined
                dense
                hide-details="auto"
                :rules="rulesECT"
                @keydown.enter.exact.prevent
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'EditECTComp',
  props: {
    ect: { type: Object, default: () => ({}) },
    taskId: { type: String, default: '' },
    orderId: { type: String, default: '' },
    taskType: { type: String, default: '' },
    routeId: { type: String, default: '' },
  },
  data() {
    return {
      loading: false,
      newEctHours: '',
      newEctMin: '',
      rulesECT: [
        (v) => !!v || 'Field is required',
        (v) =>
          /^[0-9]{1,10}([0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      formatsTypes: ['hour', 'Minutes'],
    }
  },
  computed: {
    valiateForm() {
      return (
        this.ect &&
        this.newEctHours === this.ect.hours &&
        this.newEctMin === this.ect.minutes
      )
    },
  },
  watch: {
    ect() {
      this.newEctHours = this.ect.hours
      this.newEctMin = this.ect.minutes
    },
    valiateForm(val) {
      this.$emit('update-persistent', !val)
    },
  },
  mounted() {
    this.newEctHours = this.ect.hours
    this.newEctMin = this.ect.minutes
    this.$refs.formEditECT.resetValidation()
  },
  methods: {
    close() {
      this.newEctHours = this.ect.hours
      this.newEctMin = this.ect.minutes
      this.$emit('close')
    },
    async handleUpdateECT() {
      if (!this.$refs.formEditECT.validate() || this.valiateForm) return
      this.loading = true
      const objectToSend = {
        hours: this.newEctHours,
        minutes: this.newEctMin,
      }
      try {
        await this.$store.dispatch('oos/orders/update_ect', {
          routeId: this.routeId,
          orderId: this.orderId,
          taskId: this.taskId,
          taskType: this.taskType,
          objectToSend,
        })
        this.close()
        this.$mainAlertSuccess('Success! ECT updated')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
