<template>
  <div class="ping-dialog">
    <el-dialog ref="shellDialog" class="no-dialog-body" width="50%" top="5vh" :title="dialogTitle" :visible.sync="showShellDialog" :close-on-click-modal="false" :destroy-on-close="true" :before-close="onBeforeShellDialog">
      <div slot="title">
        {{ dialogTitle }}
        <div class="header-form">
          <el-select
            v-model="agentItemId"
            size="mini"
            filterable
            placeholder="请选择网关"
            class="filter-item"
            @change="changeAgent"
          >
            <el-option
              v-for="item in agentList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <el-select
            v-if="showChildrenAgentItem"
            v-model="childrenAgentItemId"
            size="mini"
            filterable
            placeholder="请选择下级网关"
            class="filter-item"
          >
            <el-option
              v-for="item in childrenAgentList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <el-button size="mini" class="filter-item" type="primary" @click="startPing">开始Ping</el-button>
        </div>
      </div>
      <div ref="dialogBody" class="dialog-body no-padding">
        <shell-window v-if="showShellDialog" :login-server-info="loginServerInfo" :shell-result-msg="shellResultQueue" :show-input="showShellInput" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ShellWindow from '@/components/ShellWindow/ShellWindow'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd.js'
import { getUserSession } from '@/utils/auth'
import { isJSONString } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'PingDialog',
  components: {
    ShellWindow
  },
  props: {
    subNetId: {
      type: [String, Number],
      default() {
        return ''
      }
    }
  },
  data() {
    return {
      shellResultQueue: '',
      dialogTitle: '',
      showShellInput: false,
      showShellDialog: false,
      loginServerInfo: {},
      agentList: [],
      agentItem: {},
      agentItemId: '',
      childrenAgentItem: {},
      childrenAgentItemId: '',
      childrenAgentList: [],
      showChildrenAgentItem: false,
      agentsIds: ''
    }
  },
  async mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.agentList = await this.findHyitAgent('1,8')
    if (this.agentList.length > 0) {
      this.agentItemId = this.agentList[0].id
      this.agentItem = this.agentList[0]
      if (this.agentItem.agentType === 8) {
        this.showChildrenAgentItem = true
        this.childrenAgentList = await this.findHyitAgent('1')
        if (this.childrenAgentList.length > 0) {
          this.childrenAgentItemId = this.childrenAgentList[0].id
          this.childrenAgentItem = this.childrenAgentList[0]
        }
        this.$EventBus.$emit('change-agent', this.childrenAgentList[0].id)
      } else {
        this.$EventBus.$emit('change-agent', this.agentList[0].id)
      }
    }
  },
  methods: {
    // 调用ws运行ping
    async ping(selectIpItem) {
      this.loginServerInfo = selectIpItem
      this.dialogTitle = `${selectIpItem.ip}`
      this.showShellDialog = true
    },
    // 关闭shell窗口
    onBeforeShellDialog() {
      this.showShellDialog = false
      if (this.showShellInput) this.socketCMDOperationShellOrTelnetLogOut(this.executeType === 'ssh' ? socketCmd.automationOperations.sshLogOut : socketCmd.automationOperations.telnetLogOut)
    },
    // 获取子网信息
    async getOpsIpAddress() {
      const { code, model } = await request({ url: api.ipAddressManage.getOpsIpAddress, data: {
        id: this.subNetId
      }})
      if (code !== 1) return
      return model
    },
    async findHyitAgent(agentTypes) {
      const res = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentTypes, agents: this.agentsIds, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (res.code !== 1) return
      return res.data
    },
    async changeAgent(val) {
      const idx = this.agentList.findIndex(item => Number(item.id) === Number(val))
      if (idx === -1) return
      this.agentItem = this.agentList[idx]
      if (this.agentList[idx].agentType === 8) {
        this.childrenAgentList = await this.findHyitAgent('9')
        this.showChildrenAgentItem = true
        if (this.childrenAgentList.length > 0) {
          this.childrenAgentItemId = this.childrenAgentList[0].id
          this.childrenAgentItem = this.childrenAgentList[0]
        }
      } else {
        this.childrenAgentList = []
        this.childrenAgentItem = {}
        this.childrenAgentItemId = ''
        this.showChildrenAgentItem = false
      }
    },
    startPing() {
      this.showShellInput = false
      this.shellResultQueue = '正在执行\n'
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      const getUserSessionResult = getUserSession()
      const socketData = {
        token: wsToken,
        companyId: getUserSessionResult.companyId,
        appId: getUserSessionResult.appId,
        ip: this.loginServerInfo.ip
      }
      if (this.agentItem.agentType === 8) {
        socketData.agent = this.childrenAgentItem.id
      } else {
        socketData.agent = this.agentItem.id
      }
      if (this.loginServerInfo.agent === null) {
        this.updateOpsIpAddressDetailAgent({
          agent: socketData.agent,
          netSegmentId: this.loginServerInfo.netSegmentId
        })
      }
      console.log(socketData)
      console.log(this.loginServerInfo)
      sendWebsocket(socketCmd.host.default, {
        cmd: 'tool-ping-websocket',
        data: socketData
      },
      (res) => {
        const wsRes = isJSONString(res.jsonData) ? JSON.parse(res.jsonData) : res.jsonData
        if (wsRes) {
          if (wsRes) this.shellResultQueue = isJSONString(res.jsonData) ? wsRes.output : res.jsonData
        }
      }, (err) => {
        this.$message({
          message: 'WebSocket调用失败',
          type: 'error'
        })
        console.log(err)
      })
    },
    updateOpsIpAddressDetailAgent(query) {
      request({
        url: api.ipAddressManage.updateOpsIpAddressDetailAgent,
        data: query
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.header-form {
  margin-left: 10px;
  display: inline-block;
  .filter-item {
    margin-right: 10px;
  }
}
</style>
