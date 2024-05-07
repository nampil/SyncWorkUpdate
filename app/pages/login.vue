<template>
  <v-row justify="center" align="center">
    <v-col cols="12" class="d-flex align-center justify-center">
      <v-card max-width="400" class="elevation-6">
        <v-card-title primary-title class="justify-center primary">
          <h1 class="logo | text-h4 accent--text">
            <span class="font-weight-bold">Sync</span>
            <span class="subtitle">Work</span>
            <span class="font-weight-bold ml-2">365</span>
          </h1>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form ref="loginForm">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    id="user"
                    v-model="email"
                    name="user"
                    :label="$t('user')"
                    outlined
                    autofocus
                    dense
                    hide-details="auto"
                    prepend-inner-icon="mdi-email-outline"
                    @focus="hasError = false"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    id="pass"
                    v-model="password"
                    class="pb-2"
                    type="password"
                    name="pass"
                    :label="$t('password')"
                    outlined
                    dense
                    hide-details="auto"
                    prepend-inner-icon="mdi-lock-outline"
                    @focus="hasError = false"
                  ></v-text-field>
                  <span
                    class="info--text forgot"
                    @click="showResetPassword = !showResetPassword"
                    >{{ $t('forgotPassword?') }}</span
                  >
                </v-col>
                <v-col cols="12" class="text-center pb-6 pt-1">
                  <v-btn
                    color="primary"
                    block
                    :loading="loading"
                    @click="login"
                    >{{ $t('login') }}</v-btn
                  >
                </v-col>
                <v-col v-if="hasError" cols="12" class="text-center">
                  <div class="errors red--text">
                    {{ errorMessage }}
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
    <v-dialog
      v-model="showResetPassword"
      max-width="400"
      persistent
      transition="dialog-transition"
    >
      <reset-password @close="showResetPassword = false"></reset-password>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../plugins/firebase'
import ResetPassword from '@/components/admin/users/ResetPassword.vue'

export default {
  name: 'IndexPage',
  components: { ResetPassword },

  layout: 'default',
  data() {
    return {
      loading: false,
      email: '',
      password: '',
      hasError: false,
      errorMessage: '',
      showResetPassword: false,
    }
  },
  head() {
    return {
      title: 'Login',
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
  },
  watch: {
    user: {
      handler(newVal) {
        if (newVal.userCredential.uid) {
          const goTo = window.localStorage.getItem('goTo')

          if (goTo) {
            window.localStorage.removeItem('goTo')
            this.$router.replace(goTo)
          } else {
            this.$router.replace('/')
          }
        }
      },
      deep: true,
    },
  },

  methods: {
    async login() {
      try {
        this.loading = true
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.$store.dispatch('auth/handleAuth')

        this.$refs.loginForm.reset()
        this.loading = false

        // this.email = ''
        // this.password = ''
        // this.$store.commit('auth/set_user_credential', user)
        // await this.$store.dispatch('auth/get_userData', user.uid)
      } catch (error) {
        this.loading = false
        this.hasError = true
        this.errorMessage = error.message || error
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.forgot {
  font-weight: bold;
  font-size: 0.8rem;
}
.forgot:hover {
  text-decoration: underline;
  cursor: pointer;
}
.logo,
span {
  float: left;
}
</style>
