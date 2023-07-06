<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" type="primary" class="filter-item" @click="addTask()">新增</el-button>
      <el-input v-model="workScriptListQuery.keyword" v-permission="['Search']" class="filter-item" style="width:200px" placeholder="搜索关键词" />
      <el-button v-permission="['Search']" type="primary" class="filter-item" @click="search()">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table :data="workScriptList">
        <el-table-column
          prop="id"
          label="NO"
          type="index"
        />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="作业名称" show-overflow-tooltip prop="taskName" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="周期" show-overflow-tooltip>
          <template v-if="scope.row.executeTimeId === 2" slot-scope="scope">
            {{ setCycle(scope.row.executeTimeType, -1) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="执行时期" show-overflow-tooltip>
          <template v-if="scope.row.executeTimeId === 2" slot-scope="scope">
            {{ setCycle(scope.row.executeTimeType, scope.row.executeDay) }}{{ scope.row.executeHour }}:{{ scope.row.executeMinute }}:{{ scope.row.executeSecond }} 执行
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="执行人" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ $tool.matchData(executeUsers, row, 'executeUserId', 'realName', 'userId') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="right" label="上次执行时间" show-overflow-tooltip prop="executeTime" />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="操作" width="300px">
          <template slot-scope="scope">
            <el-button v-permission="['Execute']" type="primary" size="mini" @click="onEnclosure(scope.row)">执行</el-button>
            <el-button v-permission="['Edit']" type="primary" size="mini" @click="onEdit(scope.row)">编辑</el-button>
            <el-button v-permission="['Log']" type="primary" size="mini" @click="onLog(scope.row)">日志</el-button>
            <el-button v-permission="['Delete']" type="danger" size="mini" @click="onDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="workScriptTotal > 0" :auto-scroll="false" :total="workScriptTotal" :page.sync="workScriptListQuery.page" :limit.sync="workScriptListQuery.limit" @pagination="loadWorkScriptList" />
    <TaskExecuteDialog ref="taskExecuteDialog" :script-execute-result="scriptExecuteResult" :task="handlerTask" />
    <TaskExecuteLogDialog ref="taskExecuteLogDialog" />
    <InspectionReportWxMessagePushUserDialog ref="inspectionReportWxMessagePushUserDialog" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import TaskExecuteDialog from '../../../components/AutomationOperationsComponent/TaskExecuteDialog'
import TaskExecuteLogDialog from '../../../components/AutomationOperationsComponent/TaskExecuteLogDialog'
import {getUserSession} from '@/utils/auth'
import InspectionReportWxMessagePushUserDialog from '@/components/AutomationOperationsComponent/InspectionReportWxMessagePushUserDialog.vue'
import ListControl from '@/components/ListControl'
export default {
  name: 'TimingTaskList',
  components: { Pagination, TaskExecuteDialog, TaskExecuteLogDialog, InspectionReportWxMessagePushUserDialog, ListControl },
  data() {
    return {
      params: {
        page: 1,
        limit: 10,
        hystatus: '',
        hytype: '',
        hyappTitle: ''
      },
      workScriptList: [],
      workScriptTotal: 0,
      workScriptListQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      taskTimeout: 120,
      enclosureTask: {},
      executeUsers: [],
      scriptExecuteResult: [],
      handlerTask: {},
      // 显示控制数据 start
      checkList: ['作业名称', '周期', '执行时期', '执行人', '上次执行时间', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setHMS() { // 设置时分秒
      return function(h, m, s) {
        return `${h > 10 ? h : '0' + h}:${m > 10 ? m : '0' + m}:${s > 10 ? s : '0' + s}`
      }
    },
    setCycle() { // 设置周期
      return function(executeTimeType, executeDay) {
        let cycle = ''
        if (Number(executeTimeType) === 1) {
          cycle = '每天 '
        } else if (Number(executeTimeType) === 2) {
          cycle = '每星期 '
          switch (Number(executeDay)) {
            case 0:
              cycle += '周日 '
              break
            case 1:
              cycle += '周一 '
              break
            case 2:
              cycle += '周二 '
              break
            case 3:
              cycle += '周三 '
              break
            case 4:
              cycle += '周四 '
              break
            case 5:
              cycle += '周五 '
              break
            case 6:
              cycle += '周六 '
              break
            default:
              cycle += ''
          }
        } else if (executeTimeType === 3) {
          cycle = executeDay === -1 ? '每月' : `每月 ${executeDay}号 `
        }
        return cycle
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.workScriptListQuery = pageQuery
    }
  },
  mounted() {
    window.addEventListener('watchWsMessage', (res) => {
      // 执行输出
      if (res.detail.data.cmd === 'execScript-websocket') {
        const wsRes = JSON.parse(res.detail.data.data)
        if (wsRes.executeTime) {
          this.$set(this.handlerTask, 'executeTime', wsRes.executeTime)
        }
        console.log(wsRes)
        if (wsRes.output.indexOf('执行完成') !== -1) {
          const getStep = this.scriptExecuteResult.findIndex(item => Number(item.stepId) === Number(wsRes.stepId))
          if (getStep === -1) return
          const getServer = this.scriptExecuteResult[getStep].server.findIndex(item => Number(item.serverId) === Number(wsRes.curServerId))
          if (getServer === -1) return
          this.$set(this.scriptExecuteResult[getStep].server[getServer], 'executeStatue', 1)
          const inLoading = this.scriptExecuteResult[getStep].server.filter(el => el.executeStatue === -1)
          const success = this.scriptExecuteResult[getStep].server.filter(el => el.executeStatue === 1)
          const failed = this.scriptExecuteResult[getStep].server.filter(el => el.executeStatue === 0)
          if (success.length === this.scriptExecuteResult[getStep].server.length && inLoading.length === 0) {
            this.$set(this.scriptExecuteResult[getStep], 'statue', 1)
          }
          if (failed.length > 0 && inLoading.length === 0) {
            this.$set(this.scriptExecuteResult[getStep], 'statue', 0)
          }
        }
      }
      // 分析结果
      if (res.detail.data.cmd === 'execScript-analyse-websocket') {
        const wsRes = JSON.parse(res.detail.data.data)
        wsRes.forEach(item => {
          const getStep = this.scriptExecuteResult.findIndex(items => Number(items.stepId) === Number(item.stepId))
          if (getStep === -1) return
          const getServer = this.scriptExecuteResult[getStep].server.findIndex(items => Number(items.serverId) === Number(item.serverId))
          if (getServer === -1) return
          const getScript = this.scriptExecuteResult[getStep].server[getServer].script.findIndex(items => Number(items.scriptId) === Number(item.scriptId))
          if (getScript === -1) return

          this.$set(this.scriptExecuteResult[getStep].server[getServer].script[getScript], 'executeResult', item.analyseResult)
          this.$set(this.scriptExecuteResult[getStep].server[getServer].script[getScript], 'buildResult', item.executeLog)
          this.$set(this.scriptExecuteResult[getStep].server[getServer].script[getScript].authAnalysis[0], 'analyseResult', item.analyseResult)
          this.$set(this.scriptExecuteResult[getStep].server[getServer].script[getScript].authAnalysis[0], 'analyseStatue', item.analyseStatue)
          this.$set(this.scriptExecuteResult[getStep].server[getServer].script[getScript].authAnalysis[0], 'analyseResultReturnOk', true)
        })
      }
    })
    this.loadWorkScriptList()
    this.localStorageOperation('clean', 'workMainList')
    this.localStorageOperation('clean', 'workBaseInfo')
    this.$EventBus.$on('openInspectionReportWxMessagePushUserDialog', (val) => {
      this.$refs.inspectionReportWxMessagePushUserDialog.open(val)
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('openInspectionReportWxMessagePushUserDialog')
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 查询
    search() {
      this.workScriptListQuery.limit = 10
      this.workScriptListQuery.page = 1
      this.loadWorkScriptList()
    },
    // 获取作业
    loadWorkScriptList() {
      request({
        url: api.automationOperations.findHyitOpsTask,
        data: { ...this.workScriptListQuery, keyword: this.workScriptListQuery.keyword }
      }).then(async res => {
        if (res.code === 1) {
          const taskIds = []
          const executeUsers = []
          res.data.forEach(item => taskIds.push(item.id))
          const getTaskLastExecuteLog = await this.findLastHyitOpsExecuteLog({ taskIds: taskIds.toString() })
          if (getTaskLastExecuteLog.data && getTaskLastExecuteLog.data.length > 0) {
            res.data.forEach(taskItem => {
              const getLogIndex = getTaskLastExecuteLog.data.findIndex(logItem => Number(logItem.taskId) === Number(taskItem.id))
              if (getLogIndex !== -1) {
                taskItem.executeTime = getTaskLastExecuteLog.data[getLogIndex].executeTime
                taskItem.executeUserId = getTaskLastExecuteLog.data[getLogIndex].userId
              }
            })

            getTaskLastExecuteLog.data.forEach(item => {
              if (item.userId !== null) executeUsers.push(item.userId)
            })
          }
          this.workScriptList = res.data
          this.workScriptTotal = Number(res.count)

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
    // 执行作业
    async onEnclosure(row) {
      this.handlerTask = row
      const generateTmp = await this.generateTmp(row)
      let isNullData = false

      if (!generateTmp.statue) {
        this.$message(generateTmp.msg)
        return
      }

      this.scriptExecuteResult.forEach(item => {
        const stepName = item.stepName

        if (item.server.length === 0 && !isNullData) {
          this.$message(`步骤 ${stepName} 主机不存在`)
          isNullData = true
        }
      })

      this.scriptExecuteResult.forEach(item => {
        const stepName = item.stepName

        item.server.forEach(items => {
          if (items.script.length === 0 && !isNullData) {
            this.$message(`步骤 ${stepName} 脚本不存在`)
            isNullData = true
          }
        })
      })

      if (!isNullData) {
        this.$set(this.scriptExecuteResult, this.scriptExecuteResult.length, {
          stepId: this.$tool.guid(), // 步骤id
          stepName: '闭环确认', // 步骤名称
          stepNum: this.scriptExecuteResult.length, // 步骤顺序
          isStepOver: true
        })
        this.$refs.taskExecuteDialog.open()

        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        const getUserSessionResult = getUserSession()
        this.$ws.sendWebsocket(this.wsCmd.host.default, {
          cmd: this.wsCmd.automationOperations.execTask,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            taskId: row.id,
            agent: row.agent,
            timeout: this.taskTimeout
          }
        })
      }
    },
    // 生成传递给 TaskExecuteDialog 组件的参数结构
    async generateTmp(row) {
      this.scriptExecuteResult = []

      const getStepList = await this.findHyitOpsTaskLink({ taskId: row.id, limit: -1 })

      if (!getStepList || getStepList.length === 0) {
        return {
          statue: false,
          msg: '作业未配置步骤'
        }
      }

      getStepList.sort(this.$tool.compareJsonDataByProperty('scriptStep'))

      let scriptIds = []
      let templateIds = []
      let serverIds = []
      let opsServer = {}
      let itHost = []
      let templateScript = []
      let scriptList = []
      let scriptResultExpression = []

      // 根据步骤查询关联主机
      getStepList.forEach(item => {
        serverIds = [...serverIds, ...item.serverIds.split(',')]
        if (item.stepType === 2) templateIds.push(item.scriptId)
        if (item.stepType === 1) scriptIds.push(item.scriptId)
      })

      if (serverIds.length > 0) opsServer = await this.$request({ url: this.api.automationOperations.findHyitOpsServer, data: { ids: this.$tool.uniqueArray(serverIds).toString(), limit: -1 }})

      const hostIds = []
      opsServer.data.forEach(item => { hostIds.push(item.hostId) })

      if (hostIds.length > 0) itHost = await request({ url: api.itMonitor.findHyitHost, data: { ids: this.$tool.uniqueArray(hostIds).toString(), hostType: 1, limit: -1 } })
      itHost.data.forEach(item => {
        const getOpsServerIdx = opsServer.data.findIndex(getOpsServerItem => Number(getOpsServerItem.hostId) === Number(item.hyHostId))
        if (getOpsServerIdx !== -1) {
          item.opsServerId = opsServer.data[getOpsServerIdx].id
          item.userName = opsServer.data[getOpsServerIdx].userName
          item.pwd = opsServer.data[getOpsServerIdx].pwd
          item.location = opsServer.data[getOpsServerIdx].location
          item.serverAlias = opsServer.data[getOpsServerIdx].serverAlias
          item.remarks = opsServer.data[getOpsServerIdx].remarks
        }
      })

      // 根据步骤查询关联的作业或者脚本
      // 查询模板关联脚本
      if (templateIds.length > 0) {
        templateScript = await request({ url: api.automationOperations.findHyitOpsTamplateScript, data: { tamplateIds: this.$tool.uniqueArray(templateIds).toString(), limit: -1 } })
        templateScript.data.forEach(item => scriptIds.push(item.scriptId))
      }

      // 批量查询脚本
      if (scriptIds.length > 0) {
        scriptList = await request({ url: api.automationOperations.findHyitOpsScript, data: { ids: this.$tool.uniqueArray(scriptIds).toString(), limit: -1 } })
        scriptResultExpression = await request({ url: api.automationOperations.findHyitOpsResultExpression, data: { scriptIds: this.$tool.uniqueArray(scriptIds).toString(), limit: -1 } })
      }

      const scriptExecuteResult = []
      getStepList.forEach(item => {
        const serverArr = item.serverIds.split(',')
        const server = []
        const script = []

        if (item.stepType === 1) {
          const sIdx = scriptList.data.findIndex(sItem => Number(sItem.id) === Number(item.scriptId))
          const rIdx = scriptResultExpression.data.findIndex(sItem => Number(sItem.scriptId) === Number(item.scriptId))
          if (sIdx !== -1) {
            script.push({
              scriptId: scriptList.data[sIdx].id, // 脚本id
              scriptName: scriptList.data[sIdx].scriptName, // 脚本名称
              buildResult: '', // 输出结果
              analysisScript: rIdx === -1 ? '' : scriptResultExpression.data[rIdx].expression, // 分析脚本代码
              executeResult: '', // 执行结果
              emptyExpression: rIdx === -1, // 分析脚本为空
              authAnalysis: [ // 自动分析数据
                {
                  name: rIdx === -1 ? '' : scriptResultExpression.data[rIdx].name, // 表达式名称
                  compareCharacter: rIdx === -1 ? '' : scriptResultExpression.data[rIdx].compareCharacter, // 判断符号
                  compareValue: rIdx === -1 ? '' : scriptResultExpression.data[rIdx].compareValue, // 判断值
                  analyseResult: '', // 实际结果
                  analyseStatue: 0, // 分析状态
                  analyseResultReturnOk: false // 分析结果已返回
                }
              ]
            })
          }
        }

        if (item.stepType === 2) {
          const scriptIds = []
          templateScript.data.forEach(tItem => {
            if (Number(tItem.tamplateId) === Number(item.scriptId)) {
              scriptIds.push(tItem.scriptId)
            }
          })
          scriptIds.forEach(sIdItem => {
            const sIdx = scriptList.data.findIndex(sItem => Number(sItem.id) === Number(sIdItem))
            const rIdx = scriptResultExpression.data.findIndex(sItem => Number(sItem.scriptId) === Number(scriptList.data[sIdx].id))
            if (sIdx !== -1) {
              script.push({
                scriptId: scriptList.data[sIdx].id, // 脚本id
                scriptName: scriptList.data[sIdx].scriptName, // 脚本名称
                buildResult: '', // 输出结果
                analysisScript: rIdx === -1 ? '' : scriptResultExpression.data[rIdx].expression, // 分析脚本代码
                executeResult: '', // 执行结果
                emptyExpression: rIdx === -1,
                authAnalysis: [ // 自动分析数据
                  {
                    name: rIdx === -1 ? '' : scriptResultExpression.data[rIdx].name, // 表达式名称
                    compareCharacter: rIdx === -1 ? '' : scriptResultExpression.data[rIdx].compareCharacter, // 判断符号
                    compareValue: rIdx === -1 ? '' : scriptResultExpression.data[rIdx].compareValue, // 判断值
                    analyseResult: '', // 实际结果
                    analyseStatue: 0, // 分析状态
                    analyseResultReturnOk: false // 分析结果已返回
                  }
                ]
              })
            }
          })
        }

        serverArr.forEach(sArrItem => {
          const sIdx = itHost.data.findIndex(sItem => Number(sItem.opsServerId) === Number(sArrItem))
          if (sIdx !== -1) {
            server.push({
              serverId: itHost.data[sIdx].opsServerId,
              serverName: itHost.data[sIdx].hyMarkName,
              executeStatue: -1,
              script: this.$tool.deepCopy(script)
            })
          }
        })

        const tmp = {
          stepId: item.id, // 步骤id
          stepName: item.name, // 步骤名称
          stepNum: item.scriptStep, // 步骤顺序
          stepType: item.stepType, // 步骤类型 1脚本 2模板
          stepStatue: 0, // 步骤状态
          server: this.$tool.deepCopy(server) // 设备
        }
        scriptExecuteResult.push(this.$tool.deepCopy(tmp))
      })
      this.scriptExecuteResult = scriptExecuteResult
      return {
        statue: true
      }
    },
    addTask() {
      const data = { ...this.workScriptListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'TimingTaskCreate'
      })
    },
    // 编辑
    onEdit(row) {
      const data = { ...this.workScriptListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'TimingTaskUpdate',
        query: {
          id: row.id || 0
        }
      })
    },
    // 删除
    onDelete(row) {
      this.$confirm('是否删除该作业？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.automationOperations.deleteHyitOpsTask,
          data: { id: row.id }
        })
          .then(res => {
            if (res.code === 1) {
              this.taskChange(row.agent)
              this.loadWorkScriptList()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      })
    },
    // 作业有变更通知网关
    taskChange(agent) {
      request({
        url: api.automationOperations.TaskChange,
        data: { agent }
      })
    },
    // 查出多个作业最新的执行日志
    async findLastHyitOpsExecuteLog(query) {
      return await this.$request({
        url: this.api.automationOperations.findLastHyitOpsExecuteLog,
        data: query
      })
    },
    // 查询作业步骤
    async findHyitOpsTaskLink(query) {
      const { code, data } = await this.$request({
        url: this.api.automationOperations.findHyitOpsTaskLink,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 打开日志
    onLog(row) {
      this.$refs.taskExecuteLogDialog.open({ taskId: row.id, ...row }, this.$tool.deepCopy(this.scriptExecuteResult))
    }
  }
}
</script>
