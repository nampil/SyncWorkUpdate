<template>
  <div class="inspection-view-container">
    <v-expansion-panel>
      <v-expansion-panel-header>
        <div class="d-flex">
          <span class="subtitle-1">{{ inspectionLocal.title }}</span>
          <v-switch
            v-if="reportsCount === 0"
            v-model="active"
            class="mt-0 ml-auto"
            dense
            hide-details="auto"
            inset
            @click="handleActiveInspection()"
          ></v-switch>
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-row>
          <v-col cols="12">
            <span>{{ $t('subAreas') }}</span>

            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="ml-1"
                  color="primary"
                  small
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="handleShowAddAreas()"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
              </template>
              <span>{{ $t('addSubAreas') }}</span>
            </v-tooltip>
            <div
              v-if="inspectionLocal.subAreas && inspectionLocal.subAreas.length"
              class="mt-2 mb-2"
            >
              <div
                v-for="subArea in inspectionLocal.subAreas"
                :key="subArea.id"
              >
                <SubAreasView
                  :sub-area="subArea"
                  :requirements="inspectionLocal.requirements"
                  :task-id="inspectionLocal.id"
                  :task="inspectionLocal"
                  @edit-sub-area="handleShowEditSubArea(subArea)"
                  @delete-sub-area="deleteSubArea(subArea)"
                  @delete-requirement="deleteRequirement($event.requirement)"
                  @update-requirement="updateRequirement($event.requirement)"
                ></SubAreasView>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <v-dialog
      v-model="showAddSubAreas"
      max-width="700px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <AddSubAreas
        v-if="showAddSubAreas"
        :sub-areas="subAreas"
        :sub-areas-in-task="inspectionLocal.subAreas || []"
        @new-sub-areas="addNewSubAreas($event)"
        @update-persistent="validatePersistent = $event"
        @close="showAddSubAreas = false"
      ></AddSubAreas>
    </v-dialog>

    <v-dialog
      v-model="showEditSubArea"
      :overlay="false"
      max-width="700px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <EditSubArea
        v-if="showEditSubArea"
        :edited-area="editedArea"
        :sub-areas="subAreas"
        :sub-areas-in-task="inspectionLocal.subAreas || []"
        @update-sub-area="updateSubArea($event)"
        @update-persistent="validatePersistent = $event"
        @close="showEditSubArea = false"
      ></EditSubArea>
    </v-dialog>
  </div>
</template>

<script>
import AddSubAreas from '../subAreas/AddSubAreas.vue'
import SubAreasView from '../subAreas/SubAreasView.vue'
import EditSubArea from '../subAreas/EditSubArea.vue'
export default {
  name: 'InspectionView',
  components: { AddSubAreas, EditSubArea, SubAreasView },
  props: {
    inspection: { type: Object, default: () => ({}) },
    order: { type: Object, default: () => ({}) },
    inspectionsBd: { type: Array, default: () => [] },
    inspectionsTemplates: { type: Array, default: () => [] },
  },
  data() {
    return {
      expandedTask: false,
      showAddSubAreas: false,
      validatePersistent: false,
      inspectionLocal: {},
      subAreas: [],
      editedArea: {},
      showEditSubArea: false,
      loading: false,
      active: false,
      reportsCount: 0,
    }
  },
  computed: {
    jobTasksTemplatesInState() {
      return this.$store.state.order.jobTasksTemplatesInState
    },
  },
  watch: {
    inspection: {
      handler() {
        this.inspectionLocal = JSON.parse(JSON.stringify(this.inspection))
      },
      deep: true,
    },
  },

  mounted() {
    this.inspectionLocal = JSON.parse(JSON.stringify(this.inspection))

    if (
      !this.inspectionsBd.map((i) => i.title).includes(this.inspection.title)
    ) {
      return
    }

    this.active = true
    const _inspection = this.inspectionsBd.find(
      (task) => task.title === this.inspection.title
    )

    this.inspectionLocal.subAreas =
      _inspection.subAreas && _inspection.subAreas.length
        ? JSON.parse(JSON.stringify(_inspection.subAreas))
        : []

    if (
      !this.inspection.areasInReports ||
      !this.inspection.areasInReports.length
    ) {
      return
    }
    for (let i = 0; i < this.inspection.areasInReports.length; i++) {
      const _area = this.inspection.areasInReports[i]
      const _id =
        '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
      this.inspectionLocal.subAreas.push({ title: _area, id: _id })
    }
    this.getReportsCountAll()
  },

  methods: {
    async initialize(type) {
      this.loading = true
      try {
        const _items = await this.$store.dispatch(
          'order/get_templatesForOrder',
          { type, order: this.order }
        )
        this[type] = _items && _items.length ? [..._items] : []
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleSubAreasInState() {
      if (this.jobTasksTemplatesInState.subAreas) {
        !this.jobTasksTemplatesInState.subAreas.templates ||
        (this.jobTasksTemplatesInState.subAreas.templates &&
          !this.jobTasksTemplatesInState.subAreas.templates.length)
          ? this.initialize('subAreas')
          : (this.subAreas = this.jobTasksTemplatesInState.subAreas.templates)
      }
    },
    handleShowAddAreas() {
      this.handleSubAreasInState()
      this.showAddSubAreas = !this.showAddSubAreas
    },
    handleShowEditSubArea(subArea) {
      this.editedArea = subArea
      this.handleSubAreasInState()
      this.showEditSubArea = true
    },
    addNewSubAreas(newSubAreas) {
      for (let i = 0; i < newSubAreas.length; i++) {
        const subArea = newSubAreas[i]
        this.inspectionLocal.subAreas.push(subArea)
      }

      const isUpdateBd = this.inspectionsBd
        .map((i) => i.title)
        .includes(this.inspection.title)

      const _inspection = this.inspectionsBd.find(
        (i) => i.title === this.inspection.title
      )

      this.$emit('add-sub-areas', {
        updateBd: isUpdateBd,
        inspection: isUpdateBd
          ? { ...this.inspectionLocal, id: _inspection.id }
          : this.inspectionLocal,
      })
    },
    updateSubArea(subArea) {
      const indexOfArea = this.inspectionLocal.subAreas.findIndex(
        (a) => a.id === subArea.id
      )
      if (indexOfArea === -1) return
      this.inspectionLocal.subAreas.splice(indexOfArea, 1, subArea)
      const isUpdateBd = this.inspectionsBd
        .map((i) => i.title)
        .includes(this.inspection.title)

      const _inspection = this.inspectionsBd.find(
        (task) => task.title === this.inspection.title
      )

      this.$emit('update-sub-area', {
        subArea,
        updateBd: isUpdateBd,
        inspection: isUpdateBd
          ? { ...this.inspectionLocal, id: _inspection.id }
          : this.inspectionLocal,
      })
    },
    deleteSubArea(subArea) {
      const indexOfArea = this.inspectionLocal.subAreas.findIndex(
        (a) => a.id === subArea.id
      )
      if (indexOfArea === -1) return
      this.inspectionLocal.subAreas.splice(indexOfArea, 1)
      this.inspectionLocal.areasInReports = this.inspectionLocal.subAreas.map(
        (s) => s.title
      )

      const isDeleteBd = this.inspectionsBd
        .map((i) => i.title)
        .includes(this.inspection.title)

      const _inspection = this.inspectionsBd.find(
        (task) => task.title === this.inspection.title
      )

      this.$emit('delete-sub-area', {
        subArea,
        deleteBd: isDeleteBd,
        inspection: isDeleteBd
          ? {
              ...this.inspectionLocal,
              id: _inspection.id,
            }
          : this.inspectionLocal,
      })
    },
    handleActiveInspection() {
      if (this.active) {
        this.$emit('add-inspection', this.inspectionLocal)
        return
      }
      const isDeleteBd = this.inspectionsBd
        .map((i) => i.title)
        .includes(this.inspection.title)

      const _inspection = this.inspectionsBd.find(
        (task) => task.title === this.inspection.title
      )
      this.$emit('delete-inspection', {
        inspection: isDeleteBd
          ? { ...this.inspectionLocal, id: _inspection.id }
          : this.inspectionLocal,
        deleteBd: isDeleteBd,
      })
    },
    deleteRequirement(req) {
      const indexOfReq = this.inspectionLocal.requirements.findIndex(
        (a) => a.id === req.id
      )
      if (indexOfReq === -1) return
      this.inspectionLocal.requirements.splice(indexOfReq, 1)
      this.$emit('delete-requirement', {
        req,
        inspection: this.inspectionLocal,
      })
    },
    updateRequirement(req) {
      const indexOfReq = this.inspectionLocal.requirements.findIndex(
        (a) => a.id === req.id
      )
      if (indexOfReq === -1) return
      this.inspectionLocal.requirements.splice(indexOfReq, 1, req)
      this.$emit('update-requirement', {
        req,
        inspection: this.inspectionLocal,
      })
    },
    async getReportsCountAll() {
      try {
        this.reportsCount = await this.$store.dispatch(
          'order/get_reportsCount',
          {
            orderId: this.order.id,
            type: this.inspection.type,
            taskId: this.inspection.id,
          }
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting reports count', error)

        this.$mainAlertError('Error trying to get reports count')
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
