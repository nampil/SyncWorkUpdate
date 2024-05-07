<template>
  <div class="mb-6">
    <v-row>
      <v-col cols="8">
        <v-divider></v-divider>

        <v-card class="elevation-0 mt-7">
          <v-toolbar dark flat dense color="secondary" class="elevation-0">
            <v-toolbar-title class="d-flex aling-center">
              <v-icon class="mr-4">mdi-translate-variant</v-icon>

              <span class="ma-0 text-h5">{{ $t('language') }}</span
              ><v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer
            ></v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="FormLanguage">
              <v-row>
                <v-col cols="12">
                  <span>
                    <img
                      :class="{ active: active, 'button-img': !active }"
                      src="~/assets/es.png"
                      @click="handleLanguage('es')"
                    />
                  </span>
                  <span class="mx-4">
                    <img
                      :class="{ active: !active, 'button-img': active }"
                      src="~/assets/en.png"
                      @click="handleLanguage('en')"
                    />
                  </span>
                </v-col>
                <v-col col="12" class="text-leht">
                  <v-btn
                    color="error"
                    outlined
                    class="mr-4"
                    :disabled="loadingLanguage || !local_needToSave"
                    @click="handleCancelLenguage('FormLanguage')"
                    >{{ $t('cancel') }}</v-btn
                  >
                  <v-btn
                    ref="btnSend"
                    color="secondary"
                    :loading="loadingLanguage"
                    :disabled="!local_needToSave"
                    @v-on:keyup.enter="handleSaveLanguage('FormLanguage')"
                    @click="handleSaveLanguage('FormLanguage')"
                    >{{ $t('send') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// import { signOut } from 'firebase/auth'
// import { auth } from '@/plugins/firebase'

export default {
  name: 'LanguagePreference',
  data() {
    return {
      active: true,
      language: null,
      loadingLanguage: false,
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
    local_needToSave() {
      if (this.user.preferences && this.user.preferences.language === 'es') {
        return !this.active && !this.language !== null
      } else {
        return this.active && this.language !== null
      }
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
  watch: {
    user: {
      handler() {
        this.initialize()
      },
      deep: true,
    },
    language(value) {
      if (value) {
        this.$i18n.setLocale('es')
        this.$vuetify.lang.current = 'es'
        this.$vuetify.lang.defaultLocale = 'es'
        this.active = true
      } else {
        this.$i18n.setLocale('en')
        this.$vuetify.lang.current = 'en'
        this.$vuetify.lang.defaultLocale = 'en'
        this.active = false
      }
    },
  },
  mounted() {
    this.initialize()
  },
  methods: {
    initialize() {
      this.language = this.$i18n.getLocaleCookie() === 'es'
    },
    handleFocusBtnActions() {
      setTimeout(() => {
        this.$refs.btnSend.$el.focus()
      }, 200)
    },
    async handleSaveLanguage(ref) {
      if (!this.$refs[ref].validate()) {
        return
      }

      try {
        this.loadingLanguage = true

        const userProfileLanguage = this.language ? 'es' : 'en'

        await this.$store.dispatch('auth/set_profileLanguage', {
          userProfileLanguage,
        })

        this.loadingLanguage = false
        this.$mainAlertSuccess(this.$t('languageSaved'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error-code: ', error)
        this.loadingLanguage = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    handleLanguage(ref) {
      this.language = ref === 'es'

      this.handleFocusBtnActions()
    },

    handleCancelLenguage(ref) {
      this.language =
        this.user.preferences && this.user.preferences.language === 'es'
    },
  },
}
</script>

<style lang="scss" scoped>
.button-img {
  border-radius: 100%;
  cursor: pointer;
  display: inline-block;
  -webkit-filter: grayscale(60%);
  filter: grayscale(60%);
}
.button-img:hover {
  -webkit-filter: grayscale(0%);
  filter: grayscale(0%);
}
.active:hover {
  border-radius: 100%;
  cursor: pointer;
  display: inline-block;
  -webkit-filter: grayscale(0%);
  filter: grayscale(0%);
}
</style>
