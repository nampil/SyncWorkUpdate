<template>
  <div
    ref="divZoom"
    class="container-lupa"
    :style="{ '--x': `${x}px`, '--y': `${y}px` }"
    :class="{ show: showLupa, bottom: atBottom }"
  >
    <img ref="image" :src="lupaOptions.url" />
  </div>
</template>

<script>
export default {
  name: 'Lupa',
  data() {
    return {
      x: 0,
      y: 0,
      atBottom: false,
    }
  },

  computed: {
    showLupa: {
      get() {
        return this.$store.state.showLupa
      },
      set(val) {
        this.$store.commit('set_showLupa', val)
      },
    },

    lupaOptions() {
      return this.$store.state.lupaOptions
    },
  },
  watch: {
    lupaOptions: {
      handler(newVal) {
        if (!newVal || !newVal.position) {
          return
        }
        this.zoomHover()
      },
      deep: true,
    },
  },
  mounted() {},
  methods: {
    zoomHover() {
      // const image = this.$refs.image
      // const x = this.lupaOptions.position.x
      // const y = this.lupaOptions.position.y
      // image.style.transform = `translate3d(-${150 * 1 * x}px,-${
      //   150 * 1.5 * y
      // }px,0px)`
      const parent = this.$parent.$el
      const parentBox = parent.getBoundingClientRect()
      const rightSpace = parentBox.right - this.lupaOptions.position.right
      const bottomSpace = parentBox.bottom - this.lupaOptions.position.bottom
      const gap = 8

      if (rightSpace > 300 + gap) {
        this.x = Math.floor(this.lupaOptions.position.right + gap)
      } else {
        this.x = Math.floor(this.lupaOptions.position.left - gap - 300)
      }

      this.y = Math.floor(this.lupaOptions.position.top - 64)

      this.atBottom = bottomSpace < 300
    },
  },
}
</script>

<style lang="scss" scoped>
.container-lupa {
  display: none;
  position: absolute;
  width: 400px;
  background-color: transparent;
  border: 1px solid rgb(255, 255, 255);
  left: var(--x);
  top: var(--y);
  z-index: 999;
  &.bottom {
    transform: translateY(-100%);
  }
  img {
    object-fit: contain;
    // height: 250%;
    // transform: translate3d(0px, 0px, 0px);
    display: block;
    width: 100%;
    height: auto;
  }
}
.show {
  display: block;
}
</style>
