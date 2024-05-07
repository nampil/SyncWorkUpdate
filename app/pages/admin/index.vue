<template>
  <div>
    <details-toolbar-admin></details-toolbar-admin>
    <h3 class="pa-2">Admin Dash</h3>
    <div class="admin-actions pa-2">
      <!-- <v-btn color="primary" @click="addCreatedAtToOrders"
        >add CreatedAT to orders</v-btn
      > -->
      <!-- <v-btn color="success" :loading="loading" @click="addProcessorsNames"
        >Add Procesor Names to Orders</v-btn
      > -->
      <!-- <v-btn color="success" :loading="loading" @click="handleFixGeneralStatus"
        >Fix Orders General Status</v-btn
      > -->

      <!-- <div v-for="(state, i) in states" :key="i">
        <div class="mt-4">
          <h4>{{ state }}</h4>
          <v-btn
            color="primary"
            small
            :loading="loading"
            @click="handleFixOrderPropertyId(state)"
            >Fix Property Id state: {{ state }}</v-btn
          >
          <div v-for="(page, j) in pagesByState[state]" :key="j">
            <v-btn
              color="secondary"
              :loading="page.loading"
              :disabled="
                page.completed ||
                (j !== 0 && pagesByState[state][j - 1].lastVisible === null)
              "
              @click="getNextPage(j, j === 0, state)"
            >
              {{ j + 1 }}
            </v-btn>
          </div>
        </div> 
      </div>-->
    </div>
  </div>
</template>

<script>
import {
  collection,
  deleteField,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  limit,
  getCountFromServer,
  orderBy,
  startAfter,
} from '@firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { getDownloadURL, ref } from 'firebase/storage'

import { functions, db, storage } from '../../plugins/firebase'

import {
  GENERAL_ORDER_STATUS,
  JOB_NOTES_TYPES,
  ORDER_STATUS,
  ORDER_SUB_STATUS_BY_GENERAL_STATUS,
  TEMPLATES_TYPES,
} from '@/utils/dictionaries'
import DetailsToolbarAdmin from '~/components/admin/templates/DetailsToolbarAdmin.vue'

export default {
  name: 'AdminIndex',
  components: { DetailsToolbarAdmin },
  layout: 'dash',
  // middleware: 'admin',

  data() {
    return {
      labelsUsers: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'],
      valueUsers: [200, 675, 410, 390, 310, 1000, 250, 240],
      labels: ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'],
      value: [200, 675, 410, 390, 310, 1000, 250, 240, 5, 4, 8],
      loading: false,
      pages: [],
      totalPages: 0,
      countLimit: 50,
      states: ['Carabobo', 'GA', 'NC', 'NJ', 'NY', 'PA', 'SC', 'VA', 'WV'],
    }
  },
  head() {
    return {
      title: 'Admin',
    }
  },
  computed: {
    pagesByState() {
      return this.pages.reduce((acc, page) => {
        if (!acc[page.state]) {
          acc[page.state] = []
        }
        acc[page.state].push(page)
        return acc
      }, {})
    },
  },

  mounted() {},
  methods: {
    async addCreatedAtToOrders() {
      try {
        this.loading = true

        const orders = []

        const ordersRef = collection(db, 'orders')

        const q = query(ordersRef)

        const snapshot = await getDocs(q)

        snapshot.forEach((doc) => {
          const createdAt = doc._document.createTime.timestamp

          orders.push({
            ...doc.data(),
            id: doc.id,
            createdAt,
          })
        })

        const ordersUpdated = []

        for (let index = 0; index < orders.length; index++) {
          const order = orders[index]
          if (!order.createdAt) {
            continue
          }
          const orderRef = doc(db, 'orders', order.id)

          ordersUpdated.push(
            updateDoc(orderRef, { createdAt: order.createdAt })
          )
        }

        await Promise.all(ordersUpdated)
        // eslint-disable-next-line
        console.log('DONE')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error in addCreatedAtToOrders: ', error)
      } finally {
        this.loading = false
      }
    },
    async handleFixOrderPropertyId(state) {
      try {
        this.loading = true

        // const woNumbersToFind = [
        //   '1234',
        //   '12345',
        //   '123456',
        //   '1234567',
        //   '12345678',
        // ]

        const ordersRef = collection(db, 'orders')
        const q = query(
          ordersRef,
          where('state', '==', state),
          orderBy('woNumber')
        )
        const countLimit = this.countLimit || 50

        const countSnapshot = await getCountFromServer(q)
        const ordersSize = countSnapshot.data().count

        this.totalPages = Math.ceil(ordersSize / countLimit)
        for (let i = 0; i < this.totalPages; i++) {
          this.pages.push({
            state,
            errors: [],
            completed: false,
            loading: false,
            lastVisible: null,
          })
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error in handleFixOrderPropertyId: ', error)
      } finally {
        this.loading = false
      }
    },
    async getNextPage(idx, isFirst, state) {
      try {
        this.loading = true
        const ordersRef = collection(db, 'orders')
        const countLimit = this.countLimit || 50

        const qConstrains = [
          limit(countLimit),
          where('state', '==', state),
          orderBy('woNumber'),
        ]

        if (!isFirst) {
          const prevPage = this.pagesByState[state][idx - 1]
          if (!prevPage) {
            return
          }
          const lastVisible = prevPage.lastVisible
          if (!lastVisible) {
            return
          }
          qConstrains.push(startAfter(lastVisible))
        }

        const q = query(ordersRef, ...qConstrains)

        this.pagesByState[state][idx].loading = true

        const snapshot = await getDocs(q)
        if (snapshot.empty) {
          return
        }

        const orders = []

        this.pagesByState[state][idx].lastVisible =
          snapshot.docs[snapshot.docs.length - 1]

        snapshot.forEach((doc) => {
          orders.push({
            ...doc.data(),
            id: doc.id,
          })
        })

        const promises = []

        for (let index = 0; index < orders.length; index++) {
          const order = orders[index]
          // eslint-disable-next-line
          console.log('Working on WO#', order.woNumber)

          const orderRef = doc(db, 'orders', order.id)
          const propertyId = this.$getPropertyId(order)

          promises.push(updateDoc(orderRef, { propertyId }))

          const batch = writeBatch(db)

          const bidRefs = collection(db, `orders/${order.id}/bids`)
          const jobNotesRefs = collection(db, `orders/${order.id}/jobNotes`)
          const jnq = query(
            jobNotesRefs,
            where('noteType', '==', JOB_NOTES_TYPES.propertyNotes)
          )

          const bidOnBatch = getDocs(bidRefs).then((querySnapshot) => {
            if (querySnapshot.empty) {
              // eslint-disable-next-line
              console.log(`WO# ${order.woNumber} has not bids`)
              return
            }
            // eslint-disable-next-line
            console.log(`Bids in WO# ${order.woNumber} ${querySnapshot.size}`)

            querySnapshot.forEach((doc) => {
              batch.update(doc.ref, { propertyId })
            })
          })

          const jobNotesOnBatch = getDocs(jnq).then((querySnapshot) => {
            if (querySnapshot.empty) {
              // eslint-disable-next-line
              console.log(`WO# ${order.woNumber} has not Property job notes`)
              return
            }
            // eslint-disable-next-line
            console.log(
              `Property job notes in WO# ${order.woNumber} ${querySnapshot.size}`
            )
            querySnapshot.forEach((doc) => {
              batch.update(doc.ref, { propertyId })
            })
          })

          await Promise.all([bidOnBatch, jobNotesOnBatch])

          const batchCompleted = batch.commit()
          promises.push(batchCompleted)
        }

        // eslint-disable-next-line
        console.log('Await for promises')

        await Promise.all(promises)

        this.pages[idx].completed = true
        this.pages[idx].loading = false

        // eslint-disable-next-line
        console.log('Done')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
      } finally {
        this.loading = false
      }
    },

    async handleFixGeneralStatus() {
      try {
        this.loading = true

        const orders = []

        const ordersRef = collection(db, 'orders')

        const snapshot = await getDocs(ordersRef)

        snapshot.forEach((doc) => {
          orders.push({
            ...doc.data(),
            id: doc.id,
          })
        })

        // const ordersStatus = orders.map((order) => order.status)
        // const uniqueStatus = [...new Set(ordersStatus)]

        // // eslint-disable-next-line
        // console.log('uniqueStatus', uniqueStatus)
        // dbStatus = [
        //   'Invoiced',
        //   'Ready for office',
        //   'Partially complete',
        //   'Closed',
        //   'idle',
        //   'In Field',
        //   'Inactive',
        //   'Performing work',
        //   'Closing work order',
        //   'On Route',
        // ]

        const ordersUpdated = []

        for (let index = 0; index < orders.length; index++) {
          const order = orders[index]
          const orderRef = doc(db, 'orders', order.id)

          let generalStatus = GENERAL_ORDER_STATUS.newOrder
          const status = order.status?.toLowerCase() || 'inactive'

          if (
            Object.values(GENERAL_ORDER_STATUS)
              .map((value) => value.toLowerCase())
              .includes(status)
          ) {
            generalStatus = status
          } else if (status === ORDER_STATUS.partiallyCompleted.toLowerCase()) {
            generalStatus = GENERAL_ORDER_STATUS.partiallyCompleted
          } else if (status === 'idle') {
            generalStatus = GENERAL_ORDER_STATUS.newOrder
          } else if (status === 'in field') {
            generalStatus = GENERAL_ORDER_STATUS.assigned
          } else {
            Object.keys(ORDER_SUB_STATUS_BY_GENERAL_STATUS).forEach(
              (_generalStatus) => {
                if (
                  ORDER_SUB_STATUS_BY_GENERAL_STATUS[_generalStatus]
                    .map((value) => value.toLowerCase())
                    .includes(status)
                ) {
                  generalStatus = _generalStatus
                }
              }
            )
          }

          ordersUpdated.push(updateDoc(orderRef, { generalStatus }))
        }

        await Promise.all(ordersUpdated)

        // eslint-disable-next-line
        console.log('Done')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error in addStatusToAllOrders: ', error)
      } finally {
        this.loading = false
      }
    },
    async addProcessorsNames() {
      try {
        this.loading = true

        const usersRef = collection(db, 'users')
        const q = query(
          usersRef,
          where('departments', 'array-contains', 'Processors')
        )
        const users = await getDocs(q).then((querySnapshot) => {
          const _users = []
          querySnapshot.forEach((doc) => {
            _users.push({ ...doc.data(), id: doc.id })
          })
          return _users
        })

        const batch = writeBatch(db)

        const ordersRef = collection(db, 'orders')
        const qOrders = query(
          ordersRef,
          where(
            'processor',
            'in',
            users.map((user) => user.id)
          )
        )
        const orders = await getDocs(qOrders).then((querySnapshot) => {
          const _orders = []
          querySnapshot.forEach((doc) => {
            _orders.push({ ...doc.data(), id: doc.id })
          })
          return _orders
        })

        for (let index = 0; index < users.length; index++) {
          const user = users[index]
          const userOrders = orders.filter(
            (order) => order.processor === user.id
          )

          for (let j = 0; j < userOrders.length; j++) {
            const order = userOrders[j]
            const orderRef = doc(db, 'orders', order.id)

            batch.update(orderRef, { processorName: user.fullName })
          }
        }
        await batch.commit()
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
      } finally {
        this.loading = false
      }
    },

    async handleFix() {
      try {
        this.loading = true

        const promises = []
        const ordersRef = collection(db, 'orders')

        const snapshot = await getDocs(ordersRef)
        snapshot.forEach((doc) => {
          if (doc.data().id) return
          const updatedOrder = updateDoc(doc.ref, { id: doc.id })
          promises.push(updatedOrder)
        })

        await Promise.all(promises)

        // eslint-disable-next-line
        console.log('Done')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
      } finally {
        this.loading = false
      }
    },

    addPropertyIdToOrders() {
      const orders = this.$store.state.orders.orders

      const batch = writeBatch(db)

      for (let index = 0; index < orders.length; index++) {
        const order = orders[index]
        if (order.propertyId) {
          continue
        }
        const propertyIdRaw =
          order.address + order.county + order.city + order.state + order.zip

        const propertyId = propertyIdRaw
          .trim()
          .split(' ')
          .join('')
          .toLowerCase()
        const orderRef = doc(db, `orders/${order.id}`)

        if (propertyId) {
          batch.update(orderRef, { propertyId })
        }
      }
      batch.commit().catch((error) => {
        // eslint-disable-next-line
        console.log('error: ', error)
      })
    },
    async addChatToOrders() {
      try {
        const orders = this.$store.state.orders.orders
        const adminsRef = collection(db, 'users')
        const q = query(adminsRef, where('rol', '==', 'admin'))
        const admins = await getDocs(q).then((querySnapshot) => {
          const _admins = []
          querySnapshot.forEach((doc) => {
            _admins.push(doc.id)
          })
          return _admins
        })

        const promises = []

        for (let index = 0; index < orders.length; index++) {
          const order = orders[index]
          if (order.chatRoomId) {
            continue
          }
          const chatRoomRef = doc(collection(db, 'chatRooms'))
          const chatRoom = {
            name: order.woNumber || order.id,
            admins,
            cretatedBy: { fullName: 'Admin' },
            createdAt: serverTimestamp(),
            roomImg: order.fohImg ? { url: order.fohImg } : null,

            isGroup: true,
            isOrderChat: true,
            orderId: order.id,
            subscribers: order.contractorsUids
              ? admins.concat(order.contractorsUids)
              : admins,
            active: false,
          }

          promises.push(setDoc(chatRoomRef, chatRoom))
          const orderRef = doc(db, `orders/${order.id}`)

          promises.push(updateDoc(orderRef, { chatRoomId: chatRoomRef.id }))
        }

        const results = await Promise.all(promises)
        // eslint-disable-next-line
        console.log(results)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
      }
    },

    async addStatusToAllOrders() {
      try {
        this.loading = true

        const orders = []

        const ordersRef = collection(db, 'orders')

        const snapshot = await getDocs(ordersRef)

        snapshot.forEach((doc) => {
          orders.push({
            ...doc.data(),
            id: doc.id,
          })
        })

        const ordersUpdated = []

        for (let index = 0; index < orders.length; index++) {
          const order = orders[index]
          const orderRef = doc(db, 'orders', order.id)

          ordersUpdated.push(updateDoc(orderRef, { status: 'Inactive' }))
        }

        const results = await Promise.all(ordersUpdated)
        // eslint-disable-next-line
        console.log(results)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error in addStatusToAllOrders: ', error)
      } finally {
        this.loading = false
      }
    },
    async deleteUnsuedProperties() {
      try {
        this.loading = true

        const orders = []

        const ordersRef = collection(db, 'orders')

        const snapshot = await getDocs(ordersRef)

        snapshot.forEach((doc) => {
          orders.push({
            ...doc.data(),
            id: doc.id,
          })
        })

        const ordersUpdated = []

        for (let index = 0; index < orders.length; index++) {
          const order = orders[index]
          const orderRef = doc(db, 'orders', order.id)

          ordersUpdated.push(
            updateDoc(orderRef, {
              orderStatus: deleteField(),
              contractorOrigin: deleteField(),
              assignedTo: deleteField(),
            })
          )
        }

        const results = await Promise.all(ordersUpdated)
        // eslint-disable-next-line
        console.log(results)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error in deleteUnsuedProperties: ', error)
      } finally {
        this.loading = false
      }
    },
    async handleFixUrls() {
      try {
        // Recuperar todos los templates
        this.loading = true
        const templates = []

        const templateRef = collection(
          db,
          `admin/config/${TEMPLATES_TYPES.workToDos}-templates`
        )

        const snapshot = await getDocs(query(templateRef))

        snapshot.forEach((doc) => {
          templates.push({
            ...doc.data(),
            id: doc.id,
          })
        })

        // Recorrer los templates y filtrar los que tengan pictures

        // Debe quedar una lista de templates con pics
        const templatesWithPictures = templates.filter(
          (temp) => temp.pictures?.length > 0
        )

        // Recorrer cada una y enviar a una funcion por crear el path actual y el path nuevo.
        for (let index = 0; index < templatesWithPictures.length; index++) {
          const template = templatesWithPictures[index]

          const pictures = template.pictures

          const files = pictures.map((pic) => {
            const picUrl = new URL(pic.url)
            const pathNameFormatted = decodeURIComponent(picUrl.pathname)
            const [__, path] = pathNameFormatted.split('/o/')
            // eslint-disable-next-line
            console.log(__)
            const destinationPath = `admin/config/${TEMPLATES_TYPES.workToDos}-templates/${template.id}/${pic.codeName}`

            return {
              path,
              destinationPath,
            }
          })

          const copyFiles = httpsCallable(functions, 'copyFiles')

          await copyFiles({ files })

          const picturesFormatted = []

          for (let j = 0; j < pictures.length; j++) {
            const pic = pictures[j]

            const picRef = ref(
              storage,
              `admin/config/${TEMPLATES_TYPES.workToDos}-templates/${template.id}/${pic.codeName}`
            )

            const url = await getDownloadURL(picRef)

            picturesFormatted.push({
              ...pic,
              url,
            })
          }

          const templateRef = doc(
            db,
            `admin/config/${TEMPLATES_TYPES.workToDos}-templates`,
            template.id
          )

          await updateDoc(templateRef, {
            pictures: picturesFormatted,
          })
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.admin-actions {
}
</style>
