<template>
  <div class="requirement-view | mb-2">
    <div class="header | d-flex align-center gap-16">
      <div class="requirement-title">
        <v-icon size="14" color="grey">mdi-brightness-1 </v-icon>
        <span>{{ requirement.descRequirement.replace('%$0', '') }}</span>
      </div>
      <div class="actions flex-shrink-0">
        <v-tooltip
          v-if="requirement.markForAutocomplete"
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="ml-1"
              icon
              color="primary"
              x-small
              v-bind="attrs"
              v-on="on"
              @click="$emit('apply-autocomplete-requirement')"
            >
              <v-icon size="17">mdi-plus-circle-multiple-outline</v-icon>
            </v-btn>
          </template>
          <span>Apply auto-reapeat for this requirement</span>
        </v-tooltip>
        <v-menu offset-y bottom left>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn small icon v-bind="attrs" v-on="on">
              <v-icon small color="primary">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <!-- <v-list-item
              v-if="requirement.markForAutocomplete"
              @click="$emit('apply-autocomplete-requirement')"
            >
              <v-list-item-icon>
                <v-icon>mdi-plus-circle-multiple-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Apply auto-reapeat</v-list-item-title>
            </v-list-item> -->

            <v-list-item
              v-if="jobType !== 'inspections'"
              @click="$emit('duplicate-requirement')"
            >
              <v-list-item-icon>
                <v-icon small color="primary">mdi-content-duplicate</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Duplicate</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('edit-requirement')">
              <v-list-item-icon>
                <v-icon small color="primary">mdi-text-box-edit-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('delete-requirement')">
              <v-list-item-icon>
                <v-icon small color="error">mdi-delete</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <!-- <div class="actions flex-shrink-0">
        <v-tooltip
          v-if="requirement.markForAutocomplete"
          open-delay="600"
          content-class="small"
          top
        > -->
      <!-- eslint-disable-next-line -->
      <!--<template v-slot:activator="{ on, attrs }">
            <v-btn
              class="ml-1"
              icon
              color="primary"
              x-small
              v-bind="attrs"
              v-on="on"
              @click="$emit('apply-autocomplete-requirement')"
            >
              <v-icon size="17">mdi-plus-circle-multiple-outline</v-icon>
            </v-btn>
          </template>
          <span>Apply auto-reapeat for this requirement</span>
        </v-tooltip>
        <v-tooltip open-delay="600" content-class="small" top> -->
      <!-- eslint-disable-next-line -->
      <!-- <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="ml-1"
              icon
              color="primary"
              x-small
              v-bind="attrs"
              v-on="on"
              @click="$emit('duplicate-requirement')"
            >
              <v-icon size="17">mdi-content-duplicate</v-icon>
            </v-btn>
          </template>
          <span>Duplicate</span>
        </v-tooltip>

        <v-tooltip open-delay="600" content-class="small" top> -->
      <!-- eslint-disable-next-line -->
      <!-- <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="ml-1"
              icon
              color="primary"
              x-small
              v-bind="attrs"
              v-on="on"
              @click="$emit('edit-requirement')"
            >
              <v-icon size="17">mdi-text-box-edit-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('editRequirement') }}</span>
        </v-tooltip>
        <v-tooltip open-delay="600" content-class="small" top> -->
      <!-- eslint-disable-next-line -->
      <!--  <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mr-2"
              icon
              x-small
              v-bind="attrs"
              v-on="on"
              @click="$emit('delete-requirement')"
            >
              <v-icon color="error" size="17">mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('deleteRequirement') }}</span>
        </v-tooltip>
      </div> -->
    </div>

    <div class="previews-requirements">
      <div
        v-for="(pic, j) in requirement.pictures"
        :key="j"
        class="preview-requirement text-right"
      >
        <img
          v-if="pic.type.includes('image')"
          :src="pic.url"
          alt=""
          height="100px"
          width="100px"
          @mousemove="zoomHover($event, pic)"
          @mouseleave="zoomLeave($event)"
          @click="handleShowImagesSlides(pic)"
        />
        <div
          v-if="pic.type.includes('pdf')"
          class="file-preview-requirement | d-flex align-center justify-center"
          @click="handleViewPdf(pic.url)"
        >
          <v-icon large>mdi-file-pdf-box</v-icon>
        </div>
      </div>
    </div>
    <slide-show
      :list="listPictures"
      :show="showImagesSlides"
      :title="$t('ImagesView') + ' ' + $t('requirement')"
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
import SlideShow from '~/components/misc/SlideShow.vue'
import PdfViewer from '~/components/misc/PdfViewer.vue'
export default {
  name: 'RequirementView',
  components: { SlideShow, PdfViewer },
  props: {
    requirement: { type: Object, required: true },
    jobType: { type: String, required: true },
  },
  data() {
    return {
      listPictures: [],
      indexOfImage: 0,
      showImagesSlides: false,
      previewUrl: '',
      showPdfViewer: false,
      // localRequirement: null,
    }
  },

  // watch: {
  //   requirement: {
  //     handler(val) {
  //       this.localRequirement = val
  //     },
  //     immediate: true,
  //   },
  // },

  methods: {
    handleShowImagesSlides(pic) {
      this.showImagesSlides = true
      this.listPictures = this.requirement.pictures.filter((pic) =>
        pic.type.includes('image')
      )
      const idx = this.listPictures.findIndex(
        (p) => p.codeName === pic.codeName
      )
      if (idx !== -1) {
        this.indexOfImage = idx
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
.previews-requirements {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  .preview-requirement {
    margin-top: 0.5rem;
    width: 80px;
    height: 80px;
    padding: 0.5em;
    cursor: pointer;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
    .file-preview-requirement {
      height: 100%;
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .delete-icon-requirement {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
</style>
