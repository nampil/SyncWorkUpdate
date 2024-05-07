<template>
  <v-card class="elevation-0">
    <v-toolbar color="primary" dense>
      <v-toolbar-title class="d-flex aling-center">
        <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
        <span class="ma-0 text-h5 white--text">{{
          $t('alertTitle')
        }}</span></v-toolbar-title
      >
    </v-toolbar>
    <v-card-text class="pt-7 pb-5 text-center">
      <span class="text-body-1"> {{ $t('alertTextChat') }} {{ type }}</span>
    </v-card-text>

    <v-card-actions class="d-flex justify-end pa-4">
      <v-btn
        class="mr-4"
        color="error"
        dense
        outlined
        :disabled="loading"
        @click="closeDelete"
        >{{ $t('cancel') }}</v-btn
      >
      <v-btn
        class="mr-4"
        dense
        color="secondary"
        :loading="loading"
        @click="deleteConfirmChatRoom()"
        >{{ $t('delete') }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    type: { type: String, default: '' },
  },
  data() {
    return {
      dialogDelete: false,
      loading: false,
    }
  },
  computed: {
    roomSelected: {
      get() {
        return this.$store.state.chats.roomSelected
      },
      set(val) {
        this.$store.commit('chats/set_roomSelected', val)
      },
    },
  },

  methods: {
    async deleteConfirmChatRoom() {
      this.loading = true
      try {
        await this.$store.dispatch('chats/delete_chatRoom', {
          chatRoomId: this.roomSelected,
        })
        this.loading = false
        this.closeDelete()
        this.$mainAlertSuccess(this.$t('successDeleteChatRoom'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error geting chats', error)
        this.loading = false
        this.closeDelete()
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    closeDelete() {
      this.dialogDelete = false
      this.$emit('close')
    },
  },
}
</script>

<style>
</style>