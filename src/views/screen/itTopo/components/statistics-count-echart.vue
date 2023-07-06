<template>
  <div class="statistics-count-echart">
    <div :id="echartKey" :ref="echartKey" style="height: 220px; width: 100%" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'StatisticsCountEchart',
  props: {
    echartKey: {
      type: String,
      default: 'statisticsCountEchart'
    },
    statusOptions: {
      type: Array,
      default() {
        return []
      }
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
  mounted() {
    if (this.statusOptions.length > 0 && this.opsChartsObj === null) {
      this.createEcharts()
    }
  },
  methods: {
    createEcharts() {
      const self = this
      self.opsChartsObj = echarts.init(self.$refs[`${this.echartKey}`])
      const option = {
        color: ['#59cbf7', '#FE4D4E'],
        graphic: {
          elements: [
            {
              type: 'text',
              left: 'center', // 相对父元素居中
              top: '32%',
              style: {
                fill: '#fff',
                text: ['故障率'],
                font: '12px Arial Normal'
              }
            },
            {
              type: 'text',
              left: 'center', // 相对父元素居中
              top: '42%',
              style: {
                fill: '#fff',
                text: [`${self.statusOptions[1].name} ${self.statusOptions[1].alarmCountPercentage}%`],
                font: '20px Arial Normal'
              }
            }
          ]
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
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
.statistics-count-echart {
  width: 50%;
  display: inline-block;
  text-align: center;
}
</style>
