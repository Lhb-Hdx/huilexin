/**
 * @description websock连接
 */

import { Message } from 'element-ui'
import { sessionStorageOperation } from '@/utils/browser-storage'
import { wsLogin } from '@/api/common-ws-require'
import { isHttps } from '@/utils/validate'
import store from '@/store'

let websock = null
let messageCallback = null
let heartCallback = null
let errorCallback = null
let wsUrl = ''
let tryTime = 0
let isOnlineStatus = false

// 接收ws后端返回的数据
function websocketonmessage(e) {
  if (e.data === 'error') {
    messageCallback((e.data))
  } else {
    const wsResData = JSON.parse(e.data)
    if (wsResData.errorMsg === '未登录') {
      wsLogin()
    } else {
      if (wsResData.cmd === 'login') {
        const data = JSON.parse(wsResData.jsonData)
        if (sessionStorageOperation('get', 'wsToken') !== data.token) {
          sessionStorageOperation('set', 'wsToken', data.token)
        }
        window.dispatchEvent(new CustomEvent('loginWsSuccess'))
      }
    }
    if (wsResData.cmd === 'heat' || wsResData.cmd === 'login') {
      heartCallback(JSON.parse(e.data))
    } else if (messageCallback !== null) {
      messageCallback(JSON.parse(e.data))
    }

    window.dispatchEvent(new CustomEvent('watchWsMessage', { detail: { data: wsResData }}))
  }
}

/**
 * 发起websocket连接
 * @param {Object} agentData 需要向后台传递的参数数据
 */
function websocketSend(agentData) {
  // 加延迟是为了尽量让ws连接状态变为OPEN
  setTimeout(() => {
    // 添加状态判断，当为OPEN时，发送消息
    if (websock.readyState === websock.OPEN) { // websock.OPEN = 1
      // 发给后端的数据需要字符串化
      websock.send(JSON.stringify(agentData))
    }
    if (websock.readyState === websock.CLOSED) { // websock.CLOSED = 3
      console.log('websock.readyState=3')
      Message.error('ws连接异常，请稍候重试')
      store.dispatch('app/setWsStatus', 0)
      errorCallback()
    }
  }, 500)
}

// 关闭ws连接
function websocketclose(e) {
  // e.code === 1000  表示正常关闭。 无论为何目的而创建, 该链接都已成功完成任务。
  // e.code !== 1000  表示非正常关闭。
  if (e && e.code !== 1000) {
    // Message.error('ws连接异常，请稍候重试')
    // errorCallback()
    // 如果需要设置异常重连则可替换为下面的代码，自行进行测试
    if (tryTime < 10) {
      store.dispatch('app/setWsStatus', 2)
      setTimeout(function() {
        websock = null
        tryTime++
        initWebSocket()
        console.log(`第${tryTime}次重连`)
      }, 3 * 1000)
    } else {
      Message.error('重连失败！请稍后重试')
      store.dispatch('app/setWsStatus', 0)
    }
  }
}
// 建立ws连接
function websocketOpen(e) {
  isOnlineStatus = true
  console.log('WebSocket连接成功')
  if (e) {
    console.log('连接成功开始发送')
    store.dispatch('app/setWsStatus', 1)
    window.dispatchEvent(new CustomEvent('connectionWsSuccess'))
    if (Object.keys(e).length > 0) {
      websocketSend(e)
    }
  }
}

// 初始化weosocket
function initWebSocket(agentData) {
  if (typeof (WebSocket) === 'undefined') {
    store.dispatch('app/setWsStatus', 0)
    Message.error('您的浏览器不支持WebSocket，无法获取数据')
    return false
  }

  websock = new WebSocket(wsUrl)

  websock.onmessage = function(e) {
    websocketonmessage(e)
  }
  websock.onopen = function() {
    websocketOpen(agentData)
  }
  websock.onerror = function() {
    isOnlineStatus = false
    Message.error('ws连接异常，请稍候重试')
    store.dispatch('app/setWsStatus', 0)
    errorCallback()
  }
  websock.onclose = function(e) {
    isOnlineStatus = false
    websocketclose(e)
  }
}

/**
 * 发起websocket请求函数
 * @param {string} url ws连接地址
 * @param {Object} agentData 传给后台的参数
 * @param {function} successCallback 接收到ws数据，对数据进行处理的回调函数
 * @param {function} errCallback ws连接错误的回调函数
 */
export function sendWebsocket(url, agentData, successCallback, errCallback) {
  if (!sessionStorageOperation('get', 'wsToken') && agentData.cmd !== 'login') {
    wsLogin()
  }
  wsUrl = isHttps() ? `wss:${url}` : `ws:${url}`
  // wsUrl = 'wss://dyne.pyhospital.com.cn:19443/ws'
  // if (successCallback) messageCallback = successCallback
  if (errCallback) errorCallback = errCallback
  if (agentData.cmd === 'heat' || agentData.cmd === 'login') {
    heartCallback = successCallback
  } else if (agentData.cmd !== 'heat' && successCallback) {
    messageCallback = successCallback
  }
  if (!isOnlineStatus) { // 首次连接ws 把数据传给初始化方法，再传给连接成功方法去发数据
    initWebSocket(agentData)
  } else { // 非首次直接=发数据
    if (Object.keys(agentData).length > 0) {
      websocketSend(agentData)
    }
  }
}

/**
 * 关闭websocket函数
 */
export function closeWebsocket() {
  if (websock) {
    websock.close() // 关闭websocket
    websock.onclose() // 关闭websocket
  }
}
