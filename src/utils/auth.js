import Cookies from 'js-cookie'
import request from '@/utils/request'
import api from '@/api/api'
import {localStorageOperation, sessionStorageOperation} from '@/utils/browser-storage'
import store from '@/store'

const TokenKey = 'JSESSIONID'

// user cookie START
export function getToken() {
  return Cookies.get(TokenKey)
}
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}
export function removeToken() {
  return Cookies.remove(TokenKey)
}
// user cookie END

// user session START
// 获取存储在浏览器的用户session
export function getUserInfo() {
  try {
    const info = localStorageOperation('get', 'userInfo')
    if (info) {
      return info
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// 设置用户信息到浏览器session
export function setUserInfo(info) {
  localStorageOperation('set', 'userInfo', info)
}

// 删除浏览器用户信息session
export function removeUserInfo() {
  localStorageOperation('clean', 'userInfo')
}

// 获取用户登录后存储的本地session
export function getUserSession() {
  const hasUserIdSession = localStorageOperation('get', 'userInfo') // 存储用户ID的session
  if (hasUserIdSession) {
    return hasUserIdSession
  } else {
    return null
  }
}
// user session END
// 获取文件上传凭证
export async function authUploadToken() {
  return new Promise(resolve => {
    request({
      url: api.file.AuthUploadToken, data: {}
    }).then(res => {
      if (res.code === 1) {
        sessionStorageOperation('set', 'uploadToken', res.map, 900000)
        resolve(res.map)
      }
    })
  })
}

// 清除用户登录相关的localstorage
export function cleanLoginLocalStorage() {
  localStorageOperation('clean', 'loginToken') // token
  localStorageOperation('clean', 'userInfo') // 用户信息
  localStorageOperation('clean', 'role') // 用户角色
}

// 调用获取当前页面vuex用户权限
export function getVuexStoragePermission(key) {
  const roles = store.getters && store.getters.roles
  return key ? roles.indexOf(`${key}`) : roles
}

// 调用获取全部vuex用户权限
export function getVuexStoragePermissionByAll(key) {
  const roles = store.getters && store.getters.vueFileRoutes
  return key ? roles.indexOf(`${key}`) : roles
}

// 调用获取当前路由vuex
export function getVuexStorageCurrentRoute() {
  return store.getters && store.getters.currentRoute
}
