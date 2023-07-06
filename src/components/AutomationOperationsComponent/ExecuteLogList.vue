<template>
  <div class="app-container">
    <div v-permission="['Search']" class="filter-container">
      <el-select v-model="executeLogListQuery.logType" class="filter-item" @change="handelLogType">
        <el-option
          v-for="item in logTypeArr"
          :key="item.id"
          :label="item.logType"
          :value="item.id"
        />
      </el-select>
      <el-select v-model="executeStatue" v-el-select-loadmore="loadMore" class="filter-item" @change="handelExecuteStatus">
        <el-option label="所有状态" value="" />
        <el-option
          v-for="item in executeStatusArr"
          :key="item.id"
          :label="item.executeStatue"
          :value="item.id"
        />
      </el-select>
      <el-select v-if="executeLogListQuery.logType === -1" v-model="executeLogListQuery.taskId" v-el-select-loadmore="loadTask" class="filter-item">
        <el-option label="所有作业" value="" />
        <el-option
          v-for="item in executeTaskSelectList"
          :key="item.id"
          :label="item.taskName"
          :value="item.id"
        />
      </el-select>
      <el-select v-if="executeLogListQuery.logType === 0" v-model="executeLogListQuery.scriptId" v-el-select-loadmore="loadScript" class="filter-item">
        <el-option label="所有脚本" value="" />
        <el-option
          v-for="item in executeScriptSelectList"
          :key="item.id"
          :label="item.scriptName"
          :value="item.id"
        />
      </el-select>
      <el-select v-model="findHyitHostQuery.devType" class="filter-item" @change="changeDevType">
        <el-option label="所有类型" value="" />
        <el-option
          v-for="item in devTypeList"
          :key="item.id"
          :label="item.dictdataName"
          :value="item.id"
        />
      </el-select>
      <el-select v-model="executeLogListQuery.serverId" v-el-select-loadmore="loadMoreDevice" class="filter-item">
        <el-option label="所有设备" value="" />
        <el-option
          v-for="item in deviceList"
          :key="item.opsServerId"
          :label="item.hyMarkName"
          :value="item.opsServerId"
        />
      </el-select>
      <el-date-picker
        v-model="executeLogListQuery.sTime"
        class="filter-item"
        type="datetime"
        placeholder="开始时间"
      />
      <el-date-picker
        v-model="executeLogListQuery.eTime"
        class="filter-item"
        type="datetime"
        placeholder="结束时间"
      />
      <el-button type="primary" class="filter-item" @click="search()">查询</el-button>
    </div>
    <div v-show="logTypeStatus === -1" class="table-wrapper">
      <el-table
        ref="taskLogTable"
        :data="taskList"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column type="expand" prop="id">
          <template slot-scope="props">
            <div class="table-wrapper">
              <el-table
                :data="props.row.logList"
                fit
                highlight-current-row
                style="width: 100%;"
                class="task-log-table"
              >
                <el-table-column label="执行状态" prop="executeTimeId" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    {{ row.executeStatue == 0 ? '失败' : '正常' }}
                  </template>
                </el-table-column>
                <el-table-column label="执行脚本" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <el-button v-permission="['GetExecuteScript']" size="mini" type="primary" @click="openExecuteScriptDialog(row)">
                      脚本
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column label="执行设备" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    {{ getServerName(row) }}
                  </template>
                </el-table-column>
                <el-table-column label="执行人" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <p v-for="item in userArr" :key="item.userId">
                      <span v-if="row.userId == item.userId">{{ item.realName }}</span>
                    </p>
                  </template>
                </el-table-column>
                <el-table-column label="匹配状态" prop="analyseStatue" width="180" show-overflow-tooltip>
                  <template slot-scope="item">
                    <div :class="item.row.analyseStatue === 1 ? 'success' : 'danger'">
                      <i :class="item.row.analyseStatue === 1 ? 'el-icon-success' : 'el-icon-error'" />
                      {{ item.row.analyseStatue === 1 ? '正常' : '异常' }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="匹配结果" prop="analyseResult" width="180" show-overflow-tooltip />
                <el-table-column label="运行时间" prop="executeTime" width="180" show-overflow-tooltip />
                <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <el-button v-permission="['GetReport']" size="mini" type="primary" @click="openExecuteResultDialog(row)">
                      查看结果
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="作业名称" prop="taskName" width="150" show-overflow-tooltip />
        <!--        <el-table-column label="执行类型" prop="executeTimeId" width="150" show-overflow-tooltip>-->
        <!--          <template v-if="row.executeTimeId" slot-scope="{row}">-->
        <!--            {{ row.executeTimeId == 1 ? '手动' : '自动' }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column label="执行时间" prop="executeStartTime" width="170" show-overflow-tooltip />
        <el-table-column label="" prop="" align="right">
          <template slot-scope="{row}">
            <el-button v-permission="['GetReport']" size="mini" type="primary" @click="openGetHyitOpsExecuteLogReport(row)">
              查看报告
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-show="logTypeStatus === 0" class="table-wrapper">
      <el-table
        :data="scriptExecuteLog"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="NO" prop="id" type="index" width="80" />
        <el-table-column label="执行状态" prop="executeTimeId" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.executeStatue == 0 ? '失败' : '正常' }}
          </template>
        </el-table-column>
        <el-table-column label="执行脚本" width="160" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-button v-permission="['GetExecuteScript']" size="mini" type="primary" @click="openExecuteScriptDialog(row)">
              查看执行脚本
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="执行设备" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ getServerName(row) }}
          </template>
        </el-table-column>
        <el-table-column label="执行人" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setUser(row.userId) }}
          </template>
        </el-table-column>
        <el-table-column label="匹配状态" prop="analyseStatue" width="180" show-overflow-tooltip>
          <template slot-scope="item">
            <div :class="item.row.analyseStatue === 1 ? 'success' : 'danger'">
              <i :class="item.row.analyseStatue === 1 ? 'el-icon-success' : 'el-icon-error'" />
              {{ item.row.analyseStatue === 1 ? '正常' : '异常' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="匹配结果" prop="analyseResult" width="180" show-overflow-tooltip />
        <el-table-column label="运行时间" prop="executeTime" width="180" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['GetResult']" size="mini" type="primary" @click="openExecuteResultDialog(row)">
              查看结果
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="logTotal > 0" :auto-scroll="false" class="mt-10" :total="logTotal" :page.sync="executeLogListQuery.page" :limit.sync="executeLogListQuery.limit" @pagination="loadExecuteLogList" />
    <el-dialog title="执行结果" :visible.sync="showExecuteResultDialog" top="5vh">
      <el-form>
        <el-form-item>
          <el-input :value="runResult" type="textarea" rows="20" />
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog title="执行脚本" :visible.sync="showExecuteScriptDialog" top="5vh">
      <el-form>
        <el-form-item>
          <el-input :value="executeScriptCode" type="textarea" rows="20" />
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog title="执行设备" :visible.sync="showExecuteServerDialog" top="5vh">
      <div class="equipment_table">
        <el-table :data="executeServerList" fit highlight-current-row style="width: 100%;">
          <el-table-column label="NO" prop="id" type="index" width="60" />
          <el-table-column label="服务器名称" prop="serverName" />
          <el-table-column label="服务器IP" prop="ip" />
        </el-table>
      </div>
    </el-dialog>
    <el-dialog title="运维分析" :visible.sync="showExecuteAnalysisDialog" top="5vh">
      <el-table
        :data="analysisList"
        fit
        highlight-current-row
        default-expand-all
        style="width: 100%;"
      >
        <el-table-column type="expand" prop="id">
          <template slot-scope="props">
            <el-table
              :data="props.row.analysisList"
              fit
              highlight-current-row
              style="width: 100%;"
              class="task-log-table"
            >
              <el-table-column label="NO" type="index" width="120" />
              <el-table-column label="分析结果" prop="matchingResults" />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="设备名称" prop="serverName" width="150" />
        <el-table-column label="" prop="" />
      </el-table>
    </el-dialog>
    <el-dialog title="作业报告" :visible.sync="showExecuteLogReport" top="5vh">
      <el-descriptions v-for="(item, index) in executeLogReport" :key="index" class="margin-top" :column="3" border>
        <el-descriptions-item>
          <template slot="label">
            脚本名称
          </template>
          <div style="width: 50px">
            {{ item.scriptName }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            匹配结果
          </template>
          <div style="width: 100px">{{ item.compareCharacter }}{{ item.compareValue }}</div>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            执行时间
          </template>
          {{ item.executeTime }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            执行结果统计
          </template>
          <div class="text-center">
            <span class="success">正常：<el-link class="success" @click="serverDetail(item, item.normalCount)">{{ item.normalCount || 0 }} </el-link></span>
            <span class="margin-left-10 danger">异常：<el-link class="danger" @click="serverDetail(item, item.abnormalCount)">{{ item.abnormalCount || 0 }}</el-link></span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <InspectionReportDialog ref="inspectionReportDialog" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import { getNowDate } from '@/utils/utils'
import InspectionReportDialog from '@/components/AutomationOperationsComponent/InspectionReportDialog'

export default {
  name: 'ExecuteLogListComponent',
  directives: {
    'el-select-loadmore': {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
        SELECTWRAP_DOM.addEventListener('scroll', () => {
          /**
           * scrollHeight 获取元素内容高度(只读)
           * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
           * clientHeight 读取元素的可见高度(只读)
           * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
           * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
           */
          const condition = SELECTWRAP_DOM.scrollHeight - SELECTWRAP_DOM.scrollTop <= SELECTWRAP_DOM.clientHeight
          if (condition) {
            binding.value()
          }
        })
      }
    }
  },
  components: { Pagination, InspectionReportDialog },
  data() {
    return {
      keyword: null,
      data: [],
      executeLogListTotal: 0,
      userArr: [],
      nowDate: new Date(),
      executeLogListQuery: {
        scriptId: ``,
        serverId: '',
        executeStatue: '',
        logType: -1,
        page: 1,
        limit: 10,
        taskId: ''
      },
      showRunScriptResultDialog: false,
      runResult: '',
      executeStatusArr: [
        { id: 0, executeStatue: '错误' },
        { id: 1, executeStatue: '正常' }
      ],
      logTypeArr: [
        { id: -1, logType: '作业日志' },
        { id: 0, logType: '脚本日志' }
      ],
      executeStatue: [],
      showExecuteScriptDialog: false,
      executeScriptCode: '',
      showExecuteServerDialog: false,
      executeServerDialog: [],
      showExecuteResultDialog: false,
      executeServerList: [],
      executeServerSelectList: [],
      executeScriptSelectList: [],
      executeTaskSelectList: [],
      executeScriptSelectListQuery: {
        page: 0,
        limit: 10
      },
      executeServerSelectListQuery: {
        page: 0,
        limit: 30
      },
      executeTaskSelectListQuery: {
        page: 0,
        limit: 10
      },
      taskList: [],
      logTotal: 0,
      taskLogList: [],
      scriptExecuteLog: [],
      logTypeStatus: -1,
      showExecuteAnalysisDialog: false,
      analysisList: [],
      expandIds: [],
      executeLogReport: {},
      showExecuteLogReport: false,
      getNowDate: getNowDate('object'),
      findHyitHostQuery: {
        page: 1,
        limit: 10,
        agent: '',
        devType: '',
        keyword: '',
        hostType: 1
      },
      deviceList: [],
      devTypeList: []
    }
  },
  computed: {
    queryTaskList() {
      const _this = this
      return function(taskId) {
        const taskIndex = _this.taskLogList.findIndex(item => item.taskId === taskId)
        return _this.taskLogList[taskIndex].logList
      }
    },
    taskLogTotal() {
      const _this = this
      return function(taskId) {
        const taskIndex = _this.taskLogList.findIndex(item => item.taskId === taskId)
        return _this.taskLogList[taskIndex].executeLogListQuery
      }
    },
    getServerName() {
      return function(row) {
        const idx = this.executeServerSelectList.findIndex(item => item.id === Number(row.serverId))
        if (idx !== -1) {
          return this.executeServerSelectList[idx].serverName
        }
      }
    },
    setUser() {
      return function(userId) {
        const idx = this.userArr.findIndex(item => Number(item.userId) === Number(userId))
        if (idx !== -1) return this.userArr[idx].realName
      }
    }
  },
  mounted() {
    this.loadDevType()
    this.loadDeviceList()
    this.loadScript()
    this.loadTask()
    this.getSysUser()
    this.$set(this.executeLogListQuery, 'sTime', new Date(this.getNowDate.Y, this.getNowDate.M - 1, this.getNowDate.D, 0, 0, 0))
    this.$set(this.executeLogListQuery, 'eTime', new Date(this.getNowDate.Y, this.getNowDate.M - 1, this.getNowDate.D, 23, 59, 59))
    this.loadExecuteLogList()
  },
  methods: {
    // 加载执行日志
    loadExecuteLogList() {
      if (this.executeLogListQuery.sTime !== '') {
        const sTime = getNowDate('object', new Date(this.executeLogListQuery.sTime))
        this.$set(this.executeLogListQuery, 'sTime', `${sTime.Y}-${sTime.M}-${sTime.D} ${sTime.h}:${sTime.m}:${sTime.s}`)
      }
      if (this.executeLogListQuery.eTime !== '') {
        const eTime = getNowDate('object', new Date(this.executeLogListQuery.eTime))
        this.$set(this.executeLogListQuery, 'eTime', `${eTime.Y}-${eTime.M}-${eTime.D} ${eTime.h}:${eTime.m}:${eTime.s}`)
      }
      const requestApi = this.executeLogListQuery.logType === -1 ? api.automationOperations.findHyitOpsExecuteLogByGroup : api.automationOperations.findHyitOpsExecuteLog
      const executeLogListQuery = { ...this.executeLogListQuery }
      executeLogListQuery.taskId = executeLogListQuery.taskId === '' ? -1 : executeLogListQuery.taskId
      request({
        url: requestApi,
        data: executeLogListQuery
      }).then(res => {
        if (res.code === 1) {
          const data = res.data
          this.logTotal = Number(res.count)
          if (this.executeLogListQuery.logType === -1) {
            this.taskList = data
            for (let i = 0; i < this.taskList.length; i++) {
              this.setTaskDetail(this.taskList[i].taskId, i, this.taskList[i].executeStartTime)
            }
          } else {
            this.scriptExecuteLog = data
          }
        }
      })
    },
    setTaskDetail(taskId, i, executeStartTime) {
      request({
        url: api.automationOperations.getHyitOpsTask,
        data: { id: taskId }
      }).then(res => {
        if (res.model) {
          this.$set(this.taskList[i], 'taskName', res.model.taskName)
          this.$set(this.taskList[i], 'executeTimeId', res.model.executeTimeId)
          this.$set(this.taskList[i], 'logList', [])
          this.setFindLog({
            taskId: taskId, executeStartTime: executeStartTime
          }, i)
        }
      })
    },
    setFindLog(row, idx) {
      request({
        url: api.automationOperations.findHyitOpsExecuteLog,
        data: { id: row.taskId, executeStartTime: row.executeStartTime }
      }).then(res => {
        this.$set(this.taskList[idx], 'logList', res.data)
      })
    },
    getSysUser() { // 获取账号信息
      request({
        url: api.knowledge.findSysUser,
        data: { pid: 10, companyId: this.$auth.getUserSession().companyId }
      }).then(res => {
        this.userArr = res.data
      })
    },
    loadMore() {
      console.log('loadMore')
    },
    // 打开查询日志执行结果
    openExecuteResultDialog(row) {
      this.showExecuteResultDialog = true
      this.getExecuteLog(row.id, (res) => {
        this.runResult = res.executeLog
      })
    },
    // 打开查询日志执行脚本
    openExecuteScriptDialog(row) {
      this.showExecuteScriptDialog = true
      this.getScriptInfo(row.scriptId, (res) => { this.executeScriptCode = res.script })
    },
    // 打开查询设备
    openExecuteServerDialog(row) {
      this.showExecuteServerDialog = true
      this.executeServerList = []
      this.getServerInfo(row.serverId, (res) => {
        this.$set(this.executeServerList, this.executeServerList.length, res)
      })
    },
    // 查询作业信息
    getTaskInfo(id, callback) {
      request({
        url: api.automationOperations.findHyitOpsTaskLink,
        data: { id }
      })
        .then(res => {
          if (res.code === 1) {
            callback(res.data)
          }
        })
    },
    // 查询设备信息
    getServerInfo(id, callback) {
      request({
        url: api.automationOperations.getHyitOpsServer,
        data: { id }
      })
        .then(res => {
          if (res.code === 1) {
            callback(res.model)
          }
        })
    },
    // 查询脚本
    getScriptInfo(id, callback) {
      request({
        url: api.automationOperations.getHyitOpsScript,
        data: { id }
      })
        .then(res => {
          if (res.code === 1) {
            callback(res.model)
          }
        })
    },
    // 查询日志详情
    getExecuteLog(id, callback) {
      request({
        url: api.automationOperations.getHyitOpsExecuteLog,
        data: { id }
      })
        .then(res => {
          if (res.code === 1) {
            callback(res.model)
          }
        })
    },
    // 选择状态
    handelExecuteStatus(val) {
      this.$set(this.executeLogListQuery, 'executeStatue', val)
    },
    // 搜索
    search() {
      this.$set(this.executeLogListQuery, 'page', 1)
      this.$set(this.executeLogListQuery, 'limit', 10)
      this.$nextTick(function() {
        this.logTypeStatus = this.executeLogListQuery.logType
      })
      this.loadExecuteLogList()
    },
    // 加载设备
    loadServer() {
      this.$set(this.executeServerSelectListQuery, 'page', this.executeServerSelectListQuery.page + 1)
      request({
        url: api.automationOperations.findHyitOpsServer,
        data: { ...this.executeServerSelectListQuery }
      }).then(res => {
        if (res.data.length > 0) {
          if (this.executeServerSelectListQuery.page > 1) {
            const listData = this.executeServerSelectList
            listData.push(...res.data)
            this.executeServerSelectList = listData
          } else {
            this.executeServerSelectList = res.data
          }
        } else {
          this.$set(this.executeServerSelectListQuery, 'page', this.executeServerSelectListQuery.page - 1)
        }
      })
    },
    // 加载作业
    loadTask() {
      request({
        url: api.automationOperations.findHyitOpsTask,
        data: { ...this.executeTaskSelectListQuery }
      }).then(res => {
        if (res.data.length > 0) {
          if (this.executeTaskSelectListQuery.page > 1) {
            const listData = this.executeTaskSelectList
            listData.push(res.data)
            this.executeTaskSelectList = listData
          } else {
            this.executeTaskSelectList = res.data
          }
        } else {
          this.$set(this.executeTaskSelectListQuery, 'page', this.executeTaskSelectListQuery.page - 1)
        }
      })
    },
    // 加载脚本
    loadScript() {
      this.$set(this.executeScriptSelectListQuery, 'page', this.executeScriptSelectListQuery.page + 1)
      request({
        url: api.automationOperations.findHyitOpsScript,
        data: { ...this.executeScriptSelectListQuery }
      }).then(res => {
        if (res.data.length > 0) {
          if (this.executeScriptSelectListQuery.page > 1) {
            const listData = this.executeScriptSelectList
            listData.push(res.data)
            this.executeScriptSelectList = listData
          } else {
            this.executeScriptSelectList = res.data
          }
        } else {
          this.$set(this.executeScriptSelectListQuery, 'page', this.executeScriptSelectListQuery.page - 1)
        }
      })
    },
    handelLogType(val) {
      this.$set(this.executeLogListQuery, 'scriptId', val === -1 ? '' : this.executeLogListQuery.scriptId)
      this.$set(this.executeLogListQuery, 'taskId', val === -1 ? '' : val)
    },
    setAnalysisDetail(serverId, i) {
      console.log('setAnalysisDetail')
      request({
        url: api.automationOperations.getHyitOpsServer,
        data: { id: serverId }
      }).then(res => {
        if (res.model) {
          this.$set(this.analysisList[i], 'serverName', res.model.serverName)
        } else {
          this.$set(this.analysisList[i], 'serverName', '')
        }
      })
    },
    openGetHyitOpsExecuteLogReport(row) {
      this.$refs.inspectionReportDialog.open(row)
    },
    serverDetail(row, count) {
      if (count > 0) {
        this.showExecuteServerDialog = true
        this.executeServerList = []
        this.getServerInfo(row.serverId, (res) => {
          this.$set(this.executeServerList, this.executeServerList.length, res)
        })
      }
    },
    // 获取设备列表
    async loadDeviceList() {
      // 获取it监控设备
      const itHost = await this.$request({ url: this.api.itMonitor.findHyitHost, data: this.findHyitHostQuery })
      if (itHost.code !== 1 && !itHost.data) return
      this.hostTotal = Number(itHost.count)
      const hostIds = []
      itHost.data.forEach(item => hostIds.push(item.hyHostId))
      // 根据it监控去获取运维设备
      const opsServer = await this.$request({ url: this.api.automationOperations.findHyitOpsServer, data: { hostIds: hostIds.toString(), limit: -1 }})
      itHost.data.forEach(item => {
        const getOpsServerIdx = opsServer.data.findIndex(getOpsServerItem => Number(getOpsServerItem.hostId) === Number(item.hyHostId))
        if (getOpsServerIdx !== -1) {
          item.opsServerId = opsServer.data[getOpsServerIdx].id
          item.userName = opsServer.data[getOpsServerIdx].userName
          item.pwd = opsServer.data[getOpsServerIdx].pwd
        }
      })
      this.deviceList = [...this.deviceList, ...itHost.data]
    },
    loadMoreDevice() {
      this.$set(this.findHyitHostQuery, 'page', ++this.findHyitHostQuery.page)
      this.loadDeviceList()
    },
    loadDevType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    changeDevType() {
      this.deviceList = []
      this.$set(this.executeLogListQuery, 'serverId', '')
      this.loadDeviceList()
    }
  }
}
</script>
