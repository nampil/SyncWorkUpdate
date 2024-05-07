<template>
  <div class="sumary-container">
    <div :class="['d-flex', `${!isDrawer ? 'pt-3' : 'pt-1'}`]">
      <span class="d-flex flex-column mr-10">
        <span class="title-summary">WO</span>
        <span class="result-sumary">
          {{ routeSummary.WO }}
        </span>
      </span>
      <span class="d-flex flex-column mr-10">
        <v-tooltip open-delay="600" content-class="small" right>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <span class="title-summary" v-bind="attrs" v-on="on">RFO</span>
          </template>
          <span>Ready for Office</span>
        </v-tooltip>
        <span class="result-sumary success--text">{{ routeSummary.RFO }} </span>
      </span>
      <span class="d-flex flex-column mr-10">
        <v-tooltip open-delay="600" content-class="small" right>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <span class="title-summary" v-bind="attrs" v-on="on">PDO</span>
          </template>
          <span>Past Due Open</span>
        </v-tooltip>

        <span class="result-sumary"
          >{{ routeSummary.pastDueOpenCompleted }} of
          {{ routeSummary.pastDueOpen }}</span
        >
      </span>

      <span class="d-flex flex-column mr-10">
        <v-tooltip open-delay="600" content-class="small" right>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <span class="title-summary" v-bind="attrs" v-on="on">DTO</span>
          </template>
          <span>Due Today Open</span>
        </v-tooltip>
        <span class="result-sumary"
          >{{ routeSummary.dueTodayOpenCompleted }} of
          {{ routeSummary.dueTodayOpen }}</span
        >
      </span>

      <span class="d-flex flex-column">
        <v-tooltip open-delay="600" content-class="small" right>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <span class="title-summary" v-bind="attrs" v-on="on">DT</span>
          </template>
          <span>Due Tomorrow</span>
        </v-tooltip>
        <span class="result-sumary"
          >{{ routeSummary.dueTomorrowCompleted }} of
          {{ routeSummary.dueTomorrow }}</span
        >
      </span>

      <v-spacer></v-spacer>

      <v-btn
        v-if="!isDrawer"
        x-small
        icon
        color="primary"
        class="ml-1"
        @click="expanded = !expanded"
        ><v-icon size="20">{{
          expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'
        }}</v-icon></v-btn
      >
    </div>

    <div
      :class="[
        'summary-content d-flex text-caption',
        { expanded: expanded || isDrawer },
        `${isDrawer ? 'pt-1' : ''}`,
      ]"
    >
      <span class="d-flex flex-column mr-11">
        <v-tooltip open-delay="600" content-class="small" right>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <span class="title-summary" v-bind="attrs" v-on="on">RO</span>
          </template>
          <span> Reopen </span>
        </v-tooltip>
        <span class="result-sumary">{{ routeSummary.reopen }}</span>
      </span>

      <span class="d-flex flex-column mr-12">
        <v-tooltip open-delay="600" content-class="small" right>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <span class="title-summary" v-bind="attrs" v-on="on">PC</span>
          </template>
          <span>Partially Complete</span>
        </v-tooltip>
        <span class="result-sumary">{{ routeSummary.partiallyComplete }}</span>
      </span>

      <span class="d-flex flex-column">
        <v-tooltip open-delay="600" content-class="small" right>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <span class="title-summary" v-bind="attrs" v-on="on">INC</span>
          </template>
          <span>Incomplete</span>
        </v-tooltip>
        <span class="result-sumary error--text">{{
          routeSummary.incomplete
        }}</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    routeSummary: { type: Object, default: () => {} },
    isDrawer: { type: Boolean, default: false },
  },
  data() {
    return { expanded: false }
  },
}
</script>

<style lang="scss" scoped>
.title-summary {
  font-size: 0.7rem;
  color: var(--v-info_stops-base);
}
.result-sumary {
  font-size: 0.8rem;
  // font-weight: bold;
}
.summary-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms cubic-bezier(0, 1, 0, 1);
  &.expanded {
    max-height: 1000px;
    transition: max-height 500ms ease-in-out;
  }
}
</style>
