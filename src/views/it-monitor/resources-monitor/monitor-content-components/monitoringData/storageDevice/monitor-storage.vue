<template>
  <div class="monitor-device">
    <!-- 概况 -->
    <monitorHostInfo
      :up-status="upStatus"
      :usability="usability"
    />
    <!-- 警报 -->
    <!-- <monitorAlarm /> -->

    <!-- 图 -->
    <div class="chunk margin-left-7-5 margin-right-7-5">
      <!-- cpu折线图 -->
      <monitorStorageCpu :cpu-used="cpuUsed" @selectCpuItem="selectCpuItem" />
      <!-- 内存折线图 -->
      <monitorStorageMemory :memory-data="memoryData" />
      <!-- 存储池折线图 -->
      <monitorStoragePool />
      <!-- 虚拟卷折线图 -->
      <monitorStorageVirtual :virtual-data="virtualData" @changeVirtualItem="changeVirtualItem" />
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
import { sendWebsocket } from '@/utils/websocket'
import { getUserSession } from '@/utils/auth'
import socketCmd from '@/api/socket-cmd.js'
import { isJSONString, dateFormat, sizeUnitsConversion } from '@/utils/utils'
import monitorStorageCpu from './monitor-storage-cpu'
import monitorStorageMemory from './monitor-storage-memory'
import monitorStoragePool from './monitor-storage-pool'
import monitorStorageVirtual from './monitor-storage-virtual'
import DiyMonitorItemForm from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-form'
import DiyMonitorItemEchart from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-echart'
import DiyMonitorItemDash from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-dash'
// import monitorAlarm from '../../common/monitor-alarm'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'StorageDevice',
  components: {
    monitorHostInfo,
    monitorStorageCpu,
    monitorStorageMemory,
    monitorStoragePool,
    monitorStorageVirtual,
    DiyMonitorItemForm,
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
      diyItem: [],
      setHyitShowSurveyInterval: null, // 获取各项数据统计的定时器
      requestInterval: 10000, // 获取统计数据间隔 毫秒
      upStatus: 0, // 设备的运行状态
      selectCpuItemId: '', // 当前选择的cpu
      selectCpuValueType: '', // 当前选择的cpu value Type
      selectCpuItemValue: '',
      selectCpuUnits: '',

      selectVirtualItemId: '', // 当前选择的虚拟卷
      selectVirtualValueType: '', // 当前选择的虚拟卷value Type
      selectVirtualItemValue: '', // 当前选择的虚拟卷ItemValue
      selectVirtualUnits: '', // 当前选择的虚拟卷Units

      selectVirtualTotalItemValue: '',
      selectVirtualUsedItemValue: '',

      cpuUsed: { // CPU使用统计
        cpuList: [], // cpu数量列表
        cpuUnits: [],
        cpuOriginalUnit: '',
        active: 0,
        value: [],
        time: []
      },
      virtualData: { // 虚拟卷数据
        virtualList: [],
        virtualUnits: [], // 单位%
        virtualOriginalUnit: '', // 单位%
        active: 0, // 值
        value: [], // 值
        time: [] // 当前时间
      },
      memoryData: { // 内存数据
        memoryUnits: [], // 单位%
        memoryOriginalUnit: '', // 单位%
        active: 0, // 值
        value: [], // 值
        time: [] // 当前时间
      },
      poolData: { // 存储池数据
        virtualUnits: [], // 单位%
        virtualOriginalUnit: '', // 单位%
        active: 0, // 值
        value: [], // 值
        time: [] // 当前时间
      },
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

      console.log('ws数据==========================', res)
      const Ping = []
      res.Status.forEach(item => {
        if (item.itemName === 'ICMP ping') {
          Ping.push(item)
        }
      })
      if (Ping.length !== []) {
        // 运行状态
        this.upStatus = Ping.length > 0 ? Number(Ping[0].itemValue) : 0
      }
      console.log('==================== 实时数据 ====================')
      // cpu
      const cpu = []
      res.System.forEach(item => {
        if (item.itemName === 'CPU Idle') {
          cpu.push(item)
        }
      })
      console.log(cpu)
      if (this.selectCpuItemId === '') { // 首次进入自动选择第一个cpu
        this.selectCpuItemId = cpu[0].itemid
        this.selectCpuValueType = cpu[0].valueType
        this.selectCpuItemValue = cpu[0].itemValue
        this.selectCpuUnits = cpu[0].units

        cpu.forEach(item => {
          this.$set(this.cpuUsed.cpuList, this.cpuUsed.cpuList.length, {
            name: `CPU${this.cpuUsed.cpuList.length + 1}`,
            itemId: item.itemid,
            valueType: item.valueType
          })
        })
      }
      const cpuVal = Number(this.selectCpuItemValue)
      console.log(cpuVal)
      this.$set(this.cpuUsed.value, this.cpuUsed.value.length, (100 - Number(cpuVal.toFixed(2))))
      this.$set(this.cpuUsed, 'active', (100 - Number(cpuVal.toFixed(2))))
      this.$set(this.cpuUsed.cpuUnits, this.cpuUsed.cpuUnits.length, this.selectCpuUnits)
      this.$set(this.cpuUsed, 'cpuItemId', this.selectCpuItemId)
      this.$set(this.cpuUsed, 'cpuValueType', this.selectCpuValueType)
      this.$set(this.cpuUsed, 'cpuOriginalUnit', this.selectCpuUnits)
      const clock = new Date()
      this.$set(this.cpuUsed.time, this.cpuUsed.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
      // 内存数据
      console.log('==================== 内存 ====================')

      const memoryAble = [] // 可用内存
      const memoryMem = [] // 总内存
      res.Memory.forEach(item => {
        if (item.itemName === 'Total Physical Available') {
          memoryAble.push(item)
        } else if (item.itemName === 'Total Physical Memory') {
          memoryMem.push(item)
        }
      })

      if (memoryAble.length > 0 && memoryMem.length > 0) {
        const memoryAbleVal = sizeUnitsConversion(Number(memoryAble[0].itemValue), 'capital') // 可用内存
        const memoryMemVal = sizeUnitsConversion(Number(memoryMem[0].itemValue), 'capital') // 总内存
        const memoryOccVal = Number((memoryMemVal.size - memoryAbleVal.size).toFixed(2)) // 已用内存
        const memoryVal = `${(Number((memoryOccVal / memoryMemVal.size).toFixed(2)) * 100)}`
        this.$set(this.memoryData.value, this.memoryData.value.length, memoryVal)
        this.$set(this.memoryData, 'active', memoryVal)
        this.$set(this.memoryData, 'occupy', memoryOccVal)
        this.$set(this.memoryData.memoryUnits, this.memoryData.memoryUnits.length, memoryMemVal.abbreviations)

        this.$set(this.memoryData, 'totalMemoryItemId', memoryMem[0].itemid)
        this.$set(this.memoryData, 'totalMemoryValueType', memoryMem[0].valueType)
        this.$set(this.memoryData, 'ableValMemoryItemId', memoryAble[0].itemid)
        this.$set(this.memoryData, 'ableValMemoryValueType', memoryAble[0].valueType)

        this.$set(this.memoryData, 'memoryValueUnit', memoryAble[0].units)
        this.$set(this.memoryData, 'memoryValueUnitTotal', memoryMem[0].itemValue)
        this.$set(this.memoryData, 'memoryOriginalUnit', '%')
        const clock = new Date()
        this.$set(this.memoryData.time, this.memoryData.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
      }
      console.log(this.memoryData)

      // 虚拟卷
      console.log('==================== 虚拟卷 ====================')
      const virtual = [] // 使用率
      const virtualTotal = [] // 总大小
      const virtualUsed = [] // 已使用

      res.Disk.forEach(item => {
        if (item.itemName.indexOf('Storage Used') !== -1 && item.itemName.indexOf('%') !== -1) {
          virtual.push(item)
        } else if (item.itemName.indexOf('Storage Size') !== -1) {
          virtualTotal.push(item)
        } else if (item.itemName.indexOf('Storage Used') !== -1 && item.itemName.indexOf('%') === -1) {
          virtualUsed.push(item)
        }
      })
      if (this.selectVirtualItemId === '') { // 首次进入自动选择第一个虚拟卷
        this.selectVirtualItemId = virtual[0].itemid
        this.selectVirtualValueType = virtual[0].valueType
        this.selectVirtualItemValue = virtual[0].itemValue
        this.selectVirtualUnits = virtual[0].units

        this.selectVirtualTotalItemValue = virtualTotal[0].itemValue

        this.selectVirtualUsedItemValue = virtualUsed[0].itemValue

        virtualTotal.forEach(item => {
          const val = item.itemName.split(' ')
          this.$set(this.virtualData.virtualList, this.virtualData.virtualList.length, {
            name: val[val.length - 1],
            virtualTotalItemId: item.itemid,
            virtualTotalValueType: item.valueType,
            virtualTotalItemValue: item.itemValue
          })
        })
        virtual.forEach(item => {
          const val = item.itemName.split(' ')
          console.log(val)
          this.virtualData.virtualList.forEach(items => {
            if (val[val.length - 2] === items.name) {
              this.$set(items, 'virtualItemValue', item.itemValue)
              this.$set(items, 'virtualItemid', item.itemid)
              this.$set(items, 'virtualValueType', item.valueType)
              this.$set(items, 'virtualUnits', item.units)
            }
          })
        })
        virtualUsed.forEach(item => {
          const val = item.itemName.split(' ')
          console.log(val)
          this.virtualData.virtualList.forEach(items => {
            if (val[val.length - 1] === items.name) {
              this.$set(items, 'virtualUsedItemValue', item.itemValue)
            }
          })
        })
        console.log(this.virtualData)
      }
      if (virtual.length > 0) {
        const virtualVal = Number(this.selectVirtualItemValue)
        this.$set(this.virtualData.value, this.virtualData.value.length, Number(virtualVal.toFixed(2)))
        this.$set(this.virtualData, 'active', Number(virtualVal.toFixed(2))) // 使用率
        this.$set(this.virtualData.virtualUnits, this.virtualData.virtualUnits.length, this.selectVirtualUnits)
        this.$set(this.virtualData, 'virtualItemId', this.selectVirtualItemId)
        this.$set(this.virtualData, 'virtualValueType', this.selectVirtualValueType)
        const memoryAbleVal = sizeUnitsConversion(Number(this.selectVirtualTotalItemValue), 'capital') // 总大小
        const memoryMemVal = sizeUnitsConversion(Number(this.selectVirtualUsedItemValue), 'capital') // 已使用
        this.$set(this.virtualData, 'total', Number(memoryAbleVal.size))
        this.$set(this.virtualData, 'totalUnit', memoryAbleVal.units)
        this.$set(this.virtualData, 'user', Number(memoryMemVal.size))
        this.$set(this.virtualData, 'userUnit', memoryMemVal.units)
        this.$set(this.virtualData, 'virtualOriginalUnit', this.selectVirtualUnits)
        const clock = new Date()
        this.$set(this.virtualData.time, this.virtualData.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
      }

      if (!this.initGetMonitorItemHistoryData) {
        if (this.cpuUsed.cpuList.length > 0) {
          currentAllMonitorItemIds.push(this.cpuUsed.cpuList[0].itemId)
          currentAllMonitorItemValueTypes.push(this.cpuUsed.cpuList[0].valueType)
        }
        if (this.virtualData.virtualItemId !== '' && this.virtualData.virtualValueType !== '') {
          currentAllMonitorItemIds.push(this.virtualData.virtualItemId)
          currentAllMonitorItemValueTypes.push(this.virtualData.virtualValueType)
        }
        if (this.memoryData.totalMemoryItemId !== '' && this.memoryData.totalMemoryValueType !== '') {
          currentAllMonitorItemIds.push(this.memoryData.totalMemoryItemId)
          currentAllMonitorItemValueTypes.push(this.memoryData.totalMemoryValueType)
        }
        if (this.memoryData.ableValMemoryItemId !== '' && this.memoryData.ableValMemoryValueType !== '') {
          currentAllMonitorItemIds.push(this.memoryData.ableValMemoryItemId)
          currentAllMonitorItemValueTypes.push(this.memoryData.ableValMemoryValueType)
        }
        this.initGetMonitorItemHistoryData = true
        this.getMonitorItemHistoryData(this.agent, currentAllMonitorItemIds.toString(), currentAllMonitorItemValueTypes.toString())
      }
    },
    // 选择cpu
    selectCpuItem(val) {
      const idx = this.cpuUsed.cpuList.findIndex(item => item.itemId === val)
      if (idx !== -1) {
        this.selectCpuItemId = val
        this.selectCpuValueType = this.cpuUsed.cpuList[idx].valueType
        this.selectCpuItemValue = this.cpuUsed.cpuList[idx].itemValue
        this.selectCpuUnits = this.cpuUsed.cpuList[idx].units
        this.itMonitorRequireAgreement === 'WS' ? this.agentGetHostShowByWs() : this.agentGetHostShow()
      }
    },
    // 选择虚拟卷
    changeVirtualItem(val) {
      const idx = this.virtualData.virtualList.findIndex(item => item.virtualTotalItemId === val)
      if (idx !== -1) {
        this.selectVirtualItemId = this.virtualData.virtualList[idx].virtualItemid
        this.selectVirtualValueType = this.virtualData.virtualList[idx].virtualValueType
        this.selectVirtualItemValue = this.virtualData.virtualList[idx].virtualItemValue
        this.selectVirtualUnits = this.virtualData.virtualList[idx].virtualUnits

        this.selectVirtualTotalItemValue = this.virtualData.virtualList[idx].virtualTotalItemValue

        this.selectVirtualUsedItemValue = this.virtualData.virtualList[idx].virtualUsedItemValue

        this.itMonitorRequireAgreement === 'WS' ? this.agentGetHostShowByWs() : this.agentGetHostShow()
      }
    },
    // 获取监控项数据 http  注意：这里的api暂时没写完整===================================================================================
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
        cmd: socketCmd.itMonitor.itAgentGetStorageData,
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
