<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div class="item-content-header">
        <div class="title">系统维护</div>
        <div class="line"><div class="blo" /></div>
      </div>
      <div class="item-content-main">
        <div class="sys-left">
          <div class="sys-name overflow-text-a">
            <!-- {{ sysInfo.sysName }} -->
            中心服务
          </div>
          <div class="sys-version overflow-text-a">
            <!-- 版本号：{{ sysInfo.sysVersion }} -->
            版本号：{{ versionNumber }}
          </div>
        </div>
        <div class="sys-right">
          <el-button type="primary" size="mini" :loading="btnLoading('center_agent_start_ser')" @click="clickRestartService({ key: 'center_agent_start_ser' })">重启服务</el-button>
          <el-button type="primary" size="mini" :loading="btnLoading('center_agent_start_sys')" @click="clickRestartSys({ key: 'center_agent_start_sys' })">重启系统</el-button>
          <el-button type="primary" size="mini" @click="openImportFileDialog(1)">更新服务</el-button>
          <el-button type="primary" size="mini" @click="openImportFileDialog(2)">更新前端</el-button>
          <el-button type="primary" size="mini" @click="openImportFileDialog(4)">更新数据库</el-button>
          <el-button type="primary" size="mini" :loading="btnLoading('center_agent_download_log')" @click="clickDownloadLog({ key: 'center_agent_download_log' })">下载日志</el-button>
          <el-button type="primary" size="mini" :loading="btnLoading('center_agent_roll_back')" @click="clickRollBack({ key: 'center_agent_roll_back' })">回滚操作</el-button>
        </div>
      </div>
    </el-card>
    <el-card v-loading="loading" class="mt-10">
      <div class="val">
        <ListControl :check-list="checkList" @setLists="setLists" />
      </div>
      <div class="item-content-header">
        <div class="title">网关列表</div>
        <div class="line"><div class="blo" /></div>
      </div>

      <div class="item-content-main">
        <div class="table-wrapper">
          <el-table
            :data="agentList"
            fit
            highlight-current-row
            style="width: 100%;"
          >
            <el-table-column label="序号" prop="hyId" type="index" align="left" width="80" show-overflow-tooltip />
            <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="网关" prop="name" width="250" show-overflow-tooltip />
            <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="所属项目" prop="groupName" show-overflow-tooltip />
            <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="IP" prop="ip" show-overflow-tooltip />
            <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="状态" width="250" class-name="small-padding fixed-width">
              <template slot-scope="{row}">
                <div :class="row.statue === 1 ? 'success' : 'danger'">{{ row.statue === 1 ? '在线' : '离线' }}</div>
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="操作" align="left" width="500" class-name="small-padding fixed-width">
              <template slot-scope="{row}">
                <el-button :disabled="row.statue !== 1" type="primary" size="mini" @click="openImportFileDialog(5, row.id)">更新前端</el-button>
                <el-button :loading="btnLoading(row.id + 'center_agent_start_ser')" :disabled="row.statue !== 1" type="primary" size="mini" @click="clickRestartService({ ...row, key: row.id + 'center_agent_start_ser' })">重启网关</el-button>
                <el-button :loading="btnLoading(row.id + 'center_agent_start_sys')" :disabled="row.statue !== 1" type="primary" size="mini" @click="clickRestartSys({ ...row, key: row.id + 'center_agent_start_sys' })">重启系统</el-button>
                <el-button :disabled="row.statue !== 1" type="primary" size="mini" @click="openImportFileDialog(3, row.id)">更新网关</el-button>
                <el-button :loading="btnLoading(row.id + 'center_agent_download_log')" :disabled="row.statue !== 1" type="primary" size="mini" @click="clickDownloadLog({ ...row, key: row.id + 'center_agent_download_log' })">下载日志</el-button>
                <el-button :loading="btnLoading(row.id + 'center_agent_roll_back')" :disabled="row.statue !== 1" type="primary" size="mini" @click="clickRollBack({ ...row, key: row.id + 'center_agent_roll_back' })">回滚操作</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
    <el-dialog title="导入" :visible.sync="showImportFileDialog" width="50%" top="5vh">
      <el-form label-width="90px">
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            action
            accept=".xls,.xlsx,.doc,.docx,.ppt,.pptx,.pdf,.gz,.tar"
            :http-request="upload"
            :on-change="changeUpload"
            :on-remove="removeUpload"
            :file-list="fileList"
            :limit="1"
          >
            <el-button size="small" type="primary">导入</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showImportFileDialog = false">取 消</el-button>
        <el-button :loading="exportLoading" class="filter-item" type="primary" @click="confirmImportFile">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="title" :visible.sync="showDialog" width="50%" top="5vh">
      <div class="dialog-body">
        <el-progress :percentage="percentage" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getUserSession} from '@/utils/auth'
import {sendWebsocket} from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import axios from 'axios'
import saveAs from 'file-saver'
import ListControl from '@/components/ListControl'

export default {
  name: 'SystemMaintain',
  components: {
    ListControl
  },
  data() {
    return {
      versionNumber: '',
      loading: false,
      exportLoading: false,
      sysInfo: {
        sysName: '',
        sysVersion: ''
      },
      agentList: [],
      loadingKeys: [],
      showImportFileDialog: false,
      fileList: [],
      fileTypeData: null,
      agent: '',
      showDialog: false,
      percentage: 0,
      file: [],
      timeCall: null,
      title: '',
      // 显示控制数据 start
      checkList: ['网关', '所属项目', 'IP', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    btnLoading() {
      const that = this
      return function(key) {
        const idx = that.loadingKeys.findIndex(el => el === key)
        return idx !== -1
      }
    }
  },
  mounted() {
    // this.getSysInfo()
    this.getAgentList()
    this.timeCall = setInterval(() => {
      this.getAgentList()
    }, 10000)
    this.getVersion()
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'common-downloadLog-websocket' && !res.detail.data.jsonData) {
        this.file.push(res.detail.data.logData)
        this.percentage = Number((((+res.detail.data.currentIndex) / (res.detail.data.totalPacket - 1)) * 100).toFixed(0))
        if (+res.detail.data.currentIndex === res.detail.data.totalPacket - 1) {
          this.showDialog = false
          this.percentage = 0
          console.log(this.percentage)

          let file = new File([this.file], '日志.txt', {type: 'text/plain;charset=utf-8'})
          saveAs(file)
        }
      } else if (res.detail.data.cmd === 'common-downloadLog-websocket' && res.detail.data.jsonData) {
        const jsonData = JSON.parse(res.detail.data.jsonData)
        this.file.push(jsonData.logData)
        this.percentage = Number((((+jsonData.currentIndex) / (jsonData.totalPacket - 1)) * 100).toFixed(0))
        if (+jsonData.currentIndex === jsonData.totalPacket - 1) {
          this.showDialog = false
          this.percentage = 0
          console.log(this.percentage)

          let file = new File([this.file], '日志.txt', {type: 'text/plain;charset=utf-8'})
          saveAs(file)
        }
      }
    })
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'common-downloadFile-websocket') {
        const jsonData = JSON.parse(res.detail.data.jsonData)
        this.percentage = Number(((((+jsonData.curentPacketIndex + 1) / (jsonData.totalPacket))) * 100).toFixed(0))
        if (+jsonData.curentPacketIndex === jsonData.totalPacket - 1) {
          this.showDialog = false
          this.percentage = 0
          console.log(this.percentage)
        }
      }
    })
  },
  beforeDestroy() {
    clearInterval(this.timeCall)
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 上传文件
    upload(param) {
      this.fdata.append('uploadfile', param.file)
    },
    // 检测upload上传变换
    changeUpload(file, fileList) {
      this.fileListLength = file
    },
    // 删除文件
    removeUpload() {
      this.fileListLength = ''
    },
    // 打开弹窗
    openImportFileDialog(val, data) {
      this.fdata = new FormData()
      this.showImportFileDialog = true
      this.fileTypeData = val
      data ? this.agent = data : this.agent = ''
      console.log(this.fileTypeData)
    },
    // 上传文件
    confirmImportFile() {
      this.exportLoading = true
      const _this = this
      if (this.fileListLength) {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        this.$request({
          url: this.api.itMonitor.importUpdateFile,
          data: { file: _this.fileListLength.raw, fileType: this.fileTypeData, agent: this.agent, token: wsToken }
        }).then(res => {
          this.exportLoading = false
          if (res.code === 1) {
            _this.$message.success('上传成功')
            this.$refs.uploadRef.clearFiles()
            this.showImportFileDialog = false
            if (this.fileTypeData === 3 || this.fileTypeData === 5) {
              this.showDialog = true
            }
            this.title = '更新进度'
            this.getAgentList()
          } else {
            _this.$message.error('上传失败，请重试')
          }
        })
      } else {
        _this.$message.error('请先选择文件')
      }
    },
    // 获取版本号
    async getVersion() {
      axios({
        url: 'getVersion',
        method: 'post'
      }).then(res => {
        if (res.data.code !== 1) return
        this.versionNumber = JSON.parse(res.data.model).version
      })
    },
    // 获取系统信息
    async getSysInfo() {
      // 版本号
      const sysVersion = await this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'system_version', limit: -1 }
      })
      if (sysVersion.code === 1 && sysVersion.data && sysVersion.data.length > 0) {
        this.$set(this.sysInfo, 'sysVersion', sysVersion.data[0].dictdataName)
      }
      // 版本名称
      const sysName = await this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'system_name', limit: -1 }
      })
      if (sysName.code === 1 && sysName.data && sysName.data.length > 0) {
        this.$set(this.sysInfo, 'sysName', sysName.data[0].dictdataName)
      }
    },
    // 获取网关
    async getAgentList() {
      // 获取项目
      const agentGroup = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroup,
        data: { page: 1, limit: -1 }
      })
      if (agentGroup.code !== 1 && !agentGroup.data && agentGroup.data.length === 0) return
      // 获取项目关联
      const agentGroupLink = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroupLink,
        data: { page: 1, limit: -1 }
      })
      if (agentGroupLink.code !== 1 && !agentGroupLink.data && agentGroupLink.data.length === 0) return
      // 网关
      const agentIds = []
      if (agentGroupLink.code === 1 && agentGroupLink.data && agentGroupLink.data.length > 0) {
        agentGroupLink.data.forEach(item => {
          if (agentIds.indexOf(item.agentId) === -1) agentIds.push(item.agentId)
        })
      }
      if (agentIds.length === 0) return
      const agent = await this.$request({
        url: this.api.itMonitor.findHyitAgent,
        data: { ids: agentIds.toString(), limit: -1 }
      })
      if (agent.code !== 1 && !agent.data && agent.data.length === 0) return
      agent.data.forEach(item => {
        const agentGroupLinkIndex = agentGroupLink.data.findIndex(el => +el.agentId === +item.id)
        const agentGroupIndex = agentGroup.data.findIndex(el => +el.id === +agentGroupLink.data[agentGroupLinkIndex].groupId)
        if (agentGroupIndex !== -1) {
          item.groupName = agentGroup.data[agentGroupIndex].name
        }
      })
      this.agentList = agent.data
    },
    // 运行 websocket
    runCMD(options) {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: options.cmd,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: options.agent
        }
      })
    },
    // 点击下载日志
    clickDownloadLog(options) {
      this.file = []
      this.showDialog = true
      this.title = '导出'
      this.percentage = 0
      const query = {
        cmd: socketCmd.sysMaintain.downloadLog,
        agent: options.id ? options.id : ''
      }
      // if (options.id) query.agent = options.id
      this.runCMD(query)
      this.setBtnLoading(options.key)
    },
    // 点击回滚
    clickRollBack(options) {
      this.$confirm('确认回滚吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.rollBack(options)
      })
    },
    // 点击回滚
    rollBack(options) {
      const query = {
        cmd: socketCmd.sysMaintain.rollback,
        agent: options.id ? options.id : ''
      }
      this.runCMD(query)
      this.setBtnLoading(options.key)
    },
    // 点击重启服务
    clickRestartService(options) {
      this.$confirm('确认重启服务吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.restartService(options)
      })
    },
    // 重启服务
    restartService(options) {
      const query = {
        cmd: socketCmd.sysMaintain.restartServer
      }
      if (options.id) query.agent = options.id
      this.runCMD(query)
      this.setBtnLoading(options.key)
    },
    // 点击重启系统
    clickRestartSys(options) {
      this.$confirm('确认重启系统吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.restartSys(options)
      })
    },
    // 重启系统
    restartSys(options) {
      const query = {
        cmd: socketCmd.sysMaintain.restartSystem
      }
      if (options.id) query.agent = options.id
      this.runCMD(query)
      this.setBtnLoading(options.key)
    },
    // 设置按钮loading
    setBtnLoading(key) {
      this.$set(this.loadingKeys, this.loadingKeys.length, key)
      setTimeout((key) => {
        const idx = this.loadingKeys.findIndex(el => el.key === key)
        this.loadingKeys.splice(idx, 1)
      }, 5000)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-card{
  width: 100%;
}
.item-content-header{
  .title{
    margin-top: 10px;
    font-size: 16px;
    color: #333;
  }
  .line{
    margin: 10px 0 0;
    .blo{
      width: 30px;
      height: 3px;
      background: #0145AB;
      border-radius: 1px 1px 1px 1px;
    }
  }
}
.item-content-main{
  margin: 20px 0 0 0 ;
  // width: 30%;
}
.authorization-text{
  color: #656565;
}
.sys-left, .sys-right {
  width: 50%;
  display: inline-block;
  padding: 10px 0;
}
.sys-left {
  font-size: 24px;
  .sys-name {
    display: inline-block;
    padding-right: 30px;
  }
  .sys-version {
    display: inline-block;
  }
}
.val {
  position: absolute;
  right: 35px;
}
.el-card ::v-deep .el-card__body {
      padding: 10px;
    }
</style>
