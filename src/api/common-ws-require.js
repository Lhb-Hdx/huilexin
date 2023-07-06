/**
 * @description common-ws-require.js
 * @author linhaojia
 * @date 2022/4/15 11:43:12
 */

import { localStorageOperation, sessionStorageOperation } from '@/utils/browser-storage'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd.js'
import { Message } from 'element-ui'
import store from '@/store'

/**
 * @description websocket登录
 */
export async function wsLogin() {
  return new Promise((resolve, reject) => {
    const userInfoStorage = localStorageOperation('get', 'userInfo') // 获取用户登录信息
    sendWebsocket(socketCmd.host.default, {
      cmd: socketCmd.common.login,
      data: {
        user: userInfoStorage.userName,
        pwd: userInfoStorage.password
      }},
    (res) => {
      resolve(res)
    }, (err) => {
      reject(err)
      Message({ message: 'WebSocket登录连接失败', type: 'error' })
      store.dispatch('app/setWsStatus', 0)
      console.log(err)
    })
  })
}

/**
 * @description websocket心跳维持 50秒调用
 */
export function wsHeat() {
  setInterval(() => {
    const wsToken = sessionStorageOperation('get', 'wsToken')
    if (wsToken) {
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.common.heat,
        data: {
          token: wsToken
        }},
      (wsRes) => {
        if (wsRes.cmd === 'heat') sessionStorageOperation('set', 'wsToken', wsRes.data.token)
      }, (err) => {
        wsLogin()
        Message({ message: '发起心跳维持失败', type: 'error' })
        store.dispatch('app/setWsStatus', 0)
        console.log(err)
      })
    } else {
      wsLogin()
    }
  }, 10000)
}
