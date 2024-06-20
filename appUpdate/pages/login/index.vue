<template>
  <div class="login-wrapper | d-flex align-center justify-center">
    <v-card max-width="400">
      <v-card-title>
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
                  label="Email"
                  variant="outlined"
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
                  label="Password"
                  variant="outlined"
                  dense
                  hide-details="auto"
                  prepend-inner-icon="mdi-lock-outline"
                  @focus="hasError = false"
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="text-center pb-6 pt-1">
                <v-btn color="primary" block :loading="loading" @click="login"
                  >Login</v-btn
                >
              </v-col>
              <v-col v-if="hasError" cols="12" class="text-center">
                <div class="errors red--text">
                  {{ errorMessage }}
                </div>
              </v-col>
              <v-col>
                <v-btn
                  class="info--text forgot text-center"
                  variant="plain"
                  size="small"
                  :ripple="false"
                  @click="showResetPassword = !showResetPassword"
                >
                  Forgot Password
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@@/store/auth'

definePageMeta({
  title: 'Login',
  meta: [{ name: 'description', content: 'Login to your account' }],
  layout: 'auth',
})

const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const showResetPassword = ref(false)

const login = async () => {
  try {
    loading.value = true
    await authStore.login(email.value, password.value)
  } catch (error) {
    hasError.value = true
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-wrapper {
  min-height: 100dvh;
}
</style>
