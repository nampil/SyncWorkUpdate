<template>
  <v-card class="add-task-inpections | d-flex flex-column overflow-hidden">
    <v-toolbar dark color="secondary" class="flex-grow-0" dense>
      <v-btn icon dark @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t('addInspections') }} </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn ref="btnSave" dark text @click.stop="handleSave">
          {{ $t('save') }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-card-text ref="scrollArea" class="pa-8 flex-grow-1 overflow-y-auto">
      <div class="tasks-container | mb-0">
        <v-expansion-panels>
          <v-expansion-panel
            v-for="inspection in inspectionsFormatted"
            :key="inspection.id"
          >
            <inspection-view
              :inspection="inspection"
              :inspections-bd="orderLocal.inspections"
              :order="orderLocal"
              @add-sub-areas="
                handleAddSubAreas($event.updateBd, $event.inspection)
              "
              @update-sub-area="
                handleUpdateSubArea(
                  $event.subArea,
                  $event.updateBd,
                  $event.inspection
                )
              "
              @delete-sub-area="
                handleDeleteSubArea(
                  $event.subArea,
                  $event.deleteBd,
                  $event.inspection
                )
              "
              @add-inspection="handleAddInspection($event)"
              @delete-inspection="
                handleDeleteInspection($event.inspection, $event.deleteBd)
              "
              @delete-requirement="
                handleDeleteRequirement($event.req, $event.inspection)
              "
              @update-requirement="
                handleUpdateRequirement($event.req, $event.inspection)
              "
            ></inspection-view>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-card-text>

    <v-overlay :value="loadingTemplate || loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-card>
</template>
<script>
import InspectionView from './InspectionView.vue'
import { ORDER_STATUS } from '@/utils/dictionaries'
export default {
  name: 'AddTaskInpections',
  components: { InspectionView },
  props: {
    order: { type: Object, default: () => ({}) },
    isSeteado: { type: Boolean, default: false },
  },
  data() {
    return {
      loading: false,
      loadingTemplate: false,
      inspectionsTemplate: [],
      inspectionToSend: [],
      deleteInspections: [],
      updateInspections: [],
      showAddSubAreas: false,
      orderLocal: {},
    }
  },
  computed: {
    jobTasksTemplatesInState() {
      return this.$store.state.order.jobTasksTemplatesInState
    },
    localNeedToSave() {
      if (
        this.inspectionToSend.length ||
        this.deleteInspections.length ||
        this.updateInspections.length
      ) {
        return true
      }
      return false
    },
    inspectionsFormatted() {
      const _inspectionsTemplate = structuredClone(this.inspectionsTemplate)

      if (!this.orderLocal.inspections || !this.orderLocal.inspections.length) {
        return _inspectionsTemplate.sort((a, b) => {
          return a.title > b.title ? 1 : -1
        })
      }
      for (let i = 0; i < this.orderLocal.inspections.length; i++) {
        const _inspection = this.orderLocal.inspections[i]
        const indexOfInsp = _inspectionsTemplate.findIndex(
          (a) => a.title === _inspection.title
        )

        if (indexOfInsp !== -1) {
          _inspectionsTemplate.splice(indexOfInsp, 1, _inspection)
        } else if (!this.loadingTemplate) {
          _inspectionsTemplate.push(_inspection)
        }
      }
      return _inspectionsTemplate.sort((a, b) => {
        return a.title > b.title ? 1 : -1
      })
    },
    tasksLastPosition() {
      const _tasks = this.inspectionToSend.length
        ? this.inspectionToSend
        : this.orderLocal.inspections

      if (!_tasks || !_tasks.length) {
        return 1
      }

      return _tasks[_tasks.length - 1].position + 1
    },
  },
  watch: {
    localNeedToSave: {
      handler(val) {
        this.$emit('update-persistent', val)
        this.$store.commit('set_needToSave', val)
      },
      inmediate: true,
    },
    order: {
      handler(val) {
        this.orderLocal = JSON.parse(JSON.stringify(val))
      },
      inmediate: true,
    },
  },
  mounted() {
    this.orderLocal = JSON.parse(JSON.stringify(this.order))
    const type = 'inspections'
    if (this.jobTasksTemplatesInState[type]) {
      !this.jobTasksTemplatesInState[type].templates ||
      (this.jobTasksTemplatesInState[type].templates &&
        !this.jobTasksTemplatesInState[type].templates.length)
        ? this.getTemplates(type)
        : (this.inspectionsTemplate =
            this.jobTasksTemplatesInState[type].templates)
    }
  },
  methods: {
    async getTemplates(type) {
      try {
        this.loadingTemplate = true
        this.inspectionsTemplate =
          (await this.$store.dispatch('order/get_templatesForOrder', {
            order: this.order,
            type,
          })) || []
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
      } finally {
        this.loadingTemplate = false
      }
    },
    handleAddInspection(inspection) {
      this.inspectionToSend.push({
        ...inspection,
        position: this.tasksLastPosition,
      })
    },
    handleDeleteInspection(inspection, deleteBd) {
      const _index = this.inspectionToSend
        .map((e) => e.id)
        .indexOf(inspection.id)

      if (_index !== -1) {
        this.inspectionToSend.splice(_index, 1)
      }
      if (deleteBd) {
        this.deleteInspections.push(inspection)
      }
      const indexUpdate = this.updateInspections
        .map((e) => e.id)
        .indexOf(inspection.id)

      if (indexUpdate !== -1) {
        this.updateInspections.splice(indexUpdate, 1)
      }
    },
    async handleSave() {
      this.loading = true
      try {
        const jobTasksToSend = this.inspectionToSend.map((task) => {
          const _areasTitle = task.subAreas.map((a) => a.title)
          return {
            title: task.title.trim().replace('/', '-'),
            desc: task.desc,
            type: 'inspections',
            areasInReports: _areasTitle || [],
            position: task.position,
          }
        })

        if (!this.isSeteado) {
          const notifyContractors =
            this.order.status.trim().toLowerCase() ===
            ORDER_STATUS.inField.toLowerCase()
          await this.$store.dispatch('order/add_jobTask', {
            jobTasksToSend,
            order: this.order,
            jobType: 'inspections',
            notifyContractors,
            ...(notifyContractors && {
              contractors: this.order.contractorsUids,
            }),
          })
          this.$mainAlertSuccess(this.$t('taskUpdate'))
        } else {
          this.$emit('add-inspections', jobTasksToSend)
        }

        if (this.updateInspections.length) {
          if (!this.isSeteado) {
            this.handleUpdate()
          }

          this.$emit('update-inspections', this.updateInspections)
        }
        if (this.deleteInspections.length) {
          if (!this.isSeteado) {
            this.handleDelete()
          }
          this.$emit('delete-inspections', this.deleteInspections)
        }
        this.handleClose()
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    async handleDelete() {
      const orderId = this.order.id
      this.loading = true
      try {
        await this.$store.dispatch('order/remove_jobTaskInspections', {
          orderId,
          inspections: this.deleteInspections,
          jobType: 'inspections',
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async handleUpdate() {
      const orderId = this.order.id
      this.loading = true
      try {
        await this.$store.dispatch('order/update_jobTaskInspections', {
          inspections: this.updateInspections,
          orderId,
          jobType: 'inspections',
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleClose() {
      this.loading = false
      this.$emit('update-persistent', false)
      this.$store.commit('set_needToSave', false)
      this.inspectionToSend = []
      this.deleteInspections = []
      this.updateInspections = []
      this.$emit('close')
    },
    handleAddSubAreas(updateBd, inspection) {
      const _index = this.inspectionToSend
        .map((e) => e.id)
        .indexOf(inspection.id)

      if (_index !== -1) {
        this.inspectionToSend.splice(_index, 1, {
          ...inspection,
          position: this.inspectionToSend[_index].position,
        })
      }
      if (updateBd) {
        const indexUpdate = this.updateInspections
          .map((e) => e.id)
          .indexOf(inspection.id)

        if (indexUpdate !== -1) {
          this.updateInspections[indexUpdate] = inspection
        } else {
          this.updateInspections.push({ ...inspection })
        }
      }
    },
    handleUpdateSubArea(subArea, updateBd, inspection) {
      const _index = this.inspectionToSend
        .map((e) => e.id)
        .indexOf(inspection.id)

      if (_index !== -1) {
        const _indexArea = this.inspectionToSend[_index].subAreas
          .map((e) => e.id)
          .indexOf(subArea.id)

        if (_indexArea !== 1) {
          this.inspectionToSend[_index].subAreas.splice(_indexArea, 1, subArea)
        }
      }
      if (updateBd) {
        const indexUpdate = this.updateInspections
          .map((e) => e.id)
          .indexOf(inspection.id)

        if (indexUpdate !== -1) {
          this.updateInspections[indexUpdate] = inspection
        } else {
          this.updateInspections.push({ ...inspection })
        }
      }
    },
    handleDeleteSubArea(subArea, deleteBd, inspection) {
      const _index = this.inspectionToSend
        .map((e) => e.id)
        .indexOf(inspection.id)

      if (_index !== -1) {
        const _indexArea = this.inspectionToSend[_index].subAreas
          .map((e) => e.id)
          .indexOf(subArea.id)

        if (_indexArea !== 1) {
          this.inspectionToSend[_index].subAreas.splice(_indexArea, 1)
        }
      }
      if (deleteBd) {
        const indexUpdate = this.updateInspections
          .map((e) => e.id)
          .indexOf(inspection.id)

        if (indexUpdate !== -1) {
          this.updateInspections[indexUpdate] = inspection
        } else {
          this.updateInspections.push({ ...inspection })
        }
        const indexOfInsp = this.orderLocal.inspections
          .map((e) => e.id)
          .indexOf(inspection.id)

        if (indexOfInsp === -1) {
          return
        }
        this.orderLocal.inspections.splice(indexOfInsp, 1)
        this.orderLocal.inspections.push({ ...inspection })
      }
    },
    handleDeleteRequirement(req, inspection) {
      const indexUpdate = this.updateInspections
        .map((e) => e.id)
        .indexOf(inspection.id)

      if (indexUpdate !== -1) {
        if (this.updateInspections[indexUpdate].requirementsDelete) {
          const reqs = this.updateInspections[
            indexUpdate
          ].requirementsDelete.concat([req])

          this.updateInspections[indexUpdate] = {
            ...inspection,
            requirementsDelete: reqs,
          }
          return
        }

        this.updateInspections[indexUpdate] = {
          ...inspection,
          requirementsDelete: [req],
        }
      } else {
        this.updateInspections.push({
          ...inspection,
          requirementsDelete: [req],
        })
      }
    },
    handleUpdateRequirement(req, inspection) {
      const indexUpdate = this.updateInspections
        .map((e) => e.id)
        .indexOf(inspection.id)

      if (indexUpdate === -1) {
        this.updateInspections.push({
          ...inspection,
          requirementsUpdate: [req],
        })
        return
      }

      if (this.updateInspections[indexUpdate].requirementsUpdate) {
        const _indexReq = this.updateInspections[indexUpdate].requirementsUpdate
          .map((e) => e.id)
          .indexOf(req.id)

        if (_indexReq !== -1) {
          this.updateInspections[indexUpdate].requirementsUpdate.splice(
            _indexReq,
            1,
            req
          )
          return
        }

        const reqs = this.updateInspections[
          indexUpdate
        ].requirementsUpdate.concat([req])

        this.updateInspections[indexUpdate] = {
          ...inspection,
          requirementsUpdate: reqs,
        }
        return
      }
      this.updateInspections[indexUpdate] = {
        ...inspection,
        requirementsUpdate: [req],
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.tasks-container {
  max-width: 900px;
  min-height: 50vh;
  margin-inline: auto;
}
</style>
