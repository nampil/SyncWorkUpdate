<template>
  <div class="materials-or-tools">
    <span class="text-h6">{{ $t('materialsOrTools') }}</span>
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
          @click="handleShowAddMaterialsOrTools()"
          ><v-icon>mdi-plus-circle</v-icon></v-btn
        >
      </template>
      <span>{{ $t('addMaterialsOrTools') }}</span>
    </v-tooltip>

    <div class="mt-2 mb-2">
      <materials-or-tools-view
        :materials-or-tools="materialsOrTools"
        @edit-material-or-tool="editMaterialOrTool($event)"
        @delete-material-or-tool="deleteMaterialOrTool($event)"
      ></materials-or-tools-view>
    </div>

    <v-dialog
      v-model="showAddMaterialsOrTools"
      :overlay="false"
      max-width="700px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <add-materials-or-tools
        v-if="showAddMaterialsOrTools"
        :materials-or-tools-bd="materialsOrToolsTemplates"
        @new-materials-or-tools="addNewMaterialsOrTools($event)"
        @update-persistent="validatePersistent = $event"
        @close="showAddMaterialsOrTools = false"
      ></add-materials-or-tools>
    </v-dialog>

    <v-dialog
      v-model="showEditMaterialOrTool"
      :overlay="false"
      max-width="700px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <edit-material-or-tool
        v-if="showEditMaterialOrTool"
        :edited-material-or-tool="editedMaterialOrTool"
        :materials-or-tools-bd="materialsOrToolsTemplates"
        @update-persistent="validatePersistent = $event"
        @update-material-or-tool="updateMaterialOrTool($event)"
        @close="showEditMaterialOrTool = false"
      ></edit-material-or-tool>
    </v-dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import AddMaterialsOrTools from './AddMaterialsOrTools.vue'
import EditMaterialOrTool from './EditMaterialOrTool.vue'
import MaterialsOrToolsView from './MaterialsOrToolsView'
const { mapActions } = createNamespacedHelpers('order')
export default {
  name: 'MaterialsOrTools',
  components: {
    AddMaterialsOrTools,
    EditMaterialOrTool,
    MaterialsOrToolsView,
  },
  props: {
    materialsOrToolsProp: { type: Array, default: () => [] },
    taskId: { type: String, required: true },
    // task: { type: Object, default: () => ({}) },
    order: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      showAddMaterialsOrTools: false,
      materialsOrTools: [],
      materialsOrToolsTemplates: [],
      validatePersistent: false,
      localTask: {},
      editedMaterialOrTool: {},
      showEditMaterialOrTool: false,
      deleteMaterialOrToolId: '',
    }
  },
  computed: {
    jobTasksTemplatesInState() {
      return this.$store.state.order.jobTasksTemplatesInState
    },
  },
  watch: {
    materialsOrToolsProp: {
      handler(val) {
        this.materialsOrTools = structuredClone(val)
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    // this.localTask = JSON.parse(JSON.stringify(this.task))
    if (this.jobTasksTemplatesInState.tools) {
      !this.jobTasksTemplatesInState.tools.templates ||
      (this.jobTasksTemplatesInState.tools.templates &&
        !this.jobTasksTemplatesInState.tools.templates.length)
        ? this.getTemplates('tools')
        : (this.materialsOrToolsTemplates =
            this.jobTasksTemplatesInState.tools.templates)
    }
  },
  methods: {
    ...mapActions({
      getTemplatesForOrder: 'get_templatesForOrder',
    }),
    async getTemplates(type) {
      this.loading = true
      try {
        const _items = await this.getTemplatesForOrder({
          type,
          order: this.order,
        })
        this.materialsOrToolsTemplates =
          _items && _items.length ? [..._items] : []
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleShowAddMaterialsOrTools() {
      this.showAddMaterialsOrTools = !this.showAddMaterialsOrTools
    },
    addNewMaterialsOrTools(materialsOrTools) {
      if (materialsOrTools.length) {
        materialsOrTools.forEach((item) => {
          this.materialsOrTools.push(item)
        })
        this.$emit('update-materials', {
          materials: this.materialsOrTools,
          taskId: this.taskId,
        })
      }
    },
    editMaterialOrTool(material) {
      this.editedMaterialOrTool = material
      this.showEditMaterialOrTool = true
    },
    updateMaterialOrTool(event) {
      const indexOfMaterialOrTool = this.materialsOrTools
        .map((m) => m.id)
        .indexOf(event.editId)

      if (indexOfMaterialOrTool > -1) {
        this.materialsOrTools.splice(
          indexOfMaterialOrTool,
          1,
          event.editMaterial
        )
      }
      this.$emit('update-materials', {
        materials: this.materialsOrTools,
        taskId: this.taskId,
      })
    },
    deleteMaterialOrTool(material) {
      const indexOfMaterial = this.materialsOrTools
        .map((m) => m.id)
        .indexOf(material.id)

      if (indexOfMaterial !== -1) {
        this.materialsOrTools.splice(indexOfMaterial, 1)
        if (isNaN(material.id)) {
          this.deleteMaterialOrToolId = material.id
        }
      }
      this.$emit('delete-material', {
        materials: this.materialsOrTools,
        taskId: this.taskId,
        deleteMaterialId: this.deleteMaterialOrToolId,
      })
    },
  },
}
</script>
<style lang="scss" scoped></style>
