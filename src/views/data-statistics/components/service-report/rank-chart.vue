<template>
  <div class="app-container">
    <div id="deviceCharts" ref="deviceCharts" style="width:100%;height:100%">
      <!-- <span>1折线图1</span> -->
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
// import { formatTime, dateFormat, hexToRgba } from '@/utils/screen-itms.js'
export default {
  name: '',
  components: {
  },
  data() {
    return {
      echartOption: null
    }
  },
  computed: {},
  watch: {
    echartData: {
      handler(newVal) {
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
      let options = []

      options = {
        title: {
        //   show: false,
          text: '故障率Top',
          padding: [30, 20, 20, 0],
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
        legend: {
          show: false
        },
        grid: {
          left: '0%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01],
          splitLine: {show: false},
          axisLine: {
            show: false
          },
          axisLabel: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'category',
          data: ['China', 'Brazil1', 'Indonesia', 'USA', 'India'],
          splitLine: {show: false},

          axisLine: {
            show: false
          },
          axisLabel: {
            show: false
            // formatter: function(value, index) {
            //   return 'helloworld'
            // }
          },
          axisTick: {
            show: false
          }
        },
        series: [
          {
            name: '2011',
            type: 'bar',
            showBackground: true,
            data: [18203, 23489, 29034, 104970, 131744],
            label: {
              show: true,
              formatter: function(params) {
                return `${params.name}`
              }
            },
            // barWidth: 30,
            itemStyle: {
              normal: {
                color: function (params) {
                  var colorList = [
                    'rgb(215,215,215)',
                    'rgb(215,215,215)',
                    'rgb(255,255,128)',
                    'rgb(250,205,145)',
                    'rgb(236,128,141)',
                    'rgb(255,165,0)',
                    'rgb(255,215,0)',
                    'rgb(0,128,0)',
                    'rgb(80,80,80)'

                  ]
                  return colorList[params.dataIndex]
                }

                // barBorderRadius: 10
              }
            }
          }
        ]
      }

      if (this.echartOption === null) {
        this.echartOption = echarts.init(this.$refs.deviceCharts, 'light')
      }

      this.echartOption.setOption(options, true)
    //   this.crateEchart(options, colors)
    },
    crateEchart(ops, cos) {
    //   let legendVal = [] // legend数据
      //   ops.forEach(item => {
      //     if (item.showLegend) {
      //       legendVal.push(item.name)
      //     }
      //   })

      //   const that = this

    }
  }
}
</script>

<style lang="scss" scoped>
.app-container{
    padding: 0;
}

</style>

