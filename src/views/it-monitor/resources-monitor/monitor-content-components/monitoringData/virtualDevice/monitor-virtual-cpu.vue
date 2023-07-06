<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length < 2 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5"
    >
      <div class="head head-bar">
        <div class="title">CPU</div>
        <div class="chunk-opts">
          <div v-if="isConfig" class="chunk-opts-select">
            <el-switch
              v-model="watchItemSwitch"
              @change="changeItemSwitch"
            />
          </div>
          <div class="chunk-opts-select margin-left-7-5">
            <el-select v-model="selectCpuItemId" size="mini" placeholder="请选择" @change="changeCpuItem">
              <el-option
                v-for="item in cpuData.data"
                :key="item.itemid"
                :label="item.itemName"
                :value="item.itemid"
              />
            </el-select>
            <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openUsedDetailDialog">
          </div>
        </div>
      </div>
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="cpuChart" :custom-configuration="customConfiguration" :echart-data="echartData" :table-data="tableData" />
      <el-empty v-else description="暂无数据" />
    </div>
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :show-dialog="showUsedDetailDialog"
      :custom-configuration="customConfiguration"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import UsedStatisticsContainer from '../component/used-statistics-container'
import { dateFormat, isJSONString } from '@/utils/utils'
import UsedDetailDialog from '../component/used-detail-dialog'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorVirtualCpu',
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
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
    cpuData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      echartData: [
        {
          color: '#87DEAF',
          name: '最新数据',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100
        }
      ],
      tableData: [
        {
          col: [
            { label: 'CPU数', value: 0, unit: '', fixed: 0 },
            { label: '当前频率', value: 0, unit: '', fixed: 0 }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [{
        itemid: '',
        valueType: '',
        name: '最新数据',
        color: '#87DEAF',
        unit: '',
        echartType: 'value',
        data: [],
        units: [],
        time: [],
        yAxisMax: 100
      }],
      tableParams: [
        {
          label: ['最高', '平均', '最低'],
          value: 0,
          unit: '%',
          itemid: '',
          valueType: '',
          type: ['max', 'avg', 'min']
        }
      ],
      virtualInfoCpuData: [],
      cpuFrequency: {},
      cpuCores: {},
      cpuThreads: {},
      cpuUsageItem: {},
      itemGuid: null,
      watchItemSwitch: true,
      watchItemKey: 'virtualCpu',
      watchItemShow: null,
      showEmpty: false,
      initGetMonitorItemHistoryData: false,
      selectCpuItemId: '',
      selectCpuItem: {},
      customConfiguration: {
        yAxisLabelUnit: '%'
      }
    }
  },
  computed: {
    agent() {
      return this.$route.query.agent
    },
    zbxHostId() {
      return this.$route.query.zbxHostId
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    },
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id }
  },
  watch: {
    upDataDirectiveId: {
      handler() {
        if (this.virtualInfoCpuData) {
          this.watchAgentGetHostData()
        }
      },
      deep: true
    },
    cpuData: {
      handler() {
        this.watchAgentGetHostData()
      },
      deep: true
    }
  },
  mounted() {
    this.watchAgentGetHostData()
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    this.getDataTimeOut()
  },
  methods: {
    getDataTimeOut() {
      const that = this
      setTimeout(() => {
        if (that.echartData[0].data.length < 2) that.showEmpty = true
      }, 10000)
    },
    async watchAgentGetHostData() {
      const getCpuUsage = this.cpuData
      if (getCpuUsage.method === 'getItemVMCpuData') {
        const currentAllMonitorItemIds = []
        const currentAllMonitorItemValueTypes = []
        if (!this.selectCpuItem.itemid) {
          this.selectCpuItemId = getCpuUsage.data[0].itemid
          this.selectCpuItem = getCpuUsage.data[0]
        }
        // 使用比例
        const usagePercents = getCpuUsage.data.findIndex(item => item.itemid === this.selectCpuItem.itemid)
        if (usagePercents !== -1) {
          if (this.echartData[0].isConversion && this.echartData[0].assignUnit.indexOf('Hz') !== -1) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, (getCpuUsage.data[usagePercents].itemValue / 1000000).toFixed(0))
            this.$set(this.echartData[0].units, this.echartData[0].units.length, 'MHz')
          } else {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, getCpuUsage.data[usagePercents].itemValue)
            this.$set(this.echartData[0].units, this.echartData[0].units.length, getCpuUsage.data[usagePercents].units)
          }
          this.$set(this.echartData[0], 'itemId', getCpuUsage.data[usagePercents].itemid)
          this.$set(this.echartData[0], 'unit', getCpuUsage.data[usagePercents].units)
          this.$set(this.detailParams[0], 'unit', getCpuUsage.data[usagePercents].units)
          this.$set(this.detailParams[0], 'itemid', getCpuUsage.data[usagePercents].itemid)
          this.$set(this.detailParams[0], 'valueType', getCpuUsage.data[usagePercents].valueType)
          if (this.echartData[0].data.length === 2) {
            this.$set(this.echartData[0].data, 0, getCpuUsage.data[usagePercents].itemValue)
          }
          if (!this.initGetMonitorItemHistoryData) {
            currentAllMonitorItemIds.push(getCpuUsage.data[usagePercents].itemid)
            currentAllMonitorItemValueTypes.push(getCpuUsage.data[usagePercents].valueType)
          }
        }

        // 频率
        const usage = getCpuUsage.data.findIndex(item => item.itemName.indexOf('CPU usage') !== -1 && item.itemName.indexOf('in percents') === -1)
        if (usage !== -1) {
          const mhz = +(Number(getCpuUsage.data[usage].itemValue) / 1000000).toFixed(0)
          this.$set(this.tableData[0].col[1], 'value', mhz)
          this.$set(this.tableData[0].col[1], 'unit', 'MHZ')
        }
        // CPU数
        const cpuNumber = getCpuUsage.data.findIndex(item => item.itemName.indexOf('Number of virtual CPUs') !== -1)
        if (cpuNumber !== -1) {
          this.$set(this.tableData[0].col[0], 'value', Number(getCpuUsage.data[cpuNumber].itemValue))
          this.$set(this.tableData[0].col[0], 'unit', '')
        }
        const clock = new Date()
        this.$set(this.echartData[0].time, this.echartData[0].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)

        if (!this.initGetMonitorItemHistoryData) {
          this.initGetMonitorItemHistoryData = true
          this.getMonitorItemHistoryData(this.agent, currentAllMonitorItemIds.toString(), currentAllMonitorItemValueTypes.toString())
        }
      }
    },
    async findHyitHost(name) {
      return new Promise(resolve => {
        request({
          url: api.itMonitor.findHyitHost,
          data: { page: 1, limit: -1, name }
        }).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
    },
    // 获取监控项数据
    async agentGetHostData(method, hostid) {
      if (this.itMonitorRequireAgreement !== 'WS') {
        return new Promise(resolve => {
          request({ url: api.itMonitor.agentGetHostData, data: { agent: this.agent, hostid, method }}).then(res => {
            if (res.code === 1 && res.model) {
              if (this.$tool.isJSONString(res.model)) {
                const sdwanInfoData = JSON.parse(res.model)
                resolve({
                  data: sdwanInfoData,
                  method,
                  agreement: 'http',
                  guid: this.itemGuid
                })
              }
            }
          })
        })
      } else {
        return new Promise(resolve => {
          const wsToken = this.sessionStorageOperation('get', 'wsToken')
          if (!wsToken) return
          const getUserSessionResult = getUserSession()
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostData,
            data: {
              token: wsToken,
              companyId: getUserSessionResult.companyId,
              appId: getUserSessionResult.appId,
              agent: this.agent,
              hostid,
              fromAgent: this.localStorageOperation('get', 'fromAgent'),
              methed: method,
              fromHostId: this.localStorageOperation('get', 'fromHostId')
            }
          },
          (res) => {
            const wsRes = isJSONString(res[`${method}`]) ? JSON.parse(res[`${method}`]) : res[`${method}`]
            if (wsRes && res.methed === method) {
              resolve({
                data: wsRes,
                method,
                agreement: 'ws',
                guid: this.itemGuid
              })
            }
          }, (err) => {
            this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
            console.log(err)
          })
        })
      }
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: 'CPU',
          isShow: Number(val),
          devType: this.devTypeId,
          hostId: this.id,
          zhostId: this.zbxHostId,
          graphType: 1
        })
      } else {
        this.$EventBus.$emit('change-item-switch', {
          id: this.watchItemShow.id,
          type: 1,
          isShow: Number(val),
          name: this.watchItemKey
        })
      }
    },
    changeCpuItem(val) {
      const idx = this.cpuData.data.findIndex(el => +el.itemid === +val)
      if (idx !== -1) this.selectCpuItem = this.cpuData.data[idx]
      delete this.echartData[0].yAxisMax
      if (this.selectCpuItem.units === '%') {
        this.$set(this.echartData[0], 'yAxisMax', 100)
      }
      if (this.selectCpuItem.units.indexOf('Hz') !== -1) {
        this.$set(this.echartData[0], 'isConversion', true)
        this.$set(this.echartData[0], 'conversionUnitType', 'data')
        this.$set(this.echartData[0], 'unit', 'MHz')
        this.$set(this.echartData[0], 'isAssignUnit', true)
        this.$set(this.echartData[0], 'assignUnit', 'MHz')
      } else {
        delete this.echartData[0].isConversion
        delete this.echartData[0].conversionUnitType
        delete this.echartData[0].unit
        delete this.echartData[0].isAssignUnit
        delete this.echartData[0].assignUnit
      }
      this.initGetMonitorItemHistoryData = false
      this.$set(this.echartData[0], 'data', [])
      this.$set(this.echartData[0], 'units', [])
      this.$set(this.echartData[0], 'time', [])
      this.showEmpty = false
      this.watchAgentGetHostData()
      this.getDataTimeOut()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>
