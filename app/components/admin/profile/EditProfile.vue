<template>
  <div class="container-card">
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="elevation-0">
          <v-toolbar dense dark color="secondary" class="elevation-0">
            <v-toolbar-title class="d-flex aling-center">
              <v-icon class="mr-4">mdi-pencil</v-icon>

              <span class="ma-0 text-h5 dark--text">
                {{ $t('editProfile') }} </span
              ><v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer
            ></v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <v-container>
              <v-form ref="newUserForm">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      id="name"
                      v-model="newUserName"
                      :label="$t('name')"
                      autofocus
                      outlined
                      hide-details="auto"
                      dense
                      required
                      validate-on-blur
                      :rules="nameRules"
                      @keydown.enter.exact.prevent
                      @keyup.enter.exact="handleFocus(3)"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      id="lastName"
                      v-model="newUserLastName"
                      :label="$t('lastName')"
                      outlined
                      hide-details="auto"
                      dense
                      required
                      validate-on-blur
                      :rules="lastNameRules"
                      @keydown.enter.exact.prevent
                      @keyup.enter.exact="handleFocusBtnActions()"
                    ></v-text-field>
                  </v-col>

                  <v-col col="12" class="text-leht">
                    <v-btn
                      color="error"
                      outlined
                      class="mr-4"
                      :disabled="loading || !local_needToSave"
                      @click="handleCancel('newUserForm')"
                      >{{ $t('cancel') }}</v-btn
                    >
                    <v-btn
                      ref="btnSend"
                      color="secondary"
                      :loading="loading"
                      :disabled="!local_needToSave"
                      @click="handleSave('newUserForm')"
                      >{{ $t('send') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="4" md="4">
        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <v-avatar color="primary" size="136" style="overflow: visible">
                <v-form ref="avatarForm">
                  <v-file-input
                    v-model="file"
                    class="pencil"
                    dense
                    hide-input
                    :rules="rules"
                    accept="image/png, image/jpeg, image/bmp"
                    prepend-icon="mdi-camera"
                    @change="handleInputFiles($event, 'avatarForm')"
                  ></v-file-input>
                </v-form>
                <img
                  v-if="image != null"
                  :src="image"
                  style="object-fit: cover"
                />

                <span v-else class="white--text text-h5">{{
                  user.profile.name.charAt(0) + user.profile.lastName.charAt(0)
                }}</span>
              </v-avatar>

              <h3 class="mt-4">{{ user.profile.fullName }}</h3>
              <p class="text-caption mt-2">
                {{ user.profile.email }}
              </p>

              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text @click="logout">{{
                $t('logout')
              }}</v-btn>
            </div>
          </v-list-item-content>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { signOut } from 'firebase/auth'
import { auth } from '@/plugins/firebase'

export default {
  name: 'EditProfile',

  data() {
    return {
      image: null,
      loading: false,
      avatar: {},
      file: null,
      newUserName: '',
      newUserLastName: '',
      nameRules: [(v) => !!v || this.$t('nameRequired')],
      lastNameRules: [(v) => !!v || this.$t('lastNameRequired')],
      rules: [
        (value) => !value || value.size < 2000000 || this.$t('avatarRequired'),
      ],
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),

    local_needToSave() {
      return (
        this.baseProfile.name !== this.newUserName ||
        this.baseProfile.lastName !== this.newUserLastName ||
        (!this._.isEqual(this.baseProfile.avatar, this.avatar) &&
          JSON.stringify(this.avatar) !== '{}')
      )
    },
    baseProfile() {
      return this.$store.state.auth.user.profile
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
    local_needToSave: {
      handler(val) {
        this.needToSave = val
      },
      immediate: true,
    },
  },
  mounted() {
    this.initialize()
  },
  methods: {
    handleFocus(index) {
      this.$nextTick(() => {
        this.$refs.newUserForm.$el[index].focus()
      })
    },
    handleFocusBtnActions() {
      this.$refs.btnSend.$el.focus()
    },
    initialize() {
      this.newUserName = this.user.profile.name
      this.newUserLastName = this.user.profile.lastName
      this.newUserEmail = this.user.profile.email
      this.file = null
      this.image = this.user.profile.avatar
        ? this.user.profile.avatar.url
        : null
      this.avatar = { ...this.user.profile.avatar }
    },

    async handleSave(ref) {
      if (!this.$refs[ref].validate()) {
        return
      }
      try {
        this.loading = true

        const userProfileToUpdate = {
          name: this.newUserName,
          lastName: this.newUserLastName,
          fullName: `${this.newUserName} ${this.newUserLastName}`,

          file: this.file,
          avatar: this.avatar,
        }

        // if(this.newUserPass){

        // await this.reauthenticateUser()

        // }

        // Si el usuario quiere cambiar el password, debemos pedirle el password original. Puede ser en un modal
        // TODO: Hacer un modal que le pida al usuario rescribir su password y ejecute la funcion reauthenticateUser pasando el password del usuario
        // Al retornar de reauthenticateUser, se debe terminar de ejecutar esta funcion.

        await this.$store.dispatch('auth/update_profile', {
          rawUserProfileToUpdate: userProfileToUpdate,
          isEqual: this._.isEqual,
        })

        this.loading = false
        this.$mainAlertSuccess(this.$t('successProfileUpdated'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error-code: ', error.code)
        this.loading = false
        this.$mainAlertError(this.$t('embarrassingError'))
      }
    },

    handleInputFiles(file, ref) {
      if (!file) {
        this.file = []
      }
      if (!this.$refs[ref].validate()) {
        return
      }
      if (!file) {
        return
      }

      this.image = URL.createObjectURL(file)
      const codeName = this.user.profile.uid

      file.codeName = codeName
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target.result
        this.avatar = {
          url,
          type: file.type,
          codeName: file.codeName,
        }
      }
      reader.readAsDataURL(file)
      setTimeout(() => {
        this.$refs.btnSend.$el.focus()
      }, 200)
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
    handleCancel(ref) {
      this.$refs[ref].resetValidation()
      this.initialize()
    },
  },
}
</script>

<style lang="scss" scoped>
.container-card {
  margin-bottom: -1.5rem;
}
.pencil {
  position: absolute;
  bottom: 4px;
  right: 0;

  background-color: var(--v-icon_camera-base);
  border-radius: 100%;
  z-index: 1;
  padding: 0px 2px 5px 4px;
}
</style>
