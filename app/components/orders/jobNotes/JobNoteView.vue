<template>
  <div class="container-job-note-view">
    <v-dialog v-model="show" scrollable persistent max-width="1000px">
      <v-card min-width="1000px">
        <v-toolbar color="secondary" dense class="flex-grow-0">
          <v-toolbar-title class="white--text">{{
            jobNote.title
          }}</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-btn icon class="white--text" @click="$emit('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-8">
          <h5 class="text-h5">{{ jobNote.title }}</h5>

          <p
            v-for="(_desc, index) in jobNote.desc.split('\n')"
            :key="index"
            class="dates"
          >
            {{ _desc }}
          </p>

          <p
            v-if="jobNote.setReminder && jobNote.reminderDates"
            class="pa-0 ma-0"
          >
            {{ $t('reminder') }}
            {{
              $formatDate(jobNote.reminderDates.toDate(), { iso: false }) +
              '  ' +
              jobNote.reminderTime
            }}
          </p>

          <v-divider></v-divider>
          <div class="pictures-list d-flex flex-wrap pt-4 gap-12">
            <div
              v-for="(pic, i) in jobNote.pictures"
              :key="i"
              class="pic-wrapper"
            >
              <img
                v-if="pic.type.includes('image')"
                class="margen-img"
                :src="pic.url"
                alt=""
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
                  height="150px"
                  width="150px"
                  :src="pic.url"
                  @click="handlerShowImagesSlides(pic.codeName)"
                />
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <slide-show
      v-if="typeof jobNote.pictures !== 'undefined'"
      :list="listImg"
      :index-selected="indexOfImage"
      :show="showImagesSlides"
      :title="$t('ImagesView') + ' ' + jobNote.title"
      type="images"
      @close="showImagesSlides = false"
    />
    <v-dialog v-model="showPdfViewer" fullscreen>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>
  </div>
</template>

<script>
import SlideShow from '../../misc/SlideShow.vue'
import PdfViewer from '../../misc/PdfViewer.vue'
import { MEDIA_TYPES } from '~/utils/dictionaries'
export default {
  name: 'JobNoteView',
  components: { SlideShow, PdfViewer },
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    jobNote: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      previewUrl: '',
      showPdfViewer: false,
      show: false,
      showImagesSlides: false,
      listImg: [],
      indexOfImage: 0,
    }
  },
  watch: {
    open(val) {
      this.show = val
    },
  },
  methods: {
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
.dates {
  margin-top: 0.6rem;
}
.file-preview {
  border: 1px solid #ddd;
  border-radius: 4px;
}
.pic-wrapper,
.file-preview {
  width: 150px;
  height: 150px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    cursor: pointer;
    border-radius: 4px;
  }
  .video-preview {
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
  }
}
.dialog {
  overflow: hidden;
}
</style>
