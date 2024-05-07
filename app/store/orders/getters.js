export default {
  get_order_by_id: (state) => (id) => {
    return state.orders.find((order) => order.id === id)
  },
}
