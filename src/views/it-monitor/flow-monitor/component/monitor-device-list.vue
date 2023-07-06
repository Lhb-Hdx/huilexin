<template>
  <div class="wrp">
    <div class="filter-container">
      <el-select v-model="agent" placeholder="请选择网关" class="filter-item" style="width: 200px" @change="changeAgent">
        <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-if="agentType === 8" v-model="childrenAgent" placeholder="请选择下级网关" class="filter-item" style="width: 200px" @change="changeChildrenAgent">
        <el-option v-for="item in childrenAgentList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-input v-model="keyword" placeholder="请输入主机名称或IP地址" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div>
      <el-table
        ref="taskLogTable"
        v-loading="isLoading"
        :data="itemData"
        style="width: 100%;"
        element-loading-spinner="el-icon-loading"
        @expand-change="expandChangeHost"
      >
        <el-table-column type="expand" prop="id">
          <template slot-scope="props">
            <el-table
              :data="props.row.children"
              style="width: 100%"
              max-height="250"
              class="task-log-table"
            >
              <el-table-column label="端口名称" prop="showName" show-overflow-tooltip />
              <el-table-column label="端口描述" prop="portDescribe" show-overflow-tooltip />
              <el-table-column v-if="props.row.hostType !== 490" label="端口管理状态" prop="portStartStatus" width="120" show-overflow-tooltip>
                <template slot-scope="item">
                  <div :class="item.row.portStartStatus == 1 ? 'success' : 'danger'">
                    <i :class="item.row.portStartStatus == 1 ? 'el-icon-success' : 'el-icon-error'" />
                    {{ item.row.portStartStatus == 1 ? '正常' : '未连接' }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column v-if="props.row.hostType !== 490" label="端口连接状态" prop="portConnectionStatus" width="120" show-overflow-tooltip>
                <template slot-scope="item">
                  <div :class="item.row.portConnectionStatus == 1 ? 'success' : 'danger'">
                    <i :class="item.row.portConnectionStatus == 1 ? 'el-icon-success' : 'el-icon-error'" />
                    {{ item.row.portConnectionStatus == 1 ? 'Up' : 'Down' }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="发送速率" width="120" align="right" prop="portSendRate" show-overflow-tooltip>
                <template slot-scope="item">
                  {{ setDataUnit(item.row.portSendRate, item.row.portSendRateUnits) }}
                  <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart('send', item.row)">
                </template>
              </el-table-column>
              <el-table-column label="接收速率" width="120" align="right" prop="portReceiveRate" show-overflow-tooltip>
                <template slot-scope="item">
                  {{ setDataUnit(item.row.portReceiveRate, item.row.portReceiveRateUnits) }}
                  <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart('receive', item.row)">
                </template>
              </el-table-column>
              <el-table-column label="一小时内" show-overflow-tooltip align="center">
                <el-table-column label="平均发送值" prop="avgSend" width="140" align="center" show-overflow-tooltip />
                <el-table-column label="平均接收值" prop="avgReceive" width="140" align="center" show-overflow-tooltip />
                <el-table-column label="发送最大值" prop="maxPortSend" width="140" align="center" show-overflow-tooltip />
                <el-table-column label="接收最大值" prop="maxPortReceive" width="140" align="center" show-overflow-tooltip />
              </el-table-column>
              <el-table-column label="接入号" show-overflow-tooltip>
                <template slot-scope="item">
                  {{ setAccessNum(item.row.portDescribe) }}
                </template>
              </el-table-column>
              <el-table-column label="光纤号" show-overflow-tooltip>
                <template slot-scope="item">
                  {{ setOpticalFiberNum(item.row.portDescribe) }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="主机名称" show-overflow-tooltip align="left" min-width="150px">
          <template slot-scope="{row}">
            <el-link type="primary" @click="handlerToItMonitorDevice(row)">{{ row.hostName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="IP地址" prop="hostIp" width="200" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="端口数" align="right" prop="portCount" width="100" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="连接端口状态" width="200" show-overflow-tooltip>
          <template slot-scope="item">
            <div
              ref="connectionStatusBar"
              class="connection-status-bar"
              :style="{ 'background-color': item.row.portConnectionStatus === 0 ? '#e9e8ea' : '#cccccc' }"
            >
              <div class="status-bar-value" :style="{ 'width': setConnectionStatusBarWidth(item.row) + 'px' }" />
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="right" label="发送速率" width="120" prop="portSendRate" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setDataUnit(item.row.portSendRate, item.row.portSendRateUnits) }}
            <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart('send', item.row)">
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" label="接收速率" width="120" prop="portReceiveRate" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setDataUnit(item.row.portReceiveRate, item.row.portReceiveRateUnits) }}
            <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart('receive', item.row)">
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="一小时内" show-overflow-tooltip align="center">
          <el-table-column label="平均发送值" prop="avgHostSend" width="140" align="center" show-overflow-tooltip />
          <el-table-column label="平均接收值" prop="avgHostReceive" width="140" align="center" show-overflow-tooltip />
          <el-table-column label="发送最大值" prop="maxHostSend" width="140" align="center" show-overflow-tooltip />
          <el-table-column label="接收最大值" prop="maxHostReceive" width="140" align="center" show-overflow-tooltip />
        </el-table-column>
        <el-table-column
          v-if="lists.length > 0 ? lists[7].ispass : true"
          label="操作"
          align="center"
          width="100"
        >
          <template slot-scope="{row}">
            <el-button type="text" @click="handlerDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 端口图表 -->
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :port="port"
      :custom-configuration="customConfiguration"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import {callbackTime, conversionSymbols, sizeUnitsTransform} from '@/utils/utils'
import UsedDetailDialog from '../monitoring-item-drawer'
import waves from '@/directive/waves'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import ListControl from '@/components/ListControl'

export default {
  name: 'MonitorDeviceList',
  components: {
    UsedDetailDialog, ListControl
  },
  directives: { waves },
  data() {
    return {
      agentsIds: '',
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
      itemData: [],
      getMonitorDataInterval: null,
      hostRes: [],
      showDrawer: false,
      itemDetail: {},
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      keyword: '',
      hyOrgId: '',
      orgHostStatue: [],
      agent: '',
      agentType: 0,
      agentList: [],
      expandHostIds: [],
      allHost: [],
      isLoading: true,
      childrenAgentList: [],
      childrenAgent: '',
      childrenFromAgent: '',
      port: {},
      allPortItem: [],
      haveNew: false,
      allHostIds: [],
      // 显示控制数据 start
      checkList: ['主机名称', 'IP地址', '端口数', '连接端口状态', '发送速率', '接收速率', '一小时内', '操作'],
      lists: [],
      // 显示控制数据 end
      customConfiguration: {
        yAxisLabelUnit: 'KB/s'
      }
    }
  },
  computed: {
    // 根据主机的所有端口设置主机的总数据大小和单位
    setHostDataCount() {
      // isDataType是否是数据单位，hostChildren主机的端口数据，sourceAttr匹配的属性，assignValue指定值
      return function(isDataType, hostChildren, sourceAttr, assignValue) {
        if (isDataType) {
          let count = 0
          if (hostChildren && hostChildren.length > 0) {
            let suffix = ''
            hostChildren.forEach(item => {
              if (item[sourceAttr] > 0) {
                let activeUnit = ''
                if (item[`${sourceAttr}Units`].indexOf('ps') !== -1) {
                  activeUnit = item[`${sourceAttr}Units`].split('ps')[0]
                  suffix = 'ps'
                }
                if (item[`${sourceAttr}Units`].indexOf('/') !== -1) {
                  activeUnit = item[`${sourceAttr}Units`].split('/')[0]
                  suffix = '/s'
                }
                const sizeUnitsTransformResult = sizeUnitsTransform(`${activeUnit}`, 'mb', Number(item[sourceAttr]))
                count += sizeUnitsTransformResult.size
              }
            })
            return `${count.toFixed(2)} MB${suffix || ''}`
          } else {
            return 0
          }
        } else {
          let count = 0
          if (hostChildren && hostChildren.length > 0) {
            hostChildren.forEach(item => {
              if (assignValue !== null) {
                if (Number(assignValue) === Number(item[sourceAttr])) {
                  count += Number(item[sourceAttr]) > 0 ? 1 : 0
                }
              } else {
                count += Number(item[sourceAttr]) > 0 ? 1 : 0
              }
            })
            return count
          } else {
            return 0
          }
        }
      }
    },
    // 设置数据大小和单位
    setDataUnit() {
      return function(data, unit) {
        if (data) {
          return `${Number(data).toFixed(2)} ${unit}`
        }
      }
    },
    // it监控协议
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    },
    setConnectionStatus() {
      return function(item) {
        let successCount = 0
        let errorCount = 0
        item.forEach(item => {
          if (Number(item.portConnectionStatus) === 1) {
            successCount += 1
          } else {
            errorCount += 1
          }
        })
        if (successCount === 0 && errorCount === 0) return 0
        if (errorCount === 0) return 100
        return (100 - (successCount / (successCount + errorCount))).toFixed()
      }
    },
    setConnectionStatusBarWidth() {
      return function(item) {
        if (!this.$refs.connectionStatusBar) return
        if (item.portConnectionStatus === 0) return 0
        return (this.$refs.connectionStatusBar.clientWidth / 100) * (Number(this.$tool.percentage(item.portConnectionStatus, item.portCount)))
      }
    },
    setAccessNum() {
      return function(portDescribe) {
        if (!portDescribe) return
        if (portDescribe.indexOf('USER::VPN') !== -1) {
          const conversionSymbols = this.$tool.conversionSymbols(portDescribe)
          if (conversionSymbols.indexOf('(') !== -1 && conversionSymbols.indexOf(')') !== -1) {
            const left = conversionSymbols.split('(')[1]
            return left.split(')')[0]
          }
        } else {
          return ''
        }
      }
    },
    setOpticalFiberNum() {
      return function(portDescribe) {
        if (!portDescribe) return
        if (portDescribe.indexOf('USER::VPN') !== -1) {
          const conversionSymbols = this.$tool.conversionSymbols(portDescribe)
          if (conversionSymbols.indexOf('(') !== -1 && conversionSymbols.indexOf(')') !== -1) {
            const left = conversionSymbols.split('(')[1]
            const right = left.split(')')[0]
            return right.replace(/[^\d]/g, ' ')
          }
        } else {
          return ''
        }
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('handler-area')
  },
  async mounted() {
    this.$EventBus.$on('handler-area', async msg => {
      this.itemData = []
      this.allHost = []
      this.hyOrgId = msg.id
      await this.findHyitHost()
    })
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostPortTotal-websocket') {
        this.isLoading = false
        this.watchAgentGetHostPortTotal(res.detail.data)
      }
      if (res.detail.data.cmd === 'it-agentGetHostPort-websocket') {
        this.watchAgentGetHostPort(res.detail.data)
      }
    })
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    if (this.agentsIds && this.agentsIds.length > 0) {
      // 获取网关
      const agentData = await this.findHyitAgent('1,8')
      if (agentData && agentData.length > 0) {
        this.agentList = agentData
        this.agent = this.agentList[0].id
        this.agentType = this.agentList[0].agentType
        if (this.agentList[0].agentType === 8) {
          this.childrenAgentList = await this.findHyitAgent(9)
          this.childrenAgent = this.childrenAgentList[0].id
          this.childrenFromAgent = this.childrenAgentList[0].fromAgentId
          if (this.childrenFromAgent) this.localStorageOperation('set', 'fromAgent', this.childrenFromAgent)
        }
      }
    } else {
      const agentData = await this.findHyitAgent('1,8')
      this.agentList = agentData
      this.agent = agentData[0].id
      if (agentData[0].agentType === 8) {
        this.childrenAgentList = await this.findHyitAgent(9)
        this.childrenAgent = this.childrenAgentList[0].id
        this.childrenFromAgent = this.childrenAgentList[0].fromAgentId
        if (this.childrenFromAgent) this.localStorageOperation('set', 'fromAgent', this.childrenFromAgent)
      }
    }
    // 获取主机
    await this.findHyitHost()
  },
  destroyed() {
    clearInterval(this.getMonitorDataInterval)
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 点击告警设备名称跳转到it监控设备详情
    async handlerToItMonitorDevice(row) {
      console.log(row)
      const { data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids: row.hySubdevTypeId }
      })
      this.$router.push({
        name: 'ResourceMonitorDetail',
        query: {
          id: row.hyHostId || 0,
          zbxHostId: row.hyZhostId,
          agent: row.agent,
          devTypeId: row.hyDevTypeId,
          subType: data && data.length > 0 ? data[0].dictdataValue : '',
          hySubdevTypeId: row.hySubdevTypeId && row.hySubdevTypeId > 0 ? row.hySubdevTypeId : ''
        }
      })
    },
    // 获取网关
    async findHyitAgent(agentTypes) {
      const { code, data } = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentTypes, page: 1, limit: -1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (code !== 1) return
      return data
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
    // 获取主机端口情况
    async agentGetHostPort(query) {
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
            fromAgent: this.localStorageOperation('get', 'fromAgent') || '',
            fromHostId: this.localStorageOperation('get', 'fromHostId') || ''
          }
        })
      }
    },
    // 设置主机监控项数据
    async setMonitorItemData(item, dealWithData) {
      dealWithData.forEach(dealWithDataItem => {
        if (dealWithDataItem.list.length > 0) {
          const idx = this.itemData.findIndex(itemDataKey => Number(itemDataKey.hostid) === Number(dealWithDataItem.hostid))
          if (idx !== -1) {
            if (dealWithDataItem.list.length > 0) {
              dealWithDataItem.list.forEach(listItem => {
                if (!listItem.itemName) return
                if (listItem.itemName.indexOf(' Name') !== -1) listItem.itemName = listItem.itemName.split(' Name')[0]
                if (listItem.itemName !== undefined && listItem.itemName !== '') {
                  const dataName = conversionSymbols(listItem.itemName)
                  const childrenIdx = this.itemData[idx].children.findIndex(citem => citem.itemName === (dataName === undefined ? '' : dataName.split('(')[0]))
                  let showName = listItem.itemName || ''
                  if (showName.indexOf('WAN Link') !== -1 || showName.indexOf('WAN Path') !== -1) return
                  const allPortItemIdsIndex = this.allPortItem.findIndex(el => +el.itemid === +listItem.itemid)
                  if (childrenIdx !== -1) {
                    this.$set(this.itemData[idx].children[childrenIdx], `${item.key}`, listItem.itemValue)
                    this.$set(this.itemData[idx].children[childrenIdx], `${item.key}Units`, listItem.units)
                    this.$set(this.itemData[idx].children[childrenIdx], `${item.key}ItemId`, listItem.itemid)
                    if (allPortItemIdsIndex === -1) {
                      this.$set(this.allPortItem, this.allPortItem.length, {
                        itemid: listItem.itemid,
                        valueType: listItem.valueType
                      })
                      this.haveNew = true
                    }
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
                    if (allPortItemIdsIndex === -1) {
                      this.$set(this.allPortItem, this.allPortItem.length, {
                        itemid: listItem.itemid,
                        valueType: listItem.valueType
                      })
                      this.haveNew = true
                    }
                  }
                }
              })
              console.log('===========================================================')
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
                  const dataName = conversionSymbols(listItem.itemName)
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
      return 'ok'
    },
    // 获取主机
    async findHyitHost() {
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
          hyOrgId: this.hyOrgId,
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
          hyOrgId: this.hyOrgId,
          agent: this.agent
        }
      })
      if (sdwan.code === 1) host.push(...sdwan.data)
      host.forEach(hostItem => {
        this.$set(this.allHost, this.allHost.length, {
          hyHostId: hostItem.hyHostId,
          agent: hostItem.agent,
          hostid: hostItem.hyZhostId,
          hostName: hostItem.hyMarkName,
          hostIp: hostItem.hyIp,
          hostType: hostItem.hyDevTypeId,
          fromAgent: hostItem.fromAgent,
          fromHostId: hostItem.fromHostId,
          hySubdevTypeId: hostItem.hySubdevTypeId,
          hyZhostId: hostItem.hyZhostId,
          hyDevTypeId: hostItem.hyDevTypeId,
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
      this.allHost.forEach(hostItem => {
        if (hostItem.orgId === this.hyOrgId || this.hyOrgId === '') {
          this.$set(this.itemData, this.itemData.length, { ...hostItem })
        }
      })
      // 查询主机一个小时历史数据
      const hostIds = []
      const zHostIds = []
      this.allHost.forEach(item => {
        hostIds.push(item.hyHostId)
        zHostIds.push(item.hyZhostId)
      })
      const findZbxFlowStatisticsMaxGroupTime = await this.findZbxFlowStatisticsMaxGroupTime({
        zhostIds: hostIds.toString(),
        stime: this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(parseInt(callbackTime(1).valueOf()))),
        etime: this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date()),
        limit: -1,
        agent: this.agent
      })
      this.allHostIds = zHostIds
      if (findZbxFlowStatisticsMaxGroupTime.code === 1 && findZbxFlowStatisticsMaxGroupTime.map) {
        findZbxFlowStatisticsMaxGroupTime.map.data.forEach(item => {
          const getHostIndex = this.itemData.findIndex(el => +el.hyZhostId === +item.zhostid)
          if (getHostIndex !== -1) {
            const avgHostSend = this.$tool.sizeUnitsConversion(item.portSendAvg, 'capital')
            const avgHostReceive = this.$tool.sizeUnitsConversion(item.portRecvAvg, 'capital')
            const maxHostSend = this.$tool.sizeUnitsConversion(item.portSendMax, 'capital')
            const maxHostReceive = this.$tool.sizeUnitsConversion(item.portRecvMax, 'capital')
            this.$set(this.itemData[getHostIndex], 'avgHostSend', +avgHostSend.size > 0 ? `${Number(avgHostSend.size).toFixed(2)}${avgHostSend.units}/s` : '0B/s')
            this.$set(this.itemData[getHostIndex], 'avgHostReceive', +avgHostReceive.size > 0 ? `${Number(avgHostReceive.size).toFixed(2)}${avgHostReceive.units}/s` : '0B/s')
            this.$set(this.itemData[getHostIndex], 'maxHostSend', +maxHostSend.size > 0 ? `${Number(maxHostSend.size).toFixed(2)}${maxHostSend.units}/s` : '0B/s')
            this.$set(this.itemData[getHostIndex], 'maxHostReceive', +maxHostReceive.size > 0 ? `${Number(maxHostReceive.size).toFixed(2)}${maxHostReceive.units}/s` : '0B/s')
          }
        })
      }
      if (host.length > 0) {
        // 获取流量数据
        this.agentGetHostPortTotal()
        // 定时获取流量统计数据、展开的主机端口数据
        this.getMonitorDataInterval = setInterval(() => {
          this.agentGetHostPortTotal()
          if (this.expandHostIds.length > 0) {
            this.expandHostIds.forEach(item => {
              this.agentGetHostPort({ agent: this.agent, hostid: item, fromAgent: this.localStorageOperation('get', 'fromAgent'), fromHostId: this.localStorageOperation('get', 'fromHostId') })
            })
          }
        }, 5000)
      }
    },
    // 打开监控项图表
    async openMonitorNetListEchart(t, row) {
      let detailParams = []
      let tableParams = []
      if (t === 'send' || !t) {
        const sendModel = await this.getZbxItemsHost({
          itemid: row.portSendRateItemId, agent: row.agent
        })
        if (sendModel.code === 1) {
          detailParams.push({
            agent: row.agent,
            unit: row.portSendRateUnits,
            itemid: row.portSendRateItemId,
            valueType: sendModel.model.valueType,
            name: '发送',
            color: '#87DEAF',
            echartType: 'value',
            unitSuffix: '/s',
            isConversion: true,
            conversionUnitType: 'data',
            data: [],
            units: [],
            time: [],
            isAssignUnit: true,
            assignUnit: 'KB',
            toFixed: 2
          })
          tableParams.push({
            agent: row.agent,
            label: ['最高发送', '最低发送', '平均发送'],
            value: 0,
            unit: row.portSendRateUnits,
            itemid: row.portSendRateItemId,
            valueType: sendModel.model.valueType,
            isConversion: true,
            conversionUnitType: 'data',
            type: ['max', 'min', 'avg'],
            isAssignUnit: true,
            assignUnit: 'KB',
            fixed: 2
          })
        }
      }
      if (t === 'receive' || !t) {
        const receiveModel = await this.getZbxItemsHost({
          itemid: row.portReceiveRateItemId, agent: row.agent
        })
        if (receiveModel.code === 1) {
          detailParams.push({
            agent: row.agent,
            unit: row.portReceiveRateUnits,
            itemid: row.portReceiveRateItemId,
            valueType: receiveModel.model.valueType,
            name: '接收',
            color: '#3ba9ed',
            echartType: 'value',
            unitSuffix: '/s',
            isConversion: true,
            conversionUnitType: 'data',
            data: [],
            units: [],
            time: [],
            isAssignUnit: true,
            assignUnit: 'KB',
            toFixed: 2
          })
          tableParams.push({
            agent: row.agent,
            label: ['最高接收', '最低接收', '平均接收'],
            value: 0,
            unit: row.portReceiveRateUnits,
            itemid: row.portReceiveRateItemId,
            valueType: receiveModel.model.valueType,
            isConversion: true,
            conversionUnitType: 'data',
            type: ['max', 'min', 'avg'],
            isAssignUnit: true,
            assignUnit: 'KB',
            fixed: 2
          })
        }
      }
      this.detailParams = detailParams
      this.tableParams = tableParams
      this.showUsedDetailDialog = true
    },
    // 关闭图表
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    // 获取监控项信息
    async getZbxItemsHost(row) {
      return await request({
        url: api.itMonitor.getZbxItemsHost,
        data: { itemid: row.itemid, agent: row.agent }
      })
    },
    // 查询按钮
    handleFilter() {
      this.allHost = []
      this.itemData = []
      // this.findHyitAgent()
      this.findHyitHost()
    },
    // 进入详情
    handlerDetail(val) {
      this.port = val
      this.localStorageOperation('set', 'hostFlowMonitorParams', { ...val, flowType: 'host' })
      this.$router.push({
        name: 'FlowMonitorDetail',
        query: {
          hostId: val.hyHostId,
          zhostId: val.hostid,
          agent: val.agent
        }
      })
      if (val.fromAgent) this.localStorageOperation('set', 'fromAgent', val.fromAgent)
      if (val.fromHostId) this.localStorageOperation('set', 'fromHostId', val.fromHostId)
    },
    // 选择网关
    async changeAgent(val) {
      const idx = this.agentList.findIndex(item => Number(item.id) === Number(val))
      if (idx === -1) return
      if (this.agentList[idx].agentType === 8) {
        this.childrenAgentList = await this.findHyitAgent(9)
        this.childrenAgent = this.childrenAgentList[0].id
        if (this.childrenAgent) this.localStorageOperation('set', 'fromAgent', this.childrenAgentList[0].fromAgentId)
      } else {
        this.childrenAgentList = []
        this.childrenAgent = ''
      }
      this.agentType = Number(this.agentList[idx].agentType)
    },
    // 流量汇总
    agentGetHostPortTotal() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      const hostid = []
      this.allHostIds.forEach(item => hostid.push(item))
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHostPortTotal,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: this.agent,
          fromAgent: this.localStorageOperation('get', 'fromAgent') || '',
          fromHostId: this.localStorageOperation('get', 'fromHostId') || '',
          hostid: hostid.toString()
        }
      })
    },
    // 监听流量汇总
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
            const itemDataIdx = this.itemData.findIndex(items => Number(items.hostid) === Number(dataItem.hostid))
            if (itemDataIdx !== -1) {
              this.$set(this.itemData[itemDataIdx], `${item.key}`, Number(dataItem.itemValue))
              this.$set(this.itemData[itemDataIdx], `${item.key}Units`, dataItem.units)
              this.$set(this.itemData[itemDataIdx], `${item.key}ItemId`, dataItem.itemid)
              this.$set(this.itemData[itemDataIdx], `${item.key}ValueType`, dataItem.valueType)
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
      this.$EventBus.$emit('watch-org-host-statue', areaStatus)
    },
    // 展开主机
    expandChangeHost(val) {
      const idx = this.expandHostIds.indexOf(val.hostid)
      if (idx !== -1) {
        this.expandHostIds.splice(idx, 1)
      } else {
        this.$set(this.expandHostIds, this.expandHostIds.length, val.hostid)
      }
      if (val.fromAgent) this.localStorageOperation('set', 'fromAgent', val.fromAgent)
      if (val.fromHostId) this.localStorageOperation('set', 'fromHostId', val.fromHostId)
      this.expandHostIds.forEach(item => {
        this.agentGetHostPort({ agent: this.agent, hostid: item, fromAgent: this.localStorageOperation('get', 'fromAgent'), fromHostId: this.localStorageOperation('get', 'fromHostId') })
      })
    },
    // 监听主机端口数据
    async watchAgentGetHostPort(res) {
      const data = this.itMonitorRequireAgreement === 'WS' ? this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData)[0] : [] : res
      this.itemKeyValues.forEach(async item => { // 遍历要显示的监控项字段，根据这些字段去找监控项的数据
        const itemData = data[`${item.name}`] // 物理端口
        const itemVlanData = data[`${item.name}vlan`] // 虚拟端口
        // 根据主机id分类
        const dealWithData = this.dealWithData(itemData) // 根据主机id归类物理端口
        const dealWithVlanData = this.dealWithData(itemVlanData) // 根据主机id归类虚拟端口
        await this.setMonitorItemData(item, dealWithData)
        await this.setMonitorItemData(item, dealWithVlanData)
      })

      // 请求端口一小时历史数据
      if (this.allPortItem.length > 0 && this.haveNew) {
        const itemids = []
        const valueType = []
        this.allPortItem.forEach(item => {
          itemids.push(item.itemid)
          valueType.push(item.valueType)
        })
        this.haveNew = false
        const agentGetTrendData = await this.agentGetTrendData({
          itemid: itemids.toString(),
          valueType: valueType.toString(),
          agent: this.agent,
          startClock: parseInt(callbackTime(2).valueOf() / 1000),
          endClock: parseInt(new Date().valueOf() / 1000)
        })
        if (agentGetTrendData.code === 1) {
          const jsonModel = this.$tool.isJSONString(agentGetTrendData.model) ? JSON.parse(agentGetTrendData.model) : {}
          this.expandHostIds.forEach(item => {
            const getHostIndex = this.itemData.findIndex(el => +el.hyZhostId === +item)
            if (getHostIndex !== -1) {
              this.itemData[getHostIndex].children.forEach((items, index) => {
                const sendJsonItem = jsonModel[`itemData${items.portSendRateItemId}`]
                const receiveJsonItem = jsonModel[`itemData${items.portSendRateItemId}`]
                if (sendJsonItem) {
                  const avg = this.$tool.sizeUnitsConversion(sendJsonItem[0].valueAvg, 'capital')
                  const max = this.$tool.sizeUnitsConversion(sendJsonItem[0].valueMax, 'capital')
                  this.$set(this.itemData[getHostIndex].children[index], 'avgSend', +avg.size > 0 ? `${Number(avg.size).toFixed(2)}${avg.units}/s` : '0B/s')
                  this.$set(this.itemData[getHostIndex].children[index], 'maxPortSend', +max.size > 0 ? `${Number(max.size).toFixed(2)}${max.units}/s` : '0B/s')
                }
                if (receiveJsonItem) {
                  const avg = this.$tool.sizeUnitsConversion(receiveJsonItem[0].valueAvg, 'capital')
                  const max = this.$tool.sizeUnitsConversion(receiveJsonItem[0].valueMax, 'capital')
                  this.$set(this.itemData[getHostIndex].children[index], 'avgReceive', +avg.size > 0 ? `${Number(avg.size).toFixed(2)}${avg.units}/s` : '0B/s')
                  this.$set(this.itemData[getHostIndex].children[index], 'maxPortReceive', +max.size > 0 ? `${Number(max.size).toFixed(2)}${max.units}/s` : '0B/s')
                }
              })
            }
          })
        }
      }
    },
    changeChildrenAgent(val) {
      const idx = this.childrenAgentList.findIndex(item => Number(item.id) === Number(val))
      if (idx !== -1) {
        this.childrenFromAgent = this.childrenAgentList[idx].fromAgentId
        if (this.childrenFromAgent) this.localStorageOperation('set', 'fromAgent', this.childrenFromAgent)
      }
    },
    async agentGetTrendData(query) {
      return await this.$request({
        url: this.api.itMonitor.agentGetTrendData,
        data: query
      })
    },
    async findZbxFlowStatisticsMaxGroupTime(query) {
      return await this.$request({
        url: this.api.flowMonitor.findZbxFlowStatisticsMaxGroupTime,
        data: query
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrp {
  padding: 10px;
}

>>>.el-table__expanded-cell {
  background-color: rgba(230, 236, 247,0.3) !important;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  padding-right: 0 !important;
}

.connection-status-bar {
  background: #fe4d4e;
  height: 14px;
  .status-bar-value {
    height: 14px;
    background: #00b285;
  }
}
</style>
