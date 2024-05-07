<template>
  <div :class="['routes-item-drawer', { selected: selectedItem }]">
    <div
      v-if="
        orders.some(
          (elem) => elem.notifications.length && route.orders.includes(elem.id)
        ) || route.notification
      "
      class="notification-badge"
    ></div>
    <div
      class="route-item-section-group-name pa-2 d-flex font-weight-bold text-body-2 text-capitalize"
    >
      <span v-if="route.groupName !== null" class="text-truncate">
        {{ route.groupName }}
      </span>
      <span v-if="route.groupName === null"> Route {{ index + 1 }}</span>
      <v-btn
        class="ml-1 btn-edit"
        icon
        x-small
        @click="showEditgroupName = !showEditgroupName"
        ><v-icon color="success" small>mdi-pencil-outline</v-icon></v-btn
      >
    </div>

    <div class="route-item-section pa-2 d-flex text-capitalize">
      <span
        v-if="
          route.assignedTo !== 'undefined' &&
          JSON.stringify(route.assignedTo) !== '{}'
        "
        class="text-truncate"
      >
        {{ route.assignedTo.fullName }}
      </span>

      <span
        v-if="
          route.assignedTo === 'undefined' ||
          JSON.stringify(route.assignedTo) === '{}'
        "
      >
        {{ $t('routeNotAssigned') }}</span
      >
    </div>

    <LeadLocation :route="route"></LeadLocation>

    <ContractorsInRoute
      :all-contractors="route.allContractors"
    ></ContractorsInRoute>
    <v-dialog
      v-model="showEditgroupName"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <edit-group-name
        :route="route"
        :group-name="groupNameFormatted"
        :is-dispatching="true"
        @close="showEditgroupName = false"
      >
      </edit-group-name>
    </v-dialog>
  </div>
</template>

<script>
import ContractorsInRoute from './ContractorsInRoute.vue'
import LeadLocation from './LeadLocation.vue'
import EditGroupName from '~/components/routes/EditGroupName.vue'
export default {
  components: { ContractorsInRoute, LeadLocation, EditGroupName },
  props: {
    route: { type: Object, required: true },
    orders: { type: Array, required: true },
    index: { type: Number, required: true },
    selectedItem: { type: Boolean, default: false },
  },

  data() {
    return {
      showEditgroupName: false,
    }
  },
  computed: {
    groupNameFormatted() {
      return this.route.groupName
        ? this.route.groupName
        : `Route ${this.index + 1}`
    },
  },
}
</script>

<style lang="scss" scoped>
.routes-item-drawer {
  position: relative;
}

.selected .route-item-section {
  border-bottom: 1px solid var(--v-terciary-darken1);
}

.route-item-section {
  border-bottom: 1px solid var(--v-terciary-darken1);
}
.route-item-section-group-name {
  border-bottom: 1px solid var(--v-terciary-darken1);
}
.route-item-section-group-name:hover {
  .btn-edit {
    display: block;
  }
}
.btn-edit {
  display: none;
}

.notification-badge {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  background-color: var(--v-error-base);
  // animation: pulse 1s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 11, 11, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(230, 11, 11, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 11, 11, 0);
  }
}
</style>
