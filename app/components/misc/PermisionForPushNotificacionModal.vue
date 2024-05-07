<template>
  <div class="push-noti-modal">
    <v-card max-width="600">
      <v-card-title primary-title>
        <p>
          <v-icon>mdi-bell</v-icon>
          {{ $t('acceptNotificationTitle') }}
        </p>
      </v-card-title>
      <v-card-text>
        {{ $t('acceptNotificationText') }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="error" @click="$emit('close')">{{
          $t('cancel')
        }}</v-btn>
        <v-btn
          text
          color="secondary"
          :loading="loading"
          @click="requestPermission"
          >Ok</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'PermissionForPushNotificationModal',
  data() {
    return {
      loading: false,
    }
  },

  methods: {
    async requestPermission() {
      try {
        this.loading = true
        await this.$store.dispatch('auth/handle_permissionForPushNotifications')
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log('error in requestPermission: ', error)
        this.$mainAlertError(this.$t('embarrassingError'))
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.push-noti-modal {
  position: absolute;
  top: 25px;
  right: 25px;
  z-index: 999;
}
</style>
