<template>
  <v-list>
    <v-subheader class="subtitle-2 mr-2 info--text"
      >Order Reopen History</v-subheader
    >
    <div v-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <v-list-item v-for="(reopen, index) in reopenHistory" :key="index" dense>
      <v-list-item-content>
        <v-list-item-title class="accent--text">{{
          reopen.reopenReason
        }}</v-list-item-title>
        <v-list-item-subtitle class="text--secondary">
          {{ reopen?.reopenBy?.fullName || reopen?.reopenBy || '' }}
          -
          {{ $formatDate(reopen.reopenAt, { time: true }) }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  name: 'ReopenHistory',
  props: {
    orderId: { type: String, required: true },
  },
  data() {
    return {
      reopenHistory: [],
      loading: false,
    }
  },

  mounted() {
    this.getReopenHistory()
  },

  methods: {
    async getReopenHistory() {
      this.loading = true
      try {
        const reopens = await this.$store.dispatch('oos/order/get_reopens', {
          orderId: this.orderId,
        })
        this.reopenHistory = reopens
      } catch (error) {
        // eslint-disable-next-line
        console.error('Error getting reopen history' + error)
        this.$mainAlertError('Error getting reopen history')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
