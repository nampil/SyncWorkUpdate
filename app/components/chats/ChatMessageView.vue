<template>
  <div class="msg | pa-4">
    <div :class="['d-flex', `${isAuthor ? 'justify-end' : 'justify-start'}`]">
      <div
        :class="[
          'msg-content | d-flex flex-column',
          `${isAuthor ? 'align-end mr-4' : 'align-start order-1 ml-4'}`,
        ]"
      >
        <div v-if="msgFormatted.attachmentFiles" class="attachment mb-2">
          <div
            v-for="file in msgFormatted.attachmentFiles"
            :key="file.codeName"
            :class="[`${isAuthor ? 'text-right' : 'text-left'}`]"
          >
            <img
              v-if="file.type.includes('image')"
              :class="['image-msg', `${isAuthor ? 'image-msg-autor' : 'mr-0'}`]"
              :src="file.url"
              @click="handlerShowImagesSlides(file.codeName)"
            />
            <div
              v-if="file.type.includes('pdf')"
              :class="['container-icon-file', `${isAuthor ? 'ml-auto' : ''}`]"
            >
              <v-icon
                size="50"
                class="pdf-msg"
                @click="handleViewPdf(file.url)"
              >
                mdi-file
              </v-icon>
            </div>
            <div
              v-if="file.type.includes('audio')"
              class="d-flex container-audio"
            >
              <v-btn icon large @click="handleAudio(file.url)">
                <v-icon large color="primary">{{
                  !showAudio ? 'mdi-play' : 'mdi-pause'
                }}</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <div
                v-if="duration != null"
                class="duration | info--text d-flex align-center mr-4"
              >
                <span>{{ duration }}</span>
              </div>
              <v-icon v-if="file.url.includes('/data/')" color="red"
                >mdi-exclamation</v-icon
              >
            </div>
            <p class="name-file | grey--text mb-1">{{ file.name }}</p>
          </div>
        </div>

        <div
          v-if="msgFormatted.text"
          :class="[
            'text rounded-lg pa-4',
            `${isAuthor ? 'is-author' : 'is-counterpart'}`,
          ]"
        >
          <!-- Split para mostrar el mensaje con saltos de lineas -->
          <p
            v-for="(_msg, index) in msgFormatted.text.split('\n')"
            :key="index"
            class="ma-0"
          >
            {{ _msg }}
          </p>
        </div>
        <div class="metadata">
          <span v-if="msgFormatted.createdAt" class="time | grey--text">{{
            msgFormatted.createdAt
          }}</span>

          <!-- <v-icon
            v-if="isAuthor && msgFormatted.sent && msgFormatted.read"
            small
            color="success"
            >mdi-check-all</v-icon
          > -->
          <v-menu offset-y offset-x left max-height="350">
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn small icon v-bind="attrs" v-on="on">
                <v-icon
                  v-if="isAuthor && msgFormatted.sent && msgFormatted.delivered"
                  small
                  :color="msgFormatted.read ? 'success' : 'grey'"
                  >mdi-check-all</v-icon
                >

                <v-icon
                  v-else-if="isAuthor && msgFormatted.sent"
                  small
                  color="grey"
                  >mdi-check</v-icon
                >
              </v-btn>
            </template>

            <v-list two-line dense>
              <template v-for="(item, index) in readByList">
                <v-subheader
                  v-if="item.header"
                  :key="item.header"
                  v-text="item.header"
                ></v-subheader>

                <v-divider
                  v-else-if="item.divider"
                  :key="index"
                  :inset="item.inset"
                ></v-divider>

                <v-list-item v-else :key="item.uid">
                  <v-list-item-avatar size="30">
                    <v-img v-if="item.avatar" :src="item.avatar.url"></v-img>
                    <span
                      v-else-if="item.name && item.lastName"
                      class="text-avatar | text-h8"
                    >
                      {{ item.name.charAt(0) + item.lastName.charAt(0) }}
                    </span>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title>{{ item.fullName }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>

            <v-list two-line dense>
              <template v-for="(item, index) in deliveryToList">
                <v-subheader
                  v-if="item.header"
                  :key="item.header"
                  v-text="item.header"
                ></v-subheader>

                <v-divider
                  v-else-if="item.divider"
                  :key="index"
                  :inset="item.inset"
                ></v-divider>

                <v-list-item v-else :key="item.uid">
                  <v-list-item-avatar size="30">
                    <v-img v-if="item.avatar" :src="item.avatar.url"></v-img>
                    <span
                      v-else-if="item.name && item.lastName"
                      class="text-avatar | text-h8"
                    >
                      {{ item.name.charAt(0) + item.lastName.charAt(0) }}
                    </span>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title>{{ item.fullName }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
        </div>
      </div>
      <v-avatar v-if="isAuthor" class="avatar" color="primary" size="40">
        <!-- validar que el user uid si es igual se muestra el avatar y si no, se busca en la base de datos-->
        <img
          v-if="user.profile.avatar"
          class="img"
          :src="user.profile.avatar.url"
        />

        <span v-else class="white--text text-h8">{{
          user.profile.name.charAt(0) + user.profile.lastName.charAt(0)
        }}</span>
      </v-avatar>
      <v-avatar
        v-if="!isAuthor && counterpart"
        class="avatar"
        color="primary"
        size="40"
      >
        <img
          v-if="counterpart.avatar"
          :src="counterpart.avatar.url"
          alt=""
          class="img"
        />
        <span
          v-else-if="counterpart.name && counterpart.lastName"
          class="white--text text-h8"
        >
          {{ counterpart.name.charAt(0) + counterpart.lastName.charAt(0) }}
        </span>
      </v-avatar>
    </div>
    <SlideShow
      v-if="typeof msgFormatted.attachmentFiles !== 'undefined'"
      :list="listImg"
      :index-selected="indexOfImage"
      :show="showImagesSlides"
      :title="$t('imagesChat')"
      type="images"
      @close="showImagesSlides = false"
    />
    <v-dialog v-model="showPdfViewer" fullscreen>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import SlideShow from '../misc/SlideShow.vue'
import PdfViewer from '../misc/PdfViewer.vue'
import { MEDIA_TYPES } from '~/utils/dictionaries'
export default {
  name: 'ChatMassageView',
  components: { SlideShow, PdfViewer },
  props: {
    msg: { type: Object, default: () => ({}) },
    subscribers: { type: Array, default: () => [] },
  },

  data() {
    return {
      isAuthor: false,
      showImagesSlides: false,
      showPdfViewer: false,
      previewUrl: '',
      Image: 'Image',
      audio: null,
      showAudio: false,
      duration: null,
      timeAudioInterval: null,
      listImg: [],
      indexOfImage: 0,
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      chatRooms: (state) => state.chats.chatRooms,
    }),
    msgFormatted() {
      const subscribers = this.msg.subscribers || this.subscribers

      const _readBy = this.msg.readBy.filter(
        (uid) => uid !== this.user.profile.uid
      )
      const _deliveredTo = this.msg.deliveredTo.filter(
        (uid) => uid !== this.user.profile.uid
      )
      const read = subscribers.every((subsUid) => {
        const isread = _readBy.includes(subsUid)

        return isread
      })

      const delivered = subscribers.every((subsUid) =>
        _deliveredTo.includes(subsUid)
      )

      return {
        ...this.msg,
        read,
        delivered,
        createdAt: this.$formatDate(this.msg.createdAt, {
          relativeToNow: true,
        }),
      }
    },

    deliveryToList() {
      const items = []
      const _deliveredTo = this.msg.deliveredTo.filter(
        (uid) => uid !== this.user.profile.uid
      )

      _deliveredTo.forEach((uid, idx, arr) => {
        const profile = this.subscribersFormatted.find(
          (_profile) => _profile.uid === uid
        )

        const isRead = this.msg.readBy.includes(uid)

        if (profile && !isRead) {
          items.push(profile)
          if (idx !== arr.length - 1) {
            items.push({ divider: true, inset: true })
          }
        }
      })

      if (!items.length) {
        return []
      }
      items.unshift({ header: 'Delivery To' })

      return items
    },
    readByList() {
      const items = [{ header: 'Read By' }]
      const _readBy = this.msg.readBy.filter(
        (uid) => uid !== this.user.profile.uid
      )
      _readBy.forEach((uid, idx, arr) => {
        const profile = this.subscribersFormatted.find(
          (_profile) => _profile.uid === uid
        )

        if (profile) {
          items.push(profile)
          if (idx !== arr.length - 1) {
            items.push({ divider: true, inset: true })
          }
        }
      })
      return items
    },

    subscribersFormatted() {
      const _profiles = []
      const chatRoom = this.chatRooms.find(
        (chatRoom) => chatRoom.id === this.msg.roomId
      )
      if (chatRoom) {
        this.subscribers.forEach((subsUid) => {
          const profile = chatRoom.subscribers.find(
            (subs) => typeof subs !== 'string' && subs.uid === subsUid
          )
          if (profile) {
            _profiles.push(profile)
          }
        })
      }

      return _profiles
    },

    counterpart() {
      let _counterpart = null

      const chatRoom = this.chatRooms.filter(
        (chatRoom) => chatRoom.id === this.msg.roomId
      )[0]

      const counterpartProfile = chatRoom.subscribers.filter((subscriber) => {
        if (typeof subscriber === 'string') {
          return subscriber === this.msg.sendBy
        }

        return subscriber.uid === this.msg.sendBy
      })[0]

      if (counterpartProfile) {
        _counterpart = counterpartProfile
      }

      return _counterpart
    },
  },

  mounted() {
    this.isAuthor = this.user.profile.uid === this.msg.sendBy
    this.$emit('scroll-chat', this.msg.id)
    if (
      this.msg.attachmentFiles &&
      this.msg.attachmentFiles.length === 1 &&
      this.msg.attachmentFiles[0].type === 'audio/mpeg'
    ) {
      const audioDuration = new Audio(this.msg.attachmentFiles[0].url)
      // console.log('audio mounted')
      audioDuration.onloadedmetadata = () =>
        this.setDurationAudio(audioDuration.duration)
    }
  },
  methods: {
    handleClosePdfViewer() {
      this.previewUrl = ''
      this.showPdfViewer = false
    },
    handleViewPdf(url) {
      this.previewUrl = url
      this.showPdfViewer = true
    },
    setDurationAudio(time) {
      const sec = parseInt(time % 60)
        .toString()
        .padStart(2, '0')
      const min = (Math.floor(time / 60) % 60).toString().padStart(2, '0')
      this.duration = `${min}:${sec}`
    },
    loopAudio(time) {
      this.timeAudioInterval = setInterval(() => {
        this.setDurationAudio(
          parseInt(time) - parseInt(this.audio.currentTime.toFixed())
        )
        /* console.log("duration:",this.duration)
        console.log("currentTime:",this.audio.currentTime.toFixed()) */
        if (this.audio.paused) {
          this.setDurationAudio(this.audio.duration)
          clearInterval(this.timeAudioInterval)
        }
        if (this.audio.ended) {
          // console.log("ended")
          this.setDurationAudio(this.audio.duration)
          clearInterval(this.timeAudioInterval)
          this.showAudio = false
        }
      }, 1000)
    },
    handleAudio(url) {
      if (!url || url.includes('/data/')) return
      if (!this.showAudio) {
        this.audio = new Audio(url)
        this.audio.play()
        this.audio.preload = 'metadata'
        this.audio.onloadedmetadata = () => this.loopAudio(this.audio.duration)
      } else {
        this.audio.pause()
      }

      this.showAudio = !this.showAudio
    },
    handlerShowImagesSlides(codeName) {
      this.showImagesSlides = true
      this.listImg = this.msgFormatted.attachmentFiles.filter((pic) =>
        pic.type.includes(MEDIA_TYPES.image)
      )
      this.indexOfImage = this.msgFormatted.attachmentFiles.findIndex(
        (c) => c.codeName === codeName
      )
    },
  },
}
</script>
<style scoped lang="scss">
.msg {
  &.hightlight .msg-content .is-counterpart {
    transition: all 300ms ease-in-out;
    background-color: var(--v-warning-base);
    box-shadow: 0 0 15px var(--v-warning-base) !important;
  }
}
.is-author {
  background-color: var(--v-terciary-base);
}
.is-counterpart {
  transition: all 300ms ease-in-out;
  background-color: var(--clr-neutral-200);
}

.theme--dark {
  .is-author {
    background-color: var(--v-secondary-base);
  }
  .is-counterpart {
    background-color: var(--v-terciary-base);
  }
}

.time {
  font-size: 10px;
}

.text-avatar {
  border-radius: 100vw;
  background-color: var(--v-accent-base);
  padding: 1rem;
  color: var(--v-secondary-base);
}

.image-msg {
  max-height: 400px;
  width: 70%;
  object-fit: contain;
  cursor: pointer;
  border-radius: 4px;
  display: block;
}
.image-msg-autor {
  margin-left: 30%;
}
.pdf-msg {
  cursor: pointer;
}
.name-file {
  font-size: 10px;
}
.img {
  object-fit: cover;
}
.container-icon-file {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100px;
  height: 100px;
}
.container-audio {
  width: 250px;
  height: 43px;
  border-radius: 5px;
  background-color: var(--v-terciary-base);
  .duration {
    font-size: 1.2rem;
    font-weight: bold;
  }
}
</style>
