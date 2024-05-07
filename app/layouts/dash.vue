<template>
  <v-app>
    <dash-bar :is-admin="false" />
    <v-main class="dash-main">
      <v-container fluid class="dash-container pa-0">
        <Nuxt />
      </v-container>
    </v-main>
    <permision-for-push-notificacion-modal
      v-if="askForPermissionForNotifications"
      @close="handleClose"
    />
    <v-footer absolute app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
    <add-new-orders />
    <alert />
    <v-dialog v-model="showSendNotificationModal" max-width="600px" scrollable>
      <SendNotification v-if="showSendNotificationModal"></SendNotification>
    </v-dialog>
    <Chats />
    <v-snackbar v-model="showLoadingDownload" :timeout="-1">
      {{ text }}
      <!-- eslint-disable-next-line -->
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="closeSnackbar()">
          {{ $t('close') }}
        </v-btn>
      </template>
    </v-snackbar>
    <!-- <v-overlay v-if="mainLoading">
      <v-progress-circular indeterminate :value="20"></v-progress-circular>
    </v-overlay> -->

    <loader-overlay v-if="mainLoading" />
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
import DashBar from '../components/dashBar/DashBar.vue'
import AddNewOrders from '../components/orders/AddNewOrders.vue'
import Alert from '../components/misc/Alert.vue'
import Chats from '../components/chats/Chat.vue'
import PermisionForPushNotificacionModal from '@/components/misc/PermisionForPushNotificacionModal.vue'
import SendNotification from '~/components/notifications/SendNotification.vue'
import LoaderOverlay from '~/components/misc/LoaderOverlay.vue'

export default {
  name: 'DefaultLayout',
  components: {
    DashBar,
    AddNewOrders,
    Alert,
    Chats,
    PermisionForPushNotificacionModal,
    SendNotification,
    LoaderOverlay,
  },
  middleware: ['auth'],

  data() {
    return {
      showPermissionForPushNotiModal: false,
      text: 'Preparing Downloads...',
    }
  },
  computed: {
    ...mapState({
      needToSave: (state) => state.needToSave,
      askForPermissionForNotifications: (state) =>
        state.auth.askForPermissionForNotifications,
      mainLoading: (state) => state.mainLoading,
    }),
    showSendNotificationModal: {
      set(payload) {
        this.$store.commit('set_showSendNotificationModal', payload)
      },
      get() {
        return this.$store.state.showSendNotificationModal
      },
    },
    showLoadingDownload() {
      return this.$store.state.oos.routes.showLoadingDownload
    },
  },
  watch: {
    needToSave(val) {
      if (val) {
        addEventListener('beforeunload', this.beforeUnloadListener, {
          capture: true,
        })
      } else {
        removeEventListener('beforeunload', this.beforeUnloadListener, {
          capture: true,
        })
      }
    },
  },
  beforeMount() {
    const modeSaved = window.localStorage.getItem('themeMode')
    if (modeSaved && modeSaved !== 'system') {
      this.$vuetify.theme.dark = modeSaved === 'dark'
      return
    }

    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme)').media !== 'not all'
    ) {
      // if user prefers light mode switch to light mode
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        this.$vuetify.theme.dark = false
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.$vuetify.theme.dark = true
      }
    }
  },
  created() {
    this.$store.commit('setDrawer', false)
  },
  methods: {
    handleClose() {
      this.$store.commit('auth/set_askForPermissionForNotifications', false)
      setTimeout(() => {
        const permission = Notification.permission

        if (
          permission !== 'granted' &&
          !this.askForPermissionForNotifications
        ) {
          this.$store.commit('auth/set_askForPermissionForNotifications', true)
        }
      }, 3000)
    },
    beforeUnloadListener(event) {
      event.preventDefault()
      return (event.returnValue = 'Did you save your work?')
    },
    closeSnackbar() {
      this.$store.commit('oos/routes/set_showLoadingDownload', false)
    },
  },
}
</script>
<style></style>
