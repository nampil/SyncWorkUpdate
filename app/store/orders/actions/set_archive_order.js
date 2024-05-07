import { doc, writeBatch, serverTimestamp } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

export async function set_archive_order({ rootState }, { orders, archive }) {
  try {
    const batch = writeBatch(db)
    const user = rootState.auth.user.profile

    orders.forEach((order) => {
      const orderRef = doc(db, 'orders', order.id)

      batch.update(orderRef, {
        archive,
        status: 'Inactive',
        orderNew: !archive,
        onHold: false,
        updatedBy: user,
        updatedAt: serverTimestamp(),
        contractors: [],
        contractorsUids: [],
      })
    })

    await batch.commit()

    return archive
      ? this.$i18n.t('successOrdenArchived')
      : this.$i18n.t('successOrdenUnarchived')
  } catch (error) {
    // eslint-disable-next-line
    console.log('error', error)

    throw error
  }
}
