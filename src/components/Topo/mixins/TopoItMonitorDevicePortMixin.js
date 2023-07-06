import { conversionSymbols, isJSONString } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

/**
 * @description itMonitorDevicePortMixin.js 拓扑图it监控设备实时数据方法
 * @author linhaojia
 * @date 2022/1/18 10:13:50
 */
export default {
  methods: {
    // 网络设备端口
    async GetNetWorkDevicePort(res, hostId, itemId, postListName) {
      this.agentGetHostPort({
        agent: res.model.agent,
        hostid: res.model.hyZhostId,
        fromAgent: this.localStorageOperation('get', 'fromAgent'),
        fromHostId: this.localStorageOperation('get', 'fromHostId')
      }, {}, 'HTTP').then(async agentPortRes => {
        if (agentPortRes) {
          const portStatus = agentPortRes['端口物理连接状态'] || []
          const portVlanStatus = agentPortRes['端口物理连接状态vlan'] || []
          const portStatusList = [...portStatus, ...portVlanStatus]
          this[`${postListName}`] = []
          if (agentPortRes['端口描述'].length > 0 || agentPortRes['端口描述vlan'].length > 0) {
            agentPortRes['端口描述'].forEach(pitem => {
              const dataName = conversionSymbols(pitem.itemName)
              const idx = portStatusList.findIndex(portItem => {
                if (!portItem.itemName) return -1
                return conversionSymbols(portItem.itemName).split('(')[0] === dataName.split('(')[0] && Number(pitem.itemid) === Number(portItem.itemid)
              })
              console.log(hostId, pitem.itemid)
              const portItemData = {
                hostId,
                itemName: dataName.split('(')[0],
                itemid: Number(pitem.itemid),
                agent: pitem.agent
              }
              if (idx !== -1) portItemData[`${postListName}ItemId`] = portStatusList[idx].itemid
              this.$set(this[`${postListName}`], this[`${postListName}`].length, portItemData)
            })
            agentPortRes['端口描述vlan'].forEach(pitem => {
              const dataName = conversionSymbols(pitem.itemName)
              const idx = portStatusList.findIndex(portItem => {
                if (!portItem.itemName) return -1
                return conversionSymbols(portItem.itemName).split('(')[0] === dataName.split('(')[0] && Number(pitem.itemid) === Number(portItem.itemid)
              })
              const portItemData = {
                hostId,
                itemName: dataName.split('(')[0],
                itemid: Number(pitem.itemid),
                agent: pitem.agent
              }
              if (idx !== -1) portItemData[`${postListName}ItemId`] = portStatusList[idx].itemid
              this.$set(this[`${postListName}`], this[`${postListName}`].length, portItemData)
            })
          } else {
            Object.keys(agentPortRes).forEach(pitem => {
              if (agentPortRes[pitem].length > 0) {
                agentPortRes[pitem].forEach(citem => {
                  if (citem.itemName.indexOf('(') !== -1 || citem.itemName.indexOf('（') !== -1) {
                    const dataName = conversionSymbols(citem.itemName)
                    const idx = this[`${postListName}`].findIndex(ci => ci.itemid === citem.itemid)
                    if (idx === -1) {
                      const idx = portStatusList.findIndex(portItem => {
                        if (!portItem.itemName) return -1
                        return conversionSymbols(portItem.itemName).split('(')[0] === dataName.split('(')[0] && Number(pitem.itemid) === Number(portItem.itemid)
                      })
                      const portItemData = {
                        hostId,
                        itemName: dataName.split('(')[0],
                        itemid: Number(citem.itemid),
                        agent: citem.agent
                      }
                      if (idx !== -1) portItemData[`${postListName}ItemId`] = portStatusList[idx].itemid
                      this.$set(this[`${postListName}`], this[`${postListName}`].length, portItemData)
                    }
                  } else {
                    let dataName = ''
                    if (citem.itemName.indexOf('Outgoing network traffic on') !== -1) {
                      dataName = conversionSymbols(citem.itemName.split('Outgoing network traffic on')[1])
                    } else if (citem.itemName.indexOf('Incoming network traffic on') !== -1) {
                      dataName = conversionSymbols(citem.itemName.split('Incoming network traffic on')[1])
                    } else if (citem.itemName.indexOf('网卡每秒接收速率') !== -1) {
                      dataName = conversionSymbols(citem.itemName.split('网卡每秒接收速率')[0])
                    } else if (citem.itemName.indexOf('网卡每秒发送速率') !== -1) {
                      dataName = conversionSymbols(citem.itemName.split('网卡每秒发送速率')[0])
                    } else {
                      dataName = citem.itemName.split(' ')[0]
                    }
                    const idx = this[`${postListName}`].findIndex(ci => ci.itemName === dataName)
                    if (idx === -1) {
                      const idx = portStatusList.findIndex(portItem => {
                        if (!portItem.itemName) return -1
                        return conversionSymbols(portItem.itemName).split('(')[0] === dataName.split('(')[0] && Number(pitem.itemid) === Number(portItem.itemid)
                      })
                      const portItemData = {
                        hostId,
                        itemName: dataName,
                        itemid: Number(citem.itemid),
                        agent: citem.agent
                      }
                      if (idx !== -1) portItemData[`${postListName}ItemId`] = portStatusList[idx].itemid
                      this.$set(this[`${postListName}`], this[`${postListName}`].length, portItemData)
                    }
                  }
                })
              }
            })
          }
        }
      })
    },
    // 网络设备详情
    async GetNetWorkDeviceDetail() {},
    // sdwan端口
    async GetSDWANDevicePort(res, hostId, itemId, postListName) {
      this[`${postListName}`] = []
      // wan path
      // const getWanPath = await this.agentGetHostData({ agent: res.model.agent, hostid: res.model.hyZhostId, method: 'getItemSdwanWanPathData' }, 'HTTP')
      // const filterWanPathData = getWanPath.filter(items => items.itemName.indexOf('WAN Path') !== -1 && items.itemName.indexOf('Name') !== -1)
      // filterWanPathData.forEach(items => {
      //   this.$set(this[`${postListName}`], this[`${postListName}`].length, {
      //     hostId,
      //     itemName: items.itemValue,
      //     itemid: Number(items.itemid),
      //     agent: res.model.agent,
      //     key: items.itemName.split(' Name')[0]
      //   })
      // })
      // const filterWanPathStateData = getWanPath.filter(items => items.itemName.indexOf('WAN Path') !== -1 && items.itemName.indexOf('State') !== -1)
      // filterWanPathStateData.forEach(items => {
      //   const dataName = items.itemName.split(' State')[0]
      //   const getItem = this.$tool.findDataItemByAttr(this[`${postListName}`], 'key', dataName)
      //   if (getItem) {
      //     this.$set(this[`${postListName}`][getItem.index], `${postListName}ItemId`, items.itemid)
      //   }
      // })
      // wan link
      // const getWanLink = await this.agentGetHostData({ agent: res.model.agent, hostid: res.model.hyZhostId, method: 'getItemSdwanWanLinkData' }, 'HTTP')
      // const filterWanLinkData = getWanLink.filter(items => items.itemName.indexOf('WAN Link') !== -1 && items.itemName.indexOf('Name') !== -1)
      // filterWanLinkData.forEach(items => {
      //   this.$set(this[`${postListName}`], this[`${postListName}`].length, {
      //     hostId,
      //     itemName: items.itemValue,
      //     itemid: Number(items.itemid),
      //     agent: res.model.agent,
      //     key: items.itemName.split(' Name')[0]
      //   })
      // })
      // const filterWanPathStatusData = getWanLink.filter(items => items.itemName.indexOf('WAN Link') !== -1 && items.itemName.indexOf('Status') !== -1)
      // filterWanPathStatusData.forEach(items => {
      //   const dataName = items.itemName.split(' Status')[0]
      //   const getItem = this.$tool.findDataItemByAttr(this[`${postListName}`], 'key', dataName)
      //   if (getItem) {
      //     this.$set(this[`${postListName}`][getItem.index], `${postListName}ItemId`, items.itemid)
      //   }
      // })
      // 物理端口
      const getPhysical = await this.agentGetHostData({ agent: res.model.agent, hostid: res.model.hyZhostId, method: 'getItemSdwanPortNameData' }, 'HTTP')
      getPhysical.forEach(items => {
        this.$set(this[`${postListName}`], this[`${postListName}`].length, {
          hostId,
          itemName: items.itemValue,
          itemid: Number(items.itemid),
          agent: res.model.agent
        })
      })
    },
    // sdwan详情
    async GetSDWANDeviceDetail() {},
    // 数据库端口
    async GetDBPort(res, hostId, itemId, postListName) {},
    // 数据库详情
    async GetDBDetail() {},
    // 操作系统端口
    async GetOperatingSystemPort(res, hostId, itemId, postListName) {
      this.agentGetHostPort({
        agent: res.model.agent,
        hostid: res.model.hyZhostId,
        fromAgent: this.localStorageOperation('get', 'fromAgent'),
        fromHostId: this.localStorageOperation('get', 'fromHostId')
      }, {}, 'HTTP').then(async agentPortRes => {
        if (agentPortRes) {
          const portStatus = agentPortRes['端口物理连接状态'] || []
          const portVlanStatus = agentPortRes['端口物理连接状态vlan'] || []
          const portStatusList = [...portStatus, ...portVlanStatus]
          this[`${postListName}`] = []
          Object.keys(agentPortRes).forEach(item => {
            let dataName = ''
            if (item.itemName !== '端口描述' && agentPortRes[`${item}`].length > 0) {
              agentPortRes[`${item}`].forEach(pitem => {
                const splitName = pitem.itemName.split(':')
                dataName = splitName[0]
                const getItem = this.$tool.findDataItemByAttr(this[`${postListName}`], 'itemName', dataName)
                const idx = portStatusList.findIndex(portItem => portItem.itemName.split(':')[0] === dataName && portItem.itemName.indexOf('Operational status') !== -1)
                if (!getItem) {
                  const portItemData = {
                    hostId,
                    itemName: dataName,
                    itemid: Number(pitem.itemid),
                    agent: res.model.agent
                  }
                  this.$set(this[`${postListName}`], this[`${postListName}`].length, portItemData)
                  if (idx !== -1) portItemData[`${postListName}ItemId`] = portStatusList[idx].itemid
                }
              })
            }
          })
        }
      })
    },
    // 操作系统详情
    async GetOperatingSystemDetail() {},
    // 服务设备端口
    async GetServiceDevicePort(res, hostId, itemId, postListName) {
      const getServerDevice = await this.agentGetHostData({ agent: res.model.agent, hostid: res.model.hyZhostId, method: 'getItemServerNetCardData' }, 'HTTP')
      this[`${postListName}`] = []
      getServerDevice.forEach(item => {
        if (item.itemName.indexOf('故障状态') === -1 && item.itemName.indexOf('MAC') === -1 && item.itemName.indexOf('连接状态') === -1) {
          this.$set(this[`${postListName}`], this[`${postListName}`].length, {
            hostId,
            itemName: item.itemValue,
            itemid: Number(item.itemid),
            agent: res.model.agent,
            key: item.itemName.split(' Name')[0]
          })
        }
      })
      getServerDevice.forEach(item => {
        if (item.itemName.indexOf('连接状态') !== -1) {
          const dataName = this.$tool.conversionSymbols(item.itemName)
          const getItem = this.$tool.findDataItemByAttr(this[`${postListName}`], 'key', dataName.split('连接状态')[0])
          if (getItem) {
            this.$set(this[`${postListName}`][getItem.index], `${postListName}ItemId`, item.itemid)
          }
        }
      })
    },
    // 服务设备详情
    async GetServiceDeviceDetail(host) {},
    // 虚拟设备端口
    async GetVirtualDevicePort(res, hostId, itemId, postListName) {},
    // 虚拟设备详情
    async GetVirtualDeviceDetail(host) {},
    // 获取监控项数据
    async agentGetHostData(query, agreement) {
      if (this.itMonitorRequireAgreement !== 'WS' || agreement === 'HTTP') {
        return new Promise(resolve => {
          request({ url: api.itMonitor.agentGetHostData, data: query }).then(res => {
            if (res.code === 1 && res.model) {
              if (this.$tool.isJSONString(res.model)) {
                const sdwanInfoData = JSON.parse(res.model)
                resolve(sdwanInfoData)
              }
            }
          })
        })
      } else {
        return new Promise(resolve => {
          const wsToken = this.sessionStorageOperation('get', 'wsToken')
          if (!wsToken) return
          const getUserSessionResult = getUserSession()
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostData,
            data: {
              token: wsToken,
              companyId: getUserSessionResult.companyId,
              appId: getUserSessionResult.appId,
              ...query
            }
          },
          (res) => {
            const wsRes = isJSONString(res[`${query.method}`]) ? JSON.parse(res[`${query.method}`]) : res.HostData
            if (wsRes && res.componentGuid === this.componentGuid) {
              resolve(wsRes)
            }
          }, (err) => {
            this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
            console.log(err)
          })
        })
      }
    }
  }
}
