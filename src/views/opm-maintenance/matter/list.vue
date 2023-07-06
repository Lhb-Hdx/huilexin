<template>
  <div class="matter app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="mb-0 flex">
        <!--        <div class="mr-10">-->
        <!--          <el-button v-permission="['create']" type="primary" icon="el-icon-plus" @click="handleAdd()">新增事项</el-button>-->
        <!--        </div>-->
        <div v-permission="['search']">
          <el-form-item>
            <el-select v-model="listQuery.problemType" placeholder="事项类型" clearable class="filter-item" style="width: 150px" @clear="handleSearch">
              <el-option v-for="item in typeOption" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="listQuery.statue" placeholder="事项状态" clearable class="filter-item" style="width: 150px" @clear="handleSearch">
              <el-option v-for="item in audioStatus" :key="item.statue" :label="item.value" :value="item.statue" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="matterListTypeValue" class="filter-item" style="width: 150px">
              <el-option v-for="item in matterListType" :key="item.type" :label="item.value" :value="item.type" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="listQuery.keyword" placeholder="事项名称" clearable @clear="handleSearch" />
          </el-form-item>
          <!--          <el-form-item>-->
          <!--            <el-date-picker v-model="listQuery.ctime" type="date" placeholder="请选择时间" style="width: 100%;" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd" clearable @clear="handleSearch" />-->
          <!--          </el-form-item>-->
          <el-form-item>
            <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <div class="table-wrapper">
      <el-table :data="tableData" fit highlight-current-row style="width: 100%">
        <el-table-column prop="problemNo" label="事项编号" width="auto" align="left" min-width="9%" show-overflow-tooltip />
        <el-table-column prop="name" show-overflow-tooltip width="auto" min-width="19%" label="事项名称">
          <template slot-scope="{ row }">
            <span style="color: #013e9a">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <!--        <el-table-column prop="problemType" label="事项类型" width="auto" min-width="5%" show-overflow-tooltip>-->
        <!--          <template slot-scope="{ row }">-->
        <!--            {{ $tool.matchData(typeOption, row, 'problemType', 'label', 'value') }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column prop="serviceType" label="服务类型" width="auto" min-width="7%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ setServiceType(row.serviceType) }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="严重/紧急/影响度" width="auto" min-width="8%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <el-tag :type="$tool.formatStr(row.severityType, '1:success,2:warning,3:danger') || '0'" effect="dark" size="mini">
              {{ $tool.formatStr(row.severityType, '1:低,2:中,3:高') }}
            </el-tag>
            <el-tag :type="$tool.formatStr(row.effectType, '1:success,2:warning,3:danger') || '0'" effect="dark" size="mini" class="mr-1 ml-1">
              {{ $tool.formatStr(row.effectType, '1:低,2:中,3:高') }}
            </el-tag>
            <el-tag :type="$tool.formatStr(row.urgencyType, '1:success,2:warning,3:danger') || '0'" effect="dark" size="mini" class="ml-1">
              {{ $tool.formatStr(row.urgencyType, '1:低,2:中,3:高') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="提交人" width="auto" min-width="5%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ $tool.matchData(createUser, row, 'userId', 'realName', 'userId') }}
          </template>
        </el-table-column>
        <el-table-column prop="approvalStatus" label="锁定状态" width="auto" min-width="5%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ row.lockStatue === 1 ? '锁定' : '未锁定' }}
          </template>
        </el-table-column>
        <el-table-column prop="lockUserId" label="锁定人" width="auto" min-width="5%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ row.lockStatue === 1 ? $tool.matchData(lockUsers, row, 'lockUserId', 'realName', 'userId') : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="statue" label="事项状态" width="auto" min-width="5%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <!-- setStatue(row.statue) -->
            <span :style="{ color: setStatue(row.statue) }">
              {{ row.statue === null ? '待确认' : setAudioStatus(row.statue) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lockStatue" label="处理状态" width="auto" min-width="5%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <!-- row.statue === null ? '待处理' : -->
            {{ setProcessState(row.processState) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="auto" min-width="10%" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="最后处理时间" width="auto" min-width="10%" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="auto" min-width="7%">
          <template slot-scope="{ row }">
            <el-dropdown @command="handlerActtion">
              <el-button type="primary" size="mini">
                更多操作
                <i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <!-- lockStatue==1为锁住状态，不等于1为未锁状态 -->
                <el-dropdown-item v-show="row.lockStatue !== 1&&row.problemType!==5" v-permission="['Lock']" :command="{ fn: 'handleLockStatus', data: [1, row] }">锁定</el-dropdown-item>
                <el-dropdown-item
                  v-show="row.statue !== 7 && row.statue !== 2 &&row.statue !== 3 &&row.statue !== 4 &&row.lockStatue === 5 && Number(row.lockUserId) === Number(loginUser.userId)&&row.problemType!==5"
                  v-permission="['Unlock']"
                  :command="{ fn: 'handleLockStatus', data: [0, row] }"
                >
                  解锁
                </el-dropdown-item>
                <el-dropdown-item v-show="row.lockStatue !== 1 &&row.problemType!==5" v-permission="['Assigned']" :command="{ fn: 'handleAssigned', data: [row] }">指派</el-dropdown-item>
                <el-dropdown-item v-show="Number(row.userId) === Number(loginUser.userId) && row.lockStatue !== 1" :command="{ fn: 'handleAssign', data: [row] }">编辑</el-dropdown-item>
                <el-dropdown-item :command="{ fn: 'handlePush', data: [row] }">查看</el-dropdown-item>
                <!-- <el-dropdown-item v-if="Number(row.userId) === Number(loginUser.lockUserId)" v-permission="['Withdraw']">撤回</el-dropdown-item> -->
                <el-dropdown-item v-show="row.lockStatue !== 1 && row.processState === 0" :command="{ fn: 'handleDelete', data: [row] }">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findOmRequest" />
    </div>
    <plan-select-user-list ref="userDialog" @selectUser="getSelectUser" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import PlanSelectUserList from '@/views/opm-maintenance/components/selectUserList'

export default {
  name: 'Matter',
  components: {
    Pagination,
    PlanSelectUserList
  },
  data() {
    return {
      listQuery: {
        type: '',
        status: '',
        title: '',
        ctime: '',
        // count: 1,
        page: 1,
        limit: 10
      },
      userIdString: '',
      returnLockUserId: '',
      listCount: 0,
      typeOption: [
        // 事项类型
        { label: '故障问题', value: 1 },
        { label: '服务请求', value: 2 },
        { label: '整改变更', value: 3 },
        { label: '日常事务', value: 4 },
        { label: '运维登记', value: 5 }
      ],
      stateOption: [
        { label: '待提交', value: 0 },
        { label: '待确认', value: 1 },
        { label: '已确认', value: 2 },
        { label: '已关闭', value: 3 },
        { label: '已撤回', value: 4 }
      ],
      listLoading: true,
      tableData: [],
      subTypes: [], // 服务类型
      users: [], // 提交人列表
      loginUser: {},
      matterListTypeValue: 1,
      matterListType: [
        { type: 1, value: '全部' },
        { type: 2, value: '我的' }
      ],
      audioStatus: [
        // { statue: 1, value: '未提交', color: 'danger' },
        { statue: 0, value: '待受理', color: 'danger', colorCode: '#F56C6C' },
        { statue: 1, value: '已确认', color: 'danger', colorCode: '#F56C6C' },
        { statue: 2, value: '审批中', color: 'danger', colorCode: '#F56C6C' },
        // { statue: 3, value: '待确认', color: 'success', colorCode: '#67C23A' },
        { statue: 3, value: '已审批', color: 'success', colorCode: '#67C23A' },
        { statue: 4, value: '驳回', color: 'danger', colorCode: '#F56C6C' },
        { statue: 5, value: '待审核', color: 'success', colorCode: '#67C23A' },
        { statue: 7, value: '关闭', color: 'success', colorCode: '#67C23A' },
        { statue: 8, value: '修改', color: 'success', colorCode: '#67C23A' }
      ],
      processState: [
        { statue: 0, value: '未开始', color: 'danger' },
        { statue: 1, value: '处理中', color: 'danger' },
        { statue: 2, value: '成功处理', color: 'success' },
        { statue: 3, value: '处理失败', color: 'success' }
      ], // 作业状态
      createUser: [],
      lockUsers: [],
      updateOpsOrderProblemQuery: {
        lockStatue: 1,
        id: 0
      },
      allOrderProblemService: []
    }
  },
  computed: {
    setAudioStatus() {
      const that = this
      return function(statue) {
        const idx = that.audioStatus.findIndex(item => Number(item.statue) === Number(statue))
        if (idx !== -1) return that.audioStatus[idx].value
      }
    },
    setProcessState() {
      const that = this
      return function(processState) {
        const idx = that.processState.findIndex(item => Number(item.statue) === Number(processState))
        if (idx !== -1) return that.processState[idx].value
      }
    },
    // 事项状态文字样式
    setStatue() {
      return function(status) {
        const idx = this.audioStatus.findIndex(item => Number(item.statue) === Number(status))
        if (idx !== -1) return this.audioStatus[idx].colorCode
        // return status === 1 ? '#67C23A' : '#F56C6C'
      }
    },
    // 服务类型
    setServiceType() {
      return function(serviceType) {
        const idx = this.allOrderProblemService.findIndex(item => +item.serviceId === +serviceType)
        return idx !== -1 ? this.allOrderProblemService[idx].serviceName : ''
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    this.findOmRequest()
    this.findSysCat()
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    console.log(this.loginUser)
  },
  methods: {
    // 新增事项
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation(
        'set',
        'pageQuery',
        JSON.stringify({
          ...data,
          route: this.$route.name
        })
      )
      this.$router.push({ name: 'createMatter' })
    },

    // 搜索
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findOmRequest()
    },
    // 解锁 / 锁定事项
    async handleLockStatus(status, row) {
      this.$confirm(`确认${status === 1 ? '锁定' : '解锁'}该事项吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          console.log(row)
          console.log(status)

          // status === 1 ? row.statue === null ? 1 : row.statue : ''
          // statue: status || '',锁定是否要加statue吗？解锁

          // let updateOpsOrderProblem = await request({ url: api.opm.updateOpsOrderProblem, data })
          // 插入事项记录
          if (status) {
            const data = { id: row.id, lockStatue: status, lockUserId: this.loginUser.userId, statue: row.statue === null || row.statue === 0 ? 1 : '', processState: status }
            await request({ url: api.opm.updateOpsOrderProblem, data })
            await this.insertOpsOrderProblemLog(3, row.id)
          } else {
            const data = { id: row.id, lockStatue: status, processState: status }
            await request({ url: api.opm.updateOpsOrderProblem, data })
            await this.insertOpsOrderProblemLog(4, row.id)
          }

          // if (updateOpsOrderProblem.code !== 1) return
          await this.findOmRequest()
        })
        .catch(() => {})
    },
    // 新增事项记录
    async insertOpsOrderProblemLog(status, orderId, receiveId = '') {
      let date = new Date()
      await request({
        url: api.opm.insertOpsOrderProblemLog,
        data: { userId: this.loginUser.userId, orderId, receiveId: receiveId, status: status, createTime: this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', date) }
      })
    },
    // 编辑
    handleAssign(row) {
      console.log(row)
      // this.$router.push({ name: 'updateMatter', query: { id: row.id, alarmId: row.alarmId } })
      this.$router.push({ name: 'updateMatter', query: { id: row.id } })
    },
    // 查看
    handlePush(row) {
      console.log(row)
      this.$router.push({ name: 'matterDetail', query: { id: row.id, alarmId: row.alarmId } })
    },
    handleDelete(row) {
      this.$confirm('确认删除事项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          console.log(row)
          const { data, code } = await this.deleteOpsOrderProblem(row)
          if (code !== 1) return
          console.log(data)
          await this.findOmRequest()
          if (row.alarmId) { this.updateZbxAlarmLog(row.alarmId) } // 改变故障告警状态为待处理
        })
    },
    // 改变故障告警状态为待处理
    async updateZbxAlarmLog(id) {
      const res = await request({
        url: '/admin/updateZbxAlarmLog',
        data: { id: id, status: '0' }
      })
      if (res.code !== 1) return
      await this.commonRequestFn.insertOpsOrderAlarmLog({
        alarmId: id,
        alarmModelType: 1,
        alarmHandleLog: `${this.loginUser.realName}删除事项并更改为待处理`,
        userId: this.loginUser.userId
      })
    },
    async deleteOpsOrderProblem(row) {
      return await request({
        url: api.opm.deleteOmRequest,
        data: { id: row.id }
      })
    },
    async findOmRequest() {
      const findDataQuery = { ...this.listQuery }
      if (this.matterListTypeValue === 2) findDataQuery.lockUserId = this.loginUser.userId
      let { code, data, count } = await request({
        url: api.opm.findOpsOrderProblem,
        data: findDataQuery
      })
      if (code !== 1) return
      this.listCount = Number(count)
      const userIds = []
      const lockIds = []
      const serviceTypes = []
      data.forEach(item => {
        if (item.userId) userIds.push(item.userId)
        if (item.lockUserId) lockIds.push(item.lockUserId)
        if (item.serviceType) serviceTypes.push(item.serviceType)
      })
      this.createUser = await this.commonRequestFn.findSysUser({
        ids: this.$tool.uniqueArray(userIds).toString(),
        limit: -1,
        companyId: this.$auth.getUserSession().companyId
      })
      this.lockUsers = await this.commonRequestFn.findSysUser({
        ids: this.$tool.uniqueArray(lockIds).toString(),
        limit: -1,
        companyId: this.$auth.getUserSession().companyId
      })
      if (serviceTypes.length > 0) this.allOrderProblemService = await this.findOpsOrderProblemService({ ids: this.$tool.uniqueArray(serviceTypes).toString(), limit: -1 })
      this.tableData = data
      console.log(this.tableData)
    },
    async findSysCat() {
      // 服务类型
      let { code, data } = await request({
        url: api.sys.findSysCat,
        data: {
          page: 1,
          limit: -1,
          systemName: 'userDefine',
          classify: 'userDefine_运维流程申请单类型',
          parentId: -1,
          module: 2
        }
      })
      if (code !== 1) return
      this.subTypes = data
    },
    // 事项操作
    handlerActtion(val) {
      console.log(val)
      this[`${val.fn}`](...val.data)
    },

    // 分配
    handleAssigned(val) {
      this.$refs.userDialog.open()
      this.$set(this.updateOpsOrderProblemQuery, 'id', val.id)
    },
    async getSelectUser(val) {
      if (val) {
        this.$set(this.updateOpsOrderProblemQuery, 'lockUserId', val)
        this.$set(this.updateOpsOrderProblemQuery, 'statue', 1)
        this.$set(this.updateOpsOrderProblemQuery, 'processState', 1)
        console.log(val)
        await this.updateOpsOrderProblem()
        // 指派后要插入记录
        // updateOpsOrderProblemQuery.id 事项ID，val指派ID
        await this.insertOpsOrderProblemLog(2, this.updateOpsOrderProblemQuery.id, val)
        await this.findOmRequest()
      }
    },

    // 编辑事项
    async updateOpsOrderProblem() {
      let { code } = await request({
        url: api.opm.updateOpsOrderProblem,
        data: this.updateOpsOrderProblemQuery
      })
      if (code !== 1) return

      return code
    },
    async findOpsOrderProblemService(query) {
      const { code, data } = await this.$request({
        url: this.api.opm.findOpsOrderProblemService,
        data: query
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 0px !important;
}
</style>
