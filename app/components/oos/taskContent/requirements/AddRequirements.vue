<template>
  <v-card overf class="d-flex flex-column elevation-0">
    <v-toolbar color="secondary" dense class="modal-toolbar | flex-grow-0">
      <v-btn icon :disabled="loading" @click.stop="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>
        {{ $t('addRequirements') }} for {{ requirementFrom }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          ref="botonSave"
          text
          class="white--text"
          :loading="loading"
          @click.stop="handleSave()"
          >{{ $t('save') }}</v-btn
        >
      </v-toolbar-items>
    </v-toolbar>
    <transition name="growDown">
      <div
        v-if="hasToAutocomplete"
        class="autocomplete-toolbar pa-2 d-flex align-center justify-end terciary gap-16"
      >
        <v-text-field
          ref="autocompleteStartFromInput"
          v-model="startFromAutocomplete"
          reverse
          type="number"
          min="1"
          step="1"
          label="Start at"
          hide-spin-buttons
          dense
          outlined
          hide-details
          :rules="[(v) => !!v || 'Required']"
          class="number-field"
        ></v-text-field>
        <v-text-field
          ref="autocompleteQtyInput"
          v-model="autocompleteQty"
          reverse
          type="number"
          min="1"
          step="1"
          label="Quantity for Autocomplete"
          hide-spin-buttons
          dense
          outlined
          hide-details
          :rules="[(v) => !!v || 'Required']"
          class="number-field"
        ></v-text-field>

        <v-btn color="secondary" @click="handleApplyAutompleted"
          >Apply Autocomplete</v-btn
        >
      </div>
    </transition>
    <div class="flex-grow-1 overflow-y-auto">
      <v-card-text class="text-center">
        <v-form ref="formRequirement" class="task-form | mt-5" lazy-validation>
          <v-row
            v-for="(item, r) in requirements"
            :key="r"
            class="p-relative mb-4"
          >
            <v-btn
              v-if="!item.descRequirement !== '' && requirements.length !== 1"
              icon
              small
              class="btn-delete mt-1"
              @click="delete_requirement(r)"
            >
              <v-icon color="error">mdi-delete</v-icon>
            </v-btn>
            <v-col cols="12">
              <v-checkbox
                v-model="item.markForAutocomplete"
                hide-details
                label="Mark for autocomplete"
                dense
                @change="handleMarkForAutocomplete($event, item)"
              ></v-checkbox>
              <p v-if="item.markForAutocomplete" class="ma-0 text--secondary">
                Please use <code>%$0</code> in places where you want to use de
                autocomplete number. E.g.: "Window %$0 ½" se convertira a
                "Window #1 ½"
              </p>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="item.descRequirement"
                :label="$t('description')"
                outlined
                :rules="rules"
                dense
                hide-details="auto"
                auto-grow
                maxlength="240"
                rows="1"
                @keydown.enter.exact.prevent
              >
                <!-- @keyup.enter.exact="handleFocusBtnActions()" -->
              </v-textarea>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="item.quantityPhotosRequired"
                :label="'#' + $t('photosRequired')"
                hide-details="auto"
                outlined
                dense
                :rules="rulesPhotos"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-checkbox
                v-model="item.placard"
                hide-details="auto"
                :label="$t('Do this requirement require placard?')"
                dense
              ></v-checkbox>
            </v-col>
            <v-col v-if="item.placard" cols="12">
              <v-text-field
                v-model="item.placardText"
                :label="$t('placardText')"
                hide-details="auto"
                outlined
                dense
                :counter="30"
                :rules="rulesPlacard"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-file-input
                accept="image/png, image/jpeg, application/pdf"
                :prepend-icon="'mdi-camera'"
                :label="$t('imgInput')"
                class="input-file"
                multiple
                outlined
                dense
                truncate-length="15"
                @click="$event.target.value = ''"
                @change="handleInputFiles($event, r)"
              ></v-file-input>
              <div class="previews-requirements">
                <div
                  v-for="(pic, j) in item.pictures"
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
                    @click="handleShowImagesSlides(item.pictures, pic)"
                  />
                  <div
                    v-if="pic.type.includes('pdf')"
                    class="file-preview-requirement d-flex align-center justify-center"
                    @click="handleViewPdf(pic.url)"
                  >
                    <v-icon large>mdi-file-pdf-box</v-icon>
                  </div>
                  <v-btn
                    icon
                    small
                    class="delete-icon-requirement"
                    @click="handleDeletePic(pic, r)"
                  >
                    <v-icon color="error" small>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <v-divider></v-divider>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center py-4">
        <v-btn icon @click="addRequirement()"
          ><v-icon>mdi-plus-circle-outline</v-icon></v-btn
        >
      </v-card-actions>
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
  </v-card>
</template>

<script>
import SlideShow from '~/components/misc/SlideShow.vue'
import PdfViewer from '~/components/misc/PdfViewer.vue'
export default {
  name: 'AddRequirements',
  components: { SlideShow, PdfViewer },
  props: {
    orderId: { type: String, default: '' },
    taskId: { type: String, default: '' },
    type: { type: String, default: '' },
    requirementFrom: { type: String, default: '' },
    inspectionArea: { type: String, default: '' },
    lastPositionsReq: { type: Number, required: true },
    requirementsInSeccion: { type: Array, default: () => [] },
  },
  data() {
    return {
      autocompleteQty: null,
      startFromAutocomplete: 1,
      rules: [(v) => !!v || this.$t('thisFieldRequired')],
      rulesPhotos: [(v) => !isNaN(v) || this.$t('onlyNumbersRequired')],
      rulesPlacard: [
        (v) =>
          (!!v && v.length <= 30) ||
          this.$t(
            'This field is required and must have less than 30 characters'
          ),
      ],
      newRequirement: {
        descRequirement: '',
        contractorCompleted: false,
        oosChecked: false,
        markForAutocomplete: false,
        // needProcessTimes: false,
        quantityPhotosRequired: null,
        files: [],
        pictures: [],
        fromBefore: false,
        fromDuring: false,
        fromAfter: false,
        fromGeneral: false,
        fromInspection: false,
        placard: true,
        placardText: '',
      },
      loading: false,
      requirements: [],
      listPictures: [],
      indexOfImage: 0,
      showImagesSlides: false,
      previewUrl: '',
      showPdfViewer: false,
    }
  },
  computed: {
    hasToAutocomplete() {
      return this.requirements.some((req) => req.markForAutocomplete)
    },
    localLastPositionReq() {
      return this.requirements.length
    },
    validateSave() {
      if (
        this.requirements &&
        this.requirements.length &&
        this.requirements.filter((r) => r.descRequirement === '').length
      ) {
        return true
      } else {
        return false
      }
    },
    validatePersistent() {
      if (
        this.requirements &&
        this.requirements.length &&
        this.requirements.filter(
          (r) =>
            (r.descRequirement !== '' && r.descRequirement !== null) ||
            (r.quantityPhotosRequired !== '' &&
              r.quantityPhotosRequired !== null) ||
            r.files.length !== 0 ||
            !r.placard ||
            (r.placardText !== '' && r.placardText !== null)
        ).length
      ) {
        return true
      } else {
        return false
      }
    },
  },

  watch: {
    validatePersistent(val) {
      this.$emit('update-persistent', val)
    },
  },

  mounted() {
    this.addRequirement()
  },

  methods: {
    handleMarkForAutocomplete(val, item) {
      if (!val && item.descRequirement) {
        item.descRequirement = item.descRequirement.replace('%$0', '').trim()
      }
      if (!val && item.placard) {
        item.placardText = item.placardText.replace('%$0', '').trim()
      }

      if (val) {
        item.descRequirement = (item.descRequirement + ' %$0').trim()
        if (item.placard) {
          item.placardText = (item.placardText + ' %$0').trim()
        }
      }
    },
    handleApplyAutompleted() {
      const autocompleteQtyInput = this.$refs.autocompleteQtyInput
      if (!autocompleteQtyInput || !autocompleteQtyInput.validate()) return

      const qty = parseInt(this.autocompleteQty)
      const startFromAutocomplete = parseInt(this.startFromAutocomplete)
      if (!qty) return

      const newRequirements = []

      let position = this.lastPositionsReq + 1
      for (let n = 1; n <= qty; n++) {
        const nReqs = []
        for (let idx = 0; idx < this.requirements.length; idx++) {
          const req = this.requirements[idx]

          if (!req.markForAutocomplete) {
            if (n === 1) {
              newRequirements.push({
                ...req,
                id: req.id + '-' + idx + '-' + n,
                position,
              })
            }
            position++
            continue
          }

          const descRequirement = req.descRequirement.replace(
            '%$0',
            `#${startFromAutocomplete + (n - 1)}`
          )

          nReqs.push({
            ...req,
            id: req.id + '-' + idx + '-' + n,
            markForAutocomplete: false,
            position,
            descRequirement,
            ...(req.placard &&
              req.placardText && {
                placardText: req.placardText.replace(
                  '%$0',
                  `#${startFromAutocomplete + (n - 1)}`
                ),
              }),
          })
          position++
        }

        newRequirements.push(...nReqs)
      }
      this.requirements = newRequirements
    },
    handleFocusBtnActions() {
      this.$refs.botonSave.$el.focus()
    },

    addRequirement() {
      const type = this.requirementFrom

      const _requirement = { ...this.newRequirement }
      _requirement[`from${type}`] = true
      _requirement.inspectionArea =
        type === 'Inspection' ? this.inspectionArea : ''
      _requirement.files = []
      _requirement.pictures = []
      _requirement.position =
        this.lastPositionsReq + this.localLastPositionReq + 1
      this.requirements.push(_requirement)
    },

    close() {
      this.$refs.formRequirement.reset()
      this.$emit('close')
    },
    async handleSave() {
      if (!this.$refs.formRequirement.validate()) {
        return
      }

      const usersToNotify = []

      for (let idx = 0; idx < this.requirementsInSeccion.length; idx++) {
        const _req = this.requirementsInSeccion[idx]
        const startedBy = _req.startedBy
        if (!startedBy) {
          continue
        }

        if (typeof startedBy === 'string') {
          usersToNotify.push(startedBy)
        } else if (startedBy.uid) {
          usersToNotify.push(startedBy.uid)
        } else {
          continue
        }
      }

      this.loading = true
      try {
        await this.$store.dispatch('oos/orders/add_requirements', {
          orderId: this.orderId,
          type: this.type,
          taskId: this.taskId,
          requirements: this.requirements,
          usersToNotify,
        })
        this.loading = false
        this.close()
        this.$mainAlertSuccess(this.$t('Success! Requirements added(s)'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
      }
    },
    handleInputFiles(files, index) {
      const requirement = Object.assign({}, this.requirements[index])
      if (!requirement.files) {
        requirement.files = []
      }
      if (!requirement.pictures) {
        requirement.pictures = []
      }
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

          requirement.pictures.push({
            url,
            type: file.type,
            codeName: file.codeName,
          })
          requirement.files.push(file)
          this.requirements.splice(index, 1, requirement)
        }
        reader.readAsDataURL(file)
      })
      this.handleFocusBtnActions()
    },
    handleDeletePic(pic, r) {
      const indexOfPic = this.requirements[r].pictures
        .map((p) => p.codeName)
        .indexOf(pic.codeName)

      this.requirements[r].pictures.splice(indexOfPic, 1)
      if (this.requirements[r].files) {
        const indexOfPicFiles = this.requirements[r].files
          .map((p) => p.codeName)
          .indexOf(pic.codeName)

        this.requirements[r].files.splice(indexOfPicFiles, 1)
      }
      this.handleFocusBtnActions()
    },
    delete_requirement(r) {
      this.requirements.splice(r, 1)
      this.handleFocusBtnActions()
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
.btn-delete {
  position: absolute;
  top: 0;
  right: 0.5rem;
}
.modal-toolbar {
  position: relative;
  z-index: 2;
}
.autocomplete-toolbar {
  position: relative;
  z-index: 1;
}

.growDown-enter-active,
.growDown-leave-active {
  transition: transform 300ms ease-in-out, opacity 300ms ease-in-out;
}
.growDown-enter,
.growDown-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
.previews-requirements {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  .preview-requirement {
    width: 100px;
    height: 100px;

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
.p-relative {
  position: relative;
}
</style>
