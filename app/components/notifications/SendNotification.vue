<template>
  <v-card>
    <v-toolbar color="secondary" dense>
      <v-btn icon dark @click="show = false"> <v-icon>mdi-close</v-icon></v-btn>
      <v-toolbar-title>{{ $t('sendNotification') }}</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text :loading="loading" @click="handleSend">{{
          $t('send')
        }}</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-card-text class="pa-4">
      <v-form ref="sendMessageForm">
        <v-row>
          <v-col cols="12">
            <v-combobox
              v-model="notification.users"
              :label="$t('SendTo')"
              :items="users"
              item-text="fullName"
              item-value="uid"
              autocomplete
              :rules="selectRules"
              outlined
              multiple
              dense
              hide-details="auto"
            ></v-combobox>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="notification.msg.title"
              :label="$t('title')"
              outlined
              :rules="rules"
              dense
              hide-details="auto"
              @keydown.enter.exact.prevent
              @keyup.enter.exact="handleFocus(6)"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="notification.msg.body"
              :label="$t('message')"
              :rules="rules"
              outlined
              dense
              hide-details="auto"
              @keydown.enter.exact.prevent
              @keyup.enter.exact="handleFocus(7)"
            ></v-text-field>
            <!-- @keyup.enter.exact="handleFocusBtnActions()" -->
          </v-col>
          <v-col cols="12">
            <v-checkbox
              v-model="notification.needReminder"
              :label="$t('addReminder')"
              dense
              hide-details="auto"
            >
            </v-checkbox>
            <v-row v-if="notification.needReminder" dense class="py-2">
              <v-col cols="4">
                <v-menu
                  v-model="reminderDateMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="notification.reminder.date"
                      :label="$t('reminderDate')"
                      append-icon="mdi-calendar"
                      readonly
                      dense
                      outlined
                      hide-details="auto"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="notification.reminder.date"
                    :min="$formatDate(new Date(), { iso: true })"
                    :max="maxDate"
                    @input="reminderDateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-menu
                  v-model="reminderTimeMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="notification.reminder.time"
                      :label="$t('reminderTime')"
                      append-icon="mdi-clock"
                      readonly
                      dense
                      outlined
                      hide-details="auto"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-model="notification.reminder.time"
                    @input="reminderTimeMenu = false"
                  ></v-time-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="notification.reminder.timeZone"
                  :items="paises"
                  :label="$t('timeZone')"
                  dense
                  outlined
                  hide-details="auto"
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-checkbox
              v-model="notification.needConfirmation"
              :label="$t('addConfirmation')"
              dense
              hide-details="auto"
            >
            </v-checkbox>
            <v-row v-if="notification.needConfirmation" dense class="py-2">
              <v-col cols="12">
                <v-combobox
                  v-model="notification.confirmation.question"
                  :items="questionsOptions"
                  :label="$t('question')"
                  outlined
                  dense
                  hide-details="auto"
                  :rules="rules"
                >
                </v-combobox>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <!-- <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" outlined :disabled="loading" @click="show = false">{{
        $t('cancel')
      }}</v-btn>
      <v-btn color="primary" :loading="loading" @click="handleSend">{{
        $t('send')
      }}</v-btn>
    </v-card-actions> -->
  </v-card>
</template>

<script>
export default {
  name: 'SendNotification',
  props: {
    multiple: { type: Boolean, default: false },
  },
  data() {
    return {
      reminderTimeMenu: false,
      reminderDateMenu: false,
      loading: false,
      users: [],
      paises: [
        {
          text: 'New Jersey, USA',
          value: 'America/New_York',
        },
        {
          text: 'Caracas, Ve',
          value: 'America/Caracas',
        },
        {
          text: 'La Paz, Pe',
          value: 'America/La_Paz',
        },
        {
          text: 'Los Angeles, USA',
          value: 'America/Los_Angeles',
        },
      ],
      questionsOptions: ['¿De acuerdo?', '¿Aceptas?', '¿Confirmado?'],
      notification: {
        users: [],
        needConfirmation: false,
        needReminder: false,
        reminder: {
          date: null,
          time: null,
          timeZone: '',
        },
        confirmation: {
          question: '¿De acuerdo?',
        },
        msg: {
          title: '',
          body: '',
        },

        needResponse: false,
      },
    }
  },
  computed: {
    maxDate() {
      const date = new Date()
      date.setDate(date.getDate() + 30)
      return this.$formatDate(date, { iso: true })
    },
    user() {
      return this.$store.state.auth.user.profile
    },
    rules() {
      return [(v) => !!v || this.$t('thisFieldRequired')]
    },
    selectRules() {
      return [(v) => v.length > 0 || this.$t('thisFieldRequired')]
    },
    show: {
      set(payload) {
        this.$store.commit('set_showSendNotificationModal', payload)
      },
      get() {
        return this.$store.state.showSendNotificationModal
      },
    },
  },
  watch: {
    show(val) {
      if (!val) {
        this.resetForm()
      }
    },
  },
  async mounted() {
    await this.initialize()
  },
  methods: {
    async initialize() {
      this.loading = true
      try {
        const _users = await this.$store.dispatch('admin/users/get_users')
        this.users = _users && _users.length ? [..._users] : []
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleCancel() {
      this.$refs.sendMessageForm.reset()
    },
    handleFocus(index) {
      this.$nextTick(() => {
        this.$refs.sendMessageForm.$el[index].focus()
      })
    },
    handleFocusBtnActions() {
      setTimeout(() => {
        this.$refs.btnSend.$el.focus()
      }, 200)
    },

    resetForm() {
      this.notification = {
        users: [],
        needConfirmation: false,
        needReminder: false,
        reminder: {
          date: null,
          time: null,
          timeZone: '',
        },
        confirmation: {
          question: '¿De acuerdo?',
        },
        msg: {
          title: '',
          body: '',
        },

        needResponse: false,
      }

      this.$refs.sendMessageForm.resetValidation()
    },

    async handleSend() {
      if (!this.$refs.sendMessageForm.validate()) return
      try {
        this.loading = true
        const extraData = {
          sender: this.user,
          needConfirmation: this.notification.needConfirmation,
          ...(this.notification.needConfirmation && {
            confirmationQuestion: this.notification.confirmation.question,
            cod:
              '' +
              new Date().getTime() +
              Math.floor(1000 + Math.random() * 9000),
          }),
          needReminder: this.notification.needReminder,
        }

        if (this.notification.needReminder) {
          const [year, month, day] = this.notification.reminder.date.split('-')
          const [hour, min] = this.notification.reminder.time.split(':')

          const date = new Date(
            new Date(year, month - 1, day, hour, min).toLocaleString('en-US', {
              timeZone: this.notification.reminder.timeZone,
            })
          )

          extraData.reminderAtSeconds = date.getTime() / 1000
        }

        await this.$store.dispatch('admin/users/sendMessage', {
          users: this.notification.users.map((u) => u.uid),
          message: {
            title: `${this.user.name} dice: ${this.notification.msg.title}`,
            body: this.notification.msg.body,
          },
          type: 'ADMIN',

          sendMessageInApp: true,
          extraData: JSON.stringify(extraData),
        })

        this.resetForm()
        this.show = false
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error sending messages: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
