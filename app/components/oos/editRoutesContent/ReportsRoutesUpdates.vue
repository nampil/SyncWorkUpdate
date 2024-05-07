<template>
  <div :class="['oos-updates-wrapper | ', { open: openRoutesUpdates }]">
    <header
      class="oos-updates-header | info_stops--text d-flex align-center justify-space-between pa-4 pb-0"
    >
      <span class="subtitle-2">{{ $t('routeUpdates') }}</span>
      <v-btn
        icon
        x-small
        class="routes-updates-btn"
        @click="handleOpenUpdateList"
        ><v-icon
          :class="['routes-updates-btn-icon', { rotate: openRoutesUpdates }]"
          size="22"
          >mdi-chevron-up</v-icon
        ></v-btn
      >
    </header>
    <div ref="updateList" class="updates-list">
      <div
        v-for="update in routeUpdates"
        :key="update.id"
        class="oos-update | pr-4 pl-4"
      >
        <p v-if="!openRoutesUpdates" class="ma-0">
          {{ $truncate(update.text, 40) }}
        </p>
        <p v-if="openRoutesUpdates" class="ma-0">
          {{ update.text }}
        </p>

        <p class="metadata">
          {{ getUserFullName(update.updatedBy) }} -
          {{
            $formatDate(update.updatedAt, {
              relativeToNow: true,
            })
          }}
        </p>
      </div>
    </div>

    <v-divider
      v-if="isHistory || (routeUpdates?.length && isSupervisor)"
      class="mb-2"
    ></v-divider>
    <v-form
      v-if="isSupervisor && !isHistory"
      class="update-input-wrapper pl-4 pr-4 pb-1"
      @submit.prevent="handleSendRouteUpdate"
    >
      <v-text-field
        v-model="routeUpdateText"
        :label="$t('writeaRouteUpdate')"
        dense
        outlined
        hide-details
        append-outer-icon="mdi-send"
        :loading="sendingRouteUpdate"
        @click:append-outer="handleSendRouteUpdate"
      ></v-text-field>
    </v-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'ReportsRoutesUpdates',
  props: {
    route: { type: Object, default: () => ({}) },
    isHistory: { type: Boolean, default: false },
  },
  data() {
    return {
      openRoutesUpdates: false,
      routeUpdateText: '',
      sendingRouteUpdate: false,
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user.profile
    },
    routeUpdates() {
      if (this.isHistory) return this.route.routesUpdates

      return this.$store.state.oos.routes.routesUpdates[this.route.id]
    },
    isSupervisor() {
      return this.route.oosSupervisors
        ?.map((s) => s.uid)
        .includes(this.user.uid)
    },
  },
  methods: {
    ...mapGetters('users', ['getUserById']),

    getUserFullName(userId) {
      const userProfile = this.$store.getters['users/getUserById'](userId)
      if (!userProfile?.fullName) {
        return ''
      }
      return userProfile.fullName
    },
    handleOpenUpdateList() {
      if (!this.routeUpdates?.length) return
      const updateList = this.$refs.updateList
      updateList.scrollTo({
        top: 0,
      })
      this.openRoutesUpdates = !this.openRoutesUpdates
    },
    async handleSendRouteUpdate() {
      if (!this.routeUpdateText || this.sendingRouteUpdate) return
      try {
        this.sendingRouteUpdate = true
        await this.$store.dispatch('oos/routes/send_routeUpdate', {
          routeId: this.route.id,
          text: this.routeUpdateText,
        })
        this.routeUpdateText = ''
      } catch (error) {
        // eslint-disable-next-line
        console.log('error sending route report', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.sendingRouteUpdate = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.oos-updates-wrapper {
  background-color: var(--v-background_route_update-base);
  max-height: 80px;
  border-start-end-radius: 8px;
  border-start-start-radius: 8px;
  overflow: hidden;
  transition: max-height 250ms ease-in-out;
  .updates-list {
    scrollbar-gutter: stable;
    max-height: 200px;
    overflow: hidden;
  }
  &.open {
    max-height: 400px;
    .updates-list {
      overflow-y: auto;
    }
  }
}
.routes-updates-btn-icon {
  transition: transform 300ms ease-in-out;
  &.rotate {
    transform: rotate(180deg);
  }
}
.oos-update {
  font-size: 0.85rem;
}
.metadata {
  font-size: 0.75rem;
  text-align: end;
  opacity: 0.5;
}
</style>
