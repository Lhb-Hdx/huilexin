<template>
  <div ref="flowList" class="flow-list" :style="{ 'height': listHeight + 'px' }">
    <ul>
      <li class="pointer">
        <div class="name overflow-text-a">设备/端口</div>
        <div class="up overflow-text-a">上行速率</div>
        <div class="down overflow-text-a">下行速率</div>
      </li>
      <template v-if="allHost.length > 0">
        <li v-for="item in allHost" :key="item.hyHostId" class="pointer" @click="handlerHostItem(item)">
          <div class="host">
            <div class="name">
              <a href="#" @click.stop="openFlowDialog(item)" />
              <el-tooltip class="item" effect="dark" :content="item.hostName" placement="top">
                <div class="overflow-text-a name-text">{{ item.hostName }}</div>
              </el-tooltip>
            </div>
            <div class="flow">
              <div class="up overflow-text-a">{{ setDataUnit(item.portSendRate, item.portSendRateUnits) }}</div>
              <div class="down overflow-text-a">{{ setDataUnit(item.portReceiveRate, item.portReceiveRateUnits) }}</div>
            </div>
          </div>
          <div v-if="item.expand" class="children">
            <template v-if="item.children.length > 0" class="tip">
              <dl v-for="items in item.children" :key="items.id">
                <dt class="name">
                  <a href="#" @click.stop="openFlowDialog(item)" />
                  <el-tooltip class="item" effect="dark" :content="items.showName" placement="top">
                    <div class="overflow-text-a name-text">{{ items.showName }}</div>
                  </el-tooltip>
                </dt>
                <div class="flow">
                  <dd class="up overflow-text-a">{{ setDataUnit(items.portSendRate, items.portSendRateUnits) }}</dd>
                  <dd class="down overflow-text-a">{{ setDataUnit(items.portReceiveRate, items.portReceiveRateUnits) }}</dd>
                </div>
              </dl>
            </template>
          </div>
        </li>
      </template>
    </ul>
    <div v-if="allHost.length === 0" class="tip">暂无数据</div>
  </div>
</template>

<script>
import {sendWebsocket} from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import {getUserSession} from '@/utils/auth'

export default {
  name: 'FlowList',
  data() {
    return {
      hostIds: [],
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
      listHeight: '',
      agentGroupHost: [],
      expandHostItem: [],
      zhostIds: []
    }
  },
  computed: {
    // 设置数据大小和单位
    setDataUnit() {
      return function(data, unit) {
        if (data) {
          return `${Number(data).toFixed(2)} ${unit}`
        } else {
          return '0KB/s'
        }
      }
    }
  },
  async mounted() {
    this.$EventBus.$on('open-topo-flow', () => {
      this.init()
    })
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostPortTotal-websocket') {
        this.watchAgentGetHostPortTotal(res.detail.data)
      }
      if (res.detail.data.cmd === 'it-agentGetHostPort-websocket') {
        this.watchAgentGetHostPort(res.detail.data)
      }
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('open-topo-alarm,start-up-date')
    window.removeEventListener('resize', this.setSize)
  },
  methods: {
    // 初始化
    async init() {
      this.setSize()
      window.addEventListener('resize', this.setSize)
      this.hostIds = await this.$store.dispatch('screen/getNodeHostIds')
      this.zhostIds = await this.$store.dispatch('screen/getNodeZHostIds')
      console.log('zhostIds', this.zhostIds)
      if (this.hostIds && this.hostIds.length > 0) {
        this.allHost = []
        this.expandHostItem = []
        this.agentGroupHost = []
        await this.findHyitHost()
      }
    },
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.listHeight = windowHeight - (50 + this.$refs.flowList.getBoundingClientRect().top)
    },
    // 获取主机信息
    async findHyitHost() {
      const findHyitHost = await this.$request({
        url: this.api.itMonitor.findHyitHost,
        data: {
          page: 1,
          limit: -1,
          hostType: 1,
          ids: this.$tool.uniqueArray(this.hostIds).toString()
        }
      })
      if (findHyitHost.code !== 1 && !findHyitHost.data) return
      findHyitHost.data.forEach(hostItem => {
        const agentGroupIndex = this.agentGroupHost.findIndex(el => +el.agent === +hostItem.agent)
        const agentGroupItemTmp = {
          hyHostId: hostItem.hyHostId,
          agent: hostItem.agent,
          hostid: hostItem.hyZhostId,
          fromAgent: hostItem.fromAgent,
          fromHostId: hostItem.fromHostId
        }
        if (agentGroupIndex !== -1) {
          this.$set(this.agentGroupHost[agentGroupIndex].host, this.agentGroupHost[agentGroupIndex].host.length, agentGroupItemTmp)
        } else {
          this.$set(this.agentGroupHost, this.agentGroupHost.length, {
            agent: hostItem.agent,
            fromAgent: hostItem.fromAgent,
            host: [agentGroupItemTmp]
          })
        }
        const allHostItemTmp = {
          hyHostId: hostItem.hyHostId,
          agent: hostItem.agent,
          hostid: hostItem.hyZhostId,
          hostName: hostItem.hyMarkName,
          hostIp: hostItem.hyIp,
          hostType: hostItem.hyDevTypeId,
          fromAgent: hostItem.fromAgent,
          fromHostId: hostItem.fromHostId,
          portStartStatus: 0,
          portConnectionStatus: 0,
          portSendRate: 0,
          portSendRateUnits: '',
          portReceiveRate: 0,
          portReceiveRateUnits: '',
          portSendLoss: 0,
          portReceiveLoss: 0,
          portCount: 0,
          children: [],
          orgId: hostItem.hyOrgId,
          expand: false
        }
        this.$set(this.allHost, this.allHost.length, allHostItemTmp)
      })
      if (findHyitHost.data.length > 0) {
        // 获取流量数据
        this.agentGetHostPortTotal()
        // 定时获取流量统计数据、展开的主机端口数据
        this.getMonitorDataInterval = setInterval(() => {
          this.agentGetHostPortTotal()
          if (this.expandHostItem.length > 0) {
            this.expandHostItem.forEach(item => {
              this.agentGetHostPort({
                agent: item.agent,
                hostid: item.hostid,
                fromAgent: item.fromAgent || '',
                fromHostId: item.fromHostId || ''
              })
            })
          }
        }, 5000)
      }
    },
    // 流量汇总
    agentGetHostPortTotal() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      const hostid = []
      this.zhostIds.forEach(item => hostid.push(item))
      this.agentGroupHost.forEach(item => {
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetHostPortTotal,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: item.agent,
            fromAgent: item.fromAgent,
            fromHostId: '',
            hostid: hostid.toString()
          }
        },
        () => {},
        () => {})
      })
    },
    // 获取主机端口情况
    async agentGetHostPort(query) {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHostPort,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          ...query
        }
      })
    },
    // 设置流量汇总数据
    watchAgentGetHostPortTotal(res) {
      const HostPortData = this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData) : []
      HostPortData.forEach(data => {
        this.hostKeyValues.forEach(item => { // 遍历要显示的监控项字段，根据这些字段去找监控项的数据
          const itemData = item.portCount ? data['端口数量'] : data[`${item.name}汇总`] // 物理端口
          itemData.forEach(dataItem => {
            const idx = this.allHost.findIndex(items => Number(items.hostid) === Number(dataItem.hostid))
            if (idx !== -1) {
              this.$set(this.allHost[idx], `${item.key}`, Number(dataItem.itemValue))
              this.$set(this.allHost[idx], `${item.key}Units`, dataItem.units)
              this.$set(this.allHost[idx], `${item.key}ItemId`, dataItem.itemid)
              this.$set(this.allHost[idx], `${item.key}ValueType`, dataItem.valueType)
            }
          })
        })
      })
      const areaStatus = []
      this.allHost.forEach(item => {
        const idx = areaStatus.findIndex(items => Number(items.orgId) === Number(item.orgId))
        if (idx === -1) {
          areaStatus.push({
            orgId: Number(item.orgId),
            status: item.portCount - item.portConnectionStatus === 0
          })
        } else {
          areaStatus[idx].status = !areaStatus[idx].status ? false : item.portCount - item.portConnectionStatus === 0
        }
      })
    },
    // 监听主机端口数据
    watchAgentGetHostPort(res) {
      const HostPortData = this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData) : []
      HostPortData.forEach(data => {
        this.itemKeyValues.forEach(item => { // 遍历要显示的监控项字段，根据这些字段去找监控项的数据
          const itemData = data[`${item.name}`] // 物理端口
          const itemVlanData = data[`${item.name}vlan`] // 虚拟端口
          // 根据主机id分类
          const dealWithData = this.dealWithData(itemData) // 根据主机id归类物理端口
          const dealWithVlanData = this.dealWithData(itemVlanData) // 根据主机id归类虚拟端口
          this.setMonitorItemData(item, dealWithData, () => {
            this.setMonitorItemData(item, dealWithVlanData, () => {})
          })
        })
      })
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
    // 设置主机监控项数据
    setMonitorItemData(item, dealWithData, callback) {
      dealWithData.forEach(dealWithDataItem => {
        if (dealWithDataItem.list.length > 0) {
          const idx = this.allHost.findIndex(itemDataKey => Number(itemDataKey.hostid) === Number(dealWithDataItem.hostid))
          if (idx !== -1) {
            if (dealWithDataItem.list.length > 0) {
              dealWithDataItem.list.forEach(listItem => {
                if (!listItem.itemName) return
                if (listItem.itemName.indexOf(' Name') !== -1) listItem.itemName = listItem.itemName.split(' Name')[0]
                if (listItem.itemName !== undefined && listItem.itemName !== '') {
                  const dataName = this.$tool.conversionSymbols(listItem.itemName)
                  const childrenIdx = this.allHost[idx].children.findIndex(citem => citem.itemName === (dataName === undefined ? '' : dataName.split('(')[0]))
                  let showName = listItem.itemName || ''
                  if (showName.indexOf('WAN Link') !== -1 || showName.indexOf('WAN Path') !== -1) return
                  if (childrenIdx !== -1) {
                    this.$set(this.allHost[idx].children[childrenIdx], `${item.key}`, listItem.itemValue)
                    this.$set(this.allHost[idx].children[childrenIdx], `${item.key}Units`, listItem.units)
                    this.$set(this.allHost[idx].children[childrenIdx], `${item.key}ItemId`, listItem.itemid)
                  } else {
                    const children = {
                      id: this.$tool.guid(),
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
                    this.$set(this.allHost[idx].children, this.allHost[idx].children.length, children)
                  }
                }
              })
            }
          } else {
            const children = []
            if (dealWithDataItem.list.length > 0) {
              dealWithDataItem.list.forEach(listItem => {
                if (!listItem.itemName) return
                if (listItem.itemName.indexOf(' Name') !== -1) listItem.itemName = listItem.itemName.split(' Name')[0]
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
                if (showName.indexOf('WAN Link') !== -1 || showName.indexOf('WAN Path') !== -1) return
                if (showName.indexOf('(') !== -1) {
                  showName = listItem.itemName.split('(')[0]
                } else if (showName.indexOf('（') !== -1) {
                  showName = listItem.itemName.split('（')[0]
                }
                if (listItem.itemName !== undefined && listItem.itemName !== '') {
                  const dataName = this.$tool.conversionSymbols(listItem.itemName)
                  objItem.itemName = dataName ? dataName.split('(')[0] : ''
                  children.showName = showName
                  objItem[`${item.key}`] = listItem.itemValue
                  objItem[`${item.key}Units`] = listItem.units
                  objItem[`${item.key}ItemId`] = listItem.itemid
                  children.push(objItem)
                }
              })
            }
          }
        }
      })
      callback('ok')
    },
    // 展开主机
    handlerHostItem(item) {
      const idx = this.allHost.findIndex(items => +items.hyHostId === +item.hyHostId)
      if (idx !== -1) this.$set(this.allHost[idx], 'expand', !item.expand)
      const expandHostIdsIdx = this.expandHostItem.findIndex(el => +el.hyHostId === +item.hyHostId)
      if (expandHostIdsIdx !== -1) {
        this.expandHostItem.splice(expandHostIdsIdx, 1)
      } else {
        this.$set(this.expandHostItem, this.expandHostItem.length, item)
      }
      this.expandHostItem.forEach(item => {
        this.agentGetHostPort({ agent: item.agent, hostid: item.hostid, fromAgent: item.fromAgent || '', fromHostId: item.fromHostId || '' })
      })
    },
    // 打开流量弹窗
    openFlowDialog(item) {
      this.$EventBus.$emit('open-flow-dialog', item)
    }
  }
}
</script>

<style lang="scss" scoped>
ul, li, dl, dt {
  margin: 0;
  padding: 0;
}
.flow-list {
  overflow-y: scroll;
  ul {
    li {
      line-height: 40px;
      background: rgba(35, 90, 150,.1);
      border-bottom: 1px solid #123788;
      color: #ffffff;
      transition: all .5s;
      font-size: 12px;
      &:hover {
        background: #102357;
      }
      &:first-of-type {
        color: #cccccc;
        padding-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .up, .down {
          color: #cccccc;
          width: 26%;
          text-align: right;
        }
      }
      .host {
        display: flex;
        align-items: center;
      }
      .down {
        padding-right: 10px;
      }
      .name {
        width: 50%;
        text-indent: 15px;
        display: flex;
        align-items: flex-start;
        a {
          margin: 13px 10px 0;
          display: inline-block;
          width: 16px;
          height: 16px;
          background: url(/image/screen/ico_rep.png) no-repeat 0 0;
        }
        .name-text {
          width: calc(100% - 16px)
        }
      }
      .flow {
        width: 50%;
        display: flex;
        align-items: center;
        .up, .down {
          width: 50%;
          text-align: right;
          color: #08F2F5;
        }
      }
      .children {
        dl {
          display: flex;
          align-items: center;
          dt {
            a {
              margin: 13px 10px 0 50px;
              display: inline-block;
              width: 16px;
              height: 16px;
              background: url(/image/screen/ico_rep.png) no-repeat 0 0;
            }
          }
        }
      }
    }
  }
}
.tip {
  text-align: center;
  line-height: 60px;
  font-size: 12px;
}
</style>
