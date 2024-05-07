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
        {{ $t('download') }}
        {{ !fromOos ? localReports.length : reports.length }}
        {{ $t('photos will take time.') }}
      </p>
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
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import copyExif from '~/plugins/copyExif'
import { JOB_TYPES } from '@/utils/dictionaries'

export default {
  name: 'ReportsDownload',
  props: {
    localReports: { type: Array, default: () => [] },
    reports: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    typeReport: { type: String, default: '' },
    title: { type: String, default: '' },
    fromOos: { type: Boolean, default: false },
    typeTask: { type: String, default: '' },
    area: { type: String, default: '' },
    requirements: { type: Array, default: () => [] },
    fromBids: { type: Boolean, default: false },
  },
  data() {
    return {
      downloadWithDate: true,
      userDate: '',
      userDateMenu: false,
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
    const reports = this.fromOos ? this.reports : this.localReports

    let date = this.$formatDate(new Date(), { iso: true })

    if (reports?.length > 0) {
      if (reports[0].geoLoc?.timestamp) {
        date = this.$formatDate(new Date(reports[0].geoLoc.timestamp), {
          iso: true,
        })
      } else if (reports[0].createdAt) {
        let _date = null
        if (typeof reports[0].createdAt?.toDate === 'function') {
          _date = reports[0].createdAt.toDate()
        } else if (
          typeof reports[0].createdAt === 'object' &&
          reports[0].createdAt.seconds
        ) {
          _date = new Date(reports[0].createdAt.seconds * 1000)
        }

        date = this.$formatDate(_date, { iso: true })
      }
    }
    this.userDate = date
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
      const reports = this.fromOos ? this.reports : this.localReports

      let _type = this.type

      if (this.typeTask === JOB_TYPES.inspections) {
        _type =
          this.typeReport !== 'Requeriment'
            ? `${this.title} ${this.area}`
            : `${this.title} ${this.area} Requeriment`
      }
      const htmlCanvas = document.createElement('canvas')
      const offscreen = htmlCanvas.transferControlToOffscreen()

      _type = _type.replace(/[^a-zA-Z0-9 ]/g, '_')

      this.worker.postMessage(
        {
          reports,
          downloadWithDate: this.downloadWithDate,
          userDate: this.userDateFormatted,
          type: _type,
          typeReport: this.typeReport,
          title: this.title,
          canvas: offscreen,
          downloadAllReports: false,
          downloadAllOrderReports: false,
          requirements: this.requirements,
          fromBids: this.fromBids,
        },
        [offscreen]
      )

      this.worker.onmessage = (e) => {
        const { blobZip, type, amountReportsFailed } = e.data
        saveAs(blobZip, type)

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
      const _reports = this.fromOos ? this.reports : this.localReports
      if (!_reports) return

      this.$store.commit('oos/routes/set_showLoadingDownload', true)
      this.close()
      let reportsCounter = 1
      const position = {}
      let count = 1
      const _type = this.type.replace('/', ' ')
      const zip = new JSZip()
      const folder = zip.folder(_type) // folder name where all files will be placed in
      const processTimeList = ['Before', 'During', 'After', 'General Reports']

      for (let index = 0; index < _reports.length; index++) {
        const report = _reports[index]

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

        if (report.task.type !== JOB_TYPES.inspections) {
          if (
            !report.fromRequirement &&
            processTimeList.includes(this.typeReport)
          ) {
            const name = count + '.jpg'
            count++
            folder.file('/General Reports/' + name, newBlob)
          }

          if (report.fromRequirement) {
            const from = this.requirements
              .map((e) => e.id)
              .indexOf(report.requirementId)

            if (this.requirements[from]) {
              const desc = this.requirements[from].descRequirement.slice(0, 40)
              const id = report.requirementId
              position[`${id}`] = position[`${id}`] ? position[`${id}`] + 1 : 1
              const name = position[`${id}`] + '.jpg'
              if (this.requirements[from].fromBefore) {
                folder.file(`/Requeriments/${desc}/` + name, newBlob)
              } else if (this.requirements[from].fromDuring) {
                folder.file(`/Requeriments/${desc}/` + name, newBlob)
              } else if (this.requirements[from].fromAfter) {
                folder.file(`/Requeriments/${desc}/` + name, newBlob)
              } else if (this.requirements[from].fromGeneral) {
                folder.file(`/Requeriments General/${desc}/` + name, newBlob)
              }
            }
          } else if (!processTimeList.includes(this.typeReport)) {
            const name = reportsCounter + '.jpg'
            reportsCounter++
            folder.file('/Reports/' + name, newBlob)
          }
        } else if (report.task.type === JOB_TYPES.inspections) {
          if (report.fromRequirement) {
            const from = this.requirements
              .map((e) => e.id)
              .indexOf(report.requirementId)
            if (this.requirements[from]) {
              const desc = this.requirements[from].descRequirement.slice(0, 40)
              const id = report.requirementId
              position[`${id}`] = position[`${id}`] ? position[`${id}`] + 1 : 1
              const name = position[`${id}`] + '.jpg'
              folder.file(`/Requeriments/${desc}/` + name, newBlob)
            }
          } else {
            position[`${report.area}`] = position[`${report.area}`]
              ? position[`${report.area}`] + 1
              : 1
            const name = position[`${report.area}`] + '.jpg'
            folder.file(`/${report.area}/` + name, newBlob)
          }
        }
      }

      zip.generateAsync({ type: 'blob' }).then(function (content) {
        saveAs(content, _type)
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
