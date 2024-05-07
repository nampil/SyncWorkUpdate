<template>
  <div class="distance-times | d-flex justify-space-between info--text">
    <div v-if="distanceTimes.distance" class="distance">
      {{ distanceTimes.distance }}
    </div>
    <div v-if="distanceTimes.duration" class="time">
      {{ distanceTimes.duration }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'DistanceTimes',
  props: {
    distanceTimes: { type: Object, default: () => ({}) },
  },
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped>
.distance-times {
  font-size: 0.8rem;
}
</style>
