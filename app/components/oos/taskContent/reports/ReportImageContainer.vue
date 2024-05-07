<template>
  <div
    :class="[
      'img-container | my-4',
      { 'for-reapply': report.markedForReapply },
    ]"
  >
    <img
      class="report-img"
      :src="report.url"
      @dblclick="$emit('show-slide', index)"
      @click.exact="handleReportsSelected()"
      @click.shift.exact="handleReportsSelected($event)"
      @mousemove="zoomHover($event)"
      @mouseleave="zoomLeave($event)"
    />
    <div class="numeration-img ml-1 d-flex align-center">
      <span>{{ index + 1 }}</span>
    </div>

    <div
      v-if="report.placard && report.placard.text"
      class="container-placard | d-flex align-center"
      @mousemove="showEditPlacard = true"
      @mouseleave="showEditPlacard = false"
    >
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <span
            :class="['placard-text | pl-1 pr-1', { 'align-placard': fromOos }]"
            v-bind="attrs"
            v-on="on"
          >
            {{ $truncate(report.placard.text, 13) }}</span
          >
        </template>
        <span>{{ report.placard.text }}</span>
      </v-tooltip>

      <v-tooltip
        v-if="showEditPlacard"
        open-delay="600"
        content-class="small"
        top
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            icon
            x-small
            v-bind="attrs"
            v-on="on"
            @click.stop="handleEditPlacard"
          >
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <span>Edit Placard</span>
      </v-tooltip>
    </div>

    <v-tooltip open-delay="600" content-class="small" top class="">
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          x-small
          :color="selected ? 'primary' : 'white'"
          class="select-btn"
          v-bind="attrs"
          v-on="on"
          @click.exact.stop="handleReportsSelected()"
          @click.shift.exact="handleReportsSelected($event)"
        >
          <v-icon small>{{
            selected ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'
          }}</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('selectReport') }}</span>
    </v-tooltip>

    <v-dialog
      v-model="showEditPlacardModal"
      :overlay="false"
      max-width="500px"
      scrollable
      transition="dialog-transition"
    >
      <edit-placard
        v-if="showEditPlacardModal"
        :from-oos="fromOos"
        :from-bids="fromBids"
        :report="report"
        @update-report="updateReport($event)"
        @close="showEditPlacardModal = false"
      ></edit-placard>
    </v-dialog>
  </div>
</template>

<script>
import EditPlacard from '../placard/EditPlacard.vue'
export default {
  name: 'ReportImageContainer',
  components: { EditPlacard },
  props: {
    index: { type: Number, default: 0 },
    report: { type: Object, default: () => ({}) },
    selected: { type: Boolean, default: false },
    fromBids: { type: Boolean, default: false },
    fromOos: { type: Boolean, default: false },
  },
  data() {
    return {
      showEditPlacard: false,
      showEditPlacardModal: false,
    }
  },
  computed: {},

  methods: {
    zoomHover(event) {
      const elementImg = event.target
      const box = elementImg.getBoundingClientRect()
      const position = JSON.parse(JSON.stringify(box))

      this.$store.commit('set_lupaOptions', { url: this.report.url, position })
      this.$store.commit('set_showLupa', true)
    },
    zoomLeave(event, id) {
      this.$store.commit('set_showLupa', false)
    },
    handleReportsSelected(event) {
      if (event && event.type === 'click') {
        this.$emit('select', { select: !this.selected, shift: true })
      } else {
        this.$emit('select', { select: !this.selected, shift: false })
      }
    },
    handleEditPlacard() {
      this.showEditPlacardModal = true
    },
    updateReport(report) {
      this.$emit('update-report', report)
    },
  },
}
</script>

<style lang="scss" scoped>
.img-container {
  aspect-ratio: 1;
  position: relative;
  &.for-reapply::after {
    content: '';
    background: var(--v-error-base);
    position: absolute;
    inset: 0;
    opacity: 0.75;
    clip-path: polygon(
      10% 0%,
      0% 10%,
      40% 50%,
      0% 90%,
      10% 100%,
      50% 60%,
      89% 100%,
      100% 90%,
      60% 50%,
      100% 10%,
      90% 0%,
      50% 40%
    );
  }
}
.report-img {
  display: block;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}
.container-placard {
  --bgColor: #000;
  position: absolute;
  z-index: 1;
  bottom: 0;

  .placard-text {
    border-radius: 0 0 0 5px;
    background-color: var(--bgColor);
    font-size: 10px;
    color: #fff;
  }
  .align-placard {
    padding: 3px 0px 3px 0px;
  }
}
.numeration-img {
  font-size: 10px;
  font-weight: bold;
  position: absolute;
  color: white;
  cursor: default;
  background-color: #696d6986;
  border-radius: 50%;
  max-height: 17px;
  padding: 0 5px 1px 5px;
  top: 3px;
  z-index: 1;
}
.select-btn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 4;
}
</style>
