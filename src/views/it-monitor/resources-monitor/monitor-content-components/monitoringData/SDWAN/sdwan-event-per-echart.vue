<template>
  <div class="echart-box event-per-echart">
    <div ref="pieBar" class="pieBar" style="height: 240px;" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'

export default {
  name: 'SDWANEventPerEchart',
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
    }
  },
  data() {
    return {
      sTime: 0,
      eTime: 0,
      eventStatusData: [],
      levelData: [],
      echartColor: []
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
  async mounted() {
    const sDate = `${this.$tool.dateFormat('Y-m-d', new Date())}`
    const sDateStr = `${this.$tool.dateOperator(`${sDate}`, 7, '-')} 00:00:00`
    const eTime = `${this.$tool.dateFormat('Y-m-d', new Date())} 23:59:59`
    this.sTime = new Date(sDateStr).getTime() / 1000
    this.eTime = new Date(eTime).getTime() / 1000
    await this.loadAlarmLevel()
    this.agentGetSdwanEventSeverityStatistics()
  },
  methods: {
    agentGetSdwanEventSeverityStatistics() {
      request({ url: api.itMonitor.agentGetSdwanEventSeverityStatistics, data: { agent: this.agent, hostid: this.zbxHostId, sTime: this.sTime, eTime: this.eTime }}).then(async res => {
        if (res.code === 1 && res.model && this.$tool.isJSONString(res.model)) {
          const jsonData = JSON.parse(res.model)
          const countData = []
          const colors = []
          jsonData.forEach(item => {
            const getItem = this.$tool.findDataItemByAttr(this.levelData, 'level', String(item.event_severity))
            if (getItem) {
              countData.push({
                color: getItem.color,
                key: getItem.catId,
                name: getItem.name,
                level: item.event_severity,
                value: item.event_count
              })
              colors.push(getItem.color)
            }
          })
          this.echartColor = colors
          this.eventStatusData = countData
          this.loadEcharts()
        }
      })
    },
    // 故障等级
    async loadAlarmLevel() {
      return new Promise(resolve => {
        request({
          url: api.common.findSysDictionaryDetail,
          data: { dictCode: 'alarm_level', page: 1, limit: -1 }
        }).then(res => {
          if (res.code === 1) {
            this.levelData.push({ name: '全部', color: '#409eff', level: '' })
            res.data.forEach(item => {
              this.levelData.push({ name: item.dictdataName, level: item.dictdataValue, catId: item.id, color: item.remark, isActive: false })
            })
            resolve()
          }
        })
      })
    },
    // 加载统计图
    loadEcharts() {
      const self = this
      const myChart = echarts.init(self.$refs['pieBar'])
      const option = {
        color: self.echartColor,
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '10%',
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            center: ['50%', '40%'],
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
            labelLine: {
              show: false
            },
            data: self.eventStatusData
          }
        ]
      }
      myChart.setOption(option, true)
      myChart.on('click', 'series.pie', function(param) {
        self.$emit('emitPerData', param.data)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.event-per-echart {
  width: 30%;
  display: inline-block;
}
</style>
