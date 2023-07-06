import router from './router'
import store from './store'
import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css' // 进度条样式
import { Message } from 'element-ui'
import { localStorageOperation, sessionStorageOperation } from '@/utils/browser-storage'
import { cleanLoginLocalStorage } from '@/utils/auth'
import request from '@/utils/request'
import api from '@/api/api'
import { wsLogin, wsHeat } from '@/api/common-ws-require'
import { setBrowserTitle } from '@/utils/utils'

NProgress.configure({ showSpinner: false }) // 进度条配置

const whiteList = ['/login', '/auth-redirect', '/authorization', '/unify-link'] // 路由白名单

/**
 * @description 生成路由配置格式
 * @param list
 * @returns {*[]}
 */
const generateMenu = function(list) {
  const treeData = []
  const map = {}
  list.forEach(function(item) {
    if (item.parentId > 0) {
      map[item.menuId] = item
    }
  })
  list.forEach(function(item) {
    const parent = map[item.parentId] // 获取父级
    if (parent) { // 存在父级
      if (item.menuType === 'menu') { // 填充子菜单
        (parent.children || (parent.children = [])).push(item)
      }
      if (item.menuType === 'button') { // 填充菜单按钮权限
        (parent.meta.roles || (parent.meta.roles = [])).push(item.name)
      }
    } else { // 不存在父级
      if (item.parentId === 1) {
        treeData.push(map[item.menuId])
      }
    }
  })
  console.log(treeData)
  return treeData
}

/**
 * @description 根据角色菜单权限表匹配系统菜单表
 * @param roleMenu 角色菜单权限表
 * @param sysMenu 系统菜单表
 * @returns {*[]}
 */
const roleMenuScreen = function(roleMenu, sysMenu) {
  const userRoleMenu = []
  roleMenu.forEach((item) => {
    sysMenu.forEach((element) => {
      if (item === element.menuId) {
        userRoleMenu.push(element)
      }
    })
  })
  return userRoleMenu
}

/**
 * @description 根据最外层的字段排序
 * @param property
 * @returns {function(*, *)}
 */
const compareRouter = function(property) {
  return function(a, b) {
    const value1 = a[property]
    const value2 = b[property]
    return value1 - value2
  }
}

router.beforeEach((to, from, next) => {
  store.dispatch('permission/setCurrentRoute', to)

  // 启动进度条
  NProgress.start()

  // 设置页面标题
  // document.title = getPageTitle(to.meta.title)
  localStorageOperation('set', 'metaTitle', to.meta.title)
  setBrowserTitle()

  const loginToken = localStorageOperation('get', 'loginToken') // 获取登录token
  const userInfoStorage = localStorageOperation('get', 'userInfo') // 获取用户登录信息

  if (loginToken) {
    const userInfo = userInfoStorage

    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      if (store.getters.addRouters.length === 0) {
        store.dispatch('permission/getSysRole', userInfo).then(async getSysRoleResult => { // 获取角色权限
          if (getSysRoleResult.roleMenu.length === 0) { // 判断没有授权菜单
            sessionStorageOperation('cleanAll')
            cleanLoginLocalStorage()
            NProgress.done()
            Message({
              message: '未查询到您的分配的角色功能',
              type: 'warning'
            })
          } else {
            store.dispatch('permission/getSysMenu', userInfo).then(menu => { // 获取当前应用的菜单
              const roleMenuScreenResult = roleMenuScreen(getSysRoleResult.roleMenu, menu).sort(compareRouter('sort'))
              store.dispatch('permission/generateRoutes', { roleMenuScreenResult: generateMenu(roleMenuScreenResult), rawMenu: roleMenuScreenResult }).then(() => { // 匹配出当前角色在应用中的菜单路由权限后生成菜单
                const addRoutersConfig = store.getters.addRouters
                getSysRoleResult.roleData.forEach(ritem => {
                  if (ritem.layout === 2) { // 横向布局
                    const idx = addRoutersConfig.findIndex(aitem => aitem.menuId === ritem.menuId)
                    const routerItem = addRoutersConfig[idx]
                    const routerItemChildrenArr = addRoutersConfig[idx].children
                    const routerItemArr = []
                    if (idx !== -1) {
                      routerItemChildrenArr.forEach((citem) => {
                        routerItem.path = `/${citem.path}`
                        routerItem.redirect = `/${citem.path}`
                        routerItem.children = [citem]
                        routerItem.meta = { ...citem.meta }
                        routerItem.meta.title = ''
                        routerItem.children[0].path = ''
                        routerItemArr.push({ ...routerItem })
                      })
                    }
                    addRoutersConfig.splice(idx, 1) // 删除
                    addRoutersConfig.splice(idx, 0, ...routerItemArr) // 再替换
                  }
                })
                const addRoutesData = store.getters.addRouters
                addRoutesData[0].redirect = addRoutesData[1].path
                router.addRoutes(addRoutesData) // 添加到动态路由
                // 请求带有 redirect 重定向时，登录自动重定向到该地址
                const redirect = decodeURIComponent(from.query.redirect || to.path)
                if (to.path === redirect) {
                  // 设置replace: true，这样导航就不会留下历史记录
                  next({ ...to, replace: true })
                } else {
                  // 跳转到目的路由
                  next({ path: redirect, replace: true })
                }
                sessionStorageOperation('clean', 'wsToken')
                // 连接websocket
                wsLogin().then(() => {
                  // 心跳
                  wsHeat()
                })
                // 请求系统信息
                request({
                  url: api.common.findSysDictionaryDetail,
                  data: {
                    page: 1,
                    limit: -1,
                    systemName: 'systemInfo',
                    dictCode: 'system_logo'
                  }
                }).then(res => {
                  if (res.code === 1) store.dispatch('app/setSystemInfo', res.data[0])
                })
              })
            }).catch(() => {
              sessionStorageOperation('cleanAll')
              cleanLoginLocalStorage()
              // next(`/login?redirect=${to.path}`)
              next(`/login`)
            })
          }
        }).catch(() => {
          sessionStorageOperation('cleanAll')
          cleanLoginLocalStorage()
          // next(`/login?redirect=${to.path}`)
          next(`/login`)
        })
      } else {
        store.dispatch('user/setPageRoles', to.meta.roles ? to.meta.roles : [])// 获取设置跳转页面的权限
        next()
      }
    }
  } else {
    sessionStorageOperation('cleanAll')
    cleanLoginLocalStorage()
    if (whiteList.indexOf(to.path) !== -1) {
      // 路由白名单，直接放行
      next()
    } else {
      // next(`/login?redirect=${to.path}`)
      next(`/login`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
