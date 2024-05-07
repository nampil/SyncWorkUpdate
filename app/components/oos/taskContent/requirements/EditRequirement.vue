<template>
  <div class="container-edit-requirement | d-flex">
    <v-card class="elevation-0 d-flex flex-column overflow-hidden">
      <v-toolbar color="secondary" dense class="flex-grow-0">
        <v-btn icon :disabled="loading" @click="close()">
          <v-icon>mdi-close</v-icon></v-btn
        >

        <!-- <v-icon color="white" class="mr-4">mdi-text-box-edit-outline</v-icon> -->
        <v-toolbar-title class="d-flex aling-center">
          {{ $t('editRequirement') }}</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            ref="botonUpdate"
            text
            :loading="loading"
            :disabled="validateUpdate"
            @click="updateRequirement()"
            >{{ $t('update') }}</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>
      <div class="flex-grow-1 overflow-y-auto">
        <v-card-text class="text-center">
          <v-form ref="formRequirement" class="task-form mt-5" lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="editDesc"
                  :label="$t('description')"
                  outlined
                  autofocus
                  :rules="rules"
                  dense
                  hide-details="auto"
                  auto-grow
                  maxlength="240"
                  rows="1"
                  @keydown.enter.exact.prevent
                >
                </v-textarea>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="quantityPhotosRequired"
                  :label="'#' + $t('photosRequired')"
                  hide-details="auto"
                  outlined
                  dense
                  :rules="rulesPhotos"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="placard"
                  hide-details
                  :label="$t('Do this requirement require placard?')"
                  dense
                ></v-checkbox>
              </v-col>
              <v-col v-if="placard" cols="12">
                <v-text-field
                  v-model="placardText"
                  :label="$t('placardText')"
                  hide-details="auto"
                  outlined
                  dense
                  :counter="30"
                  :rules="rulesPlacard"
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="container-input-file">
                <v-file-input
                  ref="inputFile"
                  accept="image/png, image/jpeg, image/bmp, application/pdf"
                  prepend-icon="mdi-paperclip"
                  :label="$t('imgInput')"
                  class="input-file"
                  outlined
                  dense
                  multiple
                  truncate-length="15"
                  @click="$event.target.value = ''"
                  @change="handleInputFiles($event)"
                ></v-file-input>
                <div class="previews">
                  <div
                    v-for="(pic, j) in requirement.pictures"
                    :key="j"
                    class="preview | text-center"
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
                      class="file-preview | d-flex align-center justify-center"
                      @click="handleViewPdf(pic.url)"
                    >
                      <v-icon large>mdi-file-pdf-box</v-icon>
                    </div>
                    <v-btn
                      icon
                      small
                      class="delete-icon"
                      @click="handleDeletePic(pic)"
                    >
                      <v-icon color="error" small>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </div>
    </v-card>
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
  name: 'EditRequirement',
  components: { SlideShow, PdfViewer },
  props: {
    editedRequirement: { type: Object, default: () => ({}) },
    orderId: { type: String, default: '' },
    taskId: { type: String, default: '' },
    type: { type: String, default: '' },
  },
  data() {
    return {
      rules: [(v) => !!v || this.$t('thisFieldRequired')],
      rulesPhotos: [(v) => !isNaN(v) || this.$t('onlyNumbersRequired')],
      rulesPlacard: [
        (v) =>
          (!!v && v.length > 0 && v.length <= 30) ||
          this.$t(
            'This field is required and must have less than 30 characters'
          ),
      ],
      loading: false,
      editDesc: '',
      requirement: {},
      currentFiles: [],
      pictures: [],
      quantityPhotosRequired: null,
      placard: true,
      placardText: '',
      previewUrl: '',
      showPdfViewer: false,
      listPictures: [],
      indexOfImage: 0,
      showImagesSlides: false,
    }
  },
  computed: {
    validateUpdate() {
      let validateQuantity = true
      if (this.editedRequirement.quantityPhotosRequired === undefined) {
        validateQuantity = this.quantityPhotosRequired === null
      } else {
        validateQuantity =
          this.quantityPhotosRequired ===
          this.editedRequirement.quantityPhotosRequired
      }
      return (
        this.editDesc === this.editedRequirement.descRequirement &&
        this.currentFiles.length === 0 &&
        JSON.stringify(this.requirement.currentPictures) ===
          JSON.stringify(this.editedRequirement.pictures) &&
        this.quantityPhotosRequired ===
          this.editedRequirement.quantityPhotosRequired &&
        validateQuantity &&
        JSON.stringify(this.requirement.pictures) ===
          JSON.stringify(this.editedRequirement.pictures) &&
        this.placard === this.editedRequirement.placard &&
        this.placardText === this.editedRequirement.placardText
      )
    },
  },
  watch: {
    editedRequirement() {
      this.editDesc = this.editedRequirement.descRequirement
      this.placard = this.editedRequirement.placard || false
      this.placardText = this.editedRequirement.placardText || ''
      this.quantityPhotosRequired =
        this.editedRequirement.quantityPhotosRequired
    },
    validateUpdate(val) {
      this.$emit('update-persistent', !val)
    },
  },
  mounted() {
    this.editDesc = this.editedRequirement.descRequirement
    this.placard = this.editedRequirement.placard || false
    this.placardText = this.editedRequirement.placardText || ''
    this.quantityPhotosRequired = this.editedRequirement.quantityPhotosRequired
      ? this.editedRequirement.quantityPhotosRequired
      : null
    this.requirement = structuredClone(this.editedRequirement)

    this.requirement.currentPictures = []
    if (this.requirement && this.requirement.pictures) {
      for (let i = this.requirement.pictures.length - 1; i >= 0; i--) {
        this.requirement.currentPictures[i] = this.requirement.pictures[i]
      }
    }
  },

  methods: {
    async updateRequirement() {
      this.loading = true

      try {
        let _files = []
        if (this.currentFiles?.length && this.requirement.files?.length) {
          _files = [...this.requirement.files, ...this.currentFiles]
        } else if (this.currentFiles?.length) {
          _files = this.currentFiles
        } else if (this.requirement.files?.length) {
          _files = this.requirement.files
        }
        const objectToSend = {
          descRequirement: this.editDesc.trim().replace('/', '-'),
          placard: this.placard,
          placardText: this.placardText,
          quantityPhotosRequired: this.quantityPhotosRequired
            ? this.quantityPhotosRequired
            : null,
          currentPictures: _files || [],
          ...(this.requirement.pictures && {
            pictures: [...this.requirement.pictures],
          }),
        }

        await this.$store.dispatch('oos/orders/update_requirements', {
          objectToSend,
          orderId: this.orderId,
          taskId: this.taskId,
          requirementId: this.editedRequirement.id,
          type: this.type,
        })

        this.close()
        this.$mainAlertSuccess(this.$t('Success! Requirement updated'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleFocusBtnActions() {
      setTimeout(() => {
        this.$refs.botonUpdate.$el.focus()
      }, 200)
    },
    close() {
      this.showEditRequirements = false
      this.$refs.inputFile.reset()

      this.requirement = {}
      this.currentFiles = []
      this.pictures = []

      this.$emit('close')
    },
    handleDeletePic(pic) {
      if (pic.name) {
        const indexOfPic = this.requirement.currentPictures
          .map((p) => p.name)
          .indexOf(pic.name)
        this.requirement.currentPictures.splice(indexOfPic, 1)
      }

      const indexOfPic = this.requirement.pictures
        .map((p) => p.codeName)
        .indexOf(pic.codeName)
      this.requirement.pictures.splice(indexOfPic, 1)
      this.currentFiles.splice(indexOfPic, 1)
      this.$nextTick(() => {
        this.$refs.botonUpdate.$el.focus()
      })
      this.handleFocusBtnActions()
    },
    handleInputFiles(files) {
      if (!files || !files.length) {
        return
      }
      if (!this.requirement.pictures) {
        this.requirement.pictures = []
      }

      files.forEach((file, i) => {
        if (!file) {
          return
        }
        const indexOfFile = this.currentFiles
          .map((f) => f.name)
          .indexOf(file.name)
        const index = this.requirement.pictures
          .map((f) => f.name)
          .indexOf(file.name)

        if (indexOfFile === -1 && index === -1) {
          this.currentFiles.splice(0, 0, file)
        } /*  else {
          this.currentFiles.splice(indexOfFile, 1, file)
        } */

        const codeName =
          new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)
        file.codeName = codeName
        const reader = new FileReader()
        reader.onload = (event) => {
          const url = event.target.result

          if (index === -1) {
            this.requirement.pictures.splice(i, 0, {
              url,
              type: file.type,
              codeName: file.codeName,
              name: file.name,
              file,
            })
          }
        }

        reader.readAsDataURL(file)
      })
      this.handleFocusBtnActions()
    },
    validateAmountPhotosRequired() {
      if (
        !isNaN(this.requirement.quantityPhotosRequired) &&
        this.requirement.quantityPhotosRequired
      ) {
        this.requirement.quantityPhotosRequired =
          this.requirement.quantityPhotosRequired < 0
            ? parseFloat(this.requirement.quantityPhotosRequired) * -1
            : parseFloat(this.requirement.quantityPhotosRequired)
      } else {
        this.requirement.quantityPhotosRequired = null
      }
    },
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
.previews {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  .file-preview {
    border: 1px solid #ddd;
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
