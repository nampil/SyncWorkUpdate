<template>
  <v-list two-line dense>
    <v-subheader class="subtitle-2 mr-2 info--text"
      >Order Status History</v-subheader
    >
    <div v-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else>
      <v-list-item
        v-for="(status, index) in statusesFormatted"
        :key="index"
        dense
      >
        <v-list-item-content>
          <v-list-item-title class="accent--text">{{
            status.title
          }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ status?.createdBy?.fullName || status?.createdBy || '' }}
            -
            {{ status.createdAt }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <div
        v-if="orderStatusHistory.length >= 10 && !noMoreData"
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
        <v-progress-circular color="info" indeterminate></v-progress-circular>
      </div>
    </div>
  </v-list>
</template>
``

<script>
export default {
  name: 'OrderStatusHistory',
  props: {
    orderId: { type: String, default: '' },
  },
  data() {
    return {
      orderStatusHistory: [],
      loading: false,
      noMoreData: false,
    }
  },
  computed: {
    users() {
      return this.$store.state.auth.users
    },
    statusesFormatted() {
      if (!this.orderStatusHistory.length) {
        return []
      }

      const _statuses = this.orderStatusHistory.map((s) => {
        let _createdBy = null

        if (this.users.length) {
          _createdBy = this.users.find((u) => u.uid === s.createdBy)
        }
        return {
          ...s,
          createdBy: _createdBy || s.createdBy,
          createdAt: this.$formatDate(s.createdAt, {
            time: true,
          }),
        }
      })
      return _statuses
    },
  },
  mounted() {
    this.getOrderStatusHistory()
  },
  methods: {
    handleSeeMore(entries, observer) {
      if (this.noMoreData) {
        observer.unobserve(entries[0].target)
        return
      }

      const isIntersecting = entries[0].intersectionRatio >= 0.5

      if (isIntersecting) {
        this.$nextTick(() => {
          this.getOrderStatusHistory(
            this.orderStatusHistory[this.orderStatusHistory.length - 1]
              ?.createdAt
          )
        })
      }
    },
    async getOrderStatusHistory(lastStatus = null) {
      try {
        if (this.noMoreData) return
        if (this.loading) return
        if (!lastStatus) {
          this.loading = true
        }

        // eslint-disable-next-line
        console.log('lastStatusId', lastStatus)

        const { statusHistory, noMoreData } = await this.$store.dispatch(
          'oos/order/get_orderStatusHistory',
          { orderId: this.orderId, lastStatus }
        )
        this.orderStatusHistory.push(...statusHistory)
        this.noMoreData = noMoreData
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(
          `Error getting order status history: ${JSON.stringify(error)}`
        )
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
