<template>
  <div v-loading="loading" class="trouble-echart">
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
    troubleEchartData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      opmCountList: [],
      opmTypeOption: [
        // 事项类型
        { name: '已确认', key: 1, value: 0 },
        { name: '关闭', key: 2, value: 0 }

      ],
      loading: false,
      myChart: ''
    }
  },
  watch: {
    troubleEchartData: {
      handler(newVal) {
        console.log(1)
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
            x: 'center',
            y: 'bottom',
            itemHeight: 12,
            itemWidth: 16,
            data: ['已确认', '关闭']
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
.trouble-echart{
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
