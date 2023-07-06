<template>
  <div class="traffic-monitor">
    <componentBorder title="流量监控">
      <template>
        <el-select v-model="queryKey" placeholder="请选择" style="width: 50%">
          <el-option
            v-for="item in optionsList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="traffic-monitor-echart-box mb-10">
          <div ref="alarmEcharts" :style="{width: '100%', height: '100%'}" />
        </div>
        <div class="traffic-monitor-table font-12 text-center flex-h-center">
          <div class="flex-1">
            <div class="table-header">发送速率</div>
            <div>32323232</div>
          </div>
          <div class="flex-1">
            <div class="table-header">接收速率</div>
            <div>32323232</div>
          </div>
          <div class="flex-1">
            <div class="table-header">发送丢包数</div>
            <div>32323232</div>
          </div>
          <div class="flex-1 overflow-text-a">
            <div class="table-header">接收丢包数</div>
            <div>32323232</div>
          </div>
        </div>
      </template>
    </componentBorder>
  </div>
</template>

<script>
import componentBorder from '@/views/screen/itMonitor/components/component-border'
import * as echarts from 'echarts'
import { hexToRgba } from '@/utils/utils'
export default {
  name: 'TrafficMonitor',
  components: {
    componentBorder
  },
  data() {
    return {
      queryKey: '',
      optionsList: []
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initEcharts()
    })
  },
  methods: {
    initEcharts() {
      this.alarmEchartObject = echarts.init(this.$refs.alarmEcharts, 'light')
      this.alarmEchartObject.setOption({
        color: this.colors,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          // data: this.legendData
        },
        grid: {
          top: '10%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: '#EFEFEF'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'solid',
              color: '#082949',
              dashOffset: 10
            }
          },
          axisLine: {
            lineStyle: {
              color: '#11acf3'
            }
          },
          axisTick: {
            show: false
          },
          data: [1, 2, 3, 4, 5, 6]
        }],
        yAxis: [{
          type: 'value',
          axisLabel: {
            show: false,
            textStyle: {
              color: '#666'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'solid',
              color: '#082949',
              dashOffset: 10
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              type: 'solid',
              color: '#068DCC'
            }
          },
          axisTick: {
            show: false
          }
        }],
        series: [
          {
            name: '',
            type: 'line',
            smooth: true,
            symbolSize: 0,
            lineStyle: {
              normal: {
                color: '#62e89d',
                shadowBlur: 3,
                shadowColor: hexToRgba('#62e89d', 0.5),
                shadowOffsetY: 8
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                  [
                    { offset: 0, color: hexToRgba('#62e89d', 0.3) },
                    { offset: 1, color: hexToRgba('#62e89d', 0) }
                  ],
                  false
                ),
                shadowColor: hexToRgba('#62e89d', 0.8),
                shadowBlur: 10
              }
            },
            emphasis: {
              focus: 'series'
            },
            data: [22, 33, 44, 55, 22]
          }
        ]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.traffic-monitor{
  flex: 0.4;
  overflow: hidden;
  .traffic-monitor-echart-box{
    min-height:180px;
    flex: 1;
  }
  .traffic-monitor-table{
    .table-header{
      background: #071835;
      padding: 10px;
      box-sizing: border-box;
    }
    .table-header+div{
      padding: 8px;
      box-sizing: border-box;
      white-space: nowrap;
      overflow:hidden;
      text-overflow: ellipsis;
    }
  }
}
.traffic-monitor ::v-deep  .border-content-line{
  position: absolute;
  bottom: 20px;
  right: -35px;
  width: 17%;
  height: 1px;
  background-color: var( --default-color);
  transform: rotate(143deg);
}
.traffic-monitor ::v-deep .el-select{
input{
  background-color: transparent;
}
  .el-input__inner{
    border: 1px solid #082949;
  }
}
</style>
