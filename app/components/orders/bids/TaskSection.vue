<template>
  <div v-if="order[typeTask]?.length" class="task-section-container mt-2">
    <span class="text-subtitle-1 font-weight-bold pl-3 info--text">
      {{ $t(typeTask) }}</span
    >
    <div v-for="task in order[typeTask]" :key="task.id">
      <RequirementSection
        :type-task="typeTask"
        :title="task.title"
        :reports-selected="reportsSelected"
        :task="task"
        :order-id="order.id"
        @report-selected="handleSelectReport($event)"
      />
    </div>
    <v-divider class="mt-2"></v-divider>
  </div>
</template>

<script>
import RequirementSection from './RequirementSection.vue'
export default {
  name: 'TaskSection',
  components: { RequirementSection },
  props: {
    typeTask: { type: String, default: '' },
    reportsSelected: { type: Array, default: () => [] },
    order: { type: Object, default: () => ({}) },
  },
  data() {
    return {}
  },
  computed: {},

  methods: {
    handleSelectReport(event) {
      this.$emit('report-selected', event)
    },
  },
}
</script>

<style lang="scss" scoped></style>
