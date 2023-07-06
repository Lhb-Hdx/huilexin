<template>
  <div>
    <el-dialog
      :title="deviceName"
      :visible.sync="dialogVisible"
      width="50%"
      append-to-body
    >
      <div class="flex-wrap my-20">
        <div v-for="item in hydeviceInfo" :key="item.hyId" class="mx-16 device-info">
          <div class="text-center font-weight font-12">{{ item.hyDes }}</div>
          <div class="device-info-num text-center mt-10 font-20  font-weight">{{ item.hyAlarmValue || 0 }}</div>
        </div>
      </div>
      <div ref="columnar" class="columnar mt-10" style="height: 300px" />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { hexToRgba } from '@/utils/utils'
import * as echarts from 'echarts'

export default {
  name: 'DeviceHistory',
  props: {
    deviceId: {
      type: [String, Number],
      default: ''
    },
    deviceName: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      hydeviceInfo: [],
      temperature: '',
      humidity: '',
      historyList: [],
      colors: ['#26a69a', '#4aa0e5'],
      chartData: {
        'categories': Array.from({ length: 24 }, (x, i) => ('' + i).padStart(0, 2) + ':00'),
        'series': []
      }
    }
  },
  watch: {
    // dialogVisible(n) {
    //   if (n === false) this.$destroy()
    // }
  },
  methods: {
    async open() {
      this.dialogVisible = true
      this.$set(this.chartData, 'series', [])
      this.hydeviceInfo = []
      console.log(11111, this.chartData)
      // return
      await this.$nextTick()
      let deviceValuelist = await this.findHyitDeviceValue(this.deviceId)
      const ValueTypes = await this.findHyitValueType(deviceValuelist.map(it => it.hyType).join(','))
      for (let k = 0; k < ValueTypes.length; k++) {
        const type = ValueTypes[k]
        for (let j = 0; j < deviceValuelist.length; j++) {
          const deviceValue = deviceValuelist[j]
          const boole = await this.init(deviceValue, type, '温度')
          if (boole) break
        }
      }
      for (let k = 0; k < ValueTypes.length; k++) {
        const type = ValueTypes[k]
        for (let j = 0; j < deviceValuelist.length; j++) {
          const deviceValue = deviceValuelist[j]
          const boole = await this.init(deviceValue, type, '湿度')
          if (boole) break
        }
      }
      if (this.chartData.series.length === 0) {
        this.chartData.series.push({
          name: '温度',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          color: hexToRgba('#26a69a', 0.5),
          lineStyle: {
            normal: {
              color: '#26a69a',
              shadowBlur: 3,
              shadowColor: hexToRgba('#26a69a', 0.5),
              shadowOffsetY: 8
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                [
                  { offset: 0, color: hexToRgba('#26a69a', 0.3) },
                  { offset: 1, color: hexToRgba('#26a69a', 0) }
                ],
                false
              ),
              shadowColor: hexToRgba('#26a69a', 0.8),
              shadowBlur: 10
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: Array(24).fill(0)
        },
        {
          name: '湿度',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          color: hexToRgba('#4aa0e5', 0.5),
          lineStyle: {
            normal: {
              color: '#4aa0e5',
              shadowBlur: 3,
              shadowColor: hexToRgba('#4aa0e5', 0.5),
              shadowOffsetY: 8
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                [
                  { offset: 0, color: hexToRgba('#4aa0e5', 0.3) },
                  { offset: 1, color: hexToRgba('#4aa0e5', 0) }
                ],
                false
              ),
              shadowColor: hexToRgba('#4aa0e5', 0.8),
              shadowBlur: 10
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: Array(24).fill(0)
        }
        )
      }
      this.initChart()
    },
    async init(deviceValue, type, name) {
      if (deviceValue['hyType'] === type['hyTypeId']) {
        // const str = this.$tool.humpStr(type['hyFieldName'])
        if (deviceValue.hyDes.indexOf(name) !== -1) {
          // if(name==='温度')this.temperature = deviceValue[str]
          // if(name==='湿度')this.humidity = deviceValue[str]
          if (this.hydeviceInfo.length <= 0) this.hydeviceInfo = await this.findHyitDeviceValueAlarmRule(deviceValue.hyVid)// 温湿度只取其中一个
          // let hhh = { timeList: [{ average: 21.83, count: '76', time: 2 }, { average: name === '湿度' ? 35 : 22.02, count: '228', time: 4 }] }
          let temp = Array(24).fill(0)
          let history = await this.showDayDeviceValueLog(deviceValue.hyVid)// 历史
          const chartData = temp.map((it, tempIdx) => {
            const idx = history.timeList.findIndex((timeItem) => timeItem['time'] === tempIdx)
            if (idx !== -1) return history.timeList[idx]['average']
            return it
          })
          // console.log('chartData', chartData)
          this.chartData.series.push({
            name: name,
            type: 'line',
            smooth: true,
            symbolSize: 8,
            color: hexToRgba(name === '温度' ? '#26a69a' : '#4aa0e5', 0.5),
            lineStyle: {
              normal: {
                color: name === '温度' ? '#26a69a' : '#4aa0e5',
                shadowBlur: 3,
                shadowColor: hexToRgba(name === '温度' ? '#26a69a' : '#4aa0e5', 0.5),
                shadowOffsetY: 8
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                  [
                    { offset: 0, color: hexToRgba(name === '温度' ? '#26a69a' : '#4aa0e5', 0.3) },
                    { offset: 1, color: hexToRgba(name === '温度' ? '#26a69a' : '#4aa0e5', 0) }
                  ],
                  false
                ),
                shadowColor: hexToRgba(name === '温度' ? '#26a69a' : '#4aa0e5', 0.8),
                shadowBlur: 10
              }
            },
            emphasis: {
              focus: 'series'
            },
            data: chartData
          })
          // this.$set(this.chartData,'series',{ name:'温度',data:chartData })
          return true
        }
      }
    },
    async findHyitDeviceValue(hyDeviceId) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, hyDeviceId }
      })
      if (code !== 1) return
      return data
    },
    async findHyitValueType(hyTypes) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitValueType,
        data: { limit: -1, ids: hyTypes }
      })
      if (code !== 1) return
      return data
    },
    async showDayDeviceValueLog(vid) {
      let today = this.$tool.dateFormat('YYYY-mm-dd', new Date())
      let { code, map } = await request({
        url: api.powerEnv.showDayDeviceValueLog,
        data: { time: today, vid }
      })
      if (code !== 1) return
      return map
    },
    async findHyitDeviceValueAlarmRule(vid) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValueAlarmRule,
        data: { vid }
      })
      if (code !== 1) return
      return data
    },
    initChart(obj) {
      this.chart = echarts.init(this.$refs['columnar'], 'light')
      this.chart.clear()
      this.chart.setOption({
        color: this.colors,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              // backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          // data: this.legendData
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            show: false,
            formatter: '{value}',
            textStyle: {
              color: '#333'
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
          data: this.chartData['categories']
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
        series: this.chartData['series']
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.device-info{
  .device-info-num{
  color: #000;
  }
}
</style>
