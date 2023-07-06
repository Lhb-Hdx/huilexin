<template>
  <div class="host-detail">
    <div class="host-detail-header">
      <div class="detail-header-name margin-bottom-7-5 overflow-text-a">{{ host.hyMarkName }}</div>
      <div class="detail-header-ip margin-bottom-7-5 overflow-text-a">{{ host.hyIp }}</div>
      <div class="detail-header-org margin-bottom-7-5 overflow-text-a">{{ org.hyAreaName }}</div>
      <div class="margin-bottom-7-5 overflow-text-a">
        发送速率：{{ hostFlow.send }}
      </div>
      <div class="margin-bottom-7-5 overflow-text-a">
        接受速率：{{ hostFlow.receive }}
      </div>
    </div>
    <div class="host-detail-main">
      <el-tabs v-model="activeName" class="host-detail-main_tab" @tab-click="handleClick">
        <el-tab-pane label="物理端口" name="physical">
          <el-input v-model="portKeyWord" size="mini" placeholder="端口名称搜索" style="width: 100%; margin-bottom: 10px;" clearable @clear="inSearch = false" @keyup.enter.native="handleFilter" />
          <div ref="catBox" class="cat-box" :style="{ 'height': catBoxHeight + 'px' }">
            <div class="dev-type-item" :class="hostFlow.active ? 'active':''" @click="handlerPort()">
              <el-tooltip class="item" effect="dark" content="设备流量汇总" placement="right">
                <div class="title overflow-text-a">
                  设备流量汇总
                </div>
              </el-tooltip>
            </div>
            <div v-for="item in inSearch ? searchPortRes : port" :key="item.itemId" class="dev-type-item" :class="item.active ? 'active':''" @click="handlerPort(item)">
              <el-tooltip class="item" effect="dark" :content="item.showName" placement="right">
                <div class="title overflow-text-a">
                  {{ item.showName }}
                </div>
              </el-tooltip>
              <div v-if="!setPortConnectionStatue(item)" class="org-statue" />
            </div>
            <div class="page-btns">
              <Pagination
                v-show="inSearch ? allSearchPortRes.length : allPort.length > 0"
                layout="sizes, prev, next"
                :total="inSearch ? allSearchPortRes.length : allPort.length"
                :page.sync="findHostPortQuery.page"
                :limit.sync="findHostPortQuery.limit"
                @pagination="findHostPort"
              />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="逻辑端口" name="vlan">
          <el-input v-model="portKeyWord" size="mini" placeholder="端口名称搜索" style="width: 100%; margin-bottom: 10px;" clearable @clear="inSearch = false" @keyup.enter.native="handleFilter" />
          <div class="cat-box" :style="{ 'height': catBoxHeight + 'px' }">
            <div class="dev-type-item" :class="hostFlow.active ? 'active':''" @click="handlerPort()">
              <el-tooltip class="item" effect="dark" content="设备流量汇总" placement="right">
                <div class="title overflow-text-a">
                  设备流量汇总
                </div>
              </el-tooltip>
            </div>
            <div v-for="item in inSearch ? searchPortRes : vlanPort" :key="item.itemId" class="dev-type-item" :class="item.active ? 'active':''" @click="handlerPort(item)">
              <el-tooltip class="item" effect="dark" :content="item.showName" placement="right">
                <div class="title overflow-text-a">
                  {{ item.showName }}
                </div>
              </el-tooltip>
              <div v-if="!setPortConnectionStatue(item)" class="org-statue" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import Pagination from '@/components/Pagination'

export default {
  name: 'DetailHostPort',
  components: {
    Pagination
  },
  data() {
    return {
      host: {},
      org: {},
      activeName: 'physical',
      getMonitorDataInterval: null,
      port: [],
      vlanPort: [],
      connectionStatue: [],
      selectPort: null,
      portKeyWord: '',
      inSearch: false,
      searchPortRes: [],
      hostFlow: {
        send: '',
        receive: '',
        active: true
      },
      hostPortTotal: 10,
      findHostPortQuery: {
        page: 1,
        limit: 10
      },
      allSearchPortRes: [],
      allPort: [],
      allVlanPort: [],
      catBoxHeight: 0
    }
  },
  computed: {
    hostId() {
      return this.$route.query.hostId
    },
    zhostId() {
      return this.$route.query.zhostId
    },
    agent() {
      return this.$route.query.agent
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    },
    setPortConnectionStatue() {
      return function(val) {
        const idx = this.connectionStatue.findIndex((item, index) => {
          const dataName = this.$tool.conversionSymbols(item.itemName)
          const itemName = dataName ? dataName.split('(')[0] : ''
          return itemName === val.itemName
        })
        if (idx !== -1) return Number(this.connectionStatue[idx].itemValue) > 0
      }
    }
  },
  async mounted() {
    this.host = await this.getHyitHost()
    this.org = await this.getHyitArea()
    this.initPortList()
    this.getMonitorDataInterval = setInterval(() => {
      this.initPortList()
    }, 5000)
    const hostFlow = this.localStorageOperation('get', 'hostFlowMonitorParams') || null
    if (hostFlow) {
      this.hostFlow = { ...this.hostFlow, ...hostFlow, itemName: '设备流量汇总', showName: '设备流量汇总', isVlan: false, isSummary: true }
      this.selectPort = this.hostFlow
      this.$EventBus.$emit('change-port', this.hostFlow)
    }
    this.catBoxHeight = (this.$tool.getClientHeight() - this.$refs.catBox.getBoundingClientRect().top) - 10
    this.$EventBus.$on('host-port-total', (res) => {
      if (res.send.length > 0) {
        const sizeUnitsTransformResult = this.$tool.sizeUnitsTransform(res.send[0].units.split('/')[0], 'MB', res.send[0].itemValue)
        this.$set(this.hostFlow, 'send', `${sizeUnitsTransformResult.size.toFixed(2)}MB/s`)
      }
      if (res.receive.length > 0) {
        const sizeUnitsTransformResult = this.$tool.sizeUnitsTransform(res.receive[0].units.split('/')[0], 'MB', res.receive[0].itemValue)
        this.$set(this.hostFlow, 'receive', `${sizeUnitsTransformResult.size.toFixed(2)}MB/s`)
      }
    })
  },
  destroyed() {
    clearInterval(this.getMonitorDataInterval)
    this.batchOffEventBus('host-port-total')
  },
  methods: {
    // 获取主机信息
    async getHyitHost() {
      const { code, model } = await request({
        url: api.itMonitor.getHyitHost,
        data: { hyHostId: this.hostId }
      })
      if (code !== 1) return
      return model
    },
    // 获取区域
    async getHyitArea() {
      const { code, model } = await request({
        url: api.area.getHyitArea,
        data: { hyAreaId: this.host.hyOrgId }
      })
      if (code !== 1) return
      return model
    },
    handleClick() {
      this.inSearch = false
    },
    handlerPort(item) {
      this.selectPort = item || this.hostFlow
      this.allPort.forEach(pitem => {
        pitem.active = false
      })
      this.allVlanPort.forEach(pitem => {
        pitem.active = false
      })
      this.$set(this.hostFlow, 'active', !item)

      if (item) {
        const portIdx = this.allPort.findIndex(items => Number(items.itemId) === Number(item.itemId))
        const vlanPortIdx = this.allVlanPort.findIndex(items => Number(items.itemId) === Number(item.itemId))

        if (portIdx !== -1) {
          this.$set(this.allPort[portIdx], 'active', true)
          this.$EventBus.$emit('change-port', this.allPort[portIdx])
        }
        if (vlanPortIdx !== -1) {
          this.$set(this.allVlanPort[vlanPortIdx], 'active', true)
          this.$EventBus.$emit('change-port', this.allVlanPort[vlanPortIdx])
        }
      } else {
        this.$set(this.hostFlow, 'active', true)
        this.$EventBus.$emit('change-port', this.hostFlow)
      }
    },
    initPortList() {
      this.agentGetHostPort({ agent: this.host.agent, hostid: this.host.hyZhostId, fromAgent: this.localStorageOperation('get', 'fromAgent'), fromHostId: this.localStorageOperation('get', 'fromHostId') }).then(res => {
        // 物理端口
        console.log(res)
        const itemData = res[0]['端口描述'].length > 0 ? res[0]['端口描述'] : res[0]['端口物理连接状态']
        const portSendRate = res[0]['端口每秒发送速率']
        const portReceiveRate = res[0]['端口每秒接收速率']
        const portSendLoss = res[0]['端口每秒发送丢包数']
        const portReceiveLoss = res[0]['端口每秒接收丢包数']
        itemData.forEach(item => {
          if (item.itemName.indexOf('Vlan-') !== -1 || item.itemName.indexOf('LAG') !== -1 || item.itemName.indexOf('LTE') !== -1) return
          let showName = item.itemName
          const dataName = this.$tool.conversionSymbols(item.itemName)
          let itemName = dataName.split('(')[0]
          if (itemName.indexOf('Name') !== -1) itemName = itemName.split('Name')[0]
          const portSendRateIdx = portSendRate.findIndex(portItem => {
            if (portItem.itemName) {
              const portItemName = this.$tool.conversionSymbols(portItem.itemName)
              const portItemNameResult = portItemName.split('(')[0]
              return portItemNameResult === itemName
            }
          })
          const portReceiveRateIdx = portReceiveRate.findIndex(portItem => {
            if (portItem.itemName) {
              const portItemName = this.$tool.conversionSymbols(portItem.itemName)
              const portItemNameResult = portItemName.split('(')[0]
              return portItemNameResult === itemName
            }
          })
          const portSendLossIdx = portSendLoss.findIndex(portItem => {
            if (portItem.itemName) {
              const portItemName = this.$tool.conversionSymbols(portItem.itemName)
              const portItemNameResult = portItemName.split('(')[0]
              return portItemNameResult === itemName
            }
          })
          const portReceiveLossIdx = portReceiveLoss.findIndex(portItem => {
            if (portItem.itemName) {
              const portItemName = this.$tool.conversionSymbols(portItem.itemName)
              const portItemNameResult = portItemName.split('(')[0]
              return portItemNameResult === itemName
            }
          })
          if (showName.indexOf('(') !== -1) {
            showName = showName.split('(')[0]
          }
          if (showName.indexOf('（') !== -1) {
            showName = showName.split('（')[0]
          }
          if (showName.indexOf(' Name') !== -1) {
            showName = showName.split(' Name')[0]
          }
          const getHostItem = this.$tool.findDataItemByAttr(this.allPort, 'itemId', item.itemid)
          if (!getHostItem) {
            const data = {
              agent: item.agent,
              itemName,
              showName,
              itemId: item.itemid,
              isVlan: false,
              portDescribe: item.itemValue
            }
            if (portSendRateIdx !== -1) {
              data.portSendRateItemId = portSendRate[portSendRateIdx].itemid
              data.portSendRateUnits = portSendRate[portSendRateIdx].units
              data.portSendRateValueType = portSendRate[portSendRateIdx].valueType
            }
            if (portReceiveRateIdx !== -1) {
              data.portReceiveRateItemId = portReceiveRate[portReceiveRateIdx].itemid
              data.portReceiveRateUnits = portReceiveRate[portReceiveRateIdx].units
              data.portReceiveRateValueType = portReceiveRate[portReceiveRateIdx].valueType
            }
            if (portSendLossIdx !== -1) {
              data.portSendLossItemId = portSendLoss[portSendLossIdx].itemid
              data.portSendLossUnits = portSendLoss[portSendLossIdx].units
              data.portSendLossValueType = portSendLoss[portSendLossIdx].valueType
            }
            if (portReceiveLossIdx !== -1) {
              data.portReceiveLossItemId = portReceiveLoss[portReceiveLossIdx].itemid
              data.portReceiveLossUnits = portReceiveLoss[portReceiveLossIdx].units
              data.portReceiveLossValueType = portReceiveLoss[portReceiveLossIdx].valueType
            }
            if (data.itemName.indexOf('WANLink') !== -1 || data.itemName.indexOf('WANPath') !== -1) {
              // this.$set(this.vlanPort, this.vlanPort.length, data)
              this.$set(this.allVlanPort, this.allVlanPort.length, data)
            } else {
              // this.$set(this.port, this.port.length, data)
              this.$set(this.allPort, this.allPort.length, data)
            }
          }
        })
        // 虚拟端口
        const itemVlanData = res[0]['端口描述vlan'].length > 0 ? res[0]['端口描述vlan'] : res[0]['端口物理连接状态vlan']
        const vlanPortSendRate = res[0]['端口每秒发送速率vlan']
        const vlanPortReceiveRate = res[0]['端口每秒接收速率vlan']
        const vlanPortSendLoss = res[0]['端口每秒发送丢包数vlan']
        const vlanPortReceiveLoss = res[0]['端口每秒接收丢包数vlan']
        itemVlanData.forEach(item => {
          const dataName = this.$tool.conversionSymbols(item.itemName)
          const itemName = dataName.split('(')[0]
          let showName = item.itemName
          const findDataItemByAttr = this.$tool.findDataItemByAttr(this.vlanPort, 'itemId', item.itemid)
          const vlanPortSendRateIdx = vlanPortSendRate.findIndex(portSendRateItem => {
            if (portSendRateItem.itemName) {
              const portSendRateDataName = this.$tool.conversionSymbols(portSendRateItem.itemName)
              const portSendRateItemName = portSendRateDataName.split('(')[0]
              return portSendRateItemName === itemName
            }
          })
          const vlanPortReceiveRateIdx = vlanPortReceiveRate.findIndex(portReceiveRateItem => {
            if (portReceiveRateItem.itemName) {
              const portReceiveRateDataName = this.$tool.conversionSymbols(portReceiveRateItem.itemName)
              const portReceiveRateItemName = portReceiveRateDataName.split('(')[0]
              return portReceiveRateItemName === itemName
            }
          })
          const vlanPortSendLossIdx = vlanPortSendLoss.findIndex(portItem => {
            if (portItem.itemName) {
              const portItemName = this.$tool.conversionSymbols(portItem.itemName)
              const portItemNameResult = portItemName.split('(')[0]
              return portItemNameResult === itemName
            }
          })
          const vlanPortReceiveLossIdx = vlanPortReceiveLoss.findIndex(portItem => {
            if (portItem.itemName) {
              const portItemName = this.$tool.conversionSymbols(portItem.itemName)
              const portItemNameResult = portItemName.split('(')[0]
              return portItemNameResult === itemName
            }
          })
          if (showName.indexOf('(') !== -1) {
            showName = showName.split('(')[0]
          }
          if (showName.indexOf('（') !== -1) {
            showName = showName.split('（')[0]
          }
          if (showName.indexOf(' Name') !== -1) {
            showName = showName.split(' Name')[0]
          }
          if (!findDataItemByAttr) {
            const data = {
              agent: item.agent,
              itemName,
              showName,
              itemId: item.itemid,
              isVlan: true,
              portDescribe: item.itemValue
            }
            if (vlanPortSendRateIdx !== -1) {
              data.portSendRateItemId = vlanPortSendRate[vlanPortSendRateIdx].itemid
              data.portSendRateUnits = vlanPortSendRate[vlanPortSendRateIdx].units
              data.portSendRateValueType = vlanPortSendRate[vlanPortSendRateIdx].valueType
            }
            if (vlanPortReceiveRateIdx !== -1) {
              data.portReceiveRateItemId = vlanPortReceiveRate[vlanPortReceiveRateIdx].itemid
              data.portReceiveRateUnits = vlanPortSendRate[vlanPortSendRateIdx].units
              data.portReceiveRateValueType = vlanPortSendRate[vlanPortSendRateIdx].valueType
            }
            if (vlanPortSendLossIdx !== -1) {
              data.portSendLossItemId = vlanPortSendLoss[vlanPortSendLossIdx].itemid
              data.portSendLossUnits = vlanPortSendLoss[vlanPortSendLossIdx].units
              data.portSendLossValueType = vlanPortSendLoss[vlanPortSendLossIdx].valueType
            }
            if (vlanPortReceiveLossIdx !== -1) {
              data.portReceiveLossItemId = vlanPortReceiveLoss[vlanPortReceiveLossIdx].itemid
              data.portReceiveLossUnits = vlanPortReceiveLoss[vlanPortReceiveLossIdx].units
              data.portReceiveLossValueType = vlanPortReceiveLoss[vlanPortReceiveLossIdx].valueType
            }
            this.$set(this.allVlanPort, this.allVlanPort.length, data)
            // this.$set(this.vlanPort, this.vlanPort.length, data)
          }
        })
        this.connectionStatue = [...res[0]['端口物理连接状态'], ...res[0]['端口物理连接状态vlan']]
        const getPortItemIdx = this.connectionStatue.findIndex(getPortItemItem => {
          const getPortItemDataName = this.$tool.conversionSymbols(getPortItemItem.itemName)
          const getPortItemItemItemName = getPortItemDataName ? getPortItemDataName.split('(')[0] : ''
          return getPortItemItemItemName === this.selectPort.itemName
        })
        if (getPortItemIdx !== -1) this.$EventBus.$emit('select-port-connection-statue', Number(this.connectionStatue[getPortItemIdx].itemValue))
        this.findHostPort()
      })
    },
    // 获取主机端口情况
    async agentGetHostPort(query) {
      if (this.itMonitorRequireAgreement !== 'WS') {
        return new Promise(resolve => {
          request({
            url: api.itMonitor.agentGetHostPort, data: query
          }).then(res => {
            if (res.code === 1 && res.map) {
              Object.keys(res.map).forEach(key => {
                if (res[key] !== '') {
                  res.map[key] = this.$tool.isJSONString(res.map[key]) ? JSON.parse(res.map[key]) : []
                }
              })
              resolve(res.map)
            }
          })
        })
      } else {
        return new Promise(resolve => {
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
              fromAgent: this.localStorageOperation('get', 'fromAgent') || '',
              fromHostId: this.localStorageOperation('get', 'fromHostId') || ''
            }
          },
          (res) => {
            const wsRes = this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData) : res.HostPortData
            if (wsRes) {
              resolve(wsRes)
            }
          }, (err) => {
            this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
            console.log(err)
          })
        })
      }
    },
    handleFilter() {
      this.inSearch = true
      this.searchPortRes = []
      const searchPortRes = []
      this[`${this.activeName === 'vlan' ? 'vlanPort' : 'port'}`].forEach(item => {
        if (item.showName.indexOf(this.portKeyWord) !== -1) {
          searchPortRes.push(item)
        }
      })
      this.searchPortRes = searchPortRes
      this.allSearchPortRes = searchPortRes
    },
    // 流量汇总
    agentGetHostPortTotal() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHostPortTotal,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: this.agent,
          hostid: this.zhostId,
          fromAgent: this.localStorageOperation('get', 'fromAgent') || '',
          fromHostId: this.localStorageOperation('get', 'fromHostId') || ''
        }
      })
    },
    findHostPort() {
      if (this.inSearch) {
        this.searchPortRes = this.$tool.deepCopy(this.allSearchPortRes).slice((this.findHostPortQuery.limit * this.findHostPortQuery.page) - this.findHostPortQuery.limit, this.findHostPortQuery.limit * this.findHostPortQuery.page)
      } else {
        this.port = this.$tool.deepCopy(this.allPort).slice((this.findHostPortQuery.limit * this.findHostPortQuery.page) - this.findHostPortQuery.limit, this.findHostPortQuery.limit * this.findHostPortQuery.page)
        this.vlanPort = this.$tool.deepCopy(this.allVlanPort).slice((this.findHostPortQuery.limit * this.findHostPortQuery.page) - this.findHostPortQuery.limit, this.findHostPortQuery.limit * this.findHostPortQuery.page)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.host-detail {
  padding: 20px 0;
  .host-detail-header {
    padding: 0 15px;
    .detail-header-name {
      font-size: 18px;
    }
  }
  .host-detail-main {
    .host-detail-main_tab {
      padding: 0 15px;
    }
    .cat-box {
      box-sizing: border-box;
      z-index: 50;
      overflow: auto;
      .dev-type-item {
        padding: 0 4px;
        box-sizing: border-box;
        cursor: pointer;
        height: 35px;
        width: 100%;
        line-height: 35px;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        position: relative;
        >div:first-child {
          width: 80%;
          text-indent: 15px;
          img {
            width:16px;
            height: 16px;
            margin-right: 10px;
            margin-top:15px
          }
        }
        .count {
          color: #999;
        }
        .org-statue {
          background: red;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: absolute;
          top: 22%;
          left: 180px;
        }
      }
      .dev-type-item:hover,.dev-type-item.active {
        background:#B7CBE7;
      }
      .page-btns {
        margin-top: 10px;
        text-align: center;
      }
    }
  }
}
</style>
