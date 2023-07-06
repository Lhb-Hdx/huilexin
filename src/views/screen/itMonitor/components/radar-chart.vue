<template>
  <div class="radar-chart">
    <div id="main" ref="radarChart" />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  data() {
    return {
      deviceType: [], // 设备类型数
      deviceCount: [], // 不同设备下的数量，未算出，id连接
      option: {
        // color: 'red',
        color: '#fe4244',
        title: {
          // text: 'Basic Radar Chart'
        },
        legend: {
          // data: ['Allocated Budget', 'Actual Spending']
        },
        tooltip: {
          trigger: 'item'
        },
        radar: {
          // shape: 'circle',
          indicator: [
          ],
          splitArea: {
            areaStyle: {
              color: ['#2650f8', '#428BD4', '#64AFE9', '#428BD4', '#1a5c88'],
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 10
            }
          }
        },
        series: [
          {
            name: '设备类型',
            type: 'radar',
            data: [
              // {
              //   value: [4200, 3000, 20000, 35000, 50000, 18000, 50000, 18000],
              //   name: 'Allocated Budget'
              // },
            ]
          }
        ]
      }
    }
  },
  computed: {

  },
  async mounted() {
    await this.getDeviceType()
    await this.getDeviceCount()
    this.initChart()
  },
  methods: {
    async getDeviceType() {
      const { code, data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      })
      if (code !== 1) return
      this.deviceType = data
    },
    async getDeviceCount() {
      const { code, data } = await request({
        url: api.itMonitor.getHyitHostTypeStatictics,
        data: { agents: this.agentsIds }
      })
      if (code !== 1) return
      this.deviceCount = data
    },
    initChart() {
      const deviceList = []
      // this.option.radar.indicator = [1, 2, 3]
      if (this.deviceType.length > 0 && this.deviceCount.length > 0) {
        this.deviceType.forEach(item => {
          this.deviceCount.forEach(item2 => {
            if (item.id === item2.devType) {
              deviceList.push({ ...item, ...item2 })
            }
          })
        })
        console.log(deviceList, '22222222222222222222')

        // const myChart = echarts.init(this.$refs.radarChart)
        const deviceCountList = deviceList.map(item => item.count)
        const deviceCountListObj = { value: deviceCountList }
        const deviceNameList = deviceList.map(item => { return { name: item.dictdataName, max: item.count + 10 } })

        this.option.radar.indicator = deviceNameList
        this.option.series[0].data.push(deviceCountListObj)
        var chartDom = document.getElementById('main')
        var myChart = echarts.init(chartDom)

        // console.log(deviceCountList, '22222222222222222222')
        // console.log(deviceNameList, '22222222222222222222')
        console.log(this.option.series[0].data, '333333333')
        console.log(this.option.radar.indicator, '333333333')
        this.option && myChart.setOption(this.option)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.radar-chart {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  // background-color: #aaee;
  height: 100%;
  #main {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    // background-color: #aaee;
    height: 100%;
    // width: 100% !important;
    // height: 300px !important;
  }
}
</style>
