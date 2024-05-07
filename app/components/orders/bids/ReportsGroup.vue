<template>
  <div ref="reportsGroupContainer" class="reports-group-container">
    <div class="pl-3 pr-4 d-flex">
      <span
        :class="
          forRequirements
            ? 'title | info--text font-weight-bold'
            : 'text-subtitle-2 font-weight-bold'
        "
      >
        {{ title }}</span
      >
      <v-spacer></v-spacer>
      <v-btn
        small
        icon
        :color="expanded ? 'primary' : 'success'"
        @click="handleReports()"
        ><v-icon>{{
          expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'
        }}</v-icon></v-btn
      >
    </div>

    <div
      v-if="loadingReports && !reportsFormatted.length"
      class="container-loader pa-4 pt-0 d-flex align-center rounded justify-center"
    >
      <v-progress-circular size="20" indeterminate></v-progress-circular>
    </div>

    <div :class="['reports-group', { expanded: expanded }]">
      <div
        v-for="(report, index) in reportsFormatted"
        :key="report.id"
        class="reports-item"
      >
        <ReportImageContainer
          v-if="report.url"
          :report="report"
          :index="index"
          :from-bids="true"
          :selected="reportsSelected.some((r) => r.id === report.id)"
          @update-report="handleUpdateReport($event)"
          @select="handleSelectReport(report, $event, index)"
          @show-slide="handleShowSlideShow($event)"
        />
      </div>
    </div>

    <span
      v-if="reports.length === 0 && expanded && !loadingReports"
      class="d-flex pa-3 pt-1 info--text justify-center"
      >There are no reports to select!</span
    >

    <div
      v-if="reports.length >= nReportsDisplayed && expanded"
      ref="seeMoreDiv"
      v-intersect="{
        handler: handleSeeMore,
        once: true,
        options: {
          threshold: 1.0,
        },
      }"
      class="d-flex justify-center mb-2"
    >
      <v-progress-circular indeterminate></v-progress-circular>
    </div>

    <SlideShow
      :list="reportsFormatted"
      :show="showImagesSlides"
      title="Report"
      type="images"
      :index-selected="indexOfImage"
      @close="showImagesSlides = false"
    />
  </div>
</template>

<script>
import ReportImageContainer from '~/components/oos/taskContent/reports/ReportImageContainer.vue'
import SlideShow from '~/components/misc/SlideShow.vue'
export default {
  name: 'ReportsGroup',
  components: {
    ReportImageContainer,
    SlideShow,
  },
  props: {
    typeTask: { type: String, default: '' },
    reportsSelected: { type: Array, default: () => [] },
    requirement: { type: Object, default: () => ({}) },
    orderId: { type: String, default: '' },
    task: { type: Object, default: () => ({}) },
    title: { type: String, default: '' },
    area: { type: String, default: '' },
    forRequirements: { type: Boolean, default: false },
    processTime: { type: String, default: '' },
    expandedAllTasks: { type: Boolean, default: false },
    expandedTasks: { type: Boolean, default: false },
  },

  data() {
    return {
      expanded: false,
      indexOfImage: 0,
      showImagesSlides: false,
      nReportsDisplayed: 50,
      reports: [],
      loadingReports: false,
      observer: null,
      indexSelectedFrom: null,
      indexDesSelectedFrom: null,
    }
  },

  computed: {
    validateExpanded() {
      if (!this.expandedTasks) {
        return this.expandedAllTasks
      }
      if (!this.expandedAllTasks) {
        return this.expandedTasks
      }
      return false
    },
    reportsFormatted() {
      return this.reports.slice(0, this.nReportsDisplayed)
    },
  },
  watch: {
    expandedAllTasks(val) {
      if (val && this.reports.length === 0) {
        this.handleReports()
      } else {
        this.expanded = true
      }
    },
    expandedTasks(val) {
      if (val) {
        this.expanded = false
      }
    },
  },
  methods: {
    handleShowSlideShow(index) {
      this.indexOfImage = index
      this.showImagesSlides = true
    },
    handleSelectReport(report, event, index) {
      let reportsSelect = []
      if (event.select) {
        if (this.indexSelectedFrom == null) {
          this.indexSelectedFrom = this.reports.findIndex(
            (r) => r.id === report.id
          )
        }
        if (!event.shift) {
          const newEvent = { select: event.select, shift: false }
          this.$emit('report-selected', { report, event: newEvent })
          return
        }

        if (this.indexSelectedFrom > index) {
          reportsSelect = this.reports.slice(index, this.indexSelectedFrom + 1)
        } else {
          reportsSelect = this.reports.slice(this.indexSelectedFrom, index + 1)
        }
        reportsSelect = reportsSelect.filter((report) => {
          return !this.reportsSelected.map((a) => a.id).includes(report.id)
        })
      } else {
        if (this.indexDesSelectedFrom == null) {
          this.indexDesSelectedFrom = this.reports.findIndex(
            (r) => r.id === report.id
          )
        }
        if (!event.shift) {
          const newEvent = { select: event.select, shift: false }
          this.$emit('report-selected', { report, event: newEvent })
          return
        }

        let _reports = []
        if (this.indexDesSelectedFrom > index) {
          _reports = this.reports.slice(index, this.indexDesSelectedFrom + 1)
        } else {
          _reports = this.reports.slice(this.indexDesSelectedFrom, index + 1)
        }
        reportsSelect = this.reportsSelected.filter((report) => {
          return !_reports.map((e) => e.id).includes(report.id)
        })
      }
      this.indexSelectedFrom = null
      this.indexDesSelectedFrom = null
      this.$emit('report-selected', { reportsSelect, event })
    },
    handleSeeMore(observer) {
      this.$nextTick(() => {
        if (observer) {
          this.nReportsDisplayed = this.nReportsDisplayed + 10
        }
      })
    },
    handleReports() {
      this.expanded = !this.expanded

      if (this.expanded && this.reports.length === 0) {
        this.getReports()
      }
    },
    async getReports() {
      try {
        this.loadingReports = true
        const _reports = await this.$store.dispatch(
          'order/get_reportsForSection',
          {
            orderId: this.orderId,
            processTime: this.processTime,
            forRequirements: this.forRequirements,
            ...(this.forRequirements &&
              this.requirement && { requirement: this.requirement }),
            area: this.area,
            task: this.task,
            isCount: false,
          }
        )
        this.reports = _reports
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting reports', error)
        this.$mainAlertError('Error getting Reports')
      } finally {
        this.loadingReports = false
      }
    },
    handleUpdateReport(report) {
      const idx = this.reports.findIndex((r) => r.id === report.id)
      if (idx === -1) return
      this.reports.splice(idx, 1, report)
    },
  },
}
</script>

<style lang="scss" scoped>
.reports-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px);
  gap: 0.4rem;
  margin-left: 15px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms cubic-bezier(0, 1, 0, 1);
  &.expanded {
    max-height: fit-content;
    transition: max-height 500ms ease-in-out;
  }
  .reports-item {
    aspect-ratio: 1;
  }
}
.title {
  font-size: 0.7rem !important;
}
</style>
