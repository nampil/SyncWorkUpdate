<template>
  <v-card overflow class="elevation-0">
    <v-toolbar color="secondary" dense class="modal-toolbar | flex-grow-0">
      <v-btn icon :disabled="loading" @click.stop="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>
        {{ $t('addRequirements') }} for {{ type }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          ref="botonSave"
          text
          class="white--text"
          :loading="loading"
          @click.stop="handleSave()"
        >
          {{ $t('save') }}
        </v-btn>
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
      <v-card-text class="card-text">
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
              </v-textarea>
            </v-col>

            <v-col cols=" 12">
              <v-text-field
                ref="photosRequirements"
                v-model="item.quantityPhotosRequired"
                :label="'#' + $t('photosRequired')"
                hide-details="auto"
                outlined
                dense
                :rules="rulesPhotos"
              ></v-text-field>
            </v-col>

            <v-col v-if="taskType === 'winterization'" cols="12">
              <v-checkbox
                v-model="item.requiredForEachToilet"
                hide-details
                label="Is required for each toilet?"
                dense
              ></v-checkbox>
            </v-col>

            <v-col cols="12">
              <v-checkbox
                v-model="item.placard"
                hide-details
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
              <div class="previews-requirements mb-2">
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
        <v-btn icon :disabled="validateSave" @click="addRequirement()"
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
  components: { PdfViewer, SlideShow },
  props: {
    needProcess: { type: Boolean, default: false },
    lastPositionsReq: { type: Object, required: true },
    type: { type: String, default: '' },
    taskType: { type: String, default: '' },
  },
  data() {
    return {
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
        markForAutocomplete: false,
        descRequirement: '',
        contractorCompleted: false,
        oosChecked: false,
        placard: true,
        placardText: '',
        quantityPhotosRequired: null,
        files: [],
        pictures: [],
        fromBefore: false,
        fromDuring: false,
        fromAfter: false,
        fromGeneral: false,
        fromInspection: false,
        id: null,
        requiredForEachToilet: false,
      },
      loading: false,
      requirements: [],
      items: ['General', 'Before', 'During', 'After'],
      itemsGeneral: ['General'],
      localPosition: 0,
      previewUrl: '',
      showPdfViewer: false,
      listPictures: [],
      indexOfImage: 0,
      showImagesSlides: false,
      autocompleteQty: null,
      startFromAutocomplete: 1,
    }
  },
  computed: {
    hasToAutocomplete() {
      return this.requirements.some((req) => req.markForAutocomplete)
    },
    localLastPositionReq() {
      const _lastPositionReq = {}
      for (const type in this.items) {
        _lastPositionReq[type] = this.requirements.filter(
          (req) => req.type === type
        ).length
      }
      return _lastPositionReq
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
  },
  watch: {
    validatePersistent(val) {
      this.$emit('update-persistent', val)
    },
    position(value) {
      this.localPosition = value
    },
  },
  mounted() {
    this.localPosition = this.position
    this.addRequirement()
  },
  methods: {
    handleApplyAutompleted() {
      const autocompleteQtyInput = this.$refs.autocompleteQtyInput
      if (!autocompleteQtyInput || !autocompleteQtyInput.validate()) return

      const qty = parseInt(this.autocompleteQty)
      const startFromAutocomplete = parseInt(this.startFromAutocomplete)
      if (!qty) return

      const newRequirements = []

      let position = parseInt(this.lastPositionsReq[this.type]) + 1

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
    handleFocusBtnActions() {
      this.$refs.botonSave.$el.focus()
    },
    addRequirement() {
      const _requirement = structuredClone(this.newRequirement)
      _requirement.type = this.type
      _requirement[`from${this.type}`] = true
      _requirement.files = []
      _requirement.pictures = []
      _requirement.id =
        'localReq' +
        new Date().getTime() +
        Math.floor(1000 + Math.random() * 9000)

      _requirement.position =
        (this.localLastPositionReq[this.type] ||
          this.lastPositionsReq[this.type]) + 1

      this.requirements.push(_requirement)
      this.setPositions()
    },
    setPositions() {
      this.items.forEach((type) => {
        const _requirementsFromType = this.requirements.filter(
          (r) => r.type === type
        )
        _requirementsFromType.forEach((req, i) => {
          req.position = this.lastPositionsReq[type] + i + 1
        })
      })
    },
    close() {
      this.$refs.formRequirement.reset()
      this.$emit('close-requirements')
    },
    handleSave() {
      if (!this.$refs.formRequirement.validate()) {
        return
      }

      const _newReqirements = this.requirements.map((r) => ({
        ...r,
        descRequirement: r.descRequirement.trim().replace('/', '-'),
      }))

      this.requirements = []
      this.addRequirement()
      this.$refs.formRequirement.resetValidation()
      this.$emit('new-requirements', _newReqirements)
      this.$emit('close-requirements')
    },
    handleInputFiles(files, index) {
      if (!files) {
        return
      }
      const requirement = Object.assign({}, this.requirements[index])
      if (!requirement.files) {
        requirement.files = []
      }
      if (!requirement.pictures) {
        requirement.pictures = []
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

          // eslint-disable-next-line
          console.log('file', file)

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
      this.setPositions()
      this.handleFocusBtnActions()
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
.p-relative {
  position: relative;
}
.btn-delete {
  position: absolute;
  top: 0;
  right: 0.5rem;
}
.number-field {
  max-width: 235px;
  text-align: center;
}
.card-text {
  // height: 100%;
  // max-height: 900px;
  overflow-y: auto;
}
.previews-requirements {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  .preview-requirement {
    margin-top: 0.5rem;
    width: 100px;
    height: 100px;
    position: relative;
    cursor: pointer;

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
</style>
