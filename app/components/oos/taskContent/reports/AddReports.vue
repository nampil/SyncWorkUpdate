<template>
  <div class="container-add-reports">
    <div class="plus-reports-container | my-4">
      <div class="container-report-img">
        <v-form ref="plusReportsForm" class="d-flex justify-center">
          <v-file-input
            v-if="!loading"
            v-model="files"
            class="plus-reports | ml-1"
            dense
            hide-input
            accept="image/png, image/jpeg, image/bmp"
            prepend-icon="mdi-plus"
            multiple
            truncate-length="15"
            @change="handleInputFiles($event, 'plusReportsForm')"
          ></v-file-input>
        </v-form>
        <img
          v-if="images != null && !loading"
          class="report-img"
          :src="images"
          style="object-fit: cover"
          @click="showImagesSlidesAddReports = true"
        />
        <div
          v-if="loading"
          class="container-loader pa-4 d-flex align-center rounded justify-center"
        >
          <v-progress-circular indeterminate size="20"></v-progress-circular>
        </div>
        <div v-if="files.length && !loading">
          <v-btn icon x-small class="btn-send" @click="handleSendReports()">
            <v-icon size="20" color="success">mdi-check-bold</v-icon>
          </v-btn>
          <v-btn icon x-small class="btn-cancel" @click="cancelReports()">
            <v-icon size="20" color="error">mdi-close</v-icon>
          </v-btn>
          <div
            v-if="files.length > 1"
            @click="showImagesSlidesAddReports = true"
          >
            <span class="numeration-img">+{{ files.length - 1 }}</span>
          </div>
        </div>
      </div>
    </div>
    <SlideShow
      :list="picturesReports"
      :show="showImagesSlidesAddReports"
      title="Add Reports"
      type="images"
      :index-selected="0"
      @close="showImagesSlidesAddReports = false"
    />
  </div>
</template>

<script>
import { serverTimestamp } from '@firebase/firestore'
import SlideShow from '../../../misc/SlideShow.vue'
import { PROCESS_TIME_TYPES } from '@/utils/dictionaries'
export default {
  name: 'AddReports',
  components: {
    SlideShow,
  },
  props: {
    orderId: { type: String, default: '' },
    processTime: { type: String, default: '' },
    forRequirements: { type: Boolean, default: false },
    area: { type: String, default: '' },
    task: { type: Object, required: true },
    requirement: { type: Object, default: () => ({}) },
    fromOrderInfo: { type: Boolean, default: false },
  },
  data() {
    return {
      images: null,
      picturesReports: [],
      files: [],
      showImagesSlidesAddReports: false,
      before: false,
      during: false,
      after: false,
      newArea: '',
      loading: false,
      PROCESS_TIME_TYPES: null,
    }
  },

  computed: {
    user() {
      return this.$store.state.auth.user.profile
    },
  },
  created() {
    this.PROCESS_TIME_TYPES = PROCESS_TIME_TYPES
  },
  methods: {
    handleInputFiles(files, ref) {
      this.images = null
      if (!this.$refs[ref].validate()) {
        return
      }
      if (!files) {
        return
      }

      files.forEach((file) => {
        if (!file) {
          return
        }
        this.images = URL.createObjectURL(file)
        const codeName =
          '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)

        file.codeName = codeName

        const reader = new FileReader()
        reader.onload = (event) => {
          const url = event.target.result

          this.picturesReports.push({
            url,
            type: file.type,
            codeName: file.codeName,
          })
        }
        //
        reader.readAsDataURL(file)
      })
    },
    cancelReports() {
      this.clean()
    },
    clean() {
      this.images = null
      this.picturesReports = []
      this.files = []
    },

    async handleSendReports() {
      this.loading = true
      this.typeSection()
      const objectToSend = {
        codeName: '',
        task: {
          id: this.task.id,
          type: this.task.type,
        },
        orderId: this.orderId,
        fromRequirement: this.forRequirements,
        mediaType: 'image',
        before: this.before,
        during: this.during,
        after: this.after,
        area: this.newArea,
        createdAt: serverTimestamp(),
        createdBy: this.user,
        filePath: null,
        filePathPreview: null,
        id: '',
        geoLoc: null,
        requirementId:
          this.forRequirements && this.requirement
            ? this.requirement.id
            : 'NoReqId',
        url: '',
        file: null,
        uploadedAt: null,
        uploaded: false,
      }
      const arrayToSend = []
      for (let i = 0; i < this.files.length; i++) {
        const codeName =
          '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
        const _objectToSend = {
          ...objectToSend,
          codeName,
          id: codeName,
          file: this.files[i],
        }
        arrayToSend.push(_objectToSend)
      }

      try {
        await this.$store.dispatch('oos/orders/add_reports', arrayToSend)
        this.$mainAlertSuccess('Success! Report(s) added')
        if (this.fromOrderInfo) {
          const newReports = await this.$store.dispatch(
            'order/get_reports_order_info',
            {
              arrayToSend,
              orderId: this.orderId,
              type: this.task.type,
              taskId: this.task.id,
            }
          )
          this.$emit('new-reports', newReports)
        }
        this.$nuxt.$emit('update-reports-count')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.clean()
        this.loading = false
      }
    },
    typeSection() {
      switch (this.processTime) {
        case PROCESS_TIME_TYPES.before:
          this.before = true
          break
        case PROCESS_TIME_TYPES.during:
          this.during = true
          break
        case PROCESS_TIME_TYPES.after:
          this.after = true
          break
        case PROCESS_TIME_TYPES.inspection:
          this.newArea = this.area
          break
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.plus-reports-container {
  aspect-ratio: 1;
}
.container-report-img {
  position: relative;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  border: 1px solid var(--v-primary-base);
}
.report-img {
  display: block;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  border: 1px solid var(--v-primary-base);
}
::v-deep .mdi-plus::before {
  content: '\F0415';
  color: var(--v-primary-base);
}
.plus-reports {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.btn-send {
  position: absolute;
  top: 0;
  right: 0.2rem;
}
.btn-cancel {
  position: absolute;
  top: 0;
  left: 0;
}
.numeration-img {
  font-size: 10px;
  position: absolute;
  color: white;
  text-align: center;
  background-color: #696d6986;
  border-radius: 50%;
  padding: 1px 5px 1px 5px;
  bottom: 0;
  right: 0.15rem;
  z-index: 1;
}
.container-loader {
  position: absolute;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  border: 1px solid var(--v-primary-base);
}
</style>
