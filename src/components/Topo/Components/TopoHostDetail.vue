<template>
  <div class="host-detail" :style="{ top: host.layerY + 'px', left: host.layerX + 'px', 'background-color': styleOptions.backgroundColor }">
    <div class="host-detail-header">
      <div class="host-name overflow-text-a" :style="{ 'color': styleOptions.nameColor }">{{ host.hostName }}</div>
      <div class="host-statue">
        <div class="status-tag" :style="setHostStatusTagStyle(host)">{{ setHostStatus(host) }}</div>
      </div>
    </div>
    <div v-if="host.ip" class="host-ip">{{ host.ip }}</div>
    <div v-if="host.org" class="host-org">位置：{{ host.org }}</div>
    <div v-if="host.runTime" class="host-run-time">设备运行时长：{{ host.runTime }}</div>
    <div class="host-btn">
      <el-button type="text" @click="openHostPort"><div :style="{ 'color': styleOptions.linkItemColor }">端口情况</div></el-button>
      <el-divider v-if="styleOptions.showVertical" direction="vertical" />
      <el-button type="text" @click="openHostDevice"><div :style="{ 'color': styleOptions.linkItemColor }">设备详情</div></el-button>
      <el-divider v-if="styleOptions.showVertical" direction="vertical" />
      <el-button type="text" @click="openPing"><div :style="{ 'color': styleOptions.linkItemColor }">Ping</div></el-button>
    </div>
    <el-dialog ref="shellDialog" class="no-dialog-body" width="50%" top="5vh" :title="dialogTitle" :visible.sync="showShellDialog" :close-on-click-modal="false" :destroy-on-close="true" :before-close="onBeforeShellDialog" append-to-body>
      <div ref="dialogBody" class="dialog-body no-padding">
        <shell-window v-if="showShellDialog" :login-server-info="loginServerInfo" :shell-result-msg="shellResultQueue" :show-input="showShellInput" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import ShellWindow from '@/components/ShellWindow/ShellWindow'
import {isJSONString} from '@/utils/utils'
import {getUserSession} from '@/utils/auth'
import {sendWebsocket} from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

export default {
  name: 'TopoHostDetail',
  components: { ShellWindow },
  props: {
    host: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * @description 样式配置
     * @param styleOptions 样式配置
     */
    styleOptions: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      showHostDevice: false,
      shellResultQueue: '',
      dialogTitle: '',
      showShellInput: false,
      showShellDialog: false,
      loginServerInfo: {}
    }
  },
  computed: {
    setHostStatus() {
      return function(row) {
        const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        return count === 1 ? '在线' : '离线'
      }
    },
    setHostStatusTagStyle() {
      return function(row) {
        const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        let styles = {}
        if (count === 1) {
          styles = {
            'background-color': this.styleOptions.onlineTagBackgroundColor || '#e6f7f3',
            'border-color': this.styleOptions.onlineTagBorderColor || '#ccf0e7',
            'color': this.styleOptions.onlineTagColor || '#00b285'
          }
        } else {
          styles = {
            'background-color': this.styleOptions.offlineTagBackgroundColor || '#ffeded',
            'border-color': this.styleOptions.offlineTagBorderColor || '#ffdbdc',
            'color': this.styleOptions.offlineTagColor || '#fe4d4e'
          }
        }
        return styles
      }
    }
  },
  mounted() {
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'tool-ping-websocket') {
        const wsRes = isJSONString(res.detail.data.jsonData) ? JSON.parse(res.detail.data.jsonData) : []
        if (wsRes) {
          if (wsRes) this.shellResultQueue = wsRes.output
        }
      }
    })
  },
  methods: {
    openHostPort() {
      request({ url: api.port.findPortDevice, data: { limit: -1, zhostid: this.host.hyZhostId }}).then(res => {
        if (res.code === 1) {
          this.$EventBus.$emit('openHostPortDevice', res.data[0])
        }
      })
    },
    openHostDevice() {
      this.$EventBus.$emit('openHostDevice', this.host)
    },
    openPing() {
      this.dialogTitle = `${this.host.ip}`
      this.showShellDialog = true
      this.$nextTick(() => {
        this.startPing()
      })
    },
    startPing() {
      this.showShellInput = false
      this.shellResultQueue = '正在执行\n'
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: 'tool-ping-websocket',
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          ip: this.host.ip,
          agent: this.host.agent,
          fromAgent: '',
          fromHostId: ''
        }
      })
    },
    // 关闭shell窗口
    onBeforeShellDialog() {
      this.showShellDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
.host-detail {
  position: absolute;
  background: #fff;
  padding-left: 14px;
  padding-right: 14px;
  width: 300px;
  z-index: 1;
  .host-detail-header {
    padding-top: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .host-name {
      font-weight: bold;
      font-size: 16px;
      width: 70%;
      color: #000;
    }
  }
  .host-ip, .host-org, .host-run-time {
    color: #878787;
    padding-top: 5px;
  }
}
.status-tag {
  display: inline-block;
  padding: 0 10px;
  font-size: 12px;
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
  line-height: 28px;
}
</style>
