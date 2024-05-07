<template>
  <div class="supervisors-container | pt-1">
    <p class="ma-0 pa-0 caption">
      <span class="info_stops--text" title="Open Order Specialist">OOS: </span>
      <span
        v-if="
          route.oosSupervisors &&
          route.oosSupervisors.length &&
          route.oosSupervisors[0].fullName
        "
      >
        <span v-for="(supervisor, idx) in route.oosSupervisors" :key="idx">
          <v-menu
            v-model="showUserSupervisor"
            bottom
            offset-y
            :nudge-width="500"
            :close-on-content-click="false"
            max-width="400"
            min-width="400"
            open-delay="600"
            :open-on-click="isAdmin && !editing"
            :open-on-hover="isAdmin && !editing"
            @input="userInfoSelected = supervisor.uid"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <span
                :class="[`${!editing ? 'container-user' : ''}`]"
                v-bind="attrs"
                v-on="on"
              >
                {{ supervisor.fullName
                }}{{ idx !== route.oosSupervisors.length - 1 ? ', ' : '.' }}
              </span>
            </template>

            <user-info
              v-if="showUserSupervisor && supervisor.uid === userInfoSelected"
              :user-uid="supervisor.uid"
              :route="route"
              @close="showUserSupervisor = null"
            ></user-info>
          </v-menu>

          <!-- <span>
            {{ supervisor.fullName
            }}{{ idx !== route.oosSupervisors.length - 1 ? ', ' : '.' }}
          </span> -->
        </span>
      </span>
    </p>
  </div>
</template>

<script>
import UserInfo from '~/components/user/UserInfo.vue'
import { ROL_TYPES } from '@/utils/dictionaries'
export default {
  name: 'Supervisors',
  components: { UserInfo },
  props: {
    route: { type: Object, default: () => ({}) },
    editing: { type: Boolean, default: true },
  },
  data() {
    return { showUserSupervisor: null, userInfoSelected: '' }
  },
  computed: {
    userClaims() {
      return this.$store.state.auth.user.userCredential.claims
    },
    isAdmin() {
      return (
        this.userClaims?.rol === ROL_TYPES.admin &&
        this.userClaims?.authLevel > 6
      )
    },
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.container-user {
  cursor: pointer;
}
</style>
