<template>
  <dv-border-box-12 ref="border" :color="['#1A728B']">
    <div class="worker">
      <div class="flex">
        <h3 :class="['worker-title',{active:typeIndex===0}]" @click="changeType(0)">
          机房监控入口
        </h3>
        <h3 :class="['worker-title','ml-40',{active:typeIndex===1}]" @click="changeType(1)">
          机房监控入口
        </h3>
      </div>
      <div class="mt-20 flex">
        <div class="woker-echart">
          <div id="wokerEcharts" ref="alarmEcharts" :style="{width: '100%', height: '100%'}" />
        </div>
        <div class="woker-woker-box">
          <div class="woker-type flex">
            <div>进入人员</div>
            <div>进入时间</div>
          </div>
          <div class="woker-list">
            <div v-for="(it,index) in 8" :key="index" class="woker-item flex-h-center">
              <el-avatar />
              <div class="ml-10">张晓斌</div>
              <div class="woker-item-time">2022-03-02 22:11:22</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </dv-border-box-12>
</template>

<script>
import * as echarts from 'echarts'
import { hexToRgba } from '@/utils/utils'

export default {
  name: 'DeviceWorker',
  data() {
    return {
      typeIndex: 0,
      alarmEchartData: [],
      echartsLabel: Array(24).fill(0).map((time, index) => String(index).padStart(0, 2) + ':00'),
      colors: ['#00b894', '#0984e3'],
      alarmEchartObject: null
    }
  },
  mounted() {
    this.alarmEchartData.push({
      name: '',
      type: 'line',
      smooth: true,
      symbolSize: 8,
      lineStyle: {
        normal: {
          color: this.colors[0],
          shadowBlur: 3,
          shadowColor: hexToRgba(this.colors[0], 0.5),
          shadowOffsetY: 8
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
            [
              { offset: 0, color: hexToRgba(this.colors[0], 0.3) },
              { offset: 1, color: hexToRgba(this.colors[0], 0) }
            ],
            false
          ),
          shadowColor: hexToRgba(this.colors[0], 0.8),
          shadowBlur: 10
        }
      },
      emphasis: {
        focus: 'series'
      },
      data: Array(24).fill(0)
    })
    this.createEcharts()
    this.$refs.border.initWH()
  },
  methods: {
    changeType(index) {
      this.typeIndex = index
      this.$refs.border.initWH()
    },
    createEcharts() {
      const that = this
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
          axisLine: {
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          },
          data: that.echartsLabel
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
              color: '#999',
              dashOffset: 10
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
        series: this.alarmEchartData
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.worker{
  padding: 20px;
  box-sizing: border-box;
  overflow:hidden;
}
.worker-title{
  color: #9EE6FF;
  position: relative;
  cursor: pointer;
&.active{
  color: #9EE6FF;
  &:after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 0;
    width: 50px;
    height: 4px;
    background-color: #9EE6FF;
  }
}
}
.woker-echart{
  flex:1;
}
.woker-woker-box{
  flex:1;
  .woker-type{
    background-color: #0A2B4C;
    color: #EFEFEF;
    &>div{
      flex: 1;
      padding: 10px 20px;
      text-align: center;
    }
  }
  .woker-list{
    margin: 10px 0;
    overflow: hidden;
    overflow-y: scroll;
    height: 180px;
    &::-webkit-scrollbar-thumb{//滑块颜色
      background-color: #EFEFEF;
    }
    &::-webkit-scrollbar-track{//导轨颜色
      background-color: #324863;
    }
    .woker-item{
      color: #EFEFEF;
      border-bottom: .5px solid #666;
      padding: 8px;
      margin-top: 5px;
      .ml-10{
        flex:1;
      }
    }
    .body-empty{
      display:flex;
      align-items: center;
      justify-content:center;
      color: var(--power-srceen-text-color);
      height:100%;
    }
  }
}
</style>
