<template>
  <!-- v-if="task && task.reports && reports" -->
  <div
    class="task-toolbar | terciary d-flex pa-2 align-center gap-8"
    :class="!standalone ? 'rounded' : ''"
  >
    <v-tooltip v-if="standalone" open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          nuxt
          exact
          icon
          small
          class="mr-2 ml-2"
          :to="{
            name: 'cdp-route',
            query: { ...$route.query, taskSelected: '' },
          }"
          v-bind="attrs"
          v-on="on"
          ><v-icon>mdi-chevron-left</v-icon></v-btn
        >
      </template>
      <span>{{ $t('back') }}</span>
    </v-tooltip>

    <div class="d-flex flex-column ml-2">
      <div class="d-flex">
        <h2 class="task-title | flex-shrink-1">{{ task.title }}</h2>
        <v-tooltip
          v-if="task.type === JOB_TYPES.allowables && !standalone"
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mr-5"
              color="primary"
              icon
              small
              :loading="loadingReqs"
              v-bind="attrs"
              v-on="on"
              @click="handleShowEditAllowable"
            >
              <v-icon small> mdi-pencil-outline </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('editTask') }}</span>
        </v-tooltip>
      </div>

      <span
        v-if="
          priceFormated >= 0 &&
          (task.type === JOB_TYPES.workToDos ||
            task.type === JOB_TYPES.allowables)
        "
        class="price-task | info--text"
        >{{ $t('price') }}: ${{ priceFormated }}</span
      >
    </div>

    <!-- <div v-if="task.type === JOB_TYPES.allowables">
      {{ $t('price') }}: ${{ taskFormatted.priceToShow }}
    </div> -->

    <v-spacer></v-spacer>

    <div
      v-if="task.status === TASK_STATUS.taskCompleted && task.taskApprovedBy"
      :class="!standalone ? 'mr-10' : ''"
      class="container-aproved-by | text-caption"
    >
      {{ $t('approvedBy') }}:
      <v-icon size="14" color="green"> mdi-account-hard-hat-outline</v-icon
      >{{ task.taskApprovedBy.fullName }}
    </div>

    <div class="mr-10 ml-10 d-flex align-center">
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            class="mr-1"
            :color="task.status === TASK_STATUS.idle ? 'red' : 'grey'"
            size="18"
            v-bind="attrs"
            v-on="on"
            >mdi-circle</v-icon
          >
        </template>
        <span>{{ $t('taskIdle') }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            class="mr-1"
            :color="
              task.status === TASK_STATUS.performingWork ? 'yellow' : 'grey'
            "
            size="18"
            v-bind="attrs"
            v-on="on"
            >mdi-circle</v-icon
          >
        </template>
        <span>{{ $t('performingWork') }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            :color="
              task.status === TASK_STATUS.taskCompleted ? 'green' : 'grey'
            "
            size="18"
            v-bind="attrs"
            v-on="on"
            >mdi-circle</v-icon
          >
        </template>
        <span>{{ $t('taskCompleted') }}</span>
      </v-tooltip>
    </div>
    <div class="mr-10">
      <!-- <h4 class="sub-title | mb-1">{{ $t('status') }}</h4> -->

      <v-menu
        v-if="standalone"
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
            <div v-if="task.status === TASK_STATUS.idle" class="idle">
              Inactive
            </div>
            <div
              v-else-if="task.status === TASK_STATUS.performingWork"
              class="performingWork"
            >
              {{ $t('performingWork') }}
            </div>
            <div
              v-else-if="task.status === TASK_STATUS.taskCompleted"
              class="taskCompleted"
            >
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
                (option.value === TASK_STATUS.idle &&
                  task.status === TASK_STATUS.idle) ||
                (option.value === TASK_STATUS.performingWork &&
                  task.status === TASK_STATUS.performingWork) ||
                (option.value === TASK_STATUS.taskCompleted &&
                  task.status === TASK_STATUS.taskCompleted)
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

    <div class="btn-toolbar | mr-4">
      <v-tooltip v-if="standalone" top open-delay="600" content-class="small">
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            small
            v-bind="attrs"
            v-on="on"
            @click="expandAll = !expandAll"
          >
            <v-icon size="18" :color="expandAll ? 'primary' : 'grey'">
              mdi-arrow-expand-all
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('expand') }}</span>
      </v-tooltip>

      <v-tooltip v-if="standalone" top open-delay="600" content-class="small">
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            :disabled="!reports.length"
            icon
            small
            v-bind="attrs"
            v-on="on"
            @click="showReportsDownload = !showReportsDownload"
            ><v-icon size="18" color="primary"> mdi-tray-arrow-down </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('downloadAllPhoto') }}</span>
      </v-tooltip>

      <v-tooltip v-if="standalone" open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            small
            v-bind="attrs"
            v-on="on"
            @click="handleShowTaskInfo()"
          >
            <v-icon size="18" :color="!showTaskInfoDrawer ? 'grey' : 'primary'"
              >mdi-information-outline
            </v-icon>
          </v-btn>
        </template>
        <span>{{
          !showTaskInfoDrawer ? $t('showTaskInfo') : $t('hideTaskInfo')
        }}</span>
      </v-tooltip>

      <v-tooltip v-if="!standalone" open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            small
            nuxt
            :to="{
              name: 'cdp-route-task',
              query: {
                ...$route.query,
                taskSelected: task.id,
                taskTypeSelected: task.type,
              },
            }"
          >
            <v-icon color="primary" v-bind="attrs" v-on="on">
              mdi-chevron-double-right
            </v-icon>
          </v-btn>
          <!-- <v-btn icon small @click="handleShowTask()">
            <v-icon color="primary" v-bind="attrs" v-on="on">
              mdi-chevron-double-right
            </v-icon>
          </v-btn> -->
        </template>
        <span>{{ $t('showTask') }}</span>
      </v-tooltip>
    </div>

    <v-dialog
      v-model="showEditAllowableModal"
      :persistent="validatePersistent"
      scrollable
      max-width="1000px"
    >
      <add-task
        v-if="showEditAllowableModal"
        :order="order"
        :job-type="jobTypeSelected"
        :job-task-to-edit="jobTaskToEdit"
        :max-value="maxValue"
        @update-persistent="validatePersistent = $event"
        @close="handleCloseEditAllowable"
      />
    </v-dialog>

    <v-dialog
      v-model="showAddRequirements"
      :overlay="false"
      max-width="700px"
      scrollable
      transition="dialog-transition"
    >
      <AddRequirements
        v-if="showAddRequirements"
        :order-id="orderId"
        :task-id="task.id"
        :type="task.type"
        :last-positions-req="lastPositionsReq"
        requirement-from="General"
        @close="showAddRequirements = false"
      >
      </AddRequirements>
    </v-dialog>

    <v-dialog
      v-model="showReportsDownload"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <reports-all-download
        v-if="showReportsDownload"
        :reports="reports"
        :type="`${task.title} ${task.type}`"
        :wo="wo"
        :task="task"
        @close="showReportsDownload = false"
      ></reports-all-download>
    </v-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import AddRequirements from './requirements/AddRequirements.vue'
import ReportsAllDownload from './download/ReportsAllDownload.vue'
import AddTask from '~/components/orders/task/AddTask.vue'
import { JOB_TYPES, TASK_STATUS } from '~/utils/dictionaries'

export default {
  components: { AddRequirements, AddTask, ReportsAllDownload },
  props: {
    task: { type: Object, default: () => ({}) },
    order: { type: Object, default: () => ({}) },
    orderId: { type: String, default: '' },
    wo: { type: String, default: '' },
    standalone: { type: Boolean, default: false },
    maxValue: { type: Number, default: Number.POSITIVE_INFINITY },
  },
  data() {
    return {
      JOB_TYPES: null,
      TASK_STATUS: null,
      showAddRequirements: false,
      loading: false,
      showAddItemsForInvoices: false,
      invoiceBd: [],
      showEditAllowableModal: false,
      validatePersistent: false,
      jobTaskToEdit: {},
      jobTypeSelected: {},
      showReportsDownload: false,
      showUserInfoApproved: null,
      loadingReqs: false,
      expandAll: false,
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      selectRoute: (state) => state.oos.routes.selectRoute,
      selectOrder: (state) => state.oos.routes.selectOrder,
    }),

    lastPositionsReq() {
      const _requirements = this.task.requirements.filter(
        (req) => req.fromGeneral
      )

      return _requirements.length
    },

    reports() {
      if (!this.task.reports) return []
      return this.task.reports
        .filter((report) => report.url !== '' && report.url)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    taskStatusOptions() {
      return [
        { value: TASK_STATUS.idle, title: this.$t('Inactive') },
        { value: TASK_STATUS.performingWork, title: this.$t('performingWork') },
        { value: TASK_STATUS.taskCompleted, title: this.$t('taskCompleted') },
      ]
    },
    taskFormatted() {
      const _task = JSON.parse(JSON.stringify(this.task))
      const isAllowable = this.task.type === JOB_TYPES.allowables
      if (
        isAllowable &&
        this.task.itemsForInvoices &&
        this.task.itemsForInvoices.length
      ) {
        _task.priceToShow = this.task.itemsForInvoices.reduce((acc, item) => {
          const price = parseFloat(item.price)
          const qty = parseFloat(item.qty)
          const finalValue = qty * price
          return acc + finalValue
        }, 0)
      }
      return _task
    },
    unreadChats() {
      const unreadChats = {
        count: 0,
        content: '',
      }

      if (this.taskFormatted?.taskChats?.length) {
        const unreadChatsCount = this.taskFormatted.taskChats.filter((chat) => {
          const readBy = chat.readBy?.includes(this.user.profile.uid)
          const isAuthor = this.user.profile.uid === chat.createdBy?.uid

          return !isAuthor && !readBy
        }).length
        unreadChats.count = unreadChatsCount
        unreadChats.content = unreadChatsCount > 9 ? '+9' : unreadChatsCount
      }

      return unreadChats
    },
    showTaskInfoDrawer: {
      get() {
        return this.$store.state.oos.orders.showTaskInfoDrawer
      },
      set(val) {
        this.$store.commit('oos/orders/set_showTaskInfoDrawer', val)
      },
    },
    showTaskChats: {
      get() {
        return this.$store.state.oos.orders.showTaskChats
      },
      set(val) {
        this.$store.commit('oos/orders/set_showTaskChats', val)
      },
    },
    taskSelected() {
      return this.$store.state.oos.orders.taskSelected
    },
    isSupervisor() {
      const _claims = this.user.userCredential.claims
      return _claims.rol === 'admin' && _claims.authLevel > 6
    },
    priceFormated() {
      let price = 0
      if (this.task && this.task.itemsForInvoices) {
        for (let i = 0; i < this.task.itemsForInvoices.length; i++) {
          const item = this.task.itemsForInvoices[i]

          price = price + parseFloat(item.price) * parseFloat(item.qty)
        }
      }

      return price
    },
  },

  watch: {
    expandAll(val) {
      this.$emit('expand-all', val)
    },
  },

  created() {
    this.JOB_TYPES = JOB_TYPES
    this.TASK_STATUS = TASK_STATUS
  },

  methods: {
    handleCloseEditAllowable() {
      this.jobTaskToEdit = {}
      this.showEditAllowableModal = false

      if (
        !this.$store.state.oos.orders.requirementsUnsuscribeMap[
          `${this.selectOrder}-${this.task.id}-${JOB_TYPES.allowables}`
        ]
      ) {
        this.$store.commit('oos/orders/flush_task_requirements', {
          taskId: this.task.id,
          orderId: this.selectOrder,
          taskType: JOB_TYPES.allowables,
        })
      }
    },
    async handleShowEditAllowable() {
      const _jobType = { title: 'Allowables', type: 'allowables' }

      let requirements = this.task?.requirements || []

      if (!requirements.length) {
        try {
          this.loadingReqs = true
          await this.$store.dispatch('oos/order/get_requirements_by_task', {
            taskId: this.task.id,
            taskType: _jobType.type,
            orderId: this.selectOrder,
          })
        } catch (error) {
          this.$mainAlertError(
            'There was an error loading requirements, please try again. If problem persists, contact support.'
          )
          // eslint-disable-next-line
          console.log('error loading requirements', error)
        } finally {
          this.loadingReqs = false
        }
        const indexOfReqList =
          this.$store.state.oos.orders.requirementsListMap.findIndex((rl) => {
            return (
              rl.taskId === this.task.id &&
              rl.taskType === _jobType.type &&
              rl.orderId === this.selectOrder
            )
          })
        if (indexOfReqList > -1) {
          requirements =
            this.$store.state.oos.orders.requirementsListMap[indexOfReqList]
              .requirements
        }
      }

      this.$nextTick(() => {
        this.jobTaskToEdit = JSON.parse(
          JSON.stringify({ ...this.task, requirements })
        )
        this.jobTypeSelected = _jobType
        this.showEditAllowableModal = true
      })
    },
    handleSetTaskSeleted() {
      this.$store.commit('oos/orders/set_taskSelected', {
        taskId: this.task.id,
        taskTitle: this.task.title,
        orderId: this.orderId,
        wo: this.wo,
        type: this.task.type,
      })
    },
    handleShowTaskInfo() {
      this.showTaskInfoDrawer = !this.showTaskInfoDrawer
    },
    handleTaskChats() {
      this.showTaskChats = !this.showTaskChats
    },
    handleShowTask() {
      this.handleSetTaskSeleted()
      this.$store.commit('oos/orders/set_showTask', true)
      this.$nextTick(() => {
        this.$router.push({
          name: 'cdp-route-task',
          params: {
            selectOrder: this.orderId,
            selectRoute: this.selectRoute || '',
          },
        })
      })
    },
    async handleTaskStatus(newStatus) {
      try {
        // eslint-disable-next-line
        console.log(
          'this.task.id, this.orderId, this.task.type',
          this.task.id,
          this.selectOrder,
          this.task.type
        )

        await this.$store.dispatch('oos/orders/handleTaskStatus', {
          taskId: this.task.id,
          orderId: this.selectOrder,
          type: this.task.type,
          newStatus,
        })
        this.$mainAlertSuccess('Success! Updated task status')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async getInvoice() {
      try {
        const _invoice = await this.$store.dispatch(
          'order/get_invoiceData',
          this.orderId
        )
        if (_invoice) {
          const _invoiceBd = {
            ..._invoice,
            items: _invoice.items ? [..._invoice.items] : [],
          }
          this.invoiceBd = _invoiceBd.items
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
      }
    },
    async hanldeAddItemsForInvoices() {
      if (!this.task.itemsForInvoices || !this.task.itemsForInvoices.length) {
        return
      }
      await this.getInvoice()
      const _items = []
      for (let i = 0; i < this.task.itemsForInvoices.length; i++) {
        const item = this.task.itemsForInvoices[i]
        _items.push({
          price: parseFloat(item.price),
          itemDescription: item.title,
          fee: false,
          qty: parseInt(item.qty),
        })
      }
      const items = this.invoiceBd.concat(_items)
      const objectTosend = {
        orderId: this.orderId,
        localInvoice: {
          items,
          discount: 25,
        },
      }
      try {
        await this.$store.dispatch('order/add_invoice', objectTosend)
      } catch (error) {
        this.$mainAlertError(error, this.$t('oopsProblem'))
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.task-toolbar {
  min-height: 48px;
}
.task-title {
  font-size: 1.125rem;
  font-weight: bold;
}
.price-task {
  font-size: 0.8rem;
  font-weight: bold;
}
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
  .performingWork {
    color: #ffffff;
    background-color: var(--v-success-base);
  }
  .taskCompleted {
    color: #ffffff;
    background-color: var(--v-primary-base);
  }
}
.container-user {
  cursor: pointer;
}
</style>
