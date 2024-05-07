<template>
  <div class="reset-password d-flex align-center justify-center">
    <v-card min-width="400" min-height="350" class="elevation-6">
      <v-card-title primary-title class="justify-center">
        <h1 class="text-h4 mt-10">DAYTONA</h1>
      </v-card-title>
      <v-card-text>
        <v-form ref="resetPasswordForm">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="emailForReset"
                  class="pt-2 pb-2"
                  label="Email"
                  outlined
                  :rules="emailRules"
                  dense
                  hide-details="auto"
                  prepend-inner-icon="mdi-email-outline"
                  @focus="cleanMessageReset()"
                ></v-text-field>
                <span v-if="hasSuccessReset" class="success--text">
                  {{ successMessageReset }}</span
                >
              </v-col>
              <v-col cols="12" class="pt-0">
                <v-btn
                  block
                  color="secondary"
                  dense
                  :loading="loading"
                  @click="resetPassword()"
                  >Reset</v-btn
                >
              </v-col>
              <v-col cols="12" class="pb-6">
                <v-btn block dense color="error" outlined @click="cancel()">{{
                  $t('cancel')
                }}</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
export default {
  name: 'ResetPassword',
  data() {
    return {
      loading: false,
      emailForReset: '',
      hasSuccessReset: false,
      successMessageReset: '',
      emailRules: [
        (v) => !!v || this.$t('emailRequired'),
        (v) =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          this.$t('emailValid'),
      ],
    }
  },
  methods: {
    async resetPassword() {
      if (!this.$refs.resetPasswordForm.validate()) {
        return
      }
      this.loading = true
      try {
        const auth = getAuth()
        await sendPasswordResetEmail(auth, this.emailForReset)
      } catch (error) {
      } finally {
        this.loading = false
        this.$refs.resetPasswordForm.reset()
        this.hasSuccessReset = true
        this.successMessageReset =
          'If your email is registered in the system, an email will be sent to you to change your password.'
      }
    },
    cancel() {
      this.$emit('close')

      this.hasSuccessReset = false
      this.$refs.resetPasswordForm.reset()
    },
    cleanMessageReset() {
      this.hasErrorReset = false
      this.hasSuccessReset = false
      this.errorMessageReset = ''
      this.successMessageReset = ''
    },
  },
}
</script>

<style lang="scss" scoped></style>
