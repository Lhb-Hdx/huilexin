<template>
  <div
    v-loading="showLoading"
    element-loading-spinner="el-icon-loading"
    class="grid-content bg-purple-light"
  >
    <div v-show="charts.length" class="box text-center flex-h-center">
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
      showLoading: true,
      charts: []
    }
  },
  mounted() {
    this.init(this.list.hyitDevice, this.list.hyitValueType, this.list.res, this.list.dhMenuItem)
  },
  methods: {
    init(hyitDevice, hyitValueType, val, dhMenuItem) {
      this.showLoading = false

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
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValueMappings, data: { hyVid: vid, limit: -1 }})
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
              width: 0
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 30
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
              length: 1,
              lineStyle: {
                width: 12,
                color: '#999'
              }
            },
            axisLabel: {
              distance: -30,
              color: '#999',
              fontSize: 30
            },
            anchor: {
              show: true,
              showAbove: true,
              size: 10,
              itemStyle: {
                borderWidth: 4
              }
            },
            pointer: {
              icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
              length: '10%',
              width: 0,
              offsetCenter: ['50%', '50%']
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
  margin-bottom: 10px;
}
.box{
  flex-wrap:wrap;
}
</style>
