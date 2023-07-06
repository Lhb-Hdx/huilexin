<template>
  <div class="monitor-device">
    <!-- 概况 -->
    <monitorHostInfo
      :up-status="upStatus"
      :usability="usability"
      :up-time="upTime"
    />
    <div class="margin-left-7-5 margin-right-7-5">
      <!-- 命中率折线图 -->
      <monitorMiddlewareHit :hit-data="hitData" />
    </div>
    <div class="chunk margin-left-7-5 margin-right-7-5">
      <!-- 请求和提交折线图 -->
      <monitorMiddlewareRs :rs-data="rsData" />
      <!-- 服务器接收和发送 -->
      <monitorMiddlewareServerRs :server-rs-data="serverRsData" />
    </div>
    <div class="chunk margin-left-7-5 margin-right-7-5">
      <!-- 自定义监控项趋势图 -->
      <template v-for="item in diyItem">
        <DiyMonitorItemEchart v-if="Number(item.graphType) === 1" :key="item.id" :monitor-item="item" />
        <DiyMonitorItemDash v-if="Number(item.graphType) === 3" :key="item.id" :monitor-item="item" />
      </template>
    </div>
    <!-- 自定义监控项表单 -->
    <DiyMonitorItemForm v-if="isConfig" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import monitorHostInfo from '../../common/monitor-host-info'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd.js'
import { isJSONString, dateFormat, conversionData } from '@/utils/utils'
import monitorMiddlewareHit from './monitor-middleware-hit'
import monitorMiddlewareRs from './monitor-middleware-rs'
import monitorMiddlewareServerRs from './monitor-middleware-server-rs'
import DiyMonitorItemForm from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-form'
import DiyMonitorItemEchart from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-echart'
import DiyMonitorItemDash from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-dash'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorMiddleware',
  components: {
    monitorHostInfo,
    monitorMiddlewareHit,
    DiyMonitorItemForm,
    monitorMiddlewareRs,
    monitorMiddlewareServerRs,
    DiyMonitorItemEchart,
    DiyMonitorItemDash
  },
  mixins: [MonitorDataMixin],
  props: {
    usability: {
      type: Number,
      default() {
        return 0
      }
    },
    propAgent: {
      type: Number,
      default() {
        return 0
      }
    },
    propZbxHostId: {
      type: Number,
      default() {
        return 0
      }
    }
  },
  data() {
    return {
      setHyitShowSurveyInterval: null, // 获取各项数据统计的定时器
      requestInterval: 10000, // 获取统计数据间隔 毫秒
      upStatus: 0, // 设备的运行状态
      upTime: '', // 设备的运行时间
      hitData: { // 命中率数据
        units: '', // 单位
        active: 0, // 值
        value: [], // 值
        urlValue: [], // url值
        hitUnits: [],
        urlHitUnits: [],
        time: [], // 当前时间
        hitValueType: '',
        hitItemId: ''
      },
      rsData: { // 请求和提交数据
        units: '', // 单位
        active: 0, // 值
        value: [], // 值
        rsUnits: [],
        time: [] // 当前时间
      },
      serverRsData: { // 服务器接收和发送数据
        units: '', // 单位
        recActive: 0, // 接收数值
        sentActive: 0, // 发送数值
        totalActive: 0, // 收发总数值
        receivedvalue: [],
        sentvalue: [],
        totalvalue: [],
        recUnits: [],
        sentUnits: [],
        totalUnits: [],
        time: [] // 当前时间
      },
      diyItem: [],
      initGetMonitorItemHistoryData: false
    }
  },
  computed: {
    agent() {
      if (this.propAgent === 0) {
        return this.$route.query.agent
      } else {
        return String(this.propAgent)
      }
    },
    zbxHostId() {
      if (this.propZbxHostId === 0) {
        return this.$route.query.zbxHostId
      } else {
        return String(this.propZbxHostId)
      }
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    },
    id() { return this.$route.query.id },
    isConfig() { return this.$route.query.isConfig }
  },
  destroyed() {
    // 组件卸载关闭定时器轮巡
    clearInterval(this.setHyitShowSurveyInterval)
  },
  beforeDestroy() {
    this.batchOffEventBus('delete-item-switch,add-item-switch')
  },
  mounted() {
    this.itMonitorRequireAgreement === 'WS' ? this.agentGetHostShowByWs() : this.agentGetHostShow()
    const that = this
    this.setHyitShowSurveyInterval = setInterval(() => {
      this.itMonitorRequireAgreement === 'WS' ? that.agentGetHostShowByWs() : that.agentGetHostShow()
    }, this.requestInterval)
    this.findHyitHostGraphShow()
    this.$EventBus.$on('delete-item-switch', () => {
      this.findHyitHostGraphShow()
    })
    this.$EventBus.$on('add-item-switch', () => {
      this.findHyitHostGraphShow()
    })
  },
  methods: {
    watchAgentGetHostShow(res) {
      const currentAllMonitorItemIds = []
      const currentAllMonitorItemValueTypes = []
      if (res['tomcat apache'].length > 0) {
        // 运行状态
        this.upStatus = res['tomcat apache'].length > 0 ? 1 : 0
        // =======================================  apache命中率  =========================================

        // =====================================   apache请求和提交数   ====================================
        let apacheRequestNum = [] // 请求
        // let submit = [] // 提交
        res['tomcat apache'].forEach(item => {
          if (item.itemName === '\"http-nio-80\": Requests per second') {
            apacheRequestNum.push(item)
          }
        })
        const rsRequest = (Number(apacheRequestNum[0].itemValue)).toFixed(0)
        if (apacheRequestNum.length > 0) {
          this.$set(this.rsData, 'active', rsRequest)
          this.$set(this.rsData, 'value', rsRequest)

          this.$set(this.rsData, 'rsItemId', apacheRequestNum[0].itemid)
          this.$set(this.rsData, 'rsValueType', apacheRequestNum[0].valueType)
          this.$set(this.rsData, 'rsOriginalUnit', '')

          const rsClock = new Date()
          this.$set(this.rsData.time, this.rsData.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', rsClock)}`)

          // ===================================   apache 服务器接受和发送   =================================
          let apacheReceivedNum = [] // 接收数
          let apacheSentNum = [] // 发送数
          let apacheTotalNum = [{}] // 收发总数
          res['tomcat apache'].forEach(item => {
            if (item.itemName === '\"http-nio-80\": Bytes received per second') {
              apacheReceivedNum.push(item)
            } else if (item.itemName === '\"http-nio-80\": Bytes sent per second') {
              apacheSentNum.push(item)
            }
          })
          this.$set(this.serverRsData, 'judge', 'apache')
          // 收发总数没有数据暂且不填
          // apacheTotalNum[0].size = Number(apacheReceivedNum[0].itemValue) + Number(apacheSentNum[0].itemValue)
          // apacheTotalNum[0].itemid = apacheReceivedNum[0].itemid
          // apacheTotalNum[0].valueType = apacheReceivedNum[0].valueType

          const receivedVal = conversionData('data', Number(apacheReceivedNum[0].itemValue), 'b') // 转换单位后接收数
          const sentVal = conversionData('data', Number(apacheSentNum[0].itemValue), 'b') // 转换单位后发送数
          const totalVal = conversionData('data', Number(apacheTotalNum), 'b') // 转换单位后收发总数
          this.$set(this.serverRsData, 'recActive', receivedVal.size)
          this.$set(this.serverRsData, 'sentActive', sentVal.size)
          this.$set(this.serverRsData, 'totalActive', totalVal.size)
          this.$set(this.serverRsData.recUnits, this.serverRsData.recUnits.length, apacheReceivedNum[0].units)
          this.$set(this.serverRsData.sentUnits, this.serverRsData.sentUnits.length, apacheSentNum[0].units)
          // this.$set(this.serverRsData.totalUnits, this.serverRsData.totalUnits.length, apacheTotalNum[0].units)

          this.$set(this.serverRsData.receivedvalue, this.serverRsData.receivedvalue.length, receivedVal.size)
          this.$set(this.serverRsData.sentvalue, this.serverRsData.sentvalue.length, sentVal.size)
          this.$set(this.serverRsData.totalvalue, this.serverRsData.totalvalue.length, totalVal.size)

          this.$set(this.serverRsData, 'receivedItemId', apacheReceivedNum[0].itemid)
          this.$set(this.serverRsData, 'receivedValueType', apacheReceivedNum[0].valueType)
          this.$set(this.serverRsData, 'receivedOriginalUnit', apacheReceivedNum[0].units)

          this.$set(this.serverRsData, 'sentItemId', apacheSentNum[0].itemid)
          this.$set(this.serverRsData, 'sentValueType', apacheSentNum[0].valueType)
          this.$set(this.serverRsData, 'sentOriginalUnit', apacheSentNum[0].units)

          this.$set(this.serverRsData, 'totalItemId', apacheTotalNum[0].itemid)
          this.$set(this.serverRsData, 'totalValueType', apacheTotalNum[0].valueType)
          this.$set(this.serverRsData, 'totalOriginalUnit', apacheTotalNum[0].units)

          const serverRsClock = new Date()
          this.$set(this.serverRsData.time, this.serverRsData.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', serverRsClock)}`)
        }
      } else {
        // 概况数据
        if (res['IIS net']) {
        // 运行状态
          this.upStatus = res['IIS net'].length > 0 ? Number(res['IIS net'][0].itemValue) : 0
        }

        // =======================================  IIS命中率  =========================================
        let serverCacheHitRate = [] // 服务器缓存命中率
        let URLHitRate = [] // url缓存命中率
        if (res['IIS perf'].length > 0) {
          res['IIS perf'].forEach(item => {
            if (item.itemName === 'IIS: Files cache hits percentage') {
              serverCacheHitRate.push(item)
            } else if (item.itemName === 'IIS: URIs cache hits percentage') {
              URLHitRate.push(item)
            }
          })
        }
        const serverHitRate = (Number(serverCacheHitRate[0].itemValue)).toFixed(2)
        const urlHitRate = (Number(URLHitRate[0].itemValue)).toFixed(2)
        if (serverCacheHitRate.length > 0 && URLHitRate.length > 0) {
          this.$set(this.hitData, 'active', serverHitRate)
          this.$set(this.hitData, 'urlActive', urlHitRate)
          this.$set(this.hitData.value, this.hitData.value.length, serverHitRate)
          this.$set(this.hitData.urlValue, this.hitData.urlValue.length, urlHitRate)
          this.$set(this.hitData.hitUnits, this.hitData.hitUnits.length, serverCacheHitRate[0].units)
          this.$set(this.hitData.urlHitUnits, this.hitData.urlHitUnits.length, URLHitRate[0].units)

          this.$set(this.hitData, 'hitItemId', serverCacheHitRate[0].itemid)
          this.$set(this.hitData, 'hitValueType', serverCacheHitRate[0].valueType)
          this.$set(this.hitData, 'hitOriginalUnit', '%')

          this.$set(this.hitData, 'urlHitItemId', URLHitRate[0].itemid)
          this.$set(this.hitData, 'urlHitValueType', URLHitRate[0].valueType)
          this.$set(this.hitData, 'urlHitOriginalUnit', '%')

          const clock = new Date()
          this.$set(this.hitData.time, this.hitData.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        }

        // =====================================   IIS请求和提交数   ====================================
        let requestNum = [] // 请求
        // let submit = [] // 提交
        if (res['IIS perf'].length > 0) {
          res['IIS perf'].forEach(item => {
            if (item.itemName === 'IIS: Method Total requests per second') {
              requestNum.push(item)
            }
          })
        }
        const rsRequest = (Number(requestNum[0].itemValue)).toFixed(0)
        if (requestNum.length > 0) {
          this.$set(this.rsData, 'active', rsRequest)
          this.$set(this.rsData, 'value', rsRequest)

          this.$set(this.rsData, 'rsItemId', requestNum[0].itemid)
          this.$set(this.rsData, 'rsValueType', requestNum[0].valueType)
          this.$set(this.rsData, 'rsOriginalUnit', '')

          const rsClock = new Date()
          this.$set(this.rsData.time, this.rsData.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', rsClock)}`)
        }

        // ===================================   IIS服务器接受和发送   =================================
        let receivedNum = [] // 接收数
        let sentNum = [] // 发送数
        let totalNum = [] // 收发总数
        if (res['IIS perf'].length > 0) {
          res['IIS perf'].forEach(item => {
            if (item.itemName === 'IIS: Bytes Received per second') {
              receivedNum.push(item)
            } else if (item.itemName === 'IIS: Bytes Sent per second') {
              sentNum.push(item)
            } else if (item.itemName === 'IIS: Bytes Total per second') {
              totalNum.push(item)
            }
          })
        }
        const receivedVal = conversionData('data', Number(receivedNum[0].itemValue), 'b') // 转换单位后接收数
        const sentVal = conversionData('data', Number(sentNum[0].itemValue), 'b') // 转换单位后发送数
        const totalVal = conversionData('data', Number(totalNum[0].itemValue), 'b') // 转换单位后收发总数
        this.$set(this.serverRsData, 'recActive', receivedVal.size)
        this.$set(this.serverRsData, 'sentActive', sentVal.size)
        this.$set(this.serverRsData, 'totalActive', totalVal.size)
        this.$set(this.serverRsData.recUnits, this.serverRsData.recUnits.length, receivedNum[0].units)
        this.$set(this.serverRsData.sentUnits, this.serverRsData.sentUnits.length, sentNum[0].units)
        this.$set(this.serverRsData.totalUnits, this.serverRsData.totalUnits.length, totalNum[0].units)

        this.$set(this.serverRsData.receivedvalue, this.serverRsData.receivedvalue.length, receivedVal.size)
        this.$set(this.serverRsData.sentvalue, this.serverRsData.sentvalue.length, sentVal.size)
        this.$set(this.serverRsData.totalvalue, this.serverRsData.totalvalue.length, totalVal.size)

        this.$set(this.serverRsData, 'receivedItemId', receivedNum[0].itemid)
        this.$set(this.serverRsData, 'receivedValueType', receivedNum[0].valueType)
        this.$set(this.serverRsData, 'receivedOriginalUnit', receivedNum[0].units)

        this.$set(this.serverRsData, 'sentItemId', sentNum[0].itemid)
        this.$set(this.serverRsData, 'sentValueType', sentNum[0].valueType)
        this.$set(this.serverRsData, 'sentOriginalUnit', sentNum[0].units)

        this.$set(this.serverRsData, 'totalItemId', totalNum[0].itemid)
        this.$set(this.serverRsData, 'totalValueType', totalNum[0].valueType)
        this.$set(this.serverRsData, 'totalOriginalUnit', totalNum[0].units)

        const serverRsClock = new Date()
        this.$set(this.serverRsData.time, this.serverRsData.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', serverRsClock)}`)
      }
      if (!this.initGetMonitorItemHistoryData) {
        if (this.hitData.hitItemId !== '' && this.hitData.hitValueType !== '') {
          currentAllMonitorItemIds.push(this.hitData.hitItemId)
          currentAllMonitorItemValueTypes.push(this.hitData.hitValueType)
        }
        if (this.rsData.rsItemId !== '' && this.rsData.rsValueType !== '') {
          currentAllMonitorItemIds.push(this.rsData.rsItemId)
          currentAllMonitorItemValueTypes.push(this.rsData.rsValueType)
        }
        if (this.serverRsData.receivedItemId !== '' && this.serverRsData.receivedValueType !== '') {
          currentAllMonitorItemIds.push(this.serverRsData.receivedItemId)
          currentAllMonitorItemValueTypes.push(this.serverRsData.receivedValueType)
        }
        if (this.serverRsData.sentItemId !== '' && this.serverRsData.sentValueType !== '') {
          currentAllMonitorItemIds.push(this.serverRsData.sentItemId)
          currentAllMonitorItemValueTypes.push(this.serverRsData.sentValueType)
        }
        console.log(currentAllMonitorItemIds)
        console.log(currentAllMonitorItemValueTypes)
        this.initGetMonitorItemHistoryData = true
        this.getMonitorItemHistoryData(this.agent, currentAllMonitorItemIds.toString(), currentAllMonitorItemValueTypes.toString())
      }
    },
    // 获取监控项数据 http
    agentGetHostShow() {
      request({ url: api, data: { agent: this.agent, hostid: this.zbxHostId }}).then(res => {
        if (res.code === 1) {
          this.watchAgentGetHostShow(res.map)
        }
      })
    },
    // 获取监控项数据 websocket
    agentGetHostShowByWs() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetMiddlewareData,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: this.agent,
          fromAgent: this.localStorageOperation('get', 'fromAgent'),
          hostid: this.zbxHostId,
          fromHostId: this.localStorageOperation('get', 'fromHostId')
        }
      },
      (res) => {
        const wsRes = isJSONString(res.HostStorageData) ? JSON.parse(res.HostStorageData) : res.HostStorageData
        if (wsRes) {
          this.watchAgentGetHostShow(wsRes)
        }
      }, (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },
    // 查询显示配置
    findHyitHostGraphShow() {
      request({
        url: api.itMonitor.findHyitHostGraphShow, data: { hostId: this.id, zhostId: this.zbxHostId, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.$EventBus.$emit('get-graph-show', res.data)
          const diyItem = []
          res.data.forEach(item => {
            if (Number(item.type) === 2) {
              diyItem.push(item)
            }
          })
          this.diyItem = diyItem
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>

