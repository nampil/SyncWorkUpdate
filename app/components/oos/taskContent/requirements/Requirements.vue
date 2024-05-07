<template>
  <div
    class="container-requirements | elevation-1 rounded my-4"
    :class="!isGeneral ? 'pa-2' : 'terciary pa-3'"
  >
    <div v-if="requirements && requirements.length">
      <div v-for="requirement in requirements" :key="requirement.id" class="">
        <ReportsSection
          :title="requirement.descRequirement"
          :reports="reports[requirement.id]"
          process-time="Requeriment"
          :task="task"
          :requirements="requirements"
          :for-requirements="true"
          :requirement="requirement"
          :approve-text="$t('approveRequirement')"
          :order-id="orderId"
          :work-order-number="workOrderNumber"
          :download-text="$t('downloadRequirementsPhotos')"
          :add-requirements-text="'Add Requirements'"
          :contractor-completed="requirement.contractorCompleted"
          :area="area"
          :show-add-requirement-btn="showAddRequirementBtn"
          :show-approve-box="showApproveBox"
          :show-total-reports-icon="showTotalReportsIcon"
          :show-actions-requirement-btn="showActionsRequirementBtn"
          :from-oos="fromOos"
          :show-add-reports-btn="showAddReportsBtn"
          :started="requirement.started"
          :finished="requirement.finished"
          :started-at="requirement.startedAt"
          :started-by="requirement.startedBy"
          :finished-by="requirement.finishedBy"
          :finished-at="requirement.finishedAt"
          :expand-all="expandAllReportsSection"
          @disapprove-requirement="$emit('disapprove-requirement')"
        />
      </div>
    </div>
    <!-- <div v-else>
      <span class="no-reports-text"> {{ $t('noRequiremetsYet') }}</span>
    </div> -->
    <slide-show
      :list="reportsSelectedToShow"
      :show="showImagesSlides"
      :title="typeReports"
      type="images"
      :index-selected="indexOfImage"
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
        :task-id="taskId"
        :type="task.type"
        requirement-from="General"
        :last-positions-req="requirements.length"
        @update-persistent="validatePersistent = $event"
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
      <reports-download
        v-if="showReportsDownload"
        :local-reports="localReports"
        :reports="reportsByDownload"
        :type="`${task.title} Requirements General`"
        type-report="Requirements General"
        :new-download-version="true"
        :title="task.title"
        :type-task="task.type"
        :from-oos="fromOos"
        :area="area"
        :requirements="requirements"
        @close="showReportsDownload = false"
      ></reports-download>
    </v-dialog>
  </div>
</template>

<script>
import SlideShow from '../../../misc/SlideShow.vue'
import ReportsSection from '../ReportsSection.vue'
import ReportsDownload from '../download/ReportsDownload.vue'
import AddRequirements from './AddRequirements.vue'

export default {
  name: 'Requirements',
  components: { SlideShow, ReportsSection, AddRequirements, ReportsDownload },
  props: {
    requirements: { type: Array, default: () => [] },
    reports: { type: Object, default: () => ({}) },
    orderId: { type: String, default: '' },
    taskId: { type: String, default: '' },
    type: { type: String, default: '' },
    area: { type: String, default: '' },
    isGeneral: { type: Boolean, default: false },
    task: { type: Object, default: () => ({}) },
    workOrderNumber: { type: String, default: '' },
    showAddRequirementBtn: { type: Boolean, default: false },
    showApproveBox: { type: Boolean, default: false },
    showTotalReportsIcon: { type: Boolean, default: false },
    showActionsRequirementBtn: { type: Boolean, default: false },
    fromOos: { type: Boolean, default: false },
    showAddReportsBtn: { type: Boolean, default: false },
    showTitleGeneral: { type: Boolean, default: false },
    reportsCountTask: { type: Number, default: 0 },
    expandAllReportsSection: { type: Boolean, default: false },
  },
  data() {
    return {
      showImagesSlides: false,
      reportsSelectedToShow: [],
      indexOfImage: 0,
      typeReports: '',
      loading: false,
      showAddRequirements: false,
      validatePersistent: false,
      showReportsDownload: false,
      reportsByDownload: [],
      localReports: [],
    }
  },
  computed: {
    requirementsReportsValidate() {
      for (let i = 0; i < this.requirements.length; i++) {
        const _id = this.requirements[i].id
        if (this.reports[_id] && this.reports[_id].length) {
          return false
        }
      }
      return true
    },
  },

  methods: {
    get_reportsSelectedToShowRequirements(requirements, index) {
      this.reportsSelectedToShow = requirements
      this.indexOfImage = index
      this.showImagesSlides = true
      this.typeReports = this.task.title + ' ' + 'Requirements'
    },
    handleDeleteReport(report) {
      try {
        this.loading = true
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

        this.resourceToDelete = {
          path: `orders/${report.orderId}/${report.task.type}/${report.task.id}/reports/${report.id}`,
          url: report.url,
          desc,
        }
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
        console.log('Error deletting report')
        this.$mainAlertError('Hubo un error al borrar este reporte')
      } finally {
        this.loading = false
      }
    },

    async update_oosChecked(requirement) {
      try {
        await this.$store.dispatch('oos/orders/update_oosChecked', {
          requirement,
          task: this.task,
          orderId: this.orderId,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async getReportsForDawnload() {
      try {
        this.loadingReports = true

        const _localReports = await this.$store.dispatch(
          'order/get_reportsForDawnload',
          {
            orderId: this.orderId,
            requirements: this.requirements,
            task: this.task,
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

    handleShowReportsDownload() {
      this.showReportsDownload = !this.showReportsDownload

      if (this.fromOos) {
        let array = []
        for (let i = 0; i < this.requirements.length; i++) {
          const _id = this.requirements[i].id
          if (this.reports[_id]) {
            array = array.concat(Object.values(this.reports[_id]))
          }
        }
        this.reportsByDownload = array
      } else {
        this.newDownloadVersion = true
        this.getReportsForDawnload()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.sub-title-requirements {
  font-size: 0.8rem;
  font-weight: bold;
  &.is-general {
    font-size: 1rem;
  }
}
.no-reports-text {
  font-size: 0.75rem;
  color: var(--v-info-base);
}
</style>
