<template>
  <v-dialog v-model="dialog" scrollable fullscreen persistent>
    <v-card>
      <v-toolbar dark color="secondary" class="white--text flex-grow-0">
        <v-toolbar-title>{{ $t('route') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon color="white" @click="handleClose">
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="pt-8">
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="orderlist elevation-0">
              <v-card-title primary-title> {{ $t('orders') }} </v-card-title>
              <v-card-text>
                <div
                  class="orders"
                  @dragenter="$emit('dragenter', $event)"
                  @dragover="$emit('dragover', $event)"
                  @dragleave="$emit('dragleave', $event)"
                  @drop="handleDrop"
                >
                  <div
                    v-for="(order, index) in route.orders"
                    :id="order ? order.id : ''"
                    :key="index"
                    :ref="`routeOrders_${route.id}`"
                    class="order-item mb-4"
                  >
                    <div
                      class="d-flex justify-space-between px-2 grey--text text--darken-1"
                    >
                      <div v-if="distanceTimes[index]" class="distance">
                        {{ distanceTimes[index].distance }}
                      </div>
                      <div v-if="distanceTimes[index]" class="duration">
                        {{ distanceTimes[index].duration }}
                      </div>
                    </div>
                    <div
                      class="order-content d-flex align-center"
                      draggable="true"
                      @dragstart="handleDrag($event, order, true, route.id)"
                      @dragend="handleDrag($event, order, false, route.id)"
                    >
                      <div class="mr-2">{{ index + 1 }}.</div>
                      <div class="order-mark mr-2">
                        {{ order ? order.label : '' }}
                      </div>
                      <div v-if="order" class="order-info">
                        <div class="order-address">
                          {{
                            `${order.address} ${order.city}, ${
                              order.state || ''
                            } ${order.zip}`
                          }}
                        </div>
                        <div class="order-metadata grey--text text--darken-1">
                          {{ order.workType }}
                        </div>
                      </div>

                      <v-spacer></v-spacer>
                      <v-icon
                        v-if="order"
                        small
                        :color="
                          $getCategoryColor({
                            category: order.category,
                            className: true,
                          })
                        "
                        class="mr-1"
                        >mdi-flag</v-icon
                      >

                      <!-- <v-icon
                      v-if="order"
                      small
                      class="mr-1"
                      @click="handleViewOrder(true, order)"
                      >mdi-eye-circle-outline</v-icon
                    >

                    <v-icon
                      v-if="order"
                      small
                      class="mr-1"
                      @click="handlePutBack(route, order)"
                      >mdi-arrow-up-circle-outline</v-icon
                    > -->
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="elevation-0">
              <v-card-title primary-title>
                {{ $t('additionalInstructions') }}
              </v-card-title>
              <v-card-text>
                <div class="instructions">
                  <v-form ref="instructionsForm">
                    <v-row>
                      <v-col cols="12">
                        <v-textarea
                          v-model="localInstructions"
                          rows="6"
                          :label="$t('instructions')"
                          auto-grow
                          dense
                          outlined
                          hide-details="auto"
                        ></v-textarea>
                      </v-col>
                      <v-col cols="12">
                        <v-file-input
                          v-model="localFiles"
                          accept="image/png, image/jpeg, application/pdf"
                          prepend-icon="mdi-paperclip"
                          multiple
                          dense
                          truncate-length="15"
                          hide-details="auto"
                          class="mb-4"
                          @change="handleInputFiles"
                        ></v-file-input>
                        <div class="previews">
                          <div
                            v-for="file in filesPreview"
                            :key="file.codeName"
                            class="preview"
                          >
                            <img
                              v-if="file.type.includes('image')"
                              :src="file.url"
                              alt=""
                              height="100px"
                              width="100px"
                              @click="handleShowSlideShow"
                            />

                            <div
                              v-if="file.type.includes('pdf')"
                              class="file-preview | d-flex align-center justify-center"
                              @click="handleShowPdfViewer(file.url)"
                            >
                              <v-icon large>mdi-file-pdf-box</v-icon>
                            </div>
                            <v-btn
                              icon
                              class="delete-icon"
                              @click="handleDeleteFile(file)"
                            >
                              <v-icon color="error" small>mdi-delete</v-icon>
                            </v-btn>
                          </div>
                        </div>
                      </v-col>

                      <v-col cols="12" class="d-flex">
                        <v-spacer></v-spacer>
                        <v-btn
                          color="secondary"
                          class="mr-4"
                          :disabled="!localNeedToSave"
                          @click="handleSaveInstructions"
                          >{{ $t('save') }}</v-btn
                        >
                        <v-btn
                          color="error"
                          outlined
                          :disabled="!localNeedToSave"
                          @click="handleCancelInstructions"
                          >{{ $t('cancel') }}</v-btn
                        >
                      </v-col>
                    </v-row>
                  </v-form>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="elevation-0">
              <v-card-title primary-title>
                {{ $t('contractorInThisRoute') }}
              </v-card-title>
              <v-card-text>
                <div class="contractors">
                  <div
                    v-for="contractor in contractorsInRoute"
                    :key="contractor.uid"
                  >
                    {{ contractor.fullName }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-dialog
      v-model="showPdfViewer"
      scrollable
      fullscreen
      persistent
      :overlay="false"
    >
      <pdf-viewer :url="urlForPreview" @close="handleClosePdfViewver" />
    </v-dialog>
    <slide-show
      :show="showSlideShow"
      title="Images for Instructions"
      :list="filesPreview.filter((file) => file.type.includes('image'))"
      @close="showSlideShow = false"
    />
  </v-dialog>
</template>

<script>
import SlideShow from '../misc/SlideShow.vue'
import PdfViewer from '../misc/PdfViewer.vue'
import { CATEGORY_OPTIONS } from '@/utils/dictionaries'

export default {
  name: 'RouteViewer',
  components: { PdfViewer, SlideShow },
  props: {
    route: { type: Object, default: () => ({}) },
    show: { type: Boolean, default: false },
    google: { type: [Boolean, Object], default: () => ({}) },
  },
  data() {
    return {
      showPdfViewer: false,
      showSlideShow: false,
      urlForPreview: '',
      dialog: false,
      distanceTimes: [],
      localInstructions: '',
      localFiles: [],
      filesPreview: [],
      CATEGORY_OPTIONS: null,
    }
  },
  computed: {
    localNeedToSave() {
      if (
        this.localInstructions !== this.route.instructions ||
        !this._.isEqual(this.localFiles, this.route.rowFiles) ||
        !this._.isEqual(this.filesPreview, this.route.files)
      ) {
        return true
      }

      return false
    },
    contractorsInRoute() {
      let contractorsInOrder = []
      if (this.route.orders.length) {
        let _contractors = []
        this.route.orders.forEach((order) => {
          _contractors = _contractors.concat(order.contractors)
        })

        const contractorIds = _contractors.map((c) => c.uid)
        const uniqs = this._.uniqWith(contractorIds, this._.isEqual)

        contractorsInOrder = uniqs.map((uid) => {
          const index = _contractors.map((c) => c.uid).indexOf(uid)
          return _contractors[index]
        })
      }

      return contractorsInOrder
    },
  },
  watch: {
    show(newVal) {
      this.dialog = newVal
    },
    route: {
      handler(newVal, oldVal) {
        if (!this._.isEqual(newVal.orders, oldVal.orders)) {
          // this.getDistanceTime(newVal)
        }

        if (newVal.instructions) {
          this.localInstructions = newVal.instructions
        }
        if (newVal.files) {
          this.filesPreview = [...newVal.files]
        }
      },
      deep: true,
    },
  },

  created() {
    this.CATEGORY_OPTIONS = CATEGORY_OPTIONS
  },
  methods: {
    handleClose() {
      this.showPdfViewer = false
      this.showSlideShow = false
      this.urlForPreview = ''
      this.distanceTimes = []
      this.localInstructions = ''
      this.localFiles = []
      this.filesPreview = []
      this.$refs.instructionsForm.resetValidation()
      this.$emit('close')
    },
    handleShowSlideShow() {
      this.showSlideShow = true
    },
    handleClosePdfViewver() {
      this.showPdfViewer = false
      this.urlForPreview = ''
    },
    handleShowPdfViewer(url) {
      this.urlForPreview = url
      this.showPdfViewer = true
    },
    handleDeleteFile(file) {
      const indexOfPreview = this.filesPreview
        .map((f) => f.codeName)
        .indexOf(file.codeName)

      if (indexOfPreview > -1) {
        this.filesPreview.splice(indexOfPreview, 1)
      }

      const indexOfLocalFile = this.localFiles
        .map((file) => file.codeName)
        .indexOf(file.codeName)

      if (indexOfLocalFile > -1) {
        this.localFiles.splice(indexOfLocalFile, 1)
      }
    },
    handleInputFiles(files) {
      this.filesPreview = this.filesPreview.filter((f) => {
        return this.route.files
          .map((file) => file.codeName)
          .includes(f.codeName)
      })
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

          this.filesPreview.push({
            url,
            type: file.type,
            codeName: file.codeName,
          })
        }

        reader.readAsDataURL(file)
      })
    },
    handleSaveInstructions() {
      if (!this.$refs.instructionsForm.validate()) {
        return
      }

      const objToUpdate = {
        instructions: this.localInstructions,
        rowFiles: this.localFiles,
        files: this.filesPreview,
        id: this.route.id,
      }

      this.$emit('save-instructions', objToUpdate)
    },
    handleCancelInstructions() {
      this.$refs.instructionsForm.resetValidation()

      this.$nextTick(() => {
        if (this.route.instructions) {
          this.localInstructions = this.route.instructions
        }
        if (this.route.files) {
          this.filesPreview = [...this.route.files]
        }
        if (this.route.rowFiles) {
          this.localFiles = [...this.route.rowFiles]
        }
      })
    },
    getDrafAfterElement(routeId, y) {
      const ordersDivs = this.$refs[`routeOrders_${routeId}`]

      if (!ordersDivs) {
        return null
      }
      return ordersDivs.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect()
          const offset = y - box.top - box.height / 2
          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child }
          } else {
            return closest
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element
    },
    handleDrop(e) {
      e.preventDefault()
      const route = this.route

      const afterElement = this.getDrafAfterElement(route.id, e.clientY)

      this.$emit('drop', { e, afterElement })
    },
    handleDrag(e, order, start, routeId) {
      const el = e.target
      if (start) {
        const objData = {
          orderId: order.id,
          originRouteId: routeId,
        }
        e.dataTransfer.setData('text/plain', JSON.stringify(objData))
        el.classList.add('dragging')
      } else {
        el.classList.remove('dragging')
      }
    },

    // getDistanceTime(route) {
    //   if (!route.orders.length) {
    //     return
    //   }
    //   for (let i = 0; i < route.orders.length; i++) {
    //     const order = route.orders[i]
    //     if (!order) {
    //       return
    //     }

    //     let originAddress = route.originAddress
    //     if (i > 0) {
    //       originAddress =
    //         route.orders[i - 1].address +
    //         ' ' +
    //         route.orders[i - 1].city +
    //         ' ' +
    //         route.orders[i - 1].zip
    //     }

    //     const destinationAddress =
    //       order.address + ' ' + order.city + ' ' + order.zip

    //     const service = new this.google.maps.DistanceMatrixService()
    //     service.getDistanceMatrix(
    //       {
    //         origins: [originAddress],
    //         destinations: [destinationAddress],
    //         travelMode: 'DRIVING',
    //         unitSystem: this.google.maps.UnitSystem.IMPERIAL,
    //       },
    //       (response, status) => {
    //         this.distanceTimes.splice(i, 1, {
    //           distance: response.rows[0].elements[0].distance?.text || 'N/A',
    //           duration: response.rows[0].elements[0].duration?.text || 'N/A',
    //         })
    //       }
    //     )
    //   }
    // },
  },
}
</script>

<style lang="scss" scoped>
.orders,
.instructions,
.contractors {
  padding: 2rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.75rem;
}
.order-item {
  cursor: move;
}
.order-content {
  padding: 4px;
  border: 1px solid #ddd;
}
.order-mark {
  padding: 4px;
  font-size: 0.8rem;
}
.order-address,
.order-info {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.previews {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.preview {
  margin-top: 0.5rem;
  width: 100px;
  height: 100px;
  padding: 0.5em;
  border: 1px solid #ddd;
  position: relative;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.file-preview {
  height: 100%;
}
.delete-icon {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
