import Vue from 'vue'
import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
Element.Dialog.props.closeOnClickModal.default = false // 全局禁止点击遮罩层关闭el-dialog弹窗
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

// 打印
import Print from 'vue-print-nb'
Vue.use(Print)

// 全局过滤器
import * as filters from './filters'
// 注册全局过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 图标
import './icons'

// 大屏
import dataV from '@jiaminghi/data-view'

Vue.use(dataV)
// 按需引入vue-awesome图标
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/chart-bar.js'
import 'vue-awesome/icons/chart-area.js'
import 'vue-awesome/icons/chart-pie.js'
import 'vue-awesome/icons/chart-line.js'
import 'vue-awesome/icons/align-left.js'
// 全局注册图标
Vue.component('icon', Icon)
// 适配flex
import '@/common/flexible.js'
// 引入echart
import * as echarts from 'echarts/core'

Vue.prototype.$echarts = echarts

// 权限控制方案
import './permission' // 路由权限控制
import hasPermission from '@/directive/permission/permission' // 页面上的按钮权限控制指令 页面上通过 v-permission="['runScript']" 去调用
Vue.use(hasPermission)

// 可拖拽弹窗指令
import elDragDialog from '@/directive/el-drag-dialog/index'

import tableScroll from '@/directive/table-scroll/table-scroll'

Vue.use(tableScroll)

Vue.use(elDragDialog)

import down from '@/directive/v-down/down'

Vue.use(down)

// el-select加载更多
import loadmore from '@/directive/el-select-loadmore/index'
Vue.use(loadmore)

import setDialogMainHeight from '@/directive/set-dialog-main-height/set-dialog-main-height'

Vue.use(setDialogMainHeight)

// 把右击菜单组件设置为全局组件
import VueContextMenu from './components/ContextMenu/index'

// 获取视图宽高
Vue.prototype.getViewportSize = function() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  }
}

// 复制到剪切板
import Clipboard from 'vue-clipboard2'
Vue.use(Clipboard)

// 右键菜单
Vue.use(VueContextMenu)

// 图片全屏预览组件
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

Vue.use(Viewer)
Viewer.setDefaults({
  Options: {
    'inline': true,
    'button': true,
    'navbar': true,
    'title': true,
    'toolbar': true,
    'tooltip': true,
    'movable': true,
    'zoomable': true,
    'rotatable': true,
    'scalable': true,
    'transition': true,
    'fullscreen': true,
    'keyboard': true,
    'url': 'data-source'
  }
})

import BaiduMap from 'vue-baidu-map'

Vue.use(BaiduMap, {
  /* Visit http://lbsyun.baidu.com/apiconsole/key for details about app key. */
  ak: 'HflajQ5Mo7xpnSZ4lpb1a2INXy5ngzQo'
})

// 引入浏览器存储 添加到Vue原型对象上
import { localStorageOperation, sessionStorageOperation } from '@/utils/browser-storage'

Vue.prototype.localStorageOperation = localStorageOperation
Vue.prototype.sessionStorageOperation = sessionStorageOperation

// 全局通用工具
import * as utilTool from './utils/utils'

Vue.prototype.$tool = utilTool

import * as defineData from './utils/define-data'

Vue.prototype.$defineData = defineData

import * as auth from './utils/auth'

Vue.prototype.$auth = auth

import * as commonRequestFn from '@/api/common-request-fn'

// 全局注册公共数据请求方法
Vue.prototype.commonRequestFn = commonRequestFn

// 全局初始化 DataTransfer 因为在跟异步一起使用会覆盖掉事件的 DataTransfer
Vue.prototype.DataTransfer = new DataTransfer()

Vue.prototype.$EventBus = new Vue()

/**
 * @description 批量注销事件总线
 * @param events{string} 事件名称，支持多个事件名称，多个使用逗号分割
 */
Vue.prototype.batchOffEventBus = function(events) {
  const eventsArr = events.split(',')
  eventsArr.forEach(key => {
    this.$EventBus.$off(key)
  })
}

// ws请求
import * as ws from '@/utils/websocket'
Vue.prototype.$ws = ws

// ws cmd命令
import wsCmd from '@/api/socket-cmd'
Vue.prototype.wsCmd = wsCmd

// 接口请求
import request from '@/utils/request'
Vue.prototype.$request = request

// 接口请口
import api from '@/api/api'
Vue.prototype.api = api

// 项目定义参数统一管理
import paramsModel from '@/params-model/index'
Vue.prototype.$paramsModel = paramsModel

// activity流程相关请求
import activityMixins from '@/mixins/activity-mixins'
Vue.mixin(activityMixins)

// vform表单设计器
// 同时注册了v-form-designer、v-form-render等组件
import vform from '@/local-package/vform/VFormDesigner.umd.min'
import '@/local-package/vform/VFormDesigner.css'
Vue.use(vform)

// 代码编辑器组件配置
import jshint from 'jshint'
window.JSHINT = jshint.JSHINT
import 'codemirror/lib/codemirror.css'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
Vue.use(codemirror)

// 阻止火狐浏览器默认的拖拽搜索行为
document.body.ondrop = function(event) {
  event.preventDefault()
  event.stopPropagation()
}

Vue.use(Element, {
  size: Cookies.get('size') || 'medium'
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
