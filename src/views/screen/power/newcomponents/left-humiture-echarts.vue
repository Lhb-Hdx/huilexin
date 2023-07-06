<template>
  <div class="ktechars">
    <div id="humitureEcharts" ref="humitureEcharts" />
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
import * as echarts from 'echarts'
import { hexToRgba } from '@/utils/utils'

export default {
  name: 'LefHumitureEcharts',
  components: {
  },
  data() {
    return {
      xAxisData: [],
      yAxisData: [],
      xAxisDataNull: [],
      yAxisDataNull: []
    }
  },
  beforeDestroy() {
    // this.batchOffEventBus('start-up-date')
    window.removeEventListener('resize', this.resizeHandleEchart)
    this.humitureEcharts.dispose()
  },
  mounted() {
    this.initDataNull()
    this.createHumitureEcharts()
    // this.$EventBus.$on('start-up-date', async () => {
    //   await this.initEchartsData()
    // })
  },
  methods: {
    openInitFind(arg) {
      this.initEchartsData(arg)
    },
    // 初始化参数
    initDataNull() {
      let xAxisarr = []
      let yAxisarr = []
      for (let x = 0; x < 24; x++) {
        xAxisarr.push([String(x).padStart(0, 2) + ':00', 0])
        yAxisarr.push([String(x).padStart(0, 2) + ':00', 0])
      }
      this.xAxisDataNull = xAxisarr
      this.yAxisDataNull = yAxisarr
    },
    // 获取图表数据
    async initEchartsData(params) {
      let temperatureData = await this.showDayDeviceValueLog(params?.temperatureHyVid)
      let humidityData = await this.showDayDeviceValueLog(params?.humidityHyVid)
      // 温度
      if (temperatureData?.timeList) {
        const arr = this.xAxisDataNull
        temperatureData.timeList.map(item => {
          for (let x = 0; x < arr.length; x++) {
            const element = arr[x]
            const strTime = element[0].split(':')[0]
            if (+strTime === +item.time && item?.average) {
              element[1] = item.average
            }
          }
        })
        this.xAxisData = arr
      } else {
        this.xAxisData = []
        this.initDataNull()
      }
      // 湿度
      if (humidityData?.timeList) {
        const arr = this.yAxisDataNull
        humidityData.timeList.map(item => {
          for (let x = 0; x < arr.length; x++) {
            const element = arr[x]
            const strTime = element[0].split(':')[0]
            if (+strTime === +item.time && item?.average) {
              element[1] = item.average
            }
          }
        })
        this.yAxisData = arr
      } else {
        this.yAxisData = []
        this.initDataNull()
      }
      await this.createHumitureEcharts()
    },

    // 折线图
    async createHumitureEcharts() {
      let temperatureData = this.xAxisData.length > 0 ? this.xAxisData : this.xAxisDataNull
      let humitureData = this.yAxisData.length > 0 ? this.yAxisData : this.yAxisDataNull

      this.humitureEcharts = echarts.init(document.getElementById('humitureEcharts'))
      this.humitureEcharts.setOption({
        color: this.colors,
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          icon: 'rect',
          bottom: 24,
          textStyle: {color: '#fff'}
        },
        grid: {
          top: '14%',
          left: '3%',
          right: '3%',
          bottom: '24%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            color: '#fff'
          },
          axisLine: {
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }

        }],
        yAxis: [
          {
            type: 'value', // 数值轴
            name: '温度',
            position: 'left',
            axisLabel: {
              // color: '#fff'
              show: false,
              textStyle: {
                color: '#666'
              }
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

          },
          {
            type: 'value',
            name: '湿度',
            position: 'right',
            alignTicks: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#D9D9D9'
              }
            },
            axisLabel: {
              formatter: '{value} ml'
            }
          }
        ],
        series: [
          {
            name: '温度',
            type: 'line',
            smooth: true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
              color: '#f0b404'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: hexToRgba('#f0b404', 0.8)
                },
                {
                  offset: 1,
                  color: hexToRgba('#f0b404', 0.3)
                }
              ])
            },
            data: temperatureData
          },
          {
            name: '湿度',
            type: 'line',
            smooth: true,
            symbol: 'none', // 取消线上圆点
            sampling: 'average',
            itemStyle: {
              color: '#20eed7'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: hexToRgba('#20eed7', 0.8)
                },
                {
                  offset: 1,
                  color: hexToRgba('#20eed7', 0.3)
                }
              ])
            },
            data: humitureData
          }

        ]
      })
      window.addEventListener('resize', () => {
        this.resizeHandleEchart()
      })
    },
    resizeHandleEchart() {
      if (this.humitureEcharts) {
        this.humitureEcharts.resize()
      }
    },
    // 获取某台空调当天的温湿度
    async showDayDeviceValueLog(hyVid) {
      const { Y, M, D } = this.$tool.getNowDate('object')
      const time = `${Y}-${M}-${D}`
      if (hyVid) {
        let { code, map } = await request({ url: api.powerEnv.newShowDayDeviceValueLog, data: { time, limit: -1, vid: hyVid } })
        if (code !== 1) return
        return map
      }
      return null
    }
    // 获取某台空调当天的温湿度
    // async showTimeDeviceValueLog(hyVid) {
    //   const date = new Date()
    //   const year = String(date.getFullYear())
    //   const month = String(date.getMonth() + 1).padStart(2, 0)
    //   const day = String(date.getDate()).padStart(2, 0)
    //   const DATA = {
    //     stime: `${year}-${month}-${day} 00:00:00`,
    //     etime: `${year}-${month}-${day} 23:59:59`,
    //     limit: -1,
    //     vid: hyVid
    //   }
    //   let { code, map } = await request({ url: api.powerEnv.showTimeDeviceValueLog, data: DATA })
    //   if (code !== 1) return
    //   return map
    // },
  }
}
</script>

<style lang="scss" scoped>
.ktechars {
  width: 100%;
  height: 100%;
  padding: 10px 0 0;
  text-align: center;

  #humitureEcharts {
    width: 100%;
    // height: 64%;
    min-height: 200px;
  }
}
</style>

