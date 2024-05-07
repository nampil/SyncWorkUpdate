<template>
  <div class="bids-reports-section">
    <div class="d-flex">
      <span class="text-subtitle-1 font-weight-bold pl-3">
        {{ bid.title }}</span
      >
      <v-spacer></v-spacer>
      <!-- <v-tooltip open-delay="600" content-class="small" top> -->
      <!-- eslint-disable-next-line -->
      <!-- <template v-slot:activator="{ on, attrs }">
          <v-btn
            small
            icon
            class="mr-2"
            :color="expandedAllTasks ? 'primary' : 'success'"
            v-bind="attrs"
            v-on="on"
            @click="expandedAllTasks = !expandedAllTasks"
          >
            <v-icon x-small>mdi-arrow-expand-all</v-icon>
          </v-btn>
        </template>
        <span>Expand</span>
      </v-tooltip> -->
      <v-btn
        class="mr-4"
        small
        icon
        :color="expandedTasks ? 'primary' : 'success'"
        @click="expandedTasks = !expandedTasks"
        ><v-icon>{{
          expandedTasks ? 'mdi-chevron-up' : 'mdi-chevron-down'
        }}</v-icon></v-btn
      >
    </div>
    <div :class="['reports-group', { expanded: expandedTasks }]">
      <div v-if="loading" class="ml-4">Loading</div>
      <div v-else-if="reportsLoaded && !reports.length" class="ml-4">
        No Reports yet
      </div>
      <div v-else ref="reportsGrid" class="reports-grid">
        <div
          v-for="(report, index) in reports"
          :id="report.id"
          :key="report.id"
          :data-index="index"
          class="reports-item"
        >
          <v-lazy>
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
          </v-lazy>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReportImageContainer from '~/components/oos/taskContent/reports/ReportImageContainer.vue'

export default {
  name: 'BidsReportsSection',
  components: { ReportImageContainer },
  props: {
    bid: { type: Object, default: () => ({}) },
    orderId: { type: String, required: true },
    reportsSelected: { type: Array, default: () => [] },
  },
  data() {
    return {
      expandedTasks: false,
      reports: [],

      reportsLoaded: false,
      loading: false,
      indexSelectedFrom: null,
      indexDesSelectedFrom: null,
      isSelecting: false,
    }
  },
  computed: {},
  watch: {
    expandedTasks(val) {
      if (val && !this.reportsLoaded) {
        this.getReports()
      }
    },
  },
  methods: {
    async getReports() {
      // fetch reports
      try {
        this.loading = true
        // fetch reports
        this.reports = await this.$store.dispatch('bids/get_reportsForBid', {
          orderId: this.orderId,
          bidId: this.bid.id,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error loading reports for bid', error)
        this.$mainAlertError('Error loading reports')
      } finally {
        this.loading = false
        this.reportsLoaded = true
      }
    },
    handleUpdateReport(report) {
      const idx = this.reports.findIndex((r) => r.id === report.id)
      if (idx === -1) return
      this.reports.splice(idx, 1, report)
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

    handleShowSlideShow($event) {},
  },
}
</script>

<style lang="scss" scoped>
.reports-section-group {
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms cubic-bezier(0, 1, 0, 1);
  &.expanded {
    max-height: 100000px;
    transition: max-height 500ms ease-in-out;
  }
}

.reports-group {
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms cubic-bezier(0, 1, 0, 1);
  &.expanded {
    max-height: 10000px;
    transition: max-height 500ms ease-in-out;
  }
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px);
  gap: 0.4rem;
  padding: 1rem;

  .reports-item {
    aspect-ratio: 1;
  }
}
.grid-selected {
  background-color: rgba($color: #000000, $alpha: 0.2);
}
</style>
