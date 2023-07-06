const state = {
  areaId: '',
  reportId: ''
}

const mutations = {
  SET_AREA_ID: (state, areaId) => {
    state.areaId = areaId
  },
  SET_REPORTID: (state, reportId) => {
    state.reportId = reportId
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
