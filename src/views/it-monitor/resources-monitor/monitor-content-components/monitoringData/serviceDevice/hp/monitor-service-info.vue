<template>
  <div
    v-if="isConfig || (!isConfig && !watchItemShow)"
    v-loading="loading"
    element-loading-spinner="el-icon-loading"
    class="overview box-border margin-left-15 margin-right-15 margin-top-15"
  >
    <div class="head-bar head">
      <div class="title">系统概要</div>
      <div class="chunk-opts">
        <div v-if="isConfig" class="chunk-opts-select">
          <el-switch
            v-model="watchItemSwitch"
            @change="changeItemSwitch"
          />
        </div>
      </div>
    </div>
    <div ref="systemInfoRef">
      <el-row>
        <el-col :span="8">
          <div class="system-info system-info-right-border" :style="{ height: systemInfoHeight + 'px' }">
            <div class="info-item flex align-item-center">
              <div class="info-label">系统名称</div>
              <div class="info-value">{{ systemName }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">系统对象ID</div>
              <div class="info-value">{{ systemObjectId }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="system-info system-info-right-border" :style="{ height: systemInfoHeight + 'px' }">
            <div class="info-item flex align-item-center">
              <div class="info-label">系统健康状态</div>
              <div class="info-value">{{ setMapStatus(systemHealthStatus) }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">SNMP网关可用性</div>
              <div class="info-value pointer">
                <div class="info-value">{{ setMapStatus(SNMPAgentAvailability) }}</div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="system-info system-info-right-border" :style="{ height: systemInfoHeight + 'px' }">
            <div class="info-item flex align-item-center">
              <div class="info-label">系统地址</div>
              <div class="info-value">{{ systemLocation }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">系统描述</div>
              <div class="info-value">{{ systemDescription }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import { isJSONString } from '@/utils/utils'

export default {
  name: 'MonitorServiceInfo',
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
    serverInfo: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      cmosPowerStatus: '',
      serverSN: '',
      systemSummary: '',
      systemStatus: '',
      systemServerCode: '',
      systemStorageStatus: '',
      deviceModel: '',
      idracFirmwareVersion: '',
      raudControllerCardStatus: '',
      idracRemoteAccesPath: '',
      idracVersion: '',
      raidControllerName: '',
      raidControllerVersion: '',
      systemInfoHeight: '',
      itemGuid: null,
      watchItemSwitch: true,
      watchItemKey: 'serviceInfo',
      watchItemShow: null,
      valueMap: [],
      loading: true,
      systemName: '',
      systemObjectId: '',
      systemLocation: '',
      systemDescription: '',
      systemHealthStatus: {
        itemId: '',
        itemValue: ''
      },
      SNMPAgentAvailability: {
        itemId: '',
        itemValue: ''
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
    id() { return this.$route.query.id },
    setMapStatus() {
      return function(mapItem) {
        const idx = this.valueMap.findIndex(item => +item.value === +mapItem.itemValue && +item.itemid === +mapItem.itemId)
        return idx !== -1 ? this.valueMap[idx].newvalue : ''
      }
    }
  },
  watch: {
    upDataDirectiveId: {
      handler() {
        this.watchAgentGetHostData()
      },
      deep: true
    },
    serverInfo: {
      handler(newVal) {
        this.watchAgentGetHostData()
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-graph-show')
  },
  mounted() {
    this.componentGuid = this.$tool.guid()
    this.systemInfoHeight = this.$refs.systemInfoRef.clientHeight
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetValueMap-websocket' && res.detail.data.componentGuid === this.componentGuid) {
        this.valueMap = this.$tool.isJSONString(res.detail.data.ValueMapData) ? JSON.parse(res.detail.data.ValueMapData) : []
      }
    })
  },
  methods: {
    // 获取概况
    async watchAgentGetHostData(data) {
      const serverSystemInfoData = this.serverInfo
      const itemIds = []
      // 系统名称
      const systemName = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'System name')
      this.systemName = systemName ? systemName.itemValue : ''
      // 系统对象ID
      const systemObjectId = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'System object ID')
      this.systemObjectId = systemObjectId ? systemObjectId.itemValue : ''
      // 系统健康状态
      const systemHealthStatus = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'Overall system health status')
      if (systemHealthStatus) {
        this.$set(this.systemHealthStatus, 'itemId', systemHealthStatus.itemid)
        this.$set(this.systemHealthStatus, 'itemValue', systemHealthStatus.itemValue)
        itemIds.push(systemHealthStatus.itemid)
      }
      // SNMP网关可用性
      const SNMPAgentAvailability = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'SNMP agent availability')
      if (SNMPAgentAvailability) {
        this.$set(this.SNMPAgentAvailability, 'itemId', SNMPAgentAvailability.itemid)
        this.$set(this.SNMPAgentAvailability, 'itemValue', SNMPAgentAvailability.itemValue)
        itemIds.push(SNMPAgentAvailability.itemid)
      }
      // 系统地址
      const systemLocation = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'System location')
      this.systemLocation = systemLocation ? systemLocation.itemValue : ''
      // 系统描述
      const systemDescription = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'System description')
      if (systemDescription) this.systemDescription = systemDescription.itemValue

      if (itemIds.length > 0) this.agentGetValueMap(itemIds.toString())
      this.loading = false
    },
    // 获取状态值对应关系
    agentGetValueMap(itemid) {
      if (this.itMonitorRequireAgreement !== 'WS') {
        request({ url: api.itMonitor.agentGetValueMap, data: { agent: this.agent, itemid }}).then(res => {
          if (res.code === 1 && res.model) {
            this.valueMap = this.$tool.isJSONString(res.model) ? JSON.parse(res.model) : []
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
            componentGuid: this.componentGuid,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        })
      }
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
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '系统概要',
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
.system-info {
  position: relative;
  .info-item {
    //border-right: 1px solid #dddddd;
    text-align: left;
    font-weight: 400;
    line-height: 1.5;
    .info-label {
      padding: 10px;
      color: #606266;
      width: 150px;
    }
    .info-value {
      color: #0CB68B;
    }
  }
}
.system-info-right-border::before {
  content: ' ';
  display: block;
  height: 80%;
  width: 1px;
  background: #dddddd;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 5%;
}
</style>
