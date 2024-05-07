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
      <span class="text-body-1">
        {{ $t('alertTextChatLeave') }}
      </span>
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
        @click="deleteConfirmLeaveGroup()"
        >{{ $t('leave') }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      dialogSalir: false,
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
    ...mapState({
      user: (state) => state.auth.user,
    }),
  },
  methods: {
    async deleteConfirmLeaveGroup() {
      /* Salir Grupo */
      this.loading = true
      try {
        await this.$store.dispatch('chats/leave_Group', {
          chatRoomId: this.roomSelected,
          userId: this.user.profile.uid,
        })
        this.loading = false
        this.closeDelete()
        this.$mainAlertSuccess(this.$t('successLeaveGroup'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error geting chats', error)
        this.loading = false
        this.closeDelete()
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    closeDelete() {
      this.dialogSalir = false
      this.$emit('close')
    },
  },
}
</script>

<style>
</style>