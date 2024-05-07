<template>
  <v-dialog
    v-model="show"
    persistent
    max-width="500px"
    transition="dialog-transition"
  >
    <v-card v-if="!loading">
      <v-card-title primary-title>
        {{ $t('requestForDeleteResource') }}
      </v-card-title>
      <v-card-text>
        <p>{{ $t(`authorizationForDeleteThisResource`) }}.</p>
        <v-form>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="supervisor"
                :items="supervisorsFormatted"
                outlined
                hide-details="auto"
                dense
                :label="$t('supervisor')"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="desc"
                outlined
                hide-details="auto"
                :label="$t('Message (optional)')"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          class="mr-4 mb-2"
          color="error"
          outlined
          :disabled="sending"
          @click="$emit('close')"
          >{{ $t('cancel') }}</v-btn
        >
        <v-btn
          color="primary"
          class="mb-2"
          :disabled="sending"
          :loading="sending"
          @click="handleSend"
          >{{ $t('send') }}</v-btn
        >
      </v-card-actions>
    </v-card>
    <LoaderOverlay v-else />
  </v-dialog>
</template>

<script>
import { httpsCallable } from '@firebase/functions'
import { auth, functions } from '../../../../plugins/firebase'
import LoaderOverlay from '../../../misc/LoaderOverlay.vue'

export default {
  name: 'ModalForAskAuthorization',
  components: { LoaderOverlay },
  props: {
    showModal: { type: Boolean, default: false },
    resources: {
      type: Array,
      default: () => [
        /* { path: '', desc: '', url: '' } */
      ],
    },
  },

  data() {
    return {
      supervisor: null,
      supervisors: [],
      show: false,
      loading: false,
      sending: false,
      desc: '',
    }
  },
  computed: {
    supervisorsFormatted() {
      return this.supervisors.map((supervisor) => {
        return {
          text: supervisor.fullName,
          value: supervisor,
        }
      })
    },
    userProfile() {
      return this.$store.state.auth.user.profile
    },
    _show() {
      return this.showModal
    },
  },
  watch: {
    _show(val) {
      this.show = val
    },
  },
  mounted() {
    this.show = this.showModal
    this.getSupervisors()
  },
  methods: {
    async handleSend() {
      try {
        this.sending = true

        const sendNotificationToSupervisor = httpsCallable(
          functions,
          'sendNotificationToSupervisor'
        )
        const message = {
          title: 'Authorization requirement',
          body: `${this.userProfile.fullName}: ${this.desc}`,
        }

        const objToSend = {
          user: this.supervisor.id,
          message,
          type: 'AUTH_FOR_DELETE_DOC',
          resourcesToDelete: this.resources,
        }

        await sendNotificationToSupervisor(objToSend)

        this.$mainAlertSuccess(
          `Notification to ${this.supervisor.fullName} sent`
        )
        this.$emit('close')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error sending: ', error)
        this.$mainAlertError(
          'Error sending info, please try it later. If this error persists, please contact technical support'
        )
      } finally {
        this.sending = false
      }
    },
    async getSupervisors() {
      try {
        this.loading = true
        const userToken = await auth.currentUser.getIdTokenResult()
        const { authLevel } = userToken.claims

        const getSupervisorsList = httpsCallable(
          functions,
          'getSupervisorsList'
        )

        const results = await getSupervisorsList(authLevel)
        const { error } = results.data
        if (error) {
          throw error
        }

        this.supervisors = results.data

        // this.$store.dispatch('get_supervisorsList', parseInt(authLevel))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting supervisors list', error)

        this.$mainAlertError('There was an error getting supervisors list')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
