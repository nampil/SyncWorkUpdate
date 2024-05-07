<template>
  <v-dialog v-model="show" scrollable max-width="1000px">
    <v-card min-width="1000px">
      <v-toolbar color="secondary" class="flex-grow-0" dense>
        <v-toolbar-title class="white--text">{{
          $t(type.title)
        }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-btn icon class="white--text" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text v-if="jobTask" class="pa-8">
        <div class="pl-2 pr-2">
          <div class="d-flex">
            <h5 class="text-h5">{{ jobTask.title }}</h5>
          </div>

          <div v-if="jobTask.desc">
            <p v-for="(desc, index) in jobTask.desc.split('\n')" :key="index">
              {{ desc }}
            </p>
          </div>

          <h4
            v-if="jobTask.pictures && jobTask.pictures.length"
            class="sub-title mb-1"
          >
            {{ $t('filesAttached') }}
          </h4>

          <!-- If it's Inspections -->
          <div
            v-if="
              (type.type === JOB_TYPES.allowables ||
                type.type === JOB_TYPES.workToDos ||
                type.type === JOB_TYPES.instructions ||
                type.type === JOB_TYPES.allowablesPools) &&
              jobTask.pictures &&
              jobTask.pictures.length
            "
            class="mb-6"
          >
            <div class="pictures-list d-flex flex-wrap">
              <div
                v-for="(pic, i) in jobTask.pictures"
                :key="i"
                class="pic-wrapper"
              >
                <img
                  v-if="pic.type.includes('image')"
                  :src="pic.url"
                  alt=""
                  @mousemove="zoomHover($event, pic)"
                  @mouseleave="zoomLeave($event)"
                  @click="showImagesSlides = true"
                />
                <div
                  v-if="pic.type.includes('pdf')"
                  class="file-preview d-flex align-center justify-center"
                  @click="handleViewPdf(pic.url)"
                >
                  <v-icon large>mdi-file-pdf-box</v-icon>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="jobTask.materialsOrTools && jobTask.materialsOrTools.length"
            class="mt-4 mb-4"
          >
            <h5 class="sub-title mb-1">{{ $t('materialsOrTools') }}</h5>
            <div class="d-flex flex-wrap wraper">
              <div
                v-for="(item, i) in jobTask.materialsOrTools"
                :key="item.id"
                class="mr-1"
              >
                <span
                  >{{ item.title
                  }}{{
                    i !== jobTask.materialsOrTools.length - 1 ? ',' : '.'
                  }}</span
                >
              </div>
            </div>
          </div>

          <div
            v-if="jobTask.itemsForInvoices && jobTask.itemsForInvoices.length"
          >
            <h5 class="sub-title mb-1">{{ $t('itemsForInvoices') }}</h5>
            <v-row no-gutters>
              <v-spacer></v-spacer>
              <v-col cols="2" md="2">{{ $t('unit') }} </v-col>
              <v-col cols="1" md="1">{{ $t('qty') }} </v-col>
              <v-col cols="1" md="1">{{ $t('price') }}</v-col>
            </v-row>
            <div v-for="item in jobTask.itemsForInvoices" :key="item.id">
              <v-row no-gutters>
                <v-col cols="8" md="8">
                  <v-icon size="14" color="grey">mdi-brightness-1 </v-icon>
                  <span>{{ item.title }}</span>
                </v-col>
                <v-col cols="2" md="2"> {{ item.unit }} </v-col>
                <v-col cols="1" md="1"> {{ item.qty }} </v-col>
                <v-col cols="1" md="1"> {{ item.price }} </v-col>
              </v-row>
            </div>
          </div>
        </div>
        <div
          v-if="type.type !== JOB_TYPES.instructions"
          class="d-flex justify-end pr-2 pt-4"
        >
          <v-btn
            small
            :loading="loadingReportsByDownload"
            @click="handleDownloadAllReports()"
          >
            <span class="mr-1">{{ $t('downloadAllPhoto') }}</span>
            <v-icon x-small> mdi-tray-arrow-down</v-icon>
          </v-btn>
        </div>

        <div class="d-flex flex-column section-color pa-2 mt-4">
          <div v-if="areas" class="reports-container | flex-grow-1">
            <div
              v-for="(area, index) in areas"
              :key="index"
              class="terciary rounded pa-3 mb-2 mb-md-6"
            >
              <reports-section
                :title="area"
                :reports="reportsByArea[area]"
                process-time="Inspection"
                :area="area"
                :task="jobTask"
                :order-id="orderId"
                :approve-text="$t('approveArea')"
                :download-text="`${$t('downloadPhotosOf')} ${area}`"
                :contractor-completed="
                  (jobTask.contractorCompletedByArea &&
                    jobTask.contractorCompletedByArea[area]) ||
                  false
                "
                :work-order-number="workOrderNumber"
                :show-add-requirement-btn="false"
                :show-approve-box="false"
                :show-total-reports-icon="false"
                :show-actions-requirement-btn="false"
                :show-add-reports-btn="true"
              />
              <requirements
                v-if="
                  requirementsFromInspection &&
                  requirementsFromInspection.length
                "
                :requirements="
                  requirementsFromInspection.filter(
                    (req) => req.inspectionArea === area
                  )
                "
                :reports="reportsFromRequirements"
                :type="jobTask.type"
                :task="jobTask"
                :order-id="orderId"
                :area="area"
                :show-add-requirement-btn="false"
                :show-approve-box="false"
                :show-total-reports-icon="false"
                :show-actions-requirement-btn="false"
                :show-add-reports-btn="true"
              />
            </div>
          </div>
          <div
            v-else-if="
              jobTask.needProcessTimes &&
              !areas &&
              (type.type === JOB_TYPES.workToDos ||
                type.type === JOB_TYPES.allowables ||
                type.type === JOB_TYPES.allowablesPools ||
                type.type === JOB_TYPES.inspections)
            "
            class="reports-container | flex-grow-1"
          >
            <div class="terciary rounded pa-3 mb-2 mb-md-6">
              <SectionToolbar
                title="Before"
                process-time="Before"
                :order-id="orderId"
                :task="jobTask"
                :requirements="requirementsFromBefore"
                :reports="beforeReports"
                :reports-from-requirements="reportsFromRequirements"
                :from-oos="false"
              />
              <div class="elevation-1">
                <reports-section
                  v-if="reportsCount.Before && reportsCount.Before > 0"
                  class="ml-2 mt-4"
                  title="General Reports"
                  :reports="beforeReports"
                  process-time="Before"
                  :task="jobTask"
                  :requirements="requirementsFromBefore"
                  :reports-from-requirements="reportsFromRequirements"
                  :order-id="orderId"
                  :work-order-number="workOrderNumber"
                  :approve-text="$t('approveBefore')"
                  :download-text="$t('downloadBeforePhotos')"
                  :contractor-completed="jobTask.contractorCompleted"
                  :show-add-requirement-btn="false"
                  :show-approve-box="false"
                  :show-total-reports-icon="false"
                  :show-actions-requirement-btn="false"
                  :show-add-reports-btn="true"
                  :from-oos="false"
                  :reports-count-task="reportsCountTask"
                  :started="jobTask.beforeStarted"
                  :finished="jobTask.beforeFinished"
                  :started-at="jobTask.beforeStartedAt"
                  :started-by="jobTask.beforeStartedBy"
                  :finished-by="jobTask.beforeFinishedBy"
                  :finished-at="jobTask.beforeFinishedAt"
                />
                <requirements
                  v-if="requirementsFromBefore && requirementsFromBefore.length"
                  :requirements="requirementsFromBefore"
                  :reports="reportsFromRequirements"
                  :task-id="jobTask.id"
                  :type="jobTask.type"
                  :task="jobTask"
                  :order-id="orderId"
                  :work-order-number="workOrderNumber"
                  :show-add-requirement-btn="false"
                  :show-approve-box="false"
                  :show-total-reports-icon="false"
                  :show-actions-requirement-btn="false"
                  :show-add-reports-btn="true"
                />
              </div>
            </div>

            <div class="terciary rounded pa-3 mb-2 mb-md-6">
              <SectionToolbar
                title="During"
                process-time="During"
                :order-id="orderId"
                :task="jobTask"
                :requirements="requirementsFromDuring"
                :reports="duringReports"
                :reports-from-requirements="reportsFromRequirements"
                :from-oos="false"
              />
              <div class="elevation-1">
                <reports-section
                  v-if="reportsCount.During && reportsCount.During > 0"
                  class="ml-2 mt-4"
                  title="General Reports"
                  :reports="duringReports"
                  process-time="During"
                  :task="jobTask"
                  :order-id="orderId"
                  :requirements="requirementsFromDuring"
                  :reports-from-requirements="reportsFromRequirements"
                  :work-order-number="workOrderNumber"
                  :approve-text="$t('approveDuring')"
                  :download-text="$t('downloadDuringPhotos')"
                  :contractor-completed="jobTask.contractorCompleted"
                  :show-add-requirement-btn="false"
                  :show-approve-box="false"
                  :show-total-reports-icon="false"
                  :show-actions-requirement-btn="false"
                  :show-add-reports-btn="true"
                  :from-oos="false"
                  :reports-count-task="reportsCountTask"
                  :started="jobTask.duringStarted"
                  :finished="jobTask.duringFinished"
                  :started-at="jobTask.duringStartedAt"
                  :started-by="jobTask.duringStartedBy"
                  :finished-by="jobTask.duringFinishedBy"
                  :finished-at="jobTask.duringFinishedAt"
                />
                <requirements
                  v-if="requirementsFromDuring && requirementsFromDuring.length"
                  :requirements="requirementsFromDuring"
                  :reports="reportsFromRequirements"
                  :task-id="jobTask.id"
                  :type="jobTask.type"
                  :task="jobTask"
                  :order-id="orderId"
                  :work-order-number="workOrderNumber"
                  :show-add-requirement-btn="false"
                  :show-approve-box="false"
                  :show-total-reports-icon="false"
                  :show-actions-requirement-btn="false"
                  :show-add-reports-btn="true"
                />
              </div>
            </div>

            <div class="terciary rounded pa-3 mb-2 mb-md-6">
              <SectionToolbar
                title="After"
                process-time="After"
                :order-id="orderId"
                :task="jobTask"
                :requirements="requirementsFromAfter"
                :reports="afterReports"
                :reports-from-requirements="reportsFromRequirements"
                :from-oos="false"
              />
              <div class="elevation-1">
                <reports-section
                  v-if="reportsCount.After && reportsCount.After > 0"
                  class="ml-2 mt-4"
                  title="General Reports"
                  :reports="afterReports"
                  process-time="After"
                  :requirements="requirementsFromAfter"
                  :reports-from-requirements="reportsFromRequirements"
                  :task="jobTask"
                  :order-id="orderId"
                  :work-order-number="workOrderNumber"
                  :approve-text="$t('approveAfter')"
                  :download-text="$t('downloadAfterPhotos')"
                  :contractor-completed="jobTask.contractorCompleted"
                  :show-add-requirement-btn="false"
                  :show-approve-box="false"
                  :show-total-reports-icon="false"
                  :show-actions-requirement-btn="false"
                  :show-add-reports-btn="true"
                  :from-oos="false"
                  :reports-count-task="reportsCountTask"
                  :started="jobTask.afterStarted"
                  :finished="jobTask.afterFinished"
                  :started-at="jobTask.afterStartedAt"
                  :started-by="jobTask.afterStartedBy"
                  :finished-by="jobTask.afterFinishedBy"
                  :finished-at="jobTask.afterFinishedAt"
                />
                <requirements
                  v-if="requirementsFromAfter && requirementsFromAfter.length"
                  :requirements="requirementsFromAfter"
                  :reports="reportsFromRequirements"
                  :task-id="jobTask.id"
                  :type="jobTask.type"
                  :task="jobTask"
                  :order-id="orderId"
                  :work-order-number="workOrderNumber"
                  :show-add-requirement-btn="false"
                  :show-approve-box="false"
                  :show-total-reports-icon="false"
                  :show-actions-requirement-btn="false"
                  :show-add-reports-btn="true"
                />
              </div>
            </div>
          </div>
          <div
            v-else-if="
              !jobTask.needProcessTimes &&
              jobTask.type !== JOB_TYPES.inspections &&
              (type.type === JOB_TYPES.workToDos ||
                type.type === JOB_TYPES.allowables ||
                type.type === JOB_TYPES.allowablesPools) &&
              reportsNoProcess
            "
            class="reports-container | flex-grow-1"
          >
            <div class="terciary rounded pa-3 mb-2 mb-md-6">
              <SectionToolbar
                title="Reports"
                process-time="General Reports"
                :order-id="orderId"
                :task="jobTask"
                :requirements="requirementsFromGeneral"
                :reports="reportsNoProcess"
                :reports-from-requirements="reportsFromRequirements"
                :from-oos="false"
              />
              <div class="elevation-1">
                <reports-section
                  v-if="
                    reportsCount.GeneralReports &&
                    reportsCount.GeneralReports > 0
                  "
                  class="ml-2 mt-4"
                  title="General Reports"
                  :reports="reportsNoProcess"
                  process-time="GeneralReports"
                  :task="jobTask"
                  :order-id="orderId"
                  :work-order-number="workOrderNumber"
                  :approve-text="$t('approveGeneral')"
                  :download-text="$t('downloadReportsPhotos')"
                  :contractor-completed="jobTask.contractorCompleted"
                  :show-add-requirement-btn="false"
                  :show-approve-box="false"
                  :show-total-reports-icon="false"
                  :show-add-reports-btn="true"
                  :show-actions-requirement-btn="false"
                  :started="jobTask.started"
                  :finished="jobTask.finished"
                  :started-at="jobTask.startedAt"
                  :finished-by="jobTask.finishedBy"
                  :started-by="jobTask.startedBy"
                  :finished-at="jobTask.finishedAt"
                />
                <requirements
                  v-if="requirementsFromGeneral"
                  :requirements="requirementsFromGeneral"
                  :reports="reportsFromRequirements"
                  :task-id="jobTask.id"
                  :type="jobTask.type"
                  :is-general="true"
                  :task="jobTask"
                  :order-id="orderId"
                  :work-order-number="workOrderNumber"
                  :show-add-requirement-btn="false"
                  :show-approve-box="false"
                  :show-total-reports-icon="false"
                  :show-add-reports-btn="true"
                  :show-actions-requirement-btn="false"
                  :show-title-general="reportsCountTask === 0"
                />
              </div>
            </div>
          </div>
          <div
            v-if="
              requirementsFromGeneral &&
              jobTask.type !== JOB_TYPES.inspections &&
              requirementsFromGeneral &&
              requirementsFromGeneral.length &&
              jobTask.needProcessTimes
            "
            class="terciary rounded pa-3 mb-4"
          >
            <SectionToolbar
              title="Requirements General"
              process-time="Requirement"
              :order-id="orderId"
              :task="jobTask"
              :requirements="requirementsFromGeneral"
              :reports-from-requirements="reportsFromRequirements"
              :from-oos="false"
            />
            <requirements
              :requirements="requirementsFromGeneral"
              :reports="reportsFromRequirements"
              :task-id="jobTask.id"
              :type="jobTask.type"
              :is-general="true"
              :task="jobTask"
              :order-id="orderId"
              :work-order-number="workOrderNumber"
              :show-add-requirement-btn="false"
              :show-approve-box="false"
              :show-total-reports-icon="false"
              :show-add-reports-btn="true"
              :show-actions-requirement-btn="false"
              :reports-count-task="reportsCountTask"
            />
          </div>
        </div>

        <!-- If it's Tools -->
        <div v-if="type.type === 'tools'" class=""></div>
      </v-card-text>
    </v-card>
    <slide-show
      v-if="jobTask.pictures && jobTask.pictures.length"
      :list="jobTask.pictures.filter((pic) => pic.type.includes('image'))"
      :show="showImagesSlides"
      :title="$t('ImagesView') + ' ' + $t(type.title)"
      type="images"
      @close="showImagesSlides = false"
    />
    <v-dialog v-model="showPdfViewer" fullscreen>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>

    <!-- <Lupa /> -->
    <v-dialog
      v-if="!loadingReportsByDownload"
      v-model="showReportsDownload"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <reports-all-download
        v-if="showReportsDownload"
        :reports="reportsByDownload"
        :type="`${jobTask.title} ${jobTask.type}`"
        :wo="workOrderNumber"
        :task="jobTask"
        @close="showReportsDownload = false"
      ></reports-all-download>
    </v-dialog>
  </v-dialog>
</template>

<script>
import SlideShow from '../../misc/SlideShow.vue'
import PdfViewer from '../../misc/PdfViewer.vue'
import ReportsSection from '../../oos/taskContent/ReportsSection.vue'
import Requirements from '../../oos/taskContent/requirements/Requirements.vue'
import SectionToolbar from '../../oos/taskContent/SectionToolbar.vue'
import ReportsAllDownload from '../../oos/taskContent/download/ReportsAllDownload.vue'
// import Lupa from '../../misc/Lupa.vue'
import { JOB_TYPES } from '@/utils/dictionaries'
export default {
  name: 'TaskView',
  components: {
    SlideShow,
    PdfViewer,
    ReportsSection,
    Requirements,
    // Lupa,
    SectionToolbar,
    ReportsAllDownload,
  },
  props: {
    type: { type: Object, default: () => ({}) },
    jobTask: { type: Object, default: () => ({}) },
    open: { type: Boolean, default: false },
    orderId: { type: String, default: '' },
    workOrderNumber: { type: String, default: '' },
    reportsCountTask: { type: Number, default: 0 },
    reportsCount: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      JOB_TYPES: false,
      show: false,
      showImagesSlides: false,
      previewUrl: '',
      showPdfViewer: false,
      showAddArea: false,
      reportsByDownload: [],
      showReportsDownload: false,
      loadingReportsByDownload: false,
    }
  },

  computed: {
    beforeReports() {
      if (!this.jobTask.reports || this.jobTask.reports.length) {
        return
      }
      return this.jobTask.reports
        .filter((report) => report.before)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    duringReports() {
      if (!this.jobTask.reports || this.jobTask.reports.length) {
        return
      }
      return this.jobTask.reports
        .filter((report) => report.during)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    afterReports() {
      if (!this.jobTask.reports || this.jobTask.reports.length) {
        return
      }
      return this.jobTask.reports
        .filter((report) => report.after)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    areas() {
      if (this.jobTask.type !== JOB_TYPES.inspections) {
        return null
      }
      return this.jobTask.areasInReports
    },
    reportsByArea() {
      if (!this.areas) {
        return []
      }
      const reportsByArea = {}
      for (let i = 0; i < this.areas.length; i++) {
        const area = this.areas[i]
        reportsByArea[area] = this.jobTask.reports.filter(
          (report) => report.area === area && !report.fromRequirement
        )
      }
      return reportsByArea
    },
    reportsNoProcess() {
      if (!this.jobTask.reports || this.jobTask.reports.length) {
        return
      }
      return this.jobTask.reports
        .filter(
          (report) => report.mediaType !== 'text' && !report.fromRequirement
        )
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    requirementsFormated() {
      if (!this.jobTask.requirements || !this.jobTask.requirements.length) {
        return []
      }
      return JSON.parse(JSON.stringify(this.jobTask.requirements))
    },
    requirementsFromBefore() {
      if (!this.requirementsFormated || !this.requirementsFormated.length) {
        return []
      }
      return this.requirementsFormated
        .filter((r) => r.fromBefore)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromDuring() {
      if (!this.requirementsFormated || !this.requirementsFormated.length) {
        return []
      }
      return this.requirementsFormated
        .filter((r) => r.fromDuring)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromAfter() {
      if (!this.requirementsFormated || !this.requirementsFormated.length) {
        return []
      }
      return this.requirementsFormated
        .filter((r) => r.fromAfter)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromGeneral() {
      if (!this.requirementsFormated || !this.requirementsFormated.length) {
        return []
      }
      return this.requirementsFormated
        .filter((r) => r.fromGeneral)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromInspection() {
      if (!this.requirementsFormated || !this.requirementsFormated.length) {
        return []
      }
      return this.requirementsFormated
        .filter((r) => r.fromInspection)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    reportsFromRequirements() {
      if (!this.requirementsFormated || !this.requirementsFormated.length) {
        return {}
      }
      const _reportsFromRequirementsList = this.jobTask.reports.filter(
        (report) => report.fromRequirement
      )
      const _reportsFromRequirements = {}
      for (let i = 0; i < this.jobTask.requirements.length; i++) {
        const requirement = this.jobTask.requirements[i]

        _reportsFromRequirements[requirement.id] =
          _reportsFromRequirementsList.filter(
            (report) => report.requirementId === requirement.id
          )
      }
      return _reportsFromRequirements
    },
  },
  watch: {
    open(val) {
      this.show = val
    },
    show(val) {
      if (!val) {
        this.$emit('close')
      }
    },
  },
  created() {
    this.JOB_TYPES = JOB_TYPES
  },
  methods: {
    handleClosePdfViewer() {
      this.previewUrl = ''
      this.showPdfViewer = false
    },
    handleViewPdf(url) {
      this.previewUrl = url
      this.showPdfViewer = true
    },
    zoomHover(event, pic) {
      const elementImg = event.target
      const box = elementImg.getBoundingClientRect()
      const position = JSON.parse(JSON.stringify(box))
      this.$store.commit('set_lupaOptions', { url: pic.url, position })
      this.$store.commit('set_showLupa', true)
    },
    zoomLeave(event, id) {
      this.$store.commit('set_showLupa', false)
    },
    handleDownloadAllReports() {
      this.showReportsDownload = true
      if (!this.reportsByDownload.length) {
        this.get_reportsForTask()
      }
    },
    async get_reportsForTask() {
      try {
        this.loadingReportsByDownload = true

        const _reports = await this.$store.dispatch(
          'order/get_reportsForTask',
          {
            orderId: this.orderId,
            taskId: this.jobTask.id,
            type: this.jobTask.type,
          }
        )
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
.file-preview {
  border-radius: 4px;
  border: 1px solid #ddd;
  height: 100%;
  cursor: pointer;
}
.pic-wrapper {
  margin-top: 0.5rem;
  margin-right: 0.5rem;
  width: 90px;
  height: 90px;
  padding: 0.5em;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    cursor: pointer;
    border-radius: 4px;
  }
}
.reports-container {
  display: grid;
  grid-auto-flow: row;
}
.dialog {
  overflow: hidden;
}
.sub-title {
  font-size: 0.98rem;
  font-weight: bold;
}
</style>
