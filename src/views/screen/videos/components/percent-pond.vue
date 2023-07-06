<!--  -->
<template>
  <div class="percent-pond">
    <div id="echart-bar" ref="echartBar" class="echart-bar" style="width:70%; height: 40px" />
    <div class="percent" style="height: 40px; line-height: 40px">{{ (percentData.data/percentData.max*100)?(percentData.data/percentData.max*100).toFixed(2)+'%':'' }}</div>
  </div>
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
  created() {},
  mounted() {
    // this.initEchart()
  },
  methods: {
    initEchart(now) {
      let barWidth = 15
      let symbolMargin = now.ctime ? 3 : 2
      // var data1 = [60]
      // console.log(now)
      var data1 = [Number(now.data)]
      let max = now.max
      // var titlename = ['时间']
      // var valdata = [100]
      // const option = {
      //   backgroundColor: '#100c29',

      //   xAxis: {
      //     show: false,
      //     inverse: false
      //   },
      //   yAxis: [
      //     {
      //       show: false,
      //       data: titlename,
      //       inverse: true,
      //       axisLine: {
      //         show: false
      //       },
      //       splitLine: {
      //         show: false
      //       },
      //       axisTick: {
      //         show: false
      //       }
      //     },
      //     {
      //       show: false,
      //       inverse: true,
      //       data: titlename,
      //       axisLabel: {
      //         textStyle: {
      //           fontSize: 12,
      //           color: '#fff'
      //         }
      //       },
      //       axisLine: {
      //         show: false
      //       },
      //       splitLine: {
      //         show: false
      //       },
      //       axisTick: {
      //         show: false
      //       }
      //     }
      //   ],
      //   series: [
      //     // 内
      //     {
      //       type: 'bar',
      //       barWidth: barWidth,
      //       legendHoverLink: false,
      //       symbolRepeat: true,
      //       silent: true,
      //       animationDuration: 2,
      //       itemStyle: {
      //         color: {
      //           type: 'linear',
      //           x: 0,
      //           y: 0,
      //           x2: 1,
      //           y2: 0,
      //           colorStops: [
      //             {
      //               offset: 0,
      //               color: '#005eb6' // 0% 处的颜色
      //             },
      //             {
      //               offset: 0.5,
      //               color: '#00bdfe' // 0% 处的颜色
      //             },

      //             {
      //               offset: 1,
      //               color: '#00efff' // 100% 处的颜色
      //             }
      //           ]
      //         },
      //         shadowBlur: 4,
      //         shadowColor: '#176581'
      //       },
      //       data: data1,
      //       z: 9999,
      //       animationEasing: 'elasticOut'
      //     },
      //     // 背景
      //     {
      //       type: 'bar',
      //       // type: 'pictorialBar',
      //       barWidth: barWidth,
      //       // symbolOffset: [5, 0],
      //       // animationDuration: 0,
      //       // symbolRepeat: 'fixed',
      //       // symbolMargin: '40%',
      //       // symbol: 'rect',
      //       // symbolSize: [4, 15],
      //       // symbolBoundingData: 100,
      //       barGap: '-100%',
      //       z: 99,
      //       itemStyle: {
      //         normal: {
      //           color: '#30373f'
      //         }
      //       },
      //       label: {
      //         show: false
      //       },
      //       data: data1,
      //       animationEasing: 'elasticOut'
      //     },
      //     {
      //       // 分隔
      //       type: 'pictorialBar',
      //       itemStyle: {
      //         normal: {
      //           color: '#100c29'
      //         }
      //       },
      //       symbolRepeat: 'fixed',
      //       symbolMargin: 4,
      //       symbol: 'rect',
      //       symbolClip: true,
      //       symbolSize: [4, 30],
      //       symbolPosition: 'start',
      //       symbolOffset: [-4, 0],
      //       // symbolBoundingData: this.total,
      //       data: [max],
      //       width: 25,
      //       z: 0,
      //       zlevel: 1
      //     }

      //   ],
      //   grid: {
      //     // 让图表位置
      //     top: '0px',
      //     left: '0px',
      //     right: '60px',
      //     bottom: '0px'
      //   }
      // }

      var colorList = []
      colorList[0] = new echarts.graphic.LinearGradient(
        0, 0, 1, 0,
        [
          {offset: 0, color: '#0275f2'},
          {offset: 1, color: '#24dcfe'}
        ]
      )

      const option = {
        grid: {
          top: '4%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          max: max,
          splitLine: {
            show: false
          },
          offset: 10,
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            show: false
          }
        },
        yAxis: {
          type: 'category',
          inverse: true,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            inside: true
            // verticalAlign: 'top'
          },
          data: ['']
        },
        series: [
          {
            name: '',
            type: 'bar',
            // type: 'pictorialBar',
            barWidth: barWidth,
            // symbol: 'rect',
            // symbolRepeat: 'fixed',
            // symbolMargin: '40%',
            // symbolClip: true,
            // symbolOffset: [5, 0],
            // stack: '12',
            // symbolSize: [4, 15],
            // symbolBoundingData: 100,
            itemStyle: {
              normal: {
                color: function(params) {
                  // build a color map as your need.
                  // var colorList = [
                  //   '#25defd','#ebc701','#00ddc2'
                  // ];
                  return colorList[params.dataIndex]
                }
              }
            },

            z: 9999,
            data: data1
          },
          {
            name: '',
            type: 'bar',
            // type: 'pictorialBar',
            barWidth: barWidth,
            // symbolOffset: [5, 0],
            // animationDuration: 0,
            // symbolRepeat: 'fixed',
            // symbolMargin: '40%',
            // symbol: 'rect',
            // symbolSize: [4, 15],
            // symbolBoundingData: 100,
            barGap: '-100%',
            z: 99,
            itemStyle: {
              normal: {
                color: '#30373f'
              }
            },
            label: {
              show: true,
              position: 'insideBottomLeft',
              // distance: 20,
              offset: [-6, -30],
              fontSize: 18,
              color: '#caced1',
              formatter: '{b}'
            },
            data: [max]
          },
          {
            // 分隔
            type: 'pictorialBar',
            itemStyle: {
              normal: {
                color: '#100c29'
              }
            },
            symbolRepeat: 'fixed',
            symbolMargin: symbolMargin,
            symbol: 'rect',
            symbolClip: true,
            symbolSize: [4, 15],
            symbolPosition: 'start',
            symbolOffset: [-4, 0],
            // symbolBoundingData: this.total,
            data: [max],
            width: 25,
            z: 0,
            zlevel: 1
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
.percent-pond {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // justify-content: space-between;
  .echart-bar {
    // display: flex;
    // align-items: center;
    // justify-content: center;
  }
  .percent {
    margin-right: 10px;
    // position: absolute;
    // right: 10px;
    // flex: 1;
  }
}
</style>
