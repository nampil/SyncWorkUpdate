<template>
  <div class="container-add-job-note">
    <v-dialog v-model="dialog" persistent max-width="800px" scrollable>
      <v-card min-width="800px">
        <v-toolbar dark color="secondary" class="flex-grow-0" dense>
          <v-btn icon dark @click="handleClose">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ $t('addJobNotes') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn ref="btnSave" dark text @click="handleSave">
              {{ $t('save') }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="pa-8">
          <div v-for="(item, i) in jobNotes" :key="i" class="mb-11">
            <v-form ref="formu" class="task-form mb-4" lazy-validation>
              <v-row>
                <v-col :cols="jobNotes.length > 1 ? '11' : '12'">
                  <v-combobox
                    ref="formuinput"
                    v-model="item.noteType"
                    :items="items.noteType"
                    outlined
                    dense
                    autofocus
                    :rules="rulesType"
                    :label="$t('noteType')"
                    hide-details="auto"
                    required
                    @change="handleFocus('noteTo', 1, i)"
                    @keydown.enter.exact.prevent
                    @keyup.enter.exact="handleFocus('noteTo', 1, i)"
                  ></v-combobox>
                </v-col>
                <v-col v-if="jobNotes.length > 1" cols="1">
                  <v-btn icon color="error" @click="handleDelete(i)"
                    ><v-icon>mdi-delete</v-icon></v-btn
                  >
                </v-col>

                <v-col cols="12">
                  <v-autocomplete
                    ref="formuinput"
                    v-model="item.noteTo"
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
                    v-model="item.setReminder"
                    hide-details
                    :label="$t('setReminder')"
                    dense
                  ></v-checkbox>
                </v-col>

                <v-col cols="6">
                  <v-menu
                    v-if="item.setReminder"
                    :ref="'menu' + i"
                    v-model="item.dateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="item.reminderDate"
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
                      v-model="item.reminderDate"
                      @input="item.dateMenu = false"
                    >
                    </v-date-picker>
                  </v-menu>
                </v-col>

                <v-col v-if="item.setReminder" cols="6">
                  <v-menu
                    :ref="'menur' + i"
                    :close-on-content-click="false"
                    :nudge-right="5"
                    :return-value.sync="item.reminderTime"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="item.reminderTime"
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
                      v-model="item.reminderTime"
                      format="ampm"
                      full-width
                      @click:minute="
                        $refs['menur' + i][0].save(item.reminderTime)
                      "
                    ></v-time-picker>
                  </v-menu>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    ref="formuinput"
                    v-model="item.title"
                    class="dismTitle"
                    :label="$t('title')"
                    :rules="rulesTitle"
                    outlined
                    dense
                    hide-details="auto"
                    required
                    @keyup.enter.exact="handleFocus('descriptions', 3, i)"
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
                    hide-details="auto"
                    truncate-length="15"
                    @click="$event.target.value = ''"
                    @change="handleInputFiles($event, i)"
                  ></v-file-input>
                  <div v-if="item.pictures?.length" class="previews">
                    <div
                      v-for="(pic, j) in item.pictures"
                      :key="j"
                      class="preview text-center mb-0"
                    >
                      <img
                        v-if="pic.type.includes('image')"
                        :src="pic.url"
                        alt=""
                        height="100px"
                        width="100px"
                        @mousemove="zoomHover($event, pic)"
                        @mouseleave="zoomLeave($event)"
                        @click="
                          handlerShowImagesSlides(item.pictures, pic.codeName)
                        "
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
                          @click="
                            handlerShowImagesSlides(item.pictures, pic.codeName)
                          "
                        />
                      </div>
                      <v-btn
                        icon
                        class="delete-icon"
                        @click="handleDeletePic(pic, i)"
                      >
                        <v-icon color="error" small>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    ref="formuinput"
                    v-model="item.desc"
                    :label="$t('description')"
                    auto-grow
                    :rules="rulesDesc"
                    outlined
                    rows="4"
                    row-height="30"
                    required
                    @keydown.enter.exact.prevent
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-form>
            <v-divider></v-divider>
          </div>
          <div class="task-action text-center">
            <v-btn
              icon
              :disabled="addJobNoteDisabled"
              @click="addJobNotes(true)"
              ><v-icon>mdi-plus-circle-outline</v-icon></v-btn
            >
          </div>
        </v-card-text>
        <v-overlay :value="loading">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-card>
    </v-dialog>
    <slide-show
      :list="listImg"
      :index-selected="indexOfImage"
      :show="showImagesSlides"
      :title="$t('ImagesView') + ' ' + 'job note'"
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
import { JOB_NOTES_TYPES, MEDIA_TYPES } from '@/utils/dictionaries'
import SlideShow from '~/components/misc/SlideShow.vue'
import PdfViewer from '~/components/misc/PdfViewer.vue'
export default {
  name: 'AddJobNote',
  components: { SlideShow, PdfViewer },
  props: {
    show: { type: Boolean, default: false },
    orderId: { type: String, default: '' },
    propertyId: { type: String, default: '' },
    jobNote: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      loading: false,
      dialog: false,
      rulesFile: [
        (value) =>
          !value || value.size < 2000000 || 'File debe pesar menos de 2MB',
      ],
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
      files: [],
      pictures: [],
      noteType: '',
      noteTo: '',
      setReminder: false,
      title: '',
      desc: '',
      reminderTime: null,
      reminderDate: null,
      reminderDates: null,
      dateMenu: false,
      jobNotes: [],
      showImagesSlides: false,
      listImg: [],
      indexOfImage: 0,
      previewUrl: '',
      showPdfViewer: false,
      usersList: [],
    }
  },
  computed: {
    addJobNoteDisabled() {
      if (this.jobNotes.length > 0) {
        const endData = this.jobNotes[this.jobNotes.length - 1]
        return (
          endData.noteType === '' ||
          endData.noteTo.length === 0 ||
          endData.title === '' ||
          endData.desc === '' ||
          (endData.setReminder &&
            (endData.reminderDate === null || endData.reminderTime === null))
        )
      } else {
        return true
      }
    },
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

  watch: {
    show(val) {
      this.dialog = val
    },
  },

  async mounted() {
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

      const arrayUsers = this.usersList.map((adminUser) => ({
        value: adminUser,
        text: adminUser.fullName,
        group: 'Users',
      }))

      this.items.noteTo = arrayGroup.concat(arrayUsers)

      this.loading = false
    } catch (error) {
      this.$mainAlertError(this.$t('oopsProblem'))
      // eslint-disable-next-line
      console.log('error: ', error)
    }
    this.addJobNotes(false)
  },

  methods: {
    handleFocus(type, i, nformu) {
      const indice = i + nformu * 4
      this.$nextTick(() => {
        if (type === 'noteTo') {
          this.$refs.formuinput[indice - 1].blur()
          this.$refs.formuinput[indice].focus()
        } else if (type === 'tittle') {
          this.$refs.formuinput[indice - 1].blur()
          this.$refs.formuinput[indice].focus()
        } else {
          this.$refs.formuinput[indice].focus()
        }
      })
    },
    handleFocusBtnActions() {
      this.$refs.btnSave.$el.focus()
    },
    handleDeletePic(pic, i) {
      const indexOfPic = this.jobNotes[i].pictures
        .map((p) => p.url)
        .indexOf(pic.url)
      this.jobNotes[i].pictures.splice(indexOfPic, 1)

      const indexOfFile = this.jobNotes[i].files
        .map((f) => f.codeName)
        .indexOf(pic.codeName)

      if (indexOfFile > -1) {
        this.jobNotes[i].files.splice(indexOfFile, 1)
      }
    },
    validateAllForms() {
      let isValid = true
      for (let index = 0; index < this.$refs.formu.length; index++) {
        const form = this.$refs.formu[index]
        isValid = form.validate()
      }
      return isValid
    },
    desValidateAllForms() {
      for (let index = 0; index < this.$refs.formu.length; index++) {
        const form = this.$refs.formu[index]
        form.resetValidation()
      }
    },
    resetAllForms() {
      for (let index = 0; index < this.$refs.formu.length; index++) {
        const form = this.$refs.formu[index]
        form.reset()
      }
    },
    handleClose() {
      this.jobNotes = []
      this.desValidateAllForms()
      this.addJobNotes(false)
      this.$emit('close')
    },
    handleUsersByDepartaments() {
      const _departments = ['OOS', 'Processors', 'Receiving Orders']

      this.jobNotes.forEach((jobNote) => {
        for (let i = 0; i < _departments.length; i++) {
          const department = _departments[i]

          if (jobNote.noteTo.includes(department)) {
            const idx = jobNote.noteTo
              .map((n) => n.uid || n)
              .indexOf(department)
            if (idx !== -1) {
              jobNote.noteTo.splice(idx, 1)
            }

            const _department = department.trim().replace(' ', '_')

            for (
              let i = 0;
              i < this.usersByDepartaments[_department].length;
              i++
            ) {
              const user = this.usersByDepartaments[_department][i]
              if (!jobNote.noteTo.map((j) => j.uid).includes(user.uid)) {
                jobNote.noteTo.push(user)
              }
            }
          }
        }
      })
    },
    async handleSave() {
      if (!this.validateAllForms()) {
        return
      }
      this.loading = true
      const orderId = this.orderId
      const propertyId = this.propertyId
      this.handleUsersByDepartaments()
      const _jobNotes = this.jobNotes.map(function (jobNote) {
        const _date = new Date(
          jobNote.reminderDate + ',' + jobNote.reminderTime
        )
        jobNote.reminderDates = jobNote.setReminder
          ? Timestamp.fromDate(_date)
          : null

        return {
          title: jobNote.title,
          desc: jobNote.desc,
          ...(jobNote.noteTo && {
            noteToUid: [...jobNote.noteTo.map((user) => user.uid || user)],
          }),
          noteType: jobNote.noteType,
          ...(jobNote.files &&
            jobNote.files.length > 0 && { files: [...jobNote.files] }),
          ...(jobNote.pictures && { pictures: [...jobNote.pictures] }),
          reminderTime: jobNote.reminderTime,
          reminderDate: jobNote.reminderDate,
          reminderDates: jobNote.reminderDates,
          setReminder: jobNote.setReminder,
          orderId,
          ...(jobNote.noteType === JOB_NOTES_TYPES.propertyNotes && {
            propertyId,
          }),
        }
      })

      const objToSend = {
        orderId,
        jobNotes: _jobNotes,
      }

      try {
        await this.$store.dispatch('order/add_jobNote', objToSend)
        this.desValidateAllForms()
        this.resetAllForms()
        this.$nextTick(() => {
          this.jobNotes = []
          this.addJobNotes(false)
        })
        this.loading = false
        this.$emit('close')
        this.$mainAlertSuccess(this.$t('successNoteAdded'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
        this.addJobNotes(false)
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
    addJobNotes(scroll) {
      this.jobNotes.push({
        noteType: '',
        noteTo: [],
        setReminder: false,
        title: '',
        desc: '',
        reminderTime: null,
        reminderDate: null,
        files: [],
        pictures: [],
      })

      if (!scroll) {
        /*         this.$nextTick(() => {
          this.$refs.scrollArea.style.scrollBehavior = 'smooth'
          this.$refs.scrollArea.scrollTo(0, this.$refs.scrollArea.scrollHeight)
        }) */
      }
    },
    handleInputFiles(files, index) {
      if (!files || !files.length) {
        return
      }

      files.forEach((file, i) => {
        const indexOfFile = this.jobNotes[index].files
          .map((f) => f.name)
          .indexOf(file.name)

        if (indexOfFile === -1) {
          this.jobNotes[index].files.splice(0, 0, file)
        } else {
          this.jobNotes[index].files.splice(indexOfFile, 1, file)
        }

        const codeName =
          new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)

        file.codeName = codeName

        const reader = new FileReader()
        reader.onload = (event) => {
          const url = event.target.result

          if (indexOfFile === -1) {
            this.jobNotes[index].pictures.splice(i, 0, {
              url,
              type: file.type,
              codeName: file.codeName,
            })
          } else {
            this.jobNotes[index].pictures.splice(indexOfFile, 1, {
              url,
              type: file.type,
              codeName: file.codeName,
            })
          }
        }
        reader.readAsDataURL(file)
      })
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
    handlerShowImagesSlides(pictures, codeName) {
      this.showImagesSlides = true
      this.listImg = pictures.filter(
        (pic) =>
          pic.type.includes(MEDIA_TYPES.image) ||
          pic.type.includes(MEDIA_TYPES.video)
      )
      this.indexOfImage = this.listImg.findIndex((c) => c.codeName === codeName)
    },
    handleClosePdfViewer() {
      this.previewUrl = ''
      this.showPdfViewer = false
    },
    handleViewPdf(url) {
      this.previewUrl = url
      this.showPdfViewer = true
    },
    handleDelete(i) {
      this.jobNotes.splice(i, 1)
      this.desValidateAllForms()
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
.dialog {
  overflow: hidden;
}
</style>
