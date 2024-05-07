const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const { ORDER_STATUS } = require('../../../utils/dictionary')
const db = admin.firestore()

exports.routeOnWrite = functions.firestore
  .document('routes/{routeId}')
  .onWrite(async (change, context) => {
    const document = change.after.exists ? change.after.data() : null
    const oldDocument = change.before.exists ? change.before.data() : null

    if (!document) {
      // the route was deleted.
      return null
    }

    const promises = []

    if (!oldDocument) {
      // the route was created.
      const oosUsersRef = db
        .collectionGroup('admin')
        .where('departments', 'array-contains', 'OOS')

      const objToUpdate = {}

      const oosUsers = await oosUsersRef.get().then((querySnapshot) => {
        const _adminUids = []
        querySnapshot.forEach((doc) => {
          _adminUids.push(doc.data().uid)
        })
        return _adminUids
      })

      const contractors = document.contractors

      const chatRef = db.collection('chatRooms').doc()

      const chatRoom = {
        name: document.groupName,
        admins: oosUsers,
        createdBy: { fullName: 'Admin' },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isGroup: true,
        isRouteChat: true,
        routId: context.params.routeId,
        subscribers: [...oosUsers, ...contractors],
        active: true,
      }
      const chatRoomCreated = chatRef.set(chatRoom)
      promises.push(chatRoomCreated)

      objToUpdate.chatRoomId = chatRef.id

      if (document.orders?.length) {
        const orderPromises = []

        document.orders.forEach((order) => {
          const orderRef = db.collection('orders').doc(order)
          const orderData = orderRef
            .get()
            .then((doc) => ({ ...doc.data(), id: doc.id }))
          orderPromises.push(orderData)
        })
        const orders = await Promise.all(orderPromises)

        const ordersR = {}

        const taskPromises = []

        orders.forEach(async (order) => {
          ordersR[order.id] = {
            status: order.status,
            woNumber: order.woNumber,
            isReopen: order.isReopen || false,
          }

          const tasksItems = ['workToDos', 'inspections', 'allowables']

          tasksItems.forEach((taskItem) => {
            const taskRef = db.collection(`orders/${order.id}/${taskItem}`)
            const taskOnR = taskRef.get().then((querySnapshot) => {
              const tasks = []
              querySnapshot.forEach((doc) => {
                tasks.push({ ...doc.data(), id: doc.id, orderId: order.id })
              })
              ordersR[order.id][taskItem] = {}
              if (tasks.length > 0) {
                tasks.forEach((_task) => {
                  ordersR[order.id][taskItem][_task.id] = {
                    status: _task.status,
                    title: _task.title,
                    started: _task.started || false,
                    ...(_task.position && { position: _task.position }),
                    ...(_task.ect && { ect: _task.ect }),
                  }
                })
              }
            })

            taskPromises.push(taskOnR)
          })
        })

        await Promise.all(taskPromises)

        objToUpdate.ordersR = ordersR
      }
      const updatedRoute = change.after.ref.update(objToUpdate)
      promises.push(updatedRoute)
    }

    if (oldDocument && document) {
      // Important to return if creating ordersR, otherwise it will create an infinite loop
      if (
        (!oldDocument.ordersR && document.ordersR) ||
        JSON.stringify(oldDocument.ordersR) !== JSON.stringify(document.ordersR)
      ) {
        return null
      }
      // the route was updated.
      const routeId = context.params.routeId

      if (
        document.tripStarted !== oldDocument.tripStarted &&
        document.tripStarted
      ) {
        updateOrdersStatus(document, ORDER_STATUS.onRoute, promises)
      }

      if (!oldDocument.arrivedAt && !!document.arrivedAt) {
        updateOrdersStatus(document, ORDER_STATUS.accesingProperty, promises)
      }

      if (!compareArrays(document.files, oldDocument.files)) {
        const bucket = admin.storage().bucket()
        const filesRefToDelete = []

        for (let index = 0; index < oldDocument.files.length; index++) {
          const file = oldDocument.files[index]
          const isInNewValueFiles = document.files
            .map((f) => f.codeName)
            .includes(file.codeName)

          if (!isInNewValueFiles) {
            filesRefToDelete.push(`routes/${routeId}/${file.codeName}`)
          }
        }

        if (filesRefToDelete.length) {
          for (let index = 0; index < filesRefToDelete.length; index++) {
            const fileRef = filesRefToDelete[index]
            const deleteFile = bucket.file(fileRef).delete()
            promises.push(deleteFile)
          }
        }
      }

      if (!compareArrays(document.contractors, oldDocument.contractors)) {
        const chatRoomId = document.chatRoomId
        const chatRoomRef = db.collection('chatRooms').doc(chatRoomId)
        const chatRoom = await chatRoomRef.get().then((doc) => doc.data())

        const adminsSusbcribers = chatRoom.subscribers.filter((sub) => {
          return !oldDocument.contractors.includes(sub)
        })

        const updatedChatRoom = chatRoomRef.update({
          subscribers: [...adminsSusbcribers, ...document.contractors],
        })
        promises.push(updatedChatRoom)
      }

      // update Orders
      const updatedOrdersR = updateOrdersRInRoute(document, oldDocument, change)
      promises.push(updatedOrdersR)

      if (document.active !== oldDocument.active) {
        const chatRoomId = document.chatRoomId
        if (chatRoomId) {
          const chatRoomRef = db.collection('chatRooms').doc(chatRoomId)
          const updatedChatRoom = chatRoomRef.update({
            active: document.active,
          })
          promises.push(updatedChatRoom)
        }
      }

      if (document.groupName !== oldDocument.groupName) {
        const chatRoomId = document.chatRoomId
        if (chatRoomId) {
          const chatRoomRef = db.collection('chatRooms').doc(chatRoomId)
          const updatedChatRoom = chatRoomRef.update({
            name: document.groupName,
          })
          promises.push(updatedChatRoom)
        }
      }
    }

    if (promises.length) {
      return Promise.all(promises)
    }
    return null
  })

async function updateOrdersStatus(document, finalStatus, promises) {
  const stopNum = document.stopNum
  if (!stopNum) {
    return
  }

  const stopData = document.stops.find((stop) => stop.num === stopNum)

  if (!stopData || !stopData.orders || !stopData.orders.length) {
    return
  }

  stopData.orders.forEach((orderId) => {
    const orderRef = db.collection('orders').doc(orderId)
    const updateOrder = orderRef.update({
      status: finalStatus,
    })
    promises.push(updateOrder)
  })
}

async function updateOrdersRInRoute(document, oldDocument, change) {
  const objToUpdate = {}

  let ordersR = document.ordersR
    ? JSON.parse(JSON.stringify(document.ordersR))
    : {}

  if (!compareArrays(document.orders, oldDocument.orders)) {
    let ordersToDelete = []
    let ordersToAdd = []

    if (!document.orders || !document.orders.length) {
      objToUpdate.ordersR = {}
    } else {
      ordersToDelete = Object.keys(ordersR).filter(
        (order) => !document.orders.includes(order)
      )
      ordersToAdd = document.orders.filter(
        (order) => !Object.keys(ordersR).includes(order)
      )
    }

    if (ordersToDelete.length) {
      ordersToDelete.forEach((order) => {
        if (ordersR[order]) {
          delete ordersR[order]
        }
      })
    }

    if (ordersToAdd.length) {
      const orderPromises = []

      ordersToAdd.forEach((order) => {
        const orderRef = db.collection('orders').doc(order)
        const orderData = orderRef
          .get()
          .then((doc) => ({ ...doc.data(), id: doc.id }))
        orderPromises.push(orderData)
      })
      const orders = await Promise.all(orderPromises)

      const taskPromises = []

      orders.forEach(async (order) => {
        ordersR[order.id] = {
          status: order.status,
          woNumber: order.woNumber,
          isReopen: order.isReopen || false,
        }

        const tasksItems = ['workToDos', 'inspections', 'allowables']

        tasksItems.forEach((taskItem) => {
          const taskRef = db.collection(`orders/${order.id}/${taskItem}`)
          const taskOnR = taskRef.get().then((querySnapshot) => {
            const tasks = []
            querySnapshot.forEach((doc) => {
              tasks.push({ ...doc.data(), id: doc.id, orderId: order.id })
            })
            ordersR[order.id][taskItem] = {}
            if (tasks.length > 0) {
              tasks.forEach((_task) => {
                ordersR[order.id][taskItem][_task.id] = {
                  status: _task.status,
                  title: _task.title,
                  started: _task.started || false,
                  ...(_task.position && { position: _task.position }),
                  ...(_task.ect && { ect: _task.ect }),
                }
              })
            }
          })

          taskPromises.push(taskOnR)
        })
      })

      await Promise.all(taskPromises)
    }

    if (
      !document.ordersR ||
      JSON.stringify(ordersR) !== JSON.stringify(document.ordersR)
    ) {
      objToUpdate.ordersR = ordersR
    }

    if (Object.keys(objToUpdate).length) {
      const updatedRoute = change.after.ref.update(objToUpdate)
      return updatedRoute
    }
    return null
  }
  return null
}

function compareArrays(a, b) {
  return (
    a.length === b.length && a.every((element, index) => element === b[index])
  )
}
