<template>
  <div class="bandwidth-container">
    <div class="host-bandwidth bottom-center-box">
      <div class="top-title">
        设备流量TOP
      </div>
      <div class="bottom-center-box-box">
        <div class="bottom-center-box-tabs pointer">
          <div class="tabs-tab" :class="{active:currHostType===0}" @click="changeColorA(0)">接收</div>
          <div class="tabs-tab" :class="{active:currHostType===1}" @click="changeColorA(1)">发送</div>
        </div>
        <div class="bottom-center-box-content">
          <div class="content-list" style="overflow:hidden;">
            <div v-if="hostSendOrReceiveFlag" class="hostSendRateWrapper">
              <div v-for="(item,index) in hostReceiveRateList " :key="item.id" class="hostReceiveRateList list-item flex-v-between ">
                <div class="flex-1 pr-5 flex">
                  <div class="indexNum">{{ index+1 }}</div>
                  <div class="host-center">
                    <div class="flex-1 hostName">{{ item.hostName }}</div>
                    <div class="list-item-ip font-12 flex-1 host-ip">{{ item.hostIp }}</div>
                  </div>
                </div>
                <div class="font-12 hostReceiveRate  pl-5">{{ item.portReceiveRate }} {{ item.portReceiveRateUnits }}</div>
              </div>
            </div>
            <div v-if="!hostSendOrReceiveFlag" class="hostReceiveWrapper">
              <div v-for="(item,index) in hostSendRateList" :key="item.id" class="hostSendRateList list-item flex-v-between ">
                <div class="flex-1 pr-5 flex">
                  <div class="indexNum">{{ index+1 }}</div>
                  <div class="host-center">
                    <div class="flex-1 hostName">{{ item.hostName }}</div>
                    <div class="list-item-ip font-12 flex-1 host-ip">{{ item.hostIp }}</div>
                  </div>
                </div>
                <div class="font-12 hostSendRate  pl-5">{{ item.portSendRate }} {{ item.portSendRateUnits }}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div class="port-bandwidth bottom-center-box">
      <div class="top-title">
        端口流量TOP
      </div>
      <div class="bottom-center-box-box">
        <div class="bottom-center-box-tabs pointer">
          <div class="tabs-tab" :class="{ active: currPortType === 0 }" @click="changeColorB(0)">接收</div>
          <div class="tabs-tab" :class="{ active: currPortType === 1 }" @click="changeColorB(1)">发送</div>
        </div>
        <div class="bottom-center-box-content">
          <div class="content-list" style="overflow:hidden;">
            <div v-if="portSendOrReceiveFlag" class="portSendRateWrapper">
              <div v-for="(item,index) in portReceiveRateList" :key="item.id" class="portReceiveRateList list-item flex-v-between">
                <div class="flex-1 pr-5 flex">
                  <div class="indexNum">{{ index+1 }}</div>
                  <div class="host-center">
                    <div class="flex-1 item-name">{{ item.itemName }}</div>
                    <div class="list-item-ip font-12 flex-1 host-name">{{ item.hostName }}</div>
                  </div>
                </div>
                <div class="font-12 pl-5 hostReceiveRate" style="color:#ffbf00;">{{ item.portReceiveRate }} {{ item.portReceiveRateUnits }}</div>
              </div>
            </div>
            <div v-if="!portSendOrReceiveFlag" class="portReceiveWrapper">
              <div v-for="(item,index) in portSendRateList" :key="item.id" class="portSendRateList list-item flex-v-between ">
                <div class="flex-1 pr-5 flex">
                  <div class="indexNum">{{ index+1 }}</div>
                  <div class="host-center">
                    <div class="flex-1 item-name ">{{ item.itemName }}</div>
                    <div class="list-item-ip font-12 flex-1 host-name">{{ item.hostName }}</div>
                  </div>
                </div>
                <div class="font-12 pl-5 hostSendRate" style="color:#ffbf00">{{ item.portSendRate }} {{ item.portSendRateUnits }}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import _ from 'lodash'
// , sizeUnitsTransform
import { conversionSymbols, sizeUnitsTransform } from '@/utils/utils'
export default {
  name: 'EquipmentFailure',
  data() {
    return {
      currHostType: 0,
      currPortType: 0,
      form: {
        page: 1,
        limit: 10,
        dataType: 4 // 设备类型 1cpu使用率 2内存使用率 3硬盘使用率 4上行流量 5下行流量
        // sTime: '', // 开始时间
        // eTime: '' // 结束时间
      },
      aTitle: 1,
      Subtitle: 1,
      tableList: {}, // 存设备排行数据
      agent: '',
      agentList: [],
      agentsIds: '',
      itemData: [], //
      hyOrgId: '',
      deviceType: [],
      allHost: [],
      hostKeyValues: [
        { name: '端口数量', key: 'portCount', getVlan: false, portCount: true },
        { name: '端口启用管理状态', key: 'portStartStatus', getVlan: true },
        { name: '端口物理连接状态', key: 'portConnectionStatus', getVlan: true },
        { name: '端口每秒发送速率', key: 'portSendRate', getVlan: true },
        { name: '端口每秒接收速率', key: 'portReceiveRate', getVlan: true },
        { name: '端口每秒发送丢包数', key: 'portSendLoss', getVlan: true },
        { name: '端口每秒接收丢包数', key: 'portReceiveLoss', getVlan: true }
      ],
      itemKeyValues: [
        { name: '端口描述', key: 'portDescribe' },
        { name: '端口启用管理状态', key: 'portStartStatus' },
        { name: '端口物理连接状态', key: 'portConnectionStatus' },
        { name: '端口每秒发送速率', key: 'portSendRate' },
        { name: '端口每秒接收速率', key: 'portReceiveRate' },
        { name: '端口每秒发送丢包数', key: 'portSendLoss' },
        { name: '端口每秒接收丢包数', key: 'portReceiveLoss' }
      ],
      getMonitorDataInterval: null,
      hostRes: [],
      showDrawer: false,
      itemDetail: {},
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      keyword: '',
      orgHostStatue: [],
      expandHostIds: [],
      hostSendRateList: [],
      portSendRateList: [],
      hostReceiveRateList: [],
      portReceiveRateList: [],
      hostSendOrReceiveFlag: true,
      portSendOrReceiveFlag: true,
      zhostids: []
    }
  },
  computed: {
    // it监控协议
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  async mounted() {
    // this.findWeek()
    // 获取主机
    await this.findHyitHost()
    // 监听websocket服务端返回的数据
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostPortTotal-websocket') {
        this.watchAgentGetHostPortTotal(res.detail.data)
      }
      if (res.detail.data.cmd === 'it-agentGetHostPort-websocket') {
        this.watchAgentGetHostPort(res.detail.data)
      }
    })
    // 不需要切换区域
    //  this.$EventBus.$on('handler-area', async msg => {
    //   this.itemData = []
    //   this.allHost = []
    //   this.hyOrgId = msg.id
    //   await this.findHyitHost()
    // })
    // ------------------------------------------------------------------
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    // 获取网关
    const agentData = await this.findHyitAgent()
    if (agentData && agentData.length > 0) {
      let agentDataList = []
      let agentIdsList = this.agentsIds.split(',')
      agentData.forEach(item => {
        agentIdsList.forEach(itemVal => {
          if (Number(item.id) === Number(itemVal)) agentDataList.push(item)
        })
      })
      this.agentList = agentDataList
      this.agent = agentDataList[0].id
    }
    // await this.getDeviceType()
  },
  destroyed() {
    clearInterval(this.getMonitorDataInterval)
  },
  methods: {
    changeColorA(id) {
      this.currHostType = id
      // this.Subtitle = 1
      // this.findWeek()
      this.hostSendOrReceiveFlag = !this.hostSendOrReceiveFlag
    },
    changeColorB(id) {
      this.currPortType = id
      // this.Subtitle = 1
      // this.findWeek()
      this.portSendOrReceiveFlag = !this.portSendOrReceiveFlag
    },

    findWeek(id) {
      if (id === 1 || !id) {
        const startTime = `${this.$tool.getFirstDayOfWeek(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      } else if (id === 2) {
        const startTime = `${this.$tool.getFirstDayOfMonth(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      } else if (id === 3) {
        const startTime = `${this.$tool.getFirstDayOfSeason(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      } else if (id === 4) {
        const startTime = `${this.$tool.getFirstDayOfYear(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      }
      if (this.currType === 0) {
        this.form.dataType = 4
      } else if (this.currType === 1) {
        this.form.dataType = 5
      }
      // 设备排行
      request({
        url: api.Summary.findZbxTrendHostFlowStatistics,
        data: this.form
      }).then(async res => {
        if (res.code === 1) {
          this.tableList = JSON.parse(res.model)
          const ids = []
          this.tableList.forEach(item => {
            ids.push(item.hostId)
          })
          const logData = await request({ url: api.itMonitor.findHyitHost, data: { ids }})

          if (logData.code === 1) {
            for (let i = 0; i < this.tableList.length; i++) {
              const tableL = this.tableList[i]
              for (let j = 0; j < logData.data.length; j++) {
                const log = logData.data[j]
                if (tableL.hostId === log.hyHostId) {
                  this.tableList[i].hyIp = log.hyIp
                  this.tableList[i].hyMarkName = log.hyMarkName
                }
              }
            }
          }

          this.tableList.forEach((item, index) => {
            this.$set(this.tableList[index], 'Value', this.$tool.conversionData('data', Number(this.tableList[index].totalValue), 'b').size)
            this.$set(this.tableList[index], 'Symbol', this.$tool.conversionData('data', Number(this.tableList[index].totalValue), 'b').units)
          })
          const tableLength = 10 - this.tableList.length
          if (this.tableList.length < 10) {
            for (let i = 0; i < tableLength; i++) {
              this.tableList.push({ hyMarkName: '暂无数据' })
            }
          }
        }
      })
    },
    // 获取主机
    async findHyitHost() {
      // 过滤提取host
      const host = []
      // 网络设备
      let networkDevice = await request({
        url: api.itMonitor.findHyitHost,
        data: {
          page: 1,
          limit: -1,
          devType: 481,
          hostType: 1,
          keyword: this.keyword,
          // hyOrgId: this.hyOrgId,
          agent: this.agent
        }
      })
      if (networkDevice.code === 1) host.push(...networkDevice.data)
      // sdwan
      let sdwan = await request({
        url: api.itMonitor.findHyitHost,
        data: {
          page: 1,
          limit: -1,
          devType: 490,
          hostType: 1,
          keyword: this.keyword,
          // hyOrgId: this.hyOrgId
          agent: this.agent
        }
      })
      if (sdwan.code === 1) host.push(...sdwan.data)
      // this.allHost初始化
      host.forEach(hostItem => {
        this.$set(this.allHost, this.allHost.length, {
          hyHostId: hostItem.hyHostId,
          agent: hostItem.agent,
          hostid: hostItem.hyZhostId,
          hostName: hostItem.hyMarkName,
          hostIp: hostItem.hyIp,
          hostType: hostItem.hyDevTypeId,
          portStartStatus: 0,
          portConnectionStatus: 0,
          portSendRate: 0,
          portReceiveRate: 0,
          portSendLoss: 0,
          portReceiveLoss: 0,
          portCount: 0,
          children: [],
          orgId: hostItem.hyOrgId
        })
      })
      const zhostids = []
      // itemData:有指定orgId或者为空的主机数据 allHost提取的多个设备的主机信息
      this.allHost.forEach(hostItem => {
        if (hostItem.orgId === this.hyOrgId || this.hyOrgId === '') {
          this.$set(this.itemData, this.itemData.length, { ...hostItem })
        }
        zhostids.push(hostItem.hyZhostId)
      })
      this.zhostids = zhostids
      // 上面拿主机信息，下面请求流量。根据主键再过滤结合
      if (host.length > 0) {
        // 获取流量数据
        this.agentGetHostPortTotal()
        // 定时获取流量统计数据、展开的主机端口数据
        this.getMonitorDataInterval = setInterval(() => {
          this.agentGetHostPortTotal()
          // 展开的端口流量定时获取
          // if (this.expandHostIds.length > 0) {
          //   this.expandHostIds.forEach(item => {
          //     this.agentGetHostPort({ agent: this.agent, hostid: item })
          //   })
          // }
          for (const item of this.itemData) {
            this.agentGetHostPort({ agent: this.agent, hostid: item.hostid })
          }
        }, 5000)
      }
    },
    // 获取所有的设备类型
    async getDeviceType() {
      const { code, data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      })
      if (code !== 1) return
      this.deviceType = data
    },
    // 获取网关
    async findHyitAgent() {
      const { code, data } = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, page: 1, limit: -1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (code !== 1) return
      return data
    },
    // 流量汇总
    agentGetHostPortTotal() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      const hostid = []
      this.zhostids.forEach(item => hostid.push(item))
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHostPortTotal,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: this.agent,
          fromAgent: this.localStorageOperation('get', 'fromAgent'),
          fromHostId: this.localStorageOperation('get', 'fromHostId'),
          hostid: hostid.toString()
        }
      })
    },
    // 获取主机端口情况
    async agentGetHostPort(query) {
      // console.log(query, '++++++++++++++++')
      if (this.itMonitorRequireAgreement !== 'WS') {
        request({
          url: api.itMonitor.agentGetHostPort, data: query
        }).then(res => {
          if (res.code === 1 && res.map) {
            Object.keys(res.map).forEach(key => {
              res.map[key] = JSON.parse(res.map[key])
            })
            this.watchAgentGetHostPort(res.map)
          }
        })
      } else {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        if (!wsToken) return
        const getUserSessionResult = getUserSession()
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetHostPort,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            ...query,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        })
      }
    },
    // 监听流量汇总
    watchAgentGetHostPortTotal(res) {
      const data = this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData)[0] : []
      this.hostKeyValues.forEach(item => { // 遍历要显示的监控项字段，根据这些字段去找监控项的数据
        const itemData = item.portCount ? data['端口数量'] : data[`${item.name}汇总`] // 物理端口
        // websocket拿到的总数项根据hostKeyValues分离后得到itemData
        itemData.forEach(dataItem => {
          const idx = this.allHost.findIndex(items => Number(items.hostid) === Number(dataItem.hostid))
          if (idx !== -1) {
            this.$set(this.allHost[idx], `${item.key}`, Number(dataItem.itemValue))
            this.$set(this.allHost[idx], `${item.key}Units`, dataItem.units)
          }
          const itemDataIdx = this.itemData.findIndex(items => Number(items.hostid) === Number(dataItem.hostid))
          if (itemDataIdx !== -1) {
            this.$set(this.itemData[itemDataIdx], `${item.key}`, Number(dataItem.itemValue))
            this.$set(this.itemData[itemDataIdx], `${item.key}Units`, dataItem.units)
          }
        })
      })
      // console.log(JSON.stringify(this.itemData))
      this.itemData.forEach(item => {
        let splitUnit
        if (item.portSendRateUnits) {
          splitUnit = item.portSendRateUnits.split('/')[0]
        }
        if (splitUnit) {
          this.$set(item, 'transHostSendRate', Number(sizeUnitsTransform(splitUnit, 'KB', item.portSendRate).size))
        }
      })
      this.itemData.forEach(item => {
        let splitUnit
        if (item.portReceiveRateUnits) {
          splitUnit = item.portReceiveRateUnits.split('/')[0]
        }
        if (splitUnit) {
          this.$set(item, 'transHostReceiveRate', Number(sizeUnitsTransform(splitUnit, 'KB', item.portReceiveRate).size))
        }
      })

      // 发送速率排序，从高到低，
      const hostSendRateList = _.sortBy(this.itemData, function(item) {
        return -item.transHostSendRate
      })
      this.hostSendRateList = hostSendRateList.slice(0, 9)

      const hostReceiveRateList = _.sortBy(this.itemData, function(item) {
        return -item.transHostReceiveRate
      })
      this.hostReceiveRateList = hostReceiveRateList.slice(0, 9)

      // console.log(JSON.stringify(this.hostSendRateList))
    },
    // 根据主机id归类
    dealWithData(data) {
      const c = []
      const d = {}
      data.forEach(element => {
        if (!d[element.hostid]) { // 按照type分类
          c.push({
            hostName: element.hostName,
            hostid: element.hostid,
            agent: element.agent,
            list: [element]
          })
          d[element.hostid] = element
        } else {
          c.forEach(ele => {
            if (ele.hostid === element.hostid) {
              ele.list.push(element)
            }
          })
        }
      })
      return c
    },
    // 监听主机端口数据
    watchAgentGetHostPort(res) {
      const data = this.itMonitorRequireAgreement === 'WS' ? this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData)[0] : [] : res

      this.itemKeyValues.forEach(item => { // 遍历要显示的监控项字段，根据这些字段去找监控项的数据
        const itemData = data[`${item.name}`] // 物理端口
        const itemVlanData = data[`${item.name}vlan`] // 虚拟端口
        // 根据主机id分类
        const dealWithData = this.dealWithData(itemData) // 根据主机id归类物理端口
        const dealWithVlanData = this.dealWithData(itemVlanData) // 根据主机id归类虚拟端口
        this.setMonitorItemData(item, dealWithData, () => {
          this.setMonitorItemData(item, dealWithVlanData, () => {})
        })
        let portList = []
        this.itemData.forEach(item => {
          item.children.forEach(item2 => {
            item2['hostName'] = item.hostName
          })
          portList = [...portList, ...item.children]
        })
        // console.log(JSON.stringify(portList))

        portList.forEach(item => {
          const splitUnit = item.portSendRateUnits.split('/')[0]
          if (splitUnit) {
            // item['transPortSendRate'] = Number(sizeUnitsTransform(splitUnit, 'KB', item.portSendRate).size)
            this.$set(item, 'transPortSendRate', Number(sizeUnitsTransform(splitUnit, 'KB', item.portSendRate).size))
          }
        })
        portList.forEach(item => {
          const splitUnit = item.portReceiveRateUnits.split('/')[0]
          if (splitUnit) {
            // item['transPortReceiveRate'] = Number(sizeUnitsTransform(splitUnit, 'KB', item.portReceiveRate).size)
            this.$set(item, 'transPortReceiveRate', Number(sizeUnitsTransform(splitUnit, 'KB', item.portReceiveRate).size))
          }
        })

        // 排序
        // sizeUnitsTransform
        // if (portList[0].portSendRateUnits.split('/')) {
        //   console.log(portList[0].portSendRateUnits.split('/'))
        // }

        this.$nextTick(() => {
          const portReceiveRateList = _.sortBy(portList, function(item) {
            return -item.transPortReceiveRate
          })
          this.portReceiveRateList = portReceiveRateList.slice(0, 9)

          const portSendRateList = _.sortBy(portList, function(item) {
            return -item.transPortSendRate
          })
          this.portSendRateList = portSendRateList.slice(0, 9)
        })
      })
    },
    // 设置主机监控项数据
    setMonitorItemData(item, dealWithData, callback) {
      dealWithData.forEach(dealWithDataItem => {
        if (dealWithDataItem.list.length > 0) {
          const idx = this.itemData.findIndex(itemDataKey => Number(itemDataKey.hostid) === Number(dealWithDataItem.hostid))
          if (idx !== -1) {
            if (dealWithDataItem.list.length > 0) {
              dealWithDataItem.list.forEach(listItem => {
                const dataName = conversionSymbols(listItem.itemName)
                const childrenIdx = this.itemData[idx].children.findIndex(citem => citem.itemName === (dataName === undefined ? '' : dataName.split('(')[0]))
                let showName = listItem.itemName || ''
                if (childrenIdx !== -1) {
                  this.$set(this.itemData[idx].children[childrenIdx], `${item.key}`, listItem.itemValue)
                  this.$set(this.itemData[idx].children[childrenIdx], `${item.key}Units`, listItem.units)
                  this.$set(this.itemData[idx].children[childrenIdx], `${item.key}ItemId`, listItem.itemid)
                } else {
                  const children = {
                    agent: listItem.agent,
                    portStartStatus: 0,
                    portConnectionStatus: 0,
                    portSendRate: 0,
                    portSendRateUnits: '',
                    portReceiveRate: 0,
                    portReceiveRateUnits: '',
                    portSendLoss: 0,
                    portReceiveLoss: 0,
                    portDescribe: ''
                  }
                  if (showName.indexOf('(') !== -1) {
                    showName = listItem.itemName.split('(')[0]
                  } else if (showName.indexOf('（') !== -1) {
                    showName = listItem.itemName.split('（')[0]
                  }
                  children.itemName = dataName ? dataName.split('(')[0] : ''
                  children.showName = showName
                  children[`${item.key}`] = listItem.itemValue
                  children[`${item.key}Units`] = listItem.units
                  children[`${item.key}ItemId`] = listItem.itemid
                  this.$set(this.itemData[idx].children, this.itemData[idx].children.length, children)
                }
              })
            }
          } else {
            const children = []
            if (dealWithDataItem.list.length > 0) {
              dealWithDataItem.list.forEach(listItem => {
                const objItem = {
                  agent: listItem.agent,
                  portStartStatus: 0,
                  portConnectionStatus: 0,
                  portSendRate: 0,
                  portSendRateUnits: '',
                  portReceiveRate: 0,
                  portReceiveRateUnits: '',
                  portSendLoss: 0,
                  portReceiveLoss: 0,
                  portDescribe: ''
                }
                let showName = listItem.itemName || ''
                if (showName.indexOf('(') !== -1) {
                  showName = listItem.itemName.split('(')[0]
                } else if (showName.indexOf('（') !== -1) {
                  showName = listItem.itemName.split('（')[0]
                }
                const dataName = conversionSymbols(listItem.itemName)
                objItem.itemName = dataName ? dataName.split('(')[0] : ''
                children.showName = showName
                objItem[`${item.key}`] = listItem.itemValue
                objItem[`${item.key}Units`] = listItem.units
                objItem[`${item.key}ItemId`] = listItem.itemid
                children.push(objItem)
              })
            }
          }
        }
      })
      callback('ok')
    }
  }
}
</script>

<style lang="scss" scoped>
.bandwidth-container{
  height: 100%;
  display: flex;
  cursor: pointer;
//  .equipment-failure{
//    flex: 1;
//   /* height: 100%; */
//   height: 300px;
  //  }
  justify-content: space-between;
  .host-bandwidth{
    flex: 1;
    .top-title{
      font-size: 14px;
    }
    .hostSendRateList{
      width: 100%;
      border-bottom: 2px solid #0d3953;
      .indexNum{
        background-color: #04132e;
        width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
       }
      .host-center{
        padding: 10px 0 10px 10px;
      .hostName{
       width: 150px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 14px;
      margin-bottom: 3px;
      }
      .host-ip{
        font-size: 12px;
        text-align: left;
      }
        }

     .hostSendRate{
       flex-wrap: nowrap;
       align-self: center;
       margin-right: 10px;
       white-space: nowrap;
       text-overflow: ellipsis;
       overflow: hidden;
        color: #ffbf00 !important;
     }

    }
    .hostReceiveRateList{
      width: 100%;
       border-bottom: 2px solid #0d3953;
         .indexNum{
         background-color: #04132e;
        width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
       }
        .host-center{
        padding: 10px 0 10px 10px;
    .hostName{
      width: 150px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 14px;
      margin-bottom: 3px;
      }
      .host-ip{
        font-size: 12px;
        text-align: left;
      }
        }

         .hostReceiveRate{
        flex-wrap: nowrap;
       align-self: center;
       margin-right: 10px;
       white-space: nowrap;
       text-overflow: ellipsis;
       overflow: hidden;
        color: #ffbf00 !important;
      }
    }
  }
  .port-bandwidth{
    flex: 1;
    margin-left: 20px;
    .portReceiveRateList{
      width: 100%;
      border-bottom: 2px solid #0d3953;
         .indexNum{
        background-color: #04132e;
        width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
       }
     .host-center{
        padding: 10px 0 10px 10px;
      .item-name{
       width: 150px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 14px;
      margin-bottom: 3px;
      }
      .host-name{
        font-size: 12px;
        text-align: left;
      }
        }
       .hostSendRate{
       flex-wrap: nowrap;
       align-self: center;
       margin-right: 10px;
       white-space: nowrap;
       text-overflow: ellipsis;
       overflow: hidden;
       color: #ffbf00 !important;
     }
    }
    .portSendRateList{
      width: 100%;
      border-bottom: 2px solid #0d3953;
        .indexNum{
        background-color: #04132e;
        width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
       }
      .host-center{
        padding: 10px 0 10px 10px;
      .item-name{
       width: 150px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 14px;
      margin-bottom: 3px;
      }
      .host-name{
        font-size: 12px;
        text-align: left;
      }
        }

      .hostReceiveRate{
       flex-wrap: nowrap;
       align-self: center;
       margin-right: 10px;
       white-space: nowrap;
       text-overflow: ellipsis;
       overflow: hidden;
       color: #ffbf00 !important;
      }
    }
  }
}

</style>

