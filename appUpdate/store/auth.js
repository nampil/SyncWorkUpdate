import { collection, doc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useDocument } from 'vuefire'

export const useAuthStore = defineStore('auth', () => {
  const auth = useFirebaseAuth()
  const db = useFirestore()

  const userRecord = ref(null)

  const userProfileRef = computed(() => {
    return (
      userRecord.value && doc(collection(db, 'users'), userRecord.value?.uid)
    )
  })
  const userPreferencesRef = computed(() => {
    return (
      userRecord.value &&
      doc(
        collection(db, `users/${userRecord.value.uid}/preferences`),
        'userPreferences'
      )
    )
  })

  // const userProfile = useDocument(userProfileRef)
  const userProfile = useDocument(userProfileRef)
  const userPreferences = useDocument(userPreferencesRef)

  const getUser = async () => {
    // eslint-disable-next-line
    console.log('Get User')

    const user = await getCurrentUser()
    if (!user) return null
    userRecord.value = user
    return user
  }

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
    await getUser()
  }
  const logout = async () => {
    await auth.signOut()
    userProfile.value = null
    userRecord.value = null
    userPreferences.value = null
  }

  return { userProfile, userRecord, userPreferences, getUser, logout, login }
})
