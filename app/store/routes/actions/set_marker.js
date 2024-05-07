export function set_marker({ state, commit }, { res, order, nextLabel }) {
  const google = state.google
  if (!res || !res.results[0]) {
    if (res.status === 'ZERO_RESULTS') {
      alert(
        `The WO# ${order.woNumber} address does not have result in google map`
      )

      commit('update_baseOrder', {
        orderId: order.id,
        objectToUpdate: { noAddressResults: true },
      })
    }

    return null
  }
  const location = res.results[0].geometry.location

  commit('update_baseOrder', {
    orderId: order.id,
    objectToUpdate: { label: nextLabel },
  })
  const pinColor = this.$getCategoryColor({
    category: order.category,
    hex: true,
  })

  const title = `${order.address}, ${order.county} \n ${order.city}, ${order.zip} \n ${order.workType} - ${order.category}`
  const pinSVGFilled =
    'M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z'
  const labelOriginFilled = new google.maps.Point(12, 9)

  const label = {
    text: `${nextLabel}`,
    color: 'white',
    fontSize: '16px',
  }

  const markerImage = {
    // https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerLabel
    path: pinSVGFilled,
    anchor: new google.maps.Point(12, 17),
    fillOpacity: 1,
    fillColor: pinColor,
    strokeWeight: 2,
    strokeColor: 'black',
    scale: 2,
    labelOrigin: labelOriginFilled,
  }

  const marker = {
    position: location,
    id: order.id,
    orderId: order.id,
    map: null,
    title,
    label,
    optimized: true,
    icon: markerImage,
    animation: google.maps.Animation.DROP,
  }

  commit('add_marker', marker)
}
