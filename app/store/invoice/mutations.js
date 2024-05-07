export default {
  set_invoice(state, payload) {
    state.invoice = { ...state.invoice, ...payload }
  },
  set_showInvoice(state, payload) {
    state.showInvoice = payload
  },
  set_posX(state, payload) {
    state.posX = payload
  },
  set_posY(state, payload) {
    state.posY = payload
  },
  set_minimize(state, payload) {
    state.minimize = payload
  },

  set_invoiceListener(state, payload) {
    state.invoiceListener = payload
  },

  flush_invoice(state, payload) {
    state.invoice = {
      items: [],
      invoiceNumber: '',
      complete: false,
      completeDate: '',
      completeTime: '',
      completeTimestamp: null,
      sentDate: '',
      sentTime: '',
      sentTimestamp: null,
      discount: 0,
      desc: '',
      completedProcessor: false,
    }
    if (state.invoiceListener) {
      state.invoiceListener()
    }
    state.invoiceListener = null
  },
}
