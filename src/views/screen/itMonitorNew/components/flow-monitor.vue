<template>
  <div class="side-box" :style="{ 'height': paneHeight + 'px' }">
    <div class="side-title has-action">
      <div class="title-text">流量监控</div>
      <div class="title-action">
        <a class="text-a" :class="flowType === 'up' ? 'active' : ''" href="#" @click="handlerFlowType('up')">上行</a>
        <a class="line-a">|</a>
        <a class="text-a" :class="flowType === 'down' ? 'active' : ''" href="#" @click="handlerFlowType('down')">下行</a>
        <a href="#" class="setting-icon" @click="handlerOpenDeviceDialog" />
      </div>
    </div>
    <div class="side-main">
      <div ref="highMarksBoxEcharts">
        <div id="highMarksEcharts" ref="highMarksEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
      </div>
    </div>
  </div>
</template>

<script>
import {getUserSession} from '@/utils/auth'
import * as echarts from 'echarts'

export default {
  name: 'FlowMonitor',
  data() {
    return {
      paneHeight: '',
      hostList: [],
      agents: [],
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      echartsObject: null,
      echartsLabelDataInHostMap: [],
      alarmEchartObject: null,
      flowType: 'up' // up上行 down下行
    }
  },
  mounted() {
    this.$EventBus.$on('handler-top-project', (val) => {
      this.echartsLabel = []
      this.echartsData = []
      this.agents = val.agents
      this.setHostFlow()
    })

    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })

    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostPortTotal-websocket') {
        this.watchGetHostPortTotal(res.detail.data)
      }
    })

    window.addEventListener('loginWsSuccess', () => {
      this.getHostPortTotal()
    })

    this.$EventBus.$on('user-select-flow-device', (val) => {
      const hostIds = []
      val.forEach(item => hostIds.push(item.hyHostId))
      this.localStorageOperation('set', 'itScreenFlowMonitorSelectHost', hostIds)
      this.setHostFlow()
    })

    this.$EventBus.$on('start-up-date', async () => {
      await this.getHostPortTotal()
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('start-up-date,user-select-flow-device,handler-top-project')
    window.removeEventListener('resize', this.setSize)
  },
  methods: {
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 35

      this.echartsWidth = this.$refs.highMarksBoxEcharts.clientWidth
      this.echartsHeight = this.paneHeight - 50
    },
    // 设置流量列表
    async setHostFlow() {
      const itScreenFlowMonitorSelectHost = this.localStorageOperation('get', 'itScreenFlowMonitorSelectHost')
      let hostIds = []
      let findZbxTrendHostFlowStatistics = []
      // 用户选择过设备存储在缓存了
      if (itScreenFlowMonitorSelectHost) {
        hostIds = itScreenFlowMonitorSelectHost
      } else {
        // 默认查top10设备
        const sTime = `${this.$tool.dateFormat('YYYY-mm-dd', this.$tool.getYearFirstLastDay().firstDay)} 00:00:00`
        const eTime = `${this.$tool.dateFormat('YYYY-mm-dd', new Date())} 23:59:59`

        const res = await this.$request({
          url: this.api.Summary.findZbxTrendHostFlowStatistics,
          data: { sTime, eTime, page: 1, limit: 10, dataType: 4, agents: this.agents.toString() }
        })
        if (res.code !== 1) {
          this.hostList = []
          return
        }
        findZbxTrendHostFlowStatistics = JSON.parse(res.model)
        findZbxTrendHostFlowStatistics.forEach(item => {
          hostIds.push(item.hostId)
        })
      }

      hostIds = hostIds.length > 10 ? hostIds.splice(0, 10) : hostIds

      if (hostIds.length === 0) return

      const findHyitHost = await this.$request({ url: this.api.itMonitor.findHyitHost, data: { limit: -1, ids: hostIds} })
      this.hostList = findHyitHost.data
      this.echartsLabel = []
      this.echartsData = []
      this.echartsLabelDataInHostMap = []
      this.hostList.forEach((item, index) => {
        this.$set(this.echartsLabel, this.echartsLabel.length, item.hyMarkName)
        this.$set(this.echartsData, this.echartsData.length, 0)
        this.$set(this.echartsLabelDataInHostMap, this.echartsLabelDataInHostMap.length, {
          echartsDataIndex: index,
          hyHostId: item.hyHostId,
          hyZhostId: item.hyZhostId
        })
      })

      await this.createEcharts()
      await this.setEchartsOptions()
      await this.getHostPortTotal()
    },
    // 获取主机流量汇总
    async getHostPortTotal() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()

      this.hostList.forEach(item => {
        this.$ws.sendWebsocket(this.wsCmd.host.default, {
          cmd: this.wsCmd.itMonitor.itAgentGetHostPortTotal,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: item.agent,
            hostid: item.hyZhostId,
            fromAgent: item.fromAgent,
            fromHostId: item.fromHostId
          }
        })
      })
    },
    // 监听ws主机流量汇总数据返回
    watchGetHostPortTotal(data) {
      if (!this.$tool.isJSONString(data.HostPortData)) return
      const json = JSON.parse(data.HostPortData)[0]
      const send = json['端口每秒发送速率汇总']
      const receive = json['端口每秒接收速率汇总']
      const echartsLabelDataInHostMapIdx = this.echartsLabelDataInHostMap.findIndex(el => +el.hyZhostId === +data.hostid)
      if (echartsLabelDataInHostMapIdx !== -1) {
        if (send.length > 0 && this.flowType === 'up') {
          const sendItemUnits = send[0].units.indexOf('/') !== -1 ? send[0].units.split('/')[0] : send[0].units
          const sendSizeUnitsTransformResult = this.$tool.sizeUnitsTransform(sendItemUnits, 'MB', receive[0].itemValue)
          this.$set(this.echartsData, this.echartsLabelDataInHostMap[echartsLabelDataInHostMapIdx].echartsDataIndex, +sendSizeUnitsTransformResult.size.toFixed(2))
        }
        if (receive.length > 0 && this.flowType === 'down') {
          const receiveItemUnits = receive[0].units.indexOf('/') !== -1 ? receive[0].units.split('/')[0] : receive[0].units
          const receiveSizeUnitsTransformResult = this.$tool.sizeUnitsTransform(receiveItemUnits, 'MB', receive[0].itemValue)
          this.$set(this.echartsData, this.echartsLabelDataInHostMap[echartsLabelDataInHostMapIdx].echartsDataIndex, +receiveSizeUnitsTransformResult.size.toFixed(2))
        }
      }
      this.setEchartsOptions()
    },
    // 打开流量设备弹窗
    handlerOpenDeviceDialog() {
      this.$EventBus.$emit('open-select-flow-device', {
        agents: this.agents,
        allSelections: this.hostList
      })
    },
    // 创建echart
    async createEcharts() {
      if (this.alarmEchartObject !== null) return
      this.alarmEchartObject = echarts.init(document.getElementById('highMarksEcharts'), 'light')
    },
    // 设置echart数据
    async setEchartsOptions() {
      const that = this
      this.alarmEchartObject.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name} ${params[0].data}MB/s`
          }
        },
        grid: {
          top: '10%',
          left: '-5%',
          right: '0%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: that.echartsLabel,
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          }
        }],
        yAxis: [{
          type: 'value',
          show: false
        }],
        series: [
          {
            type: 'bar',
            barWidth: 10,
            data: that.echartsData,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: '#08F2F5'
                }, {
                  offset: 0.5,
                  color: '#13A2E8'
                }, {
                  offset: 1,
                  color: '#0B316E'
                }])
              }
            }
          }
        ]
      })
    },
    // 选择类型
    handlerFlowType(t) {
      this.flowType = t
      this.echartsData = []
      this.getHostPortTotal()
    }
  }
}
</script>

<style lang="scss" scoped>
.title-text {
  float: left;
}

.title-action {
  float: right;
  .text-a {
    display: inline-block;
    width: 40px;
    text-align: center;
    color: #cccccc;
    font-size: 10px;
    &:hover {
      color: #99E5FF;
    }
  }
  .line-a {
    color: #cccccc;
  }
  .active {
    color: #99E5FF;
  }
  .setting-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-left: 5px;
    margin-top: 5px;
    background: url(/image/screen/it-monitor/ico_set.png) no-repeat 0 0;
  }
}
</style>
