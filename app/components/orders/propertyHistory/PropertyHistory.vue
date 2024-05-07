<template>
  <div class="property-history | d-flex">
    <v-data-table
      dense
      :loading="loading"
      :headers="phHeaders"
      :items="ordersFormatted"
      :single-expand="singleExpand"
      :expanded.sync="expanded"
      fixed-header
      item-key="id"
      show-expand
      class="history-table | pa-2"
      hide-default-footer
      :options="{
        itemsPerPage: -1,
      }"
    >
      <template #header.invoiceCompletedByName="{ header }">
        <span title="Invoice Completed By">{{ header.text }}</span>
      </template>

      <template #item.woNumber="{ item }">
        <nuxt-link class="order-link" :to="`/dispatching/${item.id}`">{{
          item.woNumber
        }}</nuxt-link>
      </template>

      <template #item.workType="{ item }">
        <span :title="item.workType">{{ item.workType }}</span>
      </template>

      <template #item.invoiceCompletedByName="{ item }">
        <span :title="item.invoiceCompletedByName">{{
          item.invoiceCompletedByName
        }}</span>
      </template>
      <template #item.invoiceSentByName="{ item }">
        <span :title="item.invoiceSentByName">{{
          item.invoiceSentByName
        }}</span>
      </template>
      <template #item.contractors="{ item }">
        <span :title="item.contractors">{{
          item.contractorsCrew ?? item.contractors
        }}</span>
      </template>
      <template #expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-progress-linear
            v-if="item.loadingTasks"
            color="primary"
            height="3"
            indeterminate
          ></v-progress-linear>

          <div
            v-else-if="item.tasks.length"
            class="tasks-container | three-columns gap-16 pa-2"
          >
            <div v-if="item.inspections.length">
              <h5 class="text--subtitle2 info--text">Inspections</h5>
              <ul class="pa-0">
                <li
                  v-for="task in item.inspections"
                  :key="task.id"
                  class="task-item | text--small"
                >
                  <div class="d-flex align-center justify-space-between gap-8">
                    <span
                      ><v-icon small>mdi-circle-medium</v-icon
                      >{{ task.title }}</span
                    >

                    <!-- <span class="metadata | ma-0 text--secondary">
                          {{ $t('Last update') }}:
                          {{ $formatDate(task.updatedAt, { time: true }) }}
                        </span> -->

                    <v-tooltip open-delay="600" content-class="small" top>
                      <!-- eslint-disable-next-line -->
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="primary"
                          small
                          icon
                          v-bind="attrs"
                          v-on="on"
                          @click="handleTaskViewModal({ task, order: item })"
                        >
                          <v-icon small>mdi-eye-outline</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('showTaskInfo') }}</span>
                    </v-tooltip>
                  </div>
                </li>
              </ul>
            </div>
            <div v-if="item.workToDos.length">
              <h5 class="text--subtitle2 info--text">Works to Do</h5>
              <ul class="pa-0">
                <li
                  v-for="task in item.workToDos"
                  :key="task.id"
                  class="task-item | text--small"
                >
                  <div class="d-flex align-center justify-space-between gap-16">
                    <span
                      ><v-icon small>mdi-circle-medium</v-icon
                      >{{ task.title }}</span
                    >

                    <!-- <span class="metadata | ma-0 text--secondary">
                        {{ $t('Last update') }}:
                        {{ $formatDate(task.updatedAt, { time: true }) }}
                      </span> -->

                    <v-tooltip open-delay="600" content-class="small" top>
                      <!-- eslint-disable-next-line -->
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="primary"
                          small
                          icon
                          v-bind="attrs"
                          v-on="on"
                          @click="handleTaskViewModal({ task, order: item })"
                        >
                          <v-icon small>mdi-eye-outline</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('showTaskInfo') }}</span>
                    </v-tooltip>
                  </div>
                </li>
              </ul>
            </div>
            <div v-if="item.allowables.length">
              <h5 class="text--subtitle2 info--text">Allowables</h5>
              <ul class="pa-0">
                <li
                  v-for="task in item.allowables"
                  :key="task.id"
                  class="task-item text--small"
                >
                  <div class="d-flex align-center justify-space-between gap-16">
                    <span
                      ><v-icon small>mdi-circle-medium</v-icon
                      >{{ task.title }}</span
                    >

                    <!-- <span class="metadata | ma-0 text--secondary">
                        {{ $t('Last update') }}:
                        {{ $formatDate(task.updatedAt, { time: true }) }}
                      </span> -->

                    <v-tooltip open-delay="600" content-class="small" top>
                      <!-- eslint-disable-next-line -->
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="primary"
                          small
                          icon
                          v-bind="attrs"
                          v-on="on"
                          @click="handleTaskViewModal({ task, order: item })"
                        >
                          <v-icon small>mdi-eye-outline</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('showTaskInfo') }}</span>
                    </v-tooltip>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div v-else>
            <span class="pa-4 text--secondary text--small">No Tasks</span>
          </div>
        </td>
      </template>
    </v-data-table>

    <task-view
      v-if="taskSelected"
      :type="{ type: taskSelected.type, title: taskSelected.type }"
      :job-task="taskSelected"
      :open="showTaskView"
      :order-id="orderSelected.id"
      :work-order-number="orderSelected.woNumber"
      @close="showTaskView = false"
    />
  </div>
</template>

<script>
// import LoaderOverlay from '../../misc/LoaderOverlay.vue'
import TaskView from '../task/TaskView.vue'
export default {
  name: 'PropertyHistory',
  components: { /* LoaderOverlay, */ TaskView },
  props: {
    order: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      orders: [],
      loading: false,
      taskSelected: {},
      showTaskView: false,
      orderSelected: {},
      expanded: [],
      singleExpand: false,
    }
  },
  computed: {
    phHeaders() {
      return [
        {
          text: 'WO#',
          value: 'woNumber',
          class: 'text--small text-uppercase header-text',
          cellClass: 'text--small',
        },
        {
          text: 'Created',
          value: 'createdAt',
          class: 'text--small text-uppercase header-text',
          cellClass: 'text--small',
          sort: this.sortDateString,
        },
        {
          text: 'Work Type',
          value: 'workType',
          class: 'text--small text-uppercase header-text',
          cellClass: 'truncate text--small',
        },
        {
          text: 'RFO Date',
          value: 'rfoDate',
          class: 'text--small text-uppercase header-text',
          cellClass: 'text--small',
          sort: this.sortDateString,
        },
        {
          text: 'Invoiced',
          value: 'invoicedAt',
          class: 'text--small text-uppercase header-text',
          cellClass: 'text--small',
          sort: this.sortDateString,
        },

        {
          text: 'Inv. Comp. By',
          value: 'invoiceCompletedByName',
          class: 'text--small text-uppercase header-text',
          cellClass: 'truncate text--small',
        },
        {
          text: 'Processor',
          value: 'invoiceSentByName',
          class: 'text--small text-uppercase header-text',
          cellClass: 'truncate text--small',
        },

        {
          text: 'Contractors',
          value: 'contractors',
          class: 'text--small text-uppercase header-text',
          cellClass: 'truncate text--small',
        },

        { text: '', value: 'data-table-expand' },
      ]
    },
    ordersFormatted() {
      return this.orders
        .map((order) => {
          let rfoM,
            rfoD,
            rfoY,
            rfoDate,
            invY,
            invM,
            invD,
            invDate,
            inspections,
            workToDos,
            allowables,
            invoiceCompletedByName,
            invoiceSentByName

          if (order.invoiceCompletedBy) {
            invoiceCompletedByName = order.invoiceCompletedBy.fullName
          }
          if (order.invoiceSentBy) {
            invoiceSentByName = order.invoiceSentBy.fullName
          }

          if (order.invoiceCompletedDate) {
            const a = order.invoiceCompletedDate.split('-')
            rfoY = a[0]
            rfoM = a[1]
            rfoD = a[2]

            rfoDate = `${rfoM}-${rfoD}-${rfoY}`
          }

          if (order.invoiceSentToClientDate) {
            const dateParts = order.invoiceSentToClientDate.split('-')
            invY = dateParts[0]
            invM = dateParts[1]
            invD = dateParts[2]

            invDate = `${invM}-${invD}-${invY}`
          }
          if (order.tasks?.length) {
            inspections = order.tasks.filter(
              (task) => task.type === 'inspections'
            )
            workToDos = order.tasks.filter((task) => task.type === 'workToDos')
            allowables = order.tasks.filter(
              (task) => task.type === 'allowables'
            )
          }

          return {
            ...order,
            createdAt: this.$formatDate(order.createdAt),
            createdAtTimeStamp: this.$formatDate(order.createdAt, {
              timestamp: true,
            }),
            rfoDate: rfoDate || '',
            invoicedAt: invDate || '',
            inspections: inspections || [],
            workToDos: workToDos || [],
            allowables: allowables || [],
            invoiceCompletedByName: invoiceCompletedByName || '',
            invoiceSentByName: invoiceSentByName || '',
            contractors: order.contractors
              .map((contractor) => contractor.fullName)
              .join(', '),
          }
        })
        .sort((a, b) => {
          if (a.createdAtTimeStamp > b.createdAtTimeStamp) {
            return 1
          } else if (b.createdAtTimeStamp > a.createdAtTimeStamp) {
            return -1
          } else {
            return 0
          }
        })
    },
  },
  watch: {
    expanded: {
      handler(newVal, oldVal) {
        if (newVal.length > 0 && oldVal.length < newVal.length) {
          newVal.forEach((order) => {
            if (order.tasks.length === 0) {
              this.getTasks(order)
            }
          })
        }
      },
      deep: true,
    },
    order: {
      handler(newVal, oldVal) {
        if (newVal.propertyId !== oldVal.propertyId) {
          this.loadOrder()
        }
      },
      deep: true,
    },
  },

  mounted() {
    if (!this.orders.length && this.order.propertyId) {
      this.loadOrder()
    }
  },
  methods: {
    sortDateString(a, b) {
      const [aMonth, aDay, aYear] = a.split('-')
      const [bMonth, bDay, bYear] = b.split('-')
      const aDateString = `${aYear}-${aMonth}-${aDay}`
      const bDateString = `${bYear}-${bMonth}-${bDay}`
      if (aDateString > bDateString) return 1
      if (aDateString < bDateString) return -1
      return 0
    },
    async getTasks(order) {
      try {
        const indexOfOrder = this.orders.findIndex((o) => o.id === order.id)
        if (indexOfOrder === -1) return

        const originalOrder = this.orders[indexOfOrder]

        if (originalOrder.tasksLoaded || order.loadingTasks) return

        order.loadingTasks = true
        const tasks = await this.$store.dispatch(
          'order/get_jobTasksByOrdersProperty',
          {
            orderId: order.id,
          }
        )
        order.tasks.push(...tasks)
        originalOrder.tasksLoaded = true
      } catch (error) {
        // eslint-disable-next-line
        console.log('error loading tasks by order', error)
        this.$mainAlertError(
          'There was an error loading tasks. Please try later. If problem persists, contact tecnical support'
        )
      } finally {
        order.loadingTasks = false
      }
    },
    handleNavigateTo(orderId) {
      this.$emit('close')

      const routeName = this.$route.name.includes('cdp')
        ? 'cdp-id'
        : 'dispatching-id'

      if (this.$route.fullPath.includes('cdp')) {
        this.$router.push(`/cdp/${orderId}`)
        return
      }

      this.$router.replace({
        routeName,
        params: { id: orderId },
      })
    },
    async loadOrder() {
      try {
        this.loading = true

        let propertyId = this.order.propertyId

        if (!propertyId) {
          propertyId = this.$getPropertyId(this.order)
        }

        this.orders = await this.$store.dispatch(
          'order/get_ordersByPropertyId',
          { propertyId }
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error loading orders by propertyId', error)
        this.$mainAlertError(
          'There was an error loading property history. Please try later. If problem persists, contact tecnical support'
        )
      } finally {
        this.loading = false
      }
    },
    handleTaskViewModal({ task, order }) {
      this.taskSelected = task
      this.orderSelected = order
      this.showTaskView = true
    },
  },
}
</script>

<style lang="scss" scoped>
.property-history {
  max-width: 1300px;
  max-height: 400px;
}
.item {
  background-color: var(--clr-neutral-200);
}

.item-meta {
  font-size: 0.8rem;
  color: var(--v-info-base);
}

.metadata {
  text-align: right;
}
ul {
  list-style: none;
}

.history-table {
  display: flex;
  background-color: var(--clr-bg-alt);
  ::v-deep .v-data-table__expanded__content {
    background-color: var(--clr-neutral-200);
  }
  ::v-deep .v-data-table__expanded.v-data-table__expanded__row {
    background-color: var(--clr-neutral-200);
  }
  ::v-deep.v-data-table--dense
    > .v-data-table__wrapper
    > table
    > tbody
    > tr
    > td {
    height: 24px;
  }
  ::v-deep.v-data-table.v-data-table--fixed-header thead th {
    background-color: var(--clr-bg-alt);
  }
  ::v-deep
    .v-data-table
    > .v-data-table__wrapper
    > table
    > thead
    > tr
    > th.header-text {
    color: var(--v-info-base);
  }
  ::v-deep.v-data-table
    > .v-data-table__wrapper
    > table
    > thead
    > tr
    > th.header-text {
    color: var(--v-info-base);
  }
}

::v-deep .truncate {
  max-width: 1px;
  min-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.theme--dark {
  .order-link {
    color: var(--v-primary-lighten4);
  }
}
.order-link {
  text-decoration: none;
  color: var(--v-primary-base);
}

.task-item:hover {
  background-color: var(--v-secondary-base);
}
</style>
