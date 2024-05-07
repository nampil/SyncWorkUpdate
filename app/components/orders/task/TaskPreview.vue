<template>
  <div>
    <div>
      <header class="task-toolbar | terciary d-flex pa-2 align-center rounded">
        <div class="d-flex flex-column pl-2">
          <h2 class="task-title flex-shrink-1">{{ jobTaskFormated.title }}</h2>

          <span
            v-if="
              jobTaskFormated &&
              priceFormated >= 0 &&
              (jobTaskFormated.type === JOB_TYPES.workToDos ||
                jobTaskFormated.type === JOB_TYPES.allowables ||
                jobTaskFormated.type === JOB_TYPES.allowablesPools)
            "
            class="price-task | info--text"
            >{{ $t('price') }}: ${{ priceFormated }}</span
          >
        </div>

        <v-spacer></v-spacer>
        <v-tooltip
          v-if="
            jobTaskFormated.type === JOB_TYPES.workToDos ||
            jobTaskFormated.type === JOB_TYPES.allowables ||
            jobTaskFormated.type === JOB_TYPES.inspections
          "
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <div class="mr-2" v-bind="attrs" v-on="on">
              <v-icon small>mdi-image-multiple-outline</v-icon>
              <span class="reports-count"> {{ reportsCount }}</span>
            </div>
          </template>
          <span>{{ $t('quantityPictures') }}</span>
        </v-tooltip>

        <v-tooltip
          v-if="jobTaskFormated.type !== JOB_TYPES.instructions"
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              small
              icon
              :disabled="reportsCount === 0"
              :loading="loadingReportsByDownload"
              v-bind="attrs"
              v-on="on"
              @click="handleDownloadAllReports()"
            >
              <v-icon small color="primary"> mdi-tray-arrow-down</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Download All Reports') }}</span>
        </v-tooltip>

        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              small
              icon
              v-bind="attrs"
              v-on="on"
              @click="handleTaskViewModal(true)"
            >
              <v-icon small>mdi-eye</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('showTaskInfo') }}</span>
        </v-tooltip>
        <v-tooltip
          v-if="jobTaskFormated.type !== JOB_TYPES.inspections"
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn small icon color="primary" v-bind="attrs" v-on="on">
              <v-icon small :disabled="disabled" @click="$emit('edit')"
                >mdi-pencil</v-icon
              >
            </v-btn>
          </template>
          <span>{{ $t('editTask') }}</span>
        </v-tooltip>
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn small icon v-bind="attrs" v-on="on">
              <v-icon
                small
                color="red"
                :disabled="disabled || reportsCount > 0"
                @click="showDeleteTask = !showDeleteTask"
                >mdi-delete</v-icon
              >
            </v-btn>
          </template>
          <span>{{
            reportsCount > 0
              ? $t('You cannot delete the task if they have photos of work')
              : $t('deleteTask')
          }}</span>
        </v-tooltip>
      </header>
      <!-- <v-card-text class="task">
        <p
          v-for="(desc, index) in jobTaskFormated.desc.split('\n')"
          :key="index"
        >
          {{ desc }}
        </p>

        <div class="previews">
          <div
            v-for="(pic, index) in jobTaskFormated.pictures"
            :key="index"
            class="preview mb-2"
          >
            <img
              v-if="pic.type.includes('image')"
              :src="pic.url"
              alt=""
              height="68px"
              width="68px"
              @mousemove="zoomHover($event, pic)"
              @mouseleave="zoomLeave($event)"
              @click="handlerShowImagesSlides(pic.codeName)"
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
      </v-card-text> -->
      <!-- <v-divider
        v-if="
          jobTaskFormated.type === JOB_TYPES.workToDos ||
          jobTaskFormated.type === JOB_TYPES.allowables
        "
      ></v-divider>
      <div
        v-if="
          jobTaskFormated &&
          priceFormated >= 0 &&
          (jobTaskFormated.type === JOB_TYPES.workToDos ||
            jobTaskFormated.type === JOB_TYPES.allowables ||
            jobTaskFormated.type === JOB_TYPES.allowablesPools)
        "
        class="info--text"
      >
        <span class="task-footer">Price: ${{ priceFormated }}</span>
      </div> -->
      <div v-if="jobTaskFormated.maxValue" class="info--text">
        <span class="task-footer"
          >Max Value: ${{ jobTaskFormated.maxValue }}</span
        >
      </div>
      <slide-show
        v-if="jobTaskFormated.pictures && jobTaskFormated.pictures.length"
        :list="listImg"
        :show="showImagesSlides"
        :title="$t('ImagesView') + ' ' + $t(type.title)"
        type="images"
        :index-selected="indexOfImage"
        @close="showImagesSlides = false"
      />
      <v-dialog v-model="showPdfViewer" fullscreen>
        <pdf-viewer
          :url="previewUrl"
          @close="handleClosePdfViewer"
        ></pdf-viewer>
      </v-dialog>
      <task-view
        :type="type"
        :job-task="jobTaskFormated"
        :open="showTaskView"
        :order-id="orderId"
        :reports-count-task="reportsCount"
        :reports-count="reportsCountObj"
        :work-order-number="workOrderNumber"
        @close="showTaskView = false"
      />
      <v-dialog
        v-model="showDeleteTask"
        :overlay="false"
        max-width="500px"
        transition="dialog-transition"
      >
        <delete-task-modal
          @close="showDeleteTask = false"
          @delete="handleDeleteTask()"
        />
      </v-dialog>
    </div>
    <v-dialog
      v-if="!loadingReportsByDownload"
      v-model="showReportsDownload"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <reports-all-download
        v-if="showReportsDownload"
        :reports="reportsByDownload"
        :type="`${jobTask.title} ${jobTask.type}`"
        :wo="workOrderNumber"
        :task="jobTask"
        @close="showReportsDownload = false"
      ></reports-all-download>
    </v-dialog>
  </div>
</template>

<script>
import SlideShow from '../../misc/SlideShow.vue'
import PdfViewer from '../../misc/PdfViewer.vue'
import DeleteTaskModal from './DeleteTaskModal.vue'
import TaskView from './TaskView.vue'
import { JOB_TYPES } from '@/utils/dictionaries'
import ReportsAllDownload from '~/components/oos/taskContent/download/ReportsAllDownload.vue'

export default {
  name: 'TaskPreview',
  components: {
    TaskView,
    SlideShow,
    PdfViewer,
    DeleteTaskModal,
    ReportsAllDownload,
  },
  props: {
    disabled: { type: Boolean, default: false },
    type: { type: Object, default: () => ({}) },
    jobTask: { type: Object, default: () => ({}) },
    orderId: { type: String, default: '' },
    workOrderNumber: { type: String, default: '' },
  },
  data() {
    return {
      JOB_TYPES: null,
      showTaskView: false,
      showImagesSlides: false,
      showPdfViewer: false,
      previewUrl: '',
      indexOfImage: 0,
      listImg: [],
      reports: [],
      showDeleteTask: false,
      reportsCount: 0,
      reportsCountObj: {},
      processTimeList: ['Before', 'During', 'After', 'GeneralReports'],
      showReportsDownload: false,
      loadingReportsByDownload: false,
      reportsByDownload: [],
    }
  },
  computed: {
    jobTaskFormated() {
      let title = ''

      if (this.jobTask && this.jobTask.title) {
        title =
          this.jobTask.title.charAt(0).toUpperCase() +
          this.jobTask.title.substring(1).toLowerCase()
      }

      return {
        ...this.jobTask,
        title,
      }
    },
    priceFormated() {
      let price = 0
      if (this.jobTaskFormated && this.jobTaskFormated.itemsForInvoices) {
        for (let i = 0; i < this.jobTaskFormated.itemsForInvoices.length; i++) {
          const item = this.jobTaskFormated.itemsForInvoices[i]

          price = price + parseFloat(item.price) * parseFloat(item.qty)
        }
      }

      return price
    },
    storeData() {
      return this.$store.state.order[this.type.type]
    },
  },
  watch: {
    jobTask() {
      this.getReportsCountAll()
    },
  },
  created() {
    this.JOB_TYPES = JOB_TYPES
    this.$nuxt.$on('update-reports-count', () => {
      this.getReportsCount()
    })
  },
  mounted() {
    this.getReportsCountAll()
    if (
      this.jobTask.type === JOB_TYPES.workToDos ||
      this.jobTask.type === JOB_TYPES.allowables
    ) {
      this.getReportsCountSection()
    }
  },

  methods: {
    getReportsCountSection() {
      this.processTimeList.forEach((type) => {
        this.getReportsCount(type)
      })
    },
    async getReportsCount(processTime) {
      try {
        const answer = await this.$store.dispatch(
          'order/get_reportsForSection',
          {
            orderId: this.orderId,
            processTime,
            task: this.jobTask,
            isCount: true,
          }
        )

        if (Object.hasOwn(answer, 'countReports')) {
          this.reportsCountObj[processTime] = answer.countReports
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting reports count', error)
        this.$mainAlertError('Error trying to get reports count')
      }
    },
    async getReportsCountAll() {
      try {
        this.loadingReportCount = true
        this.reportsCount = await this.$store.dispatch(
          'order/get_reportsCount',
          {
            orderId: this.orderId,
            type: this.type.type,
            taskId: this.jobTask.id,
          }
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting reports count', error)

        this.$mainAlertError('Error trying to get reports count')
      } finally {
        this.loadingReportCount = false
      }
    },
    handleTaskViewModal(val) {
      this.showTaskView = val
    },
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
      this.listImg = this.jobTaskFormated.pictures.filter((pic) =>
        pic.type.includes('image')
      )
      this.indexOfImage = this.listImg.findIndex((c) => c.codeName === codeName)
    },
    handleDeleteTask() {
      this.$emit('delete')
      this.showDeleteTask = !this.showDeleteTask
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
    handleDownloadAllReports() {
      this.showReportsDownload = true
      if (!this.reportsByDownload.length) {
        this.get_reportsForTask()
      }
    },
    async get_reportsForTask() {
      try {
        this.loadingReportsByDownload = true

        const _reports = await this.$store.dispatch(
          'order/get_reportsForTask',
          {
            orderId: this.orderId,
            taskId: this.jobTask.id,
            type: this.jobTask.type,
          }
        )
        this.reportsByDownload = _reports
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting reports', error)
        this.$mainAlertError('Error getting Reports')
      } finally {
        this.loadingReportsByDownload = false
      }
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
  margin-bottom: 0.5rem;
  .file-preview {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .preview,
  .file-preview {
    width: 68px;
    height: 68px;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      border-radius: 4px;
    }
  }
}
.preview {
  cursor: pointer;
}
.task-footer {
  font-size: 0.85rem;
  font-weight: bold;
  padding: 0.1rem;
  margin-left: 0.4rem;
}
.reports-count {
  font-size: 0.85rem;
  font-weight: bold;
}
.task {
  height: 150px;
  overflow: auto;
}
// .task-toolbar {
//   max-height: 48px;
//   min-height: 48px;
// }
.task-title {
  font-size: 1.125rem;
}
.price-task {
  font-size: 0.8rem;
  font-weight: bold;
}
</style>
