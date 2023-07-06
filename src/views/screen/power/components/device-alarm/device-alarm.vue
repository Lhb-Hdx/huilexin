<template>
  <!--  <dv-border-box-12 ref="border" :color="['#1A728B']">-->
  <div class="alarm-box">
    <div class="alarm-content">
      <div>
        <h3 class="alarm-title">系统告警</h3>
        <div class="alarm-num mt-30 flex">
          <div class="text-center">
            <div class="alarm-num-num">{{ newAlarmList.length }}</div>
            <div class="alarm-num-title">今日新增</div>
          </div>
          <div class="text-center">
            <div class="alarm-num-total">{{ newAlarmList.filter(it=>+it.hyStatus===0).length }}</div>
            <div class="alarm-num-title">待确认</div>
          </div>
        </div>
        <div ref="itemContentBody" class="item-content-body my-10">
          <div ref="alarmBoxEcharts" class="echarts-boxs">
            <div id="alarmEcharts" ref="alarmEcharts" :style="{width: '100%', height: 200 + 'px'}" />
          </div>
        </div>
      </div>
      <div style="flex:1;overflow: hidden;">
        <div class="last-warn">
          <h3>最新告警</h3>
          <div class="last-warn-list">
            <div v-for="(item) in newAlarmList" :key="item.hyAlarmId" class="list-item flex">
              <div :style="{background:$tool.formatStr(item.hyLevel,'5:#FE4D4E,4:#FE830C,3:#268CF2,2:#FE4D4E,1:#00B285')}" class="list-item-left">
                <div>{{ item.hyCtime.split(" ")[0] }}</div>
                <div class="mt-5">{{ item.hyCtime.split(" ")[1] }}</div>
              </div>
              <div class="list-item-center pointer flex-1 flex px-6 overflow-text-a" style="flex-shrink: 2">
                <div class="overflow-text-a"> {{ item.hyAlarmDesc }}</div>
                <div class="mt-6 overflow-text-a">
                  [{{ $tool.matchData(eventList,item,'hyEventId','hyEventName','hyEventId') }}] [{{ $tool.matchData(deviceList,item,'hyDeviceId','hyAlias','hyDeviceId') }}]
                </div>
              </div>
              <div :style="{color:$tool.formatStr(item.hyStatus,'0:#F56C6C,1:#999')}" class="list-item-right mr-10">{{ $tool.formatStr(item.hyStatus,'0:未确认,1:已确认') }}</div>
            </div>
            <div v-if="newAlarmList.length===0" class="py-2 flex-center  empty">
              暂无告警数据
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dateFormat, hexToRgba } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'
export default {
  name: 'DeviceAlarm',
  data() {
    return {
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      alarmEchartObject: null,
      alarmEchartData: [],
      colors: {
        5: '#FE4D4E',
        4: '#FE830C',
        3: '#268CF2',
        2: '#FE4D4E',
        1: '#00B285'
      },
      level: [],
      newAlarmEchartsObj: null,
      newAlarmList: [

      ],
      alarmSubType: [],
      alarmLogCount: 0,
      chnList: [],
      deviceList: [],
      eventList: []
    }
  },
  async mounted() {
    await this.findHyitAlarmLog()
    await this.hyitAlarmLevel()
    await this.findHyitDevice()
    await this.findHyitEvent()
    // this.$refs.border.initWH()

    this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    let levels = await this.hyitAlarmLevel()
    let temp = await this.getVideoAlarmLogDayStatic()
    let chartList = {}
    for (let j = 0; j < temp.timeList.length; j++) {
      let tempItem = temp.timeList[j]
      if (!chartList[tempItem['hyLevel']]) {
        chartList[tempItem['hyLevel']] = [tempItem]
      } else {
        chartList[tempItem['hyLevel']].push(tempItem)
      }
    }
    console.log(chartList)

    let series = []
    Object.values(chartList).forEach((it, index) => {
      const level = levels.find(level => level.hyLevel === it[0]['hyLevel'])
      console.log(this.colors[level['hyLevel']])
      series.push(this.initEchart(level.hyLevelName || '', this.colors[level['hyLevel']], this.$tool.setRingHistoryAlarm(it, '', 'count')))
    })
    const label = Array(24).fill(0).map((time, index) => String(index).padStart(0, 2) + ':00')

    this.echartsLabel = label
    this.alarmEchartData = series
    if (Object.values(chartList).length <= 0) {
      series.push(this.initEchart('', this.colors[5], this.$tool.setRingHistoryAlarm([], '', 'count')))
    }
    this.createEcharts()
  },
  methods: {
    initEchart(name, color, data) {
      return {
        name: name,
        type: 'line',
        smooth: true,
        symbolSize: 0,
        color: hexToRgba(color, 0.5),
        lineStyle: {
          normal: {
            color: color,
            shadowBlur: 3,
            shadowColor: hexToRgba(color, 0.5),
            shadowOffsetY: 8
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: hexToRgba(color, 0.3) },
                { offset: 1, color: hexToRgba(color, 0) }
              ],
              false
            ),
            shadowColor: hexToRgba(color, 0.8),
            shadowBlur: 10
          }
        },
        emphasis: {
          focus: 'series'
        },
        data: data
      }
    },
    async findHyitDevice() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevice,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.deviceList = data
    },
    async showDHAlarmLogByAll() {
      let { code, map } = await request({ url: api.powerEnv.showDHAlarmLogByAll, data: {}})
      if (code !== 1) return
      return map
    },
    async findHyitAlarmLog() {
      const date = new Date()
      const year = String(date.getFullYear())
      const month = String(date.getMonth() + 1).padStart(2, 0)
      const day = String(date.getDate()).padStart(2, 0)

      let { code, data } = await request({ url: api.powerEnv.findHyitAlarmLog, data: {
        stime: `${year}-${month}-${day} 00:00:00`,
        etime: `${year}-${month}-${day} 23:59:59`,
        limit: -1
      }})
      if (code !== 1) return
      this.newAlarmList = data
    },
    async hyitAlarmLevel() {
      let { code, data } = await request({ url: api.powerEnv.findHyitAlarmLevel, data: {}})
      if (code !== 1) return
      this.level = data
      return data
    },
    async findHyitEvent() {
      let { code, data } = await request({ url: api.linkageManage.findHyitEvent, data: { limit: -1 }})
      if (code !== 1) return
      this.eventList = data
      return data
    },
    createEcharts() {
      const that = this
      this.alarmEchartObject = echarts.init(document.getElementById('alarmEcharts'), 'light')
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
        // legend: {
        //   // data: this.legendData
        //   show: false
        // },
        grid: {
          top: '3%',
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
              type: 'dashed',
              color: '#E9E9E9',
              dashOffset: 10
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              type: 'dashed',
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        }],
        series: this.alarmEchartData
      })
    },
    async getVideoAlarmLogDayStatic() {
      console.log('909090')
      const date = new Date()
      const sTime = dateFormat('YYYY-mm-dd', date)
      // const eTime = `${dateFormat('YYYY-mm-dd', date)} 23:59:59`
      return await request({
        url: api.powerEnv.showDayDHAlarmLogByHour, data: { sTime }
      }).then(res => {
        if (res.code === 1) {
          return res.map
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-box {
  padding: 20px 30px;
  box-sizing: border-box;
  height: 100%;
  .alarm-content{
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    &::-webkit-scrollbar-thumb{//滑块颜色
      background-color: var(--power-srceen-text-color);
    }
    &::-webkit-scrollbar-track{//导轨颜色
      background-color: #324863;
    }
  }
 .alarm-title{
    color: #9EE6FF;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 0;
      width: 50px;
      height: 3px;
      background-color: #9EE6FF;
    }
  }
}
.alarm-num{
  &>div{
    flex:1
  }
  .alarm-num-num{
    color: #ff4c4c;
    font-size: 32px;
    font-weight: 500;
  }
  .alarm-num-total{
    color: var(--power-srceen-text-color);
    font-size: 35px;
    font-weight: 400;
  }
  .alarm-num-title{
    margin-top: 10px;
    color: #999;
    font-size: 12px;
  }
}
.last-warn{
  height:100%;
  overflow:hidden;
  h3{
  margin: 5px 0 30px 0;
  }
  color: var(--power-srceen-text-color);
  .last-warn-list{
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    padding-bottom: 44px;
    &::-webkit-scrollbar-thumb{//滑块颜色
      background-color: var(--power-srceen-text-color);
    }
    &::-webkit-scrollbar-track{//导轨颜色
      background-color: #324863;
    }
    .list-item{
      font-size:12;
      align-items: center;
      margin-bottom: 10px;
        border-bottom:.5px solid #002B43;
      .list-item-left{
        padding: 7px 5px 5px 5px;
background:#002B43;
        text-align: center;
      }
      .list-item-center{
        height: 100%;
        flex: 1;
        flex-direction: column;
        //white-space:nowrap;
        //overflow:hidden;
        //text-overflow:ellipsis;
      }
      .list-item-right{
        //margin-right: 20px;
        min-width:40px;
        color: #999;
      }
    }

  }
}

.empty{
  color: var(--power-srceen-text-color);
  height:70%;
  overflow: hidden;
}
</style>
