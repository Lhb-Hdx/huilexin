<template>
  <div class="monitor-device">
    <div class="chunk margin-left-7-5 margin-right-7-5 margin-top-15">
      <MonitorVirtualCpu :cpu-data="cpuData" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" />
      <MonitorVirtualMemory :memory-data="memoryData" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" />
    </div>
    <MonitorVirtualFileSystem :file-data="fileData" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" :up-data-directive-id="upDataDirectiveId" />
    <div class="chunk margin-left-7-5 margin-right-7-5">
      <!-- 自定义监控项趋势图 -->
      <template v-for="item in diyItem">
        <DiyMonitorItemEchart v-if="Number(item.graphType) === 1" :key="item.id" :monitor-item="item" />
        <DiyMonitorItemDash v-if="Number(item.graphType) === 3" :key="item.id" :monitor-item="item" />
      </template>
    </div>
    <!-- 自定义监控项表单 -->
    <DiyMonitorItemForm v-if="isConfig" />
  </div>
</template>

<script>
import { guid, isJSONString } from '@/utils/utils'
import MonitorVirtualCpu from './monitor-virtual-cpu'
import MonitorVirtualMemory from './monitor-virtual-memory'
import MonitorVirtualFileSystem from './monitor-virtual-file-system'
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import DiyMonitorItemForm from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-form'
import DiyMonitorItemEchart from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-echart'
import DiyMonitorItemDash from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-dash'

export default {
  name: 'MonitorVirtual',
  components: {
    MonitorVirtualCpu,
    MonitorVirtualMemory,
    MonitorVirtualFileSystem,
    DiyMonitorItemForm,
    DiyMonitorItemEchart,
    DiyMonitorItemDash
  },
  props: {
    usability: {
      type: Number,
      default() {
        return 0
      }
    },
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
    }
  },
  data() {
    return {
      setHyitShowSurveyInterval: null, // 获取各项数据统计的定时器
      requestInterval: 5000, // 获取统计数据间隔 毫秒
      /* 传递给子组件的数据 START */
      upStatus: 0, // 设备的运行状态
      upTime: '', // 设备的运行时间
      deviceSN: '', // 设备SN
      /* 传递给子组件的数据 END */
      upDataDirectiveId: guid(), // 请求更新数据指令
      handlerLayoutType: 1,
      memoryData: {},
      cpuData: {},
      fileData: {},
      diyItem: []
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
    isConfig() { return this.$route.query.isConfig }
  },
  destroyed() {
    // 组件卸载关闭定时器轮巡
    clearInterval(this.setHyitShowSurveyInterval)
  },
  mounted() {
    this.itemGuid = this.$tool.guid()
    this.watchAgentGetHostData()
    const that = this
    this.setHyitShowSurveyInterval = setInterval(() => {
      that.watchAgentGetHostData()
      that.upDataDirectiveId = guid()
    }, this.requestInterval)
    this.findHyitHostGraphShow()
    this.$EventBus.$on('delete-item-switch', () => {
      this.findHyitHostGraphShow()
    })
    this.$EventBus.$on('add-item-switch', () => {
      this.findHyitHostGraphShow()
    })
  },
  methods: {
    async watchAgentGetHostData() {
      // cpu
      this.cpuData = await this.agentGetHostData('getItemVMCpuData')
      console.log(this.cpuData)
      // 内存
      this.memoryData = await this.agentGetHostData('getItemVMMemoryInfoData')
      console.log(this.memoryData)
      // 文件系统
      this.fileData = await this.agentGetHostData('getItemVMFileSystemData')
      console.log(this.fileData)
    },
    // 获取状态值对应关系
    async agentGetValueMap(itemid) {
      return new Promise(resolve => {
        if (this.itMonitorRequireAgreement !== 'WS') {
          request({ url: api.itMonitor.agentGetValueMap, data: { agent: this.agent, itemid }}).then(res => {
            if (res.code === 1 && res.model) {
              resolve(res.model)
            } else {
              resolve(null)
            }
          })
        } else {
          const wsToken = this.sessionStorageOperation('get', 'wsToken')
          if (!wsToken) return
          const getUserSessionResult = getUserSession()
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetValueMap,
            data: {
              token: wsToken,
              companyId: getUserSessionResult.companyId,
              appId: getUserSessionResult.appId,
              agent: this.agent,
              itemid,
              fromAgent: this.localStorageOperation('get', 'fromAgent'),
              fromHostId: this.localStorageOperation('get', 'fromHostId')
            }
          },
          (res) => {
            if (res.ValueMapData) {
              resolve(res.ValueMapData)
            }
          }, (err) => {
            this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
            console.log(err)
          })
        }
      })
    },
    // 获取监控项数据
    async agentGetHostData(method) {
      if (this.itMonitorRequireAgreement !== 'WS') {
        return new Promise(resolve => {
          request({ url: api.itMonitor.agentGetHostData, data: { agent: this.agent, hostid: this.zbxHostId, method }}).then(res => {
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
              hostid: this.zbxHostId,
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
    // 查询显示配置
    findHyitHostGraphShow() {
      request({
        url: api.itMonitor.findHyitHostGraphShow, data: { hostId: this.id, zhostId: this.zbxHostId, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.$EventBus.$emit('get-graph-show', res.data)
          const diyItem = []
          res.data.forEach(item => {
            if (Number(item.type) === 2) {
              diyItem.push(item)
            }
          })
          this.diyItem = diyItem
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>
