import { getToken, setToken, removeToken, getUserInfo, removeUserInfo } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  userInfo: getUserInfo()
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
  }
}

const actions = {
  // user login
  login({ commit, dispatch }, userInfo) {
    // const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      // login({ username: username.trim(), password: password }).then(async response => {
      //   console.log('登录返回信息', JSON.stringify(response))
      //   commit('SET_TOKEN', response.map.token)
      //   setToken(response.map.token)
      //   const info = {
      //     map: response.map,
      //     model: response.model
      //   }
      //   commit('SET_USER_INFO', info)
      //   setUserInfo(info) // 因为缺少获取当前用户信息接口，故登录的时候缓存一份
      //   resolve()
      // }).catch(error => {
      //   reject(error)
      // })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.userInfo) {
        // getInfo({ userId: state.userInfo.model.userId }).then(response => {
        //   const { model } = response
        //   if (!model) {
        //     reject('认证失败，请重新登录!')
        //   }
        //   const info = {
        //     map: state.userInfo.map,
        //     model: model
        //   }
        //   commit('SET_ROLES', [info.map.role.roleType])
        //   commit('SET_NAME', info.model.realName)
        //   commit('SET_AVATAR', info.model.imageUrl || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
        //   commit('SET_INTRODUCTION', info.model.userName)
        //   commit('SET_USER_INFO', info)
        //   resolve(info)
        // }).catch(error => {
        //   reject(error)
        // })
      } else {
        reject('认证失败，请重新登录!')
      }
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      // logout({}).then(() => {
      //   commit('SET_TOKEN', '')
      //   commit('SET_ROLES', [])
      //   commit('SET_USER_INFO', null)
      //   removeToken()
      //   resetRouter()
      //   removeUserInfo()
      //
      //   // reset visited views and cached views
      //   // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
      //   dispatch('tagsView/delAllViews', null, { root: true })
      //
      //   resolve()
      // }).catch(error => {
      //   reject(error)
      // })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_USER_INFO', null)
      removeToken()
      resolve()
      removeUserInfo()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  },

  setPageRoles({ commit }, roles) {
    return new Promise(resolve => {
      commit('SET_ROLES', roles)
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
