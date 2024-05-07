const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const { mapping } = require('../../../utils/mapping')
const { object } = require('firebase-functions/v1/storage')
const {
  GENERAL_ORDER_STATUS,
  ORDER_STATUS,
} = require('../../../utils/dictionary')

const db = admin.firestore()

exports.inspectionsOnWrite = functions.firestore
  .document('orders/{orderId}/inspections/{inspectionId}')
  .onWrite(async (change, context) => {
    const document = change.after.data()
    const oldDocument = change.before.data()
    const orderId = context.params.orderId
    const orderRef = db.doc(`orders/${orderId}`)
    const promises = []

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
    const hasRoutes = routesCountSnap.data().count > 0
    let routesSnap = null
    if (hasRoutes) {
      routesSnap = await routesRef.get()
    }

    if (!document) {
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
            !ordersR[orderId].inspections ||
            !ordersR[orderId].inspections[context.params.inspectionId]
          ) {
            return
          }

          const routeUpdated = routeRef.update({
            [`ordersR.${orderId}.inspections.${context.params.inspectionId}`]:
              admin.firestore.FieldValue.delete(),
          })
          promises.push(routeUpdated)
        })
      }

      if (promises.length) {
        return Promise.all(promises)
      } else {
        return null
      }
    }

    if (!oldDocument) {
      // On Created

      // Update Route
      if (hasRoutes && routesSnap) {
        routesSnap.forEach(async (doc) => {
          if (!doc || !doc.exists) {
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
                inspections: {
                  [context.params.inspectionId]: commonObjUdate,
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
              inspections: {
                [context.params.inspectionId]: commonObjUdate,
              },
            }
          } else if (!ordersR[orderId].inspections) {
            objToUpdate[`ordersR.${orderId}.inspections`] = {
              [context.params.inspectionId]: commonObjUdate,
            }
          } else {
            objToUpdate[
              `ordersR.${orderId}.inspections.${context.params.inspectionId}`
            ] = commonObjUdate
          }
          const routeUpdated = routeRef.update(objToUpdate)
          promises.push(routeUpdated)
        })
      }
    }

    if (document && oldDocument) {
      // On Updated

      if (hasRoutes && routesSnap) {
        let objToUpdateOrdersR = {}

        if (
          JSON.stringify(document.contractorCompletedByArea) !==
          JSON.stringify(oldDocument.contractorCompletedByArea)
        ) {
          objToUpdateOrdersR[
            `ordersR.${orderId}.inspections.${context.params.inspectionId}.contractorCompletedByArea`
          ] = document.contractorCompletedByArea
        }

        if (
          JSON.stringify(document.reportsApprovedByArea) !==
          JSON.stringify(oldDocument.reportsApprovedByArea)
        ) {
          objToUpdateOrdersR[
            `ordersR.${orderId}.inspections.${context.params.inspectionId}.reportsApprovedByArea`
          ] = document.reportsApprovedByArea
        }

        if (document.status !== oldDocument.status) {
          // Update route
          objToUpdateOrdersR[
            `ordersR.${orderId}.inspections.${context.params.inspectionId}.status`
          ] = document.status
        }

        if (document.title !== oldDocument.title) {
          // Update route
          objToUpdateOrdersR[
            `ordersR.${orderId}.inspections.${context.params.inspectionId}.title`
          ] = document.title
        }

        if (document.started !== oldDocument.started) {
          objToUpdateOrdersR[
            `ordersR.${orderId}.inspections.${context.params.inspectionId}.started`
          ] = document.started || false
        }

        if (!!document.taskApprovedAt !== !!oldDocument.taskApprovedAt) {
          objToUpdateOrdersR[
            `ordersR.${orderId}.inspections.${context.params.inspectionId}.taskApprovedAt`
          ] = document.taskApprovedAt
        }

        if (
          document.startedAt &&
          !!document.startedAt !== !!oldDocument.startedAt
        ) {
          objToUpdateOrdersR[
            `ordersR.${orderId}.inspections.${context.params.inspectionId}.startedAt`
          ] = document.startedAt
        }
        if (document.position && document.position !== oldDocument.position) {
          objToUpdateOrdersR[
            `ordersR.${orderId}.inspections.${context.params.inspectionId}.position`
          ] = document.position
        }
        if (
          document.ect &&
          JSON.stringify(document.ect) !== JSON.stringify(oldDocument.ect)
        ) {
          objToUpdateOrdersR[
            `ordersR.${orderId}.inspections.${context.params.inspectionId}.ect`
          ] = document.ect
        }

        if (Object.keys(objToUpdateOrdersR).length) {
          routesSnap.forEach(async (doc) => {
            if (!doc || !doc.exists) {
              return
            }
            const routeRef = doc.ref

            const routeUpdated = routeRef.update(objToUpdateOrdersR)
            promises.push(routeUpdated)
          })
        }
      }
    }

    // Update Order History
    const user = document.updatedBy
    const objToSave = {
      user,
      updatedAt: document.updatedAt,
      changes: mapping({ inspections: oldDocument }, { inspections: document }),
    }

    const historyRef = db.collection(`orders/${orderId}/history`)

    const updatedHistory = historyRef.add(objToSave)
    promises.push(updatedHistory)

    if (!promises.length) {
      return null
    } else {
      return Promise.all(promises)
    }
  })
