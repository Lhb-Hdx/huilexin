<template>
  <div ref="accessecharsBox" class="accessecharsBox">
    <div id="accumulatorEcharts" ref="accumulatorEcharts" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'RigthAccumulatorEcharts',
  components: {
  },
  data() {
    return {
      xAxisData: [],
      yAxisData: [],
      selectUnitName: '电压'
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandleEchart)
    this.accumulatorEcharts.dispose()
  },
  mounted() {
    this.initEchartsData()
    this.createAccumulatorEcharts()
  },
  methods: {
    openFind(arg, selectLabe) {
      let xAxisarr = []
      this.yAxisData = arg
      this.selectUnitName = selectLabe

      if (arg?.length > 0) {
        for (let x = 0; x < arg.length; x++) {
          xAxisarr.push(`${x}#`)
        }
        this.xAxisData = xAxisarr
      } else {
        this.initEchartsData()
      }
      this.createAccumulatorEcharts()
    },
    initEchartsData() {
      let xAxisarr = []
      let yAxisarr = []
      for (let x = 0; x < 24; x++) {
        xAxisarr.push(`${x}#`)
        yAxisarr.push(0)
      }
      this.xAxisData = xAxisarr
      this.yAxisData = yAxisarr
    },
    // 折线图
    createAccumulatorEcharts() {
      const that = this
      let data = this.yAxisData
      let dataAxis = this.xAxisData

      this.accumulatorEcharts = echarts.init(document.getElementById('accumulatorEcharts'))
      this.accumulatorEcharts.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const lable = that.selectUnitName
            if (lable === '电压') {
              return `${params[0].name}:<br/>${params[0].data}/mV`
            }
            if (lable === '内阻') {
              return `${params[0].name}:<br/>${params[0].data}/μΩ`
            }
            if (lable === '温度') {
              return `${params[0].name}:<br/>${params[0].data}/℃`
            }
          }
        },
        grid: {
          top: '10%',
          left: '3%',
          right: '3%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: {
          data: dataAxis,
          axisTick: {
            show: false
          },
          axisLine: {
            show: true
          }

        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#333',
              dashOffset: 10
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false,
            textStyle: {
              color: '#666'
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              type: 'dashed',
              color: '#D9D9D9'
            }
          }
        },
        series: [
          {
            type: 'bar',
            showBackground: true,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00f0ff' },
                { offset: 0.5, color: '#0b51aa' },
                { offset: 1, color: '#083268' }
              ])
            },

            data: data
          }
        ]

      })

      window.addEventListener('resize', () => {
        this.resizeHandleEchart()
      })
    },
    resizeHandleEchart() {
      if (this.accumulatorEcharts) {
        this.accumulatorEcharts.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.accessecharsBox {
  width: 100%;
  // height: 76%;
  // padding: 20px 0 30px;
  text-align: center;

  #accumulatorEcharts {
    width: 100%;
    min-height: 200px;
    // height: 76%;
  }
}
</style>

