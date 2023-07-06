<template>
  <div
    v-loading="showLoading"
    element-loading-spinner="el-icon-loading"
    class="grid-content bg-purple-light"
  >
    <div v-show="chartsData.length" class="grid-content bg-purple-light">
      <div ref="echart" style="height:300px;width: 100%" />
      <el-empty v-show="!chartsData.length" style="margin: 0 auto;padding:10px 0" />
    </div>
  </div>

</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'Histogram',
  props: {
    list: {
      type: Object,
      default: () => []
    },
    type: {
      type: Number,
      default: 0
    }

  },
  data() {
    return {
      showLoading: true,
      chartsData: []
    }
  },
  watch: {

  },
  mounted() {
    this.init(this.list.hyitDevice, this.list.hyitValueType, this.list.res, this.list.dhMenuItem)
  },
  methods: {
    init(hyitDevice, hyitValueType, val, dhMenuItem) {
      if (!hyitDevice || !hyitValueType) {
        this.showLoading = false
        return
      }
      let arr = []
      for (let i = 0; i < hyitValueType.length; i++) {
        const hyitValueTypeEle = hyitValueType[i]
        for (let j = 0; j < hyitDevice.length; j++) {
          const hyitDeviceEle = hyitDevice[j]
          let str = this.$tool.humpStr(hyitValueTypeEle['hyFieldName'])
          if (hyitDeviceEle['hyType'] === hyitValueTypeEle['hyTypeId']) {
            const priority = val.find(
              it => it['vid'] === hyitDeviceEle['hyVid']
            )
            arr.push({
              ...hyitDeviceEle,
              status: +hyitDeviceEle[str] || 0,
              priority: priority?.priority || 0,
              show: priority?.history
            })
          }
        }
      }
      const chartsLabel = arr.map(it => it['hyDes'])
      this.chartsData = arr.map(it => it['status'])
      this.$nextTick(() => {
        this.initChart(chartsLabel, this.chartsData)
      })
    },
    async findHyitDeviceValueMappings(vid) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValueMappings, data: { hyVid: vid, limit: -1 }})
      if (code === 1) return data
    },
    initChart(chartsLabel, chartsData) {
      var option
      option = {
        xAxis: {
          type: 'category',
          data: chartsLabel,
          axisLine: { show: true, lineStyle: { color: '#D9D9D9' }},
          axisLabel: { color: '#666' },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#f3f3f3',
              width: 1
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: true, lineStyle: { color: '#D9D9D9' }},
          axisLabel: { show: false },
          axisTick: {
            show: true
          },
          splitLine: {
            lineStyle: {
              color: '#f3f3f3'
            }
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        radius: '100%',
        barWidth: 40,
        grid: [{
          left: 0,
          right: 0,
          bottom: 40,
          top: 20
        }],
        series: [
          {
            data: chartsData,
            type: 'bar',
            showBackground: true,
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
          }
        ]
      }
      this.showLoading = false
      var myChart = echarts.init(this.$refs['echart'])
      option && myChart.setOption(option)
    }
  }
}
</script>

<style scoped>
.card{
  /* width: 22%; */
  /* flex-basis: 22%; */
  margin-bottom: 10px;
}
.box{
}
</style>
