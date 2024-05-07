<template>
  <gmap-map
    ref="gmap"
    :center="marker.position"
    :zoom="14"
    map-type-id="roadmap"
    style="width: 400px; height: 400px"
  >
    <gmap-marker
      :position="marker.position"
      :title="marker.title"
      :clickable="clickable"
      :icon="marker.iconMarker"
      :draggable="draggable"
      @click="center = marker.position"
    ></gmap-marker>
  </gmap-map>
</template>
<script>
export default {
  props: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    title: { type: String, default: '' },
    iconMarker: { type: Object, default: () => null },
    clickable: { type: Boolean, default: true },
    draggable: { type: Boolean, default: true },
  },
  data() {
    return {}
  },
  computed: {
    marker() {
      return {
        position: { lat: this.latitude, lng: this.longitude },
        title: this.title,
        iconMarker: this.iconMarker,
      }
    },
  },
}
</script>
