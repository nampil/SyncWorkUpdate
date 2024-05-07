<template>
  <div class="task-content">
    <!-- Toolbar -->
    <task-toolbar
      v-if="task"
      :task="task"
      :order-id="orderId"
      :order="order"
      :wo="wo"
      :standalone="false"
      :max-value="maxValue"
    ></task-toolbar>
  </div>
</template>

<script>
import taskToolbar from './taskToolbar.vue'

export default {
  name: 'TaskContent',
  components: {
    taskToolbar,
  },
  props: {
    task: { type: Object, default: () => ({}) },

    orderId: { type: String, default: '' },
    wo: { type: String, default: '' },
    order: { type: Object, default: () => ({}) },
    maxValue: { type: Number, default: Number.POSITIVE_INFINITY },
  },
  data() {
    return {}
  },
}
</script>
<style lang="scss" scoped></style>
