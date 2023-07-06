import {sendWebsocket} from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import {getUserSession} from '@/utils/auth'

/**
 * @description device-table-mixins.js
 * @author linhaojia
 * @date 2022/12/13 16:54:32
 */
export default {
  data() {
    return {}
  },
  methods: {
    getDeviceItMonitorData(hostType, fromType, host) {
      console.log(hostType, fromType, host)
      const hostByAgent = []
      host.forEach(item => {
        const agentIndex = hostByAgent.findIndex(el => +el.agent === +item.agent)
        if (agentIndex === -1) {
          hostByAgent.push({
            agent: item.agent,
            fromAgent: item.fromAgent,
            host: [item]
          })
        } else {
          hostByAgent[agentIndex].host.push(item)
        }
      })
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      const wsCommonQuery = {
        token: wsToken,
        companyId: getUserSessionResult.companyId,
        appId: getUserSessionResult.appId,
        fromType: fromType
      }

      hostByAgent.forEach(item => {
        const hostid = []
        const fromHostId = []
        item.host.forEach(items => {
          hostid.push(items.hyZhostId)
          if (item.fromHostId) fromHostId.push(item.fromHostId)
        })
        wsCommonQuery.fromAgent = item.fromAgent
        wsCommonQuery.agent = item.agent
        wsCommonQuery.deviceType = hostType

        // 存储设备
        if (hostType === 477) {
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetStorageData,
            data: { ...wsCommonQuery, hostid: hostid.toString(), fromHostId: fromHostId.toString() }
          })
        }
        // 虚拟资源
        if (hostType === 478) {
          // cpu数据
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostData,
            data: { ...wsCommonQuery, hostid: hostid.toString(), fromHostId: fromHostId.toString(), methed: 'getItemVMCpuData' }
          })
          // 内存数据
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostData,
            data: { ...wsCommonQuery, hostid: hostid.toString(), fromHostId: fromHostId.toString(), methed: 'getItemVMMemoryInfoData' }
          })
        }
        // 服务设备
        // if (hostType === 479) {}
        // 网络设备
        if (hostType === 481) {
          // 设备信息数据
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostShow,
            data: { ...wsCommonQuery, hostid: hostid.toString(), fromHostId: fromHostId.toString() }
          })
          // 端口信息
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostPort,
            data: { ...wsCommonQuery, hostid: hostid.toString(), fromHostId: fromHostId.toString() }
          })
          // 设备的流量汇总
          this.$ws.sendWebsocket(this.wsCmd.host.default, {
            cmd: this.wsCmd.itMonitor.itAgentGetHostPortTotal,
            data: {
              ...wsCommonQuery,
              hostid: hostid.toString(),
              fromHostId: fromHostId.toString()
            }
          })
        }
        // 中间件
        if (hostType === 482) {
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetMiddlewareData,
            data: { ...wsCommonQuery, hostid: hostid.toString(), fromHostId: fromHostId.toString() }
          })
        }
        // 数据库
        if (hostType === 483) {
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetDBData,
            data: { ...wsCommonQuery, hostid: hostid.toString(), fromHostId: fromHostId.toString(), methed: 'getItemVMMemoryInfoData' }
          })
        }
        // 操作系统
        if (hostType === 484) {
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostShow,
            data: { ...wsCommonQuery, hostid: hostid.toString(), fromHostId: fromHostId.toString() }
          })
        }
      })
    },
    async watchDeviceItMonitorData(res) {
      const itemData = { agent: res.agent, cmd: res.cmd, methed: res.methed }
      // 存储设备
      if (res.deviceType === 477) {
        const HostStorageData = this.$tool.isJSONString(res.HostStorageData) ? JSON.parse(res.HostStorageData) : []

        // cpu使用率
        itemData.cpuUsagePercents = []
        HostStorageData.System.forEach(item => {
          if (item.itemName.indexOf('CPU Idle') !== -1) {
            itemData.cpuUsagePercents.push({
              ...item,
              cpuUsagePercents: 100 - item.itemValue
            })
          }
        })

        // 内存使用率
        itemData.menoryUsagePercents = []
        const memoryData = this.$tool.classifiedJSONDataByField(HostStorageData.Memory, 'hostid')
        if (memoryData) {
          Object.keys(memoryData).forEach(key => {
            let freeItem = null
            let totalItem = null
            memoryData[`${key}`].forEach(item => {
              if (item.itemName.indexOf('Total Physical Available') !== -1) {
                freeItem = item
              }
              if (item.itemName.indexOf('Total Physical Memory') !== -1) {
                totalItem = item
              }
            })
            itemData.menoryUsagePercents.push({
              hostid: key,
              memoryUsagePercents: this.$tool.getPercent(+totalItem.itemValue - +freeItem.itemValue, +totalItem.itemValue),
              totalMemoryItemId: totalItem.itemid,
              ableValMemoryItemId: freeItem.itemid,
              totalMemoryValueType: totalItem.valueType,
              ableValMemoryValueType: freeItem.valueType
            })
          })
        }

        // 卷使用率 卷总空间
        itemData.volumeTotal = []
        itemData.volumeUsagePercents = []
        const diskData = this.$tool.classifiedJSONDataByField(HostStorageData.Disk, 'hostid')
        Object.keys(diskData).forEach(key => {
          let totalSize = 0
          let usedSize = 0
          let usedItemId = []
          let usedItemValueType = []
          let totalItemId = []
          let totalItemValueType = []
          diskData[`${key}`].forEach(item => {
            if (item.itemName.indexOf('Storage Size on') !== -1) {
              totalSize += +item.itemValue
              totalItemId.push(item.itemid)
              totalItemValueType.push(item.valueType)
            }
            if (item.itemName.indexOf('Storage Used on') !== -1) {
              usedSize += +item.itemValue
              usedItemId.push(item.itemid)
              usedItemValueType.push(item.valueType)
            }
          })
          const sizeUnitsTransform = this.$tool.sizeUnitsTransform('B', 'GB', totalSize)
          itemData.volumeTotal.push({
            volumeTotalSize: sizeUnitsTransform.size,
            hostid: key
          })
          itemData.volumeUsagePercents.push({
            volumeUsagePercents: this.$tool.getPercent(usedSize, totalSize),
            hostid: key,
            usedItemId, usedItemValueType, totalItemId, totalItemValueType
          })
        })
      }
      // 虚拟资源
      if (res.deviceType === 478) {
        itemData.deviceType = res.deviceType
        itemData.cpuUsagePercents = []

        // cpu使用率
        const getItemVMCpuData = this.$tool.isJSONString(res.getItemVMCpuData) ? JSON.parse(res.getItemVMCpuData) : []
        getItemVMCpuData.forEach(item => {
          if (item.itemName.indexOf('CPU usage in percents') !== -1) {
            itemData.cpuUsagePercents.push(item)
          }
        })

        // 内存大小 内存使用率
        itemData.memoryTotal = []
        itemData.memoryUsagePercents = []
        const getItemVMMemoryInfoData = this.$tool.isJSONString(res.getItemVMMemoryInfoData) ? JSON.parse(res.getItemVMMemoryInfoData) : []
        itemData.memorySize = []
        itemData.memoryUsagePercents = []
        getItemVMMemoryInfoData.forEach(item => {
          if (item.itemName.indexOf('Memory size') !== -1) {
            const sizeUnitsTransform = this.$tool.sizeUnitsTransform(item.units, 'GB', item.itemValue)
            itemData.memorySize.push({
              ...item,
              transformItemValue: +sizeUnitsTransform.size
            })
            const usageFilter = getItemVMMemoryInfoData.filter(el => +el.hostid === +item.hostid && el.itemName.indexOf('memory usage') !== -1)
            if (usageFilter.length > 0) {
              itemData.memoryUsagePercents.push({
                memoryUsagePercents: this.$tool.getPercent(+usageFilter[0].itemValue, +item.itemValue),
                ...item,
                memorySizeItemId: item.itemid,
                memorySizeValueType: item.valueType,
                memoryUsageItemId: usageFilter[0].itemid,
                memoryUsageValueType: usageFilter[0].valueType
              })
            }
          }
        })
      }
      // 服务设备
      // if (res.deviceType === 479) {}
      // 网络设备
      if (res.deviceType === 481) {
        // 设备信息
        if (res.HostShowData) {
          const HostShowData = this.$tool.isJSONString(res.HostShowData) ? JSON.parse(res.HostShowData) : []

          // 板卡数量
          itemData.cardCount = []
          const cpuData = this.$tool.classifiedJSONDataByField(HostShowData.cpu, 'hostid')
          Object.keys(cpuData).forEach(key => {
            let currentCard = []
            cpuData[`${key}`].forEach(item => {
              const itemName = this.$tool.conversionSymbols(item.itemName)
              const dataName = itemName.split('(')[0]
              const idx = currentCard.findIndex(items => items.name === dataName)
              if (idx === -1) currentCard.push({ name: dataName })
            })
            itemData.cardCount.push({
              cardCount: currentCard.length,
              hostid: key
            })
          })
        }
        // 端口信息
        if (res.HostPortData && res.cmd === 'it-agentGetHostPort-websocket') {
          const HostPortData = this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData) : []
          itemData.portCount = []
          HostPortData.forEach(item => {
            // 端口数量
            if (item['端口数量'] && item['端口数量'].length > 0) {
              itemData.portCount.push(item['端口数量'][0])
            }
          })
        }
        // 流量汇总数据
        if (res.HostPortData && res.cmd === 'it-agentGetHostPortTotal-websocket') {
          const HostPortData = this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData) : []
          itemData.hostFlow = []
          HostPortData.forEach(item => {
            const tmp = {}
            const send = item['端口每秒发送速率汇总'] || []
            const receive = item['端口每秒接收速率汇总'] || []

            if (send.length > 0) {
              tmp.hostid = send[0].hostid
              const sendUnit = send[0].units.split('/')[0]
              const sizeUnitsTransform = this.$tool.sizeUnitsTransform(sendUnit, 'MB', send[0].itemValue)
              tmp.sendItemId = send[0].itemid
              tmp.sendValueType = send[0].valueType
              tmp.sendUnits = send[0].units
              tmp.sendSize = +sizeUnitsTransform.size.toFixed(2)
            }

            if (receive.length > 0) {
              tmp.hostid = receive[0].hostid
              const receiveUnit = receive[0].units.split('/')[0]
              const sizeUnitsTransform = this.$tool.sizeUnitsTransform(receiveUnit, 'MB', receive[0].itemValue)
              tmp.receiveItemId = receive[0].itemid
              tmp.receiveValueType = receive[0].valueType
              tmp.receiveUnits = receive[0].units
              tmp.receiveSize = +sizeUnitsTransform.size.toFixed(2)
            }
            itemData.hostFlow.push(tmp)
          })
        }
      }
      // 中间件
      if (res.deviceType === 482) {
        const HostStorageData = this.$tool.isJSONString(res.HostStorageData) ? JSON.parse(res.HostStorageData) : []
        itemData.requestCount = []
        itemData.send = []
        itemData.receive = []
        itemData.sendReceive = []
        if (HostStorageData['IIS perf']) {
          HostStorageData['IIS perf'].forEach(item => {
            // 请求数
            if (item.itemName === 'IIS: Method Total requests per second') {
              itemData.requestCount.push(item)
            }
            // 发送
            if (item.itemName === 'IIS: Bytes Received per second') {
              const unit = item.units.split('ps')[0]
              const sizeUnitsTransform = this.$tool.sizeUnitsTransform(unit, 'KB', item.itemValue)
              item.size = sizeUnitsTransform.size.toFixed(2)
              itemData.send.push(item)
            }
            // 接收
            if (item.itemName === 'IIS: Bytes Sent per second') {
              const unit = item.units.split('ps')[0]
              const sizeUnitsTransform = this.$tool.sizeUnitsTransform(unit, 'KB', item.itemValue)
              item.size = sizeUnitsTransform.size.toFixed(2)
              itemData.receive.push(item)
            }
          })
        }
        if (HostStorageData['tomcat apache']) {
          HostStorageData['tomcat apache'].forEach(item => {
            // 请求数
            if (item.itemName.indexOf('Requests per second') !== -1) {
              itemData.requestCount.push(item)
            }
            // 发送
            if (item.itemName.indexOf('Bytes received per second') !== -1) {
              const unit = item.units.split('ps')[0]
              const sizeUnitsTransform = this.$tool.sizeUnitsTransform(unit, 'KB', item.itemValue)
              item.size = sizeUnitsTransform.size.toFixed(2)
              itemData.send.push(item)
            }
            // 接收
            if (item.itemName.indexOf('Bytes sent per second') !== -1) {
              const unit = item.units.split('ps')[0]
              const sizeUnitsTransform = this.$tool.sizeUnitsTransform(unit, 'KB', item.itemValue)
              item.size = sizeUnitsTransform.size.toFixed(2)
              itemData.receive.push(item)
            }
          })
        }
      }
      // 数据库
      if (res.deviceType === 483) {
        const HostDBData = this.$tool.isJSONString(res.HostDBData) ? JSON.parse(res.HostDBData) : []

        itemData.fileSize = []
        itemData.activeUser = []

        // mssql
        const fileSize = []
        HostDBData.mssqlServer.forEach(item => {
          // 连接用户
          if (item.itemName.indexOf('Number users connected') !== -1) {
            itemData.activeUser.push(item)
          }
          // 数据文件大小
          if (item.itemName.indexOf('Data file size') !== -1) {
            const sizeUnitsTransform = this.$tool.sizeUnitsTransform(item.units, 'GB', item.itemValue)
            fileSize.push({
              ...item,
              size: sizeUnitsTransform.size
            })
          }
        })

        // mysql
        HostDBData.mysql.forEach(item => {
          // 连接用户
          if (item.itemName.indexOf('Threads connected') !== -1) {
            itemData.activeUser.push(item)
          }
          // 数据文件大小
          if (item.itemName.indexOf('Size og database') !== -1) {
            const sizeUnitsTransform = this.$tool.sizeUnitsTransform(item.units, 'GB', item.itemValue)
            fileSize.push({
              ...item,
              size: sizeUnitsTransform.size
            })
          }
        })

        // 数据文件大小
        const fileSizeData = this.$tool.classifiedJSONDataByField(fileSize, 'hostid')
        Object.keys(fileSizeData).forEach(key => {
          let size = 0
          let itemids = []
          let valueTypes = []
          fileSizeData[`${key}`].forEach(item => {
            size += item.size
            itemids.push(item.itemid)
            valueTypes.push(item.valueType)
          })
          itemData.fileSize.push({
            size: size.toFixed(2),
            hostid: key,
            itemids, valueTypes
          })
        })
      }
      // 操作系统
      if (res.deviceType === 484) {
        const HostShowData = this.$tool.isJSONString(res.HostShowData) ? JSON.parse(res.HostShowData) : []

        itemData.cpuUsagePercents = []
        itemData.memoryUsagePercents = []
        itemData.diskUsagePercents = []

        // cpu
        const cpu = HostShowData['cpu'].length > 0 ? HostShowData['cpu'] : []
        cpu.forEach(item => {
          if (item.itemName.indexOf('CPU utilization') !== -1) {
            itemData.cpuUsagePercents.push({
              ...item,
              itemValue: Number(item.itemValue).toFixed(2)
            })
          }
        })
        // 内存
        const freeMemoryPercentage = HostShowData['可用内存百分比'].length > 0 ? HostShowData['可用内存百分比'] : []
        freeMemoryPercentage.forEach(item => {
          itemData.memoryUsagePercents.push({
            ...item,
            itemValue: Number(item.itemValue).toFixed(2)
          })
        })
        // 磁盘
        const diskIO = HostShowData['磁盘'].length > 0 ? HostShowData['磁盘'] : []
        const diskIOData = this.$tool.classifiedJSONDataByField(diskIO, 'hostid')
        Object.keys(diskIOData).forEach(key => {
          let used = 0
          let total = 0
          let usedItemId = []
          let usedValueType = []
          let totalItemId = []
          let totalValueType = []
          diskIOData[`${key}`].forEach(item => {
            if (item.itemName.indexOf('Used space') !== -1) {
              // 所有磁盘使用大小
              used += Number(item.itemValue)
              usedItemId.push(item.itemid)
              usedValueType.push(item.valueType)
            }
            if (item.itemName.indexOf('Total space') !== -1) {
              // 所有磁盘空间大小
              total += Number(item.itemValue)
              totalItemId.push(item.itemid)
              totalValueType.push(item.valueType)
            }
          })
          // 计算各个空间的大小和使用大小去计算出运行性能使用的磁盘百分比
          if (used > 0 && total > 0) {
            const setDiskUsedPercentageVal = (used / total) * 100
            if (total > 0) {
              itemData.diskUsagePercents.push({
                hostid: key,
                diskUsagePercents: Number(setDiskUsedPercentageVal.toFixed(2)),
                usedItemId, usedValueType, totalItemId, totalValueType
              })
            }
          }
        })
      }
      return itemData
    }
  }
}
