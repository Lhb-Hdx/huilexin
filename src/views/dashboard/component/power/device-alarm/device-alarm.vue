<template>
  <dv-border-box-12 ref="border" :color="['#1A728B']">
    <div class="alarm-box">
      <h3 class="alarm-title">系统告警</h3>
      <div class="alarm-num mt-30 flex">
        <div class="text-center flex-1">
          <div class="alarm-num-num">{{ newAlarmList.length }}</div>
          <div class="alarm-num-title">今日新增</div>
        </div>
        <div class="text-center flex-1">
          <div class="alarm-num-total">{{ newAlarmList.filter(it=>+it.hyStatus===0).length }}</div>
          <div class="alarm-num-title">待确认</div>
        </div>
      </div>

      <div ref="itemContentBody" class="item-content-body my-10">
        <div ref="alarmBoxEcharts" class="echarts-boxs">
          <div id="alarmEcharts" ref="alarmEcharts" :style="{width: '100%', height: 150 + 'px'}" />
        </div>
      </div>

      <div class="last-warn">
        <h3>最新告警</h3>
        <div class="last-warn-list">
          <div v-for="(item) in newAlarmList" :key="item.hyVid" class="list-item flex">
            <div :style="{background:$tool.formatStr(item.hyLevel,'5:#FE4D4E,4:#FE830C,3:#268CF2,2:#FE4D4E,1:#00B285')}" class="list-item-left">
              <div>{{ item.hyCtime.split(" ")[0] }}</div>
              <div class="mt-5">{{ item.hyCtime.split(" ")[1] }}</div>
            </div>
            <div class="list-item-center pointer">
              <div>
                <span>[{{ $tool.matchData(eventList,item,'hyEventId','hyEventName','hyEventId') }}]</span>
                <span class="mx-6">[{{ $tool.matchData(deviceList,item,'hyDeviceId','hyAlias','hyDeviceId') }}]</span>
                <span>{{ item.hyAlarmDesc }}</span>
              </div>
            </div>
            <div :style="{color:$tool.formatStr(it.hyStatus,'0:#F56C6C,1:#999')}" class="list-item-right">{{ $tool.formatStr(it.hyStatus,'0:未确认,1:已确认') }}</div>
          </div>
          <!--          <el-empty v-if="newAlarmList.length===0" class="py-2" />-->
        </div>
      </div>
    </div>
  </dv-border-box-12>
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
      colors: ['#00b894', '#0984e3', '#ff7f50', '#ff4757', '#3dc1d3'],
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
    this.$refs.border.initWH()

    this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    console.log('ssddsd')
    let levels = await this.hyitAlarmLevel()
    let temp = await this.getVideoAlarmLogDayStatic()
    // const temp = { timeList: [{ count: 56, level: 1, time: 10 }, { count: 88, level: 2, time: 10 }, { count: 22, level: 3, time: 10 }, { count: 41, level: 3, time: 12 }, { count: 77, level: 4, time: 10 }, { count: 2, level: 5, time: 10 }, { count: 56, level: 1, time: 10 }] }
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
    const temptime = Array(24).fill(0)

    let series = []
    Object.values(chartList).forEach((it, index) => {
      series.push({
        name: levels.find(level => level.hyLevel === it[0]['hyLevel']).hyLevelName || '',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        lineStyle: {
          normal: {
            color: this.colors[index],
            shadowBlur: 3,
            shadowColor: hexToRgba(this.colors[index], 0.5),
            shadowOffsetY: 8
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: hexToRgba(this.colors[index], 0.3) },
                { offset: 1, color: hexToRgba(this.colors[index], 0) }
              ],
              false
            ),
            shadowColor: hexToRgba(this.colors[index], 0.8),
            shadowBlur: 10
          }
        },
        emphasis: {
          focus: 'series'
        },
        data: temptime.map((tep, ind) => {
          const idx = it.findIndex(time => time.time === ind)
          if (idx !== -1) return +it[idx]['count']
          return tep
        })
      })
    })
    const label = Array(24).fill(0).map((time, index) => String(index).padStart(0, 2) + ':00')

    if (chartList.toString() === '[object Object]') {
      console.log(555)
      series.push({
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
    }
    this.echartsLabel = label
    this.alarmEchartData = series
    this.createEcharts()
  },
  methods: {
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
      const day = String(date.getDay()).padStart(2, 0)

      let { code, data } = await request({ url: api.powerEnv.findHyitAlarmLog, data: {
        stime: `${year}-${month}-${day} 00:00:00`,
        etime: `${year}-${month}-${day} 23:59:59`
      }})
      if (code !== 1) return
      this.newAlarmList = data.slice(0, 4)
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
        legend: {
          // data: this.legendData
        },
        grid: {
          top: 0,
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
  padding: 20px;
  box-sizing: border-box;

 .alarm-title{
    color: #EFEFEF;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 0;
      width: 50px;
      height: 4px;
      background-color: #EFEFEF;
    }
  }
}
.alarm-num{
  .alarm-num-num{
    color: red;
    font-size: 35px;
    font-weight: 400;
    margin: 10px 0;
  }
  .alarm-num-total{
    color: #EFEFEF;
    font-size: 35px;
    font-weight: 400;
    margin: 10px 0;
  }
  .alarm-num-title{
    margin-top: 10px;
    color: #999;
    font-size: 12px;
  }
}
.last-warn{
  h3{
  margin: 0 0 15px 0;
  }
  color: #EFEFEF;
  .last-warn-list{
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
        //margin-left: 10px;
        flex: 1;
        //white-space:nowrap;
        //overflow:hidden;
        //text-overflow:ellipsis;
      }
      .list-item-right{
        margin-right: 20px;
        color: #999;
      }
    }

  }
}
</style>
