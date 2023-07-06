<template>
  <div class="app-container createMatter">
    <div class="service-type">
      <MatterSidebar :matter-appication-props="matterAppicationProps" @emitParentService="emitParentService" />
    </div>
    <div class="right-contaniner">
      <el-card>
        <template v-slot:header>
          <el-page-header :content="title" :height="60" @back="onGoback" />
        </template>
        <div class="createMatter-container">
          <el-row :gutter="15">
            <el-col :span="14">
              <el-form
                ref="ruleForm"
                label-position="left"
                :model="rulesForm"
                :rules="rules"
                label-width="120px"
              >
                <el-form-item label="服务类型:" prop="problemType">
                  {{
                    sidebarMessage.childName
                      ? `${sidebarMessage.pName} > ${sidebarMessage.childName}`
                      : ""
                  }}
                </el-form-item>
                <el-form-item label="事项名称:" prop="name">
                  <el-input v-model="rulesForm.name" />
                </el-form-item>

                <el-form-item label="描述:" prop="problemDetail">
                  <Editor
                    ref="text"
                    v-model="rulesForm.problemDetail"
                    class="myQuillEditor ql-editor-class"
                    placeholder="执行任务的信息描述"
                  />
                </el-form-item>

                <CustomVFormRender
                  ref="customVFormRender"
                  :form-id="sidebarMessage.formId"
                  :order-id="queryId"
                />
                <el-form-item label="关键字:" prop="problemKeyword">
                  <el-input
                    v-model="rulesForm.problemKeyword"
                    placeholder="请输入"
                  />
                </el-form-item>
                <el-form-item label="期望解决时间:" prop="solveEtime">
                  <el-date-picker
                    v-model="rulesForm.solveEtime"
                    type="datetime"
                    placeholder="请选择时间"
                    style="width: 100%"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    @change="changeSolveEtime"
                  />
                </el-form-item>
                <el-form-item label="关联业务:" prop="bsId">
                  <el-button type="primary" @click="businessShow = true">选择业务</el-button>
                  <BusinessList :bs-ids="bsIds" @change="bsIds = $event" />
                  <!--选择关联业务弹窗-->
                  <ChoiceBusiness
                    v-if="businessShow"
                    ref="choiceBusiness"
                    :bs-ids="bsIds"
                    @change="bsIds = $event"
                    @close="businessShow = false"
                  />
                </el-form-item>

                <el-form-item label="关联设备:">
                  <el-button type="primary" @click="$refs.choiceDevice.open()">选择设备</el-button>
                  <!--选择关联设备弹窗-->
                  <DeviceList
                    :selectfacility="selectfacility"
                    @change="selectfacility = $event"
                  />
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="10">
              <SelectMan
                v-show="false"
                ref="seleman"
                :select-man.sync="selectMan"
                :email-notice.sync="rulesForm.emailNotice"
                :wechat-notice.sync="rulesForm.wechatNotice"
              />

              <el-card shadow="never" class="mt-16">
                <div slot="header" class="clearfix">
                  <span style="margin-top: 3px">附件</span>
                </div>
                <FileUpload
                  button-text="上传附件"
                  upload-type="doc"
                  file-url-list-type="text"
                  :limit="9"
                  :button-disabled="false"
                  :is-limit-file-size="false"
                  :file-max-size="1"
                  :file-url-list="fileList"
                  class="margin-bottom-10"
                  @emitFileList="getEmitFileList"
                />
                <div
                  class="card-button-ground pointer down-template"
                  @click="onDocumentTemplateDownLoad"
                >
                  选择模板下载
                  <i class="el-icon-download" />
                </div>
              </el-card>

              <!-- <el-card header="服务位置" shadow="never" class="mt-16">
                <h3 class="pb-20">请填写服务地址及联系人方式</h3>
                <el-input v-model="rulesForm.backup" type="textarea" />
              </el-card> -->
              <!-- <el-card shadow="never" class="mt-16">
                <div slot="header" class="clearfix">
                  <span style="margin-top: 3px">运维小组</span>
                </div>
                <el-select
                  v-model="HrUserGroupForm.groupId"
                  style="margin-bottom: 12px"
                  @change="showMember"
                >
                  <el-option
                    v-for="item in HrUserGroupList"
                    :key="item.groupId"
                    :value="item.groupId"
                    :label="item.groupName"
                  />
                </el-select>
                <div style="margin-bottom: 10px">
                  <el-button type="primary" size="small" round>全部成员 {{ userList.length || "" }}</el-button>
                  <el-button
                    v-for="(item, index) in userList"
                    :key="index"
                    size="small"
                    round
                  >{{ item.realName }}</el-button>
                </div>
              </el-card> -->

              <el-card header="请求人" shadow="never" class="mt-16">
                <div class="flex-h-center contacts">
                  <div>
                    <el-avatar
                      :size="60"
                      src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                    />
                  </div>
                  <div class="contacts-info ml-16">
                    <div class="font-weight font-14">
                      {{ userInfo.userName }}
                    </div>
                    <div class="font-14">{{ userInfo.companyName }}</div>
                    <div class="font-14">{{ userInfo.tel }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!--选择设备弹窗-->
        <SelectDevice
          ref="choiceDevice"
          :selectfacility="selectfacility"
          @change="selectfacility = $event"
        />
      </el-card>
      <el-row :gutter="15">
        <div class="btn-box flex-v-center p-14">
          <!-- <el-button v-loading="sumbitFlag" type="primary" @click="handleClose">保存关闭</el-button> -->
          <el-button type="primary" @click="handleSubmit">确认提交</el-button>
          <el-button type="info" @click="handleReset">重置</el-button>
        </div>
      </el-row>
    </div>

    <el-drawer
      title="申请事项文档模板下载"
      :visible.sync="dialogDocumentTemplateDrawer"
      direction="rtl"
    >
      <div class="drawer-document-template">
        <div>
          <a href="/document/template/document001.xlsx" target="_blank">
            服务器资源申请表.xlsx
            <i class="el-icon-download" />
          </a>
        </div>
        <div>
          <a href="/document/template/document002.xlsx" target="_blank">
            绿盟堡垒机用户注册.xlsx
            <i class="el-icon-download" />
          </a>
        </div>
        <div>
          <a href="/document/template/document003.docx" target="_blank">
            业务系统变更需求申请表.docx
            <i class="el-icon-download" />
          </a>
        </div>
        <div>
          <a href="/document/template/document004.docx" target="_blank">
            业务资源开通申请表.docx
            <i class="el-icon-download" />
          </a>
        </div>
        <div>
          <a href="/document/template/document005.docx" target="_blank">
            政务网链路割接升级审批流程表.docx
            <i class="el-icon-download" />
          </a>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import Editor from '@/components/QuillEditorComponent/editor.vue'
import FileUpload from '@/components/Upload/file-upload.vue'
import MatterSidebar from './components/matter-sidebar.vue'
import DeviceList from './components/deviceList.vue'
import BusinessList from './components/businessList.vue'
import SelectDevice from './components/selectDevice.vue'
import ChoiceBusiness from './components/selectBusiness.vue'
import SelectMan from './components/selectMan.vue'
import { dateFormat } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
import CustomVFormRender from '@/components/CustomForm/CustomVFormRender/CustomVFormRender'
// import opmFunction from '@/params-model/opm/function'
// const { messageSendToPlatform } = opmFunction
export default {
  name: 'MatterApplication',
  components: {
    Editor,
    DeviceList,
    SelectDevice,
    BusinessList,
    SelectMan,
    FileUpload,
    ChoiceBusiness,
    MatterSidebar,
    CustomVFormRender
  },
  data() {
    return {
      sidebarMessage: {},
      matterAppicationProps: {},
      dialogDocumentTemplateDrawer: false,
      rulesForm: {
        userId: '', // 当前用户Id
        name: '', // 事项名称
        problemNo: '', // 事项编号
        problemType: '', // 事项类型
        serviceType: '', // 服务类型
        problemDetail: '', // 问题描述
        problemKeyword: '', // 关键字
        effectType: '', // 影响度
        severityType: '', // 严重度
        urgencyType: '', // 紧急度
        bsId: '', // 关联业务
        getBsId: '', // 查询到的业务系统事项id
        ctime: '', // 申请时间
        solveStime: '', // 解决开始时间
        // hopeTime: '',
        solveEtime: '', // 解决结束时间
        backup: '', // 服务地址
        emailNotice: 0, // 邮件通知
        wechatNotice: 0 // 微信通知
      },
      sumbitFlag: false,
      serviceTypeAble: false,
      // 验证规则
      rules: {
        name: [{ required: true, message: '请输入事项名称', trigger: 'blur' }],
        problemNo: [
          { required: true, message: '请输入事项编号', trigger: 'blur' }
        ],
        effect: [{ required: true, message: '请选择', trigger: 'blur' }],
        serious: [{ required: true, message: '请选择', trigger: 'blur' }],
        urgent: [{ required: true, message: '请选择', trigger: 'blur' }],
        problemType: [{ required: true, message: '请选择', trigger: 'blur' }]
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
      findHyitTopologyInfoQuery: {
        keyword: '',
        page: 1,
        limit: 1000,
        total: 0
      },
      findHyitHostQuery: {
        keyword: '',
        agent: [],
        devType: '',
        hostType: 1,
        page: 1,
        limit: 10000
      },
      selectfacility: [], // 已选择设备
      selectMan: [], // 选择的联系人
      subTypes: [], // 服务类型
      bsIds: [], // 已选关联业务
      fileList: [], // 附件
      userInfo: {},
      queryId: '', // query的id
      dataId: '', // 事项id
      business: [], // 查询到所有已提交的相关业务
      device: [], // 查询到已提交的设备
      getDeviceOne: [], // 查询的监控设备
      getDeviceTwo: [], // 查询到的运维设备
      businessShow: false,
      selectSubTypes: [],
      loginUser: {},
      HrUserGroupForm: {
        groupId: '', // 选中的运维小组Id
        page: -1,
        limit: -1
      },
      HrUserGroupList: [], // 运维小组列表
      userList: [] // 小组成员列表
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    alarmId() {
      return this.$route.query.alarmId
    },
    alarmModelType() {
      return this.$route.query.alarmModelType
    },
    severityType() {
      return this.$route.query.severityType
    },
    effectType() {
      return this.$route.query.effectType
    },
    urgencyType() {
      return this.$route.query.urgencyType
    },
    id() {
      return this.$route.query.id
    }
  },
  watch: {},
  created() {
    this.findSysCat() // 获取服务类型
    this.getID() // 获取用户id
    this.$on('emitParentService') // 默认选中的事项类型
    this.getQueryId() // 获取query id
  },
  async mounted() {
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.getSysCompany()
    this.handleFindHrUserGroup()
    this.handleFindHrUserGroupMap()
    if (this.queryId) {
      this.findAssociatedEquipment() // 查询并获取关联业务M
      this.findOmRequestNotify() // 查询联系人
      this.findAttachment() // 获取附件
      this.findOpsOrderProblemDevice() // 获取it设备
    }
    if (this.alarmId) {
      const fault = this.localStorageOperation('get', 'fault')
      this.$set(this.rulesForm, 'name', fault.description)
      this.$set(this.rulesForm, 'alarmId', this.alarmId)
      this.$set(this.rulesForm, 'alarmModelType', this.alarmModelType)
      this.$set(this.rulesForm, 'severityType', this.severityType)
      this.$set(this.rulesForm, 'effectType', this.effectType)
      this.$set(this.rulesForm, 'urgencyType', this.urgencyType)
      let { code, data } = await request({
        url: api.itMonitor.findHyitHost,
        data: {
          hostType: 1,
          ids: fault.hostId
        }
      })
      if (code === 1) {
        this.selectfacility = data
      }
    }
  },
  methods: {
    onGoback() {
      this.$confirm('您的内容尚未保存，确认放弃申请吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.back()
      })
    },
    // 查询原有数据
    // 点击编辑，路由跳转query携带当前项id，编辑页面判断id是否存在，存在调用get方法把表单填充，修改完判断id是否存在，存在就是调用update
    // 获取query id
    getQueryId() {
      this.queryId = this.$route.query.id
    },
    // 获取事项表
    getMatter() {
      if (this.$route.query.id) {
        request({
          url: api.opm.getOpsOrderProblem,
          data: {
            id: this.$route.query.id
          }
        }).then((res) => {
          if (res.code !== 1) return
          const { problemType, serviceType } = res.model
          if (serviceType) {
            let pid = this.subTypes.filter(
              (item) => item.catId === serviceType
            )[0]?.parentId
            let selectSubTypes = this.subTypes.filter(
              (item) => item.parentId === pid
            )
            this.selectSubTypes = selectSubTypes
          }
          if (this.$route.query.id && res.model.problemType === 5) {
            this.serviceTypeAble = true
          }

          this.rulesForm = res.model
          if (problemType || serviceType) {
            this.matterAppicationProps.problemType = problemType
            this.matterAppicationProps.serviceType = serviceType
          }
        })
      }
    },

    // 上传的附件
    getEmitFileList(files) {
      this.fileList = files.fileList
    },
    handleClose() {
      this.handleSubmit()
      // this.$router.back()
    },
    // 获取用户id
    getID() {
      let userIdJson = window.localStorage.getItem('userInfo')
      let userIdString = JSON.parse(userIdJson)
      this.rulesForm.userId = userIdString.userId
    },
    // 改变故障告警状态为'处理中'
    async updateZbxAlarmLog(id) {
      const res = await request({
        url: '/admin/updateZbxAlarmLog',
        data: { id: id, status: '4' }
      })
      if (res.code !== 1) return
      await this.commonRequestFn.insertOpsOrderAlarmLog({
        alarmId: id,
        alarmModelType: 1,
        alarmHandleLog: `${this.loginUser.realName}提交到事项`,
        userId: this.loginUser.userId
      })
    },
    handleSubmit() {
      // 提交编辑事项
      this.$refs.ruleForm.validate(async (val) => {
        const validateVFormInputData =
          await this.$refs.customVFormRender.validateForm()
        if (validateVFormInputData.validate) {
          if (!val) return
          // this.sumbitFlag = true
          delete this.rulesForm.createTime
          delete this.rulesForm.updateTime
          // 设置事项编号
          this.setNoByProblemType()
          let { model } = await request({
            url: this.queryId ? api.opm.updateOpsOrderProblem : api.opm.insertOpsOrderProblem,
            data: { ...this.rulesForm, statue: 0, processState: 0 }
          })
          this.queryId ? (this.dataId = this.queryId) : (this.dataId = model.id)

          if (this.alarmId) {
            await this.updateZbxAlarmLog(this.alarmId)
          }

          // 新增事项
          if (!this.queryId) {
            await this.$refs.customVFormRender.saveVFormInputData(this.dataId)
            // 插入操作记录
            const date = new Date()
            await request({
              url: api.opm.insertOpsOrderProblemLog,
              data: {
                userId: this.rulesForm.userId,
                orderId: model.id,
                status: 1,
                createTime: dateFormat('YYYY-mm-dd HH:MM:SS', date)
              }
            })
          }
          // 提交完事项返回id，在提交附件，关联业务，关联设备，关联联系人接口用id绑定
          this.saveBatchAttachment(this.dataId) // 提交附件
          this.insertAssociatedEquipment(this.dataId) // 关联业务
          await this.insertOmRequestHost(this.dataId) // 关联设备
          this.insertOmRequestNotify(this.dataId) // 关联联系人接口
          // this.insertOpsOrderProblemGroupMap(this.dataId, this.HrUserGroupForm.groupId) // 事项关联分组接口
          // 服务类型是审批直接开启流程
          this.ConfirmMatter()
          this.$message({ type: 'success', message: '提交成功', duration: 3000 })
          this.handleReset()
          this.$router.push({name: 'myApply'})
        }
      })
    },
    // 启动流程
    async startActivity() {
      const {model, code: activityCode} = await request({url: api.activity.getNewOaActivity, data: {id: this.sidebarMessage.instanceId}})
      if (activityCode !== 1 && !model.id) return 0
      const { msg, code } = await request({
        url: api.activity.startActivity,
        data: {
          bpmnKey: model.bpmnKey,
          approveType: 586,
          approveId: this.dataId,
          userId: this.loginUser.userId
        }
      })
      if (code !== 1) {
        this.$message({
          type: 'error',
          message: `流程配置错误：${msg}`
        })
        return
      }

      return code
    },
    // 根据用户id查询申请
    async findApply(userId) {
      const { code, data } = await request({
        url: api.apply.findApply,
        data: {
          userId,
          approveType: this.$defineData.projectActivityProcessDefine(
            'accraditation',
            'key',
            'id'
          ),
          page: 1,
          limit: -1
        }
      })
      if (code !== 1) return
      return data
    },
    async updateOpsOrderProblem(data) {
      return await request({ url: api.opm.updateOpsOrderProblem, data })
    },
    // 完成流程动作
    async completeActivity(data) {
      const { code } = await request({
        url: api.activity.completeActivity,
        data
      })
      if (code !== 1) return
      return code
    },
    async insertOpsOrderProblemLog(status, receiveId = '') {
      let date = new Date()
      await request({
        url: api.opm.insertOpsOrderProblemLog,
        data: {
          userId: this.loginUser.userId,
          orderId: this.dataId,
          receiveId: receiveId,
          status: status,
          createTime: this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', date)
        }
      })
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
    // 主管提交审核，开启流程
    async ConfirmMatter() {
      // this.$confirm(`确认提交审批该事项吗？`, '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // })
      //   .then(async () => {
      const startActivityResult = await this.startActivity()
      if (startActivityResult !== 1) return

      // findAplly应该是查看新建的，而不是通过的。
      const applyResult = await this.findApply(this.loginUser.userId)
      if (!applyResult || applyResult.length === 0) return
      await this.updateOpsOrderProblem({
        id: this.dataId,
        applyUserId: this.loginUser.userId
      })
      const idx = applyResult.findIndex(
        (item) => Number(item.approveId) === Number(this.dataId)
      )
      const completeActivity = await this.completeActivity({
        taskId: applyResult[idx].taskId,
        approveStatue: 5 // 5 提交
      })

      if (completeActivity === 1) {
        // await this.insertOpsOrderProblemLog(7)
        // 改变状态为审批中
        const data = {
          id: this.dataId,
          statue: 2,
          processState: 1,
          applyUserId: this.loginUser.userId
        }
        let { code } = await this.updateOpsOrderProblem(data)
        if (code !== 1) {
          this.$message({ type: 'error', message: '提交失败' })
          return
        }
        this.isApprove = false
      }
      if (completeActivity.code === 1) {
        this.$message({ type: 'success', message: '提交成功' })
      }
      // })
      // .catch(() => {})
    },
    // 触发保存
    async confirmDialog() {
      // 调用渲染组件数据
      await this.$refs.customVFormRender.saveVFormInputData(this.dataId)
    },
    // 还原数据
    handleReset() {
      this.$refs.ruleForm.resetFields()
      this.selectfacility = []
      this.selectMan = []
      this.fileList = []
      this.backup = ''
      this.rulesForm.backup = ''
      this.$refs.seleman.chooseHyitOrg = ''
      this.$refs.seleman.chooseUsers = []
    },
    // 获取服务类型
    async findSysCat() {
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
      this.getMatter() // 获取事项表
    },
    // 查看公司
    async getSysCompany() {
      let userInfo = this.$store.getters.userInfo
      if (!userInfo) return
      let { code, model } = await request({
        url: api.company.getSysCompany,
        data: { companyId: userInfo.companyId }
      })
      if (code !== 1) return
      this.userInfo = { ...userInfo, companyName: model.companyName }
    },
    // 查询关联业务
    async findAssociatedEquipment() {
      if (!this.queryId) return
      let { data, code } = await request({
        url: api.opm.findOpsOrderProblemBs,
        data: {
          orderProblemId: this.queryId
        }
      })
      if (code !== 1) return
      this.business = data
      await this.loadTopoList()
    },
    // 获取关联业务列表数据
    async loadTopoList() {
      let { data, code } = await request({
        url: api.bsTopSystem.findBsTopSystem,
        data: { limit: -1 }
      })
      if (code !== 1) return
      for (let i = 0; i < data.length; i++) {
        const system = data[i].id
        for (let j = 0; j < this.business.length; j++) {
          const busine = this.business[j].bsId
          if (system === busine) {
            this.bsIds.push(data[i])
          }
        }
      }
    },
    // 查询关联设备
    async findOpsOrderProblemDevice() {
      if (!this.queryId) return
      let res = await request({
        url: api.opm.findOpsOrderProblemDevice,
        data: {
          orderProblemId: this.queryId
        }
      })
      this.device = res.data
      // this.selectfacility = res.data
      this.loadDeviceList()
      // this.loadCat()
    },
    // 获取it监控设备
    async loadDeviceList() {
      const itHost = await request({
        url: api.itMonitor.findHyitHost,
        data: this.findHyitHostQuery
      })
      if (itHost.code !== 1 && !itHost.data) return
      this.total = Number(itHost.count)
      const hostIds = []
      itHost.data.forEach((item) => hostIds.push(item.hyHostId))
      // 根据it监控去获取运维设备
      const opsServer = await request({
        url: api.automationOperations.findHyitOpsServer,
        data: { hostIds: hostIds.toString() }
      })
      itHost.data.forEach((item) => {
        const getOpsServerIdx = opsServer.data.findIndex(
          (getOpsServerItem) =>
            Number(getOpsServerItem.hostId) === Number(item.hyHostId)
        )
        if (getOpsServerIdx !== -1) {
          item.opsServerId = opsServer.data[getOpsServerIdx].id
          item.userName = opsServer.data[getOpsServerIdx].userName
          item.pwd = opsServer.data[getOpsServerIdx].pwd
          item.location = opsServer.data[getOpsServerIdx].location
          item.serverAlias = opsServer.data[getOpsServerIdx].serverAlias
          item.remarks = opsServer.data[getOpsServerIdx].remarks
        }
      })
      this.device.forEach((item) => {
        itHost.data.forEach((item2) => {
          if (item.deviceId === item2.hyHostId) {
            this.selectfacility.push(item2)
          }
        })
      })
    },
    // 获取IT监控设备列表 01
    findHyitHost() {
      const data = { ...this.findHyitHostQuery }
      if (data.devType === 0) data.devType = ''
      if (this.cmdbItemTypeId) data.cmdbItemTypeId = this.cmdbItemTypeId
      request({
        url: api.itMonitor.findHyitHost,
        data
      }).then((res) => {
        if (res.code !== 1) return
        if (!res.data) return
        for (let i = 0; i < res.data.length; i++) {
          const dev = res.data[i]
          for (let j = 0; j < this.device.length; j++) {
            const ice = this.device[j]
            if (dev['hyHostId'] === ice['deviceId']) {
              this.selectfacility.push(res.data[i])
            }
          }
        }
      })
    },
    // 获取IT运维设备列表 02
    loadCat() {
      request({
        url: api.automationOperations.findHyitOpsServer,
        data: {
          page: this.page,
          limit: this.limit,
          keyword: this.keywords,
          deviceTypeCatId: this.keyType
        }
      }).then((res) => {
        // this.getDeviceTwo = res.data
        for (let i = 0; i < res.data.length; i++) {
          const devId = res.data[i]
          for (let j = 0; j < this.device.length; j++) {
            const iceId = this.device[j]
            if (devId['hyHostId'] === iceId['deviceId']) {
              this.selectfacility.push(res.data[i])
            }
          }
        }
      })
    },
    // 查询联系人
    async findOmRequestNotify() {
      let res = await request({
        url: api.opm.findOpsOrderProblemContact,
        data: {
          orderProblemId: this.queryId,
          limit: -1
        }
      })
      if (res.code !== 1) return
      await this.findHrUserInfo(res.data)
    },
    async findHrUserInfo(selectUsers) {
      // 联系人列表
      let { code, data } = await request({
        url: api.opm.findHrUserInfo,
        data: { limit: -1, companyId: this.$auth.getUserSession().companyId }
      })
      if (code !== 1) return
      for (const it of selectUsers) {
        for (const user of data) {
          if (+it['userId'] === +user['userId']) {
            this.selectMan.push(user)
          }
        }
      }
    },
    // 获取附件
    async findAttachment() {
      let res = await request({
        url: api.opm.findOpsOrderProblemFile,
        data: {
          orderProblemId: this.queryId
        }
      })
      for (const it of res.data) {
        if (!it.fileUrl) continue
        this.fileList.push(JSON.parse(it.fileUrl))
      }
    },
    // 提交新增、编辑关联业务
    insertAssociatedEquipment(Id) {
      if (this.bsIds.length <= 0) return
      const bsId = this.bsIds.map((item) => {
        return item.id
      })
      // this.queryId ?: api.opm.insertOpsOrderProblemBs
      request({
        url: api.opm.updateOpsOrderProblemBsByIds,
        data: {
          id: Id,
          orderProblemId: Id,
          bsIds: bsId.join(','),
          orderType: 1
        }
      })
    },
    // 提交新增、编辑关联设备
    async insertOmRequestHost(Id) {
      if (this.selectfacility.length <= 0) return
      let monitorIds = []
      this.selectfacility.forEach((item) => {
        monitorIds.push(item.hyHostId)
      })
      if (monitorIds.length > 0) {
        // this.queryId ?: api.opm.insertOpsOrderProblemDevice
        await request({
          url: api.opm.updateOpsOrderProblemDeviceByIds, // IT监控设备
          data: {
            id: Id,
            orderProblemId: Id,
            deviceIds: monitorIds.join(',')
          }
        })
      }
    },
    // 提交新增、编辑关联联系人
    insertOmRequestNotify(Id) {
      request({
        url: api.opm.updateOpsOrderProblemContactBatch,
        data: {
          orderProblemId: Id,
          json: JSON.stringify(
            this.selectMan.map((it) => ({ userId: it.userId }))
          )
        }
      }).then((res) => {

      })
    },
    // 提交新增、编辑关联联系人
    insertOpsOrderProblemGroupMap(Id, groupId) {
      request({
        url: api.opm.insertOpsOrderProblemGroupMap,
        data: {
          problemId: Id,
          groupId
        }
      }).then((res) => {

      })
    },
    // 提交新增、编辑提交附件
    saveBatchAttachment(Id) {
      if (!this.fileList.length) return
      for (let i = 0; i < this.fileList.length; i++) {
        const fileArray = this.fileList[i]
        request({
          url: this.queryId
            ? api.opm.updateOpsOrderProblemFile
            : api.opm.insertOpsOrderProblemFile,
          data: {
            id: this.queryId,
            orderProblemId: Id,
            fileName: 'om_request',
            fileType: 'doc',
            fileUrl: JSON.stringify(fileArray)
          }
        })
      }
    },
    changeSolveEtime() {
      const n = new Date().getTime()
      if (new Date(this.rulesForm.solveEtime).getTime() < n) {
        this.$message({
          type: 'info',
          message: '期望解决时间不可以少于当前时间'
        })
        this.rulesForm.solveEtime = ''
      }
    },
    // 选择事件类型
    changeProblemType(eventType) {
      if (!this.id) this.setNoByProblemType()
      const parentType = this.subTypes.filter(
        (item) => item.catName === eventType.label
      )
      if (parentType.length <= 0) {
        this.rulesForm.serviceType = ''
        this.serviceTypeAble = true
        return
      }
      const selectSubTypes = this.subTypes.filter(
        (item) => item.parentId === parentType[0].catId
      )
      this.serviceTypeAble = false
      this.rulesForm.serviceType = selectSubTypes[0].catId
      this.selectSubTypes = selectSubTypes
    },
    // 根据事件类型生成编号
    setNoByProblemType() {
      // const idx = this.problemTypes.findIndex(item => Number(item.value) === Number(this.rulesForm.problemType))
      // if (idx !== -1) {
      const date = new Date()
      const Y = date.getFullYear()
      const M =
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1
      const D = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
      const h = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
      const m =
        date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
      const s =
        date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
      this.$set(
        this.rulesForm,
        'problemNo',
        `${this.sidebarMessage.problemNo}${Y}${M}${D}${h}${m}${s}${
          this.userInfo.userId ? this.userInfo.userId : ''
        }`
      )
      // }
    },
    // 查找运维小组
    async findHrUserGroup() {
      const form = { page: -1, limit: -1 }
      const { code, data } = await this.$request({
        url: this.api.sys.findHrUserGroup,
        data: form
      })
      if (code === 1) return data
    },
    async handleFindHrUserGroup() {
      const HrUserGroupList = await this.findHrUserGroup()
      if (HrUserGroupList.length > 0) {
        HrUserGroupList.forEach((item) => {
          item.ids = []
        })
      }
      this.HrUserGroupList = HrUserGroupList
      // this.HrUserGroupForm.groupId = this.HrUserGroupList[0].groupId
    },
    // 查找运维小组关系表
    async findHrUserGroupMap() {
      //   const form = {page: -1, limit: -1}
      const { code, data } = await this.$request({
        url: this.api.sys.findHrUserGroupMap,
        data: this.HrUserGroupForm
      })
      if (code === 1) return data
    },
    async handleFindHrUserGroupMap() {
      const HrUserGroupMap = await this.findHrUserGroupMap()
      if (this.HrUserGroupList.length > 0 && HrUserGroupMap.length > 0) {
        this.HrUserGroupList.forEach((item) => {
          HrUserGroupMap.forEach((v) => {
            if (item.groupId === v.groupId) {
              item.ids.push(v.userId)
            }
          })
        })
        this.initFindSysUser(this.HrUserGroupList[0].ids)
      }
      //   this.HrUserGroupList = HrUserGroupList
    },
    async initFindSysUser(ids = []) {
      let form = {
        page: -1,
        limit: -1,
        ids,
        companyId: this.$auth.getUserSession().companyId
      }
      const { data: userList, code } = await this.$request({
        url: this.api.sys.findSysUser,
        data: form
      })
      if (code !== -1) {
        this.userList = userList
        // const {code: infoCode, data: InfoData} = await this.findHrUserInfo(ids)
        // if (infoCode !== -1) {
        //   userList.forEach(item => {
        //     // const idx = InfoData.findIndex(item2 => { +item2.userId === +item.userId })
        //     // if (idx !== -1) {
        //     //   item.email = InfoData[idx].email
        //     //   item.mobile = InfoData[idx].mobile
        //     // }
        //     InfoData.forEach(item2 => {
        //       if (+item2.userId === +item.userId) {
        //         item.email = item2.email
        //         item.mobile = item2.mobile
        //       }
        //     })
        //   })
        //   //   this.tableList = userList

        // //
        // }
      }
    },
    async showMember(item) {
      this.HrUserGroupForm.groupId = item
      const hrUserGroup = await this.findHrUserGroupMap()
      if (hrUserGroup.length > 0) {
        const ids = []
        hrUserGroup.forEach((item) => {
          ids.push(item.userId)
        })
        if (ids.length > 0) {
          let form = {
            page: -1,
            limit: -1,
            ids,
            companyId: this.$auth.getUserSession().companyId
          }
          const { data: userList, code } = await this.$request({
            url: this.api.sys.findSysUser,
            data: form
          })
          if (code !== -1) {
            userList.forEach((it) => {
              const idx = hrUserGroup.find(
                (item) => +item.userId === +it.userId
              )
              if (idx) it['managerOrenginner'] = idx['classify']
            })

            this.userList = userList
          }
        }
      }
    },
    emitParentService(val) {
      this.sidebarMessage = val
      const isEdit = this.id

      // 服务类型
      if (!isEdit) this.rulesForm.serviceType = val.serviceType

      // 事项名称
      if (!isEdit) this.rulesForm.name = val.childName
      if (val?.operateType === 'onClick') this.rulesForm.name = val.childName

      if (val.groupId) {
        this.showMember(val.groupId)
      } else {
        this.showMember(this.HrUserGroupList[0].groupId)
      }
      this.rulesForm.problemType = val.problemType
      // this.rulesForm.serviceType = val.serviceType
      this.rulesForm.effectType = val.effectType
      this.rulesForm.severityType = val.severityType
      this.rulesForm.urgencyType = val.urgencyType
      // this.rulesForm = val.instanceId
      // this.rulesForm = val.formId
      // this.rulesForm = val.flow
      // this.rulesForm.code = val.problemNo
    },
    onDocumentTemplateDownLoad() {
      // 弹出下载模板框
      this.dialogDocumentTemplateDrawer = true
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-card {
  .el-card__header.el-card__body {
    background-color: #f6f6f6;
  }
  overflow: hidden;
  overflow-y: scroll;
}
.app-container {
  height: 100%;
  padding: 0;
}
.createMatter {
  height: 100%;
  display: flex;
  .service-type {
    width: 240px;
    background-color: #e5ecf6;
    min-height: 100%;
  }
  .right-contaniner {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .createMatter-title {
    color: #0145ab;
    width: 60px;
    padding-bottom: 5px;
    border-bottom: 3px solid;
  }

  .contacts {
    .contacts-info {
      line-height: 20px;
      > div:nth-child(1n + 2) {
        color: #999;
      }
    }
  }
}

/deep/
  .el-form-item.is-required:not(.is-no-asterisk)
  > .el-form-item__label:before {
  content: "*";
  color: #f56c6c;
  position: absolute;
  left: -10px;
  // margin-right: 4px;
}

::v-deep .myQuillEditor {
  .ql-container.ql-snow {
    height: 210px;
  }

  .ql-editor {
    height: 200px;
  }
}
.file-upload-flex {
  float: left;
}
.card-flex {
  display: flex;
  .card-button-ground {
    display: flex;
    font-size: 14px;
    padding-top: 20px;
    cursor: pointer;
    padding-left: 40px;
    svg {
      margin-left: 8px;
    }
    &:hover {
      color: #000;
      font-weight: 600;
    }
  }
}
.drawer-document-template {
  padding: 20px;
  > div {
    font-size: 14px;
    padding: 8px;
    cursor: pointer;
    &:hover {
      color: #000;
      font-weight: 600;
    }
  }
  svg {
    margin-left: 8px;
  }
}
.down-template {
  display: flex;
  align-items: center;
  svg {
    margin-left: 5px;
  }
}
</style>
