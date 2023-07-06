<template>
  <div class="accessechars">
    <div id="RigthinAndoutLogEcharts" ref="RigthinAndoutLogEcharts" />
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
import * as echarts from 'echarts'
import { hexToRgba } from '@/utils/utils'

export default {
  name: 'RigthinAndoutLogEcharts',
  components: {
  },
  data() {
    return {
      typeIndex: 0,
      alarmEchartData: [],
      alarmEchartObject: null,
      echartsLabel: Array(24).fill(0).map((time, index) => String(index).padStart(0, 2) + ':00'),
      colors: ['#00b894', '#0984e3'],
      list: [{ name: '机房前门监控入口', hyDeviceId: 215 }, { name: '机房后门监控入口', hyDeviceId: 193 }],
      dateTime: '',
      hyDeviceId: 215,
      ownerList: [],
      setDisabled: {
        disabledDate(time) {
          return time.getTime() > Date.now() // 可选历史天、可选当前天、不可选未来天
        }
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandleEchart)
    this.RigthinAndoutLogEcharts.dispose()
  },
  async mounted() {
    const { Y, M, D } = this.$tool.getNowDate('object')
    this.dateTime = `${Y}-${M}-${D}`
    await this.init()
  },
  methods: {
    async openInitFind(hyDeviceId, typeIndex, dataTime) {
      this.dateTime = dataTime
      this.hyDeviceId = hyDeviceId
      this.typeIndex = typeIndex
      await this.init()
    },
    async init() {
      const history = await this.findOwnerNumByHour()
      const timeList = history && history['timeList']
      let echartsData = Array(24).fill(0)
      if (timeList) {
        echartsData = this.$tool.setRingHistoryAlarm(history['timeList'], '', 'count', this.dateTime)
        if (timeList.length) {
          this.alarmEchartData = [this.mapEchartData('', this.colors[0], echartsData)]
          this.createEcharts()
        } else {
          this.alarmEchartData = [this.mapEchartData('', this.colors[0], this.$tool.setRingHistoryAlarm([], '', 'count', this.dateTime))]
          this.createEcharts()
        }
      }
      const logList = await this.findPowerAccessLog()
      const owners = await this.findEsOwner()
      const ownerList = []

      for (const log of logList) {
        let item = { ...log }
        const idx = owners.find(it => it['ownerId'] === log['ownerId'])
        if (!idx) {
          item = { ...log, ownerName: '未知人员', ctime: log['ctime'] }
        } else {
          item = { ...log, ownerName: idx['ownerName'], ctime: log['ctime'] }
        }
        ownerList.push(item)
      }
      this.ownerList = ownerList
    },
    mapEchartData(name, color, data) {
      return {
        name: name,
        type: 'line',
        smooth: true,
        symbolSize: 0,
        lineStyle: {
          normal: {
            color: color,
            shadowBlur: 3,
            shadowColor: hexToRgba(color, 0.5),
            shadowOffsetY: 8
          }
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
        emphasis: {
          focus: 'series'
        },
        data: data
      }
    },
    async findOwnerNumByHour(hyDeviceId) {
      let { map, code } = await request({ url: api.powerEnv.findOwnerNumByHour, data: { hyDeviceId: this.hyDeviceId, time: this.dateTime, limit: -1 }})
      if (code === 1) return map
    },

    async findPowerAccessLog(hyDeviceId) {
      let { data, code } = await request({ url: api.powerEnv.findPowerAccessLog, data: { hyDeviceId: this.hyDeviceId, time: this.dateTime, limit: -1 }})
      if (code === 1) return data
    },
    async findEsOwner() {
      let { data, code } = await request({ url: api.powerEnv.findEsOwner, data: { limit: -1 }})
      if (code === 1) return data
    },
    // 折线图
    createEcharts() {
      const that = this
      this.RigthinAndoutLogEcharts = echarts.init(this.$refs.RigthinAndoutLogEcharts)
      this.RigthinAndoutLogEcharts.setOption({
        color: this.colors,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        grid: {
          top: '10%',
          left: '3%',
          right: '3%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: '#EFEFEF'
            }
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
          axisLabel: {
            show: false,
            textStyle: {
              color: '#666'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E9E9E9',
              dashOffset: 10
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              type: 'dashed',
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        }],
        series: this.alarmEchartData
      })
      window.addEventListener('resize', () => {
        this.resizeHandleEchart()
      })
    },
    resizeHandleEchart() {
      if (this.RigthinAndoutLogEcharts) {
        this.RigthinAndoutLogEcharts.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .accessechars {
    width: 100%;
    height: 64%;
    text-align: center;
    padding: 0 0 2px;
    // padding: 20px 0 30px;
  }

  #RigthinAndoutLogEcharts{
    width: 100%;
    // height: 200px;
    height: 100%;
  }
</style>

