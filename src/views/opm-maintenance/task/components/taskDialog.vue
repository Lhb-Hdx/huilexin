<template>
  <div class="taskDialog">
    <el-dialog ref="taskDialog" :body="true" :visible.sync="dialogVisible" width="95%" top="3vh" @closed="destroyComponent" @close="clearStatue">
      <template #title>
        <div>
          <h2 class="taskDialog-title">
            {{ taskModel.name }}
          </h2>
          <div class="taskDialog-subtitle mt-10">
            <span class="mr-2">创建于{{ taskModel.createTime }}</span>
            <span class="mr-2">由{{ taskModel.createUserName }}安排</span>
            <span>最后更新于{{ taskModel.updateTime }}</span>
          </div>
        </div>
      </template>
      <div v-loading="loading" element-loading-spinner="el-icon-loading">
        <div style="height: 70vh; overflow-x: hidden; overflow-y: scroll">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-card header="作业描述" shadow="never">
                <div class="taskDialog-desc">
                  {{ taskModel.backup }}
                </div>
                <div class="mt-8">
                  <el-tag v-for="dItem in taskModel.device" :key="dItem.hyHostId" type="info">{{ dItem.hyHostName }}</el-tag>
                </div>
                <div class="mt-8">
                  <el-tag v-for="dItem in taskModel.bs" :key="dItem.id" type="info">{{ dItem.name }}</el-tag>
                </div>
              </el-card>
              <el-card shadow="never" class="mt-10 taskDialog-analyse">
                <template slot="header">
                  <div class="flex-v-between">
                    <span>分析</span>
                    <span v-permission="['addAnalysis']" class="default-color pointer" @click="showAnalysisInput = true">添加</span>
                  </div>
                </template>
                <div v-if="showAnalysisInput" class="card-body">
                  <el-form ref="analysisForm" :model="analysisForm" :rules="analysisRules">
                    <el-form-item label="名称" label-width="70px" prop="name">
                      <el-input v-model="analysisForm.name" />
                    </el-form-item>
                    <el-form-item label="内容" label-width="70px" prop="content">
                      <Editor ref="text" v-model="analysisForm.content" class="myQuillEditor ql-editor-class" placeholder="执行任务的信息描述" />
                    </el-form-item>
                    <el-form-item label="附件" label-width="50px">
                      <FileUpload
                        button-text="上传附件"
                        upload-type="doc"
                        :limit="9"
                        :button-disabled="false"
                        :is-limit-file-size="true"
                        :file-max-size="1"
                        :file-url-list="analysisForm.fileUrlList"
                        @emitFileList="getAnalysisEmitFileList"
                      />
                    </el-form-item>
                  </el-form>
                  <div class="flex-v-end mt-2">
                    <el-button size="mini" @click="showAnalysisInput = false">取消</el-button>
                    <el-button :loading="loading" type="primary" size="mini" @click="saveAnalysisForm">保存</el-button>
                  </div>
                </div>
                <!-- 分析列表 -->
                <div class="detailAnalyze-content margin-top-15">
                  <div v-for="item in analysisList" :key="item.id" class="detailAnalyze-content-item">
                    <div class="detailAnalyze-content-item-title flex align-center space-between">
                      <h2 class="font-weigth overflow-text-a no-margin-bottom" style="width: 70%">{{ item.name }}</h2>
                      <div class="flex-h-center">
                        <el-avatar :size="20" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                        <span class="ml-8 overflow-text-a">{{ item.userName }}</span>
                      </div>
                    </div>
                    <div class="detailAnalyze-content-item-box">
                      <div class="box-left">
                        <div class="flex space-between">
                          <div>
                            分析：
                            <el-link type="primary" class="font-12" @click="getAnalyzeDetail(item)">查看</el-link>
                          </div>
                        </div>
                        <div v-for="fitem in item.fileList" :key="fitem.id">
                          {{ fitem.fileName }}
                          <el-link v-down="fitem.fileUrl" type="primary" class="font-12">下载</el-link>
                        </div>
                      </div>

                      <div class="box-right">
                        <el-button type="primary" size="mini" @click="deleteOrderAnalyze(item)">删除</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>

              <el-card header="总结&方案" shadow="never" class="mt-10 taskDialog-solution">
                <template slot="header">
                  <div class="flex-v-between">
                    <span>总结&方案</span>
                    <span v-permission="['addSolution']" class="default-color pointer" @click="showSolutionInput = true">添加</span>
                  </div>
                </template>
                <div v-if="showSolutionInput" class="card-body">
                  <el-form ref="solutionForm" :model="solutionForm" :rules="solutionRules">
                    <el-form-item label="名称" label-width="70px" prop="name">
                      <el-input v-model="solutionForm.name" />
                    </el-form-item>
                    <el-form-item label="内容" label-width="70px" prop="content">
                      <Editor ref="text" v-model="solutionForm.content" class="myQuillEditor ql-editor-class" placeholder="执行任务的信息描述" />
                    </el-form-item>
                    <el-form-item label="附件" label-width="50px">
                      <FileUpload
                        button-text="上传附件"
                        upload-type="doc"
                        :limit="9"
                        :button-disabled="false"
                        :is-limit-file-size="true"
                        :file-max-size="1"
                        :file-url-list="solutionForm.fileUrlList"
                        @emitFileList="getSolutionEmitFileList"
                      />
                    </el-form-item>
                  </el-form>
                  <div class="flex-v-end mt-2">
                    <el-button size="mini" @click="showSolutionInput = false">取消</el-button>
                    <el-button :loading="loading" type="primary" size="mini" @click="saveSolutionForm">保存</el-button>
                  </div>
                </div>
                <!-- 总结列表 -->
                <div class="detailAnalyze-content margin-top-15">
                  <div v-for="item in symmaryAnalysisList" :key="item.id" class="detailAnalyze-content-item" style="borderleft: 2px solid red">
                    <div class="detailAnalyze-content-item-title flex align-center space-between">
                      <h2 class="font-weigth overflow-text-a no-margin-bottom" style="width: 70%">{{ item.name }}</h2>
                      <div class="flex-h-center">
                        <el-avatar :size="20" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                        <span class="ml-8 overflow-text-a">{{ item.userName }}</span>
                      </div>
                    </div>
                    <div class="detailAnalyze-content-item-box">
                      <div class="box-left">
                        <div class="flex space-between">
                          <div>
                            分析：
                            <el-link type="primary" class="font-12" @click="getAnalyzeDetail(item)">查看</el-link>
                          </div>
                        </div>
                        <div v-for="fitem in item.fileList" :key="fitem.id">
                          {{ fitem.fileName }}
                          <el-link v-down="fitem.fileUrl" type="primary" class="font-12">下载</el-link>
                        </div>
                      </div>

                      <div class="box-right">
                        <el-button type="primary" size="mini" @click="deleteOrderAnalyze(item)">删除</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card header="工作记录" shadow="never">
                <template #header>
                  <div class="flex-v-between">
                    <span>工作记录</span>
                    <span class="default-color pointer no-underlink">剩余时间：{{ taskModel.excessTime }}天</span>
                  </div>
                </template>
                <div>
                  <el-descriptions class="margin-top" :column="1" size="small" border>
                    <el-descriptions-item v-for="item in workLog" :key="item.id" label-style="width:100px">
                      <div slot="label" class="text-center">
                        <h1 style="color: #000" class="m-0">{{ item.d }}</h1>
                        <div>{{ item.m }}</div>
                      </div>
                      <div v-if="item.showInput" class="flex logBox">
                        <div class="logBox-left">
                          <el-input v-model="item.workLog" type="textarea" rows="4" resize="none" placeholder="请输入记录" />
                        </div>
                        <!--
                        <div class="logBox-right">
                          <div class="select-wrapper ">
                            <div>作业状态：</div>
                            <el-select v-model="taskLogStatus" placeholder="请选择">
                              <el-option v-for="item2 in jobStateOption" :key="item2.id" :value="item2.id" :label="item2.key" />
                            </el-select>

                          </div>

                          <div v-if="taskModel.statue !== 7" class="saveBtn flex-v-end flex-h-center mt-10">
                            <el-button v-permission="['saveWork']" :loading="loading" type="primary" size="mini" @click="saveWorkLog">保存工作记录</el-button>
                          </div>
                        </div>
                         -->
                      </div>
                      <div v-else>{{ item.workLog }}</div>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-card>
              <el-card header="附件" class="mt-10" shadow="never">
                <div class="document">
                  <el-row :gutter="20">
                    <el-col v-for="item in fileList" :key="item.id" :span="6">
                      <div class="document-list-item">
                        <img src="image/opm/file-default-icon.png" alt="">
                        <div class="font-14 linear-1 document-name">{{ item.name }}</div>
                        <div class="mt-10 font-14">
                          <el-link v-down="item.url" type="primary">下载文档</el-link>
                          <el-link type="primary" class="ml-6" @click="onDeleteFile(item)">删除</el-link>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="document-upload">
                        <div class="document-upload-main pointer" @click="onUploadDocument">
                          <div class="main-button">
                            <i class="el-icon-plus font-60" />
                            <h2 class="mt-20">上传文档</h2>
                          </div>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        <div v-if="taskModel.matter && taskModel.matter.statue !== 7" slot="footer" class="dialog-footer text-center mt-10">
          <el-button v-permission="['CloseTask']" type="success" :disabled="handlerStart || taskStatus" size="midium" @click="handleFinishTask">作业已完成</el-button>
          <!-- <el-button v-if="showSubmitAudio" v-permission="['AudioTask']" type="primary" @click="handelAudioTask">提交审核</el-button> -->
          <el-button v-permission="['ChangeTask']" :disabled="handlerStart || taskStatus" type="danger" @click="handleCloseTask">无法处理，变更</el-button>
          <el-button v-permission="['ChangeTask']" :disabled="handlerStart || taskStatus" type="primary" @click="saveWorkLog">保存记录，处理中</el-button>
          <el-button type="primary" @click="dialogVisible = false">退出</el-button>
        </div>
      </div>
    </el-dialog>
    <FileUpload
      ref="uploadComponent"
      style="display: none"
      button-text="点击上传"
      upload-type="pic"
      :limit="10"
      :button-disabled="false"
      :is-limit-file-size="true"
      :file-max-size="1"
      file-url-list-type="picture"
      button-type="primary"
      @emitFileList="getEmitFileList"
    />
    <el-dialog class="abow_dialog" :title="currentAnalysis.type === 1 ? '查看分析' : '查看总结&方案'" :visible.sync="showAnalyzeDetailDialog" width="80%" top="5vh">
      <div class="dialog-body">
        <div v-html="analyzeDetailContent" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Editor from '@/components/QuillEditorComponent/editor.vue'
import FileUpload from '@/components/Upload/file-upload.vue'
import request from '@/utils/request'
import api from '@/api/api'
import opmFunction from '@/params-model/opm/function'
const {messageSendToPlatform} = opmFunction
export default {
  components: {
    Editor,
    FileUpload
  },
  props: {
    // taskId: {
    //   type: [String, Number],
    //   default: ''
    // }
  },
  data() {
    return {
      showLoading: true,
      taskId: '',
      handlerStart: true, //  审批后才能开始处理计划任务
      taskModel: {},
      dialogVisible: false,
      loading: false,
      text: '',
      fileUrlList: [],
      rulesForm: {},
      rules: {},
      jobStateOption: [
        { key: '未完成', id: 1, color: '#E9E8EA' },
        { key: '处理中', id: 2, color: '#FBBD7B' },
        { key: '处理完成', id: 3, color: '#00B285' },
        { key: '处理失败', id: 4, color: '#cccccc' }
      ],
      analysisList: [],
      taskLogStatus: 1,
      taskStatus: '',
      workLog: [],
      loginUser: {},
      fileList: [],
      showAnalysisInput: false,
      showSolutionInput: false,
      analysisForm: {
        name: '',
        type: 1,
        orderType: 2,
        content: ''
      },

      solutionForm: {
        name: '',
        type: 2,
        orderType: 2,
        content: ''
      },
      OpsProblemId: '',
      analysisRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },
      solutionRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },
      analysisFileList: [],
      solutionFileList: [],
      currentAnalysis: '',
      symmaryAnalysisList: [],
      showSubmitAudio: true,
      showAnalyzeDetailDialog: false,
      analyzeDetailContent: ''
    }
  },
  computed: {
    // 作业是否完成，完成将不能处理作业
  },
  watch: {
    // taskId: {
    //   handler() {
    //     this.getTask()
    //     this.loadFileList()
    //   },
    //   deep: true,
    //   immediate: true
    // }
  },
  mounted() {
    //
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.jobStateOption = this.$defineData.opmWorkLogStatus()
  },
  methods: {
    // 打开弹窗
    open(row) {
      this.taskId = row.id
      this.OpsProblemId = row.orderProblemId
      this.dialogVisible = true
      this.checkMissionComplete(row.statue)
      this.findOpsOrderAnalysis({ type: 1, orderType: 2 })
      this.findOpsOrderAnalysis({ type: 2, orderType: 2 })
      // /////////////////////
      this.getTask()
      this.loadFileList()
    },
    // 检查任务状态，1或者null可以继续做，2，3其他的不行
    checkMissionComplete(statue) {
      this.taskStatus = ![3, 6].includes(statue)
    },
    // 获取任务信息
    getTask() {
      if (this.taskId === '') return
      request({
        url: api.opm.getOpsOrderWorkTask,
        data: { id: this.taskId }
      }).then(async res => {
        if (res.code === 1) {
          // eslint-disable-next-line require-atomic-updates
          res.model.matter = await this.getOpsOrderProblem(res.model.orderProblemId)
          if (res.model?.matter) {
            let { processState, statue } = res.model.matter
            // 审核完成，处理中才给开始做作业

            if (statue === 3 && processState === 5) {
              this.handlerStart = false
            } else {
              this.handlerStart = true
            }
          }

          const logData = await this.findNewOaApproveLog(res.model.id)
          const idx = logData.findIndex(items => items.approveId === res.model.id)
          if (idx !== -1) {
            this.showSubmitAudio = logData[idx].approveStatue === 4 || logData[idx].approveStatue === 6 || logData[idx].approveStatue === 7
          }

          let deviceList = []
          let bsList = []
          // 获取批量设备
          const findDevice = await request({ url: api.opm.findOpsOrderWorkTaskDevice, data: { workTaskIds: res.model.id, limit: -1 } })
          if (findDevice.data.length > 0) {
            const deviceIds = []
            findDevice.data.forEach(item => {
              deviceIds.push(item.deviceId)
            })
            const findHost = await request({
              url: api.itMonitor.findHyitHost,
              data: { limit: -1, ids: deviceIds }
            })
            if (findHost.code === 1) deviceList = findHost.data
          }
          // 获取批量业务系统
          const findBindBs = await request({ url: api.opm.findOpsOrderProblemBs, data: { orderProblemIds: res.model.id, limit: -1 } })
          if (findBindBs.data.length > 0) {
            const bsIds = []
            findBindBs.data.forEach(item => {
              bsIds.push(item.bsId)
            })
            const findHost = await request({
              url: api.bsTopSystem.findBsTopSystem,
              data: { limit: -1, ids: bsIds }
            })
            if (findHost.code === 1) bsList = findHost.data
          }
          // eslint-disable-next-line require-atomic-updates
          res.model.device = deviceList
          // eslint-disable-next-line require-atomic-updates
          res.model.bs = bsList
          const ymd = this.$tool.dateFormat('YYYY-mm-dd', new Date())
          const e = res.model.workEtime.split(' ')
          // eslint-disable-next-line require-atomic-updates
          res.model.excessTime = this.$tool.getDaysBetween(ymd, e[0])
          const user = await this.findSysUser(res.model.createUserId)
          // eslint-disable-next-line require-atomic-updates
          res.model.createUserName = user && user.length > 0 ? user[0].realName : ''
          this.taskModel = res.model

          if (res.model) {
            const getWorkLoData = await this.findOpsOrderWorkLog()
            const s = res.model.workStime.split(' ')[0]
            const e = res.model.workEtime.split(' ')[0]
            const workLog = []
            const dateList = this.$tool.getdiffdate(s, e)

            const ymd = this.$tool.dateFormat('YYYY-mm-dd', new Date())

            dateList.forEach(item => {
              const timeSplit = item.split('-')
              const idx = getWorkLoData.findIndex(items => items.workTime === item)

              workLog.push({
                id: this.$tool.guid(),
                workLog: idx === -1 ? '' : getWorkLoData[idx].workLog,
                workTime: item,
                orderId: this.taskId,
                m: timeSplit[0] + '-' + timeSplit[1],
                d: timeSplit[2],
                showInput:
                  new Date(ymd).getTime() === new Date(item).getTime() && idx === -1 && [3, 6].includes(this.taskModel.statue) && res.model.matter.statue === 3 && res.model.matter.processState === 5
              })
            })
            this.workLog = workLog
          }
        }

        // this.showLoading = false
      })
    },
    async findOpsOrderAnalysis(obj) {
      const data = { type: obj.type, orderType: obj.orderType, page: 1, limit: -1, orderId: this.taskId }
      // const data = { type: obj.type, orderType: obj.orderType, page: 1, limit: -1, orderId: this.OpsProblemId }
      const { code, data: opsOrderAnalysis } = await this.$request({ url: this.api.opm.findOpsOrderAnalysis, data })
      if (code !== 1) return
      const ids = []
      const userIds = []
      opsOrderAnalysis.forEach(item => {
        ids.push(item.id)
        userIds.push(item.userId)
      })
      if (obj.type === 1) {
        const getFile = await this.findOpsOrderFile(ids)
        const findUserName = await request({ url: api.sys.findSysUser, data: { ids: userIds, companyId: this.$auth.getUserSession().companyId } })
        let userList = []
        if (findUserName.code === 1) userList = findUserName.data
        opsOrderAnalysis.forEach(item => {
          getFile.forEach(fileItem => {
            if (Number(fileItem.linkId) === Number(item.id)) {
              if (!item.fileList) item.fileList = []
              item.fileList.push({
                fileName: fileItem.fileName,
                fileUrl: fileItem.fileUrl
              })
            }
          })
          const userIds = userList.findIndex(items => Number(items.userId) === Number(item.userId))
          if (userIds !== -1) {
            item.userName = userList[userIds].userName
          }
        })
        this.analysisList = opsOrderAnalysis
      } else {
        const getFile = await this.findOpsOrderFile(ids)
        const findUserName = await request({ url: api.sys.findSysUser, data: { ids: userIds, companyId: this.$auth.getUserSession().companyId } })
        let userList = []
        if (findUserName.code === 1) userList = findUserName.data
        opsOrderAnalysis.forEach(item => {
          getFile.forEach(fileItem => {
            if (Number(fileItem.linkId) === Number(item.id)) {
              if (!item.fileList) item.fileList = []
              item.fileList.push({
                fileName: fileItem.fileName,
                fileUrl: fileItem.fileUrl
              })
            }
          })
          const userIds = userList.findIndex(items => Number(items.userId) === Number(item.userId))
          if (userIds !== -1) {
            item.userName = userList[userIds].userName
          }
        })
        this.symmaryAnalysisList = opsOrderAnalysis
        // this.findOpsOrderFile()
      }
    },
    // 查询附件
    async findOpsOrderFile(linkIds) {
      let { code, data } = await request({
        url: api.opm.findOpsOrderFile,
        data: {
          type: 1,
          orderType: 1,
          linkIds
        }
      })
      if (code !== 1) return
      return data
    },
    // 点击保存工作日志
    async saveWorkLog() {
      this.$confirm('确定保存记录吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const idx = this.workLog.findIndex(item => item.showInput === true)
          if (idx !== -1) {
            const submitWorkLogRes = await this.submitWorkLog(api.opm.insertOpsOrderWorkLog, {
              orderType: 2, // 这是走流程后的日志类型
              orderId: this.taskId,
              userId: this.loginUser.userId,
              workLog: this.workLog[idx].workLog,
              workTime: this.workLog[idx].workTime,
              workProgress: this.jobStateOption[1].id
            })
            if (submitWorkLogRes === 1) {
              this.getTask()
              // this.$emit('freshList')
              this.dialogVisible = false
            }
            // 修改作业状态,statu:1为处理中
            const data = { id: this.taskId, statue: 6 }
            const updateOpsOrderWorkTask = this.updateOpsOrderWorkTask(data)
            // 11正在处理中
            this.insertOpsOrderProblemLog(11)

            this.$emit('freshList')
          } else {
            this.$message({
              type: 'info',
              message: '暂无需要提交的记录'
            })
            this.dialogVisible = false
          }
        })
        .catch(() => {
          const idx = this.workLog.findIndex(item => item.showInput === true)
          if (idx !== -1) this.workLog[idx].workLog = ''

          this.dialogVisible = false
        })
    },
    handleCloseTask() {
      this.$confirm('确定关闭任务吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const idx = this.workLog.findIndex(item => item.showInput === true)
          if (idx !== -1) {
            if (!this.workLog[idx].workLog) {
              this.$message({ type: 'error', center: true, message: '请输入记录' })
              return
            }
            await this.submitWorkLog(api.opm.insertOpsOrderWorkLog, {
              orderType: 2,
              orderId: this.taskId,
              userId: this.loginUser.userId,
              workLog: this.workLog[idx].workLog,
              workTime: this.workLog[idx].workTime,
              workProgress: this.jobStateOption[3].id
            })
          }

          await this.insertOpsOrderProblemLog(8)
          this.getTask()
          this.dialogVisible = false

          // 修改作业状态,statu:7为关闭
          const data = { id: this.taskId, statue: 7 }
          await this.updateOpsOrderWorkTask(data)

          this.$emit('freshList')
        })
        .catch(() => {
          const idx = this.workLog.findIndex(item => item.showInput === true)
          if (idx !== -1) this.workLog[idx].workLog = ''
          this.dialogVisible = false
        })
    },
    // 提交工作认真
    async submitWorkLog(api, data) {
      const { code } = await request({
        url: api,
        data
      })
      if (code !== 1) return
      return code
    },
    // 查询工作日志
    async findOpsOrderWorkLog() {
      const { code, data } = await request({
        url: api.opm.findOpsOrderWorkLog,
        data: {
          limit: -1,
          orderType: 2,
          orderId: this.taskId
        }
      })
      if (code !== 1) return
      return data
    },
    // 上传过程文档
    onUploadDocument() {
      // 点击上传按钮去触发上传
      document.querySelector('.file-upload input').click()
    },
    // 上传组件emit方法 上传过程文档
    async getEmitFileList(file) {
      if (file.emitType === 'addFile') {
        let { code } = await request({
          url: api.opm.insertOpsOrderFile,
          data: {
            type: 3,
            orderType: 2,
            userId: this.loginUser.userId,
            linkId: this.taskId,
            fileUrl: file.addFile.url,
            fileName: file.addFile.name
          }
        })
        if (code !== 1) return
        await this.loadFileList()
        this.$message({
          type: 'success',
          message: '上传成功'
        })
      }
    },
    // 加载过程文档文件列表
    async loadFileList() {
      if (this.taskId === '') return
      let { code, data } = await request({
        url: api.opm.findOpsOrderFile,
        data: {
          type: 3,
          orderType: 2,
          userId: this.loginUser.userId,
          linkId: this.taskId
        }
      })
      if (code !== 1) return
      this.fileList = []
      data.forEach(item => {
        this.$set(this.fileList, this.fileList.length, {
          url: item.fileUrl,
          id: item.id,
          name: item.fileName
        })
      })
    },
    // 删除过程文档文件
    async onDeleteFile(item) {
      this.$confirm('确定删除这个文件吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let { code } = await request({
          url: api.opm.deleteOpsOrderFile,
          data: { id: item.id }
        })
        if (code !== 1) return
        await this.loadFileList()
        this.$message({
          type: 'success',
          message: '删除成功'
        })
      })
    },
    // 点击保存分析结果
    saveAnalysisForm() {
      this.$refs['analysisForm'].validate(async valid => {
        if (valid) {
          this.loading = true

          const data = { ...this.analysisForm, orderId: this.taskId, userId: this.loginUser.userId }

          const insertOpsOrderAnalysisResult = await this.insertOpsOrderAnalysis(data, 'analysisForm')
          // 新增附件
          this.insertOpsOrderFile(insertOpsOrderAnalysisResult.id, 'analysisFileList')
          this.findOpsOrderAnalysis({ type: 1, orderType: 2 })
          this.showAnalysisInput = false
          this.loading = false
        }
      })
    },
    // 点击保存总结
    saveSolutionForm() {
      this.$refs['solutionForm'].validate(async valid => {
        if (valid) {
          this.loading = true
          const data = { ...this.solutionForm, orderId: this.taskId, userId: this.loginUser.userId }
          const insertOpsOrderAnalysisResult = await this.insertOpsOrderAnalysis(data, 'solutionForm')
          this.insertOpsOrderFile(insertOpsOrderAnalysisResult.id, 'solutionFileList')
          this.findOpsOrderAnalysis({ type: 2, orderType: 2 })
          this.showSolutionInput = false
          this.loading = false
        }
      })
    },
    // 新增分析或者总结
    async insertOpsOrderAnalysis(data, attr) {
      let { code, model } = await request({
        url: api.opm.insertOpsOrderAnalysis,
        data
      })
      if (code !== 1) return
      this.$set(this[`${attr}`], 'content', '')
      this.$message({
        type: 'success',
        message: '保存成功'
      })
      return model
    },
    // 新增附件
    insertOpsOrderFile(id, attr) {
      this[`${attr}`].forEach(item => {
        request({
          url: api.opm.insertOpsOrderFile,
          data: {
            type: 1,
            orderType: 1,
            userId: this.loginUser.userId,
            linkId: id,
            fileUrl: item.url,
            fileName: item.name
          }
        })
      })
      this[`${attr}`] = []
    },
    // 监听分析附件上传
    getAnalysisEmitFileList(files) {
      this.analysisFileList = files.fileList
    },
    // 监听总结附件上传
    getSolutionEmitFileList(files) {
      this.solutionFileList = files.fileList
    },
    async findSysUser(ids) {
      // 提交人
      let { code, data } = await request({
        url: api.sys.findSysUser,
        data: { limit: -1, ids, companyId: this.$auth.getUserSession().companyId }
      })
      if (code !== 1) return
      return data
    },
    handelAudioTask() {
      this.$confirm('确定该作业已完成？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const startActivityResult = await this.startActivity()
          if (startActivityResult !== 1) return
          const applyResult = await this.findApply(this.loginUser.userId)
          if (!applyResult || applyResult.length === 0) return
          const idx = applyResult.findIndex(item => Number(item.approveId) === Number(this.taskModel.id))
          const completeActivity = await this.completeActivity({
            taskId: applyResult[idx].taskId,
            approveStatue: 5
          })
          this.dialogVisible = false
          this.$emit('reload', true)
          if (completeActivity.code === 1) {
            this.$message({
              type: 'success',
              message: '提交成功'
            })
          }
        })
        .catch(() => {})
    },
    // 启动流程
    async startActivity() {
      const getActivity = await this.findNewOaActivity(497)
      const { code } = await request({
        url: api.activity.startActivity,
        data: {
          bpmnKey: getActivity[0].bpmnKey,
          approveType: 497,
          approveId: this.taskModel.id,
          userId: this.loginUser.userId
        }
      })
      if (code === -1) return
      return code
    },
    // 根据用户id查询申请
    async findApply(userId) {
      const { code, data } = await request({
        url: api.apply.findApply,
        data: {
          userId,
          approveType: this.$defineData.projectActivityProcessDefine('task', 'key', 'id'),
          page: 1,
          limit: -1
        }
      })
      if (code !== 1) return
      return data
    },
    // 提交审核
    async completeActivity(data) {
      const { code } = await request({
        url: api.activity.completeActivity,
        data
      })
      if (code !== 1) return
      return code
    },
    // 列表查询
    async findNewOaActivity(type) {
      const { code, data } = await request({
        url: api.activity.findNewOaActivity,
        data: { page: 1, limit: -1, type }
      })
      if (code !== 1) return
      return data
    },
    // 查询请假日志
    async findNewOaApproveLog(approveIds) {
      const { code, data } = await request({
        url: api.approveLog.findNewOaApproveLog,
        data: { approveIds, approveType: this.$defineData.projectActivityProcessDefine('task', 'key', 'id'), page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    handleFinishTask() {
      this.$confirm(`确认已完成该作业吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // this.dialogVisible = false
          // this.$emit('reload', true)
          const idx = this.workLog.findIndex(item => item.showInput === true)
          if (idx !== -1) {
            // 添加处理成功日志
            await this.submitWorkLog(api.opm.insertOpsOrderWorkLog, {
              orderType: 2,
              orderId: this.taskId,
              userId: this.loginUser.userId,
              workLog: this.workLog[idx].workLog,
              workTime: this.workLog[idx].workTime,
              workProgress: this.jobStateOption[2].id
            })
          }
          await this.insertOpsOrderProblemLog(9)
          this.dialogVisible = false
          // 处理成功这个作业
          const data = { id: this.taskId, statue: 8 }
          // let updateOpsOrderWorkTask = await request({ url: api.opm.updateOpsOrderWorkTask, data })
          // 修改作业状态 statue :3 代表已完成
          let updateOpsOrderWorkTask = this.updateOpsOrderWorkTask(data)
          // 作业完成推主管
          const groupmap = await this.$request({url: api.opm.findOpsOrderProblemGroupMap, data: {problemIds: this.taskModel.matter.id}})
          const manager = await this.$request({url: api.sys.findHrUserGroupMap, data: {groupId: groupmap['data'][0]['groupId'], classify: 'manager'}})

          await messageSendToPlatform(9, {receiverIds: manager['data'][0]['userId'], title: this.taskModel.matter.name, problemNo: this.taskModel.matter.problemNo, status: 5})
          if (updateOpsOrderWorkTask.code !== 1) return
          this.$message({ type: 'success', message: '处理成功' })
          this.getTask()
          this.$emit('freshList')
          this.dialogVisible = false
          this.$emit('freshList')
        })
        .catch(() => {})
    },
    async updateOpsOrderWorkTask(data) {
      return await request({ url: api.opm.updateOpsOrderWorkTask, data })
    },
    // 新增事项记录
    async insertOpsOrderProblemLog(status, receiveId = '') {
      await request({
        url: api.opm.insertOpsOrderProblemLog,
        data: { userId: this.loginUser.userId, orderId: this.OpsProblemId, receiveId: receiveId, status: status, createTime: this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date()) }
      })
    },
    async getOpsOrderProblem(id) {
      const { code, model } = await request({
        url: api.opm.getOpsOrderProblem,
        data: { id }
      })
      if (code !== 1) return
      return model
    },
    clearStatue() {
      this.dialogVisible = false
      this.showAnalysisInput = false
      this.showSolutionInput = false
    },
    destroyComponent() {
      //
      //
      // this.$refs.taskDialog.$destroy()
    },
    //  删除分析
    deleteOrderAnalyze(item) {
      this.$confirm(`确认删除分析报告吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          let { code, model } = await request({
            url: api.opm.deleteOpsOrderAnalysis,
            data: item
          })
          if (code !== 1) return
          this.findOpsOrderAnalysis({ type: item.type, orderType: item.orderType })
        })
        .catch(() => {})
    },
    getAnalyzeDetail(row) {
      this.currentAnalysis = row
      this.showAnalyzeDetailDialog = true
      this.analyzeDetailContent = row.content
    }
  }
}
</script>

<style lang="scss" scoped>
.taskDialog-subtitle {
  color: #999;
}
.taskDialog-desc {
  line-height: 24px;
}
.default-color:not(.no-underlink) {
  text-decoration-line: underline;
}
::v-deep .el-dialog {
  .el-dialog__body {
    padding: 0px 20px 10px 20px;
  }
}
::v-deep .el-card {
  .el-card__header {
    background-color: #f6f6f6;
  }
}
::v-deep .taskDialog-analyse {
  .el-card__body {
    padding: 0px 20px 20px 20px;
  }
}
::v-deep .quill-editor {
  .ql-container,
  .ql-editor {
    height: 100px;
  }
}
::v-deep .myQuillEditor {
  .ql-container.ql-snow {
    height: 210px;
  }
}

.logBox {
  align-items: center;
  justify-content: space-between;
  .logBox-left {
    flex: 1;
    height: 100%;
  }
  .logBox-right {
    display: flex;
    margin-left: 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .select-wrapper {
      display: flex;
      align-items: center;
      font-size: 16px;
    }
    .saveBtn {
      align-self: flex-end;
    }
  }
}

.document {
  .document-list-item,
  .document-upload {
    text-align: center;
    height: 200px;
    margin: 16px 0;
  }
  .document-list-item {
    .document-icon {
    }
    .document-name {
      margin: 10px 0;
      color: #999;
    }
    .document-action {
      .action-item {
      }
    }
  }
  .document-upload {
    display: flex;
    align-items: center;
    .document-upload-main {
      border: #e5ecf6 3px dotted;
      width: 180px;
      height: 180px;
      color: #999;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
.detailAnalyze-content {
  padding: 0 0 0 0;
  .detailAnalyze-content-item {
    background-color: #f4f4f5;
    margin-bottom: 10px;
    border-left: 2px solid #05b387;
    .detailAnalyze-content-item-title {
      border-bottom: 1px solid #e0e0e0;
      padding: 10px 15px;
      align-items: center;
      h2 {
        margin-top: 0;
      }
    }
    .detailAnalyze-content-item-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 15px;
      line-height: 24px;
    }
  }
}
</style>
