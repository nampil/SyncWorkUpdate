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
  apiKey: 'AIzaSyDWd616s9Gg4A31zbn2MEw4F-69VIYQhWU',
  authDomain: 'daytona-system-dev.firebaseapp.com',
  projectId: 'daytona-system-dev',
  storageBucket: 'daytona-system-dev.appspot.com',
  messagingSenderId: '281912731287',
  appId: '1:281912731287:web:fb2ad7c6feadac3da62bd2',
  measurementId: 'G-EC4NYESSLX',
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
