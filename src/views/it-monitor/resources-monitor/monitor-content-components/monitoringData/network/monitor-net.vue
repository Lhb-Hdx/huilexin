<template>
  <div class="monitor-device">
    <!-- 概况 -->
    <monitorHostInfo
      v-if="isShowWatchItem('hostInfo')"
      :up-status="upStatus"
      :usability="usability"
      :up-time="upTime"
    />
    <!-- 警报 -->
    <monitorAlarm />
    <!-- 板卡 -->
    <monitorNetCpuUsage
      :board-card-status="boardCardStatus"
    />
    <div class="chunk margin-left-7-5 margin-right-7-5">
      <!-- 风扇状态 -->
      <monitorNetFanStatus
        :fan-status="fanStatus"
      />
      <!-- 电源状态 -->
      <monitorNetPowerStatus
        :power-status="powerStatus"
      />
    </div>
    <!-- 端口 -->
    <monitorNetList
      :port-data="portData"
      :is-show-tab="true"
      :is-show-optical-module="true"
      :prop-agent="propAgent"
      :prop-zbx-host-id="propZbxHostId"
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
import monitorHostInfo from '../../common/monitor-host-info'
import monitorAlarm from '../../common/monitor-alarm'
import monitorNetCpuUsage from './monitor-net-board'
import monitorNetFanStatus from './monitor-net-fan-status'
import monitorNetPowerStatus from './monitor-net-power-status'
import monitorNetList from '../component/monitor-board-port'
import request from '@/utils/request'
import api from '@/api/api'
import { conversionSymbols, isJSONString, sToYMD } from '@/utils/utils'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import DiyMonitorItemForm
  from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-form'
import DiyMonitorItemEchart
  from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-echart'
import DiyMonitorItemDash
  from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-dash'

export default {
  components: {
    monitorAlarm,
    monitorHostInfo,
    monitorNetList,
    monitorNetCpuUsage,
    monitorNetFanStatus,
    monitorNetPowerStatus,
    DiyMonitorItemForm,
    DiyMonitorItemEchart,
    DiyMonitorItemDash
  },
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
      requestInterval: 5000, // 获取统计数据间隔 毫秒
      /* 传递给子组件的数据 START */
      upStatus: 0, // 设备的运行状态
      upTime: '', // 设备的运行时间
      boardCardStatus: [], // 板卡统计信息
      fanStatus: [], // 风扇状态统计信息
      powerStatus: [], // 电源状态统计信息
      portData: {}, // 端口数据
      physicalPort: [], // 物理端口
      logicPort: [], // 逻辑端口
      netList: [], // 当前显示的端口列表
      netListKey: 'physical', // 当前端口类型
      netListQuery: { // 端口列表分页
        page: 1,
        limit: 10,
        subKey: 'GigabitEthernet',
        total: 0
      },
      openMonitorNetListEchart: false,
      openMonitorBoardCardEchart: false,
      selectItemDetail: {}, // 选择的端口列表监控项信息
      selectBoardCardDetail: {}, // 选择的板卡监控项信息
      boardCardKey: 'TemperatureSensor', // 当前板卡统计图类型
      /* 传递给子组件的数据 END */
      diyItem: []
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
    isShowWatchItem() {
      return function(key) {
        return true
      }
    },
    id() { return this.$route.query.id },
    isConfig() { return this.$route.query.isConfig }
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
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostPort-websocket') {
        that.portData = isJSONString(res.detail.data.HostPortData) ? JSON.parse(res.detail.data.HostPortData)[0] : res.HostPortData
      }
    })
  },
  destroyed() {
    // 组件卸载关闭定时器轮巡
    clearInterval(this.setHyitShowSurveyInterval)
  },
  methods: {
    // 获取监控项数据
    async watchAgentGetHostShow(res) {
      if (res['ping']) {
        // 运行状态
        this.upStatus = res['ping'].length > 0 ? Number(res['ping'][0].itemValue) : 0
      }
      if (res['运行时间']) {
        // 运行时间
        this.upTime = res['运行时间'].length > 0 ? sToYMD(Number(res['运行时间'][0].itemValue)) : '0'
      }
      // 板卡
      console.log('res', res)
      // 根据cpu个数判断有几个板卡
      const cpu = res['cpu'].length > 0 ? res['cpu'] : [] // 板卡情况
      let cpuValueMap = []
      if (cpu.length > 0) {
        const idx = cpu.findIndex(cpuitem => cpuitem.itemName.indexOf('状态') !== -1)
        if (idx !== -1) {
          const getCpuValueMap = await this.agentGetValueMap(cpu[idx].itemid)
          if (isJSONString(getCpuValueMap)) {
            cpuValueMap = JSON.parse(getCpuValueMap)
          }
        }
      }
      cpu.forEach(item => {
        if (item.itemName.indexOf('CPU使用率') !== -1) {
          const itemName = conversionSymbols(item.itemName)
          const dataName = itemName.split('(')[0]
          const idx = this.boardCardStatus.findIndex(items => items.name === dataName)
          if (idx !== -1) {
            this.$set(this.boardCardStatus[idx], 'CPUUsage', item.itemValue)
          } else {
            this.$set(this.boardCardStatus, this.boardCardStatus.length, {
              itemid: item.itemid,
              name: dataName,
              CPUUsage: item.itemValue,
              CPUUsageItemId: item.itemid,
              CPUValueType: item.valueType
            })
          }
        }
        if (item.itemName.indexOf('状态') !== -1) {
          console.log(cpuValueMap)
          const cpuMap = this.$tool.findDataItemByAttr(cpuValueMap, 'value', item.itemValue)
          console.log(cpuMap)
          let valueText = ''
          let valueStatus = null
          if (cpuMap) {
            valueText = cpuMap.newvalue
            valueStatus = cpuMap.newvalue === 'normal'
          }
          const itemName = conversionSymbols(item.itemName)
          const dataName = itemName.split('(')[0]
          const idx = this.boardCardStatus.findIndex(items => items.name === dataName)
          if (idx !== -1) {
            this.$set(this.boardCardStatus[idx], 'valueText', valueText)
            this.$set(this.boardCardStatus[idx], 'valueStatus', valueStatus)
          } else {
            this.$set(this.boardCardStatus, this.boardCardStatus.length, {
              itemid: item.itemid,
              name: dataName,
              valueStatus, valueText
            })
          }
        }
      })
      const temperature = res['温度'].length > 0 ? res['温度'] : [] // 板卡温度
      temperature.forEach(item => {
        const dataName = conversionSymbols(item.itemName)
        const idx = this.boardCardStatus.findIndex(items => items.name === dataName.split('(')[0])
        if (idx !== -1) {
          console.log(item.itemValue)
          this.$set(this.boardCardStatus[idx], 'TemperatureSensor', item.itemValue)
          this.$set(this.boardCardStatus[idx], 'TemperatureSensorItemId', item.itemid)
          this.$set(this.boardCardStatus[idx], 'TemperatureSensorValueType', item.valueType)
        }
      })
      const memory = res['可用内存百分比'].length > 0 ? res['可用内存百分比'] : [] // 板卡内存使用
      memory.forEach(item => {
        const dataName = conversionSymbols(item.itemName)
        const idx = this.boardCardStatus.findIndex(items => items.name === dataName.split('(')[0])
        if (idx !== -1) {
          this.$set(this.boardCardStatus[idx], 'MemoryUsage', item.itemValue)
          this.$set(this.boardCardStatus[idx], 'MemoryUsageItemId', item.itemid)
          this.$set(this.boardCardStatus[idx], 'MemoryUsageValueType', item.valueType)
        }
      })

      // 风扇
      const fan = res['风扇'].length > 0 ? res['风扇'] : []
      let fanStatusMap = []
      if (fan.length > 0) {
        const getFanValueMap = await this.agentGetValueMap(fan[0].itemid)
        if (isJSONString(getFanValueMap)) {
          fanStatusMap = JSON.parse(getFanValueMap)
        }
      }
      fan.forEach(item => {
        const dataName = conversionSymbols(item.itemName)
        const idx = this.fanStatus.findIndex(items => items.name === dataName.split('(')[0])
        const fanMap = this.$tool.findDataItemByAttr(fanStatusMap, 'value', item.itemValue)
        let valueText = ''
        let valueStatus = null
        if (fanMap) {
          valueText = fanMap.newvalue
          valueStatus = fanMap.newvalue === 'normal' || fanMap.newvalue === 'active' || fanMap.newvalue === 'ok' || fanMap.newvalue === 'OK'
        }
        if (idx !== -1) {
          this.$set(this.fanStatus[idx], 'value', item.itemValue)
          this.$set(this.fanStatus[idx], 'valueText', valueText)
          this.$set(this.fanStatus[idx], 'valueStatus', valueStatus)
        } else {
          this.$set(this.fanStatus, this.fanStatus.length, {
            itemid: item.itemid,
            name: dataName.split('(')[0],
            value: item.newvalue,
            valueText, valueStatus
          })
        }
      })

      // 电源
      const power = res['电源'].length > 0 ? res['电源'] : []
      let powerStatusMap = []
      if (power.length > 0) {
        const getPowerValueMap = await this.agentGetValueMap(power[0].itemid)
        if (isJSONString(getPowerValueMap)) {
          powerStatusMap = JSON.parse(getPowerValueMap)
        }
      }
      power.forEach(item => {
        const dataName = conversionSymbols(item.itemName)
        const idx = this.powerStatus.findIndex(items => items.name === dataName.split('(')[0])
        const powerMap = this.$tool.findDataItemByAttr(powerStatusMap, 'value', item.itemValue)
        let valueText = ''
        let valueStatus = null
        if (powerMap) {
          valueText = powerMap.newvalue
          valueStatus = powerMap.newvalue === 'active' || powerMap.newvalue === 'ok' || powerMap.newvalue === 'OK' || powerMap.newvalue === 'doublePowerSupplyOk'
        }
        if (idx !== -1) {
          this.$set(this.powerStatus[idx], 'value', item.itemValue)
          this.$set(this.powerStatus[idx], 'valueText', valueText)
          this.$set(this.powerStatus[idx], 'valueStatus', valueStatus)
        } else {
          this.$set(this.powerStatus, this.powerStatus.length, {
            itemid: item.itemid,
            name: dataName.split('(')[0],
            value: item.itemValue,
            valueStatus, valueText
          })
        }
      })
      if (this.itMonitorRequireAgreement !== 'WS') {
        this.agentGetHostPort({ agent: this.agent, hostid: this.zbxHostId }).then(res => {
          if (res) {
            this.portData = res
          }
        })
      } else {
        await this.agentGetHostPortWS()
      }
    },
    // 获取设备端口列表
    async agentGetHostPort(data) {
      return await request({
        url: api.itMonitor.agentGetHostPort, data
      }).then(res => {
        if (res.code === 1 && res.map) {
          Object.keys(res.map).forEach(key => {
            if (res[key] !== '') {
              res.map[key] = isJSONString(res.map[key]) ? JSON.parse(res.map[key]) : []
            }
          })
          return res.map
        }
      })
    },
    // 获取设备端口列表 websocket
    agentGetHostPortWS() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHostPort,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: this.agent,
          fromAgent: this.localStorageOperation('get', 'fromAgent'),
          hostid: this.zbxHostId,
          fromHostId: this.localStorageOperation('get', 'fromHostId')
        }
      })
    },
    // 选择端口类型
    handelSelectKey(val) {
      this.netListKey = val
      this.netListQuery.subKey = val
      this.getHyitShowSurvey()
    },
    // 获取状态值对应关系
    async agentGetValueMap(itemid) {
      return new Promise(resolve => {
        if (this.itMonitorRequireAgreement !== 'WS') {
          request({ url: api.itMonitor.agentGetValueMap, data: { agent: this.agent, itemid }}).then(res => {
            if (res.code === 1 && res.model) {
              resolve(res.model)
            } else {
              resolve(null)
            }
          })
        } else {
          const wsToken = this.sessionStorageOperation('get', 'wsToken')
          if (!wsToken) return
          const getUserSessionResult = getUserSession()
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetValueMap,
            data: {
              token: wsToken,
              companyId: getUserSessionResult.companyId,
              appId: getUserSessionResult.appId,
              agent: this.agent,
              itemid,
              fromAgent: this.localStorageOperation('get', 'fromAgent'),
              fromHostId: this.localStorageOperation('get', 'fromHostId')
            }
          },
          (res) => {
            if (res.ValueMapData) {
              resolve(res.ValueMapData)
            }
          }, (err) => {
            this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
            console.log(err)
          })
        }
      })
    },
    // 获取监控项数据 http
    agentGetHostShow() {
      request({ url: api.itMonitor.agentGetHostShow, data: { agent: this.agent, hostid: this.zbxHostId }}).then(res => {
        if (res.code === 1) {
          console.log(res)
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
        cmd: socketCmd.itMonitor.itAgentGetHostShow,
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
        const wsRes = isJSONString(res.HostShowData) ? JSON.parse(res.HostShowData) : res.HostShowData
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
