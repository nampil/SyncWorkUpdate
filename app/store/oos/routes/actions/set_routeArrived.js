import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function set_routeArrived({ rootState }, route) {
  const { tripStarted, stopNum, leadLocation } = route

  if (!tripStarted || !stopNum || !leadLocation) {
    return
  }

  const finalObjToSend = {
    tripStarted: false,
    arrivedAt: serverTimestamp(),
    [`onRouteR.${stopNum}.arrived`]: true,
    [`onRouteR.${stopNum}.arrivedBy`]: rootState.auth.user.profile.uid,
    [`onRouteR.${stopNum}.arrivedAt`]: serverTimestamp(),
    [`onRouteR.${stopNum}.arrivedLoc`]: leadLocation,
  }

  const routeRef = doc(db, 'routes', route.id)

  await updateDoc(routeRef, finalObjToSend)
}
