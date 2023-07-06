<!--  -->
<template>

  <div id="echart-bar" ref="echartBar" class="echart-bar" style="width:100%;height:40px" />

</template>

<script>
import * as echarts from 'echarts'
export default {
  components: {},
  props: {
    percentData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      echartObj: null
    }
  },
  computed: {},
  watch: {
    percentData: {
      handler: function(now) {
        this.initEchart(now)
      },
      deep: true
    }
  },
  created() {
  },
  mounted() {
    // this.initEchart()
  },
  methods: {
    initEchart(now) {
      let barWidth = 20
      // var data1 = [60]
      // console.log(now)
      var data1 = [Number(now.data)]
      let max = now.max
      var titlename = ['时间']
      // var valdata = [100]
      const option = {
        backgroundColor: '',
        xAxis: {
          show: false,
          inverse: false
        },
        yAxis: [
          {
            show: false,
            data: titlename,
            inverse: true,
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            }
          },
          {
            show: false,
            inverse: true,
            data: titlename,
            axisLabel: {
              textStyle: {
                fontSize: 12,
                color: '#fff'
              }
            },
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            }
          }
        ],
        series: [
        // 内
          {
            type: 'bar',
            barWidth: barWidth,
            legendHoverLink: false,
            symbolRepeat: true,
            silent: true,
            animationDuration: 2,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: '#32fa2c' // 0% 处的颜色
                  },
                  {
                    offset: 0.5,
                    color: '#cce41a' // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#f43f10' // 100% 处的颜色
                  }
                ]
              },
              shadowBlur: 4,
              shadowColor: '#176581'
            },
            data: data1,
            z: 1,
            animationEasing: 'elasticOut'
          },
          // 背景
          {
            barMinHeight: 2,
            type: 'pictorialBar',
            animationDuration: 2,
            symbolRepeat: 'fixed',
            symbolMargin: '10%',
            symbol: 'rect',
            // symbolSize: [6, barWidth]
            symbolSize: [12, barWidth],
            itemStyle: {
              normal: {
                color: '#176581'
              }
            },
            label: {
              show: false
            },
            data: data1,
            z: 0,
            animationEasing: 'elasticOut'
          },
          // 分隔
          {
            type: 'pictorialBar',
            itemStyle: {
              color: '#071F39'
            },
            symbolRepeat: 'fixed',
            symbolMargin: 5,
            symbol: 'rect',
            symbolClip: true,
            symbolSize: [2, barWidth],
            symbolPosition: 'start',
            symbolOffset: ['10px', 0],
            data: data1,
            z: 2,
            animationEasing: 'elasticOut'
          },

          // 外框
          {
            name: '外框',
            type: 'bar',
            barGap: '-100%', // 设置外框粗细
            yAxisIndex: 1,
            data: [max],
            barWidth: 25,
            itemStyle: {
              normal: {
                color: 'none',
                borderColor: 'none'
              }
            }
          }
        ]
      }

      // if (this.echartObj != null && this.echartObj !== '' && this.echartObj !== undefined) {
      //   this.echartObj.dispose()// 销毁
      // }
      if (!this.echartObj) {
        this.echartObj = echarts.init(this.$refs.echartBar)
      }
      this.echartObj.setOption(option, true)
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
