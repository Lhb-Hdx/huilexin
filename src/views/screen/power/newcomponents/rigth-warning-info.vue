<template>
  <div class="container-warningInfo" :style="{ 'height': paneHeight + 'px' }">
    <div class="com_title">
      <span class="span_left">告警信息</span>
    </div>
    <div class="alarmtype">
      <div class="typebox">
        <div class="type_no text_color">
          {{ newAlarmList.length }}
        </div>
        <div class="type">待处理</div>
      </div>
      <div class="typebox">
        <div class="type_no text_color">
          <!-- 0未确认1已确认 2已关闭 -->
          {{ newAlarmList.filter(it=>+it.hyStatus === 0 ).length }}
        </div>
        <div class="type">确认中</div>
      </div>
      <div class="typebox">
        <div class="type_no text_color">
          {{ newAlarmList.filter(it=>+it.hyStatus === 2 ).length }}
        </div>
        <div class="type">已关闭</div>
      </div>
    </div>
    <div class="alarm_echars">
      <div ref="itemContentBody" class="my-10" style="height:100%;">
        <div ref="alarmBoxEcharts" class="echarts-boxs">
          <div id="alarmEcharts" ref="alarmEcharts" :style="{width: '100%', height: 100 + '%'}" />
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
      paneHeight: '',
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      alarmEchartObject: null,
      alarmEchartData: [],
      legend: [],
      alarmColor: [],
      colors: {
        5: '#FE4D4E',
        4: '#FE830C',
        3: '#268CF2',
        2: '#FE4D4E',
        1: '#00B285'
      },
      level: [],
      newAlarmEchartsObj: null,
      newAlarmList: [],
      alarmSubType: [],
      alarmLogCount: 0,
      chnList: [],
      deviceList: [],
      eventList: [],
      //
      seriesData: []
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandleEchart)
    this.alarmEchartObject.dispose()
    window.removeEventListener('resize', this.setSize)
  },
  async mounted() {
    await this.initEchartsData()
    await this.findHyitAlarmLog()
    await this.hyitAlarmLevel()
    await this.findHyitDevice()
    await this.findHyitEvent()
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
    // this.$refs.border.initWH()

    this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    // 系统告警等级
    const alarmLevel = await this.findAlarmLevel()
    if (alarmLevel.length > 0) {
      alarmLevel.forEach((item) => {
        this.$set(this.legend, this.legend.length, item.dictdataName)
        this.$set(this.alarmColor, this.alarmColor.length, item.remark)
      })
    }

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

    let series = []
    Object.values(chartList).forEach((it, index) => {
      const level = levels.find(level => level.hyLevel === it[0]['hyLevel'])

      series.push(this.initEchart(level.hyLevelName || '', this.colors[level['hyLevel']], this.$tool.setRingHistoryAlarm(it, '', 'count')))
    })

    if (Object.values(chartList).length <= 0) {
      for (let J = 0; J < alarmLevel.length; J++) {
        const element = alarmLevel[J]
        series.push(
          this.initEchart(
            element.dictdataName,
            element.remark,
            this.$tool.setRingHistoryAlarm([], '', 'count')
          )
        )
      }
      // console.log('series@', series, this.$tool.setRingHistoryAlarm([], '', 'count'))
    }
    const label = Array(24).fill(0).map((time, index) => String(index).padStart(0, 2) + ':00')
    this.echartsLabel = label
    this.alarmEchartData = series
    console.log('告警xAeai', label)
    console.log('告警yAeai', series)
    this.createEcharts()
  },
  methods: {
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 35
    },
    // 系统告警等级
    async findSysDictionaryDetail() {
      const { code, data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: {
          dictCode: 'alarm_level',
          limit: -1
        }
      })
      if (code !== 1) return
      return data
    },
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

    // 获取设备告警表
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
        grid: {
          top: '3%',
          left: '3%',
          right: '3%',
          bottom: '24%',
          containLabel: true
        },
        legend: {
          data: this.legend,
          icon: 'rect',
          bottom: 24,
          textStyle: {color: '#fff'}
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
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
      window.addEventListener('resize', () => {
        this.resizeHandleEchart()
      })
    },
    resizeHandleEchart() {
      if (this.alarmEchartObject) {
        this.alarmEchartObject.resize()
      }
    },
    //  分时段查询一天内告警等级数量信息
    async getVideoAlarmLogDayStatic() {
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
    },

    // 获取告警信息
    async initEchartsData() {
      const newAlarmList = this.newAlarmList
      const alarmLevel = await this.findSysDictionaryDetail()

      // 将告警等级颜色赋值给设备对象数据
      if (alarmLevel.length > 0 && newAlarmList.length > 0) {
        alarmLevel.map(itemLE => {
          newAlarmList.map(itemAL => {
            if (+itemAL.hyLevel === +itemLE.dictdataValue) {
              this.$set(itemAL, itemAL.dictdataName, itemLE.dictdataName)
              this.$set(itemAL, itemAL.dictdataNameColor, itemLE.style)
            }
          })
        })
      }

      // 不同告警等级的数据
      alarmLevel.forEach((item, i) => {
        this.$set(this.seriesData, this.seriesData.length, {
          name: item.dictdataNam,
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            color: '#0770FF'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: hexToRgba('#F2597F', 0.8)
              },
              {
                offset: 1,
                color: hexToRgba('#F2597F', 0.3)
              }
            ])
          },
          data: item
        })
      })
    },

    // 获取告警等级
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
    // 获取告警级别
    async findAlarmLevel() {
      const { code, data } = await request({ url: api.common.findSysDictionaryDetail, data: { dictCode: 'alarm_level', page: 1, limit: -1 } })
      if (code !== 1) return
      return data
    },
    async findHyitDevice() {
      let { code, data } = await request({ url: api.powerEnv.findHyitDevice, data: { limit: -1 } })
      if (code !== 1) return
      this.deviceList = data
    },
    async showDHAlarmLogByAll() {
      let { code, map } = await request({ url: api.powerEnv.showDHAlarmLogByAll, data: {}})
      if (code !== 1) return
      return map
    }
  }

}
</script>

<style lang="scss" scoped>
  @import '@/views/screen/power/componentallstyle/rigth-warning-info.scss';
</style>

