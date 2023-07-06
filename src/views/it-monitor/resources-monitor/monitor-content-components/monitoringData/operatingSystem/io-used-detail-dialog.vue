<template>
  <el-dialog class="used-detail-dialog" title="查看详情" :visible.sync="showDialog" width="50%" top="5vh" append-to-body @close="closeDialog">
    <div class="dialog-content">
      <div class="header-tools">
        <div class="filter-container">
          <el-select v-model="timeTypeValue" class="filter-item" style="width: 200px" @change="changeTimeTypeValue">
            <el-option v-for="item in timeType" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </div>
      </div>
      <UsedStatisticsContainer echart-el="detailChart" :echart-data="getPropsEchartParams" :table-data="tableData" :realtime="true" :show-new-data-tag="showNewDataTag" />
    </div>
  </el-dialog>
</template>

<script>
import UsedStatisticsContainer from '../component/used-statistics-container'
import request from '@/utils/request'
import api from '@/api/api'
import { avg, callbackTime, dateFormat, isJSONString } from '@/utils/utils'

export default {
  name: 'UsedDetailDialog',
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
    frequency: {
      type: Object,
      default() {
        return {}
      }
    },
    cores: {
      type: Object,
      default() {
        return {}
      }
    },
    threads: {
      type: Object,
      default() {
        return {}
      }
    },
    cpuUsageItem: {
      type: Object,
      default() {
        return {}
      }
    },
    ioUsed: {
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
        // 实时数据 t值单位是分钟
        {
          id: 0, // id
          name: '实时', // 选择框标题
          t: 0, // 分钟
          type: 'realTime' // 类型
        },
        {
          id: 1,
          name: '一分钟(实时)',
          t: 1,
          type: 'realTime'
        },
        {
          id: 2,
          name: '五分钟(实时)',
          t: 5,
          type: 'realTime'
        },
        {
          id: 3,
          name: '十分钟(实时)',
          t: 10,
          type: 'realTime'
        },
        // 历史数据 t值单位是小时
        {
          id: 4,
          name: '近一小时(历史)',
          t: 1,
          type: 'history'
        },
        {
          id: 5,
          name: '近三小时(历史)',
          t: 3,
          type: 'history'
        },
        {
          id: 6,
          name: '近二十四小时(历史)',
          t: 24,
          type: 'history'
        },
        {
          id: 7,
          name: '最近三天(历史)',
          t: 72,
          type: 'history'
        }
      ],
      timeTypeValue: 0, // 当前选择的时间类型
      timeTypeObject: null,
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
      agentGetRealTimeDataInterval: null, // 定时器
      agentGetRealTimeDataIntervalValue: 2000, // 定时器毫秒数
      dataMaxLength: 0, // 数据最大数量，当前选择的分钟 * 60秒 / 定时器毫秒 / 1000 取整数
      showNewDataTag: true, // 显示最新数据标签
      itemData: {}
    }
  },
  computed: {
    agent() {
      return this.$route.query.agent
    },
    zbxHostId() {
      return this.$route.query.zbxHostId
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  mounted() {
    this.getPropsEchartParams = [{
      name: '已使用',
      color: '#87DEAF',
      unit: '',
      echartType: 'value',
      isConversion: false,
      conversionUnitType: 'data',
      isAssignUnit: false, // 指定转换单位
      assignUnit: '',
      originalUnit: '',
      toFixed: 0,
      data: [0],
      units: [''],
      time: [this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date())],
      yAxisMax: null
    }]
    this.getPropsTableParams = [
      {
        label: ['最高', '最低', '平均'],
        unit: '',
        type: ['max', 'min', 'avg']
      }
    ]
    this.agentGetHistoryDataQuery.agent = this.$route.query.agent
    this.agentGetRealTimeDataQuery.agent = this.$route.query.agent
    this.agentGetTrendDataQuery.agent = this.$route.query.agent
    this.initEchart()
  },
  methods: {
    // 选择时间类型 实时或者是按照时间查历史
    changeTimeTypeValue() {
      this.clearData().then(() => {
        this.initEchart()
      })
    },
    // 初始化echart
    initEchart() {
      this.getItemHistoryTable()
      this.timeTypeObject = this.$tool.findDataItemByAttr(this.timeType, 'id', this.timeTypeValue)
      if (!this.timeTypeObject) return
      if (this.timeTypeObject.type === 'realTime') {
        this.showNewDataTag = true
        const activeSelectS = this.timeTypeObject.t * 60 // 得出选择的实时分钟的秒数
        this.dataMaxLength = parseInt(activeSelectS / (this.agentGetRealTimeDataIntervalValue / 1000))
        this.agentGetRealTimeDataInterval = setInterval(() => {
          this.getItemRealTimeData()
        }, this.agentGetRealTimeDataIntervalValue)
      } else {
        this.showNewDataTag = false
        this.getItemHistoryData()
      }
    },
    // 获取实时统计图
    async agentGetRealTimeData(query) {
      return new Promise(resolve => {
        this.$set(this.agentGetRealTimeDataQuery, 'itemid', query.itemid)
        this.$set(this.agentGetRealTimeDataQuery, 'valueType', query.valueType)
        request({
          url: api.itMonitor.agentGetRealTimeData,
          data: { ...this.agentGetRealTimeDataQuery }
        }).then(async res => {
          if (res.code === 1) {
            if (res.model) {
              const data = JSON.parse(res.model)[0]
              resolve({
                data: data.value,
                units: ''
              })
            }
          }
        })
      })
    },
    // 获取历史统计
    async agentGetHistoryData(query) {
      return new Promise(resolve => {
        this.agentGetHistoryDataQuery.itemid = query.itemid
        this.agentGetHistoryDataQuery.valueType = query.valueType
        this.agentGetHistoryDataQuery.startClock = parseInt(callbackTime(this.timeTypeObject.t).valueOf() / 1000)
        this.agentGetHistoryDataQuery.endClock = parseInt(new Date().valueOf() / 1000)
        const request_api = this.timeTypeObject.t > 3 ? api.itMonitor.agentGetTrendData : api.itMonitor.agentGetHistoryData
        request({
          url: request_api,
          data: { ...this.agentGetHistoryDataQuery }
        }).then(res => {
          if (res.model) {
            clearInterval(this.agentGetRealTimeDataInterval)
            this.clearData(0).then(() => {
              const model = JSON.parse(res.model)
              const clock = []
              const data = []
              model[`itemData${query.itemid}`].forEach(async item => {
                // 设置时间段
                const getClock = new Date(item.clock * 1000)
                clock.push(dateFormat('YYYY-mm-dd HH:MM:SS', getClock))
                data.push(this.timeTypeObject.t > 3 ? item.valueMax : item.value)
              })
              resolve({ clock, data })
            })
          }
        })
      })
    },
    // 获取历史统计表格
    async agentGetTrendData(query) {
      return new Promise(resolve => {
        const callbackTimeVal = this.timeTypeValue === 0 ? 1 : this.timeTypeObject.t
        this.agentGetTrendDataQuery.itemid = query.itemid
        this.agentGetTrendDataQuery.valueType = query.valueType
        this.agentGetTrendDataQuery.startClock = parseInt(callbackTime(callbackTimeVal).valueOf() / 1000)
        this.agentGetTrendDataQuery.endClock = parseInt(new Date().valueOf() / 1000)
        request({
          url: api.itMonitor.agentGetTrendData,
          data: { ...this.agentGetTrendDataQuery }
        }).then(res => {
          if (res.model) {
            this.$set(this.tableData[0], 'col', [])
            const data = isJSONString(res.model) ? JSON.parse(res.model) : { data: [] }
            const maxArr = [] // 存储当前时间段的所有最大值
            const minArr = [] // 存储当前时间段的所有最小值
            const avgArr = [] // 存储当前时间段的所有平均值
            data[`itemData${query.itemid}`].forEach(items => {
              maxArr.push(items.valueMax)
              minArr.push(items.valueMin)
              avgArr.push(items.valueAvg)
            })
            maxArr.sort((a, b) => { return a - b }) // 最大值排序
            minArr.sort((a, b) => { return a - b }) // 最小值排序
            resolve({
              max: maxArr[maxArr.length - 1] || 0,
              min: minArr[0] || 0,
              avg: isNaN(avg(avgArr)) ? 0 : avg(avgArr)
            })
          }
        })
      })
    },
    // 清空统计图数据
    async clearData(idx) {
      clearInterval(this.agentGetRealTimeDataInterval)
      this.agentGetRealTimeDataInterval = null
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
    },
    async setCpuUsage(usage) {
      return new Promise(resolve => {
        // 计算出单个进程数据
        const value1 = this.frequency.itemValue / (this.threads.itemValue / this.cores.itemValue)
        // 所有进程数据
        const value3 = value1 * this.threads.itemValue
        // 使用比例
        const value4 = usage / value3
        const usageValue = value4 * 100
        resolve(usageValue.toFixed(2))
      })
    },
    // 获取io读写监控项实时数据
    async getItemRealTimeData() {
      const clock = new Date()
      // 读
      const readItem = await this.agentGetRealTimeData({ itemid: this.ioUsed.writeItemId, valueType: this.ioUsed.writeValueType }) || null
      // 写
      const wirteItem = await this.agentGetRealTimeData({ itemid: this.ioUsed.readItemId, valueType: this.ioUsed.readValueType }) || null
      const iops = readItem !== null ? Number(readItem.data) : 0 + wirteItem !== null ? Number(wirteItem.data) : 0
      // 设置时间段
      this.$set(this.getPropsEchartParams[0].time, this.getPropsEchartParams[0].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
      this.$set(this.getPropsEchartParams[0].data, this.getPropsEchartParams[0].data.length, iops.toFixed())
      this.$set(this.getPropsEchartParams[0].units, this.getPropsEchartParams[0].units.length, '')
      if (this.timeTypeValue !== 0) {
        if (this.getPropsEchartParams[0].time.length === this.dataMaxLength) this.getPropsEchartParams[0].time.shift()
      }
    },
    // 获取io读写监控项历史数据
    async getItemHistoryData() {
      // 读
      const readItem = await this.agentGetHistoryData({ itemid: this.ioUsed.writeItemId, valueType: this.ioUsed.writeValueType }) || null
      // 写
      const wirteItem = await this.agentGetHistoryData({ itemid: this.ioUsed.readItemId, valueType: this.ioUsed.readValueType }) || null
      const iops = []
      const units = []
      for (let i = 0; i < readItem.data.length; i++) {
        const iopsValue = Number(readItem.data[i]) + Number(wirteItem.data[i] ? wirteItem.data[i] : 0)
        iops.push(iopsValue.toFixed())
        units.push('')
      }
      this.$set(this.getPropsEchartParams[0], 'time', readItem.clock)
      this.$set(this.getPropsEchartParams[0], 'data', iops)
      this.$set(this.getPropsEchartParams[0], 'units', units)
    },
    async getItemHistoryTable() {
      // 读
      const readItem = await this.agentGetTrendData({ itemid: this.ioUsed.writeItemId, valueType: this.ioUsed.writeValueType }) || null
      // 写
      const wirteItem = await this.agentGetTrendData({ itemid: this.ioUsed.readItemId, valueType: this.ioUsed.readValueType }) || null
      this.getPropsTableParams.forEach(item => {
        for (let i = 0; i < item.label.length; i++) { // 遍历列
          let labelValue = ''
          let labelUnit = item.unit
          // 当前列要显示的数据类型
          if (item.type[i] === 'max') { // 最大值
            labelValue = readItem.max + wirteItem.max
          } else if (item.type[i] === 'min') { // 最小值
            labelValue = readItem.min + wirteItem.min
          } else { // 平均值
            labelValue = readItem.avg + wirteItem.avg
          }
          this.$set(this.tableData[0].col, this.tableData[0].col.length, {
            label: item.label[i],
            value: labelValue,
            unit: labelUnit
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
