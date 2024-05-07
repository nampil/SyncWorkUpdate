<template>
  <div class="job-note-types-templates | pa-3 h-100 overflow-y-auto">
    <v-data-table
      :headers="headers"
      :items="jobNoteType"
      class="elevation-1"
      fixed-header
      :items-per-page="15"
      :loading="loading"
      :search="search"
      dense
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:top>
        <v-toolbar flat dense dark color="secondary">
          <v-toolbar-title>{{ $t('jobNoteTypesTemplate') }}</v-toolbar-title>
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
                    @click="handleAddJobNoteTypeTemplate()"
                  >
                    {{ $t('send') }}
                  </v-btn>
                  <v-btn
                    v-else
                    ref="botonUpdate"
                    text
                    :loading="loading"
                    :disabled="validateForm"
                    @click="handleUpdateJobNoteTypeTemplate()"
                  >
                    {{ $t('update') }}
                  </v-btn>
                </v-toolbar-items>
              </v-toolbar>

              <v-card-text>
                <v-container class="mt-3">
                  <v-form ref="newJobNoteTypeTemplateForm">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="newJobNoteType.title"
                          :label="$t('title')"
                          :rules="titleRules"
                          dense
                          hide-details="auto"
                          autofocus
                          outlined
                          @keydown.enter.exact.prevent
                          @keyup.enter.exact="handleFocus(3)"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="newJobNoteType.desc"
                          :label="$t('description')"
                          :rules="descRules"
                          dense
                          hide-details="auto"
                          outlined
                        ></v-textarea>
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
          <span>{{ $t('editJobNoteType') }}</span>
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
          <span>{{ $t('deleteJobNoteType') }}</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <DialogDelete
      :show="dialogDelete"
      :loading="loading"
      @close-delete="closeDelete"
      @delete-item-confirm="deleteItemConfirm"
    />
  </div>
</template>
<script>
import DialogDelete from '../../../components/admin/templates/dialogs/DialogDelete'
export default {
  name: 'JobNotesTypesComp',
  components: { DialogDelete },

  data() {
    return {
      newJobNoteType: {
        title: '',
        desc: '',
      },
      dialog: false,
      dialogDelete: false,
      loading: false,
      titleRules: [(v) => !!v || this.$t('titleRequired')],
      descRules: [(v) => !!v || this.$t('descriptionRequired')],
      headers: [
        {
          text: this.$t('title'),
          align: 'start',
          width: '30%',
          value: 'title',
        },
        { text: this.$t('description'), value: 'desc' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      jobNoteType: [],
      editedIndex: -1,
      editedItem: {
        title: '',
        desc: '',
      },
      defaultItem: {
        title: '',
        desc: '',
      },
      search: '',
      showSearch: false,
    }
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t('newJobNoteTypeTemplate')
        : this.$t('editJobNoteTypeTemplate')
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
        return !compareItems(this.newJobNoteType, this.defaultItem)
      }
      const propertiesToCheck = ['desc', 'title']
      return propertiesToCheck.some((p) => {
        return !compareItems(this.newJobNoteType[p], this.editedItem[p])
      })
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
  },

  methods: {
    handleFocus(index) {
      this.$nextTick(() => {
        this.$refs.newJobNoteTypeTemplateForm.$el[index].focus()
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

    async handleAddJobNoteTypeTemplate() {
      if (!this.$refs.newJobNoteTypeTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          title: this.newJobNoteType.title,
          desc: this.newJobNoteType.desc,
        }
        await this.$store.dispatch(`admin/orders/add_jobNoteType_templates`, {
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

    async handleUpdateJobNoteTypeTemplate() {
      if (!this.$refs.newJobNoteTypeTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          title: this.newJobNoteType.title,
          desc: this.newJobNoteType.desc,
          id: this.editedItem.id,
        }
        await this.$store.dispatch(`admin/orders/update_jobNoteType_template`, {
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
    handleCancel(ref) {
      this.cleanUp()
      this.close()
    },
    cleanUp() {
      if (!this.$refs.newJobNoteTypeTemplateForm) return
      this.$refs.newJobNoteTypeTemplateForm.resetValidation()
      this.$nextTick(() => {
        this.newJobNoteType = Object.assign({}, this.defaultItem)
      })
    },
    async initialize() {
      const _type = 'jobNoteType'
      this.loading = true
      try {
        const _jobNoteType = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          _type
        )
        this.jobNoteType =
          _jobNoteType && _jobNoteType.length ? [..._jobNoteType] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    editItem(item) {
      this.editedIndex = this.jobNoteType.indexOf(item)
      // this.editedItem = Object.assign({}, item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newJobNoteType.title = this.editedItem.title
      this.newJobNoteType.desc = this.editedItem.desc
      this.dialog = true
    },
    deleteItem(item) {
      this.editedIndex = this.jobNoteType.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
      setTimeout(() => {
        this.$refs.botonCloseDelete.$el.focus()
      })
    },
    async deleteItemConfirm() {
      this.loading = true
      const type = 'jobNoteType'
      const objectDelete = this.jobNoteType[this.editedIndex]
      try {
        await this.$store.dispatch('admin/orders/delete_task_template', {
          objectDelete,
          type,
        })
        this.loading = false
        this.jobNoteType.splice(this.editedIndex, 1)
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
      this.$refs.newJobNoteTypeTemplateForm.resetValidation()
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
        Object.assign(this.jobNoteType[this.editedIndex], this.editedItem)
      } else {
        this.jobNoteType.push(this.editedItem)
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
::v-deep.v-data-table--dense > .v-data-table__wrapper {
  overflow-y: hidden;
}
</style>
