<template>
  <el-dialog :title="setTitle" :visible.sync="dialogVisible" width="50%" top="5%">
    <el-form ref="form" :model="form" label-width="120px" :rules="rules">
      <el-form-item label="服务名称：" prop="serviceName">
        <el-input v-model="form.serviceName" placeholder="请输入类型名称" />
      </el-form-item>

      <el-form-item v-if="type === 2" label="服务类型：" prop="pid">
        <el-select v-model="form.pid" placeholder="请选上级类型" style="width: 100%" @change="serviceTypeChange">
          <el-option v-for="item in serviceList" :key="item.serviceId" :label="item.serviceName" :value="item.serviceId" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="type === 1" label="类型：" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :label="0">事项</el-radio>
          <el-radio :label="1">审批</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述：" label-width="120px" prop="remark">
        <el-input v-model="form.remark" placeholder="请输入描述" type="textarea" />
      </el-form-item>
      <el-form-item v-if="type === 1" label="事项描述符：" prop="code">
        <el-input v-model="form.code" placeholder="请输入2-3个大写字母，该描述用于事项编号标记，如运维类型可以标记为YW，" />
      </el-form-item>
      <el-form-item v-if="type === 2" label="服务默认设置：" prop="code">
        <el-switch v-model="value" active-color="#13ce66" inactive-color="#ff4949" @change="setSwitch" />
      </el-form-item>
      <el-form-item label="程度：">
        <div class="flex-h-center influenceLevel">
          <el-form-item prop="effectType" style="flex: 1">
            <el-select v-model="form.effectType" placeholder="影响度" style="width: 100%">
              <el-option v-for="item in matterLevels.effectType" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item prop="severityType" class="mx-10" style="flex: 1">
            <el-select v-model="form.severityType" placeholder="严重度" style="width: 100%">
              <el-option v-for="item in matterLevels.severityType" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item prop="urgencyType" style="flex: 1">
            <el-select v-model="form.urgencyType" placeholder="紧急度" style="width: 100%">
              <el-option v-for="item in matterLevels.urgencyType" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="响应时间：" prop="responseTime" label-width="120px">
        <el-select v-model="form.responseTime" placeholder="请选择响应时间" style="width: 100%">
          <el-option v-for="item in timeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="type === 1" label="推送应用" prop="classify" label-width="120px">
        <div class="flex-h-center">
          <el-select v-model="form.classify" placeholder="请选择推送应用" style="width: 90%" @change="classifyChange">
            <el-option v-for="item in actionTempList" :key="item.hyAid" :label="item.hyActionName" :value="item.classify" />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="流程：" prop="instanceId" label-width="120px">
        <div class="flex-h-center">
          <el-select v-model="form.instanceId" placeholder="请选择流程" style="width: 90%">
            <el-option v-for="item in activityList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-link type="primary" underline class="ml-10" @click="onLookActivity">查看流程</el-link>
        </div>
      </el-form-item>
      <el-form-item v-if="form.type===0" label="直接走流程：">
        <el-switch v-model="form.flow" active-color="#13ce66" inactive-color="#ff4949" />
      </el-form-item>
      <el-form-item label="表单模板：">
        <el-select v-model="form.formId" placeholder="请选择表单模板" style="width: 100%">
          <el-option v-for="item in defineFormList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否需要处理：" prop="handle">
        <el-switch v-model="form.handle" active-color="#13ce66" inactive-color="#ff4949" @change="showMessage" />
      </el-form-item>
      <el-form-item v-if="form.type===0" label="运维处理小组：" prop="groupId">
        <el-select v-model="form.groupId" placeholder="请选择运维处理小组" style="width: 100%">
          <el-option v-for="item in groupList" :key="item.groupId" :label="item.groupName" :value="item.groupId" />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'ServiceDialog',
  props: {
    type: {
      // 1父类型，2子类型
      type: [String, Number],
      default: -1
    },
    parentService: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      dialogVisible: false,
      form: {
        // serviceId: ''
      },
      matterLevels: {
        // 程度-严重度
        severityType: [
          {
            label: '高（无法运行）',
            value: 3
          },
          {
            label: '中（影响性能）',
            value: 2
          },
          {
            label: '低（无影响）',
            value: 1
          }
        ],
        effectType: [
          // 程度-影响度
          {
            label: '高（全部业务/多个业务）',
            value: 3
          },
          {
            label: '中（单个业务）',
            value: 2
          },
          {
            label: '低（无影响）',
            value: 1
          }
        ],
        urgencyType: [
          // 程度-紧急度
          {
            label: '高（核心的关键的）',
            value: 3
          },
          {
            label: '中（重要的）',
            value: 2
          },
          {
            label: '低（计划的普通的）',
            value: 1
          }
        ]
      },
      timeList: [
        { label: '不限制', value: 0 },
        { label: '3分钟', value: 3 },
        { label: '5分钟', value: 5 },
        { label: '10分钟', value: 10 },
        { label: '15分钟', value: 15 },
        { label: '30分钟', value: 30 },
        { label: '一小时', value: 60 },
        { label: '两小时', value: 120 }
      ],
      rules: {
        serviceName: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
        code: [
          { required: this.type === 1, message: '请输入2-3个大写字母，该描述用于事项编号标记，如运维类型可以标记为YW，', trigger: 'blur' },
          { validator: this.type === 1 ? this.checkLenAndWrod : '', trigger: 'blur' }
        ],
        severityType: [{ required: true, message: '请选择', trigger: 'change' }],
        effectType: [{ required: true, message: '请选择', trigger: 'change' }],
        urgencyType: [{ required: true, message: '请选择', trigger: 'change' }],
        pid: [{ required: true, message: '请选择', trigger: 'change' }],
        instanceId: [{ required: true, message: '请选择', trigger: 'change' }],
        type: [{ required: true, message: '请选择', trigger: 'change' }],
        classify: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      loading: false,
      groupList: [],
      value: true,
      serviceList: [],
      activityList: [],
      defineFormList: [],
      setTitle: '',
      selectService: {},
      selectAction: {},
      actionTempList: []
    }
  },
  computed: {
    // setTitle() {
    //   return this.type === 1 ? '编辑服务' : '新增服务'
    // }
  },
  watch: {
    parentService: {
      handler(val) {
        val && this.$set(this.form, 'serviceId1', val.serviceName)
      },
      deep: true
    },
    dialogVisible(n) {
      if (!n) this.form = {}
    },
    // 监听类型切换改变流程列表
    'form.type': {
      handler() {
        this.findNewOaActivity(this.form.type ? 586 : 496)
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // this.findNewOaActivity()
    this.findUserDefineForm()
    this.findLinkageActionTemplate()
    if (!this.groupList.length) this.findHrUserGroup()
  },
  methods: {
    classifyChange(e) {
      const idx = this.actionTempList.find(it => it.classify === e)
      if (idx) {
        this.form.classify = idx.classify
        this.selectAction = idx
      }
    },
    async findOpsOrderProblemServiceMap(serviceId) {
      const {data, code} = await this.$request({url: this.api.opm.findOpsOrderProblemServiceMap, data: {serviceId}})
      return {code, data}
    },
    async changeOpsOrderProblemServiceMap(query) {
      const {code, msg} = await this.$request({url: this.api.opm.changeOpsOrderProblemServiceMap, data: query})
      return {code, msg}
    },
    async findPlatformMobileApplication(query) {
      const res = await this.$request({url: this.api.linkageManage.findPlatformMobileApplication, data: query})
      const {data, code, msg} = JSON.parse(res)
      return {data, code, msg}
    },
    async findLinkageActionTemplate() {
      const {data, code} = await this.$request({ url: this.api.linkageManage.findHyitAction, data: { limit: -1 } })
      if (code === 1) this.actionTempList = data
    },
    onLookActivity() {
      if (!this.form.instanceId) return
      this.$router.push({ name: 'ActivityUpdate', query: { id: this.form.instanceId, l: '1' } })
    },
    checkLenAndWrod(rule, value, callback) {
      let reg = /^[A-Z]{2,3}$/
      const flag = reg.test(String(value))
      if (!flag) {
        callback(new Error('请输入2-3个大写字母，该描述用于事项编号标记，如运维类型可以标记为YW'))
      } else {
        callback()
      }
    },
    serviceTypeChange(id) {
      const idx = this.serviceList.find(it => +it.serviceId === +id)
      if (idx) this.selectService = idx
    },
    // 自定义表单列表
    findUserDefineForm() {
      this.$request({ url: this.api.userDefineForm.findUserDefineForm, data: { limit: -1 } }).then(async res => {
        if (res.code === 1 && res.data && res.data.length > 0) {
          this.defineFormList = res.data
        }
      })
    },
    // 流程列表
    async findNewOaActivity(type) {
      const { code, data } = await request({
        url: api.activity.findNewOaActivity,
        data: { page: 1, limit: -1, type }
      })
      if (code !== 1) return
      this.activityList = data
    },
    async open(row, parentsList, operation) {
      this.setTitle = operation === 'edit' ? '编辑服务' : '新增服务'
      this.$nextTick(async () => {
        if (this.type === 2) {
          this.serviceList = this.$tool.deepCopy(parentsList)
          if (operation === 'edit') {
            this.value = false
            this.form = this.$tool.deepCopy(row)
            this.$set(this.form, 'handle', !!row.handle)
            this.$set(this.form, 'flow', !!row.flow)
            this.$set(this.form, 'type', this.parentService.type)
          } else {
            this.value = true
            this.$set(this.form, 'pid', this.parentService.serviceId)
            this.$set(this.form, 'type', this.parentService.type)
            this.selectService = this.$tool.deepCopy(this.parentService)
            this.setSwitch(true)
          }
        } else {
          this.form = {}
          if (operation === 'edit') {
            this.form = this.$tool.deepCopy(row)
            this.form.handle = !!row.handle // 转换布尔值
            this.$set(this.form, 'flow', !!row.flow)
            const {data} = await this.findOpsOrderProblemServiceMap(this.form.serviceId)
            if (data.length) {
              const action = this.actionTempList.find(it => +it.hyAid === +data[0]['actionId'])
              action && this.$set(this.form, 'classify', action['classify'])
            }
          } else {
            // this.form.handle = 1
            this.$set(this.form, 'handle', true)
            this.$set(this.form, 'type', 0)
          }
        }
        this.dialogVisible = true
      })
    },
    handleConfirm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.insertOpsOrderProblemService()
      })
    },
    async getOpsOrderProblemService(serviceId) {
      const { code, model } = await request({ url: api.opm.getOpsOrderProblemService, data: { serviceId } })
      if (code === 1) {
        this.form = model
      }
    },
    async findHrUserGroup() {
      const { data, code } = await request({ url: api.sys.findHrUserGroup, data: { limit: -1 } })
      if (code === 1) this.groupList = data
    },
    async insertOpsOrderProblemService() {
      this.loading = true
      delete this.form.ctime
      delete this.form.utime
      delete this.form.classify
      const { code, msg, model} = await request({
        url: this.form.serviceId ? api.opm.updateOpsOrderProblemService : api.opm.insertOpsOrderProblemService,
        data: {
          ...this.form,
          handle: this.form.handle ? 1 : 0,
          createUserId: this.form.createUserId || this.localStorageOperation('userInfo')?.userId,
          pid: this.form.pid ? this.form.pid : this.type === 1 ? -1 : this.parentService.serviceId,
          flow: this.form.flow ? +this.form.flow : 0
        }
      })
      if (code !== 1) {
        this.loading = false
        return this.$message.error(msg)
      }

      // 批量插入服务类型-动作关联表
      if (this.type === 1) {
        const {data, code} = await this.findPlatformMobileApplication({limit: -1, classify: this.selectAction.classify})
        if (code === 1 && data.length) {
          await this.changeOpsOrderProblemServiceMap({
            serviceId: this.form.serviceId || model.serviceId,
            srcIds: data.map(it => `${this.form.serviceId || model.serviceId}-${this.selectAction.hyAid}-${it['applicationId']}`).toString()
          })
        }
      }

      if (!this.form.serviceId) this.$emit('cleanCurrent')
      this.$message.success(msg)
      this.$refs.form.resetFields()
      this.$emit('updateData', this.type)
      this.loading = false
      this.dialogVisible = false
    },
    setSwitch(dex) {
      if (dex) {
        this.$set(this.form, 'effectType', this.selectService.effectType)
        this.$set(this.form, 'severityType', this.selectService.severityType)
        this.$set(this.form, 'urgencyType', this.selectService.urgencyType)
        this.$set(this.form, 'responseTime', this.selectService.responseTime)
        this.$set(this.form, 'handle', !!this.selectService.handle)
        this.$set(this.form, 'groupId', this.selectService.groupId)
        this.$set(this.form, 'instanceId', this.selectService.instanceId)
        this.$set(this.form, 'formId', this.selectService.formId)
        this.$set(this.form, 'flow', !!this.selectService.flow)
        this.$set(this.form, 'type', this.selectService.type)
      } else {
        this.form.effectType = ''
        this.form.severityType = ''
        this.form.urgencyType = ''
        this.form.responseTime = ''
        this.form.handle = 0
        this.form.groupId = ''
        this.$set(this.form, 'instanceId', '')
        this.$set(this.form, 'formId', '')
      }
    },
    showMessage(dex) {
      if (!dex) this.$set(this.form, 'groupId', '')
    }
  }
}
</script>

<style>
</style>
