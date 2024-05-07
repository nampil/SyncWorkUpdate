<template>
  <div>
    <v-dialog
      v-model="dialog"
      :overlay="false"
      class="dialog-principal"
      max-width="1000px"
      transition="dialog-transition"
      scrollable
      :persistent="localNeedToSave"
    >
      <v-card class="elevation-0">
        <v-toolbar color="secondary" dense>
          <v-btn icon dark @click="handleCancel">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title class="d-flex aling-center">
            <!-- <v-icon v-if="!itemToEdit" class="mr-4" color="white"
              >mdi-clipboard-plus</v-icon
            >
            <v-icon v-if="itemToEdit" class="mr-4" color="white"
              >mdi-clipboard-edit</v-icon
            > -->

            {{ formTitle }}</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              v-if="!itemToEdit"
              text
              :loading="loading"
              @click="handleAddTaskTemplate()"
            >
              {{ $t('send') }}
            </v-btn>
            <v-btn
              v-else
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
            <v-form ref="newTasksTemplateForm">
              <v-row v-for="(clientOption, idx) in newTask.clients" :key="idx">
                <v-col cols="5">
                  <v-select
                    v-model="clientOption.client"
                    :items="clientsFormatted"
                    :label="$t('client')"
                    autofocus
                    outlined
                    :rules="clientRules"
                    clearable
                    hide-details="auto"
                    dense
                  ></v-select>
                </v-col>
                <v-col cols="5">
                  <v-select
                    v-model="clientOption.loanTypes"
                    :items="loanTypesFormatted[idx]"
                    :label="$t('loanTypes')"
                    outlined
                    multiple
                    :rules="loanTypesRules"
                    clearable
                    hide-details="auto"
                    dense
                  ></v-select>
                </v-col>
                <v-col cols="12" md="2" class="d-flex gap-8">
                  <v-btn
                    v-if="idx === newTask.clients.length - 1"
                    color="primary"
                    icon
                    @click="handleAddClientOption"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="newTask.clients.length > 1"
                    color="error"
                    icon
                    @click="handleDeleteClientOption(idx)"
                  >
                    <v-icon>mdi-delete-outline</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10">
                  <v-text-field
                    v-model="newTask.title"
                    :label="$t('title')"
                    :rules="titleRules"
                    dense
                    hide-details="auto"
                    outlined
                  ></v-text-field>
                </v-col>
                <div class="ml-3">
                  <v-switch
                    v-model="newTask.active"
                    class="switch-active"
                    :label="$t('active')"
                    hide-details="auto"
                  ></v-switch>
                </div>
                <v-col cols="12">
                  <v-textarea
                    v-model="newTask.desc"
                    :label="$t('description')"
                    :rules="descRules"
                    dense
                    hide-details="auto"
                    outlined
                  ></v-textarea>
                </v-col>

                <v-col cols="12">
                  <v-file-input
                    ref="templatePicturesInput"
                    accept="image/png, image/jpeg, application/pdf"
                    :prepend-icon="'mdi-camera'"
                    :label="$t('imgInput')"
                    class="input-file"
                    multiple
                    outlined
                    hide-details="auto"
                    dense
                    truncate-length="15"
                    @change="handleInputFiles($event)"
                  ></v-file-input>
                  <div
                    v-if="picturesToShow && picturesToShow.length"
                    class="previews mt-3"
                  >
                    <div
                      v-for="(pic, j) in picturesToShow"
                      :key="j"
                      class="preview text-right"
                    >
                      <img
                        v-if="pic.type.includes('image')"
                        :src="pic.url"
                        alt=""
                        height="90px"
                        width="90px"
                      />
                      <div
                        v-if="pic.type.includes('pdf')"
                        class="file-preview d-flex align-center justify-center"
                      >
                        <v-icon large>mdi-file-pdf-box</v-icon>
                      </div>
                      <v-btn
                        icon
                        class="delete-icon"
                        @click="handleDeletePic(pic)"
                      >
                        <v-icon color="error" small>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-combobox
                    v-model="newTask.itemsForInvoices"
                    :items="itemsForInvoicesTemplates"
                    item-text="title"
                    item-value="title"
                    :label="$t('itemsForInvoices')"
                    outlined
                    multiple
                    clearable
                    small-chips
                    hide-details="auto"
                    :disabled="loanTypesSelected.length === 0"
                    dense
                    @input="handleItems($event)"
                    ><!-- eslint-disable-next-line -->
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('No results matching what was') }}
                            "<strong>{{ $t('added') }}</strong
                            >",
                            {{ $t('Press') }}
                            <kbd>{{ $t('enter') }}</kbd>
                            {{ $t('to create a new one') }}.
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template></v-combobox
                  >
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-model="newTask.materialsOrTools"
                    :items="materialsOrTools"
                    item-text="title"
                    item-value="title"
                    :label="$t('materialsOrTools')"
                    outlined
                    multiple
                    clearable
                    small-chips
                    hide-details="auto"
                    dense
                    @input="handleMaterial($event)"
                  >
                    <!-- eslint-disable-next-line -->
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('No results matching what was') }}
                            "<strong>{{ $t('added') }}</strong
                            >",
                            {{ $t('Press') }}
                            <kbd>{{ $t('enter') }}</kbd>
                            {{ $t('to create a new one') }}.
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template></v-combobox
                  >
                </v-col>

                <v-col cols="12">
                  <v-checkbox
                    v-model="newTask.needProcessTimes"
                    hide-details="auto"
                    :label="
                      $t(
                        'Do this task require pictures for before, during and after?'
                      )
                    "
                    dense
                  ></v-checkbox>
                </v-col>
                <v-col cols="12">
                  <v-form
                    v-if="requirementsFormatted"
                    ref="formRequirement"
                    class="task-form"
                    lazy-validation
                  >
                    <div
                      v-for="(type, j) in itemsFormatted"
                      :key="j"
                      class="mb-2"
                    >
                      <span class="sub-title">{{ type }}</span>
                      <v-btn
                        class="ml-1"
                        color="primary"
                        small
                        icon
                        @click="handleShowAddRequirements(type)"
                        ><v-icon>mdi-plus-circle</v-icon></v-btn
                      >
                      <section
                        v-if="
                          requirementsFormatted[type] &&
                          requirementsFormatted[type].length
                        "
                      >
                        <requirements-list
                          :process-time="type"
                          :job-type="taskType"
                          :requirements="requirementsFormatted[type]"
                          :is-template="true"
                          @delete-requirement="deleteRequirement"
                          @edit-requirement="handleShowEditRequirement"
                          @swap="
                            handleSwapRequirements({
                              e: $event,
                              processTime: type,
                            })
                          "
                          @apply-autocomplete-requirement="
                            applyAutocompleteRequirement
                          "
                          @duplicate-requirement="handleDuplicateRequirement"
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
    <v-dialog
      v-model="showAddRequirements"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
      max-width="900px"
    >
      <add-requirements
        v-if="showAddRequirements"
        :need-process="true"
        :last-positions-req="lastPositionsReq"
        :type="typeRequirementSelected"
        :task-type="taskType"
        @close-requirements="showAddRequirements = false"
        @new-requirements="handleAddRequirements"
        @update-persistent="validatePersistent = $event"
      />
    </v-dialog>
    <v-dialog
      v-model="showEditRequirement"
      max-width="900px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <edit-requirement
        v-if="showEditRequirement"
        :edited-requirement="editedRequirement"
        :need-process="true"
        :task-type="taskType"
        :last-positions-req="lastPositionsReq"
        @update-persistent="validatePersistent = $event"
        @update-requirement="handleUpdateRequirement"
        @close="showEditRequirement = false"
      />
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
import RequirementsList from '~/components/orders/requirements/RequirementsList.vue'
import AddRequirements from '~/components/orders/requirements/AddRequirements.vue'
import EditRequirement from '~/components/orders/requirements/EditRequirement.vue'
import ApplyAutocompleteRequirementModal from '~/components/orders/requirements/ApplyAutocompleteRequirementModal.vue'
import { TEMPLATES_TYPES } from '@/utils/dictionaries'
export default {
  name: 'AddTaskTemplate',
  components: {
    RequirementsList,
    AddRequirements,
    EditRequirement,
    ApplyAutocompleteRequirementModal,
  },
  props: {
    show: { type: Boolean, default: false },
    formTitle: { type: String, default: '' },
    itemToEdit: { type: [Object, null], default: null },
    taskType: { type: String, default: '' },
  },
  data() {
    return {
      titleRules: [(v) => !!v || this.$t('titleRequired')],
      descRules: [(v) => !!v || this.$t('descriptionRequired')],
      rules: [(v) => !!v || 'Required'],
      rulesItems: [(v) => (!!v && v.length !== 0) || 'Required'],
      clientRules: [(v) => !!v || 'Client is required'],
      loanTypesRules: [(v) => !!v.length || this.$t('loanTypesIsRequired')],
      rulesPrice: [
        (v) => !!v || this.$t('priceRequired'),
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      dialog: false,
      newTask: {
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
      clients: [],
      materialsOrTools: [],
      loanTypes: [],
      itemsForInvoicesTemplates: [],
      items: ['General', 'Before', 'During', 'After'],
      loading: false,
      files: [],
      localPictures: [],
      basePictures: [],
      showAddRequirements: false,
      showEditRequirement: false,
      editedRequirement: null,
      loadingItems: false,
      validatePersistent: false,
      typeRequirementSelected: '',
      baseRequirements: [],
      requirementsDelete: [],
      materialsOrToolsBase: [],
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
      showApplyAutocompleteRequirement: false,
      requirementsForApplyAutocomplete: [],
    }
  },

  computed: {
    picturesToShow() {
      const _pictures = []

      if (this.newTask.pictures?.length) {
        this.newTask.pictures.forEach((pic) => _pictures.push(pic))
      }
      if (this.localPictures?.length) {
        this.localPictures.forEach((pic) => _pictures.push(pic))
      }
      return _pictures
    },
    requirementsFormatted() {
      if (!this.newTask.requirements) return null
      const _requirementsFormatted = {}
      this.items.forEach((type) => {
        const _requirements = this.newTask.requirements
          .filter((req) => req[`from${type}`])
          .map((req) => ({ ...req, type }))
          .sort((a, b) => (a.position > b.position ? 1 : -1))
        _requirementsFormatted[type] = _requirements
      })
      return _requirementsFormatted
    },
    lastPositionsReq() {
      const _lastPositionReq = {}
      this.items.forEach((type) => {
        _lastPositionReq[type] = this.requirementsFormatted[type].length
      })
      return _lastPositionReq
    },
    clientsFormatted() {
      return this.clients.map((c) => c.title)
    },
    loanTypesFormatted() {
      return this.newTask.clients.map((priceOption) => {
        const indexOf = this.clients
          .map((o) => o.title)
          .indexOf(priceOption.client)
        if (indexOf > -1) {
          return this.clients[indexOf].loanTypes
        }
        return []
      })
    },
    loanTypesSelected() {
      if (!this.newTask.clients?.length) return []
      return this.newTask.clients
        .map((client) => {
          return client.loanTypes
        })
        .flat(1)
    },
    materialsOrToolsDelete() {
      return this.itemToEdit.materialsOrTools.filter((item) => {
        return !this.newTask.materialsOrTools.map((e) => e.id).includes(item.id)
      })
    },
    newMaterialsOrTools() {
      return this.newTask.materialsOrTools.filter((item) => {
        return !this.itemToEdit.materialsOrTools
          .map((e) => e.id)
          .includes(item.id)
      })
    },
    itemsFormatted() {
      if (this.newTask.needProcessTimes) {
        return this.items.filter((i) => i !== 'General')
      }
      return ['General']
    },
    localNeedToSave() {
      const compareItems = (A, B) => {
        return this._.isEqual(A, B)
      }
      if (!this.itemToEdit) {
        return !compareItems(this.newTask, this.defaultItem)
      }
      const propertiesToCheck = [
        'desc',
        'title',
        'active',
        'needProcessTimes',
        'clients',
        'itemsForInvoices',
        'materialsOrTools',
        'requirements',
      ]
      return propertiesToCheck.some((p) => {
        return !compareItems(this.newTask[p], this.itemToEdit[p])
      })
    },
    validateForm() {
      if (!this.itemToEdit && !this.localNeedToSave) {
        return true
      } else if (this.itemToEdit && !this.localNeedToSave) {
        return true
      }
      return false
    },
  },
  watch: {
    itemToEdit: {
      handler(val) {
        if (val) {
          this.newTask = structuredClone(val)
          this.basePictures = structuredClone(val.pictures)
          this.baseRequirements = structuredClone(val.requirements)
        } else {
          this.handleCancel()
        }
      },
      immediate: true,
      deep: true,
    },
    show(val) {
      if (this.dialog !== val) {
        this.dialog = val
        this.$refs.newTasksTemplateForm?.resetValidation()
      }
    },
    loanTypesSelected(newVal, oldVal) {
      if (this._.isEqual(newVal, oldVal)) return

      if (newVal !== null && newVal.length !== 0) {
        this.initializeItemsForInvoices()
      }
      if (newVal === null || newVal.length === 0) {
        this.itemsForInvoicesTemplates = []
      }
    },
    dialog(val) {
      if (!val && this.show) {
        this.handleCancel()
      }
    },
  },
  created() {
    this.initializeClients()
    this.initializeMaterialsOrTools()
  },
  methods: {
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
    async initializeMaterialsOrTools() {
      this.loading = true
      try {
        const _materialsOrTools = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          'tools'
        )
        this.materialsOrTools =
          _materialsOrTools && _materialsOrTools.length ? _materialsOrTools : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleSwapRequirements({ e, processTime }) {
      const { reqToMove, afterReq } = e
      if (reqToMove === afterReq) return
      const _requirements = this.newTask.requirements
        .filter((req) => req[`from${processTime}`])
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
    },
    setRequerimentsPosition(requirements) {
      requirements.forEach((req, i) => {
        if (req) {
          req.position = i + 1
        }
      })
    },
    handleCancel() {
      this.newTask = {
        title: '',
        desc: '',
        needProcessTimes: true,
        active: true,
        pictures: [],
        clients: [{ client: '', loanTypes: [], id: null }],
        itemsForInvoices: [],
        requirements: [],
        materialsOrTools: [],
      }
      this.basePictures = []
      this.baseRequirements = []
      this.localPictures = []
      this.files = []
      if (this.$refs.templatePicturesInput) {
        this.$refs.templatePicturesInput.reset()
      }
      this.$refs.newTasksTemplateForm?.resetValidation()

      this.$emit('close')
    },
    handleInputFiles(files) {
      if (!files) {
        return
      }
      files.forEach((file, i) => {
        if (!file) {
          return
        }
        const codeName =
          new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)
        file.codeName = codeName
        const reader = new FileReader()
        reader.onload = (event) => {
          const url = event.target.result
          this.localPictures.push({
            name: file.name,
            url,
            type: file.type,
            codeName: file.codeName,
          })
          this.files.push(file)
        }
        reader.readAsDataURL(file)
      })
    },
    handleDeletePic(pic) {
      const indexOfPic = this.localPictures
        .map((p) => p.codeName)
        .indexOf(pic.codeName)
      if (indexOfPic > -1) {
        this.localPictures.splice(indexOfPic, 1)
      }
      const indexOfPicInNewWDPictures = this.newTask.pictures
        .map((p) => p.codeName)
        .indexOf(pic.codeName)
      if (indexOfPicInNewWDPictures > -1) {
        this.newTask.pictures.splice(indexOfPicInNewWDPictures, 1)
      }
      if (this.files) {
        const indexOfPicFiles = this.files
          .map((p) => p.codeName)
          .indexOf(pic.codeName)

        if (indexOfPicFiles > -1) {
          this.files.splice(indexOfPicFiles, 1)
        }
      }
    },
    handleItems(items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const { active, ..._item } = item
        this.newTask.itemsForInvoices[i] = _item
        if (
          this.newTask.itemsForInvoices[i] &&
          isNaN(this.newTask.itemsForInvoices[i].id)
        ) {
          this.newTask.itemsForInvoices[i].id =
            '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
        }
        if (typeof item !== 'object') {
          this.newTask.itemsForInvoices[i] = {
            title: item,
            desc: '',
            price: '',
            unit: '',
            client: this.newTask.client,
            loanTypes: this.newTask.loanTypes,
            id:
              '' +
              new Date().getTime() +
              Math.floor(1000 + Math.random() * 9000),
          }
        }
      }
    },
    handleMaterial(materials) {
      for (let i = 0; i < materials.length; i++) {
        const material = materials[i]
        if (typeof material !== 'object') {
          this.newTask.materialsOrTools[i] = { title: material, desc: '' }
        }
      }
    },
    async initializeItemsForInvoices() {
      const clients = this.newTask.clients
      const _type = TEMPLATES_TYPES.itemsForInvoices
      this.loadingItems = true
      try {
        const promises = []

        clients.forEach((c) => {
          if (!c.client?.length && !c.loanTypes?.length) return
          const _itemsForClientsAndLoanTypes = this.$store.dispatch(
            'admin/orders/get_templatesItemsInvoicesForClient',
            {
              type: _type,
              client: c.client,
              loanTypes: c.loanTypes,
            }
          )
          promises.push(_itemsForClientsAndLoanTypes)
        })
        const results = await Promise.all(promises)
        this.itemsForInvoicesTemplates = results.flat(1)
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loadingItems = false
      }
    },
    handleShowAddRequirements(type) {
      this.typeRequirementSelected = type
      this.showAddRequirements = true
    },
    handleAddRequirements(newRequirements) {
      this.newTask.requirements.push(...newRequirements)
    },
    handleShowEditRequirement({ reqId, processTime }) {
      const idx = this.requirementsFormatted[processTime].findIndex(
        (req) => req.id === reqId
      )
      this.editedRequirement = this.requirementsFormatted[processTime][idx]
      this.showEditRequirement = true
    },
    handleUpdateRequirement(reqToUpdate) {
      const idx = this.newTask.requirements.findIndex(
        (req) => req.id === reqToUpdate.id
      )
      if (idx < 0) return
      this.newTask.requirements.splice(idx, 1, reqToUpdate)

      this.showEditRequirement = false
    },
    deleteRequirement({ reqId }) {
      const idx = this.newTask.requirements.findIndex((req) => req.id === reqId)
      this.requirementsDelete.push(this.newTask.requirements[idx])
      this.newTask.requirements.splice(idx, 1)
    },
    addMaterialsOrTools() {
      const newMaterial = {
        title: '',
      }
      this.newTask.materialsOrTools.unshift(newMaterial)
      this.$refs.formMaterialsOrTools.resetValidation()
      this.$nextTick(() => {
        this.$refs.formMaterialsOrTools.$el[1].focus()
      })
    },
    deleteMaterialsOrTools(material, index) {
      this.materialsOrToolsDelete.push(material)
      this.newTask.materialsOrTools.splice(index, 1)
    },
    validateObjectToSend() {
      let isValid = true
      let isValidR = true
      if (this.$refs.newTasksTemplateForm) {
        isValid = this.$refs.newTasksTemplateForm.validate()
      }
      if (
        this.newTask.requirements &&
        this.newTask.requirements.length &&
        this.newTask.requirements.filter(
          (r) => r.descRequirement === '' || !r.descRequirement.trim()
        ).length > 0
      ) {
        isValidR = false
      }
      return isValid && isValidR
    },
    removeTypeRequirement() {
      for (let i = 0; i < this.newTask.requirements.length; i++) {
        const { type, ...r } = this.newTask.requirements[i]
        this.newTask.requirements[i] = r
      }
    },
    handleDeleteClientOption(idx) {
      this.newTask.clients.splice(idx, 1)
    },
    handleAddClientOption() {
      this.newTask.clients.push({
        client: '',
        loanTypes: [],
        id: null,
      })
    },
    async handleAddTaskTemplate() {
      const type = this.taskType
      if (!this.validateObjectToSend()) {
        return
      }
      this.loading = true
      this.removeTypeRequirement()

      try {
        const promises = []
        for (let index = 0; index < this.newTask.clients.length; index++) {
          const _winterizationType = this.newTask.title
            .trim()
            .toUpperCase()
            .replace(/\s/g, '_')

          const objectToSend = {
            title: this.newTask.title.trim().replace('/', '-'),
            desc: this.newTask.desc,
            needProcessTimes: this.newTask.needProcessTimes,
            files: this.files,
            pictures: this.picturesToShow,
            client: this.newTask.clients[index].client || '',
            active: this.newTask.active || false,
            loanTypes: this.newTask.clients[index].loanTypes || [],
            itemsForInvoices: this.newTask.itemsForInvoices || [],
            ...(this.taskType === 'winterization' && {
              winterizationType: _winterizationType,
            }),
          }

          const promise = this.$store.dispatch(
            `admin/orders/add_task_templates`,
            {
              objectToSend,
              requirements: this.newTask.requirements.map((req) => {
                const { type, id, ...newReq } = req
                return newReq
              }),
              materialsOrTools: this.newTask.materialsOrTools,
              type,
            }
          )
          promises.push(promise)
        }
        await Promise.all(promises)
        this.loading = false
        this.handleCancel()
        this.$mainAlertSuccess(this.$t('successTemplateAdded'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.loading = false
        this.$mainAlertError(this.$t('embarrassingError'))
      }
    },
    async handleUpdateTaskTemplate() {
      const type = this.taskType
      if (!this.validateObjectToSend()) {
        return
      }
      this.loading = true
      try {
        const promises = []

        for (let index = 0; index < this.newTask.clients.length; index++) {
          const client = this.newTask.clients[index]
          const clientTemplateId = client.id
          const _winterizationType = this.newTask.title
            .trim()
            .toUpperCase()
            .replace(/\s/g, '_')

          const objectToSend = {
            id: clientTemplateId,
            title: this.newTask.title.trim().replace('/', '-'),
            desc: this.newTask.desc,
            needProcessTimes: this.newTask.needProcessTimes,
            files: this.files,
            pictures: this.picturesToShow,
            client: client.client,
            active: this.newTask.active,
            loanTypes: client.loanTypes,
            itemsForInvoices: this.newTask.itemsForInvoices || [],
            ...(this.taskType === 'winterization' && {
              winterizationType: _winterizationType,
            }),
          }

          if (clientTemplateId) {
            if (this.newTask.requirements?.length) {
              for (let i = 0; i < this.newTask.requirements.length; i++) {
                const requirement = this.newTask.requirements[i]

                if (requirement.pictures?.length) {
                  const picsToCopyRequiremet = requirement.pictures
                    .filter((pic) => {
                      return (
                        !requirement.files ||
                        !requirement.files.length ||
                        !requirement.files
                          .map((lp) => lp.codeName)
                          .includes(pic.codeName)
                      )
                    })
                    .map((_pic) => {
                      return {
                        ..._pic,
                        oldTemplateId: this.newTask.id,
                        oldRequirementId: requirement.id,
                      }
                    })
                  requirement.picsToCopyRequiremet = picsToCopyRequiremet
                }
              }
            }

            const promise = this.$store.dispatch(
              `admin/orders/update_task_template`,
              {
                objectToSend,
                requirements: this.newTask.requirements,
                type,
                newMaterialsOrTools: this.newMaterialsOrTools,
                materialsOrToolsDelete: this.materialsOrToolsDelete,
                requirementsDelete: this.requirementsDelete,
                basePictures: this.basePictures,
                baseRequirements: this.baseRequirements,
              }
            )
            promises.push(promise)
          } else {
            let picsToCopy = []

            if (objectToSend.pictures.length) {
              picsToCopy = this.picturesToShow
                .filter((pic) => {
                  return !this.localPictures
                    .map((lp) => lp.codeName)
                    .includes(pic.codeName)
                })
                .map((_pic) => {
                  return {
                    ..._pic,
                    oldTemplateId: this.newTask.id,
                  }
                })
            }

            const promise = this.$store.dispatch(
              `admin/orders/add_task_templates`,
              {
                objectToSend,
                requirements: this.newTask.requirements.map((req) => {
                  const { type, id, ...newReq } = req
                  return newReq
                }),
                materialsOrTools: this.newTask.materialsOrTools,
                type,
                ...(picsToCopy?.length && { picsToCopy }),
              }
            )
            promises.push(promise)
          }
        }
        await Promise.all(promises)
        this.handleCancel()
        this.$mainAlertSuccess(this.$t('successTemplateAdded'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('embarrassingError'))
      } finally {
        this.loading = false
      }
    },
    applyAutocompleteRequirement({ reqId, reqsList }) {
      if (!reqId && !reqsList) return
      if (reqId) {
        const idx = this.newTask.requirements.findIndex((r) => r.id === reqId)
        if (idx === -1) return
        this.requirementsForApplyAutocomplete = [this.newTask.requirements[idx]]
      }
      if (reqsList) {
        this.requirementsForApplyAutocomplete = [...reqsList]
      }
      this.showApplyAutocompleteRequirement = true
    },
    handleDuplicateRequirement({ requirement, taskId, processTime }) {
      const task = this.newTask
      const requirements = task.requirements
      const idxToDuplicate = requirements.findIndex(
        (req) => req.id === requirement.id
      )
      const req = requirements[idxToDuplicate]
      const oldDescRequirement = req.descRequirement.trim()

      const indexOfCopyText = oldDescRequirement.indexOf(' (copy')

      let descRequirement

      if (indexOfCopyText > -1) {
        const indexOfClosingBracked = oldDescRequirement.indexOf(
          ')',
          indexOfCopyText
        )
        const descFirstPart = oldDescRequirement.slice(0, indexOfCopyText)
        const descLastPart = oldDescRequirement.slice(indexOfClosingBracked + 1)

        const copyNumber = requirements
          .map((r) => r.descRequirement)
          .filter(
            (desc) => desc.includes(descFirstPart) && desc.includes(' (copy')
          ).length

        const copyText = ` (copy ${copyNumber + 1})`
        descRequirement = `${descFirstPart}${copyText}${
          descLastPart ? ' ' + descLastPart : ''
        }`
      } else {
        descRequirement = oldDescRequirement + ' (copy)'
      }

      const id = 'localReq' + this.$generateId()
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
      this.newTask.requirements.splice(idxToDuplicate + 1, 0, newReq)
    },
    handleRequirementForApplyAutocomplete(requirementsForAutocomplete) {
      this.showApplyAutocompleteRequirement = false
      if (!requirementsForAutocomplete) return
      let originalReqIdx = -1
      requirementsForAutocomplete.forEach((req, idx) => {
        const idxToSplice = this.newTask.requirements.findIndex(
          (_req) => _req.id === req.id
        )
        if (idxToSplice > -1) {
          originalReqIdx = idxToSplice
          this.newTask.requirements.splice(idxToSplice, 1, req)
        } else if (originalReqIdx > -1) {
          const id = 'localReq' + this.$generateId()
          this.newTask.requirements.splice(originalReqIdx + idx, 0, {
            ...req,
            id,
          })
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.dialog-principal {
  overflow: hidden;
}
.previews {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  .preview {
    width: 90px;
    height: 90px;
    padding: 0.3em;
    border: 1px solid #ddd;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .file-preview {
      height: 100%;
      width: 100%;
    }
    .delete-icon {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
.sub-title {
  font-size: 1.1rem;
}
</style>
