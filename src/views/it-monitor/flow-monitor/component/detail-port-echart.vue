<template>
  <div class="detail-port-echart">
    <div class="port-echart-header">
      <div class="echart-header-name margin-bottom-7-5 overflow-text-a">
        <template v-if="port.isSummary">设备流量汇总</template>
        <template v-else>{{ port.showName }} [{{ port.portDescribe }}]</template>
      </div>
      <div v-if="!port.isSummary" class="echart-header-status margin-bottom-7-5">
        <div v-if="portConnectionStatue === 1" class="host-status success"><i class="el-icon-success" /> 正常</div>
        <div v-else class="host-status danger"><i class="el-icon-warning" /> 未连接</div>
      </div>
    </div>
    <div class="port-echart-tool">
      <div class="tool-tag pointer">{{ chartType === 'flow' ? '流量' : '丢包' }}</div>
    </div>
    <div class="port-echart-main">
      <el-tabs v-model="chartType" @tab-click="handleDetailTabNameClick">
        <el-tab-pane label="流量" name="flow" />
        <el-tab-pane label="丢包" name="loss" />
      </el-tabs>
      <div class="header-tools">
        <div class="filter-container">
          <el-select v-model="timeTypeValue" size="mini" class="filter-item" style="width: 200px" @change="changeTimeTypeValue">
            <el-option v-for="item in timeType" :key="item.t" :label="item.name" :value="item.t" />
          </el-select>
        </div>
      </div>
      <UsedStatisticsContainer echart-el="detailChart" :echart-data="echartData" :table-data="tableData" :realtime="true" :show-new-data-tag="true" :custom-configuration="customConfiguration" />
    </div>
  </div>
</template>

<script>
import UsedStatisticsContainer from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/component/used-statistics-container'
import request from '@/utils/request'
import api from '@/api/api'
import {avg, callbackTime, formatSTime} from '@/utils/utils'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

export default {
  name: 'DetailPortEchart',
  components: {
    UsedStatisticsContainer
  },
  data() {
    return {
      portConnectionStatue: 0, // 端口连接状态
      port: {}, // 当前端口
      echartData: [], // echarts趋势图数据
      tableParams: [], // 表格参数
      tableData: [{ col: [] }], // 表格数据
      chartType: 'flow', // flow loss
      activePortData: null, // 当前端口数据
      timeType: [ // 时间类型
        {
          name: '实时',
          t: 0
        },
        {
          name: '近二十四小时',
          t: 24
        },
        {
          name: '最近三天',
          t: 72
        },
        {
          name: '最近七天',
          t: 168
        }
      ],
      timeTypeValue: 0, // 当前选择的时间类型
      agentGetRealTimeDataInterval: null, // 获取实时数据定时器
      agentGetRealTimeDataQuery: { // 获取实时统计图参数
        agent: '',
        hostid: '',
        itemid: '',
        valueType: ''
      },
      agentGetHistoryDataQuery: { // 获取历史统计图参数
        agent: '',
        hostid: '',
        itemid: '',
        valueType: '',
        startClock: '',
        endClock: ''
      },
      agentGetTrendDataQuery: { // 获取历史统计信息参数
        agent: '',
        hostid: '',
        itemid: '',
        valueType: '',
        startClock: '',
        endClock: ''
      },
      allTrendData: { // 所有的历史数据
        send: [], // 发送数据
        receive: [] // 接收数据
      },
      customConfiguration: {
        yAxisLabelUnit: 'MB/s'
      }
    }
  },
  computed: {
    hostId() {
      return this.$route.query.hostId
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  watch: {
    // 监听趋势图数据
    echartData: {
      handler(newVal) {
        if (newVal[0].time.length === 0) return
        let data = []
        if (this.timeTypeValue === 0) {
          data = {
            send: newVal[0].data[newVal[0].data.length - 1] || 0,
            sendUnits: `${newVal[0].units[newVal[0].units.length - 1] || ''}${newVal[0].unitSuffix || ''}`,
            receive: newVal[1].data[newVal[1].data.length - 1] || 0,
            receiveUnits: `${newVal[1].units[newVal[1].units.length - 1] || ''}${newVal[1].unitSuffix || ''}`,
            time: newVal[0].time[newVal[0].time.length - 1],
            type: 'realTime',
            sendOriginalData: newVal[0].originalData[newVal[0].originalData.length - 1],
            sendOriginalUnits: newVal[0].originalUnits[newVal[0].originalUnits.length - 1],
            receiveOriginalData: newVal[1].originalData[newVal[1].originalData.length - 1],
            receiveOriginalUnits: newVal[1].originalUnits[newVal[1].originalUnits.length - 1],
            sendValueAndUnits: '',
            receiveValueAndUnits: ''
          }
          this.$EventBus.$emit('emit-port-item-data', this.$tool.deepCopy(data))
        }
      },
      deep: true
    }
  },
  destroyed() {
    // 组件卸载清除定时器
    clearInterval(this.agentGetRealTimeDataInterval)
  },
  beforeDestroy() {
    this.batchOffEventBus('select-port-connection-statue,change-port')
  },
  async mounted() {
    // 获取主机
    this.host = await this.getHyitHost()
    // 监听ws请求数据返回
    window.addEventListener('watchWsMessage', (res) => {
      // 设备端口实时数据
      if (res.detail.data.cmd === 'it-agentGetRealTimeData-websocket') {
        this.watchAgentGetRealTimeData(res.detail.data.data, res.detail.data.clock)
      }
      // 设备汇总实时数据
      if (res.detail.data.cmd === 'it-agentGetHostPortTotal-websocket') {
        const data = this.$tool.isJSONString(res.detail.data.HostPortData) ? JSON.parse(res.detail.data.HostPortData)[0] : []
        const send = this.chartType === 'flow' ? data['端口每秒发送速率汇总'] : data['端口每秒发送丢包数汇总']
        const receive = this.chartType === 'flow' ? data['端口每秒接收速率汇总'] : data['端口每秒接收丢包数汇总']
        this.$EventBus.$emit('host-port-total', { send, receive })
        this.watchAgentGetRealTimeData([{...send[0], keyword: 'send'}, {...receive[0], keyword: 'receive'}], res.detail.data.clock)
      }
    })
    // 监听选择的端口连接状态
    this.$EventBus.$on('select-port-connection-statue', (msg) => {
      this.portConnectionStatue = Number(msg)
    })
    // 监听选择端口
    this.$EventBus.$on('change-port', (msg) => {
      if (!msg) return
      clearInterval(this.agentGetRealTimeDataInterval)
      this.port = msg
      this.setQuery()
    })
  },
  methods: {
    // 设置查询参数
    setQuery() {
      if (this.chartType === 'flow') {
        this.echartData = [
          {
            agent: this.port.agent,
            unit: this.port.portSendRateUnits,
            itemid: this.port.portSendRateItemId,
            valueType: this.port.portSendRateValueType,
            name: '发送',
            color: '#87DEAF',
            echartType: 'value',
            unitSuffix: '/S',
            isConversion: true,
            conversionUnitType: 'data',
            data: [],
            originalData: [],
            units: [],
            originalUnits: [],
            time: [],
            toFixed: 2,
            keyword: 'send'
          },
          {
            agent: this.port.agent,
            unit: this.port.portReceiveRateUnits,
            itemid: this.port.portReceiveRateItemId,
            valueType: this.port.portReceiveRateValueType,
            name: '接收',
            color: '#3ba9ed',
            echartType: 'value',
            unitSuffix: '/s',
            isConversion: true,
            conversionUnitType: 'data',
            data: [],
            originalData: [],
            units: [],
            originalUnits: [],
            time: [],
            toFixed: 2,
            keyword: 'receive'
          }
        ]
        this.tableParams = [
          {
            agent: this.port.agent,
            label: ['最高发送', '最低发送', '平均发送'],
            value: 0,
            unit: this.port.portSendRateUnits,
            itemid: this.port.portSendRateItemId,
            valueType: this.port.portSendRateValueType,
            isConversion: true,
            conversionUnitType: 'data',
            type: ['max', 'min', 'avg'],
            keyword: 'send',
            fixed: 2
          },
          {
            agent: this.port.agent,
            label: ['最高接收', '最低接收', '平均接收'],
            value: 0,
            unit: this.port.portReceiveRateUnits,
            itemid: this.port.portReceiveRateItemId,
            valueType: this.port.portReceiveRateValueType,
            isConversion: true,
            conversionUnitType: 'data',
            type: ['max', 'min', 'avg'],
            keyword: 'receive',
            fixed: 2
          }
        ]
      } else {
        this.echartData = [
          {
            agent: this.port.agent,
            unit: this.port.portSendLossUnits,
            itemid: this.port.portSendLossItemId,
            valueType: this.port.portSendLossValueType,
            name: '发送丢包数',
            color: '#87DEAF',
            echartType: 'value',
            unitSuffix: '',
            isConversion: false,
            conversionUnitType: 'data',
            data: [],
            originalData: [],
            units: [],
            originalUnits: [],
            time: [],
            keyword: 'send'
          },
          {
            agent: this.port.agent,
            unit: this.port.portReceiveLossUnits,
            itemid: this.port.portReceiveLossItemId,
            valueType: this.port.portReceiveLossValueType,
            name: '接收丢包数',
            color: '#3ba9ed',
            echartType: 'value',
            unitSuffix: '',
            isConversion: false,
            conversionUnitType: 'data',
            data: [],
            originalData: [],
            units: [],
            originalUnits: [],
            time: [],
            keyword: 'receive'
          }
        ]
        this.tableParams = [
          {
            agent: this.port.agent,
            label: ['最高发送丢包数', '最低发送丢包数', '平均发送丢包数'],
            value: 0,
            unit: this.port.portSendLossUnits,
            itemid: this.port.portSendLossItemId,
            valueType: this.port.portSendLossValueType,
            isConversion: false,
            conversionUnitType: 'data',
            type: ['max', 'min', 'avg'],
            keyword: 'send',
            fixed: 0
          },
          {
            agent: this.port.agent,
            label: ['最高接收丢包数', '最低接收丢包数', '平均接收丢包数'],
            value: 0,
            unit: this.port.portReceiveLossUnits,
            itemid: this.port.portReceiveLossItemId,
            valueType: this.port.portReceiveLossValueType,
            isConversion: false,
            conversionUnitType: 'data',
            type: ['max', 'min', 'avg'],
            keyword: 'receive',
            fixed: 0
          }
        ]
      }
      this.agentGetHistoryDataQuery.agent = this.port.agent
      this.agentGetRealTimeDataQuery.agent = this.port.agent
      this.agentGetTrendDataQuery.agent = this.port.agent
      if (this.chartType === 'flow' && this.port.portReceiveRateItemId && this.port.portSendRateItemId) this.initEchart()
      if (this.chartType === 'loss' && this.port.portSendLossItemId && this.port.portReceiveLossItemId) this.initEchart()
    },
    // 选择时间类型
    changeTimeTypeValue() {
      this.$EventBus.$emit('select-time-type', this.timeTypeValue)
      this.clearData().then(() => this.initEchart())
    },
    // 清空统计图数据
    async clearData(idx) {
      if (idx !== undefined) {
        this.$set(this.echartData[idx], 'data', [])
        this.$set(this.echartData[idx], 'time', [])
        this.$set(this.echartData[idx], 'units', [])
        this.$set(this.echartData[idx], 'originalUnits', [])
        this.$set(this.echartData[idx], 'originalData', [])
      } else {
        for (let i = 0; i < this.echartData.length; i++) {
          this.$set(this.echartData[i], 'data', [])
          this.$set(this.echartData[i], 'time', [])
          this.$set(this.echartData[i], 'units', [])
          this.$set(this.echartData[i], 'originalUnits', [])
          this.$set(this.echartData[i], 'originalData', [])
        }
      }
    },
    // 初始化echart
    initEchart() {
      const that = this
      this.$set(this.tableData[0], 'col', [])
      // this.agentGetTrendData()
      if (this.timeTypeValue === 0) {
        that.echartData.forEach(item => {
          that.agentGetHistoryData({ itemid: item.itemid, valueType: item.valueType })
        })

        this.agentGetRealTimeDataInterval = setInterval(() => {
          const itemid = []
          const valueType = []
          const clock = new Date().getTime()
          that.echartData.forEach(item => {
            itemid.push(item.itemid)
            valueType.push(item.valueType)
          })
          that.agentGetRealTimeData({
            itemid: itemid.toString(),
            valueType: valueType.toString(),
            clock
          }).then(res => {
            if (res.model) {
              const data = this.itMonitorRequireAgreement !== 'WS' ? JSON.parse(res.model) : res.model
              this.watchAgentGetRealTimeData(data, clock)
            }
          })
        }, 5000)
      } else {
        if (this.port.isSummary) {
          that.agentGetHistoryData()
        } else {
          that.echartData.forEach(item => {
            that.agentGetHistoryData({ itemid: item.itemid, valueType: item.valueType })
          })
        }
      }
    },
    // 获取实时统计图
    agentGetRealTimeData(query) {
      return new Promise(resolve => {
        if (this.itMonitorRequireAgreement !== 'WS') {
          this.$set(this.agentGetRealTimeDataQuery, 'itemid', query.itemid)
          this.$set(this.agentGetRealTimeDataQuery, 'valueType', query.valueType)
          request({
            url: api.itMonitor.agentGetRealTimeData,
            data: { ...this.agentGetRealTimeDataQuery }
          }).then(res => {
            if (res.code === 1 && res.model) {
              resolve(res)
            } else {
              resolve(null)
            }
          })
        } else {
          const wsToken = this.sessionStorageOperation('get', 'wsToken')
          if (!wsToken) return
          const getUserSessionResult = getUserSession()
          let queryTmp = {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: this.agentGetRealTimeDataQuery.agent,
            fromAgent: this.localStorageOperation('get', 'fromAgent') || '',
            fromHostId: this.localStorageOperation('get', 'fromHostId') || '',
            clock: query.clock
          }
          let cmd = ''
          if (this.port.isSummary) {
            queryTmp.hostid = this.port.hyZhostId
            cmd = socketCmd.itMonitor.itAgentGetHostPortTotal
          } else {
            queryTmp.itemid = query.itemid
            queryTmp.valueType = query.valueType
            cmd = socketCmd.itMonitor.itAgentGetRealTimeData
          }
          sendWebsocket(socketCmd.host.default, {
            cmd,
            data: queryTmp
          })
        }
      })
    },
    // 获取历史统计
    async agentGetHistoryData(query) {
      let requestApi = ''

      if (this.port.isSummary) {
        requestApi = this.api.flowMonitor.findZbxFlowStatisticsGroupTime
        this.agentGetHistoryDataQuery.zhostid = this.port.hyZhostId
        const startClock = this.timeTypeValue === 0 ? parseInt(new Date(`${this.$tool.getLastMonth(new Date(), 1).ymd} 00:00:00`).valueOf() / 1000) : parseInt(callbackTime(this.timeTypeValue).valueOf() / 1000)
        this.agentGetHistoryDataQuery.stime = this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(startClock * 1000))
        this.agentGetHistoryDataQuery.etime = this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date())
        this.agentGetHistoryDataQuery.limit = -1
      } else {
        requestApi = this.timeTypeValue > 3 ? this.api.itMonitor.agentGetTrendData : this.api.itMonitor.agentGetHistoryData
        this.agentGetHistoryDataQuery.itemid = query.itemid
        this.agentGetHistoryDataQuery.valueType = query.valueType
        this.agentGetHistoryDataQuery.startClock = this.timeTypeValue === 0 ? parseInt(new Date(`${this.$tool.getLastMonth(new Date(), 1).ymd} 00:00:00`).valueOf() / 1000) : parseInt(callbackTime(this.timeTypeValue).valueOf() / 1000)
        this.agentGetHistoryDataQuery.endClock = parseInt(new Date().valueOf() / 1000)
      }

      const res = await this.$request({ url: requestApi, data: { ...this.agentGetHistoryDataQuery } })
      if (res.code !== 1) return
      if (this.port.isSummary) {
        if (this.timeTypeValue !== 0) {
          clearInterval(this.agentGetRealTimeDataInterval)
          await this.clearData()
        }
        if (res.map && res.map.data.length > 0) {
          res.map.data.forEach(item => {
            const send = this.chartType === 'flow' ? item.portSendTotal : item.portSendErrorTotal
            const recv = this.chartType === 'flow' ? item.portRecvTotal : item.portRecvErrorTotal
            let activeValue = 0
            this.echartData.forEach((items, idx) => {
              this.$set(this.echartData[idx].time, this.echartData[idx].time.length, item.updateTime)
              if (items.isConversion) { // 需要转换单位
                activeValue = items.keyword === 'send' ? send : recv
                const conversionDataResult = this.$tool.sizeUnitsTransform('B', 'MB', activeValue)
                activeValue = conversionDataResult.size
                this.$set(this.echartData[idx].units, this.echartData[idx].units.length, this.chartType === 'flow' ? 'MB' : '')
              } else {
                this.$set(this.echartData[idx].units, this.echartData[idx].units.length, this.chartType === 'flow' ? this.echartData[idx].unit : '')
              }
              // 设置转换后的数据
              this.$set(this.echartData[idx].data, this.echartData[idx].data.length, activeValue)
              this.$set(this.echartData[idx].originalData, this.echartData[idx].originalData.length, Number(activeValue))
              this.$set(this.echartData[idx].originalUnits, this.echartData[idx].originalUnits.length, this.chartType === 'flow' ? this.echartData[idx].unit : '')
            })

            let data = []
            if (this.timeTypeValue === 0) {
              data = {
                send: this.echartData[0].data[this.echartData[0].data.length - 1] || 0,
                sendUnits: `${this.echartData[0].units[this.echartData[0].units.length - 1] || ''}${this.echartData[0].unitSuffix || ''}`,
                receive: this.echartData[1].data[this.echartData[1].data.length - 1] || 0,
                receiveUnits: `${this.echartData[1].units[this.echartData[1].units.length - 1] || ''}${this.echartData[1].unitSuffix || ''}`,
                time: this.echartData[0].time[this.echartData[0].time.length - 1],
                type: 'realTime',
                sendOriginalData: this.echartData[0].originalData[this.echartData[0].originalData.length - 1],
                sendOriginalUnits: this.echartData[0].originalUnits[this.echartData[0].originalUnits.length - 1],
                receiveOriginalData: this.echartData[1].originalData[this.echartData[1].originalData.length - 1],
                receiveOriginalUnits: this.echartData[1].originalUnits[this.echartData[1].originalUnits.length - 1],
                sendValueAndUnits: '',
                receiveValueAndUnits: '',
                fixed: this.chartType === 'flow' ? 2 : 0
              }
              this.$EventBus.$emit('emit-port-item-data', this.$tool.deepCopy(data))
            }
          })
          if (this.timeTypeValue !== 0 && this.timeTypeValue > 3) {
            await this.setHostFlowTableMaxMinAvg()
          }
        }
      } else {
        if (res.model) {
          const idx = this.echartData.findIndex(item => item.itemid === query.itemid)
          if (this.timeTypeValue !== 0) {
            clearInterval(this.agentGetRealTimeDataInterval)
            await this.clearData(idx)
          }
          const model = JSON.parse(res.model)
          if (idx !== -1) {
            model[`itemData${query.itemid}`].forEach(item => {
              // 设置时间段
              this.$set(this.echartData[idx].time, this.echartData[idx].time.length, `${formatSTime(item.clock * 1000)}`)
              let activeValue = this.timeTypeValue > 3 ? item.valueMax : item.value
              if (this.echartData[idx].isConversion) { // 需要转换单位
                // 转换单位
                const conversionDataResult = this.$tool.sizeUnitsTransform('B', 'MB', activeValue)
                // 保存转换后的数据
                activeValue = conversionDataResult.size
                // 设置转换后的单位
                this.$set(this.echartData[idx].units, this.echartData[idx].units.length, this.chartType === 'flow' ? 'MB' : '')
              } else { // 不需要转换单位直接把单位进行赋值
                this.$set(this.echartData[idx].units, this.echartData[idx].units.length, this.chartType === 'flow' ? this.echartData[idx].unit : '')
              }
              // 设置转换后的数据
              this.$set(this.echartData[idx].data, this.echartData[idx].data.length, activeValue)
              this.$set(this.echartData[idx].originalData, this.echartData[idx].originalData.length, Number(activeValue))
              this.$set(this.echartData[idx].originalUnits, this.echartData[idx].originalUnits.length, this.chartType === 'flow' ? this.echartData[idx].unit : '')

              let data = []
              if (this.timeTypeValue === 0) {
                data = {
                  send: this.echartData[0].data[this.echartData[0].data.length - 1] || 0,
                  sendUnits: `${this.echartData[0].units[this.echartData[0].units.length - 1] || ''}${this.echartData[0].unitSuffix || ''}`,
                  receive: this.echartData[1].data[this.echartData[1].data.length - 1] || 0,
                  receiveUnits: `${this.echartData[1].units[this.echartData[1].units.length - 1] || ''}${this.echartData[1].unitSuffix || ''}`,
                  time: this.echartData[0].time[this.echartData[0].time.length - 1],
                  type: 'realTime',
                  sendOriginalData: this.echartData[0].originalData[this.echartData[0].originalData.length - 1],
                  sendOriginalUnits: this.echartData[0].originalUnits[this.echartData[0].originalUnits.length - 1],
                  receiveOriginalData: this.echartData[1].originalData[this.echartData[1].originalData.length - 1],
                  receiveOriginalUnits: this.echartData[1].originalUnits[this.echartData[1].originalUnits.length - 1],
                  sendValueAndUnits: '',
                  receiveValueAndUnits: ''
                }
                this.$EventBus.$emit('emit-port-item-data', this.$tool.deepCopy(data))
              }
            })
          }

          if (this.timeTypeValue !== 0 && this.timeTypeValue > 3) {
            this.setPortFlowTableMaxMinAvg(model)
          }
        }
      }
    },
    // 设置端口最大 最小 平均值表格
    setPortFlowTableMaxMinAvg(data) {
      this.tableParams.forEach((item, index) => {
        /* 渲染趋势图下面的表格 */
        const maxArr = [] // 存储当前时间段的所有最大值
        const minArr = [] // 存储当前时间段的所有最小值
        const avgArr = [] // 存储当前时间段的所有平均值
        if (!data[`itemData${item.itemid}`]) return
        data[`itemData${item.itemid}`].forEach(items => {
          maxArr.push(items.valueMax)
          minArr.push(items.valueMin)
          avgArr.push(items.valueAvg)
        })
        maxArr.sort((a, b) => { return a - b }) // 最大值排序
        minArr.sort((a, b) => { return a - b }) // 最小值排序

        for (let i = 0; i < item.label.length; i++) { // 遍历列
          let labelValue = ''
          let labelUnit = item.unit
          // 当前列要显示的数据类型
          if (item.type[i] === 'max') { // 最大值
            labelValue = maxArr[maxArr.length - 1]
          } else if (item.type[i] === 'min') { // 最小值
            labelValue = minArr[0]
          } else { // 平均值
            labelValue = avg(avgArr)
          }
          if (item.isConversion) { // 需要转换单位
            const conversionDataResult = this.$tool.sizeUnitsTransform('B', 'MB', labelValue)
            labelValue = conversionDataResult.size
            labelUnit = 'MB/s'
          }
          this.$set(this.tableData[0].col, this.tableData[0].col.length, {
            label: item.label[i],
            value: labelValue,
            unit: labelUnit,
            fixed: this.chartType === 'flow' ? 2 : 0
          })
        }

        /* 渲染历史列表 */
        data[`itemData${item.itemid}`].forEach(dataItem => {
          const dataObj = {
            time: formatSTime(Number(dataItem.clock) * 1000),
            clock: dataItem.clock,
            itemId: dataItem.itemid,
            max: this.chartType === 'flow' ? this.$tool.sizeUnitsTransform('B', 'MB', dataItem.valueMax).size : dataItem.valueMax,
            min: this.chartType === 'flow' ? this.$tool.sizeUnitsTransform('B', 'MB', dataItem.valueMin).size : dataItem.valueMin,
            avg: this.chartType === 'flow' ? this.$tool.sizeUnitsTransform('B', 'MB', dataItem.valueAvg).size : dataItem.valueAvg,
            unit: this.chartType === 'flow' ? 'MB/s' : '',
            fixed: this.chartType === 'flow' ? 2 : 0,
            portName: this.port.showName,
            hostName: this.host.hyMarkName,
            num: dataItem.num
          }
          if (index === 0) {
            this.$set(this.allTrendData.send, this.allTrendData.send.length, dataObj)
          }
          if (index === 1) {
            this.$set(this.allTrendData.receive, this.allTrendData.receive.length, dataObj)
          }
        })
        if (this.tableParams.length === index + 1) {
          this.$EventBus.$emit('emit-port-item-data', {
            type: 'history',
            portName: this.port.showName,
            hostName: this.host.hyMarkName,
            data: this.allTrendData
          })
        }
      })
    },
    // 设置汇总最大 最小 平均值表格
    async setHostFlowTableMaxMinAvg() {
      const res = await this.$request({ url: this.api.flowMonitor.findZbxFlowStatisticsMaxGroupTime, data: { ...this.agentGetHistoryDataQuery } })
      if (res.code === 0 || (!res.map && res.map.data.length === 0)) return

      this.tableParams.forEach((item) => {
        const maxArr = [] // 存储当前时间段的所有最大值
        const minArr = [] // 存储当前时间段的所有最小值
        const avgArr = [] // 存储当前时间段的所有平均值

        res.map.data.forEach(items => {
          const maxValue = this.chartType === 'flow' ? items[`${item.keyword === 'send' ? 'portSendMax' : 'portRecvMax'}`] : items[`${item.keyword === 'send' ? 'portSendErrorMax' : 'portRecvErrorMax'}`]
          const minValue = this.chartType === 'flow' ? items[`${item.keyword === 'send' ? 'portSendMin' : 'portRecvMin'}`] : items[`${item.keyword === 'send' ? 'portSendErrorMin' : 'portRecvErrorMin'}`]
          const avgValue = this.chartType === 'flow' ? items[`${item.keyword === 'send' ? 'portSendAvg' : 'portRecvAvg'}`] : items[`${item.keyword === 'send' ? 'portSendErrorAvg' : 'portRecvErrorAvg'}`]
          maxArr.push(maxValue)
          minArr.push(minValue)
          avgArr.push(avgValue)

          const dataObj = {
            time: items.updateTime,
            clock: new Date(items.updateTime).getTime(),
            itemId: '',
            max: this.chartType === 'flow' ? this.$tool.sizeUnitsTransform('B', 'MB', maxValue).size : maxValue,
            min: this.chartType === 'flow' ? this.$tool.sizeUnitsTransform('B', 'MB', minValue).size : minValue,
            avg: this.chartType === 'flow' ? this.$tool.sizeUnitsTransform('B', 'MB', avgValue).size : avgValue,
            unit: this.chartType === 'flow' ? 'MB/s' : '',
            fixed: this.chartType === 'flow' ? 2 : 0,
            portName: this.port.showName,
            hostName: this.host.hyMarkName,
            num: ''
          }
          if (item.keyword === 'send') {
            this.$set(this.allTrendData.send, this.allTrendData.send.length, dataObj)
          } else {
            this.$set(this.allTrendData.receive, this.allTrendData.receive.length, dataObj)
          }
        })

        maxArr.sort((a, b) => { return a - b }) // 最大值排序
        minArr.sort((a, b) => { return a - b }) // 最小值排序

        for (let i = 0; i < item.label.length; i++) { // 遍历列
          let labelValue = ''
          let labelUnit = item.unit
          // 当前列要显示的数据类型
          if (item.type[i] === 'max') { // 最大值
            labelValue = maxArr[maxArr.length - 1]
          } else if (item.type[i] === 'min') { // 最小值
            labelValue = minArr[0]
          } else { // 平均值
            labelValue = avg(avgArr)
          }
          if (item.isConversion) { // 需要转换单位
            const conversionDataResult = this.$tool.sizeUnitsTransform('B', 'MB', labelValue)
            labelValue = conversionDataResult.size
            labelUnit = 'MB/s'
          }
          this.$set(this.tableData[0].col, this.tableData[0].col.length, {
            label: item.label[i],
            value: labelValue,
            unit: labelUnit,
            fixed: this.chartType === 'flow' ? 2 : 0
          })
        }
      })

      this.$EventBus.$emit('emit-port-item-data', {
        type: 'history',
        portName: this.port.showName,
        hostName: this.host.hyMarkName,
        data: this.allTrendData
      })
    },
    // 监控数据类型切换
    async handleDetailTabNameClick() {
      this.$set(this.allTrendData, 'send', [])
      this.$set(this.allTrendData, 'receive', [])
      this.$EventBus.$emit('select-chart-type', this.chartType)
      clearInterval(this.agentGetRealTimeDataInterval)
      this.$set(this.tableData[0], 'col', [])
      this.clearData().then(() => this.setQuery())
    },
    // 监听设备端口实时数据
    watchAgentGetRealTimeData(data, clock) {
      console.log(data, clock)
      this.echartData.forEach(item => {
        let idx = -1
        if (this.port.isSummary) {
          idx = data.findIndex(items => items.keyword === item.keyword)
        } else {
          idx = data.findIndex(items => Number(items.itemid) === Number(item.itemid))
        }
        if (idx !== -1) {
          // 设置时间段
          this.$set(this.echartData[idx].time, this.echartData[idx].time.length, `${formatSTime(clock)}`)
          let activeValue = this.itMonitorRequireAgreement === 'WS' ? data[idx].itemValue || 0 : data[idx].value || 0
          if (this.echartData[idx].isConversion) { // 数据需要转换单位
            // 转换单位
            const conversionDataResult = this.$tool.sizeUnitsTransform(data[idx].units ? data[idx].units.split('/')[0] : '', 'MB', Number(activeValue))
            // 保存转换后的数据
            activeValue = conversionDataResult.size
            // 设置转换后的单位
            this.$set(this.echartData[idx].units, this.echartData[idx].units.length, this.chartType === 'flow' ? 'MB' : '')
          } else { // 不需要转换单位直接把单位进行赋值
            this.$set(this.echartData[idx].units, this.echartData[idx].units.length, this.chartType === 'flow' ? this.echartData[idx].unit : '')
          }
          // 设置转换后的数据
          this.$set(this.echartData[idx].data, this.echartData[idx].data.length, this.chartType === 'flow' ? activeValue : Number(this.itMonitorRequireAgreement === 'WS' ? data[idx].itemValue || 0 : data[idx].value || 0))
          this.$set(this.echartData[idx].originalData, this.echartData[idx].originalData.length, Number(this.itMonitorRequireAgreement === 'WS' ? data[idx].itemValue || 0 : data[idx].value || 0))
          this.$set(this.echartData[idx].originalUnits, this.echartData[idx].originalUnits.length, this.chartType === 'flow' ? this.echartData[idx].unit : '')
          if (this.echartData[idx].data.length > 1) {
            this.$set(this.echartData[idx].data, 0, this.chartType === 'flow' ? activeValue : Number(this.itMonitorRequireAgreement === 'WS' ? data[idx].itemValue || 0 : data[idx].value || 0))
          }
          if (this.echartData[idx].originalData.length > 1) {
            this.$set(this.echartData[idx].originalData, 0, Number(this.itMonitorRequireAgreement === 'WS' ? data[idx].itemValue || 0 : data[idx].value || 0))
          }
          if (this.echartData[idx].originalUnits.length > 1) {
            this.$set(this.echartData[idx].originalUnits, 0, this.chartType === 'flow' ? this.echartData[idx].unit : '')
          }
        }
      })
    },
    // 获取主机信息
    async getHyitHost() {
      const { code, model } = await request({
        url: api.itMonitor.getHyitHost,
        data: { hyHostId: this.hostId }
      })
      if (code !== 1) return
      return model
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-port-echart {
  .port-echart-header {
    padding: 10px;
    .echart-header-name {
      font-size: 18px;
    }
    .host-status {
      font-size: 14px;
    }
  }
  .port-echart-tool {
    background: #e5ecf6;
    .tool-tag {
      background: #cedbee;
      width: fit-content;
      padding: 10px 20px;
      font-weight: bold;
    }
  }
}
</style>
