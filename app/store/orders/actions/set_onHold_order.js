import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function set_onHold_order({ rootState }, { orders, onHold }) {
  try {
    const batch = writeBatch(db)
    const user = rootState.auth.user.profile
    orders.forEach((order) => {
      const orderRef = doc(db, 'orders', order.id)

      batch.update(orderRef, {
        onHold,
        orderNew: !onHold,
        archive: false,
        updatedBy: user,
        updatedAt: serverTimestamp(),
      })
    })

    await batch.commit()
    return onHold
      ? this.$i18n.t('successSettedOn-hold')
      : this.$i18n.t('successRemovedOn-hold')
  } catch (error) {
    // eslint-disable-next-line
    console.log('error', error)

    throw error
  }
}
