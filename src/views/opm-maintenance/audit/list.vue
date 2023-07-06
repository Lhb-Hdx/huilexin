<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="findApproveQuery.keyword" placeholder="关键字搜索" style="width: 200px" class="filter-item" clearable @keyup.enter.native="handleFilter" /> -->
      <el-select v-model="audioType" class="filter-item">
        <el-option v-for="item in audioLogType" :key="item.key" :label="item.value" :value="item.key" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table :data="applyList" style="width: 100%">
        <el-table-column label="序号" width="80" type="index" :index="indexMethod" />
        <el-table-column prop="problemNo" label="事项编号" show-overflow-tooltip />
        <el-table-column prop="name" show-overflow-tooltip label="事项名称">
          <template slot-scope="{ row }">
            <span style="color: #013e9a">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="problemType" label="事项类型" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ $tool.matchData(typeOption, row, 'problemType', 'label', 'value') }}
          </template>
        </el-table-column>
        <el-table-column prop="serviceType" label="服务类型" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ $tool.matchData(subTypes, row, 'serviceType', 'catName', 'catId') }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="严重/紧急/影响度" show-overflow-tooltip>
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
        <el-table-column prop="userId" label="提交人" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ $tool.matchData(createUser, row, 'userId', 'realName', 'userId') }}
          </template>
        </el-table-column>
        <el-table-column label="申请类型" show-overflow-tooltip>
          <template slot-scope="row">
            {{ setApproveType(row.row.approveType) }}
          </template>
        </el-table-column>
        <el-table-column label="申请内容" prop="approveLog" show-overflow-tooltip />
        <el-table-column label="申请时间" prop="approveTime" show-overflow-tooltip />
        <el-table-column label="申请状态" show-overflow-tooltip>
          <template slot-scope="row">
            <span :class="setAudioStatusColorClass(row.row.approveStatue)">
              {{ setAudioStatus(row.row.approveStatue) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" @click="getDetail(row)">查看事项</el-button>
            <el-button v-if="showAction" size="mini" type="primary" @click="openAudioDialog(row)">审批</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="findApplyTotal > 0" :auto-scroll="false" :total="findApplyTotal" :page.sync="findApproveQuery.page" :limit.sync="findApproveQuery.limit" @pagination="findApprove" />
    </div>
    <el-dialog title="审批" :visible.sync="showAudioDialog" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="审批状态" prop="approveStatue">
            <el-select v-model="form.approveStatue" placeholder="请选择审批状态" style="width: 100%">
              <el-option v-for="item in audioStatus" :key="item.key" :label="item.value" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="意见" prop="backup">
            <el-input v-model.trim="form.backup" placeholder="意见" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAudioDialog = false">取 消</el-button>
        <el-button v-loading="commitFlag" class="filter-item" type="primary" @click="handleCompleteActivity">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  name: 'AudioList',
  components: {
    Pagination
  },
  data() {
    return {
      findApproveQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      findOpsProblemQuery: {
        page: -1,
        limit: -1,
        keyword: ''
      },
      typeOption: [
        // 事项类型
        { label: '故障问题', value: 1 },
        { label: '服务请求', value: 2 },
        { label: '整改变更', value: 3 },
        { label: '日常事务', value: 4 },
        { label: '运维登记', value: 5 }
      ],
      subTypes: [],
      audioType: 1,
      audioLogType: [
        { key: 1, value: '未审核' },
        { key: 2, value: '已审核' },
        {key: 3, value: '驳回'}
      ],
      isFinish: false,
      showAction: true,
      listLoading: false,
      applyList: [],
      findApplyTotal: 0,
      approveType: [],
      showAudioDialog: false,
      selectAudio: {
        instanceId: '',
        approveId: '',
        taskId: '',
        userId: ''
      },
      rules: {
        approveStatue: [{ required: true, message: '请选择审批状态', trigger: 'blur' }]
      },
      form: {
        approveStatue: '',
        backup: ''
      },
      commitFlag: false,
      createUser: [],
      loginUser: {},
      audioStatus: [
        { key: 1, value: '通过' },
        { key: 2, value: '不通过' },
        { key: 6, value: '驳回' }
      ]
    }
  },
  computed: {
    setUser() {
      return function(userId) {
        const getItem = this.userList.findIndex(item => Number(item.userId) === Number(userId))
        return getItem !== -1 ? this.userList[getItem].userName : ''
      }
    },
    setApproveType() {
      return function(approveType) {
        // console.log(approveType)
        const getItem = this.approveType.findIndex(item => Number(item.id) === Number(approveType))
        return getItem !== -1 ? this.approveType[getItem].dictdataName : ''
      }
    },
    setAudioStatus() {
      return function(approveType) {
        return this.$defineData.processStatus(approveType)
      }
    },
    setAudioStatusColorClass() {
      return function(approveType) {
        return this.$defineData.processStatus(approveType, 'color')
      }
    },
    showAudioBtn() {
      return function(status) {
        const hideBtn = [1, 2, 6]
        return hideBtn.indexOf(status) === -1
      }
    }
  },
  mounted() {
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.findApprove()
    this.findApproveType()
    this.findSysCat()
  },
  methods: {
    indexMethod(index) {
      // console.log(index)
      return (this.findApproveQuery.page - 1) * this.findApproveQuery.limit + 1 + index
    },
    findApprove() {
      if (this.audioType === 1) {
        this.showAction = true
        request({
          url: api.approve.findApprove,
          data: { ...this.findApproveQuery, userId: getUserSession().userId, approveType: 496}
          // data: { ...this.findApproveQuery, userId: getUserSession().userId, approveType: 496, approveStatue: 5}
        }).then(async res => {
          if (res.code === 1) {
            // this.applyList = res.data
            if (res.data.length > 0) {
              // const filterData = res.data.filter(item => item.approveType === 496 && item.approveStatue !== 6)
              // console.log(filterData.length)
              this.findApplyTotal = +res.count
              this.findOpsOrderProblem(res.data)
            }
          }
        })
      } else if (this.audioType === 2) {
        this.showAction = false
        request({
          url: api.approveLog.findNewOaApproveLog,
          data: { ...this.findApproveQuery, approveUserId: getUserSession().userId }
        }).then(res => {
          if (res.code === 1) {
            // this.applyList = res.data
            this.findApplyTotal = Number(res.count)
            this.findOpsOrderProblem(res.data)
          }
        })
      } else {
        this.showAction = false
        request({
          url: api.approve.findApprove,
          data: { ...this.findApproveQuery, userId: getUserSession().userId, approveType: 496, approveStatue: 6}
        }).then(async res => {
          if (res.code === 1) {
            // this.applyList = res.data
            if (res.data.length > 0) {
              // const filterData = res.data.filter(item => item.approveType === 496 && item.approveStatue === 6)
              this.findApplyTotal = +res.count
              this.findOpsOrderProblem(res.data)
            }
          }
        })
      }
    },
    async findTask() {
      // 返回来的taskModel没有数据就是流程走完了
      const { model: taskModel, code: taskCode } = await request({ url: api.opm.findTask, data: { instanceId: this.selectAudio.instanceId } })
      console.log(taskModel, taskCode)
      const taskModelObj = JSON.parse(taskModel)[0] || []
      // 判断流程是否走完
      if (taskModelObj.length !== 0) {
        // taskModelObj根据配置的不同返回来的对象结构属性不同
        //  一个是配置了特定用户，
        if (taskModelObj.userId) {
          this.isApprove = +taskModelObj.userId === +this.loginUser.userId
          console.log(this.isApprove, '2222222')

          // 一个是配置了特定角色
        } else if (taskModelObj.roleId) {
          let form = { page: -1, limit: -1 }
          const { data: roleData } = await request({ url: api.sys.findSysUserRole, data: form })
          let finalArr = roleData.filter(item => +item.roleId === +taskModelObj.roleId)

          this.isApprove = finalArr.findIndex(item => +item.userId === +this.loginUser.userId) !== -1
          console.log(this.isApprove, '33333333333333')

          console.log(this.isApprove)
        }
      } else {
        this.isFinish = true
      }
      //  approveId 审批事项id status:7关闭,3 已审批: 2审批中 4驳回 5待审核。 processState: 2处理完成
      const data = { id: this.selectAudio.approveId, statue: this.isFinish ? 3 : 2, processState: this.isFinish ? 1 : 0 }
      await request({ url: api.opm.updateOpsOrderProblem, data })
    },
    async findOpsOrderProblem(applyList) {
      const { data, code } = await this.$request({
        url: this.api.opm.findOpsOrderProblem,
        data: this.findOpsProblemQuery
      })

      if (code === 1 && data.length > 0) {
        const newApplyList = []
        applyList.forEach(item1 => {
          data.forEach(item2 => {
            if (+item1.approveId === +item2.id) {
              newApplyList.push({ ...item2, ...item1})
            }
          })
        })

        const userIds = []
        data.forEach(item => {
          if (item.userId) userIds.push(item.userId)
        })
        this.createUser = await this.commonRequestFn.findSysUser({
          ids: this.$tool.uniqueArray(userIds).toString(),
          limit: -1,
          companyId: this.$auth.getUserSession().companyId
        })
        this.applyList = newApplyList
      }
    },
    handleFilter() {
      this.$set(this.findApproveQuery, 'page', 1)
      this.findApprove()
    },
    findApproveType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { page: 1, limit: -1, dictCode: 'oa_approve_type' }
      }).then(res => {
        if (res.code === 1) this.approveType = res.data
      })
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
    async getDetail(row) {
      // console.log(row)
      // return
      const getOpsOrderProblem = await this.getOpsOrderProblem({ id: row.approveId })
      // console.log(getOpsOrderProblem)
      if (getOpsOrderProblem) {
        // this.$router.push({ name: 'matterDetail', query: { id: getOpsOrderProblem.orderProblemId }})
        this.$router.push({ name: 'matterDetail', query: { id: row.approveId, taskId: row.taskId, userId: row.userId } })
      } else {
        this.$message({
          type: 'error',
          message: '事项不存在'
        })
      }
    },
    openAudioDialog(val) {
      this.showAudioDialog = true
      this.selectAudio = val
      console.log(val)
    },
    handleCompleteActivity() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          const data = {
            taskId: this.selectAudio.taskId,
            ...this.form
          }
          if (this.commitFlag) return
          this.commitFlag = true
          console.log(this.form)
          console.log(this.form.approveStatue)
          console.log(this.selectAudio.userId)
          // return
          // 驳回要指定驳回的userId是多少
          if (this.form.approveStatue === 6) { data.userId = this.selectAudio.userId }
          console.log(this.selectAudio.userId)
          console.log(this.selectAudio.taskId)
          request({
            url: api.activity.completeActivity,
            data
          }).then(async res => {
            if (res.code === 1) {
              let updateData
              // updateOpsOrderProblem
              // approveStatue 1通过，2不通过，6驳回
              // 3已审批。7关闭，5待审核
              if (+this.form.approveStatue === 1) {
                await this.findTask()
              } else if (+this.form.approveStatue === 2) {
                // 关闭
                await this.insertOpsOrderProblemLog(13)
                updateData = { id: this.selectAudio.approveId, statue: 7, processState: 3}
                await this.updateOpsOrderProblem(updateData)
              } else {
                // 驳回
                await this.insertOpsOrderProblemLog(14)
                // statue 4驳回
                updateData = { id: this.selectAudio.approveId, statue: 4, processState: 0 }
                await this.updateOpsOrderProblem(updateData)
              }
              this.showAudioDialog = false
              this.commitFlag = false
              this.$message({ type: 'success', message: '提交成功' })
              this.findApprove()
            }
          })
        }
      })
    },
    // 新增事项记录
    async insertOpsOrderProblemLog(status, orderId, receiveId = '') {
      let date = new Date()
      await request({
        url: api.opm.insertOpsOrderProblemLog,
        data: { userId: this.loginUser.userId, orderId: this.selectAudio.approveId, receiveId: receiveId, status: status, createTime: this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', date) }
      })
    },
    async getOpsOrderProblem(query) {
      const { code, model } = await request({
        url: api.opm.getOpsOrderProblem,
        data: query
      })
      if (code !== 1) return
      return model
    },
    async updateOpsOrderProblem(updateData) {
      const {code} = await request({ url: api.opm.updateOpsOrderProblem, data: updateData })
      if (code !== 1) return
      this.form.approveStatue = ''
      this.form.backup = ''
    }
  }
}
</script>

<style scoped>
</style>
