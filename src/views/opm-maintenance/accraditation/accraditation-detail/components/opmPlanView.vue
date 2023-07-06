<template>
  <div class="plan">
    <el-empty v-if="!taskList.length" description="暂无计划">
      <el-button v-if="showSubmitAudio && info.matter.statue !== 7" type="primary" @click="drawer = true">安排作业</el-button>
    </el-empty>
    <div class="plan-list">
      <el-row :gutter="20">
        <el-col v-for="(item, index) in taskList" :key="item.id" :span="12" class="mt-20">
          <div class="plan-list-item">
            <div class="plan-list-item-header">
              <div class="flex-h-center">
                <el-tag :type="setAudioStatuColor(item.statue)" effect="dark">
                  {{ setAudioStatus(item.statue) }}
                </el-tag>
                <h2 class="ml-12">{{ item.name }}</h2>
              </div>
              <div class="flex-h-center mt-10">
                <el-avatar :size="20" />
                <span class="ml-10 font-14">{{ item.userName }}</span>
                <span class="ml-20 font-14">计划时间:{{ item.workStime }} 到 {{ item.workEtime }}</span>
              </div>
            </div>
            <div class="plan-list-item-content">
              <div class="content-desc mb-3">描述：{{ item.backup }}</div>
              <div class="mt-2">
                <el-button v-for="dItem in item.device" :key="dItem.hyHostId" type="info" plain size="mini">{{ dItem.hyHostName }}</el-button>
              </div>
              <div class="mt-2">
                <el-button v-for="dItem in item.bs" :key="dItem.id" type="info" plain size="mini">{{ dItem.name }}</el-button>
              </div>
            </div>
            <div class="plain-list-item-footer flex-v-end flex-h-center">
              <i class="el-icon-delete font-24 pointer" @click="handlerDeleteTask(item, index)" />
            </div>
          </div>
        </el-col>
        <el-col v-if="taskList.length > 0" :span="12" class="mt-20">
          <div v-if="info.matter.statue !== 7" class="plan-list-item-add flex-center flex-colunm pointer" @click="handleOpen">
            <i class="el-icon-plus font-60" />
            <h2 class="mt-20">新增作业</h2>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 抽屉 -->
    <el-drawer title="计划安排" :visible.sync="drawer" direction="rtl">
      <template #title>
        <h3>计划安排</h3>
      </template>
      <div class="drawer-form pl-30 pr-30 flex-h-between">
        <el-form ref="form" :model="rulesForm" :rules="rules" label-position="left" label-width="120px">
          <el-form-item label="作业名称：" prop="name">
            <el-input v-model="rulesForm.name" />
          </el-form-item>
          <el-form-item label="安排人员：" prop="assign">
            <el-button type="primary" @click="$refs.userDialog.open(info.matter)">选择人员</el-button>
            <span style="color: #f56c6c" class="alertMessage"> {{ alertMessage }}</span>
            <div v-if="rulesForm.userId !== ''">
              <el-tag closable @close="closeUserTag">{{ userModel.realName }}</el-tag>
            </div>
          </el-form-item>
          <el-form-item label="计划开始时间：" prop="workStime">
            <el-date-picker v-model="rulesForm.workStime" type="datetime" placeholder="选择日期时间" value-format="yyyy-MM-dd HH:mm:ss" @change="changeWorkStime" />
          </el-form-item>
          <el-form-item label="计划结束时间：" prop="workEtime">
            <el-date-picker v-model="rulesForm.workEtime" type="datetime" placeholder="选择日期时间" value-format="yyyy-MM-dd HH:mm:ss" @change="changeWorkEtime" />
          </el-form-item>
          <el-form-item label="描述：">
            <el-input v-model="rulesForm.backup" type="textarea" :rows="5" />
          </el-form-item>
          <el-form-item label="关联业务：">
            <el-button type="primary" @click="$refs.bsDialog.open()">选择业务</el-button>
            <div v-if="storageBS.length > 0">
              <el-tag v-for="item in storageBS" :key="item.id" closable @close="closeBSTag(item.id)">{{ item.name }}</el-tag>
            </div>
          </el-form-item>
          <el-form-item label="选择设备：">
            <el-button type="primary" @click="$refs.deviceDialog.open()">选择设备</el-button>
            <div v-if="storageIT.length > 0">
              <el-tag v-for="item in storageIT" :key="item.hyHostId" closable @close="closeITTag(item.hyHostId)">{{ item.hyMarkName }}</el-tag>
            </div>
          </el-form-item>
        </el-form>
        <div class="drawer-form-btns mt-60">
          <el-button :loading="loading" type="primary" @click="saveTask">保存</el-button>
          <el-button type="info" @click="$refs.form.resetFields()">重置</el-button>
        </div>
      </div>
    </el-drawer>
    <plan-select-user-list ref="userDialog" @selectUser="getSelectUser" />
    <plan-select-b-s-list ref="bsDialog" :bs-selectfacility="bsSelectfacility" @selectBS="getSelectBS" />
    <plan-select-device-list ref="deviceDialog" :selectfacility="selectfacility" @selectIT="getSelectIT" />
  </div>
</template>

<script>
import PlanSelectBSList from '@/views/opm-maintenance/matter/components/planSelectBSList'
import PlanSelectUserList from '@/views/opm-maintenance/components/selectUserList'
import PlanSelectDeviceList from '@/views/opm-maintenance/matter/components/planSelectDeviceList'
import request from '@/utils/request'
import api from '@/api/api'
import { mapState, mapMutations } from 'vuex'
import workTaskType from '@/params-model/opm/function'

export default {
  components: {
    PlanSelectBSList,
    PlanSelectUserList,
    PlanSelectDeviceList
  },
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      drawer: false,
      rulesForm: {
        name: '',
        userId: '',
        workStime: '',
        workEtime: '',
        backup: '',
        assign: ''
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        workStime: [{ required: true, message: '请选择开始时间', trigger: 'blur' }],
        workEtime: [{ required: true, message: '请选择结束时间', trigger: 'blur' }],
        assign: [{ required: true, message: '请添加人员', trigger: 'blur' }]
      },
      showUserDialog: false,
      showBsDialog: false,
      showDeviceDialog: false,
      itMonitorType: [],
      selectItMonitorType: '',
      storageBS: '',
      storageIT: '',
      findOpsOrderWorkTaskQuery: {
        page: 1,
        limit: -1
      },
      taskList: [],
      loginUser: {},
      loading: false,
      showSubmitAudio: true,
      // audioStatus: [
      //   { statue: 1, value: '未提交', color: 'danger' },
      //   { statue: 2, value: '审核中', color: 'danger' },
      //   { statue: 3, value: '已审核', color: 'success' },
      //   { statue: 8, value: '修改', color: 'success' },
      //   { statue: 7, value: '关闭', color: 'success' }
      // ],
      // audioStatus: [
      //   { statue: 1, value: '处理中', color: 'warning', colorCode: '#E6A23C' },
      //   { statue: 2, value: '处理失败', color: 'danger', colorCode: '#F56C6C' },
      //   { statue: 3, value: '处理成功', color: 'success', colorCode: '#67C23A' }
      // ],
      audioStatus: workTaskType.get('workTaskType'),
      userModel: null,
      selectfacility: [],
      bsSelectfacility: [],
      orderWorkTaskList: [],
      alertMessage: ''
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    setAudioStatus() {
      const that = this
      return function (statue) {
        const idx = that.audioStatus.findIndex(item => Number(item.statue) === Number(statue))
        if (idx !== -1) return that.audioStatus[idx].label
      }
    },
    setAudioStatuColor() {
      const that = this
      return function (statue) {
        const idx = that.audioStatus.findIndex(item => Number(item.statue) === Number(statue))
        if (idx !== -1) return that.audioStatus[idx].color
      }
    },
    // 映射 this.count 为 store.state.count
    ...mapState('opm', ['opmPlanFlag', 'opmTaskList', 'opsProblemName', 'hostDeviceList', 'relatedBusinessList'])
  },
  async mounted() {
    this.rulesForm.name = this.opsProblemName
    console.log(this.hostDeviceList)
    console.log(this.info)
    console.log(this.relatedBusinessList)
    this.storageIT = this.hostDeviceList || ''
    this.selectfacility = this.hostDeviceList || ''
    this.bsSelectfacility = this.relatedBusinessList || ''
    this.storageBS = this.relatedBusinessList || ''
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.findOpsOrderWorkTask()
    const logData = await this.findNewOaApproveLog(this.id)
    const idx = logData.findIndex(items => items.approveId === this.id)
    if (this.info.matter.statue === 1 || this.info.matter.statue === null) {
      this.showSubmitAudio = true
    } else {
      if (idx !== -1) {
        this.showSubmitAudio = logData[idx].approveStatue === 4 || logData[idx].approveStatue === 6 || logData[idx].approveStatue === 7
      }
    }
  },
  methods: {
    ...mapMutations(['opm/setOpmPlanFlag', 'opm/setTaskList', 'opm/spliceOpmTaskList']),
    async handleOpen() {
      this.drawer = true
      const data = await this.getSysUser(Number(this.info.matter.lockUserId))
      this.userModel = data[0]
      this.rulesForm.assign = true
      this.rulesForm.userId = +this.info.matter.lockUserId
    },
    async getSelectUser(val) {
      const data = await this.getSysUser(Number(val))
      this.userModel = data[0]
      this.alertMessage = ''
      this.rulesForm.assign = true
      this.$set(this.rulesForm, 'userId', val)
    },
    getSelectBS(val) {
      this.storageBS.splice(0, this.storageBS.length, ...val)
      this.bsSelectfacility = val
      console.log(this.storageBS)
    },
    getSelectIT(val) {
      this.storageIT.splice(0, this.storageIT.length, ...val)
      this.selectfacility = val
      console.log(this.storageIT)
    },
    saveTask() {
      if (this.rulesForm.userId === '') {
        this.alertMessage = '请安排人员'
        return this.$message.error('请安排人员')
      }
      this.$refs.form.validate(async val => {
        if (!val) return
        this.loading = true
        const model = await this.insertOpsOrderWorkTask()
        this.loading = false
        if (this.storageIT.length > 0) {
          this.storageIT.forEach(item => {
            //  增加设备
            this.insertOpsOrderWorkTaskDevice({
              workTaskId: model.id,
              deviceType: 1,
              deviceId: item.hyHostId
            })
          })
        }

        if (this.storageBS.length > 0) {
          let bsIds = []
          this.storageBS.forEach(item => {
            bsIds.push(item.id)
          })
          // 增加业务 model.id给orderProblemId?
          this.insertOpsOrderProblemBs({
            id: model.id,
            orderProblemId: model.id,
            orderType: 2,
            bsIds: bsIds
          })
        }
        // // 刷新
        this.findOpsOrderWorkTask()
        this.$emit('planFlag', true)
        this.drawer = false
      })
    },
    async insertOpsOrderWorkTask() {
      this.loading = true
      const { code, model } = await request({
        url: api.opm.insertOpsOrderWorkTask,
        data: { ...this.rulesForm, orderProblemId: this.id, createUserId: this.loginUser.userId, statue: 1 }
      })
      this.loading = false
      if (code !== 1) return
      return model
    },
    findOpsOrderWorkTask() {
      request({
        url: api.opm.findOpsOrderWorkTask,
        data: {
          ...this.findOpsOrderWorkTaskQuery,
          orderProblemId: this.id
        }
      }).then(async res => {
        if (res.code === 1 && res.data) {
          const userIds = []
          const ids = []
          let userList = []
          let deviceList = []
          let bsList = []
          res.data.forEach(item => {
            ids.push(item.id)
            userIds.push(item.userId)
          })

          // 获取批量用户
          const findUserName = await request({ url: api.sys.findSysUser, data: { ids: userIds, limit: -1, companyId: this.$auth.getUserSession().companyId } })
          if (findUserName.code === 1) userList = findUserName.data

          // 获取批量设备
          const findDevice = await request({ url: api.opm.findOpsOrderWorkTaskDevice, data: { workTaskIds: ids, limit: -1 } })
          if (findDevice.data.length > 0) {
            const deviceIds = []
            findDevice.data.forEach(item => {
              deviceIds.push(item.deviceId)
            })
            const { data: findHostData, code: findHostCode } = await request({
              url: api.itMonitor.findHyitHost,
              data: { limit: -1, ids: deviceIds.join() }
            })
            if (findHostCode === 1) deviceList = findHostData
            console.log(deviceList)
          }

          // 获取批量业务系统
          // const findBindBs = await request({ url: api.opm.findOpsOrderProblemBs, data: { orderProblemIds: ids, limit: -1 }})
          const { data, code } = await request({ url: api.opm.findOpsOrderProblemBs, data: { orderProblemIds: ids, limit: -1 } })
          if (code !== 1) return
          if (data.length > 0) {
            const bsIds = []
            data.forEach(item => {
              if (item.bsId) {
                bsIds.push(item.bsId)
              }
            })
            console.log(bsIds)
            // 去除多余重复bsId
            let filterIds = [...new Set(bsIds)]
            console.log(filterIds)
            const { data: bsData, code: bscode } = await request({
              url: api.bsTopSystem.findBsTopSystem,
              data: { limit: -1, ids: filterIds.join() }
            })
            if (bscode === 1) bsList = bsData
          }

          res.data.forEach(item => {
            const device = []
            const bs = []

            const userIds = userList.findIndex(items => Number(items.userId) === Number(item.userId))

            findDevice.data.forEach(fdItem => {
              if (Number(fdItem.workTaskId) === Number(item.id)) {
                if (!deviceList) return
                const idx = deviceList.findIndex(dlItem => Number(dlItem.hyHostId) === Number(fdItem.deviceId))
                if (idx !== -1) device.push(deviceList[idx])
              }
            })
            // console.log(findBindBs, bsList)
            data.forEach(fbItem => {
              if (Number(fbItem.orderProblemId) === Number(item.id)) {
                const idx = bsList.findIndex(dlItem => Number(dlItem.id) === Number(fbItem.bsId))
                if (idx !== -1) bs.push(bsList[idx])
              }
            })

            if (userIds !== -1) {
              console.log(userList[userIds])
              item.userName = userList[userIds].realName
            }
            item.device = device
            item.bs = bs
          })
          // 根据taskList的数据长度来判断各种情况
          this.taskList = res.data.sort((a, b) => {
            return this.$tool.getTimeF(a.createTime) - this.$tool.getTimeF(b.createTime)
          })

          console.log('res.data', res.data)
          // 设置是否有计划任务布尔值
          res.data.length > 0 ? this['opm/setOpmPlanFlag'](true) : this['opm/setOpmPlanFlag'](false)
          // if (res.data.length === 0) {
          //   console.log(this.opmTaskList)
          //   this.taskList = this.opmTaskList || []
          // }
          if (res.data.length > 0) {
            this['opm/setTaskList'](res.data)
            // this.taskListLength = res.data.length
          }

          console.log(this.taskList)
        }
      })
    },
    insertOpsOrderWorkTaskDevice(data) {
      request({
        url: api.opm.insertOpsOrderWorkTaskDevice,
        data
      })
    },
    insertOpsOrderProblemBs(data) {
      //  url: api.opm.insertOpsOrderProblemBs,
      request({
        url: api.opm.updateOpsOrderProblemBsByIds,
        data
      })
    },
    handlerDeleteTask(row, index) {
      this.$confirm(`确定删除该作业吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          if (this.info.matter.statue === 7) {
            this.$message({ type: 'error', message: '事项已结束' })
            return
          }
          // 如果在审核中，需要删除流程???
          // 根据的是计划的id,如果没有提交任务，则只是删除vuex里面的数据
          if (!row.id) {
            this['opm/spliceOpmTaskList'](index)
            console.log(this.taskList)
            // this.taskList.splice(index, 1)
            return
          }
          const deleteRes = await this.deleteOpsOrderWorkTask({
            id: row.id
          })
          console.log(deleteRes)
          if (deleteRes === 1) {
            this['opm/spliceOpmTaskList'](index)
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.findOpsOrderWorkTask()
          }
        })
        .catch(() => {})
    },
    async deleteOpsOrderWorkTask(data) {
      const { code } = await request({
        url: api.opm.deleteOpsOrderWorkTask,
        data
      })
      if (code !== 1) return
      return code
    },
    // 查询请假日志
    async findNewOaApproveLog(approveIds) {
      const { code, data } = await request({
        url: api.approveLog.findNewOaApproveLog,
        data: { approveIds, approveType: this.$defineData.projectActivityProcessDefine('matter', 'key', 'id'), page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    changeWorkStime() {
      console.log(this.info.matter)
      if (new Date(this.info.matter.createTime).getTime() > new Date(this.rulesForm.workStime).getTime()) {
        this.$message({
          type: 'info',
          message: '计划开始时间不能小于事项创建时间'
        })
        this.rulesForm.workStime = ''
      }
    },
    changeWorkEtime() {
      if (this.rulesForm.workStime !== '' && this.rulesForm.workEtime !== '') {
        console.log(this.rulesForm.workStime, this.rulesForm.workEtime)
        if (!this.$tool.ETimeIsLessStime(this.rulesForm.workStime, this.rulesForm.workEtime)) {
          this.rulesForm.workStime = ''
          this.rulesForm.workEtime = ''
          return this.$message('结束时间不能小于开始时间!')
        }
      }
    },
    async getSysUser(userId) {
      let { data, code } = await request({ url: api.sys.findSysUser, data: { ids: userId, limit: -1, companyId: this.$auth.getUserSession().companyId } })
      if (code === 1) return data
    },
    closeUserTag() {
      this.$set(this.rulesForm, 'userId', '')
    },
    closeBSTag(id) {
      console.log(id)
      const idx = this.storageBS.findIndex(item => item.id === id)
      if (idx !== -1) this.storageBS.splice(idx, 1)
    },
    closeITTag(id) {
      const idx = this.storageIT.findIndex(item => item.hyHostId === id)
      if (idx !== -1) this.storageIT.splice(idx, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-drawer {
  .drawer-form {
    height: 100%;
    margin: 20px 0 0 0;
  }
}

.plan-list {
  .plan-list-item {
    border: 1px solid #e5ecf6;
    position: relative;
    height: 350px;
    .plan-list-item-header {
      padding: 14px;
      border-bottom: 1px solid #e5ecf6;
      box-sizing: border-box;

      .el-button {
        background: #fe830c;
      }
    }
    .plan-list-item-content {
      padding: 14px;
      box-sizing: border-box;
      .content-desc {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 24px;
        font-size: 14px;
      }
    }
    .plain-list-item-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 6px 14px;
      box-sizing: border-box;
      background-color: #e5ecf6;
    }
  }
  .plan-list-item-add {
    border: #e5ecf6 3px dotted;
    height: 350px;
    color: #999;
  }
}
</style>
