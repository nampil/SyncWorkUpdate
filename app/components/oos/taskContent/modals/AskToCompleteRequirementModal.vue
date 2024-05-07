<template>
  <v-dialog
    v-model="dialog"
    :overlay="false"
    max-width="500px"
    transition="dialog-transition"
  >
    <v-card>
      <v-toolbar color="primary" dense>
        <v-toolbar-title class="d-flex aling-center">
          <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
          <span class="ma-0 text-h5 white--text"
            >Ask to Complete Requirement</span
          ></v-toolbar-title
        >
      </v-toolbar>
      <v-card-text class="pt-8">
        <p class="mb-4">
          This message will be sent to
          {{ requirement?.startedBy?.fullName || 'Contractors' }}
        </p>
        <v-textarea
          ref="msgInput"
          v-model="msg"
          outlined
          dense
          rows="3"
          hide-details="auto"
          :rules="[(v) => !!v || 'Text required']"
        ></v-textarea>
      </v-card-text>
      <v-card-actions class="d-flex justify-end pa-4">
        <v-btn class="mr-4" color="error" dense outlined @click="close()">{{
          $t('cancel')
        }}</v-btn>
        <v-btn
          class="mr-4"
          dense
          color="secondary"
          :loading="loading"
          @click="handleSend"
        >
          Send
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ALERT_TYPES, NOTIFICATION_COLORS } from '~/utils/dictionaries'

export default {
  name: 'AskToCompleteRequirementModal',
  props: {
    show: { type: Boolean, default: false },
    requirement: { type: [Object, null], default: null },
    orderId: { type: String, default: '' },
    taskId: { type: String, default: '' },
    taskType: { type: String, default: '' },
  },
  data() {
    return {
      msg: '',
      dialog: false,
      loading: false,
    }
  },
  watch: {
    show(val) {
      if (!val && this.dialog) {
        this.dialog = false
        return
      }

      if (this.requirement) {
        this.msg = `Por favor completar este requerimeinto: ${this.requirement.descRequirement}`
      }

      this.dialog = val
    },
  },

  methods: {
    close() {
      this.$emit('close')
    },
    async handleSend() {
      try {
        this.loading = true
        const msgInput = this.$refs.msgInput
        if (!msgInput.validate()) return
        const message = {
          title: `Request for completion`,
          body: this.msg,
        }

        const usersToNotify = []

        if (this.requirement?.startedBy?.uid) {
          usersToNotify.push(this.requirement.startedBy.uid)
        } else {
          const order = this.$store.getters['oos/orders/getOrderById'](
            this.orderId
          )
          usersToNotify.push(...order.contractorsUids)
        }

        const link = `${this.orderId}-${this.taskType}-${this.taskId}-${this.requirement.id}`

        const objectToSend = {
          users: usersToNotify,
          message,
          type: ALERT_TYPES.completeTaskReminder,
          link,
          sendMessageInApp: false,
          extraData: JSON.stringify({ color: NOTIFICATION_COLORS.orange }),
        }

        // eslint-disable-next-line
        console.log('objectToSend', objectToSend)

        await this.$notifyUsers(objectToSend)

        this.loading = false
        this.$emit('close')
        this.$mainAlertSuccess(
          `Mensaje enviado a ${
            this.requirement?.startedBy?.fullName || 'Contractors'
          }`
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error askind for complete req', error)
        this.loading = false
        this.$emit('close')
        this.$mainAlertError('No se pudo enviar el mensaje')
      }

      // finally {
      // }
    },
  },
}
</script>

<style lang="scss" scoped></style>
