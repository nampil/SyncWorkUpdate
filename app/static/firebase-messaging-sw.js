importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js')

const firebaseConfig = {
  apiKey: 'AIzaSyDWd616s9Gg4A31zbn2MEw4F-69VIYQhWU',
  authDomain: 'daytona-system-dev.firebaseapp.com',
  projectId: 'daytona-system-dev',
  storageBucket: 'daytona-system-dev.appspot.com',
  messagingSenderId: '281912731287',
  appId: '1:281912731287:web:fb2ad7c6feadac3da62bd2',
  measurementId: 'G-EC4NYESSLX',
}
firebase.initializeApp(firebaseConfig)

if (firebase.messaging.isSupported()) {
  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message ',
      payload
    )
    // Customize notification here
    const notificationTitle = payload.notification.title
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon,
    }
    const nav = new URL(self.location.origin + (payload.data.link || '')).href

    // eslint-disable-next-line
    console.log('nav: ', nav)

    self.registration.showNotification(notificationTitle, notificationOptions)
    self.addEventListener('notificationclick', (event) => {
      event.notification.close()

      // This looks to see if the current is already open and
      // focuses if it is
      event.waitUntil(
        clients
          .matchAll({
            type: 'window',
          })
          .then((clientList) => {
            for (const client of clientList) {
              if (client.url === nav && 'focus' in client) return client.focus()
            }
            if (clients.openWindow) return clients.openWindow(nav)
          })
      )
    })
  })
}
