<template>
  <div class="ports box-border margin-top-15 margin-left-15 margin-right-15">
    <div class="head-bar head">
      <div class="title">监控数据</div>
      <div class="chunk-opts">
        <div v-if="isConfig" class="chunk-opts-select">
          <el-switch
            v-model="watchItemSwitch"
            @change="changeItemSwitch"
          />
        </div>
      </div>
    </div>
    <div class="p10">
      <div class="tab-btns">
        <div v-for="item in netTypeTab" :key="item.key" class="tab-btn-item" :class="netTypeTabKey === item.key ? 'active' : ''" @click="handelSelectKey(item.key)">{{ item.value }}</div>
      </div>
      <div class="filter-container">
        <el-input v-model="sdwanQuery.keyword" class="filter-item" clearable placeholder="请输入端口名称" style="width: 200px;" @clear="inSearch = false" />
        <el-button class="filter-item" icon="el-icon-search" type="primary" @click="onFilter(getSource(), 'searchSDWANListRes', 'sdwanQuery', { keyword: 'name' })">查询</el-button>
      </div>
      <div class="table-wrapper">
        <el-table
          v-if="netTypeTabKey === 'wanPath'"
          key="wanPath"
          v-loading="searchSDWANListRes.length < 1"
          element-loading-spinner="el-icon-loading"
          :data="searchSDWANListRes"
          style="width: 100%"
        >
          <el-table-column prop="name" label="端口名称" width="350" />
          <el-table-column label="发送速率">
            <template slot-scope="item">
              {{ setDataUnit(item.row.BytesSentItemValue, item.row.BytesSentUtils) }}
            </template>
          </el-table-column>
          <el-table-column label="接收速率">
            <template slot-scope="item">
              {{ setDataUnit(item.row.BytesRecivedItemValue, item.row.BytesRecivedUtils) }}
            </template>
          </el-table-column>
          <el-table-column prop="BOWTItemValue" label="延迟（ms）" />
          <el-table-column prop="JitterItemValue" label="抖动" />
          <el-table-column prop="PacketsLostItemValue" label="丢包率" />
          <el-table-column label="状态">
            <template slot-scope="item">
              <span :class="setStatusMap('color', item.row.StateItemValue)">
                <i :class="setStatusMap('icon', item.row.StateItemValue)" />
                {{ setStatusMap('value', item.row.StateItemValue) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="图形" align="center">
            <template slot-scope="item">
              <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openMonitorNetListEchart(item.row)">
            </template>
          </el-table-column>
        </el-table>
        <el-table
          v-if="netTypeTabKey === 'wanLink'"
          key="wanLink"
          v-loading="searchSDWANListRes.length < 1"
          element-loading-spinner="el-icon-loading"
          :data="searchSDWANListRes"
          style="width: 100%"
        >
          <el-table-column prop="name" label="端口名称" width="350" />
          <el-table-column prop="IpAddrItemValue" label="IP" />
          <el-table-column label="状态">
            <template slot-scope="item">
              <span :class="setStatusMap('color', item.row.StateItemValue)">
                <i :class="setStatusMap('icon', item.row.StateItemValue)" />
                {{ setStatusMap('value', item.row.StateItemValue) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
        <el-table
          v-if="netTypeTabKey === 'physical'"
          key="physical"
          v-loading="searchSDWANListRes.length < 1"
          element-loading-spinner="el-icon-loading"
          :data="searchSDWANListRes"
          style="width: 100%"
        >
          <el-table-column prop="name" label="端口名称" width="350" />
          <el-table-column label="发送速率">
            <template slot-scope="item">
              {{ setDataUnit(item.row.BytesSentItemValue, item.row.BytesSentUtils) }}
            </template>
          </el-table-column>
          <el-table-column label="接收速率">
            <template slot-scope="item">
              {{ setDataUnit(item.row.BytesRecivedItemValue, item.row.BytesRecivedUtils) }}
            </template>
          </el-table-column>
          <el-table-column label="图形" align="center">
            <template slot-scope="item">
              <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openMonitorNetListEchart(item.row)">
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="sdwanQuery.total" :auto-scroll="false" :total="sdwanQuery.total" :page.sync="sdwanQuery.page" :limit.sync="sdwanQuery.limit" @pagination="handlerPagination(getSource, 'searchSDWANListRes', 'sdwanQuery', { keyword: 'name' })" />
      </div>
    </div>
    <!-- 端口图表 -->
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :show-dialog="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import UsedDetailDialog from '../component/used-detail-dialog'
import { conversionData, isJSONString } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import Pagination from '@/components/Pagination'

export default {
  components: {
    UsedDetailDialog, Pagination
  },
  props: {
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
    },
    upDataDirectiveId: {
      type: String,
      default() {
        return ''
      }
    }
  },
  data() {
    return {
      hostId: 0,
      sbId: 0,
      netList: [],
      netTypeTab: [
        { key: 'wanPath', value: 'WAN path' },
        { key: 'wanLink', value: 'WAN link' },
        { key: 'physical', value: '物理端口' }
      ],
      wanPathList: [],
      wanLinkList: [],
      physicalList: [],
      netTypeTabKey: 'wanPath',
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      loading: true,
      portStateMap: null,
      watchItemSwitch: true,
      watchItemKey: 'sdwanPort',
      watchItemShow: null,
      inSearch: false,
      sdwanQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        total: 0
      },
      searchSDWANListRes: []
    }
  },
  computed: {
    // 设置数据大小和单位
    setDataUnit() {
      return function(data, unit) {
        if (data) {
          const conversionDataResult = conversionData('data', Number(data), unit)
          const size = conversionDataResult.size > 0 ? conversionDataResult.size : 0
          const units = conversionDataResult.units ? conversionDataResult.units : unit
          const suffix = conversionDataResult.units ? conversionDataResult.suffix : ''
          return `${Number(size).toFixed(2)} ${units}${suffix}`
        } else {
          return 0
        }
      }
    },
    setStatusMap() {
      return function(type, data) {
        if (this.portStateMap) {
          const idx = this.portStateMap.findIndex(item => Number(item.value) === Number(data))
          if (idx !== -1) {
            const color = [
              { value: 'good', iType: 'el-icon-success', colorClass: 'success' },
              { value: 'bad', iType: 'el-icon-error', colorClass: 'danger' }
            ]
            if (type === 'value') {
              return this.portStateMap[idx].newvalue.toLocaleUpperCase()
            } else if (type === 'status') {
              return this.portStateMap[idx].newvalue === 'good'
            } else if (type === 'color') {
              const getItem = color.findIndex(item => item.value === this.portStateMap[idx].newvalue)
              return getItem !== -1 ? color[getItem].colorClass : ''
            } else {
              const getItem = color.findIndex(item => item.value === this.portStateMap[idx].newvalue)
              return getItem !== -1 ? color[getItem].iType : ''
            }
          } else {
            return ''
          }
        } else {
          return ''
        }
      }
    },
    // 获取网关id
    agent() {
      if (this.propAgent === 0) {
        return this.$route.query.agent
      } else {
        return String(this.propAgent)
      }
    },
    // 获取zabbix主机id
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
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    getSource() {
      return function() {
        switch (this.netTypeTabKey) {
          case 'wanPath':
            return 'wanPathList'
          case 'wanLink':
            return 'wanLinkList'
          default:
            return 'physicalList'
        }
      }
    }
  },
  watch: {
    upDataDirectiveId: {
      handler() {
        this.getSDWANPortData()
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-graph-show')
  },
  mounted() {
    this.getSDWANPortData()
    this.loading = false
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
  },
  methods: {
    // 获取sdwan端口数据
    async getSDWANPortData() {
      let statusItemId = null
      if (this.netTypeTabKey === 'wanPath') {
        const getWanPathData = await this.agentGetHostData('getItemSdwanWanPathData')
        if (getWanPathData) {
          this.loading = false
          const filterData = getWanPathData.filter(items => items.itemName.indexOf('WAN Path') !== -1 && items.itemName.indexOf('Name') !== -1)
          filterData.forEach(items => {
            const getItem = this.$tool.findDataItemByAttr(this.wanPathList, 'key', items.itemName.split(' Name')[0])
            if (!getItem) {
              this.$set(this.wanPathList, this.wanPathList.length, {
                name: items.itemValue,
                key: items.itemName.split(' Name')[0]
              })
            }
          })
          if (this.wanPathList.length > 0) {
            getWanPathData.forEach(items => {
              // 发送
              if (items.itemName.indexOf('BytesSent') !== -1 && items.itemName.indexOf('Name') === -1) {
                const getItem = this.$tool.findDataItemByAttr(this.wanPathList, 'key', items.itemName.split(' BytesSent')[0])
                this.$set(this.wanPathList[getItem.index], 'BytesSentItemValue', items.itemValue)
                this.$set(this.wanPathList[getItem.index], 'BytesSentItemId', items.itemid)
                this.$set(this.wanPathList[getItem.index], 'BytesSentValueType', items.valueType)
                this.$set(this.wanPathList[getItem.index], 'BytesSentUtils', items.units)
                this.$set(this.wanPathList[getItem.index], 'BytesSentKey', 'BytesSent')
              }
              // 接收
              if (items.itemName.indexOf('BytesRecived') !== -1 && items.itemName.indexOf('Name') === -1) {
                const getItem = this.$tool.findDataItemByAttr(this.wanPathList, 'key', items.itemName.split(' BytesRecived')[0])
                this.$set(this.wanPathList[getItem.index], 'BytesRecivedItemValue', items.itemValue)
                this.$set(this.wanPathList[getItem.index], 'BytesRecivedItemId', items.itemid)
                this.$set(this.wanPathList[getItem.index], 'BytesRecivedValueType', items.valueType)
                this.$set(this.wanPathList[getItem.index], 'BytesRecivedUtils', items.units)
                this.$set(this.wanPathList[getItem.index], 'BytesRecivedKey', 'BytesRecived')
              }
              // 状态
              if (items.itemName.indexOf('State') !== -1 && items.itemName.indexOf('Name') === -1) {
                const getItem = this.$tool.findDataItemByAttr(this.wanPathList, 'key', items.itemName.split(' State')[0])
                this.$set(this.wanPathList[getItem.index], 'StateItemValue', items.itemValue)
                this.$set(this.wanPathList[getItem.index], 'StateItemId', items.itemid)
                this.$set(this.wanPathList[getItem.index], 'StateValueType', items.valueType)
                this.$set(this.wanPathList[getItem.index], 'StateUtils', items.units)
                this.$set(this.wanPathList[getItem.index], 'StateKey', 'State')
                statusItemId = items.itemid
              }
              // 抖动
              if (items.itemName.indexOf('Jitter') !== -1 && items.itemName.indexOf('Name') === -1) {
                const getItem = this.$tool.findDataItemByAttr(this.wanPathList, 'key', items.itemName.split(' Jitter')[0])
                this.$set(this.wanPathList[getItem.index], 'JitterItemValue', items.itemValue)
                this.$set(this.wanPathList[getItem.index], 'JitterItemId', items.itemid)
                this.$set(this.wanPathList[getItem.index], 'JitterValueType', items.valueType)
                this.$set(this.wanPathList[getItem.index], 'JitterUtils', items.units)
                this.$set(this.wanPathList[getItem.index], 'JitterKey', 'Jitter')
              }
              // 丢包
              if (items.itemName.indexOf('PacketsLost') !== -1 && items.itemName.indexOf('Name') === -1) {
                const getItem = this.$tool.findDataItemByAttr(this.wanPathList, 'key', items.itemName.split(' PacketsLost')[0])
                this.$set(this.wanPathList[getItem.index], 'PacketsLostItemValue', items.itemValue)
                this.$set(this.wanPathList[getItem.index], 'PacketsLostItemId', items.itemid)
                this.$set(this.wanPathList[getItem.index], 'PacketsLostValueType', items.valueType)
                this.$set(this.wanPathList[getItem.index], 'PacketsLostUtils', items.units)
                this.$set(this.wanPathList[getItem.index], 'PacketsLostKey', 'PacketsLost')
              }
              // 延迟
              if (items.itemName.indexOf('BOWT') !== -1 && items.itemName.indexOf('Name') === -1) {
                const getItem = this.$tool.findDataItemByAttr(this.wanPathList, 'key', items.itemName.split(' BOWT')[0])
                this.$set(this.wanPathList[getItem.index], 'BOWTItemValue', items.itemValue)
                this.$set(this.wanPathList[getItem.index], 'BOWTItemId', items.itemid)
                this.$set(this.wanPathList[getItem.index], 'BOWTValueType', items.valueType)
                this.$set(this.wanPathList[getItem.index], 'BOWTUtils', items.units)
                this.$set(this.wanPathList[getItem.index], 'BOWTKey', 'BOWT')
              }
            })
          }
        }
      } else if (this.netTypeTabKey === 'wanLink') {
        const getWanLinkData = await this.agentGetHostData('getItemSdwanWanLinkData')
        if (getWanLinkData) {
          this.loading = false
          const filterData = getWanLinkData.filter(items => items.itemName.indexOf('WAN Link') !== -1 && items.itemName.indexOf('Name') !== -1)
          filterData.forEach(items => {
            const getItem = this.$tool.findDataItemByAttr(this.wanLinkList, 'key', items.itemName.split(' Name')[0])
            if (!getItem) {
              this.$set(this.wanLinkList, this.wanLinkList.length, {
                name: items.itemValue,
                key: items.itemName.split(' Name')[0]
              })
            }
          })
          if (this.wanLinkList.length > 0) {
            getWanLinkData.forEach(items => {
              // 状态
              if (items.itemName.indexOf('Status') !== -1 && items.itemName.indexOf('Name') === -1) {
                const getItem = this.$tool.findDataItemByAttr(this.wanLinkList, 'key', items.itemName.split(' Status')[0])
                if (!getItem) return
                this.$set(this.wanLinkList[getItem.index], 'StateItemValue', items.itemValue)
                this.$set(this.wanLinkList[getItem.index], 'StateItemId', items.itemid)
                this.$set(this.wanLinkList[getItem.index], 'StateValueType', items.valueType)
                this.$set(this.wanLinkList[getItem.index], 'StateUtils', items.units)
                this.$set(this.wanLinkList[getItem.index], 'StateKey', 'State')
                statusItemId = items.itemid
              }
              // ip地址
              if (items.itemName.indexOf('IpAddr') !== -1 && items.itemName.indexOf('Name') === -1) {
                const getItem = this.$tool.findDataItemByAttr(this.wanLinkList, 'key', items.itemName.split(' IpAddr')[0])
                if (!getItem) return
                this.$set(this.wanLinkList[getItem.index], 'IpAddrItemValue', items.itemValue)
                this.$set(this.wanLinkList[getItem.index], 'IpAddrItemId', items.itemid)
                this.$set(this.wanLinkList[getItem.index], 'IpAddrValueType', items.valueType)
                this.$set(this.wanLinkList[getItem.index], 'IpAddrUtils', items.units)
                this.$set(this.wanLinkList[getItem.index], 'IpAddrKey', 'IpAddr')
              }
            })
          }
        }
      } else if (this.netTypeTabKey === 'physical') {
        this.loading = false
        const getPhysicalNames = await this.agentGetHostData('getItemSdwanPortNameData')
        const getPhysicalSends = await this.agentGetHostData('getItemSdwanPortSendData')
        const getPhysicalRecvs = await this.agentGetHostData('getItemSdwanPortRecvData')
        getPhysicalNames.forEach(item => {
          const getItem = this.$tool.findDataItemByAttr(this.physicalList, 'key', item.itemName.split(' Name')[0])
          if (!getItem) {
            this.$set(this.physicalList, this.physicalList.length, {
              name: item.itemValue,
              key: item.itemName.split(' Name')[0]
            })
          }
        })
        if (this.physicalList.length > 0) {
          getPhysicalSends.forEach(item => {
            const idx = this.physicalList.findIndex(items => items.key === item.itemName.split('（')[0])
            if (idx !== -1) {
              this.physicalList[idx].BytesSentItemValue = item.itemValue
              this.physicalList[idx].BytesSentItemId = item.itemid
              this.physicalList[idx].BytesSentValueType = item.valueType
              this.physicalList[idx].BytesSentUtils = item.units.split('/')[0]
              this.physicalList[idx].BytesSentKey = 'BytesSent'
            }
          })
          getPhysicalRecvs.forEach(item => {
            const idx = this.physicalList.findIndex(items => items.key === item.itemName.split('（')[0])
            if (idx !== -1) {
              this.physicalList[idx].BytesRecivedItemValue = item.itemValue
              this.physicalList[idx].BytesRecivedItemId = item.itemid
              this.physicalList[idx].BytesRecivedValueType = item.valueType
              this.physicalList[idx].BytesRecivedUtils = item.units.split('/')[0]
              this.physicalList[idx].BytesRecivedKey = 'BytesRecived'
            }
          })
        }
      }
      console.log(this.getSource())
      this.handlerQueryPortList(this.getSource(), 'searchSDWANListRes', 'sdwanQuery', { keyword: 'name' })
      // 获取端口状态map
      if (!this.portStateMap) {
        const getStatusMap = await this.agentGetValueMap(statusItemId)
        if (getStatusMap) this.portStateMap = JSON.parse(getStatusMap)
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
    async agentGetHostData(method) {
      if (this.itMonitorRequireAgreement !== 'WS') {
        return new Promise(resolve => {
          request({ url: api.itMonitor.agentGetHostData, data: { agent: this.agent, hostid: this.zbxHostId, method }}).then(res => {
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
              agent: this.agent,
              hostid: this.zbxHostId,
              methed: method,
              fromAgent: this.localStorageOperation('get', 'fromAgent'),
              fromHostId: this.localStorageOperation('get', 'fromHostId')
            }
          },
          (res) => {
            const wsRes = isJSONString(res[`${method}`]) ? JSON.parse(res[`${method}`]) : res[`${method}`]
            if (wsRes && res.methed === method) {
              resolve(wsRes)
            }
          }, (err) => {
            this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
            console.log(err)
          })
        })
      }
    },
    handelSelectKey(key) {
      this.wanPathList = []
      this.wanLinkList = []
      this.physicalList = []
      this.loading = true
      this.netTypeTabKey = key
      this.getSDWANPortData()
    },
    // 打开图表
    openMonitorNetListEchart(row) {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          unit: row.BytesSentUtils,
          itemid: row.BytesSentItemId,
          valueType: row.BytesSentValueType,
          name: '发送',
          color: '#87DEAF',
          echartType: 'value',
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: []
        },
        {
          unit: row.BytesRecivedUtils,
          itemid: row.BytesRecivedItemId,
          valueType: row.BytesRecivedValueType,
          name: '接收',
          color: '#3ba9ed',
          echartType: 'value',
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: []
        }
      ]
      this.tableParams = [
        {
          label: ['最高发送', '平均发送'],
          value: 0,
          unit: row.BytesSentUtils,
          itemid: row.BytesSentItemId,
          valueType: row.BytesSentValueType,
          isConversion: true,
          conversionUnitType: 'data',
          type: ['max', 'avg']
        },
        {
          label: ['最高接收', '平均接收'],
          value: 0,
          unit: row.BytesRecivedUtils,
          itemid: row.BytesRecivedItemId,
          valueType: row.BytesRecivedValueType,
          isConversion: true,
          conversionUnitType: 'data',
          type: ['max', 'avg']
        }
      ]
    },
    // 关闭图表
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '监控数据',
          isShow: Number(val),
          devType: this.devTypeId,
          hostId: this.id,
          zhostId: this.zbxHostId,
          graphType: 1
        })
      } else {
        this.$EventBus.$emit('change-item-switch', {
          id: this.watchItemShow.id,
          type: 1,
          isShow: Number(val),
          name: this.watchItemKey
        })
      }
    },
    // 查询
    onFilter(source, target, query, matching) {
      this.inSearch = true
      this.$set(this[`${query}`], 'page', 1)
      this.handlerQueryPortList(source, target, query, matching)
    },
    // 分页
    handlerPagination(source, target, query, matching) {
      this.handlerQueryPortList(source, target, query, matching)
    },
    /**
     * @description 统一查询方法
     * @param source 源数据变量
     * @param target 目标赋值数据变量
     * @param query 查询参数
     * @param matching 查询匹配参数
     */
    handlerQueryPortList(source, target, query, matching) {
      let data = [...this[`${source}`]]
      // 关键字查询
      if (this.inSearch && this[`${query}`].keyword !== '') {
        let queryList = []
        data.forEach(item => {
          if (item[`${matching.keyword}`].indexOf(this[`${query}`].keyword) !== -1) {
            queryList.push(item)
          }
        })
        data = queryList
      }
      // 分页
      this[`${target}`] = data.slice(this[`${query}`].limit * (this[`${query}`].page - 1), this[`${query}`].limit * (this[`${query}`].page - 1) + this[`${query}`].limit)
      // 排序
      // this[`${target}`].sort(this.$tool.sortJsonData([`${this.netListSortOptions.attr}`], !this.netListSortOptions.rev))
      // 条数
      this[`${query}`].total = data.length
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
.tab-btns {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
  .active {
    color: #1045a2 !important;
    font-size: 16px !important;
    font-weight: bold !important;
  }
  .active::after {
    content: " ";
    display: block;
    background: #1045a2;
    width: 100%;
    height: 3px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -40%;
  }
  .tab-btn-item {
    color: #9e9e9e;
    font-size: 14px;
    font-weight: 500;
    margin: 10px;
    position: relative;
    cursor: pointer
  }
}
</style>
