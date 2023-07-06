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
            <el-table-column label="执行时间" prop="executeTime" show-overflow-tooltip />
            <el-table-column label="执行状态" width="100" show-overflow-tooltip>
              <template slot-scope="{row}">
                <i v-if="row.executeStatue === 1" class="el-icon-success success" />
                <i v-else-if="row.executeStatue === 0" class="el-icon-error danger" />
              </template>
            </el-table-column>
            <el-table-column label="分析结果" width="100" show-overflow-tooltip>
              <template slot-scope="{row}">
                <i v-if="row.analyseStatue === 1" class="el-icon-success success" />
                <i v-else-if="row.analyseStatue === 0" class="el-icon-error danger" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" show-overflow-tooltip>
              <template slot-scope="{row}">
                <el-button type="primary" @click="getLogDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="logTotal > 0" :auto-scroll="false" class="mt-10" :total="logTotal" :page.sync="findHyitOpsExecuteLogDefaultQuery.page" :limit.sync="findHyitOpsExecuteLogDefaultQuery.limit" @pagination="findHyitOpsExecuteLog" />
        </div>
      </div>
    </el-dialog>
    <ScriptExecuteDialog ref="scriptExecuteDialog" :script-execute-result="scriptExecuteResult" :build-result="false" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ScriptExecuteDialog from '@/components/AutomationOperationsComponent/ScriptExecuteDialog'

export default {
  name: 'ScriptExecuteLogDialog',
  components: {
    Pagination,
    ScriptExecuteDialog
  },
  data() {
    return {
      showLogDialog: false,
      findHyitOpsExecuteLogDefaultQuery: {
        logType: 0,
        page: 1,
        limit: 10,
        sTime: '',
        eTime: ''
      },
      logList: [],
      logTotal: 0,
      scriptExecuteResult: [],
      assignQuery: {}
    }
  },
  mounted() {
    const getNowDate = this.$tool.getNowDate('object')
    this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'sTime', new Date(getNowDate.Y, getNowDate.M - 1, getNowDate.D, 0, 0, 0))
    this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'eTime', new Date(getNowDate.Y, getNowDate.M - 1, getNowDate.D, 23, 59, 59))
  },
  methods: {
    // 打开弹窗
    open(assignQuery) {
      this.showLogDialog = true
      this.assignQuery = assignQuery
      this.findHyitOpsExecuteLog()
    },
    // 搜索日志
    searchLog() {
      this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'page', 1)
      this.findHyitOpsExecuteLog()
    },
    // 查看日志
    async getLogDetail(row) {
      // 打开弹窗
      this.$refs.scriptExecuteDialog.open()
      this.scriptExecuteResult = [{
        serverId: row.serverId, // 服务器id
        serverName: row.serverName, // 服务器名称
        executeStatue: row.executeStatue, // 执行状态
        executeResult: row.executeLog, // 执行结果
        buildResult: row.executeLog, // 输出结果
        analysisResult: row.analyseResult, // 实际结果
        analysisScript: row.expression, // 分析脚本
        authAnalysis: [ // 自动分析数据
          {
            name: row.expressionName, // 表达式名称
            compareCharacter: row.compareCharacter, // 判断符号
            compareValue: row.compareValue, // 判断值
            analyseResult: row.analyseResult, // 实际结果
            analyseStatue: row.analyseStatue, // 分析状态
            analyseResultReturnOk: true
          }
        ]
      }]
    },
    // 查询日志
    findHyitOpsExecuteLog() {
      if (this.findHyitOpsExecuteLogDefaultQuery.sTime !== '') {
        const sTime = this.$tool.getNowDate('object', new Date(this.findHyitOpsExecuteLogDefaultQuery.sTime))
        this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'sTime', `${sTime.Y}-${sTime.M}-${sTime.D} ${sTime.h}:${sTime.m}:${sTime.s}`)
      }
      if (this.findHyitOpsExecuteLogDefaultQuery.eTime !== '') {
        const eTime = this.$tool.getNowDate('object', new Date(this.findHyitOpsExecuteLogDefaultQuery.eTime))
        this.$set(this.findHyitOpsExecuteLogDefaultQuery, 'eTime', `${eTime.Y}-${eTime.M}-${eTime.D} ${eTime.h}:${eTime.m}:${eTime.s}`)
      }
      this.$request({
        url: this.api.automationOperations.findHyitOpsExecuteLog,
        data: { ...this.findHyitOpsExecuteLogDefaultQuery, ...this.assignQuery }
      }).then(res => {
        if (res.code === 1) {
          this.logList = res.data
          this.logTotal = Number(res.count)
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
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
