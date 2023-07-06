const state = {
  bpmnModelInfo: {}
}

const mutations = {
  SET_BPMN_MODEL_INFO: (state, info) => {
    state.bpmnModelInfo = info
  }
}

const actions = {
  setBpmnModelInfo({ commit }, info) {
    commit('SET_BPMN_MODEL_INFO', info)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
