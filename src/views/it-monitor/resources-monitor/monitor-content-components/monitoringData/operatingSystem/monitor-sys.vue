<template>
  <div class="monitor-device">
    <!-- 概况 -->
    <monitorHostInfo
      :up-status="upStatus"
      :usability="usability"
      :up-time="upTime"
    />
    <!-- 警报 -->
    <monitorAlarm />
    <!-- 运行性能 -->
    <monitor-sys-performance
      :performance-status="performanceStatus"
    />
    <div class="chunk margin-left-7-5 margin-right-7-5">
      <!-- cpu折线图 -->
      <monitorDiskCpuPused :cpu-used="cpuUsed" @selectCpuItem="selectCpuItem" />
      <!-- io折线图 -->
      <monitorDiskIO :io-used="ioUsed" />
      <!-- 内存折线图 -->
      <monitorDiskMemoryPused :memory-used="memoryUsed" />
      <!-- 进程折线图 -->
      <monitorHostProcess :process-used="processUsed" />
    </div>
    <!-- 端口 -->
    <monitorNetList
      :port-data="portData"
      :is-show-tab="true"
    />
    <!-- 文件系统 -->
    <monitorDiskDiskList :disk-disk-list="fsUsed" />
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
import monitorDiskDiskList from './monitor-sys-disk-list'
import monitorDiskCpuPused from './monitor-sys-cpu-used'
import monitorDiskMemoryPused from './monitor-sys-memory-used'
import monitorDiskIO from './monitor-sys-io-used'
import monitorHostProcess from './monitor-sys-process-used'
import monitorHostInfo from '../../common/monitor-host-info'
import monitorAlarm from '../../common/monitor-alarm'
import request from '@/utils/request'
import api from '@/api/api'
import { sToYMD, conversionSymbols, conversionData, isJSONString, dateFormat } from '@/utils/utils'
import MonitorSysPerformance from './monitor-sys-performance'
import monitorNetList from '../component/monitor-board-port'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd.js'
import { getUserSession } from '@/utils/auth'
import DiyMonitorItemForm from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-form'
import DiyMonitorItemEchart from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-echart'
import DiyMonitorItemDash from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-dash'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorSys',
  components: {
    MonitorSysPerformance,
    monitorDiskDiskList,
    monitorDiskCpuPused,
    monitorDiskMemoryPused,
    monitorDiskIO,
    monitorHostProcess,
    monitorAlarm,
    monitorHostInfo,
    monitorNetList,
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
      setHyitShowSurveyInterval: null, // 获取各项数据统计的定时器
      requestInterval: 5000, // 获取统计数据间隔 毫秒
      /* 传递给子组件的数据 START */
      upStatus: 0, // 设备的运行状态
      upTime: '', // 设备的运行时间
      performanceStatus: { // 运行性能统计信息
        cpuUsed: 0, // cpu使用率
        memoryUsed: 0, // 内存使用率
        diskUsed: 0 // 磁盘使用率
      },
      selectCpuItemId: '', // 当前选择的cpu
      selectCpuItemValue: '', // 当前选择的cpu value Type
      cpuUsed: { // CPU使用统计
        cpuList: [], // cpu数量列表
        cpuUnits: [],
        cpuOriginalUnit: '',
        active: 0,
        value: [],
        time: []
      },
      ioUsed: { // 磁盘io
        writeValue: [],
        writeUnit: [],
        writeItemId: '',
        writeValueType: '',
        readValue: [],
        readUnit: [],
        readItemId: '',
        readValueType: '',
        activeWriteValue: '',
        activeWriteUnit: '',
        activeReadValue: '',
        activeReadUnit: '',
        activeUtilizationValue: '',
        activeUtilizationUnit: '%',
        time: []
      },
      processUsed: { // 进程
        count: '',
        countOriginalUnit: '',
        active: '',
        activeOriginalUnit: '',
        value: [],
        units: [],
        time: []
      },
      memoryUsed: { // 内存使用情况
        memoryCount: '', // 物理总内存
        memoryCountUnit: '', // 物理总内存单位
        swapCount: '', // 虚拟总内存
        swapCountUnit: '', // 虚拟总内存单位
        memoryItemId: '', // 物理内存itemid
        memoryValueType: '', // 物理内存valueType
        memoryValue: [], // 每秒使用物理内存
        memoryValueUnits: [], // 每秒使用物理内存单位
        swapValue: [], // 每秒使用虚拟内存
        swapValueUnit: [], // 每秒使用虚拟内存单位
        time: []
      },
      fsUsed: [], // 文件系统使用情况
      portData: {},
      /* 传递给子组件的数据 END */
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
  destroyed() {
    // 组件卸载关闭定时器轮巡
    clearInterval(this.setHyitShowSurveyInterval)
  },
  methods: {
    // 监听it监控数据返回
    watchAgentGetHostShow(res) {
      console.log('==================== IT监控操作系统 实时数据 START ====================')
      const currentAllMonitorItemIds = []
      const currentAllMonitorItemValueTypes = []

      if (res['ping']) {
        // 运行状态
        this.upStatus = res['ping'].length > 0 ? Number(res['ping'][0].itemValue) : 0
      }
      if (res['运行时间']) {
        // 运行时间
        this.upTime = res['运行时间'].length > 0 ? sToYMD(Number(res['运行时间'][0].itemValue)) : ''
        this.$emit('upTime', this.upTime)
      }
      // cpu
      const cpu = res['cpu'].length > 0 ? res['cpu'] : []
      let cpuVal = 0
      if (cpu.length > 0) {
        const cpuUtilizationIndex = cpu.findIndex(cpuItem => cpuItem.itemName.indexOf('CPU utilization') !== -1)
        if (cpuUtilizationIndex !== -1) {
          const getCpuIndex = this.cpuUsed.cpuList.findIndex(getCpuItem => Number(getCpuItem.itemId) === Number(cpu[cpuUtilizationIndex].itemid))
          const setCpuUsedPercentageVal = Number(cpu[cpuUtilizationIndex].itemValue)
          this.$set(this.performanceStatus, 'cpuUsed', Number(setCpuUsedPercentageVal.toFixed(2))) // 运行性能 cpu使用情况
          if (getCpuIndex === -1) {
            this.$set(this.cpuUsed.cpuList, this.cpuUsed.cpuList.length, {
              name: `CPU1`,
              itemId: cpu[cpuUtilizationIndex].itemid,
              valueType: cpu[cpuUtilizationIndex].valueType,
              itemValue: cpu[cpuUtilizationIndex].itemValue
            })
          }
          cpuVal = Number(cpu[cpuUtilizationIndex].itemValue)
        } else {
          const setCpuUsedPercentageVal = Number(cpu[0].itemValue)
          this.$set(this.performanceStatus, 'cpuUsed', Number(setCpuUsedPercentageVal.toFixed(2))) // 运行性能 cpu使用情况

          if (this.selectCpuItemId === '') { // 首次进入自动选择第一个cpu
            this.selectCpuItemId = cpu[0].itemid
            this.selectCpuItemValue = cpu[0].valueType
            cpu.forEach(item => {
              this.$set(this.cpuUsed.cpuList, this.cpuUsed.cpuList.length, {
                name: `CPU${this.cpuUsed.cpuList.length + 1}`,
                itemId: item.itemid,
                valueType: item.valueType
              })
            })
          }
          cpuVal = Number(cpu[0].itemValue)
        }

        this.$set(this.cpuUsed.value, this.cpuUsed.value.length, Number(cpuVal.toFixed(2)))
        this.$set(this.cpuUsed, 'active', Number(cpuVal.toFixed(2)))
        this.$set(this.cpuUsed.cpuUnits, this.cpuUsed.cpuUnits.length, cpu[0].units)
        this.$set(this.cpuUsed, 'cpuItemId', this.cpuUsed.cpuList[0].itemId)
        this.$set(this.cpuUsed, 'cpuValueType', this.cpuUsed.cpuList[0].valueType)
        this.$set(this.cpuUsed, 'cpuOriginalUnit', this.cpuUsed.cpuList[0].units)
        const clock = new Date()
        this.$set(this.cpuUsed.time, this.cpuUsed.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
      }

      // 进程
      const processUsed = res['进程'].length > 0 ? res['进程'] : []
      if (processUsed.length > 0) {
        processUsed.forEach(item => {
          if (item.itemName.indexOf('Number of processes') !== -1) {
            this.$set(this.processUsed, 'count', item.itemValue)
            this.$set(this.processUsed, 'countOriginalUnit', item.units)
          }
          if (item.itemName.indexOf('Number of running processes') !== -1) {
            this.$set(this.processUsed, 'itemid', item.itemid)
            this.$set(this.processUsed, 'valueType', item.valueType)
            this.$set(this.processUsed, 'active', item.itemValue)
            this.$set(this.processUsed, 'activeOriginalUnit', item.units)
            this.$set(this.processUsed.value, this.processUsed.value.length, item.itemValue)
            this.$set(this.processUsed.units, this.processUsed.units.length, item.units)
          }
        })

        // windows操作系统没有当前进程，所以用总进程
        const runningProcessesIndex = processUsed.findIndex(runningProcessesItem => runningProcessesItem.itemName.indexOf('Number of running processes') === -1)
        if (runningProcessesIndex !== -1) {
          this.$set(this.processUsed, 'itemid', processUsed[runningProcessesIndex].itemid)
          this.$set(this.processUsed, 'valueType', processUsed[runningProcessesIndex].valueType)
          this.$set(this.processUsed, 'active', processUsed[runningProcessesIndex].itemValue)
          this.$set(this.processUsed, 'activeOriginalUnit', processUsed[runningProcessesIndex].units)
          this.$set(this.processUsed.value, this.processUsed.value.length, processUsed[runningProcessesIndex].itemValue)
          this.$set(this.processUsed.units, this.processUsed.units.length, processUsed[runningProcessesIndex].units)
        }

        const clock = new Date()
        this.$set(this.processUsed.time, this.processUsed.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
      }
      // 内存
      const totalMemory = res['总内存'].length > 0 ? res['总内存'] : []
      const freeMemoryPercentage = res['可用内存百分比'].length > 0 ? res['可用内存百分比'] : []
      console.log(freeMemoryPercentage)
      console.log(res)
      if (totalMemory.length > 0) {
        const conversionDataResult = conversionData('data', Number(totalMemory[0].itemValue), 'b')
        console.log(conversionDataResult.size, conversionDataResult.units)
        this.$set(this.memoryUsed, 'memoryCount', conversionDataResult.size)
        this.$set(this.memoryUsed, 'memoryCountUnit', conversionDataResult.units)
      }

      if (freeMemoryPercentage.length > 0) {
        this.$set(this.memoryUsed, 'memoryItemId', freeMemoryPercentage[0].itemid)
        this.$set(this.memoryUsed, 'memoryValueType', freeMemoryPercentage[0].valueType)

        this.$set(this.memoryUsed.memoryValue, this.memoryUsed.memoryValue.length, Number(freeMemoryPercentage[0].itemValue).toFixed(2))
        this.$set(this.memoryUsed.memoryValueUnits, this.memoryUsed.memoryValueUnits.length, freeMemoryPercentage[0].units)
        this.$set(this.memoryUsed, 'memoryOriginalUnit', freeMemoryPercentage[0].units) // 原始单位
      }
      if (freeMemoryPercentage.length > 0) {
        this.$set(this.performanceStatus, 'memoryUsed', +Number(freeMemoryPercentage[0].itemValue).toFixed(2)) // 运行性能 内存使用情况
      }
      const clock = new Date()
      this.$set(this.memoryUsed.time, this.memoryUsed.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)

      // 磁盘IO
      const diskIO = res['磁盘'].length > 0 ? res['磁盘'] : []
      if (diskIO.length > 0) {
        let used = 0
        let total = 0
        console.log(diskIO)
        console.log('磁盘使用情况：')
        diskIO.forEach(item => {
          // 文件系统
          if (item.itemName.indexOf('Used space') !== -1) {
            console.log(`磁盘名称${item.itemName}，使用数据：${item.itemValue}${item.units}`)
            used += Number(item.itemValue)
          } // 所有磁盘使用大小
          if (item.itemName.indexOf('Total space') !== -1) {
            console.log(`磁盘名称${item.itemName}，总数据：${item.itemValue}${item.units}`)
            total += Number(item.itemValue)
          } // 所有磁盘空间大小

          const conversionSymbolsResult = conversionSymbols(item.itemName)
          const fsName = conversionSymbolsResult.split(':')[0]
          let idx = this.fsUsed.findIndex(items => items.fsName === fsName)
          if (idx === -1) {
            this.$set(this.fsUsed, this.fsUsed.length, {
              fsName, total: 0, usedPercentage: 0, remaining: 0, usedPercentageUnit: '', totalUnit: '', remainingUnit: '', originalTotal: 0, originalUsed: 0
            })
            idx = this.fsUsed.length - 1
          }
          // 使用百分比
          if (item.itemName.indexOf(`${fsName}:`) !== 1 && item.itemName.indexOf('Space utilization') !== -1) {
            // console.log(item)
            // const usedPercentageVal = 100 - Number(item.itemValue)
            this.$set(this.fsUsed[idx], 'usedPercentage', Number(Number(item.itemValue).toFixed(2)))
            this.$set(this.fsUsed[idx], 'usedPercentageUnit', item.units)
          }
          // 总大小
          if (item.itemName.indexOf(`${fsName}:`) !== 1 && item.itemName.indexOf('Total space') !== -1) {
            const conversionDataResult = conversionData('data', Number(item.itemValue), 'b')
            this.$set(this.fsUsed[idx], 'total', conversionDataResult.size)
            this.$set(this.fsUsed[idx], 'totalUnit', conversionDataResult.units)
          }
          // 使用大小
          if (item.itemName.indexOf(`${fsName}:`) !== 1 && item.itemName.indexOf('Used space') !== -1) {
            this.$set(this.fsUsed[idx], 'usedItemId', item.itemid)
            this.$set(this.fsUsed[idx], 'usedValueType', item.valueType)
          }
          // 可用
          if (item.itemName.indexOf(`${fsName}:`) !== 1 && (item.itemName.indexOf('Free inodes in') !== -1 && item.itemName.indexOf('percentage') === -1 && item.itemName.indexOf('%') === -1)) {
            const conversionDataResult = conversionData('data', Number(item.itemValue), 'b')
            this.$set(this.fsUsed[idx], 'remaining', conversionDataResult.size)
            this.$set(this.fsUsed[idx], 'remainingUnit', conversionDataResult.units)
          } else {
            const usedIdx = diskIO.findIndex(items => items.itemName.indexOf(`${fsName}:`) !== -1 && items.itemName.indexOf('Used space') !== -1)
            const totalIdx = diskIO.findIndex(items => items.itemName.indexOf(`${fsName}:`) !== -1 && items.itemName.indexOf('Total space') !== -1)
            const itemValue = diskIO[totalIdx].itemValue - diskIO[usedIdx].itemValue
            const conversionDataResult = conversionData('data', Number(itemValue), 'b')
            this.$set(this.fsUsed[idx], 'remaining', conversionDataResult.size)
            this.$set(this.fsUsed[idx], 'remainingUnit', conversionDataResult.units)
          }
        })
        console.log('磁盘使用', used, '总磁盘', total)
        // 计算各个空间的大小和使用大小去计算出运行性能使用的磁盘百分比
        if (used > 0 && total > 0) {
          const setDiskUsedPercentageVal = (used / total) * 100
          if (total > 0) {
            this.$set(this.performanceStatus, 'diskUsed', Number(setDiskUsedPercentageVal.toFixed(2))) // 运行性能 磁盘使用情况
          }
        }
      }

      // IO读写
      const ioWrite = res['磁盘io写'].length > 0 ? res['磁盘io写'] : []
      const ioRead = res['磁盘io读'].length > 0 ? res['磁盘io读'] : []
      const ioWriteRateIdx = ioWrite.findIndex(item => item.itemName.indexOf('Disk write rate') !== -1)
      const ioReadRateIdx = ioRead.findIndex(item => item.itemName.indexOf('Disk read rate') !== -1)
      const utilizationIdx = ioRead.findIndex(item => item.itemName.indexOf('utilization') !== -1)

      const ioWriteRate = ioWriteRateIdx !== -1 ? ioWrite[ioWriteRateIdx].itemValue : 0
      const ioReadRate = ioReadRateIdx !== -1 ? ioRead[ioReadRateIdx].itemValue : 0
      const utilization = utilizationIdx !== -1 ? ioRead[utilizationIdx].itemValue : 0
      if (ioWrite[ioWriteRateIdx]) {
        this.$set(this.ioUsed.writeValue, this.ioUsed.writeValue.length, ioWriteRate)
        this.$set(this.ioUsed.writeUnit, this.ioUsed.writeUnit.length, ioWrite[ioWriteRateIdx].units)
        this.$set(this.ioUsed, 'writeItemId', ioWrite[ioWriteRateIdx].itemid)
        this.$set(this.ioUsed, 'writeValueType', ioWrite[ioWriteRateIdx].valueType)
        this.$set(this.ioUsed, 'activeWriteValue', ioWriteRate)
        this.$set(this.ioUsed, 'activeWriteUnit', ioWrite[ioWriteRateIdx].units)
      }

      if (ioRead[ioReadRateIdx]) {
        this.$set(this.ioUsed.readValue, this.ioUsed.readValue.length, ioReadRate)
        this.$set(this.ioUsed.readUnit, this.ioUsed.readUnit.length, ioRead[ioReadRateIdx].units)
        this.$set(this.ioUsed, 'readItemId', ioRead[ioReadRateIdx].itemid)
        this.$set(this.ioUsed, 'readValueType', ioRead[ioReadRateIdx].valueType)
        this.$set(this.ioUsed, 'activeReadValue', ioReadRate)
        this.$set(this.ioUsed, 'activeReadUnit', ioRead[ioReadRateIdx].units)
      }

      this.$set(this.ioUsed, 'activeUtilizationValue', Number(utilization).toFixed())

      this.$set(this.ioUsed.time, this.ioUsed.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)

      if (!this.initGetMonitorItemHistoryData) {
        if (this.cpuUsed.cpuList.length > 0) {
          currentAllMonitorItemIds.push(this.cpuUsed.cpuList[0].itemId)
          currentAllMonitorItemValueTypes.push(this.cpuUsed.cpuList[0].valueType)
        }
        if (this.processUsed.itemid !== '' && this.processUsed.valueType !== '') {
          currentAllMonitorItemIds.push(this.processUsed.itemid)
          currentAllMonitorItemValueTypes.push(this.processUsed.valueType)
        }
        if (this.memoryUsed.memoryItemId !== '' && this.memoryUsed.memoryValueType !== '') {
          currentAllMonitorItemIds.push(this.memoryUsed.memoryItemId)
          currentAllMonitorItemValueTypes.push(this.memoryUsed.memoryValueType)
        }
        if (this.ioUsed.writeItemId !== '' && this.ioUsed.writeValueType !== '') {
          currentAllMonitorItemIds.push(this.ioUsed.writeItemId)
          currentAllMonitorItemValueTypes.push(this.ioUsed.writeValueType)
        }
        if (this.ioUsed.readItemId !== '' && this.ioUsed.readValueType !== '') {
          currentAllMonitorItemIds.push(this.ioUsed.readItemId)
          currentAllMonitorItemValueTypes.push(this.ioUsed.readValueType)
        }
        this.initGetMonitorItemHistoryData = true
        this.getMonitorItemHistoryData(this.agent, currentAllMonitorItemIds.toString(), currentAllMonitorItemValueTypes.toString())
      }

      console.log('==================== IT监控操作系统 实时数据 END ====================')
      if (this.itMonitorRequireAgreement === 'WS') {
        this.agentGetHostPortWS()
      } else {
        this.agentGetHostPort({ agent: this.agent, hostid: this.zbxHostId }).then(res => {
          if (res) {
            this.portData = res
          }
        })
      }
    },
    // 获取监控项数据 http
    agentGetHostShow() {
      request({ url: api.itMonitor.agentGetHostShow, data: { agent: this.agent, hostid: this.zbxHostId }}).then(res => {
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
        console.log(JSON.stringify(wsRes))
        if (wsRes) {
          this.watchAgentGetHostShow(wsRes)
        }
      }, (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
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
      },
      (res) => {
        const wsRes = isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData) : res.HostPortData
        if (wsRes) {
          console.log('wsRes 2', wsRes)
          this.portData = wsRes
        }
      }, (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },
    // 获取设备端口列表 http
    async agentGetHostPort(data) {
      return await request({
        url: api.itMonitor.agentGetHostPort, data
      }).then(res => {
        if (res.code === 1 && res) {
          Object.keys(res).forEach(key => {
            res[key] = isJSONString(res[key]) ? JSON.parse(res[key]) : []
          })
          return res
        }
      })
    },
    // 选择cpu
    selectCpuItem(val) {
      const idx = this.cpuUsed.cpuList.findIndex(item => item.itemId === val)
      if (idx !== -1) {
        this.selectCpuItemId = val
        this.selectCpuItemValue = this.cpuUsed.cpuList[idx].valueType
        this.itMonitorRequireAgreement === 'WS' ? this.agentGetHostShowByWs() : this.agentGetHostShow()
      }
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
