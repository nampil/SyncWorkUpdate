<template>
  <div class="requirements-group-container mt-2">
    <div class="d-flex">
      <span class="text-subtitle-1 font-weight-bold pl-3"> {{ title }}</span>
      <v-spacer></v-spacer>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
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
      </v-tooltip>
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

    <div
      :class="[
        'requirements-group',
        { expanded: expandedTasks || expandedAllTasks },
      ]"
    >
      <div v-if="task.type !== 'inspections'" class="pt-1">
        <div v-for="(type, i) in typesSection" :key="i">
          <span
            v-if="requirementsFormatted[type]?.length"
            class="text-subtitle-2 font-weight-bold pl-3"
          >
            {{ $t(type.toLowerCase()) }}</span
          >
          <div v-for="req in requirementsFormatted[type]" :key="req.id">
            <reports-group
              :type-task="typeTask"
              :requirement="req"
              :reports-selected="reportsSelected"
              :order-id="orderId"
              :task="task"
              :title="req.descRequirement"
              :for-requirements="true"
              :process-time="type"
              :expanded-all-tasks="expandedAllTasks"
              :expanded-tasks="expandedTasks"
              @report-selected="handleSelectReport($event)"
            />
          </div>
        </div>
      </div>
      <div v-else>
        <div v-for="(area, i) in task.areasInReports" :key="i" class="pt-1">
          <reports-group
            :type-task="typeTask"
            :reports-selected="reportsSelected"
            :order-id="orderId"
            :task="task"
            :area="area"
            :title="area"
            :for-requirements="false"
            :expanded-all-tasks="expandedAllTasks"
            :expanded-tasks="expandedTasks"
            process-time="Inspection"
            @report-selected="handleSelectReport($event)"
          />
          <div v-for="req in requirementsByArea[area]" :key="req.id">
            <reports-group
              :type-task="typeTask"
              :requirement="req"
              :reports-selected="reportsSelected"
              :order-id="orderId"
              :task="task"
              :title="req.descRequirement"
              :area="area"
              :for-requirements="true"
              :expanded-all-tasks="expandedAllTasks"
              :expanded-tasks="expandedTasks"
              process-time="Inspection"
              @report-selected="handleSelectReport($event)"
            />
          </div>
        </div>
      </div>
    </div>
    <v-divider v-if="expandedAllTasks || expandedTasks"></v-divider>
  </div>
</template>

<script>
import ReportsGroup from './ReportsGroup.vue'
export default {
  name: 'RequirementSection',
  components: { ReportsGroup },
  props: {
    typeTask: { type: String, default: '' },
    reportsSelected: { type: Array, default: () => [] },
    title: { type: String, default: '' },
    task: { type: Object, default: () => ({}) },
    orderId: { type: String, default: '' },
  },
  data() {
    return {
      expandedTasks: false,
      expandedAllTasks: false,
      typesSection: ['Before', 'During', 'After', 'GeneralReports'],
    }
  },
  computed: {
    requirementsFormatted() {
      return {
        Before: this.requirementsFromBefore,
        During: this.requirementsFromDuring,
        After: this.requirementsFromAfter,
        GeneralReports: this.requirementsFromGeneral,
      }
    },
    requirementsFromBefore() {
      if (!this.task.requirements || !this.task.requirements.length) {
        return []
      }
      return this.task.requirements
        .filter((r) => r.fromBefore)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromDuring() {
      if (!this.task.requirements || !this.task.requirements.length) {
        return []
      }
      return this.task.requirements
        .filter((r) => r.fromDuring)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromAfter() {
      if (!this.task.requirements || !this.task.requirements.length) {
        return []
      }
      return this.task.requirements
        .filter((r) => r.fromAfter)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromGeneral() {
      if (!this.task.requirements || !this.task.requirements.length) {
        return []
      }
      return this.task.requirements
        .filter((r) => r.fromGeneral)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromInspection() {
      if (!this.task.requirements || !this.task.requirements.length) {
        return []
      }
      return this.task.requirements
        .filter((r) => r.fromInspection)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsByArea() {
      if (!this.task.areasInReports) {
        return []
      }
      const requirementsByArea = {}
      for (let i = 0; i < this.task.areasInReports.length; i++) {
        const area = this.task.areasInReports[i]
        requirementsByArea[area] = this.requirementsFromInspection.filter(
          (report) => report.inspectionArea === area
        )
      }
      return requirementsByArea
    },
  },
  watch: {
    expandedTasks(val) {
      if (val) {
        this.expandedAllTasks = false
      }
    },
    expandedAllTasks(val) {
      if (val) {
        this.expandedTasks = false
      }
    },
  },
  methods: {
    handleSelectReport(event) {
      this.$emit('report-selected', event)
    },
  },
}
</script>

<style lang="scss" scoped>
.requirements-group {
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms cubic-bezier(0, 1, 0, 1);
  &.expanded {
    max-height: fit-content;
    transition: max-height 500ms ease-in-out;
  }
}
</style>
