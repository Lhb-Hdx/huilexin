import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import UsedStatisticsContainer from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/component/used-statistics-container'
import UsedDetailDialog from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/component/used-detail-dialog'

export default {
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  props: {
    monitorItem: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    agent() { return this.$route.query.agent },
    isConfig() { return this.$route.query.isConfig },
    itMonitorRequireAgreement() { return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT }
  },
  watch: {
    monitorItem: {
      handler() {
        this.watchItemSwitch = Boolean(this.monitorItem.isShow)
        this.getZbxItemsHost()
      },
      deep: true
    }
  },
  mounted() {
    if (this.monitorItem) {
      this.watchItemSwitch = Boolean(this.monitorItem.isShow)
      this.getZbxItemsHost()
    }
    const that = this
    if (this.itMonitorRequireAgreement === 'WS') {
      window.addEventListener('watchWsMessage', (res) => {
        if (res.detail.data.cmd === 'it-agentGetRealTimeData-websocket' && res.detail.data.itemid === that.monitorItemData.itemid) {
          if (res.detail.data) {
            that.watchAgentGetRealTimeData(res.detail.data.data[0])
          }
        }
      })
    }
  },
  destroyed() {
    clearInterval(this.setHyitShowSurveyInterval)
  },
  data() {
    return {
      monitorItemData: null,
      watchItemSwitch: true,
      setHyitShowSurveyInterval: null, // 获取各项数据统计的定时器
      requestInterval: 5000,
      showUsedDetailDialog: false,
      customConfiguration: {
        yAxisLabelUnit: ''
      }
    }
  },
  methods: {
    getZbxItemsHost() {
      request({
        url: api.itMonitor.getZbxItemsHost,
        data: { itemid: this.monitorItem.itemid, agent: this.agent }
      }).then(res => {
        if (res.code === 1) {
          this.monitorItemData = res.model
          this.agentGetRealTimeData()
          const that = this
          this.setHyitShowSurveyInterval = setInterval(() => {
            that.agentGetRealTimeData()
          }, this.requestInterval)
        }
      })
    },
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          itemid: this.monitorItemData.itemid,
          valueType: this.monitorItemData.valueType,
          name: '最新数据',
          color: '#87DEAF',
          unit: this.echartData[0].units[0],
          echartType: 'value',
          data: [],
          units: [],
          time: []
        }
      ]
      this.tableParams = [
        {
          label: ['最大值', '最小值', '平均值'],
          value: 0,
          unit: this.echartData[0].units[0],
          itemid: this.monitorItemData.itemid,
          valueType: this.monitorItemData.valueType,
          type: ['max', 'min', 'avg']
        }
      ]
    },
    changeItemSwitch(val) {
      this.$EventBus.$emit('change-item-switch', {
        id: this.monitorItem.id,
        type: 2,
        isShow: Number(val),
        name: this.monitorItem.name
      })
    },
    agentGetRealTimeData() {
      const query = {
        agent: this.agent, hostid: this.zbxHostId, itemid: this.monitorItemData.itemid, valueType: this.monitorItemData.valueType
      }
      if (this.itMonitorRequireAgreement !== 'WS') {
        request({ url: api.itMonitor.agentGetRealTimeData, data: query }).then(res => {
          if (res.code === 1) {
            this.watchAgentGetRealTimeData(res.model)
          }
        })
      } else {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        if (!wsToken) return
        const getUserSessionResult = getUserSession()
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetRealTimeData,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            fromHostId: this.localStorageOperation('get', 'fromHostId'),
            ...query
          }
        })
      }
    },
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    handlerDeleteMonitorItem() {
      this.$confirm('确定删除这个监控项吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.itMonitor.deleteHyitHostGraphShow, data: { id: this.monitorItem.id }
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.$EventBus.$emit('delete-item-switch')
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    watchAgentGetRealTimeData(data) {
      const clock = new Date()
      if (this.echartData.length === 0) {
        this.$set(this.customConfiguration, 'yAxisLabelUnit', data.units)
        this.echartData = [
          {
            color: '#87DEAF',
            name: '当前',
            data: [Number(Number(data.itemValue).toFixed(2))],
            units: [data.units],
            time: [`${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`],
            itemId: data.itemid,
            valueType: data.valueType,
            isConversion: false,
            unit: data.units
          }
        ]
      } else {
        this.$set(this.echartData[0].data, this.echartData[0].data.length, Number(Number(data.itemValue).toFixed(2)))
        this.$set(this.echartData[0].units, this.echartData[0].units.length, data.units)
        this.$set(this.echartData[0].time, this.echartData[0].time.length, this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock))
      }
      this.$set(this.tableData[0].col[0], 'value', Number(data.itemValue).toFixed(2))
      this.$set(this.tableData[0].col[1], 'value', Math.max(...this.echartData[0].data))
      this.$set(this.tableData[0].col[2], 'value', Math.min(...this.echartData[0].data).toFixed(2))
      this.$set(this.tableData[0].col[3], 'value', this.$tool.avg(this.echartData[0].data).toFixed(2))
      this.$set(this.tableData[0].col[0], 'unit', data.units)
      this.$set(this.tableData[0].col[1], 'unit', data.units)
      this.$set(this.tableData[0].col[2], 'unit', data.units)
      this.$set(this.tableData[0].col[3], 'unit', data.units)
      if (!this.initGetMonitorItemHistoryData) {
        this.initGetMonitorItemHistoryData = true
        this.getMonitorItemHistoryData(this.agent, data.itemid, data.valueType)
      }
    }
  }
}
