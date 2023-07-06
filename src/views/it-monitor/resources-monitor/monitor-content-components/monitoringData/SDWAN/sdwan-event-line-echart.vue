<template>
  <div ref="itemContentBody" class="event-line-echart">
    <div ref="alarmBoxEcharts" class="echarts-boxs">
      <div id="eventEcharts" ref="eventEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'
import { hexToRgba } from '@/utils/utils'

export default {
  name: 'SDWANEventLineEchart',
  props: {
    propAgent: {
      type: Number,
      default() {
        return 0
      }
    },
    propZbxHostId: {
      type: Number,
      default() {
        return 0
      }
    },
    upDataDirectiveId: {
      type: String,
      default() {
        return ''
      }
    },
    selectLevelData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      agentGetSdwanEventStatisticsQurery: {
        agent: '',
        hostid: '',
        sTime: '',
        eTime: '',
        eventSeverity: ''
      },
      echartsWidth: 0,
      echartsHeight: 0,
      alarmEchartData: [],
      echartsLabel: []
    }
  },
  computed: {
    // 获取网关id
    agent() {
      if (this.propAgent === 0) {
        return this.$route.query.agent
      } else {
        return String(this.propAgent)
      }
    },
    // 获取zabbix主机id
    zbxHostId() {
      if (this.propZbxHostId === 0) {
        return this.$route.query.zbxHostId
      } else {
        return String(this.propZbxHostId)
      }
    }
  },
  watch: {
    selectLevelData: {
      handler(newVal) {
        this.echartsLabel.forEach((item, key) => {
          this.$set(this.alarmEchartData, key, 0)
        })
        this.agentGetSdwanEventStatisticsQurery.eventSeverity = newVal.level
        this.agentGetSdwanEventStatistics()
      },
      deep: true
    }
  },
  mounted() {
    const sDateLabel = `${this.$tool.dateFormat('Y-m-d', new Date())}`
    const sDateLabelStr = `${this.$tool.dateOperator(`${sDateLabel}`, 7, '-', 'all')}`
    this.echartsLabel = sDateLabelStr.split(',')
    this.echartsLabel.forEach((item, key) => {
      this.$set(this.alarmEchartData, key, 0)
    })
    this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    const sDate = `${this.$tool.dateFormat('Y-m-d', new Date())}`
    const sDateStr = `${this.$tool.dateOperator(`${sDate}`, 7, '-')} 00:00:00`
    const eTime = `${this.$tool.dateFormat('Y-m-d', new Date())} 23:59:59`
    this.agentGetSdwanEventStatisticsQurery.sTime = sDateStr
    this.agentGetSdwanEventStatisticsQurery.eTime = eTime
    this.agentGetSdwanEventStatisticsQurery.agent = this.agent
    this.agentGetSdwanEventStatisticsQurery.hostid = this.zbxHostId
    this.agentGetSdwanEventStatistics()
  },
  methods: {
    agentGetSdwanEventStatistics() {
      request({
        url: api.itMonitor.agentGetSdwanEventStatistics,
        data: this.agentGetSdwanEventStatisticsQurery
      }).then(res => {
        if (res.code === 1 && res.model && this.$tool.isJSONString(res.model)) {
          const jsonData = JSON.parse(res.model)
          jsonData.forEach(item => {
            const getItem = this.echartsLabel.findIndex(items => {
              const days = items.split('-')
              let day = days[days.length - 1]
              if (day.indexOf('0') !== -1 && day.indexOf('0') === 0) {
                day = day.split('0')[1]
              }
              return Number(day) === item.dayNum
            })
            if (getItem !== -1) {
              this.$set(this.alarmEchartData, getItem, item.count)
            }
          })
          this.createEcharts()
        }
      })
    },
    createEcharts() {
      const that = this
      this.alarmEchartObject = echarts.init(document.getElementById('eventEcharts'), 'light')
      this.alarmEchartObject.setOption({
        color: [`${that.selectLevelData ? that.selectLevelData.color : '#ff731b'}`],
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name} ${params[0].data}`
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
          },
          data: that.echartsLabel
        }],
        yAxis: [{
          type: 'value',
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
        series: [
          {
            type: 'line',
            smooth: true,
            symbolSize: 8,
            lineStyle: {
              normal: {
                color: `${that.selectLevelData ? that.selectLevelData.color : '#ff731b'}`,
                shadowBlur: 3,
                shadowColor: hexToRgba(`${that.selectLevelData ? that.selectLevelData.color : '#ff731b'}`, 0.5),
                shadowOffsetY: 8
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                  [
                    { offset: 0, color: hexToRgba(`${that.selectLevelData ? that.selectLevelData.color : '#ff731b'}`, 0.3) },
                    { offset: 1, color: hexToRgba(`${that.selectLevelData ? that.selectLevelData.color : '#ff731b'}`, 0) }
                  ],
                  false
                ),
                shadowColor: hexToRgba(`${that.selectLevelData ? that.selectLevelData.color : '#ff731b'}`, 0.8),
                shadowBlur: 10
              }
            },
            data: that.alarmEchartData
          }
        ]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.event-line-echart {
  width: 70%;
  height: 240px;
  display: inline-block;
}
</style>
