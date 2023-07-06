<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-360">
      <div class="item-content-header">
        <div class="title">告警趋势</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <!--      <el-empty v-if="!echartsData.length" />-->
      <div ref="itemContentBody" class="item-content-body">
        <div ref="alarmBoxEcharts" class="echarts-boxs">
          <div id="alarmEcharts" ref="alarmEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { dateFormat, hexToRgba } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'AlarmTrend',
  components: {},
  props: {
    agentId: {
      type: String,
      default: ''
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'powerAlarmTrend',
      watchItemShow: null,
      dashboardType: 3,
      modelShow: '',
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      alarmEchartObject: null,
      alarmEchartData: [],
      colors: {
        5: '#FE4D4E',
        4: '#FE830C',
        3: '#268CF2',
        2: '#FE4D4E',
        1: '#00B285'
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  async mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    console.log(this.agentId)
    this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    let levels = await this.hyitAlarmLevel()
    let temp = await this.getVideoAlarmLogDayStatic()
    // const temp = { timeList: [{ count: 56, level: 1, time: 10 }, { count: 88, level: 2, time: 10 }, { count: 22, level: 3, time: 10 }, { count: 41, level: 3, time: 12 }, { count: 77, level: 4, time: 10 }, { count: 2, level: 5, time: 10 }, { count: 56, level: 1, time: 10 }] }
    let chartList = {}
    for (let j = 0; j < temp.timeList.length; j++) {
      let tempItem = temp.timeList[j]
      if (!chartList[tempItem['hyLevel']]) {
        chartList[tempItem['hyLevel']] = [tempItem]
      } else {
        chartList[tempItem['hyLevel']].push(tempItem)
      }
    }
    console.log(chartList)

    let series = []
    Object.values(chartList).forEach((it, index) => {
      const level = levels.find(level => level.hyLevel === it[0]['hyLevel'])
      console.log(this.colors[level['hyLevel']])
      series.push({
        name: level['hyLevelName'],
        type: 'line',
        symbol: 'none',
        smooth: true,
        symbolSize: 0,
        color: this.colors[level['hyLevel']],
        lineStyle: {
          normal: {
            color: this.colors[level['hyLevel']],
            shadowBlur: 3,
            shadowColor: hexToRgba(this.colors[level['hyLevel']], 0.5),
            shadowOffsetY: 8
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: hexToRgba(this.colors[level['hyLevel']], 0.3) },
                { offset: 1, color: hexToRgba(this.colors[level['hyLevel']], 0) }
              ],
              false
            ),
            shadowColor: hexToRgba(this.colors[level['hyLevel']], 0.8),
            shadowBlur: 10
          }
        },
        data: this.$tool.setRingHistoryAlarm(it, '', 'count')
      })
    })
    const label = Array(24).fill(0).map((time, index) => String(index).padStart(0, 2) + ':00')
    console.log('series', series)
    if (!Object.values(chartList).length) {
      series.push({
        name: '',
        type: 'line',
        smooth: true,
        symbolSize: 0,
        color: this.colors[5],
        lineStyle: {
          normal: {
            color: this.colors[5],
            shadowBlur: 3,
            shadowColor: hexToRgba(this.colors[5], 0.5),
            shadowOffsetY: 8
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: hexToRgba(this.colors[5], 0.3) },
                { offset: 1, color: hexToRgba(this.colors[5], 0) }
              ],
              false
            ),
            shadowColor: hexToRgba(this.colors[5], 0.8),
            shadowBlur: 10
          }
        },
        data: this.$tool.setRingHistoryAlarm([], '', 'count')
      })
    }
    this.echartsLabel = label
    this.alarmEchartData = series
    this.createEcharts()
  },
  methods: {
    // 更改显示配置
    changemodelDefine(val) {
      console.log(val)
      if (val === false) {
        console.log(1, Number(val), '新增')
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      } else {
        // 删除
        console.log(2, Number(val), '删除')
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      }
    },
    async hyitAlarmLevel() {
      let { code, data } = await request({ url: api.powerEnv.findHyitAlarmLevel, data: { agents: this.agentId }})
      if (code !== 1) return
      // this.level = data
      console.log(data)
      return data
    },
    createEcharts() {
      const that = this
      this.alarmEchartObject = echarts.init(document.getElementById('alarmEcharts'), 'light')
      this.alarmEchartObject.setOption({
        // color: ['#00B285', '#FE4D4E', '#268CF2', '#FE830C', '#FE4D4E'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
        //   data: that.legend,
          icon: 'rect'
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
          data: that.echartsLabel
        }],
        yAxis: [{
          type: 'value',
          axisLabel: {
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
        series: this.alarmEchartData
      })
      // this.alarmEchartObject.setOption({
      //   color: ['#ff731b', '#f9e459', '#00DDFF', '#f52443', '#FF0087', '#37A2FF'],
      //   tooltip: {
      //     trigger: 'axis',
      //     formatter: function(params) {
      //       return `${params[0].name} ${params[0].data}`
      //     }
      //   },
      //   grid: {
      //     top: '10%',
      //     left: '2%',
      //     right: '5%',
      //     bottom: '2%',
      //     containLabel: true
      //   },
      //   xAxis: [{
      //     type: 'category',
      //     boundaryGap: false,
      //     axisLabel: {
      //       formatter: '{value}',
      //       textStyle: {
      //         color: '#333'
      //       }
      //     },
      //     axisLine: {
      //       lineStyle: {
      //         color: '#D9D9D9'
      //       }
      //     },
      //     axisTick: {
      //       show: false
      //     },
      //     data: that.echartsLabel
      //   }],
      //   yAxis: [{
      //     type: 'value',
      //     axisLabel: {
      //       textStyle: {
      //         color: '#666'
      //       }
      //     },
      //     splitLine: {
      //       lineStyle: {
      //         type: 'dashed',
      //         color: '#E9E9E9'
      //       }
      //     },
      //     axisLine: {
      //       show: true,
      //       lineStyle: {
      //         color: '#D9D9D9'
      //       }
      //     },
      //     axisTick: {
      //       show: false
      //     }
      //   }],
      //   series: this.alarmEchartData
      // })
    },
    async getVideoAlarmLogDayStatic() {
      console.log('909090')
      const date = new Date()
      const sTime = dateFormat('YYYY-mm-dd', date)
      // const eTime = `${dateFormat('YYYY-mm-dd', date)} 23:59:59`
      return await request({
        url: api.powerEnv.showDayDHAlarmLogByHour, data: { sTime }
      }).then(res => {
        if (res.code === 1) {
          return res.map
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
</style>
