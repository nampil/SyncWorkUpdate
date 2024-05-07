<template>
  <div class="dispatching-container d-flex flex-column pa-4">
    <register-content class="h-100" />
  </div>
</template>

<script>
import RegisterContent from '@/components/orders/RegisterContent.vue'

export default {
  name: 'DispatchingIndex',
  components: { RegisterContent },
  layout: 'dash',
  data() {
    return {
      tab: null,
      items: ['Register'],
    }
  },
  head() {
    return {
      title: this.$t('dispatching'),
    }
  },

  computed: {
    title() {
      return this.$store.state.title
    },
  },
  mounted() {
    this.$store.commit('setTitle', 'Dispatching')
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.dispatching-container {
  height: 100%;
}

.h-100 {
  height: 100%;
}
</style>
