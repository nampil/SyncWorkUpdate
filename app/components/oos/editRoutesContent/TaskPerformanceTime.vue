<template>
  <div class="task-performance-time">
    <div class="d-flex justify-space-between">
      <div
        v-if="status !== TASK_STATUS.taskCompleted"
        class="d-flex flex-column"
      >
        <div class="d-flex align-center">
          <span v-if="validateTime" class="notification-badge ml-1 mr-1"></span>
          <span class="title-time info_stops--text">ECT</span>

          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                x-small
                v-bind="attrs"
                v-on="on"
                @click="showEditECT = !showEditECT"
                ><v-icon x-small color="primary"
                  >mdi-pencil-outline</v-icon
                ></v-btn
              >
            </template>
            <span> Edit ECT </span>
          </v-tooltip>
        </div>
        <span class="time">{{ ectFormatted }}</span>
      </div>
      <div
        v-if="status === TASK_STATUS.performingWork"
        class="d-flex flex-column"
      >
        <span class="title-time info_stops--text">Start</span>
        <span class="time">{{ $formatDate(startedAt, { time: true }) }}</span>
      </div>

      <div
        v-if="status === TASK_STATUS.performingWork"
        class="d-flex flex-column"
      >
        <span class="title-time info_stops--text">Progress</span>
        <span v-show="!taskApproved && started" class="time">
          {{ elapsetTimeOnTask }}</span
        >
      </div>
    </div>

    <div v-if="status === TASK_STATUS.taskCompleted" class="d-flex gap-16">
      <p class="ma-0">
        <span class="title-time info_stops--text">ETC: </span>
        <span>{{ ectFormatted ?? '-' }}</span>
      </p>
      <p class="ma-0">
        <span class="title-time info_stops--text">Time: </span>
        <span v-show="taskApprovedAt && started" class="time">{{
          timeOnTaks
        }}</span>
      </p>
    </div>

    <v-dialog
      v-model="showEditECT"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <EditECT
        v-if="showEditECT"
        :ect="ect"
        :task-id="taskId"
        :route-id="routeId"
        :order-id="orderId"
        :task-type="taskType"
        @update-persistent="validatePersistent = $event"
        @close="showEditECT = false"
      ></EditECT>
    </v-dialog>
  </div>
</template>

<script>
import EditECT from './EditECT.vue'
import { TASK_STATUS } from '~/utils/dictionaries'
export default {
  name: 'TaskPerformanceTime',
  components: { EditECT },
  props: {
    status: { type: String, default: '' },
    started: { type: Boolean, default: false },
    startedAt: { type: Object, default: () => ({}) },
    taskApproved: { type: Boolean, default: false },
    taskApprovedAt: { type: Object, default: () => ({}) },
    ect: { type: Object, default: () => ({}) },
    taskId: { type: String, default: '' },
    routeId: { type: String, default: '' },
    orderId: { type: String, default: '' },
    taskType: { type: String, default: '' },
    isHistory: { type: Boolean, default: false },
  },
  data() {
    return {
      TASK_STATUS: null,
      elapsetTimeOnTask: '0:00:00',
      elapsetTimeOnTaskInterval: null,
      showEditECT: false,
      validatePersistent: false,
    }
  },
  computed: {
    timeOnTaks() {
      let res = '0:00:00'

      if (
        this.startedAt &&
        this.startedAt.seconds &&
        this.taskApprovedAt &&
        this.taskApprovedAt.seconds
      ) {
        const initTime = this.startedAt.seconds
        const finishTime = this.taskApprovedAt.seconds
        const _elapsetTimeOnTask = Math.floor(finishTime - initTime)

        const sec = (_elapsetTimeOnTask % 60).toString().padStart(2, '0')
        const min = (Math.floor(_elapsetTimeOnTask / 60) % 60)
          .toString()
          .padStart(2, '0')
        const hour = Math.floor(_elapsetTimeOnTask / 60 / 60).toString()
        res = `${hour}:${min}:${sec}`
      }
      return res
    },
    validateTime() {
      if (!this.elapsetTimeOnTask || !this.ect) return false
      const parts = this.elapsetTimeOnTask.split(':')
      const totalInMinProgress = parseInt(parts[0]) * 60 + parseInt(parts[1])
      const totalInMinEct =
        parseInt(this.ect.hours) * 60 + parseInt(this.ect.minutes)
      return totalInMinProgress > totalInMinEct
    },
    ectFormatted() {
      if (!this.ect.hours && !this.ect.minutes) return
      if (
        (!this.ect.hours || parseInt(this.ect.hours) === 0) &&
        this.ect.minutes
      ) {
        return `${this.ect.minutes} Min`
      }
      if (
        (!this.ect.minutes || parseInt(this.ect.minutes) === 0) &&
        this.ect.hours
      ) {
        return `${this.ect.hours} Hours`
      }
      return `${parseInt(this.ect.hours)
        .toString()
        .padStart(2, '0')}:${parseInt(this.ect.minutes)
        .toString()
        .padStart(2, '0')}`
    },
  },
  watch: {
    started() {
      this.setElapsetTimeOnTaskInterval()
    },
    taskApproved() {
      this.setElapsetTimeOnTaskInterval()
    },
  },
  created() {
    this.TASK_STATUS = TASK_STATUS
  },
  mounted() {
    if (this.started && !this.taskApproved) {
      this.setElapsetTimeOnTaskInterval()
    }
  },
  beforeDestroy() {
    clearInterval(this.elapsetTimeOnTaskInterval)
  },
  methods: {
    setElapsetTimeOnTaskInterval() {
      if (this.isHistory) {
        if (this.started && !this.taskApproved) {
          this.elapsetTimeOnTask = 'No Finished'
        }
        return
      }
      if (this.taskApproved) {
        clearInterval(this.elapsetTimeOnTaskInterval)
      }
      if (!this.startedAt.seconds) return
      this.elapsetTimeOnTaskInterval = setInterval(() => {
        const initTime = this.startedAt.seconds * 1000
        const now = new Date().getTime()
        const _elapsetTimeOnTask = Math.floor((now - initTime) / 1000)
        const sec = (_elapsetTimeOnTask % 60).toString().padStart(2, '0')
        const min = (Math.floor(_elapsetTimeOnTask / 60) % 60)
          .toString()
          .padStart(2, '0')
        const hour = Math.floor(_elapsetTimeOnTask / 60 / 60).toString()
        this.elapsetTimeOnTask = `${hour}:${min}:${sec}`
      }, 1000)
    },
  },
}
</script>

<style lang="scss" scoped>
.time {
  font-size: 0.65rem;
}
.title-time {
  font-size: 0.7rem;
}
.notification-badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  background-color: var(--v-error-base);
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 11, 11, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 7px rgba(230, 11, 11, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 11, 11, 0);
  }
}
</style>
