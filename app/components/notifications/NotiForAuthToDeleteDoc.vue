<template>
  <div class="noti-container">
    <div class="noti-header | d-flex justify-space-between align-center">
      <h5 class="text-h6">{{ noti.title }}</h5>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            color="error"
            v-bind="attrs"
            v-on="on"
            @click="$emit('delete')"
          >
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('deleteNotification') }} </span>
      </v-tooltip>
    </div>
    <div class="noti-body mb-2">
      <p class="ma-0">
        {{ noti.body }}
      </p>
      <div class="info-to-delete | d-flex mt-4 mb-4">
        <div v-if="noti.imgUrl" class="img-container | mr-4">
          <img
            :src="noti.imgUrl"
            alt=""
            width="100px"
            height="100px"
            @click="handleShowImage"
          />
        </div>

        <div class="desc">
          <p class="mb-0">{{ $t('resource(s)ToDelete') }}:</p>
          <ul>
            <li
              v-for="(resource, idx) in noti.resourcesToDelete"
              :key="idx"
              class="d-flex align-center"
              style="gap: 1rem"
            >
              <img
                v-if="resource.url && !noti.authorized"
                :src="resource.url"
                width="40"
                height="40"
                style="object-fit: cover; aspect-ratio: 1; cursor: pointer"
                alt="image to delete"
                @click="handleShowImage(noti.resourcesToDelete, idx)"
              />
              <v-tooltip v-else open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on">
                    mdi-image-remove-outline</v-icon
                  >
                </template>
                <span>{{ $t('deletedImage') }}</span>
              </v-tooltip>
              <p class="ma-0">{{ resource.desc }}</p>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="!noti.authorized" class="actions | d-flex mb-6">
        <v-spacer></v-spacer>
        <v-btn
          class="mr-4"
          color="error"
          text
          small
          :disabled="sending"
          @click="$emit('delete')"
          >{{ $t('cancel') }}</v-btn
        >
        <v-btn
          color="primary"
          text
          small
          :loading="sending"
          @click.stop="handleAuthorize"
          >{{ $t('authorize') }}</v-btn
        >
      </div>
      <div v-else class="authorized">
        <p class="info--text text-body-2 mb-0">
          You authorized this
          <span v-if="noti.authorizedAt">
            at {{ $formatDate(noti.authorizedAt.toDate(), { time: true }) }}
          </span>
        </p>
      </div>
    </div>
    <div class="noti-meta">
      <p
        class="ma-0 grey--text text--darken-2 font-weight-light text-caption text-right"
      >
        {{ noti.createdAt }}
      </p>
    </div>
    <slide-show
      :list="itemToShow"
      :show="showSlideShow"
      :index-selected="indexToShow"
      :title="'Resource to Delete'"
      @close="showSlideShow = false"
    />
  </div>
</template>

<script>
import { httpsCallable } from '@firebase/functions'
import { serverTimestamp } from '@firebase/firestore'
import { functions } from '../../plugins/firebase'
import SlideShow from '../misc/SlideShow.vue'

export default {
  name: 'NotiForAuthToDeleteDoc',
  components: { SlideShow },
  props: {
    noti: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      showSlideShow: false,
      sending: false,
      itemToShow: [],
      indexToShow: 0,
    }
  },
  methods: {
    handleShowImage(items, index) {
      this.itemToShow = items
      this.indexToShow = index
      this.showSlideShow = true
    },
    async handleAuthorize() {
      try {
        this.sending = true

        const deleteDoc = httpsCallable(functions, 'deleteDoc')

        if (this.noti.resourcesToDelete && this.noti.resourcesToDelete.length) {
          const promises = []
          for (
            let index = 0;
            index < this.noti.resourcesToDelete.length;
            index++
          ) {
            const resource = this.noti.resourcesToDelete[index]

            const resourceDeleted = deleteDoc({ docPath: resource.path })
            promises.push(resourceDeleted)
          }

          await Promise.all(promises)
        }

        const objectToUpdate = {
          authorized: true,
          authorizedAt: serverTimestamp(),
        }
        await this.$store.dispatch('auth/update_notification', {
          notiId: this.noti.id,
          objectToUpdate,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error sending deleteDoc: ', error)

        this.$mainAlertError(
          'There was an error sending the authorization. Please try later. If error persists, please contact technical support'
        )
      } finally {
        this.sending = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.info-to-delete {
  .img-container {
    width: 150px;
    img {
      width: 100%;
      height: auto;
      object-fit: cover;
      cursor: pointer;
    }
  }
}
// .authorized {
// }
</style>
