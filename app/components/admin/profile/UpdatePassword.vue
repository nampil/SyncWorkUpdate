<template>
  <div class="mb-4">
    <v-row>
      <v-col cols="8" md="8"
        ><v-divider></v-divider>
        <v-card class="elevation-0 mt-7">
          <v-toolbar flat dark dense color="secondary" class="elevation-0">
            <v-toolbar-title class="d-flex aling-center">
              <v-icon class="mr-4">mdi-lock-plus</v-icon>

              <span class="ma-0 text-h5 dark--text">{{
                $t('updatePasswordProfile')
              }}</span
              ><v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer
            ></v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="newUserFormPassword">
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    v-model="userPassActual"
                    :label="$t('password')"
                    outlined
                    hide-details="auto"
                    dense
                    validate-on-blur
                    required
                    :rules="userPassActual ? passwordRules : []"
                    :type="viewPassActual ? 'text' : 'password'"
                    :append-icon="viewPassActual ? 'mdi-lock' : 'mdi-eye'"
                    @keydown.enter.exact.prevent
                    @keyup.enter.exact="handleFocus(4)"
                    @click:append="viewPassActual = !viewPassActual"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="newUserPass"
                    :label="$t('newPasswordProfile')"
                    outlined
                    hide-details="auto"
                    dense
                    validate-on-blur
                    required
                    :rules="userPassActual ? passwordRules : []"
                    :type="viewPass ? 'text' : 'password'"
                    :append-icon="viewPass ? 'mdi-lock' : 'mdi-eye'"
                    @keydown.enter.exact.prevent
                    @keyup.enter.exact="handleFocus(7)"
                    @click:append="viewPass = !viewPass"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    id="passwordConfirm"
                    v-model="newUserPassConfirm"
                    :label="$t('ConfirmNewPasswordProfile')"
                    outlined
                    hide-details="auto"
                    dense
                    validate-on-blur
                    required
                    :rules="newUserPass ? passwordConfirmRules : []"
                    :type="viewPassConfirm ? 'text' : 'password'"
                    :append-icon="viewPassConfirm ? 'mdi-lock' : 'mdi-eye'"
                    @keydown.enter.exact.prevent
                    @keyup.enter.exact="handleFocusBtnActions()"
                    @click:append="viewPassConfirm = !viewPassConfirm"
                  ></v-text-field>
                </v-col>
                <v-col col="12" class="text-leht">
                  <v-btn
                    color="error"
                    outlined
                    class="mr-4"
                    :disabled="loadingPassword || !local_needToSave"
                    @click="handleCancelPassword('newUserFormPassword')"
                    >{{ $t('cancel') }}</v-btn
                  >
                  <v-btn
                    ref="btnSend"
                    color="secondary"
                    :loading="loadingPassword"
                    :disabled="!local_needToSave"
                    @click="handleSavePassword('newUserFormPassword')"
                    >{{ $t('send') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text></v-card
        >
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '@/plugins/firebase'

export default {
  name: 'UpdatePassword',

  data() {
    return {
      viewPass: false,
      viewPassActual: false,
      viewPassConfirm: false,

      loadingPassword: false,

      newUserPass: '',
      newUserPassConfirm: '',
      userPassActual: '',

      passwordRules: [
        // (v) => !!v || 'Password is required',
        (v) => /^(?=.*?[A-Z])/.test(v) || this.$t('passwordLeastUpperLetter'),
        (v) => /^(?=.*?[a-z])/.test(v) || this.$t('passwordLeastLowerLetter'),
        (v) => /^(?=.*?[0-9])/.test(v) || this.$t('passwordLeastDigit'),
        (v) =>
          /^(?=.*?[#?!@$%^&*-.])/.test(v) ||
          this.$t('passwordSpecialCharacter') + ' ' + '(#?!@$%^&*-.)',
        (v) => /^.{8,}/.test(v) || this.$t('passwordMinimumLength'),
      ],
      passwordConfirmRules: [
        (v) => !!v || this.$t('confirmPasswordRequired'),
        (v) => v === this.newUserPass || this.$t('passwordNotMatch'),
      ],
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
    local_needToSave() {
      return this.newUserPass && this.newUserPassConfirm && this.userPassActual
    },

    needToSave: {
      get() {
        return this.$store.state.needToSave
      },
      set(val) {
        this.$store.commit('set_needToSave', val)
      },
    },
  },

  methods: {
    handleFocus(index) {
      this.$nextTick(() => {
        this.$refs.newUserFormPassword.$el[index].focus()
      })
    },
    handleFocusBtnActions() {
      setTimeout(() => {
        this.$refs.btnSend.$el.focus()
      }, 200)
    },

    async handleSavePassword(ref) {
      if (!this.$refs[ref].validate()) {
        return
      }
      if (this.userPassActual === '') {
        this.$refs[ref].validate()

        return
      }
      this.loadingPassword = true
      try {
        const user = auth.currentUser
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          this.userPassActual
        )

        await reauthenticateWithCredential(user, credential)
        this.$store.dispatch('auth/update_password', this.newUserPass)
        this.loadingPassword = false
        this.$refs[ref].reset()
        this.$mainAlertSuccess(this.$t('successPasswordUpdated'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error-code: ', error.code)
        this.loadingPassword = false

        if (error.code === 'auth/wrong-password') {
          this.$mainAlertError(this.$t('invalidPassword'))
          this.$refs[ref].reset()
        } else {
          this.$mainAlertError(this.$t('embarrassingError'))
        }
      }
    },

    logout() {
      signOut(auth)
        .then(() => {
          this.$router.replace('/login')
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error)
        })
    },

    handleCancelPassword(ref) {
      this.$refs[ref].reset()
    },
  },
}
</script>

<style lang="scss" scoped></style>
