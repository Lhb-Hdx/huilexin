<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" class="overview box-border margin-left-15 margin-right-15 margin-top-15">
    <div class="head-bar head">
      <div class="title">系统概况</div>
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
              <div class="info-label">CPU状态</div>
              <div>
                <el-tooltip class="item" effect="dark" :content="setMapStatus(CPUHealthStatus)" placement="top">
                  <img v-if="CPUHealthStatus === '0'" class="monitor-icon" src="image/common/right.png" alt="">
                  <img v-if="CPUHealthStatus !== '0'" class="monitor-icon" src="image/common/alarm.png" alt="">
                </el-tooltip>
              </div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">磁盘状态</div>
              <div>
                <el-tooltip class="item" effect="dark" :content="setMapStatus(DiskHealthStatus)" placement="top">
                  <img v-if="DiskHealthStatus === '0'" class="monitor-icon" src="image/common/right.png" alt="">
                  <img v-if="DiskHealthStatus !== '0'" class="monitor-icon" src="image/common/alarm.png" alt="">
                </el-tooltip>
              </div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">整体状态</div>
              <div>
                <el-tooltip class="item" effect="dark" :content="setMapStatus(EntiretyHealthStatus)" placement="top">
                  <img v-if="EntiretyHealthStatus === '0'" class="monitor-icon" src="image/common/right.png" alt="">
                  <img v-if="EntiretyHealthStatus !== '0'" class="monitor-icon" src="image/common/alarm.png" alt="">
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="system-info system-info-right-border" :style="{ height: systemInfoHeight + 'px' }">
            <div class="info-item flex align-item-center">
              <div class="info-label">风扇状态</div>
              <div>
                <el-tooltip class="item" effect="dark" :content="setMapStatus(FanHealthStatus)" placement="top">
                  <img v-if="FanHealthStatus === '0'" class="monitor-icon" src="image/common/right.png" alt="">
                  <img v-if="FanHealthStatus !== '0'" class="monitor-icon" src="image/common/alarm.png" alt="">
                </el-tooltip>
              </div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">存储状态</div>
              <div>
                <el-tooltip class="item" effect="dark" :content="setMapStatus(MemHealthStatus)" placement="top">
                  <img v-if="MemHealthStatus === '0'" class="monitor-icon" src="image/common/right.png" alt="">
                  <img v-if="MemHealthStatus !== '0'" class="monitor-icon" src="image/common/alarm.png" alt="">
                </el-tooltip>
              </div>
            </div>
            <div class="info-item flex align-item-center">
              <div class="info-label">电源状态</div>
              <div>
                <el-tooltip class="item" effect="dark" :content="setMapStatus(PwrHealthStatus)" placement="top">
                  <img v-if="PwrHealthStatus === '0'" class="monitor-icon" src="image/common/right.png" alt="">
                  <img v-if="PwrHealthStatus !== '0'" class="monitor-icon" src="image/common/alarm.png" alt="">
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="system-info" :style="{ height: systemInfoHeight + 'px' }">
            <div class="info-item flex align-item-center">
              <div class="info-label">温度状态</div>
              <div>
                <el-tooltip class="item" effect="dark" :content="setMapStatus(TempHealthStatus)" placement="top">
                  <img v-if="TempHealthStatus === '0'" class="monitor-icon" src="image/common/right.png" alt="">
                  <img v-if="TempHealthStatus !== '0'" class="monitor-icon" src="image/common/alarm.png" alt="">
                </el-tooltip>
              </div>
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
    serverOutline: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      CPUHealthStatus: '', // cpu状态
      DiskHealthStatus: '', // 磁盘状态
      EntiretyHealthStatus: '', // 整体情况
      FanHealthStatus: '', // 风扇状态
      MemHealthStatus: '', // 存储状态
      PwrHealthStatus: '', // 电源状态
      TempHealthStatus: '', // 温度
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
      watchItemKey: 'serviceOutline',
      watchItemShow: null,
      valueMap: []
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
    serverOutline: {
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
      const serverSystemOutlineData = this.serverOutline
      // cpu状态
      const CPUHealthStatusItem = this.$tool.findDataItemByAttr(serverSystemOutlineData, 'itemName', 'h3cCPUHealthStatus[0]')
      this.CPUHealthStatus = CPUHealthStatusItem ? CPUHealthStatusItem.itemValue : ''
      // 磁盘状态
      const DiskHealthStatusItem = this.$tool.findDataItemByAttr(serverSystemOutlineData, 'itemName', 'h3cDiskHealthStatus[0]')
      this.DiskHealthStatus = DiskHealthStatusItem ? DiskHealthStatusItem.itemValue : ''
      // 整体情况
      const EntiretyHealthStatusItem = this.$tool.findDataItemByAttr(serverSystemOutlineData, 'itemName', 'h3cEntiretyHealthStatus[0]')
      if (EntiretyHealthStatusItem) this.EntiretyHealthStatus = EntiretyHealthStatusItem.itemValue
      // 风扇状态
      const FanHealthStatusItem = this.$tool.findDataItemByAttr(serverSystemOutlineData, 'itemName', 'h3cFanHealthStatus[0]')
      if (FanHealthStatusItem) this.FanHealthStatus = FanHealthStatusItem.itemValue
      // 存储状态
      const MemHealthStatusItem = this.$tool.findDataItemByAttr(serverSystemOutlineData, 'itemName', 'h3cMemHealthStatus[0]', 'itemValue')
      this.MemHealthStatus = MemHealthStatusItem ? MemHealthStatusItem.itemValue : ''
      // 电源状态
      const PwrHealthStatusItem = this.$tool.findDataItemByAttr(serverSystemOutlineData, 'itemName', 'h3cPwrHealthStatus[0]')
      if (PwrHealthStatusItem) this.PwrHealthStatus = PwrHealthStatusItem.itemValue
      // 温度
      const TempHealthStatusItem = this.$tool.findDataItemByAttr(serverSystemOutlineData, 'itemName', 'h3cTempHealthStatus[0]')
      this.TempHealthStatus = TempHealthStatusItem ? TempHealthStatusItem.itemValue : ''
      if (EntiretyHealthStatusItem) this.agentGetValueMap(EntiretyHealthStatusItem.itemid)
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
    // 点击开关
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '系统概况',
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
