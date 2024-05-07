<template>
  <div class="winterizations-templates">
    <v-data-table
      :headers="headers"
      :items="winterizations"
      fixed-header
      class="elevation-1"
      :items-per-page="15"
      :loading="loading"
      :search="search"
      dense
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:top>
        <v-toolbar flat dense dark color="secondary">
          <v-toolbar-title>Winterizations Templates</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <div class="search-box | d-flex align-center gap-8 mr-4">
            <transition>
              <div v-if="showSearch" class="search-input-wrapper">
                <v-text-field
                  ref="searchInput"
                  v-model="search"
                  :label="$t('search')"
                  hide-details
                  dense
                  outlined
                ></v-text-field>
              </div>
            </transition>
            <v-btn color="primary" icon @click="handleShowSearch"
              ><v-icon>mdi-magnify</v-icon></v-btn
            >
          </div>

          <v-btn small color="primary" @click="handleShowAddWorksToDo">
            {{ $t('add') }}
          </v-btn>
        </v-toolbar>
      </template>
      <!-- eslint-disable-next-line -->
      <template v-slot:item.actions="{ item }">
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              x-small
              class="mr-2"
              v-bind="attrs"
              v-on="on"
              @click="editItem(item)"
            >
              <v-icon small color="secondary"> mdi-pencil </v-icon>
            </v-btn>
          </template>
          <span>Edit Winterization</span>
        </v-tooltip>
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              x-small
              v-bind="attrs"
              v-on="on"
              @click="deleteItem(item)"
            >
              <v-icon small color="red"> mdi-delete </v-icon>
            </v-btn>
          </template>
          <span>Delete Winterization</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <add-task-template
      :show="showAddWorksToDo"
      :item-to-edit="editedItem"
      :form-title="formTitle"
      task-type="winterization"
      @close="handleClose"
    />

    <DialogDelete
      :show="dialogDelete"
      :loading="loading"
      @close-delete="closeDelete"
      @delete-item-confirm="deleteItemConfirm"
    />
  </div>
</template>

<script>
import AddTaskTemplate from './AddTaskTemplate.vue'
import DialogDelete from '~/components/admin/templates/dialogs/DialogDelete'

export default {
  name: 'WinterizationsTemplatesComp',
  components: {
    AddTaskTemplate,
    DialogDelete,
  },

  data() {
    return {
      showSearch: false,
      search: '',
      dialogDelete: false,
      loading: false,
      headers: [
        {
          text: this.$t('title'),
          align: 'start',
          value: 'title',
          width: '30%',
        },
        { text: this.$t('client'), value: 'client' },
        { text: this.$t('loanTypes'), value: 'loanTypes' },
        { text: this.$t('active'), value: 'active' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],

      editedIndex: -1,
      editedItem: null,
      defaultItem: {
        title: '',
        desc: '',
        needProcessTimes: true,
        active: true,
        pictures: [],
        itemsForInvoices: [],
        requirements: [],
        materialsOrTools: [],
        clients: [{ client: '', loanTypes: [], id: null }],
      },
      showAddWorksToDo: false,
    }
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? 'New Winterization Template'
        : 'Edit Winterization Template'
    },
    winterizations() {
      return this.$store.state.admin.winterizationTemplates.winterizations
    },
  },
  watch: {
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  created() {
    this.initialize()
  },
  methods: {
    async initialize() {
      const _type = 'winterization'
      this.loading = true
      try {
        await this.$store.dispatch('admin/orders/get_tasks_templates', _type)

        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleShowSearch() {
      if (this.showSearch) {
        this.search = ''
        this.showSearch = false
        return
      }
      this.search = ''
      this.showSearch = true

      this.$nextTick(() => {
        this.$refs.searchInput.focus()
      })
    },
    validateRequirements() {
      const requi = this.editedItem.requirements.map((e) => {
        const { type, ...newRequirements } = e
        return newRequirements
      })
      return this._.isEqual(requi, this.requirementsBase)
    },
    async editItem(item) {
      this.loading = true
      try {
        this.loading = true
        const _requirements = await this.$store.dispatch(
          'admin/orders/get_requirementsForTemplate',
          { type: 'winterization', templateId: item.id }
        )

        const _materialsOrTools = await this.$store.dispatch(
          'admin/orders/get_materialsOrToolsForTemplate',
          { type: 'winterization', templateId: item.id }
        )

        this.editedItem = {
          id: item.id,
          title: item.title,
          desc: item.desc,
          needProcessTimes: item.needProcessTimes,
          active: item.active,
          itemsForInvoices: item.itemsForInvoices || [],
          requirements: _requirements || [],
          materialsOrTools: _materialsOrTools || [],
          pictures: item.pictures ?? [],
          clients: [
            {
              client: item.client || '',
              loanTypes: item.loanTypes || [],
              id: item.id || null,
            },
          ],
          winterizationType: item.winterizationType,
        }
        this.editedIndex = this.winterizations.indexOf(item)
        this.showAddWorksToDo = true
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    deleteItem(item) {
      this.editedIndex = this.winterizations.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    async deleteItemConfirm() {
      this.loading = true
      const type = 'winterization'
      const objectDelete = this.winterizations[this.editedIndex]
      try {
        await this.$store.dispatch('admin/orders/delete_task_template', {
          objectDelete,
          type,
        })
        this.loading = false
        this.closeDelete()
        this.$mainAlertSuccess(this.$t('successTemplateDelete'))
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
        this.closeDelete()
      }
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = null
        this.editedIndex = -1
      })
    },

    handleShowAddWorksToDo() {
      this.showAddWorksToDo = !this.showAddWorksToDo
    },
    handleClose() {
      this.$nextTick(() => {
        this.editedItem = null
        this.editedIndex = -1
      })
      this.showAddWorksToDo = false
    },
  },
}
</script>
<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
}
.v-enter,
.v-leave-to {
  opacity: 0;
  transform: translateX(20%);
}
</style>
