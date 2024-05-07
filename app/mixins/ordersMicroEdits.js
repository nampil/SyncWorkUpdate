export default {
  methods: {
    handleCancelingConfirmModal() {
      this.confirmQuestion = ''
      this.confirmBtnText = ''
      this.ordersSelected = []
      this.showConfirmModal = false
    },

    async microEditOrder(boo) {
      const cleanState = () => {
        this.ordersSelected = []
        this.microEditType = ''
        this.confirmBoo = false
        this.confirmBtnText = ''
        this.confirmQuestion = ''
      }
      this.loading = true

      try {
        const objectTosend = {
          orders: this.ordersSelected,
        }
        objectTosend[this.microEditType] = boo

        const response = await this.$store.dispatch(
          `orders/set_${this.microEditType}_order`,
          objectTosend
        )
        cleanState()
        this.showConfirmModal = false
        this.loading = false
        this.$mainAlertSuccess(response)
      } catch (error) {
        cleanState()
        this.showConfirmModal = false
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
        // eslint-disable-next-line
        console.log('Error updating order: ', error)
      }
    },

    handleArchiveOrder(order) {
      if (order) {
        this.ordersSelected = []
        this.ordersSelected.push(order)
      }
      const _confirmBoo =
        this.ordersSelected.length > 0 && !this.ordersSelected[0].archive

      this.microEditType = 'archive'
      this.confirmBoo = _confirmBoo

      this.confirmBtnText = !_confirmBoo
        ? this.$t('Unarchive')
        : this.$t('Archive')
      this.confirmQuestion =
        this.$t('alertconfirmQuestion') +
        `
      ${!_confirmBoo ? this.$t('unarchive') : this.$t('archive')} ` +
        this.$t('thisOrder')
      this.showConfirmModal = true
    },
    handleSetOnHoldOrder(order) {
      if (order) {
        this.ordersSelected = []
        this.ordersSelected.push(order)
      }
      const _confirmBoo =
        this.ordersSelected.length > 0 && !this.ordersSelected[0].onHold

      this.microEditType = 'onHold'
      this.confirmBoo = _confirmBoo

      this.confirmBtnText = !_confirmBoo
        ? this.$t('RemoveOn-hold')
        : this.$t('SetOn-hold')
      this.confirmQuestion =
        this.$t('alertconfirmQuestion') +
        `
      ${!_confirmBoo ? this.$t('removeOn-hold') : this.$t('setOn-hold')} ` +
        this.$t('thisOrder')
      this.showConfirmModal = true
    },

    handleSetPriorityOrder() {
      this.showPriorityOrderModal = true
    },
    handleSetClientToOrders() {
      this.showSetClientToOrdersModal = true
    },
  },
}
