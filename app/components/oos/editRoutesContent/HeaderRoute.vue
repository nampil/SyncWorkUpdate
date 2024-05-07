<template>
  <div>
    <header
      class="container-group-name | text-subtitle-2 d-flex justify-space-between gap-8 text-uppercase accent--text"
    >
      <div class="d-flex gap-4">
        <span v-if="route.groupName" class="text-truncate text_stops--text">
          {{ route.groupName }}
        </span>
        <span v-else class="text_stops--text">
          {{ $t('route') }} {{ num }}</span
        >
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-show="editing"
              class="ml-1 btn-edit"
              icon
              x-small
              v-bind="attrs"
              v-on="on"
              @click="showEditgroupName = !showEditgroupName"
              ><v-icon color="primary" small>mdi-pencil-outline</v-icon></v-btn
            >
          </template>
          <span>{{ $t('editGroupName') }}</span>
        </v-tooltip>
      </div>
      <div v-if="!editing && !isHistory" class="actions | d-flex gap-4">
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mr-2"
              icon
              x-small
              :color="isSupervisor ? 'green' : 'primary'"
              :loading="addingOOSSupervisor"
              v-bind="attrs"
              v-on="on"
              @click="handleAddOOS(route.id)"
            >
              <v-icon small>mdi-account-supervisor-circle-outline</v-icon>
            </v-btn>
          </template>
          <span>{{
            isSupervisor
              ? $t('Remove you as Supervisor')
              : $t('Add  you as Supervisor')
          }}</span>
        </v-tooltip>

        <v-tooltip
          v-if="!isStopsDrawer && route?.id"
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              x-small
              color="primary"
              nuxt
              :to="{
                name: 'cdp-route',
                query: {
                  selectRoute: route.id,
                  selectOrder: route.stops[0].orders[0],
                },
                replace: true,
              }"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon small>mdi-arrow-right</v-icon>
            </v-btn>
            <!-- <v-btn
              v-else
              icon
              x-small
              color="primary"
              nuxt
              :to="{name: 'cdp-routes', query: {selectRoute: route.id}}"
              v-bind="attrs"
              v-on="on"
              @click="handleGoToRoute(route)"
              ><v-icon small>mdi-arrow-right</v-icon></v-btn
            > -->
          </template>
          <span>{{
            isSupervisor
              ? $t('Go to Route Dash')
              : $t('You need to be a Supervisor')
          }}</span>
        </v-tooltip>
      </div>
    </header>
    <v-dialog
      v-model="showEditgroupName"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <group-name
        :route="route"
        :group-name="groupNameFormatted"
        @update-group-name="handleUpdateGroupName($event)"
        @close="showEditgroupName = false"
      >
      </group-name>
    </v-dialog>
  </div>
</template>

<script>
import GroupName from './GroupName.vue'
export default {
  name: 'HeaderRoute',
  components: { GroupName },
  props: {
    route: { type: Object, default: () => ({}) },
    num: { type: Number, default: 0 },
    editing: { type: Boolean, default: true },
    isStopsDrawer: { type: Boolean, default: false },
    isHistory: { type: Boolean, default: false },
  },
  data() {
    return {
      showEditgroupName: false,
      addingOOSSupervisor: false,
      showInfo: false,
    }
  },
  computed: {
    selectOrder: {
      get() {
        return this.$store.state.oos.routes.selectOrder
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectOrder', val)
      },
    },
    selectRoute: {
      get() {
        return this.$store.state.oos.routes.selectRoute
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectRoute', val)
      },
    },
    user() {
      return this.$store.state.auth.user.profile
    },
    isSupervisor() {
      return this.route.oosSupervisors
        ?.map((s) => s.uid)
        .includes(this.user.uid)
    },
    groupNameFormatted() {
      return this.route.groupName ? this.route.groupName : `Route ${this.num}`
    },
  },
  methods: {
    handleUpdateGroupName(newGroupName) {
      this.$emit('update-group-name', newGroupName)
    },
    async handleAddOOS(routeId) {
      try {
        this.addingOOSSupervisor = true
        const remove = this.isSupervisor
        // this.route.oosSupervisors
        // ?.map((supervisor) => supervisor.uid)
        // .includes(this.user.uid)

        await this.$store.dispatch('oos/routes/handle_user_as_supervisor', {
          routeId,
          remove,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
      } finally {
        this.addingOOSSupervisor = false
      }
    },
    // handleGoToRoute(route) {
    //   if (!this.isSupervisor) {
    //     this.$mainAlertInfo(this.$t('You need to be a Supervisor'))
    //     return
    //   }
    //   this.selectRoute = route.id
    //   this.selectOrder = route.orders[0].id
    //   this.$router.push('/cdp/route')
    // },
  },
}
</script>

<style lang="scss" scoped>
.container-group-name:hover {
  .btn-edit {
    display: block;
  }
}

.btn-edit {
  display: none;
}
</style>
