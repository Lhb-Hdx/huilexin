<template>
  <div v-loading="loading" class="opm-echart">
    <div ref="echart" style="height: 100%" class="echart-box" />
  </div>
</template>

<script>

import * as echarts from 'echarts'

export default {
  name: 'OpmEchart',
  props: {
    dateQuery: {
      type: Object,
      default: () => {}
    },
    opsOrderProblemEchartData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      opmCountList: [],
      opmTypeOption: [
        // 事项类型
        { name: '待处理', key: 1, value: 0 },
        { name: '处理中', key: 2, value: 0 },
        { name: '成功处理', key: 3, value: 0},
        { name: '处理失败', key: 4, value: 0}
      ],
      loading: false,
      myChart: ''
    }
  },
  watch: {
    opsOrderProblemEchartData: {
      handler(newVal) {
        console.log(2)
        if (newVal.length > 0) {
          newVal.forEach(item => {
            const idx = this.opmTypeOption.findIndex(v => v.name === item.name)
            if (idx !== -1) {
              this.opmTypeOption[idx].value = item.value
            }
          })
        }
        this.$nextTick(() => {
          this.initData()
        })
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // this.initData()
  },
  methods: {
    initData() {
      this.loading = true
      this.initEchart()
      window.setTimeout(() => {
        this.loading = false
      }, 500)
    },

    initEchart() {
      var chartDom = this.$refs.echart
      if (this.myChart != null && this.myChart !== '' && this.myChart !== undefined) {
        this.myChart.dispose()// 销毁
      }
      this.myChart = echarts.init(chartDom)
      var option

      option = {
        tooltip: {
          trigger: 'item'
        },
        legend: [

          {
            // bottom: '10%',
            // left: '25%',
            x: 'center',
            bottom: '10%',
            itemHeight: 12,
            itemWidth: 16,
            orient: 'horizontal',
            data: ['待处理', '处理中']
          },
          {
            // bottom: '0%',
            // left: '25%',
            x: 'center',
            bottom: '0%',
            itemHeight: 12,
            itemWidth: 16,
            orient: 'horizontal',
            data: ['成功处理', '处理失败']
          }
        ],
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.opmTypeOption
          }
        ]
      }

      option && this.myChart.setOption(option)
    }
  }
}
</script>

<style lang="scss" scoped>
.opm-echart{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .echart-box{
        flex: 1;
       width: 100%;
       height: 100%;
    }
}
</style>
