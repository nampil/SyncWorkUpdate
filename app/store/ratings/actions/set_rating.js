import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function set_rating(
  { rootState, commit },
  {
    ratingId,
    rating,
    reqId,
    taskId,
    orderId,
    taskType,
    contractorUid,
    processTime,
  }
) {
  const user = rootState.auth.user.profile

  let userRatingsRef = null
  let action = ''
  if (ratingId) {
    userRatingsRef = doc(db, `users/${contractorUid}/ratings/${ratingId}`)
    action = 'edit_rating'
  } else {
    userRatingsRef = doc(collection(db, `users/${contractorUid}/ratings`))
    action = 'add_rating'
  }

  const objectToSend = {
    rating,
    reqId,
    taskId,
    taskType,
    orderId,
    processTime,
    ratingBy: user.uid,
    ratingAt: serverTimestamp(),
  }

  await setDoc(userRatingsRef, objectToSend, { merge: true })
  commit(action, {
    ...objectToSend,
    id: userRatingsRef.id,
  })
}
