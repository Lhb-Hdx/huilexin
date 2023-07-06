<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-300">
      <div class="item-content-header">
        <div class="title">事件发生时间段统计</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div ref="itemContentBody" class="item-content-body">
        <div ref="alarmBoxEcharts" class="echarts-boxs">
          <div id="eventEcharts" ref="eventEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { hexToRgba } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
import { callbackDay, dateFormat } from '@/utils/utils'

export default {
  name: 'EventMarksStatistical',
  components: {},
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'eventMarksStatistical',
      watchItemShow: null,
      dashboardType: 2,
      modelShow: '',
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      alarmEchartObject: null,
      alarmEchartData: []
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    this.getVideoAlarmLogDayHourStatic().then(res => {
      const label = []
      const labelData = []
      res.forEach(item => {
        const hourItem = item.hour >= 10 ? `${item.hour}:00` : `0${item.hour}:00`
        label.push(hourItem)
        labelData.push(item.count)
      })
      this.echartsLabel = label
      this.alarmEchartData = labelData
      this.createEcharts()
    })
    const that = this
    setTimeout(() => {
      that.createEcharts()
    }, 1000)
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
    createEcharts() {
      const that = this
      this.alarmEchartObject = echarts.init(document.getElementById('eventEcharts'), 'light')
      this.alarmEchartObject.setOption({
        color: ['#ff731b'],
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name} ${params[0].data}`
          }
        },
        grid: {
          top: '10%',
          left: '2%',
          right: '5%',
          bottom: '2%',
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
        series: [
          {
            type: 'line',
            smooth: true,
            symbolSize: 8,
            lineStyle: {
              normal: {
                color: '#ff731b',
                shadowBlur: 3,
                shadowColor: hexToRgba('#ff731b', 0.5),
                shadowOffsetY: 8
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                  [
                    { offset: 0, color: hexToRgba('#ff731b', 0.3) },
                    { offset: 1, color: hexToRgba('#ff731b', 0) }
                  ],
                  false
                ),
                shadowColor: hexToRgba('#ff731b', 0.8),
                shadowBlur: 10
              }
            },
            data: that.alarmEchartData
          }
        ]
      })
    },
    async getVideoAlarmLogDayHourStatic() {
      const date = new Date()
      const callbackDayList = callbackDay(30) // 倒推30天
      const sTime = `${callbackDayList[callbackDayList.length - 1]} 00:00:00`
      const eTime = `${dateFormat('YYYY-mm-dd HH:MM:SS', date)}`
      return await request({
        url: api.video.getVideoAlarmLogDayHourStatic, data: { sTime, eTime }
      }).then(res => {
        if (res.code === 1) {
          return res.data
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
