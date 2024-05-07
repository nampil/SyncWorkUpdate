<template>
  <div class="container-job-note">
    <v-card v-if="jobNote" :id="jobNote.id" class="jn">
      <v-toolbar
        dense
        elevation="0"
        :class="['job-note-toolbar', { pinned: jobNote.pin }]"
      >
        <v-toolbar-title class="toolbar"
          ><span class="job-note-title">
            {{ $truncate(jobNote.title, 25) }}
          </span>
          <p v-if="jobNote.updatedBy" class="info-jobNote info--text pt-1">
            {{ jobNote.updatedBy.fullName }}
            {{ $formatDate(jobNote.updatedAt.toDate(), { time: true }) }}
          </p>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div
          class="action-container d-flex flex-wrap justify-center justify-md-between"
        >
          <!-- <v-tooltip open-delay="600" content-class="small" top>
           
            <template v-slot:activator="{ on, attrs }">
              <v-btn small icon v-bind="attrs" v-on="on">
                <v-icon small color="primary" @click="showJobNoteView = true"
                  >mdi-eye</v-icon
                >
              </v-btn>
            </template>
            <span>Show Job Note Info</span>
          </v-tooltip> -->

          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn small icon @click="expanded = !expanded"
                ><v-icon color="primary" v-bind="attrs" v-on="on">{{
                  expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'
                }}</v-icon></v-btn
              >
            </template>
            <span>{{
              !expanded ? 'Show Job Note Info' : 'Hide Job Note Info'
            }}</span>
          </v-tooltip>

          <v-tooltip
            v-if="!fromSearch"
            open-delay="600"
            content-class="small"
            top
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn small icon v-bind="attrs" v-on="on">
                <v-icon small color="primary" @click="showEditJobNote = true"
                  >mdi-pencil</v-icon
                >
              </v-btn>
            </template>
            <span>Edit Job Note</span>
          </v-tooltip>
          <v-tooltip
            v-if="!fromSearch"
            open-delay="600"
            content-class="small"
            top
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn small icon v-bind="attrs" v-on="on">
                <v-icon
                  small
                  :color="jobNote.pin ? 'warning' : 'primary'"
                  @click="pinNote"
                  >mdi-pin</v-icon
                >
              </v-btn>
            </template>
            <span>Pin Job Note</span>
          </v-tooltip>
        </div>
        <v-tooltip
          v-if="!fromSearch && authToDelete"
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              small
              icon
              v-bind="attrs"
              v-on="on"
              @click="showDelete = !showDelete"
            >
              <v-icon small color="red">mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>{{ !authToDelete ? 'No authorized' : 'Delete Job Note' }}</span>
        </v-tooltip>
      </v-toolbar>
      <div :class="['order-progress', { expanded: expanded }]">
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <p
                v-for="(_desc, index) in jobNote.desc.split('\n')"
                :key="index"
              >
                {{ _desc }}
              </p>
            </v-col>
            <v-col
              v-if="jobNote.setReminder && jobNote.reminderDates"
              cols="12"
              class="dates"
            >
              <p class="pa-0 ma-0 disabled-text">
                {{ $t('reminder') }}
                {{
                  $formatDate(jobNote.reminderDates.toDate(), { iso: false }) +
                  '  ' +
                  jobNote.reminderTime
                }}
              </p>
            </v-col>
            <div class="previews ml-3">
              <div
                v-for="(pic, index) in jobNote.pictures"
                :key="index"
                class="preview mb-2"
              >
                <img
                  v-if="pic.type.includes('image')"
                  :src="pic.url"
                  alt=""
                  height="68px"
                  width="68px"
                  @mousemove="zoomHover($event, pic)"
                  @mouseleave="zoomLeave($event)"
                  @click="handlerShowImagesSlides(pic.codeName)"
                />
                <div
                  v-if="pic.type.includes('pdf')"
                  class="file-preview d-flex flex-column align-center justify-center"
                  @click="handleViewPdf(pic.url)"
                >
                  <v-icon large>mdi-file-pdf-box</v-icon>
                </div>
                <div
                  v-if="pic.type.includes('pdf')"
                  class="file-caption | text--small text--secondary"
                >
                  {{ pic.name }}
                </div>
                <div v-if="pic.type.includes('video')">
                  <video
                    class="video-preview"
                    height="68px"
                    width="68px"
                    :src="pic.url"
                    @click="handlerShowImagesSlides(pic.codeName)"
                  />
                </div>
              </div>
            </div>
          </v-row>
        </v-card-text>
        <v-divider v-if="jobNote?.noteTo?.length"></v-divider>
        <ul class="d-flex flex-wrap mt-2 content-noteTo">
          <li
            v-for="(to, i) in jobNote.noteTo"
            :key="i"
            class="info-jobNote | info--text"
          >
            <span v-if="i === 0">To: </span>
            <span>
              {{ to.fullName }}{{ i !== jobNote.noteTo.length - 1 ? ',' : '.' }}
            </span>
          </li>
        </ul>
      </div>
    </v-card>
    <slide-show
      v-if="jobNote.pictures && jobNote.pictures.length"
      :list="listImg"
      :show="showImagesSlides"
      :title="jobNote.title"
      type="images"
      :index-selected="indexOfImage"
      @close="showImagesSlides = false"
    />
    <v-dialog v-model="showPdfViewer" max-width="1000px" scrollable>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>
    <v-dialog
      v-model="showEditJobNote"
      :overlay="false"
      persistent
      scrollable
      transition="dialog-transition"
      max-width="800px"
    >
      <editJobNote
        v-if="showEditJobNote"
        :order-id="order.id"
        :property-id="order.propertyId"
        :disabled="order.edited"
        :job-note="jobNote"
        @close="showEditJobNote = false"
      ></editJobNote>
    </v-dialog>
    <v-dialog
      v-model="showDelete"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <delete-job-note @close="showDelete = false" @delete="deleteNote" />
    </v-dialog>

    <JobNoteView
      :job-note="jobNote"
      :open="showJobNoteView"
      @close="showJobNoteView = false"
    ></JobNoteView>
  </div>
</template>

<script>
import SlideShow from '../../misc/SlideShow.vue'
import PdfViewer from '../../misc/PdfViewer.vue'
import DeleteJobNote from './DeleteJobNote.vue'
import editJobNote from '@/components/orders/jobNotes/EditJobNote'
import JobNoteView from '@/components/orders/jobNotes/JobNoteView.vue'
import { MEDIA_TYPES } from '~/utils/dictionaries'

export default {
  name: 'JobNote',
  components: { editJobNote, JobNoteView, SlideShow, PdfViewer, DeleteJobNote },
  props: {
    jobNote: { type: Object, default: () => ({}) },
    order: {
      type: Object,
      default: () => ({}),
    },
    fromSearch: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      showEditJobNote: false,
      showJobNoteView: false,
      showImagesSlides: false,
      showPdfViewer: false,
      previewUrl: '',
      indexOfImage: 0,
      listImg: [],
      expanded: false,
      showDelete: false,
    }
  },
  computed: {
    authToDelete() {
      const authLevel =
        this.$store.state.auth.user?.userCredential?.claims?.authLevel

      if (!authLevel || parseFloat(authLevel) < 7) {
        return false
      }

      return true
    },
  },
  methods: {
    handleTaskViewModal(val) {
      this.showJobNoteView = val
    },
    async deleteNote() {
      const send = {
        orderId: this.jobNote.orderId || this.order.id,
        jobNote: this.jobNote,
      }
      this.loading = true

      try {
        const res = await this.$store.dispatch('order/remove_jobNote', send)
        /* this.$emit('close') */
        this.$mainAlertSuccess(res)

        this.loading = false
      } catch (error) {
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
      }
    },
    handleClosePdfViewer() {
      this.previewUrl = ''
      this.showPdfViewer = false
    },
    handleViewPdf(url) {
      this.previewUrl = url
      this.showPdfViewer = true
    },
    handlerShowImagesSlides(codeName) {
      this.showImagesSlides = true
      this.listImg = this.jobNote.pictures.filter(
        (pic) =>
          pic.type.includes(MEDIA_TYPES.image) ||
          pic.type.includes(MEDIA_TYPES.video)
      )
      this.indexOfImage = this.listImg.findIndex((c) => c.codeName === codeName)
    },
    async pinNote() {
      let newPin = null
      if (this.jobNote.pin) {
        newPin = !this.jobNote.pin
      } else {
        newPin = true
      }
      try {
        await this.$store.dispatch('order/update_pinJobNote', {
          pin: newPin,
          id: this.jobNote.id,
          orderId: this.order.id,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
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

<styles lang="scss" scoped>
.jn {
  margin-bottom: 1rem;
  transition: all 300ms ease-in-out;
  &.highlight {
    outline: 3px solid var(--v-warning-base);
    box-shadow: 0 0 15px var(--v-warning-base) !important;
  }
}

.job-note-toolbar {
  &.pinned {
    background-color: var(--clr-orange-400);
  }
}
.dates {
  margin-top: -1rem;
}
.info-jobNote {
  font-size: 0.7rem;
  font-weight: 500;
}
.toolbar {
  margin-top: 0.6rem;
}
.previews {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;

  .video-preview {
    object-fit: cover;
    border-radius: 4px;
  }

  .preview {
    width: 68px;

    position: relative;
    .file-preview {
      aspect-ratio: 1;
      border: 1px solid #ddd;
      border-radius: 4px;
      line-height: 1;
    }
    .file-caption {
      text-align: center;
      margin-top: 0.25rem;
      line-height: 1;
    }

    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      object-position: center;
      border-radius: 4px;
    }
  }
}

.preview {
  cursor: pointer;
}

.job-note-title {
  font-size: 0.9rem;
  font-weight: bold;
}
li {
  padding: 0.15rem;
  font-size: 0.9rem;
}
ul,
ol {
  padding: 0;
  list-style: none;
}
.content-noteTo {
  margin-left: -1.2rem;
}
.dialog {
  overflow: hidden;
}
.order-progress {
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms cubic-bezier(0, 1, 0, 1);
  &.expanded {
    // max-height: fit-content;
    max-height: 10000px;
    transition: max-height 500ms ease-in-out;
  }
}
</styles>
