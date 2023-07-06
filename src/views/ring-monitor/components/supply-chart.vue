<template>
  <div class="flex-v-center flex-colunm">
    <div ref="columnar" class="columnar" :style="{ height: '150px'}" />
    <div class=" font-14" style="margin-top:-15px">{{ name }}</div>
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
      var option = {
        series: [
          {
            type: 'gauge',
            progress: {
              show: true,
              width: 5
            },
            color: {
              x: 0,
              y: 0,
              x2: 1,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: '#00d2ff' // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: '#3a7bd5' // 100% 处的颜色
                }
              ]
            },
            axisLine: {
              lineStyle: {
                width: 5
              }
            },
            axisTick: {
              show: true,
              splitNumber: 2, // 刻线
              length: 6, // 刻线长度
              distance: 1//
            },
            splitLine: { // 分割线
              length: 0,
              lineStyle: {
                width: 3,
                color: '#999'
              }
            },
            axisLabel: { // 刻度字体
              distance: 4,
              color: '#999',
              fontSize: 8
            },
            anchor: {
              show: false,
              showAbove: false,
              size: 8,
              itemStyle: {
                borderWidth: 0
              }
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              fontSize: 12,
              offsetCenter: [0, '70%']
            },
            data: [
              {
                value: this.value
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
