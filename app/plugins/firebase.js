import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// eslint-disable-next-line
import {
  getFirestore,
  // connectFirestoreEmulator,
  // initializeFirestore,
} from 'firebase/firestore'
// eslint-disable-next-line
import { getAuth, connectAuthEmulator, onAuthStateChanged } from 'firebase/auth'
// eslint-disable-next-line
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
// eslint-disable-next-line
import { getStorage, ref, connectStorageEmulator } from 'firebase/storage'
// eslint-disable-next-line
// import { getMessaging, onMessage, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.FB_APYKEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID,
  measurementId: process.env.FB_MEASUREMENT_ID,
}

// eslint-disable-next-line

// Initialize Firebase
let firebaseApp

const apps = getApps()
if (!apps.length) {
  firebaseApp = initializeApp(firebaseConfig)
} else {
  firebaseApp = apps[0]
}
// eslint-disable-next-line
console.log('firebase init')

const db = getFirestore(firebaseApp)
const analytics = getAnalytics(firebaseApp)
const auth = getAuth(firebaseApp)
const functions = getFunctions(firebaseApp)
const storage = getStorage(firebaseApp, 'gs://daytona-system-main')
const storageReports = getStorage(firebaseApp)

// eslint-disable-next-line
// if (process.env.NODE_ENV === 'development') {
// connectStorageEmulator(storage, 'localhost', 9199)
// connectFirestoreEmulator(db, 'localhost', 8080)
// connectFunctionsEmulator(functions, 'localhost', 5001)
// connectAuthEmulator(auth, 'http://localhost:9099')
// }

export { db, analytics, auth, functions, storage, storageReports }
