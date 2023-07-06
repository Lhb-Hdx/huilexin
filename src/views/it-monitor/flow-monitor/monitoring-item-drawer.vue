<template>
  <el-dialog class="used-detail-dialog" title="查看详情" :visible.sync="showDialog" width="50%" top="5vh" append-to-body @close="closeDialog">
    <div class="dialog-content">
      <div class="tab-btns">
        <div v-for="item in tabBtnGroup" :key="item.key" class="tab-btn-item" :class="selectKey === item.key ? 'active' : ''" @click="changeItemType(item.key)">{{ item.value }}</div>
      </div>
      <div class="header-tools">
        <div class="filter-container">
          <el-select v-model="timeTypeValue" class="filter-item" style="width: 200px" @change="changeTimeTypeValue">
            <el-option v-for="item in timeType" :key="item.t" :label="item.name" :value="item.t" />
          </el-select>
        </div>
      </div>
      <UsedStatisticsContainer echart-el="detailChart" :echart-data="getPropsEchartParams" :table-data="tableData" :realtime="true" :show-new-data-tag="true" :custom-configuration="customConfiguration" />
    </div>
  </el-dialog>
</template>

<script>
import UsedStatisticsContainer from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/component/used-statistics-container'
import request from '@/utils/request'
import api from '@/api/api'
import { avg, callbackTime, guid, conversionData, formatSTime } from '@/utils/utils'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

export default {
  name: 'FlowUsedDetailDialog',
  components: {
    UsedStatisticsContainer
  },
  props: {
    echartParams: {
      type: Array,
      default() {
        return []
      }
    },
    tableParams: {
      type: Array,
      default() {
        return []
      }
    },
    isTabEchart: {
      type: Boolean,
      default: false
    },
    port: {
      type: Object,
      default() {
        return {}
      }
    },
    customConfiguration: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      showDialog: true, // 显示弹窗
      selectKey: '', // 当前切换按钮值
      tabBtnGroup: [], // 切换按钮
      usedDetailEchartKey: 'usedDetailEchartKey',
      timeType: [ // 时间类型
        {
          name: '实时',
          t: 0
        },
        {
          name: '最近三天',
          t: 72
        }
      ],
      timeTypeValue: 0, // 当前选择的时间类型
      getPropsEchartParams: [], // 获取父组件传过来的统计图参数配置
      getPropsTableParams: [], // 获取父组件传过来的表格参数配置
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
      tableData: [{ col: [] }], // 统计表格数据
      agentGetTrendDataQuery: { // 获取历史统计信息参数
        agent: '',
        hostid: '',
        itemid: '',
        valueType: '',
        startClock: '',
        endClock: ''
      },
      agentGetRealTimeDataInterval: null
    }
  },
  computed: {
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  mounted() {
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetRealTimeData-websocket') {
        this.watchAgentGetRealTimeData(res.detail.data.data)
      }
    })
    if (this.isTabEchart) { // 是否是可以切换的echart图表
      this.getPropsEchartParams = [this.echartParams[0]]
      this.getPropsTableParams = [this.tableParams[0]]
      this.selectKey = this.echartParams[0].itemid
      this.echartParams.forEach(item => {
        this.$set(this.tabBtnGroup, this.tabBtnGroup.length, {
          key: item.itemid,
          value: item.name
        })
      })
    } else { // 普通图表
      this.getPropsEchartParams = this.echartParams
      this.getPropsTableParams = this.tableParams
    }
    console.log('this.echartParams[0]', this.echartParams[0])
    this.agentGetHistoryDataQuery.agent = this.echartParams[0].agent ? this.echartParams[0].agent : this.$route.query.agent
    this.agentGetRealTimeDataQuery.agent = this.echartParams[0].agent ? this.echartParams[0].agent : this.$route.query.agent
    this.agentGetTrendDataQuery.agent = this.echartParams[0].agent ? this.echartParams[0].agent : this.$route.query.agent
    this.initEchart()
  },
  methods: {
    // 选择监控项按钮 就像网络设备哪里的板卡状态点击的时候有三种监控项类型
    changeItemType(key) {
      this.selectKey = key
      const idx = this.echartParams.findIndex(item => item.itemid === key)
      if (idx !== -1) {
        this.usedDetailEchartKey = guid() // 给组件加key强制刷新组件 用于tab切换的echarts实现刷新
        this.getPropsEchartParams = [this.echartParams[idx]]
        this.getPropsTableParams = [this.tableParams[idx]]
        clearInterval(this.agentGetRealTimeDataInterval)
        this.clearData()
        this.initEchart()
      }
    },
    // 选择时间类型 实时或者是按照时间查历史
    changeTimeTypeValue() {
      this.clearData().then(() => {
        this.initEchart()
      })
    },
    // 初始化echart
    initEchart() {
      const that = this
      this.setPortFlowTableMaxMinAvg()
      if (this.timeTypeValue === 0) {
        that.getPropsEchartParams.forEach(item => {
          that.agentGetHistoryData({
            itemid: item.itemid,
            valueType: item.valueType
          })
        })
        this.agentGetRealTimeDataInterval = setInterval(() => {
          const itemid = []
          const valueType = []
          that.getPropsEchartParams.forEach(item => {
            itemid.push(item.itemid)
            valueType.push(item.valueType)
          })
          that.agentGetRealTimeData({
            itemid: itemid.toString(),
            valueType: valueType.toString()
          }).then(res => {
            if (res.model) {
              const data = this.itMonitorRequireAgreement !== 'WS' ? JSON.parse(res.model) : res.model
              this.watchAgentGetRealTimeData(data)
            }
          })
        }, 2000)
      } else {
        if (this.port.isSummary) {
          that.agentGetHistoryData()
        } else {
          that.getPropsEchartParams.forEach(item => {
            that.agentGetHistoryData({
              itemid: item.itemid,
              valueType: item.valueType
            })
          })
        }
      }
    },
    // 监听端口实时数据
    watchAgentGetRealTimeData(data) {
      this.getPropsEchartParams.forEach(item => {
        const idx = data.findIndex(items => Number(items.itemid) === Number(item.itemid))
        if (idx !== -1) {
          const clock = new Date()
          // 设置时间段
          this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${formatSTime(clock.getTime())}`)
          let activeValue = this.itMonitorRequireAgreement === 'WS' ? data[idx].itemValue : data[idx].value
          if (this.getPropsEchartParams[idx].isConversion) { // 数据需要转换单位
            // 转换单位
            const conversionDataResult = conversionData(this.getPropsEchartParams[idx].conversionUnitType, Number(activeValue), this.getPropsEchartParams[idx].unit)
            // 保存转换后的数据
            activeValue = conversionDataResult.size
            console.log('this.getPropsEchartParams[idx]', this.getPropsEchartParams[idx])
            console.log(activeValue, this.$tool.getDataUnitAndSuffix(this.getPropsEchartParams[idx].unit).splitUnit, this.getPropsEchartParams[idx].assignUnit)
            if (this.getPropsEchartParams[idx].isAssignUnit) {
              activeValue = this.$tool.sizeUnitsTransform(this.$tool.getDataUnitAndSuffix(this.getPropsEchartParams[idx].unit).splitUnit, this.getPropsEchartParams[idx].assignUnit, Number(activeValue)).size
            } else {
              activeValue = conversionData(this.getPropsEchartParams[idx].conversionUnitType, Number(activeValue), this.$tool.getDataUnitAndSuffix(this.getPropsEchartParams[idx].unit).splitUnit).size
            }
            console.log(activeValue, this.$tool.getDataUnitAndSuffix(this.getPropsEchartParams[idx].unit).splitUnit, this.getPropsEchartParams[idx].assignUnit)
            // 设置转换后的单位
            console.log('conversionDataResult', conversionDataResult)
            this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, this.$tool.getDataUnitAndSuffix(conversionDataResult.units).splitUnit)
          } else { // 不需要转换单位直接把单位进行赋值
            this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, this.$tool.getDataUnitAndSuffix(this.getPropsEchartParams[idx].unit).splitUnit)
          }
          // 设置转换后的数据
          this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, activeValue)
        }
      })
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
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetRealTimeData,
            data: {
              token: wsToken,
              companyId: getUserSessionResult.companyId,
              appId: getUserSessionResult.appId,
              agent: this.agentGetRealTimeDataQuery.agent,
              itemid: query.itemid,
              valueType: query.valueType
            }
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
            let activeValue = 0
            this.echartParams.forEach((items, idx) => {
              this.$set(this.echartParams[idx].time, this.echartParams[idx].time.length, item.updateTime)
              if (items.isConversion) { // 需要转换单位
                activeValue = items.keyword === 'send' ? item.portSendTotal : item.portRecvTotal
                const conversionDataResult = this.$tool.sizeUnitsTransform('B', 'MB', activeValue)
                activeValue = conversionDataResult.size
                if (item.isAssignUnit) { // 指定转换单位
                  activeValue = this.$tool.sizeUnitsTransform(this.$tool.getDataUnitAndSuffix(item.units).splitUnit, item.assignUnit, Number(activeValue))
                } else {
                  activeValue = conversionData(item.conversionUnitType, Number(activeValue), this.$tool.getDataUnitAndSuffix(item.unit).splitUnit)
                }
                this.$set(this.echartParams[idx].units, this.echartParams[idx].units.length, this.chartType === 'flow' ? 'MB' : '')
              } else {
                this.$set(this.echartParams[idx].units, this.echartParams[idx].units.length, this.chartType === 'flow' ? this.echartParams[idx].unit : '')
              }
              // 设置转换后的数据
              this.$set(this.echartParams[idx].data, this.echartParams[idx].data.length, activeValue)
              this.$set(this.echartParams[idx].originalData, this.echartParams[idx].originalData.length, Number(activeValue))
              this.$set(this.echartParams[idx].originalUnits, this.echartParams[idx].originalUnits.length, this.chartType === 'flow' ? this.echartParams[idx].unit : '')
            })
          })
          if (this.timeTypeValue !== 0 && this.timeTypeValue > 3) {
            await this.setHostFlowTableMaxMinAvg()
          }
        }
      } else {
        if (res.model) {
          const idx = this.getPropsEchartParams.findIndex(item => item.itemid === query.itemid)
          if (this.timeTypeValue !== 0) {
            clearInterval(this.agentGetRealTimeDataInterval)
            await this.clearData(idx)
          }
          const model = JSON.parse(res.model)
          if (idx !== -1) {
            model[`itemData${query.itemid}`].forEach(item => {
              // 设置时间段
              this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${formatSTime(item.clock * 1000)}`)
              let activeValue = this.timeTypeValue > 3 ? item.valueMax : item.value
              if (this.getPropsEchartParams[idx].isConversion) { // 需要转换单位
                // 转换单位
                const conversionDataResult = conversionData(this.getPropsEchartParams[idx].conversionUnitType, activeValue, this.getPropsEchartParams[idx].unit)
                // 保存转换后的数据
                activeValue = conversionDataResult.size
                if (this.getPropsEchartParams[idx].isAssignUnit) { // 指定转换单位
                  activeValue = this.$tool.sizeUnitsTransform(this.$tool.getDataUnitAndSuffix(this.getPropsEchartParams[idx].unit).splitUnit, this.getPropsEchartParams[idx].assignUnit, Number(activeValue)).size
                } else {
                  activeValue = conversionData(this.getPropsEchartParams[idx].conversionUnitType, Number(activeValue), this.$tool.getDataUnitAndSuffix(this.getPropsEchartParams[idx].unit).splitUnit).size
                }
                // 设置转换后的单位
                this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, this.getPropsEchartParams[idx].isAssignUnit ? this.getPropsEchartParams[idx].assignUnit : conversionDataResult.units)
              } else { // 不需要转换单位直接把单位进行赋值
                this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, this.$tool.getDataUnitAndSuffix(this.getPropsEchartParams[idx].unit).splitUnit)
              }
              // 设置转换后的数据
              this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, activeValue)
            })
          }
        }
      }
    },
    // 设置端口最大 最小 平均值表格
    setPortFlowTableMaxMinAvg() {
      this.$set(this.tableData[0], 'col', [])
      this.getPropsTableParams.forEach(item => {
        const callbackTimeVal = this.timeTypeValue === 0 ? 1 : this.timeTypeValue
        this.agentGetTrendDataQuery.itemid = item.itemid
        this.agentGetTrendDataQuery.valueType = item.valueType
        this.agentGetTrendDataQuery.startClock = parseInt(callbackTime(callbackTimeVal).valueOf() / 1000)
        this.agentGetTrendDataQuery.endClock = parseInt(new Date().valueOf() / 1000)
        request({
          url: api.itMonitor.agentGetTrendData,
          data: { ...this.agentGetTrendDataQuery }
        }).then(res => {
          if (res.model) {
            const data = JSON.parse(res.model)
            const maxArr = [] // 存储当前时间段的所有最大值
            const minArr = [] // 存储当前时间段的所有最小值
            const avgArr = [] // 存储当前时间段的所有平均值
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
                const conversionDataResult = conversionData(item.conversionUnitType, labelValue, item.unit)
                labelValue = conversionDataResult.size
                labelUnit = conversionDataResult.units
              }

              this.$set(this.tableData[0].col, this.tableData[0].col.length, {
                label: item.label[i],
                value: labelValue,
                unit: labelUnit
              })
            }
          }
        })
      })
    },
    // 设置端口最大 最小 平均值表格
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
    },
    // 清空统计图数据
    async clearData(idx) {
      if (idx !== undefined) {
        this.$set(this.getPropsEchartParams[idx], 'data', [])
        this.$set(this.getPropsEchartParams[idx], 'time', [])
      } else {
        for (let i = 0; i < this.getPropsEchartParams.length; i++) {
          this.$set(this.getPropsEchartParams[i], 'data', [])
          this.$set(this.getPropsEchartParams[i], 'time', [])
        }
      }
    },
    // 关闭弹窗
    closeDialog() {
      this.showDialog = false
      this.$emit('closeUsedDetailDialog', false)
    }
  }
}
</script>

<style scoped>

</style>
