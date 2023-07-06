import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
// import OutputExcel from '@/components/outputExcel/index.vue'
import ExportExcelWithStyle from '@/components/ExportExcelWithStyle/export-excel-with-style'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import { isJSONString, sizeUnitsConversion } from '@/utils/utils'
import socketCmd from '@/api/socket-cmd.js'
// import { loading } from '@jiaminghi/data-view'
export default {
  components: {
    ExportExcelWithStyle // 导出带样式的excel,
  },
  props: {
    devTypeProp: {
      type: Number,
      default: -1
    },
    cmdbItemTypeId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      fillerList: [],
      fillerData: [],
      loading: false,
      showDialog: false,
      percentage: 0,
      wrapList: [], // 需换行的数组
      agentsIds: '',
      show: false,
      dataEcharts: [],
      assetsDeviceList: [],
      listLoading: false,
      pageSize: [10, 20, 30, 50, 100, 200, 300, 500],
      statusOptions: [
        {
          id: 0,
          label: '离线',
          value: 0
        }, {
          id: 1,
          label: '在线',
          value: 1
        }
      ],
      devTypeList: [],
      findHyitHostQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        devType: '',
        status: '',
        hostType: 1
      },
      availables: [
        {
          label: 'AGENT'
        },
        {
          label: 'SNMP'
        },
        {
          label: 'JMX'
        },
        {
          label: 'IPMI'
        }
      ],
      devStatus: [
        { value: 0, name: '在线设备' },
        { value: 0, name: '离线设备' }
      ],
      hostTypeStatictics: [],
      handelDevTypeId: '',
      subDevType: [],
      paginationShow: true,
      allSubDevType: [],
      rowHeight: [ // excel各行行高
        { num: 1, height: 70},
        { num: 2, height: 40},
        { num: 3, height: 40}
      ],
      ExcelTitle: [
        {
          title: '对象',
          dataIndex: 'hyMarkName',
          width: 40
        },
        {
          title: '类型',
          dataIndex: 'hyDevTypeId',
          width: 15
        },
        {
          title: '子类型',
          dataIndex: 'hySubdevTypeId',
          width: 15
        },
        {
          title: 'IP',
          dataIndex: 'hyIp',
          width: 30
        },
        {
          title: '监控项',
          dataIndex: 'hyItemCount',
          width: 10
        },
        {
          title: '在线状态',
          dataIndex: 'hyNetState',
          width: 10
        },
        {
          title: 'CPU数',
          dataIndex: 'CPUQuantity',
          width: 10
        },
        {
          title: 'CPU使用率(%)',
          dataIndex: 'CPU',
          width: 15
        },
        {
          title: '内存空间(G)',
          dataIndex: 'memorySize',
          width: 15
        },
        {
          title: '内存使用率(%)',
          dataIndex: 'memoryUsage',
          width: 15
        },
        {
          title: '磁盘总空间(G)',
          dataIndex: 'diskSize',
          width: 15
        },
        {
          title: '磁盘总使用率(%)',
          dataIndex: 'diskUsage',
          width: 15
        },

        {
          title: '各磁盘空间',
          dataIndex: 'eachDiskSize',
          width: 45
        },
        {
          title: '各磁盘使用率',
          dataIndex: 'eachDiskUsage',
          width: 30
        }
      ],
      exportFileName: 'IT资源监控',
      devTypeId: '',
      dataList: '',
      // 存储设备
      cpuRatio: [],
      memoryUsage: [],
      // virtual: []
      // 虚拟资源
      fictitiousRatio: [], // cpu使用率
      fictitiousNumber: [], // cpu数
      memorySize: [], // 内存空间大小
      memoryTotal: [], // 内存总数
      // 操作系统
      systemRatio: [], // CPU使用率
      systemDiskSize: [], // 磁盘空间
      systemDiskUsage: [], // 磁盘使用率
      systemMemorySize: [], // 内存总空间
      systemMemoryUsage: [], // 内存使用率
      eachDiskSize: [] // 各个磁盘空间空间
      // eachDiskUsage: []// 各个磁盘使用空间
    }
  },
  computed: {
    // 设置主机类型
    setHostType() {
      return function(id) {
        const devTypeIdx = this.devTypeList.findIndex(item => item.id === id)
        if (devTypeIdx !== -1) {
          return id === 0 ? '' : this.devTypeList[devTypeIdx].dictdataName
        }
      }
    },
    // 设置主机状态
    setHostStatus() {
      return function(row) {
        return row.hyNetState === 1 ? '在线' : '离线'
      }
    },
    // 设置主机可用性标签
    setHostStataTag() {
      return function(row) {
        return row.hyNetState === 1 ? 'success' : 'info'
      }
    },
    // 设置主机类型下的主机数量
    setHostTypeStatictics() {
      return function(id) {
        const hostTypeStaticticsIdx = this.hostTypeStatictics.findIndex(item => item.devType === id)
        if (hostTypeStaticticsIdx !== -1) {
          return this.hostTypeStatictics[hostTypeStaticticsIdx].count
        }
      }
    },
    setSubType() {
      return function(hySubdevTypeId) {
        const idx = this.subDevType.findIndex(item => Number(item.id) === Number(hySubdevTypeId))
        if (idx !== -1) return this.subDevType[idx].dictdataName
      }
    },
    deviceTypeId() {
      return this.$route.query.deviceTypeId
    }
  },
  watch: {
    devTypeProp: {
      handler(newVal) {
        this.findHyitHostQuery.devType = newVal === 0 ? '' : newVal
        this.findHyitHost()
      },
      deep: true
    }
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    // this.devTypeId = Number(this.localStorageOperation('get', 'devTypeId')) === 0 ? '' : Number(this.localStorageOperation('get', 'devTypeId'))
    this.getHyitHostTypeStatictics()
    this.loadItType()

    if (this.devTypeProp === -1) {
      this.getHyitHostStatictics()
      this.loadEcharts()
    } else {
      this.findHyitHostQuery.devType = this.devTypeProp === 0 ? '' : this.devTypeProp
      const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
      if (pageQuery) {
        this.findHyitHostQuery = pageQuery
        const idx = this.devTypeList.findIndex(item => item.id === pageQuery.devType)
        this.devTypeList.forEach(item => {
          item.active = false
        })
        if (idx !== -1) {
          this.$set(this.devTypeList[idx], 'active', true)
        }
      }
      this.findHyitHost()
    }
  },
  methods: {
    // 按固定长度分割数组
    cutArray(array, subLength) {
      let index = 0
      let newArr = []
      while (index < array.length) {
        newArr.push(array.slice(index, index += subLength))
      }
      return newArr
    },
    // 导出数据，ws、http
    async sendRequest() {
      this.showDialog = true
      this.loading = true
      this.percentage = 0
      this.allSubDevType = await this.findAllSysDictionaryDetail()
      const data = { ...this.findHyitHostQuery }
      if (data.devType === 0) data.devType = ''
      if (this.cmdbItemTypeId) data.cmdbItemTypeId = this.cmdbItemTypeId
      const res = await request({
        url: api.itMonitor.findHyitHost,
        data: { ...data, page: 1, agents: this.agentsIds, limit: -1 }
      })
      if (res.code !== 1) return
      this.dataList = res
      const agents = this.agentsIds.split(',')
      const ids = []
      res.data.forEach(item => {
        ids.push(item.hyZhostId)
      })
      console.log(ids)
      // 这部分设备不取实时数据
      if (this.devTypeId === 479 || this.devTypeId === 481 || this.devTypeId === 483 || this.devTypeId === 482 || this.devTypeId === 490 || this.devTypeId === 480) {
        const datas = ['CPUQuantity', 'CPU', 'memorySize', 'memoryUsage', 'diskSize', 'diskUsage', 'eachDiskSize', 'eachDiskUsage']
        for (let i = 0; i < this.ExcelTitle.length; i++) {
          for (let j = 0; j < datas.length; j++) {
            if (String(this.ExcelTitle[i].dataIndex) === String(datas[j])) {
              this.ExcelTitle.splice(i, 1)
            }
          }
        }
        await this.exportFindHyitHost()
        this.percentage = 100
        this.loading = false
        setTimeout(() => {
          this.showDialog = false
          this.fillerList = this.fillerData
        }, 500)
      } else {
        this.ExcelTitle = [
          {title: '对象', dataIndex: 'hyMarkName', width: 40},
          {title: '类型', dataIndex: 'hyDevTypeId', width: 15},
          {title: '子类型', dataIndex: 'hySubdevTypeId', width: 15},
          {title: 'IP', dataIndex: 'hyIp', width: 30},
          {title: '监控项', dataIndex: 'hyItemCount', width: 10},
          {title: '在线状态', dataIndex: 'hyNetState', width: 10},
          {title: 'CPU数', dataIndex: 'CPUQuantity', width: 10},
          {title: 'CPU使用率(%)', dataIndex: 'CPU', width: 15},
          {title: '内存空间(G)', dataIndex: 'memorySize', width: 15},
          {title: '内存使用率(%)', dataIndex: 'memoryUsage', width: 15},
          {title: '磁盘总空间(G)', dataIndex: 'diskSize', width: 15},
          {title: '磁盘总使用率(%)', dataIndex: 'diskUsage', width: 15},
          {title: '各磁盘空间', dataIndex: 'eachDiskSize', width: 45},
          {title: '各磁盘使用率', dataIndex: 'eachDiskUsage', width: 30}
        ]
      }
      // 选择 所有
      if (!this.devTypeId || this.devTypeId === 0) {
        this.wrapList = ['M', 'N']
        const methed = ['getItemVMCpuData', 'getItemVMMemoryInfoData']
        if (ids.length > 100) {
          const idsArray = this.cutArray(ids, 100)
          const num = Number((100 / (agents.length * methed.length * 3 * idsArray.length)).toFixed(1))
          for (let c = 0; c < idsArray.length; c++) {
            for (let i = 0; i < agents.length; i++) {
              const storageData = await this.agentGetHostShowByWs(idsArray[c].toString(), agents[i].toString()) // 存储设备
              await this.exportFindHyitHost(storageData.data, 1)
              this.percentage = Number((this.percentage + num).toFixed(1))

              const systemData = await this.agentItAgentGetHostShow(idsArray[c].toString(), agents[i].toString()) // 操作系统
              await this.exportFindHyitHost(systemData.data, 2)
              this.percentage = Number((this.percentage + num).toFixed(1))

              for (let j = 0; j < methed.length; j++) { // 虚拟资源
                const cpuData = await this.agentGetHostData(idsArray[c].toString(), agents[i].toString(), methed[j])
                await this.exportFindHyitHost(cpuData, 3)
                this.percentage = Number((this.percentage + num).toFixed(1))

                const memoryInfoData = await this.agentGetHostData(idsArray[c].toString(), agents[i].toString(), methed[j])
                await this.exportFindHyitHost(memoryInfoData, 3)
                this.percentage = Number((this.percentage + num).toFixed(1))
              }
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        } else {
          const num = Number((100 / (agents.length * methed.length * 3)).toFixed(1))
          for (let i = 0; i < agents.length; i++) {
            const storageData = await this.agentGetHostShowByWs(ids.toString(), agents[i].toString()) // 存储设备
            await this.exportFindHyitHost(storageData.data, 1)
            this.percentage = Number((this.percentage + num).toFixed(1))

            const systemData = await this.agentItAgentGetHostShow(ids.toString(), agents[i].toString()) // 操作系统
            await this.exportFindHyitHost(systemData.data, 2)
            this.percentage = Number((this.percentage + num).toFixed(1))

            for (let j = 0; j < methed.length; j++) { // 虚拟资源
              const cpuData = await this.agentGetHostData(ids.toString(), agents[i].toString(), methed[j])
              await this.exportFindHyitHost(cpuData, 3)
              this.percentage = Number((this.percentage + num).toFixed(1))

              const memoryInfoData = await this.agentGetHostData(ids.toString(), agents[i].toString(), methed[j])
              await this.exportFindHyitHost(memoryInfoData, 3)
              this.percentage = Number((this.percentage + num).toFixed(1))
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        }
      }

      // 存储设备
      if (this.devTypeId === 477) {
        if (ids.length > 100) {
          const idsArray = this.cutArray(ids, 100)
          const num = Number((100 / (agents.length * idsArray.length)).toFixed(1))
          for (let c = 0; c < idsArray.length; c++) {
            for (let i = 0; i < agents.length; i++) {
              const storageData = await this.agentGetHostShowByWs(idsArray[c].toString(), agents[i].toString())
              await this.exportFindHyitHost(storageData.data)
              this.percentage = Number((this.percentage + num).toFixed(1))
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        } else {
          const num = Number((100 / agents.length).toFixed(1))
          for (let i = 0; i < agents.length; i++) {
            const storageData = await this.agentGetHostShowByWs(ids.toString(), agents[i].toString())
            console.log(storageData)
            await this.exportFindHyitHost(storageData.data)
            this.percentage = Number((this.percentage + num).toFixed(1))
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        }
      }
      // 虚拟资源
      if (this.devTypeId === 478) {
        const methed = ['getItemVMCpuData', 'getItemVMMemoryInfoData']
        if (ids.length > 100) {
          const idsArray = this.cutArray(ids, 100)
          const num = Number((100 / (agents.length * methed.length * 2 * idsArray.length)).toFixed(1))
          for (let c = 0; c < idsArray.length; c++) {
            for (let i = 0; i < agents.length; i++) {
              for (let j = 0; j < methed.length; j++) {
                const cpuData = await this.agentGetHostData(idsArray[c].toString(), agents[i].toString(), methed[j])
                await this.exportFindHyitHost(cpuData)
                this.percentage = Number((this.percentage + num).toFixed(1))
                const memoryInfoData = await this.agentGetHostData(idsArray[c].toString(), agents[i].toString(), methed[j])
                await this.exportFindHyitHost(memoryInfoData)
                this.percentage = Number((this.percentage + num).toFixed(1))
              }
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        } else {
          const num = Number((100 / (agents.length * methed.length * 2)).toFixed(1))
          console.log(num)
          for (let i = 0; i < agents.length; i++) {
            for (let j = 0; j < methed.length; j++) {
              const cpuData = await this.agentGetHostData(ids.toString(), agents[i].toString(), methed[j])
              await this.exportFindHyitHost(cpuData)
              this.percentage = Number((this.percentage + num).toFixed(1))
              const memoryInfoData = await this.agentGetHostData(ids.toString(), agents[i].toString(), methed[j])
              await this.exportFindHyitHost(memoryInfoData)
              this.percentage = Number((this.percentage + num).toFixed(1))
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        }
      }
      // 操作系统
      if (this.devTypeId === 484) {
        this.wrapList = ['M', 'N']
        if (ids.length > 100) {
          const idsArray = this.cutArray(ids, 100)
          const num = Number((100 / (agents.length * idsArray.length)).toFixed(1))
          for (let c = 0; c < idsArray.length; c++) {
            for (let i = 0; i < agents.length; i++) {
              const systemData = await this.agentItAgentGetHostShow(idsArray[c].toString(), agents[i].toString())
              await this.exportFindHyitHost(systemData.data)
              this.percentage = Number((this.percentage + num).toFixed(1))
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        } else {
          const num = Number((100 / agents.length).toFixed(1))
          for (let i = 0; i < agents.length; i++) {
            const systemData = await this.agentItAgentGetHostShow(ids.toString(), agents[i].toString())
            await this.exportFindHyitHost(systemData.data)
            this.percentage = Number((this.percentage + num).toFixed(1))
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
        }
      }
    },
    // 获取  websocket  存储设备
    agentGetHostShowByWs(ids, agent) {
      return new Promise((resolve, reject) => {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        if (!wsToken) return
        let timer = setTimeout(() => {
          resolve({data: ''})
        }, 5000)
        const getUserSessionResult = getUserSession()
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetStorageData,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: agent,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            hostid: ids,
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        },
        (res) => {
          clearTimeout(timer)
          const wsRes = isJSONString(res.HostStorageData) ? JSON.parse(res.HostStorageData) : res.HostStorageData
          if (wsRes) {
            resolve({
              data: wsRes
            })
          } else if (res === 'error') {
            resolve({
              data: ''
            })
          }
        }, (err) => {
          this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
          console.log(err)
        })
      })
    },
    // 获取  websocket  虚拟设备
    agentGetHostData(ids, agent, method) {
      return new Promise((resolve, reject) => {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        if (!wsToken) return
        let timer = setTimeout(() => {
          resolve({data: ''})
        }, 5000)
        const getUserSessionResult = getUserSession()
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetHostData,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: agent,
            hostid: ids,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            methed: method,
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        },
        (res) => {
          clearTimeout(timer)
          const wsRes = isJSONString(res[`${method}`]) ? JSON.parse(res[`${method}`]) : res[`${method}`]
          if (wsRes && res.methed === method) {
            resolve({
              data: wsRes,
              method
            })
          } else if (res === 'error') {
            resolve({
              data: ''
            })
          }
        }, (err) => {
          this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
          console.log(err)
        })
      })
    },
    // 获取 websocket  操作系统
    agentItAgentGetHostShow(ids, agent) {
      return new Promise((resolve, reject) => {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        if (!wsToken) return
        let timer = setTimeout(() => {
          resolve({data: ''})
        }, 5000)
        const getUserSessionResult = getUserSession()
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetHostShow,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: agent,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            hostid: ids,
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        },
        (res) => {
          clearTimeout(timer)
          const wsRes = isJSONString(res.HostShowData) ? JSON.parse(res.HostShowData) : res.HostShowData
          if (wsRes) {
            // this.exportFindHyitHost(wsRes)
            resolve({
              data: wsRes
            })
          } else if (res === 'error') {
            resolve({
              data: ''
            })
          }
        }, (err) => {
          this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
          console.log(err)
        })
      })
    },
    // 导出的数据 http
    async exportFindHyitHost(wsRes, val) {
      console.log(wsRes, val)
      // 存储设备 数据
      if (this.devTypeId === 477 || val === 1) {
        if (wsRes) {
          if (wsRes.System.length > 0) {
            this.cpuRatio = []
            this.memoryUsage = []
            this.virtual = []
            // cpu百分比数据
            const cpu = []
            const memoryAble = [] // 可用内存
            const memoryMem = [] // 总内存
            wsRes.System.forEach(item => {
              if (item.itemName === 'CPU Idle') {
                cpu.push(item)
              }
            })
            this.cpuRatio = cpu.pop()
            // 内存百分比数据
            wsRes.Memory.forEach(item => {
              if (item.itemName === 'Total Physical Available') {
                memoryAble.push(item)
              } else if (item.itemName === 'Total Physical Memory') {
                memoryMem.push(item)
              }
            })
            const memoryAbleVal = sizeUnitsConversion(Number(memoryAble[0].itemValue), 'capital') // 可用内存
            const memoryMemVal = sizeUnitsConversion(Number(memoryMem[0].itemValue), 'capital') // 总内存
            const data = this.$tool.sizeUnitsTransform('B', 'GB', Number(memoryMem[0].itemValue))
            const memoryOccVal = Number((memoryMemVal.size - memoryAbleVal.size).toFixed(2)) // 已用内存
            const memoryVal = `${(Number((memoryOccVal / memoryMemVal.size).toFixed(2)) * 100)}`
            memoryMem[0].memory = memoryVal
            memoryMem[0].memorySize = `${(data.size).toFixed(2)}`
            this.memoryUsage = memoryMem[0]
          }
        }
      }

      // 操作系统
      if (this.devTypeId === 484 || val === 2) {
        if (wsRes) {
          // cpu
          if (wsRes.cpu.length > 0) {
            const cpuSize = []
            wsRes.cpu.forEach(val => {
              if (val.itemName.indexOf('CPU utilization') !== -1) {
                cpuSize.push(val)
              }
            })
            this.systemRatio = cpuSize
            console.log(this.systemRatio)
          }
          // 内存
          const totalMemory = wsRes['总内存'].length > 0 ? wsRes['总内存'] : []
          const freeMemoryPercentage = wsRes['可用内存百分比'].length > 0 ? wsRes['可用内存百分比'] : []
          if (totalMemory.length > 0) {
            this.systemMemorySize = totalMemory
          }
          console.log(this.systemMemorySize)
          if (freeMemoryPercentage.length > 0) {
            freeMemoryPercentage.forEach(item => {
              const data = (100 - item.itemValue).toFixed(2)
              item.usage = data
            })
            this.systemMemoryUsage = freeMemoryPercentage
            console.log(this.systemMemoryUsage)
          }
          // 磁盘IO
          const diskIO = wsRes['磁盘'].length > 0 ? wsRes['磁盘'] : []
          if (diskIO.length > 0) {
            const diskUsage = []
            const diskSize = []
            diskIO.forEach(val => {
              // 磁盘空间
              if (val.itemName.indexOf('Total space') !== -1) {
                diskSize.push(val)
              }
              // 磁盘使用数
              if (val.itemName.indexOf('Used space') !== -1) {
                diskUsage.push(val)
              }
            })

            // 磁盘空间总大小 ====================
            // 摘出相同id项目
            let data = []
            diskSize.forEach(items => {
              let {hostid} = items
              if (!data[hostid]) {
                data[hostid] = {
                  hostid,
                  children: []
                }
              }
              data[hostid].children.push(items)
            })
            let dataPush = Object.values(data)
            console.log(dataPush)
            // 合并相同id项磁盘大小
            const totalsize = []
            dataPush.forEach(itema => {
              if (itema.children.length > 1) {
                let a = 0
                itema.children.forEach(child => {
                  a += Number(child.itemValue)
                })
                const val = this.$tool.deepCopy(itema.children[0])
                val.itemValue = a
                totalsize.push(val)
              } else {
                totalsize.push(itema.children[0])
              }
            })
            // 磁盘空间总使用率 ====================
            // 摘出相同id 磁盘使用大小
            let dataUse = []
            diskUsage.forEach(items => {
              let {hostid} = items
              if (!dataUse[hostid]) {
                dataUse[hostid] = {
                  hostid,
                  children: []
                }
              }
              dataUse[hostid].children.push(items)
            })
            let dataPushUse = Object.values(dataUse)

            // 合并相同id项磁盘使用大小
            const totalUse = []
            dataPushUse.forEach(itema => {
              if (itema.children.length > 1) {
                let b = 0
                itema.children.forEach(child => {
                  b += Number(child.itemValue)
                })
                const val = this.$tool.deepCopy(itema.children[0])
                val.itemValue = b
                totalUse.push(val)
              } else {
                totalUse.push(itema.children[0])
              }
            })
            console.log(totalUse)

            // 磁盘使用百分比
            totalsize.forEach(items => {
              totalUse.forEach(itemUse => {
                if (+items.hostid === +itemUse.hostid) {
                  const data = (+itemUse.itemValue / +items.itemValue).toFixed(4)
                  itemUse.usage = data // 使用率
                }
              })
            })
            // 各个磁盘总量信息 diskTotalData
            dataPush.forEach(eachItem => {
              let arr1 = []
              let newArr = []
              eachItem.children.forEach(chilItem => {
                if (arr1.indexOf(chilItem.itemName) === -1) {
                  arr1.push(chilItem.itemName)
                  newArr.push(chilItem)
                }
              })
              eachItem.diskTotalData = newArr
            })
            console.log(dataPush)
            // 各个磁盘已用信息 diskTotalData
            dataPushUse.forEach(eachUseItem => {
              let arr1 = []
              let newArr = []
              eachUseItem.children.forEach(chilItem => {
                if (arr1.indexOf(chilItem.itemName) === -1) {
                  arr1.push(chilItem.itemName)
                  newArr.push(chilItem)
                }
              })
              eachUseItem.diskUseData = newArr
            })
            console.log(dataPushUse)
            dataPush.forEach(dataPushData => {
              dataPushUse.forEach(dataPushUseData => {
                if (+dataPushData.hostid === +dataPushUseData.hostid) {
                  dataPushData.diskTotalData.forEach(dataPushChile => {
                    dataPushChile.name = dataPushChile.itemName.split(':')[0]
                    dataPushUseData.diskUseData.forEach(dataPushUseChile => {
                      dataPushUseChile.name = dataPushUseChile.itemName.split(':')[0]
                      if (dataPushChile.name === dataPushUseChile.name) {
                        dataPushChile.itemUseValue = dataPushUseChile.itemValue
                      }
                    })
                  })
                }
              })
            })
            this.eachDiskSize = dataPush // 各个磁盘空间大小
            // this.eachDiskUsage = dataPushUse // 各个磁盘使用大小
            this.systemDiskSize = totalsize // 磁盘总大小
            this.systemDiskUsage = totalUse // 磁盘总使用率
            console.log(this.systemDiskSize, this.systemDiskUsage)
          }
        }
      }

      // 虚拟资源 数据
      if (this.devTypeId === 478 || val === 3) {
        if (wsRes) {
          if (wsRes.data.length > 0) {
            // cpu
            if (wsRes.method === 'getItemVMCpuData') {
              const cpuSd = []
              const cpuNumber = []
              wsRes.data.forEach(val => {
                if (val.itemName.indexOf('CPU usage') !== -1 && val.itemName.indexOf('in percents') !== -1) {
                  cpuSd.push(val)
                }
                if (val.itemName.indexOf('Number of virtual CPUs') !== -1) {
                  cpuNumber.push(val)
                }
              })
              this.fictitiousRatio = cpuSd
              this.fictitiousNumber = cpuNumber
              console.log(this.fictitiousRatio, this.fictitiousNumber)
            }
          }
          // 内存
          if (wsRes.method === 'getItemVMMemoryInfoData') {
            const memorySize = []
            const memoryAll = []
            wsRes.data.forEach(val => {
              if (val.itemName.indexOf('Guest memory usage') !== -1) {
                memorySize.push(val)
              }
              if (val.itemName.indexOf('Memory size') !== -1) {
                memoryAll.push(val)
              }
            })
            // 内存使用率
            memoryAll.forEach(aItem => {
              memorySize.forEach(bItem => {
                if (+aItem.hostid === +bItem.hostid) {
                  const a = (bItem.itemValue / aItem.itemValue).toFixed(4)
                  bItem.usage = a
                }
              })
            })
            this.memorySize = memorySize
            this.memoryTotal = memoryAll
          }
        }
      }

      this.dataList.data.forEach(item => {
        Object.keys(item).forEach(keys => {
          if (keys === 'hyDevTypeId') {
            const idx = this.devTypeList.findIndex(itemList => +itemList.id === +item.hyDevTypeId)
            if (idx !== -1) {
              if (item.hyDevTypeId === 0 || item.hyDevTypeId === '') {
                item.hyDevTypeId = ''
              } else {
                item.hyDevTypeId = this.devTypeList[idx].dictdataName
              }
            }
          }
          if (keys === 'hySubdevTypeId') {
            const idx = this.allSubDevType.findIndex(itemData => +itemData.id === +item.hySubdevTypeId)
            if (idx !== -1) {
              item.hySubdevTypeId === 0 ? item.hySubdevTypeId = '' : item.hySubdevTypeId = this.allSubDevType[idx].dictdataName
            } else {
              item.hySubdevTypeId = ''
            }
          }
          if (keys === 'hyNetState') {
            switch (item.hyNetState) {
              case 0:
                item.hyNetState = '离线'
                break
              case 1:
                item.hyNetState = '在线'
                break
            }
          }
        })
        // 存储设备
        if (this.devTypeId === 477 || val === 1) {
          if (this.cpuRatio) {
            if (+item.hyZhostId === +this.cpuRatio.hostid) {
              item.CPU = `${this.cpuRatio.itemValue}`
            }
            if (+item.hyZhostId === +this.memoryUsage.hostid) {
              item.memoryUsage = `${this.memoryUsage.memory}`
              item.memorySize = this.memoryUsage.memorySize
            }
          }
        }
        // 操作系统
        if (this.devTypeId === 484 || val === 2) {
          // cpu
          if (this.systemRatio.length > 0) {
            this.systemRatio.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                item.CPU = `${(+wsItem.itemValue).toFixed(2)}`
              }
            })
          }
          // 内存大小
          if (this.systemMemorySize.length > 0) {
            this.systemMemorySize.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                const totaldata = this.$tool.sizeUnitsTransform('B', 'GB', Number(wsItem.itemValue))
                item.memorySize = `${(totaldata.size).toFixed(2)}`
              }
            })
          }
          // 内存使用率
          if (this.systemMemoryUsage.length > 0) {
            this.systemMemoryUsage.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                item.memoryUsage = `${(100 - wsItem.usage).toFixed(2)}`
              }
            })
          }
          // 磁盘
          if (this.systemDiskSize.length > 0) {
            // 总空间
            this.systemDiskSize.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                const data = this.$tool.sizeUnitsTransform('B', 'GB', Number(wsItem.itemValue))
                item.diskSize = `${(data.size).toFixed(2)}`
              }
            })

            // 总使用率
            this.systemDiskUsage.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                item.diskUsage = `${(wsItem.usage * 100).toFixed(2)}`
              }
            })
            // 各个磁盘使用率
            // 拼接各个磁盘空间和使用空间
            this.eachDiskSize.forEach(eachItem => {
              if (+item.hyZhostId === +eachItem.hostid) {
                const Utilization = []
                const useSize = []
                eachItem.diskTotalData.forEach(diskItem => {
                  const rate = (diskItem.itemUseValue / diskItem.itemValue).toFixed(4)
                  const value = diskItem.itemName.split(':')[0]
                  let name = ''
                  value.indexOf('/') === -1 ? name = `${value}盘` : name = value
                  Utilization.push(`【${name}】使用率：${(rate * 100).toFixed(2)}%`)
                  const val = sizeUnitsConversion(Number(diskItem.itemValue), 'capital')
                  const use = sizeUnitsConversion(Number(diskItem.itemUseValue), 'capital')
                  useSize.push(`【${name}】空间：${val.size}${val.units} - 已用：${use.size}${use.units}`)
                })
                item.eachDiskUsage = Utilization.join('\n') // 各磁盘使用率
                item.eachDiskSize = useSize.join('\n') // 各磁盘空间
              }
            })
          }
        }
        // 虚拟资源
        if (this.devTypeId === 478 || val === 3) {
          // cpu
          if (this.fictitiousRatio.length > 0) {
            this.fictitiousRatio.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                item.CPU = `${wsItem.itemValue}`
              }
            })
          }
          if (this.fictitiousNumber.length > 0) {
            this.fictitiousNumber.forEach(ficItem => {
              if (+item.hyZhostId === +ficItem.hostid) {
                item.CPUQuantity = ficItem.itemValue
              }
            })
          }
          // 内存
          if (this.memorySize.length > 0) {
            this.memorySize.forEach(memoryItem => {
              if (+item.hyZhostId === +memoryItem.hostid) {
                item.memoryUsage = `${(memoryItem.usage * 100).toFixed(2)}`
              }
            })
          }
          if (this.memoryTotal.length > 0) {
            this.memoryTotal.forEach(totalItem => {
              if (+item.hyZhostId === +totalItem.hostid) {
                const data = this.$tool.sizeUnitsTransform('B', 'GB', Number(totalItem.itemValue))
                item.memorySize = `${(data.size).toFixed(2)}`
              }
            })
          }
        }
      })
      console.log(this.dataList)
      this.fillerData = this.dataList.data
    },

    // 设置可用性
    setAvailables(row, index) {
      let key = 'info'
      if (row.hyAvailable === 1 && index === 0 || row.hySnmpAvailable === 1 && index === 1 || row.hyJmxAvailable === 1 && index === 2 || row.hyIpmiAvailable === 1 && index === 3) {
        key = 'success'
      }
      if (row.hyAvailable === 2 && index === 0 || row.hySnmpAvailable === 2 && index === 1 || row.hyJmxAvailable === 2 && index === 2 || row.hyIpmiAvailable === 2 && index === 3) {
        key = 'danger'
      }
      return key
    },
    // 加载统计图
    loadEcharts() {
      const self = this
      const myChart = echarts.init(self.$refs['pieBar'])
      const option = {
        color: ['#00b285', '#f4f4f5'],
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '10%',
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            labelLine: {
              show: false
            },
            data: self.devStatus
          }
        ]
      }
      myChart.setOption(option, true)
    },
    // 切换页码条数，重新返回首页加载数据
    handleSizeChange(val) {
      this.findHyitHostQuery.limit = val
      this.findHyitHostQuery.page = 1
      this.findHyitHost()
    },
    // 切换当前页码，查询加载数据
    handleCurrentChange(val) {
      this.findHyitHostQuery.page = val
      this.findHyitHost()
    },
    // 搜索
    handleFilter() {
      this.findHyitHostQuery.page = 1
      this.findHyitHost()
      // this.exportFindHyitHost()
      // this.sendRequest() // 请求导出的数据
    },
    // 进入主机详情
    async handleCheck(row) {
      console.log(row)
      const queryData = { ...this.findHyitHostQuery }
      if (queryData.devType === '') queryData.devType = 0
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...queryData, route: this.$route.name
      }))
      const { data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids: row.hySubdevTypeId }
      })
      if (row.fromAgent) this.localStorageOperation('set', 'fromAgent', row.fromAgent)
      if (row.fromHostId) this.localStorageOperation('set', 'fromHostId', row.fromHostId)
      this.$router.push({
        name: 'ResourceMonitorDetail',
        query: {
          id: row.hyHostId || 0,
          zbxHostId: row.hyZhostId,
          agent: row.agent,
          devTypeId: this.handelDevTypeId === '' ? row.hyDevTypeId : this.handelDevTypeId,
          subType: data && data.length > 0 ? data[0].dictdataValue : '',
          hySubdevTypeId: row.hySubdevTypeId && row.hySubdevTypeId > 0 ? row.hySubdevTypeId : ''
        }
      })
    },
    // 获取设备类型
    loadItType() {
      this.paginationShow = false
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.thumb = `image/it-monitor/it-monitor-type-icon-${item.id}.png`
            item.count = 0
            item.active = false
          })
          this.devTypeList = res.data
          this.devTypeList.splice(0, 0, {
            id: 0,
            dictdataName: '所有',
            thumb: `image/it-monitor/it-monitor-type-icon.png`,
            count: 0,
            active: true
          })
          this.$nextTick(() => {
            if (this.devTypeList.length > 0) {
              this.findHyitHostQuery.devType = this.devTypeList[0].id === 0 ? '' : this.devTypeList[0].id
            }
            const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
            if (pageQuery && !this.deviceTypeId) {
              this.findHyitHostQuery = pageQuery
              const idx = this.devTypeList.findIndex(item => item.id === pageQuery.devType)
              this.devTypeList.forEach(item => {
                item.active = false
              })
              if (idx !== -1) {
                this.$set(this.devTypeList[idx], 'active', true)
                this.devTypeId = this.devTypeList[idx].id
              }
            }
            if (this.deviceTypeId) {
              const idx = this.devTypeList.findIndex(item => +item.id === +this.deviceTypeId)
              if (idx !== -1) {
                this.devTypeList.forEach(item => {
                  item.active = false
                })
                this.$set(this.findHyitHostQuery, 'devType', this.deviceTypeId)
                this.$set(this.findHyitHostQuery, 'page', 1)
                this.$set(this.findHyitHostQuery, 'limit', 10)
                this.$set(this.devTypeList[idx], 'active', true)
              }
            }
            this.findHyitHost()
          })
        }
      })
    },
    // 获取设备状态统计
    getHyitHostStatictics() {
      request({
        url: api.itMonitor.getHyitHostStatictics,
        data: { agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1) {
          this.devStatus[0].value = res.model.onlineCount
          this.devStatus[1].value = res.model.offlineCount
          this.loadEcharts()
        }
      })
    },
    // 获取主机
    findHyitHost() {
      const data = { ...this.findHyitHostQuery }
      if (data.devType === 0) data.devType = ''
      if (this.cmdbItemTypeId) data.cmdbItemTypeId = this.cmdbItemTypeId
      request({
        url: api.itMonitor.findHyitHost,
        data: { ...data, agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1) {
          this.paginationShow = false
          this.findHyitHostQuery.total = parseInt(res.count)
          this.assetsDeviceList = res.data
          this.listLoading = false
          const subDevType = []
          res.data.forEach(item => subDevType.push(item.hySubdevTypeId))
          this.findSysDictionaryDetail(this.$tool.uniqueArray(subDevType).toString())
          this.$nextTick(function() {
            this.paginationShow = true
          })
        }
      })
    },
    // 选择设备获取主机
    handelDevTypeTab(val, idx) {
      console.log(val)
      val.id === 0 ? this.devTypeId = '' : this.devTypeId = val.id
      this.findHyitHostQuery.page = 1
      this.handelDevTypeId = val.id
      val.dictdataName === '所有' ? this.exportFileName = 'IT资源监控' : this.exportFileName = val.dictdataName
      if (this.devTypeList[idx].active) return
      this.devTypeList.forEach(item => {
        item.active = false
      })
      this.devTypeList[idx].active = true
      this.$nextTick(() => {
        this.assetsDeviceList = []
        this.findHyitHostQuery.devType = val.id === 0 ? '' : val.id
        this.findHyitHost()
        // this.exportFindHyitHost()
        // this.sendRequest() // 请求导出数据
      })
    },
    // 获取设备类型下的主机数量
    getHyitHostTypeStatictics() {
      request({
        url: api.itMonitor.getHyitHostTypeStatictics,
        data: { agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1) {
          this.hostTypeStatictics = res.data
        }
      })
    },
    findSysDictionaryDetail(ids) {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids }
      }).then(res => {
        this.subDevType = res.data
      })
    },
    async findAllSysDictionaryDetail() {
      const res = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1}
      })
      return res.data
    }
  }
}
