<template>
  <div class="task-layout d-flex flex-grow-1 overflow-hidden">
    <section class="oos-task-inner-section flex-grow-1 d-flex flex-column">
      <task-toolbar
        v-if="taskSelected && task"
        :task="task"
        :order-id="taskSelected.orderId"
        :wo="taskSelected.wo"
        :standalone="true"
        class="flex-grow-0"
        @expand-all="expandAllReportsSection = $event"
      ></task-toolbar>
      <NuxtChild
        :expand-all-reports-section="expandAllReportsSection"
      ></NuxtChild>
      <!-- <TaskChats /> -->
    </section>

    <task-info-drawer
      v-if="taskSelected && task"
      :show="showTaskInfoDrawer"
    ></task-info-drawer>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import taskToolbar from '~/components/oos/taskContent/taskToolbar.vue'
import TaskInfoDrawer from '~/components/oos/taskContent/taskInfo/TaskInfoDrawer.vue'
// import TaskChats from '~/components/oos/taskContent/chats/TaskChats.vue'

export default {
  name: 'OosTask',
  components: { taskToolbar, TaskInfoDrawer /* TaskChats */ },
  data() {
    return {
      expandAllReportsSection: false,
    }
  },
  head() {
    return {
      title: `CDP${
        this.routeSelectedFormatted?.groupName
          ? ' - ' + this.routeSelectedFormatted?.groupName
          : ''
      }${this.taskSelected ? ' - ' + this.task?.title + ' ' : ''}`,
    }
  },
  computed: {
    ...mapGetters('oos/routes', {
      routeSelectedFormatted: 'routeSelectedFormatted',
    }),
    showTaskInfoDrawer: {
      get() {
        return this.$store.state.oos.orders.showTaskInfoDrawer
      },
      set(val) {
        this.$store.commit('oos/orders/set_showTaskInfoDrawer', val)
      },
    },
    taskSelected() {
      return this.$store.state.oos.order.taskSelected
    },
    task() {
      return this.$store.getters['oos/order/getTaskSelect']
    },
    ...mapState('oos/routes', { routes: (state) => state.routes }),
    ...mapState('oos/orders', { orders: (state) => state.orders }),
    selectRoute: {
      get() {
        return this.$store.state.oos.routes.selectRoute
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectRoute', val)
      },
    },
    selectOrder: {
      get() {
        return this.$store.state.oos.routes.selectOrder
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectOrder', val)
      },
    },

    orderFormatted() {
      let index = this.ordersInRouteFormatted
        .map((e) => e.id)
        .indexOf(this.selectOrder)

      if (this.selectOrder === null && this.ordersInRouteFormatted[0]) {
        // this.hendleSelectOrder(this.ordersInRouteFormatted[0].id)
        return this.ordersInRouteFormatted[0]
      }

      if (index === -1 && this.ordersInRouteFormatted[0]) {
        index = index + 1
        // this.hendleSelectOrder(this.ordersInRouteFormatted[index].id)
      }

      return this.ordersInRouteFormatted[index]
    },
    ordersInRouteFormatted() {
      const ordersF = []
      if (
        this.routes &&
        this.routes.length &&
        this.orders &&
        this.orders.length
      ) {
        const indexOfRouteSelected = this.routes.findIndex(
          (route) => route.id === this.selectRoute
        )

        for (let i = 0; i < this.orders.length; i++) {
          if (this.selectRoute === null) {
            for (let j = 0; j < this.routes.length; j++) {
              if (this.routes[j].orders.includes(this.orders[i].id)) {
                ordersF.push(this.orders[i])
              }
            }
          } else if (
            this.routes[indexOfRouteSelected].orders.includes(this.orders[i].id)
          ) {
            ordersF.push(this.orders[i])
          }
        }
      }
      return ordersF
    },
  },
  watch: {
    task: {
      handler(val, oldVal) {
        if (val && val.id && (!oldVal || oldVal?.id !== val.id)) {
          this.handleGetReports()
        }
      },
      immediate: true,
    },
    $route: {
      handler(to, from) {
        if (to.query?.taskSelected) {
          this.$store.commit(
            'oos/order/set_taskSelected',
            to.query.taskSelected
          )
        }
      },
      immediate: true,
    },
  },
  mounted() {
    // if (this.taskSelected && this.taskSelected.task === null) {
    //   this.handleSelectTask()
    // }
    // this.$store.commit('oos/orders/set_showTaskChats', true)
  },

  methods: {
    async handleGetReports() {
      if (!this.task || !this.selectOrder) return

      this.loading = true
      await this.$store.dispatch('oos/order/get_reports_for_taskSelected', {
        orderId: this.selectOrder,
        type: this.task.type,
        taskId: this.task.id,
      })
      this.loading = false
    },
    handleSelectTask() {
      let task = null
      const order = this.orderFormatted
      if (!order) {
        return
      }
      if (order && order.inspections && order.inspections.length) {
        task = order.inspections[0]
      } else if (order && order.workToDos && order.workToDos.length) {
        task = order.workToDos[0]
      } else if (order && order.allowables && order.allowables.length) {
        task = order.allowables[0]
      } else if (order && order.appointments && order.appointments.length) {
        task = order.appointments[0]
      }
      if (task) {
        this.$store.commit('oos/orders/set_taskSelected', {
          taskId: task.id,
          taskTitle: task.title,
          wo: order.woNumber,
          orderId: order.id,
          type: task.type,
        })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.task-layout {
  position: relative;
}
.oos-task-inner-section {
  position: relative;
}
</style>
