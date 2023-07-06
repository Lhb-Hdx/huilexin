<template>
  <div class="ring-echart-box">
    <div :ref="refKey" class="echart-content" :class="refKey" style="width: 100%" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'RingEchart',
  props: {
    labelTitle: {
      type: String,
      default: ''
    },
    num: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: '%'
    },
    refKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      devStatus: [
        { value: 0, name: '在线设备' },
        { value: 0, name: '离线设备' }
      ]
    }
  },
  watch: {
    num: {
      async handler() {
        await this.setPreData()
        this.loadEcharts()
      },
      deep: true
    }
  },
  async mounted() {
    await this.setPreData()
    this.loadEcharts()
  },
  methods: {
    // 加载统计图
    loadEcharts() {
      const self = this
      const myChart = echarts.init(self.$refs[`${this.refKey}`])
      const option = {
        color: ['#00b285', '#fe4d4e'],
        graphic: {
          elements: [
            {
              type: 'text',
              left: 'center', // 相对父元素居中
              top: '36%',
              style: {
                fill: '#333333',
                text: [`${self.labelTitle}`],
                font: '12px Arial Normal'
              }
            },
            {
              type: 'text',
              left: 'center', // 相对父元素居中
              top: '50%',
              style: {
                fill: '#333333',
                text: [`${self.num.toFixed()}%`],
                font: '19px Arial Normal'
              }
            }
          ]
        },
        series: [
          {
            type: 'pie',
            radius: ['70%', '80%'],
            avoidLabelOverlap: false,
            silent: true, // 不响应鼠标事件
            label: {
              show: false,
              position: 'center'
            },
            itemStyle: {
              borderRadius: 5,
              borderColor: '#fff',
              borderWidth: 1
            },
            labelLine: {
              show: false
            },
            data: self.devStatus
          }
        ]
      }
      myChart.setOption(option, true)
    },
    async setPreData() {
      return new Promise(resolve => {
        const notOnline = 100 - Number(this.num)
        const getOnline = this.$tool.findDataItemByAttr(this.devStatus, 'name', '在线设备')
        const getOfOnline = this.$tool.findDataItemByAttr(this.devStatus, 'name', '离线设备')
        this.$set(this.devStatus[getOnline.index], 'value', this.num)
        this.$set(this.devStatus[getOfOnline.index], 'value', notOnline)
        resolve()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.ring-echart-box {
  height: 100%;
  position: relative;
  .echart-content {
    height: 100px;
    width: 100px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    position: absolute;
    top: 50%;
    left: 30%;
    transform: translate(-50%, -50%);
  }
}
</style>
