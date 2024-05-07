<template>
  <v-card class="d-flex flex-column overflow-hidden">
    <v-toolbar dark color="secondary" class="flex-grow-0" dense>
      <v-btn icon dark @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ pageTitle }} </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn v-if="!editing" ref="btnSave" dark text @click.stop="handleSave">
          {{ $t('save') }}
        </v-btn>
        <v-btn
          v-if="editing"
          ref="btnSave"
          dark
          text
          :disabled="!localNeedToSave"
          @click.stop="handleSave"
        >
          {{ $t('update') }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-card-text ref="scrollArea" class="pa-8 flex-grow-1 overflow-y-auto">
      <div class="task-form mb-4">
        <div class="tasks-container mb-0">
          <v-form
            v-for="(t, i) in jobTasks"
            ref="jobTaskForms"
            :key="i"
            class="mb-8"
          >
            <v-row>
              <v-col
                :cols="jobType.type === JOB_TYPES.allowablesPools ? '9' : '12'"
              >
                <v-combobox
                  v-if="subtasksTemplatesFormatted.length"
                  ref="titleInputs"
                  v-model="t.title"
                  :items="subtasksTemplatesFormatted"
                  dense
                  outlined
                  hide-selected
                  :rules="rules"
                  hide-details="auto"
                  :label="$t('title')"
                  @input="handleTaskTitle($event, t.id)"
                  @change="createFiles(t.id)"
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
                  </template>
                </v-combobox>

                <v-text-field
                  v-else
                  v-model="t.title"
                  dense
                  outlined
                  :rules="rules"
                  autofocus
                  hide-details="auto"
                  :label="$t('title')"
                  @keydown.enter.exact.prevent
                >
                </v-text-field>
              </v-col>
              <v-col v-if="jobType.type === JOB_TYPES.allowablesPools" cols="3">
                <v-text-field
                  v-model="t.maxValue"
                  :label="$t('maxValue')"
                  :rules="rulesMaxValue"
                  prefix="$"
                  outlined
                  dense
                  hide-details="auto"
                  @keydown.enter.exact.prevent
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  ref="descField"
                  v-model="t.desc"
                  :label="$t('description')"
                  rows="8"
                  auto-grow
                  :rules="rules"
                  dense
                  outlined
                  hide-details="auto"
                ></v-textarea>
              </v-col>

              <v-col
                v-if="
                  jobType.type !== JOB_TYPES.instructions &&
                  jobType.type !== JOB_TYPES.appointments
                "
                cols="12"
              >
                <v-textarea
                  v-model="t.instructions"
                  label="Instructions for OOS"
                  rows="2"
                  auto-grow
                  dense
                  outlined
                  hide-details="auto"
                ></v-textarea>
              </v-col>
              <div
                v-if="
                  jobType.type !== JOB_TYPES.instructions &&
                  jobType.type !== JOB_TYPES.appointments
                "
              >
                <h2 class="secction title | info--text text-h6 my-8 mb-0 ml-3">
                  Estimated Time to Complete
                </h2>
              </div>
            </v-row>

            <v-row>
              <v-col
                v-if="
                  jobType.type !== JOB_TYPES.instructions &&
                  jobType.type !== JOB_TYPES.appointments
                "
                cols="3"
              >
                <v-text-field
                  v-model="t.ect.hours"
                  label="Hours"
                  dense
                  hide-details="auto"
                  outlined
                  :rules="rulesECT"
                  @keydown.enter.exact.prevent
                ></v-text-field>
              </v-col>
              <v-col
                v-if="
                  jobType.type !== JOB_TYPES.instructions &&
                  jobType.type !== JOB_TYPES.appointments
                "
                cols="3"
              >
                <v-text-field
                  v-model="t.ect.minutes"
                  label="Minutes"
                  dense
                  hide-details="auto"
                  outlined
                  :rules="rulesECT"
                  @keydown.enter.exact.prevent
                ></v-text-field>
              </v-col>

              <v-col
                v-if="
                  jobType.type !== JOB_TYPES.instructions &&
                  jobType.type !== JOB_TYPES.appointments
                "
                class="container-items-for-invoices mt-4"
                cols="12"
              >
                <items-for-invoices
                  :task-id="t.id"
                  :items-for-invoices-prop="t.itemsForInvoices"
                  :order="order"
                  :max-value="maxValue"
                  @update-items-for-invoices="
                    handleUpdateItemsForInvoices(
                      $event.itemsForInvoices,
                      $event.taskId
                    )
                  "
                ></items-for-invoices>
              </v-col>
              <v-col
                v-if="jobType.type === JOB_TYPES.allowablesPools"
                cols="12"
              >
                <v-checkbox
                  v-model="t.needSupervisorApproval"
                  hide-details
                  :label="$t('Does this task require supervisor approval?')"
                  dense
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-if="jobType.type !== JOB_TYPES.instructions"
                  v-model="t.needProcessTimes"
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
                <div class="mb-2 text-h6 mt-2 info--text">Example Pictures</div>
                <v-row v-if="t.needProcessTimes">
                  <v-col
                    v-for="(processTime, p) in processTimeOptions"
                    :key="p"
                  >
                    <div class="mb-2 info--text">
                      {{ processTime }}
                    </div>
                    <v-file-input
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
                          taskId: t.id,
                          type: 'taskFile',
                          processTime,
                        })
                      "
                    ></v-file-input>
                    <div
                      v-if="t.pictures && t.pictures.length"
                      class="previews | mb-0"
                    >
                      <div
                        v-for="(pic, j) in t.pictures.filter(
                          (p) => p.forProcessTime === processTime
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
                          @mousemove="zoomHover($event, pic)"
                          @mouseleave="zoomLeave($event)"
                          @click="handleShowImagesSlides(t.pictures, pic)"
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
                              @click="handleDeletePic(pic, t.id)"
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

                <v-row v-else>
                  <v-col>
                    <v-file-input
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
                          taskId: t.id,
                          type: 'taskFile',
                          processTime: 'General',
                        })
                      "
                    ></v-file-input>
                    <div
                      v-if="t.pictures && t.pictures.length"
                      class="previews | mb-0"
                    >
                      <div
                        v-for="(pic, j) in t.pictures.filter(
                          (p) => p.forProcessTime === 'General'
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
                          @mousemove="zoomHover($event, pic)"
                          @mouseleave="zoomLeave($event)"
                          @click="handleShowImagesSlides(t.pictures, pic)"
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
                              @click="handleDeletePic(pic, t.id)"
                            >
                              <v-icon color="error" small>mdi-delete</v-icon>
                            </v-btn>
                          </template>
                          <span>{{ $t('deleteImage') }}</span>
                        </v-tooltip>
                      </div>
                    </div>
                  </v-col></v-row
                >
              </v-col>

              <v-col v-if="jobType.type === JOB_TYPES.appointments" cols="12">
                <v-text-field
                  v-model="t.place"
                  :label="$t('place')"
                  outlined
                  dense
                  hide-details="auto"
                  :rules="rules"
                  @keydown.enter.exact.prevent
                ></v-text-field>
              </v-col>
              <v-col
                v-if="jobType.type === JOB_TYPES.appointments"
                cols="12"
                md="6"
              >
                <v-menu
                  v-model="t.dateMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="t.date"
                      :label="$t('selectDate')"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      outlined
                      dense
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="t.date"
                    @input="t.dateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col
                v-if="jobType.type === JOB_TYPES.appointments"
                cols="12"
                md="6"
              >
                <v-menu
                  ref="timeMenu"
                  v-model="t.timeMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  :return-value.sync="t.time"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="t.time"
                      :label="$t('selectTime')"
                      prepend-inner-icon="mdi-clock-time-four-outline"
                      readonly
                      outlined
                      dense
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-model="t.time"
                    full-width
                    format="ampm"
                    @click:minute="$refs.timeMenu[i].save(t.time)"
                  ></v-time-picker>
                </v-menu>
              </v-col>

              <v-col v-if="jobType.type !== JOB_TYPES.instructions" cols="12">
                <div class="mb-2 info--text text-h6 mt-2">Requirements</div>
                <Requirements
                  :task="t"
                  :order="order"
                  :job-type="jobType"
                  :requirements-formatted="requirementsFormatted"
                  @duplicate-requirement="handleDuplicateRequirement"
                  @update-requirements="
                    handleUpdateRequirements($event.requirements, $event.taskId)
                  "
                  @delete-requirement="
                    handleDeleteRequirement(
                      $event.requirements,
                      $event.taskId,
                      $event.deleteRequirementId
                    )
                  "
                ></Requirements>
              </v-col>
              <v-col
                v-if="
                  jobType.type !== JOB_TYPES.instructions &&
                  jobType.type !== JOB_TYPES.appointments
                "
                class="container-materialsOrTools"
                cols="12"
              >
                <materials-or-tools
                  :materials-or-tools-prop="t.materialsOrTools"
                  :task-id="t.id"
                  :order="order"
                  @update-materials="
                    handleUpdateMaterials($event.materials, $event.taskId)
                  "
                  @delete-material="
                    handleDeleteMaterial(
                      $event.materials,
                      $event.taskId,
                      $event.deleteMaterialId
                    )
                  "
                ></materials-or-tools>
              </v-col>
            </v-row>
          </v-form>
        </div>
        <div v-if="!editing" class="task-action text-center mt-0">
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                :disabled="addJobTaskDisabled"
                v-bind="attrs"
                v-on="on"
                @click="addJobTask(true)"
                ><v-icon>mdi-plus-circle-outline</v-icon></v-btn
              >
            </template>
            <span>{{ $t('addTask') }}</span>
          </v-tooltip>
        </div>
        <v-divider></v-divider>
      </div>
    </v-card-text>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <slide-show
      :list="listPictures"
      :show="showImagesSlides"
      :title="$t('ImagesView') + ' ' + $t(jobType.type)"
      type="images"
      :index-selected="indexOfImage"
      @close="showImagesSlides = false"
    />
    <v-dialog v-model="showPdfViewer" fullscreen>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>
  </v-card>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { Timestamp } from '@firebase/firestore'
import MaterialsOrTools from '../materialsOrTools/MaterialsOrTools.vue'
import ItemsForInvoices from '../itemsForInvoices/ItemsForInvoices.vue'
import Requirements from '../requirements/Requirements.vue'
import SlideShow from '../../misc/SlideShow.vue'
import PdfViewer from '../../misc/PdfViewer.vue'
import taskMicroEdit from '@/mixins/taskMicroEdits'
import {
  JOB_TYPES,
  PROCESS_TIME_TYPES,
  ORDER_STATUS,
} from '~/utils/dictionaries'
const { mapActions } = createNamespacedHelpers('order')
export default {
  name: 'AddTask',
  components: {
    MaterialsOrTools,
    ItemsForInvoices,
    Requirements,
    SlideShow,
    PdfViewer,
  },
  mixins: [taskMicroEdit],
  props: {
    order: { type: Object, default: () => ({}) },
    jobType: { type: Object, default: () => ({}) },
    jobTaskToEdit: { type: Object, default: () => ({}) },
    allowableToAdd: { type: Object, default: null },
    maxValue: { type: Number, default: Number.POSITIVE_INFINITY },
    isSeteado: { type: Boolean, default: false },
  },
  data() {
    return {
      model: ['Vuetify'],
      JOB_TYPES: null,
      PROCESS_TIME_TYPES: null,
      files: [],
      picturesTemplate: {},
      rulesMaxValue: [
        (v) => !!v || 'Max Value is required',
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      rulesPhotos: [(v) => !isNaN(v) || this.$t('onlyNumbersRequired')],
      rules: [(v) => !!v || this.$t('thisFieldRequired')],
      rulesECT: [(v) => !isNaN(v) || this.$t('onlyNumbersRequired')],
      templates: [],
      loading: false,
      jobTasks: [],
      items: ['General', 'Before', 'During', 'After'],
      filesForStorage: {},
      deleteMaterialsOrTools: [],
      deleteRequirements: [],
      taskSelectedId: '',
      listPictures: [],
      indexOfImage: 0,
      showImagesSlides: false,
      previewUrl: '',
      showPdfViewer: false,
      typeTask: '',
    }
  },
  computed: {
    processTimeOptions() {
      const { before, during, after } = PROCESS_TIME_TYPES
      return [before, during, after]
    },
    selectedTask() {
      if (!this.taskSelectedId || !this.jobTasks.length) return null
      return this.jobTasks.find((t) => t.id === this.taskSelectedId)
    },
    dummyTasks() {
      return this.$store.state.order.dummyTasks
    },
    jobTasksTemplatesInState() {
      return this.$store.state.order.jobTasksTemplatesInState
    },
    editing() {
      return !!this.jobTaskToEdit.id
    },
    subtasksTemplatesFormatted() {
      const subtasksTemplates = JSON.parse(JSON.stringify(this.templates))
      return subtasksTemplates.map((template) => {
        return {
          text: template.title.trim().replace('/', '-'),
          value: template.id,
          itemsForInvoices: [
            {
              client: template.client,
              loanTypes: template.loanTypes,
              desc: template.desc,
              price: template.price,
              title: template.title,
              unit: template.unit,
              id: template.id,
            },
          ],
          desc: '',
          needProcessTimes: true,
          requirements: [],
          pictures: [],
          materialsOrTools: [],
          ect: {},
          instructions: '',
          workTemplateId: template.workTemplateId,
        }
      })
    },
    requirementsFormatted() {
      const _requirementsFormatted = {}

      this.jobTasks.forEach((task) => {
        _requirementsFormatted[task.id] = {}
        const rowRequirements =
          task.requirements && task.requirements.length
            ? [...task.requirements]
            : []

        this.items.forEach((item) => {
          const propToTest = `from${item}`
          const _reqForItem = rowRequirements
            .filter((req) => req[propToTest])
            .map((r) => {
              return {
                ...r,
                type: item,
              }
            })
            .sort((a, b) => (a.position > b.position ? 1 : -1))
          _requirementsFormatted[task.id][item] = _reqForItem
        })
      })
      return _requirementsFormatted
    },
    addJobTaskDisabled() {
      return (
        this.jobTasks.length > 0 &&
        (this.jobTasks[this.jobTasks.length - 1].title === '' ||
          this.jobTasks[this.jobTasks.length - 1].desc === '' ||
          this.jobTasks[this.jobTasks.length - 1].maxValue === '')
      )
    },
    localNeedToSave() {
      const compareTask = (taskA, taskB) => {
        return this._.isEqual(taskA, taskB)
      }
      if (
        !this.jobTasks ||
        !this.jobTasks.length ||
        !this.jobTasks[0].requirements
      ) {
        return false
      }
      if (!this.editing) {
        return !compareTask(
          this.jobTasks[0],
          this.dummyTasks[this.jobType.type]
        )
      }
      const propertiesToCheck = [
        'title',
        'desc',
        'maxValue',
        'needProcessTimes',
        'needSupervisorApproval',
        'requirements',
        'files',
        'pictures',
        'date',
        'time',
        'dateMenu',
        'timeMenu',
        'place',
        'itemsForInvoices',
        'materialsOrTools',
        'ect',
        'instructions',
      ]
      return propertiesToCheck.some((p) => {
        return !compareTask(this.jobTaskToEdit[p], this.jobTasks[0][p])
      })
    },
    tasksLastPosition() {
      const _tasks = this.jobTasks.length
        ? this.jobTasks
        : this.order[this.jobType.type]
      if (!_tasks || !_tasks.length) {
        return 1
      }

      return _tasks[_tasks.length - 1].position + 1
    },
  },
  watch: {
    localNeedToSave: {
      handler(val) {
        this.$emit('update-persistent', val)
        this.$store.commit('set_needToSave', val)
      },
      inmediate: true,
    },
  },
  beforeDestroy() {
    this.handleClose()
  },
  created() {
    this.JOB_TYPES = JOB_TYPES
    this.PROCESS_TIME_TYPES = PROCESS_TIME_TYPES
  },
  mounted() {
    const type =
      this.jobType.type === JOB_TYPES.allowablesPools ||
      this.jobType.type === JOB_TYPES.workToDos
        ? 'itemsForInvoices'
        : this.jobType.type

    if (type === 'itemsForInvoices' && this.jobTasksTemplatesInState[type]) {
      this.order.client !== this.jobTasksTemplatesInState[type].client ||
      this.order.loanType !== this.jobTasksTemplatesInState[type].loanType ||
      !this.jobTasksTemplatesInState[type].templates ||
      (this.jobTasksTemplatesInState[type].templates &&
        !this.jobTasksTemplatesInState[type].templates.length)
        ? this.getTemplates(type)
        : (this.templates = this.jobTasksTemplatesInState[type].templates)
    }
    this.addJobTask(false)
  },
  methods: {
    ...mapActions({
      getTemplatesForOrder: 'get_templatesForOrder',
    }),
    handleDuplicateRequirement({ requirement, taskId, processTime }) {
      const task = this.jobTasks.find((_task) => _task.id === taskId)
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
      requirements.splice(idxToDuplicate + 1, 0, newReq)
    },
    async getTemplates(type) {
      this.loading = true
      try {
        const _items = await this.getTemplatesForOrder({
          type,
          order: this.order,
        })
        this.templates = _items && _items.length ? [..._items] : []
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleDeletePic(pic, taskId) {
      const task = this.jobTasks.find((t) => t.id === taskId)
      const indexOfPic = task.pictures
        .map((p) => p.codeName)
        .indexOf(pic.codeName)

      task.pictures.splice(indexOfPic, 1)
      if (task.files) {
        const indexOfPicFiles = task.files
          .map((p) => p.codeName)
          .indexOf(pic.codeName)
        if (indexOfPicFiles !== -1) {
          task.files.splice(indexOfPicFiles, 1)
        }
      }
    },
    async createFiles(taskId) {
      if (this.picturesTemplate[taskId].pictures) {
        const picturesStorage = this.picturesTemplate[taskId].pictures
        if (picturesStorage) {
          for (let i = 0; i < picturesStorage.length; i++) {
            const response = await fetch(picturesStorage[i].url)
            const data = await response.blob()
            const metadata = {
              type: 'image/jpeg',
            }
            const file = new File([data], picturesStorage[i].name, metadata)
            this.filesForStorage[taskId].files.push(file)
          }
          this.handleInputFiles({
            files: this.filesForStorage[taskId].files,
            taskId,
            type: 'createFile',
          })
        }
      }
      this.picturesTemplate[taskId].pictures = []
      this.filesForStorage[taskId].files = []
    },
    handleInputFiles({ files, taskId, type, processTime }) {
      const indexOfTask = this.jobTasks.findIndex((t) => t.id === taskId)
      const _task = this.jobTasks[indexOfTask]
      const task = Object.assign({}, _task)
      if (!task.files) {
        task.files = []
      }
      if (!task.pictures) {
        task.pictures = []
      }
      files.forEach((file, i) => {
        if (!file) {
          return
        }
        const codeName =
          new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)
        file.codeName = codeName
        file.forProcessTime = processTime
        const reader = new FileReader()
        reader.onload = (event) => {
          const url = event.target.result
          task.pictures.push({
            url,
            type: file.type,
            codeName: file.codeName,
            forProcessTime: processTime,
          })
          task.files.push(file)
          this.jobTasks.splice(indexOfTask, 1, task)
        }
        reader.readAsDataURL(file)
      })
    },
    async handleTaskTitle(event, taskId) {
      const task = this.jobTasks.find((t) => t.id === taskId)
      let _task = null
      let _requirements = []
      let _materialsOrTools = []
      if (!event || typeof event !== 'object') return
      if (event?.workTemplateId) {
        _task = await this.$store.dispatch('order/get_workTemplateId', {
          workTemplateId: event.workTemplateId,
        })
      }
      if (_task && _task.pictures) {
        task.pictures = []
        task.files = []
      }
      if (
        _task &&
        _task.requirements?.length &&
        task &&
        task.requirements?.length
      ) {
        const _req = task.requirements.filter(
          (r) => r.id && !r.id.includes('localReq')
        )
        if (_req.length) {
          this.deleteRequirements = _req.map((r) => r.id)
        }
      }
      if (_task && typeof _task === 'object') {
        _requirements = _task.requirements.map((e, i) => {
          e.id =
            'localReq' +
            new Date().getTime() +
            '-' +
            Math.floor(1000 + Math.random() * 9000)
          const { templateId, ...newRequirement } = e
          return {
            ...newRequirement,
            pictures: [],
            position: e.position || i + 1,
          }
        })
        _materialsOrTools = _task.materialsOrTools.map((e) => {
          e.id =
            '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
          const { desc, ...material } = e
          return { ...material }
        })
      }
      let _itemsForInvoices = []
      if (event?.itemsForInvoices?.length) {
        _itemsForInvoices = event.itemsForInvoices.map((e) => {
          e.qty = '1'
          return { ...e }
        })
      }
      task.title = event?.text.trim().replace('/', '-')
      task.desc = _task?.desc || ''
      task.needProcessTimes = _task?.needProcessTimes || true
      task.requirements = _requirements
      this.picturesTemplate[taskId].pictures = _task?.pictures || []
      task.itemsForInvoices = _itemsForInvoices
      task.ect = _task?.ect || { hours: '', minutes: '' }
      task.instructions = _task?.instructions || ''
      task.materialsOrTools = _materialsOrTools
      task.pictures = _task?.pictures || []
    },
    handleClose() {
      this.loading = false
      this.$emit('update-persistent', false)
      this.$store.commit('set_needToSave', false)
      this.jobTitle = ''
      this.jobDesc = ''
      this.jobTasks = []
      this.appointment = {
        date: '',
        time: '',
        place: '',
      }
      this.$emit('close')
    },
    validateAllForms() {
      let isValid = true
      for (let index = 0; index < this.$refs.jobTaskForms.length; index++) {
        const form = this.$refs.jobTaskForms[index]
        isValid = form.validate()
      }
      if (
        (this.jobType.type === JOB_TYPES.allowablesPools ||
          this.jobType.type === JOB_TYPES.allowables) &&
        isValid &&
        !this.isSeteado
      ) {
        isValid = this.validateItemsForInvoices()
      }
      if (
        (this.jobType.type === JOB_TYPES.workToDos ||
          this.jobType.type === JOB_TYPES.allowablesPools ||
          this.jobType.type === JOB_TYPES.allowables) &&
        isValid
      ) {
        isValid = this.validateRequirements()
      }
      return isValid
    },
    validateItemsForInvoices() {
      let isValid = true
      for (let index = 0; index < this.jobTasks.length; index++) {
        const _items = this.jobTasks[index].itemsForInvoices
        isValid = _items.length !== 0
      }
      if (!isValid) {
        this.$mainAlertInfo('Cannot create without items for invoices')
      }
      return isValid
    },
    validateRequirements() {
      let isValid = true
      for (let index = 0; index < this.jobTasks.length; index++) {
        const _requirements = this.jobTasks[index].requirements
        isValid = _requirements.length !== 0
      }
      if (!isValid) {
        this.$mainAlertInfo('Cannot create without requirements')
      }
      return isValid
    },
    async handleSave() {
      if (!this.validateAllForms()) return
      this.loading = true
      try {
        const orderId = this.order.id
        const jobTasksToSend = this.jobTasks.map((task) => {
          let appointmentTimestamp = null
          let newRequirements = []
          let newMaterialsOrTools = []

          if (this.jobType.type === JOB_TYPES.appointments) {
            const [year, month, day] = task.date.split('-')
            const [hours, minutes] = task.time.split(':')
            const appointmentDate = new Date(
              year,
              month - 1,
              day,
              hours,
              minutes
            )
            appointmentTimestamp = Timestamp.fromDate(appointmentDate)
          }
          if (task.requirements && task.requirements.length) {
            newRequirements = task.requirements.map((e) => {
              if (e.id && e.id.includes('localReq')) {
                const { type, id, ...newRequirement } = e
                return newRequirement
              } else {
                const { type, ...newRequirement } = e
                return newRequirement
              }
            })
          }
          if (task.materialsOrTools && task.materialsOrTools.length) {
            newMaterialsOrTools = task.materialsOrTools.map((e) => {
              if (e.id && !isNaN(e.id)) {
                const { id, ...newMaterial } = e
                return newMaterial
              }
              return e
            })
          }
          return {
            title: task.title,
            desc: task.desc,
            position: task.position,
            ...(this.jobType.type !== JOB_TYPES.instructions &&
              this.jobType.type !== JOB_TYPES.appointments && {
                needProcessTimes: task.needProcessTimes,
                ...(this.jobType.type !== JOB_TYPES.workToDos && {
                  needSupervisorApproval: task.needSupervisorApproval,
                }),
                requirements: newRequirements,
                itemsForInvoices: task.itemsForInvoices || [],
                ect: task.ect || null,
                instructions: task.instructions || '',
                materialsOrTools: newMaterialsOrTools,
                ...(this.jobType.type === JOB_TYPES.allowablesPools && {
                  maxValue: task.maxValue,
                  approved: !task.needSupervisorApproval,
                }),
                ...(this.jobType.type === JOB_TYPES.allowables && {
                  poolId: task.poolId,
                }),
              }),
            type: this.jobType.type,
            ...(this.editing && {
              id: task.id,
              deleteRequirements: this.deleteRequirements,
              deleteMaterialsOrTools: this.deleteMaterialsOrTools,
            }),
            ...(task.files &&
              task.files.length > 0 && { files: [...task.files] }),
            ...(task.pictures && { pictures: [...task.pictures] }),
            ...(this.jobType.type === JOB_TYPES.appointments && {
              needProcessTimes: task.needProcessTimes,
              requirements: newRequirements,
              date: task.date,
              time: task.time,
              place: task.place,
              appointmentTimestamp,
            }),
          }
        })
        if (!this.editing && !this.isSeteado) {
          const notifyContractors =
            this.order.status.trim().toLowerCase() ===
            ORDER_STATUS.inField.toLowerCase()
          await this.$store.dispatch('order/add_jobTask', {
            jobTasksToSend,
            order: this.order,
            jobType: this.jobType.type,
            notifyContractors,
            ...(notifyContractors && {
              contractors: this.order.contractorsUids,
            }),
          })
          this.$mainAlertSuccess(this.$t('taskAdded'))
        } else if (this.editing && !this.isSeteado) {
          await this.$store.dispatch('order/update_jobTask', {
            jobTaskToSend: jobTasksToSend[0],
            orderId,
            jobType: this.jobType.type,
            baseJobTask: this.jobTaskToEdit,
          })
          this.$mainAlertSuccess(this.$t('taskUpdate'))
        } else if (!this.editing && this.isSeteado) {
          this.$emit('add-tasks', jobTasksToSend)
        } else if (this.editing && this.isSeteado) {
          this.$emit('update-task', jobTasksToSend[0])
        }
        this.loading = false
        this.$emit('close')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
      }
    },
    addJobTask(scroll) {
      if (this.jobTaskToEdit.id) {
        this.jobTasks.push({
          ...JSON.parse(JSON.stringify(this.jobTaskToEdit)),
          ...(this.jobType.type === JOB_TYPES.appointments && {
            dateMenu: false,
          }),
        })
        this.$set(this.picturesTemplate, this.jobTaskToEdit.id, {})
        this.$set(this.picturesTemplate[this.jobTaskToEdit.id], 'pictures', [])
        this.$set(this.filesForStorage, this.jobTaskToEdit.id, {})
        this.$set(this.filesForStorage[this.jobTaskToEdit.id], 'files', [])
        this.taskSelectedId = this.jobTaskToEdit.id
      } else if (this.allowableToAdd) {
        this.jobTasks.push({
          ...JSON.parse(JSON.stringify(this.allowableToAdd)),
          position: this.tasksLastPosition,
        })
      } else {
        let newTask = null
        const id = this.$generateId()
        const position = this.tasksLastPosition
        switch (this.jobType.type) {
          case 'appointments':
            newTask = {
              ...this.dummyTasks.appointments,
              date: new Date(
                Date.now() - new Date().getTimezoneOffset() * 60000
              )
                .toISOString()
                .substr(0, 10),
              time: `${new Date(Date.now()).getHours()}:${new Date(
                Date.now()
              ).getMinutes()}`,
              id,
              position,
            }
            break
          default:
            newTask = { ...this.dummyTasks[this.jobType.type], id, position }
            break
        }
        this.jobTasks.push(JSON.parse(JSON.stringify(newTask)))
        this.$set(this.picturesTemplate, id, {})
        this.$set(this.picturesTemplate[id], 'pictures', [])
        this.$set(this.filesForStorage, id, {})
        this.$set(this.filesForStorage[id], 'files', [])
        this.taskSelectedId = id
      }
      if (!scroll) {
        this.$nextTick(() => {
          this.$refs.scrollArea.style.scrollBehavior = 'smooth'
          this.$refs.scrollArea.scrollTo(0, this.$refs.scrollArea.scrollHeight)
        })
      }
    },
    handleUpdateMaterials(materials, taskId) {
      const idx = this.jobTasks.findIndex((jt) => jt.id === taskId)
      if (idx === -1) return
      this.jobTasks[idx].materialsOrTools = materials
    },
    handleDeleteMaterial(materials, taskId, deleteMaterialId) {
      const idx = this.jobTasks.findIndex((jt) => jt.id === taskId)
      if (idx === -1) return
      this.jobTasks[idx].materialsOrTools = materials
      if (deleteMaterialId !== '') {
        this.deleteMaterialsOrTools.push(deleteMaterialId)
      }
    },
    handleUpdateItemsForInvoices(itemsForInvoices, taskId) {
      const idx = this.jobTasks.findIndex((jt) => jt.id === taskId)
      if (idx === -1) return
      this.jobTasks[idx].itemsForInvoices = itemsForInvoices
    },
    handleUpdateRequirements(requirements, taskId) {
      const idx = this.jobTasks.findIndex((jt) => jt.id === taskId)
      if (idx === -1) return
      this.jobTasks[idx].requirements = requirements
    },
    handleDeleteRequirement(requirements, taskId, deleteRequirementId) {
      const idx = this.jobTasks.findIndex((jt) => jt.id === taskId)
      if (idx === -1) return
      this.jobTasks[idx].requirements = requirements
      if (
        deleteRequirementId !== '' &&
        !deleteRequirementId.includes('localReq')
      ) {
        this.deleteRequirements.push(deleteRequirementId)
      }
    },
    handleShowImagesSlides(pictures, pic) {
      this.showImagesSlides = true
      this.listPictures = pictures.filter((pic) => pic.type.includes('image'))
      const idx = this.listPictures.findIndex(
        (p) => p.codeName === pic.codeName
      )
      if (idx === -1) return
      this.indexOfImage = idx
    },
    handleClosePdfViewer() {
      this.previewUrl = ''
      this.showPdfViewer = false
    },
    handleViewPdf(url) {
      this.previewUrl = url
      this.showPdfViewer = true
    },
    zoomHover(event, pic) {
      const elementImg = event.target
      const box = elementImg.getBoundingClientRect()
      const position = JSON.parse(JSON.stringify(box))
      this.$store.commit('set_lupaOptions', { url: pic.url, position })
      this.$store.commit('set_showLupa', true)
    },
    zoomLeave(event, id) {
      this.$store.commit('set_showLupa', false)
    },
  },
}
</script>
<style lang="scss" scoped>
.task-form {
  max-width: 900px;
  margin-inline: auto;
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
</style>
