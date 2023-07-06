<template>
  <div class="alarm-trend-container">
    <!--<componentBorder title="告警趋势" style="height:88%;">-->

    <template>
      <!-- <div class="alarm-trend-date-total flex-v-between ">
          <div v-for="item in totalList" :key="item.title">
            <div class="total-title">{{ item.title }}</div>
            <div class="total-num font-18 mt-10 text-center">{{ item.num }}</div>
          </div>
        </div> -->
      <div class="top-title">
        故障趋势
      </div>
      <div class="alarmTrendWrapper">
        <!-- `${echartsHeight}` + 'px' -->
        <div ref="alarmTrendEchartBox" class="alarm-trend-echart-box my-10 ">
          <div id="alarmEcharts" ref="alarmEcharts" :style="{width: '100%', height:220+'px'}" />
        </div>
        <div class="alarm-trend-list">
          <div v-for="(item, index) in alarm_data" :key="index" class="listalarm flex-v-between pr-10">
            <div class="flex-1 overflow-text-a mr-10">{{ item.description }}</div>
            <!-- <div :style="{ color: $tool.formatStr(item.status, '0:#FF2626,1:#999') }">
                {{ $tool.formatStr(item.status, '0:待处理,1:已处理') }}

              </div> -->
            <div>
              <span :style="{ color: setAlarmStatusColor(item.status) }">{{ setAlarmStatus(item.status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- </componentborder> -->
  </div>
</template>

<script>
import * as echarts from 'echarts'
import api from '@/api/api'
import request from '@/utils/request'
import { getUserSession } from '@/utils/auth'
import { dateFormat, hexToRgba } from '@/utils/utils'
export default {
  name: 'AlarmTrend',
  data() {
    return {
      totalList: [
        { title: '今日累计', num: 0 },
        { title: '本月累计', num: 0 },
        { title: '今年累计', num: 0 }
      ],

      zbxAlarmLogStaticticsData: [],
      levelData: [],
      page: 1,
      limit: 10,
      keyword: null,
      level: '',
      status: '',
      agentsIds: '',
      alarmTypeData: [],
      devTypeList: [],
      requestTime: 30000, // 刷新时间
      catData: {},
      levelCatData: {},
      levelColorData: {},
      colorData: [],
      callbackDays: [],
      stateCatData: [
        { label: '待处理', value: 0, color: 'red' },
        { label: '已处理', value: 1, color: 'green' },
        { label: '处理中', value: 2, color: 'grey' },
        { label: '自动恢复', value: 3, color: 'grey' }
      ],
      alarm_data: [],
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      alarmEchartObject: null,
      alarmEchartData: [[], [], []],
      legend: ['严重的', '危险级', '灾难级'],
      areaColor: ['#d4d32e', '#ff731b', '#fe4244']
    }
  },
  computed: {
    setAlarmStatusColor() {
      const that = this
      return function(level) {
        const levelIdx = that.stateCatData.findIndex(item => item.value === level)
        if (levelIdx !== -1) {
          return that.stateCatData[levelIdx].color
        }
      }
    },
    setAlarmStatus() {
      const that = this
      return function(level) {
        const levelIdx = that.stateCatData.findIndex(item => item.value === level)
        if (levelIdx !== -1) {
          return that.stateCatData[levelIdx].label
        }
      }
    }
  },
  mounted() {
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.loadItType() // 加载设备类型
    this.loadAlarmType()
    this.timer = setInterval(() => {
      // this.levelData = []
      this.zbxAlarmLogStaticticsData = []
      // this.loadItType() // 加载设备类型
      this.loadAlarmType()
    }, this.requestTime)
    // this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.alarmTrendEchartBox.clientHeight
    this.showDayAlarmLogByHour().then(res => {
      console.log(res)
      for (let i = 0; i < 24; i++) {
        const h = i >= 10 ? i : `0${i}`
        this.$set(this.echartsLabel, this.echartsLabel.length, `${h}:00`)
        const fillterRserious = res.filter(function(item) { // 一般严重
          return item.time === i && item.alevel === 3
        })
        if (fillterRserious.length === 0) {
          this.$set(this.alarmEchartData[0], i, 0)
        } else {
          fillterRserious.forEach(fItem => {
            this.$set(this.alarmEchartData[0], i, fItem.count)
          })
        }
        const fillterDangerous = res.filter(function(item) { // 严重
          return item.time === i && item.alevel === 4
        })
        if (fillterDangerous.length === 0) {
          this.$set(this.alarmEchartData[1], i, 0)
        } else {
          fillterDangerous.forEach(fItem => {
            this.$set(this.alarmEchartData[1], i, fItem.count)
          })
        }
        const fillterDisaster = res.filter(function(item) { // 灾难
          return item.time === i && item.alevel === 5
        })
        if (fillterDisaster.length === 0) {
          this.$set(this.alarmEchartData[2], i, 0)
        } else {
          fillterDisaster.forEach(fItem => {
            this.$set(this.alarmEchartData[2], i, Number(fItem.count))
          })
        }
      }
    })
    this.initEchartsData()
  },
  destroyed() {
    clearInterval(this.timer)
  },
  methods: {
    initEchartsData() {
      for (let i = 0; i < this.alarmEchartData.length; i++) {
        this.$set(this.echartsData, this.echartsData.length, {
          name: this.legend[i],
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: {
            // this.areaColor[i]
            color: this.areaColor[i],
            shadowBlur: 3,
            shadowColor: hexToRgba(this.areaColor[i], 0.5),
            shadowOffsetY: 8
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: hexToRgba(this.areaColor[i], 0.3) },
                { offset: 1, color: hexToRgba(this.areaColor[i], 0) }
              ],
              false
            ),
            shadowColor: hexToRgba(this.areaColor[i], 0.8),
            shadowBlur: 10
          },
          data: this.alarmEchartData[i]
        })
      }
      const that = this
      setTimeout(function() {
        that.createEcharts()
      }, 1000)
    },
    createEcharts() {
      const that = this
      this.alarmEchartObject = echarts.init(document.getElementById('alarmEcharts'), 'light')
      this.alarmEchartObject.setOption({
        color: this.areaColor,
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name} ${params[0].data}`
          }
        },
        legend: {
          data: that.legend,
          icon: 'rect',
          padding: [0, 0, 0, 0],
          textStyle: {
            fontSize: 12,
            color: '#F1F1F3'
          }

        },
        grid: {
          top: '10%',
          left: '2%',
          right: '5%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: '{value}',
            color: '#fff'
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#3896d6'
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
            color: '#fff'
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
        series: that.echartsData
      })
      window.addEventListener('resize', () => {
        this.alarmEchartObject.resize()
      })
    },
    createEcharts1() {
      console.log('11')
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
        xAxis: [
          {
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
          }
        ],
        yAxis: [
          {
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
          }
        ],
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
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
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
    },
    async showDayAlarmLogByHour() {
      const date = new Date()
      const time = `${dateFormat('YYYY-mm-dd', date)}`
      // const time = '2021-3-19'
      return await request({
        url: api.automationOperations.showDayAlarmLogByHour, data: { time }
      }).then(res => {
        if (res.code === 1) {
          return res.map.timeList
        }
      })
    },
    // 告警类型
    loadAlarmType() {
      const that = this
      request({
        url: '/admin/find-alarm_type-SysCat', data: { limit: -1 }
      }).then(res => {
        this.alarmTypeData = res.data
        if (that.levelData.length === 0) {
          this.loadAlarmLevel()
        } else {
          this.loadAlarmLevelDouble()
        }
      })
    },
    // 故障等级
    loadAlarmLevel() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      }).then(res => {
        this.levelData.push({ name: '全部', color: '#409eff', level: '' })
        res.data.forEach(item => {
          this.catData[item.catId] = item.dictdataName
          this.levelCatData[item.catId] = item.dictdataValue
          this.levelColorData[item.catId] = item.remark
          this.levelData.push({ name: item.dictdataName, level: item.dictdataValue, catId: item.id, color: item.remark, isActive: false })
          this.colorData.push(item.remark)
          const f_data = []
          this.callbackDays.forEach(item2 => {
            f_data.push({ date: item2, value: 0 })
          })
          this.$nextTick(() => {
            this.zbxAlarmLogStaticticsData.push({ dictdataValue: item.dictdataValue, name: item.dictdataName, type: 'bar', stack: '总量', barWidth: '20px', fdata: f_data, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] })
          })
        })
        this.$nextTick(() => {
          this.getZbxAlarmLogStatictics()
        })
        this.findAssetsAlarm()
      })
    },
    // 自动刷新时 故障等级
    loadAlarmLevelDouble() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      }).then(res => {
        // this.levelData.push({ name: '全部', color: '#409eff', level: '' })
        res.data.forEach(item => {
          this.catData[item.catId] = item.dictdataName
          this.levelCatData[item.catId] = item.dictdataValue
          this.levelColorData[item.catId] = item.remark
          // this.levelData.push({ name: item.dictdataName, level: item.dictdataValue, catId: item.id, color: item.remark, isActive: false })
          this.colorData.push(item.remark)
          const f_data = []
          this.callbackDays.forEach(item2 => {
            f_data.push({ date: item2, value: 0 })
          })
          // this.$nextTick(() => {
          //   this.zbxAlarmLogStaticticsData.push({ dictdataValue: item.dictdataValue, name: item.dictdataName, type: 'bar', stack: '总量', barWidth: '20px', fdata: f_data, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] })
          // })
        })
        this.$nextTick(() => {
          this.getZbxAlarmLogStatictics()
        })
        this.findAssetsAlarm()
      })
    },
    // 查询告警
    findAssetsAlarm(sTime, eTime) {
      // this.alarm_data = []
      this.isMore = false
      request({
        url: api.itMonitor.findZbxAlarmLog, data: {
          page: this.page,
          limit: this.limit,
          keyword: this.keyword,
          level: this.level,
          status: this.status,
          startCLock: sTime || (this.startCLock > 0 ? this.startCLock / 1000 : ''),
          endClock: eTime || (this.endClock > 0 ? this.endClock / 1000 : ''),
          agents: this.agentsIds
        }
      }).then(async res => {
        const ids = []
        console.log('10000000000000000', res)
        res.data.forEach(item => { ids.push(item.id) })
        const getProblem = await this.findOpsOrderProblem(ids)
        if (getProblem.length > 0) {
          res.data.forEach(item => {
            const idx = getProblem.findIndex(items => Number(items.alarmId) === Number(item.id))
            if (idx !== -1) {
              item.isProblem = true
              item.severityType = getProblem[idx].severityType
              item.effectType = getProblem[idx].effectType
              item.urgencyType = getProblem[idx].urgencyType
            }
          })
        }
        const idm = []
        res.data.forEach(item => { idm.push(item.hostId) })
        // 查设备名称
        const getName = await this.findHyitHost(idm)
        if (getName.length > 0) {
          for (let i = 0; i < res.data.length; i++) {
            const rdata = res.data[i]
            for (let j = 0; j < getName.length; j++) {
              const gname = getName[j]
              if (Number(rdata.hostId) === Number(gname.hyHostId)) {
                this.$set(res.data[i], 'hyMarkName', getName[j].hyMarkName)
              }
            }
          }
        }

        this.total = parseInt(res.count)
        this.alarm_data = res.data
      })
    },
    // 查询告警的事项
    async findOpsOrderProblem(alarmIds) {
      const { code, data } = await request({
        url: api.opm.findOpsOrderProblem,
        data: { alarmIds, alarmModelType: 1 }
      })
      if (code !== 1) return
      return data
    },
    // 查询设备名称
    async findHyitHost(idm) {
      const { code, data } = await request({
        url: api.itMonitor.findHyitHost,
        data: { ids: idm, page: 1, limit: 10, agents: this.agentsIds }
      })
      if (code !== 1) return
      return data
    },
    // 按照从今天开始往前15天请求告警日志
    getZbxAlarmLogStatictics() {
      this.callbackDays.forEach(item => {
        request({
          url: `${api.itMonitor.getZbxAlarmLogStatictics}?app_id=${getUserSession().appId}&company_id=${getUserSession().companyId}&startCLock=${new Date(`${item} 00:00:00`).valueOf() / 1000}&endClock=${new Date(`${item} 23:59:59`).valueOf() / 1000}`, data: { agents: this.agentsIds }
        }).then(res => {
          const that = this
          if (res.model.date) {
            that.zbxAlarmLogStaticticsData.forEach((sitem, skey) => {
              if (res.model[`level${sitem.dictdataValue}Count`] !== undefined) {
                const fdata = that.zbxAlarmLogStaticticsData[skey].fdata
                const dateIdx = fdata.findIndex(item => {
                  return item.date === res.model.date
                })
                that.$nextTick(() => {
                  if (dateIdx !== -1) {
                    that.zbxAlarmLogStaticticsData[skey].fdata[dateIdx].value = res.model[`level${sitem.dictdataValue}Count`]
                    that.$set(that.zbxAlarmLogStaticticsData[skey].data, dateIdx, res.model[`level${sitem.dictdataValue}Count`])
                  }
                })
              }
            })
          }
          this.$nextTick(() => {
            // this.initmyChart()
          })
        })
      })
    },
    // 获取设备类型
    loadItType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-trend-container {
  // height: calc((100vh -16px -16px -100px) / 3);
  height: 100% !important;
  margin: 0 0 0 10px;
  cursor: pointer;
  // flex: 0.6;
  overflow: hidden;
  // .alarm-trend-date-total{
  // .total-title{
  //   color: #ddd;
  // }
  // .total-num.active{
  //   color: #00B285;
  // }
  // }
  .alarmTrendWrapper {
  height: 250px;
  margin-top:10px;
  display: flex;
  padding-bottom: 10px;
  // margin-top: 10px;
   .alarm-trend-echart-box {
    // height: 200px;
    height: 100%;
    flex: 1;
    #alarmEcharts{
      height: 300px;
    }
  }
  .alarm-trend-list {
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
    // height: 200px;
    height: 100%;
    padding-right: 10px;
    margin-left: 15px;
    .listalarm {
      border-bottom: 1px solid #0D3953;
      line-height: 32px;
    }
  }
}

   /deep/ .components-border-content{
    padding: 0 10px 0 10px !important;
    height: 100% !important;
       &::after,&::before{
        background-image: none;
       }
  }

}
.top-title{
    color: #9ee5ff;
    position: relative;
    padding-left: 10px;
    line-height: 20px;
    font-size: 14px;
    border-left: 3px solid #9ee7ff;;
}
// .alarm-trend-container ::v-deep .border-content-line {
//   position: absolute;
//   bottom: 26px;
//   right: -30px;
//   width: 17%;
//   height: 1px;
//   background-color: var(--default-color);
//   transform: rotate(132deg);
// }
</style>
