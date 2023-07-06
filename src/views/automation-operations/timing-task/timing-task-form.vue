<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card>
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item label="作业名称" class="script-form-item label-text-left" prop="taskName">
                <el-input v-model="form.taskName" placeholder="请输入作业名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item label="执行时期" class="script-form-item label-text-left" prop="executeDate">
                <el-cascader
                  v-model="form.executeDate"
                  :options="runTimeOptions"
                  style="width: calc(50% - 5px)"
                  @change="handleChangeDate"
                />
                <el-time-picker
                  v-model="form.executeTime"
                  :value="form.executeTime"
                  placeholder="任意时间点"
                  style="width: calc(50% - 5px)"
                  class="margin-left-10"
                  @change="handleChangeTime"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item label="网关" class="script-form-item label-text-left" prop="agent">
                <el-select
                  v-model="form.agent"
                  placeholder="请选择网关"
                  style="width: 100%;"
                  @change="changeAgent"
                >
                  <el-option
                    v-for="item in agentList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item label="作业步骤" class="label-text-left">
                <div class="step-list">
                  <div v-for="item in stepList" :key="item.id" class="step-list-item">
                    <div class="step-num">步骤{{ item.scriptStep + 1 }}</div>
                    <div class="step-main">
                      <div class="step-main-name">{{ item.name }}</div>
                      <div class="step-main-action">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="editStep(item)" />
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteStep(item)" />
                      </div>
                    </div>
                  </div>
                  <el-button type="text" @click="addStep"><i class="el-icon-circle-plus-outline margin-right-10" />添加一个步骤</el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="" prop="">
                <el-button v-permission="['Submit']" type="primary" size="small" @click="onSubmit">确认提交</el-button>
                <el-button type="info" size="small" @click="resetForm()">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <TaskStepDrawer ref="taskStepDrawer" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import TaskStepDrawer from '../../../components/AutomationOperationsComponent/TaskStepDrawer'

export default {
  name: 'TimingTaskForm',
  components: {
    TaskStepDrawer
  },
  data() {
    const checkTaskDate = (rule, value, callback) => {
      if (!this.form.executeDate) {
        return callback(new Error('请选择执行时期'))
      } else if (!this.form.executeTime) {
        return callback(new Error('请选择时间'))
      } else {
        callback()
      }
    }
    return {
      form: {
        taskName: '', // 作业名称
        executeTimeId: 2, // 时间类型
        taskTag: '', // 作业标签
        remark: '', // 作业描述
        script: '', // 作业脚本
        executeTimeType: '', // 时间类型
        executeDay: '', // 执行日期
        executeHour: '', // 时
        executeMinute: '', // 分
        executeSecond: '', // 秒
        agent: '',
        executeDate: '',
        executeTime: ''
      },
      rules: {
        taskName: [
          { required: true, message: '请输入作业名称' }
        ],
        executeTimeId: [
          { required: true, message: '请选择执行类型' }
        ],
        taskTag: [
          { required: true, message: '请输入作业标签' }
        ],
        remark: [
          { required: true, message: '请输入作业描述' }
        ],
        agent: [
          { required: true, message: '请选择网关' }
        ],
        executeDate: [
          { validator: checkTaskDate, required: true }
        ]
      },
      runTypeArr: [ // 执行类型
        { id: 1, executeTimeId: '手动' },
        { id: 2, executeTimeId: '自动' }
      ],
      executeDate: '', // 执行日期内容
      executeTime: [], // 执行时间内容
      runTimeOptions: [ // 执行日期联动选择
        {
          value: 1,
          executeTimeType: 1,
          label: '每天'
        },
        {
          value: 2,
          executeTimeType: 2,
          label: '每星期',
          children: [
            {
              value: 1,
              executeDay: 1,
              label: '星期一'
            },
            {
              value: 2,
              executeDay: 2,
              label: '星期二'
            },
            {
              value: 3,
              executeDay: 3,
              label: '星期三'
            },
            {
              value: 4,
              executeDay: 4,
              label: '星期四'
            },
            {
              value: 5,
              executeDay: 5,
              label: '星期五'
            },
            {
              value: 6,
              executeDay: 6,
              label: '星期六'
            },
            {
              value: 7,
              executeDay: 0,
              label: '星期天'
            }
          ]
        },
        {
          value: 3,
          executeTimeType: 3,
          label: '每月',
          children: [

          ]
        }
      ],
      timePickerValue: '', // 执行日期选择器值
      workMainList: [], // 脚本列表
      addWorkMainList: [], // 编辑时新增的脚本
      delWorkMainList: [], // 编辑时删除的脚本
      editWorkMainlist: [], // 编辑时要修改的脚本
      agentList: [],
      stepList: [], // 步骤列表
      waitAddStepList: [], // 待添加的步骤
      waitEditStepList: [], // 待更新的步骤
      waitDeleteStepList: [], // 待删除的步骤
      stepListByDB: [] // 数据库中的作业步骤数据
    }
  },
  computed: {
    id() { // 获取id
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('submit-task-step')
  },
  async mounted() {
    this.setMonth()
    if (this.id) { // 编辑
      this.fetchData()

      this.agentList = await this.findHyitAgent()
      this.$set(this.form, 'agent', this.agentList[0].id)

      const step = await this.findHyitOpsTaskLink({ limit: -1, taskId: this.id })
      // 从小到大排序
      step.sort(this.$tool.compareJsonDataByProperty('scriptStep'))
      this.stepList = this.$tool.deepCopy(step)
      this.stepListByDB = this.$tool.deepCopy(step)
    } else {
      this.agentList = await this.findHyitAgent()
      this.$set(this.form, 'agent', this.agentList[0].id)
      this.$EventBus.$emit('change-find-it-host-query', {
        agent: this.agentList[0].id
      })
    }
    this.$EventBus.$on('submit-task-step', (res) => {
      // 添加
      if (res.type === 'add') {
        this.$set(this.stepList, this.stepList.length, { ...this.$tool.deepCopy(res), scriptStep: this.$tool.deepCopy(this.stepList.length) })
        this.$set(this.waitAddStepList, this.waitAddStepList.length, { ...this.$tool.deepCopy(res), scriptStep: this.$tool.deepCopy(this.stepList.length - 1) })
      } else {
        // 编辑
        // 更新步骤列表
        const getStepIdx = this.stepList.findIndex(item => item.id === res.id)
        if (getStepIdx !== -1) this.$set(this.stepList, getStepIdx, this.$tool.deepCopy(res))

        // 是否是编辑新增的步骤
        const getWaitAddStepListIdx = this.waitAddStepList.findIndex(items => items.id === res.id)
        if (getWaitAddStepListIdx !== -1) this.$set(this.waitAddStepList, getWaitAddStepListIdx, this.$tool.deepCopy(res))

        // 如果这个作业存在步骤数据
        if (this.stepListByDB.length > 0) {
          // 是否编辑的是存在的步骤数据
          const getStepByDBIdx = this.stepListByDB.findIndex(item => item.id === res.id)
          if (getStepByDBIdx !== -1) {
            let isEditValueCount = 0 // 修改参数个数
            Object.keys(this.stepListByDB[getStepByDBIdx]).forEach(key => {
              console.log(this.stepListByDB[getStepByDBIdx][`${key}`], res[`${key}`], key)
              if (res[`${key}`] !== this.stepListByDB[getStepByDBIdx][`${key}`]) {
                ++isEditValueCount
              }
            })
            if (isEditValueCount > 0) this.$set(this.waitEditStepList, this.waitEditStepList.length, this.$tool.deepCopy(res))
          }
        }
      }
    })
  },
  methods: {
    // 选择执行类型
    handleChangeTimeId(val) {
      this.$set(this.form, 'executeTimeId', val)
      if (val === 1) { // 手动
        delete this.rules['executeDate']
        delete this.rules['executeTime']
      }
    },
    // 选择日期
    handleChangeDate(val) {
      this.$set(this.form, 'executeDate', val)
      this.$set(this.form, 'executeTimeType', val[0])
      this.$set(this.form, 'executeDay', val[1])
    },
    // 选择时间
    handleChangeTime(val) {
      const DateObj = new Date(val)
      this.$set(this.form, 'executeTime', val)
      this.$set(this.form, 'executeHour', DateObj.getHours())
      this.$set(this.form, 'executeMinute', DateObj.getMinutes())
      this.$set(this.form, 'executeSecond', DateObj.getSeconds())
    },
    // 设置月份天数
    setMonth() {
      const monthArr = []
      for (var i = 1; i < 32; i++) {
        monthArr.push({ value: i, executeDay: i, label: `${i}号` })
      }
      this.$set(this.runTimeOptions[2], 'children', monthArr)
    },
    // 设置时间
    setTime() {
      const nowdate = new Date()
      this.timePickerValue = new Date(nowdate.getFullYear(), nowdate.getMonth() + 1, nowdate.getDate(), 0, 0)
    },
    // 提交
    onSubmit() {
      this.$set(this.rules, 'executeDate', [{ required: true, message: '请选择执行日期' }])
      this.$set(this.rules, 'executeTime', [{ required: true, message: '请选择执行时间' }])
      const formParam = { ...this.form }
      delete formParam.executeTime // 接口不需要的参数
      delete formParam.executeDate // 接口不需要的参数
      if (this.id) formParam.id = this.id
      this.$refs['form'].validate(valid => {
        if (valid) {
          request({ url: this.id ? api.automationOperations.updateHyitOpsTask : api.automationOperations.insertHyitOpsTask, data: formParam }).then(res => {
            if (res.code === 1) {
              this.saveTaskStepData(res.model)
              if (this.id) this.taskChange(this.form.agent)
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.$router.back()
            } else {
              this.$message({
                type: 'error',
                message: res.msg
              })
            }
          }).finally(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    // 重置
    resetForm() {},
    // 获取编辑信息并展示
    fetchData() {
      const fetchArr = [request({ url: api.automationOperations.getHyitOpsTask, data: { id: this.id }})]
      this.loading = true
      Promise.all(fetchArr).then(res => {
        if (this.id) {
          const form = {}
          Object.keys(this.form).forEach(key => {
            form[key] = res[0].model[key]
          })
          if (form['executeTimeType'] === 1) {
            form['executeDate'] = form['executeTimeType']
          } else if (form['executeTimeType'] === 2) {
            form['executeDate'] = [form['executeTimeType'], form['executeDay']]
          } else if (form['executeTimeType'] === 3) {
            form['executeDate'] = [form['executeTimeType'], form['executeDay']]
          }
          form.executeTimeId = 2
          const executeHour = form['executeHour'] >= 10 ? form['executeHour'] : `0${form['executeHour']}`
          const executeMinute = form['executeMinute'] >= 10 ? form['executeMinute'] : `0${form['executeMinute']}`
          const executeSecond = form['executeSecond'] >= 10 ? form['executeSecond'] : `0${form['executeSecond']}`
          const NowDate = new Date()
          form['executeTime'] = new Date(`${NowDate.getFullYear()}-${NowDate.getMonth()}-${NowDate.getDate()} ${executeHour}:${executeMinute}:${executeSecond}`)
          this.form = form
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 获取网关
    async findHyitAgent() {
      const { code, data } = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (code !== 1) return
      return data
    },
    taskChange(agent) {
      request({
        url: api.automationOperations.TaskChange,
        data: { agent }
      })
    },
    // 打开添加步骤
    async addStep() {
      this.$EventBus.$emit('get-check-device', { data: [] })
      this.$refs.taskStepDrawer.open()
      this.$EventBus.$emit('change-find-it-host-query', { agent: this.form.agent, notInIds: '' })
    },
    // 打开编辑步骤
    async editStep(item) {
      const step = item.type === 'add' ? item : await this.getHyitOpsTaskLink({ id: item.id })

      const serverIds = step.serverIds.split(',')
      const notInIds = []
      if (step.serverIds.length > 0) {
        const opsServer = await this.$request({ url: this.api.automationOperations.findHyitOpsServer, data: { ids: this.$tool.uniqueArray(serverIds).toString(), limit: -1 }})
        opsServer.data.forEach(item => { notInIds.push(item.hostId) })
        if (notInIds.length > 0) {
          const itHost = await request({ url: api.itMonitor.findHyitHost, data: { ids: this.$tool.uniqueArray(notInIds).toString(), hostType: 1, limit: -1 } })
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
          this.$EventBus.$emit('get-check-device', { data: itHost.data })
        }
      } else {
        this.$EventBus.$emit('get-check-device', { data: [] })
      }
      this.$EventBus.$emit('change-find-it-host-query', { agent: this.form.agent, notInIds: this.$tool.uniqueArray(notInIds) })

      this.$refs.taskStepDrawer.open(item)
    },
    // 点击删除步骤
    deleteStep(item) {
      // 是否删除的是存在数据库的步骤
      const getStepByDBIdx = this.stepListByDB.findIndex(items => items.id === item.id)
      if (getStepByDBIdx !== -1) this.$set(this.waitDeleteStepList, this.waitDeleteStepList.length, this.$tool.deepCopy(item))
      // 删除的是否是新添加的步骤
      const getWaitAddStepListIdx = this.waitAddStepList.findIndex(items => items.id === item.id)
      if (getWaitAddStepListIdx !== -1) this.waitAddStepList.splice(getWaitAddStepListIdx, 1)
      // 从步骤列表删除
      const getStepIdx = this.stepList.findIndex(sItem => sItem.id === item.id)
      if (getStepIdx !== -1) this.stepList.splice(getStepIdx, 1)
      this.reSortingStep()
    },
    // 提交步骤
    saveTaskStepData(model) {
      // 是否有带添加的步骤
      if (this.waitAddStepList.length > 0) {
        const data = this.$tool.deepCopy(this.waitAddStepList)
        data.forEach(item => {
          delete item.id
          delete item.type
          item.taskId = model.id
        })
        this.insertHyitOpsTaskLinks({ json: JSON.stringify(data) })
      }
      // 是否有待删除的步骤
      if (this.waitDeleteStepList.length > 0) {
        const taskLinkIds = []
        this.waitDeleteStepList.forEach(item => taskLinkIds.push(item.id))
        this.deleteHyitOpsTaskLinks({ taskLinkIds: taskLinkIds.toString(), taskId: this.id })
      }
      // 是否有待编辑的步骤
      if (this.waitEditStepList.length > 0) this.updateHyitOpsTaskLinks({ json: JSON.stringify(this.waitEditStepList) })
    },
    // 批量删除步骤
    deleteHyitOpsTaskLinks(query) {
      this.$request({
        url: this.api.automationOperations.deleteHyitOpsTaskLinks,
        data: query
      })
    },
    // 批量添加步骤
    insertHyitOpsTaskLinks(query) {
      this.$request({
        url: this.api.automationOperations.insertHyitOpsTaskLinks,
        data: query
      })
    },
    // 批量编辑步骤
    updateHyitOpsTaskLinks(query) {
      this.$request({
        url: this.api.automationOperations.updateHyitOpsTaskLinks,
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
    // 选择网关
    changeAgent() {
      this.$EventBus.$emit('change-agent', { agent: this.form.agent })
    },
    // 重新排序步骤执行顺序
    reSortingStep() {
      this.stepList.forEach((item, index) => {
        if (String(index) !== String(this.stepList[index].scriptStep)) {
          this.$set(this.stepList[index], 'scriptStep', this.$tool.deepCopy(index))
          // 是否为待添加的步骤，修改待添加步骤的顺序
          const getWaitAddStepListIdx = this.waitAddStepList.findIndex(aItem => aItem.id === item.id)
          if (getWaitAddStepListIdx !== -1) this.$set(this.waitAddStepList[getWaitAddStepListIdx], 'scriptStep', this.$tool.deepCopy(index))
          // 是否为待更新的步骤，修改待更新步骤的顺序
          const getWaitEditStepListIdx = this.waitEditStepList.findIndex(eItem => eItem.id === item.id)
          if (getWaitEditStepListIdx !== -1) {
            this.$set(this.waitEditStepList[getWaitEditStepListIdx], 'scriptStep', this.$tool.deepCopy(index))
          } else {
            this.$set(this.waitEditStepList, this.waitEditStepList.length, this.$tool.deepCopy(item))
          }
        }
      })
    },
    // 查看步骤
    async getHyitOpsTaskLink(query) {
      const { code, model } = await this.$request({
        url: this.api.automationOperations.getHyitOpsTaskLink,
        data: query
      })
      if (code !== 1) return
      return model
    }
  }
}
</script>
<style lang="scss" scoped>
.script-form-item {
  display: inline-block !important;
  width: 50%;
}
.step-list {
  width: 70%;
  .step-list-item {
    display: flex;
    .step-num {
      width: 10%;
      background: #d7d7d7;
      text-align: center;
      font-weight: bold;
      padding: 2px 10px;
    }
    .step-main {
      width: 90%;
      background: #f9f9f9;
      .step-main-name {
        width: 80%;
        display: inline-block;
        padding: 2px 10px;
      }
      .step-main-action {
        width: 20%;
        display: inline-block;
        padding: 2px 10px;
      }
    }
  }
}
</style>
