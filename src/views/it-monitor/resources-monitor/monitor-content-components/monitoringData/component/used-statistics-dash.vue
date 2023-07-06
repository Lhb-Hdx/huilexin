<template>
  <div class="used-detail-echart">
    <div class="echarts-boxs">
      <div :id="echartEl" :ref="echartEl" style="width: 100%; height: 240px" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'UsedStatisticsDash',
  props: {
    echartEl: {
      type: String,
      default: ''
    },
    echartData: {
      type: Array,
      default() {
        return {
          options: []
        }
      }
    }
  },
  data() {
    return {
      echartOption: null,
      realtimeOption: [
        {
          type: 'slider',
          show: true,
          realtime: true,
          start: 0,
          end: 100
        }
      ]
    }
  },
  watch: {
    echartData: {
      handler() {
        this.initEchart()
      },
      deep: true
    }
  },
  mounted() {
    // if (this.echartData.length > 0) {
    this.initEchart()
    // }
  },
  methods: {
    // 初始化echart
    initEchart() {
      const that = this
      if (this.echartOption === null) {
        this.echartOption = echarts.init(document.getElementById(`${that.echartEl}`), 'light')
      }
      this.echartOption.setOption({
        tooltip: {
          formatter: '{b} : {c}'
        },
        series: [
          {
            name: 'Pressure',
            type: 'gauge',
            min: 0,
            max: that.echartData.length === 0 ? 100 : Math.max(...that.echartData[0].data) > 100 ? (Math.max(...that.echartData[0].data) + 100).toFixed() : 100,
            radius: '100%',
            progress: {
              show: true
            },
            detail: {
              valueAnimation: true,
              formatter: '{value}'
            },
            data: [
              {
                value: that.echartData.length === 0 ? 0 : Number(that.echartData[0].data[that.echartData[0].data.length - 1]),
                name: '当前值'
              }
            ]
          }
        ]
      })
    }
  }
}
</script>
