import { collectionGroup, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_bidsProperty({ dispatch }, { propertyId, orderId }) {
  try {
    const bidsRef = collectionGroup(db, 'bids')
    const queryContrains = []
    const bids = []
    queryContrains.push(where('orderId', '!=', orderId))
    queryContrains.push(where('propertyId', '==', propertyId))

    const q = query(bidsRef, ...queryContrains)
    const snapshot = await getDocs(q)

    if (snapshot.empty) return []

    for (let i = 0; i < snapshot.docs.length; i++) {
      const _doc = snapshot.docs[i]
      const reports = await dispatch('get_reportsBid', {
        orderId: _doc.data().orderId,
        bidId: _doc.id,
      })

      bids.push({ ..._doc.data(), id: _doc.id, reports })
    }

    return bids
  } catch (error) {
    throw new Error(error)
  }
}
