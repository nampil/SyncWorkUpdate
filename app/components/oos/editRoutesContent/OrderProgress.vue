<template>
  <div>
    <div
      v-for="taskType in Object.keys(tasksFormatted)"
      :key="taskType"
      class="mt-2"
    >
      <div class="text--subtitle-2 accent--text mb-4">
        {{ $t(`${taskType}`) }}
      </div>
      <div v-for="task in tasksFormatted[taskType]" :key="task.id">
        <div class="d-flex">
          <nuxt-link
            v-if="!isHistory"
            class="title-task-link"
            nuxt
            :to="{
              name: 'cdp-route-task',
              query: {
                taskSelected: task.id,
                selectRoute: routeId,
                selectOrder: order.id,
                taskTypeSelected: taskType,
              },
            }"
            x-small
            :ripple="false"
            text
          >
            {{ $truncate(task.title, 35) }}
          </nuxt-link>
          <span v-else class="font-weight-bold title-task">
            {{ $truncate(task.title, 35) }}</span
          >
          <v-spacer></v-spacer>
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-1"
                :color="
                  task.status === TASK_STATUS.performingWork
                    ? 'yellow'
                    : task.status === TASK_STATUS.taskCompleted
                    ? 'green'
                    : 'grey'
                "
                x-small
                v-bind="attrs"
                v-on="on"
                >mdi-circle</v-icon
              >
            </template>
            <span>
              {{
                task.status === TASK_STATUS.performingWork
                  ? $t('performingWork')
                  : task.status === TASK_STATUS.taskCompleted
                  ? $t('taskCompleted')
                  : $t('taskIdle')
              }}</span
            >
          </v-tooltip>
        </div>

        <task-performance-time
          v-if="task"
          :ect="task.ect"
          :task-id="task.id"
          :route-id="routeId"
          :task-type="task.type"
          :order-id="order.id"
          :status="task.status"
          :started="task.started"
          :started-at="task.startedAt"
          :task-approved="task.taskApprovedAt && task.taskApprovedAt !== null"
          :task-approved-at="task.taskApprovedAt"
          :is-history="isHistory"
        ></task-performance-time>
        <v-divider class="mt-1 pb-1"></v-divider>
      </div>
    </div>

    <!-- <span v-else class="info--text">No tasks yet!</span> -->
  </div>
</template>

<script>
import TaskPerformanceTime from './TaskPerformanceTime.vue'
import { TASK_STATUS } from '~/utils/dictionaries'

export default {
  name: 'OrderProgress',
  components: { TaskPerformanceTime },
  props: {
    routeId: { type: String, required: true },
    order: { type: [Object, Array, String], required: true },
    isHistory: { type: Boolean, default: false },
  },
  data() {
    return { TASK_STATUS: null }
  },
  computed: {
    tasksFormatted() {
      const workToDos = this.order.workToDos?.length
        ? this.order.workToDos
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
        : []
      const inspections = this.order.inspections?.length
        ? this.order.inspections
            .map((i) => ({ ...i, type: 'inspections' }))
            .sort((a, b) => {
              return a.position > b.position ? 1 : -1
            })
        : []
      const allowables = this.order.allowables?.length
        ? this.order.allowables
            .map((a) => ({ ...a, type: 'allowables' }))
            .sort((a, b) => {
              return a.position > b.position ? 1 : -1
            })
        : []
      return { workToDos, inspections, allowables }
    },
  },
  created() {
    this.TASK_STATUS = TASK_STATUS
  },
}
</script>

<style lang="scss" scoped>
.title-task {
  opacity: 0.7;
  font-size: 0.82rem;
}
.title-task-link {
  text-decoration: none;
  color: inherit;
}
</style>
