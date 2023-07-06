<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" class="chuck-box ports box-border margin-top-15 margin-left-15 margin-right-15">
    <div class="head head-bar">
      <div class="title">板卡端口</div>
      <div class="chunk-opts">
        <div class="chunk-opts-select">
          <el-switch
            v-if="isConfig"
            v-model="watchItemSwitch"
            @change="changeItemSwitch"
          />
        </div>
      </div>
    </div>
    <div class="p10">
      <div v-if="isShowTab" class="tab-btns">
        <div v-for="item in netTypeTab" :key="item.key" class="tab-btn-item" :class="netTypeTabKey === item.key ? 'active' : ''" @click="handelSelectKey(item.key)">{{ item.value }}</div>
        <el-button v-if="isShowOpticalModule" size="mini" type="primary" style="position: absolute; right: 0" @click="openOpticalModule">光模块</el-button>
      </div>
      <div class="filter-container">
        <el-input v-model="portQuery.keyword" class="filter-item" clearable placeholder="请输入端口名字" style="width: 200px;" @clear="inSearch = false" />
        <el-button class="filter-item" icon="el-icon-search" type="primary" @click="onFilter('netList', 'searchPortRes', 'portQuery', { keyword: 'showName' })">查询</el-button>
      </div>
      <div class="table-wrapper">
        <el-table
          v-loading="loading"
          element-loading-spinner="el-icon-loading"
          :data="searchPortRes"
          style="width: 100%"
        >
          <el-table-column
            prop="showName"
            label="端口名称"
            width="350"
          />
          <el-table-column
            v-if="isShowTab"
            label="连接状态"
          >
            <template slot="header" slot-scope="scope">
              {{ scope.column.label }}
              <span class="caret-wrapper">
                <i class="sort-caret ascending" @click="handlerSort('ifOperStatus', true)" />
                <i class="sort-caret descending" @click="handlerSort('ifOperStatus', false)" />
              </span>
            </template>
            <template slot-scope="item">
              <div :class="setOperStatus(item.row.ifOperStatus) ? 'success' : 'danger'">
                <i :class="setOperStatus(item.row.ifOperStatus) ? 'el-icon-success' : 'el-icon-error'" />
                {{ setOperStatus(item.row.ifOperStatus) ? 'Up' : 'Down' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="发送速率"
          >
            <template slot="header" slot-scope="scope">
              {{ scope.column.label }}
              <span class="caret-wrapper">
                <i class="sort-caret ascending" @click="handlerSort('ifHCOutOctetsPersecond', true)" />
                <i class="sort-caret descending" @click="handlerSort('ifHCOutOctetsPersecond', false)" />
              </span>
            </template>
            <template slot-scope="item">
              {{ setDataUnit(item.row.ifHCOutOctetsPersecond, item.row.ifHCOutOctetsPersecondUnits) }}
            </template>
          </el-table-column>
          <el-table-column
            label="接收速率"
          >
            <template slot="header" slot-scope="scope">
              {{ scope.column.label }}
              <span class="caret-wrapper">
                <i class="sort-caret ascending" @click="handlerSort('ifHCInOctetsPersecond', true)" />
                <i class="sort-caret descending" @click="handlerSort('ifHCInOctetsPersecond', false)" />
              </span>
            </template>
            <template slot-scope="item">
              {{ setDataUnit(item.row.ifHCInOctetsPersecond, item.row.ifHCInOctetsPersecondUnits) }}
            </template>
          </el-table-column>
          <el-table-column
            label="每秒发送丢包数"
          >
            <template slot="header" slot-scope="scope">
              {{ scope.column.label }}
              <span class="caret-wrapper">
                <i class="sort-caret ascending" @click="handlerSort('ifOutDiscards', true)" />
                <i class="sort-caret descending" @click="handlerSort('ifOutDiscards', false)" />
              </span>
            </template>
            <template slot-scope="item">
              {{ item.row.ifOutDiscards ? item.row.ifOutDiscards : '0' }}
            </template>
          </el-table-column>
          <el-table-column
            label="每秒接收丢包数"
          >
            <template slot="header" slot-scope="scope">
              {{ scope.column.label }}
              <span class="caret-wrapper">
                <i class="sort-caret ascending" @click="handlerSort('ifInDiscards', true)" />
                <i class="sort-caret descending" @click="handlerSort('ifInDiscards', false)" />
              </span>
            </template>
            <template slot-scope="item">
              {{ item.row.ifInDiscards ? item.row.ifInDiscards : '0' }}
            </template>
          </el-table-column>
          <el-table-column
            label="图形"
            align="center"
          >
            <template slot-scope="item">
              <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openMonitorNetListEchart(item.row)">
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="portQuery.total" :auto-scroll="false" :total="portQuery.total" :page.sync="portQuery.page" :limit.sync="portQuery.limit" @pagination="handlerPagination('netList', 'searchPortRes', 'portQuery', { keyword: 'showName' })" />
      </div>
    </div>
    <!-- 端口图表 -->
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :show-dialog="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :custom-configuration="customConfiguration"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
    <!-- 光模块列表 -->
    <el-dialog title="光模块" :visible.sync="showOpticalModule" width="90%" top="5vh">
      <div class="filter-container">
        <el-input v-model="opticalModuleQuery.keyword" class="filter-item" clearable placeholder="请输入光模块名称" style="width: 200px;" @clear="inSearch = false" />
        <el-button class="filter-item" icon="el-icon-search" type="primary" @click="onFilter('opticalModuleList', 'searchOpticalModuleListRes', 'opticalModuleQuery', { keyword: 'itemName' })">查询</el-button>
      </div>
      <div class="table-wrapper">
        <el-table
          :data="searchOpticalModuleListRes"
          style="width: 100%"
        >
          <el-table-column
            prop="itemName"
            label="光模块名称"
            width="220"
            show-overflow-tooltip
          />
          <el-table-column
            label="光模块传输距离"
            show-overflow-tooltip
            width="120"
          >
            <template slot-scope="item">
              <span class="primary">{{ isOpticalModuleNullValue('getValue', item.row.transmissionDistanceItemValue) }}</span>
              <span v-if="!isOpticalModuleNullValue('getTF', item.row.transmissionDistanceItemValue)">{{ item.row.transmissionDistanceUnits }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="光模块发送光功率"
            show-overflow-tooltip
          >
            <template slot-scope="item">
              <span :class="thresholdThreshold(isOpticalModuleNullValue('getValue', item.row.luminousPowerUpItemValue), isOpticalModuleNullValue('getValue', item.row.luminousPowerDownItemValue), isOpticalModuleNullValue('getValue', item.row.transmittedOpticalPowerItemValue))">{{ isOpticalModuleNullValue('getValue', item.row.transmittedOpticalPowerItemValue) }}</span>
              <span v-if="!isOpticalModuleNullValue('getTF', item.row.transmittedOpticalPowerItemValue)">{{ item.row.transmittedOpticalPowerUnits }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="发光功率正常范围"
            show-overflow-tooltip
          >
            <template slot-scope="item">
              <span class="primary">{{ isOpticalModuleNullValue('getValue', item.row.luminousPowerDownItemValue) }}</span><span v-if="!isOpticalModuleNullValue('getTF', item.row.luminousPowerDownItemValue)">{{ item.row.luminousPowerDownUnits }}</span>
              <span> ~ </span>
              <span class="primary">{{ isOpticalModuleNullValue('getValue', item.row.luminousPowerUpItemValue) }}</span><span v-if="!isOpticalModuleNullValue('getTF', item.row.luminousPowerUpItemValue)">{{ item.row.luminousPowerUpUnits }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="光模块收送光功率"
            show-overflow-tooltip
          >
            <template slot-scope="item">
              <span :class="thresholdThreshold(isOpticalModuleNullValue('getValue', item.row.collectLightPowerUpItemValue), isOpticalModuleNullValue('getValue', item.row.collectLightPowerDownItemValue), isOpticalModuleNullValue('getValue', item.row.receivedOpticalPowerItemValue))">{{ isOpticalModuleNullValue('getValue', item.row.receivedOpticalPowerItemValue) }}</span>
              <span v-if="!isOpticalModuleNullValue('getTF', item.row.receivedOpticalPowerItemValue)">{{ item.row.receivedOpticalPowerUnits }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="收光功率正常范围"
            show-overflow-tooltip
          >
            <template slot-scope="item">
              <span class="primary">{{ isOpticalModuleNullValue('getValue', item.row.collectLightPowerDownItemValue) }}</span><span v-if="!isOpticalModuleNullValue('getTF', item.row.collectLightPowerDownItemValue)">{{ item.row.collectLightPowerDownUnits }}</span>
              <span> ~ </span>
              <span class="primary">{{ isOpticalModuleNullValue('getValue', item.row.collectLightPowerUpItemValue) }}</span><span v-if="!isOpticalModuleNullValue('getTF', item.row.collectLightPowerUpItemValue)">{{ item.row.collectLightPowerUpUnits }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="光模块波长"
            show-overflow-tooltip
          >
            <template slot-scope="item">
              <span class="primary">{{ isOpticalModuleNullValue('getValue', item.row.wavelengthItemValue) }}</span><span v-if="!isOpticalModuleNullValue('getTF', item.row.wavelengthItemValue)" class="primary">{{ item.row.wavelengthUnits }}</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="opticalModuleQuery.total" :auto-scroll="false" :total="opticalModuleQuery.total" :page.sync="opticalModuleQuery.page" :limit.sync="opticalModuleQuery.limit" @pagination="handlerPagination('opticalModuleList', 'searchOpticalModuleListRes', 'opticalModuleQuery', { keyword: 'itemName' })" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import UsedDetailDialog from './used-detail-dialog'
import { conversionData, conversionSymbols, isJSONString } from '@/utils/utils'
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
    portData: {
      type: Object,
      default() {
        return {}
      }
    },
    isShowTab: {
      type: Boolean,
      default: true
    },
    isShowOpticalModule: {
      type: Boolean,
      default: false
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
      hostId: 0,
      sbId: 0,
      netList: [],
      netTypeTab: [
        { key: 'physical', value: '物理端口' },
        { key: 'vlan', value: '逻辑端口' }
      ],
      netTypeTabKey: 'physical',
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      loading: true,
      // 板卡列表字段
      // name 板卡列表标题
      // key 列表key值
      // zbxOSPortKey 更新zabbix后操作系统板卡端口有一些字眼变了，通过这个字眼去匹对
      itemKeyValues: [
        { name: '端口启用管理状态', key: 'ifAdminStatus', zbxOSPortKey: 'Operational status' },
        { name: '端口物理连接状态', key: 'ifOperStatus', zbxOSPortKey: 'Operational status' },
        { name: '端口每秒发送速率', key: 'ifHCOutOctetsPersecond', zbxOSPortKey: 'Bits sent' },
        { name: '端口每秒接收速率', key: 'ifHCInOctetsPersecond', zbxOSPortKey: 'Bits received' },
        { name: '端口每秒发送丢包数', key: 'ifOutDiscards', zbxOSPortKey: 'Outbound packets discarded' },
        { name: '端口每秒接收丢包数', key: 'ifInDiscards', zbxOSPortKey: 'Inbound packets discarded' }
      ],
      // 光模块列表
      opticalModuleList: [],
      // 是否显示光模块列表
      showOpticalModule: false,
      // 光模块无效值 这两个值都是光模块的无效值 列表调用计算属性 匹配为无效值就显示为无效值
      opticalModuleNullValueKeys: [2.147483647E7, 2147483647],
      watchItemSwitch: true,
      watchItemKey: 'port',
      watchItemShow: null,
      componentGuid: '',
      valueMap: [],
      netListSortOptions: {
        attr: '', rev: ''
      },
      inSearch: false,
      portQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      searchPortRes: [],
      opticalModuleQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      searchOpticalModuleListRes: [],
      customConfiguration: {
        yAxisLabelUnit: 'MBps'
      }
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
    // 是否是无效值
    isOpticalModuleNullValue() {
      return function(type, value) {
        if (this.opticalModuleNullValueKeys.indexOf(Number(value)) !== -1) {
          return type === 'getValue' ? '无效值' : true
        } else {
          return type === 'getValue' ? value : false
        }
      }
    },
    // 超出阀值
    thresholdThreshold() {
      return function(max, min, val) {
        if (val === '无效值') {
          return val
        } else {
          const maxNum = Number(max)
          const minNum = Number(min)
          const valNum = Number(val)
          if ((!valNum < minNum) || (valNum > maxNum)) {
            return 'danger'
          } else {
            return 'primary'
          }
        }
      }
    },
    isConfig() {
      return this.$route.query.isConfig
    },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    },
    setOperStatus() {
      return function(value) {
        const idx = this.valueMap.findIndex(item => item.value === String(value))
        // console.log(value, idx)
        // if (idx !== -1) {
        //   console.log(this.valueMap[idx].newvalue)
        // }
        return idx === -1 ? false : !!this.$defineData.valueMapDefine('normal', this.valueMap[idx].newvalue)
      }
    }
  },
  watch: {
    portData: {
      handler() {
        this.setMonitorItemData()
        console.log(this.portData)
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-graph-show')
  },
  mounted() {
    this.componentGuid = this.$tool.guid()
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetValueMap-websocket' && res.detail.data.componentGuid === this.componentGuid) {
        this.valueMap = this.$tool.isJSONString(res.detail.data.ValueMapData) ? JSON.parse(res.detail.data.ValueMapData) : []
      }
    })
  },
  methods: {
    handelSelectKey(key) {
      this.$set(this.netListSortOptions, 'attr', '')
      this.$set(this.netListSortOptions, 'rev', '')
      this.loading = true
      this.netTypeTabKey = key
      this.setMonitorItemData()
    },
    handelPagination() {
      console.log('handelPagination')
    },
    // 打开图表
    openMonitorNetListEchart(row) {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          unit: row.ifHCOutOctetsPersecondUnits,
          itemid: row.ifHCOutOctetsPersecondItemId,
          valueType: row.ifHCOutOctetsPersecondValueType,
          name: '发送',
          color: '#87DEAF',
          echartType: 'value',
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: [],
          isAssignUnit: true,
          assignUnit: 'MB',
          toFixed: 2
        },
        {
          unit: row.ifHCInOctetsPersecondUnits,
          itemid: row.ifHCInOctetsPersecondItemId,
          valueType: row.ifHCInOctetsPersecondValueType,
          name: '接收',
          color: '#3ba9ed',
          echartType: 'value',
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: [],
          isAssignUnit: true,
          assignUnit: 'MB',
          toFixed: 2
        }
      ]
      this.tableParams = [
        {
          label: ['最高发送', '平均发送', '最低发送'],
          value: 0,
          unit: row.ifHCOutOctetsPersecondUnits,
          itemid: row.ifHCOutOctetsPersecondItemId,
          valueType: row.ifHCOutOctetsPersecondValueType,
          isConversion: true,
          conversionUnitType: 'data',
          type: ['max', 'avg', 'min'],
          isAssignUnit: true,
          assignUnit: 'MB',
          fixed: 2
        },
        {
          label: ['最高接收', '平均接收', '最低接收'],
          value: 0,
          unit: row.ifHCInOctetsPersecondUnits,
          itemid: row.ifHCInOctetsPersecondItemId,
          valueType: row.ifHCInOctetsPersecondValueType,
          isConversion: true,
          conversionUnitType: 'data',
          type: ['max', 'avg', 'min'],
          isAssignUnit: true,
          assignUnit: 'MB',
          fixed: 2
        }
      ]
    },
    // 关闭图表
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    // 匹配端口的监控项数据
    setMonitorItemData() {
      this.netList = []
      const portType = this.netTypeTabKey === 'physical' ? '' : 'vlan' // 端口名称带vlan的是逻辑端口
      this.itemKeyValues.forEach(item => {
        const itemPortData = this.portData[`${item.name}${portType}`]
        // 当前监控项的端口值已经找到了 当前监控项的数据不用查找了
        let inNotGet = false
        console.log(item.name, item.key, 'itemPortData', itemPortData)
        if (itemPortData !== '' && itemPortData && itemPortData.length > 0) {
          itemPortData.forEach(listItem => {
            if (!listItem.itemName) return

            let dataName = ''
            let itemPortNameIdx = 0
            // 操作系统端口值已经找到
            let isGetInzbxOSPortKey = false
            let showName = listItem.itemName || ''

            // 非操作系统
            if (listItem.itemName.indexOf('(') !== -1 || listItem.itemName.indexOf('（') !== -1) {
              const conversionSymbolsResult = conversionSymbols(listItem.itemName)
              dataName = conversionSymbolsResult ? conversionSymbolsResult.split('(')[0] : ''
              itemPortNameIdx = this.netList.findIndex(nitem => nitem.name === dataName)
            } else if (listItem.itemName.indexOf('网卡') !== -1) {
              const splitName = listItem.itemName.split('网卡')
              dataName = conversionSymbols(splitName[0])
              itemPortNameIdx = this.netList.findIndex(nitem => nitem.name === dataName)
            } else if (listItem.itemName.indexOf('network traffic on') !== -1) {
              const splitName = listItem.itemName.split('network traffic on')
              dataName = conversionSymbols(splitName[splitName.length - 1])
              itemPortNameIdx = this.netList.findIndex(nitem => nitem.name === dataName)
            }

            // 操作系统
            if (listItem.itemName.indexOf(item.zbxOSPortKey) !== -1 && Number(this.devTypeId) === 484) {
              const splitName = listItem.itemName.split(':')
              dataName = splitName[0]
              itemPortNameIdx = this.netList.findIndex(nitem => nitem.name === dataName)
              isGetInzbxOSPortKey = true
            }

            if (showName.indexOf('(') !== -1) {
              showName = listItem.itemName.split('(')[0]
            } else if (showName.indexOf('（') !== -1) {
              showName = listItem.itemName.split('（')[0]
            }
            console.log('dataName', dataName)

            if (itemPortNameIdx !== -1) {
              if (inNotGet) return

              if (!this.netList[itemPortNameIdx]) return
              this.$set(this.netList[itemPortNameIdx], `${item.key}`, Number(listItem.itemValue))
              this.$set(this.netList[itemPortNameIdx], `${item.key}Units`, listItem.units)
              this.$set(this.netList[itemPortNameIdx], `${item.key}ValueType`, listItem.valueType)
              this.$set(this.netList[itemPortNameIdx], `${item.key}ItemId`, listItem.itemid)

              // if (this.netList[itemPortNameIdx][`${item.key}`]) this.$set(this.netList[itemPortNameIdx], `${item.key}`, Number(listItem.itemValue))
              // if (this.netList[itemPortNameIdx][`${item.key}Units`]) this.$set(this.netList[itemPortNameIdx], `${item.key}Units`, listItem.units)
              // if (this.netList[itemPortNameIdx][`${item.key}ValueType`]) this.$set(this.netList[itemPortNameIdx], `${item.key}ValueType`, listItem.valueType)
              // if (this.netList[itemPortNameIdx][`${item.key}ItemId`]) this.$set(this.netList[itemPortNameIdx], `${item.key}ItemId`, listItem.itemid)

              inNotGet = isGetInzbxOSPortKey
            } else {
              if (inNotGet) return
              const data = {}
              data.name = dataName
              data.showName = showName
              data[`${item.key}`] = Number(listItem.itemValue)
              data[`${item.key}Units`] = listItem.units
              data[`${item.key}ValueType`] = listItem.valueType
              data[`${item.key}ItemId`] = listItem.itemid
              // 逻辑端口
              if (this.netTypeTabKey === 'physical') {
                if (dataName.indexOf('Vlan') === -1) {
                  this.$set(this.netList, this.netList.length, data)
                }
              }
              // 虚拟端口
              if (this.netTypeTabKey === 'vlan') {
                this.$set(this.netList, this.netList.length, data)
              }
              inNotGet = isGetInzbxOSPortKey
            }
          })
        }
      })

      this.handlerQueryPortList('netList', 'searchPortRes', 'portQuery', { keyword: 'showName' })

      this.loading = false
      const idx = this.netList.findIndex(item => item.ifOperStatus !== undefined && item.ifOperStatus !== '')
      if (idx !== -1) {
        this.agentGetValueMap(this.netList[idx].ifOperStatusItemId)
      }
    },
    openOpticalModule() {
      this.showOpticalModule = true
      request({ url: api.itMonitor.agentGetHostData, data: { agent: this.agent, hostid: this.zbxHostId, method: 'getItemPortOpticalModuleData' }}).then(res => {
        if (res.code === 1 && res.model) {
          const getModelData = isJSONString(res.model) ? JSON.parse(res.model) : []
          const list = []
          getModelData.forEach(item => {
            if (item.itemName.indexOf('光模块传输距离') !== -1) {
              const itemName = item.itemName.split('（')[0]
              const getItem = this.$tool.findDataItemByAttr(list, 'itemName', itemName)
              const idx = getItem ? getItem.index : list.length
              if (!list[idx]) list[idx] = { itemName }
              list[idx]['transmissionDistanceItemValue'] = item.itemValue
              list[idx]['transmissionDistanceValueType'] = item.valueType
              list[idx]['transmissionDistanceUnits'] = item.units
            }
            if (item.itemName.indexOf('光模块发送光功率') !== -1) {
              const itemName = item.itemName.split('（')[0]
              const getItem = this.$tool.findDataItemByAttr(list, 'itemName', itemName)
              const idx = getItem ? getItem.index : list.length
              if (!list[idx]) list[idx] = { itemName }
              list[idx]['transmittedOpticalPowerItemValue'] = item.itemValue
              list[idx]['transmittedOpticalPowerValueType'] = item.valueType
              list[idx]['transmittedOpticalPowerUnits'] = item.units
            }
            if (item.itemName.indexOf('光模块收送光功率') !== -1) {
              const itemName = item.itemName.split('（')[0]
              const getItem = this.$tool.findDataItemByAttr(list, 'itemName', itemName)
              const idx = getItem ? getItem.index : list.length
              if (!list[idx]) list[idx] = { itemName }
              list[idx]['receivedOpticalPowerItemValue'] = item.itemValue
              list[idx]['receivedOpticalPowerValueType'] = item.valueType
              list[idx]['receivedOpticalPowerUnits'] = item.units
            }
            if (item.itemName.indexOf('光模块波长') !== -1) {
              const itemName = item.itemName.split('（')[0]
              const getItem = this.$tool.findDataItemByAttr(list, 'itemName', itemName)
              const idx = getItem ? getItem.index : list.length
              if (!list[idx]) list[idx] = { itemName }
              list[idx]['wavelengthItemValue'] = item.itemValue
              list[idx]['wavelengthValueType'] = item.valueType
              list[idx]['wavelengthUnits'] = item.units
            }
            if (item.itemName.indexOf('发光功率上限阈值') !== -1) {
              const itemName = item.itemName.split('（')[0]
              const getItem = this.$tool.findDataItemByAttr(list, 'itemName', itemName)
              const idx = getItem ? getItem.index : list.length
              if (!list[idx]) list[idx] = { itemName }
              list[idx]['luminousPowerUpItemValue'] = item.itemValue
              list[idx]['luminousPowerUpValueType'] = item.valueType
              list[idx]['luminousPowerUpUnits'] = item.units
            }
            if (item.itemName.indexOf('发光功率下限阈值') !== -1) {
              const itemName = item.itemName.split('（')[0]
              const getItem = this.$tool.findDataItemByAttr(list, 'itemName', itemName)
              const idx = getItem ? getItem.index : list.length
              if (!list[idx]) list[idx] = { itemName }
              list[idx]['luminousPowerDownItemValue'] = item.itemValue
              list[idx]['luminousPowerDownValueType'] = item.valueType
              list[idx]['luminousPowerDownUnits'] = item.units
            }
            if (item.itemName.indexOf('收光功率上限阈值') !== -1) {
              const itemName = item.itemName.split('（')[0]
              const getItem = this.$tool.findDataItemByAttr(list, 'itemName', itemName)
              const idx = getItem ? getItem.index : list.length
              if (!list[idx]) list[idx] = { itemName }
              list[idx]['collectLightPowerUpItemValue'] = item.itemValue
              list[idx]['collectLightPowerUpValueType'] = item.valueType
              list[idx]['collectLightPowerUpUnits'] = item.units
            }
            if (item.itemName.indexOf('收光功率下限阈值') !== -1) {
              const itemName = item.itemName.split('（')[0]
              const getItem = this.$tool.findDataItemByAttr(list, 'itemName', itemName)
              const idx = getItem ? getItem.index : list.length
              if (!list[idx]) list[idx] = { itemName }
              list[idx]['collectLightPowerDownItemValue'] = item.itemValue
              list[idx]['collectLightPowerDownValueType'] = item.valueType
              list[idx]['collectLightPowerDownUnits'] = item.units
            }
          })
          this.opticalModuleList = list
          this.handlerQueryPortList('opticalModuleList', 'searchOpticalModuleListRes', 'opticalModuleQuery', { keyword: 'itemName' })
        }
      })
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '板卡端口',
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
    // 获取状态值对应关系
    agentGetValueMap(itemid) {
      if (this.itMonitorRequireAgreement !== 'WS') {
        request({ url: api.itMonitor.agentGetValueMap, data: { agent: this.agent, itemid }}).then(res => {
          if (res.code === 1 && res.model) {
            this.valueMap = this.$tool.isJSONString(res.model) ? JSON.parse(res.model) : []
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
            componentGuid: this.componentGuid,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        })
      }
    },
    handlerSort(attr, rev) {
      this.$set(this.netListSortOptions, 'attr', attr)
      this.$set(this.netListSortOptions, 'rev', rev)
      this.searchPortRes.sort(this.$tool.sortJsonData([`${this.netListSortOptions.attr}`], !this.netListSortOptions.rev))
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
      this[`${target}`].sort(this.$tool.sortJsonData([`${this.netListSortOptions.attr}`], !this.netListSortOptions.rev))
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
