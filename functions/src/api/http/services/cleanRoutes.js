// The Cloud Functions for Firebase SDK to set up triggers and logging.
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { logger } = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const db = admin.firestore()

// The es6-promise-pool to limit the concurrency of promises.
const PromisePool = require('es6-promise-pool')
// Maximum concurrent account deletions.
const MAX_CONCURRENT = 3

// Run once a day at midnight, to clean up the users
// Manually run the task here https://console.cloud.google.com/cloudscheduler
exports.cleanRoutes = onSchedule(
  {
    schedule: 'every day 02:00',
    timeZone: 'America/New_York',
    maxInstances: 10,
  },
  async (event) => {
    const routesToDeactive = await getRoutesToDeactivate()

    const promisePool = new PromisePool(
      () => deactiveRoutes(routesToDeactive),
      MAX_CONCURRENT
    )
    await promisePool.start()

    logger.log('Routes cleanup finished')
  }
)

async function getRoutesToDeactivate() {
  const currentDate = new Date()
  let yesterday = new Date(currentDate)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDateStr = yesterday.toISOString().split('T')[0]
  const todayDateStr = currentDate.toISOString().split('T')[0]

  const routesRef = db.collection('routes')

  const routesQuery = routesRef
    .where('active', '==', true)
    .where('forDateStr', '==', yesterdayDateStr)

  return routesQuery.get().then((querySnapshot) => {
    const routes = []
    querySnapshot.forEach((doc) => {
      routes.push({
        id: doc.id,
        ...doc.data(),
      })
    })
    return routes
  })
}

function deactiveRoutes(routesToDeactive) {
  if (routesToDeactive.length > 0) {
    const routeToDeactive = routesToDeactive.pop()

    return db
      .collection('routes')
      .doc(routeToDeactive.id)
      .update({
        active: false,
      })
      .then(() => {
        return logger.log(`Route ${routeToDeactive.id} deactivated`)
      })
      .catch((error) => {
        return logger.error(
          'Route deactivation',
          routeToDeactive.id,
          'failed:',
          error
        )
      })
  } else {
    return null
  }
}
