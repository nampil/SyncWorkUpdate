<template>
  <div class="noti-container">
    <div class="noti-header | d-flex justify-space-between align-center">
      <h5 class="text-h6">{{ noti.title }}</h5>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            color="error"
            v-bind="attrs"
            v-on="on"
            @click="$emit('delete')"
          >
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
        <span> {{ $t('deleteNotification') }}</span>
      </v-tooltip>
    </div>
    <div class="noti-body mb-2">
      <p class="ma-0">
        {{ noti.body }}
      </p>

      <div v-if="!noti.responded" class="actions">
        <v-btn text small @click="handleConfirmation('Yes')">{{
          $t('yes')
        }}</v-btn>
        <v-btn text small @click="handleConfirmation('No')">No</v-btn>
      </div>
      <div v-else class="response">
        <p>{{ $t('yourResponceWas') }}: {{ noti.response }}</p>
      </div>

      <div class="noti-meta">
        <p
          class="ma-0 grey--text text--darken-2 font-weight-light text-caption text-right"
        >
          {{ noti.createdAt }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotiWithAction',

  props: {
    noti: { type: Object, default: () => ({}) },
  },
  computed: {
    user() {
      return this.$store.state.auth.user.profile
    },
  },
  methods: {
    async handleConfirmation(response) {
      const sendNoti = this.$store.dispatch('admin/users/sendMessage', {
        users: [this.noti.extraData.sender.uid],
        message: {
          title: `${this.user.name} response`,
          body: `Question: "${this.noti.body}", \nResponse: ${response}`,
        },
        type: 'ADMIN',
        sendMessageInApp: true,
      })
      const updateNoti = this.$store.dispatch(
        'auth/set_notificationResponded',
        {
          notiId: this.noti.id,
          responded: true,
          response,
        }
      )

      await Promise.all([sendNoti, updateNoti])
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped>
.info-to-delete {
  .img-container {
    width: 150px;
    img {
      width: 100%;
      height: auto;
      object-fit: cover;
      cursor: pointer;
    }
  }
}
// .authorized {
// }
</style>
