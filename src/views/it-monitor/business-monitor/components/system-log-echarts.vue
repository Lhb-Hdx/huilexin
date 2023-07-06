<template>
  <div :id="echartsEl" :ref="echartsEl" style="width: 100%; height: 220px" />
</template>

<script>
import * as echarts from 'echarts'

/**
 * @description 转换rgba
 * @param hex
 * @param opacity
 * @returns {string}
 */
function hexToRgba(hex, opacity) {
  let rgbaColor = ''
  const reg = /^#[\da-f]{6}$/i
  if (reg.test(hex)) {
    rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt(
      '0x' + hex.slice(3, 5)
    )},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
  }
  return rgbaColor
}

export default {
  name: 'SystemLogEcharts',
  props: {
    logData: {
      type: Object,
      default() {
        return {}
      }
    },
    echartsEl: {
      type: String,
      default: ''
    }
  },
  watch: {
    logData: {
      handler() {
        this.createEcharts()
      },
      deep: true
    }
  },
  mounted() {
    if (this.logData && this.logData.data) {
      this.createEcharts()
    }
  },
  methods: {
    createEcharts() {
      const that = this
      this.alarmEchartObject = echarts.init(document.getElementById(that.echartsEl), 'light')
      this.alarmEchartObject.setOption({
        color: [that.logData.color],
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name} ${params[0].data}%`
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
          data: that.logData.time
        }],
        yAxis: [{
          type: 'value',
          max: 100,
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
                color: `${that.logData.color}`,
                shadowBlur: 3,
                shadowColor: hexToRgba(that.logData.color, 0.5),
                shadowOffsetY: 8
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                  [
                    { offset: 0, color: hexToRgba(that.logData.color, 0.3) },
                    { offset: 1, color: hexToRgba(that.logData.color, 0) }
                  ],
                  false
                ),
                shadowColor: hexToRgba(that.logData.color, 0.8),
                shadowBlur: 10
              }
            },
            data: that.logData.data
          }
        ]
      })
    }
  }
}
</script>
