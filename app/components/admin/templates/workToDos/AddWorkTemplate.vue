<template>
  <div class="add-work-template">
    <v-overlay absolute :value="loadingTemplate">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>
    <header class="d-flex align-center justify-space-between gap-20">
      <h2 class="secction title | info--text text-h6 my-8">Work Template</h2>

      <div class="search-wrapper">
        <transition name="slide">
          <div v-if="searchigToCopy" class="search-box | flex-grow-1 d-flex">
            <v-autocomplete
              ref="titleInputs"
              :items="subtasksTemplatesFormatted"
              dense
              :loading="loadingTemplates"
              outlined
              hide-selected
              hide-details="auto"
              :label="'Search for template to copy'"
              @input="handleSelection"
            >
            </v-autocomplete>
          </div>
        </transition>
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="search-btn"
              icon
              v-bind="attrs"
              v-on="on"
              @click="searchigToCopy = !searchigToCopy"
            >
              <transition name="spin">
                <v-icon v-if="!searchigToCopy">mdi-magnify</v-icon>
              </transition>
              <transition name="spin">
                <v-icon v-if="searchigToCopy">mdi-close</v-icon>
              </transition>
            </v-btn>
          </template>
          <span>{{
            !searchigToCopy ? 'Search for template to copy' : 'Close Search'
          }}</span>
        </v-tooltip>
      </div>
    </header>

    <v-row v-if="workTemplate">
      <v-col cols="12">
        <v-textarea
          ref="descField"
          v-model="workTemplateDesc"
          :label="'Describe the work to do'"
          rows="8"
          auto-grow
          :rules="rules"
          dense
          outlined
          hide-details="auto"
        ></v-textarea>
      </v-col>

      <v-col cols="12">
        <v-textarea
          ref="instructionsField"
          v-model="workTemplateInst"
          label="Instructions for OOS"
          rows="2"
          auto-grow
          dense
          outlined
          hide-details="auto"
        ></v-textarea>
      </v-col>
      <div>
        <h2 class="secction title | info--text text-h6 my-8 mb-0 ml-3">
          Estimated Time to Complete
        </h2>
      </div>
    </v-row>

    <v-row v-if="workTemplate">
      <v-col cols="3">
        <v-text-field
          v-model="workTemplateECThours"
          label="Hours"
          dense
          hide-details="auto"
          outlined
          :rules="rulesECT"
          @keydown.enter.exact.prevent
        ></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field
          v-model="workTemplateECTminutes"
          label="Minutes"
          dense
          hide-details="auto"
          outlined
          :rules="rulesECT"
          @keydown.enter.exact.prevent
        ></v-text-field>
      </v-col>

      <v-col cols="12">
        <v-checkbox
          v-model="needProcessTimes"
          class="mt-4"
          hide-details="auto"
          :label="
            $t('Do this task require pictures for before, during and after?')
          "
          dense
        ></v-checkbox>
      </v-col>
      <v-col cols="12">
        <div class="mb-2 text-h6 mt-4 info--text">Example Pictures</div>

        <div v-if="needProcessTimes && PROCESS_TIME_TYPES">
          <v-row>
            <v-col>
              <div class="mb-2 info--text">{{ PROCESS_TIME_TYPES.before }}</div>
              <v-file-input
                :ref="`${PROCESS_TIME_TYPES.before}PicInput`"
                v-model="files[PROCESS_TIME_TYPES.before]"
                class="mb-2"
                accept="image/png, image/jpeg, application/pdf"
                prepend-icon="mdi-paperclip"
                :label="$t('fileInput')"
                hide-details="auto"
                multiple
                outlined
                dense
                truncate-length="15"
                @click="$event.target.value = ''"
                @change="
                  handleInputFiles({
                    files: $event,
                    processTime: PROCESS_TIME_TYPES.before,
                    refName: `${PROCESS_TIME_TYPES.before}PicInput`,
                  })
                "
              ></v-file-input>
              <div
                v-if="workTemplate.pictures && workTemplate.pictures.length"
                class="previews | mb-0"
              >
                <div
                  v-for="(pic, j) in workTemplate.pictures.filter(
                    (p) =>
                      p.forProcessTime === PROCESS_TIME_TYPES.before ||
                      !p.forProcessTime
                  )"
                  :key="j"
                  class="preview | text-right"
                >
                  <img
                    v-if="pic.type.includes('image')"
                    :src="pic.url"
                    alt=""
                    height="100px"
                    width="100px"
                    @click="handleShowImagesSlides(workTemplate.pictures, pic)"
                  />
                  <div
                    v-if="pic.type.includes('pdf')"
                    class="file-preview d-flex align-center justify-center"
                    @click="handleViewPdf(pic.url)"
                  >
                    <v-icon large>mdi-file-pdf-box</v-icon>
                  </div>
                  <v-tooltip open-delay="600" content-class="small" top>
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        class="delete-icon"
                        small
                        v-bind="attrs"
                        v-on="on"
                        @click="deletePictureFromWorkTemplate(pic)"
                      >
                        <v-icon color="error" small>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('deleteImage') }}</span>
                  </v-tooltip>
                </div>
              </div>
            </v-col>
            <v-col>
              <div class="mb-2 info--text">{{ PROCESS_TIME_TYPES.during }}</div>
              <v-file-input
                :ref="`${PROCESS_TIME_TYPES.during}PicInput`"
                v-model="files[PROCESS_TIME_TYPES.during]"
                class="mb-2"
                accept="image/png, image/jpeg, application/pdf"
                prepend-icon="mdi-paperclip"
                :label="$t('fileInput')"
                hide-details="auto"
                multiple
                outlined
                dense
                truncate-length="15"
                @click="$event.target.value = ''"
                @change="
                  handleInputFiles({
                    files: $event,
                    processTime: PROCESS_TIME_TYPES.during,
                    refName: `${PROCESS_TIME_TYPES.during}PicInput`,
                  })
                "
              ></v-file-input>
              <div
                v-if="workTemplate.pictures && workTemplate.pictures.length"
                class="previews | mb-0"
              >
                <div
                  v-for="(pic, j) in workTemplate.pictures.filter(
                    (p) => p.forProcessTime === PROCESS_TIME_TYPES.during
                  )"
                  :key="j"
                  class="preview | text-right"
                >
                  <img
                    v-if="pic.type.includes('image')"
                    :src="pic.url"
                    alt=""
                    height="100px"
                    width="100px"
                    @click="handleShowImagesSlides(workTemplate.pictures, pic)"
                  />
                  <div
                    v-if="pic.type.includes('pdf')"
                    class="file-preview d-flex align-center justify-center"
                    @click="handleViewPdf(pic.url)"
                  >
                    <v-icon large>mdi-file-pdf-box</v-icon>
                  </div>
                  <v-tooltip open-delay="600" content-class="small" top>
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        class="delete-icon"
                        v-bind="attrs"
                        v-on="on"
                        @click="deletePictureFromWorkTemplate(pic)"
                      >
                        <v-icon color="error" small>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('deleteImage') }}</span>
                  </v-tooltip>
                </div>
              </div>
            </v-col>
            <v-col>
              <div class="mb-2 info--text">{{ PROCESS_TIME_TYPES.after }}</div>
              <v-file-input
                :ref="`${PROCESS_TIME_TYPES.after}PicInput`"
                v-model="files[PROCESS_TIME_TYPES.after]"
                class="mb-2"
                accept="image/png, image/jpeg, application/pdf"
                prepend-icon="mdi-paperclip"
                :label="$t('fileInput')"
                hide-details="auto"
                multiple
                outlined
                dense
                truncate-length="15"
                @click="$event.target.value = ''"
                @change="
                  handleInputFiles({
                    files: $event,
                    processTime: PROCESS_TIME_TYPES.after,
                    refName: `${PROCESS_TIME_TYPES.after}PicInput`,
                  })
                "
              ></v-file-input>
              <div
                v-if="workTemplate.pictures && workTemplate.pictures.length"
                class="previews | mb-0"
              >
                <div
                  v-for="(pic, j) in workTemplate.pictures.filter(
                    (p) => p.forProcessTime === PROCESS_TIME_TYPES.after
                  )"
                  :key="j"
                  class="preview | text-right"
                >
                  <img
                    v-if="pic.type.includes('image')"
                    :src="pic.url"
                    alt=""
                    height="100px"
                    width="100px"
                    @click="handleShowImagesSlides(workTemplate.pictures, pic)"
                  />
                  <div
                    v-if="pic.type.includes('pdf')"
                    class="file-preview d-flex align-center justify-center"
                    @click="handleViewPdf(pic.url)"
                  >
                    <v-icon large>mdi-file-pdf-box</v-icon>
                  </div>
                  <v-tooltip open-delay="600" content-class="small" top>
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        class="delete-icon"
                        v-bind="attrs"
                        v-on="on"
                        @click="deletePictureFromWorkTemplate(pic)"
                      >
                        <v-icon color="error" small>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('deleteImage') }}</span>
                  </v-tooltip>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <v-row v-else>
          <v-col>
            <v-file-input
              ref="GeneralPicInput"
              v-model="files.General"
              class="mb-2"
              accept="image/png, image/jpeg, application/pdf"
              prepend-icon="mdi-paperclip"
              :label="$t('fileInput')"
              hide-details="auto"
              multiple
              outlined
              dense
              truncate-length="15"
              @click="$event.target.value = ''"
              @change="
                handleInputFiles({
                  files: $event,
                  refName: 'GeneralPicInput',
                  processTime: 'General',
                })
              "
            ></v-file-input>
            <div
              v-if="workTemplate.pictures && workTemplate.pictures.length"
              class="previews | mb-0"
            >
              <div
                v-for="(pic, j) in workTemplate.pictures"
                :key="j"
                class="preview | text-right"
              >
                <img
                  v-if="pic.type.includes('image')"
                  :src="pic.url"
                  alt=""
                  height="100px"
                  width="100px"
                  @click="handleShowImagesSlides(workTemplate.pictures, pic)"
                />
                <div
                  v-if="pic.type.includes('pdf')"
                  class="file-preview d-flex align-center justify-center"
                  @click="handleViewPdf(pic.url)"
                >
                  <v-icon large>mdi-file-pdf-box</v-icon>
                </div>
                <v-tooltip open-delay="600" content-class="small" top>
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      class="delete-icon"
                      v-bind="attrs"
                      v-on="on"
                      @click="deletePictureFromWorkTemplate(pic)"
                    >
                      <v-icon color="error" small>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('deleteImage') }}</span>
                </v-tooltip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <div class="mb-2 info--text text-h6 mt-4">Requirements</div>
        <div
          v-if="requirementsFormatted"
          ref="formRequirement"
          class="requirements-wraper"
          :class="{
            'has-error': requirementsHasError,
          }"
        >
          <div
            v-for="(type, j) in preccesTimeOptionsFormatted"
            :key="j"
            class="mb-2"
          >
            <header class="d-flex align-center gap-8">
              <span class="sub-title | info--text">{{ type }}</span>

              <v-tooltip
                v-if="
                  requirementsFormatted?.[type]?.some(
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
                        reqsList: requirementsFormatted[type],
                      })
                    "
                    ><v-icon>mdi-plus-circle-multiple-outline</v-icon></v-btn
                  >
                </template>
                <span>{{
                  `Apply auto-reapeat to all requirements for ${type}`
                }}</span>
              </v-tooltip>
              <v-btn
                class="ml-1"
                color="primary"
                small
                icon
                @click="handleShowAddRequirements(type)"
                ><v-icon>mdi-plus-circle</v-icon></v-btn
              >
            </header>

            <section v-if="loadingRequirements">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </section>
            <section
              v-else-if="
                requirementsFormatted[type] &&
                requirementsFormatted[type].length
              "
            >
              <requirements-list
                :process-time="type"
                :job-type="JOB_TYPES.workToDos"
                :requirements="requirementsFormatted[type]"
                :is-template="true"
                @delete-requirement="
                  deleteRequirementOnWorkTemplate($event.reqId)
                "
                @edit-requirement="handleShowEditRequirement"
                @swap="
                  handleSwapRequirements({
                    e: $event,
                    processTime: type,
                  })
                "
                @apply-autocomplete-requirement="applyAutocompleteRequirement"
                @duplicate-requirement="duplicateRequirement"
              />
            </section>
          </div>
        </div>
      </v-col>
      <v-col cols="12">
        <v-combobox
          v-model="workTemplateMaterialsOrTools"
          :items="materialsOrToolsList"
          item-text="title"
          item-value="title"
          :label="$t('materialsOrTools')"
          outlined
          multiple
          clearable
          small-chips
          hide-details="auto"
          dense
        >
          <!-- @input="handleMaterial($event)" -->
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
    </v-row>
    <v-dialog
      v-model="showAddRequirements"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
      max-width="900px"
    >
      <AddRequirements
        v-if="showAddRequirements"
        :need-process="true"
        :last-positions-req="lastPositionsReq"
        :type="typeRequirementSelected"
        :task-type="JOB_TYPES.workToDos"
        @close-requirements="showAddRequirements = false"
        @new-requirements="addRequirementsToWorkTemplate"
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
      <EditRequirement
        v-if="showEditRequirement"
        :edited-requirement="editedRequirement"
        :need-process="true"
        :task-type="JOB_TYPES.workTodos"
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
      <ApplyAutocompleteRequirementModal
        :requirements="requirementsForApplyAutocomplete"
        :is-solo="requirementsForApplyAutocomplete.length === 1"
        @close="handleRequirementForApplyAutocomplete"
      />
    </v-dialog>
    <slide-show
      :list="listPictures"
      :show="showImagesSlides"
      :title="$t('ImagesView') + ' ' + $t(JOB_TYPES.workTodos)"
      type="images"
      :index-selected="indexOfImage"
      @close="showImagesSlides = false"
    />
    <v-dialog v-model="showPdfViewer" fullscreen>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import PdfViewer from '~/components/misc/PdfViewer.vue'
import SlideShow from '~/components/misc/SlideShow.vue'
import AddRequirements from '~/components/orders/requirements/AddRequirements.vue'
import ApplyAutocompleteRequirementModal from '~/components/orders/requirements/ApplyAutocompleteRequirementModal.vue'
import EditRequirement from '~/components/orders/requirements/EditRequirement.vue'
import RequirementsList from '~/components/orders/requirements/RequirementsList.vue'
import { JOB_TYPES, PROCESS_TIME_TYPES } from '~/utils/dictionaries'

const { mapState, mapActions, /*  mapGetters, */ mapMutations } =
  createNamespacedHelpers('admin/itemForInvoiceTemplates')

export default {
  name: 'AddWorkTemplate',
  components: {
    RequirementsList,
    AddRequirements,
    EditRequirement,
    ApplyAutocompleteRequirementModal,
    PdfViewer,
    SlideShow,
  },
  props: {
    taskTitle: { type: String, default: '' },
    eiditing: { type: Boolean, default: false },
    closing: { type: Boolean, default: false },
    itemToEdit: { type: [Object, null], default: null },
  },
  data() {
    return {
      JOB_TYPES,
      PROCESS_TIME_TYPES,
      rules: [(v) => !!v || this.$t('thisFieldRequired')],
      rulesECT: [(v) => !isNaN(v) || this.$t('onlyNumbersRequired')],
      loadingTemplate: false,
      loadingTemplates: false,
      loadingRequirements: false,
      templates: [],
      searchigToCopy: false,
      typeRequirementSelected: '',
      showAddRequirements: false,
      validatePersistent: false,
      showEditRequirement: false,
      editedRequirement: null,
      showApplyAutocompleteRequirement: false,
      requirementsForApplyAutocomplete: [],
      previewUrl: '',
      showPdfViewer: false,
      showImagesSlides: false,
      listPictures: [],
      indexOfImage: 0,
      files: {},
      requirementsHasError: false,
      materialsOrToolsList: [],
    }
  },
  computed: {
    ...mapState({
      _workTemplate: (state) => state.workTemplate,
      workTemplateValidation: (state) => state.workTemplateValidation,
    }),
    isEditing() {
      return !!this.itemToEdit
    },

    workTemplate: {
      get() {
        return this._workTemplate
      },
      set(payload) {
        this.setWorkTemplate(payload)
      },
    },
    title: {
      get() {
        return this._workTemplate?.title
      },
      set(payload) {
        this.updateWorkTemplate({ title: payload })
      },
    },
    workTemplateDesc: {
      get() {
        return this._workTemplate?.desc
      },
      set(payload) {
        this.updateWorkTemplate({ desc: payload })
      },
    },
    workTemplateInst: {
      get() {
        return this._workTemplate?.instructions || ''
      },
      set(payload) {
        this.updateWorkTemplate({ instructions: payload })
      },
    },

    workTemplateECThours: {
      get() {
        return this._workTemplate?.ect?.hours || '0'
      },
      set(payload) {
        this.updateWorkTemplate({
          ect: { hours: payload, minutes: this._workTemplate?.ect?.minutes },
        })
      },
    },

    workTemplateECTminutes: {
      get() {
        return this._workTemplate?.ect?.minutes || '0'
      },
      set(payload) {
        this.updateWorkTemplate({
          ect: { hours: this._workTemplate?.ect?.hours, minutes: payload },
        })
      },
    },

    workTemplateMaterialsOrTools: {
      get() {
        return this._workTemplate?.materialsOrTools
      },
      set(payload) {
        const materialsOrTools = payload.map((m) => {
          if (typeof m !== 'object') {
            return { title: m, desc: m }
          }
          return m
        })
        this.updateWorkTemplate({ materialsOrTools })
      },
    },
    workTemplateRequirements() {
      return this.workTemplate?.requirements
    },

    needProcessTimes: {
      get() {
        return this._workTemplate?.needProcessTimes
      },
      set(payload) {
        this.updateWorkTemplate({ needProcessTimes: payload })
      },
    },

    processTimeOptions() {
      const { before, during, after } = PROCESS_TIME_TYPES
      return [before, during, after, 'General']
    },
    preccesTimeOptionsFormatted() {
      if (this.workTemplate?.needProcessTimes) {
        return this.processTimeOptions.filter((i) => i !== 'General')
      }
      return ['General']
    },
    dummyTasks() {
      return this.$store.state.order.dummyTasks
    },
    subtasksTemplatesFormatted() {
      return this.templates.map((template) => {
        return {
          text: template.title.trim().replace('/', '-'),
          value: template.id,
          desc: template.desc,
          needProcessTimes: template.needProcessTimes,
          requirements: template.requirements || [],
          materialsOrTools: template.materialsOrTools || [],
          pictures: template.pictures || [],
        }
      })
    },
    requirementsFormatted() {
      if (!this.workTemplate?.requirements) return null
      const _requirementsFormatted = {}
      for (let idx = 0; idx < this.processTimeOptions.length; idx++) {
        const type = this.processTimeOptions[idx]
        const _requirements = this.workTemplate.requirements
          .filter((req) => req[`from${type}`])
          .map((req) => ({ ...req, type }))
          .sort((a, b) => (a.position > b.position ? 1 : -1))
        _requirementsFormatted[type] = _requirements
      }
      return _requirementsFormatted
    },
    lastPositionsReq() {
      const _lastPositionReq = {}
      this.processTimeOptions.forEach((option) => {
        _lastPositionReq[option] = this.requirementsFormatted[option].length
      })
      return _lastPositionReq
    },
  },
  watch: {
    taskTitle: {
      handler(val) {
        this.title = val
      },
      immediate: true,
    },
    workTemplateRequirements(val) {
      if (!val) return

      if (val.length) {
        this.requirementsHasError = false
      }
    },
    workTemplateValidation: {
      handler(val) {
        if (val && !val.requirements) this.requirementsHasError = true
      },
      deep: true,
    },
    isEditing: {
      handler(val) {
        if (val && this.itemToEdit?.workTemplateId) {
          this.handleGetWorkTemplate({
            workTemplateId: this.itemToEdit.workTemplateId,
          })
        }
      },
      immediate: true,
    },
    closing(val) {
      if (val) {
        this.initFiles()
        this.setInitialWorkTemplate()

        this.$emit('cleared')
      }
    },
  },
  mounted() {
    this.initFiles()
    this.setInitialWorkTemplate()
    this.initializeMaterialsOrTools()
    this.getTemplates()
  },
  methods: {
    ...mapMutations({
      setWorkTemplate: 'set_workTemplate',
      updateWorkTemplate: 'update_workTemplate',
      updateRequirementOnWorkTemplate: 'update_requirementOnWorkTemplate',
      addPictureToWorkTemplate: 'add_pictureToWorkTemplate',
      addFileToWorkTemplate: 'add_fileToWorkTemplate',
      deletePictureFromWorkTemplate: 'delete_pictureFromWorkTemplate',
      deleteRequirementOnWorkTemplate: 'delete_requirementOnWorkTemplate',
      addRequirementsToWorkTemplate: 'add_requirementsToWorkTemplate',
      setWorkTemplateValidation: 'set_workTemplateValidation',
      setOriginalWorkTemplate: 'set_originalWorkTemplate',
    }),
    ...mapActions({
      duplicateRequirement: 'duplicate_requirement',
      autocompleteRequirementOnWorkTemplate:
        'autocomplete_requirementOnWorkTemplate',
      getWorkTemplate: 'get_workTemplate',
      validateWorkTemplate: 'validate_workTemplate',
    }),
    async handleGetWorkTemplate({ workTemplateId }) {
      try {
        this.loadingTemplate = true
        const templateInStore = this.getWorkTemplate({
          workTemplateId,
          isEditing: this.isEditing,
          tashkTile: this.taskTitle,
        })
        // const reqsInStore = this.handleGetRequirementsForTemplate({
        //   templateId: workTemplateId,
        // })
        // const toolsInStore = this.handleGetMaterialsOrToolsForTemplate({
        //   templateId: workTemplateId,
        // })

        await Promise.all([templateInStore])
      } catch (error) {
        // eslint-disable-next-line
        console.log(
          `error geting workTemplate for workTemplateId: ${workTemplateId} `,
          error
        )
        this.$mainAlertError(
          `There was an error getting the work template for ${this.taskTitle}. Please try again later. If problem persists, contact support.`
        )
      } finally {
        this.loadingTemplate = false
      }
    },
    async initializeMaterialsOrTools() {
      this.loadingMaterialsOrTools = true
      try {
        const _materialsOrTools = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          'tools'
        )
        this.materialsOrToolsList =
          _materialsOrTools && _materialsOrTools.length ? _materialsOrTools : []
      } catch (error) {
        // eslint-disable-next-line
        console.log('loading Materials or Tools', error)

        this.$mainAlertError(
          'Error loading Materials or Tools, please try again later. If Problem persists, contact support '
        )
      } finally {
        this.loadingMaterialsOrTools = false
      }
    },
    setInitialWorkTemplate() {
      const id = `local-${this.$generateId()}`
      this.workTemplate = {
        ...this.dummyTasks[JOB_TYPES.workToDos],
        id,
        title: this.taskTitle,
      }
      this.setWorkTemplateValidation(null)
      this.setOriginalWorkTemplate(null)
    },
    async getTemplates(type) {
      const _type = 'workToDos'
      this.loadingTemplates = true
      try {
        this.templates = await this.$store.dispatch(
          'admin/orders/get_tasks_templates_active',
          _type
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loadingTemplates = false
      }
    },
    async handleSelection(templateSalectedId) {
      const templateSelected = this.templates.find(
        (template) => template.id === templateSalectedId
      )
      if (!templateSelected) return
      const _requirements = await this.handleGetRequirementsForTemplate({
        templateId: templateSalectedId,
      })
      const _materialsOrTools = await this.handleGetMaterialsOrToolsForTemplate(
        {
          templateId: templateSalectedId,
        }
      )

      const { pictures, itemsForInvoices, client, loanTypes, ...template } =
        templateSelected

      const id = `local-${this.$generateId()}`
      this.workTemplate = {
        ...template,
        id,
        title: this.taskTitle.trim().replace('/', '-'),
        pictures: [...pictures],
        requirements: _requirements ?? [],
        materialsOrTools: _materialsOrTools ?? [],
      }

      this.searchigToCopy = false
      this.$emit('work-template-id', id)
    },
    //  handleMaterial(materials) {
    //   for (let i = 0; i < materials.length; i++) {
    //     const material = materials[i]
    //     if (typeof material !== 'object') {
    //       this.newTask.materialsOrTools[i] = { title: material, desc: '' }
    //     }
    //   }
    // },

    async handleGetMaterialsOrToolsForTemplate({ templateId }) {
      try {
        let _tools = []
        this.loadingTools = true
        _tools = await this.$store.dispatch(
          'admin/orders/get_materialsOrToolsForTemplate',
          { type: JOB_TYPES.workToDos, templateId }
        )
        return _tools
      } catch (error) {
        // eslint-disable-next-line
        console.log('error loading _tools', error)
        this.$mainAlertError(
          'There was an error loading Materials or tools for this template, please try later. If problem persists, contact support'
        )
        return null
      } finally {
        this.loadingTools = false
      }
    },

    async handleGetRequirementsForTemplate({ templateId }) {
      try {
        let _requirements = []
        this.loadingRequirements = true
        _requirements = await this.$store.dispatch(
          'admin/orders/get_requirementsForTemplate',
          { type: JOB_TYPES.workToDos, templateId }
        )
        return _requirements
      } catch (error) {
        // eslint-disable-next-line
        console.log('error loading requirements', error)
        this.$mainAlertError(
          'There was an error loading requirements for this template, please try later. If problem persists, contact support'
        )
        return null
      } finally {
        this.loadingRequirements = false
      }
    },

    initFiles() {
      this.files = {}
      for (const option of this.processTimeOptions) {
        this.files[option] = []
      }
    },
    handleInputFiles({ files, processTime, refName }) {
      if (!this.workTemplate.files) {
        this.workTemplate.files = []
      }
      if (!this.workTemplate.pictures) {
        this.workTemplate.pictures = []
      }
      files.forEach((file, i) => {
        if (!file) {
          return
        }
        const codeName = this.$generateId()
        file.codeName = codeName
        const reader = new FileReader()
        reader.onload = (event) => {
          const url = event.target.result
          this.addPictureToWorkTemplate({
            url,
            type: file.type,
            codeName: file.codeName,
            forProcessTime: processTime || 'General',
          })
          this.addFileToWorkTemplate(file)
        }
        reader.readAsDataURL(file)
      })

      this.files[processTime] = []
    },
    handleShowAddRequirements(processTime) {
      this.typeRequirementSelected = processTime
      this.showAddRequirements = true
    },
    // createFiles(taskId) {},
    handleViewPdf(url) {
      this.previewUrl = url
      this.showPdfViewer = true
    },
    handleClosePdfViewer() {
      this.previewUrl = ''
      this.showPdfViewer = false
    },

    handleShowImagesSlides(pictures, pic) {
      this.showImagesSlides = true
      this.listPictures = pictures.filter((pic) => pic.type.includes('image'))
      const idx = this.listPictures.findIndex(
        (p) => p.codeName === pic.codeName
      )
      if (idx !== -1) {
        this.indexOfImage = idx
      }
    },

    handleShowEditRequirement({ reqId, processTime }) {
      const idx = this.requirementsFormatted[processTime].findIndex(
        (req) => req.id === reqId
      )
      this.editedRequirement = this.requirementsFormatted[processTime][idx]
      this.showEditRequirement = true
    },

    handleSwapRequirements({ e, processTime }) {
      const { reqToMove, afterReq } = e
      if (reqToMove === afterReq) return
      const _requirements = this.workTemplate.requirements
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
          this.updateRequirementOnWorkTemplate({
            ...req,
            position: i + 1,
          })
        }
      })
    },

    applyAutocompleteRequirement({ reqId, reqsList }) {
      if (!reqId && !reqsList) return
      if (reqId) {
        const idx = this.workTemplate.requirements.findIndex(
          (r) => r.id === reqId
        )
        if (idx === -1) return
        this.requirementsForApplyAutocomplete = [
          this.workTemplate.requirements[idx],
        ]
      }
      if (reqsList) {
        this.requirementsForApplyAutocomplete = [...reqsList]
      }
      this.showApplyAutocompleteRequirement = true
    },

    handleUpdateRequirement(reqToUpdate) {
      this.updateRequirementOnWorkTemplate(reqToUpdate)
      this.showEditRequirement = false
    },

    handleRequirementForApplyAutocomplete(requirementsForAutocomplete) {
      this.showApplyAutocompleteRequirement = false
      if (!requirementsForAutocomplete) return

      this.autocompleteRequirementOnWorkTemplate({
        requirementsForAutocomplete,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.add-work-template {
  position: relative;
}
.previews {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  .preview {
    width: 100px;
    height: 100px;
    padding: 0.5em;
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

.search-wrapper {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.5rem;
  flex: 0 1 600px;
}

.search-box {
  grid-column: 1/2;
}
.search-btn {
  grid-column: 2/3;
}

.requirements-wraper {
  border: 1px solid transparent;
  &.has-error {
    border: 1px solid var(--v-error-base);
  }
}

.sub-title {
  font-size: 1rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
}
.slide-enter,
.slide-leave-to {
  opacity: 0;
  transform: translateX(10%);
}

.spin-enter-active,
.spin-leave-active {
  transition: transform 300 ease-out, opacity 200 ease-in;
  position: absolute;
}
.spin-enter,
.spin-leave-to {
  rotate: 180deg;
  opacity: 0;
}
</style>
