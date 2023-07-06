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
              <div class="info-label">CMOS电池状态</div>
              <div class="info-value">{{ setMapStatus(cmosPowerStatus) }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">系统状态</div>
              <div class="info-value">{{ setMapStatus(systemStatus) }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">设备型号</div>
              <div class="info-value">{{ deviceModel }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">IDRAC远程访问路径</div>
              <div class="info-value pointer">
                <a :href="idracRemoteAccesPath" target="_blank">{{ idracRemoteAccesPath }}</a>
              </div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">RAID控制器固件</div>
              <div class="info-value">{{ raidControllerVersion }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="system-info system-info-right-border" :style="{ height: systemInfoHeight + 'px' }">
            <div class="info-item flex align-item-center">
              <div class="info-label">服务器SN</div>
              <div class="info-value">{{ serverSN }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">系统快速服务代码</div>
              <div class="info-value">{{ systemServerCode }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">IDRAC固件版本</div>
              <div class="info-value">{{ idracFirmwareVersion }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">IDRAC版本</div>
              <div class="info-value">{{ idracVersion }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="system-info" :style="{ height: systemInfoHeight + 'px' }">
            <div class="info-item flex align-item-center">
              <div class="info-label">整体系统的汇总情况</div>
              <div class="info-value">{{ setMapStatus(systemSummary) }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">系统总体存储状态</div>
              <div class="info-value">{{ setMapStatus(systemStorageStatus) }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">RAID控制卡状态</div>
              <div class="info-value">{{ setMapStatus(raudControllerCardStatus) }}</div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">RAID控制器名称</div>
              <div class="info-value">{{ raidControllerName }}</div>
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
      loading: true
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
      return function(value) {
        const idx = this.valueMap.findIndex(item => item.value === value)
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
    async watchAgentGetHostData() {
      const serverSystemInfoData = this.serverInfo
      // CMOS电池状态
      const cmosPowerStatusItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'CMOS电池状态:')
      this.cmosPowerStatus = cmosPowerStatusItem ? cmosPowerStatusItem.itemValue : ''
      // 服务器SN
      const serverSNItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', '服务器SN', 'itemValue')
      this.serverSN = serverSNItem ? serverSNItem.itemValue : ''
      // 整体系统的汇总情况
      const systemSummaryItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', '整体系统的汇总情况')
      if (systemSummaryItem) this.systemSummary = systemSummaryItem.itemValue
      // 系统状态
      const systemStatusItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', '系统状态')
      if (systemStatusItem) this.systemStatus = systemStatusItem.itemValue
      // 系统快速服务代码
      const systemServerCodeItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', '系统快速服务代码', 'itemValue')
      this.systemServerCode = systemServerCodeItem ? systemServerCodeItem.itemValue : ''
      // 系统总体存储状态
      const systemStorageStatusItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', '系统总体存储状态')
      if (systemStorageStatusItem) this.systemStorageStatus = systemStorageStatusItem.itemValue
      // 型号
      const deviceModelItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', '型号', 'itemValue')
      this.deviceModel = deviceModelItem ? deviceModelItem.itemValue : ''
      // IDRAC固件版本
      const idracFirmwareVersionItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'IDRAC固件版本:', 'itemValue')
      this.idracFirmwareVersion = idracFirmwareVersionItem ? idracFirmwareVersionItem.itemValue : ''
      // RAID控制卡状态
      const raudControllerCardStatusItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', '整体系统的汇总情况')
      if (raudControllerCardStatusItem) this.raudControllerCardStatus = raudControllerCardStatusItem.itemValue
      // IDRAC远程访问路径
      const idracRemoteAccesPathItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'IDRAC远程访问路径:', 'itemValue')
      this.idracRemoteAccesPath = idracRemoteAccesPathItem ? idracRemoteAccesPathItem.itemValue : ''
      // IDRAC版本
      const idracVersionItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'IDRAC版本:', 'itemValue')
      this.idracVersion = idracVersionItem ? idracVersionItem.itemValue : ''
      // RAID控制器名称
      const raidControllerName = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'RAID Controller : Name', 'itemValue')
      this.raidControllerName = raidControllerName ? raidControllerName.itemValue : ''
      // RAID控制器固件
      const raidControllerVersionItem = this.$tool.findDataItemByAttr(serverSystemInfoData, 'itemName', 'RAID Controller : Firmware Version', 'itemValue')
      this.raidControllerVersion = raidControllerVersionItem ? raidControllerVersionItem.itemValue : ''
      if (systemSummaryItem) this.agentGetValueMap(systemSummaryItem.itemid)
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
