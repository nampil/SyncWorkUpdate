export default () => ({
  invoice: {
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
  },
  invoiceListener: null,
  showInvoice: false,
  posX: 0,
  posY: 0,
  minimize: false,
})