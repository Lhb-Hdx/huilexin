<template>
  <el-dialog v-set-dialog-main-height="'90%'" title="执行作业" class="dialog-body-scroll no-dialog-body dialog-not-footer" :visible.sync="showDialog" width="95%" top="5vh">
    <div ref="dialogBody" class="dialog-body">
      <div ref="stepList" class="step-list">
        <div class="step-list-main" :style="{ 'justify-content': stepCenter ? 'center' : '' }">
          <div v-for="(item, index) in scriptExecuteResult" ref="stepItem" :key="item.stepId" class="step-item pointer" @click="handlerStep(item, index)">
            <div class="step-item-header">
              <div class="item-node-label" :class="!item.statue || item.statue === -1 || item.isStepOver ? '' : (item.statue === 1 ? 'active' : 'error')">步骤{{ item.stepNum + 1 }}</div>
            </div>
            <div class="item-node-desc">{{ item.stepName }}</div>
          </div>
        </div>
      </div>
      <template v-if="activeServerResult && activeServerResult.isStepOver">
        <div class="step-over">
          <div class="title-tag">闭环确认</div>
          <el-form ref="executeLogSendForm" class="execute-log-send-form" :model="executeLogSendForm" :rules="executeLogSendRules" label-width="100px">
            <el-form-item class="script-form-item label-text-left" label="结果说明" prop="backup">
              <el-input v-model="executeLogSendForm.backup" type="textarea" placeholder="请输入结果说明" />
            </el-form-item>
            <el-form-item class="script-form-item label-text-left" label="邮箱地址" prop="emailAddress">
              <el-input v-model="executeLogSendForm.emailAddress" type="textarea" placeholder="请输入邮箱地址" />
              <div class="tip">注：多人请用 “,” 分割开来。</div>
            </el-form-item>
            <el-form-item label="" prop="">
              <el-button type="primary" :loading="submitLoading" @click="onSubmit">保存并生成巡检报告</el-button>
              <el-button @click="onReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template v-else>
        <div class="execute-progress" :style="{ width: setProgress + '%' }" />
        <div class="execute-result">
          <div class="execute-device">
            <div class="list-button">
              <el-button size="mini" type="primary" @click="allStop">全部中止</el-button>
              <el-button size="mini" type="primary">全部重试</el-button>
            </div>
            <div class="list-main">
              <div class="list-main-header">
                <div class="header-item left">设备名称</div>
                <div class="header-item right">执行状态</div>
              </div>
              <div class="list-main-body">
                <div v-for="(item, index) in activeServerResult ? activeServerResult.server : []" :key="item.serverId" class="main-body-item pointer" :class="activeServer ? activeServer.serverId === item.serverId ? 'active' : '' : ''" @click="handlerServer(item, index)">
                  <div class="name">{{ item.serverName }}</div>
                  <div class="statue">
                    <i v-if="item.executeStatue === 1" class="el-icon-success success" />
                    <i v-else-if="item.executeStatue === 0" class="el-icon-error danger" />
                    <i v-else class="el-icon-loading" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="execute-script" :style="{ height: percentageOneHeight * 100 + 'px' }">
            <div
              v-for="(item, index) in activeServerResult ? activeServerResult.server[activeServerIndex].script : []"
              :key="item.scriptId"
              class="execute-script-item pointer"
              :class="activeScriptIndex === index ? 'active' : ''"
              @click="handlerScript(item, index)"
            >
              {{ item.scriptName }}
            </div>
          </div>
          <div class="execute-build">
            <div class="execute-result execute-build-item" :style="{ height: percentageOneHeight * 60 + 'px' }">
              <div class="execute-build-title">分析结果</div>
              <div class="execute-build-main">
                <textarea v-if="activeServerResult && activeServerResult.server[activeServerIndex].script.length > 0" v-model="activeServerResult.server[activeServerIndex].script[activeScriptIndex].executeResult" readonly />
              </div>
            </div>
            <div class="build-result execute-build-item" :style="{ height: percentageOneHeight * 60 + 'px' }">
              <div class="execute-build-title">输出结果</div>
              <div class="execute-build-main">
                <textarea v-if="activeServerResult && activeServerResult.server[activeServerIndex].script.length > 0" v-model="activeServerResult.server[activeServerIndex].script[activeScriptIndex].buildResult" readonly />
              </div>
            </div>
            <div class="result-code execute-build-item" :style="{ height: percentageOneHeight * 40 + 'px' }">
              <div class="execute-build-title">结果分析脚本</div>
              <div class="execute-build-main">
                <textarea v-if="activeServerResult && activeServerResult.server[activeServerIndex].script.length > 0" v-model="activeServerResult.server[activeServerIndex].script[activeScriptIndex].analysisScript" readonly />
              </div>
            </div>
            <div class="analysis-table execute-build-item" :style="{ height: percentageOneHeight * 40 + 'px' }">
              <div class="execute-build-title">自动分析</div>
              <div class="execute-build-main">
                <div class="analysis-table-main">
                  <div class="analysis-table-header">
                    <div class="table-header-item">设备</div>
                    <div class="table-header-item">表达式</div>
                    <div class="table-header-item">分析值</div>
                    <div class="table-header-item">实际值</div>
                    <div class="table-header-item">结果</div>
                  </div>
                  <div v-if="activeServerResult" class="analysis-table-body">
                    <div v-for="(item, index) in getAllDeviceAuthAnalysis" :key="index">
                      <div class="table-body-item overflow-text-a">{{ item.serverName }}</div>
                      <div class="table-body-item overflow-text-a">{{ item.name }}</div>
                      <div class="table-body-item overflow-text-a">{{ item.compareCharacter }}{{ item.compareValue }}</div>
                      <div class="table-body-item overflow-text-a">{{ item.emptyExpression ? '暂无数据' : item.analyseResult }}</div>
                      <div v-if="item.analyseResultReturnOk" class="table-body-item overflow-text-a" :class="item.emptyExpression ? '' : item.analyseStatue === 0 ? 'danger' : 'success'">{{ item.emptyExpression ? '暂无数据' : item.analyseStatue === 0 ? '异常' : '正常' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import loadmore from '@/directive/el-select-loadmore/loadmore'
import { validEmail } from '@/utils/validate'

export default {
  name: 'TaskExecuteDialog',
  directives: { loadmore },
  props: {
    scriptExecuteResult: {
      type: Array,
      default() {
        return []
      }
    },
    task: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    const validateEmail = (rule, value, callback) => {
      if (value.length === 0) {
        return callback(new Error('请输入邮箱'))
      } else {
        const email = value.split(',')
        let isErr = false
        email.forEach(item => {
          if (!validEmail(item)) isErr = true
        })
        if (isErr) return callback(new Error('邮箱地址错误，请检查输入的邮箱地址格式'))
      }
      callback()
    }
    return {
      showDialog: false,
      percentageOneHeight: 0, // 弹窗内容区域高度，除以100，得到百分之一的高度
      activeServerResult: null, // 选择的步骤数据
      setProgress: 0, // 执行进度
      stepCenter: false, // 步骤条是否居中
      inMaxStepIndex: 0, // 当前步骤条索引
      activeServerIndex: 0, // 当前点击的主机索引
      activeServer: null, // 当前点击的主机
      activeScriptIndex: 0, // 当前点击的脚本索引
      activeScript: 0, // 当前点击的脚本
      executeLogSendForm: {
        executeTime: '',
        taskId: '',
        backup: '',
        emailAddress: ''
      },
      executeLogSendRules: {
        backup: [
          { required: true, message: '请输入结果说明', trigger: 'blur' }
        ],
        emailAddress: [
          { required: true, validator: validateEmail, trigger: 'blur' }
        ]
      },
      submitLoading: false,
      selectUser: [],
      hrUser: [],
      findHrUserInfoQuery: {
        page: 1,
        limit: 10
      },
      isOver: false,
      activeExecuteSuccessCount: 0,
      executeTotal: 0
    }
  },
  computed: {
    getAllDeviceAuthAnalysis() {
      const allDeviceAuthAnalysis = []
      if (this.activeServerResult.server[this.activeServerIndex].script.length > 0) {
        this.activeServerResult.server[this.activeServerIndex].script.forEach(item => {
          allDeviceAuthAnalysis.push({
            serverId: this.activeServerResult.server[this.activeServerIndex].serverId, // 服务器id
            serverName: this.activeServerResult.server[this.activeServerIndex].serverName, // 服务器名称
            name: item.authAnalysis[0].name || '', // 表达式名称
            compareCharacter: item.authAnalysis[0].compareCharacter || '', // 判断符号
            compareValue: item.authAnalysis[0].compareValue || '', // 判断值
            analyseResult: item.authAnalysis[0].analyseResult || '', // 实际结果
            analyseStatue: item.authAnalysis[0].analyseStatue || 0, // 分析状态
            emptyExpression: item.emptyExpression,
            analyseResultReturnOk: item.authAnalysis[0].analyseResultReturnOk
          })
        })
      }
      return allDeviceAuthAnalysis
    }
  },
  watch: {
    scriptExecuteResult: {
      handler() {
        if (this.scriptExecuteResult.length === 0) {
          this.activeServerResult = null
          this.activeExecuteSuccessCount = 0
          this.executeTotal = 0
        }
        this.setServerResultData()
      },
      deep: true
    }
  },
  mounted() {
    this.setServerResultData()
    this.findHrUser()
  },
  methods: {
    // 打开
    open() {
      this.showDialog = true
      this.activeServerResult = null
      this.$nextTick(() => {
        const dialogHeight = this.$refs.dialogBody.clientHeight - (this.$refs.stepList.clientHeight + 15)
        this.percentageOneHeight = dialogHeight / 100
        let clientWidthCount = 0
        if (this.$refs.stepItem) {
          this.$refs.stepItem.forEach(item => {
            clientWidthCount += item.clientWidth
          })
          this.stepCenter = clientWidthCount < this.$refs.stepList.clientWidth
        }
      })
    },
    setServerResultData() {
      if (!this.activeServerResult && this.scriptExecuteResult.length > 0) {
        this.activeServerResult = this.scriptExecuteResult[0]
        this.activeServer = this.scriptExecuteResult[0].server[0]
        this.inMaxStepIndex = 0
      }

      if (this.executeTotal === 0) {
        let executeTotal = 0
        this.scriptExecuteResult.forEach(item => {
          if (item.server) {
            item.server.forEach(sItem => {
              ++executeTotal
            })
          }
        })
        this.executeTotal = executeTotal
      }

      // 进度条计算
      if (this.activeServerResult && !this.activeServerResult.isStepOver) {
        let overCount = 0
        this.activeServerResult.server.forEach(item => {
          if (item.executeStatue !== -1) overCount++
        })
        this.setProgress = (100 / this.activeServerResult.server.length) * overCount
      }

      let activeExecuteSuccessCount = 0
      if (this.scriptExecuteResult.length > 0) {
        this.scriptExecuteResult.forEach(item => {
          if (item.server) {
            item.server.forEach(sItem => {
              if (sItem.executeStatue === 1) ++activeExecuteSuccessCount
            })
          }
        })
      }
      this.activeExecuteSuccessCount = activeExecuteSuccessCount
    },
    // 选择步骤
    handlerStep(item, index) {
      if (item.isStepOver && this.activeExecuteSuccessCount !== this.executeTotal) {
        return this.$message('请等待全部步骤执行完成')
      }
      this.activeScriptIndex = 0
      this.activeServerIndex = 0
      this.activeScript = null
      this.activeServer = null
      this.activeServerResult = item
      this.inMaxStepIndex = index
    },
    // 点击选择服务
    handlerServer(item, index) {
      this.activeServer = item
      this.activeServerIndex = index
    },
    // 全部停止执行
    allStop() {
      this.$EventBus.$emit('stop-all-exec-script')
    },
    handlerScript(item, index) {
      this.activeScript = item
      this.activeScriptIndex = index
    },
    onReset() {
      this.$refs['executeLogSendForm'].resetFields()
    },
    onSubmit() {
      this.$refs['executeLogSendForm'].validate(async valid => {
        if (valid) {
          this.$set(this.executeLogSendForm, 'taskId', this.task.id)
          this.$set(this.executeLogSendForm, 'executeTime', this.task.executeTime)
          const getOpsExecuteLogSend = await this.findHyitOpsExecuteLogSend({ taskId: this.task.id, executeTime: this.task.executeTime })
          if (getOpsExecuteLogSend && getOpsExecuteLogSend.length > 0) {
            this.$set(this.executeLogSendForm, 'id', getOpsExecuteLogSend[0].id)
            this.updateHyitOpsExecuteLogSend()
          } else {
            this.insertHyitOpsExecuteLogSend()
          }
        }
      })
    },
    async findHrUser() {
      const hrUser = await this.commonRequestFn.findHrUserInfo({...this.findHrUserInfoQuery, companyId: this.$auth.getUserSession().companyId})
      if (hrUser && hrUser.length > 0) {
        this.hrUser = [...this.hrUser, ...hrUser]
      } else {
        this.isOver = true
      }
    },
    async loadMore() {
      if (this.isOver) return
      this.$set(this.findHrUserInfoQuery, 'page', ++this.findHrUserInfoQuery.page)
      await this.findHrUser()
    },
    insertHyitOpsExecuteLogSend() {
      this.$request({
        url: this.api.automationOperations.insertHyitOpsExecuteLogSend,
        data: this.executeLogSendForm
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async findHyitOpsExecuteLogSend(query) {
      const { code, data } = await this.$request({
        url: this.api.automationOperations.findHyitOpsExecuteLogSend,
        data: query
      })
      if (code !== 1) return
      return data
    },
    updateHyitOpsExecuteLogSend() {
      this.$request({
        url: this.api.automationOperations.updateHyitOpsExecuteLogSend,
        data: this.executeLogSendForm
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.step-list {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  overflow-x: auto;
  margin-bottom: 10px;
  .step-list-main {
    display: flex;
    align-items: center;
    .step-item {
      flex-basis: 100px;
      flex-grow: 0;
      flex-shrink: 0;
      .step-item-header {
        position: relative;
        &:before {
          content: ' ';
          display: block;
          position: absolute;
          top: 50%;
          height: 3px;
          background: #d7d7d7;
          width: calc(50% - 30px);
          left: 0;
          z-index: 0;
        }
        &:after {
          content: ' ';
          display: block;
          position: absolute;
          top: 50%;
          height: 3px;
          background: #d7d7d7;
          width: calc(50% - 30px);
          right: 0;
          z-index: 0;
        }
      }
      .item-node-label {
        background: #aaaaaa;
        border-radius: 15px;
        color: #fff;
        width: 60px;
        line-height: 60px;
        margin: 0 auto;
        text-align: center;
      }
      .active {
        background: #4cae88 !important;
      }
      .error {
        background: #EF6567 !important;
      }
      .item-node-desc {
        color: #000;
        margin-top: 10px;
        text-align: center;
        width: 200px;
      }
      .step-item-line {
        border-top: 2px solid #e4e7ed;
      }
      &:first-of-type {
        .step-item-header {
          &:before {
            display: none;
          }
        }
      }
      &:last-of-type {
        .step-item-header {
          &:after {
            display: none;
          }
        }
      }
    }
  }
}
.step-over {
  padding: 15px;
  .tip {
    color: #797979;
    font-size: 12px;
  }
  .title-tag {
    background: #f2f2f2;
    color: #000;
    padding: 10px;
  }
}
.execute-result {
  .execute-build-item:nth-of-type(odd) {
    border-right: 1px solid #797979;
  }
  .execute-device, .execute-build, .execute-result, .result-code, .build-result, .analysis-table, .execute-script {
    display: inline-block;
    vertical-align: top;
  }
  .execute-result, .result-code {
    width: 45%;
  }
  .build-result, .analysis-table {
    width: 55%;
  }
  .execute-device {
    width: 20%;
    .list-button {
      padding: 10px;
    }
    .list-main {
      .list-main-header {
        background: #eeeeee;
        color: #000;
        .header-item {
          display: inline-block;
          padding: 10px;
        }
        .left {
          width: 70%;
        }
        .right {
          width: 30%;
        }
      }
      .list-main-body {
        color: #000;
        .main-body-item {
          .name, .statue {
            display: inline-block;
            padding: 10px;
          }
          .name {
            width: 70%;
          }
          .statue {
            width: 30%;
          }
        }
        .active {
          background: #f2f2f2;
        }
      }
    }
  }
  .execute-script {
    width: 15%;
    background: #2f3033;
    .execute-script-item {
      padding: 12px 20px;
      display: block;
      color: #fff;
    }
    .active {
      background: #212124;
      border-left: 5px solid #4cae88;
    }
  }
  .execute-build {
    width: 65%;
    .execute-build-title {
      color: #fff;
      font-size: 13px;
      padding: 10px;
      background: #2f3033;
    }
    .execute-build-main {
      color: #fff;
      font-size: 13px;
      padding: 10px;
      background: #212124;
      height: calc(100% - 35px);
      textarea {
        width: 100%;
        height: 100%;
        background: #212124;
        border: unset;
        color: #fff;
        font-size: 13px;
        resize: none;
        outline: none;
      }
      .analysis-table-main {
        width: 95%;
        margin: 0 auto;
        .analysis-table-header {
          border: 1px solid #4d4d4e;
          padding: 10px 5px;
          .table-header-item {
            width: 20%;
            display: inline-block;
            text-align: center;
          }
        }
        .analysis-table-body {
          .table-body-item {
            padding: 10px 5px;
            width: 20%;
            display: inline-block;
            text-align: center;
            border-bottom: 1px solid #2f3033;
          }
        }
      }
    }
  }
}
.execute-progress {
  background: #1846a5;
  height: 5px;
  width: 0;
}
.execute-log-send-form {
  margin-top: 20px;
}
</style>
