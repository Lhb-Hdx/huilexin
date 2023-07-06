<template>
  <div class="monitor-device">
    <!-- 概况 -->
    <monitorHostInfo
      :up-status="upStatus"
      :usability="usability"
      :up-time="upTime"
      :device-server-run-time="deviceServerRunTime"
    />
    <ItemBoxCard>
      <sdwanEventPerEchart
        :prop-agent="propAgent"
        :prop-zbx-host-id="propZbxHostId"
        :up-data-directive-id="upDataDirectiveId"
        @emitPerData="getEmitPerData"
      />
      <sdwanEventLineEchart
        :prop-agent="propAgent"
        :prop-zbx-host-id="propZbxHostId"
        :select-level-data="selectLevelData"
      />
    </ItemBoxCard>
    <sdwanPort
      :prop-agent="propAgent"
      :prop-zbx-host-id="propZbxHostId"
      :up-data-directive-id="upDataDirectiveId"
    />
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
import sdwanPort from './sdwan-port'
import sdwanEventPerEchart from './sdwan-event-per-echart'
import ItemBoxCard from '../component/item-box-card'
import sdwanEventLineEchart from './sdwan-event-line-echart'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import { isJSONString } from '@/utils/utils'
import DiyMonitorItemForm from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-form'
import DiyMonitorItemEchart from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-echart'
import DiyMonitorItemDash from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-dash'

export default {
  name: 'SDWAN',
  components: {
    monitorHostInfo,
    sdwanPort,
    sdwanEventPerEchart,
    sdwanEventLineEchart,
    ItemBoxCard,
    DiyMonitorItemForm,
    DiyMonitorItemEchart,
    DiyMonitorItemDash
  },
  props: {
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
      requestInterval: 5000, // 获取统计数据间隔 毫秒
      /* 传递给子组件的数据 START */
      upStatus: 0, // 设备的运行状态
      upTime: '', // 设备的运行时间
      deviceSN: '', // 设备SN
      deviceServerRunTime: '', // 服务运行时长
      usability: 0,
      /* 传递给子组件的数据 END */
      upDataDirectiveId: this.$tool.guid(), // 请求更新数据指令
      selectLevelData: null,
      diyItem: []
    }
  },
  computed: {
    agent() {
      return this.$route.query.agent
    },
    zbxHostId() {
      return this.$route.query.zbxHostId
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    },
    isConfig() { return this.$route.query.isConfig }
  },
  destroyed() {
    // 组件卸载关闭定时器轮巡
    clearInterval(this.setHyitShowSurveyInterval)
    this.batchOffEventBus('delete-item-switch,add-item-switch')
  },
  mounted() {
    this.itMonitorRequireAgreement === 'WS' ? this.agentGetHostDataByWS() : this.agentGetHostData()
    const that = this
    this.setHyitShowSurveyInterval = setInterval(() => {
      that.itMonitorRequireAgreement === 'WS' ? that.agentGetHostDataByWS() : that.agentGetHostData()
      that.upDataDirectiveId = that.$tool.guid()
    }, this.requestInterval)
    if (this.itMonitorRequireAgreement === 'WS') {
      window.addEventListener('watchWsMessage', (res) => {
        if (res.detail.data.cmd === 'it-agentGetHostData-websocket' && res.detail.data.methed === 'getItemSdwanSystemInfoData') {
          const wsRes = isJSONString(res.detail.data.HostData) ? JSON.parse(res.detail.data['getItemSdwanSystemInfoData']) : res.detail.data['getItemSdwanSystemInfoData']
          if (wsRes) {
            this.watchAgentGetHostShow(wsRes)
          }
        }
      })
    }
    this.findHyitHostGraphShow()
    this.$EventBus.$on('delete-item-switch', () => {
      this.findHyitHostGraphShow()
    })
    this.$EventBus.$on('add-item-switch', () => {
      this.findHyitHostGraphShow()
    })
  },
  methods: {
    // 监听it监控数据返回
    watchAgentGetHostShow(res) {
      const upTime = this.$tool.findDataItemByAttr(res, 'itemName', 'ApplianceApplianceUptime')
      this.upTime = upTime ? this.$tool.sToYMD(Number(upTime.itemValue)) : ''
      const deviceServerRunTime = this.$tool.findDataItemByAttr(res, 'itemName', 'ApplianceServiceUptime')
      this.deviceServerRunTime = deviceServerRunTime ? this.$tool.sToYMD(Number(deviceServerRunTime.itemValue)) : ''
      const ping = this.$tool.findDataItemByAttr(res, 'itemName', 'ICMP ping状态')
      this.usability = ping ? Number(ping.itemValue) : 0
      const state = this.$tool.findDataItemByAttr(res, 'itemName', 'ApplianceState')
      this.upStatus = state ? Number(state.itemValue) === 2 ? 1 : 0 : 0
    },
    // 获取主机数据 http
    agentGetHostData() {
      request({ url: api.itMonitor.agentGetHostData, data: { agent: this.agent, hostid: this.zbxHostId, method: 'getItemSdwanSystemInfoData' }}).then(async res => {
        if (res.code === 1 && res.model) {
          if (this.$tool.isJSONString(res.model)) {
            const sdwanInfoData = JSON.parse(res.model)
            const upTime = this.$tool.findDataItemByAttr(sdwanInfoData, 'itemName', 'ApplianceApplianceUptime')
            this.upTime = upTime ? this.$tool.sToYMD(Number(upTime.itemValue)) : ''
            const deviceServerRunTime = this.$tool.findDataItemByAttr(sdwanInfoData, 'itemName', 'ApplianceServiceUptime')
            this.deviceServerRunTime = deviceServerRunTime ? this.$tool.sToYMD(Number(deviceServerRunTime.itemValue)) : ''
            const ping = this.$tool.findDataItemByAttr(sdwanInfoData, 'itemName', 'ICMP ping状态')
            this.usability = ping ? Number(ping.itemValue) : 0
            const state = this.$tool.findDataItemByAttr(sdwanInfoData, 'itemName', 'ApplianceState')
            this.upStatus = state ? Number(state.itemValue) === 2 ? 1 : 0 : 0
          }
        }
      })
    },
    // 获取主机数据 websocket
    agentGetHostDataByWS() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHostData,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: this.agent,
          hostid: this.zbxHostId,
          fromAgent: this.localStorageOperation('get', 'fromAgent'),
          methed: 'getItemSdwanSystemInfoData',
          fromHostId: this.localStorageOperation('get', 'fromHostId')
        }
      },
      (res) => {
        const wsRes = isJSONString(res['getItemSdwanSystemInfoData']) ? JSON.parse(res['getItemSdwanSystemInfoData']) : res['getItemSdwanSystemInfoData']
        if (wsRes) {
          this.watchAgentGetHostShow(wsRes)
        }
      }, (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },
    getEmitPerData(val) {
      this.selectLevelData = val
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

