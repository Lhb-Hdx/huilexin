<template>
  <div class="used-detail-echart">
    <!--    <div v-if="showNewDataTag" class="echart-new-data">-->
    <!--      <div v-for="(item, index) in echartData" :key="index" class="new-data-item">-->
    <!--        <div class="new-data-color" :style="{ background: item.color }" />-->
    <!--        {{ item.name }}{{ item.data[item.data.length - 1] }}{{ item.units[item.units.length - 1] }}{{ item.unitSuffix }}-->
    <!--      </div>-->
    <!--    </div>-->
    <div class="echarts-boxs">
      <div :id="echartEl" :ref="echartEl" style="width: 100%; height: 240px" />
    </div>
  </div>
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
  name: 'UsedStatisticsEchart',
  props: {
    showNewDataTag: {
      type: Boolean,
      default: false
    },
    realtime: {
      type: Boolean,
      default: false
    },
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
    },
    customConfiguration: {
      type: Object,
      default() {
        return {}
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
      handler(newVal) {
        this.initEchart()
      },
      deep: true
    }
  },
  mounted() {
    if (this.echartData.length > 0) {
      this.initEchart()
    }
    window.addEventListener('resize', () => {
      this.changeEchartSize()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.changeEchartSize)
  },
  methods: {
    // 初始化echart
    initEchart() {
      const options = []
      const colors = []
      this.echartData.forEach(item => {
        colors.push(item.color)
        options.push({
          name: item.name,
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          showLegend: item.showLegend, // showLegend为true时显示Legend
          zlevel: 3,
          // 轮廓样式
          lineStyle: {
            color: `${item.color}`,
            shadowBlur: 3,
            shadowColor: hexToRgba(`${item.color}`, 0.5),
            shadowOffsetY: 8
          },
          // 区域样式
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                {
                  offset: 0,
                  color: hexToRgba(`${item.color}`, 0.3)
                },
                {
                  offset: 1,
                  color: hexToRgba(`${item.color}`, 0)
                }
              ],
              false
            ),
            shadowColor: hexToRgba(`${item.color}`, 0.8),
            shadowBlur: 10
          },
          data: item.data
        })
      })
      this.crateEchart(options, colors)
    },
    /**
     * @description 创建echart
     * @param ops 数据配置
     * @param cos 颜色
     */
    crateEchart(ops, cos) {
      let legendVal = [] // legend数据
      ops.forEach(item => {
        if (item.showLegend) {
          legendVal.push(item.name)
        }
      })

      const that = this
      if (this.echartOption === null) {
        this.echartOption = echarts.init(document.getElementById(`${that.echartEl}`), 'light')
      }
      this.echartOption.setOption({
        color: cos,
        tooltip: {
          show: true,
          trigger: 'axis',
          position: function(pt) {
            return [pt[0], '10%']
          },
          formatter: function(params) {
            let result = params && params.length > 0 ? params[0].name : ''
            result += '<br/>'
            params.forEach(function(item) {
              const unit = that.echartData[item.componentIndex].units && that.echartData[item.componentIndex].units.length > 0 ? that.echartData[item.componentIndex].units[item.dataIndex] : ''
              result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color + '"></span>'
              result += item.seriesName
              result += `${Number(item.data).toFixed(that.echartData[item.componentIndex].toFixed || 0)}${unit}${that.echartData[params[0].componentIndex].unitSuffix ? that.echartData[params[0].componentIndex].unitSuffix : ''}`
              result += '<br/>'
            })
            return result
          }
        },
        grid: {
          top: '10%',
          left: '3%',
          right: '3%',
          bottom: that.realtime ? '24%' : '2%',
          containLabel: true
        },
        xAxis: [{
          show: true,
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
            show: true
          },
          data: that.echartData[0].time
        }],
        yAxis: [{
          show: true,
          type: 'value',
          max: (value) => {
            return this.echartData[0].yAxisMax ? this.echartData[0].yAxisMax : Math.ceil(value.max)
          },
          axisLabel: {
            show: true,
            color: '#666',
            formatter: function(params) {
              return `${params}${that.customConfiguration && that.customConfiguration.yAxisLabelUnit ? that.customConfiguration.yAxisLabelUnit : ''}`
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E9E9E9'
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        }],
        legend: { data: legendVal }, // legend数据
        dataZoom: [{
          show: that.realtime,
          type: 'slider'
        }, {
          show: that.realtime,
          type: 'inside'
        }],
        series: ops
      })
    },
    changeEchartSize() {
      this.echartOption.resize()
    }
  }
}
</script>

<style lang="scss" scoped>
.echarts-boxs {
  margin-bottom: 20px;
}
.echart-new-data {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  margin-bottom: 10px;
  .new-data-item {
    margin: 0 10px;
    display: flex;
    align-items: center;
    .new-data-color {
      width: 14px;
      height: 14px;
      border-radius: 4px;
      margin-right: 4px;
    }
  }
}
</style>
