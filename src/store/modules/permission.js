import { asyncRoutes, constantRoutes } from '@/router'
import request from '@/utils/request'
import api from '@/api/api'
import Layout from '@/layout'
import AppMainLayout from '@/layout/components/AppMain'
import PageLayout from '@/layout/components/page-layout'
const _import = require('@/router/_import_' + process.env.NODE_ENV)
import { localStorageOperation } from '@/utils/browser-storage'

const vueFileRoutes = []

/**
 * @description 过滤路由设置component
 * @param {*} asyncRouter 路由表
 */
export function filterAsyncRoutes(asyncRouter) {
  return asyncRouter.filter(route => {
    if (route.component) {
      if (route.component === 'Layout' || route.component === 'layout') {
        route.component = Layout
      } else if (route.component === 'AppMainLayout') {
        route.component = AppMainLayout
      } else if (route.component === 'PageLayout') {
        route.component = PageLayout
      } else {
        const routeComponent = route.component.substr(1)
        if (process.env.NODE_ENV === 'development') {
          route.component = (resolve) => require([`@/${routeComponent}.vue`], resolve)
        } else {
          route.component = _import(routeComponent)
        }
        vueFileRoutes.push(route.name)
      }
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRoutes(route.children)
    }
    return true
  })
}

const state = {
  routes: [], // 存储当前路由按钮权限
  addRoutes: [], // 存储路由权限
  vueFileRoutes: [], // 存在Vue文件的路由
  loginIndex: [], // 登录首页
  currentRoute: {} // 当前路由
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    routes.push({ path: '*', redirect: '/404', hidden: true }) // 最后加入404路由
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes) // 合并路由
    state.routes = routes
  },
  CLEAR_ROUTES: (state) => {
    state.addRoutes = []
  },
  SET_VUE_FILE_ROUTES: (state, routes) => {
    state.vueFileRoutes = routes
  },
  SET_LOGIN_INDEX: (state, data) => {
    state.loginIndex = data
  },
  SET_CURRENT_ROUTE: (state, data) => {
    state.currentRoute = data
  }
}

const actions = {
  // 根据用户角色获取菜单权限并且去重
  getSysRole({ commit }, data) {
    return new Promise((rs, rj) => {
      const role = localStorageOperation('get', 'role')
      const roleList = role.split(',')
      const roleSysMenuPermission = []
      let roleData = []
      request({
        url: api.sys.menuRoleData, data: { roleId: roleList, appId: data.appId, classify: 'pc', version: 1 }
      }).then(res => {
        if (res.code === 1) {
          roleData = res.data
          res.data.forEach(item => {
            roleSysMenuPermission.push(item.menuId)
          })
          const result = [...new Set(roleSysMenuPermission)] // 使用set集合去重后转换会数组类型
          rs({
            roleMenu: result,
            roleData
          })
        } else {
          rj()
        }
      }).catch(() => {
        rj()
      })
    })
  },
  // 获取系统菜单
  getSysMenu({ commit }, data) {
    return new Promise((resolve, reject) => {
      request({
        url: api.sysMenu.findSysMenu, data: {
          appId: data.appId,
          menuType: 'menu,button,unify',
          limit: -1,
          page: 1,
          classify: 'pc',
          version: 1
        }
      }).then(res => {
        if (res.code === 1) {
          const data = []
          res.data.forEach((item, index) => {
            const menuQuery = {}
            if (item.menuQuery !== undefined && item.menuQuery !== null && item.menuQuery !== '') {
              const parse = JSON.parse(item.menuQuery)
              parse.forEach(parseItem => {
                menuQuery[`${parseItem.queryName}`] = parseItem.queryValue
              })
            }

            const dataItem = {
              menuId: item.menuId,
              menuType: item.menuType,
              parentId: item.parentId,
              path: item.menuUrl,
              redirect: item.redirect,
              component: item.component,
              name: item.coding,
              meta: { title: item.menuName, noCache: true, unifyParams: item.unifyParams, menuQuery, menuId: item.menuId },
              hidden: item.status === 0,
              sort: item.sort
            }
            data.push(dataItem)
            Object.keys(dataItem).forEach(items => {
              if (dataItem[items] === '') delete dataItem[items]
            })
          })
          resolve(data)
        } else {
          reject(res.msg)
        }
      }).catch(() => {
        reject()
      })
    })
  },
  // 生成路由
  async generateRoutes({ commit }, data) {
    let loginIndex = []
    if (state.loginIndex.length > 0) { // 非登录时存储了首页配置信息到vuex
      loginIndex = state.loginIndex
    } else { // 刷新情况下 不会存首页配置在vuex
      const userInfoStorage = localStorageOperation('get', 'userInfo') // 获取用户登录信息
      const { code, data } = await request({
        url: api.hyitIndex.findHyitIndex,
        data: { appId: userInfoStorage.appId, companyId: userInfoStorage.companyId, limit: -1, indexType: 1 }
      })
      if (code === 1 && data) loginIndex = data
    }
    let redirectPath = ''
    if (loginIndex.length > 0) {
      const completeIndexRedirectPathResult = completeIndexRedirectPath(data.rawMenu, loginIndex[0].indexMenuId).reverse()
      completeIndexRedirectPathResult.forEach(item => {
        redirectPath += `/${item.path}`
      })
    }
    return new Promise(resolve => {
      const asyncRouterMap = filterAsyncRoutes(data.roleMenuScreenResult)
      commit('SET_VUE_FILE_ROUTES', vueFileRoutes)
      const firstRoute = asyncRouterMap[0]
      firstRoute.meta.breadcrumb = false
      firstRoute.redirect = redirectPath.length > 0 ? redirectPath.slice(1) : `${firstRoute.path}/${firstRoute.children[0].path}`
      asyncRouterMap.splice(0, 0, {
        path: '/',
        component: Layout,
        redirect: `${firstRoute.path}`
      })
      commit('SET_ROUTES', asyncRouterMap)
      resolve()
    })
  },
  // 初始化路由
  initRoutes({ commit }) {
    return new Promise(resolve => {
      commit('SET_ROUTES', asyncRoutes)
      resolve(asyncRoutes)
    })
  },
  // 清除路由
  clearRoutes({ commit }) {
    return new Promise(resolve => {
      commit('CLEAR_ROUTES')
      resolve(true)
    })
  },
  // 设置登录首页
  setLoginInex({ commit }, data) {
    commit('SET_LOGIN_INDEX', data)
  },
  // 获取出动态路由
  getRoutes() {
    return new Promise(resolve => {
      resolve(state.addRoutes)
    })
  },
  // 设置当前路由
  setCurrentRoute({ commit }, data) {
    commit('SET_CURRENT_ROUTE', data)
  }
}

// 根据某个具体的组件去遍历查出上级菜单地址，拼接完整的跳转地址
const dataItemArr = []
function completeIndexRedirectPath(data, id) {
  for (var i = 0; i < data.length; i++) {
    if (Number(data[i].menuId) === Number(id)) {
      dataItemArr.push(data[i])
      completeIndexRedirectPath(data, data[i].parentId)
    }
  }
  return dataItemArr
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
