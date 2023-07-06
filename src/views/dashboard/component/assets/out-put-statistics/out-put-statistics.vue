<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-300">
      <div class="item-content-header">
        <div class="title">出入库统计</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div ref="itemContentBody" class="item-content-body">
        <div ref="outPutStatisticsBoxEcharts" class="echarts-boxs">
          <div id="outPutStatisticsEcharts" ref="outPutStatisticsEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'OutPutStatistics',
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'assetsOutPutStatistics',
      watchItemShow: null,
      dashboardType: 4,
      modelShow: '',
      echartsWidth: 0,
      echartsHeight: 0,
      getDataInterval: null,
      traffic: [
        {
          name: '',
          type: 'line',
          symbol: 'none',
          smooth: true,
          data: [
            ['1', '2'],
            ['2', '2'],
            ['3', '1'],
            ['4', '8'],
            ['5', '12'],
            ['6', '9'],
            ['7', '7'],
            ['8', '0'],
            ['9', '0'],
            ['10', '8'],
            ['11', '8'],
            ['12', '12']
          ]
        }
      ]
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    this.echartsWidth = this.$refs.outPutStatisticsBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    setTimeout(() => {
      this.getTraffic()
    }, 1000)
  },
  methods: {
    // 更改显示配置
    changemodelDefine(val) {
      console.log(val)
      if (val === false) {
        console.log(1, Number(val), '新增')
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      } else {
        // 删除
        console.log(2, Number(val), '删除')
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      }
    },
    getTraffic() { // 带宽流量统计图
      const option = {
        animation: false,
        color: ['#d4d32e'],
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = ''
            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[0].color + '"></span>'
            result += params[0].data[1]
            return result
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            // formatter: '{value}',
            formatter: '',
            textStyle: {
              color: '#333'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        },
        yAxis: [{
          type: 'value',
          show: false,
          axisLabel: {
            textStyle: {
              color: '#666'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E9E9E9'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        }],
        grid: {
          top: '10%',
          left: '0%',
          right: '5%',
          bottom: '2%',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'inside',
            throttle: 50
          }
        ],
        series: this.traffic
      }
      const self = this
      if (self.$refs['outPutStatisticsEcharts']) {
        const myChart = echarts.init(self.$refs['outPutStatisticsEcharts'], 'light')
        myChart.setOption(option, true)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
</style>
