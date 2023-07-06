<template>
  <div class="worker">
    <div class="flex-v-between">
      <div>
        <span v-for="(item,index) in list" :key="item.name" :class="['worker-title',{active:typeIndex===index},'mr-20']" @click="changeType(index,item.hyDeviceId)">
          {{ item.name }}
        </span>
      </div>
      <div>
        <el-date-picker
          v-model="dateTime"
          class="woker-select"
          format="yyyy 年 MM 月 dd 日"
          placeholder="选择日期"
          type="date"
          value-format="yyyy-MM-dd"
          :picker-options="setDisabled"
          @change="init"
        />
      </div>
    </div>
    <div class="woker-box mt-10 flex">
      <div class="woker-echart">
        <div id="wokerEcharts" ref="alarmEcharts" :style="{width: '100%', height: '100%'}" />
      </div>
      <div class="woker-woker-box">
        <div class="woker-type flex">
          <div>进入人员</div>
          <div>卡号</div>
          <div>最后进入时间</div>
        </div>
        <div class="woker-list">
          <div v-for="(it) in ownerList" :key="it.accessId" class="woker-item flex-h-center">
            <el-avatar :size="26" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
            <div class="ml-10">{{ it.ownerName }}</div>
            <div class="ml-10 mr-10 linear-1">{{ it.cardNo }}</div>
            <div class="woker-item-time">{{ it.ctime }}</div>
          </div>
          <div v-if="!ownerList.length" class="body-empty">暂无人员数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { hexToRgba } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'DeviceWorker',
  data() {
    return {
      typeIndex: 0,
      alarmEchartData: [],
      alarmEchartObject: null,
      echartsLabel: Array(24).fill(0).map((time, index) => String(index).padStart(0, 2) + ':00'),
      colors: ['#00b894', '#0984e3'],
      list: [{ name: '机房前门监控入口', hyDeviceId: 215 }, { name: '机房后门监控入口', hyDeviceId: 193 }],
      dateTime: '',
      hyDeviceId: 215,
      ownerList: [],
      setDisabled: {
        disabledDate(time) {
          return time.getTime() > Date.now() // 可选历史天、可选当前天、不可选未来天
        }
      }
    }
  },
  async mounted() {
    const { Y, M, D } = this.$tool.getNowDate('object')
    this.dateTime = `${Y}-${M}-${D}`
    // this.hyDeviceId = 193
    await this.init()
  },
  methods: {
    async changeType(index, hyDeviceId) {
      this.hyDeviceId = hyDeviceId
      this.typeIndex = index
      await this.init()
    },
    async init() {
      const history = await this.findOwnerNumByHour()
      const timeList = history && history['timeList']
      let echartsData = Array(24).fill(0)
      if (timeList) {
        echartsData = this.$tool.setRingHistoryAlarm(history['timeList'], '', 'count', this.dateTime)
        if (timeList.length) {
          this.alarmEchartData = [this.mapEchartData('', this.colors[0], echartsData)]
          this.createEcharts()
        } else {
          this.alarmEchartData = [this.mapEchartData('', this.colors[0], this.$tool.setRingHistoryAlarm([], '', 'count', this.dateTime))]
          this.createEcharts()
        }
      }
      const logList = await this.findPowerAccessLog()
      const owners = await this.findEsOwner()
      const esCards = await this.findEsCard()
      const ownerList = []
      console.log(logList,
        owners,
        esCards)
      for (const log of logList) {
        let item = { ...log }
        const idx = owners.find(it => it['ownerId'] === log['ownerId'])
        if (!idx) {
          item = { ...log, ownerName: '未知人员', ctime: log['ctime'] }
        } else {
          item = { ...log, ownerName: idx['ownerName'], ctime: log['ctime'] }
        }

        // item['inTime'] = idx['ctime']
        // const escard = esCards.find(({ ownerId }) => ownerId === log['ownerId'])
        // if (escard)item['esacard'] = escard.cardNo
        ownerList.push(item)
      }
      this.ownerList = ownerList
    },
    mapEchartData(name, color, data) {
      return {
        name: name,
        type: 'line',
        smooth: true,
        symbolSize: 0,
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
    async findOwnerNumByHour(hyDeviceId) {
      let { map, code } = await request({ url: api.powerEnv.findOwnerNumByHour, data: { hyDeviceId: this.hyDeviceId, time: this.dateTime, limit: -1 }})
      if (code === 1) return map
    },
    async findEsCard() {
      let { data, code } = await request({ url: api.powerEnv.findEsCard, data: { limit: -1 }})
      if (code === 1) return data
    },
    async findPowerAccessLog(hyDeviceId) {
      let { data, code } = await request({ url: api.powerEnv.findPowerAccessLog, data: { hyDeviceId: this.hyDeviceId, time: this.dateTime, limit: -1 }})
      if (code === 1) return data
    },
    async findEsOwner() {
      let { data, code } = await request({ url: api.powerEnv.findEsOwner, data: { limit: -1 }})
      if (code === 1) return data
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
    }
  }
}
</script>

<style lang="scss" scoped>
.worker{
  padding: 25px 30px;
  box-sizing: border-box;
  overflow:hidden;
  height:100%;
  display: flex;
  flex-direction: column;
  .woker-box{
    flex: 1;
    overflow:hidden;
  }
  .body-empty{
    display:flex;
    align-items: center;
    justify-content:center;
    color: var(--power-srceen-text-color);
    height:100%;
  }
}
.worker-title{
  color: #9EE6FF;
  position: relative;
  cursor: pointer;
  opacity: .7;
  font-size: 14px;
&.active{
  opacity:1;
  &:after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 0;
    width: 50%;
    height: 3px;
    background-color: #9EE6FF;
  }
}
}
.woker-echart{
  flex:1;
}
.woker-woker-box{
  flex:1;
  display:flex;
  flex-direction: column;
  .woker-type{
    background-color: #0A2B4C;
    color: var(--power-srceen-text-color);
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
    flex: 1;
    &::-webkit-scrollbar-thumb{//滑块颜色
      background-color: var(--power-srceen-text-color);
    }
    &::-webkit-scrollbar-track{//导轨颜色
      background-color: #324863;
    }
    .woker-item{
      color: var(--power-srceen-text-color);
      border-bottom: .5px solid #666;
      padding: 8px;
      margin-top: 5px;
      .ml-10{
        flex:1;
      }
    }
  }
}
::v-deep .woker-select{
  .el-input__inner{
    background: transparent;
    border: 1px solid #092B4B;
  }
}
</style>
<style>
  .woker-title-select{
    /*background-color: transparent;*/
  }
</style>
