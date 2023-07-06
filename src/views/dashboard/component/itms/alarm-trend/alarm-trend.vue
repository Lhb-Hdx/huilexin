<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" v-loading="loading" class="dashboard-box-item width-100">
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
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'itmsAlarmTrend',
      watchItemShow: null,
      dashboardType: 1,
      modelShow: '',
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      alarmEchartObject: null,
      alarmEchartData: [],
      legend: [],
      areaColor: [],
      alarmLevel: [],
      loading: false
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
    this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    const alarmLevel = await this.findAlarmLevel()
    alarmLevel.forEach((item) => {
      this.$set(this.legend, this.legend.length, item.dictdataName)
      this.$set(this.areaColor, this.areaColor.length, item.remark)
      this.$set(this.alarmEchartData, this.alarmEchartData.length, [])
    })
    this.alarmLevel = alarmLevel
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
  },
  methods: {
    initEchartsData() {
      this.loading = true
      this.alarmEchartData.forEach((item, i) => {
        this.$set(this.echartsData, this.echartsData.length, {
          name: this.legend[i],
          type: 'line',
          symbol: 'none',
          smooth: true,
          symbolSize: 8,
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
      setTimeout(function() {
        that.createEcharts()
      }, 1000)
      setTimeout(() => {
        this.loading = false
      }, 500)
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
          icon: 'rect'
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
            color: '#333'
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
            color: '#666'
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
    async showDayAlarmLogByHour() {
      const date = new Date()
      const time = `${dateFormat('YYYY-mm-dd', date)}`
      const { code, map } = await request({
        url: api.automationOperations.showDayAlarmLogByHour, data: { time }
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
          dashboardType: 1
        })
      } else {
        // 删除
        console.log(2, Number(val), '删除')
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      }
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
