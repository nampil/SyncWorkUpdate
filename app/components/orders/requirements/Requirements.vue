<template>
  <div v-if="itemsFormatted" class="requirements">
    <div v-for="(item, j) in itemsFormatted" :key="j">
      <div class="">
        <div class="requirement-section-header | d-flex gap-16 align-center">
          <span class="text-subtitle-1 | info--text">{{ item }}</span>
          <div class="actions | d-flex gap-8 align-center">
            <v-tooltip
              v-if="
                requirementsFormatted?.[localTask.id]?.[item]?.some(
                  (req) => req.markForAutocomplete
                )
              "
              open-delay="600"
              content-class="small"
              top
            >
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  small
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="
                    applyAutocompleteRequirement({
                      reqsList: requirementsFormatted[localTask.id][item],
                    })
                  "
                  ><v-icon>mdi-plus-circle-multiple-outline</v-icon></v-btn
                >
              </template>
              <span>{{
                `Apply auto-reapeat to all requirements for ${item}`
              }}</span>
            </v-tooltip>
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  small
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="handleShowRequirements(true, 'add', item)"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
              </template>
              <span>{{ $t('addRequirements') }}</span>
            </v-tooltip>
          </div>
        </div>

        <requirements-list
          v-if="requirementsFormatted?.[localTask.id]?.[item]?.length"
          :requirements="requirementsFormatted[localTask.id][item]"
          :job-type="jobType.type"
          :task-id="localTask.id"
          :process-time="item"
          @apply-autocomplete-requirement="applyAutocompleteRequirement"
          @delete-requirement="
            deleteRequirement($event.processTime, $event.reqId)
          "
          @edit-requirement="editRequirement($event.processTime, $event.reqId)"
          @duplicate-requirement="$emit('duplicate-requirement', $event)"
          @swap="
            handleSwapRequirements({
              e: $event,
              processTime: item,
            })
          "
        />
      </div>
    </div>

    <v-dialog
      v-model="showAddRequirements"
      :overlay="false"
      max-width="900px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <add-requirements
        v-if="showAddRequirements"
        :need-process="task?.needProcessTimes"
        :last-positions-req="lastPositionReq[task.id]"
        :type="typeRequirementSelected"
        @update-persistent="validatePersistent = $event"
        @close-requirements="handleShowRequirements(false, 'add')"
        @new-requirements="addNewRequirements($event)"
      >
      </add-requirements>
    </v-dialog>

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
        :need-process="task?.needProcessTimes"
        :task-type="task?.type"
        :edited-requirement="editedRequirement"
        :last-positions-req="lastPositionReq[task.id]"
        @update-persistent="validatePersistent = $event"
        @close="handleShowRequirements(false, 'edit')"
        @update-requirement="updateRequirement($event)"
      >
      </edit-requirement>
    </v-dialog>

    <v-dialog
      v-model="showApplyAutocompleteRequirement"
      scrollable
      max-width="900px"
      transition="dialog-transition"
    >
      <apply-autocomplete-requirement-modal
        :requirements="requirementsForApplyAutocomplete"
        :is-solo="requirementsForApplyAutocomplete.length === 1"
        @close="handleRequirementForApplyAutocomplete"
      />
    </v-dialog>
  </div>
</template>

<script>
import RequirementsList from './RequirementsList.vue'
import AddRequirements from './AddRequirements.vue'
import EditRequirement from './EditRequirement.vue'
import ApplyAutocompleteRequirementModal from './ApplyAutocompleteRequirementModal.vue'
export default {
  name: 'Requirements',
  components: {
    RequirementsList,
    AddRequirements,
    EditRequirement,
    ApplyAutocompleteRequirementModal,
  },
  props: {
    task: { type: Object, default: () => ({}) },
    order: { type: Object, default: () => ({}) },
    jobType: { type: Object, default: () => ({}) },
    requirementsFormatted: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      items: ['General', 'Before', 'During', 'After'],
      localTask: {},
      localRequirements: [],
      validatePersistent: false,
      showAddRequirements: false,
      typeRequirementSelected: '',
      showEditRequirement: false,
      editedRequirement: null,
      deleteRequirementId: '',
      showApplyAutocompleteRequirement: false,
      requirementsForApplyAutocomplete: [],
    }
  },
  computed: {
    itemsFormatted() {
      if (this.task && this.task.needProcessTimes) {
        return this.items.filter((i) => i !== 'General')
      }
      return ['General']
    },
    lastPositionReq() {
      const _lastPositionReq = {}

      for (const taskId in this.requirementsFormatted) {
        _lastPositionReq[taskId] = {}
        for (const type in this.requirementsFormatted[taskId]) {
          _lastPositionReq[taskId][type] =
            this.requirementsFormatted[taskId][type][
              this.requirementsFormatted[taskId][type].length - 1
            ]?.position || 1
        }
      }
      return _lastPositionReq
    },
  },
  watch: {
    task: {
      handler(val) {
        this.localTask = {
          ...val,
          requirements: val.requirements
            ? val.requirements.map((req) => ({
                ...req,
                pictures: req.pictures ? [...req.pictures] : [],
              }))
            : [],
        }
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {},
  methods: {
    handleDuplicateRequirement({ taskId, processTime, reqId }) {
      const idxToSplice = this.localTask.requirements.findIndex(
        (_req) => _req.id === reqId
      )

      const req = this.localTask.requirements[idxToSplice]

      const descRequirement = req.descRequirement.trim() + ' (copy)'
      const id =
        'localReq' +
        new Date().getTime() +
        Math.floor(1000 + Math.random() * 9000)

      const pictures = req.pictures?.length ? [...req.pictures] : []

      const newReq = {
        ...req,
        id,
        position: req.position + 1,
        isDuplicated: true,
        originReqId: req.id,
        descRequirement,
        files: req.files?.length ? [...req.files] : [],
        pictures,
      }

      this.localTask.requirements.splice(idxToSplice + 1, 0, newReq)

      // this.setRequerimentsPosition(this.localTask.requirements)
    },
    handleRequirementForApplyAutocomplete(requirementsForAutocomplete) {
      this.showApplyAutocompleteRequirement = false
      if (!requirementsForAutocomplete) return

      let originalReqIdx = -1

      requirementsForAutocomplete.forEach((req, idx) => {
        const idxToSplice = this.localTask.requirements.findIndex(
          (_req) => _req.id === req.id
        )

        if (idxToSplice > -1) {
          originalReqIdx = idxToSplice
          // eslint-disable-next-line
          console.log('originalReqIdx', originalReqIdx)
          this.localTask.requirements.splice(idxToSplice, 1, req)
        } else if (originalReqIdx > -1) {
          this.localTask.requirements.splice(originalReqIdx + idx, 0, req)
        }
      })

      this.$emit('update-requirements', {
        requirements: this.localTask.requirements,
        taskId: this.task.id,
      })
    },
    handleShowRequirements(showModal, AddOrEdit, type) {
      if (showModal) {
        this.typeRequirementSelected = type
      }
      AddOrEdit === 'add'
        ? (this.showAddRequirements = showModal)
        : (this.showEditRequirement = showModal)
    },
    addNewRequirements(newRequirementsList) {
      newRequirementsList.forEach((req) => {
        this.localTask.requirements.push(req)
      })
      this.$emit('update-requirements', {
        requirements: this.localTask.requirements,
        taskId: this.task.id,
      })
    },
    editRequirement(processTime, reqId) {
      const requirements = this.requirementsFormatted[this.task.id][processTime]
      const req = requirements.find((r) => r.id === reqId)
      this.editedRequirement = req

      this.handleShowRequirements(true, 'edit')
    },

    updateRequirement(newRequirement) {
      const indexOfRequirement = this.localTask.requirements
        .map((o) => o.id)
        .indexOf(newRequirement.id)

      if (indexOfRequirement > -1) {
        const { type, ...newItem } = newRequirement

        this.localTask.requirements.splice(indexOfRequirement, 1, newItem)
      }

      this.$emit('update-requirements', {
        requirements: this.localTask.requirements,
        taskId: this.task.id,
      })
    },
    applyAutocompleteRequirement({ reqId, reqsList }) {
      if (!reqId && !reqsList) return

      if (reqId) {
        const idx = this.localTask.requirements.findIndex((r) => r.id === reqId)
        if (idx === -1) return

        this.requirementsForApplyAutocomplete = [
          this.localTask.requirements[idx],
        ]
      }
      if (reqsList) {
        this.requirementsForApplyAutocomplete = [...reqsList]
      }

      this.showApplyAutocompleteRequirement = true
    },
    deleteRequirement(processTime, reqId) {
      const fromTimeProcess = `from${processTime}`
      const indexToDelete = this.localTask.requirements.findIndex(
        (r) => r.id === reqId
      )
      if (indexToDelete === -1) return

      this.localTask.requirements.splice(indexToDelete, 1)
      const _requirements = this.localTask.requirements
        .filter((r) => r[fromTimeProcess])
        .sort((a, b) => (a.position > b.position ? 1 : -1))

      _requirements.forEach((req, i) => {
        const idx = this.localTask.requirements.findIndex(
          (r) => r.id === req.id
        )
        if (idx > -1) {
          this.localTask.requirements[idx].position = i + 1
        }
      })
      this.deleteRequirementId = reqId
      this.$emit('delete-requirement', {
        deleteRequirementId: this.deleteRequirementId,
        requirements: this.localTask.requirements,
        taskId: this.task.id,
      })
    },
    handleSwapRequirements({ e, processTime }) {
      const { reqToMove, afterReq } = e
      if (reqToMove === afterReq) return

      const task = this.localTask
      const { requirements } = task
      let _requirements = []
      const typeProperty = `from${processTime}`

      _requirements = requirements
        .filter((req) => req[typeProperty])
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
      this.$emit('update-requirements', {
        requirements: this.localTask.requirements,
        taskId: this.task.id,
      })
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
<style lang="scss" scoped>
.sub-title {
  font-size: 1rem;
}
</style>
