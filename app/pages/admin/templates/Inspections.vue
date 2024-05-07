<template>
  <div class="inspections-templates | pa-3 h-100 overflow-y-auto">
    <section class="mb-8">
      <v-data-table
        :headers="headers"
        :items="inspections"
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
            <v-toolbar-title>{{ $t('inspectionsTemplate') }}</v-toolbar-title>
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
                  <v-toolbar-items>
                    <v-btn
                      v-if="editedIndex === -1"
                      ref="botonSave"
                      text
                      :loading="loading"
                      @click="handleAddTaskTemplate()"
                    >
                      {{ $t('send') }}
                    </v-btn>
                    <v-btn
                      v-else
                      ref="botonUpdate"
                      text
                      :loading="loading"
                      :disabled="validateForm"
                      @click="handleUpdateTaskTemplate()"
                    >
                      {{ $t('update') }}
                    </v-btn>
                  </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                  <v-container class="mt-3">
                    <v-form ref="newInspectionTemplateForm">
                      <v-row>
                        <v-col cols="6">
                          <v-select
                            v-model="newInspection.client"
                            :items="clientsFormatted"
                            :label="$t('client')"
                            autofocus
                            outlined
                            clearable
                            hide-details="auto"
                            dense
                          ></v-select>
                        </v-col>
                        <v-col cols="4">
                          <v-select
                            v-model="newInspection.loanTypes"
                            :items="loanTypesFormatted"
                            :label="$t('loanType')"
                            outlined
                            multiple
                            clearable
                            hide-details="auto"
                            dense
                          ></v-select>
                        </v-col>
                        <div class="ml-3">
                          <v-switch
                            v-model="newInspection.active"
                            :label="$t('active')"
                            hide-details="auto"
                          ></v-switch>
                        </div>
                        <v-col cols="12">
                          <v-text-field
                            v-model="newInspection.title"
                            :label="$t('title')"
                            :rules="titleRules"
                            dense
                            hide-details="auto"
                            outlined
                            @keydown.enter.exact.prevent
                            @keyup.enter.exact="handleFocus(7)"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="newInspection.desc"
                            :label="$t('description')"
                            :rules="descRules"
                            dense
                            hide-details="auto"
                            outlined
                          ></v-textarea>
                        </v-col>
                        <v-col cols="12">
                          <span class="sub-title">{{ $t('subAreas') }}</span>
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
                                @click="showAddSubAreas = !showAddSubAreas"
                                ><v-icon>mdi-plus-circle</v-icon></v-btn
                              >
                            </template>
                            <span>{{ $t('addSubAreas') }}</span>
                          </v-tooltip>

                          <div
                            v-if="
                              newInspection.subAreas &&
                              newInspection.subAreas.length
                            "
                            class="mt-2 mb-2"
                          >
                            <div
                              v-for="subArea in newInspection.subAreas"
                              :key="subArea.id"
                            >
                              <SubAreasView
                                :sub-area="subArea"
                                @edit-sub-area="handleShowEditSubArea(subArea)"
                                @delete-sub-area="deleteSubArea(subArea)"
                              ></SubAreasView>
                            </div>
                          </div>
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
            <span> {{ $t('editInspection') }} </span>
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
            <span>{{ $t('deleteInspection') }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </section>
    <section>
      <SubAreas />
    </section>

    <v-dialog
      v-model="dialogDelete"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card class="elevation-0">
        <v-toolbar color="primary">
          <v-toolbar-title class="d-flex aling-center">
            <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
            <span class="ma-0 text-h5 white--text">{{
              $t('alertTitle')
            }}</span></v-toolbar-title
          >
        </v-toolbar>
        <v-card-text class="pt-10 pb-10 text-center">
          <span class="text-body-1">
            {{ $t('alertTextTemplate') }}
          </span>
        </v-card-text>

        <v-card-actions class="d-flex justify-end pa-4">
          <v-btn
            ref="botonCloseDelete"
            class="mr-4"
            color="error"
            outlined
            :disabled="loading"
            @click="closeDelete"
            >{{ $t('cancel') }}</v-btn
          >
          <v-btn
            class="mr-4"
            color="secondary"
            :loading="loading"
            @click="deleteItemConfirm"
            >{{ $t('delete') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showAddSubAreas"
      :overlay="false"
      max-width="700px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <AddSubAreas
        v-if="showAddSubAreas"
        :sub-areas="subAreas"
        :sub-areas-in-task="newInspection.subAreas"
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
        :sub-areas-in-task="newInspection.subAreas"
        @update-sub-area="updateSubArea($event)"
        @update-persistent="validatePersistent = $event"
        @close="showEditSubArea = false"
      ></EditSubArea>
    </v-dialog>
  </div>
</template>

<script>
// import InspectionsOptions from '../../../components/admin/templates/inspections/InspectionsOptions.vue'
import SubAreas from '../../../components/admin/templates/inspections/SubAreas.vue'
import SubAreasView from '../../../components/orders/subAreas/SubAreasView.vue'
import AddSubAreas from '../../../components/orders/subAreas/AddSubAreas.vue'
import EditSubArea from '../../../components/orders/subAreas/EditSubArea.vue'
export default {
  name: 'InspectionsTemplatesComp',
  components: {
    SubAreas,
    SubAreasView,
    AddSubAreas,
    EditSubArea,
  },

  data() {
    return {
      newInspection: {
        title: '',
        desc: '',
        active: true,
        client: '',
        loanTypes: [],
        subAreas: [],
      },

      dialog: false,
      dialogDelete: false,
      loading: false,
      titleRules: [(v) => !!v || this.$t('titleRequired')],
      descRules: [(v) => !!v || this.$t('descriptionRequired')],
      clientRules: [(v) => !!v || this.$t('clientIsRequired')],
      loanTypeRules: [(v) => !!v || this.$t('loanTypeIsRequired')],
      // rulesItems: [(v) => (!!v && v.length !== 0) || 'Required'],
      headers: [
        {
          text: this.$t('title'),
          align: 'start',
          width: '30%',
          value: 'title',
        },
        // { text: this.$t('descTemplate'), value: 'desc' },
        { text: this.$t('client'), value: 'client' },
        { text: this.$t('loanTypes'), value: 'loanTypes' },
        { text: this.$t('active'), value: 'active' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      inspections: [],
      editedIndex: -1,
      editedItem: {
        title: '',
        desc: '',
        active: true,
        client: '',
        loanTypes: [],
        subAreas: [],
      },
      defaultItem: {
        title: '',
        desc: '',
        active: true,
        client: '',
        loanTypes: [],
        subAreas: [],
      },
      clients: [],
      loanTypes: [],
      subAreas: [],
      showSearch: false,
      search: '',
      showAddSubAreas: false,
      showEditSubArea: false,
      validatePersistent: false,
      subAreasBase: [],
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t('newInspectionTemplate')
        : this.$t('editInspectionTemplate')
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
        return !compareItems(this.newInspection, this.defaultItem)
      }
      const propertiesToCheck = [
        'desc',
        'title',
        'active',
        'client',
        'loanTypes',
        'subAreas',
      ]

      return propertiesToCheck.some((p) => {
        if (p === 'subAreas') {
          return !compareItems(this.newInspection[p], this.subAreasBase)
        }
        return !compareItems(this.newInspection[p], this.editedItem[p])
      })
    },
    clientsFormatted() {
      return this.clients.map((c) => c.title)
    },
    loanTypesFormatted() {
      const indexOf = this.clients
        .map((o) => o.title)
        .indexOf(this.newInspection.client)

      if (indexOf > -1) {
        return this.clients[indexOf].loanTypes
      }
      return []
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
    this.initializeSubAreas()
  },

  methods: {
    handleFocus(index) {
      this.$nextTick(() => {
        this.$refs.newInspectionTemplateForm.$el[index].focus()
      })
    },
    handleFocusBtnActions() {
      if (!this.dialog) {
        return
      }

      setTimeout(() => {
        if (this.editedIndex === -1) {
          this.$refs.botonSave.$el.focus()
        } else if (this.editedIndex !== -1) {
          this.$refs.botonUpdate.$el.focus()
        }
      }, 200)
    },

    handleCancel() {
      this.cleanUp()
      this.close()
    },
    cleanUp() {
      if (!this.$refs.newInspectionTemplateForm) return
      this.$refs.newInspectionTemplateForm.reset()
      this.$nextTick(() => {
        this.newInspection = JSON.parse(JSON.stringify(this.defaultItem))
      })
    },
    async handleAddTaskTemplate() {
      const type = 'inspections'
      if (!this.$refs.newInspectionTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          title: this.newInspection.title.trim().replace('/', '-'),
          desc: this.newInspection.desc,
          client: this.newInspection.client || '',
          active: this.newInspection.active || false,
          loanTypes: this.newInspection.loanTypes || [],
          subAreas: this.newInspection.subAreas || [],
        }
        await this.$store.dispatch(`admin/orders/add_task_templates`, {
          objectToSend,
          type,
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
    async handleUpdateTaskTemplate() {
      const type = 'inspections'
      if (!this.$refs.newInspectionTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          id: this.editedItem.id,
          title: this.newInspection.title.trim().replace('/', '-'),
          desc: this.newInspection.desc,
          client: this.newInspection.client || '',
          active: this.newInspection.active || false,
          loanTypes: this.newInspection.loanTypes || [],
          subAreas: this.newInspection.subAreas || [],
        }
        await this.$store.dispatch(`admin/orders/update_task_template`, {
          objectToSend,
          type,
        })
        this.loading = false
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
      const _type = 'inspections'
      this.loading = true
      try {
        const _inspections = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          _type
        )
        this.inspections =
          _inspections && _inspections.length ? [..._inspections] : []
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
    async initializeSubAreas() {
      this.loading = true
      try {
        const _subAreas = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          'subAreas'
        )
        this.subAreas = _subAreas && _subAreas.length ? _subAreas : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    editItem(item) {
      this.editedIndex = this.inspections.indexOf(item)
      // this.editedItem = Object.assign({}, item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newInspection.title = this.editedItem.title
      this.newInspection.desc = this.editedItem.desc
      this.newInspection.active = this.editedItem.active
      this.newInspection.client = this.editedItem.client
      this.newInspection.loanTypes = this.editedItem.loanTypes

      this.newInspection.subAreas = this.editedItem.subAreas
      this.subAreasBase = this.editedItem.subAreas
        ? JSON.parse(JSON.stringify(this.editedItem.subAreas))
        : []
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.inspections.indexOf(item)

      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
      // this.$nextTick(() => {
      //   this.$refs.botonCloseDelete.$el.focus()
      // })
      setTimeout(() => {
        this.$refs.botonCloseDelete.$el.focus()
      })
    },
    async deleteItemConfirm() {
      this.loading = true
      const type = 'inspections'
      const objectDelete = this.inspections[this.editedIndex]

      try {
        await this.$store.dispatch('admin/orders/delete_task_template', {
          objectDelete,
          type,
        })
        this.loading = false
        this.inspections.splice(this.editedIndex, 1)
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
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
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
        Object.assign(this.inspections[this.editedIndex], this.editedItem)
      } else {
        this.inspections.push(this.editedItem)
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
    handleShowEditSubArea(subArea) {
      this.editedArea = subArea
      this.showEditSubArea = true
    },
    addNewSubAreas(newSubAreas) {
      for (let i = 0; i < newSubAreas.length; i++) {
        const subArea = newSubAreas[i]
        this.newInspection.subAreas.push(subArea)
      }
    },
    updateSubArea(subArea) {
      const indexOfArea = this.newInspection.subAreas.findIndex(
        (a) => a.id === subArea.id
      )
      if (indexOfArea === -1) {
        return
      }
      this.newInspection.subAreas.splice(indexOfArea, 1, subArea)
    },
    deleteSubArea(subArea) {
      const indexOfArea = this.newInspection.subAreas.findIndex(
        (a) => a.id === subArea.id
      )
      if (indexOfArea === -1) {
        return
      }
      this.newInspection.subAreas.splice(indexOfArea, 1)
    },
  },
}
</script>
<style lang="scss" scoped>
.sub-title {
  font-size: 1.1rem;
}
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
