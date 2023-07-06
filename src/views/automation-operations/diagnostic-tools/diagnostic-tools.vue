<template>
  <div ref="appContainer" class="app-container">
    <el-tabs v-model="activeTabName" @tab-click="handleClick">
      <el-tab-pane v-for="item in tabs" :key="item.label" :label="item.label" :name="item.name">
        <DiagnosticToolsForm :form-props="formProps" :form-name="formName" @runDiagnostic="runDiagnostic" />
      </el-tab-pane>
    </el-tabs>
    <shell-window :key="shellKey" :shell-result-msg="shellResultQueue" :show-input="false" :adapt-height="true" />
  </div>
</template>

<script>
import ShellWindow from '@/components/ShellWindow/ShellWindow'
import DiagnosticToolsForm from './diagnostic-tools-form'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import { isJSONString } from '@/utils/utils'
import { guid } from '@/utils/utils'

export default {
  name: 'DiagnosticTools',
  components: {
    ShellWindow, DiagnosticToolsForm
  },
  data() {
    return {
      tabs: [
        {
          name: 'ping',
          label: 'Ping',
          socketUrl: 'tool-ping-websocket',
          formProps: [
            { field: 'ip', placeholder: '请输入IP', model: '', modelField: 'ip' }
          ]
        },
        {
          name: 'port',
          label: '端口检测',
          socketUrl: 'tool-port-websocket',
          formProps: [
            { field: 'ip', placeholder: '请输入IP', model: '', modelField: 'ip' },
            { field: '端口', placeholder: '请输入端口', model: '', modelField: 'port' }
          ]
        },
        {
          name: 'snmp',
          label: 'snmp检测',
          socketUrl: 'tool-snmp-websocket',
          formProps: [
            { field: 'ip', placeholder: '请输入IP', model: '', modelField: 'ip' },
            { field: '端口', placeholder: '请输入端口', model: '161', modelField: 'port' },
            { field: '团体字', placeholder: '请输入团体字', model: '', modelField: 'name' }
            // { field: 'oid', placeholder: '请输入Oid', model: '', modelField: 'oid' }
          ]
        }
      ],
      activeTabName: 'ping',
      shellResultQueue: '',
      formRule: {},
      formProps: [],
      formName: '',
      socketUrl: '',
      shellKey: '',
      socketData: {}
    }
  },
  mounted() {
    this.formProps = this.tabs[0].formProps
    this.socketUrl = this.tabs[0].socketUrl
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'tool-ping-websocket' || res.detail.data.cmd === 'tool-port-websocket' || res.detail.data.cmd === 'tool-snmp-websocket') {
        const wsRes = isJSONString(res.detail.data.jsonData) ? JSON.parse(res.detail.data.jsonData) : res.detail.data.jsonData
        if (wsRes) {
          if (wsRes) this.shellResultQueue = isJSONString(res.detail.data.jsonData) ? wsRes.output : res.detail.data.jsonData
        }
      }
    })
  },
  methods: {
    handleClick(val) {
      this.shellKey = guid()
      const idx = this.tabs.findIndex(item => item.name === val.name)
      if (idx !== -1) {
        this.formProps = this.tabs[idx].formProps
        this.formName = this.tabs[idx].name
        this.socketUrl = this.tabs[idx].socketUrl
      }
    },
    runDiagnostic(val) {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      const getUserSessionResult = getUserSession()
      if (this.formName === 'snmp') {
        this.socketData = {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: val.agent,
          version: val.version,
          oid: val.oid
        }
      } else {
        this.socketData = {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: val.agent
        }
      }

      val.form.forEach(item => {
        this.socketData[`${item.modelField}`] = item.model
      })
      sendWebsocket(socketCmd.host.default, {
        cmd: this.socketUrl,
        data: this.socketData
      })
    }
  }
}
</script>

<style scoped>

</style>
