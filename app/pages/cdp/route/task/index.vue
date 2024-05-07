<template>
  <div class="task-wrapper | d-flex h-100 gap-8 pa-4">
    <div v-if="showOrderGeneralInfo" class="order-info pa-4">
      <div v-if="order" class="general-info-wrapper">
        <orders-general-info :order="order"> </orders-general-info>
      </div>
    </div>

    <div v-if="taskSelected && task" class="task-index h-100 flex-grow-1">
      <div
        class="task-content_inner | d-flex flex-column section-color h-100 overflow-y-auto"
      >
        <div
          v-if="task.status === TASK_STATUS.idle"
          class="sub-title | d-flex align-center justify-center grey--text"
        >
          {{ $t('itsNotStartedYet') }}
        </div>
        <div
          v-if="loading"
          class="container-loader | pa-4 d-flex align-center rounded justify-center"
        >
          <v-progress-circular
            indeterminate
            size="34"
            color="primary"
          ></v-progress-circular>
        </div>

        <div v-else>
          <div
            v-if="
              task.areasInReports &&
              task.areasInReports.length &&
              task.status !== TASK_STATUS.idle &&
              task.type === JOB_TYPES.inspections
            "
            class="reports-container | flex-grow-1"
          >
            <div
              v-for="(area, index) in task.areasInReports"
              :key="index"
              class="terciary rounded pa-3 mb-4"
            >
              <reports-section
                :title="area"
                :reports="reportsByArea[area]"
                :process-time="PROCESS_TIME_TYPES.inspection"
                :area="area"
                :task="task"
                :approve-text="$t('approveArea')"
                :requirements="
                  requirementsFromInspection.filter(
                    (req) => req.inspectionArea === area
                  )
                "
                :reports-from-requirements="reportsFromRequirements"
                :order-id="orderId"
                :work-order-number="wo"
                :download-text="`${$t('downloadPhotosOf')} ${area}`"
                :add-requirements-text="`${$t('addRequirementsIn')} ${area}`"
                :contractor-completed="
                  (task.contractorCompletedByArea &&
                    task.contractorCompletedByArea[area]) ||
                  false
                "
                :show-add-requirement-btn="true"
                :show-approve-box="true"
                :show-total-reports-icon="true"
                :show-actions-requirement-btn="true"
                :from-oos="true"
                :show-add-reports-btn="true"
                :started="
                  task.startedByArea &&
                  task.startedByArea[area] &&
                  task.startedByArea[area].started
                    ? task.startedByArea[area].started
                    : false
                "
                :finished="
                  task.startedByArea &&
                  task.startedByArea[area] &&
                  task.startedByArea[area].finished
                    ? task.startedByArea[area].finished
                    : false
                "
                :started-at="
                  task.startedByArea &&
                  task.startedByArea[area] &&
                  task.startedByArea[area].startedAt
                    ? task.startedByArea[area].startedAt
                    : {}
                "
                :started-by="
                  task.startedByArea &&
                  task.startedByArea[area] &&
                  task.startedByArea[area].startedBy
                    ? task.startedByArea[area].startedBy
                    : {}
                "
                :finished-by="
                  task.startedByArea &&
                  task.startedByArea[area] &&
                  task.startedByArea[area].finishedBy
                    ? task.startedByArea[area].finishedBy
                    : {}
                "
                :finished-at="
                  task.startedByArea &&
                  task.startedByArea[area] &&
                  task.startedByArea[area].finishedAt
                    ? task.startedByArea[area].finishedAt
                    : {}
                "
                :expand-all="expandAllReportsSection"
              />
              <requirements
                v-if="
                  requirementsFromInspection &&
                  requirementsFromInspection.length &&
                  requirementsFromInspection.filter(
                    (req) => req.inspectionArea === area
                  ).length
                "
                :requirements="
                  requirementsFromInspection.filter(
                    (req) => req.inspectionArea === area
                  )
                "
                :reports="reportsFromRequirements"
                :order-id="orderId"
                :task-id="task.id"
                :type="task.type"
                :task="task"
                :area="area"
                :work-order-number="wo"
                :show-add-requirement-btn="true"
                :show-approve-box="true"
                :show-total-reports-icon="true"
                :show-actions-requirement-btn="true"
                :from-oos="true"
                :show-add-reports-btn="true"
                :expand-all-reports-section="expandAllReportsSection"
                @disapprove-requirement="
                  disapproveTask({ type: PROCESS_TIME_TYPES.inspection, area })
                "
              />
            </div>
          </div>

          <div
            v-else-if="
              task.needProcessTimes &&
              !task.areasInReports &&
              task.status !== TASK_STATUS.idle
            "
            class="reports-container | flex-grow-1"
          >
            <div class="terciary rounded pa-3 mb-4">
              <SectionToolbar
                :title="$t('before')"
                :process-time="PROCESS_TIME_TYPES.before"
                :order-id="orderId"
                :task="task"
                :requirements="requirementsFromBefore"
                :reports="beforeReports"
                :reports-from-requirements="reportsFromRequirements"
                :from-oos="true"
              />

              <div class="elevation-1">
                <reports-section
                  v-if="beforeReports && beforeReports.length"
                  class="ml-2 mt-4"
                  :title="$t('generalReports')"
                  :reports="beforeReports"
                  :process-time="PROCESS_TIME_TYPES.before"
                  :task="task"
                  :approve-text="$t('approveBefore')"
                  :requirements="requirementsFromBefore"
                  :reports-from-requirements="reportsFromRequirements"
                  :order-id="orderId"
                  :contractor-completed="task.contractorCompletedBefore"
                  :work-order-number="wo"
                  :download-text="$t('downloadBeforePhotos')"
                  :add-requirements-text="$t('addRequirementsForBefore')"
                  :show-add-requirement-btn="false"
                  :show-approve-box="true"
                  :show-total-reports-icon="true"
                  :show-actions-requirement-btn="false"
                  :from-oos="true"
                  :show-add-reports-btn="true"
                  :started="task.beforeStarted"
                  :finished="task.beforeFinished"
                  :started-at="task.beforeStartedAt"
                  :started-by="task.beforeStartedBy"
                  :finished-by="task.beforeFinishedBy"
                  :finished-at="task.beforeFinishedAt"
                  :expand-all="expandAllReportsSection"
                />
                <requirements
                  v-if="requirementsFromBefore && requirementsFromBefore.length"
                  :requirements="requirementsFromBefore"
                  :reports="reportsFromRequirements"
                  :order-id="orderId"
                  :task-id="task.id"
                  :type="task.type"
                  :task="task"
                  :work-order-number="wo"
                  :show-add-requirement-btn="true"
                  :show-approve-box="true"
                  :show-total-reports-icon="true"
                  :show-actions-requirement-btn="true"
                  :from-oos="true"
                  :show-add-reports-btn="true"
                  :expand-all-reports-section="expandAllReportsSection"
                  @disapprove-requirement="
                    disapproveTask({ type: PROCESS_TIME_TYPES.before })
                  "
                />
              </div>
            </div>
            <div class="terciary rounded pa-3 mb-4">
              <SectionToolbar
                :title="$t('during')"
                :process-time="PROCESS_TIME_TYPES.during"
                :order-id="orderId"
                :task="task"
                :requirements="requirementsFromDuring"
                :reports="duringReports"
                :reports-from-requirements="reportsFromRequirements"
                :from-oos="true"
              />
              <div class="elevation-1">
                <reports-section
                  v-if="duringReports && duringReports.length"
                  class="ml-2 mt-4"
                  :title="$t('generalReports')"
                  :reports="duringReports"
                  :process-time="PROCESS_TIME_TYPES.during"
                  :task="task"
                  :approve-text="$t('approveDuring')"
                  :requirements="requirementsFromDuring"
                  :reports-from-requirements="reportsFromRequirements"
                  :order-id="orderId"
                  :work-order-number="wo"
                  :download-text="$t('downloadDuringPhotos')"
                  :add-requirements-text="$t('addRequirementsForDuring')"
                  :contractor-completed="task.contractorCompletedDuring"
                  :show-add-requirement-btn="false"
                  :show-approve-box="true"
                  :show-total-reports-icon="true"
                  :show-actions-requirement-btn="true"
                  :from-oos="true"
                  :show-add-reports-btn="true"
                  :started="task.duringStarted"
                  :finished="task.duringFinished"
                  :started-at="task.duringStartedAt"
                  :started-by="task.duringStartedBy"
                  :finished-by="task.duringFinishedBy"
                  :finished-at="task.duringFinishedAt"
                  :expand-all="expandAllReportsSection"
                />
                <requirements
                  v-if="requirementsFromDuring && requirementsFromDuring.length"
                  :requirements="requirementsFromDuring"
                  :reports="reportsFromRequirements"
                  :order-id="orderId"
                  :task-id="task.id"
                  :type="task.type"
                  :task="task"
                  :work-order-number="wo"
                  :show-add-requirement-btn="true"
                  :show-approve-box="true"
                  :show-total-reports-icon="true"
                  :show-actions-requirement-btn="true"
                  :from-oos="true"
                  :show-add-reports-btn="true"
                  :expand-all-reports-section="expandAllReportsSection"
                  @disapprove-requirement="
                    disapproveTask({ type: PROCESS_TIME_TYPES.during })
                  "
                />
              </div>
            </div>
            <div class="terciary rounded pa-3 mb-4">
              <SectionToolbar
                :title="$t('after')"
                :process-time="PROCESS_TIME_TYPES.after"
                :order-id="orderId"
                :task="task"
                :requirements="requirementsFromAfter"
                :reports="afterReports"
                :reports-from-requirements="reportsFromRequirements"
                :from-oos="true"
              />
              <div class="elevation-1">
                <reports-section
                  v-if="afterReports && afterReports.length"
                  class="ml-2 mt-4"
                  :title="$t('generalReports')"
                  :reports="afterReports"
                  :process-time="PROCESS_TIME_TYPES.after"
                  :task="task"
                  :approve-text="$t('approveAfter')"
                  :requirements="requirementsFromAfter"
                  :reports-from-requirements="reportsFromRequirements"
                  :order-id="orderId"
                  :work-order-number="wo"
                  :download-text="$t('downloadAfterPhotos')"
                  :add-requirements-text="$t('addRequirementsForAfter')"
                  :contractor-completed="task.contractorCompletedAfter"
                  :show-add-requirement-btn="false"
                  :show-approve-box="true"
                  :show-total-reports-icon="true"
                  :show-actions-requirement-btn="true"
                  :from-oos="true"
                  :show-add-reports-btn="true"
                  :started="task.afterStarted"
                  :finished="task.afterFinished"
                  :started-at="task.afterStartedAt"
                  :started-by="task.afterStartedBy"
                  :finished-by="task.afterFinishedBy"
                  :finished-at="task.afterFinishedAt"
                  :expand-all="expandAllReportsSection"
                />
                <requirements
                  v-if="requirementsFromAfter && requirementsFromAfter.length"
                  :requirements="requirementsFromAfter"
                  :reports="reportsFromRequirements"
                  :order-id="orderId"
                  :task-id="task.id"
                  :type="task.type"
                  :task="task"
                  :work-order-number="wo"
                  :show-add-requirement-btn="true"
                  :show-approve-box="true"
                  :show-total-reports-icon="true"
                  :show-actions-requirement-btn="true"
                  :from-oos="true"
                  :show-add-reports-btn="true"
                  :expand-all-reports-section="expandAllReportsSection"
                  @disapprove-requirement="
                    disapproveTask({ type: PROCESS_TIME_TYPES.after })
                  "
                />
              </div>
            </div>
          </div>
          <div
            v-else-if="
              task.status !== TASK_STATUS.idle &&
              !task.needProcessTimes &&
              task.type !== JOB_TYPES.inspections
            "
            class="reports-container | flex-grow-1"
          >
            <div class="terciary rounded pa-3 mb-4">
              <SectionToolbar
                :title="$t('reports')"
                :process-time="PROCESS_TIME_TYPES.generalReports"
                :order-id="orderId"
                :task="task"
                :requirements="requirementsFromGeneral"
                :reports="reportsNoProcess"
                :reports-from-requirements="reportsFromRequirements"
                :from-oos="true"
              />
              <div class="elevation-1">
                <!-- TODO: Traducir GeneralReport -->
                <reports-section
                  v-if="reportsNoProcess && reportsNoProcess.length"
                  class="ml-2 mt-4"
                  :title="$t('generalReports')"
                  :reports="reportsNoProcess"
                  :process-time="PROCESS_TIME_TYPES.generalReports"
                  :task="task"
                  :approve-text="$t('approveGeneral')"
                  :requirements="requirementsFromGeneral"
                  :reports-from-requirements="reportsFromRequirements"
                  :order-id="orderId"
                  :work-order-number="wo"
                  :download-text="$t('downloadReportsPhotos')"
                  :add-requirements-text="
                    $t('addRequirementsForReportsGeneral')
                  "
                  :contractor-completed="task.contractorCompleted"
                  :show-add-requirement-btn="false"
                  :show-approve-box="true"
                  :show-total-reports-icon="true"
                  :show-actions-requirement-btn="false"
                  :from-oos="true"
                  :show-add-reports-btn="true"
                  :started="task.started"
                  :finished="task.finished"
                  :started-at="task.startedAt"
                  :finished-by="task.finishedBy"
                  :started-by="task.startedBy"
                  :finished-at="task.finishedAt"
                  :expand-all="expandAllReportsSection"
                />
                <requirements
                  v-if="requirementsFromGeneral"
                  :requirements="requirementsFromGeneral"
                  :reports="reportsFromRequirements"
                  :order-id="orderId"
                  :task-id="task.id"
                  :type="task.type"
                  :task="task"
                  :is-general="true"
                  :show-add-requirement-btn="true"
                  :show-approve-box="true"
                  :show-total-reports-icon="true"
                  :show-actions-requirement-btn="true"
                  :from-oos="true"
                  :show-add-reports-btn="true"
                  :show-title-general="!reportsNoProcess.length"
                  :expand-all-reports-section="expandAllReportsSection"
                  @disapprove-requirement="disapproveTask({ type: 'General' })"
                />
              </div>
            </div>
          </div>

          <!-- Requirements -->
          <div
            v-if="
              task.status !== TASK_STATUS.idle &&
              requirementsFromGeneral &&
              requirementsFromGeneral.length &&
              task.type !== JOB_TYPES.inspections &&
              task.needProcessTimes
            "
            class="terciary rounded pa-3 mb-4"
          >
            <SectionToolbar
              :title="$t('generalRequirements')"
              :process-time="PROCESS_TIME_TYPES.generalReports"
              :order-id="orderId"
              :task="task"
              :requirements="requirementsFromGeneral"
              :reports-from-requirements="reportsFromRequirements"
              :from-oos="true"
            />

            <requirements
              :requirements="requirementsFromGeneral"
              :reports="reportsFromRequirements"
              :order-id="orderId"
              :task-id="task.id"
              :type="task.type"
              :task="task"
              :is-general="true"
              :show-add-requirement-btn="false"
              :show-approve-box="true"
              :show-total-reports-icon="true"
              :show-actions-requirement-btn="false"
              :from-oos="true"
              :show-add-reports-btn="true"
              :expand-all-reports-section="expandAllReportsSection"
              @disapprove-requirement="disapproveTask({ type: 'General' })"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Requirements from '~/components/oos/taskContent/requirements/Requirements.vue'
import ReportsSection from '~/components/oos/taskContent/ReportsSection.vue'
import SectionToolbar from '~/components/oos/taskContent/SectionToolbar.vue'
import ordersGeneralInfo from '~/components/oos/ordersToolbar/ordersGeneralInfo.vue'
import {
  JOB_TYPES,
  TASK_STATUS,
  PROCESS_TIME_TYPES,
} from '@/utils/dictionaries'

export default {
  name: 'TaskIndex',
   components: {
    Requirements,
    ReportsSection,
    SectionToolbar,
    ordersGeneralInfo,
  },
  props: {
    expandAllReportsSection: {
      type: Boolean,
      default: true,
    },
  },

 

  data() {
    return {
      rules: [(v) => !!v || this.$t('thisFieldRequired')],
      model: null,
      JOB_TYPES: null,
      TASK_STATUS: null,
      PROCESS_TIME_TYPES: null,
      showImagesSlides: false,
      reportsSelectedToShow: [],
      indexOfImage: 0,
      typeReports: '',
      beforeReportsApproved: false,
      duringReportsApproved: false,
      afterReportsApproved: false,
      generalReportsApproved: false,
      showEditRequirements: false,
      showModalForAuthorization: false,
      resourceToDelete: { path: '', desc: '', url: '' },
      loading: false,
      showAddRequirements: false,
      requirementFrom: '',
      showAddReportsText: false,
      reportsTextExpanded: false,
      taskTypeSelected: null,
      local_taskSelected: null, // needed for erase the requirement in beforeDestroy hook
      local_selectOrder: null, // needed for erase the requirement in beforeDestroy hook
    }
  },
  computed: {
    showOrderGeneralInfo() {
      return this.$store.state.oos.order.showOrderGeneralInfo
    },

    selectOrder() {
      return this.$store.state.oos.routes.selectOrder
    },
    taskSelected() {
      return this.$store.state.oos.order.taskSelected
    },
    task() {
      return this.$store.getters['oos/order/getTaskSelect']
    },
    order() {
      return this.$store.state.oos.order.order
    },

    wo() {
      if (!this.order) return ''
      return this.order.woNumber
    },
    orderId() {
      return this.selectOrder
    },
    reports() {
      if (!this.$store.state.oos.order.taskReports) return []

      return this.$store.state.oos.order.taskReports
        .filter((report) => report)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    reportsByArea() {
      if (!this.task.areasInReports) {
        return []
      }
      const reportsByArea = {}
      for (let i = 0; i < this.task.areasInReports.length; i++) {
        const area = this.task.areasInReports[i]
        reportsByArea[area] = this.reports.filter(
          (report) => report.area === area && !report.fromRequirement
        )
      }
      return reportsByArea
    },
    reportsSinOrden() {
      return this.task?.reports || []
    },
    beforeReports() {
      return this.reports
        .filter((report) => report.before)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    duringReports() {
      return this.reports
        .filter((report) => report.during)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    afterReports() {
      return this.reports
        .filter((report) => report.after)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },

    textReports() {
      return this.task.taskChats
    },
    reportsNoProcess() {
      return this.reports
        .filter(
          (report) => report.mediaType !== 'text' && !report.fromRequirement
        )
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    reportsFromRequirements() {
      const _reportsFromRequirementsList = this.reports.filter(
        (report) => report.fromRequirement
      )

      const _reportsFromRequirements = {}

      if (!this.task?.requirements) return _reportsFromRequirements

      for (let i = 0; i < this.task.requirements.length; i++) {
        const requirement = this.task.requirements[i]

        _reportsFromRequirements[requirement.id] =
          _reportsFromRequirementsList.filter(
            (report) => report.requirementId === requirement.id
          )
      }

      return _reportsFromRequirements
    },

    requirementsFormated() {
      if (!this.task?.requirements) return []
      return JSON.parse(JSON.stringify(this.task.requirements))
    },

    requirementsFromBefore() {
      return this.requirementsFormated
        .filter((r) => r.fromBefore)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromDuring() {
      return this.requirementsFormated
        .filter((r) => r.fromDuring)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromAfter() {
      return this.requirementsFormated
        .filter((r) => r.fromAfter)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromGeneral() {
      return this.requirementsFormated
        .filter((r) => r.fromGeneral)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromInspection() {
      return this.requirementsFormated
        .filter((r) => r.fromInspection)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },

    taskFormatted() {
      return JSON.parse(JSON.stringify(this.task))
    },
    notificationsForThisTask() {
      let _notificationsForThisTask = []

      const order = this.$store.state.oos.orders.orders.find(
        (o) => o.id === this.orderId
      )

      if (order) {
        _notificationsForThisTask = order.notifications.filter(
          (noti) => noti.taskId === this.taskSelected.taskId
        )
      }

      return _notificationsForThisTask
    },
  },

  watch: {
    $route(to, from) {
      if (to.query?.taskSelected) {
        this.local_taskSelected = to.query.taskSelected
      }
      if (to.query?.selectOrder) {
        this.local_selectOrder = to.query.selectOrder
      }
      if (to.query?.taskTypeSelected) {
        this.taskTypeSelected = to.query.taskTypeSelected
      }
      if (to.fullPath !== from.fullPath) {
        this.$nextTick(() => {
          this.handleGetRequirements()
        })
      }
    },
  },

  mounted() {
    if (this.$route.query.taskSelected) {
      this.local_taskSelected = this.$route.query.taskSelected
    }
    if (this.$route.query.selectOrder) {
      this.local_selectOrder = this.$route.query.selectOrder
    }
    if (this.$route.query.taskTypeSelected) {
      this.taskTypeSelected = this.$route.query.taskTypeSelected
    }
    this.$nextTick(() => {
      this.handleGetRequirements()
    })
  },

  created() {
    this.JOB_TYPES = JOB_TYPES
    this.TASK_STATUS = TASK_STATUS
    this.PROCESS_TIME_TYPES = PROCESS_TIME_TYPES
  },

  beforeDestroy() {
    this.$store.commit('oos/orders/set_showTaskChats', false)
    if (
      !this.$store.state.oos.orders.requirementsUnsuscribeMap[
        `${this.local_selectOrder}-${this.local_taskSelected}-${this.taskTypeSelected}`
      ]
    ) {
      this.$store.commit('oos/orders/flush_task_requirements', {
        taskId: this.local_taskSelected,
        orderId: this.local_selectOrder,
        taskType: this.taskTypeSelected,
      })
    }
  },
  methods: {
    // handleRemoveNotifications() {
    //   if (
    //     this.notificationsForThisTask &&
    //     this.notificationsForThisTask.length
    //   ) {
    //     this.notificationsForThisTask.forEach((noti) => {
    //       this.$store.commit('oos/orders/remove_notification', {
    //         orderId: this.orderId,
    //         notiId: noti.id,
    //       })
    //     })
    //   }
    // },

    handleGetRequirements() {
      // eslint-disable-next-line
      console.log(
        'handleGetRequirements',
        this.taskSelected,
        this.selectOrder,
        this.taskTypeSelected
      )

      if (!this.taskSelected || !this.selectOrder || !this.taskTypeSelected)
        return
      // Chek if unsubscribe for this taskId
      const requirementsUnsuscribeMap =
        this.$store.state.oos.orders.requirementsUnsuscribeMap
      if (
        requirementsUnsuscribeMap[
          `${this.selectOrder}-${this.taskSelected}-${this.taskTypeSelected}`
        ]
      ) {
        return
      }

      this.$store.dispatch('oos/order/get_requirements_by_task', {
        taskId: this.taskSelected,
        taskType: this.taskTypeSelected,
        orderId: this.selectOrder,
      })
    },
    zoomHover(event, id, url) {
      const elementImg = event.target
      const box = elementImg.getBoundingClientRect()

      const position = JSON.parse(JSON.stringify(box))

      this.$store.commit('set_lupaOptions', { url, position })
      this.$store.commit('set_showLupa', true)
    },

    zoomLeave(event, id) {
      this.$store.commit('set_showLupa', false)
    },

    get_reportsSelectedToShow(type, index) {
      if (type === PROCESS_TIME_TYPES.before) {
        this.reportsSelectedToShow = this.beforeReports
      } else if (type === PROCESS_TIME_TYPES.after) {
        this.reportsSelectedToShow = this.afterReports
      } else if (type === PROCESS_TIME_TYPES.during) {
        this.reportsSelectedToShow = this.duringReports
      } else if (type === 'Reports') {
        this.reportsSelectedToShow = this.reportsNoProcess
      }
      this.indexOfImage = index
      this.showImagesSlides = true
      this.typeReports = this.task.title + ' ' + type
    },
    get_reportsSelectedToShowRequirements(requirements, index) {
      this.reportsSelectedToShow = requirements
      this.indexOfImage = index
      this.showImagesSlides = true
      this.typeReports = this.task.title + ' ' + 'Requirements'
    },
    async disapproveTask({ type, area }) {
      try {
        await this.$store.dispatch('oos/orders/update_reportsApproved', {
          task: this.task,
          orderId: this.orderId,
          reportsApproved: false,
          typeReports: type,
          ...(area && { area }),
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleExpandReportsText() {
      this.reportsTextExpanded = !this.reportsTextExpanded
    },
  },
}
</script>
<style lang="scss" scoped>
.task-content {
  white-space: normal;
  position: relative;
  // min-height: 250px;
  height: 100%;
}
.task-header {
  min-height: 110px;
}
.sub-title {
  font-size: 0.72rem;
  font-weight: bold;
  white-space: normal;
}
.sub-title-reports {
  font-size: 1rem;
  font-weight: bold;
}
.no-reports-text {
  font-size: 0.75rem;
  color: var(--v-grey-base);
}
.reports-container {
  display: grid;
  // grid-template-rows: repeat(3, 1fr);
  grid-auto-flow: row;
}

.reports-group {
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms cubic-bezier(0, 1, 0, 1);
  &.expanded {
    overflow: auto;
    max-height: 5000px;
    transition: max-height 500ms ease-in-out;
  }
}

.order-info {
  position: relative;
  width: 33%;
  max-width: 400px;
  overflow: hidden;
}
.general-info-wrapper {
  position: absolute;
  inset: 0;

  text-overflow: ellipsis;
  overflow-y: auto;
  word-wrap: break-word;
  word-break: break-all;
}
.task-index {
  position: relative;
}
.task-content_inner {
  position: absolute;
  inset: 0;
}
</style>
