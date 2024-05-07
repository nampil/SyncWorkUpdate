<template>
  <div class="container-edit-job-note | d-flex">
    <v-card
      class="d-flex flex-column overflow-hidden elevation-0"
      min-width="800px"
    >
      <v-toolbar dark color="secondary" class="flex-grow-0" dense>
        <v-btn icon dark @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Edit {{ jobNoteLocal.title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="handleSave"> {{ $t('update') }} </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <div class="flex-grow-1 overflow-y-auto">
        <v-card-text ref="scrollArea" class="pa-8">
          <v-form ref="formu" class="task-form mb-8" lazy-validation>
            <v-row justify="center">
              <v-col cols="12">
                <v-combobox
                  v-model="jobNoteLocal.noteType"
                  :items="items.noteType"
                  outlined
                  dense
                  :rules="rulesType"
                  :label="$t('noteType')"
                  hide-details="auto"
                  required
                  @change="handleFocus('noteTo', 1)"
                  @keydown.enter.exact.prevent
                  @keyup.enter.exact="handleFocus('noteTo', 1)"
                ></v-combobox>
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="jobNoteLocal.noteTo"
                  :items="items.noteTo"
                  outlined
                  dense
                  chips
                  small-chips
                  :rules="rulesNoteTo"
                  :label="$t('to')"
                  multiple
                  clearable
                  hide-details="auto"
                  required
                ></v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-checkbox
                  v-model="jobNoteLocal.setReminder"
                  class="dismCheckbox"
                  hide-details
                  :label="$t('setReminder')"
                  dense
                ></v-checkbox>
              </v-col>

              <v-col cols="6">
                <v-menu
                  v-if="jobNoteLocal.setReminder"
                  :ref="'menu'"
                  v-model="jobNoteLocal.dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="jobNoteLocal.reminderDate"
                      class="datos"
                      :label="$t('reminderDate')"
                      prepend-inner-icon="mdi-calendar"
                      :rules="rulesDate"
                      readonly
                      outlined
                      dense
                      required
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="jobNoteLocal.reminderDate"
                    @input="jobNoteLocal.dateMenu = false"
                  >
                  </v-date-picker>
                </v-menu>
              </v-col>

              <v-col v-if="jobNoteLocal.setReminder" cols="6">
                <v-menu
                  :ref="'menur'"
                  :close-on-content-click="false"
                  :nudge-right="5"
                  :return-value.sync="jobNoteLocal.reminderTime"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="jobNoteLocal.reminderTime"
                      class="datos"
                      :label="$t('reminderTime')"
                      prepend-inner-icon="mdi-clock-time-four-outline"
                      readonly
                      :rules="rulesTime"
                      outlined
                      dense
                      required
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-model="jobNoteLocal.reminderTime"
                    format="ampm"
                    full-width
                    @click:minute="
                      $refs['menur'].save(jobNoteLocal.reminderTime)
                    "
                  ></v-time-picker>
                </v-menu>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="jobNoteLocal.title"
                  class="dismTitle"
                  :label="$t('title')"
                  :rules="rulesTitle"
                  outlined
                  dense
                  hide-details="auto"
                  required
                  @keyup.enter.exact="handleFocus('descriptions', 5)"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  accept="image/png, image/jpeg, image/bmp, application/pdf, video/*"
                  prepend-icon="mdi-paperclip"
                  :label="$t('fileInput')"
                  class="input-file"
                  outlined
                  dense
                  multiple
                  truncate-length="15"
                  hide-details="auto"
                  @click="$event.target.value = ''"
                  @change="handleInputFiles($event)"
                ></v-file-input>
                <div v-if="jobNoteLocal.pictures?.length" class="previews">
                  <div
                    v-for="(pic, j) in jobNoteLocal.pictures"
                    :key="j"
                    class="preview | text-center mb-0"
                  >
                    <img
                      v-if="pic.type.includes('image')"
                      :src="pic.url"
                      alt=""
                      height="100px"
                      width="100px"
                      @mousemove="zoomHover($event, pic)"
                      @mouseleave="zoomLeave($event)"
                      @click="handlerShowImagesSlides(pic.codeName)"
                    />
                    <div
                      v-if="pic.type.includes('pdf')"
                      class="file-preview | d-flex align-center justify-center"
                      @click="handleViewPdf(pic.url)"
                    >
                      <v-icon large>mdi-file-pdf-box</v-icon>
                    </div>
                    <div v-if="pic.type.includes('video')">
                      <video
                        class="video-preview"
                        height="100px"
                        width="100px"
                        :src="pic.url"
                        @click="handlerShowImagesSlides(pic.codeName)"
                      />
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
              <v-col cols="12">
                <v-textarea
                  v-model="jobNoteLocal.desc"
                  :label="$t('description')"
                  auto-grow
                  :rules="rulesDesc"
                  outlined
                  rows="4"
                  row-height="30"
                  required
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </div>

      <v-overlay :value="loading">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-card>
    <slide-show
      v-if="typeof jobNoteLocal.pictures !== 'undefined'"
      :list="listImg"
      :index-selected="indexOfImage"
      :show="showImagesSlides"
      :title="$t('ImagesView') + ' ' + jobNoteLocal.title"
      type="images"
      @close="showImagesSlides = false"
    />
    <v-dialog v-model="showPdfViewer" fullscreen>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>
  </div>
</template>

<script>
import { Timestamp } from 'firebase/firestore'
import { JOB_NOTES_TYPES, MEDIA_TYPES } from '~/utils/dictionaries'
import SlideShow from '~/components/misc/SlideShow.vue'
import PdfViewer from '~/components/misc/PdfViewer.vue'

export default {
  name: 'EditJobNote',
  components: { SlideShow, PdfViewer },
  props: {
    show: { type: Boolean, default: false },
    orderId: { type: String, default: '' },
    propertyId: { type: String, default: '' },
    jobNote: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  data() {
    return {
      loading: false,
      dialog: false,
      rulesType: [(v) => !!v || this.$t('TypeRequired')],
      rulesNoteTo: [(v) => !!v || this.$t('NoteToRequired')],
      rulesDate: [(v) => !!v || this.$t('dateRequired')],
      rulesTime: [(v) => !!v || this.$t('timeRequired')],
      rulesTitle: [
        (v) => !!v || this.$t('titleRequired'),
        (v) => (!!v && v.length >= 8) || this.$t('titleThanCharacters'),
      ],
      rulesDesc: [(v) => !!v || this.$t('descriptionRequired')],
      items: {
        noteType: [this.$t('propertyNotes'), this.$t('workOrderNotes')],
        noteTo: [],
      },
      currentFiles: [],
      pictures: [],
      noteType: '',
      noteTo: '',
      setReminder: false,
      title: '',
      desc: '',
      reminderTime: null,
      reminderDate: null,
      reminderDates: null,
      jobNoteLocal: {},
      dateMenu: false,
      showImagesSlides: false,
      listImg: [],
      indexOfImage: 0,
      previewUrl: '',
      showPdfViewer: false,
      usersList: [],
    }
  },
  computed: {
    usersByDepartaments() {
      return {
        OOS: this.usersList.filter(
          (u) => u.departments && u.departments.includes('OOS')
        ),
        Receiving_Orders: this.usersList.filter(
          (u) => u.departments && u.departments.includes('Receiving Orders')
        ),
        Processors: this.usersList.filter(
          (u) => u.departments && u.departments.includes('Processors')
        ),
      }
    },
  },
  async mounted() {
    this.jobNoteLocal = JSON.parse(JSON.stringify(this.jobNote))
    this.jobNoteLocal.currentPictures = []
    for (let i = this.jobNoteLocal.pictures.length - 1; i >= 0; i--) {
      this.jobNoteLocal.currentPictures[i] = this.jobNoteLocal.pictures[i]
    }
    try {
      this.loading = true

      this.usersList = await this.$store.dispatch('get_adminUsers')

      const arrayGroup = [
        { header: 'Departments' },
        { text: 'OOS', group: 'Departments' },
        { text: 'Receiving Orders', group: 'Departments' },
        { text: 'Processors', group: 'Departments' },
        { divider: true },
        { header: 'Users' },
      ]

      const array = this.usersList.map((adminUser) => ({
        value: adminUser,
        text: adminUser.fullName,
        group: 'Users',
      }))

      this.items.noteTo = arrayGroup.concat(array)

      this.loading = false
    } catch (error) {
      this.$mainAlertError(this.$t('oopsProblem'))
      // eslint-disable-next-line
      console.log('error: ', error)
    }
  },

  methods: {
    handleFocus(type, i) {
      this.$nextTick(() => {
        if (type === 'noteTo') {
          this.$refs.formu.$children[i - 1].blur()
          this.$refs.formu.$children[i].focus()
        } else if (type === 'tittle') {
          this.$refs.formu.$children[i - 2].blur()
          this.$refs.formu.$children[i].focus()
        } else {
          this.$refs.formu.$children[i].focus()
        }
      })
    },
    handleDeletePic(pic) {
      if (pic.name) {
        const indexOfPic = this.jobNoteLocal.currentPictures
          .map((p) => p.name)
          .indexOf(pic.name)
        this.jobNoteLocal.currentPictures.splice(indexOfPic, 1)
      }

      const indexOfPic = this.jobNoteLocal.pictures
        .map((p) => p.codeName)
        .indexOf(pic.codeName)
      this.jobNoteLocal.pictures.splice(indexOfPic, 1)
      this.currentFiles.splice(indexOfPic, 1)
    },
    validateAllForms() {
      let isValid = true
      const form = this.$refs.formu
      isValid = form.validate()
      return isValid
    },
    desValidateAllForms() {
      let isValid = true
      const form = this.$refs.formu
      isValid = form.resetValidation()
      return isValid
    },
    resetAllForms() {
      let isValid = true
      const form = this.$refs.formu
      isValid = form.reset()
      return isValid
    },
    handleClose() {
      this.jobNoteLocal = {}
      this.desValidateAllForms()
      this.$emit('close')
    },
    handleUsersByDepartaments() {
      const _departments = ['OOS', 'Processors', 'Receiving Orders']

      for (let i = 0; i < _departments.length; i++) {
        const department = _departments[i]
        if (this.jobNoteLocal.noteTo?.includes(department)) {
          const idx = this.jobNoteLocal.noteTo
            .map((n) => n.uid || n)
            .indexOf(department)
          if (idx !== -1) {
            this.jobNoteLocal.noteTo.splice(idx, 1)
          }

          const _department = department.trim().replace(' ', '_')
          for (
            let i = 0;
            i < this.usersByDepartaments[_department].length;
            i++
          ) {
            const user = this.usersByDepartaments[_department][i]

            if (
              !this.jobNoteLocal.noteTo.map((j) => j.uid).includes(user.uid)
            ) {
              this.jobNoteLocal.noteTo.push(user)
            }
          }
        }
      }
    },
    async handleSave() {
      if (this.validateAllForms()) {
        this.loading = true
        this.handleUsersByDepartaments()
        this.jobNoteLocal.pictures = this.jobNoteLocal.pictures.map((e) => {
          const { name, ...send } = e
          return send
        })
        const _propertyId = this.propertyId
        const _date = new Date(
          this.jobNoteLocal.reminderDate + ',' + this.jobNoteLocal.reminderTime
        )
        this.jobNoteLocal.reminderDates = this.jobNoteLocal.setReminder
          ? Timestamp.fromDate(_date)
          : null
        const _data = {
          id: this.jobNoteLocal.id,
          title: this.jobNoteLocal.title,
          desc: this.jobNoteLocal.desc,
          ...(this.jobNoteLocal.noteTo && {
            noteToUid: [...this.jobNoteLocal.noteTo.map((user) => user.uid)],
          }),
          orderId: this.jobNoteLocal.orderId || this.orderId,

          noteType: this.jobNoteLocal.noteType,
          ...(this.jobNoteLocal.noteType === JOB_NOTES_TYPES.propertyNotes && {
            propertyId: this.jobNoteLocal.propertyId || _propertyId,
          }),
          ...(this.currentFiles &&
            this.currentFiles.length > 0 && { files: [...this.currentFiles] }),
          ...(this.jobNoteLocal.pictures && {
            pictures: [...this.jobNoteLocal.pictures],
          }),
          currentPictures: this.jobNoteLocal.currentPictures,
          reminderTime: this.jobNoteLocal.reminderTime,
          reminderDate: this.jobNoteLocal.reminderDate,
          reminderDates: this.jobNoteLocal.reminderDates,
          setReminder: this.jobNoteLocal.setReminder,
        }

        try {
          const jobNote = _data
          const send = {
            orderId: this.jobNoteLocal.orderId || this.orderId,
            jobNote,
          }

          await this.$store.dispatch('order/update_jobNote', send)
          this.loading = false
          this.$emit('close')
          this.$mainAlertSuccess(this.$t('successNoteUpdate'))
        } catch (error) {
          // eslint-disable-next-line
          console.log('error', error)
          this.$mainAlertError(this.$t('oopsProblem'))
          this.loading = false
        }
      }
    },

    getTomorrow(type) {
      const tomorrow = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      if (type && type.iso) {
        const dateUTCStr = tomorrow.toISOString().substr(0, 10)

        return dateUTCStr
      }
      return tomorrow
    },
    handleInputFiles(files) {
      if (!files || !files.length) {
        return
      }

      files.forEach((file, i) => {
        if (!file) {
          return
        }
        const indexOfFile = this.currentFiles
          .map((f) => f.name)
          .indexOf(file.name)
        const index = this.jobNoteLocal.pictures
          .map((f) => f.name)
          .indexOf(file.name)

        if (indexOfFile === -1 && index === -1) {
          this.currentFiles.splice(0, 0, file)
        }
        const codeName =
          new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)
        file.codeName = codeName
        const reader = new FileReader()
        reader.onload = (event) => {
          const url = event.target.result

          if (index === -1) {
            this.jobNoteLocal.pictures.splice(i, 0, {
              url,
              type: file.type,
              codeName: file.codeName,
              name: file.name,
            })
          }
        }
        reader.readAsDataURL(file)
      })
    },
    handlerShowImagesSlides(codeName) {
      this.showImagesSlides = true
      this.listImg = this.jobNoteLocal.pictures.filter(
        (pic) =>
          pic.type.includes(MEDIA_TYPES.image) ||
          pic.type.includes(MEDIA_TYPES.video)
      )
      this.indexOfImage = this.listImg.findIndex((c) => c.codeName === codeName)
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
    handleClosePdfViewer() {
      this.previewUrl = ''
      this.showPdfViewer = false
    },
    handleViewPdf(url) {
      this.previewUrl = url
      this.showPdfViewer = true
    },
  },
}
</script>

<style lang="scss" scoped>
.dismTitle {
  margin-top: -1.6rem;
}

.datos {
  margin-top: -1rem;
}
.previews {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  .file-preview {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .video-preview {
    object-fit: cover;
    border-radius: 4px;
  }

  .preview,
  .file-preview {
    width: 100px;
    height: 100px;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      border-radius: 4px;
    }
    .delete-icon {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
</style>
