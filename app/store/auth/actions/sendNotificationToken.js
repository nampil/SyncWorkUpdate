import { arrayUnion, doc, setDoc } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export async function sendNotificationToken(_, token) {
  const user = auth.currentUser

  const tokenListRef = doc(db, `users/${user.uid}/subscriptions/tokenList`)

  const res = await setDoc(
    tokenListRef,
    {
      tokens: arrayUnion(token),
    },
    { merge: true }
  )

  return res
}
