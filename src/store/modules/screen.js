/**
 * @description screen.js
 * @author linhaojia
 * @date 2022/11/22 11:25:34
 */

const state = {
  // 拓扑大屏当前拓扑
  currentTopoInfo: {},
  currentTopoMapCombos: [],
  currentTopoMapEdges: [],
  currentTopoMapNodes: [],
  topoRightPaneHeight: '',
  // it大屏
  alarmPaneHeight: '',
  alarmEchartHeight: '',
  alarmCountHeight: ''
}

const mutations = {
  SET_STATE(state, payload) {
    state[`${payload.stateName}`] = payload.stateData
  }
}

const actions = {
  setState({ commit }, payload) {
    commit('SET_STATE', payload)
  },
  getState({ commit }, payload) {
    return state[`${payload.stateName}`]
  },
  getNodeHostIds() {
    const hostIds = []
    state.currentTopoMapNodes.forEach(item => {
      hostIds.push(item.hostId)
    })
    return hostIds
  },
  getNodeZHostIds() {
    const hostIds = []
    state.currentTopoMapNodes.forEach(item => {
      hostIds.push(item.zhostId)
    })
    return hostIds
  },
  getAlarmHeightSize() {
    return state.alarmPaneHeight - state.alarmCountHeight - state.alarmEchartHeight - (30 + 30)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
