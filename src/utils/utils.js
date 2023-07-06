/**
 * @description 工具方法
 */
import { localStorageOperation } from '@/utils/browser-storage'
import defaultSettings from '@/settings'

/**
 * @description 时间格式化 年-月-日 时:分:秒
 * @param date
 * @returns {string}
 */
export function formatTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 时间戳转年月日时分秒
export function formatDate (value) {
  if (typeof (value) === 'undefined') {
    return ''
  } else {
    let date = new Date(parseInt(value))
    let y = date.getFullYear()
    let MM = date.getMonth() + 1
    MM = MM < 10 ? ('0' + MM) : MM
    let d = date.getDate()
    d = d < 10 ? ('0' + d) : d
    let h = date.getHours()
    h = h < 10 ? ('0' + h) : h
    let m = date.getMinutes()
    m = m < 10 ? ('0' + m) : m
    let s = date.getSeconds()
    s = s < 10 ? ('0' + s) : s
    return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s
  }
}

/**
 * @description 日期格式化
 * @param fmt
 * @param date
 * @returns {*}
 */
export function dateFormat(fmt, date) {
  let ret
  const opt = {
    'Y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    'S+': date.getSeconds().toString() // 秒
  }
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
    }
  }
  return fmt
}
// 年月日时分秒转时间戳
export function getTimeF(timeS) {
  let time = (new Date(timeS).getTime()) / 1000 // 除1000 是变成秒级的戳时间 不除就是毫秒级
  return time
}

export function formatSTime(dateStr) {
  const targetDate = new Date(dateStr)
  const year = targetDate.getFullYear()
  const month = targetDate.getMonth() + 1
  const day = targetDate.getDate()
  const hour = targetDate.getHours()
  const minute = targetDate.getMinutes()
  const second = targetDate.getSeconds()

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export function formatMsgTime(targetDate) {
  var year = targetDate.getFullYear()
  var month = targetDate.getMonth() + 1
  var day = targetDate.getDate()
  var targetTime = targetDate.getTime()
  var nowDate = new Date()
  var now_new = Date.parse(nowDate.toString())
  var milliseconds = 0
  var timeSpanStr
  milliseconds = now_new - targetTime
  if (milliseconds <= 1000 * 60) {
    timeSpanStr = '刚刚'
  } else if (1000 * 60 < milliseconds && milliseconds <= 1000 * 60 * 60) {
    timeSpanStr = Math.round((milliseconds / (1000 * 60))) + '分钟前'
  } else if (1000 * 60 * 60 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
    timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前'
  } else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 15) {
    timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前'
  } else if (milliseconds > 1000 * 60 * 60 * 24 * 15 && year === nowDate.getFullYear()) {
    timeSpanStr = formatNumber(month) + '-' + formatNumber(day)
  } else {
    timeSpanStr = year + '-' + formatNumber(month) + '-' + formatNumber(day)
  }
  return timeSpanStr
}

export function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * @description 日期的相加减 主方法
 * @param date 日期
 * @param days 天数
 * @param operator 加 或者 减
 * @param resultType 结果类型 all代表返回全部类型是数组，如果没有传返回目标天数
 * @returns {string|boolean}
 */
// 相减
// dateOperator("2015-02-28", 1, "-");
// 相加
// dateOperator("2015-02-28", 1, "+");
export function dateOperator(date, days, operator, resultType) {
  date = date.replace(/-/g, '/') // 更改日期格式
  var nd = new Date(date)
  const dateList = []
  if (resultType === 'all') {
    for (let t = 0; t < days; t++) {
      dateList.push(getDateItem(nd, t, operator))
    }
    return dateList.reverse()
  } else {
    return getDateItem(nd, days, operator)
  }
}

/**
 * @description 日期的相加减 辅助方法 返回出时间项
 * @param nd 当前时间
 * @param days 操作天数
 * @param operator 操作类型
 * @returns {string|boolean}
 */
function getDateItem(nd, days, operator) {
  nd = nd.valueOf()
  if (operator === '+') {
    nd = nd + days * 24 * 60 * 60 * 1000
  } else if (operator === '-') {
    nd = nd - days * 24 * 60 * 60 * 1000
  } else {
    return false
  }
  nd = new Date(nd)
  var y = nd.getFullYear()
  var m = nd.getMonth() + 1
  var d = nd.getDate()
  if (m <= 9) m = '0' + m
  if (d <= 9) d = '0' + d
  return y + '-' + m + '-' + d
}

/**
 * @description JS获取两个日期之间相差的天数
 * @param dateString1 日期1
 * @param dateString2 日期2
 * @returns {number}
 */
export function getDaysBetween(dateString1, dateString2) {
  var startDate = Date.parse(dateString1)
  var endDate = Date.parse(dateString2)
  return (endDate - startDate) / (24 * 60 * 60 * 1000)
}

/**
 * @description 判断浏览器有没有某个插件
 * @param name
 * @returns {boolean}
 */
export function hasPlugin(name) {
  name = name.toLowerCase()
  for (let i = 0; i < navigator.plugins.length; i++) {
    if (navigator.plugins[i].name.toLowerCase().indexOf(name) > -1) {
      return true
    }
  }
  return false
}

/**
 * @description 根据当前日期倒推
 * @param days 倒推多少天
 * @param time 月底时间戳,根据月底倒推
 * @returns {boolean|*[]}
 */
export function callbackDay(days, time) {
  if (days === '' || days === null || days === undefined || typeof days !== 'number') {
    return false
  }
  const res = [] // 返回数据
  let today = ''
  if (time) {
    today = time
  } else {
    today = new Date().getTime() // 今天
  }
  for (let i = 0; i < days; i++) {
    const _day = new Date(today - 86400000 * i)
    const year = _day.getFullYear()
    let month = (_day.getMonth() + 1)
    let day = _day.getDate()
    month = month >= 10 ? month : `0${month}`
    day = day >= 10 ? day : `0${day}`
    res.push(year + '-' + month + '-' + day)
  }
  return res
}

/**
 * @description 根据当前时分秒倒推
 * @param h 倒推多少小时
 * @returns {Date}
 */
export function callbackTime(h) {
  return new Date(new Date().getTime() - h * 60 * 60 * 1000)
}

/**
 * @description 求数组平均值
 * @param array 数组
 * @returns {number}
 */
export function avg(array) {
  const len = array.length
  let sum = 0
  for (let i = 0; i < len; i++) {
    sum += Number(array[i])
  }
  return sum / len
}

export function sizeUnitTo() {
  return {
    // KB转B
    kbTob: function(size) {
      return size * 1024
    }
  }
}

/**
 * @description 从B开始换算单位
 * @param limit 字节大小
 * @param unitType 单位类型
 * @returns {any}
 */
export function sizeUnitsConversion(limit, unitType) {
  if (Number(limit) === 0) return { size: '', units: '' }
  let size = '' // 容量
  let units = '' // 单位 大写
  let lowerUnits = '' // 单位 小写
  let abbreviations = '' // 缩写单位 大写
  let lowerAbbreviations = '' // 缩写单位 小写
  if (Number(limit) < 1024) { // 小于0.1KB，则转化成B
    size = Number(limit).toFixed(2)
    units = 'B'
    lowerUnits = 'b'
    abbreviations = 'B'
    lowerAbbreviations = 'b'
  } else if (Number(limit) < 1024 * 1024) { // 小于0.1MB，则转化成KB
    size = (Number(limit) / 1024).toFixed(2)
    units = 'KB'
    lowerUnits = 'kb'
    abbreviations = 'K'
    lowerAbbreviations = 'k'
  } else if (Number(limit) < 1024 * 1024 * 1024) { // 小于0.1GB，则转化成MB
    size = (Number(limit) / (1024 * 1024)).toFixed(2)
    units = 'MB'
    lowerUnits = 'mb'
    abbreviations = 'M'
    lowerAbbreviations = 'm'
  } else if (Number(limit) < 1024 * 1024 * 1024 * 1024) { // 小于0.1TB，则转化成GB
    size = (Number(limit) / (1024 * 1024 * 1024)).toFixed(2)
    units = 'GB'
    lowerUnits = 'gb'
    abbreviations = 'G'
    lowerAbbreviations = 'g'
  } else if (Number(limit) < 1024 * 1024 * 1024 * 1024 * 1024) { // 小于0.1pB，则转化成TB
    size = (Number(limit) / (1024 * 1024 * 1024 * 1024)).toFixed(2)
    units = 'TB'
    lowerUnits = 'tb'
    abbreviations = 'T'
    lowerAbbreviations = 't'
  } else { // 其他转化成PB
    size = (Number(limit) / (1024 * 1024 * 1024 * 1024 * 1024)).toFixed(2)
    units = 'PB'
    lowerUnits = 'pb'
    abbreviations = 'P'
    lowerAbbreviations = 'p'
  }

  const sizeStr = size + '' // 转成字符串
  const index = sizeStr.indexOf('.') // 获取小数点处的索引
  const dou = sizeStr.substr(index + 1, 2) // 获取小数点后两位的值
  if (dou === '00') { // 判断后两位是否为00，如果是则删除00
    return { size: sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2), units, lowerUnits, abbreviations, lowerAbbreviations }
  }
  if (unitType === 'default' || unitType === undefined) { // 没有规定大小写返回两种单位
    return { size, units, lowerUnits, abbreviations, lowerAbbreviations }
  }
  if (unitType === 'capital') { // 大写单位
    return { size, units: units, abbreviations }
  }
  if (unitType === 'lower') { // 小写单位
    return { size, units: lowerUnits, lowerAbbreviations }
  }
}

/**
 * @description 秒转换为x天x时x分x秒
 * @param second
 * @returns {string}
 */
export function sToYMD(second) {
  const days = Math.floor(second / 86400)
  const hours = Math.floor((second % 86400) / 3600)
  const minutes = Math.floor(((second % 86400) % 3600) / 60)
  // const seconds = Math.floor(((second % 86400) % 3600) % 60)
  return days + '天' + hours + '小时' + minutes + '分'
}
/**
 * @description 秒转换为x天x时x分x秒
 * @param second
 * @returns {string}
 */
export function sToYMDS(second) {
  const days = Math.floor(second / 86400)
  const hours = Math.floor((second % 86400) / 3600)
  const minutes = Math.floor(((second % 86400) % 3600) / 60)
  const seconds = Math.floor(((second % 86400) % 3600) % 60)
  return days + '天' + hours + '小时' + minutes + '分' + seconds + '秒'
}
/**
 * @description 生成uuid
 * @returns {string}
 */
export function guid() {
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

/**
 * @description 将中文括号转换成英文括号并且去除空格
 * @param srt 字符串
 * @returns {*}
 */
export function conversionSymbols(srt) {
  const reg = /[\（]/g
  const reg2 = /[\）]/g
  if (!srt) return
  return srt.replace(reg, '(').replace(reg2, ')').replace(/\s*/g, '')
}

/**
 * @description 数据单位之间转换
 * @param original 原始单位
 * @param transform 转换单位 'B', 'KB', 'MB', 'GB', 'TB'
 * @param size 大小
 * @returns {{original, size: number}}
 */
export function sizeUnitsTransform(original, transform, size) {
  if (original.toUpperCase() === transform.toUpperCase()) { // 单位一致情况
    return { size: Number(size), original }
  }
  const k = 1024
  const sizeArr = [
    'B', 'KB', 'MB', 'GB', 'TB', 'PB'
  ]
  const fIndex = sizeArr.findIndex(item => item === original.toUpperCase())
  const tIndex = sizeArr.findIndex(item => item === transform.toUpperCase())
  if (fIndex < tIndex) {
    return { size: Number(size / Math.pow(k, tIndex - fIndex)), original }
  } else if (tIndex < fIndex) {
    return { size: Number(size * Math.pow(k, fIndex - tIndex)), original }
  }
}

/**
 * @description 将监控项的数据进行数据和单位转换
 * @param type 数据的类型 必填
 * @param size 数据 必填
 * @param unit 原始单位 可选
 * @returns {any}
 */
export function conversionData(type, size, unit) {
  let suffix = ''
  if (type === 'data') { // 数据单位转换
    let activeUnit = unit
    if (unit.indexOf('ps') !== -1) {
      activeUnit = unit.split('ps')[0]
      suffix = `ps`
    }
    if (unit.indexOf('/') !== -1) {
      activeUnit = unit.split('/')[0]
      suffix = `/${unit.split('/')[1]}`
    }
    if (size <= 0) return { size, units: unit, suffix, original: activeUnit }
    // 将数据大小转成b
    const sizeUnitsTransformResult = sizeUnitsTransform(`${activeUnit}`, 'b', size)
    return { ...sizeUnitsConversion(sizeUnitsTransformResult.size), suffix, original: activeUnit }
  } else if (type === 'time') { // 数据单位转换
    const date = new Date(size * 1000)
    return date.getDay()
  } else if (type === 'status') { // 状态数据转换
    return size === 1 ? '正常' : '异常'
  }
}

/**
 * @description 视频监控播放器播放地址（是否通过ip地址访问、是否为https、http类型）
 * @returns {{isIp: boolean, httpType: (string), isHttps: boolean}}
 */
export function playerHostInfo() {
  const ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  const locationUrl = window.location.href.split('//')[1]
  const host = locationUrl.split('/')[0]
  const hostName = host.split(':')[0]
  const isIp = ipReg.test(hostName)
  const isHttps = document.location.protocol === 'https:' // 访问浏览器是否是https环境
  const httpType = isHttps ? 'https' : 'http' // http类型
  return {
    isIp, isHttps, httpType
  }
}

/**
 * @description 获取a数组在b数组中不存在的元素
 * @param a
 * @param b
 * @returns {*[]}
 */
export function arrItemExist(a, b) {
  const notExist = []
  for (let i = 0; i < a.length; i++) {
    const idx = b.findIndex(item => item === a[i])
    if (idx === -1) {
      notExist.push(a[i])
    }
  }
  return notExist
}

/**
 * @description 获取a数组对象在b数组对象中不存在的元素
 * @param bequery
 * @param query
 * @param field
 * @returns {*[]}
 */
export function arrItemObjectExist(bequery, query, field) {
  const notExist = []
  for (let i = 0; i < bequery.length; i++) {
    const idx = query.findIndex(item => item[`${field}`] === bequery[i][`${field}`])
    if (idx === -1) {
      notExist.push(bequery[i])
    }
  }
  return notExist
}

/**
 * @description 转换为rgba
 * @param hex
 * @param opacity
 * @returns {string}
 */
export function hexToRgba(hex, opacity) {
  let rgbaColor = ''
  const reg = /^#[\da-f]{6}$/i
  if (reg.test(hex)) {
    rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt(
      '0x' + hex.slice(3, 5)
    )},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
  }
  return rgbaColor
}

/**
 * @description 根据json里面的字段排序
 * @param property 字段
 * @param sortType 排序类型 up升序 down降序
 * @returns {function(*, *)}
 */
export function compareJson(property, sortType) {
  return function(a, b) {
    const value1 = a[property]
    const value2 = b[property]
    return sortType === 'down' || !sortType ? Number(value2) - Number(value1) : Number(value1) - Number(value2)
  }
}

/**
 * @description 根据总数和数量计算百分比
 * @param num 数量
 * @param total 总数
 * @returns {string|string}
 * @constructor
 */
export function getPercent(num, total) {
  num = parseFloat(num)
  total = parseFloat(total)
  if (isNaN(num) || isNaN(total)) {
    return '-'
  }
  return total <= 0 ? '0' : (Math.round(num / total * 10000) / 100.00)
}

/**
 * @description 获取时间数据
 * @param resultType
 * @param dateObject
 * @returns {{s: (number|string), D: number, h: (number|string), Y: number, M: number, m: (number|string)}|string}
 */
export function getNowDate(resultType, dateObject) {
  const date = dateObject || new Date()
  const Y = date.getFullYear()
  const M = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
  const D = date.getDate() >= 10 ? date.getDate() : `0${date.getDate()}`
  const h = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`
  const m = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`
  const s = date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`
  return resultType === 'object' ? {
    Y, M, D, h, m, s
  } : `${Y}-${M}-${D} ${h}:${m}:${s}`
}

/**
 * @description 数组去重
 * @param arr 数组
 * @returns {*}
 */
export function uniqueArray(arr) {
  return Array.from(new Set(arr))
}

/**
 * @description 获取浏览器访问域名
 */
export function getBrowserHost(isNotPort) {
  const locationUrl = window.location.href.split('//')[1]
  const host = locationUrl.split('/')[0]
  if (isNotPort) {
    if (host.indexOf(':')) {
      return host.split(':')[0]
    } else {
      return host
    }
  } else {
    return host
  }
}

/**
 * @description 是否是JSON字符串
 * @param value 数据
 * @returns {boolean}
 */
export function isJSONString(value) {
  try {
    return Object.prototype.toString.call(JSON.parse(value)) === '[object Object]' || Object.prototype.toString.call(JSON.parse(value)) === '[object Array]'
  } catch (e) {
    return false
  }
}

/**
 * @description 字符串过滤返回'1:success,2:warning,3:danger'
 * @param value 数据
 * @returns {str || undefined}
 */
export function formatData(val, str) {
  const isStr = () => Object.prototype.toString.call(str).slice(8, -1) === 'String'
  if (!isStr()) return ''
  let newStr = str.split(',').map(it => it.split(':'))
  newStr = newStr.find((it) => it[0] === val)
  return newStr && newStr[1] || ''
}

// 是否浏览器全屏
export function isBrowserFullScreen() {
  return window.fullScreen || document.webkitIsFullScreen
}

// 打开浏览器全屏
export function openBrowserFullScreen() {
  if (document.body.requestFullscreen) {
    document.body.requestFullscreen()
  } else if (document.body.mozRequestFullScreen) {
    document.body.mozRequestFullScreen()
  } else if (document.body.webkitRequestFullScreen) {
    document.body.webkitRequestFullScreen()
  } else if (document.body.msRequestFullscreen) {
    document.body.msRequestFullscreen()
  }
}

// 关闭浏览器全屏
export function closeBrowserFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

// 模拟f11点击全屏
export function ADCfullScreen() {
  var el = document.documentElement
  var rfs = el.requestFullScreen || el.webkitRequestFullScreen ||
    el.mozRequestFullScreen || el.msRequestFullScreen
  if (typeof rfs !== 'undefined' && rfs) {
    console.log('bbb')
    rfs.call(el)
  } else if (typeof window.ActiveXObject !== 'undefined') {
    console.log('ccc')
    // eslint-disable-next-line no-undef
    const wscript = new ActiveXObject('WScript.Shell')
    if (wscript != null) {
      wscript.SendKeys('{F11}')
    }
  }
}
/**
 * @description 时分秒字符串转秒和毫秒
 * @param time 时分秒字符串 如：00:00:00
 * @returns {{s: number, ms: number}}
 */
export function hmsTos(time) {
  const hour = time.split(':')[0]
  const min = time.split(':')[1]
  const sec = time.split(':')[2]
  const s = Number(hour * 3600) + Number(min * 60) + Number(sec)
  return {
    s,
    ms: s * 1000
  }
}

/**
 * @description 字符串分割返回'1:success,2:warning,3:danger'
 * @param val string
 * @param str string
 * @returns str || undefined
 */
export function formatStr(val = 0, str) {
  const isStr = () => Object.prototype.toString.call(str).slice(8, -1) === 'String'
  if (!isStr() || !str) return val
  let newStr = str.split(',').map(it => it.split(':')).find((it) => it[0] === String(val))
  return newStr && newStr[1] || val
}

/**
 * @description 根据数据项查询数据项里面的字段
 * @list 要匹配的列表
 * @val 要匹配的项
 * @field 要匹配的字段名
 * @res 要返回的字段名
 * @listField 要匹配的列表项字段名,不传=valField
 */
export function matchData(list, val, valField, res, listField) {
  if (!list || !val || !valField || !res) return null
  if (!listField)listField = valField
  let data = list.find(it => {
    return +it[listField] === +val[valField]
  })

  return data ? data[res] : null
}

/**
 * @description 截取文件名
 */
export function sliceFileName(str) {
  const isStr = () => Object.prototype.toString.call(str).slice(8, -1) === 'String'
  if (!isStr()) return str
  const index = str.lastIndexOf('/')
  return str.substr(index + 1)
}

/**
 * @description 根据数据查数据项
 * @param data{json} 数据 格式必须为 [{},{}...]
 * @param attr{string} 查询依据字段
 * @param attrValue{any} 查询依据值
 * @param returnAttr{any} 指定返回字段 不传则返回全部
 * @returns {*|null}
 */
export function findDataItemByAttr(data, attr, attrValue, returnAttr) {
  const index = data.findIndex(item => item[`${attr}`] === attrValue)
  if (index === -1) return null
  let result = { index }
  if (returnAttr) {
    result[`${returnAttr}`] = data[index][returnAttr]
  } else {
    result = { ...data[index], ...result }
  }
  return result
}

/**
 * @description 去除字符串的中文
 * @param str 字符串
 * @returns {*}
 */
export function delStringCh(str) {
  var reg = /[\u4e00-\u9fa5]/g
  return str.replace(reg, '')
}

/**
 * @description 转驼峰字符串
 * @param str 字符串
 * @returns {*}
 */
export function humpStr(str) {
  if (!str) return ''
  let hump = str.split('_').map((it, index) => {
    if (index === 0) return it
    return it[0].toUpperCase() + it.slice(1)
  }).join('')
  return hump
}

/**
 * @description 获取存储的列表查询参数
 * @param route 路由名称
 * @returns {any|string|boolean|null}
 */
export function getPageQuery(route) {
  const storage = localStorageOperation('get', 'pageQuery')
  console.log('获取存储的列表查询参数', storage)
  if (storage && storage.route === route) {
    const res = deepCopy(storage)
    delete res.route
    res.total = 0
    return res
  } else {
    return null
  }
}

/**
 * @description 页面列表查询参数缓存操作
 * @param action 操作类型 get获取 set设置
 * @param query 查询参数
 */
export async function storagePageTableQuery(action, route, query) {
  const actionKey = ['get', 'set']
  if (actionKey.indexOf(action) === -1) return console.error('active有效值：set、get')
  if (!route) return console.error('route不能为空')
  if (action === 'get') {
    const storage = localStorageOperation('get', 'pageQuery')
    if (storage && storage.route === route) {
      localStorageOperation('clean', 'pageQuery')
      const res = { ...storage }
      delete res.route
      res.total = 0
      return res
    } else {
      return null
    }
  }
  if (action === 'set') {
    localStorageOperation('set', 'pageQuery', JSON.stringify({
      ...query, route
    }))
  }
}

/**
 * @description base64转file文件对象
 * @param dataurl base64
 * @param filename 文件名
 * @returns {Object}
 */
export function dataURLtoFile(dataurl, filename) { // 将base64转换为文件
  var arr = dataurl.split(',')
  var mime = arr[0].match(/:(.*?);/)[1]
  var bstr = atob(arr[1])
  var n = bstr.length
  var u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

/**
 * @description 数据转换为tree
 * @param data
 * @param pid
 * @param level
 * @param fieldId
 * @param fieldPId
 * @returns {*[]}
 */
export function listToTree(data, pid, level, fieldId = 'id', fieldPId = 'parentId') {
  const tree = []
  data.forEach(item => {
    if (item[fieldPId] === pid) {
      item.level = level
      item.expand = false
      item.children = listToTree(data, item[fieldId], level + 1, fieldId, fieldPId)
      tree.push(item)
    }
  })
  return tree
}
/*
 * @Description:补零
 * @return:string
 * @date:2022/2/10 11:24
 */
export function zero(str) {
  return str < 10 ? '0' + str : str
}

/**
 * @description 两个日期之间的所有间隔时间
 * @param stime
 * @param etime
 * @returns {any[]}
 */
export function getdiffdate(stime, etime) {
  // 初始化日期列表，数组
  const diffdate = []
  let i = 0
  // 开始日期小于等于结束日期,并循环
  while (stime <= etime) {
    diffdate[i] = stime

    // 获取开始日期时间戳
    const stime_ts = new Date(stime).getTime()

    // 增加一天时间戳后的日期
    const next_date = stime_ts + (24 * 60 * 60 * 1000)

    // 拼接年月日，这里的月份会返回（0-11），所以要+1
    const next_dates_y = new Date(next_date).getFullYear() + '-'
    const next_dates_m = (new Date(next_date).getMonth() + 1 < 10) ? '0' + (new Date(next_date).getMonth() + 1) + '-' : (new Date(next_date).getMonth() + 1) + '-'
    const next_dates_d = (new Date(next_date).getDate() < 10) ? '0' + new Date(next_date).getDate() : new Date(next_date).getDate()

    stime = next_dates_y + next_dates_m + next_dates_d

    // 增加数组key
    i++
  }
  return diffdate
}

/* 获取指定日期的周的第一天、月的第一天、季的第一天、年的第一天 START */
/**
 * 获取指定日期的周的第一天、月的第一天、季的第一天、年的第一天
 * @param date new Date()形式，或是自定义参数的new Date()
 * @returns 返回值为格式化的日期，yy-mm-dd
 */
// 日期格式化，返回值形式为yy-mm-dd
function timeFormat(date) {
  if (!date || typeof (date) === 'string') {
    this.error('参数异常，请检查...')
  }
  var y = date.getFullYear() // 年
  var m = date.getMonth() + 1 // 月
  var d = date.getDate() // 日

  return y + '-' + m + '-' + d
}

// 获取这周的周一
export function getFirstDayOfWeek(date) {
  var weekday = date.getDay() || 7 // 获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
  date.setDate(date.getDate() - weekday + 1)// 往前算（weekday-1）天，年份、月份会自动变化
  return timeFormat(date)
}

// 获取当月第一天
export function getFirstDayOfMonth(date) {
  date.setDate(1)
  return timeFormat(date)
}

// 获取当季第一天
export function getFirstDayOfSeason(date) {
  var month = date.getMonth()
  if (month < 3) {
    date.setMonth(0)
  } else if (month > 2 && month < 6) {
    date.setMonth(3)
  } else if (month > 5 && month < 9) {
    date.setMonth(6)
  } else if (month > 8 && month < 11) {
    date.setMonth(9)
  }
  date.setDate(1)
  return timeFormat(date)
}

// 获取当年第一天
export function getFirstDayOfYear(date) {
  date.setDate(1)
  date.setMonth(0)
  return timeFormat(date)
}

/* 获取指定日期的周的第一天、月的第一天、季的第一天、年的第一天 END */

/**
 * @description 结束时间是否小于开始时间
 * @param sTime 开始时间
 * @param eTime 结束时间
 * @constructor
 */
export function ETimeIsLessStime(sTime, eTime) {
  const startTime = new Date(sTime).getTime()
  const endTime = new Date(eTime).getTime()
  return endTime > startTime
}
/**
 * @description 动环多条历史数据
 * @param chartList 历史数组对象
 * @param tempXData echart x轴临时数据填充
 * @constructor
 */
export function setRingHistoryChart(chartList, tempXData, matchField = 'average', date) {
  if (!chartList) throw new Error('chartList not')
  let data = []
  let preVal = 0
  for (let i = 0; i < tempXData.length; i++) {
    const idx = chartList.find(it => it['hyCtime'] === tempXData[i]['hyCtime'])
    let val = ''
    if (idx) {
      val = idx['hyType'] === 0 ? +idx['hyValInt'] : idx['hyType'] === 1 ? +idx['hyValInt'] : +idx['hyVal']
      if (idx['hyType'] === 3 && +idx['hyVal'] === 0) {
        val = preVal
      }
    } else val = preVal

    data.push(val)
    preVal = val
  }
  return data
}

export function setRingHistoryAlarm(chartList, tempXData, matchField = 'average', date) {
  if (!chartList) throw new Error('chartList not')
  if (!tempXData)tempXData = Array(24).fill(0)
  let max = 0
  if (tempXData.length === 24)max = new Date().getHours()
  // if (tempXData.length === 60)max = new Date().getMinutes()
  if (date && +new Date().getDate() > +new Date(date).getDate()) {
    max = tempXData.length
  }
  return tempXData.map((i, index) => {
    const idx = chartList.find(it => it['time'] === index)
    if (idx) return +idx[matchField]
    else if (index > max) return ''
    else return 0
  })
}

export function tableAddDeleteList(initSelectList, selectList, field) {
  const addList = []; const deleteList = []
  for (const selectListElement of selectList) {
    const idx = initSelectList.find(it => it[field] === selectListElement[field])
    if (!idx) addList.push(selectListElement)
  }
  for (const selectListElement of initSelectList) {
    const idx = selectList.find(it => it[field] === selectListElement[field])
    if (!idx) deleteList.push(selectListElement)
  }
  return { addList, deleteList }
}

// 百分比计算
export function percentage(num, total) {
  if (num === 0 || total === 0) {
    return 0
  }
  return (Math.round(num / total * 10000) / 100.00)// 小数点后两位百分比
}

// 去除字符串中特殊字符~!@#$^-&*()=|{}':;',\[].<>/?~！@#￥……&*（）——|{}【】'；：""'。，、？
export function trimSpecial(string) {
  // 替换字符串中的所有特殊字符（包含空格）
  if (string !== '') {
    const pattern = /[`~!@#$^\-&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g
    string = string.replace(pattern, '')
  }
  return string
}

/**
 * @description 根据单位切割单位以及单位后缀
 * @param unit
 * @returns {{unit, splitUnit, suffix: string}}
 */
export function getDataUnitAndSuffix(unit) {
  let suffix = ''
  let splitUnit = unit
  if (unit.indexOf('ps') !== -1) {
    splitUnit = unit.split('ps')[0]
    suffix = `ps`
  }
  if (unit.indexOf('/') !== -1) {
    splitUnit = unit.split('/')[0]
    suffix = `/${unit.split('/')[1]}`
  }
  return {
    suffix,
    splitUnit,
    unit
  }
}

/**
 * @description 根据json数据进行排序
 * @param data 数据字段
 * @param rev true为升序 false为降序
 * @returns {(function(*, *): (*|undefined))|*}
 */
export function sortJsonData(data, rev) {
  if (rev === undefined) {
    rev = 1
  } else {
    rev = (rev) ? 1 : -1
  }
  return function(a, b) {
    for (var i = 0; i < data.length; i++) {
      let attr = data[i]
      if (a[attr] !== b[attr]) {
        if (a[attr] > b[attr]) {
          return rev * 1
        } else {
          return rev * -1
        }
      }
    }
  }
}

/**
 * @description 深拷贝数据
 * @param data 拷贝数据
 * @returns {Boolean|Date|*[]|string|*|number|{}}
 */
export function deepCopy(data) {
  // string,number,bool,null,undefined,symbol
  // object,array,date
  if (data && typeof data === 'object') {
    // 针对函数的拷贝
    if (typeof data === 'function') {
      let tempFunc = data.bind(null)
      tempFunc.prototype = deepCopy(data.prototype)
      return tempFunc
    }

    switch (Object.prototype.toString.call(data)) {
      case '[object String]':
        return data.toString()
      case '[object Number]':
        return Number(data.toString())
      case '[object Boolean]':
        return Boolean(data.toString())
      case '[object Date]':
        return new Date(data.getTime())
      case '[object Array]':
        var arr = []
        for (let i = 0; i < data.length; i++) {
          arr[i] = deepCopy(data[i])
        }
        return arr

      // js自带对象或用户自定义类实例
      case '[object Object]':
        var obj = {}
        for (let key in data) {
          // 会遍历原型链上的属性方法，可以用hasOwnProperty来控制 （obj.hasOwnProperty(prop)
          obj[key] = deepCopy(data[key])
        }
        return obj
    }
  } else {
    // string,number,bool,null,undefined,symbol
    return data
  }
}

/**
 * @description 获取窗口高度
 */
export function getClientHeight() {
  if (document.body.clientHeight && document.documentElement.clientHeight) {
    return (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
  } else {
    return (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
  }
}

/**
 * @description json字段排序 从小到大
 * @param property 字段
 * @returns {function(*, *)}
 */
export function compareJsonDataByProperty(property) {
  return function(a, b) {
    const value1 = a[property]
    const value2 = b[property]
    return value1 - value2
  }
}

/**
 * @description 静态资源域名
 */
export function staticResourceHost() {
  if (process.env.NODE_ENV === 'development') {
    return process.env.VUE_APP_BASE_API
  } else {
    return ''
  }
}

/**
 * @description 获取月份第一天
 * @param year 年份
 * @param month 月份
 */
export function getFirstDay(year, month) {
  const y = +year || new Date().getFullYear() // 获取年份
  let m = +month || new Date().getMonth() + 1 // 获取月份
  const d = '01'
  m = m < 10 ? '0' + m : m // 月份补 0

  return {
    text: [y, m, d].join('-'),
    y, m, d
  }
}

/**
 * @description 获取月份最后一天
 * @param year 年份
 * @param month 月份
*/
export function getLastDay(year, month) {
  const y = +year || new Date().getFullYear() // 获取年份
  let m = +month || new Date().getMonth() + 1 // 获取月份
  let d = new Date(y, m, 0).getDate() // 获取当月最后一日
  m = m < 10 ? '0' + m : m // 月份补 0
  d = d < 10 ? '0' + d : d // 日数补 0

  return {
    text: [y, m, d].join('-'),
    y, m, d
  }
}

/**
 * @description 查询星期几
 * @param date 日期对象 没有传就查当前
 */
export function dayWeek(date) {
  const week = ['日', '一', '二', '三', '四', '五', '六']
  const dateObjectIndex = date ? date.getDay() : new Date().getDay()
  return week[dateObjectIndex]
}

/**
 * @description 去除字符串末尾空格
 * @param text 字符串
 */
export function delTextEndBlankSpace(text) {
  return text.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
}

/**
 * @description 倒推多少个月
 * @param monthNum 多少个月
 */
export function getLastMonth(dateObject, monthNum = 1) {
  let today = dateObject || new Date() // 当天
  today.setMonth(today.getMonth() - monthNum)
  const Y = today.getFullYear()
  const M = today.getMonth() + 1
  const D = today.getDate()
  const h = today.getHours()
  const m = today.getMinutes()
  const s = today.getSeconds()
  return { Y, M, D, h, m, s, ymd: `${Y}-${M}-${D}`, ymdhms: `${Y}-${M}-${D} ${h}:${m}:${s}` }
}

/**
 * @description 秒转换为时分秒
 * @param value 秒
 */
export function formatSeconds(value) {
  var secondTime = parseInt(value)// 秒
  var minuteTime = 0// 分
  var hourTime = 0// 小时
  if (secondTime > 60) { // 如果秒数大于60，将秒数转换成整数
    // 获取分钟，除以60取整数，得到整数分钟
    minuteTime = parseInt(secondTime / 60)
    // 获取秒数，秒数取佘，得到整数秒数
    secondTime = parseInt(secondTime % 60)
    // 如果分钟大于60，将分钟转换成小时
    if (minuteTime > 60) {
      // 获取小时，获取分钟除以60，得到整数小时
      hourTime = parseInt(minuteTime / 60)
      // 获取小时后取佘的分，获取分钟除以60取佘的分
      minuteTime = parseInt(minuteTime % 60)
    }
  }
  var result = '' + parseInt(secondTime) + '秒'

  if (minuteTime > 0) {
    result = '' + parseInt(minuteTime) + '分' + result
  }
  if (hourTime > 0) {
    result = '' + parseInt(hourTime) + '小时' + result
  }
  return result
}

/**
 * @description 两个日期之间有多少个小时
 * @param dt1
 * @param dt2
 * @returns {number}
 */
export function getHoursDiff(dt1, dt2) {
  if (typeof (dt1) === 'string') {
    dt1 = new Date(dt1)
    dt2 = new Date(dt2)
  }
  const res = dt2 - dt1
  if (isNaN(res)) { throw Error('invalid dates arguments') }
  return res / (1000 * 60 * 60)
}

/**
 * 获取当前年份的第一天和最后一天
 */
export function getYearFirstLastDay() {
  const firstDay = new Date()
  firstDay.setDate(1)
  firstDay.setMonth(0)
  const lastDay = new Date()
  // lastDay.setFullYear(lastDay.getFullYear() + 1)
  lastDay.setMonth(12)
  lastDay.setDate(0)
  return {
    firstDay, lastDay
  }
}

/**
 * @description 查询日期是不是在区间内
 * @param startDate
 * @param endDate
 * @param checkDate
 * @returns {boolean}
 */
export function checkDateInFixedDates(startDate, endDate, checkDate) {
  if (startDate === '' || endDate === '' || checkDate === '') {
    console.log('起止日期和检查日期均不可为空')
    return
  }
  const ds = new Date(startDate).getTime()
  const de = new Date(endDate).getTime()
  const dc = new Date(checkDate).getTime()
  if (dc >= ds && dc <= de) {
    return true
  } else {
    return false
  }
}

// 设置浏览器标题
export function setBrowserTitle() {
  const sysName = localStorageOperation('get', 'sysName')
  const metaTitle = localStorageOperation('get', 'metaTitle')
  let title = ''
  if (sysName !== null && sysName !== 'undefined' && metaTitle !== null && metaTitle !== 'undefined') {
    title = defaultSettings.title || ' '
  } else {
    title = ''
  }
  if (metaTitle !== null && metaTitle !== 'undefined') title = metaTitle
  if (sysName !== null) {
    if (title.length > 0) {
      title = `${title} - ${sysName}`
    } else {
      title = `${sysName}`
    }
  }

  document.title = title
}

/**
 * @description 两个日期相差的年月日时分秒
 * @param startTime
 * @param endTime
 * @returns {{month: number, hour: number, year: number, day: number, minute: number, second: number}}
 */
export function calculateDiffTime(startTime, endTime) {
  let runTime = parseInt((endTime - startTime) / 1000)
  var year = Math.floor(runTime / 86400 / 365)
  runTime = runTime % (86400 * 365)
  var month = Math.floor(runTime / 86400 / 30)
  runTime = runTime % (86400 * 30)
  var day = Math.floor(runTime / 86400)
  runTime = runTime % 86400
  var hour = Math.floor(runTime / 3600)
  runTime = runTime % 3600
  var minute = Math.floor(runTime / 60)
  runTime = runTime % 60
  var second = runTime
  return {
    year, month, day, hour, minute, second
  }
}

// 随机生成16进制颜色
export function randomHexColor() {
  var hex = Math.floor(Math.random() * 16777216).toString(16)
  // 生成ffffff以内16进制数
  while (hex.length < 6) {
    // while循环判断hex位数，少于6位前面加0凑够6位
    hex = '0' + hex
  }
  return '#' + hex // 返回‘#'开头16进制颜色
}

/**
 * @description 根据json某个相同字段值归类json数据
 * @param data
 * @param field
 * @returns {{}|null}
 */
export function classifiedJSONDataByField(data, field) {
  const x = {}
  if (!data) return null
  data.forEach(item => {
    let key = item[`${field}`]
    if (x[`${key}`]) {
      x[`${key}`].push(item)
    } else {
      x[`${key}`] = [item]
    }
  })
  return x
}
