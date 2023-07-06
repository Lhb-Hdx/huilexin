<template>
  <el-drawer
    title="监控详情"
    :visible.sync="showDrawer"
    :before-close="closeZbxItemsDetail"
    size="40%"
  >
    <div class="drawer-content">
      <div class="header-tools">
        <div class="filter-container">
          <el-select v-model="timeTypeValue" class="filter-item" style="width: 200px">
            <el-option v-for="item in timeType" :key="item.t" :label="item.name" :value="item.t" />
          </el-select>
          <el-button class="filter-item" type="primary" icon="el-icon-search" :loading="changeTimeTypeLoading" @click="changeTimeTypeValue">查询</el-button>
        </div>
        <el-button class="filter-item" type="default" @click="reloadData">刷新</el-button>
      </div>
      <UsedStatisticsContainer echart-el="detailChart" :echart-data="echartParams" :table-data="tableData" :realtime="true" :show-new-data-tag="true" />
    </div>
  </el-drawer>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { avg, callbackTime, formatSTime } from '@/utils/utils'
import UsedStatisticsContainer from '../../monitoringData/component/used-statistics-container'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

export default {
  name: 'MonitoringItemDrawer',
  components: {
    UsedStatisticsContainer
  },
  props: {
    itemDetail: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      showDrawer: true,
      commonQuery: {
        agent: '',
        hostid: '',
        itemid: '',
        valueType: ''
      },
      timeType: [
        {
          name: '实时',
          t: 0
        },
        {
          name: '近一小时',
          t: 1
        },
        {
          name: '近半天',
          t: 12
        },
        {
          name: '近一天',
          t: 24
        }
      ],
      timeTypeValue: 0,
      agentGetRealTimeDataQuery: {
        agent: '',
        hostid: '',
        itemid: '',
        valueType: ''
      },
      agentGetTrendDataQuery: {
        agent: '',
        hostid: '',
        itemid: '',
        valueType: '',
        startClock: '',
        endClock: ''
      },
      pointTable: [
        { label: '近一小时', t: 1, max: '', min: '', average: '' },
        { label: '近半天', t: 12, max: '', min: '', average: '' },
        { label: '近一天', t: 24, max: '', min: '', average: '' }
      ],
      agentGetRealTimeDataTimeLabel: [],
      agentGetRealTimeDataTimeData: [],
      agentGetRealTimeInterVal: null,
      agentGetHistoryDataQuery: {
        agent: '',
        hostid: '',
        itemid: '',
        valueType: '',
        startClock: '',
        endClock: ''
      },
      changeTimeTypeLoading: false,
      zbxItemsUnits: '',
      RealTimeDataUnits: '',
      getItemNewDataInterval: null,
      getItemNewDataQuery: { // 获取实时统计图参数
        agent: '',
        hostid: '',
        itemid: '',
        valueType: ''
      },
      isStatusValueKey: [ // 数据是状态值的监控项key
        'ifAdminStatus',
        'ifOperStatus',
        'FAN',
        'PowerStatus'
      ],
      echartParams: [],
      tableData: [
        {
          col: [
            { label: '', value: '近一小时', unit: '', t: 1, notToFixed: true },
            { label: '最大值', value: 0, unit: '', type: 'max', fixed: 2 },
            { label: '最小值', value: 0, unit: '', type: 'min', fixed: 2 },
            { label: '平均值', value: 0, unit: '', type: 'avg', fixed: 2 }
          ]
        },
        {
          col: [
            { label: '', value: '近半天', unit: '', t: 12, notToFixed: true },
            { label: '最大值', value: 0, unit: '', type: 'max', fixed: 2 },
            { label: '最小值', value: 0, unit: '', type: 'min', fixed: 2 },
            { label: '平均值', value: 0, unit: '', type: 'avg', fixed: 2 }
          ]
        },
        {
          col: [
            { label: '', value: '近一天', unit: '', t: 24, notToFixed: true },
            { label: '最大值', value: 0, unit: '', type: 'max', fixed: 2 },
            { label: '最小值', value: 0, unit: '', type: 'min', fixed: 2 },
            { label: '平均值', value: 0, unit: '', type: 'avg', fixed: 2 }
          ]
        }
      ],
      agentGetRealTimeDataInterval: null,
      componentGuid: '',
      dataUnits: [
        'B', 'KB', 'MB', 'GB', 'TB', 'PB'
      ]
    }
  },
  computed: {
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  destroyed() {
    clearInterval(this.agentGetRealTimeDataInterval)
  },
  mounted() {
    this.componentGuid = this.$tool.guid()
    // 设置查询参数
    this.commonQuery = {
      agent: this.itemDetail.agent ? this.itemDetail.agent : this.$route.query.agent,
      hostid: '',
      itemid: this.itemDetail.itemid,
      valueType: this.itemDetail.valueType
    }
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetRealTimeData-websocket' && res.detail.data.componentGuid === this.componentGuid) {
        this.watchAgentGetRealTimeData(res.detail.data.data)
      }
    })
    this.initStatistics()
  },
  methods: {
    // 选择时间类型查询
    changeTimeTypeValue() {
      this.initStatistics()
    },
    // 刷新
    reloadData() {
      this.initStatistics()
    },
    // 关闭抽屉
    closeZbxItemsDetail() {
      this.showDrawer = false
      this.$emit('closeDrawer', false)
    },
    // 清空统计图数据
    async clearData() {
      this.$set(this.echartParams[0], 'data', [])
      this.$set(this.echartParams[0], 'units', [])
      this.$set(this.echartParams[0], 'time', [])
    },
    // 初始化统计
    initStatistics() {
      this.agentGetTrendData()
      if (this.timeTypeValue === 0) {
        this.agentGetRealTimeDataInterval = setInterval(() => {
          this.agentGetRealTimeData()
        }, 2000)
      } else {
        this.agentGetHistoryData()
      }
    },
    // 实时查询
    agentGetRealTimeData() {
      if (this.itMonitorRequireAgreement !== 'WS') {
        request({
          url: api.itMonitor.agentGetRealTimeData,
          data: { ...this.commonQuery }
        }).then(res => {
          if (res.code === 1 && res.model) {
            this.watchAgentGetRealTimeData(res.model)
          }
        })
      } else {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        if (!wsToken) return
        const getUserSessionResult = getUserSession()
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetRealTimeData,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: this.commonQuery.agent,
            itemid: this.commonQuery.itemid,
            valueType: this.commonQuery.valueType,
            componentGuid: this.componentGuid,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        })
      }
    },
    // 监听实时查询
    watchAgentGetRealTimeData(resData) {
      const data = this.itMonitorRequireAgreement === 'WS' ? resData[0] : JSON.parse(resData)[0]
      if (data) {
        const activeValue = this.itMonitorRequireAgreement === 'WS' ? data.itemValue : data.value
        const transformItemData = this.transformItemData(this.itemDetail, activeValue)
        const clockDate = new Date()
        const time = `${clockDate.getFullYear()}-${clockDate.getMonth() + 1}-${clockDate.getDate()} ${clockDate.getHours()}:${clockDate.getMinutes()}:${clockDate.getSeconds()}`
        if (this.echartParams.length === 0) {
          this.echartParams = [
            {
              color: '#87DEAF',
              name: '',
              data: [Number(transformItemData.transformValue).toFixed(2)],
              units: [transformItemData.transformUnit],
              time: [time],
              toFixed: 2
            }
          ]
        } else {
          this.$set(this.echartParams[0].data, this.echartParams[0].data.length, Number(transformItemData.transformValue).toFixed(2))
          this.$set(this.echartParams[0].units, this.echartParams[0].units.length, transformItemData.transformUnit)
          this.$set(this.echartParams[0].time, this.echartParams[0].time.length, time)
        }
      }
    },
    // 查询历史表格
    agentGetTrendData() {
      this.tableData.forEach((item, index) => {
        request({
          url: api.itMonitor.agentGetTrendData,
          data: {
            ...this.commonQuery,
            startClock: parseInt(callbackTime(item.col[0].t).valueOf() / 1000),
            endClock: parseInt(new Date().valueOf() / 1000)
          }
        }).then(res => {
          if (res.model) {
            const data = JSON.parse(res.model)
            const maxIndex = this.tableData[index].col.findIndex(items => items.type === 'max')
            const minIndex = this.tableData[index].col.findIndex(items => items.type === 'min')
            const avgIndex = this.tableData[index].col.findIndex(items => items.type === 'avg')
            const minArrs = []
            const maxArrs = []
            const avgArrs = []
            data[`itemData${this.commonQuery.itemid}`].forEach(items => {
              minArrs.push(items.valueMin)
              maxArrs.push(items.valueMax)
              avgArrs.push(items.valueAvg)
            })
            this.$nextTick(() => {
              maxArrs.sort(function(a, b) {
                return a - b
              })
              minArrs.sort(function(a, b) {
                return a - b
              })
              this.$set(this.tableData[index].col[maxIndex], 'value', this.transformItemData(this.itemDetail, maxArrs[maxArrs.length - 1]).transformValue.toFixed(2))
              this.$set(this.tableData[index].col[minIndex], 'value', this.transformItemData(this.itemDetail, minArrs[0]).transformValue.toFixed(2))
              this.$set(this.tableData[index].col[avgIndex], 'value', this.transformItemData(this.itemDetail, avg(avgArrs)).transformValue.toFixed(2))
              this.$set(this.tableData[index].col[maxIndex], 'unit', this.transformItemData(this.itemDetail, maxArrs[maxArrs.length - 1]).transformUnit)
              this.$set(this.tableData[index].col[minIndex], 'unit', this.transformItemData(this.itemDetail, minArrs[0]).transformUnit)
              this.$set(this.tableData[index].col[avgIndex], 'unit', this.transformItemData(this.itemDetail, avg(avgArrs)).transformUnit)
            })
          }
        })
      })
    },
    // 查询历史统计
    agentGetHistoryData() {
      const request_api = this.timeTypeValue > 3 ? api.itMonitor.agentGetTrendData : api.itMonitor.agentGetHistoryData
      request({
        url: request_api,
        data: {
          ...this.commonQuery,
          startClock: parseInt(callbackTime(this.timeTypeValue).valueOf() / 1000),
          endClock: parseInt(new Date().valueOf() / 1000)
        }
      }).then(res => {
        if (res.model) {
          clearInterval(this.agentGetRealTimeDataInterval)
          this.clearData().then(() => {
            const model = JSON.parse(res.model)
            model[`itemData${this.commonQuery.itemid}`].forEach(item => {
              const activeValue = this.timeTypeValue > 3 ? item.valueMax : item.value
              const transformItemData = this.transformItemData(this.itemDetail, activeValue)
              this.$set(this.echartParams[0].data, this.echartParams[0].data.length, transformItemData.transformValue)
              this.$set(this.echartParams[0].units, this.echartParams[0].units.length, transformItemData.transformUnit)
              this.$set(this.echartParams[0].time, this.echartParams[0].time.length, `${formatSTime(item.clock * 1000)}`)
            })
          })
        }
      })
    },
    // 转换监控项数据单位
    transformItemData(itemDetail, value) {
      console.log(itemDetail, value)
      let transformValue = Number(value)
      let transformUnit = itemDetail.units
      // 根据单位转换
      if (itemDetail.units === '' || itemDetail.units.indexOf('%') !== -1) {
        transformValue = value
      } else if (itemDetail.units.indexOf('ps') !== -1) {
        const conversionDataResult = this.$tool.sizeUnitsTransform(itemDetail.units, 'MB', transformValue)
        transformValue = Number(conversionDataResult.size)
        transformUnit = 'MBPS'
      } else if (itemDetail.units.indexOf('/s') !== -1) {
        const conversionDataResult = this.$tool.sizeUnitsTransform(itemDetail.units, 'MB', transformValue)
        transformValue = Number(conversionDataResult.size)
        transformUnit = 'MB/s'
      } else if (this.dataUnits.indexOf(itemDetail.units.toUpperCase()) !== -1) {
        const conversionDataResult = this.$tool.sizeUnitsTransform(itemDetail.units, 'MB', transformValue)
        transformValue = Number(conversionDataResult.size)
        transformUnit = 'MB'
      } else if (itemDetail.units.indexOf('uptime') !== -1 || itemDetail.units.indexOf('unixtime') !== -1) {
        transformValue = value / 60 / 60 / 24
        transformUnit = '天'
      } else if (itemDetail.units.indexOf('sectors') !== -1) { // 扇区

      }
      // 根据key值去转换
      if (itemDetail.key) {
        if (itemDetail.key.indexOf('vfs.fs.size') !== -1) {
          const conversionDataResult = this.$tool.sizeUnitsTransform(itemDetail.units, 'MB', transformValue)
          transformValue = Number(conversionDataResult.size)
          transformUnit = 'MB'
        }
        this.isStatusValueKey.forEach(item => {
          if (itemDetail.key.indexOf(item) !== -1) {
            transformValue = transformValue === 1 ? '正常' : '断开'
          }
        })
      }

      return {
        transformValue,
        transformUnit
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header-tools {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  .filter-item {
    margin-bottom: 0 !important;
  }
}
.echarts-boxs {
  margin-bottom: 30px;
}
.point-table {
  .column-value {
    color: #999999;
    font-size: 20px;
  }
}
</style>
