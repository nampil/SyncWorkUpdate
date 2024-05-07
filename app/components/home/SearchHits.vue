<template>
  <ul v-if="state" class="list | h-100 overflow-y-auto">
    <li class="headers-list-item">
      <slot name="hits-header" :hits="state?.hits"></slot>
    </li>

    <li
      v-for="(hit, index) in hitsTransformed"
      :key="hit.objectID"
      class="hit-item pa-0"
    >
      <slot name="item" :item="hit" :index="index"> </slot>
    </li>
    <li v-observe-visibility="visibilityChanged" class="sentinel" />
  </ul>
</template>

<script>
import { createWidgetMixin } from 'vue-instantsearch'
import { connectInfiniteHits } from 'instantsearch.js/es/connectors'
import { ObserveVisibility } from 'vue-observe-visibility'
export default {
  name: 'SearchHits',
  directives: {
    ObserveVisibility,
  },
  mixins: [createWidgetMixin({ connector: connectInfiniteHits })],
  computed: {
    hitsTransformed() {
      if (!this.state?.hits) return []
      return this.state.hits.map((hit) => ({
        ...hit,
        contractors: hit.contractors.map((c) => c.fullName).join(', '),
      }))
    },
  },
  methods: {
    visibilityChanged(isVisible, e) {
      if (isVisible && !this.state.isLastPage) {
        this.state.showMore()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.headers-list-item {
  padding: 0;
  z-index: 1;
  position: sticky;
  top: 0;
}
</style>
