<template>
  <div class="opm-echart">
    <div :id="echartKey" :ref="echartKey" style="height: 220px; width: 100%" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'OpmEchart',
  props: {
    echartKey: {
      type: String,
      default: 'opmEchart'
    },
    statusOptions: {
      type: Array,
      default() {
        return []
      }
    },
    echartText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      opsChartsObj: null,
      newAlarmList: [],
      alarmSubType: [],
      alarmLogCount: 0,
      chnList: [],
      dvrList: []
    }
  },
  watch: {
    statusOptions: {
      async handler() {
        if (this.statusOptions.length > 0) {
          await this.createEcharts()
          await this.setEchartsOptions()
        }
      },
      deep: true
    }
  },
  async mounted() {
    await this.createEcharts()
    await this.setEchartsOptions()
  },
  methods: {
    // 创建echart
    async createEcharts() {
      if (this.opsChartsObj !== null) return
      this.opsChartsObj = echarts.init(this.$refs[`${this.echartKey}`])
    },
    // 设置echart数据
    async setEchartsOptions() {
      const self = this
      const color = []
      self.statusOptions.forEach(item => color.push(item.color))
      const option = {
        color,
        graphic: {
          elements: [
            {
              type: 'text',
              left: 'center', // 相对父元素居中
              top: '37%',
              style: {
                fill: '#fff',
                text: [`${self.echartText}`],
                font: '14px Arial Normal'
              }
            }
          ]
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          type: 'scroll',
          bottom: '0%',
          left: 'center',
          textStyle: {color: '#fff'}
        },
        series: [
          {
            type: 'pie',
            radius: ['70%', '60%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: false,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: self.statusOptions
          }
        ]
      }
      self.opsChartsObj.setOption(option, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.opm-echart {
  width: 50%;
  display: inline-block;
}
</style>
