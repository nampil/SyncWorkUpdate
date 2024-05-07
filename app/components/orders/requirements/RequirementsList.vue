<template>
  <div
    class="requirement-list"
    @dragenter="
      handleDragenterLeave({ e: $event, enter: true, processTime: processTime })
    "
    @dragleave="
      handleDragenterLeave({
        e: $event,
        enter: false,
        processTime: processTime,
      })
    "
    @dragover="handleDragover"
    @drop="handleDrop"
  >
    <div
      v-for="requirement in requirements"
      :id="requirement.id"
      :key="requirement.id"
      ref="requirements"
      class="mt-2 mb-2"
      draggable="true"
      @dragstart="
        handleDragging({
          event: $event,
          req: requirement,
          dragging: true,
        })
      "
      @dragend="
        handleDragging({ event: $event, req: requirement, dragging: false })
      "
    >
      <requirement-view
        :requirement="requirement"
        :job-type="jobType"
        @apply-autocomplete-requirement="
          applyAutocompleteRequirement(requirement)
        "
        @edit-requirement="editRequirement(requirement)"
        @delete-requirement="deleteRequirement(requirement)"
        @duplicate-requirement="duplicateRequirement(requirement)"
      ></requirement-view>
    </div>
  </div>
</template>

<script>
import RequirementView from './RequirementView.vue'
export default {
  name: 'RequirementList',
  components: { RequirementView },
  props: {
    processTime: { type: String, required: true },
    jobType: { type: String, required: true },
    taskId: { type: [String, Number], default: '' },
    requirements: { type: Array, default: () => [] },
    isTemplate: { type: Boolean, default: false },
  },
  data() {
    return {
      editedRequirement: null,
      isDragging: false,
    }
  },
  methods: {
    applyAutocompleteRequirement(requirement) {
      this.$emit('apply-autocomplete-requirement', {
        taskId: this.taskId,

        reqId: requirement.id,
      })
    },
    duplicateRequirement(requirement) {
      this.$emit('duplicate-requirement', {
        taskId: this.taskId,
        processTime: this.processTime,
        requirement,
      })
    },
    editRequirement(requirement) {
      this.$emit('edit-requirement', {
        taskId: this.taskId,
        processTime: this.processTime,
        reqId: requirement.id,
      })
    },
    deleteRequirement(requirement) {
      this.$emit('delete-requirement', {
        taskId: this.taskId,
        processTime: this.processTime,
        reqId: requirement.id,
      })
    },
    handleDragenterLeave({ e, enter }) {
      if (enter && this.isDragging) {
        e.target.classList.add('dragover')
        return
      }
      e.target.classList.remove('dragover')
    },
    handleDragover(e) {
      e.preventDefault()
    },

    handleDragging({ event, req, dragging }) {
      if (dragging) {
        const data = JSON.stringify({
          reqId: req.id,
        })

        this.isDragging = true
        event.dataTransfer.setData('text/plain', data)
      } else {
        this.isDragging = false
      }
    },
    handleDrop(e) {
      e.preventDefault()
      const { reqId } = JSON.parse(e.dataTransfer.getData('text/plain'))
      const afterElement = this.getDrafAfterElement(e.clientY)

      const afterReq = afterElement?.id
      this.$emit('swap', { reqToMove: reqId, afterReq })
    },

    getDrafAfterElement(y) {
      const requirementsDiv = this.$refs.requirements

      return requirementsDiv.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect()
          const offset = y - box.top - box.height / 2
          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child }
          } else {
            return closest
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element
    },
  },
}
</script>

<style lang="scss" scoped>
.requirement-list {
  &.dragover {
    background-color: var(--v-terciary-base);
  }
}
</style>
