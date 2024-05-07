import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_ratingsByUserByDates(
  _,
  { userId, fromDate, toDate }
) {
  if (!userId) throw new Error('User id is required')
  let _fromDate, _toDate

  if (!fromDate) {
    const currentDay = new Date()

    _fromDate = new Date(new Date().setDate(currentDay.getDate() - 30))
  } else {
    _fromDate = fromDate
  }

  if (!toDate) {
    _toDate = new Date()
  } else {
    _toDate = toDate
  }

  try {
    const userRatingsRef = collection(db, `users/${userId}/ratings`)
    const queryContrains = []
    queryContrains.push(where('ratingAt', '>=', _fromDate))
    queryContrains.push(where('ratingAt', '<=', _toDate))

    const q = query(userRatingsRef, ...queryContrains)
    const snapshot = await getDocs(q)

    if (snapshot.empty) return []

    const ratings = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }))

    return ratings
  } catch (error) {
    throw new Error(error)
  }
}
