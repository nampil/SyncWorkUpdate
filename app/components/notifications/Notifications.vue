<template>
  <div class="notifications">
    <v-slide-x-reverse-transition>
      <div v-if="showNotis" class="notifications-container | h-100">
        <div class="d-flex flex-column h-100">
          <v-toolbar color="secondary" dense class="flex-grow-0 white--text">
            <v-toolbar-title>
              {{ $t('notificationsTitle') }}
            </v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn
              icon
              class="white--text"
              @click="$emit('close-notifications')"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <TransitionGroup
            tag="ul"
            name="list"
            class="notifications-list | flex-grow-1 pa-4 h-100"
          >
            <li
              v-for="noti in notificationsFormatted"
              :id="noti.id"
              :key="noti.id"
              ref="notification-item"
              :class="[
                'notification-item pa-4 mb-4  rounded ',
                noti.read ? '' : 'unread',
              ]"
            >
              <NotiForAuthToDeleteDoc
                v-if="noti.type === 'AUTH_FOR_DELETE_DOC'"
                :noti="noti"
                @delete="handleDelete(noti.id)"
              />
              <noti-for-job-note-tag
                v-else-if="noti.type === 'TAG_IN_JOB_NOTE'"
                :noti="noti"
                @delete="handleDelete(noti.id)"
                @close="$emit('close-notifications')"
              />
              <noti-with-action
                v-else-if="
                  noti.type === 'ADMIN' &&
                  noti.extraData &&
                  noti.extraData.needConfirmation
                "
                :noti="noti"
                @delete="handleDelete(noti.id)"
                @close="$emit('close-notifications')"
              />

              <div v-else class="noti-container">
                <div
                  class="noti-header | d-flex justify-space-between align-center"
                >
                  <h5 class="text-h6">{{ noti.title }}</h5>
                  <v-btn icon @click="handleDelete(noti.id)">
                    <v-icon color="error">mdi-delete</v-icon>
                  </v-btn>
                </div>
                <div class="noti-body mb-2">
                  <p class="ma-0">{{ noti.body }}</p>
                </div>
                <div class="noti-meta">
                  <p class="ma-0 text-caption text-right">
                    {{ noti.createdAt }}
                  </p>
                </div>
              </div>
            </li>
          </TransitionGroup>
        </div>
      </div>
    </v-slide-x-reverse-transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import NotiForAuthToDeleteDoc from './NotiForAuthToDeleteDoc.vue'
import NotiForJobNoteTag from './NotiForJobNoteTag.vue'
import NotiWithAction from './NotiWithAction.vue'

export default {
  name: 'Notifications',
  components: { NotiForAuthToDeleteDoc, NotiForJobNoteTag, NotiWithAction },
  props: {
    show: { type: Boolean, default: false },
  },
  data() {
    return {
      observer: null,
      showNotis: false,
    }
  },
  computed: {
    ...mapState({
      notifications: (state) => state.auth.notifications,
    }),
    notificationsFormatted() {
      return this.notifications.map((noti) => {
        return {
          ...noti,
          createdAt: this.$formatDate(noti.createdAt, {
            time: true,
            relativeToNow: true,
          }),
        }
      })
    },
  },
  mounted() {
    this.observer = new IntersectionObserver(this.handleRead)

    // eslint-disable-next-line
    this.showNotis = true
    this.$nextTick(() => {
      if (
        this.$refs['notification-item'] &&
        this.$refs['notification-item'].length
      ) {
        this.$refs['notification-item'].forEach((element) => {
          this.observer.observe(element)
        })
      }
    })
  },
  methods: {
    handleDelete(notiId) {
      try {
        this.$store.dispatch('auth/delete_notification', notiId)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error deleting noti', error)
      }
    },
    handleRead(entries) {
      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index]

        if (entry.isIntersecting) {
          const indexOfNoti = this.notifications.findIndex(
            (noti) => noti.id === entry.target.id
          )

          if (this.notifications[indexOfNoti].read === false) {
            try {
              setTimeout(() => {
                this.$store.dispatch('auth/set_notificationRead', {
                  notiId: entry.target.id,
                  read: true,
                })
              }, 3000)
            } catch (error) {
              // eslint-disable-next-line
              console.log('error updating noti', error)
            }
          }
        }
      }
    },
    // handleClickOutside(e) {
    //   this.$emit('close-notifications')
    // },
  },
}
</script>

<style lang="scss" scoped>
.notifications::-webkit-scrollbar {
  display: none;
}
.notifications {
  position: absolute;
  inset: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: rgba($color: #000000, $alpha: 0.3);
  z-index: 10;
}
.notifications-container {
  position: absolute;
  top: 0;
  right: 0;
  height: 100vh;
  width: 100%;
  max-width: 500px;

  background-color: var(--clr-bg-alt);
}
.notifications-list {
  list-style: none;

  overflow-y: auto;
}

.notification-item {
  transition: all 250ms ease-in-out;
  background-color: var(--clr-neutral-200);
  &.unread {
    background-color: var(--v-accent-lighten4);
  }
}

.noti-body {
  white-space: pre-wrap;
}
.theme--dark {
  .notification-item {
    &.unread {
      background-color: var(--v-accent-darken3);
    }
  }
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
