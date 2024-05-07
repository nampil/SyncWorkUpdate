export default (_, inject) => {
  function getPropertyId(order) {
    if (!order) {
      return
    }

    const propertyIdRaw =
      '' +
      (order.address || '') +
      (order.city || '') +
      (order.state || '') +
      (order.zip || '')

    const propertyId = propertyIdRaw.trim().split(' ').join('').toLowerCase()
    return propertyId
  }

  inject('getPropertyId', (order) => getPropertyId(order))
}
