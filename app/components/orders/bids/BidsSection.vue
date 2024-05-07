<template>
  <div class="bids-section | mt-2">
    <span class="text-subtitle-1 font-weight-bold pl-3 info--text">Bids</span>

    <div v-for="bid in bids" :key="bid.id">
      <BidsReportsSection
        :bid="bid"
        :order-id="orderId"
        :reports-selected="reportsSelected"
        @report-selected="handleSelectReport($event)"
      />
    </div>

    <v-divider></v-divider>
  </div>
</template>

<script>
import BidsReportsSection from './BidsReportsSection.vue'
export default {
  name: 'BidsSection',
  components: { BidsReportsSection },
  props: {
    bids: { type: Array, default: () => [] },
    orderId: { type: String, required: true },
    reportsSelected: { type: Array, default: () => [] },
  },
  data() {
    return {
      expandedTasks: false,
      expandedAllTasks: false,
    }
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
