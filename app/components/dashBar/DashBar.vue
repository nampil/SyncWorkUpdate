<template>
  <div>
    <v-app-bar fixed app dense color="primary">
      <div class="pa-2 pl-1 mr-6 logo accent--text">
        <h1>
          <span class="font-weight-bold">Sync</span>
          <span class="subtitle">Work</span>
          <span class="font-weight-bold ml-1">365</span>
        </h1>
      </div>

      <div>
        <v-btn
          to="/"
          x-small
          router
          class="mr-2 btn-text elevation-0"
          color="primary"
        >
          Home
        </v-btn>
        <v-btn
          to="/dispatching"
          x-small
          router
          class="mr-2 btn-text elevation-0"
          color="primary"
        >
          Dispatching
        </v-btn>

        <v-menu offset-y open-on-hover>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              x-small
              class="mr-2 btn-text elevation-0"
              color="primary"
              nuxt
              to="/cdp"
              v-bind="attrs"
              v-on="on"
            >
              CDP
            </v-btn>
          </template>
          <v-list nav dense>
            <v-list-item exact nuxt to="/cdp">
              <v-list-item-title>Dashboard</v-list-item-title>
            </v-list-item>
            <v-list-item exact nuxt to="/cdp/history">
              <v-list-item-title>History</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          to="/admin"
          x-small
          router
          class="mr-2 btn-text elevation-0"
          color="primary"
        >
          Admin
        </v-btn>
        <v-btn
          x-small
          router
          class="mr-2 btn-text elevation-0"
          color="primary"
          nuxt
          :to="{ name: 'search' }"
        >
          Search
        </v-btn>
      </div>

      <v-spacer></v-spacer>

      <v-badge
        :value="unreadChatsCount > 0"
        right
        color="error"
        :content="unreadChatsCountContent"
        class="mr-2"
        :offset-x="15"
        :offset-y="15"
      >
        <v-tooltip open-delay="600" content-class="small" left>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              class="white--text mr-1"
              small
              v-bind="attrs"
              v-on="on"
              @click="handleShowChat"
            >
              <v-icon size="20">mdi-message-text</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('messages') }}</span>
        </v-tooltip>
      </v-badge>
      <v-badge
        :value="unreadNotifications.length > 0"
        right
        color="error"
        overlap
        :content="notificationBadgeContent"
        class="mr-2"
        :offset-x="15"
        :offset-y="15"
      >
        <v-tooltip open-delay="600" content-class="small" left>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              content="notificationBadgeContent"
              class="white--text mr-1"
              small
              v-bind="attrs"
              v-on="on"
              @click.stop="showNotifications = !showNotifications"
            >
              <v-icon size="20">mdi-bell</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('notifications') }}</span>
        </v-tooltip>
      </v-badge>

      <v-menu offset-y min-width="150">
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip open-delay="600" content-class="small" left>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                class="white--text mr-3"
                icon
                small
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
                ><v-icon size="20">mdi-brightness-4</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('themes') }}</span>
          </v-tooltip>
        </template>

        <v-list>
          <v-list-item-group v-model="themeSelected" color="primary">
            <v-list-item
              v-for="item in themeOptions"
              :key="item.key"
              @click.prevent="switchTheme(item.value)"
            >
              <v-list-item-title>{{ item.key }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>

      <div class="userName my-0 mr-3 white--text">
        {{ user.profile.name }}
      </div>

      <v-menu bottom min-width="200px" rounded offset-y>
        <!-- eslint-disable-next-line  -->
        <template v-slot:activator="{ on }">
          <v-btn icon large v-on="on">
            <v-avatar color="accent" size="32">
              <img
                v-if="user.profile.avatar"
                style="object-fit: cover"
                :src="user.profile.avatar.url"
              />

              <span v-else class="info--text text-h7">{{
                user.profile.name.charAt(0) + user.profile.lastName.charAt(0)
              }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <v-avatar color="accent">
                <img
                  v-if="user.profile.avatar"
                  style="object-fit: cover"
                  :src="user.profile.avatar.url"
                />

                <span v-else class="info--text text-h5">{{
                  user.profile.name.charAt(0) + user.profile.lastName.charAt(0)
                }}</span>
              </v-avatar>
              <h3 class="mt-2">{{ user.profile.fullName }}</h3>
              <p class="text-caption mt-1">
                {{ user.profile.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed text to="/profile">
                {{ $t('editAcount') }}
              </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed text @click="logout">
                {{ $t('logout') }}
              </v-btn>
            </div>
          </v-list-item-content>
        </v-card>
      </v-menu>

      <v-menu bottom min-width="200px" rounded offset-y>
        <!-- eslint-disable-next-line  -->
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip open-delay="600" content-class="small" left>
            <!-- eslint-disable-next-line  -->
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                class="white--text mr-1"
                icon
                small
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
              >
                <v-icon size="20">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('moreActions') }}</span>
          </v-tooltip>
        </template>
        <v-list>
          <v-list-item @click="handleShowSendNotificationModal">
            <v-list-item-title
              ><v-icon class="mr-2 mb-1" dense>mdi-bell-plus</v-icon
              >{{ $t('sendNotification') }}</v-list-item-title
            >
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-fade-transition>
      <notifications
        v-if="showNotifications"
        :show="showNotifications"
        @close-notifications="showNotifications = false"
      />
    </v-fade-transition>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Notifications from '../notifications/Notifications.vue'

export default {
  name: 'DashBar',
  components: { Notifications },
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      showNotifications: false,
      themeSelected: '',
      themeOptions: [
        { key: 'Dark', value: 'dark' },
        { key: 'Light', value: 'light' },
        { key: 'System', value: 'system' },
      ],
    }
  },

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      notifications: (state) => state.auth.notifications,
    }),
    ...mapGetters('chats', ['unreadChatsCount']),
    unreadNotifications() {
      return this.notifications.filter((noti) => noti.read === false)
    },
    notificationBadgeContent() {
      if (this.unreadNotifications > 9) {
        return '9+'
      } else {
        return this.unreadNotifications.length
      }
    },
    unreadChatsCountContent() {
      if (this.unreadChatsCount > 9) {
        return '9+'
      } else {
        return this.unreadChatsCount
      }
    },

    itemsFormatted() {
      return [
        {
          icon: 'mdi-apps',
          title: this.$t('home'),
          to: '/',
        },
        {
          icon: 'mdi-van-utility',
          title: this.$t('dispatching'),
          to: '/dispatching',
        },
        {
          icon: 'mdi-alpha-o-circle-outline',
          title: 'CDP',
          to: '/cdp',
        },
        {
          icon: 'mdi-apps',
          title: 'Admin',
          to: '/admin',
        },
      ]
    },
  },
  watch: {
    user: {
      handler() {
        this.cambioLanguage()
      },
      deep: true,
    },
  },

  mounted() {
    this.cambioLanguage()
    this.setThemeSelected()
  },
  methods: {
    handleShowSendNotificationModal() {
      this.$store.commit('set_showSendNotificationModal', true)
    },
    setThemeSelected() {
      const themeInStorage = window.localStorage.getItem('themeMode')
      const isAnOption = this.themeOptions
        .map((t) => t.value)
        .includes(themeInStorage)
      if (themeInStorage && isAnOption) {
        this.themeSelected = this.themeOptions.findIndex(
          (t) => t.value === themeInStorage
        )
      }
    },
    switchTheme(themeSelected) {
      switch (themeSelected) {
        case 'dark':
          this.$vuetify.theme.dark = true
          break
        case 'light':
          this.$vuetify.theme.dark = false
          break
        case 'system':
          this.setThemeModeBySystem()
          break
      }

      window.localStorage.setItem('themeMode', themeSelected)
      // this.setThemeSelected()
    },
    setThemeModeBySystem() {
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
    handleShowChat() {
      this.$store.commit('chats/toggleShowChats')
    },
    cambioLanguage() {
      let language = 'en'

      if (this.user.preferences && this.user.preferences.language) {
        language = this.user.preferences.language
      }

      this.$i18n.setLocale(language)
      this.$vuetify.lang.current = language
      this.$vuetify.lang.defaultLocale = language
    },

    async logout() {
      await this.$store.dispatch('auth/handle_logout', true)
      this.$router.replace('/login')
    },
  },
}
</script>

<style lang="scss" scoped>
.brand {
  background-color: var(--v-primary-base);
  color: var(--v-accent-base);
}
.logo,
span {
  font-size: 0.95rem;
  float: left;
}
.subtitle {
  font-weight: 300;
}
.btn-text {
  font-size: 0.66rem !important;
}
</style>
