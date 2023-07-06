<template>
  <div class="matter-table">
    <!-- 我的流程|我的审批 -->
    <div v-if="itemType === 'my-accraditation'" class="todoApprove">
      <el-table :data="getTableDataProp" fit highlight-current-row style="width: 100%">
        <!-- <el-table-column type="expand">
          <template slot-scope="props">
            <el-table :data="props.row.children" style="width: 100%">
              <el-table-column label="状态" width="" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  {{ setTaskStatue(row.statue) }}
                </template>
              </el-table-column>
              <el-table-column label="作业名称" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  {{ row.name }}
                </template>
              </el-table-column>
              <el-table-column label="运维工程师" show-overflow-tooltip>
                <template slot-scope="{ row }"> {{ row.doTaskUserRealName }} {{ row.doTaskUserTel }} </template>
              </el-table-column>
              <el-table-column label="指定完成时间" width="200" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  {{ row.workStime }} 至
                  {{ row.workEtime }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="left" width="250">
                <template slot-scope="{ row }">
                  <el-button size="mini" type="primary" @click="handlerTask(row)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column> -->
        <el-table-column prop="problemNo" label="事项编号" width="auto" align="left" min-width="9%" show-overflow-tooltip />
        <el-table-column prop="name" show-overflow-tooltip width="auto" align="left" min-width="19%" label="事项名称">
          <template slot-scope="{ row }">
            <span style="color: #013e9a">
              {{ row.name }}
            </span>
            <div>{{ row.problemTypeName }} / {{ row.serviceTypeName }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="userId" label="请求部门及提交人" width="auto" min-width="15%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div>{{ row.createUserRealName }} {{ row.createUserTel }}</div>
            <div>
              {{ row.createUserOrgName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="auto" min-width="10%" show-overflow-tooltip />
        <!-- <el-table-column prop="workNumber" label="计划数" width="auto" min-width="10%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div>
              <el-button type="primary" round size="mini">
                {{ row.children ? row.children.length : 0 }}
              </el-button>
            </div>
          </template>
        </el-table-column> -->
        <el-table-column prop="sumbitMan" label="流程发起人" width="auto" min-width="10%" show-overflow-tooltip>
          <template slot-scope="{ row }"> {{ row.lockUserRealName }} {{ row.lockUserTel }} </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="auto" min-width="7%">
          <template slot-scope="{ row }">
            <el-dropdown @command="handlerActtion">
              <el-button type="primary" size="mini">
                更多操作
                <i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <!-- lockStatue==1为锁住状态，不等于1为未锁状态 -->
                <el-dropdown-item v-if="itemType === 'my-accraditation'" :command="{ fn: 'handlePush', data: [row] }">查看</el-dropdown-item>
                <el-dropdown-item v-if="itemType === 'my-accraditation' && tabsItemCode === 'approve'" :command="{ fn: 'handlePass', data: [1, row, 1] }">通过</el-dropdown-item>
                <!-- <el-dropdown-item v-if="itemType === 'my-accraditation' && tabsItemCode === 'approve' && row.isApprove" :command="{ fn: 'handlePass', data: [1, row, 2] }">不通过</el-dropdown-item> -->
                <el-dropdown-item v-if="itemType === 'my-accraditation' && tabsItemCode === 'approve'" :command="{ fn: 'handleReject', data: [1, row] }">驳回</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="tableCount > 0" :auto-scroll="false" :total.sync="tableCount" :page="listQuery.page" :limit.sync="listQuery.limit" @pagination="getPagingTableData" />
    </div>
    <!-- 我的流程|我的申请 -->
    <div v-else class="else">
      <el-table :row-class-name="setRowExpandStyle()" :data="getTableDataProp" fit highlight-current-row style="width: 100%" @expand-change="openGroupChildren">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table :data="props.row.children" style="width: 100%">
              <el-table-column label="状态" align="left" width="auto" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  {{ setTaskStatue(row.statue) }}
                </template>
              </el-table-column>
              <el-table-column label="作业名称" align="left" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  {{ row.name }}
                </template>
              </el-table-column>
              <el-table-column label="运维工程师" align="left" show-overflow-tooltip>
                <template slot-scope="{ row }"> {{ row.doTaskUserRealName }} {{ row.doTaskUserTel }} </template>
              </el-table-column>
              <el-table-column label="指定完成时间" align="right" width="200" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  {{ row.workStime }} 至
                  {{ row.workEtime }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="left" width="250">
                <template slot-scope="{ row }">
                  <el-button size="mini" type="primary" @click="handlerTask(row)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="problemNo" label="事项编号" width="auto" align="left" min-width="9%" show-overflow-tooltip />
        <el-table-column prop="name" show-overflow-tooltip width="auto" align="left" min-width="19%" label="事项名称">
          <template slot-scope="{ row }">
            <span style="color: #013e9a" class="pointer" @click="handlePush(row)">
              {{ row.name }}
            </span>
            <div>{{ row.problemTypeName }} / {{ row.serviceTypeName }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="userId" label="请求部门及提交人" align="left" width="auto" min-width="15%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div>{{ row.createUserRealName }} {{ row.createUserTel }}</div>
            <div>
              {{ row.createUserOrgName }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="提交时间" align="right" width="auto" min-width="10%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div>
              {{ getCreateTime(row.updateTime||row.createTime) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="!(itemType === 'todo-plan')" prop="solveEtime" align="right" label="期待最后解决时间" width="auto" min-width="10%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div>
              {{ getSolveEtimeTime(row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="itemType === 'todo-plan' && tabsItemStatus !== 5" align="right" prop="workNumber" label="计划数" width="auto" min-width="10%" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div>
              <el-button type="primary" round size="mini">
                {{ row.children ? row.children.length : 0 }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="响应时间" show-overflow-tooltip align="right" width="auto" min-width="10%" prop="responseTime">
          <template slot-scope="{ row }">
            {{ !row.responseTime ? 0 : $tool.formatMsgTime(new Date(row.responseTime)) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" align="left" width="auto" min-width="7%">
          <template slot-scope="{ row }">
            <el-dropdown @command="handlerActtion">
              <el-button type="primary" size="mini">
                更多操作
                <i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{ fn: 'handlePush', data: [row] }">查看</el-dropdown-item>
                <!-- 我的流程|申请 && 审批中 && 当前用户为数据添加用户 -->
                <el-dropdown-item v-if="itemType === 'my-apply' && tabsItemCode ==='approving' && +row.userId === +loginUser.userId " :command="{ fn: 'handleRollBack', data: [row] }">撤回</el-dropdown-item>
                <!-- 我的流程|申请 && 撤回 -->
                <el-dropdown-item v-if="itemType === 'my-apply' && tabsItemCode ==='rollBack' " :command="{ fn: 'handlePushEdit', data: [row] }">编辑</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="tableCount > 0" :auto-scroll="false" :total.sync="tableCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getPagingTableData" />
    </div>
    <plan-select-user-list ref="userDialog" @selectUser="getSelectUser" />
    <TaskDialog ref="taskDialog" :task-id="selectTaskId" @reload="realoadTask" />
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import PlanSelectUserList from '@/views/opm-maintenance/components/selectUserList'
import MatterMixins from '@/views/opm-maintenance/mixins/matter-mixins'
import { mapState } from 'vuex'
import TaskDialog from '@/views/opm-maintenance/task/components/taskDialog'
import workTaskType from '@/params-model/opm/function'
import opmFunction from '@/params-model/opm/function'
const {messageSendToPlatform} = opmFunction
export default {
  components: {
    Pagination,
    PlanSelectUserList,
    TaskDialog
  },
  mixins: [MatterMixins],
  props: {
    itemType: {
      type: String,
      default: ''
    },
    tableData: {
      type: Array,
      default() {
        return []
      }
    },
    tableCount: {
      type: Number,
      default() {
        return 0
      }
    }
  },
  data() {
    return {
      activeName: 'second',
      listCount: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      updateOpsOrderProblemQuery: {
        lockStatue: 1,
        statue: 1,
        processState: 1,
        id: 0
      },
      OrgList: [], // 工作部门
      hrUserGroup: [], // 全部运维小组
      opmProblemServiceList: [], // 全部问题类型服务类型
      lockUsers: '',
      audioStatus: [
        { statue: 0, value: '待受理', color: 'danger', colorCode: '#F56C6C' },
        { statue: 1, value: '已确认', color: 'danger', colorCode: '#F56C6C' },
        { statue: 2, value: '审批中', color: 'danger', colorCode: '#F56C6C' },
        { statue: 3, value: '已审批', color: 'success', colorCode: '#67C23A' },
        { statue: 4, value: '驳回', color: 'danger', colorCode: '#F56C6C' },
        { statue: 5, value: '待审核', color: 'success', colorCode: '#67C23A' },
        { statue: 7, value: '关闭', color: 'success', colorCode: '#67C23A' },
        { statue: 8, value: '修改', color: 'success', colorCode: '#67C23A' }
      ],
      taskStatue: workTaskType.get('workTaskType'),
      getTableDataProp: [],
      loginUser: {},
      selectTaskId: ''
    }
  },
  computed: {
    ...mapState('opm', ['tabsItemCode', 'tabsItemStatus']),
    setRowExpandStyle() {
      return function () {
        if (this.itemType === 'todo-plan' && this.tabsItemStatus === 5) {
          return 'row-expand-cover'
        } else if (this.itemType !== 'todo-plan') {
          return 'row-expand-cover'
        }
      }
    },
    getCreateTime() {
      return function (createTime) {
        let nowTimestamp = new Date().getTime() / 1000

        let createTimeStamp = this.$tool.getTimeF(createTime)
        let result = nowTimestamp - createTimeStamp

        // 1分钟60秒。10分钟600秒、1小时 3600秒 3小时3600*3
        if (result / 60 <= 1) {
          return '刚刚'
        } else if (result / 60 > 1 && result / 3600 <= 1) {
          return (result / 60).toFixed() + '分钟前'
        } else if (result / 600 > 1 && result / (3600 * 4) <= 1) {
          return (result / 3600).toFixed() + '小时前'
        } else {
          return createTime
        }
      }
    },
    setTaskStatue() {
      return function (status) {
        const idx = this.taskStatue.findIndex(item => item.statue === status)
        if (idx !== -1) {
          return this.taskStatue[idx].label
        } else {
          return '未处理'
        }
      }
    },
    getSolveEtimeTime() {
      return function (row) {
        let createTimeStamp = this.$tool.getTimeF(row.createTime)
        let solveEtimeTimeStamp = this.$tool.getTimeF(row.solveEtime)
        let result = solveEtimeTimeStamp - createTimeStamp
        if (result / 3600 <= 1) {
          return (result / 60).toFixed(0) + '分钟'
        } else if (result / 3600 > 1 && result / (3600 * 24) <= 1) {
          let left = result % 3600

          return (result / 3600).toFixed(0) + '小时' + (left / 60).toFixed(0) + '分'
        } else {
          return row.solveEtime
        }
      }
    }
  },
  watch: {
    tableData: {
      handler(newVal, oldVal) {
        if (this.tableData.length > 0) {
          this.setTableAboutData(newVal, oldVal)
        } else {
          this.getTableDataProp = []
        }
      },
      deep: true
    }
  },
  mounted() {
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    console.log('列表tableData@#', this.tableData)
    console.log('操作函数@#', this.itemType)
    console.log('我的流程|tabsItemCode@', this.tabsItemCode)
  },
  methods: {
    getPagingTableData(e) {
      this.listQuery = {...this.listQuery, ...e}
      this.$emit('emitGetPagingTableData', this.listQuery)
    },
    // 查看任务完成情况
    checkTaskDetail(props) {
      this.$router.push({ name: 'matterDetail', query: { id: props.row.id, alarmId: props.row.alarmId, groupId: props.row.groupId } })
    },
    // 设置表格附带数据
    async setTableAboutData(newVal, oldVal) {
      const data = this.tableData
      const orgIds = []
      const userIds = []
      const groupIds = []
      const serviceTypeIds = []
      const orderProblemIds = []

      data.forEach(item => {
        orderProblemIds.push(item.id)
        if (item.lockUserId) userIds.push(item.lockUserId)
        if (item.serviceType) serviceTypeIds.push(item.serviceType)
        if (item.serviceType) serviceTypeIds.push(item.problemType)
        if (item.userId) userIds.push(item.userId)
      })

      // 查询事项提交人
      let user = []
      let hr = []
      if (userIds.length > 0) {
        const findSysUser = await this.findSysUser({
          ids: this.$tool.uniqueArray(userIds).toString(),
          companyId: this.$auth.getUserSession().companyId,
          limit: -1
        })
        if (findSysUser && findSysUser.data && findSysUser.data.length > 0) {
          user = findSysUser.data
          const findHrUserInfo = await this.findHrUserInfo({
            ids: this.$tool.uniqueArray(userIds).toString(),
            companyId: this.$auth.getUserSession().companyId,
            limit: -1
          })
          if (findHrUserInfo && findHrUserInfo.data && findHrUserInfo.data.length > 0) {
            hr = findHrUserInfo.data
            findHrUserInfo.data.forEach(item => {
              if (item.organizationCatId) orgIds.push(item.organizationCatId)
            })
          }
        }
      }

      // 查询事项请求部门
      let org = []
      if (orgIds.length > 0) {
        const findHyitOrg = this.findHyitOrg({
          ids: this.$tool.uniqueArray(orgIds).toString(),
          limit: -1
        })
        if (findHyitOrg && findHyitOrg.data && findHyitOrg.data.length > 0) org = findHyitOrg.data
      }

      // 查询事项服务类型
      let serviceType = []
      if (serviceTypeIds.length > 0) {
        const findOpsOrderProblemService = await this.findOpsOrderProblemService({ ids: this.$tool.uniqueArray(serviceTypeIds).toString(), limit: -1 })
        if (findOpsOrderProblemService && findOpsOrderProblemService.data && findOpsOrderProblemService.data.length > 0) serviceType = findOpsOrderProblemService.data
      }

      // 查询事项运维小组
      let opmGroup = []

      // 查询事项关联分组
      const findOpsOrderProblemGroupMap = await this.findOpsOrderProblemGroupMap({ problemIds: orderProblemIds, limit: -1 })
      if (findOpsOrderProblemGroupMap && findOpsOrderProblemGroupMap.data && findOpsOrderProblemGroupMap.data.length > 0) {
        const findHrUserGroup = await this.findHrUserGroup({ ids: this.$tool.uniqueArray(groupIds).toString(), limie: -1 })
        if (findHrUserGroup && findHrUserGroup.data && findHrUserGroup.data.length > 0) opmGroup = findHrUserGroup.data
      }

      data.forEach(item => {
        // 设置服务类型
        const getProblemTypeNameIndex = serviceType.findIndex(items => +items.serviceId === +item.problemType)
        if (getProblemTypeNameIndex !== -1) item.problemTypeName = serviceType[getProblemTypeNameIndex].serviceName

        const getServiceTypeNameIndex = serviceType.findIndex(items => +items.serviceId === +item.serviceType)
        if (getServiceTypeNameIndex !== -1) {
          item.serviceTypeName = serviceType[getServiceTypeNameIndex].serviceName
        }

        // 设置运维小组
        if (findOpsOrderProblemGroupMap && findOpsOrderProblemGroupMap.data && findOpsOrderProblemGroupMap.data.length > 0) {
          const findOpsOrderProblemGroupMapFilter = findOpsOrderProblemGroupMap.data.filter(el => +el.problemId === +item.id)
          if (findOpsOrderProblemGroupMapFilter.length > 0) {
            const groupName = []
            const groupId = []
            let opmGroupFilter = []
            findOpsOrderProblemGroupMapFilter.forEach(items => {
              opmGroupFilter = opmGroup.filter(el => +el.groupId === +items.groupId)
            })
            opmGroupFilter.forEach(items => {
              groupName.push(items.groupName)
              groupId.push(items.groupId)
            })
            item.groupName = groupName.toString()
            item.groupId = groupId[0]
          }
        }

        // 设置提交人
        const getUserIndex = user.findIndex(items => +items.userId === +item.userId)
        if (getUserIndex !== -1) {
          item.createUserRealName = user[getUserIndex].realName
          item.createUserTel = user[getUserIndex].tel
        }

        // 设置请求部门
        const getHrIndex = hr.findIndex(items => +items.userId === +item.userId)
        if (getHrIndex !== -1) {
          const getOrgNameIndex = org.findIndex(items => +items.hyOrgId === +item.organizationCatId)
          if (getOrgNameIndex !== -1) item.createUserOrgName = org[getOrgNameIndex].hyOrgName
        }

        // 设置流程发起人
        const getLockUserIndex = user.findIndex(items => +items.userId === +item.lockUserId)
        if (getLockUserIndex !== -1) {
          item.lockUserRealName = user[getLockUserIndex].realName
          item.lockUserTel = user[getLockUserIndex].tel
        }
      })

      this.getTableDataProp = data
    },
    // 展开子表格
    async openGroupChildren(val, expandedRows) {},
    // 指派选中后事件处理函数
    async getSelectUser(val) {
      // return userDialog
      if (val) {
        this.$set(this.updateOpsOrderProblemQuery, 'lockUserId', val)
        this.$set(this.updateOpsOrderProblemQuery, 'statue', 1)
        this.$set(this.updateOpsOrderProblemQuery, 'processState', 1)
        // // 指派后要插入记录
        // // updateOpsOrderProblemQuery.id 事项ID，val指派ID
        await this.updateOpsOrderProblem(this.updateOpsOrderProblemQuery)
        await this.insertOpsOrderProblemLog(2, this.updateOpsOrderProblemQuery.id, val)

        // 指派推发起人和工程师
        await messageSendToPlatform(8, {receiverIds: `${val},${this.updateOpsOrderProblemQuery.userId}`, title: this.updateOpsOrderProblemQuery.name, problemNo: this.updateOpsOrderProblemQuery.problemNo, status: 1})
        // await this.findOmRequest()
        if (this.getTableDataProp.length === 1 && this.listQuery.page !== 1) {
          this.$set(this.listQuery, 'page', --this.listQuery.page)
        }
        this.$emit('emitGetPagingTableData', this.listQuery)
      }
    },
    // 事项操作
    handlerActtion(val) {
      this[`${val.fn}`](...val.data)
    },
    // 查看
    handlePush(row) {
      this.$router.push({ name: 'accraditationDetail', query: { id: row.id, alarmId: row.alarmId, groupId: row.groupId } })
    },
    // 编辑事项
    handlePushEdit(row) {
      this.$router.push({ name: 'accraditationApplication', query: { id: row.id, alarmId: row.alarmId, groupId: row.groupId} })
    },
    // 点击删除
    handleDelete(row) {
      this.$confirm('确认删除事项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code } = await this.deleteOpsOrderProblem(row)
        if (code === 1) {
          // 刷新列表表格
          if (this.getTableDataProp.length === 1 && this.listQuery.page !== 1) {
            this.$set(this.listQuery, 'page', --this.listQuery.page)
          }
          this.$emit('emitGetPagingTableData', this.listQuery)
          this.$message({ type: 'success', message: '删除成功' })
        } else {
          this.$message({ type: 'error', message: '删除失败' })
        }
      })
    },
    handleRollBack(row) {
      this.$confirm('确认撤回事项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const data = { id: row.id, processState: 6 }

        await this.updateOpsOrderProblem(data)
        await this.insertOpsOrderProblemLog(15, row.id)
        if (this.tabsItemCode === 'handling') {
          await messageSendToPlatform(6, {receiverIds: row.lockUserId, title: row.name, problemNo: row.problemNo, status: 6})
        } else if (this.tabsItemCode === 'waitPlan') {
          const groupMsg = await this.findHrUserGroupMap(row.groupId)
          let manageId = ''
          if (groupMsg.length > 0) {
            manageId = groupMsg[0].userId
          }
          let receiverIds = []
          receiverIds.push(row.lockUserId)
          if (row.lockUserId !== manageId) {
            receiverIds.push(manageId)
          }

          await messageSendToPlatform(6, {receiverIds: receiverIds.toString(), title: row.name, problemNo: row.problemNo, status: 6})
        }
        // 刷新列表表格
        if (this.getTableDataProp.length === 1 && this.listQuery.page !== 1) {
          this.$set(this.listQuery, 'page', --this.listQuery.page)
        }
        this.$emit('emitGetPagingTableData', this.listQuery)
        this.$message({ type: 'success', message: '撤回成功' })
      })
    },
    // 删除事项
    async deleteOpsOrderProblem(row) {
      return await this.$request({
        url: this.api.opm.deleteOmRequest,
        data: { id: row.id }
      })
    },
    handleSuccess(row) {
      this.$confirm('确认此事项已成功处理吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const data = { id: row.id, statue: 7, processState: 2 }
        await this.updateOpsOrderProblem(data)
        await this.insertOpsOrderProblemLog(10, row.id)
        // 成功推发起人
        await messageSendToPlatform(6, {receiverIds: row.userId, title: row.name, problemNo: row.problemNo, status: 2})
        if (this.getTableDataProp.length === 1 && this.listQuery.page !== 1) {
          this.$set(this.listQuery, 'page', --this.listQuery.page)
        }
        this.$emit('emitGetPagingTableData', this.listQuery)
      })
    },
    handleFail(row) {
      this.$confirm('确认此事项处理失败吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await this.insertOpsOrderProblemLog(12, row.id)
        const data = { id: row.id, statue: 7, processState: 3 }
        await this.updateOpsOrderProblem(data)
        // 失败推发起人
        await messageSendToPlatform(7, {receiverIds: row.userId, title: row.name, problemNo: row.problemNo, status: 3})
        if (this.getTableDataProp.length === 1 && this.listQuery.page !== 1) {
          this.$set(this.listQuery, 'page', --this.listQuery.page)
        }
        this.$emit('emitGetPagingTableData', this.listQuery)
      })
    },
    // 更新事项状态
    async updateOpsOrderProblem(data) {
      return await this.$request({ url: this.api.opm.updateOpsOrderProblem, data })
    },
    // 新增事项记录
    async insertOpsOrderProblemLog(status, orderId, receiveId) {
      let date = new Date()
      await this.$request({
        url: this.api.opm.insertOpsOrderProblemLog,
        data: { userId: this.loginUser.userId, orderId, status: status, createTime: this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', date), receiveId }
      })
    },
    // 查运维小组主管ID
    async findHrUserGroupMap(groupId) {
      const {data, code} = await this.$request({url: this.api.sys.findHrUserGroupMap, data: {groupId, classify: 'manager', limit: -1}})
      if (code !== -1) {
        return data
      }
    },
    // 查看作业
    handlerTask(row) {
      this.selectTaskId = row.id
      this.$refs.taskDialog.open(row)
    },
    // 重新加载专业
    realoadTask() {
      this.$emit('emitGetPagingTableData', this.listQuery)
    },
    // 解锁 / 锁定事项
    async handleLockStatus(row) {
      this.$confirm(`确认领取该事项吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const data = { id: row.id, lockStatue: 1, lockUserId: this.loginUser.userId, statue: 1, processState: 1 }
        await this.$request({ url: this.api.opm.updateOpsOrderProblem, data })
        await this.insertOpsOrderProblemLog(3, row.id)
        // 锁定推发起人
        await messageSendToPlatform(2, {receiverIds: row.userId, title: row.name, problemNo: row.problemNo, status: 1})
        if (this.getTableDataProp.length === 1 && this.listQuery.page !== 1) {
          this.$set(this.listQuery, 'page', --this.listQuery.page)
        }
        this.$emit('emitGetPagingTableData', this.listQuery)
      })
    },
    // 指派
    handleAssigned(val) {
      this.$refs.userDialog.open(val)
      this.$set(this.updateOpsOrderProblemQuery, 'id', val.id)
      this.$set(this.updateOpsOrderProblemQuery, 'userId', val.userId)
      this.$set(this.updateOpsOrderProblemQuery, 'name', val.name)
      this.$set(this.updateOpsOrderProblemQuery, 'problemNo', val.problemNo)
    },
    async updateAllOpsOrderWorkTask(orderProblemId, query) {
      const { data, code } = await this.$request({
        url: this.api.opm.findOpsOrderWorkTask,
        data: { orderProblemId, limit: -1 }
      })
      if (code !== 1 || !data.length) return
      for (const it of data) {
        await this.$request({
          url: this.api.opm.updateOpsOrderWorkTask,
          data: { id: it.id, ...query }
        })
      }
    },
    async findNewOaApproveLog(approveIds) {
      const { code, data } = await this.$request({
        url: this.api.approveLog.findNewOaApproveLog,
        data: { approveIds, approveType: 586, page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    async findTask(logData) {
      const { model: taskModel, code: taskCode } = await this.$request({ url: this.api.opm.findTask, data: { instanceId: logData[0].instanceId || '' } })
      if (taskCode !== 1) return []
      return JSON.parse(taskModel)
    },
    async findSysUserRole(roleIds) {
      const {data, code} = await this.$request({url: this.api.sys.findSysUserRole, data: {roleIds}})
      if (code) return data
    },
    async findSysUser(ids) {
      const {data, code} = await this.$request({url: this.api.sys.findSysUser, data: {ids}})
      if (code) return data
    },
    // 审批通过
    handlePass(num, row, approveStatue) {
      this.$confirm(`${approveStatue === 1 ? '确认审批通过该事项吗' : '确认不通过该事项吗'}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let acitivityQuery = {
          approveStatue,
          taskId: row.taskId
        }

        const { code } = await this.$request({
          url: this.api.activity.completeActivity,
          data: { ...acitivityQuery }
        })
        if (code === 1) {
          // 通过后查下一个审批人，没有就改审批状态到审核通过
          const approveList = await this.findNewOaApproveLog(row.id)
          const nextObj = await this.findTask(approveList)
          if (!nextObj.length) {
            this.insertOpsOrderProblemLog(10, row.id)
            const data = { id: row.id, statue: 3 }
            await this.updateOpsOrderProblem(data)
          }

          if (this.getTableDataProp.length === 1 && this.listQuery.page !== 1) {
            this.$set(this.listQuery, 'page', --this.listQuery.page)
          }
          this.$emit('emitGetPagingTableData', this.listQuery)
        }
      })
    },
    handleReject(num, row) {
      this.$confirm(`确认审批驳回该事项吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const findApprove = await this.$request({
          url: this.api.approve.findApprove,
          data: { page: 1, limit: 10, keyword: '', userId: this.loginUser.userId }
        })
        const completeActivityQuery = {
          approveStatue: 6,
          taskId: '',
          userId: ''
        }
        const approveObj = findApprove.data.filter(item => +item.approveId === +row.id)
        completeActivityQuery.taskId = approveObj[0].taskId
        completeActivityQuery.userId = approveObj[0].userId
        const { code } = await this.$request({
          url: this.api.activity.completeActivity,
          data: completeActivityQuery
        })
        if (code === 1) {
          await this.insertOpsOrderProblemLog(14, row.id)
          // await this.updateAllOpsOrderWorkTask(row.id, { statue: 4 })

          const data = { id: row.id, statue: 4}
          await this.updateOpsOrderProblem(data)
          // statue 4驳回
          // const updateData = { id: row.approveId, statue: 4 }
          // await this.updateOpsOrderProblem(updateData)
          // 刷新
          if (this.getTableDataProp.length === 1 && this.listQuery.page !== 1) {
            this.$set(this.listQuery, 'page', --this.listQuery.page)
          }
          this.$emit('emitGetPagingTableData', this.listQuery)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.matter-table {
  height: 100%;
  width: 100%;
}
/deep/ .el-table .row-expand-cover .cell .el-table__expand-icon {
  display: none;
}
</style>
