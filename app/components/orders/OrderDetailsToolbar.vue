<template>
  <div class="order-details-toolbar">
    <v-toolbar
      color="secondary"
      class="content-toolbar elevation-0 pl-3 pr-4"
      dark
      dense
    >
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mr-2"
            icon
            small
            v-bind="attrs"
            v-on="on"
            @click.stop="!fromOos ? $router.go(-1) : $router.replace('/cdp')"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('back') }}</span>
      </v-tooltip>
      <v-toolbar-title
        class="accent--text text-md-h6 font-weight-bold d-flex align-center gap-8"
        :class="!fromOos ? 'center-icon-dispaching' : ''"
      >
        WO#: {{ order.woNumber }}
        <span v-if="order?.generalStatus" class="general-status">{{
          order.generalStatus
        }}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            class="mr-4"
            size="20"
            :color="order.orderNew ? 'green lighten-2' : ''"
            v-bind="attrs"
            v-on="on"
          >
            mdi-bookmark
          </v-icon>
        </template>
        <span>{{ !order.orderNew ? 'Old Order' : 'New Order' }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mr-4"
            icon
            small
            v-bind="attrs"
            v-on="on"
            @click.stop="handleSetOnHoldOrder(order)"
          >
            <v-icon size="20" :color="order.onHold ? 'green lighten-2' : ''">
              mdi-timer
            </v-icon>
          </v-btn>
        </template>
        <span>{{
          order.onHold
            ? 'Remove on-hold from this order(s)'
            : 'Set on-hold this order(s)'
        }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mr-4"
            small
            icon
            v-bind="attrs"
            v-on="on"
            @click.stop="handleArchiveOrder(order)"
          >
            <v-icon size="20" :color="order.archive ? 'green lighten-2' : ''">
              mdi-archive
            </v-icon>
          </v-btn>
        </template>
        <span>Archive Order</span>
      </v-tooltip>

      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mr-4"
            small
            icon
            :loading="loadingReportsByDownload"
            v-bind="attrs"
            v-on="on"
            @click="handleDownloadAllOrderReports()"
          >
            <v-icon size="20"> mdi-tray-arrow-down </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Download All Order Reports') }}</span>
      </v-tooltip>

      <v-spacer></v-spacer>

      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn small icon class="mr-3">
            <v-icon
              :color="showNotePad ? 'primary' : ''"
              small
              v-bind="attrs"
              v-on="on"
              @click="handleShowNotePad"
              >mdi-pencil</v-icon
            >
          </v-btn>
        </template>
        <span>{{
          !showNotePad ? $t('showOrderNotePad') : $t('hideOrderNotePad')
        }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn small icon class="mr-3">
            <v-icon
              :color="showChats ? 'primary' : ''"
              small
              v-bind="attrs"
              v-on="on"
              @click="handleShowOrderChat"
              >mdi-chat</v-icon
            >
          </v-btn>
        </template>

        <span>{{
          !showChats ? $t('showOrderChat') : $t('hideOrderChat')
        }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            :class="!fromOos ? 'mr-3' : 'center-icon-oos'"
            small
            icon
            @click="$emit('toggle-show-history')"
          >
            <v-icon
              :color="showHistory ? 'primary' : ''"
              size="20"
              v-bind="attrs"
              v-on="on"
              >mdi-history</v-icon
            >
          </v-btn>
        </template>
        <span>
          {{
            !showHistory ? $t('showOrderHistory') : $t('hideOrderHistory')
          }}</span
        >
      </v-tooltip>
      <v-menu
        v-model="showPropertyHistoryDrawer"
        bottom
        offset-y
        :close-on-content-click="false"
        left
        :open-on-hover="!showPropertyHistoryDrawer"
        offset-overflow
        class="history-menu"
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                id="property-history-btn"
                icon
                small
                class="mr-3"
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
              >
                <v-icon
                  size="20"
                  :color="showPropertyHistoryDrawer ? 'primary' : ''"
                  >mdi-home-clock-outline</v-icon
                >
              </v-btn>
            </template>
            <span>{{
              !showPropertyHistoryDrawer
                ? $t('showPropertyHistory')
                : $t('hidePropertyHistory')
            }}</span>
          </v-tooltip>
        </template>

        <property-history
          v-if="showPropertyHistoryDrawer"
          :order="order"
          @close="showPropertyHistoryDrawer = false"
        ></property-history>
      </v-menu>
      <v-tooltip v-if="!fromOos" open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            small
            icon
            class="mr-5"
            v-bind="attrs"
            v-on="on"
            @click="$emit('toggle-job-notes-drawer')"
          >
            <v-icon size="20" :color="showJobNotesDrawer ? 'primary' : ''"
              >mdi-notebook-edit-outline</v-icon
            >
          </v-btn>
        </template>
        <span>{{
          !showJobNotesDrawer ? $t('showJobNotes') : $t('hideJobNotes')
        }}</span>
      </v-tooltip>

      <v-btn
        class="mr-4 elevation-0"
        :color="order.edited ? 'green lighten-2' : 'primary'"
        x-small
        @click.stop="sendUpdateEdited"
      >
        {{ order.edited ? $t('Order Edited') : $t('Editing Order') }}
      </v-btn>

      <div v-if="!fromOos" class="mr-0">
        <v-menu max-height="400" offset-y transition="slide-y-transition">
          <!-- eslint-disable-next-line  -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              class="elevation-0"
              x-small
              v-bind="attrs"
              v-on="on"
            >
              {{ order.status ? $truncate(order.status, 17) : 'Inactive' }}
            </v-btn>
          </template>

          <v-list dense>
            <v-list-item
              v-for="option in orderStatusList"
              :key="option.id"
              :disabled="order.status === option.title"
              :class="{ active: order.status === option.title }"
              dense
              @click="handleOrderReopenStatus(option)"
            >
              <v-list-item-title>
                {{ option.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-toolbar>
    <confirm-modal
      :show="showConfirmModal"
      :confirm-btn-text="confirmBtnText"
      :loading="loading"
      :cancel-cb="handleCancelingConfirmModal"
      :confirm-boo="confirmBoo"
      :confirm-cb="
        (confirmBoo) => {
          microEditOrder(confirmBoo)
        }
      "
      :question="confirmQuestion"
    />

    <v-dialog
      v-model="showReopenOrder"
      :overlay="false"
      max-width="700px"
      scrollable
      transition="dialog-transition"
      :persistent="formPersistent"
    >
      <add-reopen-order
        v-if="showReopenOrder"
        :order-id="order.id"
        :status="newStatus"
        @is-reopen-order="handleOrderStatus($event)"
        @update-persistent="formPersistent = $event"
        @close="showReopenOrder = false"
      ></add-reopen-order>
    </v-dialog>

    <v-dialog
      v-if="!loadingReportsByDownload"
      v-model="showReportsDownload"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <reports-all-order-download
        v-if="showReportsDownload"
        :reports="reportsByDownload"
        :wo="order.woNumber"
        :tasks="tasksInOrder"
        @close="showReportsDownload = false"
      ></reports-all-order-download>
    </v-dialog>
  </div>
</template>

<script>
import ReportsAllOrderDownload from '../oos/taskContent/download/ReportsAllOrderDownload.vue'
import AddReopenOrder from './reopen/AddReopenOrder.vue'
import PropertyHistory from './propertyHistory/PropertyHistory.vue'
import ConfirmModal from '@/components/orders/modals/ConfirmModal.vue'
import ordersMicroEdits from '@/mixins/ordersMicroEdits'
import { JOB_TYPES, ORDER_STATUS } from '@/utils/dictionaries'

export default {
  name: 'OrderDetailsToolbar',
  components: {
    ConfirmModal,
    AddReopenOrder,
    PropertyHistory,
    ReportsAllOrderDownload,
  },
  mixins: [ordersMicroEdits],
  props: {
    order: { type: Object, required: true },
    showJobNotesDrawer: { type: Boolean, default: false },
    showHistory: { type: Boolean, default: false },
    fromOos: { type: Boolean, default: false },
  },
  data() {
    return {
      orderdEdited: false,
      dialogConfirmEdited: false,
      showConfirmModal: false,
      confirmQuestion: '',
      confirmBtnText: '',
      confirmBoo: false,
      loading: false,
      showReopenOrder: false,
      formPersistent: false,
      newStatus: '',
      ORDER_STATUS: null,
      showNotePad: false,
      loadingReportsByDownload: false,
      reportsByDownload: [],
      showReportsDownload: false,
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user
    },
    showPropertyHistoryDrawer: {
      get() {
        return this.$store.state.order.showPropertyHistoryDrawer
      },
      set(val) {
        this.$store.commit('order/set_showPropertyHistoryDrawer', val)
      },
    },
    showChats() {
      return this.$store.state.chats.showChats
    },
    orderStatusList() {
      return this.$store.state.orderStatusList
        .map((s) => s)
        .sort((a, b) => {
          return a.title > b.title ? 1 : -1
        })
    },
    tasksInOrder() {
      const tasks = []

      tasks.push(...this.order.inspections)
      tasks.push(...this.order.workToDos)
      tasks.push(...this.order.allowables)

      return tasks
    },
  },
  watch: {
    order(value) {
      this.orderdEdited = value.edited
    },
  },
  created() {
    this.ORDER_STATUS = ORDER_STATUS
  },
  mounted() {
    this.$nextTick(() => {
      this.orderdEdited = this.order.edited
    })
    this.init()
  },
  methods: {
    async init() {
      try {
        this.loading = true
        if (!this.orderStatusList.length) {
          await this.$store.dispatch('get_orderStatusList')
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleShowOrderChat() {
      this.$store.commit('chats/set_roomSelected', this.order.chatRoomId)
      this.$store.commit('chats/toggleShowChats')
    },
    handleShowNotePad() {
      this.showNotePad = !this.showNotePad
      this.$emit('toggle-show-note-pad')
    },
    sendUpdateEdited() {
      this.dialogConfirmEdited = false
      this.orderdEdited = !this.orderdEdited
      this.$emit('order-edited-changed', this.orderdEdited)
    },
    cancelUpdateEdited() {
      this.dialogConfirmEdited = false
    },
    handleOrderReopenStatus(status) {
      const _status = status.title.trim().toLowerCase()
      const _statusOrder = this.order.status.trim().toLowerCase()

      if (
        (_statusOrder === ORDER_STATUS.invoiced.toLowerCase() ||
          _statusOrder === ORDER_STATUS.closed.toLowerCase()) &&
        (_status === ORDER_STATUS.inField.toLowerCase() ||
          _status === ORDER_STATUS.readyForOffice.toLowerCase())
      ) {
        this.newStatus = status.title
        this.showReopenOrder = true
        return
      }
      this.handleChangeStatus(status)
    },
    async handleOrderStatus(status) {
      try {
        await this.$store.dispatch('oos/orders/handleOrderStatus', {
          orderId: this.order.id,
          status,
        })
        this.$mainAlertSuccess(this.$t('Success! Updated order status'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async handleChangeStatus(status) {
      try {
        this.loading = true
        await this.$store.dispatch('oos/orders/add_statusOrder', {
          orderId: this.order.id,
          status: status.title,
        })
        this.handleOrderStatus(status.title)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleDownloadAllOrderReports() {
      this.showReportsDownload = true
      if (!this.reportsByDownload?.length) {
        this.get_orderReports()
      }
    },
    async get_orderReports() {
      try {
        this.loadingReportsByDownload = true

        const tasks = {}

        tasks[JOB_TYPES.workToDos] =
          this.order[JOB_TYPES.workToDos]?.map((t) => t.id) ?? []
        tasks[JOB_TYPES.inspections] =
          this.order[JOB_TYPES.inspections]?.map((i) => i.id) ?? []
        tasks[JOB_TYPES.allowables] =
          this.order[JOB_TYPES.allowables]?.map((a) => a.id) ?? []

        const _reports = await this.$store.dispatch('order/get_orderReports', {
          orderId: this.order.id,
          tasks,
        })
        this.reportsByDownload = _reports
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting reports', error)
        this.$mainAlertError('Error getting Reports')
      } finally {
        this.loadingReportsByDownload = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.active {
  color: var(--v-primary-base);
  background-color: #3276dc30;
}
.history-menu {
  overflow: hidden;
}

.general-status {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: var(--v-primary-base);
  color: var(--v-accent-base);
  border-radius: 100vw;
  align-self: center;
  line-height: 1;
}
</style>
