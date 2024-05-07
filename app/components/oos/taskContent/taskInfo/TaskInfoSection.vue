<template>
  <div class="ml-2 mr-2">
    <div>
      <v-icon
        :size="requirementsValidate || reportsApproved ? 20 : 14"
        :color="requirementsValidate || reportsApproved ? 'success' : 'grey'"
        :class="requirementsValidate || reportsApproved ? 'icon-check' : ''"
        >{{
          requirementsValidate || reportsApproved
            ? 'mdi-check-bold'
            : 'mdi-brightness-1'
        }}</v-icon
      >
      <span
        class="font-weight-bold"
        :class="requirementsValidate ? '' : 'ml-1'"
        >{{ type }}</span
      >
    </div>

    <div v-if="requirements && requirements.length" class="ml-6">
      <!-- <h4 class="title-text | mb-2">
        {{ $t('requirements') }}
      </h4> -->
      <div v-for="requirement in requirements" :key="requirement.id">
        <v-icon
          :size="requirement.oosChecked ? 20 : 14"
          :color="requirement.oosChecked ? 'success' : 'grey'"
          >{{
            requirement.oosChecked ? 'mdi-check-bold' : 'mdi-brightness-1'
          }}</v-icon
        >

        <span class="sub-title" :class="requirement.oosChecked ? '' : 'ml-1'">
          {{ requirement.descRequirement }}</span
        >
        <div
          v-if="requirement.pictures && requirement.pictures.length"
          class="container-photos"
        >
          <h4 class="sub-title mb-1">
            {{ $t('filesAttached') }}
          </h4>
          <div class="previews">
            <div
              v-for="(pic, index) in requirement.pictures"
              :key="index"
              class="preview"
            >
              <img
                v-if="pic.type.includes('image')"
                class="img-task"
                :src="pic.url"
                alt=""
                height="63px"
                width="63px"
                @click="
                  handlerShowImagesSlides(
                    pic.codeName,
                    'requirement',
                    requirement
                  )
                "
              />
              <div
                v-if="pic.type.includes('pdf')"
                class="file-preview d-flex align-center justify-center"
                @click="handleViewPdf(pic.url)"
              >
                <v-icon large>mdi-file-pdf-box</v-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <slide-show
      v-if="taskSelected"
      :list="listImg"
      :show="showImagesSlidesDesc"
      :title="taskSelected.title"
      type="images"
      :index-selected="indexOfImageDesc"
      @close="showImagesSlidesDesc = false"
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
  components: { SlideShow, PdfViewer },
  props: {
    reportsApproved: { type: Boolean, default: false },
    requirements: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    taskSelected: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      listImg: [],
      showImagesSlidesDesc: false,
      indexOfImageDesc: 0,
      showPdfViewer: false,
      previewUrl: '',
    }
  },
  computed: {
    requirementsValidate() {
      if (!this.requirements.length) {
        return false
      }
      for (let i = 0; i < this.requirements.length; i++) {
        const requirement = this.requirements[i]
        if (!requirement.oosChecked) {
          return false
        }
      }
      return true
    },
  },
  methods: {
    handlerShowImagesSlides(codeName, type, requirement) {
      if (type === 'task') {
        this.showImagesSlidesDesc = true
        this.listImg = this.taskSelected.pictures.filter((pic) =>
          pic.type.includes('image')
        )
        this.indexOfImageDesc = this.listImg.findIndex(
          (c) => c.codeName === codeName
        )
      } else if (type === 'requirement') {
        this.showImagesSlidesDesc = true

        this.listImg = requirement.pictures.filter((pic) =>
          pic.type.includes('image')
        )
        this.indexOfImageDesc = this.listImg.findIndex(
          (c) => c.codeName === codeName
        )
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
  },
}
</script>

<style lang="scss" scoped>
.title-text {
  font-size: 0.82rem;
  font-weight: bold;
  color: var(--v-info-darken2);
  margin-top: 0.5rem;
}
.sub-title {
  font-size: 0.77rem;
  font-weight: bold;
  color: var(--v-info-darken1);
}
.icon-check {
  margin-top: -4px;
}
</style>
