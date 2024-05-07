<template>
  <v-card v-if="userSelected" class="container-user-info">
    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="12" class="text-caption">
          <p class="ma-0">
            <span class="info--text">{{ $t('name') }}:</span>
            {{ userSelected.name }}
          </p>
          <p class="ma-0">
            <span class="info--text">{{ $t('lastName') }}:</span>
            {{ userSelected.lastName }}
          </p>
          <p class="ma-0">
            <span class="info--text">{{ $t('fullName') }}:</span>
            {{ userSelected.fullName }}
          </p>
          <p class="ma-0">
            <span class="info--text">{{ $t('email') }}:</span>
            {{ userSelected.email }}
          </p>
          <p class="ma-0">
            <span class="info--text">{{ $t('role') }}:</span>
            {{ userSelected.rol }}
          </p>
          <div class="d-flex pt-2">
            <GoogleMap
              v-if="
                datesUserAdmin &&
                datesUserAdmin.location &&
                datesUserAdmin.location.latitude &&
                datesUserAdmin.location.longitude
              "
              class="map"
              :latitude="datesUserAdmin.location.latitude"
              :longitude="datesUserAdmin.location.longitude"
              :title="$t('user')"
              :clickable="false"
              :draggable="false"
            />
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        v-if="!isSameUser && userClaims?.authLevel > 7"
        text
        small
        color="error"
        :loading="removing"
        @click="removeUser"
      >
        Remove</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { getGoogleMapsAPI } from 'gmap-vue'
import GoogleMap from '../misc/GoogleMap.vue'
export default {
  name: 'UserInfo',
  components: { GoogleMap },
  props: {
    userUid: { type: String, default: '' },
    route: { type: Object, required: true },
  },
  data() {
    return { datesUserAdmin: {}, loading: false, removing: false }
  },

  computed: {
    google: getGoogleMapsAPI,
    user() {
      return this.$store.state.auth.user.profile
    },
    userClaims() {
      return this.$store.state.auth.user.userCredential.claims
    },
    users() {
      return this.$store.state.users.users
    },
    userSelected() {
      const indexOfUser = this.users.map((u) => u.uid).indexOf(this.userUid)
      if (indexOfUser === -1) return {}
      return this.users[indexOfUser]
    },
    isSameUser() {
      return this.user.uid === this.userUid
    },
  },
  watch: {
    userUid: {
      handler(val) {
        this.get_userUid()
        this.get_datesAdminUserUid()
      },
      immediate: true,
    },
  },

  methods: {
    async removeUser() {
      try {
        this.removing = true

        await this.$store.dispatch('oos/routes/remove_oos_supervisor', {
          routeId: this.route.id,
          supervisorUid: this.userUid,
        })
        this.$emit('close')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)

        this.$mainAlertError('Error removing user from route')
      } finally {
        this.removing = false
      }
    },
    async get_userUid() {
      if (this.users.map((u) => u.uid).includes(this.userUid)) {
        return
      }

      this.loading = true
      try {
        await this.$store.dispatch('users/get_usersById', {
          usersIds: [this.userUid],
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    async get_datesAdminUserUid() {
      this.loading = true
      try {
        const datesAdmin = await this.$store.dispatch('users/get_datesAdmin', {
          userUid: this.userUid,
        })

        this.datesUserAdmin = datesAdmin || {}
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.map {
  max-height: 200px;
  min-width: 100%;
}
</style>
