<template>
  <div class="h-100 d-flex flex-column">
    <!-- <Details-toolbar></Details-toolbar> -->
    <NuxtChild></NuxtChild>
  </div>
</template>

<script>
export default {
  name: 'DashIndex',
  components: {},

  layout: 'dash',
  data() {
    return {}
  },
  head() {
    return {
      title: 'Home',
    }
  },
  computed: {
    ordersSelected() {
      return this.$store.state.home.ordersSelected
    },
    orderSelected() {
      return this.$store.state.home.orderSelected
    },
  },

  methods: {},
}
</script>

<style lang="scss" scoped>
.the-quote {
  position: absolute;
  right: 1rem;
  max-width: 250px;
  padding: 1rem 0.75rem 0.75rem;
  font-size: 0.8rem;
  opacity: 0.75;
  border: 1px solid rgba($color: #000000, $alpha: 0.2);
  border-radius: 0.5rem;
  .close {
    position: absolute;
    right: 0.1rem;
    top: 0.1rem;
    svg {
      display: block;
      path {
        fill: currentColor;
      }
    }
  }
  .content {
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .author {
    margin-bottom: 0;
    text-align: right;
    font-style: italic;
  }
}
.fly-enter-active,
.fly-leave-active {
  perspective: 5rem;
  transition: all 400ms ease-in-out;
}
.fly-enter {
  opacity: 0;
  transform: translate(0, -15%);
  box-shadow: 0 0 12px rgba($color: #000000, $alpha: 1);
}
.fly-leave-to {
  opacity: 0;
  transform: translate(0, 15%);
  box-shadow: 0 0 12px rgba($color: #000000, $alpha: 1);
}
</style>
