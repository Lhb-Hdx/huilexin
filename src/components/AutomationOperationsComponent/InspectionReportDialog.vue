<template>
  <el-dialog v-set-dialog-main-height="'80%'" title="巡检报告" :visible.sync="showDialog" class="dialog-body-scroll dialog-not-footer" width="50%" top="5vh">
    <div v-if="opsExecuteLogReport.length > 0" class="dialog-body">
      <div class="result-backup-form">
        <el-input v-model="executeLogSendForm.backup" type="textarea" rows="2" placeholder="请输入巡检结果说明" />
        <div class="buttons">
          <el-button type="primary" size="mini" @click="handlerSelectWxUser">选择推送人</el-button>
          <el-button type="primary" size="mini" @click="handlerSave">保存结果并推送</el-button>
          <el-button type="primary" size="mini" @click="handlerExport">导出巡检报告</el-button>
        </div>
        <div class="user-tag">
          <el-tag
            v-for="item in allSelection"
            :key="item.id"
            closable
            :disable-transitions="false"
            class="user-tag-item"
            @close="handleCloseUserTag(item)"
          >
            {{ item.realname }}
          </el-tag>
        </div>
      </div>
      <div id="inspection-list" class="inspection-list">
        <div v-for="item in opsExecuteLogReport" :key="item.stepId" class="inspection-list-item">
          <div class="step-header">
            <div class="step-name overflow-text-a">步骤{{ item.scriptStep + 1 }}：{{ item.stepName }}</div>
            <div class="step-host-statue">
              <div class="success statue-item">正常：{{ setCount(1, item.logList) }}</div>
              <div class="danger statue-item">异常：{{ setCount(0, item.logList) }}</div>
            </div>
          </div>
          <div class="step-log-list">
            <el-table :data="item.logList" border size="mini">
              <el-table-column label="设备名称" show-overflow-tooltip prop="hostName" />
              <el-table-column label="表达式名称" show-overflow-tooltip prop="expressionName" />
              <el-table-column label="分析值" show-overflow-tooltip>
                <template slot-scope="{row}">
                  {{ row.expressionCompareCharacter }}{{ row.expressionCompareValue }}
                </template>
              </el-table-column>
              <el-table-column label="实际值" show-overflow-tooltip prop="analyseResult" />
              <el-table-column label="分析结果" show-overflow-tooltip>
                <template slot-scope="{row}">
                  <span :class="row.analyseStatue === 1 ? 'success' : 'danger'">{{ row.analyseStatue === 1 ? '正常' : '异常' }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无数据" />
  </el-dialog>
</template>

<script>
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
  name: 'InspectionReportDialog',
  data() {
    return {
      showDialog: false,
      opsExecuteLogReport: [],
      executeLogSendForm: {
        backup: ''
      },
      allSelection: [],
      handlerLogItem: {},
      hostTotal: 0,
      successHostCount: 0,
      errorHostCount: 0,
      taskItem: {}
    }
  },
  computed: {
    setCount() {
      return function (value, data) {
        let res = 0
        data.forEach(item => {
          if (Number(item.analyseStatue) === Number(value)) ++res
        })
        return res
      }
    }
  },
  mounted() {
    this.$EventBus.$on('submitInspectionReportWxMessagePushUser', (val) => {
      this.allSelection = val
    })
  },
  methods: {
    // 打开
    open(row) {
      this.allSelection = []
      this.executeLogSendForm = {
        backup: ''
      }
      this.taskItem = row.taskItem
      this.hostTotal = 0
      this.successHostCount = 0
      this.errorHostCount = 0
      this.handlerLogItem = row
      this.showDialog = true
      this.$nextTick(async () => {
        const getLogReport = await this.$request({ url: this.api.automationOperations.getHyitOpsExecuteLogReport, data: { taskId: row.taskId, executeStartTime: row.executeStartTime, limit: -1 }})
        if (getLogReport.code !== 1 || !getLogReport.map) return
        const stepIds = []
        if (getLogReport.map.listLog && getLogReport.map.listLog.length > 0) {
          getLogReport.map.listLog.forEach(item => {
            if (item.stepId) stepIds.push(item.stepId)
          })
        }
        if (stepIds.length > 0) {
          const getStep = await this.$request({ url: this.api.automationOperations.findHyitOpsTaskLink, data: { ids: stepIds } })
          const opsExecuteLogReport = []
          if (getStep.code === 1) {
            getStep.data.forEach(stepItem => {
              opsExecuteLogReport.push({
                stepId: stepItem.id,
                stepName: stepItem.name,
                scriptStep: stepItem.scriptStep,
                successCount: 0,
                errorCount: 0,
                logList: []
              })
            })
          }
          this.opsExecuteLogReport = opsExecuteLogReport
        }
        if (this.opsExecuteLogReport.length > 0) {
          const hostIds = []
          let host = []
          getLogReport.map.serverList.forEach(serverItem => {
            hostIds.push(serverItem.hostId)
          })
          if (hostIds.length > 0) {
            host = await this.$request({ url: this.api.itMonitor.findHyitHost, data: { ids: this.$tool.uniqueArray(hostIds).toString(), hostType: 1, limit: -1 } })
          }
          getLogReport.map.listLog.forEach(logItem => {
            const getExpressionIndex = getLogReport.map.expressionList.findIndex(eItem => Number(eItem.scriptId) === Number(logItem.scriptId))
            if (getExpressionIndex !== -1) {
              logItem.expressionName = getLogReport.map.expressionList[getExpressionIndex].name
              logItem.expressionCompareCharacter = getLogReport.map.expressionList[getExpressionIndex].compareCharacter
              logItem.expressionCompareValue = getLogReport.map.expressionList[getExpressionIndex].compareValue
            }
            if (host.code === 1 && host.data) {
              const getServerIndex = getLogReport.map.serverList.findIndex(sItem => Number(sItem.id) === Number(logItem.serverId))
              if (getServerIndex === -1) return
              const getHostIndex = host.data.findIndex(hItem => Number(hItem.hyHostId) === Number(getLogReport.map.serverList[getServerIndex].hostId))
              if (getHostIndex === -1) return
              logItem.hostName = host.data[getHostIndex].hyMarkName
            }
          })
          this.opsExecuteLogReport.forEach((item, index) => {
            getLogReport.map.listLog.forEach(logItem => {
              if (Number(logItem.stepId) === Number(item.stepId)) {
                this.hostTotal += 1
                if (logItem.analyseStatue === 1) {
                  this.successHostCount += 1
                } else {
                  this.errorHostCount += 1
                }
                this.$set(this.opsExecuteLogReport[index].logList, this.opsExecuteLogReport[index].logList.length, logItem)
              }
            })
          })
        }
        this.opsExecuteLogReport.sort(this.$tool.compareJsonDataByProperty('scriptStep'))
        const getOpsExecuteLogSend = await this.findHyitOpsExecuteLogSend({ taskId: row.taskId, executeTime: row.executeStartTime })
        if (getOpsExecuteLogSend && getOpsExecuteLogSend.length > 0) this.executeLogSendForm = getOpsExecuteLogSend[0]
      })
    },
    handlerSelectWxUser() {
      this.$EventBus.$emit('openInspectionReportWxMessagePushUserDialog', { allSelection: this.allSelection})
    },
    handleCloseUserTag(item) {
      const idx = this.allSelection.findIndex(el => +el.id === +item.id)
      if (idx !== -1) this.allSelection.splice(idx, 1)
    },
    async handlerSave() {
      if (this.allSelection.length === 0) {
        this.$message('请选择推送用户')
        return
      }
      const getOpsExecuteLogSend = await this.findHyitOpsExecuteLogSend({ taskId: this.handlerLogItem.taskId, executeTime: this.handlerLogItem.executeStartTime })
      if (getOpsExecuteLogSend && getOpsExecuteLogSend.length > 0) {
        this.$set(this.executeLogSendForm, 'id', getOpsExecuteLogSend[0].id)
        this.updateHyitOpsExecuteLogSend()
      } else {
        if (this.executeLogSendForm.backup !== '') this.insertHyitOpsExecuteLogSend()
      }
      const sendWXMsgQuery = {
        detail: `执行${this.hostTotal}台设备，正常${this.successHostCount}台，异常${this.errorHostCount}台`,
        remark: this.executeLogSendForm.backup,
        title: this.taskItem.taskName,
        time: this.handlerLogItem.executeTime
      }
      const userIds = []
      this.allSelection.forEach(item => {
        userIds.push(item.userId)
      })
      sendWXMsgQuery.userIds = userIds.toString()
      const sendWXMsg = await this.sendWXMsg({
        json: JSON.stringify(sendWXMsgQuery)
      })
      if (sendWXMsg.code === 1) {
        this.$message.success('推送成功')
      } else {
        this.$message.error('推送失败')
      }
    },
    async findHyitOpsExecuteLogSend(query) {
      const { code, data } = await this.$request({
        url: this.api.automationOperations.findHyitOpsExecuteLogSend,
        data: query
      })
      if (code !== 1) return
      return data
    },
    updateHyitOpsExecuteLogSend() {
      this.$request({
        url: this.api.automationOperations.updateHyitOpsExecuteLogSend,
        data: this.executeLogSendForm
      }).then(res => {
        if (res.code === 1) {
          // this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    insertHyitOpsExecuteLogSend() {
      this.$request({
        url: this.api.automationOperations.insertHyitOpsExecuteLogSend,
        data: { ...this.executeLogSendForm, taskId: this.handlerLogItem.taskId, executeTime: this.handlerLogItem.executeStartTime }
      }).then(res => {
        if (res.code === 1) {
          // this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async sendWXMsg(query) {
      return await this.$request({
        url: this.api.wx.sendWXMsg,
        data: query
      })
    },
    handlerExport() {
      let title = `${this.taskItem.taskName}作业巡检报告`
      html2Canvas(document.querySelector('#inspection-list'), {
        allowTaint: true,
        taintTest: false,
        useCORS: true,
        dpi: window.devicePixelRatio * 4, // 将分辨率提高到特定的DPI 提高四倍
        scale: 4 // 按比例增加分辨率
      }).then(function (canvas) {
        let contentWidth = canvas.width
        let contentHeight = canvas.height
        let pageHeight = contentWidth / 592.28 * 841.89
        let leftHeight = contentHeight
        let position = 0
        let imgWidth = 595.28
        let imgHeight = 592.28 / contentWidth * contentHeight
        let pageData = canvas.toDataURL('image/jpeg', 1.0)
        let PDF = new JsPDF('', 'pt', 'a4')
        if (leftHeight < pageHeight) {
          PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
        } else {
          while (leftHeight > 0) {
            PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
            leftHeight -= pageHeight
            position -= 841.89
            if (leftHeight > 0) {
              PDF.addPage()
            }
          }
        }
        PDF.save(title + '.pdf')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.inspection-list {
  padding-bottom: 10px;
  .inspection-list-item {
    .step-header {
      vertical-align: bottom;
      .step-name {
        color: #000000;
        font-size: 18px;
        font-weight: bold;
        padding: 10px 5px;
        width: 50%;
        display: inline-block;
        vertical-align: bottom;
      }
      .step-host-statue {
        width: 50%;
        display: inline-block;
        text-align: right;
        padding: 10px 5px;
        .statue-item {
          display: inline-block;
          margin-left: 10px;
        }
      }
    }
  }
}
.result-backup {
  margin-bottom: 10px;
  .label {
    display: inline-block;
    font-weight: bold;
  }
}
.result-backup-form {
  margin-bottom: 10px;
  .buttons {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .user-tag-item {
    margin: 5px;
  }
}
</style>
