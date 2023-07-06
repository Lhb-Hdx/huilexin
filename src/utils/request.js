import axios from 'axios'
import router from '@/router'
import store from '@/store'
import { localStorageOperation, sessionStorageOperation } from '@/utils/browser-storage'
import { cleanLoginLocalStorage } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  changOrigin: true,
  timeout: 30000, // request timeout
  method: 'post'
})
// request interceptor
service.interceptors.request.use(
  config => {
    // 请求头带上token
    const loginToken = localStorageOperation('get', 'loginToken')
    // 存在token 并且 该接口需要传递token request({ url: 'xxxxx', notNeedToken: true  })
    // notNeedToken true代表不需要传递 不传代表需要传递token
    if (loginToken && !config.notNeedToken) {
      config.headers['x-auth-token'] = loginToken
    }
    if (config.method === 'post' && !config.url.includes('messageSendToPlatform')) {
      const form = config.form ? config.form : new FormData()
      if (config.data)Object.keys(config.data).forEach(key => form.append(key, (config.data[key] !== undefined && config.data[key] !== null && config.data[key] !== 'null' ? config.data[key] : '')))
      config.data = form
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // console.log(res)
    if (res.code === 1) { // 返回成功
      return res
    } else {
      // console.log(res)
      if (res.code === 2) { // 认证过期，返回登录页面
        cleanLoginLocalStorage()
        sessionStorageOperation('cleanAll')
        router.replace('/login')
        store.dispatch('user/resetToken').then(() => {
          router.replace('/login')
        })
      } else if (res.code === -4) {
        router.replace('/authorization')
      }
      Promise.reject(new Error(res.msg || 'Error'))
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 10 * 1000
    // })
    return Promise.reject(error)
  }
)

export default service
