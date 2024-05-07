const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const db = admin.firestore()

exports.ratingsOnWritte = functions.firestore
  .document('users/{userId}/ratings/{ratingId}')
  .onWrite((change, context) => {
    // Created
    if (!change.before.exists) {
      const data = change.after.data()
      return setTotalsRatings(data.rating)
    }

    // Updated
    if (change.before.exists && change.after.exists) {
      const data = change.after.data()
      const previousData = change.before.data()

      // Check if the rating has changed
      if (
        data.rating.time === previousData.rating.time &&
        data.rating.performance === previousData.rating.performance &&
        data.rating.quality === previousData.rating.quality
      ) {
        return null
      }

      return setTotalsRatings(data.rating, previousData.rating)
    }

    // Deleted
    if (!change.after.exists) {
      return null
    }

    async function setTotalsRatings(newRating, oldRating) {
      const ratingsStatsRef = db.doc(
        `users/${context.params.userId}/admin/ratingsStats`
      )
      const ratingsStatsDoc = await ratingsStatsRef.get()

      if (!ratingsStatsDoc.exists) {
        return ratingsStatsRef.set({
          time: newRating.time,
          performance: newRating.performance,
          quality: newRating.quality,
          totalRatings: 1,
        })
      }

      const ratingsStats = ratingsStatsDoc.data()

      const currentTotalRatings = ratingsStats.totalRatings

      const currTotalTime = ratingsStats.time * currentTotalRatings
      const currTotalPerformance =
        ratingsStats.performance * currentTotalRatings
      const currTotalQuality = ratingsStats.quality * currentTotalRatings
      let updatedTime = 0
      let updatedPerformance = 0
      let updatedQuality = 0
      let updatedTotalRatings = 0

      if (oldRating) {
        // Update totals

        let oldTotalTime = currTotalTime - oldRating.time
        let oldTotalPerformance = currTotalPerformance - oldRating.performance
        let oldTotalQuality = currTotalQuality - oldRating.quality

        updatedTime = (oldTotalTime + newRating.time) / currentTotalRatings
        updatedPerformance =
          (oldTotalPerformance + newRating.performance) / currentTotalRatings
        updatedQuality =
          (oldTotalQuality + newRating.quality) / currentTotalRatings
        updatedTotalRatings = currentTotalRatings
      } else {
        // Calculate new totals

        updatedTime =
          (currTotalTime + newRating.time) / (currentTotalRatings + 1)
        updatedPerformance =
          (currTotalPerformance + newRating.performance) /
          (currentTotalRatings + 1)
        updatedQuality =
          (currTotalQuality + newRating.quality) / (currentTotalRatings + 1)
        updatedTotalRatings = currentTotalRatings + 1
      }

      const updatedRatingsStats = {
        time: updatedTime,
        performance: updatedPerformance,
        quality: updatedQuality,
        totalRatings: updatedTotalRatings,
      }
      return ratingsStatsRef.set(updatedRatingsStats)
    }
  })
