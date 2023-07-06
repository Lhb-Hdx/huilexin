<template>
  <div ref="chuckBox" class="chuck-box width-50 margin-left-7-5 margin-right-7-5">
    <div class="chuck-box-one box-border">
      <div class="head-bar head">
        <div class="title">{{ moduleTitle }}</div>
      </div>
      <div class="margin-top-7 margin-right-7 margin-bottom-7 text-right">
        <el-select v-model="timeTypeValue" size="mini" style="width: 200px" @change="changeTimeTypeValue">
          <el-option v-for="item in timeType" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </div>
      <UsedStatisticsContainer :echart-el="'memoryChart-' + guid" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import UsedStatisticsContainer from '../../component/used-statistics-container'
import { avg, callbackTime, dateFormat, guid } from '@/utils/utils'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorServiceTemperature',
  components: {
    UsedStatisticsContainer
  },
  mixins: [MonitorDataMixin],
  props: {
    moduleTitle: {
      type: String,
      default: ''
    },
    moduleData: {
      type: Object,
      default() {
        return {}
      }
    },
    moduleDataAttr: {
      type: String,
      default: ''
    },
    moduleDataIndex: {
      type: Number,
      default: 0
    },
    moduleDataIntervalValue: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
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
      timeTypeValue: 0,
      echartData: [
        {
          color: '#87DEAF',
          name: '当前温度',
          data: [],
          units: [],
          time: [],
          yAxisMax: null
        }
      ],
      tableData: [
        {
          col: [
            { label: '当前', value: 0, unit: '' },
            { label: '三小时内最高', value: 0, unit: '' },
            { label: '最高', value: 0, unit: '' },
            { label: '平均', value: 0, unit: '' },
            { label: '最低', value: 0, unit: '' }
          ]
        }
      ],
      guid: '',
      agentGetHistoryDataQuery: {},
      dataMaxLength: 0,
      timeTypeObject: null,
      customConfiguration: {
        yAxisLabelUnit: '℃'
      }
    }
  },
  watch: {
    moduleData: {
      handler(newVal) {
        // 监听实时数据，并且是查看实时数据
        if (this.timeTypeObject.type === 'realTime') {
          this.$set(this.echartData[0], 'itemId', newVal[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueItemid)
          this.$set(this.echartData[0], 'unit', '℃')

          this.$set(this.echartData[0], 'data', newVal[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueItemValue)
          this.$set(this.echartData[0], 'units', newVal[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueUnits)
          this.$set(this.echartData[0], 'time', newVal[`${this.moduleDataAttr}`][this.moduleDataIndex].time)
          if (this.timeTypeObject && this.timeTypeObject.t > 0 && this.timeTypeObject.type === 'realTime') {
            const activeSelectS = this.timeTypeObject.t * 60 // 得出选择的实时分钟的秒数
            this.dataMaxLength = parseInt(activeSelectS / (this.moduleDataIntervalValue / 1000))
            if (this.echartData[0].time.length > this.dataMaxLength) {
              this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueItemValue.shift()
              this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueUnits.shift()
              this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].time.shift()
              this.$emit('update:moduleData', this.moduleData)
            }
          }
          if (this.echartData[0].data.length > 0) {
            // 设置实时最新
            this.$set(this.tableData[0].col[0], 'value', this.echartData[0].data[this.echartData[0].data.length - 1])
            this.$set(this.tableData[0].col[0], 'unit', this.echartData[0].units[this.echartData[0].units.length - 1])
            // 设置实时最大值
            this.$set(this.tableData[0].col[2], 'value', Math.max(...this.echartData[0].data))
            this.$set(this.tableData[0].col[2], 'unit', this.echartData[0].units[0])
            // 设置实时平均值
            const avgValue = avg([...this.echartData[0].data])
            console.log(avgValue, this.echartData[0].data)
            this.$set(this.tableData[0].col[3], 'value', avgValue)
            this.$set(this.tableData[0].col[3], 'unit', this.echartData[0].units[0])
            // 设置实时最小值
            this.$set(this.tableData[0].col[4], 'value', Math.min(...this.echartData[0].data))
            this.$set(this.tableData[0].col[4], 'unit', this.echartData[0].units[0])
          }
        }
      },
      deep: true
    }
  },
  created() {
    this.guid = guid()
    this.timeTypeObject = this.timeType[0]
  },
  async mounted() {
    // 获取三小时内最高
    const historyData = await this.agentGetHistoryData({
      itemid: this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueItemid,
      valueType: this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueType,
      startClock: parseInt(callbackTime(3).valueOf() / 1000),
      endClock: parseInt(new Date().valueOf() / 1000)
    })
    if (historyData) {
      const getData = JSON.parse(historyData)
      const max = []
      getData.data.forEach(item => { max.push(item.value) })
      this.$set(this.tableData[0].col[1], 'value', `${Math.max(...max)}℃`)
    }
  },
  methods: {
    async changeTimeTypeValue() {
      this.timeTypeObject = this.$tool.findDataItemByAttr(this.timeType, 'id', this.timeTypeValue)
      if (!this.timeTypeObject) return
      this.clearEchartsData()
      this.clearTableData()
      if (this.timeTypeObject.type === 'realTime') {
        this.$set(this.echartData[0], 'data', [])
        this.$set(this.echartData[0], 'units', [])
        this.$set(this.echartData[0], 'time', [])
        this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueItemValue = []
        this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueUnits = []
        this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].time = []
        this.$emit('update:moduleData', this.moduleData)
      } else {
        const getHistoryEchart = await this.agentGetHistoryData({
          itemid: this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueItemid,
          valueType: this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueType,
          startClock: parseInt(callbackTime(this.timeTypeObject.t).valueOf() / 1000),
          endClock: parseInt(new Date().valueOf() / 1000)
        })
        if (getHistoryEchart) {
          const getData = JSON.parse(getHistoryEchart)
          getData.data.forEach(item => {
            // 设置时间段
            const clock = new Date(item.clock * 1000)
            this.$set(this.echartData[0].time, this.echartData[0].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
            let activeValue = this.timeTypeObject.t > 3 ? item.valueAvg : item.value
            this.$set(this.echartData[0].data, this.echartData[0].data.length, activeValue)
            this.$set(this.echartData[0].units, this.echartData[0].units.length, '℃')
          })
        }
        this.agentGetHistoryTable({
          itemid: this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueItemid,
          valueType: this.moduleData[`${this.moduleDataAttr}`][this.moduleDataIndex].activeTempValueType,
          startClock: parseInt(callbackTime(this.timeTypeObject.t).valueOf() / 1000),
          endClock: parseInt(new Date().valueOf() / 1000)
        })
      }
    },
    // 获取历史统计
    async agentGetHistoryData(query) {
      return new Promise(resolve => {
        const data = query
        data.agent = this.$route.query.agent
        const request_api = this.timeTypeObject && this.timeTypeObject.t > 3 ? api.itMonitor.agentGetTrendData : api.itMonitor.agentGetHistoryData
        request({
          url: request_api, data
        }).then(res => {
          if (res.model) resolve(res.model)
        })
      })
    },
    // 获取历史统计表格
    agentGetHistoryTable(query) {
      const data = query
      data.agent = this.$route.query.agent
      request({
        url: api.itMonitor.agentGetTrendData, data
      }).then(res => {
        if (res.model) {
          const data = JSON.parse(res.model)
          const maxArr = [] // 存储当前时间段的所有最大值
          const minArr = [] // 存储当前时间段的所有最小值
          const avgArr = [] // 存储当前时间段的所有平均值
          data.data.forEach(items => {
            maxArr.push(items.valueMax)
            minArr.push(items.valueMin)
            avgArr.push(items.valueAvg)
          })
          maxArr.sort((a, b) => { return a - b }) // 最大值排序
          minArr.sort((a, b) => { return a - b }) // 最小值排序
          this.$set(this.tableData[0].col[2], 'value', maxArr[maxArr.length - 1].toFixed(0))
          this.$set(this.tableData[0].col[2], 'unit', '℃')
          this.$set(this.tableData[0].col[3], 'value', avg(avgArr).toFixed(0))
          this.$set(this.tableData[0].col[3], 'unit', '℃')
          this.$set(this.tableData[0].col[4], 'value', minArr[0].toFixed(0))
          this.$set(this.tableData[0].col[4], 'unit', '℃')
        }
      })
    },
    // 清除echarts
    clearEchartsData() {
      this.$set(this.echartData[0], 'time', [])
      this.$set(this.echartData[0], 'data', [])
      this.$set(this.echartData[0], 'units', [])
    },
    // 清除表格数据
    clearTableData() {
      this.tableData[0].col.forEach(item => {
        item.value = 0
        item.unit = ''
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>

