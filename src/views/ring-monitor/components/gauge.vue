<template>
  <div class="grid-content bg-purple-light">
    <div v-show="charts.length" class="box text-center">
      <template v-for="(item,index) in charts">
        <SupplyChart v-if="!!item.show" :key="index" :name="item.hyVname || item.hyDes" :style="{'order':item.priority}" :value="item.status" />
      </template>
    </div>
    <el-empty v-show="!charts.length" style="margin: 0 auto;padding:10px 0" />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import SupplyChart from './supply-chart.vue'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'Gauge',
  components: { SupplyChart },
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
      charts: []
    }
  },
  mounted() {
    this.init(this.list.hyitDevice, this.list.hyitValueType, this.list.res, this.list.dhMenuItem)
  },
  methods: {
    init(hyitDevice, hyitValueType, val, dhMenuItem) {
      if (!hyitDevice || !hyitValueType) return
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
      this.charts = arr
    },
    async findHyitDeviceValueMappings(vid) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValueMappings, data: { hyVid: vid }})
      if (code === 1) return data
    },
    initChart() {
      this.chart = echarts.init(this.$refs['columnar'], 'light')
      this.chart.setOption({
        series: [
          {
            type: 'gauge',
            progress: {
              show: true,
              width: 8
            },
            axisLine: {
              lineStyle: {
                width: 1// 指针宽度
              }
            },
            axisTick: {
              show: false
            },
            splitLine: { // 指针长度
              length: 5,
              lineStyle: {
                width: 1,
                color: '#999'
              }
            },
            axisLabel: {
              distance: 6,
              color: '#999',
              fontSize: 12
            },
            anchor: {
              show: true,
              showAbove: true,
              size: 10,
              itemStyle: {
                borderWidth: 4
              }
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              fontSize: 14,
              offsetCenter: [0, '70%']
            },
            data: [
              {
                value: this.value
              }
            ]
          }
        ]
      })
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
  display: grid;
  grid-template-columns:repeat(4,1fr)
}
</style>
