<template>
  <div class="task-performance | d-flex justify-space-between pa-4 rounded">
    <div v-if="task.startedBy">
      <h4 v-if="task.started" class="sub-title | mb-1">
        {{ $t('startedBy') }}
      </h4>

      <div v-if="task.started" class="task-performance_info">
        <v-icon small color="green">mdi-account-hard-hat-outline</v-icon>
        <span v-if="task.startedBy.fullName" class="sub-title">{{
          task.startedBy.fullName
        }}</span>
        <br />
        <span v-if="task.startedAt" class="fecha | info--text">
          {{ $formatDate(task.startedAt, { relativeToNow: true }) }}</span
        >
      </div>
    </div>

    <div>
      <h4 v-if="task.finished && task.finishedBy" class="sub-title | mb-1">
        {{ $t('finishedBy') }}
      </h4>

      <div v-if="task.finished" class="task-performance_info">
        <v-icon small color="primary"> mdi-account-hard-hat-outline</v-icon>
        <span
          v-if="task.finishedBy && task.finishedBy.fullName"
          class="sub-title"
          >{{ task.finishedBy.fullName }}
        </span>
        <br />
        <span class="fecha | info--text">{{
          $formatDate(task.finishedAt, { relativeToNow: true })
        }}</span>
      </div>
    </div>
    <div class="reloj">
      <h4
        v-if="(task.started || task.finished) && task.startedBy"
        class="sub-title | mb-1"
      >
        {{ $t('performanceTime') }}
      </h4>
      <div v-if="task.startedBy" class="d-flex align-center">
        <v-icon
          v-if="task.started || task.finished"
          size="20"
          :color="task.finished ? 'primary' : 'success'"
          class="mr-1"
          >mdi-clock-outline</v-icon
        >
        <span v-if="task.started && !task.finished">
          {{ elapsetTimeOnTask }}
        </span>
        <span v-else-if="task.finished">
          {{ timeOnTaks }}
        </span>
      </div>
    </div>
    <div class="mb-2">
      <h4 class="sub-title | mb-1">{{ $t('status') }}</h4>

      <v-menu
        left
        min-width="170px"
        max-width="190px"
        rounded
        offset-y
        transition="slide-y-transition"
      >
        <!-- eslint-disable-next-line  -->
        <template v-slot:activator="{ on, attrs }">
          <div class="status" v-bind="attrs" v-on="on">
            <div v-if="!task.started && !task.finished" class="idle">
              {{ $t('idle') }}
            </div>
            <div v-else-if="task.started && !task.finished" class="started">
              {{ $t('performingWork') }}
            </div>
            <div v-else-if="task.finished" class="finished">
              {{ $t('taskCompleted') }}
            </div>
          </div>
        </template>

        <div class="text-center">
          <v-list>
            <v-list-item
              v-for="option in taskStatusOptions"
              :key="option.title"
              dense
              :disabled="
                (option.value === 'idle' && !task.started && !task.finished) ||
                (option.value === 'started' &&
                  task.started &&
                  !task.finished) ||
                (option.value === 'finished' && task.started && task.finished)
              "
              @click="handleTaskStatus(option.value)"
            >
              <v-list-item-title>
                {{ option.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-menu>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskPerformace',
  props: {
    task: { type: Object, default: () => ({}) },
    orderId: { type: String, default: '' },
  },
  data() {
    return {
      elapsetTimeOnTask: '0:00:00',
      elapsetTimeOnTaskInterval: null,
    }
  },
  computed: {
    taskStatusOptions() {
      return [
        { value: 'idle', title: this.$t('Inactive') },
        { value: 'started', title: this.$t('performingWork') },
        { value: 'finished', title: this.$t('taskCompleted') },
      ]
    },
    timeOnTaks() {
      let res = '0:00:00'
      const initTime = this.task.startedAt.toDate().getTime()
      const finishTime =
        this.task.finishedAt && this.task.finishedAt.toDate()
          ? this.task.finishedAt.toDate().getTime()
          : 0
      const _elapsetTimeOnTask = Math.floor((finishTime - initTime) / 1000)

      const sec = (_elapsetTimeOnTask % 60).toString().padStart(2, '0')
      const min = (Math.floor(_elapsetTimeOnTask / 60) % 60)
        .toString()
        .padStart(2, '0')
      const hour = Math.floor(_elapsetTimeOnTask / 60 / 60).toString()
      res = `${hour}:${min}:${sec}`

      return res
    },
  },
  watch: {
    task(newVal, oldVal) {
      // if (newVal.started && !oldVal.started) {
      this.setElapsetTimeOnTaskInterval()
      //  }
    },
  },
  mounted() {
    if (this.task.started && !this.task.finished) {
      this.setElapsetTimeOnTaskInterval()
    }
  },
  beforeDestroy() {
    clearInterval(this.elapsetTimeOnTaskInterval)
  },
  destroyed() {
    // eslint-disable-next-line
    console.log('comp destroyed')
  },
  methods: {
    setElapsetTimeOnTaskInterval() {
      this.elapsetTimeOnTaskInterval = setInterval(() => {
        if (this.task.finished) {
          clearInterval(this.elapsetTimeOnTaskInterval)
        }
        if (!this.task.startedAt) {
          return
        }

        const initTime = this.task.startedAt.seconds * 1000
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
    // get_timeOnTaks() {
    //   const initTime = this.task.startedAt.toDate().getTime()
    //   const finishTime = this.task.finishedAt.toDate().getTime()
    //   const _elapsetTimeOnTask = Math.floor((finishTime - initTime) / 1000)

    //   const sec = (_elapsetTimeOnTask % 60).toString().padStart(2, '0')
    //   const min = (Math.floor(_elapsetTimeOnTask / 60) % 60)
    //     .toString()
    //     .padStart(2, '0')
    //   const hour = Math.floor(_elapsetTimeOnTask / 60 / 60).toString()

    //   return `${hour}:${min}:${sec}`
    // },
    async handleTaskStatus(typeStatus) {
      try {
        await this.$store.dispatch('oos/orders/handleTaskStatus', {
          taskId: this.task.id,
          orderId: this.orderId,
          type: this.task.type,
          typeStatus,
        })
        this.$mainAlertSuccess('Success! Updated task status')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.status {
  & > div {
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 5px;
    padding: 4px 17px;
  }
  .idle {
    color: #ffffff;
    background-color: #585d5875;
  }
  .started {
    color: #ffffff;
    background-color: var(--v-success-base);
  }
  .finished {
    color: #ffffff;
    background-color: var(--v-primary-base);
  }
}
.sub-title {
  font-size: 0.72rem;
  font-weight: bold;
  white-space: normal;
}
.fecha {
  font-size: 0.75rem;
}
.active-list {
  font-size: 0.8rem;
}
.active-list:hover {
  background-color: rgba(128, 128, 128, 0.081);
  cursor: pointer;
}
</style>
