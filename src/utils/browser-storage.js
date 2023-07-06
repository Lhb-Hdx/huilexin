import { isJSONString } from '@/utils/utils'

/**
 * @description 浏览器本地存储
 */

// localStorage操作
const localStorageOperation = function(method, name, obj, expires) {
  /*
   * 参数说明：
   * method：get获取，set存入或覆盖，clean清除
   * name:localStorage的名称
   * obj:存入的内容，可以是任意类型
   * */
  switch (method) {
    case 'get':
      if (localStorage.getItem(name)) {
        if (isJSONString(localStorage.getItem(name))) {
          return JSON.parse(localStorage.getItem(name))
        } else {
          return localStorage.getItem(name)
        }
      } else {
        return null
      }
    case 'set':
      localStorageOperation('clean', name)
      if (Object.prototype.toString.call(obj) === '[object Object]' || Object.prototype.toString.call(obj) === '[object Array]') {
        localStorage.setItem(name, JSON.stringify(obj))
      } else {
        localStorage.setItem(name, obj)
      }
      return true
    case 'clean':
      localStorage.removeItem(name)
      return true
  }
}

/**
 * @description sessionStorage操作
 * @param {string}method get获取，set存入或覆盖，clean清除
 * @param {string}name session的名称
 * @param {any}obj 存入的内容，可以是任意类型
 * @param {number}expires 过期时间 毫秒
 * @returns {null|boolean|*}
 */
const sessionStorageOperation = function(method, name, obj, expires) {
  let storageData = {}
  switch (method) {
    case 'get':
      if (sessionStorage.getItem(name)) {
        storageData = JSON.parse(sessionStorage.getItem(name))
        if (storageData.startTime) {
          const date = new Date().getTime()
          // 如果大于就是过期了，如果小于或等于就还没过期
          if (date - storageData.startTime > storageData.expires) {
            sessionStorageOperation('clean', name)
            return false
          } else {
            return storageData.storageData
          }
        } else {
          return storageData.storageData
        }
      } else {
        return null
      }
    case 'set':
      storageData = { storageData: obj, startTime: expires ? new Date().getTime() : null, expires }
      if (Object.prototype.toString.call(storageData) === '[object Object]' || Object.prototype.toString.call(storageData) === '[object Array]') {
        sessionStorage.setItem(name, JSON.stringify(storageData))
      } else {
        sessionStorage.setItem(name, storageData)
      }
      return true
    case 'clean':
      sessionStorage.removeItem(name)
      return true
    case 'cleanAll': // 清除浏览器所有的session
      sessionStorage.clear()
      return
  }
}

export { localStorageOperation, sessionStorageOperation }
