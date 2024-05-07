import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function set_routeCancelled({ rootState }, route) {
  const { tripStarted, stopNum, leadLocation } = route

  if (!tripStarted || !stopNum || !leadLocation) {
    return
  }

  const finalObjToSend = {
    tripStarted: false,
    arrivedAt: serverTimestamp(),
    [`onRouteR.${stopNum}.cancelled`]: true,
    [`onRouteR.${stopNum}.cancelledBy`]: rootState.auth.user.profile.uid,
    [`onRouteR.${stopNum}.cancelledAt`]: serverTimestamp(),
  }

  const routeRef = doc(db, 'routes', route.id)

  await updateDoc(routeRef, finalObjToSend)
}
