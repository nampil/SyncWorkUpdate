<template>
  <div class="pa-2 pl-4">
    <span class="text-uppercase text-subtitle-2"> {{ route.groupName }}</span>
    <route-summary
      :route-summary="routeSummaryFormatted"
      :is-drawer="true"
    ></route-summary>
  </div>
</template>

<script>
import RouteSummary from './RouteSummary.vue'
import { ORDER_STATUS } from '@/utils/dictionaries'
export default {
  name: 'RouteSummaryContent',
  components: { RouteSummary },
  props: { route: { type: Object, default: () => ({}) } },
  data() {
    return {}
  },
  computed: {
    statusesOrders() {
      return this.$store.state.oos.orders.statusOrders
    },
    routeSummaryFormatted() {
      let reopen = 0
      let ordersLength = 0
      let RFO = 0
      let incomplete = 0
      const dateToday = new Date()
      const dateActual = this.$formatDate(dateToday, { iso: true })
      let dueTodayOpen = 0
      let pastDueOpen = 0
      let dueTodayOpenCompleted = 0
      let pastDueOpenCompleted = 0
      let dueTomorrow = 0
      let dueTomorrowCompleted = 0
      let partiallyComplete = 0
      const dateTomorrow = this.$formatDate(
        new Date(dateToday.getTime() + 24 * 60 * 60 * 1000),
        { iso: true }
      )
      const validateCompleted = (status) => {
        if (!status) return false
        const _status = status.trim().toLowerCase()
        return (
          _status === ORDER_STATUS.readyForOffice.toLowerCase() ||
          _status === ORDER_STATUS.invoiced.toLowerCase() ||
          _status === ORDER_STATUS.closed.toLowerCase()
        )
      }

      if (this.route.ordersR) {
        const orderResumenList = Object.entries(this.route.ordersR).map(
          ([key, value]) => {
            return {
              ...value,
              id: key,
            }
          }
        )
        ordersLength = orderResumenList.length
        orderResumenList.forEach((order) => {
          if (order.isReopen) {
            reopen++
          }
          if (validateCompleted(order.status)) {
            RFO++
          }
          if (
            order.status?.toLowerCase() ===
              ORDER_STATUS.inactive.toLowerCase() ||
            order.status?.toLowerCase() === 'idle'
          ) {
            incomplete++
          }
          if (order.status?.toLowerCase() === 'partially complete') {
            partiallyComplete++
          }
          if (order.dateDueStr === dateActual) {
            dueTodayOpen++
            if (validateCompleted(order.status)) {
              dueTodayOpenCompleted++
            }
          }
          if (Date.parse(order.dateDueStr) < Date.parse(dateActual)) {
            pastDueOpen++
            if (validateCompleted(order.status)) {
              pastDueOpenCompleted++
            }
          }
          if (order.dateDueStr === dateTomorrow) {
            dueTomorrow++
            if (validateCompleted(order.status)) {
              dueTomorrowCompleted++
            }
          }
        })
      }
      return {
        WO: ordersLength,
        reopen,
        RFO,
        incomplete,
        dueTodayOpen,
        pastDueOpen,
        dueTodayOpenCompleted,
        pastDueOpenCompleted,
        dueTomorrow,
        dueTomorrowCompleted,
        partiallyComplete,
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
