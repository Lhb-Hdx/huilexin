import Cookies from 'js-cookie'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium',
  pageTableQuery: {},
  systemInfo: {},
  systemWs: '',
  wsStatus: 2 // 0 失败 1 成功 2 等待
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  SET_TABLE_QUERY: (state, query) => {
    console.log(query)
    state.pageTableQuery = query
  },
  SET_SYSTEM_INFO(state, playload) {
    state.systemInfo = playload
  },
  SET_WS(state, playload) {
    state.systemWs = playload
  },
  SET_WS_STATUS(state, playload) {
    state.wsStatus = playload
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  setTableQuery({ commit }, query) {
    commit('SET_TABLE_QUERY', query)
  },
  setSystemInfo({ commit }, playload) {
    commit('SET_SYSTEM_INFO', playload)
  },
  setSysWs({ commit }, playload) {
    commit('SET_WS', playload)
  },
  setWsStatus({ commit }, playload) {
    commit('SET_WS_STATUS', playload)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
