const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const { mapping } = require('../../../utils/mapping')
const { TASK_STATUS } = require('../../../utils/dictionary')
const db = admin.firestore()

exports.allowablesOnWrite = functions.firestore
  .document('orders/{orderId}/allowables/{allowableId}')
  .onWrite(async (change, context) => {
    const document = change.after.data()
    const oldDocument = change.before.data()
    const orderId = context.params.orderId
    const orderRef = db.doc(`orders/${orderId}`)

    const serverTime = new Date()
    const nyDate = serverTime.toLocaleString('en-US', {
      timeZone: 'America/New_York',
    })
    const nyTime = new Date(nyDate)

    const dateNYStr =
      nyTime.getFullYear().toString() +
      '-' +
      (nyTime.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      nyTime.getDate().toString().padStart(2, '0')

    const routesRef = db
      .collection('routes')
      .where('forDateStr', '==', dateNYStr)
      .where('orders', 'array-contains', orderId)

    const routesCountSnap = await routesRef.count().get()
    let routesSnap = null
    const hasRoutes = routesCountSnap.data().count > 0
    if (hasRoutes) {
      routesSnap = await routesRef.get()
    }
    const promises = []

    // eslint-disable-next-line
    console.log('hasRoutes', hasRoutes)

    if (!document) {
      const orderUpdated = orderRef.update({
        allowablesIds: admin.firestore.FieldValue.arrayRemove(
          context.params.allowableId
        ),
      })
      promises.push(orderUpdated)

      if (hasRoutes && routesSnap) {
        routesSnap.forEach((doc) => {
          if (!doc || !doc.exists) {
            return
          }
          const routeRef = doc.ref
          const data = doc.data()

          const ordersR = data.ordersR

          if (
            !ordersR ||
            !ordersR[orderId] ||
            !ordersR[orderId].allowables ||
            !ordersR[orderId].allowables[context.params.allowableId]
          ) {
            return
          }

          const routeUpdated = routeRef.update({
            [`ordersR.${orderId}.allowables.${context.params.allowableId}`]:
              admin.firestore.FieldValue.delete(),
          })
          promises.push(routeUpdated)
        })
      }

      return Promise.all(promises)
    }

    const user = document.updatedBy

    const objToSave = {
      user,
      updatedAt: document.updatedAt,
      changes: mapping({ allowables: oldDocument }, { allowables: document }),
    }

    const historyRef = db.collection(`orders/${orderId}/history`)

    const historyUpdatePromise = historyRef.add(objToSave)

    promises.push(historyUpdatePromise)

    if (!oldDocument) {
      // Update order
      const allowablesIdsUpdated = orderRef.update({
        allowablesIds: admin.firestore.FieldValue.arrayUnion(
          context.params.allowableId
        ),
      })

      promises.push(allowablesIdsUpdated)

      // Update routes
      if (hasRoutes && routesSnap) {
        routesSnap.forEach(async (doc) => {
          if (!doc || !doc.exists) {
            return
          }
          const routeRef = doc.ref
          const data = doc.data()

          const ordersR = data?.ordersR
          const objToUpdate = {}
          let orderData = null

          const commonObjUdate = {
            status: document.status,
            title: document.title,
            started: document.started || false,
            ...(document.taskApprovedAt && {
              taskApprovedAt: document.taskApprovedAt,
            }),
            ...(document.startedAt && { startedAt: document.startedAt }),
            ...(document.position && { position: document.position }),
            ...(document.ect && { ect: document.ect }),
          }

          if (!ordersR) {
            orderData = await orderRef
              .get()
              .then((doc) => (doc && doc.exists && doc.data()) || null)

            if (!orderData) {
              return
            }
            objToUpdate.ordersR = {
              [orderId]: {
                allowables: {
                  [context.params.allowableId]: commonObjUdate,
                },
              },
            }
          } else if (!ordersR[orderId]) {
            orderData = await orderRef
              .get()
              .then((doc) => (doc && doc.exists && doc.data()) || null)

            if (!orderData) {
              return
            }
            objToUpdate[`ordersR.${orderId}`] = {
              woNumber: orderData.woNumber,
              status: orderData.status || '',
              allowables: {
                [context.params.allowableId]: commonObjUdate,
              },
            }
          } else if (!ordersR[orderId].allowables) {
            objToUpdate[`ordersR.${orderId}.allowables`] = {
              [context.params.allowableId]: commonObjUdate,
            }
          } else {
            objToUpdate[
              `ordersR.${orderId}.allowables.${context.params.allowableId}`
            ] = commonObjUdate
          }

          const routeUpdated = routeRef.update(objToUpdate)
          promises.push(routeUpdated)
        })
      }
    }

    if (document && oldDocument) {
      // eslint-disable-next-line
      console.log('UPDATED')

      // Update

      // eslint-disable-next-line
      console.log('STATUS UPDATED')

      // Update Route
      if (
        hasRoutes &&
        routesSnap &&
        (document.status !== oldDocument.status ||
          document.started !== oldDocument.started ||
          !!document.taskApprovedAt !== !!oldDocument.taskApprovedAt ||
          document.title !== oldDocument.title ||
          document.position !== oldDocument.position ||
          document.ect !== oldDocument.ect)
      ) {
        routesSnap.forEach(async (doc) => {
          if (!doc || !doc.exists) {
            // eslint-disable-next-line
            console.log('ROUTE DOC NO EXISTS')

            return
          }
          const routeRef = doc.ref
          const data = doc.data()

          const ordersR = data.ordersR
          const objToUpdate = {}

          let orderData = null
          const commonObjUdate = {
            status: document.status,
            title: document.title,
            started: document.started || false,
            ...(document.taskApprovedAt && {
              taskApprovedAt: document.taskApprovedAt,
            }),
            ...(document.startedAt && { startedAt: document.startedAt }),
            ...(document.position && { position: document.position }),
            ...(document.ect && { ect: document.ect }),
          }

          // Update order status
          const orderStatusToUpdate = [
            ORDER_STATUS.accesingProperty.toLowerCase(),
            ORDER_STATUS.onRoute.toLowerCase(),
            ORDER_STATUS.assigned.toLowerCase(),
          ]

          if (!oldDocument.started && document.started) {
            orderData = await orderRef
              .get()
              .then((doc) => (doc && doc.exists && doc.data()) || null)

            if (!orderData) {
              return
            }

            if (
              orderData.generalStatus.toLowerCase() ===
                GENERAL_ORDER_STATUS.assigned.toLowerCase() &&
              orderStatusToUpdate.includes(orderData.status.toLowerCase())
            ) {
              const orderStatusUpdated = orderRef.update({
                status: ORDER_STATUS.performingWork,
              })
              promises.push(orderStatusUpdated)
            }
          }

          if (!ordersR) {
            if (!orderData) {
              orderData = await orderRef
                .get()
                .then((doc) => (doc && doc.exists && doc.data()) || null)
              if (!orderData) {
                return
              }
            }
            objToUpdate.ordersR = {
              [orderId]: {
                woNumber: orderData.woNumber,
                status: orderData.status || '',
                allowables: {
                  [context.params.allowableId]: commonObjUdate,
                },
              },
            }
          } else if (!ordersR[orderId]) {
            if (!orderData) {
              orderData = await orderRef
                .get()
                .then((doc) => (doc && doc.exists && doc.data()) || null)
              if (!orderData) {
                return
              }
            }
            objToUpdate[`ordersR.${orderId}`] = {
              woNumber: orderData.woNumber,
              status: orderData.status || '',
              allowables: {
                [context.params.allowableId]: commonObjUdate,
              },
            }
          } else if (!ordersR[orderId].allowables) {
            objToUpdate[`ordersR.${orderId}.allowables`] = {
              [context.params.allowableId]: commonObjUdate,
            }
          } else {
            objToUpdate[
              `ordersR.${orderId}.allowables.${context.params.allowableId}`
            ] = commonObjUdate
          }

          const routeUpdated = routeRef.update(objToUpdate)
          promises.push(routeUpdated)
        })
      }

      // Update Invoice
      if (document.status !== oldDocument.status) {
        const invoiceRef = db.doc(`orders/${orderId}/invoice/invoiceData`)
        const invoiceUpdated = db.runTransaction(async (transaction) => {
          const _invoice = await transaction.get(invoiceRef)
          const invoiceData = _invoice.data()

          if (document.status === TASK_STATUS.taskCompleted) {
            const itemsLocales = []
            let discount = 0

            if (_invoice.exists) {
              itemsLocales.push(...invoiceData.items)
              discount = invoiceData.discount || 0

              const itemsDelTask = document.itemsForInvoices

              itemsDelTask.forEach((item) => {
                const idx = itemsLocales
                  .map((o) => o.itemDescription.toLowerCase().trim())
                  .indexOf(item.title.toLowerCase().trim())

                if (idx !== -1) {
                  itemsLocales[idx].qty = qty + parseInt(item.qty)
                } else {
                  itemsLocales.push({
                    price: parseFloat(item.price),
                    itemDescription: item.title,
                    fee: false,
                    qty: parseInt(item.qty),
                  })
                }
              })
            } else {
              itemsLocales.push(
                ...document.itemsForInvoices.map((item) => ({
                  price: parseFloat(item.price),
                  itemDescription: item.title,
                  fee: false,
                  qty: parseInt(item.qty),
                }))
              )
            }
            const objectTosend = {
              items: itemsLocales,
              orderId,
              discount,
              updatedAt: document.updatedAt,
              updatedBy: document.updatedBy,
            }

            transaction.set(invoiceRef, objectTosend, { merge: true })
          }

          if (
            oldDocument.status === TASK_STATUS.taskCompleted &&
            document.status !== TASK_STATUS.taskCompleted &&
            _invoice.exists
          ) {
            const itemsLocales = invoiceData.items.filter((item) => {
              return !document.itemsForInvoices
                .map((i) => i.title.toLowerCase().trim())
                .includes(item.itemDescription.toLowerCase().trim())
            })

            const objectTosend = {
              items: itemsLocales,
              updatedAt: document.updatedAt,
              updatedBy: document.updatedBy,
            }
            transaction.update(invoiceRef, objectTosend)
          }
        })

        promises.push(invoiceUpdated)
      }
    }

    return Promise.all(promises)
  })
