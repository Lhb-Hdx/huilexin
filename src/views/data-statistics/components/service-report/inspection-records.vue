<template>
  <div class="inspection-records">
    <div ref="echart" style="height: 100%" />
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'InspectionRecords',
  data() {
    return {
      echartData: []
    }
  },
  mounted() {
    this.initEchart()
  },
  methods: {
    initEchart() {
      let chartDom = this.$refs.echart
      let myChart = echarts.init(chartDom)
      let option

      option = {
        title: {
          text: '巡检记录',
          textStyle: {
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '1%',
          right: '0%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'Direct',
            type: 'bar',
            barWidth: '35',
            data: [10, 52, 200, 334, 390, 330, 220]
          },
          {
            name: 'Direct',
            type: 'bar',
            barWidth: '35',
            color: 'red',
            data: [12, 52, 200, 334, 390, 330, 220]
          }
        ]
      }

      option && myChart.setOption(option)
    }
  }
}
</script>

<style lang="scss" scoped>
.inspection-records {
  height: 100%;
  margin-top: 20px;
  padding-bottom: 3%;
}
</style>
