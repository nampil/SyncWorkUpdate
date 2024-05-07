<template>
  <v-dialog
    v-if="list && list.length"
    v-model="dialog"
    transition="scale-transition"
    :overlay="false"
    scrollable
    max-width="1000px"
  >
    <v-card class="main-body">
      <v-toolbar color="secondary" class="flex-grow-0" dense>
        <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-btn
          v-if="
            itemSelected &&
            itemSelected.url !== '' &&
            !itemSelected.type?.includes(media_types.video) &&
            !itemSelected.mediaType?.includes(media_types.video)
          "
          icon
          class="white--text"
          :loading="loading"
          @click.stop="download(itemSelected)"
          ><v-icon>mdi-download</v-icon>
        </v-btn>

        <v-btn icon class="white--text" @click.stop="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="content pt-5 d-flex">
        <div class="carousel">
          <v-carousel v-model="currentSlide" hide-delimiters>
            <v-carousel-item
              v-for="(item, i) in list"
              :key="i"
              class="carousel-item"
            >
              <div class="d-flex justify-center h-100">
                <div
                  v-if="item.url && itemSelected"
                  class="d-flex justify-center"
                >
                  <div :id="item.codeName" class="img-container">
                    <img
                      v-if="
                        item.type?.includes(media_types.image) ||
                        item.mediaType?.includes(media_types.image)
                      "
                      ref="img"
                      :src="item.url"
                      class="image"
                    />

                    <video
                      v-if="
                        item.type?.includes(media_types.video) ||
                        item.mediaType?.includes(media_types.video)
                      "
                      ref="videos"
                      width="100%"
                      height="100%"
                      controls
                    >
                      <source :src="item.url" :type="item.type" />
                    </video>
                    <div
                      v-if="item.geoLoc && downloadWithDate"
                      class="container-fecha"
                    >
                      <h3>
                        {{$formatDate( new Date(item.geoLoc.timestamp), { time: true
                      }),}}
                      </h3>
                    </div>
                    <div
                      v-if="item.placard"
                      ref="placardContainer"
                      :style="`--bgColor: ${item.placard.backgroundColor}; --top: ${item.placard.position.y}; --left: ${item.placard.position.x};  --fSize: ${item.placard.fontSize}`"
                      class="container-placard | d-flex align-center gap-2"
                      @mousemove="showEditPlacard = true"
                      @mouseleave="showEditPlacard = false"
                    >
                      <span class="placard-text">{{ item.placard.text }}</span>

                      <v-tooltip
                        v-if="showEditPlacard"
                        open-delay="600"
                        content-class="small"
                        top
                      >
                        <!-- eslint-disable-next-line -->
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color="primary"
                            icon
                            x-small
                            v-bind="attrs"
                            v-on="on"
                            @click="handleEditPlacard(item)"
                          >
                            <v-icon size="20">mdi-pencil</v-icon>
                          </v-btn>
                        </template>
                        <span>Edit Placard</span>
                      </v-tooltip>
                    </div>
                  </div>

                  <div class="container-info pl-5">
                    <v-icon small color="primary" class="mb-1"
                      >mdi-information-outline </v-icon
                    ><span class="report-title ml-1">File Info</span>

                    <div v-if="item.createdBy">
                      <span class="report-title">Upload By: </span>
                      {{ item.createdBy.fullName }}
                    </div>

                    <div v-if="item.uploadedAt">
                      <span class="report-title">Upload Timestamp: </span>
                      {{$formatDate(item.uploadedAt, { time: true }),}}
                    </div>
                    <div v-if="item.codeName">
                      <span class="report-title"> File Name: </span
                      >{{ item.codeName }}
                    </div>
                    <div v-if="item.geoLoc">
                      <span class="report-title">Date Time Original: </span>

                      {{$formatDate( new Date(item.geoLoc.timestamp), { time: true
                      }),}}
                    </div>
                    <div v-if="item.geoLoc">
                      <span class="report-title">GPS Latitude: </span
                      >{{ item.geoLoc.latitude }}
                    </div>
                    <div v-if="item.geoLoc" class="">
                      <span class="report-title">GPS Longitude: </span
                      >{{ item.geoLoc.longitude }}
                    </div>
                    <div v-if="item.placard">
                      <span class="report-title">Placard: </span>
                      {{ item.placard.text }}
                    </div>
                    <div
                      v-if="
                        item.bidsFlagged && item.bidsFlagged.length && !fromBids
                      "
                      class="bids-flagged-content"
                    >
                      <span class="report-title">Bids Flagged: </span>
                      <span v-for="(bid, b) in bidsFlaggedFormatted" :key="b">
                        {{ bid.title
                        }}{{
                          b !== bidsFlaggedFormatted.length - 1 ? ',' : '.'
                        }}
                      </span>
                    </div>
                    <div v-if="item.geoLoc" class="pt-2">
                      <v-btn
                        icon
                        x-small
                        :color="downloadWithDate ? 'primary' : ''"
                        @click="handleDownloadWithDate(item.codeName)"
                      >
                        <v-icon dense
                          >{{
                            downloadWithDate
                              ? 'mdi-checkbox-marked'
                              : 'mdi-checkbox-blank-outline'
                          }}
                        </v-icon>
                      </v-btn>
                      <span
                        >Do you want to download the photo with the date?</span
                      >
                    </div>
                  </div>
                </div>

                <div v-else class="loading-preview | h-100">
                  <v-icon size="70">mdi-image-sync-outline</v-icon>
                </div>
              </div>
            </v-carousel-item>
          </v-carousel>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="showEditPlacardModal"
      :overlay="false"
      max-width="500px"
      scrollable
      transition="dialog-transition"
    >
      <edit-placard
        v-if="showEditPlacardModal"
        :from-oos="fromOos"
        :report="newPlacardReport"
        @update-report="updateReport($event)"
        @close="showEditPlacardModal = false"
      ></edit-placard>
    </v-dialog>
  </v-dialog>
</template>

<script>
// import GoogleMap from './GoogleMap.vue'
import EditPlacard from '../oos/taskContent/placard/EditPlacard.vue'
import copyExif from '@/plugins/copyExif'
import { MEDIA_TYPES } from '@/utils/dictionaries'

export default {
  name: 'SlideShow',
  components: { EditPlacard },
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: 'Viewer' },
    list: { type: Array, default: () => [] },
    type: { type: String, default: 'images' },
    indexSelected: { type: Number, default: 0 },
    fromOos: { type: Boolean, default: false },
    fromBids: { type: Boolean, default: false },
  },
  data() {
    return {
      showEditPlacard: false,
      media_types: null,
      dialog: false,
      currentSlide: null,
      itemSelected: null,
      downloadWithDate: false,
      imgWidthDate: '',
      x: 0,
      y: 0,
      loading: false,
      newPlacardReport: null,
      showEditPlacardModal: false,
    }
  },
  computed: {
    bids() {
      return this.$store.state.bids.bids
    },
    bidsFlaggedFormatted() {
      return this.bids.filter((b) =>
        this.itemSelected?.bidsFlagged?.includes(b.id)
      )
    },
  },
  watch: {
    dialog(val) {
      if (!val) {
        this.stopAllVideos()
        this.$emit('close')
      }
    },
    show(val) {
      this.dialog = val
    },
    currentSlide(val) {
      this.itemSelected = this.list[val]
      const { placard } = this.itemSelected
      if (placard) {
        this.posX = placard.position.x
        this.posY = placard.position.y
      }
      this.downloadWithDate = false
      this.imgWidthDate = ''
      if (!this.fromBids) {
        this.getBid()
      }
    },
    indexSelected(newVal, oldVal) {
      if (newVal < oldVal) {
        this.currentSlide = this.indexSelected
      }
      this.inicial()
    },
  },

  mounted() {
    this.media_types = MEDIA_TYPES
  },
  beforeDestroy() {},

  methods: {
    updateReport(report) {
      this.$emit('update-report', report)
    },

    handleEditPlacard(report) {
      this.newPlacardReport = structuredClone(report)
      this.showEditPlacardModal = true
    },

    stopAllVideos() {
      const videos = this.$refs.videos
      if (videos?.length) {
        videos.forEach((vid) => {
          vid.pause()
        })
      }
    },
    inicial() {
      if (this.indexSelected) {
        this.currentSlide = this.indexSelected
      }
      this.itemSelected = this.list[this.indexSelected]
    },

    async getBid() {
      try {
        await this.$store.dispatch(`bids/get_bid`, {
          orderId: this.itemSelected.orderId,
          bidsFlagged: this.itemSelected.bidsFlagged,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('embarrassingError'))
      }
    },

    async setImageOnCanvasAndThenWriteText(canvas, imageUrl, textItems) {
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.setAttribute('crossorigin', 'anonymous')
      img.src = imageUrl

      function drawImages(ctx, img, canvas) {
        // return a Promise synchronously
        return new Promise((resolve, reject) => {
          img.onload = () => {
            const loadedImageWidth = img.width
            const loadedImageHeight = img.height
            canvas.width = loadedImageWidth
            canvas.height = loadedImageHeight
            ctx.drawImage(img, 0, 0)

            textItems.forEach(({ textToWrite, textStyleOptions }) => {
              const x = textStyleOptions.positionX
                ? textStyleOptions.positionX * loadedImageWidth
                : 10

              const y = textStyleOptions.positionY
                ? textStyleOptions.positionY * loadedImageHeight
                : loadedImageHeight - 5

              const font = `${textStyleOptions.fontSize}px ${textStyleOptions.fontFamily}`

              ctx.font = font

              if (textStyleOptions.bg) {
                ctx.fillStyle = textStyleOptions.bg
                const width = ctx.measureText(textToWrite).width
                ctx.fillRect(x, y, width, parseInt(font, 10))
              }
              ctx.fillStyle = textStyleOptions.textColor
              ctx.textAlign = textStyleOptions.textAlign
              ctx.textBaseline = textStyleOptions.textBaseline
              const xCordOfText = x
              const yCordOfText = y

              ctx.fillText(textToWrite, xCordOfText, yCordOfText)
            })

            resolve(img)
          }
          img.onerror = (e) => {
            reject(e)
          }
        })
      }

      await drawImages(ctx, img, canvas)
    },
    async download(image) {
      this.loading = true
      let _src = ''
      const index =
        this.indexSelected !== this.currentSlide
          ? this.currentSlide + 1
          : this.indexSelected + 1

      const hasToWriteOnImage =
        (image.geoLoc && this.downloadWithDate) || image.placard

      if (hasToWriteOnImage) {
        const textItems = []
        const theCanvas = document.createElement('canvas')
        const imageUrl = image.url

        if (image.geoLoc && this.downloadWithDate) {
          const textStyleOptions = {
            fontSize: 25,
            fontFamily: 'Arial',
            textColor: '#DCEF30',
            textAlign: 'left',
          }
          const textToWrite = this.$formatDate(
            new Date(image.geoLoc.timestamp),
            {
              time: true,
            }
          )

          textItems.push({ textStyleOptions, textToWrite })
        }

        if (image.placard) {
          const textToWrite = image.placard.text
          const textStyleOptions = {
            fontSize: image.placard.fontSize * 1.33,
            fontFamily: 'Arial',
            textColor: image.placard.color || '#ffffff',
            textAlign: 'left',
            textBaseline: 'top',
            positionX: image.placard.position.x,
            positionY: image.placard.position.y,
            bg: image.placard.backgroundColor || '#000000',
          }
          textItems.push({
            textToWrite,
            textStyleOptions,
          })
        }

        await this.setImageOnCanvasAndThenWriteText(
          theCanvas,
          imageUrl,
          textItems
        )

        _src = theCanvas.toDataURL('image/jpeg')
      }

      const src = hasToWriteOnImage ? _src : image.url
      const xhr = new XMLHttpRequest()
      xhr.responseType = 'blob'
      xhr.onload = async () => {
        const response = xhr.response
        let imageUrl = ''
        if (image.geoLoc && this.downloadWithDate) {
          const baseImageBlob = await fetch(image.url).then((r) => {
            if (r.status === 200) return r.blob()
            return Promise.reject(new Error(r.statusText))
          })

          const newImagen = await copyExif(baseImageBlob, response)
          const urlCreator = window.URL || window.webkitURL
          imageUrl = urlCreator.createObjectURL(newImagen)
        }
        if (!this.downloadWithDate) {
          const urlCreator = window.URL || window.webkitURL
          imageUrl = urlCreator.createObjectURL(response)
        }

        const link = document.createElement('a')
        link.href = imageUrl
        link.setAttribute('download', this.title + ' ' + index + '.jpg')
        link.setAttribute('target', 'new')
        document.body.appendChild(link)
        link.click()
      }
      xhr.open('GET', src)
      xhr.send()
      this.loading = false
    },

    async handleDownloadWithDate(id) {
      this.downloadWithDate = !this.downloadWithDate
      await this.$nextTick()
      if (!this.downloadWithDate) return
      const padding = 5
      const container = document.getElementById(`${id}`)
      const containerBox = container.getBoundingClientRect()
      const img = container.querySelector('img')
      const containerFecha = container.querySelector('.container-fecha')
      const containerFechaBox = containerFecha.getBoundingClientRect()
      const ratio = img.naturalWidth / img.naturalHeight
      const width = img.height * ratio
      const height = img.height
      let left, top
      top = height - containerFechaBox.height
      left = (containerBox.width - width) / 2 + padding
      if (width > img.width) {
        left = (containerBox.width - img.width) / 2 + padding
        top =
          (containerBox.height - img.width / ratio) / 2 +
          img.width / ratio -
          containerFechaBox.height
      }
      container.style.setProperty('--x', `${left}px`)
      container.style.setProperty('--y', `${top}px`)
    },
  },
}
</script>

<style lang="scss" scoped>
.content {
  padding-top: 1rem;
}

.container-placard {
  --bgColor: #000;
  --top: 0;
  --left: 0;
  --fSize: 18;
  --cTop: calc((var(--top) * 450) * 1px);
  position: absolute;

  top: calc(50% - 225px + var(--cTop));
  left: calc(100% * var(--left));

  z-index: 99;
  .placard-text {
    background-color: var(--bgColor);
    font-size: calc(var(--fSize) * 1.1 * 1px);
    color: #fff;
  }
}
.carousel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.carousel-inner {
  position: absolute;
  inset: 0;
}
.slide {
  width: 100%;
  height: 100%;
  background-image: var(--url);
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  position: absolute;
  inset: 0;
  img {
    width: 100%;
    height: 100%;
  }
}
.img-container {
  position: relative;

  max-width: 600px;
  display: flex;
  align-items: center;
  video {
    object-fit: contain;
  }
}
.report-title {
  font-size: 0.9rem;
  font-weight: bold;
}
.loading-preview {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
}
::v-deep .v-carousel__controls {
  height: auto;
}
.main-body {
  min-width: 1000px;
  height: 600px;
}
.image {
  width: 100%;
  aspect-ratio: 4/3;
}
.container-fecha {
  position: absolute;
  color: var(--v-accent-base);
  top: var(--y);
  left: var(--x);
}
.bids-flagged-content {
  max-width: 400px;
}
</style>
