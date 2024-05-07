import { collection, query, getDocs, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '~/plugins/firebase'

export async function get_users({ commit }) {
  // llamar a la functions get_usersList( Api )
  commit('set_usersTemplates', [])
  const getUsersList = httpsCallable(functions, 'getUsersList')
  const usersCredencial = await getUsersList() //  Esto de vuelve un array con un objeto por cada user
  const datosUsers = []
  const q = query(collection(db, `users`), where('archived', '!=', true))
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    datosUsers.push({
      ...doc.data(),
      id: doc.id,
    })
  })

  for (let i = 0; i < datosUsers.length; i++) {
    const datosUser = datosUsers[i]
    // FindIndex es un metodo para los array que encuentra un index del primer elimento de la condicion
    const index = usersCredencial.data.findIndex(
      (userCredencial) => userCredencial.uid === datosUser.uid
    )
    if (index > -1) {
      datosUser.customClaims = usersCredencial.data[index].customClaims
    }
    commit('add_userTemplate', datosUser)
  }
  return datosUsers
}
