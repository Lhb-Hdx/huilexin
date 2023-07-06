<template>
  <div class="app-container opmDetail">
    <el-card shadow="never">
      <template v-slot:header>
        <el-page-header :content="title" :height="60" @back="$router.back()" />
      </template>
      <el-row>
        <el-col :span="17" class="pr-10">
          <div class="flex opm-header-title">
            <div style="fontsize: 20px">{{ `[${info.matter.problemNo}]` }}</div>
            <div style="margin-left: 20px; fontsize: 20px; fontweight: bold">{{ info.matter.name }}</div>
            <!--            <el-button v-permission="['reject']" size="mini">驳回</el-button>-->
          </div>
          <div class="opmDetail-subtitle flex">
            <div>服务类型： {{ currentOrderProblemService.serviceName }}</div>
            <div>事项状态：{{ info.matter.statue === null ? '待处理' : setAudioStatus(info.matter.statue) }}</div>
            <div>时间：{{ info.matter.createTime }}</div>
          </div>
          <!-- 事项tabs -->
          <DetailNav :components="components" :component-name.sync="componentName" />
          <!-- 事项内容组件 -->
          <div class="opmDetail-content">
            <component :is="componentName" :key="componentName" :info="info" />
          </div>
        </el-col>
        <el-col :span="7" class="pl-20 opmDetail-col-right">
          <h3 class="under-line font-16 mb-10">基础信息</h3>
          <div class="opmDetail-info font-16">
            <div>
              <div class="opmDetail-info-title">严重度：</div>
              {{ $tool.formatStr(info.matter.severityType, '1:低,2:中,3:高') }}
            </div>
            <div>
              <div class="opmDetail-info-title">紧急度：</div>
              {{ $tool.formatStr(info.matter.effectType, '1:低,2:中,3:高') }}
            </div>
            <div>
              <div class="opmDetail-info-title">影响度：</div>
              {{ $tool.formatStr(info.matter.urgencyType, '1:低,2:中,3:高') }}
            </div>
            <div>
              <div class="opmDetail-info-title">时间：</div>
              {{ info.matter.createTime }}
            </div>
            <div>
              <div class="opmDetail-info-title">提交人：</div>
              {{ createUser.userRealName }}
            </div>
            <!--            <div><div class="opmDetail-info-title">申请人单位：</div>{{ createUser.companyName }}</div>-->
            <!--            <div><div class="opmDetail-info-title">申请人：</div>{{ lockUser.userRealName }}</div>-->

            <!-- <div class="opmDetail-info-title">锁定人信息</div> -->
            <div>
              <div class="opmDetail-info-title">电话：</div>
              {{ createUser.mobile }}
            </div>
            <div>
              <div class="opmDetail-info-title">邮箱：</div>
              {{ createUser.email }}
            </div>
            <div>
              <div class="opmDetail-info-title">所在职位：</div>
              {{ createUser.catName }}
            </div>
          </div>
          <div style="margin: 60px 0 60px 0">
            <!-- problemType===5是运维登记，无任何操作功能 -->
            <!-- 运维人员/工程师才能用 -->
            <!-- <div>
              <div v-if="Number(info.matter.lockUserId) === Number(loginUser.userId)" class="mt-20">
                <template v-if="info.matter.lockStatue === 1 && info.matter.statue !== 7">
                  <div v-if="showSubmitAudio">
                    <div v-if="info.matter.statue === 1 && info.matter.processState === 1">
                      <div class="mt-10">
                        <el-button type="primary" size="midium" @click="handlerClose">已处理，确认关闭事项</el-button>
                      </div>
                      <div class="mt-10">
                        <el-button type="primary" size="midium" @click="commitToManager">确认问题，提交给运维主管审批</el-button>
                      </div>
                      <div class="mt-10">
                        <el-button v-permission="['Unlock']" type="primary" @click="handleLockStatus(0)">解锁</el-button>
                        <div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div> -->

            <!-- 没锁可以锁定 -->
            <!-- <div v-if="info.matter.lockStatue !== 1 && +info.matter.userId !== +loginUser.userId" class="mt-10">
              <el-button v-permission="['Lock']" type="primary" @click="handleLockStatus(1)">锁定</el-button>
            </div> -->

            <!-- 运维主管才能看 -->
            <!-- <div> -->
            <!-- 审批流程也是锁住的,锁定用户和登录用户一致 -->
            <!-- <div v-if="info.matter.lockStatue === 1"> -->
            <!-- 主管或以上级别才能查看 -->
            <!-- <div> -->
            <!-- statue ===5为待计划 ， -->
            <!-- <div v-if="+managerId === +loginUser.userId && info.matter.processState === 4">
                    <h3 class="under-line font-16 mt-20 mb-10">审批流程</h3>
                    <el-select v-model="getActivityBpmnKey" placeholder="请选择流程" class="filter-item" @change="changeTask">
                      <el-option v-for="item in newOaActivityList" :key="item.id" :label="item.name" :value="item.bpmnKey" />
                    </el-select>
                    <div class="mt-20">
                      <el-button type="primary" @click="ConfirmMatter">提交审批</el-button>
                    </div>
                  </div> -->
            <!-- statue ===4为驳回 ，处理状态为。 -->
            <div v-if="rollBackApprove">
              <template v-if="info.matter.statue === 4">
                <h3 class="under-line font-16 mt-20 mb-10">审批流程</h3>
                <el-select v-model="getActivityBpmnKey" placeholder="请选择流程" class="filter-item" @change="changeTask">
                  <el-option v-for="item in newOaActivityList" :key="item.id" :label="item.name" :value="item.bpmnKey" />
                </el-select>
                <div class="mt-20">
                  <el-button type="primary" @click="ConfirmMatter">提交审批</el-button>
                </div>
              </template>
            </div>
            <!-- statue ===3为已审批 ，处理状态为处理中。 isFinish是否为审批完成状态了 -->
            <!-- <template v-if="info.matter.statue === 3 && info.matter.processState === 5 && +info.matter.lockUserId === +loginUser.userId">
                    <div class="flex mt-20">
                      <el-button type="success" @click="confirmFinish">确认完成</el-button>
                      <el-button type="info" @click="handleFault">处理失败</el-button>
                    </div>
                  </template> -->
            <!-- </div> -->
            <!-- </div> -->
            <!-- </div> -->

            <!-- statue ===2为审批中 ，处理状态为处理中。&&isApprove是否为下一个审批人 -->
            <div>
              <template v-if="info.matter.statue === 2 && isApprove">
                <div class="flex mt-20">
                  <el-button type="warning" :loading="rejectBtnLoading" @click="rejectMatter">驳回</el-button>
                  <el-button type="success" :loading="finishBtnLoading" @click="finishMatter">审批通过</el-button>
                  <el-button type="danger" :loading="failBtnLoading" @click="failMatter">审批不通过</el-button>
                </div>
              </template>
            </div>
          </div>

          <!-- --------------------------------- -->
          <h3 class="under-line font-16 mt-20 mb-10">事项记录</h3>

          <el-timeline class="no-padding margin-top-15">
            <el-timeline-item v-for="(activity, index) in logData" :key="index" :icon="setTimeLineIcon(index)" :color="setTimeLineColor(index)" :timestamp="activity.approveTime" size="large">
              <div>
                {{ activity.approveLog }}
              </div>
              <div>{{ getNextApproveMan(index) }}</div>
              <!-- <div>{{ getNextApproveManObj(activity.approveTime) }}</div> -->
            </el-timeline-item>
          </el-timeline>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import DetailNav from './components/detailNav.vue'
import OpmDetailOverview from './components/opmDetailOverview'
import OpmAnalyseView from './components/opmAnalyseView'
import OpmWorkRecordView from './components/opmWorkRecordView'
import OpmSummaryView from './components/opmSummaryView'
import OpmDocumentView from './components/opmDocumentView'
import OpmRelatedView from './components/opmRelatedView'
import OpmChangeView from './components/opmChangeView'
import request from '@/utils/request'
import api from '@/api/api'
import { mapState, mapMutations, mapActions } from 'vuex'
import opmFunction from '@/params-model/opm/function'
const {messageSendToPlatform} = opmFunction
export default {
  components: {
    DetailNav,
    OpmDetailOverview,
    OpmAnalyseView,
    OpmWorkRecordView,
    OpmSummaryView,
    OpmDocumentView,
    OpmRelatedView,
    OpmChangeView
  },
  data() {
    return {
      componentName: 'OpmDetailOverview',
      activities: [],
      components: [
        {
          label: '概况',
          componentName: 'OpmDetailOverview'
        } /* ,        { label: '分析', componentName: 'OpmAnalyseView' },        { label: '任务计划', componentName: 'OpmPlanView' },        { label: '工作日志', componentName: 'OpmWorkLogView' },        { label: '工作记录', componentName: 'OpmWorkRecordView' },        { label: '总结&方案', componentName: 'OpmSummaryView' },        { label: '过程文档', componentName: 'OpmDocumentView' },        { label: '相关知识', componentName: 'OpmRelatedView' },        { label: '变更记录', componentName: 'OpmChangeView' } */
      ],
      info: {
        matter: {
          lockStatue: 1
        }
      },
      isFinish: false, // 是否已经完成
      isApprove: false, // 是否是审批人
      instanceId: '',
      userInfo: {}, // 提交人信息
      companyInfo: {},
      hyitOrg: {},
      subTypes: [], // 服务类型
      typeOption: [
        // 事项类型
        { label: '故障问题', value: 1 },
        { label: '服务请求', value: 2 },
        { label: '整改变更', value: 3 },
        { label: '日常事务', value: 4 },
        { label: '运维登记', value: 5 }
      ],
      findHyitHostQuery: {
        keyword: '',
        agent: [],
        devType: '',
        hostType: 1,
        page: 1,
        limit: -1
      },
      orderFile: [],
      organizationInfo: {
        catName: ''
      },
      rejectBtnLoading: false,
      finishBtnLoading: false,
      failBtnLoading: false,
      logState: [
        { id: 1, value: '创建了流程,待上级部门审批' },
        // { id: 2, value: '指派' },
        // { id: 3, value: '领取' },
        // { id: 4, value: '解锁' },
        // { id: 5, value: '关闭' },
        // { id: 6, value: '确认事项，待上级部门审核' },
        // { id: 7, value: '安排工程师处理 , 待上级部门审批' },
        // { id: 8, value: '无法处理' },
        // { id: 9, value: '完成计划' },
        { id: 10, value: '流程申请审批通过' },
        // { id: 11, value: '正在处理中' },
        // { id: 12, value: '处理失败,关闭事项' },
        { id: 13, value: '流程申请审批失败' },
        { id: 14, value: '驳回了申请,待申请人处理' },
        { id: 15, value: '撤回了流程申请'}
      ],
      loginUser: {},
      testModel: '',
      // managerId: '', // 服务类型关联主管ID
      testList: [
        { id: 1, label: '事项流程' },
        { id: 2, label: '事项流程2' }
      ],
      getActivityBpmnKey: '',
      newOaActivityList: [],
      showSubmitAudio: false,
      audioStatus: [
        // { statue: 1, value: '未提交', color: 'danger' },
        // { statue: 0, value: '待受理', color: 'success' },
        // { statue: 1, value: '已确认', color: 'danger' },
        { statue: 2, value: '审批中', color: 'danger' },
        { statue: 3, value: '已审批', color: 'success' },
        { statue: 4, value: '驳回', color: 'danger' },
        { statue: 5, value: '不通过', color: 'danger' }
        // { statue: 5, value: '待计划', color: 'success' },
        // { statue: 6, value: '待确认', color: 'success' },
        // { statue: 5, value: '待审核', color: 'success' },
        // { statue: 7, value: '关闭', color: 'success' },
        // { statue: 8, value: '修改', color: 'success' }
      ],
      logData: [],
      createUser: {},
      lockUser: {},
      nextApproveObj: true, // 下一个审批人
      hasSubmit: false,
      filterApprove: [], // 驳回的审批数组
      rollBackApprove: false,
      currentOrderProblemService: {},
      isLockUserInGroupGovernor: false, // 是否是锁定用户所在分组主管角色
      flowSuccessSetLogText: ''
    }
  },
  computed: {
    setTimeLineIcon() {
      return function (index) {
        if (this.info.matter.statue === 7) return 'el-icon-check'
        if (this.logData.length === 1) return 'el-icon-check'
        return index === this.logData.length - 1 ? 'el-icon-more' : 'el-icon-check'
      }
    },
    setTimeLineColor() {
      return function (index) {
        if (this.info.matter.statue === 7) return '#0bbd87'
        if (this.logData.length === 1) return '#0bbd87'
        return index === this.logData.length - 1 ? '#E6A23C' : '#0bbd87'
      }
    },
    title() {
      return this.$route.meta.title
    },
    id() {
      return this.$route.query.id
    },
    alarmId() {
      return this.$route.query.alarmId
    },
    groupId() {
      return this.$route.query.groupId
    },
    // 跳转过来的taskId
    taskId() {
      return this.$route.query.taskId || false
    },
    // 跳转过来的userId
    userId() {
      return this.$route.query.userId || ''
    },
    setAudioStatus() {
      const that = this
      return function (statue) {
        const idx = that.audioStatus.findIndex(item => Number(item.statue) === Number(statue))

        if (idx !== -1) return that.audioStatus[idx].value
      }
    },
    getLogsValueByState() {
      return function (status, receiveName) {
        const filter = this.logState.filter(item => item.id === status)
        console.log('filter: ', filter)
        // if (filter[0].id === 6) {
        //   return `确认事项，待${receiveName}主管审核`
        // }
        // if (filter[0].id === 2) {
        //   return `指派 ${receiveName}`
        // }
        return filter[0].value
      }
    },
    getNextApproveMan() {
      return function (index) {
        if (index === this.logData.length - 1) {
          if (this.nextApproveObj.userRealName && this.filterApprove.length > 0) {
            if (Number(this.nextApproveObj.userId) === Number(this.filterApprove[0].userId) && this.info.matter.statue === 5) {
              return `  需要重新提交审批：${this.nextApproveObj.userRealName}`
            } else if ([1, 5].includes(this.logData[index]['approveStatue'])) { // 提交审批或者审批中显示下一个审批人
              return `  下一个审批人是：${this.nextApproveObj.userRealName}`
            }
          } else if (this.nextApproveObj.roleName) {
            return `下一个审批角色是:${this.nextApproveObj.roleName}`
          }
          return ''
        }
      }
    },
    getNextApproveManObj() {
      return function (time) {
        const filterList = this.logData.filter(item => item.approveStatue === true)
        filterList.sort((a, b) => {
          return this.$tool.getTimeF(a.approveTime) - b.approveTime
        })
        if (this.nextApproveObj.userRealName) {
          if (this.$tool.getTimeF(time) === this.$tool.getTimeF(filterList[filterList.length - 1].approveTime)) {
            return `  下一个审批人是：${this.nextApproveObj.userRealName}`
          }
        }
        return ''
      }
    },
    isManagerFlag() {
      return this.$auth.getVuexStoragePermission('SubmitComplete')
    },
    ...mapState('opm', ['opmPlanFlag', 'opmTaskList', 'opsProblemName', 'approveList', 'managerId'])
  },
  async created() {
    const newOaActivityList = await this.findNewOaActivity(586)
    this.newOaActivityList = newOaActivityList
    await this.getOverview()
    await this.findHrUserInfo()
    await this.getSysCompany()
    await this.getOrganization()
    // await this.getHyitOrg()
    await this.findSysCat()
  },
  beforeDestroy() {
    this['opm/setOpmPlanFlag'](false)
    this['opm/resetTaskList']()
  },
  methods: {
    ...mapMutations(['opm/setOpmPlanFlag', 'opm/resetTaskList', 'opm/setOpsProblemName', 'opm/setHostDeviceList', 'opm/setRelatedBusinessList', 'opm/opmTaskList', 'opm/setTaskList', 'opm/setManagerId']),
    ...mapActions(['opm/findApproveAc']),

    // 获取预览界面事项的数据
    async getOverview() {
      // 获取工单信息,设置this.info
      await this.getOmRequest()
      // 查询审批列表
      await this['opm/findApproveAc']()

      // 查询事项的附件
      await this.findOpsOrderProblemFile()
      // 事项关联设备
      const itDevice = await this.findOpsOrderProblemDevice()
      if (itDevice.length > 0) {
        this.loadDeviceList(itDevice)
        // await this.findHyitHost(itDeviceIds)
      }
      // const opsDevice = await this.findOpsOrderProblemDevice(2)
      // 事项关联业务
      const bsDevice = await this.findOpsOrderProblemBs()
      if (bsDevice.length > 0) {
        const bsIds = []
        bsDevice.forEach(item => {
          bsIds.push(item.bsId)
        })
        const getBs = await this.findBsTopSystem(bsIds)
        const bsList = []
        if (getBs.length <= 0) return
        getBs.forEach(item => {
          bsList.push({
            id: String(item.id),
            name: item.name
          })
        })
        this.$set(this.info, 'bsList', bsList)
        this['opm/setRelatedBusinessList'](bsList)
      }
      // 事项记录 this.id=>query.id
      let form = { page: -1, limit: -1, orderId: this.id }
      let logData = await this.findNewOaApproveLog(this.id)
      console.log('logData: ', logData)

      // 新建和提交的时间一样，故先对状态排一次序
      logData.sort((a, b) => {
        return a.approveStatue - b.approveStatue
      })
      if (logData.length > 0) {
        this.hasSubmit = true
        // const res = await request({ url: api.opm.getTaskListByInstanceId, data: {instanceId: this.logData[0].instanceId } })
        // 根据logData最新的instanceID来判断下一个审批人和审批状态是否完成
        await this.findTask(logData)
      }

      // 拼接事项记录
      const { code: probloemCode, data: problemLogs } = await request({ url: api.opm.findOpsOrderProblemLog, data: form })
      if (probloemCode !== 1) {
        this.$message({ type: 'error', message: '获取事项记录失败' })
      } else {
        if (problemLogs.length !== 0) {
          // 根据事项ID过滤出来的事项数组
          // const filterLogs = problemLogs.filter(item => +item.orderId === +this.id)
          const userIds = []
          problemLogs.forEach(item => {
            if (item.userId) userIds.push(item.userId)
            if (item.receiveId) userIds.push(item.receiveId)
          })
          const userData = await request({ url: api.sys.findSysUser, data: { ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, companyId: this.$auth.getUserSession().companyId } })

          problemLogs.forEach(item => {
            let userIndex = -1
            let receiveIndex = -1
            let userName = ''
            let receiveName = ''
            if (userData.code === 1 && userData.data) {
              userIndex = userData.data.findIndex(items => +items.userId === +item.userId)
              receiveIndex = userData.data.findIndex(items => +items.userId === +item.receiveId)
            }
            if (userIndex !== -1) userName = userData.data[userIndex].realName
            if (receiveIndex !== -1) receiveName = userData.data[receiveIndex].realName

            let approveTime = item.createTime
            // 记录log
            let approveLog = `${[10, 13].includes(item.status) ? '' : userName} ${this.getLogsValueByState(item.status, receiveName)}`
            let approveStatus = item.status
            logData.push({ approveLog, approveTime, approveStatus })
            // 按时间戳排序升序
          })
          // logData = logData

          this.logData = logData.sort((a, b) => {
            return this.$tool.getTimeF(a.approveTime) - this.$tool.getTimeF(b.approveTime)
          }).filter(it => ![4, 6].includes(it.approveStatue))
        }
      }

      const idx = logData.findIndex(items => items.approveId === this.id)
      // statue为未提交，startActivity启动流程statue变成2(审核中)了

      if (this.info.matter.statue === 1 || this.info.matter.statue === null || this.info.matter.statue === 0) {
        this.showSubmitAudio = true
      } else {
        if (idx !== -1) {
          this.showSubmitAudio = logData[idx].approveStatue === 4 || logData[idx].approveStatue === 6 || logData[idx].approveStatue === 7
        }
      }
      if (this.info.matter.userId) {
        const createUser = await this.commonRequestFn.findHrUserInfo({
          ids: this.info.matter.userId,
          companyId: this.$auth.getUserSession().companyId
        })
        if (createUser.length > 0) this.createUser = createUser[0]
        const getSysCompany = await this.getSysCompany(this.createUser.companyId)
        this.$set(this.createUser, 'companyName', getSysCompany.companyName)
        const positionList = await this.getPositionCat()
        const positionFliterList = positionList.filter(item => item.catId === this.createUser.positionCatId)
        if (positionFliterList.length > 0) {
          this.$set(this.createUser, 'catName', positionFliterList[0].catName)
        }
        // const getHyitOrg = await this.getHyitOrg(this.createUser.organizationCatId)
        // if (getHyitOrg) this.$set(this.createUser, 'orgName', getHyitOrg.hyOrgName)
      }
      // if (this.info.matter.lockUserId) {
      // const lockUser = await this.commonRequestFn.findHrUserInfo({
      //   ids: this.info.matter.lockUserId
      // })
      // if (lockUser.length > 0) this.lockUser = lockUser[0]
      // const getHyitOrg = await this.getHyitOrg(this.lockUser.organizationCatId)

      // if (getHyitOrg) this.$set(this.lockUser, 'orgName', getHyitOrg.hyOrgName)
      // }
      // 获取所有作业到vuex，后续操作改变所有作业状态
      // const taskList = await this.findOpsOrderWorkTask()
      // this['opm/setTaskList'](taskList)
      // await this.setFlowSuccessSetLogText()
    },
    async findOpsOrderWorkTask() {
      const { data, code } = await this.$request({
        url: api.opm.findOpsOrderWorkTask,
        data: {
          orderProblemId: this.$route.query.id,
          limit: -1
        }
      })
      if (code === 1) return data || []
    },
    // 获取工单信息
    async getOmRequest() {
      let { code, model } = await request({
        url: api.opm.getOpsOrderProblem,
        data: { id: this.id }
      })
      if (code !== 1) return
      this.$set(this.info, 'matter', model)

      // vuex存事项名字，给计划里面方便取
      this['opm/setOpsProblemName'](model.name)
      this.loginUser = this.localStorageOperation('get', 'userInfo')

      // 获取事项的服务类型
      const getOpsOrderProblemService = await this.getOpsOrderProblemService()
      if (getOpsOrderProblemService.code === 1 && getOpsOrderProblemService.model) {
        this.currentOrderProblemService = getOpsOrderProblemService.model
        const idx = this.newOaActivityList.findIndex(item => +item.id === +getOpsOrderProblemService.model.instanceId)
        this.getActivityBpmnKey = idx !== -1 ? this.newOaActivityList[idx].bpmnKey : ''
        await this.userDefineFormValue()
      }
      const groupMap = await this.findOpsOrderProblemGroupMap(this.info.matter.id)
      if (groupMap.length) {
        const findHrUserGroupMap = await this.findHrUserGroupMap({ groupId: groupMap[0].groupId, classify: 'manager' })
        if (findHrUserGroupMap && findHrUserGroupMap.length > 0) {
          this['opm/setManagerId'](findHrUserGroupMap[0].userId)
          // this.managerId = findHrUserGroupMap[0].userId
        }
      }

      // 渲染tab栏目
      this.components = [
        { label: '概况', componentName: 'OpmDetailOverview' },
        { label: '分析', componentName: 'OpmAnalyseView' },
        // { label: '计划', componentName: 'OpmPlanView' },
        // { label: '工作日志', componentName: 'OpmWorkLogView' },
        { label: '工作记录', componentName: 'OpmWorkRecordView' },
        { label: '总结&方案', componentName: 'OpmSummaryView' },
        { label: '过程文档', componentName: 'OpmDocumentView' },
        { label: '相关知识', componentName: 'OpmRelatedView' },
        { label: '变更记录', componentName: 'OpmChangeView' }
      ]
      this.components.forEach((item, index) => {
        // 根据权限显示tabs。找不到则删除
        if (this.$auth.getVuexStoragePermission(item.componentName) === -1) {
          this.components.splice(index, 1)
        }
      })
      if ([5].includes(this.info.matter.processState)) this.components.push({ label: '评价', componentName: 'opmEvaluate' })

      // 判断角色身份是否有审批权限,有的话请求任务列表接口，有任务就将任务列表flag转为true
      if (this.isManagerFlag) {
        let form = { page: 1, limit: -1, orderProblemId: this.id }
        let { data: taskData, code: taskCode } = await this.$request({ url: this.api.opm.findOpsOrderWorkTask, data: form })
        if (taskCode !== 1) return
        if (taskData.length > 0) {
          this['opm/setOpmPlanFlag'](true)
        }
      }
    },
    // 查看公司
    async getSysCompany(companyId) {
      let { code, model } = await request({ url: api.company.getSysCompany, data: { companyId } })
      if (code !== 1) return
      return model
    },
    async findHrUserGroupMap(query) {
      const { code, data } = await this.$request({ url: this.api.sys.findHrUserGroupMap, data: query })
      if (code !== 1) return
      return data
    },
    async findOpsOrderProblemGroupMap(problemIds) {
      const { data, code } = await this.$request({ url: this.api.opm.findOpsOrderProblemGroupMap, data: { problemIds } })
      if (code === 1) return data
    },
    // 提交人
    async findHrUserInfo() {
      let { code, data } = await request({
        url: api.opm.findHrUserInfo,
        data: { userId: this.info['userId'], companyId: this.$auth.getUserSession().companyId }
      })
      if (code !== 1) return
      this.userInfo = data[0] || {}
    },
    // 查所在职位
    async getPositionCat() {
      const { data, code } = await request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_职位', module: 2 }
      })
      if (code === 1) {
        return data
      }
    },
    // 部门区域
    // async getHyitOrg() {
    //   let { model, code } = await request({ url: api.org.getHyitOrg, data: { hyOrgId: 5 }})
    //   if (code !== 1) return
    //   this.hyitOrg = model
    // },
    // 服务类型
    async findSysCat() {
      // 测试
      // await this.findApply(this.loginUser.userId)

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

    // 查询事项的附件
    async findOpsOrderProblemFile() {
      let { code, data } = await request({
        url: api.opm.findOpsOrderProblemFile,
        data: { orderProblemId: this.id }
      })
      if (code !== 1) return
      const fileList = []
      if (data.length <= 0) {
        return
      }
      data.forEach(item => {
        const fileItem = JSON.parse(item.fileUrl)
        fileList.push({
          id: fileItem.id,
          url: fileItem.url,
          name: fileItem.name
        })
      })
      this.$set(this.info, 'fileList', fileList)
    },
    // 查询事项关联的设备
    async findOpsOrderProblemDevice() {
      let { code, data } = await request({
        url: api.opm.findOpsOrderProblemDevice,
        data: { orderProblemId: this.id }
      })
      if (code !== 1) return
      return data
    },
    // 查询it监控设备
    async findHyitHost(ids) {
      if (ids.length === 0) return
      let { code, data } = await request({
        url: api.itMonitor.findHyitHost,
        data: { hostType: 1, ids, limit: -1 }
      })
      if (code !== 1) return
      if (data) {
        const hostList = []
        data.forEach(item => {
          hostList.push({
            hostId: String(item.hyHostId),
            hyMarkName: item.hyMarkName,
            ip: item.hyIp,
            port: item.hyPort,
            originalData: item
          })
        })
        this.$set(this.info, 'hostList', hostList)
      }
    },
    // 获取it监控设备
    async loadDeviceList(itDevice) {
      const itHost = await request({ url: api.itMonitor.findHyitHost, data: this.findHyitHostQuery })
      if (itHost.code !== 1 && !itHost.data) return
      if (!itHost.data) return
      this.total = Number(itHost.count)
      const hostIds = []
      itHost.data.forEach(item => hostIds.push(item.hyHostId))
      // 根据it监控去获取运维设备
      const opsServer = await request({ url: api.automationOperations.findHyitOpsServer, data: { hostIds: hostIds.toString() } })
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
      const hostList = []
      itDevice.forEach(item => {
        itHost.data.forEach(item2 => {
          if (item.deviceId === item2.hyHostId) {
            // hostList.push(item2)
            hostList.push({
              hyHostId: String(item2.hyHostId),
              hyMarkName: item2.hyMarkName,
              ip: item2.hyIp,
              port: item2.hyPort,
              originalData: item2
            })
          }
        })
      })
      this.$set(this.info, 'hostList', hostList)
      this['opm/setHostDeviceList'](hostList)
    },
    // 查询事项关联的业务系统
    async findOpsOrderProblemBs() {
      let { code, data } = await request({
        url: api.opm.findOpsOrderProblemBs,
        data: { orderProblemId: this.id }
      })
      if (code !== 1) return
      return data
    },
    // 查询业务系统
    async findBsTopSystem(ids) {
      let { code, data } = await request({
        url: api.bsTopSystem.findBsTopSystem,
        data: { ids, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    // 查询职位
    async getOrganization() {
      let { code, model } = await request({ url: api.sys.getSysCat, data: { systemName: 'userDefine', classify: 'userDefine_职位', catId: this.userInfo.organizationCatId } })
      if (code !== 1) return
      this.organizationInfo = model
    },
    // 修改锁定状态
    // handleLockStatus(status) {
    //   this.$confirm(`确认${status === 1 ? '锁定' : '解锁'}该事项吗？`, '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   })
    //     .then(async () => {
    //       // if()
    //       const data = { id: this.id, lockStatue: status, lockUserId: status === 1 ? this.loginUser.userId : null, statue: status, processState: status }
    //       if (!this.info.matter.responseTime && !this.currentOrderProblemService.flow) {
    //         data.responseTime = this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date())
    //       } else if (!this.info.matter.responseTime && this.currentOrderProblemService.flow) data.responseTime = 0
    //       // let {code} = await request({ url: api.opm.updateOpsOrderProblem, data })
    //       // 初始化为null才改变
    //       status ? await this.updateOpsOrderProblem(data) : await request({ url: api.opm.updateOpsOrderProblem, data })
    //       status ? await this.insertOpsOrderProblemLog(3) : await this.insertOpsOrderProblemLog(4)
    //       // 锁定解锁推送事项发起人
    //       await this.getOverview()
    //       if (status) {
    //         await messageSendToPlatform(2, {receiverIds: this.info.matter.userId, title: this.info.matter.name, problemNo: this.info.matter.problemNo, status: 1})
    //       } else {
    //         await messageSendToPlatform(3, {receiverIds: this.info.matter.userId, title: this.info.matter.name, problemNo: this.info.matter.problemNo, status: 0})
    //       }
    //     })
    //     .catch(() => {})
    // },
    // 新增事项记录
    async insertOpsOrderProblemLog(status, receiveId = '') {
      let date = new Date()
      await request({
        url: api.opm.insertOpsOrderProblemLog,
        data: { userId: this.loginUser.userId, orderId: this.id, receiveId: receiveId, status: status, createTime: this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', date) }
      })
    },
    async insertOpsOrderWorkTask() {
      this.loading = true
      const { code, model } = await request({
        url: api.opm.insertOpsOrderWorkTask,
        data: { ...this.rulesForm, orderProblemId: this.id, createUserId: this.loginUser.userId }
      })
      this.loading = false
      if (code !== 1) return
      return model
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
    // 更新事项状态
    async updateOpsOrderProblem(data) {
      return await request({ url: api.opm.updateOpsOrderProblem, data })
    },
    async updateAllOpsOrderWorkTask(data) {
      for (const it of this.opmTaskList) {
        await request({
          url: api.opm.updateOpsOrderWorkTask,
          data: { id: it.id, ...data }
        })
      }
    },
    // 主管提交审核，开启流程
    ConfirmMatter() {
      this.$confirm(`确认提交审批该事项吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // if (applyResult) { return }
          // if (!this.opmPlanFlag) {
          //   this.$message({
          //     type: 'error',
          //     message: '请先安排作业计划',
          //     showClose: true,
          //     center: true
          //   })
          //   this.componentName = 'OpmPlanView'

          //   return
          // }
          if (!this.getActivityBpmnKey) {
            this.$message({
              type: 'error',
              message: '请先选择一个流程',
              showClose: true,
              center: true
            })
            return
          }
          // 驳回的不需要启动新流程
          // if (this.info.matter.statue === 4) {
          //   this.rollBackCommit()
          //   return
          // }
          // if (this.info.matter.statue !== 4) {
          const startActivityResult = await this.startActivity()
          if (startActivityResult !== 1) return
          // }

          // findAplly应该是查看新建的，而不是通过的。
          const applyResult = await this.findApply(this.loginUser.userId)

          if (!applyResult || applyResult.length === 0) return
          await this.updateOpsOrderProblem({ id: this.id, applyUserId: this.loginUser.userId })
          const idx = applyResult.findIndex(item => Number(item.approveId) === Number(this.id))
          const completeActivity = await this.completeActivity({
            taskId: applyResult[idx].taskId,
            // 5 提交
            approveStatue: 5
          })

          if (completeActivity === 1) {
            // await this.insertOpsOrderProblemLog(7)
            // 改变状态为审批中
            const data = { id: this.id, statue: 2, processState: 1, applyUserId: this.loginUser.userId }
            // const data = { id: this.id, statue: 2, processState: 0 }
            let { code } = await this.updateOpsOrderProblem(data)
            if (code !== 1) {
              this.$message({ type: 'error', message: '提交失败' })
              return
            }
            // await this.updateAllOpsOrderWorkTask({ statue: 2 })
            this.isApprove = false
            await this.getOverview()
            this.checkRollBack()
          }

          // 增加计划任务
          // const model = await this.insertOpsOrderWorkTask()
          // await this.insertOpsOrderWorkTaskDevice({workTaskId: model.id, deviceType: 1, deviceId: item.hyHostId})
          // await this.insertOpsOrderProblemBs({id: model.id, orderProblemId: model.id, orderType: 2, bsIds: bsIds})
          if (completeActivity.code === 1) {
            this.$message({
              type: 'success',
              message: '提交成功'
            })
          }
        })
        .catch(() => {})
    },
    // 提交给主管审核
    // commitToManager() {
    //   this.$confirm(`确认提交主管审核该事项吗？`, '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   })
    //     .then(async () => {
    //       // statue==5  待审核
    //       const data = { id: this.id, processState: 4 }
    //       let { code } = await this.updateOpsOrderProblem(data)
    //       if (code !== 1) return
    //       this.showSubmitAudio = false
    //       await this.insertOpsOrderProblemLog(6, this.managerId)
    //       await this.getOverview()
    //       // 提交给主管审核推发起人和主管
    //       await messageSendToPlatform(4, {receiverIds: `${this.info.matter.userId},${this.managerId}`, title: this.info.matter.name, problemNo: this.info.matter.problemNo, status: 4})
    //     })
    //     .catch(() => {})
    // },
    // 启动流程
    async startActivity() {
      // const getActivity = await this.findNewOaActivity(496)
      const { msg, code } = await request({
        url: api.activity.startActivity,
        data: {
          bpmnKey: this.getActivityBpmnKey,
          approveType: 586,
          approveId: this.id,
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
    //  流程配置
    async findNewOaActivity(type) {
      const { code, data } = await request({
        url: api.activity.findNewOaActivity,
        data: { page: 1, limit: -1, type }
      })
      if (code !== 1) return
      return data
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
    // 确认通过，关闭事项statue7，处理成功 processState: 2
    confirmFinish() {
      this.$confirm(`确认任务计划已完成吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // const findOpsOrderWorkTask = await this.$request({ url: this.api.opm.findOpsOrderWorkTask, data: { orderProblemId: this.id, limit: -1 } })
          // if (findOpsOrderWorkTask.code === 1 && findOpsOrderWorkTask.data && findOpsOrderWorkTask.data.length > 0) {
          //   const overTask = findOpsOrderWorkTask.data.filter(el => +el.statue !== null)
          //   if (overTask.length < findOpsOrderWorkTask.data.length) {
          //     this.$message('事项有未处理的计划，暂时无法完成处理成功')
          //     return
          //   }
          // }
          const data = { id: this.id, statue: 7, processState: 2 }
          await this.updateOpsOrderProblem(data)
          // await this.insertOpsOrderProblemLog(10)
          // await this.updateAllOpsOrderWorkTask({ statue: 8 })
          await this.getOverview()
          // 处理成功推发起人
          await messageSendToPlatform(6, {receiverIds: this.info.matter.userId, title: this.info.matter.name, problemNo: this.info.matter.problemNo, status: 2})
          if (this.alarmId) {
            await this.updateZbxAlarmLog(this.alarmId)
          }
          // 如果事项是在告警日志创建的关闭事项，要插入一条记录
          if (this.info.matter.alarmId) {
            await this.commonRequestFn.insertOpsOrderAlarmLog({
              alarmId: this.info.matter.alarmId,
              alarmModelType: 1,
              alarmHandleLog: `${this.loginUser.realName}关闭了告警事项`,
              userId: this.loginUser.userId,
              backup: ''
            })
          }
        })
        .catch(() => {})
    },
    async findSysUserRole(roleIds) {
      const {data, code} = this.$request({url: this.api.sys.findSysUserRole, data: {roleIds}})
      if (code) return data
    },
    async findSysUser(ids) {
      const {data, code} = this.$request({url: this.api.sys.findSysUser, data: {ids}})
      if (code) return data
    },
    // 审批通过
    finishMatter() {
      this.$confirm(`确认审批通过吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // const applyResult = await this.findApply(this.loginUser.userId)
        // if (!applyResult || applyResult.length === 0) return
        // const idx = applyResult.findIndex(item => Number(item.approveId) === Number(this.id))
        let taskId
        // 从事项列表进入
        this.finishBtnLoading = true
        if (!this.taskId) {
          const { data: ApproveData, code } = await request({
            url: api.approve.findApprove,
            data: { page: 1, limit: 10, keyword: '', userId: this.loginUser.userId }
          })
          if (code !== 1) this.$message({ type: 'error', message: '审批异常' })
          taskId = ApproveData.filter(item => +item.approveId === +this.id)[0].taskId
        }

        const completeActivity = await this.completeActivity({ taskId: this.taskId || taskId, approveStatue: 1 })

        if (completeActivity !== 1) return
        const logData = await this.findNewOaApproveLog(this.id)
        await this.findTask(logData)
        // 数组空没有下一个审批人
        if (Array.isArray(this.nextApproveObj) && !this.nextApproveObj.legnth) {
          // this.updateAllOpsOrderWorkTask({ statue: 3 })
          this.insertOpsOrderProblemLog(10)
          const data = { id: this.id, statue: 3 }
          await this.updateOpsOrderProblem(data)
        }
        //  statue:6 待确认 2审批中
        // const formData = { id: this.id, statue: this.isFinish ? 6 : 2 }
        // await this.updateOpsOrderProblem(formData)
        await this.getOverview()
        this.finishBtnLoading = false
      })
    },
    // 审批不通过
    failMatter() {
      this.$confirm(`确认不通过此审批吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // const applyResult = await this.findApply(this.loginUser.userId)
        // if (!applyResult || applyResult.length === 0) return
        // const idx = applyResult.findIndex(item => Number(item.approveId) === Number(this.id))
        let taskId
        this.failBtnLoading = true
        // 从事项列表进入
        if (!this.taskId) {
          const { data: ApproveData, code } = await request({
            url: api.approve.findApprove,
            data: { page: 1, limit: 10, keyword: '', userId: this.loginUser.userId }
          })
          if (code !== 1) this.$message({ type: 'error', message: '审批异常' })
          taskId = ApproveData.filter(item => +item.approveId === +this.id)[0].taskId
        }
        //
        // return
        const completeActivity = await this.completeActivity({ taskId: this.taskId || taskId, approveStatue: 2 })
        if (completeActivity === 1) {
          await this.insertOpsOrderProblemLog(13)
          const data = { id: this.id, statue: 5 }
          await this.updateOpsOrderProblem(data)
          // await this.updateOpsOrderProblem(updateData)
          // this.insertOpsOrderProblemLog(8)
          // await this.updateAllOpsOrderWorkTask({ statue: 3 })

          this.getOverview()
        }
        this.failBtnLoading = true
      })
    },
    // 审批驳回
    rejectMatter() {
      this.$confirm(`确认驳回审批吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // const applyResult = await this.findApply(this.loginUser.userId)
        // if (!applyResult || applyResult.length === 0) return
        // const idx = applyResult.findIndex(item => Number(item.approveId) === Number(this.id))
        let taskId
        let userId
        this.rejectBtnLoading = true
        // 从事项列表进入
        if (!this.taskId) {
          const { data: ApproveData, code } = await request({
            url: api.approve.findApprove,
            data: { page: 1, limit: 10, keyword: '', userId: this.loginUser.userId }
          })
          if (code !== 1) this.$message({ type: 'error', message: '审批异常' })
          const approveObj = ApproveData.filter(item => +item.approveId === +this.id)
          taskId = approveObj[0].taskId
          userId = approveObj[0].userId
        }

        // return
        const completeActivity = await this.completeActivity({ taskId: this.taskId || taskId, approveStatue: 6, userId: this.userId || userId })

        if (completeActivity === 1) {
          // 驳回 statue ==4
          // const updateData = { id: this.id, statue: 4 }
          // const updateData = { id: this.id, statue: 4, processState: 0 }
          await this.insertOpsOrderProblemLog(14)
          await this.updateAllOpsOrderWorkTask({ statue: 4 })
          // await this.updateOpsOrderProblem(updateData)
          // this.insertOpsOrderProblemLog(8)
          await this.getOverview()
        }
        this.rejectBtnLoading = false
      })
    },
    // 查找下一个审批人
    async findTask(logData) {
      // 返回来的taskModel没有数据就是流程走完了

      const { model: taskModel, code: taskCode } = await request({ url: api.opm.findTask, data: { instanceId: logData[0].instanceId || '' } })
      if (taskCode !== 1) return
      const taskModelObj = JSON.parse(taskModel)[0] || []
      this.nextApproveObj = taskModelObj
      //
      // 判断流程是否走完
      if (taskModelObj.length !== 0) {
        // taskModelObj根据配置的不同返回来的对象结构属性不同
        //  一个是配置了特定用户，
        if (taskModelObj.userId) {
          this.isApprove = taskModelObj.userId.split(',').includes('' + this.loginUser.userId)

          // 一个是配置了特定角色
        } else if (taskModelObj.roleId) {
          let form = { page: -1, limit: -1, roleId: taskModelObj.roleId }
          const { data: roleData, code } = await request({ url: api.sys.findSysUserRole, data: form })
          if (code !== -1) {
            roleData.forEach(item => {
              if (+item.userId === +this.loginUser.userId) {
                this.isApprove = true
              }
            })
            // let ids = []
            // roleData.forEach((item) => {
            //   ids.push(item.userId)
            // })
            // await request({url: api.sys.findSysUser, data: {ids}})
            // let finalArr = roleData.filter(item => +item.roleId === +taskModelObj.roleId)

            // this.isApprove = finalArr.findIndex(item => +item.userId === +this.loginUser.userId) !== -1
          }
        }
      } else {
        this.isFinish = true
      }

      this.checkRollBack()
    },
    //  处理失败
    // handleFault() {
    //   this.$confirm(`确认处理失败吗？`, '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(async () => {
    //     await this.insertOpsOrderProblemLog(12)
    //     const data = { id: this.id, statue: 7, processState: 3 }
    //     await this.updateOpsOrderProblem(data)
    //     // 处理失败推发起人
    //     await messageSendToPlatform(7, {receiverIds: this.info.matter.userId, title: this.info.matter.name, problemNo: this.info.matter.problemNo, status: 3})

    //     // await this.updateAllOpsOrderWorkTask({ statue: 7 })
    //     await this.getOverview()
    //   })
    // },
    // 根据用户id查询申请
    async findApply(userId) {
      const { code, data } = await request({
        url: api.apply.findApply,
        data: {
          userId,
          approveType: this.$defineData.projectActivityProcessDefine('accraditation', 'key', 'id'),
          page: 1,
          limit: -1
        }
      })
      if (code !== 1) return
      return data
    },
    // 查询请假日志
    async findNewOaApproveLog(approveIds) {
      const { code, data } = await request({
        url: api.approveLog.findNewOaApproveLog,
        data: { approveIds, approveType: this.$defineData.projectActivityProcessDefine('accraditation', 'key', 'id'), page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    // 查部门
    // async getHyitOrg(hyOrgId) {
    //   const { code, model } = await request({
    //     url: api.org.getHyitOrg,
    //     data: { hyOrgId }
    //   })
    //   if (code !== 1) return
    //   return model
    // },

    // 改变故障告警状态为'已处理'
    async updateZbxAlarmLog(id) {
      await request({
        url: '/admin/updateZbxAlarmLog',
        data: { id: id, status: '1' }
      })
      // if (res.code !== 1) return
      // await this.commonRequestFn.insertOpsOrderAlarmLog({
      //   alarmId: id,
      //   alarmModelType: 1,
      //   alarmHandleLog: `${this.loginUser.realName}关闭了告警`,
      //   userId: this.loginUser.userId
      // })
    },
    // handlerClose() {
    //   this.$confirm(`确认关闭该事项吗？`, '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   })
    //     .then(async () => {
    //       // statue==7关闭。processState==2处理成功
    //       const data = { id: this.id, statue: 7, processState: 2 }
    //       // let {code} = await request({ url: api.opm.updateOpsOrderProblem, data })
    //       let { code } = await this.updateOpsOrderProblem(data)
    //       if (code === 1) {
    //         this.$message({
    //           type: 'success',
    //           message: '关闭成功'
    //         })
    //         if (this.alarmId) {
    //           this.updateZbxAlarmLog(this.alarmId)
    //         }
    //         await this.insertOpsOrderProblemLog(5)
    //         // 处理成功推发起人
    //         await messageSendToPlatform(6, {receiverIds: this.info.matter.userId, title: this.info.matter.name, problemNo: this.info.matter.problemNo, status: 2})
    //       }

    //       // 如果事项是在告警日志创建的关闭事项，要插入一条记录
    //       if (this.info.matter.alarmId) {
    //         await this.commonRequestFn.insertOpsOrderAlarmLog({
    //           alarmId: this.info.matter.alarmId,
    //           alarmModelType: 1,
    //           alarmHandleLog: `${this.loginUser.realName}关闭了告警事项`,
    //           userId: this.loginUser.userId,
    //           backup: ''
    //         })
    //       }
    //       await this.getOverview()
    //     })
    //     .catch(() => {})
    // },
    changeTask(task) {

    },
    checkRollBack() {
      const filterApprove = this.approveList.filter(item => +item.approveId === +this.id)

      if (filterApprove.length > 0) {
        this.filterApprove = filterApprove
      }
      this.hasRollBackApproveFlag()
    },
    hasRollBackApproveFlag() {
      this.rollBackApprove = +this.nextApproveObj.userId === +this.loginUser.userId
      // 是否有下一个obj，是否有审批
      // if (this.nextApproveObj.userId && this.filterApprove.length > 0) {
      //   if (Number(this.nextApproveObj.userId) === Number(this.filterApprove[0].userId) && Number(this.filterApprove[0].userId) === Number(this.loginUser.userId)) {
      //     this.rollBackApprove = true
      //
      //   } else {
      //     this.rollBackApprove = false
      //
      //   }
      // } else {
      //   this.rollBackApprove = false
      // }
    },
    // 驳回后，主管再提交，继续流程
    async rollBackCommit() {
      // if (applyResult) { return }
      if (!this.getActivityBpmnKey) {
        this.$message({
          type: 'error',
          message: '请先选择一个流程',
          showClose: true,
          center: true
        })
        return
      }

      // const startActivityResult = await this.startActivity()
      // if (startActivityResult !== 1) return
      // // findApll应该是查看新建的，而不是通过的。
      // const applyResult = await this.findApply(this.loginUser.userId)
      // if (!applyResult || applyResult.length === 0) return
      // const idx = applyResult.find(item => Number(item.approveId) === Number(this.id))
      // console.log('idx: ', idx)
      const { data: ApproveData } = await request({
        url: api.approve.findApprove,
        data: { page: 1, limit: 10, keyword: '', userId: this.loginUser.userId }
      })
      //
      // if (!idx) return
      const completeActivity = await this.completeActivity({
        // 5 提交
        taskId: ApproveData[0].taskId,
        approveStatue: 5
      })

      if (completeActivity !== 1) return

      // 改变状态为审批中
      const data = { id: this.id, statue: 2, processState: 1 }
      // const data = { id: this.id, statue: 2, processState: 0 }
      let { code } = await this.updateOpsOrderProblem(data)
      // await this.updateAllOpsOrderWorkTask({ statue: 2 })
      if (code !== 1) {
        this.$message({ type: 'error', message: '提交失败' })
        return
      }
      // await this.insertOpsOrderProblemLog(7)

      // 增加计划任务
      // const model = await this.insertOpsOrderWorkTask()
      // await this.insertOpsOrderWorkTaskDevice({workTaskId: model.id, deviceType: 1, deviceId: item.hyHostId})
      // await this.insertOpsOrderProblemBs({id: model.id, orderProblemId: model.id, orderType: 2, bsIds: bsIds})
      await this.getOverview()
      if (completeActivity.code === 1) {
        this.$message({
          type: 'success',
          message: '提交成功'
        })
      }
    },
    // 查询服务类型
    async getOpsOrderProblemService() {
      return await this.$request({
        url: this.api.opm.getOpsOrderProblemService,
        data: { serviceId: this.info.matter.serviceType }
      })
    },
    // 获取用户自定义表单以及数据
    async userDefineFormValue() {
      // 获取表单
      const getUserDefineForm = await this.$request({
        url: this.api.userDefineForm.getUserDefineForm,
        data: { id: this.currentOrderProblemService.formId }
      })
      if (!getUserDefineForm.model) return
      // 获取表单填写数据
      const findUserDefineFormValue = await this.$request({
        url: this.api.userDefineForm.findUserDefineFormValue,
        data: { orderId: this.info.matter.id, limit: -1 }
      })
      if (findUserDefineFormValue.code !== 1) return

      if (getUserDefineForm.model.userData && this.$tool.isJSONString(getUserDefineForm.model.userData)) {
        const formJson = JSON.parse(getUserDefineForm.model.userData)

        if (formJson.widgetList.length > 0) {
          const customForm = []
          const widgetList = []
          // 布局类型
          for (let item of formJson.widgetList) {
            if (item.type === 'table') {
              item.rows.forEach(rowItem => {
                rowItem.cols.forEach(colItem => {
                  widgetList.push(...colItem.widgetList)
                })
              })
            } else if (item.type === 'grid') {
              item.cols.forEach(tabsItem => {
                widgetList.push(...tabsItem.widgetList)
              })
            } else if (item.type === 'tab') {
              item.cols.forEach(colItem => {
                widgetList.push(...colItem.widgetList)
              })
            } else if (item.type === 'card') {
              if (item.tabs?.length) {
                item.tabs.forEach(cardItem => {
                  widgetList.push(...cardItem.widgetList)
                })
              } else {
                continue
              }
            } else {
              widgetList.push(item)
            }
          }
          // formJson.widgetList.forEach(item => {

          // })
          widgetList.forEach(item => {
            const idx = findUserDefineFormValue.data.findIndex(items => items.keyId === item.id)
            const tmp = {
              id: idx !== -1 ? findUserDefineFormValue.data[idx].id : this.$tool.guid(),
              label: item.options.label
            }

            // 表单赋值
            // 时间 日期选择
            if (item.type === 'time-range' || item.type === 'date-range') {
              const timeArr = eval(findUserDefineFormValue.data[idx].keyValue)
              if (timeArr !== undefined && timeArr.length > 0) {
                const sTime = timeArr[0]
                const eTime = timeArr[1]
                tmp.value = idx !== -1 ? `${sTime} - ${eTime}` : ''
              }
            } else if (item.type === 'checkbox') { // 复选框
              const optionItems = item.options.optionItems
              const itemArr = eval(findUserDefineFormValue.data[idx].keyValue)
              if (itemArr !== undefined && itemArr.length > 0) {
                const optionItemsIdx = optionItems.findIndex(el => +el.value === +itemArr[0])
                if (optionItemsIdx !== -1) tmp.value = optionItems[optionItemsIdx].label
              }
            } else { // 普通的直接赋值
              tmp.value = idx !== -1 ? findUserDefineFormValue.data[idx].keyValue : ''
            }

            if (customForm.length === 0) {
              customForm.push([tmp])
            } else {
              if (customForm[customForm.length - 1].length < 2) {
                customForm[customForm.length - 1].push(tmp)
              } else {
                customForm.push([tmp])
              }
            }
          })
          this.$set(this.info.matter, 'customForm', customForm)
        }
      }
    },
    async setFlowSuccessSetLogText() {
      if (this.logData.length > 0) {
        if (this.nextApproveObj.length === 0 && this.info.matter.processState === 5) {
          const getSysUser = await this.$request({ url: this.api.sys.findSysUser, data: { ids: this.info.matter.lockUserId } })
          if (getSysUser.code === 1 && getSysUser.data && getSysUser.data.length > 0) {
            this.$set(this.logData[this.logData.length - 1], 'approveLog', (this.logData[this.logData.length - 1].approveLog += `，审批完成，待工程师${getSysUser.data[0].realName}确认完成事项`))
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/opm.scss';
a {
  text-decoration: underline;
  color: #0145ab;
}
.opm-header-title {
  font-size: 20px;
}
</style>
