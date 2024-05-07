import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/plugins/firebase'
export const state = () => ({
  title: '',
  drawer: false,
  needToSave: false,
  config: {
    homeLocation: { lat: 40.755664200841004, lng: -74.149279748704 },
  },
  categoryOptions: [],
  showLupa: false,
  lupaOptions: { url: '', position: null },
  mainLoading: false,
  clientsList: [],
  customersList: [],
  contractorsList: [],
  processorsList: [],
  showSendNotificationModal: false,
  orderStatusList: [],
})

export const getters = {}

export const mutations = {
  set_orderStatusList(state, payload) {
    state.orderStatusList = payload
  },

  setDrawer(state, payload) {
    state.drawer = payload
  },
  setTitle(state, payload) {
    state.title = payload
  },

  set_needToSave(state, payload) {
    state.needToSave = payload
  },
  set_categoryOptions(state, payload) {
    state.categoryOptions = payload
  },
  set_showLupa(state, payload) {
    state.showLupa = payload
  },
  set_lupaOptions(state, payload) {
    state.lupaOptions.url = payload.url
    state.lupaOptions.position = payload.position
  },
  set_mainLoading(state, payload) {
    state.mainLoading = payload
  },
  set_clientsList(state, payload) {
    state.clientsList = payload
  },
  set_customersList(state, payload) {
    state.customersList = payload
  },
  set_processorsList(state, payload) {
    state.processorsList = payload
  },
  set_contractorsList(state, payload) {
    state.contractorsList = payload
  },
  set_showSendNotificationModal(state, payload) {
    state.showSendNotificationModal = payload
  },
}

export const actions = {
  async get_orderStatusListActive({ commit }) {
    const q = query(
      collection(db, 'admin/config/orderStatus-templates'),
      where('active', '==', true)
    )
    const querySnapshot = await getDocs(q)
    const orderStatusList = []
    querySnapshot.forEach((doc) => {
      orderStatusList.push({
        ...doc.data(),
        id: doc.id,
      })
    })
    return orderStatusList
  },
  async get_orderStatusList({ commit }) {
    const q = query(collection(db, 'admin/config/orderStatus-templates'))
    const querySnapshot = await getDocs(q)
    const orderStatusList = []
    querySnapshot.forEach((doc) => {
      orderStatusList.push({
        ...doc.data(),
        id: doc.id,
      })
    })
    commit('set_orderStatusList', orderStatusList)
  },

  async get_contractors({ commit }) {
    const q = query(
      collection(db, 'users'),
      where('rol', '==', 'contractor'),
      where('archived', '==', false)
    )
    const querySnapshot = await getDocs(q)
    const contractorsList = []
    querySnapshot.forEach((doc) => {
      contractorsList.push({
        ...doc.data(),
      })
    })

    const _contractors = contractorsList
      .filter((c) => c)
      .sort((a, b) => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      })

    commit('set_contractorsList', _contractors)
    return _contractors
  },
  async get_adminUsers() {
    const q = query(
      collection(db, 'users'),
      where('rol', '==', 'admin'),
      where('archived', '==', false)
    )
    const querySnapshot = await getDocs(q)
    const adminUsersList = []
    querySnapshot.forEach((doc) => {
      adminUsersList.push({
        ...doc.data(),
      })
    })
    return adminUsersList
  },
  async get_processors({ commit }) {
    const q = query(
      collection(db, 'users'),
      where('departments', 'array-contains-any', ['Processors']),
      where('archived', '==', false)
    )
    const querySnapshot = await getDocs(q)
    const processorsList = []
    querySnapshot.forEach((doc) => {
      processorsList.push({
        ...doc.data(),
      })
    })

    const _processors = processorsList
      .filter((c) => c)
      .sort((a, b) => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      })

    commit('set_processorsList', _processors)

    return _processors
  },

  async get_clientsList({ commit }) {
    const _clientsList = []
    const q = query(collection(db, 'admin/config/clientsList'))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        _clientsList.push({
          ...doc.data(),
          id: doc.id,
        })
      })
    }
    commit('set_clientsList', _clientsList)
  },

  async get_customersList({ commit }) {
    const _clientsList = []
    const q = query(collection(db, 'admin/config/customers-templates'))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        _clientsList.push({
          ...doc.data(),
          id: doc.id,
        })
      })
    }
    commit('set_customersList', _clientsList)
  },

  async get_categoryOptions({ commit }) {
    const q = query(collection(db, 'admin/config/orderCategory-templates'))
    const querySnapshot = await getDocs(q)
    const _categoryOptions = []
    querySnapshot.forEach((doc) => {
      _categoryOptions.push({
        ...doc.data(),
        id: doc.id,
      })
    })
    commit('set_categoryOptions', _categoryOptions)
  },
  async get_jobNoteType() {
    const q = query(collection(db, 'admin/config/jobNoteType-templates'))
    const querySnapshot = await getDocs(q)
    const jobNoteTypesList = []
    querySnapshot.forEach((doc) => {
      jobNoteTypesList.push({
        ...doc.data(),
      })
    })
    return jobNoteTypesList
  },
}
