<template>
  <div class="orders-templates | h-100 pa-3 overflow-y-auto">
    <v-data-table
      :headers="headers"
      :items="ordersTemplates"
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
          <v-toolbar-title> {{ $t('Orders Templates') }}</v-toolbar-title>
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
          <v-dialog
            v-model="dialog"
            max-width="1000px"
            :overlay="false"
            transition="dialog-transition"
            scrollable
            :persistent="localNeedToSave"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn small color="primary" dark v-bind="attrs" v-on="on">
                {{ $t('add') }}
              </v-btn>
            </template>

            <v-card class="elevation-0">
              <v-toolbar color="secondary" dense>
                <v-btn icon dark @click="handleCancel">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title class="d-flex aling-center">
                  {{ formTitle }}</v-toolbar-title
                >
                <v-spacer></v-spacer>
                <v-toolbar-items
                  ><v-btn
                    v-if="editedIndex === -1"
                    ref="botonSave"
                    text
                    :loading="loading"
                    @click="handleAddTemplate()"
                  >
                    {{ $t('send') }}
                  </v-btn>
                  <v-btn
                    v-else
                    ref="botonUpdate"
                    text
                    :loading="loading"
                    @click="handleUpdateTemplate()"
                  >
                    {{ $t('update') }}
                  </v-btn>
                </v-toolbar-items>
              </v-toolbar>

              <v-card-text>
                <v-container class="mt-3">
                  <v-form ref="formOrdersTemplates">
                    <v-row>
                      <v-col cols="10">
                        <v-text-field
                          v-model="newOrdersTemplates.title"
                          :label="$t('title')"
                          :rules="titleRules"
                          autofocus
                          dense
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                        ></v-text-field>
                      </v-col>

                      <div class="ml-3">
                        <v-switch
                          v-model="newOrdersTemplates.active"
                          class="switch-active"
                          :label="$t('active')"
                          hide-details="auto"
                        ></v-switch>
                      </div>

                      <v-col cols="4">
                        <v-select
                          v-model="newOrdersTemplates.client"
                          :label="$t('client')"
                          :items="clientFormatted"
                          outlined
                          :rules="clientRules"
                          clearable
                          hide-details="auto"
                          dense
                        ></v-select>
                      </v-col>

                      <v-col cols="4">
                        <v-select
                          v-model="newOrdersTemplates.loanTypes"
                          :label="$t('loanTypes')"
                          :items="loanTypesFormatted"
                          outlined
                          multiple
                          :rules="loanTypesRules"
                          clearable
                          hide-details="auto"
                          dense
                        ></v-select
                      ></v-col>

                      <v-col cols="4">
                        <v-select
                          v-model="newOrdersTemplates.customers"
                          :label="$t('customers')"
                          :items="customersFormatted"
                          outlined
                          multiple
                          :rules="customersRules"
                          clearable
                          hide-details="auto"
                          dense
                        ></v-select>
                      </v-col>

                      <v-col cols="12">
                        <v-form
                          ref="formTasks"
                          class="task-form"
                          lazy-validation
                        >
                          <div
                            v-for="(type, j) in jobsTypes"
                            :key="j"
                            class="mb-2"
                          >
                            <span class="sub-title">{{ $t(type.title) }}</span>
                            <v-tooltip
                              open-delay="600"
                              content-class="small"
                              top
                            >
                              <!-- eslint-disable-next-line -->
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  class="ml-1"
                                  color="primary"
                                  small
                                  icon
                                  v-bind="attrs"
                                  v-on="on"
                                  @click="handleShowAddTasks(type)"
                                  ><v-icon>{{
                                    type.type !== 'inspections'
                                      ? 'mdi-plus-circle'
                                      : 'mdi-pencil-circle'
                                  }}</v-icon></v-btn
                                >
                              </template>
                              <span>{{
                                type.type !== 'inspections'
                                  ? $t('addTasks')
                                  : $t('editInspections')
                              }}</span>
                            </v-tooltip>

                            <section
                              v-if="
                                newOrdersTemplates[type.type] &&
                                newOrdersTemplates[type.type].length
                              "
                            >
                              <tasks-view
                                :job-type="type.type"
                                :tasks="newOrdersTemplates[type.type]"
                                @edit-task="handleShowEditTask($event)"
                                @delete-task="handleDeleteTask($event)"
                              />
                            </section>
                          </div>
                        </v-form>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog>
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
          <span>{{ $t('editOrder') }}</span>
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
          <span>{{ $t('deleteOrder') }}</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <DialogDelete
      :show="dialogDelete"
      :loading="loading"
      @close-delete="closeDelete"
      @delete-item-confirm="deleteItemConfirm"
    />

    <v-dialog
      v-model="addTaskModal"
      :persistent="validatePersistent"
      scrollable
      max-width="1000px"
    >
      <add-task
        v-if="addTaskModal"
        :is-seteado="true"
        :order="newOrdersTemplates"
        :job-type="typeSelected"
        :job-task-to-edit="jobTaskToEdit"
        @add-tasks="handleAddTasks($event)"
        @update-task="handleUpdateTask($event)"
        @update-persistent="validatePersistent = $event"
        @close="handleCloseAddTask"
      />
    </v-dialog>

    <v-dialog
      v-model="addTaskInspections"
      :persistent="validatePersistent"
      scrollable
      max-width="1000px"
    >
      <add-task-inspections
        v-if="addTaskInspections"
        :is-seteado="true"
        :order="newOrdersTemplates"
        @add-inspections="handleAddTasks($event)"
        @update-inspections="handleUpdateTasksInspections($event)"
        @delete-inspections="handleDeleteTasksInspections($event)"
        @update-persistent="validatePersistent = $event"
        @close="handleCloseAddTaskInspection"
      />
    </v-dialog>
  </div>
</template>

<script>
import DialogDelete from '../../../components/admin/templates/dialogs/DialogDelete'
import AddTask from '~/components/orders/task/AddTask.vue'
import AddTaskInspections from '~/components/orders/task/AddTaskInspections.vue'
import TasksView from '~/components/admin/templates/TasksView.vue'
export default {
  name: 'OrdersTemplates',
  components: { DialogDelete, AddTask, TasksView, AddTaskInspections },

  data() {
    return {
      newOrdersTemplates: {
        title: '',
        loanTypes: [],
        workToDos: [],
        inspections: [],
        allowablesPools: [],
        client: '',
        customers: [],
        active: true,
      },
      dialog: false,
      dialogDelete: false,
      loading: false,
      titleRules: [(v) => !!v || this.$t('titleRequired')],
      loanTypesRules: [(v) => !!v.length || this.$t('loanTypesIsRequired')],
      clientRules: [(v) => !!v || this.$t('clientIsRequired')],
      customersRules: [(v) => !!v.length || this.$t('customersIsRequired')],
      headers: [
        {
          text: this.$t('title'),
          align: 'start',
          value: 'title',
          width: '30%',
        },
        { text: this.$t('client'), value: 'client' },
        { text: this.$t('loanTypes'), value: 'loanTypes' },
        { text: this.$t('customers'), value: 'customers' },
        { text: this.$t('active'), value: 'active' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      ordersTemplates: [],
      editedIndex: -1,
      editedItem: {
        title: '',
        loanTypes: [],
        active: true,
        workToDos: [],
        inspections: [],
        allowablesPools: [],
        client: '',
        customers: [],
      },
      defaultItem: {
        title: '',
        loanTypes: [],
        active: true,
        workToDos: [],
        inspections: [],
        allowablesPools: [],
        client: '',
        customers: [],
      },
      search: '',
      showSearch: false,
      clients: [],
      jobsTypes: [
        { title: 'workToDos', type: 'workToDos' },
        { title: 'inspections', type: 'inspections' },
        { title: 'allowablesPools', type: 'allowablesPools' },
      ],
      validatePersistent: false,
      addTaskModal: false,
      jobTaskToEdit: {},
      typeSelected: {},
      addTaskInspections: false,
      updateTasks: [],
      deleteTasks: [],
      customersTemplates: [],
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t('New Order Template')
        : this.$t('Edit Order Template')
    },
    validateForm() {
      if (this.editedIndex === -1 && !this.localNeedToSave) {
        return true
      } else if (this.editedIndex !== -1 && !this.localNeedToSave) {
        return true
      }
      return false
    },
    localNeedToSave() {
      const compareItems = (A, B) => {
        return this._.isEqual(A, B)
      }
      if (this.editedIndex === -1) {
        return !compareItems(this.newOrdersTemplates, this.defaultItem)
      }
      const propertiesToCheck = [
        'title',
        'loanTypes',
        'customers',
        'client',
        'active',
        'workToDos',
        'inspections',
        'allowablesPools',
      ]
      return propertiesToCheck.some((p) => {
        return !compareItems(this.newOrdersTemplates[p], this.editedItem[p])
      })
    },
    loanTypesFormatted() {
      if (!this.clients?.length) return []

      const idx = this.clients.findIndex(
        (c) => c.title === this.newOrdersTemplates.client
      )
      if (idx === -1) {
        return []
      }
      return this.clients[idx].loanTypes
    },
    clientFormatted() {
      if (!this.clients?.length) return []
      return this.clients.map((c) => c.title)
    },
    customersFormatted() {
      if (!this.customersTemplates?.length) return []
      return this.customersTemplates.map((c) => c.title)
    },
  },
  watch: {
    dialog(val) {
      val || this.close()
      if (this.editedIndex === -1) {
        this.cleanUp()
      }
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  created() {
    this.initialize()
    this.initializeClients()
    this.initializeCustomers()
  },
  methods: {
    handleCancel() {
      this.cleanUp()
      this.close()
    },
    cleanUp() {
      if (!this.$refs.formOrdersTemplates) return
      this.$refs.formOrdersTemplates.resetValidation()
      this.$nextTick(() => {
        this.newOrdersTemplates = JSON.parse(JSON.stringify(this.defaultItem))
      })
    },
    async handleAddTemplate() {
      if (!this.$refs.formOrdersTemplates.validate()) {
        return
      }

      this.loading = true
      const tasks = [
        ...this.newOrdersTemplates.workToDos,
        ...this.newOrdersTemplates.inspections,
        ...this.newOrdersTemplates.allowablesPools,
      ]

      try {
        const objectToSend = {
          title: this.newOrdersTemplates.title.trim().replace('/', '-'),
          active: this.newOrdersTemplates.active || false,
          loanTypes: this.newOrdersTemplates.loanTypes,
          customers: this.newOrdersTemplates.customers,
          client: this.newOrdersTemplates.client,
          tasks,
        }
        await this.$store.dispatch(`admin/orders/add_order_templates`, {
          objectToSend,
        })
        this.loading = false
        this.cleanUp()
        this.$mainAlertSuccess(this.$t('successTemplateAdded'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.loading = false
        this.$mainAlertError(this.$t('embarrassingError'))
      }
      this.save()
    },
    async handleUpdateTemplate() {
      if (!this.$refs.formOrdersTemplates.validate()) {
        return
      }
      this.loading = true
      const tasks = [
        ...this.newOrdersTemplates.workToDos,
        ...this.newOrdersTemplates.inspections,
        ...this.newOrdersTemplates.allowablesPools,
      ]
      const newTasks = tasks.filter((e) => e.id && !isNaN(e.id))

      try {
        const objectToSend = {
          title: this.newOrdersTemplates.title,
          loanTypes: this.newOrdersTemplates.loanTypes,
          client: this.newOrdersTemplates.client,
          customers: this.newOrdersTemplates.customers,
          orderId: this.editedItem.id,
          active: this.newOrdersTemplates.active,
          newTasks,
          updateTasks: this.updateTasks,
          baseJobTasks: tasks,
          deleteTasks: this.deleteTasks,
        }
        await this.$store.dispatch(`admin/orders/update_order_template`, {
          objectToSend,
        })
        this.cleanUp()
        this.$mainAlertSuccess(this.$t('successTemplateUpdate'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('embarrassingError'))
      }
      this.save()
    },
    async initialize() {
      this.loading = true
      try {
        const _items = await this.$store.dispatch(
          'admin/orders/get_ordersTemplates'
        )
        this.ordersTemplates = _items && _items.length ? [..._items] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async initializeClients() {
      this.loading = true
      try {
        const _clients = await this.$store.dispatch('admin/orders/get_clients')
        this.clients = _clients && _clients.length ? _clients : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async initializeCustomers() {
      this.loading = true
      try {
        const _customers = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          'customers'
        )
        this.customersTemplates =
          _customers && _customers.length ? _customers : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    editItem(item) {
      this.editedIndex = this.ordersTemplates.indexOf(item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newOrdersTemplates.title = this.editedItem.title
      this.newOrdersTemplates.client = this.editedItem.client
      this.newOrdersTemplates.loanTypes = this.editedItem.loanTypes
      this.newOrdersTemplates.active = this.editedItem.active
      this.newOrdersTemplates.customers = this.editedItem.customers || []
      this.getTasks(item)
    },

    async getTasks(item) {
      this.loading = true
      try {
        const tasks = await this.$store.dispatch(
          'admin/orders/get_taskOrdersTemplates',
          {
            orderId: item.id,
          }
        )
        this.editedItem.allowablesPools = tasks.allowablesPools
          .filter((allowable) => allowable.position)
          .sort((a, b) => {
            return a.position > b.position ? 1 : -1
          })
        this.editedItem.workToDos = tasks.workToDos
          .filter((work) => work.position)
          .sort((a, b) => {
            return a.position > b.position ? 1 : -1
          })
        this.editedItem.inspections = tasks.inspections
          .filter((ins) => ins.position)
          .sort((a, b) => {
            return a.position > b.position ? 1 : -1
          })

        this.newOrdersTemplates.workToDos = this.editedItem.workToDos
        this.newOrdersTemplates.inspections = this.editedItem.inspections
        this.newOrdersTemplates.allowablesPools =
          this.editedItem.allowablesPools
        this.loading = false
        this.dialog = true
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
      }
    },
    deleteItem(item) {
      this.editedIndex = this.ordersTemplates.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    async deleteItemConfirm() {
      this.loading = true
      const objectDelete = this.ordersTemplates[this.editedIndex]

      try {
        await this.$store.dispatch('admin/orders/delete_order_template', {
          objectDelete,
        })
        this.loading = false
        this.ordersTemplates.splice(this.editedIndex, 1)
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
    close() {
      this.dialog = false
      this.$refs.formOrdersTemplates.resetValidation()
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
        this.updateTasks = []
        this.deleteTasks = []
      })
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.ordersTemplates[this.editedIndex], this.editedItem)
      } else {
        this.ordersTemplates.push(this.editedItem)
      }
      this.initialize()
      this.close()
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
    handleShowAddTasks(type) {
      this.typeSelected = type
      if (type.type === 'inspections') {
        this.addTaskInspections = true
        return
      }

      if (
        !this.newOrdersTemplates.client ||
        !this.newOrdersTemplates.loanTypes.length
      ) {
        this.$mainAlertInfo(
          this.$t('You must select a client and at least one type of loan')
        )
        return
      }
      this.addTaskModal = true
    },
    handleAddTasks(tasks) {
      tasks.forEach((e) => {
        this.newOrdersTemplates[e.type].push({ ...e, id: this.$generateId() })
      })
    },
    handleUpdateTask(task) {
      const idx = this.newOrdersTemplates[task.type].findIndex(
        (jt) => jt.id === task.id
      )
      if (idx === -1) return
      this.newOrdersTemplates[task.type].splice(idx, 1, task)
      if (task.id && isNaN(task.id)) {
        this.updateTasks.push(task)
      }
    },
    handleCloseAddTask() {
      this.jobTaskToEdit = {}
      this.addTaskModal = false
    },
    handleCloseAddTaskInspection() {
      this.addTaskInspections = false
    },
    handleShowEditTask(task) {
      this.typeSelected = { title: task.type, type: task.type }
      this.addTaskModal = true
      this.jobTaskToEdit = task
    },
    handleDeleteTask(task) {
      const idx = this.newOrdersTemplates[task.type].findIndex(
        (jt) => jt.id === task.id
      )
      if (idx === -1) return
      this.newOrdersTemplates[task.type].splice(idx, 1)
      if (task.id && isNaN(task.id)) {
        this.deleteTasks.push(task)
      }
    },

    handleUpdateTasksInspections(inspections) {
      for (let i = 0; i < inspections.length; i++) {
        const inspection = inspections[i]
        const { subAreas, ..._inspection } = inspection
        _inspection.areasInReports = subAreas.map((s) => s.title)
        const idx = this.newOrdersTemplates[_inspection.type].findIndex(
          (jt) => jt.id === _inspection.id
        )

        if (idx > -1) {
          this.newOrdersTemplates[_inspection.type].splice(idx, 1, _inspection)
        }
        if (inspection.id && isNaN(inspection.id)) {
          this.updateTasks.push(_inspection)
        }
      }
    },
    handleDeleteTasksInspections(inspections) {
      for (let i = 0; i < inspections.length; i++) {
        const inspection = inspections[i]
        const idx = this.newOrdersTemplates[inspection.type].findIndex(
          (jt) => jt.id === inspection.id
        )
        if (idx > -1) {
          this.newOrdersTemplates[inspection.type].splice(idx, 1)
        }
        if (inspection.id && isNaN(inspection.id)) {
          this.deleteTasks.push(inspection)
        }
      }
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
.sub-title {
  font-size: 1.1rem;
}
::v-deep.v-data-table--dense > .v-data-table__wrapper {
  overflow-y: hidden;
}
</style>
