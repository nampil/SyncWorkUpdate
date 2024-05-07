<template>
  <div
    :class="[
      'reports-section |  pt-0 mb-8',
      { 'for-requirement': forRequirements },
    ]"
  >
    <div v-if="showApproveBox" class="reports-indicator">
      <div
        v-if="!reportsApproved && contractorCompleted"
        class="reports-indicator-contractor | yellow lighten-2 grey--text text--darken-4 mb-4"
      >
        <span>{{ $t('contractorCompleted') }} - {{ title }}</span>
      </div>
    </div>

    <div class="reports-section_header | d-flex gap-8">
      <div class="mr-auto d-flex align-center gap-8">
        <v-icon
          v-if="processTime === 'General'"
          :size="requirement.oosChecked ? 17 : 13"
          :class="requirement.oosChecked ? ' mr-1' : 'icon-bringhtness'"
          :color="requirement.oosChecked ? 'success' : 'grey'"
          >{{
            requirement.oosChecked ? 'mdi-check-bold' : 'mdi-brightness-1'
          }}</v-icon
        >
        <span
          :class="[
            processTime !== PROCESS_TIME_TYPES.inspection
              ? 'sub-title'
              : 'title-section',
          ]"
          >{{ title }}</span
        >
        <div v-if="forRequirements && showActionsRequirementBtn" class="d-flex">
          <v-menu offset-y bottom left>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on: menu, attrs }">
              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn
                    small
                    icon
                    v-bind="attrs"
                    v-on="{ ...tooltip, ...menu }"
                  >
                    <v-icon small color="primary">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('actions') }}</span>
              </v-tooltip>
            </template>

            <v-list dense>
              <v-list-item @click="editRequirement(requirement)">
                <v-list-item-icon>
                  <v-icon small color="primary"
                    >mdi-text-box-edit-outline</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title>{{
                  $t('editRequirement')
                }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="!reports.length"
                @click="deleteRequirement(requirement)"
              >
                <v-list-item-icon>
                  <v-icon color="error" small>mdi-delete</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{
                  $t('deleteRequirement')
                }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="fromOos && !requirement.contractorCompleted"
                @click="handleAskToCompleteRequirement(requirement)"
              >
                <v-list-item-icon>
                  <v-icon color="error" small
                    >mdi-checkbox-marked-outline</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title
                  >Ask to complete requirement</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <div class="actions" style="flex: 1 0 auto">
        <performance-section
          :title="title"
          :started="started"
          :finished="finished"
          :started-at="startedAt"
          :started-by="startedBy"
          :finished-by="finishedBy"
          :finished-at="finishedAt"
          :order-id="orderId"
          :task-id="task.id"
          :req-id="requirement.id || ''"
          :process-time="processTime"
          :task-type="task.type"
          :from-oos="fromOos"
        ></performance-section>

        <div class="actions-task | d-flex alig-center justify-end">
          <v-tooltip v-if="!fromOos" open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                <div class="mr-3 mt-1">
                  <v-icon small>mdi-image-multiple-outline</v-icon>
                  <span> {{ reportsCount }}</span>
                </div>
              </div>
            </template>
            <span>{{ $t('quantityPictures') }}</span>
          </v-tooltip>

          <v-tooltip
            v-if="!forRequirements && showAddRequirementBtn"
            open-delay="600"
            content-class="small"
            top
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                class="mr-2"
                small
                v-bind="attrs"
                v-on="on"
                @click="handleShowAddRequirement(processTime)"
                ><v-icon small>mdi-plus-box-outline</v-icon>
              </v-btn>
            </template>
            <span>{{ addRequirementsText }}</span>
          </v-tooltip>

          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                class="mr-2"
                small
                :disabled="
                  (fromOos && !reports.length) ||
                  (!fromOos && !localReports.length)
                "
                v-bind="attrs"
                v-on="on"
                @click="handleShowReportsDownload()"
                ><v-icon small>mdi-tray-arrow-down</v-icon>
              </v-btn>
            </template>
            <span>{{ downloadText }}</span>
          </v-tooltip>

          <v-tooltip
            v-if="
              showApproveBox && processTime !== PROCESS_TIME_TYPES.inspection
            "
            open-delay="600"
            content-class="small"
            :disabled="!reports.length"
            top
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                class="mr-2"
                :color="reportsApproved ? 'primary' : ''"
                v-bind="attrs"
                v-on="on"
                @click="handleApproveReports"
              >
                <v-icon v-if="reportsApproved" small
                  >mdi-checkbox-marked</v-icon
                >
                <v-icon v-else small> mdi-checkbox-blank-outline </v-icon>
              </v-btn>
            </template>
            <span>{{
              !reportsApproved ? `${approveText}` : $t('disapprove')
            }}</span>
          </v-tooltip>
          <!-- :disabled="!contractorCompleted" -->
          <v-tooltip
            v-else-if="showApproveBox"
            open-delay="600"
            content-class="small"
            :disabled="!reports.length"
            top
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                class="mr-2"
                :color="reportsApprovedInspections ? 'primary' : ''"
                v-bind="attrs"
                v-on="on"
                @click="handleApproveReports"
              >
                <v-icon v-if="reportsApprovedInspections" small
                  >mdi-checkbox-marked</v-icon
                >
                <v-icon v-else small> mdi-checkbox-blank-outline </v-icon>
              </v-btn>
            </template>
            <span>{{
              !reportsApprovedInspections ? `${approveText}` : $t('disapprove')
            }}</span>
          </v-tooltip>

          <v-menu
            class="menu-actions"
            left
            :disabled="!reportsSelected.length"
            min-width="170px"
            max-width="190px"
            rounded
            offset-y
            small
            absolute
            transition="slide-y-transition"
          >
            <!-- eslint-disable-next-line  -->
            <template v-slot:activator="{ on: menu, attrs }">
              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn
                    class="mr-2"
                    small
                    icon
                    :disabled="!reportsSelected.length"
                    v-bind="attrs"
                    v-on="{ ...tooltip, ...menu }"
                  >
                    <v-icon small> mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('actions') }}</span>
              </v-tooltip>
            </template>

            <v-list>
              <v-list-item
                v-for="option in optionsMenu"
                :key="option.title"
                dense
                @click="handleActionsReports(option.value)"
              >
                <v-list-item-title> {{ option.title }} </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <div v-if="showTotalReportsIcon" class="d-flex align-center">
            <v-icon
              class=""
              small
              :color="
                reports.filter((report) => !report.url).length ? 'orange' : ''
              "
              >mdi-image-sync-outline</v-icon
            >
            <span class="total-reports ml-1">
              {{ nReportsExpected }}
            </span>
          </div>
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon class="ml-2" small @click="handleExpandPictures">
                <v-icon
                  size="22"
                  :color="picturesExpanded ? 'primary' : 'success'"
                  v-bind="attrs"
                  v-on="on"
                  >{{
                    picturesExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'
                  }}</v-icon
                >
              </v-btn>
            </template>
            <span>{{
              picturesExpanded ? $t('hidePictures') : $t('showPictures')
            }}</span>
          </v-tooltip>
        </div>
      </div>
    </div>
    <v-lazy>
      <div
        v-if="fromOos"
        :class="['reports-group', { expanded: picturesExpanded }]"
      >
        <add-reports
          v-if="showAddReportsBtn"
          :order-id="orderId"
          :task="task"
          :area="area"
          :process-time="processTime"
          :for-requirements="forRequirements"
          :requirement="requirement"
        />

        <div
          v-for="(report, index) in reports"
          :key="report.id"
          class="reports-item"
        >
          <ReportImageContainer
            v-if="report.url"
            :report="report"
            :index="index"
            :from-oos="fromOos"
            :selected="reportsSelected.some((r) => r.id === report.id)"
            @delete-report="handleDeleteReport(report)"
            @select="handleSelectReport(report, $event, index)"
            @show-slide="handleShowSlideShow($event)"
          />

          <div v-else class="loading-preview my-4">
            <span class="numeration-img ml-1">{{ index + 1 }}</span>
            <v-icon color="orange">mdi-image-sync-outline</v-icon>
          </div>
        </div>
      </div>
      <div v-else>
        <div :class="['reports-group', { expanded: picturesExpanded }]">
          <add-reports
            v-if="showAddReportsBtn"
            :order-id="orderId"
            :task="task"
            :area="area"
            :process-time="processTime"
            :for-requirements="forRequirements"
            :requirement="requirement"
            :from-order-info="true"
            @new-reports="handleNewReports($event)"
          />
          <div
            v-if="loadingReports && !localReports.length"
            class="container-loader pa-4 my-4 d-flex align-center rounded justify-center"
          >
            <v-progress-circular size="20" indeterminate></v-progress-circular>
          </div>
          <div
            v-for="(report, index) in localReports"
            :key="report.id"
            class="reports-item"
          >
            <ReportImageContainer
              v-if="report.url"
              :report="report"
              :from-oos="fromOos"
              :index="index"
              :selected="reportsSelected.some((r) => r.id === report.id)"
              @update-report="handleUpdateLocalReport($event)"
              @delete-report="handleDeleteReport(report)"
              @select="handleSelectReport(report, $event, index)"
              @show-slide="handleShowSlideShow($event)"
            />

            <div v-else class="loading-preview my-4">
              <span class="numeration-img ml-1 d-flex align-center">
                {{ index + 1 }}</span
              >
              <v-icon color="orange">mdi-image-sync-outline</v-icon>
            </div>
          </div>
        </div>
      </div>
    </v-lazy>

    <ReapplyReportsForm
      :show="showModalForReportsReapply"
      :reports="reportsSelected"
      :requirement="requirement"
      @delete-reports="handleActionsReports('delete')"
      @cancel="handleCancelReapplyReportsForm"
    ></ReapplyReportsForm>

    <ModalForAskAuthorization
      v-if="showModalForAuthorization"
      :show-modal="showModalForAuthorization"
      :resources="resourcesToDelete"
      @close="handleCloseModalForAuthorization"
    />
    <ModalForReportsActions
      v-if="showModalForReportsActions"
      :show-modal="showModalForReportsActions"
      :reports-selected="reportsSelected"
      :is-copy="isCopy"
      :is-move="isMove"
      @close="handleCloseModalForReportsActions"
    />
    <SlideShow
      :list="reportsInUse"
      :show="showImagesSlides"
      :title="task.title + ' ' + title"
      type="images"
      :from-oos="fromOos"
      :index-selected="indexOfImage"
      @update-report="handleUpdateLocalReport"
      @close="showImagesSlides = false"
    />
    <v-dialog
      v-model="showAddRequirements"
      :overlay="false"
      max-width="900px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <AddRequirements
        v-if="showAddRequirements"
        :order-id="orderId"
        :task-id="task.id"
        :type="task.type"
        :requirement-from="requirementFrom"
        :duplicate-requirement="duplicateRequirement"
        :inspection-area="area"
        :last-positions-req="lastPositionsReq"
        @update-persistent="validatePersistent = $event"
        @close="showAddRequirements = false"
      >
      </AddRequirements>
    </v-dialog>
    <v-dialog
      v-model="showEditRequirements"
      :overlay="false"
      max-width="900px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <edit-requirement
        v-if="showEditRequirements"
        :edited-requirement="editedRequirement"
        :order-id="orderId"
        :task-id="task.id"
        :type="task.type"
        @update-persistent="validatePersistent = $event"
        @close="showEditRequirements = false"
      ></edit-requirement>
    </v-dialog>
    <v-dialog
      v-model="showDeleteRequirements"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <delete-requirement
        v-if="showDeleteRequirements"
        :deleted-requirement="deletedRequirement"
        :order-id="orderId"
        :task-id="task.id"
        :type="task.type"
        @close="showDeleteRequirements = false"
      ></delete-requirement>
    </v-dialog>
    <v-dialog
      v-model="showReportsDownload"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <reports-download
        v-if="showReportsDownload"
        :local-reports="localReports"
        :reports="reports"
        :type="`${task.title} ${processTime}`"
        :type-report="processTime"
        :title="task.title"
        :type-task="task.type"
        :from-oos="fromOos"
        :area="area"
        :requirements="requirements"
        @close="showReportsDownload = false"
      ></reports-download>
    </v-dialog>

    <ask-to-complete-requirement-modal
      :order-id="orderId"
      :task-id="task.id"
      :task-type="task.type"
      :show="showAskToCompleteRequirementModal"
      :requirement="requirement"
      @close="handleCloseAskToCompleteRequirementModal"
    />

    <v-dialog
      v-model="showModalForEditPlacardActions"
      :overlay="false"
      max-width="500px"
      scrollable
      transition="dialog-transition"
    >
      <edit-placard
        v-if="showModalForEditPlacardActions"
        :reports="reportsSelected"
        @update-reports="updateReports($event)"
        @close="showModalForEditPlacardActions = false"
      ></edit-placard>
    </v-dialog>
  </div>
</template>

<script>
import SlideShow from '../../misc/SlideShow.vue'
import AddRequirements from './requirements/AddRequirements.vue'
import AskToCompleteRequirementModal from './modals/AskToCompleteRequirementModal.vue'
import ModalForAskAuthorization from './modals/ModalForAskAuthorization.vue'
import ModalForReportsActions from './modals/ModalForReportsActions.vue'
import ReportImageContainer from './reports/ReportImageContainer.vue'
import editRequirement from './requirements/EditRequirement.vue'
import DeleteRequirement from './requirements/DeleteRequirement.vue'
import ReportsDownload from './download/ReportsDownload.vue'
import ReapplyReportsForm from './reports/ReapplyReportsForm.vue'
import AddReports from './reports/AddReports.vue'
import PerformanceSection from './PerformanceSection.vue'
import EditPlacard from './placard/EditPlacard.vue'
import {
  PROCESS_TIME_TYPES,
  JOB_TYPES,
  TASK_STATUS,
} from '@/utils/dictionaries'

export default {
  name: 'ReportsSection',
  components: {
    ReportImageContainer,
    ModalForAskAuthorization,
    ModalForReportsActions,
    AskToCompleteRequirementModal,
    SlideShow,
    AddRequirements,
    editRequirement,
    DeleteRequirement,
    AddReports,
    PerformanceSection,
    ReportsDownload,
    ReapplyReportsForm,
    EditPlacard,
  },
  props: {
    fromOos: { type: Boolean, default: false },
    reports: { type: Array, default: () => [] },
    requirements: { type: Array, default: () => [] },
    reportsFromRequirements: { type: Object, default: () => ({}) },
    orderId: { type: String, default: '' },
    title: { type: String, default: '' },
    processTime: { type: String, default: '' },
    approveText: { type: String, default: '' },
    contractorCompleted: { type: Boolean, default: false },
    forRequirements: { type: Boolean, default: false },
    requirement: { type: Object, default: () => ({}) },
    expanded: { type: Boolean, default: false },
    workOrderNumber: { type: String, default: '' },
    downloadText: { type: String, default: '' },
    addRequirementsText: { type: String, default: '' },
    area: { type: String, default: '' },
    task: { type: Object, required: true },
    showAddRequirementBtn: { type: Boolean, default: false },
    showApproveBox: { type: Boolean, default: false },
    showTotalReportsIcon: { type: Boolean, default: false },
    showActionsRequirementBtn: { type: Boolean, default: false },
    showAddReportsBtn: { type: Boolean, default: false },
    started: { type: Boolean, default: false },
    finished: { type: Boolean, default: false },
    startedAt: { type: Object, default: () => ({}) },
    startedBy: { type: Object, default: () => ({}) },
    finishedBy: { type: Object, default: () => ({}) },
    finishedAt: { type: Object, default: () => ({}) },
    reportsCountTask: { type: Number, default: 0 },
    expandAll: { type: Boolean, default: false },
  },
  data() {
    return {
      isCopy: false,
      isMove: false,
      resourcesToDelete: [],
      showModalForAuthorization: false,
      showModalForReportsActions: false,
      showModalForEditPlacardActions: false,
      indexOfImage: 0,
      showImagesSlides: false,
      showAddRequirements: false,
      requirementFrom: '',
      picturesExpanded: false,
      editedRequirement: {},
      deletedRequirement: {},
      showEditRequirements: false,
      showDeleteRequirements: false,
      reportsSelected: [],
      showModalForReportsReapply: false,
      localReports: [],
      loadingReports: false,
      reportsCount: 0,
      allreportsCount: 0,
      reportsApprovedInspections: false,
      showReportsDownload: false,
      validatePersistent: false,
      optionsMenu: [
        { value: 'copy', title: 'Copy' },
        { value: 'move', title: 'Move' },
        { value: 'delete', title: 'Delete' },
        { value: 'reapply', title: 'Ask for Reapply' },
        { value: 'editPlacard', title: 'Edit Placard' },
      ],
      reportsByDownload: [],
      loadingReportsByDownload: false,
      PROCESS_TIME_TYPES: null,
      duplicateRequirement: null,
      showAskToCompleteRequirementModal: false,
      indexSelectedFrom: null,
      indexDesSelectedFrom: null,
    }
  },
  computed: {
    nReportsExpected() {
      if (
        this.processTime === PROCESS_TIME_TYPES.inspection &&
        this.task.nReportsExpectedByArea &&
        this.task.nReportsExpectedByArea[this.area]
      ) {
        return `${
          this.reports.length -
          this.reports.filter((report) => !report.url).length
        } / ${this.task.nReportsExpectedByArea[this.area]}`
      }

      if (this.requirement.nReportsExpected && this.forRequirements) {
        return `${
          this.reports.length -
          this.reports.filter((report) => !report.url).length
        } / ${Math.max(this.requirement.nReportsExpected, this.reports.length)}`
      }

      return `${
        this.reports.length -
        this.reports.filter((report) => !report.url).length
      } / ${this.reports.length}`
    },
    lastPositionsReq() {
      return this.requirements.length
    },
    reportsInUse() {
      return this.fromOos ? this.reports : this.localReports
    },
    reportsApproved() {
      if (this.forRequirements) {
        return this.requirement.oosChecked
      }
      let reportsApproved = false

      switch (this.processTime) {
        case PROCESS_TIME_TYPES.before:
          reportsApproved = this.task.beforeReportsApproved
          break
        case PROCESS_TIME_TYPES.during:
          reportsApproved = this.task.duringReportsApproved
          break
        case PROCESS_TIME_TYPES.after:
          reportsApproved = this.task.afterReportsApproved
          break
        case PROCESS_TIME_TYPES.generalReports:
          reportsApproved = this.task.generalReportsApproved
          break
        case PROCESS_TIME_TYPES.inspection:
          reportsApproved =
            this.task?.reportsApprovedByArea &&
            this.task.reportsApprovedByArea[this.area]
          break
      }
      return reportsApproved
    },
    requirementsReportsValidate() {
      if (this.reports && this.reports.length) {
        return false
      }

      for (let i = 0; i < this.task.requirements.length; i++) {
        const _id = this.task.requirements[i].id
        if (
          this.reportsFromRequirements[_id] &&
          this.reportsFromRequirements[_id].length
        ) {
          return false
        }
      }
      return true
    },
    isWorkCompleted() {
      let result = false
      const isInpections = this.task.type === JOB_TYPES.inspections

      if (
        isInpections &&
        Object.values(this.task.reportsApprovedByArea).length
      ) {
        let _taskCompletedAreas = []
        _taskCompletedAreas = Object.values(this.task.reportsApprovedByArea)

        for (let i = 0; i < this.task.areasInReports.length; i++) {
          const _area = this.task.areasInReports[i]
          if (this.task.reportsApprovedByArea[_area]) {
            _taskCompletedAreas.push(this.task.reportsApprovedByArea[_area])
          } else {
            _taskCompletedAreas.push(false)
          }
        }

        if (this.task.requirements?.length) {
          const requirementsNoCompleted = this.task.requirements.some(
            (r) => !r.oosChecked
          )
          _taskCompletedAreas.push(!requirementsNoCompleted)
        }

        result = !_taskCompletedAreas.some((t) => !t)
      }

      if (!isInpections && this.task.needProcessTimes) {
        const requirementsNoCompleted = this.task.requirements.some(
          (r) => !r.oosChecked
        )

        if (
          this.task.beforeReportsApproved ||
          this.task.duringReportsApproved ||
          this.task.afterReportsApproved
        ) {
          const _taskCompletedNeedProcessTime = [
            this.task.beforeReportsApproved,
            this.task.duringReportsApproved,
            this.task.afterReportsApproved,
            !requirementsNoCompleted,
          ]
          result = !_taskCompletedNeedProcessTime.some((t) => !t)
        } else {
          result = !requirementsNoCompleted
        }
      }

      if (!isInpections && !this.task.needProcessTimes) {
        const requirementsNoCompleted = this.task.requirements.some(
          (r) => !r.oosChecked
        )

        if (this.task.generalReportsApproved) {
          const _taskCompletedNoNeedProcessTime = [
            this.task.generalReportsApproved,
            !requirementsNoCompleted,
          ]
          result = !_taskCompletedNoNeedProcessTime.some((t) => !t)
        } else {
          result = !requirementsNoCompleted
        }
      }
      return result
    },
  },
  watch: {
    expandAll(val) {
      this.handleExpandPictures({ expand: val })
    },
    task: {
      handler() {
        if (this.processTime === PROCESS_TIME_TYPES.inspection) {
          this.reportsApprovedInspections =
            this.task.reportsApprovedByArea &&
            this.task.reportsApprovedByArea[this.area]
        }
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.PROCESS_TIME_TYPES = PROCESS_TIME_TYPES
  },
  mounted() {
    if (!this.fromOos) {
      this.getReportsCount()
    }
  },
  methods: {
    handleUpdateLocalReport(report) {
      const idx = this.localReports.findIndex((r) => r.id === report.id)
      if (idx === -1) return
      this.localReports.splice(idx, 1, report)
    },
    updateReports(reports) {
      reports.forEach((report) => {
        this.handleUpdateLocalReport(report)
      })
    },
    handleCloseAskToCompleteRequirementModal() {
      this.showAskToCompleteRequirementModal = false
    },
    handleAskToCompleteRequirement(requirement) {
      this.showAskToCompleteRequirementModal = true
    },
    handleCancelReapplyReportsForm() {
      this.cleanReportsSelected()
      this.showModalForReportsReapply = false
    },
    async getReportsCount() {
      try {
        this.loadingReportCount = true
        const answer = await this.$store.dispatch(
          'order/get_reportsForSection',
          {
            orderId: this.orderId,
            processTime: this.processTime,
            forRequirements: this.forRequirements,
            ...(this.forRequirements &&
              this.requirement && { requirement: this.requirement }),
            requirements: this.requirements,
            area: this.area,
            task: this.task,
            isCount: true,
          }
        )

        if (Object.hasOwn(answer, 'countReports')) {
          this.reportsCount = answer.countReports
        } else {
          this.allreportsCount = answer.allReports
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting reports count', error)
        this.$mainAlertError('Error trying to get reports count')
      } finally {
        this.loadingReportCount = false
      }
    },
    async getReports() {
      try {
        this.loadingReports = true

        const _localReports = await this.$store.dispatch(
          'order/get_reportsForSection',
          {
            orderId: this.orderId,
            processTime: this.processTime,
            forRequirements: this.forRequirements,
            ...(this.forRequirements && { requirement: this.requirement }),
            area: this.area,
            task: this.task,
            isCount: false,
          }
        )

        this.localReports = _localReports
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting reports', error)
        this.$mainAlertError('Error getting Reports')
      } finally {
        this.loadingReports = false
      }
    },
    handleNewReports(newReports) {
      this.localReports = this.localReports.concat(newReports)
      this.reportsCount = this.localReports.length
    },
    cleanReportsSelected() {
      this.reportsSelected = []
    },
    handleCloseModalForReportsActions() {
      this.cleanReportsSelected()
      this.isCopy = false
      this.isMove = false
      this.showModalForReportsActions = false
      this.reportsCount = this.localReports.length
    },
    handleCloseModalForAuthorization() {
      this.cleanReportsSelected()
      this.resourcesToDelete = []
      this.showModalForAuthorization = false
    },
    handleSelectReport(report, event, index) {
      let reportsSelect = []
      if (event.select) {
        if (this.indexSelectedFrom == null) {
          this.indexSelectedFrom = this.reportsInUse.findIndex(
            (r) => r.id === report.id
          )
        }

        if (!event.shift) {
          const newEvent = { select: event.select, shift: false }
          this.organizationReportSelected({ report, event: newEvent })
          return
        }

        if (this.indexSelectedFrom > index) {
          reportsSelect = this.reportsInUse.slice(
            index,
            this.indexSelectedFrom + 1
          )
        } else {
          reportsSelect = this.reportsInUse.slice(
            this.indexSelectedFrom,
            index + 1
          )
        }
        reportsSelect = reportsSelect.filter((report) => {
          return !this.reportsSelected.map((a) => a.id).includes(report.id)
        })
      } else {
        if (this.indexDesSelectedFrom == null) {
          this.indexDesSelectedFrom = this.reportsInUse.findIndex(
            (r) => r.id === report.id
          )
        }
        if (!event.shift) {
          const newEvent = { select: event.select, shift: false }
          this.organizationReportSelected({ report, event: newEvent })
          return
        }

        let _reports = []
        if (this.indexDesSelectedFrom > index) {
          _reports = this.reportsInUse.slice(
            index,
            this.indexDesSelectedFrom + 1
          )
        } else {
          _reports = this.reportsInUse.slice(
            this.indexDesSelectedFrom,
            index + 1
          )
        }
        reportsSelect = this.reportsSelected.filter((report) => {
          return !_reports.map((e) => e.id).includes(report.id)
        })
      }
      this.indexSelectedFrom = null
      this.indexDesSelectedFrom = null
      this.organizationReportSelected({ reportsSelect, event })
    },

    organizationReportSelected(event) {
      if (event.event.shift) {
        if (event.event.select) {
          event.reportsSelect.forEach((element) => {
            this.reportsSelected.push(element)
          })
        } else {
          const _reportsSelect = []
          event.reportsSelect.forEach((element) => {
            _reportsSelect.push(element)
          })
          this.reportsSelected = _reportsSelect
        }
      } else {
        if (event.event.select) {
          this.reportsSelected.push(event.report)
          return
        }
        const indexOfReport = this.reportsSelected.findIndex(
          (r) => r.id === event.report.id
        )
        if (indexOfReport < 0) return
        this.reportsSelected.splice(indexOfReport, 1)
      }
    },
    handleExpandPictures({ expand }) {
      if (expand !== undefined) {
        this.picturesExpanded = expand
      } else {
        this.picturesExpanded = !this.picturesExpanded
      }

      this.$nextTick(() => {
        if (!this.fromOos && this.reportsCount > 0 && this.picturesExpanded) {
          this.getReports()
        }
      })
    },
    handleActionsReports(action) {
      if (action === 'copy' || action === 'move') {
        this.isCopy = action === 'copy'
        this.isMove = action === 'move'
        this.showModalForReportsActions = true
      } else if (action === 'delete') {
        this.reportsSelected.forEach((report) => {
          this.addResourcesToDelete(report)
        })
        this.showModalForAuthorization = true
      } else if (action === 'reapply') {
        this.showModalForReportsReapply = true

        // add class to show an X in the report
        // add new requirement whit copy of reports to reapply
        // add description to requirement
        // send to DB
      } else if (action === 'editPlacard') {
        this.showModalForEditPlacardActions = true
      }
    },
    handleShowAddRequirement(type) {
      const _type =
        type === PROCESS_TIME_TYPES.generalReports ? 'General' : type

      this.requirementFrom = _type
      this.showAddRequirements = true
    },
    handleApproveReports() {
      let newVal
      if (this.forRequirements) {
        newVal = !this.requirement.oosChecked
        if (!newVal) {
          this.$emit('disapprove-requirement')
        }

        this.update_reportsApproved(
          this.task,
          newVal,
          this.processTime,
          this.requirement
        )
        return
      }
      if (this.processTime !== PROCESS_TIME_TYPES.inspection) {
        newVal = !this.reportsApproved
      } else {
        newVal = !this.reportsApprovedInspections
      }

      this.update_reportsApproved(
        this.task,
        newVal,
        this.processTime,
        null,
        this.area
      )
    },
    async update_reportsApproved(
      task,
      reportsApproved,
      typeReports,
      requirement,
      area
    ) {
      try {
        if (this.forRequirements) {
          await this.$store.dispatch(
            'oos/orders/update_reportsApprovedForRequirement',
            {
              task,
              requirement,
              orderId: this.orderId,
              reportsApproved,
            }
          )
        } else {
          await this.$store.dispatch('oos/orders/update_reportsApproved', {
            task,
            orderId: this.orderId,
            reportsApproved,
            typeReports,
            area,
          })
        }

        if (
          !this.isWorkCompleted &&
          this.task.status === TASK_STATUS.taskCompleted
        ) {
          this.handleTaskStatus('performing-work')
          return
        }
        if (
          this.isWorkCompleted &&
          this.task.status !== TASK_STATUS.taskCompleted
        ) {
          this.handleTaskStatus('task-completed')
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleShowSlideShow(index) {
      this.indexOfImage = index
      this.showImagesSlides = true
    },
    addResourcesToDelete(report) {
      const desc = `Photo in wo#: ${this.workOrderNumber} - ${
        report.task.type
      } - ${this.task.title}${
        report.fromRequirement ? ' from requirements' : ''
      }${
        report.before
          ? ' - before'
          : report.during
          ? ' - during'
          : report.after
          ? ' - after'
          : ' - reports'
      } pictures`

      this.resourcesToDelete.push({
        path: `orders/${report.orderId}/${report.task.type}/${report.task.id}/reports/${report.id}`,
        url: report.url,
        desc,
      })
    },
    handleDeleteReport(report) {
      try {
        this.loading = true
        this.addResourcesToDelete(report)

        this.showModalForAuthorization = true

        // TODO: Test this with a less than 7 authLevel user
        // const userRecord = await auth.currentUser.getIdTokenResult()
        // const { rol, authLevel } = userRecord

        // if (rol !== 'admin' || parseInt(authLevel) < 7) {
        //   // eslint-disable-next-line
        //   console.log('Need Authorization from Supervisor')
        //   this.showModalForAuthorization = true
        //   return
        // }

        // await this.$store.dispatch('oos/orders/remove_report_from_order', {
        //   report,
        // })
      } catch (error) {
        // eslint-disable-next-line
        console.log('Error deletting report', error)
        this.$mainAlertError('Hubo un error al borrar este reporte')
      } finally {
        this.loading = false
      }
    },
    editRequirement(requirement) {
      this.editedRequirement = requirement
      this.showEditRequirements = true
    },
    deleteRequirement(requirement) {
      if (this.reports.length > 0) {
        return
      }
      this.deletedRequirement = requirement
      this.showDeleteRequirements = true
    },
    handleShowReportsDownload() {
      this.showReportsDownload = !this.showReportsDownload
    },
    async handleTaskStatus(newStatus) {
      try {
        await this.$store.dispatch('oos/orders/handleTaskStatus', {
          taskId: this.task.id,
          orderId: this.orderId,
          type: this.task.type,
          newStatus,
        })
        this.$mainAlertSuccess('Success! Updated task status')
        if (
          newStatus === TASK_STATUS.taskCompleted &&
          (this.task.type === JOB_TYPES.allowables ||
            this.task.type === JOB_TYPES.workToDos)
        ) {
          this.hanldeAddItemsForInvoices()
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
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
.reports-section {
  display: grid;
  grid-template-rows: auto 1fr;
}
.reports-section_header {
  align-items: center;
}
.reports-group {
  scrollbar-width: thin; /* "auto" or "thin" */
  scrollbar-color: #01579b var(--v-accent-base);
}
.reports-group::-webkit-scrollbar {
  max-height: 9px;
}
.reports-group::-webkit-scrollbar-track {
  box-shadow: inset 0 0 2.5px 2px rgba(0, 0, 0, 0.431);
  border-radius: 5px;
}
.reports-group::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #01579b, var(--v-secondary-base));
  border-radius: 5px;
}
.reports-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, 130px);
  gap: 0.5rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms cubic-bezier(0, 1, 0, 1);
  &.expanded {
    max-height: 5000px;
    transition: max-height 500ms ease-in-out;
  }
  .loading-preview {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    position: relative;
    border: 1px solid rgb(138, 138, 138);
    border-radius: 8px;
    .numeration-img {
      position: absolute;
      top: 3px;
      left: 0;
      font-size: 10px;
      font-weight: bold;
      color: white;
      cursor: default;
      background-color: #696d6986;
      border-radius: 50%;
      max-height: 17px;
      padding: 0 5px 1px 5px;

      z-index: 1;
    }
  }
  .reports-item {
    aspect-ratio: 1;
  }
  .img-container {
    aspect-ratio: 1;
    position: relative;
  }
}
.total-reports {
  display: flex;
  align-items: center;
  font-size: 12px;
}
.sub-title {
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--v-info-darken1);
}
.no-reports-text {
  font-size: 0.75rem;
  color: var(--v-info-base);
}
.for-requirement {
  .sub-title {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--v-info-darken1);
  }
}
.reports-indicator {
  text-align: center;
  font-size: 0.9rem;
  font-weight: bold;
}
.reports-indicator-contractor {
  border-radius: 5px;
}
.icon-bringhtness {
  margin-left: 2.5px;
  margin-right: 5px;
}
.container-loader {
  border-radius: 5px;
  width: 130px;
  height: 130px;
  border: 1px solid var(--v-primary-base);
}
.title-section {
  font-size: 1rem;
  font-weight: bold;
}
</style>
