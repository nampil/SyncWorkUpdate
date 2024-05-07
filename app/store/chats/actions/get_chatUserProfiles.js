import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export async function get_chatUserProfiles({ commit }, subscribers) {
  const user = auth.currentUser
  const profiles = []

  for (let index = 0; index < subscribers.length; index++) {
    const userUid = subscribers[index]
    if (userUid !== user.uid) {
      const chatUserProfileRef = doc(db, `users/${userUid}`)
      await getDoc(chatUserProfileRef).then((doc) => {
        if (doc.exists) {
          profiles.push({
            ...doc.data(),
            uid: doc.id,
          })

          // commit('set_userProfileInChatRoom', {
          //   chatRoomId: chatRoom.id,
          //   userProfile: {
          //     ...doc.data(),
          //     uid: doc.id,
          //   },
          // })
        }
      })
    }
  }
  return profiles
}
