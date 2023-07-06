<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <div class="header-main">
          <div class="header-main-info">
            <div class="main-info-title overflow-text-a">{{ opsScript.scriptName }}</div>
            <span class="main-info-version overflow-text-a">版本号：{{ opsScript.scriptVersion }}</span>
          </div>
          <div class="header-main-desc">
            <div class="main-desc-item overflow-text-a">适用场景：{{ setUsageAcenarios(opsScript.sceneType) }}</div>
            <div class="main-desc-item overflow-text-a">适用类型：{{ setDevType(opsScript.applyDeviceType) }}</div>
            <div class="main-desc-item overflow-text-a">适用品牌：{{ setBrand(opsScript.deviceTypeCatId) }}</div>
          </div>
        </div>
        <el-form ref="opsScript" :model="opsScript" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17" class="script-code-col">
              <el-form-item class="label-text-left" label="脚本代码">
                <TabListSwitch :button-data="scriptType" :button-width="140" style="width: 100% !important;">
                  <div v-for="item in scriptType" :key="item.id" class="tab-item pointer" :class="opsScript.scriptType === item.id ? 'active' : ''">
                    <div class="flexBox align-item-center flex-center">
                      <div class="gateway-name overflow-text-a">{{ item.dictdataName }}</div>
                    </div>
                  </div>
                </TabListSwitch>
                <CodeMirrorEditor id="scriptCode" ref="scriptCode" el="scriptCode" :is-read-only="true" />
              </el-form-item>
              <el-form-item class="script-form-item label-text-left" label="超时时长" prop="executeTimeout">
                <el-input v-model.trim="executeTimeout" type="number" placeholder="请输入超时时长">
                  <template slot="append">秒</template>
                </el-input>
              </el-form-item>
              <el-form-item v-if="opsScript.sceneType === 1" class="label-text-left" label="分析结果脚本">
                <TabListSwitch :button-data="expressionTypes" :button-width="140" style="width: 100% !important;">
                  <div v-for="item in expressionTypes" :key="item.id" class="tab-item pointer" :class="resultExpression.expressionType === item.value ? 'active' : ''">
                    <div class="flexBox align-item-center flex-center">
                      <div class="gateway-name overflow-text-a">{{ item.label }}</div>
                    </div>
                  </div>
                </TabListSwitch>
                <CodeMirrorEditor id="detailResultScriptCode" ref="resultScriptCode" el="resultScriptCode" :is-read-only="true" />
                <div class="expression-form">
                  <span class="title">分析结果</span>
                  <el-input v-model.trim="resultExpression.name" size="mini" class="expression-form-item" placeholder="表达式名称" />
                  <el-select
                    v-model="resultExpression.compareCharacter"
                    size="mini"
                    class="expression-form-item"
                    placeholder="判断符号"
                  >
                    <el-option
                      v-for="item in compareCharacterList"
                      :key="item.label"
                      :label="item.label"
                      :value="item.label"
                    />
                  </el-select>
                  <el-input v-model.trim="resultExpression.compareValue" size="mini" class="expression-form-item" placeholder="匹配值" />
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7">
              <div ref="rightPane" class="right-pane" :style="{ position: rightPaneTop > 0 ? 'fixed' : '', top: rightPaneTop + 'px', right: '20px', height: '60%' }">
                <ScriptRightPaneExecuteResult :script-execute-result="scriptExecuteResult" />
                <ScriptRightPaneDevice />
              </div>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <ScriptExecuteDialog ref="scriptExecuteDialog" :script-execute-result="scriptExecuteResult" :build-result="false" />
  </div>
</template>

<script>
import TabListSwitch from '@/components/AutomationOperationsComponent/TabListSwitch'
import selectMixin from '@/views-admin/activiti/mixin/selectMixin'
import { getUserSession } from '@/utils/auth'
import ScriptExecuteDialog from '@/components/AutomationOperationsComponent/ScriptExecuteDialog'
import ScriptRightPaneDevice from '@/components/AutomationOperationsComponent/ScriptRightPaneDevice'
import ScriptRightPaneExecuteResult from '@/components/AutomationOperationsComponent/ScriptRightPaneExecuteResult'
import CodeMirrorEditor from '@/components/CodeMirrorEditor/Editor.vue'

export default {
  name: 'ScriptDetail',
  components: {
    TabListSwitch,
    ScriptExecuteDialog,
    ScriptRightPaneDevice,
    ScriptRightPaneExecuteResult,
    CodeMirrorEditor
  },
  mixins: [selectMixin],
  data() {
    return {
      loading: false,
      opsScript: {},
      resultExpression: {},
      deviceTypeBrand: [],
      scriptType: [],
      sceneType: this.$defineData.getOpsSceneType(),
      expressionTypes: [
        { value: 2, label: 'Python表达式' },
        { value: 3, label: 'Shell表达式' },
        { value: 1, label: '普通表达式' }
      ],
      compareCharacterList: [
        { label: '<' },
        { label: '>' },
        { label: '=' }
      ],
      selectDevice: [],
      executeTimeout: 60,
      scriptExecuteResult: [],
      serverIds: '',
      agent: '',
      fromAgent: '',
      deviceType: [],
      rightPaneTop: 0
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    },
    setUsageAcenarios() {
      return function (key) {
        const idx = this.sceneType.findIndex(item => Number(item.value) === Number(key))
        if (idx !== -1) return this.sceneType[idx].label
      }
    },
    setDevType() {
      return function (key) {
        const idx = this.deviceType.findIndex(item => Number(item.id) === Number(key))
        if (idx !== -1) return this.deviceType[idx].dictdataName
      }
    },
    setBrand() {
      return function (key) {
        const idx = this.deviceTypeBrand.findIndex(item => Number(item.id) === Number(key))
        if (idx !== -1) return this.deviceTypeBrand[idx].dictdataName
      }
    },
    checkSelectable() {
      return function(row) {
        return (row.pwd != null && typeof (row.pwd) !== undefined && row.pwd !== '') && (row.userName != null && typeof (row.userName) !== undefined && row.userName !== '')
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('implement-script,stop-all-exec-script')
  },
  async mounted() {
    this.$EventBus.$on('implement-script', (res) => {
      this.allSelection = this.$tool.deepCopy(res.device)
      this.agent = res.agent
      this.fromAgent = res.fromAgent
      this.implement()
    })

    window.addEventListener('watchWsMessage', (res) => {
      // 执行输出
      if (res.detail.data.cmd === 'execScript-websocket') {
        const wsRes = JSON.parse(res.detail.data.data)
        if (wsRes.output.indexOf('执行完成') !== -1) {
          const getServerIdx = this.scriptExecuteResult.findIndex(item => Number(item.serverId) === Number(wsRes.curServerId))
          if (getServerIdx !== -1) this.$set(this.scriptExecuteResult[getServerIdx], 'executeStatue', 1)
        }
      }
      // 分析结果
      if (res.detail.data.cmd === 'execScript-analyse-websocket') {
        const wsRes = JSON.parse(res.detail.data.data)
        console.log('execScript-analyse-websocket', wsRes)
        wsRes.forEach(item => {
          const getServerIdx = this.scriptExecuteResult.findIndex(items => Number(items.serverId) === Number(item.serverId))
          if (getServerIdx !== -1) {
            this.$set(this.scriptExecuteResult[getServerIdx], 'executeResult', item.executeLog)
            this.$set(this.scriptExecuteResult[getServerIdx], 'analysisResult', item.analyseResult)
            this.$set(this.scriptExecuteResult[getServerIdx].authAnalysis[0], 'analyseResult', item.analyseResult)
            this.$set(this.scriptExecuteResult[getServerIdx].authAnalysis[0], 'analyseStatue', item.analyseStatue)
            this.$set(this.scriptExecuteResult[getServerIdx].authAnalysis[0], 'analyseResultReturnOk', true)
          }
        })
      }
    })
    this.$EventBus.$on('stop-all-exec-script', () => {
      this.stopAllExecScript()
    })

    this.findDevType()
    this.findScriptType()
    this.findItDeviceType()

    if (this.id) {
      this.opsScript = await this.getHyitOpsScript()
      this.$refs.scriptCode.setValue(this.opsScript.script)
      if (this.opsScript.sceneType === 1) {
        const resultExpression = await this.findHyitOpsResultExpression()
        if (resultExpression) {
          this.resultExpression = resultExpression[0]
          this.$refs.resultScriptCode.setValue(resultExpression[0].expression)
        }
      }
      this.setCodeEditorMode()
    }

    this.$nextTick(() => {
      this.rightPaneTop = this.$refs.rightPane.getBoundingClientRect().top
    })
  },
  methods: {
    // 查看脚本
    async getHyitOpsScript() {
      const { code, model } = await this.$request({
        url: this.api.automationOperations.getHyitOpsScript,
        data: { id: this.id }
      })
      if (code !== 1) return
      return model
    },
    // 查看分析表达式
    async findHyitOpsResultExpression() {
      const { code, data } = await this.$request({
        url: this.api.automationOperations.findHyitOpsResultExpression,
        data: { scriptId: this.id }
      })
      if (code !== 1) return
      return data
    },
    // 加载设备品牌
    findDevType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceTypeBrand = res.data
        }
      })
    },
    // 获取脚本类型
    findScriptType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_script_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          const scriptType = []
          res.data.forEach(item => {
            if (item.dictdataName === 'python') {
              scriptType[0] = item
            }
            if (item.dictdataName === 'shell') {
              scriptType[1] = item
            }
            if (item.dictdataName === 'ansible command') {
              scriptType[2] = item
            }
            if (item.dictdataName === 'playbook') {
              scriptType[3] = item
            }
          })
          this.scriptType = scriptType
        }
      })
    },
    // 执行
    async implement() {
      this.scriptExecuteResult = []

      if (this.allSelection.length === 0) return this.$message('请选择执行设备')
      let serverIds = ''

      this.$refs.scriptExecuteDialog.open()

      this.$nextTick(() => {
        this.allSelection.forEach(item => {
          serverIds += item.opsServerId + ','
          this.$set(this.scriptExecuteResult, this.scriptExecuteResult.length, {
            serverId: item.opsServerId, // 服务器id
            serverName: item.hyMarkName, // 服务器名称
            executeStatue: -1, // 执行状态
            executeResult: '', // 执行结果
            analysisResult: '', // 输出结果
            analysisScript: this.resultExpression.expression || '', // 分析脚本
            authAnalysis: [ // 自动分析数据
              {
                name: this.resultExpression.name || '', // 表达式名称
                compareCharacter: this.resultExpression.compareCharacter || '', // 判断符号
                compareValue: this.resultExpression.compareValue || '', // 判断值
                analyseResult: '', // 实际结果
                analyseStatue: 0 // 分析状态
              }
            ]
          })
        })

        serverIds = serverIds.substring(0, serverIds.length - 1)

        this.serverIds = serverIds

        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        const getUserSessionResult = getUserSession()
        this.$ws.sendWebsocket(this.wsCmd.host.default, {
          cmd: this.wsCmd.automationOperations.execScript,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            scriptId: this.id,
            serverIds: serverIds,
            agent: this.agent,
            fromAgent: this.fromAgent,
            fromHostId: '',
            timeout: this.executeTimeout
          }
        })
      })
    },
    // 停止全部脚本执行
    stopAllExecScript() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      const getUserSessionResult = getUserSession()
      this.$ws.sendWebsocket(this.wsCmd.host.default, {
        cmd: this.wsCmd.automationOperations.stopExecScript,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          scriptId: this.id,
          serverIds: this.serverIds,
          agent: this.findHyitHostQuery.agent,
          timeout: this.executeTimeout
        }
      })
    },
    // 获取设备类型
    findItDeviceType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceType = res.data
        }
      })
    },
    // 设置编辑器模式
    setCodeEditorMode() {
      this.scriptType.forEach(item => {
        if (this.opsScript.scriptType === item.id) {
          if (+item.dictdataValue === 5) {
            this.$refs.scriptCode.handlerModeItem('python')
          }
          if (+item.dictdataValue === 3) {
            this.$refs.scriptCode.handlerModeItem('shell')
          }
        }
      })
      if (this.resultExpression.expressionType === 2) {
        this.$refs.resultScriptCode.handlerModeItem('python')
      }
      if (this.resultExpression.expressionType === 3) {
        this.$refs.resultScriptCode.handlerModeItem('python')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header-main {
  margin-bottom: 30px;
  .header-main-info {
    display: flex;
    .main-info-title {
      font-size: 24px;
      font-weight: bold;
      display: inline-block;
      max-width: 40%;
    }
    .main-info-version {
      font-size: 14px;
      background: #aaaaaa;
      color: #fff;
      padding: 5px 18px;
      border-radius: 15px;
      margin-left: 34px;
      max-width: 20%;
    }
  }
  .header-main-desc {
    margin-top: 20px;
    .main-desc-item {
      color: #9b9b9b;
      display: inline-block;
      margin-left: 44px;
      max-width: 20%;
      &:first-of-type {
        margin-left: 0 !important;
      }
    }
  }
}
.script-form-item {
  display: inline-block !important;
  width: 50%;
}
.expression-form {
  background: #000;
  width: 100%;
  color: #fff;
  padding: 14px 0;
  .title {
    padding: 0 10px;
    font-size: 13px;
  }
  .expression-form-item {
    display: inline-block;
    width: 20%;
    margin-left: 10px;
  }
}
.script-code-col {
  // margin-top: 20px;
  .tab-item {
    width: 140px;
    margin-bottom: 4px;
    display: inline-block;
    text-align: center;
    color: #9f9fa0;
    .gateway-name {
      font-size: 14px;
    }
  }
  .active {
    color: #fff;
  }
}
.device-form {
  .device-form-item {
    margin-bottom: 20px;
    .form-item-label {
      font-size: 14px;
      margin-bottom: 10px;
    }
  }
}
</style>

<style lang="scss">
#detailScriptCode {
  .CodeMirror {
    height: 500px !important;
  }
}
#detailResultScriptCode {
  .CodeMirror {
    height: 500px !important;
  }
}
</style>
