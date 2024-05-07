<template>
  <div class="order-categories-templates | pa-3 h-100 overflow-y-auto">
    <v-data-table
      :headers="headers"
      :items="orderCategory"
      fixed-header
      class="elevation-1"
      :items-per-page="15"
      :loading="loading"
      :search="search"
      dense
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:item.color="{ item }">
        <v-icon :color="item.color"> mdi-flag </v-icon>
      </template>
      <!-- eslint-disable-next-line -->
      <template v-slot:top>
        <v-toolbar flat dark dense color="secondary">
          <v-toolbar-title>{{ $t('orderCategoriesTemplate') }}</v-toolbar-title>
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
                    @click="handleAddOrderCategoryTemplate()"
                  >
                    {{ $t('send') }}
                  </v-btn>
                  <v-btn
                    v-else
                    ref="botonUpdate"
                    text
                    :loading="loading"
                    :disabled="validateForm"
                    @click="handleUpdateOrderCategoryTemplate()"
                  >
                    {{ $t('update') }}
                  </v-btn>
                </v-toolbar-items>
              </v-toolbar>

              <v-card-text>
                <v-container class="mt-3">
                  <v-form ref="newOrderCategoryTemplateForm">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="newOrderCategory.title"
                          :label="$t('title')"
                          :rules="titleRules"
                          dense
                          autofocus
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="newOrderCategory.desc"
                          :label="$t('description')"
                          :rules="descRules"
                          dense
                          hide-details="auto"
                          outlined
                        ></v-textarea>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="newOrderCategory.order"
                          :label="$t('order')"
                          :rules="orderRules"
                          dense
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                          @keyup.enter.exact="handleFocusBtnActions()"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-color-picker
                          v-model="newOrderCategory.color"
                          class="ml-2"
                          hide-inputs
                          hide-canvas
                          hide-sliders
                          mode.sync="hex"
                          width="1000"
                          :swatches="colorFilter"
                          show-swatches
                        ></v-color-picker>
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
          <span>{{ $t('editOrderCategory') }}</span>
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
          <span>{{ $t('deleteOrderCategory') }}</span>
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
  name: 'OrderCategoriesComp',
  components: { DialogDelete },

  data() {
    return {
      newOrderCategory: {
        title: '',
        desc: '',
        order: '',
        color: '#FF0000',
      },
      dialog: false,
      dialogDelete: false,
      loading: false,
      titleRules: [(v) => !!v || this.$t('titleRequired')],
      descRules: [(v) => !!v || this.$t('descriptionRequired')],
      orderRules: [
        (v) => !!v || this.$t('orderRequired'),
        (v) =>
          /^[0-9]{1,10}([.,][0-9]{1,4})?$/.test(v) ||
          this.$t('requireOnlyNumbers'),
      ],
      swatches: [
        ['#FF0000', '#AA0000', '#550000'],
        ['#FFFF00', '#AAAA00', '#555500'],
        ['#00FF00', '#00AA00', '#005500'],
        ['#00FFFF', '#00AAAA', '#005555'],
        ['#E53935', '#EF9A9A', '#FFEBEE'],
        ['#FB8C00', '#FF7043', '#FBE9E7'],
        ['#FDD835', '#FFF59D', '#FFF9C4'],
        ['#43A047', '#4CAF50', '#C5E1A5'],
        ['#68B6F3', '#81D4FA', '#B3E5FC'],
        ['#0000FF', '#0D47A1', '#2196F3'],
        ['#550000', '#663300', '#8D6E63'],
        ['#263238', '#909497', '#B0BEC5'],
      ],
      headers: [
        {
          text: this.$t('title'),
          align: 'start',
          value: 'title',
        },
        { text: this.$t('description'), value: 'desc' },
        { text: 'Color', value: 'color' },
        { text: this.$t('order'), value: 'order' },

        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      orderCategory: [],
      editedIndex: -1,
      editedItem: {
        title: '',
        desc: '',
        order: '',
        color: '',
      },
      defaultItem: {
        title: '',
        desc: '',
        order: '',
        color: '#FF0000',
      },
      newArray: [],
      search: '',
      showSearch: false,
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t('newOrderCategoryTemplate')
        : this.$t('editOrderCategoryTemplate')
    },

    validateForm() {
      if (this.editedIndex === -1 && !this.localNeedToSave) {
        return true
      } else if (this.editedIndex !== -1 && !this.localNeedToSave) {
        return true
      }

      return false
    },

    colorFilter() {
      /* return this.swatches.filter((e)=>{
        let boolColor = true
        this.orderCategory.map((order)=>order.color).forEach(element => {
          if(e.includes(element)){
            boolColor = false
          }          
        });
        return boolColor
      }) */
      const copiaSwatches = this.swatches.map((e) => e.slice())

      return copiaSwatches.map((columnColors) => {
        columnColors.forEach((color) => {
          this.orderCategory
            .map((order) => order.color)
            .forEach((colorCategory) => {
              if (color.includes(colorCategory)) {
                const index = columnColors.indexOf(colorCategory)
                columnColors.splice(index, 1)
              }
            })
        })
        return columnColors
      })
    },
    localNeedToSave() {
      const compareItems = (A, B) => {
        return this._.isEqual(A, B)
      }
      if (this.editedIndex === -1) {
        return !compareItems(this.newOrderCategory, this.defaultItem)
      }
      const propertiesToCheck = ['desc', 'title', 'order', 'color']
      return propertiesToCheck.some((p) => {
        if (p === 'order') {
          return !compareItems(
            Number(this.newOrderCategory[p]),
            this.editedItem[p]
          )
        }
        return !compareItems(this.newOrderCategory[p], this.editedItem[p])
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
    colorFormatted() {
      if (this.orderCategory) {
        this.newArray = this.swatches
        for (let j = 0; j < this.newArray.length; j++) {
          for (let i = 0; i < this.newArray[j].length; i++) {
            for (let x = 0; x < this.orderCategory.length; x++) {
              if (this.newArray[j][i] === this.orderCategory[x].color) {
                this.newArray[j].splice(i, 1)
              }
            }
          }
        }
      }
    },
    handleFocus(index) {
      this.$nextTick(() => {
        this.$refs.newOrderCategoryTemplateForm.$el[index].focus()
      })
    },
    handleFocusBtnActions() {
      if (!this.dialog) {
        return
      }
      setTimeout(() => {
        if (
          this.editedIndex === -1 &&
          this.$refs.newOrderCategoryTemplateForm.validate()
        ) {
          this.$refs.botonSave.$el.focus()
        } else if (this.editedIndex !== -1) {
          this.$refs.botonUpdate.$el.focus()
        }
      }, 200)
    },

    async handleUpdateOrderCategoryTemplate() {
      if (!this.$refs.newOrderCategoryTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          title: this.newOrderCategory.title,
          desc: this.newOrderCategory.desc,
          color: this.newOrderCategory.color,
          order: Number(this.newOrderCategory.order),
          id: this.editedItem.id,
        }
        await this.$store.dispatch(
          `admin/orders/update_orderCategory_template`,
          {
            objectToSend,
          }
        )
        this.cleanUp()
        this.$mainAlertSuccess(this.$t('successTemplateUpdate'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('embarrassingError'))
      }
      this.save()
    },
    async handleAddOrderCategoryTemplate() {
      if (!this.$refs.newOrderCategoryTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          title: this.newOrderCategory.title,
          desc: this.newOrderCategory.desc,
          order: Number(this.newOrderCategory.order),
          color: this.newOrderCategory.color,
        }
        await this.$store.dispatch(`admin/orders/add_orderCategory_templates`, {
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
    handleCancel() {
      this.cleanUp()
      this.close()
    },
    cleanUp() {
      if (!this.$refs.newOrderCategoryTemplateForm) return
      this.$refs.newOrderCategoryTemplateForm.resetValidation()
      this.$nextTick(() => {
        this.newOrderCategory = Object.assign({}, this.defaultItem)
      })
    },
    async initialize() {
      const _type = 'orderCategory'
      this.loading = true
      try {
        const _orderCategory = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          _type
        )
        this.orderCategory =
          _orderCategory && _orderCategory.length ? [..._orderCategory] : []
        this.loading = false
        // this.colorFormatted()
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    editItem(item) {
      this.editedIndex = this.orderCategory.indexOf(item)
      // this.editedItem = Object.assign({}, item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newOrderCategory.title = this.editedItem.title
      this.newOrderCategory.desc = this.editedItem.desc
      this.newOrderCategory.order = this.editedItem.order
      this.newOrderCategory.color = this.editedItem.color
      this.dialog = true
    },
    deleteItem(item) {
      this.editedIndex = this.orderCategory.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
      setTimeout(() => {
        this.$refs.botonCloseDelete.$el.focus()
      })
    },
    async deleteItemConfirm() {
      this.loading = true
      const type = 'orderCategory'
      const objectDelete = this.orderCategory[this.editedIndex]

      try {
        await this.$store.dispatch('admin/orders/delete_task_template', {
          objectDelete,
          type,
        })
        this.loading = false
        this.orderCategory.splice(this.editedIndex, 1)
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
      this.$refs.newOrderCategoryTemplateForm.resetValidation()
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
        Object.assign(this.orderCategory[this.editedIndex], this.editedItem)
      } else {
        this.orderCategory.push(this.editedItem)
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
