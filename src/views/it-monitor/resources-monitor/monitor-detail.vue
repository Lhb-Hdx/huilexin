<template>
  <div class="flex-container">
    <div class="left-tool">
      <div class="detail-subtype">
        <div class="type">
          <span v-if="!isConfig" class="back-btn" @click="$router.back()">
            <i class="el-icon-back" />
          </span>
          {{ hostDetail.hyMarkName }}
        </div>
        <div class="ip" style="text-indent:26px">{{ hostDetail.hyIp }}</div>
      </div>
      <div class="detail-header">
        <el-tabs v-model="activeTabName" type="border-card" class="no-pane-padding detail-tab no-border">
          <el-tab-pane v-if="$auth.getVuexStoragePermission('MonitorDataTab') !== -1" label="监控数据" name="1" />
          <el-tab-pane v-if="!isConfig && $auth.getVuexStoragePermission('MonitorItemTab') !== -1" label="监控项" name="2" />
          <el-tab-pane v-if="!isConfig && $auth.getVuexStoragePermission('EventTab') !== -1" label="事件" name="5" />
          <el-tab-pane v-if="!isConfig && $auth.getVuexStoragePermission('DevicePortTab') !== -1" label="设备端口" name="6" />
          <el-tab-pane v-if="!isConfig && $auth.getVuexStoragePermission('DeviceStatisticalTab') !== -1" label="设备统计" name="7" />
        </el-tabs>
        <div class="btn">
          <div class="btn-main">
            <div class="btn-item pointer margin-r" @click="snmp">snmp检测</div>

            <div class="btn-item pointer" @click="ping">Ping</div>
          </div>
        </div>
      </div>
      <div class="device-main">
        <MonitorEcharts v-if="activeTabName === '1'" :usability="usability" @upTime="getUpTime" />
        <DPoint v-if="activeTabName === '2'" :host-detail="hostDetail" />
        <DEvent v-if="activeTabName === '5'" :host-info="hostDetail" />
        <DevicePort v-if="activeTabName === '6'" :host-info="hostDetail" />
        <DeviceStatistical v-if="activeTabName === '7'" :host-info="hostDetail" />
      </div>
    </div>
    <div class="right-tool">
      <div class="detail-info-card">
        <div class="detail-info-card-header">
          基础信息
        </div>
        <div class="detail-info-card-content">
          <div class="detail-info-cell">
            <span class="left-cell">类型：</span>
            <span class="right-cell">{{ setHostType(hostDetail.hyDevTypeId) }}</span>
          </div>
          <div class="detail-info-cell">
            <span class="left-cell">子类型：</span>
            <span class="right-cell">{{ hostDetail.hySubdevType }}</span>
          </div>
          <div class="detail-info-cell">
            <span class="left-cell">状态：</span>
            <span class="right-cell" :class="hostDetail.hyNetState === 1 ? 'green' : 'red'">{{ hostDetail.hyNetState ? '在线' : '离线' }}</span>
          </div>
          <div class="detail-info-cell">
            <span class="left-cell">可用性：</span>
            <span class="right-cell">
              <el-tag
                v-for="(item, index) in availables"
                :key="item.label"
                size="mini"
                :type="setAvailables(index)"
                effect="dark"
                style="margin-right: 1px;"
              >
                {{ item.label }}
              </el-tag>
            </span>
          </div>
          <div class="detail-info-cell">
            <span class="left-cell">运行时长：</span>
            <span class="right-cell">{{ deviceUpTime }}</span>
          </div>
          <div class="detail-info-cell">
            <span class="left-cell">管理者：</span>
            <span class="right-cell" />
          </div>
          <div class="detail-info-cell">
            <span class="left-cell">型号：</span>
            <span class="right-cell">{{ hostDetail.hyModel }}</span>
          </div>
          <div class="detail-info-cell">
            <span class="left-cell">区域：</span>
            <span class="right-cell">{{ setOrgName() }}</span>
          </div>
          <div class="detail-info-cell">
            <span class="left-cell">所在位置：</span>
            <span class="right-cell">{{ hostDetail.hyAddr }}</span>
          </div>
        </div>
      </div>
    </div>
    <el-dialog ref="shellDialog" class="no-dialog-body" width="50%" top="5vh" :title="dialogTitle" :visible.sync="showShellDialog" :close-on-click-modal="false" :destroy-on-close="true" :before-close="onBeforeShellDialog">
      <div ref="dialogBody" class="dialog-body no-padding">
        <shell-window v-if="showShellDialog" :login-server-info="loginServerInfo" :shell-result-msg="shellResultQueue" :show-input="showShellInput" />
      </div>
    </el-dialog>
    <el-dialog ref="snmpDialog" class="no-dialog-body" width="80%" top="5vh" title="snmp测试" :visible.sync="showSnmpDialog" :destroy-on-close="true">
      <div ref="dialogBody" class="dialog-body no-padding">
        <div>
          <el-form label-width="80px">
            <el-row :gutter="12">
              <el-col :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
                <el-form-item label="网关">
                  <el-select
                    v-model="agent"
                    filterable
                    placeholder="网关"
                    class="w-100"
                  >
                    <el-option
                      v-for="agentItem in agentList"
                      :key="agentItem.id"
                      :label="agentItem.name"
                      :value="agentItem.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col v-for="item in formProps" :key="item.field" :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
                <el-form-item :label="item.field" prop="ip">
                  <el-input v-model="item.model" :placeholder="item.placeholder" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
                <el-form-item label="snmp版本">
                  <el-select
                    v-model="version"
                    filterable
                    placeholder="snmp版本"
                    class="w-100"
                  >
                    <el-option
                      v-for="snmpItem in snmpVersion"
                      :key="snmpItem.id"
                      :label="snmpItem.name"
                      :value="snmpItem.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
                <el-button class="filter-item" type="primary" @click="runDiagnostic">检测</el-button>
              </el-col>
            </el-row>
            <el-row :gutter="12">
              <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
                <el-form-item label="oid" prop="oid">
                  <el-input v-model="oid" placeholder="请输入oid" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <shell-window :key="shellKey" :shell-result-msg="shellResultQueue" :show-input="false" :adapt-height="true" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import DPoint from './monitor-content-components/monitoringItem/monitoring-item'
import DEvent from './monitor-content-components/event/detail-event'
import MonitorEcharts from './monitor-content'
import api from '@/api/api'
import DevicePort from './monitor-content-components/devicePort/device-port'
import DeviceStatistical from './monitor-content-components/deviceStatistical/deviceStatistical'
import ShellWindow from '@/components/ShellWindow/ShellWindow'
import socketCmd from '@/api/socket-cmd'
import {getUserSession} from '@/utils/auth'
import {sendWebsocket} from '@/utils/websocket'
import {isJSONString} from '@/utils/utils'

export default {
  name: 'ResourcesDetail',
  components: { DPoint, DEvent, MonitorEcharts, DevicePort, DeviceStatistical, ShellWindow },
  props: {
    isConfig: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      active: '1',
      status: 1,
      show: false,
      availables: [
        { label: 'AGENT' },
        { label: 'SNMP' },
        { label: 'JMX' },
        { label: 'IPMI' }
      ],
      hostDetail: {},
      devType: [],
      orgList: [],
      usability: 0,
      activeTabName: '',
      deviceUpTime: '',
      shellResultQueue: '',
      dialogTitle: '',
      showShellInput: false,
      showShellDialog: false,
      showSnmpDialog: false,
      loginServerInfo: {},
      tabBtns: [],
      opsHostDetail: {},
      shellKey: '',
      agentList: [],
      agent: '',
      formProps: [
        { field: 'ip', placeholder: '请输入IP', model: '', modelField: 'ip' },
        { field: '端口', placeholder: '请输入端口', model: '161', modelField: 'port' },
        { field: '团体字', placeholder: '请输入团体字', model: '', modelField: 'name' }
        // { field: 'oid', placeholder: '请输入Oid', model: '', modelField: 'oid' }
      ],
      version: 1,
      oid: '',
      snmpVersion: [
        {id: 1, name: 'v1' },
        {id: 2, name: 'v2' }
      ]
    }
  },
  computed: {
    // 编辑获取内容
    id() {
      return this.$route.query.id
    },
    // 设置主机类型
    setHostType() {
      return function(id) {
        const devTypeIdx = this.devType.findIndex(item => item.id === id)
        if (devTypeIdx !== -1) {
          return this.devType[devTypeIdx].dictdataName
        }
      }
    },
    // 设置主机状态
    setHostStatus() {
      return this.hostDetail.hyNetState === 1 ? '在线' : '离线'
    },
    // 设置区域
    setOrgName() {
      return function() {
        if (!this.orgList) return ''
        const orgIdx = this.orgList.findIndex(item => item.hyAreaId === this.hostDetail.hyOrgId)
        if (orgIdx !== -1) {
          return this.orgList[orgIdx].hyAreaName
        }
      }
    }
  },
  mounted() {
    const tabBtnsStorage = [
      { value: 1, label: '监控数据', permissionsName: 'MonitorDataTab' },
      { value: 2, label: '监控项', permissionsName: 'MonitorItemTab' },
      { value: 5, label: '事件', permissionsName: 'EventTab' },
      { value: 6, label: '设备端口', permissionsName: 'DevicePortTab' },
      { value: 7, label: '设备统计', permissionsName: 'DeviceStatisticalTab' }
    ]
    tabBtnsStorage.forEach(item => {
      const idx = this.$auth.getVuexStoragePermission(`${item.permissionsName}`)
      if (idx !== -1 && +this.activeTabName === 0) {
        this.activeTabName = String(item.value)
      }
    })
    this.getHyitHost()
    this.loadItType()
    this.loadOrgList()
    if (this.$route.query.activeTabName) {
      this.activeTabName = this.$route.query.activeTabName
    }
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'tool-ping-websocket') {
        const wsRes = isJSONString(res.detail.data.jsonData) ? JSON.parse(res.detail.data.jsonData) : []
        if (wsRes) {
          if (wsRes) this.shellResultQueue = wsRes.output
        }
      }
    })
    this.shellKey = this.$tool.guid()
    this.findHyitAgent()
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'tool-snmp-websocket') {
        const wsRes = isJSONString(res.detail.data.jsonData) ? JSON.parse(res.detail.data.jsonData) : res.detail.data.jsonData
        if (wsRes) {
          if (wsRes) this.shellResultQueue = isJSONString(res.detail.data.jsonData) ? wsRes.output : res.detail.data.jsonData
        }
      }
    })
  },
  methods: {
    // 获取网关
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          this.agentList = res.data
          this.agent = res.data[0].id
        }
      })
    },
    runDiagnostic() {
      for (let i = 0; i < this.formProps.length; i++) {
        if (this.formProps[i].model === '') {
          return this.$message({
            type: 'error',
            message: this.formProps[i].placeholder
          })
        }
        if (this.oid === '') {
          return this.$message({
            type: 'error',
            message: '请输入oid'
          })
        }
      }
      this.runDiagnosticData({ agent: this.agent, form: this.formProps, version: this.version, oid: this.oid})
    },
    runDiagnosticData(val) {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      const getUserSessionResult = getUserSession()
      this.socketData = {
        token: wsToken,
        companyId: getUserSessionResult.companyId,
        appId: getUserSessionResult.appId,
        agent: val.agent,
        version: val.version,
        oid: val.oid
      }

      val.form.forEach(item => {
        this.socketData[`${item.modelField}`] = item.model
      })
      console.log(this.socketData)
      sendWebsocket(socketCmd.host.default, {
        cmd: 'tool-snmp-websocket',
        data: this.socketData
      })
    },
    setAvailables(index) {
      let key = 'info'
      if (this.hostDetail.hyAvailable === 1 && index === 0 || this.hostDetail.hySnmpAvailable === 1 && index === 1 || this.hostDetail.hyJmxAvailable === 1 && index === 2 || this.hostDetail.hyIpmiAvailable === 1 && index === 3) {
        key = 'success'
      }
      if (this.hostDetail.hyAvailable === 2 && index === 0 || this.hostDetail.hySnmpAvailable === 2 && index === 1 || this.hostDetail.hyJmxAvailable === 2 && index === 2 || this.hostDetail.hyIpmiAvailable === 2 && index === 3) {
        key = 'danger'
      }
      return key
    },
    // 获取主机信息
    getHyitHost() {
      request({
        url: api.itMonitor.getHyitHost, data: { hyHostId: this.id }
      }).then(async res => {
        if (res.code === 1) {
          this.hostDetail = res.model
          // this.usability = res.model.hyAvailable + res.model.hySnmpAvailable + res.model.hyIpmiAvailable + res.model.hyJmxAvailable
          this.usability = res.model.hyNetState
          const { code, data } = await request({
            url: api.common.findSysDictionaryDetail,
            data: { dictCode: 'it_sub_dev_type', limit: -1, ids: res.model.hySubdevTypeId }
          })
          if (code === 1 && data.length > 0) this.$set(this.hostDetail, 'hySubdevType', data[0].dictdataName)
          // 查询运维主机
          // const findHyitOpsServer = await request({
          //   url: api.automationOperations.findHyitOpsServer,
          //   data: { hostId: this.id }
          // })
          // if (findHyitOpsServer.code === 1 && findHyitOpsServer.data.length > 0) this.opsHostDetail = findHyitOpsServer.data[0]
        }
      })
    },
    // 获取设备类型
    loadItType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devType = res.data
        }
      })
    },
    // 获取区域列表
    loadOrgList() {
      request({ url: api.area.findHyitArea, data: { pid: 10 }})
        .then(res => {
          if (res.code === 1) {
            this.orgList = res.data
          }
        })
    },
    getUpTime(val) {
      this.deviceUpTime = val
    },
    // 调用ws运行ping
    async ping() {
      this.dialogTitle = `${this.hostDetail.hyIp}`
      this.showShellDialog = true
      this.$nextTick(() => {
        this.startPing()
      })
    },
    snmp() {
      this.$set(this.formProps[0], 'model', `${this.hostDetail.hyIp}`)
      this.showSnmpDialog = true
    },
    // 关闭shell窗口
    onBeforeShellDialog() {
      this.showShellDialog = false
      if (this.showShellInput) this.socketCMDOperationShellOrTelnetLogOut(this.executeType === 'ssh' ? socketCmd.automationOperations.sshLogOut : socketCmd.automationOperations.telnetLogOut)
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
          ip: this.hostDetail.hyIp,
          agent: this.hostDetail.agent,
          fromAgent: this.hostDetail.fromAgent,
          fromHostId: this.hostDetail.fromHostId
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .flex-container {
    display: flex;
    margin: 10px;
    background-color: #fff;
    // height: calc(100vh - 156px);
    .left-tool {
      width: calc(100% - 360px);
      border-right: solid 1px #e6e6e6;
      .detail-subtype {
        padding: 10px;
        .type {
          color: #303333;
          font-size: 18px;
          font-weight: bold;
          padding-bottom: 10px;
          .back-btn {
            cursor: pointer;
            margin-right: 5px;
          }
        }
        .ip {
          color: #909999;
        }
      }
      .el-tabs--border-card {
        border: initial;
        box-shadow: initial;
        .el-tabs__header {
          background-color: #e5ecf6;
          border-bottom: initial;
          .el-tabs__item.is-active {
            background-color: #cedbee;
          }
        }
      }
    }
    .right-tool {
      width: 360px;
    }
  }

.detail-info-card {
  padding: 10px;
  .detail-info-card-header {
    color: #0145ab;
    font-weight: 600;
    display: inline-block;
    padding: 4px 0 10px;
    border-bottom: 2px solid #0145ab;
  }
  .detail-info-card-content {
    padding: 10px 0;
    .detail-info-cell {
      display: flex;
      align-items: center;
      padding-bottom: 10px;
      .left-cell {
        display: inline-block;
        width: 100px;
        text-align: right;
        line-height: 28px;
        margin-right: 10px;
        font-size:14px;
        color:#666666
      }
      .right-cell {
        display: inline-block;
        width: 230px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 28px;
        font-size:14px;
        color:#666666;
        &.green {
          color: #0CB68B;
        }
        &.red {
          color: #FE4F50;
        }
      }
    }
  }
}
.margin-r {
  margin-right: 10px;
}
.detail-header {
  background-color: #F5F7FA;
  border-bottom: 1px solid #dfe4ed;
  margin: 0;
  .btn {
    display: inline-block;
    height: 40px;
    width: 50%;
    .btn-main {
      display: flex;
      align-items: center;
      justify-content: right;
      height: 100%;
      padding-right: 10px;
      .btn-item {
        padding: 5px 12px;
        background: #fff;
        border-radius: 5px;
        display: inline-block;
      }
    }
  }
  .detail-tab {
    display: inline-block;
    width: 50%;
    vertical-align: top;
  }
  ::v-deep .el-tabs--border-card{//修改整体背景色与边框为透明
		background-color: transparent;
		border-color: transparent;
		.el-tabs__header {//修改标签背景色为透明，并且没有下边横线
			border-bottom: 1px solid transparent;
		}
	}
}

</style>
