<template>
  <div v-loading="loading" class="app-container">
    <div id="deviceCharts" ref="deviceCharts" style="width:100%;height:100%" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'
export default {
  name: 'PieChart',
  props: {
    dateQuery: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      echartOption: null,
      loading: false
    }
  },
  watch: {
    dateQuery: {
      handler() {
        this.countNumByLevel()
      },
      deep: true
    }
  },
  mounted() {
    this.countNumByLevel()
  },
  methods: {
    async countNumByLevel() {
      this.loading = true
      const {map, code} = await request({url: api.itMonitor.countNumByLevel, data: {limit: -1, ...this.dateQuery}})
      if (code !== 1) return
      const levelList = await this.findSysDictionaryDetail()
      map.result.forEach(it => {
        levelList.forEach(item => {
          if (+item['dictdataValue'] === +it['alevel']) {
            item['value'] = +it['count']
            item['name'] = item['dictdataName']
            item['itemStyle'] = {color: item['style']}
          }
        })
      })
      this.initEchart(levelList)
      window.setTimeout(() => {
        this.loading = false
      }, 500)
    },
    async findSysDictionaryDetail() {
      const {data, code} = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      })
      if (code === 1) return data
    },
    // 初始化echart
    initEchart(pieData) {
      let options = []
      let slideData = pieData.slice(0, 3)
      let leftData = pieData.slice(3, pieData.length)

      options = {
        tooltip: {
          trigger: 'item'
        },
        title: {
          text: '故障级别',
          textStyle: {
            fontSize: 16
          },
          padding: [30, 20, 20, 20]
        },
        legend: [{
          data: slideData,
          orient: 'verticla',
          top: '45%',
          left: '55%'
        }, {
          data: leftData,
          orient: 'verticla',
          top: '45%',
          left: '75%'
        }],
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['30%', '58%'],
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
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: pieData
          }
        ]
      }

      if (this.echartOption === null) {
        this.echartOption = echarts.init(this.$refs.deviceCharts, 'light')
      }

      this.echartOption.setOption(options, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container{
    padding: 0;
}
</style>

