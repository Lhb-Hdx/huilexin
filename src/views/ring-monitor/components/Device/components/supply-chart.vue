<template>
  <div class="flex-v-center flex-colunm supplyChart">
    <div ref="columnar" :style="{ height: '150px'}" class="columnar" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'SupplyChart',
  props: {
    value: {
      type: [Number, String],
      default: 50
    },
    total: {
      type: Number,
      default: 100
    },
    title: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.proportion()
  },
  methods: {
    proportion() {
      const that = this
      var option = {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            radius: '120%',
            center: ['50%', '80%'],
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 4,
            progress: {
              show: true,
              roundCap: false,
              width: 20,
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: '#E373FF' // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: '#59BCFF' // 100% 处的颜色
                    }
                  ]
                }
              }
            },
            pointer: {
              icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
              length: '40%',
              width: 0,
              offsetCenter: [0, '-30%'],
              itemStyle: {
                color: '#111',
                borderCap: 'round'
              },
              show: true,
              size: 20,
              showAbove: true
            },
            axisLine: {
              roundCap: false,
              lineStyle: {
                width: 20
              }
            },
            axisTick: {
              splitNumber: 1,
              lineStyle: {
                width: 0,
                color: '#999'
              }
            },
            splitLine: {
              length: 0,
              lineStyle: {
                width: 12,
                color: '#999'
              }
            },
            axisLabel: {
              distance: -26,
              color: '#666',
              fontSize: 11
            },
            title: {
              show: false
            },
            detail: {
              backgroundColor: 'transparent',
              borderColor: '#999',
              borderWidth: 0,
              width: '60%',
              lineHeight: 0,
              height: 40,
              borderRadius: 0,
              offsetCenter: [0, '-10%'],
              valueAnimation: true,
              formatter: function(value) {
                return `{value|${that.value}}\n{unit|${that.name}}`
              },
              rich: {
                value: {
                  fontSize: 18,
                  fontWeight: 'bolder',
                  color: '#111'
                },
                unit: {
                  fontSize: 14,
                  color: '#666',
                  padding: [50, 0, 0, 0]
                }
              }
            },
            data: [
              {
                value: that.value,
                unit: 'cc'
              }
            ]
          }
        ]
      }
      const self = this
      const myChart = echarts.init(self.$refs['columnar'], 'light')
      myChart.setOption(option, true)
    }

  }

}

</script>
<style lang="scss" scoped>
.supplyChart{
  width: 280px;
}
.full-left-header-right-icon {
  width: 40px;
  text-align: center;
  cursor: pointer;
}
.list-wrapper {
  .list, .list-item {
    padding: 0;
    margin: 0;
  }
  .list-item {
    list-style: none;
    line-height: 20px;
    padding: 10px;
    cursor: pointer;
    // transition: all 0.25s ease-in-out;
    position: relative;
    overflow: hidden;
    color: #666;
    &:hover {
      background: rgb(220, 228, 241);
    }
    &.active {
      background: rgb(187, 203, 229);
      color: #000;
      &::after {
        display: none;
        content: '';
        width: 16px;
        height: 16px;
        position: absolute;
        top: 12px;
        right: -9px;
        background: #f5f5f5;
        transform: rotate(45deg);
        /*box-shadow: inset 0px 1px 2px 1px rgba(0, 0, 0, 0.6);*/
      }
    }

  }
}
</style>
