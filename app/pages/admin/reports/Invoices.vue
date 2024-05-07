<template>
  <div class="h-100">
    <TableInvoices></TableInvoices>
  </div>
</template>

<script>
import TableInvoices from '~/components/admin/reports/TableInvoices.vue'
export default {
  name: 'InvoiceReports',
  components: { TableInvoices },
}
</script>

<style lang="scss" scoped></style>
