<template>
  <div ref="itemContentBody" class="item-content-body">
    <div ref="alarmBoxEcharts" class="echarts-boxs">
      <div id="alarmEcharts" ref="alarmEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
    </div>
  </div>
</template>

<script>
import {dateFormat, hexToRgba} from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'

export default {
  name: 'AlarmEchart',
  data() {
    return {
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      alarmEchartObject: null,
      alarmEchartData: [],
      legend: [],
      areaColor: [],
      alarmLevel: [],
      loading: false,
      hostIds: []
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('open-topo-alarm,start-up-date')
  },
  async mounted() {
    this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    const alarmLevel = await this.findAlarmLevel()
    alarmLevel.forEach((item) => {
      this.$set(this.legend, this.legend.length, item.dictdataName)
      this.$set(this.areaColor, this.areaColor.length, item.remark)
      this.$set(this.alarmEchartData, this.alarmEchartData.length, [])
    })
    this.alarmLevel = alarmLevel
    this.$EventBus.$on('open-topo-alarm', async () => {
      this.echartsData = []
      this.hostIds = await this.$store.dispatch('screen/getNodeHostIds')
      await this.getEchartData()
    })
    this.$EventBus.$on('start-up-date', async () => {
      await this.getEchartData()
    })
  },
  methods: {
    initEchartsData() {
      this.loading = true
      this.alarmEchartData.forEach((item, i) => {
        this.$set(this.echartsData, this.echartsData.length, {
          name: this.legend[i],
          type: 'line',
          smooth: true,
          // symbolSize: 8,
          symbol: 'none',
          lineStyle: {
            color: this.areaColor[i],
            shadowBlur: 3,
            shadowColor: hexToRgba(this.areaColor[i], 0.5),
            shadowOffsetY: 8
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: hexToRgba(this.areaColor[i], 0.3) },
                { offset: 1, color: hexToRgba(this.areaColor[i], 0) }
              ],
              false
            ),
            shadowColor: hexToRgba(this.areaColor[i], 0.8),
            shadowBlur: 10
          },
          data: item
        })
      })
      const that = this
      if (!this.alarmEchartObject) {
        setTimeout(function() {
          that.createEcharts()
        }, 1000)
      }
    },
    createEcharts() {
      const that = this
      this.alarmEchartObject = echarts.init(document.getElementById('alarmEcharts'), 'light')
      this.alarmEchartObject.setOption({
        color: that.areaColor,
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = ''
            params.forEach(function(item) {
              result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color + '"></span>'
              result += item.seriesName
              result += item.data
              result += '<br/>'
            })
            return result
          }
        },
        legend: {
          data: that.legend,
          icon: 'rect',
          bottom: 24,
          textStyle: {color: '#fff'}
        },
        grid: {
          top: '5%',
          left: '2%',
          right: '5%',
          bottom: '24%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: '{value}',
            color: '#fff'
          },
          axisLine: {
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          },
          data: that.echartsLabel
        }],
        yAxis: [{
          type: 'value',
          minInterval: 1,
          axisLabel: {
            color: '#fff'
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E9E9E9'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        }],
        series: that.echartsData
      })
    },
    async showDayAlarmLogByHour(hostIds) {
      const date = new Date()
      const time = `${dateFormat('YYYY-mm-dd', date)}`
      const { code, map } = await request({
        url: api.automationOperations.showDayAlarmLogByHour, data: { time, hostIds: this.hostIds.toString() }
      })
      if (code !== 1) return
      return map.timeList
    },
    // 获取告警级别
    async findAlarmLevel() {
      const { code, data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    // 获取echart数据
    async getEchartData() {
      if (this.hostIds.length > 0) {
        const res = await this.showDayAlarmLogByHour()
        const now = new Date()
        for (let i = 0; i < now.getHours() + 1; i++) {
          const h = i >= 10 ? i : `0${i}`
          this.$set(this.echartsLabel, this.echartsLabel.length, `${h}:00`)

          this.alarmEchartData.forEach((item, index) => {
            const timeIdx = res.findIndex(timeItem => Number(timeItem.time) === Number(i) && Number(timeItem.alevel) === Number(this.alarmLevel[index].dictdataValue))
            if (timeIdx !== -1) {
              this.$set(this.alarmEchartData[index], i, Number(res[timeIdx].count))
            } else {
              this.$set(this.alarmEchartData[index], i, 0)
            }
          })
        }
        this.$nextTick(() => {
          this.initEchartsData()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content-body {
  height: 260px;
  padding: 15px;
}
</style>
