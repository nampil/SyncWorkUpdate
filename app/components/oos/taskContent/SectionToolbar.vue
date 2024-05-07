<template>
  <div class="container-section-toolbar">
    <span class="title | pb-3">{{ title }}</span>
    <v-tooltip v-if="fromOos" open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="ml-2"
          icon
          small
          v-bind="attrs"
          v-on="on"
          @click="handleShowAddRequirement()"
        >
          <v-icon size="18">mdi-plus-box-outline</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('addRequirements') }}</span>
    </v-tooltip>
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          class="ml-1"
          small
          :loading="loadingReportsByDownload"
          v-bind="attrs"
          v-on="on"
          @click="handleShowReportsDownload()"
          ><v-icon small>mdi-tray-arrow-down</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('download') }}</span>
    </v-tooltip>

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
        :requirements-in-section="requirements"
        :last-positions-req="lastPositionsReq"
        @update-persistent="validatePersistent = $event"
        @close="showAddRequirements = false"
      >
      </AddRequirements>
    </v-dialog>

    <v-dialog
      v-if="!loadingReportsByDownload"
      v-model="showReportsDownload"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <reports-download
        v-if="showReportsDownload"
        :local-reports="localReports"
        :reports="reportsByDownload"
        :type="`${task.title} ${processTime}`"
        :type-report="processTime"
        :title="task.title"
        :type-task="task.type"
        :from-oos="fromOos"
        :requirements="requirements"
        @close="showReportsDownload = false"
      ></reports-download>
    </v-dialog>
  </div>
</template>

<script>
import AddRequirements from './requirements/AddRequirements.vue'
import ReportsDownload from './download/ReportsDownload.vue'
export default {
  name: 'SectionToolbar',
  components: {
    AddRequirements,
    ReportsDownload,
  },
  props: {
    title: { type: String, default: '' },
    processTime: { type: String, default: '' },
    orderId: { type: String, default: '' },
    area: { type: String, default: '' },
    task: { type: Object, required: true },
    requirements: { type: Array, default: () => [] },
    reports: { type: Array, default: () => [] },
    reportsFromRequirements: { type: Object, required: true },
    fromOos: { type: Boolean, default: false },
  },
  data() {
    return {
      showAddRequirements: false,
      validatePersistent: false,
      showReportsDownload: false,
      reportsByDownload: [],
      localReports: [],
      requirementFrom: '',
      loadingReportsByDownload: false,
    }
  },
  computed: {
    lastPositionsReq() {
      const lastReq = this.requirements[this.requirements.length - 1]
      return lastReq?.position || this.requirements.length
    },
  },
  methods: {
    async getReportsForDawnload() {
      try {
        this.loadingReportsByDownload = true
        const _type =
          this.processTime === 'GeneralReports' ? 'General' : this.processTime

        const _localReports = await this.$store.dispatch(
          'order/get_reportsForDawnload',
          {
            orderId: this.orderId,
            requirements: this.requirements,
            task: this.task,
            type: _type,
          }
        )
        this.localReports = _localReports
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting reports', error)

        this.$mainAlertError('Error getting Reports')
      } finally {
        this.loadingReportsByDownload = false
      }
    },
    handleShowReportsDownload() {
      this.showReportsDownload = !this.showReportsDownload

      if (this.fromOos) {
        let array = []
        // for (let i = 0; i < this.requirements.length; i++) {
        //   const _id = this.requirements[i].id
        //   if (this.reportsFromRequirements[_id]) {
        //     array = array.concat(
        //       Object.values(this.reportsFromRequirements[_id])
        //     )
        //   }
        // }
        this.requirements.forEach((r) => {
          const _id = r.id
          if (this.reportsFromRequirements[_id]) {
            array = array.concat(
              Object.values(this.reportsFromRequirements[_id])
            )
          }
        })
        this.reportsByDownload = array.concat(this.reports)
      } else if (!this.localReports.length) {
        this.getReportsForDawnload()
      }
    },
    handleShowAddRequirement() {
      const _type =
        this.processTime === 'GeneralReports' ? 'General' : this.processTime
      this.requirementFrom = _type
      this.showAddRequirements = true
    },
  },
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 1rem;
  font-weight: bold;
}
</style>
