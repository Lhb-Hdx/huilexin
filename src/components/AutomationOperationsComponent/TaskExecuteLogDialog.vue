<template>
  <div>
    <el-dialog title="查看日志" :visible.sync="showLogDialog" width="50%" top="5vh">
      <div class="dialog-body">
        <div class="filter-container">
          <el-date-picker
            v-model="findHyitOpsExecuteLogDefaultQuery.sTime"
            class="filter-item"
            type="datetime"
            placeholder="开始时间"
          />
          <el-date-picker
            v-model="findHyitOpsExecuteLogDefaultQuery.eTime"
            class="filter-item"
            type="datetime"
            placeholder="结束时间"
          />
          <el-button type="primary" class="filter-item" @click="searchLog()">查询</el-button>
        </div>
        <div class="table-wrapper">
          <el-table
            ref="taskLogTable"
            :data="logList"
            fit
            highlight-current-row
            style="width: 100%;"
          >
            <el-table-column label="执行时间" prop="executeStartTime" show-overflow-tooltip />
            <el-table-column label="执行结果" show-overflow-tooltip>
              <template slot-scope="{row}">
                <span :class="row.executeStatue === 1 ? 'success' : 'danger'">{{ row.executeStatue === 1 ? '执行成功' : '执行失败' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="执行人" show-overflow-tooltip>
              <template slot-scope="{ row }">
                {{ row.userId === null ? '定时任务' : $tool.matchData(executeUsers, row, 'executeUserId', 'realName', 'userId') }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" show-overflow-tooltip>
              <template slot-scope="{row}">
                <el-button type="primary" @click="getLogDetail(row)">查看</el-button>
                <el-button type="primary" @click="getInspection(row)">巡检报告</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="logTotal > 0" :auto-scroll="false" class="mt-10" :total="logTotal" :page.sync="findHyitOpsExecuteLogDefaultQuery.page" :limit.sync="findHyitOpsExecuteLogDefaultQuery.limit" @pagination="findHyitOpsExecuteLogByGroup" />
        </div>
      </div>
    </el-dialog>
    <TaskExecuteDialog ref="taskExecuteDialog" :script-execute-result="scriptExecuteResult" />
    <InspectionReportDialog ref="inspectionReportDialog" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import TaskExecuteDialog from '@/components/AutomationOperationsComponent/TaskExecuteDialog'
import InspectionReportDialog from '@/components/AutomationOperationsComponent/InspectionReportDialog'

export default {
  name: 'TaskExecuteLogDialog',
  components: {
    Pagination,
    TaskExecuteDialog,
    InspectionReportDialog
  },
  data() {
    return {
      showLogDialog: false,
      findHyitOpsExecuteLogDefaultQuery: {
        // logType: 0,
        page: 1,
        limit: 10,
        sTime: '',
        eTime: ''
      },
      logList: [],
      logTotal: 0,
      scriptExecuteResult: [],
      assignQuery: {},
      executeUsers: [],
      scriptExecuteResultData: [],
      taskItem: {}
    }
  },
  mounted() {
    const getNowDate = this.$tool.getNowDate('object')
    this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'sTime', new Date(getNowDate.Y, getNowDate.M - 1, getNowDate.D, 0, 0, 0))
    this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'eTime', new Date(getNowDate.Y, getNowDate.M - 1, getNowDate.D, 23, 59, 59))
  },
  methods: {
    // 打开弹窗
    open(assignQuery, scriptExecuteResultData) {
      this.showLogDialog = true
      this.taskItem = assignQuery
      this.assignQuery = {
        taskId: assignQuery.taskId
      }
      this.scriptExecuteResultData = scriptExecuteResultData
      this.findHyitOpsExecuteLogByGroup()
    },
    // 搜索日志
    searchLog() {
      this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'page', 1)
      this.findHyitOpsExecuteLogByGroup()
    },
    // 查看日志
    async getLogDetail(row) {
      this.$request({
        url: this.api.automationOperations.findHyitOpsExecuteLog,
        data: { id: row.taskId, executeStartTime: row.executeStartTime, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.scriptExecuteResult = []
          const scriptExecuteResult = []
          res.data.forEach(item => {
            const getStepIndex = scriptExecuteResult.findIndex(el => +el.stepId === +item.stepId)
            let getServerIndex = getStepIndex !== -1 ? scriptExecuteResult[getStepIndex].server.findIndex(el => +el.serverId === +item.serverId) : -1
            const scriptTmp = {
              scriptId: item.scriptId,
              scriptName: item.scriptName,
              buildResult: item.executeLog,
              analysisScript: item.expression,
              executeResult: item.analyseResult,
              emptyExpression: false,
              authAnalysis: [
                {
                  name: item.expressionName,
                  compareCharacter: item.compareCharacter,
                  compareValue: item.compareValue,
                  analyseResult: item.analyseResult,
                  analyseStatue: item.analyseStatue,
                  analyseResultReturnOk: true
                }
              ]
            }
            const serverTmp = {
              serverId: item.serverId,
              serverName: item.serverName,
              executeStatue: item.executeStatue,
              script: [scriptTmp]
            }

            if (getStepIndex === -1) {
              const stepTmp = {
                stepId: item.stepId,
                stepName: item.stepName,
                stepNum: item.scriptStep || 0,
                stepStatue: '',
                server: [serverTmp]
              }
              scriptExecuteResult.push(stepTmp)
            } else {
              if (getServerIndex !== -1) {
                scriptExecuteResult[getStepIndex].server[getServerIndex].script.push(scriptTmp)
              } else {
                scriptExecuteResult[getStepIndex].server.push(serverTmp)
              }
            }
          })

          scriptExecuteResult.forEach((item, getStep) => {
            const success = item.server.filter(el => el.executeStatue === 1)
            const failed = item.server.filter(el => el.executeStatue === 0)
            if (success.length === item.server.length) {
              item.statue = 1
            }
            if (failed.length > 0) {
              item.statue = 0
            }
          })

          scriptExecuteResult.sort(this.$tool.compareJsonDataByProperty('stepNum'))

          // 打开弹窗
          this.$refs.taskExecuteDialog.open()
          this.scriptExecuteResult = this.$tool.deepCopy(scriptExecuteResult)
        }
      })
    },
    // 查询日志
    findHyitOpsExecuteLogByGroup() {
      if (this.findHyitOpsExecuteLogDefaultQuery.sTime !== '') {
        const sTime = this.$tool.getNowDate('object', new Date(this.findHyitOpsExecuteLogDefaultQuery.sTime))
        this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'sTime', `${sTime.Y}-${sTime.M}-${sTime.D} ${sTime.h}:${sTime.m}:${sTime.s}`)
      }
      if (this.findHyitOpsExecuteLogDefaultQuery.eTime !== '') {
        const eTime = this.$tool.getNowDate('object', new Date(this.findHyitOpsExecuteLogDefaultQuery.eTime))
        this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'eTime', `${eTime.Y}-${eTime.M}-${eTime.D} ${eTime.h}:${eTime.m}:${eTime.s}`)
      }
      this.$request({
        url: this.api.automationOperations.findHyitOpsExecuteLogByGroup,
        data: { ...this.findHyitOpsExecuteLogDefaultQuery, ...this.assignQuery }
      }).then(async res => {
        if (res.code === 1) {
          const executeUsers = []
          this.logList = res.data
          this.logTotal = Number(res.count)

          res.data.forEach(item => {
            item.executeUserId = item.userId
            if (item.userId !== null) executeUsers.push(item.userId)
          })

          if (executeUsers.length > 0) {
            this.executeUsers = await this.commonRequestFn.findSysUser({
              ids: this.$tool.uniqueArray(executeUsers).toString(),
              limit: -1,
              companyId: this.$auth.getUserSession().companyId
            })
          }
        }
      })
    },
    // 查询分析
    async findHyitOpsResultExpression(query) {
      const { code, data } = await this.$request({
        url: this.api.automationOperations.findHyitOpsResultExpression,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 查看服务器
    async getHyitOpsServer(query) {
      const { code, model } = await this.$request({
        url: this.api.automationOperations.getHyitOpsServer,
        data: query
      })
      if (code !== 1) return
      return model
    },
    // 查看it监控设备
    async getHyitHost(query) {
      const { code, model } = await this.$request({
        url: this.api.itMonitor.getHyitHost,
        data: query
      })
      if (code !== 1) return
      return model
    },
    // 打开巡检报告
    getInspection(row) {
      this.$refs.inspectionReportDialog.open({
        ...row, taskItem: this.taskItem
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
