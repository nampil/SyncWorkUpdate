<template>
  <div class="sub-areas-templates overflow-y-auto">
    <v-data-table
      :headers="headers"
      :items="subAreas"
      class="elevation-1"
      :items-per-page="15"
      fixed-header
      :loading="loading"
      :search="search"
      dense
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:top>
        <v-toolbar flat dense dark color="secondary">
          <v-toolbar-title>{{ $t('subAreas') }}</v-toolbar-title>
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
              <v-toolbar dense color="secondary">
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
                  <v-form ref="newSubAreaTemplateForm">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="newSubAreas.title"
                          :label="$t('title')"
                          :rules="rules"
                          dense
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-textarea
                          v-model="newSubAreas.desc"
                          :label="$t('description')"
                          rows="4"
                          auto-grow
                          :rules="rules"
                          dense
                          outlined
                          hide-details="auto"
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
          <span>{{ $t('editSubArea') }}</span>
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
          <span>{{ $t('deleteSubArea') }}</span>
        </v-tooltip>
      </template>
    </v-data-table>

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
  </div>
</template>
<script>
export default {
  name: 'SubAreas',
  data() {
    return {
      newSubAreas: {
        title: '',
        desc: '',
      },
      newInspectionsText: '',
      dialog: false,
      dialogDelete: false,
      loading: false,
      rules: [(v) => !!v || this.$t('thisFieldRequired')],

      headers: [
        {
          text: this.$t('title'),
          align: 'start',
          width: '30%',
          value: 'title',
        },
        {
          text: this.$t('description'),

          value: 'desc',
        },

        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      subAreas: [],
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
        ? this.$t('newSubAreaTemplate')
        : this.$t('editSubAreaTemplate')
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
        return !compareItems(this.newSubAreas, this.defaultItem)
      }
      const propertiesToCheck = ['title', 'desc']
      return propertiesToCheck.some((p) => {
        return !compareItems(this.newSubAreas[p], this.editedItem[p])
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
    handleCancel() {
      this.cleanUp()
      this.close()
    },
    cleanUp() {
      if (!this.$refs.newSubAreaTemplateForm) return
      this.$refs.newSubAreaTemplateForm.reset()
      this.$nextTick(() => {
        this.newSubAreas = JSON.parse(JSON.stringify(this.defaultItem))
      })
    },
    async handleAddTaskTemplate() {
      const type = 'subAreas'
      if (!this.$refs.newSubAreaTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          title: this.newSubAreas.title.trim().replace('/', '-'),
          desc: this.newSubAreas.desc,
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
      const type = 'subAreas'
      if (!this.$refs.newSubAreaTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          id: this.editedItem.id,
          title: this.newSubAreas.title.trim().replace('/', '-'),
          desc: this.newSubAreas.desc,
        }
        await this.$store.dispatch(`admin/orders/update_task_template`, {
          objectToSend,
          type,
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
      const _type = 'subAreas'
      this.loading = true
      try {
        const _subAreas = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          _type
        )
        this.subAreas = _subAreas && _subAreas.length ? [..._subAreas] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    editItem(item) {
      this.editedIndex = this.subAreas.indexOf(item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newSubAreas.title = this.editedItem.title
      this.newSubAreas.desc = this.editedItem.desc
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.subAreas.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    async deleteItemConfirm() {
      this.loading = true
      const type = 'subAreas'
      const objectDelete = this.subAreas[this.editedIndex]

      try {
        await this.$store.dispatch('admin/orders/delete_task_template', {
          objectDelete,
          type,
        })
        this.loading = false
        this.subAreas.splice(this.editedIndex, 1)
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
        Object.assign(this.subAreas[this.editedIndex], this.editedItem)
      } else {
        this.subAreas.push(this.editedItem)
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
</style>
