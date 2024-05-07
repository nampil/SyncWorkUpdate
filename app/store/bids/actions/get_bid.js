import { doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_bid({ commit, state }, { orderId, bidsFlagged }) {
  if (!bidsFlagged || bidsFlagged.length === 0) return
  const bidsIdsInState = state.bids.map((b) => b.id)
  const bidsIdsToAdd = bidsFlagged.filter((id) => !bidsIdsInState.includes(id))

  if (bidsIdsToAdd.length === 0) return
  const bidsPromises = []

  for (let i = 0; i < bidsIdsToAdd.length; i++) {
    const bidsId = bidsFlagged[i]
    const bidRef = doc(db, `orders/${orderId}/bids`, bidsId)
    bidsPromises.push(getDoc(bidRef))
  }

  const results = await Promise.all(bidsPromises)

  if (!results.length) return
  results.forEach((doc) => {
    const bid = { ...doc.data(), id: doc.id }
    commit('add_bid', bid)
  })
}
