<template>
  <div class="d-flex flex-column flex-grow-1">
    <div v-if="loadingOrder" class="loading-wrapper | h-100">
      <v-progress-circular
        :value="20"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>
    <div v-else-if="order && orderR" class="container-tasks flex-grow-1 h-100">
      <div class="tasks-date h-100">
        <v-container fluid class="h-100">
          <div class="d-flex gap-12 h-100">
            <div v-if="showOrderGeneralInfo" class="order-info">
              <div class="general-info-wrapper">
                <orders-general-info :order="order"> </orders-general-info>
              </div>
            </div>
            <div class="tasks | flex-grow-1">
              <div class="general-info-wrapper">
                <!-- WorkToDos-->
                <div v-if="workToDos?.length !== 0" class="'taskParent'">
                  <h3 class="info--text mb-2">
                    {{ $t('workToDos') }}
                  </h3>

                  <div
                    v-for="(task, i) in workToDos"
                    :key="i"
                    class="task-wrapper | rounded mb-4"
                  >
                    <task-content
                      class="task-content"
                      :task="task"
                      :order-id="orderR.id"
                      :wo="`${orderR.woNumber}`"
                    ></task-content>
                  </div>
                </div>
                <!-- Inspections -->
                <div class="taskParent">
                  <h3 class="task-type-title | mb-2 info--text">
                    {{ $t('inspections') }}
                    <v-tooltip open-delay="600" content-class="small" top>
                      <!-- eslint-disable-next-line -->
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          text
                          small
                          color="primary"
                          icon
                          v-bind="attrs"
                          v-on="on"
                          @click="handleAddInspections()"
                          ><v-icon> mdi-pencil-circle </v-icon></v-btn
                        >
                      </template>
                      <span>{{ $t('editInspections') }}</span>
                    </v-tooltip>
                  </h3>

                  <div v-if="inspections?.length !== 0">
                    <div
                      v-for="(task, i) in inspections"
                      :key="i"
                      class="task-wrapper | rounded mb-4"
                    >
                      <task-content
                        class="task-content"
                        :task="task"
                        :order-id="order.id"
                        :wo="`${order.woNumber}`"
                      ></task-content>
                    </div>
                  </div>
                </div>

                <!-- Allowables-->
                <AllowablesSection :order-r="orderR"></AllowablesSection>

                <!-- Appointments-->
                <div v-if="appointments?.length !== 0" class="taskParent">
                  <h3 class="info--text mb-2">
                    {{ $t('appointments') }}
                  </h3>

                  <div
                    v-for="(task, i) in appointmentsFormatted"
                    :key="i"
                    class="task-wrapper | rounded mb-4"
                  >
                    <task-content
                      class="task-content"
                      :task="task"
                      :order-id="order.id"
                      :wo="`${order.woNumber}`"
                    ></task-content>
                  </div>
                </div>

                <!-- No Tasks-->
                <div
                  v-if="
                    order.appointments?.length === 0 &&
                    order.allowables?.length === 0 &&
                    order.workToDos?.length === 0 &&
                    order.inspections?.length === 0
                  "
                >
                  <div
                    class="btn-sub-title rounded d-flex align-center justify-center"
                  >
                    {{ $t('doesNotHaveTask') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-container>
      </div>
    </div>
    <v-dialog
      v-model="addTaskInspections"
      :persistent="validatePersistent"
      scrollable
      max-width="1000px"
    >
      <add-task-inspections
        v-if="addTaskInspections"
        :order="order"
        @update-persistent="validatePersistent = $event"
        @close="addTaskInspections = !addTaskInspections"
      />
    </v-dialog>
  </div>
</template>

<script>
import ordersGeneralInfo from '../ordersToolbar/ordersGeneralInfo.vue'
import AllowablesSection from '../allowablesSection/AllowablesSection.vue'
import taskContent from '../taskContent/taskContent.vue'
import AddTaskInspections from '~/components/orders/task/AddTaskInspections.vue'
// import { JOB_TYPES } from '~/utils/dictionaries'

export default {
  name: 'OrderTabContent',
  components: {
    taskContent,
    AllowablesSection,
    AddTaskInspections,
    ordersGeneralInfo,
  },
  data() {
    return {
      addTaskInspections: false,
      validatePersistent: false,
    }
  },

  computed: {
    showOrderGeneralInfo() {
      return this.$store.state.oos.order.showOrderGeneralInfo
    },
    order() {
      return this.$store.state.oos.order.order
    },
    loadingOrder() {
      return this.$store.state.oos.order.loadingOrder
    },
    route() {
      return this.$store.state.oos.routes.routes.find(
        (route) => route.id === this.$store.state.oos.routes.selectRoute
      )
    },
    selectOrder() {
      return this.$store.state.oos.routes.selectOrder
    },
    orderR() {
      if (!this.route) return null

      let orderR = null
      if (this.route.ordersR) {
        orderR = this.route.ordersR[this.selectOrder]
      }
      if (!orderR && this.order) {
        orderR = {
          status: this.order.status,
          woNumber: this.order.woNumber,
          id: this.order.id,
          isReopen: this.order.isReopen,
          dateDueStr: this.order.dateDueStr || this.order.dateDue.toString(),
          inspections: this.order.inspections,
          workToDos: this.order.workToDos,
          allowables: this.order.allowables,
        }
      }

      return orderR
    },
    inspections() {
      if (!this.$store.state.oos.order?.inspections?.length) return []

      return this.$store.state.oos.order.inspections
        .map((i) => ({ ...i, type: 'inspections' }))
        .sort((a, b) => {
          return a.position > b.position ? 1 : -1
        })
    },
    workToDos() {
      if (!this.$store.state.oos.order?.workToDos?.length) return []
      return this.$store.state.oos.order.workToDos
        .map((w) => ({ ...w, type: 'workToDos' }))
        .sort((a, b) => {
          if (a.position > b.position) {
            return 1
          }
          if (a.position < b.position) {
            return -1
          }
          return 0
        })
    },
    appointments() {
      return this.$store.state.oos.order.appointments || []
    },
  },

  methods: {
    handleAddInspections() {
      this.addTaskInspections = true
    },
  },
}
</script>
<style lang="scss" scoped>
.loading-wrapper {
  display: grid;
  place-items: center;
}
.container-tasks {
  position: relative;
}

.tasks {
  position: relative;
  overflow-y: auto;
}

.task-wrapper {
  background-color: var(--v-terciary-base);
  border: 1px solid var(--v-terciary-base);
}
.task-content {
  transition: all 250ms ease-in-out;
}
.btn-sub-title {
  font-size: 0.72rem;
  font-weight: bold;
  white-space: normal;
  color: var(--v-info-base);
}
.order-info {
  position: relative;
  width: clamp(33%, 250px, 400px);
  max-width: 400px;
  text-overflow: ellipsis;

  word-wrap: break-word;
  word-break: break-all;
}
.general-info-wrapper {
  position: absolute;
  inset: 0;

  text-overflow: ellipsis;
  overflow-y: auto;
  word-wrap: break-word;
  word-break: break-all;
}
</style>
