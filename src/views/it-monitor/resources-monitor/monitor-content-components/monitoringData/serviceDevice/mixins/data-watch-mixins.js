/**
 * @description data-watch-mixins.js
 * @author linhaojia
 * @date 2022/5/31 09:58:11
 */
import request from '@/utils/request'
import api from '@/api/api'
import { guid } from '@/utils/utils'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

export default {
  data() {
    return {
      setHyitShowSurveyInterval: null, // 获取各项数据统计的定时器
      requestInterval: 5000, // 获取统计数据间隔 毫秒
      /* 传递给子组件的数据 START */
      serverInfo: [], // 系统概要信息
      serverOutline: [], // 网吧系统概况信息
      diskcount: 0, // 磁盘列表
      /* 传递给子组件的数据 END */
      upDataDirectiveId: guid(), // 请求更新数据指令
      handlerLayoutType: 1,
      moduleList: [
        { img: 'image/it-monitor/ico_yp.png', key: 'disk', title: '磁盘', status: true, count: 0 },
        { img: 'image/it-monitor/ico_cpu.png', key: 'cpu', title: 'CPU', status: true, count: 0 },
        { img: 'image/it-monitor/ico_wk.png', key: 'networkCard', title: '网卡', status: true, count: 0 },
        { img: 'image/it-monitor/ico_fs.png', key: 'fan', title: '风扇', status: true, count: 0 },
        { img: 'image/it-monitor/ico_dy.png', key: 'power', title: '电源', status: true, count: 0 },
        { img: 'image/it-monitor/ico_nc.png', key: 'memory', title: '内存', status: true, count: 0 },
        { img: 'image/configuration/ico_wd.png', key: 'temperature', title: '温度', status: true, count: 0 }
      ],
      moduleKey: '', // 选择的模块
      diskList: [], // 磁盘列表
      cpuList: [], // cpu列表
      powerList: [], // 电源列表
      memoryList: [], // 内存列表
      networkCardList: [], // 网卡列表
      fanList: [], // 风扇列表
      tempList: { // 温度列表
        boardTemp: [],
        cpuTemp: [],
        listTemp: []
      },
      diskOnlineStatusList: [], // 磁盘在线状态列表
      diskFaultStatusList: [], // 磁盘故障状态列表
      diskStatusList: [], // 磁盘状态列表
      diskSMARTStatusList: [], // 磁盘SMART
      cpuFaultStatusList: [], // cpu故障状态列表
      networkCardFaultStatusList: [], // 网卡故障状态列表
      networkCardConnectionStatusList: [], // 网卡连接状态列表
      networkCardStatusList: [], // 网卡状态列表
      fanListFaultStatusList: [], // 风扇故障状态列表
      fanListStatusList: [], // 风扇状态列表
      powerFaultStatusList: [], // 电源故障状态列表
      powerSensorStatusList: [], // 电源传感器状态列表
      powerOnlineStatusList: [], // 电源传感器在线状态列表
      powerStatusList: [], // 电源状态列表
      memoryFaultStatusList: [], // 内存故障状态列表
      sensorConditionStatusList: [], // 温度传感器状态列表
      agentGetHostDataMethod: [
        'getItemServerSystemInfoData',
        'getItemServerDiskData',
        'getItemServerCpuData',
        'getItemServerNetCardData',
        'getItemServerFanData',
        'getItemServerPowerData',
        'getItemServerMemData',
        'getItemServerTempData',
        'getItemServerHealthData'
      ],
      // { itemid: '', var: '' }
      moduleTypeItemId: []
    }
  },
  computed: {
    subType() { return this.$route.query.subType || this.propSubTypeId }
  },
  mounted() {
    const that = this
    this.agentGetHostData()
    this.setHyitShowSurveyInterval = setInterval(() => {
      that.agentGetHostData()
      that.upDataDirectiveId = guid()
    }, this.requestInterval)
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostData-websocket') {
        that.watchAgentGetHostData(res.detail.data)
      }
      if (res.detail.data.cmd === 'it-agentGetValueMap-websocket') {
        that.watchAgentGetValueMap(res.detail.data)
      }
    })
  },
  methods: {
    async watchAgentGetValueMap(data) {
      let valueMapData = []
      if (this.itMonitorRequireAgreement === 'WS') {
        valueMapData = this.$tool.isJSONString(data.ValueMapData) ? JSON.parse(data.ValueMapData) : []
      } else {
        valueMapData = this.$tool.isJSONString(data) ? JSON.parse(data) : []
      }
      let varIdx = -1
      valueMapData.forEach(valueMapDataItem => {
        varIdx = this.moduleTypeItemId.findIndex(item => Number(item.itemid) === Number(valueMapDataItem.itemid))
      })
      if (varIdx !== -1) {
        // 磁盘状态
        if (this.moduleTypeItemId[varIdx].var === 'diskList') {
          let onlineStatusList = []
          let faultStatusList = []
          let statusList = []
          let SMARTStatusList = []
          this.diskList.forEach(diskItem => {
            valueMapData.forEach((item) => {
              if (diskItem.onlineItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.onlineItemid)
                const haveValue = onlineStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  onlineStatusList.push(valueMapData[value])
                }
              }
              if (diskItem.faultItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.faultItemid)
                const haveValue = faultStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  faultStatusList.push(valueMapData[value])
                }
              }
              if (diskItem.statueItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.statueItemid)
                const haveValue = statusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  statusList.push(valueMapData[value])
                }
              }
              if (diskItem.SMARTStatueItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.SMARTStatueItemid)
                const haveValue = SMARTStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  SMARTStatusList.push(valueMapData[value])
                }
              }
            })
          })
          this.diskOnlineStatusList = onlineStatusList
          this.diskFaultStatusList = faultStatusList
          this.diskStatusList = statusList
          this.diskSMARTStatusList = SMARTStatusList

          let haveNotOnline = false
          let haveFault = false
          let haveNotStatue = false
          let haveNotSMARTStatue = false
          this.diskList.forEach(diskItem => {
            this.diskOnlineStatusList.forEach(item => {
              if (!diskItem.onlineItemid) {
                haveNotOnline = true
              } else {
                if (item.value === diskItem.onlineItemValue && !haveNotOnline) {
                  haveNotOnline = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
            this.diskFaultStatusList.forEach(item => {
              if (!diskItem.faultItemid) {
                haveFault = true
              } else {
                if (item.value === diskItem.faultItemValue && !haveFault) {
                  haveFault = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
            this.diskStatusList.forEach(item => {
              if (!diskItem.statueItemid) {
                haveNotStatue = true
              } else {
                if (item.value === diskItem.statueItemValue && !haveNotStatue) {
                  haveNotStatue = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
            this.diskSMARTStatusList.forEach(item => {
              if (!diskItem.SMARTStatueItemid) {
                haveNotSMARTStatue = true
              } else {
                if (item.value === diskItem.SMARTStatueItemValue && !haveNotSMARTStatue) {
                  haveNotSMARTStatue = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
          })
          if (haveNotOnline && this.diskOnlineStatusList.length > 0) this.$set(this.moduleList[0], 'status', false)
          if (haveFault && this.diskFaultStatusList.length > 0) this.$set(this.moduleList[0], 'status', false)
          if (haveNotStatue && this.diskStatusList.length > 0) this.$set(this.moduleList[0], 'status', false)
          if (haveNotSMARTStatue && this.diskSMARTStatusList.length > 0) this.$set(this.moduleList[0], 'status', false)
        }
        // cpu状态
        if (this.moduleTypeItemId[varIdx].var === 'cpuList') {
          let cpuFaultStatusList = []
          this.cpuList.forEach(diskItem => {
            valueMapData.forEach((item) => {
              if (diskItem.faultItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value)
                const haveValue = cpuFaultStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  cpuFaultStatusList.push(valueMapData[value])
                }
              }
            })
          })
          this.cpuFaultStatusList = cpuFaultStatusList
          let haveFault = false
          this.cpuList.forEach(diskItem => {
            this.cpuFaultStatusList.forEach(item => {
              if (!diskItem.faultItemid) {
                haveFault = true
              } else {
                if (item.value === diskItem.faultItemValue && !haveFault) {
                  haveFault = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
          })
          if (haveFault) this.$set(this.moduleList[1], 'status', false)
        }
        // 网卡状态
        if (this.moduleTypeItemId[varIdx].var === 'networkCardList') {
          let connectionStatusList = []
          let faultStatusList = []
          let statusList = []
          this.networkCardList.forEach(diskItem => {
            valueMapData.forEach((item) => {
              if (diskItem.connectionItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.connectionItemid)
                const haveValue = connectionStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  connectionStatusList.push(valueMapData[value])
                }
              }
              if (diskItem.faultItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.faultItemid)
                const haveValue = faultStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  faultStatusList.push(valueMapData[value])
                }
              }
              if (diskItem.statueItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.statueItemid)
                const haveValue = statusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  statusList.push(valueMapData[value])
                }
              }
            })
          })
          this.networkCardConnectionStatusList = connectionStatusList
          this.networkCardFaultStatusList = faultStatusList
          this.networkCardStatusList = statusList
          let haveNotOnline = false
          let haveFault = false
          let haveNotStatue = false
          this.networkCardList.forEach(diskItem => {
            this.networkCardConnectionStatusList.forEach(item => {
              if (!diskItem.connectionItemid) {
                haveNotOnline = true
              } else {
                if (item.value === diskItem.connectionItemValue && !haveNotOnline) {
                  haveNotOnline = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
            this.networkCardFaultStatusList.forEach(item => {
              if (!diskItem.faultItemid) {
                haveFault = true
              } else {
                if (item.value === diskItem.faultItemValue && !haveFault) {
                  haveFault = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
            this.networkCardStatusList.forEach(item => {
              if (!diskItem.statueItemid) {
                haveNotStatue = true
              } else {
                if (item.value === diskItem.statueItemValue && !haveNotStatue) {
                  haveNotStatue = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
          })
          if (haveNotOnline && this.networkCardConnectionStatusList.length > 0) this.$set(this.moduleList[2], 'status', false)
          if (haveFault && this.networkCardFaultStatusList.length > 0) this.$set(this.moduleList[2], 'status', false)
          if (haveNotStatue && this.networkCardStatusList.length > 0) this.$set(this.moduleList[2], 'status', false)
        }
        // 风扇状态
        if (this.moduleTypeItemId[varIdx].var === 'fanList') {
          let faultStatusList = []
          let statusList = []
          this.fanList.forEach(diskItem => {
            valueMapData.forEach((item) => {
              if (diskItem.faultItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value)
                const haveValue = faultStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  faultStatusList.push(valueMapData[value])
                }
              }
              if (diskItem.statueItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.statueItemid)
                const haveValue = statusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  statusList.push(valueMapData[value])
                }
              }
            })
          })
          this.fanListFaultStatusList = faultStatusList
          this.fanListStatusList = statusList
          let haveFault = false
          let haveNotStatue = false
          this.fanList.forEach(diskItem => {
            this.fanListFaultStatusList.forEach(item => {
              if (!diskItem.faultItemid) {
                haveFault = true
              } else {
                if (item.value === diskItem.faultItemValue && !haveFault) {
                  haveFault = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
            this.fanListStatusList.forEach(item => {
              if (!diskItem.statueItemid) {
                haveNotStatue = true
              } else {
                if (item.value === diskItem.statueItemValue && !haveNotStatue) {
                  haveNotStatue = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
          })
          if (haveFault && this.fanListFaultStatusList.length > 0) {
            this.$set(this.moduleList[3], 'status', false)
          }
          if (haveNotStatue && this.fanListStatusList.length > 0) {
            this.$set(this.moduleList[3], 'status', false)
          }
        }
        // 电源状态
        if (this.moduleTypeItemId[varIdx].var === 'powerList') {
          let onlineStatusList = []
          let faultStatusList = []
          let statusList = []
          this.powerList.forEach(diskItem => {
            valueMapData.forEach((item) => {
              if (diskItem.onlineItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.onlineItemid)
                const haveValue = onlineStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  onlineStatusList.push(valueMapData[value])
                }
              }
              if (diskItem.faultItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.faultItemid)
                const haveValue = faultStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  faultStatusList.push(valueMapData[value])
                }
              }
              if (diskItem.statueItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.statueItemid)
                const haveValue = statusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  statusList.push(valueMapData[value])
                }
              }
            })
          })
          this.powerOnlineStatusList = onlineStatusList
          this.powerFaultStatusList = faultStatusList
          this.powerStatusList = statusList
          let haveNotOnline = false
          let haveFault = false
          let haveNotStatue = false
          this.powerList.forEach(diskItem => {
            this.powerOnlineStatusList.forEach(item => {
              if (!diskItem.onlineItemid) {
                haveNotOnline = true
              } else {
                if (item.value === diskItem.onlineItemValue && !haveNotOnline) {
                  haveNotOnline = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
            this.powerFaultStatusList.forEach(item => {
              if (!diskItem.faultItemid) {
                haveFault = true
              } else {
                if (item.value === diskItem.faultItemValue && !haveFault) {
                  haveFault = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
            this.powerStatusList.forEach(item => {
              if (!diskItem.statueItemid) {
                haveNotStatue = true
              } else {
                if (item.value === diskItem.statueItemValue && !haveNotStatue) {
                  haveNotStatue = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
          })
          if (haveNotOnline && this.powerOnlineStatusList.length > 0) this.$set(this.moduleList[4], 'status', false)
          if (haveFault && this.powerFaultStatusList.length > 0) this.$set(this.moduleList[4], 'status', false)
          if (haveNotStatue && this.powerStatusList.length > 0) this.$set(this.moduleList[4], 'status', false)
        }
        // 内存状态
        if (this.moduleTypeItemId[varIdx].var === 'memoryList') {
          let faultStatusList = []
          this.memoryList.forEach(diskItem => {
            valueMapData.forEach((item) => {
              if (diskItem.faultItemid !== '') {
                const value = valueMapData.findIndex(items => items.value === item.value)
                const haveValue = faultStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  faultStatusList.push(valueMapData[value])
                }
              }
            })
          })
          this.memoryFaultStatusList = faultStatusList
          let haveFault = false
          this.memoryList.forEach(diskItem => {
            this.memoryFaultStatusList.forEach(item => {
              if (!diskItem.faultItemid) {
                haveFault = true
              } else {
                if (item.value === diskItem.faultItemValue && !haveFault) {
                  haveFault = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
          })
          if (haveFault) this.$set(this.moduleList[5], 'status', false)
        }
        // 温度
        if (this.moduleTypeItemId[varIdx].var === 'temperature') {
          let sensorConditionStatusList = []
          this.tempList.listTemp.forEach(diskItem => {
            valueMapData.forEach((item) => {
              if (diskItem.sensorConditionItemid) {
                const value = valueMapData.findIndex(items => items.value === item.value && items.itemid === diskItem.sensorConditionItemid)
                const haveValue = sensorConditionStatusList.findIndex(items => items.value === item.value)
                if (value !== -1 && haveValue === -1) {
                  sensorConditionStatusList.push(valueMapData[value])
                }
              }
            })
          })
          this.sensorConditionStatusList = sensorConditionStatusList
          let haveFault = false
          this.tempList.listTemp.forEach(diskItem => {
            this.sensorConditionStatusList.forEach(item => {
              if (!diskItem.sensorConditionItemid) {
                haveFault = true
              } else {
                if (item.value === diskItem.sensorConditionItemValue && !haveFault) {
                  haveFault = this.$defineData.valueMapDefine('normal', item.newvalue) === null
                }
              }
            })
          })
          if (haveFault && this.sensorConditionStatusList.length > 0) this.$set(this.moduleList[6], 'status', false)
        }
      }
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
    // 获取监控项数据
    async agentGetHostData() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      if (+this.subType === 153) {
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetHostData,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: this.agent,
            hostid: this.zbxHostId,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            methed: 'hpServer',
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        })
      } else {
        this.agentGetHostDataMethod.forEach(item => {
          if (this.itMonitorRequireAgreement === 'WS') {
            sendWebsocket(socketCmd.host.default, {
              cmd: socketCmd.itMonitor.itAgentGetHostData,
              data: {
                token: wsToken,
                companyId: getUserSessionResult.companyId,
                appId: getUserSessionResult.appId,
                agent: this.agent,
                hostid: this.zbxHostId,
                fromAgent: this.localStorageOperation('get', 'fromAgent'),
                methed: item,
                fromHostId: this.localStorageOperation('get', 'fromHostId')
              }
            })
          } else {
            request({ url: api.itMonitor.agentGetHostData, data: { agent: this.agent, hostid: this.zbxHostId, method: item }}).then(res => {
              if (res.code === 1 && res.model) {
                if (this.$tool.isJSONString(res.model)) {
                  const sdwanInfoData = JSON.parse(res.model)
                  this.watchAgentGetHostData({
                    HostData: sdwanInfoData,
                    methed: item
                  })
                }
              }
            })
          }
        })
      }
    }
  }
}
