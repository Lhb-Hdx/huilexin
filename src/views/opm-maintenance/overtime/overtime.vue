<template>
  <div class="app-container">
    <div class="top-tab-group flexBox space-between align-item-center">
      <div class="tabs">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane v-for="item in tabs" :key="item.name" :label="item.label" :name="item.name" />
        </el-tabs>
      </div>
      <div class="btns">
        <el-button v-permission="['Create']" class="filter-item" type="primary" @click="createOvertime">加班登记</el-button>
      </div>
    </div>
    <div v-permission="['Search']" class="filter-container">
      <template v-if="activeName !== 'myAudit'">
        <el-date-picker
          v-model="SEData"
          class="filter-item"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
        <el-select v-if="activeName === 'allOvertime'" v-model="findHrUserInfoQuery.organizationCatId" v-loadmore="loadMoreDepartment" placeholder="部门" clearable class="filter-item" style="width: 200px" @change="changeDepartment">
          <el-option v-for="item in sysRoleList" :key="item.hyOrgId" :label="item.hyOrgName" :value="item.hyOrgId" />
        </el-select>
        <el-select v-if="activeName === 'allOvertime'" v-model="listQuery.userId" v-loadmore="loadMoreUser" placeholder="用户" clearable class="filter-item" style="width: 200px">
          <el-option v-for="item in sysUserList" :key="item.userId" :label="item.realName" :value="item.userId" />
        </el-select>
        <el-select v-model="listQuery.statue" placeholder="审核状态" clearable class="filter-item" style="width: 200px">
          <el-option v-for="item in audioStatus" :key="item.statue" :label="item.value" :value="item.statue" />
        </el-select>
      </template>
      <el-select v-if="activeName === 'myAudit'" v-model="audioLogTypeValue" placeholder="审批状态" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in audioLogType" :key="item.key" :label="item.value" :value="item.key" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table :data="overTimeList">
        <el-table-column label="No" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="姓名/手机号" show-overflow-tooltip>
          <template slot-scope="{row}">{{ row.realName }} {{ row.tel }}</template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="职位" prop="positionName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="所属部门" prop="orgName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="加班时间" show-overflow-tooltip width="300">
          <template slot-scope="{row}">{{ row.otStartTime }} - {{ row.otEndTime }}</template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="加班类型" show-overflow-tooltip>
          <template slot-scope="{row}">{{ setOTType(row.otType) }}</template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" label="加班时长(小时)" prop="totalHour" width="120" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.totalHour ? +row.totalHour.toFixed(2) : 0 }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="right" label="累计时长(小时)" width="120" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.otTotalHour ? +row.otTotalHour.toFixed(2) : 0 }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="left" label="审核状态" show-overflow-tooltip>
          <template slot-scope="{row}">
            <div :class="setAuditStatusColorClass(row.statue)">{{ setAuditStatus(row.statue) }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" align="left" label="状态" show-overflow-tooltip>
          <template slot-scope="{row}">
            <div :class="setStatusColorClass(row.approveStatue)">{{ setStatus(row.approveStatue) }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" align="left" label="操作" width="300" show-overflow-tooltip>
          <template slot-scope="{row}">
            <!-- 不是已审核 不是在审核中 登录用户是创建申请本人 -->
            <el-button v-if="row.isEdit && +row.userId === +currentUser.userId" v-permission="['Edit']" type="primary" size="mini" @click="handlerEdit(row)">编辑</el-button>
            <!-- 不是已审核 不是在审核中 登录用户是创建申请本人 -->
            <el-button v-if="row.isEdit && +row.userId === +currentUser.userId" v-permission="['SubmitApply']" type="primary" size="mini" @click="handlerSubmitAudit(row)">提交</el-button>
            <!-- 不是已审核 在审核中 登录用户是创建申请本人 -->
            <el-button v-if="row.statue === 2 && +row.userId === +currentUser.userId" v-permission="['WithdrawApply']" type="primary" size="mini" @click="withdrawApply(row)">撤回</el-button>
            <!-- 不是已审核 不是在审核中 登录用户是创建申请本人 -->
            <el-button v-if="row.isInAudit && row.approveStatue !== 1 && isCurrentLoginUserAudit" type="primary" size="mini" @click="handlerAudit(row)">审批</el-button>
            <!-- 不是已审核 不是在审核中 登录用户是创建申请本人 -->
            <el-button v-if="row.isEdit && +row.userId === +currentUser.userId" v-permission="['Delete']" type="danger" size="mini" @click="handlerDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="overTimeTotal > 0" :auto-scroll="false" :total="overTimeTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="paginationList" />
    </div>
    <OvertimeDialog ref="overtimeDialog" />
    <AuditDialog ref="audioDialog" />
  </div>
</template>

<script>

import { getUserInfo, getUserSession } from '@/utils/auth'
import OvertimeDialog from '@/views/opm-maintenance/overtime/components/overtime-dialog'
import AuditDialog from '@/views/opm-maintenance/overtime/components/audit-dialog'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'Overtime',
  components: {
    OvertimeDialog, AuditDialog, Pagination, ListControl
  },
  data() {
    return {
      tabs: [
        { label: '所有加班', name: 'allOvertime', getDataFn: 'loadDutyOverTimeList', query: { userId: '', otType: '', otStartTime: '', otEndTime: '', statue: '' } },
        { label: '我的加班', name: 'myOvertime', getDataFn: 'loadDutyOverTimeList', query: { userId: '', otType: '', otStartTime: '', otEndTime: '', statue: '' } },
        { label: '我的审核', name: 'myAudit', getDataFn: 'findApprove', query: { approveStatue: '' } }
      ],
      activeName: 'all',
      SEData: '',
      sysUserList: [],
      sysRoleList: [],
      selectDepartment: '',
      findHyitOrgQuery: {
        page: 0,
        limit: 10
      },
      findSysUserQuery: {
        page: 1,
        limit: 10
      },
      findHrUserInfoQuery: {
        limit: -1,
        organizationCatId: ''
      },
      // 加班列表查询
      findHyitDutyOverTimeQuery: {
        page: 1,
        limit: 10,
        userId: '',
        otType: '',
        otStartTime: '',
        otEndTime: '',
        statue: ''
      },
      overTimeList: [],
      overTimeTotal: 0,
      otTypes: this.$paramsModel.opm.get('otType'),
      currentUser: {},
      // 我的审核列表查询
      findApproveQuery: {
        page: 1,
        limit: 10
      },
      audioStatus: this.$paramsModel.common.get('audioStatus'),
      listQuery: {},
      dataTaskModel: [],
      approveStatue: this.$paramsModel.common.filterApproveStatue('select'),
      audioLogType: [
        { key: 1, value: '未审核' },
        { key: 2, value: '已审核' }
      ],
      audioLogTypeValue: 1,
      // 显示控制数据 start
      checkList: ['姓名/手机号', '职位', '所属部门', '加班时间', '加班类型', '加班时长(小时)', '累计时长(小时)', '审核状态', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setOTType() {
      return function (value) {
        const getItem = this.otTypes.filter(ele => +ele.value === +value)
        return getItem.length > 0 ? getItem[0].label : ''
      }
    },
    setStatus() {
      return function(approveStatue) {
        if (!approveStatue) return ''
        return this.$defineData.processStatus(approveStatue)
      }
    },
    setStatusColorClass() {
      return function(approveStatue) {
        if (!approveStatue) return ''
        return this.$defineData.processStatus(approveStatue, 'color')
      }
    },
    setAuditStatus() {
      return function(statue) {
        const getItem = this.audioStatus.findIndex((item) => Number(item.statue) === Number(statue))
        return getItem !== -1 ? this.audioStatus[getItem].value : ''
      }
    },
    setAuditStatusColorClass() {
      return function(statue) {
        const getItem = this.audioStatus.findIndex((item) => Number(item.statue) === Number(statue))
        return getItem !== -1 ? this.audioStatus[getItem].color : ''
      }
    },
    isCurrentLoginUserAudit() {
      const idx = this.dataTaskModel.findIndex(item => +item.userId === +this.currentUser.userId)
      return idx !== -1
    }
  },
  beforeDestroy() {
    this.$EventBus.$off('reloadOvertimeList')
  },
  mounted() {
    const getYearFirstLastDay = this.$tool.getYearFirstLastDay()
    this.SEData = [
      this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', getYearFirstLastDay.firstDay),
      this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', getYearFirstLastDay.lastDay)
    ]

    this.$EventBus.$on('reloadOvertimeList', () => {
      this.$set(this.findHyitDutyOverTimeQuery, 'page', 1)
      this.$set(this.findHyitDutyOverTimeQuery, 'otStartTime', '')
      this.$set(this.findHyitDutyOverTimeQuery, 'otEndTime', '')
      this.$set(this.findHyitDutyOverTimeQuery, 'userId', '')
      this.loadDutyOverTimeList()
    })

    this.currentUser = this.localStorageOperation('get', 'userInfo')

    this.loadMoreDepartment()
    this.loadMoreUser()
    this.setTab()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 选择tab
    handleClick() {
      this.getDataByTab()
    },
    // 设置tab
    setTab() {
      if (this.$auth.getVuexStoragePermission('AllOvertime') === -1) {
        const idx = this.tabs.findIndex(item => item.name === 'allOvertime')
        if (idx !== -1) this.tabs.splice(idx, 1)
      }
      if (this.$auth.getVuexStoragePermission('MyOvertime') === -1) {
        const idx = this.tabs.findIndex(item => item.name === 'myOvertime')
        if (idx !== -1) this.tabs.splice(idx, 1)
      }
      if (this.$auth.getVuexStoragePermission('MyAudit') === -1) {
        const idx = this.tabs.findIndex(item => item.name === 'myAudit')
        if (idx !== -1) this.tabs.splice(idx, 1)
      }

      if (this.tabs.length > 0) this.activeName = this.tabs[0].name
      this.getDataByTab()
    },
    // 根据tab设置列表数据查询
    getDataByTab() {
      const activeIdx = this.tabs.findIndex(item => item.name === this.activeName)
      if (activeIdx !== -1) {
        this.listQuery = { page: 1, limit: 10, ...this.tabs[activeIdx].query }
        this.$set(this.listQuery, 'page', 1)
        if (this.activeName === 'myOvertime') this.$set(this.listQuery, 'userId', this.currentUser.userId)
        this[`${this.tabs[activeIdx].getDataFn}`]()
      }
    },
    // 搜索
    handleFilter() {
      const activeIdx = this.tabs.findIndex(item => item.name === this.activeName)
      this[`${this.tabs[activeIdx].getDataFn}`]()
    },
    // 加载更多部门
    async loadMoreDepartment() {
      this.$set(this.findHyitOrgQuery, 'page', ++this.findHyitOrgQuery.page)
      const findHyitOrg = await this.findHyitOrg(this.findHyitOrgQuery)
      if (findHyitOrg.code === 1 && findHyitOrg.data) {
        this.sysRoleList = [...this.sysRoleList, ...findHyitOrg.data]
      }
    },
    // 加载更多用户
    async loadMoreUser() {
      this.$set(this.findSysUserQuery, 'page', ++this.findSysUserQuery.page)
      const findSysUser = await this.commonRequestFn.findSysUser({...this.findSysUserQuery, companyId: getUserInfo().companyId})
      if (findSysUser) {
        this.sysUserList = [...this.sysUserList, ...findSysUser]
      }
    },
    // 获取部门
    async findHyitOrg(query) {
      return await this.$request({
        url: this.api.org.findHyitOrg,
        data: query
      })
    },
    // 选择部门
    async changeDepartment() {
      this.$set(this.findSysUserQuery, 'page', 0)
      this.sysUserList = []
      if (this.findHrUserInfoQuery.organizationCatId === '') {
        this.$set(this.findSysUserQuery, 'ids', '')
      } else {
        const findHrUserInfo = await this.commonRequestFn.findHrUserInfo({...this.findHrUserInfoQuery, companyId: getUserInfo().companyId})
        if (findHrUserInfo) {
          const ids = []
          findHrUserInfo.forEach(item => ids.push(item.userId))
          this.$set(this.findSysUserQuery, 'ids', ids.toString())
          await this.loadMoreUser()
        }
      }
    },
    // 加载加班列表
    async loadDutyOverTimeList() {
      const query = { ...this.listQuery }
      query.otStartTime = this.SEData[0]
      query.otEndTime = this.SEData[1]
      const list = await this.findHyitDutyOverTime(query)
      if (list) {
        this.overTimeTotal = +list.count
        this.overTimeList = list.data
      }
    },
    // 查询加班
    async findHyitDutyOverTime(query) {
      const findHyitDutyOverTime = await this.$request({ url: this.api.opm.findHyitDutyOverTime, data: query })
      if (findHyitDutyOverTime.code !== 1) return
      const ids = []
      const userIds = []
      findHyitDutyOverTime.data.forEach(item => {
        userIds.push(item.userId)
        ids.push(item.id)
      })
      // 查询审核
      let approveLog = []
      const findNewOaApproveLog = await this.findNewOaApproveLog(ids.toString(), this.$defineData.projectActivityProcessDefine('opmOvertime', 'key', 'id'))
      if (findNewOaApproveLog) approveLog = findNewOaApproveLog
      // 查询用户信息
      let user = []
      const findSysUser = await this.$request({ url: this.api.sys.findSysUser, data: { ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, companyId: this.$auth.getUserSession().companyId } })
      if (findSysUser.code === 1 && findSysUser.data) user = findSysUser.data

      // 查询用户人员信息
      let hrUser = []
      const findHrUserInfo = await this.$request({ url: this.api.hr.findHrUserInfo, data: { ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, companyId: this.$auth.getUserSession().companyId } })
      if (findHrUserInfo.code === 1 && findHrUserInfo.data) hrUser = findHrUserInfo.data
      // 查询用户加班统计
      // let overTimeSummary = []
      // const findHyitDutyOverTimeSummary = await this.$request({ url: this.api.opm.findHyitDutyOverTimeSummary, data: { userIds: this.$tool.uniqueArray(userIds).toString(), limit: -1, otStartTime: query.otStartTime, otEndTime: query.otEndTime } })
      // if (findHyitDutyOverTimeSummary.code === 1 && findHyitDutyOverTimeSummary.data) overTimeSummary = findHyitDutyOverTimeSummary.data
      const orgCatIds = []
      const positionCatIds = []
      hrUser.forEach(item => {
        if (item.organizationCatId) orgCatIds.push(item.organizationCatId)
        if (item.positionCatId) positionCatIds.push(item.positionCatId)
      })
      // 查询用户部门
      let userOrg = []
      if (orgCatIds.length > 0) {
        const findSysCat = await this.$request({ url: this.api.org.findHyitOrg, data: { ids: this.$tool.uniqueArray(orgCatIds).toString(), limit: -1 } })
        if (findSysCat.code === 1 && findSysCat.data) userOrg = findSysCat.data
      }
      // 查询用户职位
      let userPosition = []
      if (positionCatIds.length > 0) {
        const findSysCat = await this.$request({ url: this.api.sys.findSysCat, data: { ids: this.$tool.uniqueArray(positionCatIds).toString(), limit: -1, systemName: 'userDefine', classify: 'userDefine_职位' } })
        if (findSysCat.code === 1 && findSysCat.data) userPosition = findSysCat.data
      }
      const instanceIds = []
      // 数据组装
      findHyitDutyOverTime.data.forEach(item => {
        const getUserIndex = user.findIndex(items => +items.userId === +item.userId)
        if (getUserIndex !== -1) item.realName = user[getUserIndex].realName
        const getHrUserIndex = hrUser.findIndex(items => +items.userId === +item.userId)
        // const getOverTimeSummaryIndex = overTimeSummary.findIndex(items => +items.userId === +item.userId)
        if (getHrUserIndex !== -1) {
          const getOrgIndex = userOrg.findIndex(items => +items.hyOrgId === +hrUser[getHrUserIndex].organizationCatId)
          const getPositionIndex = userPosition.findIndex(items => +items.catId === +hrUser[getHrUserIndex].positionCatId)
          if (getOrgIndex !== -1) item.orgName = userOrg[getOrgIndex].hyOrgName
          if (getPositionIndex !== -1) item.positionName = userPosition[getPositionIndex].catName
          // if (getOverTimeSummaryIndex !== -1) {
          //   item.totalHourSummary = overTimeSummary[getOverTimeSummaryIndex].totalHour
          // } else {
          //   item.totalHourSummary = 0
          // }
        }
        const getApproveLogIndex = approveLog.findIndex(items => +items.approveId === +item.id)

        if (item.statue === 1 || item.statue === null) {
          item.isEdit = true
        } else {
          if (getApproveLogIndex !== -1) {
            item.isEdit = approveLog[getApproveLogIndex].approveStatue === 4 || approveLog[getApproveLogIndex].approveStatue === 6 || approveLog[getApproveLogIndex].approveStatue === 7
          }
        }

        if (getApproveLogIndex !== -1) {
          item.approveStatue = approveLog[getApproveLogIndex].approveStatue
          item.taskId = approveLog[getApproveLogIndex].taskId
          item.instanceId = approveLog[getApproveLogIndex].instanceId
        }

        if (item.statue === 2) {
          if (getApproveLogIndex !== -1) {
            // 不在审核中: 通过、不通过 新建 驳回 编辑
            if (approveLog[getApproveLogIndex].approveStatue !== 3 && approveLog[getApproveLogIndex].approveStatue !== 5) {
              item.isInAudit = false
            } else {
              item.isInAudit = true
            }
          }
        } else {
          item.isInAudit = false
        }

        if (getApproveLogIndex !== -1) {
          if (item.isInAudit && item.approveStatue !== 1) instanceIds.push(approveLog[getApproveLogIndex].instanceId)
        }
        if (item.statue === 3) item.isAuditOver = true
      })
      // 查询审核人
      if (instanceIds.length > 0) {
        const findTask = await this.$request({ url: this.api.opm.findTask, data: { instanceIds: this.$tool.uniqueArray(instanceIds).toString(), limit: -1 } })
        if (findTask.code === 1 && findTask.model) this.dataTaskModel = JSON.parse(findTask.model)
      }

      return findHyitDutyOverTime
    },
    // 点击创建
    createOvertime() {
      this.$refs.overtimeDialog.open()
    },
    // 点击编辑
    handlerEdit(row) {
      this.$refs.overtimeDialog.open(row)
    },
    // 点击删除
    handlerDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({ url: this.api.opm.deleteHyitDutyOverTime, data: { id: row.id } }).then(async res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            const applyResult = await this.findNewOaApproveLog(row.id, this.$defineData.projectActivityProcessDefine('opmOvertime', 'key', 'id'))
            if (applyResult && applyResult.length > 0) {
              await this.deleteInstance(applyResult[0].instanceId)
              this.loadDutyOverTimeList()
            } else {
              this.loadDutyOverTimeList()
            }
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    // 提交审核
    handlerSubmitAudit(row) {
      this.$confirm(`确认提交审批该加班申请吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const startActivity = await this.startActivity(row, this.$defineData.projectActivityProcessDefine('opmOvertime', 'key', 'id'))
          if (startActivity && startActivity === 1) {
            const applyResult = await this.findApply(row.userId, 'opmOvertime')

            if (applyResult && applyResult.length > 0) {
              const idx = applyResult.findIndex((item) => Number(item.approveId) === Number(row.id))
              if (idx !== -1) {
                this.completeActivity(applyResult[idx].taskId, 'loadDutyOverTimeList')
              }
            }
            this.getDataByTab()
          }
        })
    },
    // 撤回
    withdrawApply(row) {
      this.$confirm(`确认撤回该加班申请吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          await this.deleteInstance(row.instanceId)
          // await this.startActivity(row, this.$defineData.projectActivityProcessDefine('opmOvertime', 'key', 'id'))
          // await this.loadDutyOverTimeList()
          this.getDataByTab()
        })
    },
    // 审核列表
    async findApprove() {
      const api = this.audioLogTypeValue === 1 ? this.api.approve.findApprove : this.api.approveLog.findNewOaApproveLog
      let query = this.audioLogTypeValue === 1 ? {
        userId: getUserSession().userId
      } : {
        approveUserId: getUserSession().userId
      }
      const findApprove = await this.$request({
        url: api,
        data: { ...this.listQuery, approveType: this.$defineData.projectActivityProcessDefine('opmOvertime', 'key', 'id'), ...query }})
      const approveIds = []
      if (findApprove.code === 1 && findApprove.data) {
        this.overTimeTotal = +findApprove.count
        findApprove.data.forEach(item => { approveIds.push(item.approveId) })
      } else {
        this.overTimeList = []
      }
      const findHyitDutyOverTime = await this.findHyitDutyOverTime({ ids: approveIds.toString(), limit: -1 })
      const overTimeList = []
      findApprove.data.forEach(item => {
        const getHyitDutyOverTimeIndex = findHyitDutyOverTime.data.findIndex(items => +items.id === +item.approveId)
        if (getHyitDutyOverTimeIndex !== -1) {
          console.log(findHyitDutyOverTime.data[getHyitDutyOverTimeIndex])
          overTimeList.push({
            ...findHyitDutyOverTime.data[getHyitDutyOverTimeIndex],
            approveId: item.approveId,
            approveStatue: item.approveStatue,
            taskId: item.taskId,
            instanceId: item.instanceId,
            approveTime: item.approveTime
          })
        } else {
          overTimeList.push(item)
        }
      })
      this.overTimeList = overTimeList
    },
    // 打开审核
    handlerAudit(row) {
      this.$refs.audioDialog.open(row)
    },
    // 分页切换
    paginationList() {
      const activeIdx = this.tabs.findIndex(item => item.name === this.activeName)
      if (activeIdx !== -1) {
        this[`${this.tabs[activeIdx].getDataFn}`]()
      }
    }
  }
}
</script>
