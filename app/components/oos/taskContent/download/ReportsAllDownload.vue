<template>
  <v-card class="elevation-0">
    <v-toolbar color="primary" dense>
      <v-toolbar-title class="d-flex aling-center">
        <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
        <span class="ma-0 text-h5 white--text">{{
          $t('alertTitle')
        }}</span></v-toolbar-title
      >
    </v-toolbar>

    <v-card-text class="pt-7 pb-5">
      <p class="text-body-1">
        <!-- {{ $t('Downloading photos will take time.') }} {{ reports.length }} -->

        {{ $t('download') }}
        {{ reports.length }}
        {{ $t('photos will take time.') }}
      </p>
      <div class="container-download-with-date | pb-1">
        <v-btn
          class="mb-1"
          icon
          small
          :color="downloadWithDate ? 'primary' : ''"
          @click="downloadWithDate = !downloadWithDate"
        >
          <v-icon
            >{{
              downloadWithDate
                ? 'mdi-checkbox-marked'
                : 'mdi-checkbox-blank-outline'
            }}
          </v-icon>
        </v-btn>

        <span class="text-body-1">
          {{ $t('Do you want to download them with the date?') }}
        </span>
        <v-menu
          v-if="downloadWithDate"
          ref="userDateMenu"
          v-model="userDateMenu"
          :close-on-content-click="false"
          :return-value.sync="userDate"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="userDate"
              label="Select date to print"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="userDate" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="userDateMenu = false">
              Cancel
            </v-btn>
            <v-btn
              text
              color="primary"
              @click="$refs.userDateMenu.save(userDate)"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
      </div>

      <div v-if="!bids.length" class="container-download-with-folders">
        <v-btn
          class="mb-1"
          icon
          small
          :color="downloadWithFolders ? 'primary' : ''"
          @click="downloadWithFolders = !downloadWithFolders"
        >
          <v-icon
            >{{
              downloadWithFolders
                ? 'mdi-checkbox-marked'
                : 'mdi-checkbox-blank-outline'
            }}
          </v-icon>
        </v-btn>
        <span class="text-body-1"
          >Do you want files to be downloaded organized by folders?</span
        >
      </div>
    </v-card-text>

    <v-card-actions class="d-flex justify-end pa-4">
      <v-btn class="mr-4" color="error" dense outlined @click="close()">{{
        $t('cancel')
      }}</v-btn>
      <v-btn class="mr-4" dense color="secondary" @click="download()">{{
        $t('download')
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import copyExif from '~/plugins/copyExif'
import { JOB_TYPES } from '@/utils/dictionaries'

export default {
  name: 'ReportsAllDownload',
  props: {
    reports: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    wo: { type: String, default: '' },
    task: { type: Object, default: () => ({}) },
    bids: { type: Array, default: () => [] },
  },
  data() {
    return {
      downloadWithDate: true,
      userDate: '',
      userDateMenu: false,
      downloadWithFolders: false,
      worker: null,
      JOB_TYPES: null,
    }
  },
  computed: {
    userDateFormatted() {
      const [year, month, day] = this.userDate.split('-')

      return `${month}/${day}/${year}`
    },
  },

  created() {
    this.JOB_TYPES = JOB_TYPES
  },
  mounted() {
    if (this.reports?.length > 0) {
      let date = this.$formatDate(new Date(), { iso: true })
      if (this.reports[0].geoLoc?.timestamp) {
        date = this.$formatDate(new Date(this.reports[0].geoLoc.timestamp), {
          iso: true,
        })
      } else if (this.reports[0].createdAt) {
        let _date = null
        if (typeof this.reports[0].createdAt?.toDate === 'function') {
          _date = this.reports[0].createdAt.toDate()
        } else if (
          typeof this.reports[0].createdAt === 'object' &&
          this.reports[0].createdAt.seconds
        ) {
          _date = new Date(this.reports[0].createdAt.seconds * 1000)
        }

        date = this.$formatDate(_date, { iso: true })
      }

      this.userDate = date
    }
  },

  methods: {
    async setImageOnCanvasAndThenWriteText(
      canvas,
      imageUrl,
      textToWrite,
      textStyleOptions
    ) {
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.setAttribute('crossorigin', 'anonymous')
      img.src = imageUrl
      const obj = {
        drawImages(ctx, img, canvas) {
          // return a Promise synchronously
          return new Promise((resolve, reject) => {
            img.onload = () => {
              const loadedImageWidth = img.width
              const loadedImageHeight = img.height
              canvas.width = loadedImageWidth
              canvas.height = loadedImageHeight
              ctx.drawImage(img, 0, 0)
              ctx.font = `${textStyleOptions.fontSize}px ${textStyleOptions.fontFamily}`
              ctx.fillStyle = textStyleOptions.textColor
              ctx.textAlign = textStyleOptions.textAlign
              ctx.textBaseline = 'bottom'
              const xCordOfText = 10
              const yCordOfText = loadedImageHeight - 5
              ctx.fillText(textToWrite, xCordOfText, yCordOfText)
              resolve(img)
            }
            img.onerror = (e) => {
              reject(e)
            }
          })
        },
      }
      await obj.drawImages(ctx, img, canvas)
    },
    async getUrlImage(report) {
      const theCanvas = document.createElement('canvas')
      const imageUrl = report.url
      const textStyleOptions = {
        fontSize: 25,
        fontFamily: 'Arial',
        textColor: '#DCEF30',
        textAlign: 'left',
      }
      const textToWrite = this.$formatDate(new Date(report.geoLoc.timestamp), {
        time: true,
      })

      await this.setImageOnCanvasAndThenWriteText(
        theCanvas,
        imageUrl,
        textToWrite,
        textStyleOptions
      )
      const _src = theCanvas.toDataURL('image/jpeg')
      return _src
    },
    download() {
      if (!window.Worker) {
        this.downloadWithoutWorker()
        return
      }
      this.downloadWithWorker()
    },
    downloadWithWorker() {
      this.$store.commit('oos/routes/set_showLoadingDownload', true)
      this.close()
      this.worker = this.$worker.createWorkerImg()
      const htmlCanvas = document.createElement('canvas')
      const offscreen = htmlCanvas.transferControlToOffscreen()

      this.worker.postMessage(
        {
          reports: this.reports,
          downloadWithDate: this.downloadWithDate,
          userDate: this.userDateFormatted,
          type: `${this.task.title} ${this.task.type}`,
          task: this.task,
          wo: this.wo,
          canvas: offscreen,
          downloadAllReports: true,
          downloadWithFolders: this.downloadWithFolders,
          bids: this.bids,
        },
        [offscreen]
      )

      this.worker.onmessage = (e) => {
        const { blobZip, folderName, amountReportsFailed } = e.data
        saveAs(blobZip, folderName)

        this.$store.commit('oos/routes/set_showLoadingDownload', false)
        if (amountReportsFailed > 0) {
          this.$mainAlertError(
            `${amountReportsFailed} reports with problems when trying to download them.`,
            {
              timeout: -1,
              bottom: true,
            }
          )
        }
      }
    },
    async downloadWithoutWorker() {
      if (!this.reports) return
      this.$store.commit('oos/routes/set_showLoadingDownload', true)
      this.close()
      const zip = new JSZip()
      const folderName =
        'WO#' + this.wo + ' ' + this.task.type + ' ' + this.task.title
      const folder = zip.folder(folderName)
      let before = 1
      let during = 1
      let after = 1
      let reportsCounter = 1
      const conts = []
      let name = ''
      const position = {}
      const type = `${this.task.title} ${this.task.type}`

      for (let index = 0; index < this.reports.length; index++) {
        const report = this.reports[index]
        const url =
          report.geoLoc && this.downloadWithDate
            ? await this.getUrlImage(report)
            : report.url
        const blobPromise = await fetch(url).then((r) => {
          if (r.status === 200) return r.blob()
          return Promise.reject(new Error(r.statusText))
        })
        let baseImageBlob = ''
        if (report.geoLoc && this.downloadWithDate) {
          baseImageBlob = await fetch(report.url).then((r) => {
            if (r.status === 200) return r.blob()
            return Promise.reject(new Error(r.statusText))
          })
        }
        const newBlob =
          report.geoLoc && this.downloadWithDate
            ? await copyExif(baseImageBlob, blobPromise)
            : blobPromise

        if (this.task.type === JOB_TYPES.inspections) {
          if (report.fromRequirement) {
            const from = this.task.requirements
              .map((e) => e.id)
              .indexOf(report.requirementId)
            const desc = `${this.task.requirements[from].descRequirement}`
            const indice = conts.map((e) => e.area).indexOf(report.area + desc)

            if (indice !== -1) {
              conts[indice].cont++
              name = conts[indice].cont + '.jpg'
            } else {
              conts.push({
                area: report.area + desc,
                cont: 1,
              })
              name = conts[conts.length - 1].cont + '.jpg'
            }
            folder.file(
              '/' + report.area + `/Requirements/${desc}/` + name,
              newBlob
            )
          } else {
            const indice = conts.map((e) => e.area).indexOf(report.area)
            if (indice !== -1) {
              conts[indice].cont++
              name = conts[indice].cont + '.jpg'
            } else {
              conts.push({
                area: report.area,
                cont: 1,
              })
              name = conts[conts.length - 1].cont + '.jpg'
            }
            folder.file('/' + report.area + '/' + name, newBlob)
          }
        }
        if (this.task.type !== JOB_TYPES.inspections) {
          if (report.before) {
            const name = before + '.jpg'
            before++
            folder.file('/Before/General Reports/' + name, newBlob)
          }
          if (report.during) {
            const name = during + '.jpg'
            during++
            folder.file('/During/General Reports/' + name, newBlob)
          }
          if (report.after) {
            const name = after + '.jpg'
            after++
            folder.file('/After/General Reports/' + name, newBlob)
          }
          if (!report.before && !report.during && !report.after) {
            if (report.fromRequirement) {
              const from = this.task.requirements
                .map((e) => e.id)
                .indexOf(report.requirementId)
              if (this.task.requirements[from]) {
                const desc = this.task.requirements[from].descRequirement.slice(
                  0,
                  40
                )
                const id = report.requirementId
                position[`${id}`] = position[`${id}`]
                  ? position[`${id}`] + 1
                  : 1
                const name = position[`${id}`] + '.jpg'
                if (this.task.requirements[from].fromBefore) {
                  folder.file(`/Before/Requeriments/${desc}/` + name, newBlob)
                } else if (this.task.requirements[from].fromDuring) {
                  folder.file(`/During/Requeriments/${desc}/` + name, newBlob)
                } else if (this.task.requirements[from].fromAfter) {
                  folder.file(`/After/Requeriments/${desc}/` + name, newBlob)
                } else if (this.task.requirements[from].fromGeneral) {
                  folder.file(`/Requeriments General/${desc}/` + name, newBlob)
                }
              }
            } else {
              const name = type + ' reports ' + reportsCounter + '.jpg'
              reportsCounter++
              folder.file('/Reports/' + name, newBlob)
            }
          }
        }
      }
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        saveAs(content, folderName)
      })
      this.$store.commit('oos/routes/set_showLoadingDownload', false)
    },
    close() {
      this.showReportsDownload = false
      this.$emit('close')
    },
  },
}
</script>

<style></style>
