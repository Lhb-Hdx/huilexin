<template>
  <div v-loading="loading" class="app-container">
    <div id="deviceCharts" ref="deviceCharts" style="width: 100%; height: 100%" />
  </div>
</template>

<script>
import { hexToRgba } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'
export default {
  name: 'DeviceChart',
  props: {
    dateQuery: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      levelList: [],
      loading: false,
      echartData: []
    }
  },
  computed: {
    formatTime() {
      const startTime = +new Date(this.dateQuery['year'] || +new Date(this.dateQuery['month'])) / 1000
      const endTime = +new Date(this.dateQuery['year'] ? `${this.dateQuery['year']}-12-31` : `${this.dateQuery['month']}-31`) / 1000
      return {startTime, endTime}
    }
  },
  watch: {
    dateQuery: {
      handler() {
        this.countNumByDateAndLevel(this.formatTime.startTime, this.formatTime.endTime)
      },
      deep: true
    }
  },
  async mounted() {
    this.levelList = await this.findSysDictionaryDetail()
    this.countNumByDateAndLevel(this.formatTime.startTime, this.formatTime.endTime)
  },
  methods: {
    async countNumByDateAndLevel(startCLock, endClock) {
      this.loading = true
      const {map, code} = await request({
        url: api.itMonitor.getZbxAlarmLogStatictics2, data: { agents: this.sessionStorageOperation('get', 'agentId'), startCLock, endClock }
      })
      if (code !== 1) return
      let echartData = Object.fromEntries(this.levelList.map(it => [it['dictdataValue'], Object.fromEntries(map.result.map(item => [item['dateTime'], 0]))]))
      map.result.forEach(it => { echartData[it['alevel']][it['dateTime']] = +it['totalCount'] })
      const xData = [...new Set(map.result.map(it => it['dateTime']))]
      this.initEchart(xData, this.initEchartData(echartData))
      window.setTimeout(() => {
        this.loading = false
      }, 500)
    },
    async findSysDictionaryDetail() {
      const {data, code} = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      })
      if (code === 1) return data
    },
    initEchartData(echartData) {
      const newEchartData = []
      for (const key in echartData) {
        const color = this.levelList.find(it => +it['dictdataValue'] === +key)?.style || '#55efc4'
        newEchartData.push({
          name: this.levelList.find(it => +it['dictdataValue'] === +key)?.dictdataName,
          type: 'line',
          symbol: 'circle',
          symbolSize: 7,
          smooth: true,
          lineStyle: {
            color: color,
            shadowBlur: 3,
            shadowColor: this.$tool.hexToRgba(color, 0.5),
            shadowOffsetY: 8
          },
          itemStyle: {
            color: color,
            borderWidth: 1,
            borderColor: '#FFF',
            shadowColor: color,
            shadowBlur: 10
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                [
                  { offset: 0, color: hexToRgba(color, 0.3) },
                  { offset: 1, color: hexToRgba(color, 0) }
                ],
                false
              ),
              shadowColor: hexToRgba(color, 0.8),
              shadowBlur: 10
            }
          },
          data: Object.values(echartData[key])
        })
      }
      return newEchartData
    },
    // 初始化echart
    initEchart(xData, echartData) {
      let options = []
      options = {
        backgroundColor: '#FFF',
        grid: {
          top: '9%',
          bottom: '20%',
          left: '5%',
          right: '0%'
        },
        tooltip: {
          trigger: 'axis',
          label: {
            show: true
          }
        },
        xAxis: {
          boundaryGap: true, // 默认，坐标轴留白策略
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            show: false
          },
          axisTick: {
            show: false,
            alignWithLabel: true
          },
          data: xData
        },
        yAxis: {
          axisLine: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: 'rgba(33,148,246,0.2)'
            }
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false,
            areaStyle: {
            }
          }
        },
        series: echartData
      }
      const echartOption = echarts.init(this.$refs.deviceCharts, 'light')
      echartOption.setOption(options, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 0;
}
</style>
