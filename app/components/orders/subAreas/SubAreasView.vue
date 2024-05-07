<template>
  <div class="container-sub-area-view | mt-2">
    <v-icon size="14" color="grey">mdi-brightness-1 </v-icon>
    <span>{{ subArea.title }}</span>

    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="ml-1"
          icon
          color="primary"
          x-small
          v-bind="attrs"
          v-on="on"
          @click="$emit('edit-sub-area')"
        >
          <v-icon size="17">mdi-text-box-edit-outline</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('editSubArea') }}</span>
    </v-tooltip>
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="mr-2"
          icon
          x-small
          v-bind="attrs"
          v-on="on"
          @click="$emit('delete-sub-area')"
        >
          <v-icon color="error" size="17">mdi-delete</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('deleteSubArea') }}</span>
    </v-tooltip>

    <div
      v-if="requirementsFromSubArea && requirementsFromSubArea.length"
      class="ml-4 mt-2"
    >
      <span class="info--text">Requirements</span>
      <requirements-list
        :requirements="requirementsFromSubArea"
        job-type="inspections"
        process-time="inspection"
        :task-id="taskId"
        @delete-requirement="deleteRequirement"
        @edit-requirement="editRequirement"
        @swap="handleSwapRequirements($event)"
      />
    </div>

    <v-dialog
      v-model="showEditRequirement"
      :overlay="false"
      max-width="900px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <edit-requirement
        v-if="showEditRequirement"
        :need-process="false"
        task-type="inspections"
        :edited-requirement="editedRequirement"
        @update-persistent="validatePersistent = $event"
        @close="showEditRequirement = !showEditRequirement"
        @update-requirement="updateRequirement($event)"
      >
      </edit-requirement>
    </v-dialog>
  </div>
</template>

<script>
import RequirementsList from '../requirements/RequirementsList.vue'
import EditRequirement from '../requirements/EditRequirement.vue'
export default {
  name: 'SubAreaView',
  components: { RequirementsList, EditRequirement },
  props: {
    subArea: { type: Object, default: () => ({}) },
    requirements: { type: Array, default: () => [] },
    taskId: { type: String, default: '' },
    task: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      requirementsLocal: [],
      editedRequirement: {},
      showEditRequirement: false,
      validatePersistent: false,
    }
  },
  computed: {
    requirementsFromSubArea() {
      return this.requirementsLocal
        .filter((req) => req.inspectionArea === this.subArea.title)
        .map((r) => {
          return {
            ...r,
          }
        })
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
  },
  mounted() {
    this.requirementsLocal = JSON.parse(JSON.stringify(this.requirements))
  },

  methods: {
    deleteRequirement({ reqId }) {
      const indexToDelete = this.requirementsLocal.findIndex(
        (r) => r.id === reqId
      )
      if (indexToDelete === -1) return
      const _req = this.requirementsLocal[indexToDelete]
      this.requirementsLocal.splice(indexToDelete, 1)
      const _requirements = this.requirementsLocal
        .filter((req) => req.inspectionArea === this.subArea.title)
        .sort((a, b) => (a.position > b.position ? 1 : -1))

      _requirements.forEach((req, i) => {
        const idx = this.requirementsLocal.findIndex((r) => r.id === req.id)
        if (idx > -1) {
          this.requirementsLocal[idx].position = i + 1
        }
      })
      this.$emit('delete-requirement', {
        requirement: _req,
      })
    },
    editRequirement({ reqId }) {
      const req = this.requirementsLocal.find((r) => r.id === reqId)
      this.editedRequirement = req
      this.showEditRequirement = !this.showEditRequirement
    },
    updateRequirement(req) {
      const indexToUpdate = this.requirementsLocal.findIndex(
        (r) => r.id === req.id
      )
      if (indexToUpdate === -1) return
      this.requirementsLocal.splice(indexToUpdate, 1, req)
      this.$emit('update-requirement', {
        requirement: req,
      })
    },
    handleSwapRequirements(e) {
      const { reqToMove, afterReq } = e
      if (reqToMove === afterReq) return
      let _requirements = []
      _requirements = this.requirementsLocal
        .filter((req) => req.fromInspection)
        .sort((a, b) => (a.position > b.position ? 1 : -1))

      const _reqIdx = _requirements.findIndex((req) => req.id === reqToMove)
      const _req = _requirements[_reqIdx]
      _requirements.splice(_reqIdx, 1)

      if (!afterReq) {
        _requirements.push(_req)
      } else {
        const idxToInsert = _requirements.findIndex(
          (req) => req.id === afterReq
        )
        _requirements.splice(idxToInsert, 0, _req)
      }

      this.setRequerimentsPosition(_requirements)

      const indexToUpdateToMove = _requirements.findIndex(
        (r) => r.id === reqToMove
      )
      if (indexToUpdateToMove !== -1) {
        this.updateRequirement(_requirements[indexToUpdateToMove])
      }
      const indexToUpdateAfter = _requirements.findIndex(
        (r) => r.id === afterReq
      )
      if (indexToUpdateAfter !== -1) {
        this.updateRequirement(_requirements[indexToUpdateAfter])
      }
    },
    setRequerimentsPosition(requirements) {
      requirements.forEach((req, i) => {
        if (req) {
          req.position = i + 1
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped></style>
