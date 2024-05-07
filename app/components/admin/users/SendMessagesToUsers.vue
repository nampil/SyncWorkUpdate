<template>
  <v-card class="mb-6">
    <v-toolbar flat dense dark color="secondary">
      <v-toolbar-title> {{ $t('sendMessageToUsers') }}</v-toolbar-title>
    </v-toolbar>
    <!-- <v-card-title class="primary--text">
     
    </v-card-title> -->
    <v-card-text>
      <v-form ref="sendMessageForm">
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="usersToSend"
              :label="$t('SendTo')"
              :items="users"
              item-text="fullName"
              item-value="uid"
              autocomplete
              :rules="selectRules"
              outlined
              multiple
              dense
              hide-details="auto"
              @change="handleFocus(4)"
            ></v-select>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="title"
              :label="$t('title')"
              outlined
              :rules="rules"
              dense
              hide-details="auto"
              @keydown.enter.exact.prevent
              @keyup.enter.exact="handleFocus(6)"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="body"
              :label="$t('body')"
              :rules="rules"
              outlined
              dense
              @keydown.enter.exact.prevent
              @keyup.enter.exact="handleFocusBtnActions()"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="error"
        class="mr-2 mb-4"
        outlined
        :disabled="!title && !body && !usersToSend.length"
        @click="handleCancel"
        >{{ $t('cancel') }}</v-btn
      >
      <v-btn
        ref="btnSend"
        color="secondary"
        class="mr-2 mb-4"
        :loading="loading"
        :disabled="!title || !body"
        @click="handleSend"
        >{{ $t('send') }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'SendMessagesToUsers',
  props: {
    users: { type: Array, default: () => [] },
  },
  data() {
    return {
      loading: false,
      usersToSend: [],
      title: null,
      body: null,
    }
  },
  computed: {
    rules() {
      return [(v) => !!v || this.$t('thisFieldRequired')]
    },
    selectRules() {
      return [(v) => v.length > 0 || this.$t('thisFieldRequired')]
    },
  },
  methods: {
    handleCancel() {
      this.$refs.sendMessageForm.reset()
    },
    handleFocus(index) {
      this.$nextTick(() => {
        this.$refs.sendMessageForm.$el[index].focus()
      })
    },
    handleFocusBtnActions() {
      setTimeout(() => {
        this.$refs.btnSend.$el.focus()
      }, 200)
    },

    async handleSend() {
      if (!this.$refs.sendMessageForm.validate()) return
      try {
        this.loading = true

        await this.$store.dispatch('admin/users/sendMessage', {
          users: this.usersToSend,
          message: { title: this.title, body: this.body },
          type: 'ADMIN',
          sendMessageInApp: true,
        })

        this.$refs.sendMessageForm.reset()

        this.loading = false
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error sending messages: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
