<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ isDetail ? '查看脚本' : navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
              <el-form-item class="script-form-item label-text-left" label="脚本名称" prop="scriptName">
                <el-input v-if="!isDetail" v-model="form.scriptName" placeholder="请输入脚本名称" />
                <div v-else>{{ form.scriptName }}</div>
              </el-form-item>
              <el-form-item class="script-form-item label-text-left" label="适用场景" prop="sceneType">
                <el-select
                  v-if="!isDetail"
                  v-model="form.sceneType"
                  placeholder="请选择适用场景"
                  style="width: 100%;"
                  @change="changeSceneType"
                >
                  <el-option
                    v-for="item in sceneType"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <div v-else>{{ setUsageAcenarios(form.sceneType) }}</div>
              </el-form-item>
              <el-form-item class="script-form-item label-text-left" label="适用设备类型" prop="applyDeviceType">
                <el-select
                  v-if="!isDetail"
                  v-model="form.applyDeviceType"
                  placeholder="请选择设备类型"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in deviceType"
                    :key="item.id"
                    :label="item.dictdataName"
                    :value="item.id"
                  />
                </el-select>
                <div v-else>{{ setDevType(form.applyDeviceType) }}</div>
              </el-form-item>
              <el-form-item class="script-form-item label-text-left" label="适用品牌" prop="deviceTypeCatId">
                <el-select
                  v-if="!isDetail"
                  v-model="form.deviceTypeCatId"
                  placeholder="请选择适用品牌"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in deviceTypeBrand"
                    :key="item.id"
                    :label="item.dictdataName"
                    :value="item.id"
                  />
                </el-select>
                <div v-else>{{ setBrand(form.deviceTypeCatId) }}</div>
              </el-form-item>
              <el-form-item class="script-form-item label-text-left" label="适用型号" prop="applyDeviceModel">
                <el-input v-if="!isDetail" v-model.trim="form.applyDeviceModel" placeholder="请输入适用型号" />
                <div v-else>{{ form.applyDeviceModel || '' }}</div>
              </el-form-item>
              <el-form-item class="script-form-item label-text-left" label="版本号" prop="scriptVersion">
                <el-input v-if="!isDetail" v-model.trim="form.scriptVersion" placeholder="请输入版本号" />
                <div v-else>{{ form.scriptVersion }}</div>
              </el-form-item>
              <el-form-item class="script-form-item label-text-left" label="目录" prop="scriptGroupId">
                <AiTreeInput
                  v-if="!isDetail"
                  :level-start-num="0"
                  :field="{'id':'id','name':'groupName','parent':'parentId'}"
                  :remote="api.automationOperations.findHyitOpsScriptGroup"
                  :infoapi="api.automationOperations.getHyitOpsScriptGroup"
                  placeholder="请输入目录"
                  :param="{limit: -1}"
                  :bind-value="form.scriptGroupId"
                  :mounted-require="true"
                  @input="inputParent"
                />
                <div v-else>{{ detailGroup ? detailGroup.groupName : '' }}</div>
              </el-form-item>
              <el-form-item class="script-form-item label-text-left" label="备注说明" prop="remark">
                <el-input v-if="!isDetail" v-model="form.remark" placeholder="请输入备注说明" />
                <div v-else>{{ form.remark }}</div>
              </el-form-item>
              <el-form-item label="选择设备" class="script-form-item select-device-form label-text-left">
                <el-button size="mini" type="primary" icon="el-icon-plus" @click="openSelectionWindow">添加设备</el-button>
                <div class="facilityList">
                  <el-col v-for="item in allSelection" :key="item.id" :span="7" class="facilityList-item">
                    <div class="item-name">{{ item.hyMarkName }}</div>
                    <div class="font-14">{{ item.hyIp }}</div>
                    <i class="el-icon-close font-16 pointer" @click="handlerDeleteSelectDevice(item)" />
                  </el-col>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="22" :sm="22" :md="22" :lg="22" :xl="22">
              <div ref="scriptCodeSpec" class="console-spec">
                <div class="console-spec-title">脚本调试区</div>
                <div ref="consoleSpecMain" class="console-spec-main">
                  <div class="console-code">
                    <div class="console-code-header">
                      <div class="code-header-title">脚本内容</div>
                      <div class="btns">
                        <div v-for="item in scriptType" :key="item.id" :class="form.scriptType === item.id ? 'active' : ''" class="btn-item pointer" @click="handlerScriptType(item.id)">{{ item.dictdataName }}</div>
                      </div>
                    </div>
                    <CodeMirrorEditor id="formScriptCode" ref="scriptCode" el="scriptCode" :is-read-only="isDetail" />
                  </div>
                  <div class="console-code">
                    <div class="console-code-header">
                      <div class="code-header-title">分析脚本</div>
                      <div class="btns">
                        <div v-for="item in expressionTypes" :key="item.id" class="btn-item pointer" :class="resultExpressionForm.expressionType === item.value ? 'active' : ''" @click="handlerExpressionType(item.value)">{{ item.label }}</div>
                      </div>
                    </div>
                    <CodeMirrorEditor id="formResultScriptCode" ref="resultScriptCode" el="resultScriptCode" :is-read-only="isDetail" />
                    <div class="console-code-header expression-header">
                      <div class="code-header-title expression-form-title">表达式</div>
                    </div>
                    <div class="expression-form opm-expression-form">
                      <el-input v-model.trim="resultExpressionForm.name" size="mini" class="expression-form-item" placeholder="表达式名称" />
                      <el-select
                        v-model="resultExpressionForm.compareCharacter"
                        size="mini"
                        class="expression-form-item"
                        placeholder="判断符号"
                        clearable
                      >
                        <el-option
                          v-for="item in compareCharacterList"
                          :key="item.label"
                          :label="item.label"
                          :value="item.label"
                        />
                      </el-select>
                      <el-input v-model.trim="resultExpressionForm.compareValue" size="mini" class="expression-form-item" placeholder="匹配值" />
                    </div>
                  </div>
                </div>
                <div class="console-result-main">
                  <ConsoleResultSpec
                    :analysis-result="analysisResult"
                    :implement-analysis-script="!isDetail"
                    :options="consoleResultSpecOptions"
                    :script-execute-result="scriptExecuteResult"
                    :build-result="buildResult"
                    :implement-script-button-options="isDetail ? { defaultText: '运行脚本', loadingText: '运行中' } : { defaultText: '调试脚本', loadingText: '调试中' }"
                  />
                </div>
              </div>
            </el-col>
            <el-col v-if="!isDetail" :xs="17" :sm="17" :md="17" :lg="17" :xl="17" class="submit-btn">
              <el-button v-permission="['Submit']" type="primary" :loading="submitLoading" @click="onSubmit(false)">保存</el-button>
              <el-button @click="onReset">重置</el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <ScriptExecuteDialog ref="scriptExecuteDialog" :script-execute-result="scriptExecuteResult" :build-result="buildResult" />
    <ScriptSelectDeviceDialog ref="scriptSelectDeviceDialog" :is-radio="true" />
  </div>
</template>

<script>
import AiTreeInput from '@/components/AiTreeInput/vue-auto-input-tree'
import {getUserSession} from '@/utils/auth'
import ScriptExecuteDialog from '@/components/AutomationOperationsComponent/ScriptExecuteDialog'
import ConsoleResultSpec from '@/components/AutomationOperationsComponent/ConsoleResultSpec'
import ScriptSelectDeviceDialog from '@/components/AutomationOperationsComponent/ScriptSelectDeviceDialog'
import CodeMirrorEditor from '@/components/CodeMirrorEditor/Editor.vue'

export default {
  name: 'ScriptLibraryForm',
  components: {
    AiTreeInput,
    ScriptExecuteDialog,
    ConsoleResultSpec,
    ScriptSelectDeviceDialog,
    CodeMirrorEditor
  },
  props: {
    buildResult: {
      type: Boolean,
      default: false
    },
    analysisResult: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      submitLoading: false,
      form: {
        scriptName: '',
        scriptType: '',
        scriptStatue: '0',
        remark: '',
        script: '',
        applyDeviceModel: '',
        applyDeviceType: '',
        deviceTypeCatId: '',
        sceneType: 1,
        scriptVersion: '',
        verifyStatue: 0,
        scriptGroupId: 0,
        serverId: ''
      },
      sceneType: this.$defineData.getOpsSceneType(),
      rules: {
        scriptName: [
          { required: true, message: '请输入脚本名称', trigger: 'blur' }
        ],
        sceneType: [
          { required: true, message: '请选择适用场景', trigger: 'blur' }
        ],
        applyDeviceType: [
          { required: true, message: '请选择适用设备类型', trigger: 'blur' }
        ],
        deviceTypeCatId: [
          { required: true, message: '请选择适用品牌', trigger: 'blur' }
        ]
      },
      deviceType: [],
      deviceTypeBrand: [],
      scriptType: [],
      scriptCodeMirror: null,
      selectScriptType: '',
      executeTimeout: 60,
      resultCodeMirror: null,
      resultExpressionForm: {
        name: '',
        expression: '',
        expressionType: 2,
        compareValue: '',
        compareCharacter: ''
      },
      expressionTypes: [
        { value: 2, label: 'Python表达式' },
        { value: 3, label: 'Shell表达式' }/*,
                { value: 1, label: '普通表达式' }*/
      ],
      compareCharacterList: [
        { label: '<' },
        { label: '>' },
        { label: '=' }
      ],
      scriptGroup: [],
      detailGroup: {},
      scriptExecuteResult: [],
      allSelection: [],
      serverIds: '',
      agentList: [],
      agentItem: {},
      agentItemId: '',
      childrenAgentItem: {},
      childrenAgentItemId: '',
      childrenAgentList: [],
      showChildrenAgentItem: false,
      agentsIds: '',
      agent: '',
      fromAgent: '',
      rightPaneTop: 0,
      disabledImplement: true, // 创建脚本的时候点击保存 并且保存成功
      createScriptInSaveModel: {},
      consoleResultSpecOptions: {
        height: 0
      },
      createScriptResultMatchingInSaveModel: {},
      inExecute: false
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    },
    isDetail() {
      return this.$route.query.isDetail
    },
    setScriptType() {
      return function (key) {
        const idx = this.scriptType.findIndex(item => Number(item.id) === Number(key))
        if (idx !== -1) return this.scriptType[idx].dictdataName
      }
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
    setVerifyStatue() {
      return function (key, attr) {
        const idx = this.verifyStatue.findIndex(item => Number(item.value) === Number(key))
        if (idx !== -1) return this.verifyStatue[idx][attr]
      }
    }
  },
  destroyed() {
    this.batchOffEventBus('implement-script,complete-selection-device,implement-analysis-result')
  },
  async mounted() {
    this.$EventBus.$on('implement-script', () => {
      if (this.allSelection.length === 0) {
        this.$EventBus.$emit('implement-button-loading-statue', false)
        return this.$message('请选择执行设备')
      }
      if (this.isDetail) {
        this.implement()
      } else {
        this.onSubmit(true)
      }
    })

    this.$EventBus.$on('complete-selection-device', (res) => {
      this.$set(this.form, 'serverId', res.device[0].opsServerId)
      if (this.id || this.createScriptInSaveModel.id) {
        this.$request({
          url: this.api.automationOperations.updateHyitOpsScript,
          data: { id: this.id, serverId: res.device[0].opsServerId }
        })
      }
      this.allSelection = this.$tool.deepCopy(res.device)
      this.agent = res.agent
      this.fromAgent = res.fromAgent
    })

    this.$EventBus.$on('implement-analysis-result', async (res) => {
      if (this.$refs.resultScriptCode) this.$set(this.resultExpressionForm, 'expression', this.$tool.delTextEndBlankSpace(this.$refs.resultScriptCode.getValue()))
      const saveResultMatchingData = await this.saveResultMatchingData(this.id)
      this.scriptExecuteResult.forEach((item, index) => {
        this.$set(this.scriptExecuteResult[index].authAnalysis[0], 'name', saveResultMatchingData.name)
        this.$set(this.scriptExecuteResult[index].authAnalysis[0], 'compareCharacter', saveResultMatchingData.compareCharacter)
        this.$set(this.scriptExecuteResult[index].authAnalysis[0], 'compareValue', saveResultMatchingData.compareValue)
        this.$set(this.scriptExecuteResult[index].authAnalysis[0], 'analyseResultReturnOk', true)
      })
      this.debugScript(res)
    })

    window.addEventListener('watchWsMessage', (res) => {
      // 执行输出
      if (res.detail.data.cmd === 'execScript-websocket') {
        const wsRes = JSON.parse(res.detail.data.data)
        const getServerIdx = this.scriptExecuteResult.findIndex(item => Number(item.serverId) === Number(wsRes.curServerId))
        if (wsRes.output.indexOf('执行完成') !== -1) {
          this.inExecute = false
          if (getServerIdx !== -1) this.$set(this.scriptExecuteResult[getServerIdx], 'executeStatue', 1)
          this.$EventBus.$emit('implement-button-loading-statue', false)
        }
        if (getServerIdx !== -1) this.$set(this.scriptExecuteResult[getServerIdx], 'buildResult', this.scriptExecuteResult[getServerIdx].buildResult += wsRes.output + '\n')
      }
      // 分析结果
      if (res.detail.data.cmd === 'execScript-analyse-websocket') {
        const wsRes = JSON.parse(res.detail.data.data)
        this.$EventBus.$emit('analysis-button-loading-statue', false)
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
    this.findItDeviceType()
    this.findScriptType()
    // await this.$refs.scriptCode.initCodeMirror()
    if (this.id) {
      const getScript = await this.getHyitOpsScript()
      if (getScript) {
        Object.keys(this.form).forEach(key => {
          this.$set(this.form, `${key}`, getScript[`${key}`])
        })
        if (this.form.serverId) {
          const opsServer = await this.$request({ url: this.api.automationOperations.getHyitOpsServer, data: { id: this.form.serverId }})
          if (opsServer.code === 1 && opsServer.model) {
            const itHost = await this.$request({ url: this.api.itMonitor.findHyitHost, data: { ids: opsServer.model.hostId } })
            if (itHost.code === 1 && itHost.data && itHost.data.length > 0) {
              itHost.data[0].opsServerId = opsServer.model.id
              itHost.data[0].userName = opsServer.model.userName
              itHost.data[0].pwd = opsServer.model.pwd
              this.allSelection = itHost.data
              this.agent = this.allSelection[0].agent
              this.fromAgent = this.allSelection[0].fromAgent
            }
          }
        }
        this.$refs.scriptCode.setValue(getScript.script)

        // if (getScript.sceneType === 1) {
        const getResultExpression = await this.findHyitOpsResultExpression()
        if (getResultExpression.length > 0) {
          Object.keys(this.resultExpressionForm).forEach(key => {
            this.$set(this.resultExpressionForm, `${key}`, getResultExpression[0][`${key}`])
          })
          this.$set(this.resultExpressionForm, 'id', getResultExpression[0].id)
          this.$refs.resultScriptCode.setValue(getResultExpression[0].expression)
        }
        // }

        if (this.isDetail) {
          this.detailGroup = await this.getHyitOpsScriptGroup(this.form.scriptGroupId)
        }
        this.disabledImplement = false
      }
    } else {
      this.setCodeByExpressionType()
    }

    this.$nextTick(() => {
      this.$set(this.consoleResultSpecOptions, 'height', this.$refs.consoleSpecMain.clientHeight)
    })

    this.setCodeEditorMode()

    // const scriptExecDeviceStorage = this.localStorageOperation('get', 'script-exec-device')
    // if (scriptExecDeviceStorage) {
    //   this.allSelection = scriptExecDeviceStorage
    //   this.agent = scriptExecDeviceStorage[0].agent
    //   this.fromAgent = scriptExecDeviceStorage[0].fromAgent
    // }
  },
  methods: {
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
          if (!this.id) {
            this.form.scriptType = res.data[0].id
            this.setCodeBuScriptType()
          }
        }
      })
    },
    // 加载设备品牌
    findDevType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceTypeBrand = res.data
          if (!this.id) this.form.deviceTypeCatId = res.data[0].id
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
          if (!this.id) this.form.applyDeviceType = res.data[0].id
        }
      })
    },
    // 选择脚本类型
    handlerScriptType(val) {
      if (val !== this.form.sceneType) {
        if (this.inExecute) {
          this.$message('脚本正在执行中，不能进行脚本语言切换')
          return
        }
        this.$confirm('切换类型会清空您编写的脚本代码，确定切换吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$set(this.form, 'script', '')
          this.$set(this.form, 'scriptType', val)
          this.$refs.scriptCode.setValue('')
          this.setCodeBuScriptType()
        })
      }
    },
    // 选择分析结果类型
    handlerExpressionType(val) {
      if (val !== this.resultExpressionForm.expressionType) {
        this.$confirm('切换类型会清空您编写的脚本代码，确定切换吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$set(this.resultExpressionForm, 'expressionType', val)
          this.$set(this.resultExpressionForm, 'expression', '')
          this.setCodeByExpressionType()
        })
      }
    },
    // 根据选择的脚本类型设置默认代码注释
    setCodeBuScriptType() {
      this.scriptType.forEach(item => {
        if (+item.dictdataValue === 1) {
          if (this.form.scriptType === item.id) {
            this.$refs.scriptCode.setValue('' +
              '' + '# -m shell -a "df -h"\n' +
              '')
          }
        }
        if (+item.dictdataValue === 5) {
          if (this.form.scriptType === item.id) {
            this.$refs.scriptCode.setValue('' +
              '' + '# 当适用品牌选择linux服务器时，这里用python脚本编写，比如查看磁盘：os.system(\'df -h\')\n' +
              '' + '# 当适用品牌选择除了linux服务器以外的类型，这里用命令编写，比如选择华三交换机，查看cpu命令: display cpu-usage\n' +
              '')
          }
        }
        if (+item.dictdataValue === 2) {
          if (this.form.scriptType === item.id) {
            this.$refs.scriptCode.setValue('' +
              '' + '#- hosts: all\n' +
              '' + '#  remote_user: root\n' +
              '' + '#  tasks:\n' +
              '' + '#    - name: "ss -s"\n' +
              '' + '#      shell: df -h\n' +
              '' + '#      register: shell_result\n' +
              '' + '#    - debug:\n' +
              '' + '#        var: shell_result.stdout_lines\n' +
              '' + '#    - name: "ps"\n' +
              '' + '#      shell: ps\n' +
              '' + '#      register: shell_result\n' +
              '' + '#    - debug:\n' +
              '' + '#        var: shell_result.stdout_lines' +
              '')
          }
        }
        if (+item.dictdataValue === 3) {
          if (this.form.scriptType === item.id) {
            this.$refs.scriptCode.setValue('' +
              '' + '#shell 脚本编写，比如查看磁盘信息：\n' +
              '' + '#df -h' +
              '')
          }
        }
      })
      this.setCodeEditorMode()
    },
    // 根据选择的表达式类型设置默认代码注释
    setCodeByExpressionType() {
      if (this.resultExpressionForm.expressionType === 2) {
        this.$refs.resultScriptCode.setValue('' +
                  '' + '#执行结果保存在 datas 数组中\n' +
                  '' + '#输出结果以 print() 信息打印出来\n' +
                  '' + '#for line in datas:\n' +
                  '' + '#    print(line)\n' +
                  '')
      } else if (this.resultExpressionForm.expressionType === 3) {
        this.$refs.resultScriptCode.setValue('' +
                  '' + '#执行结果保存在 datas 数组中\n' +
                  '#输出结果以 echo 形式打印出来\n' +
                  '#for(( i=0;i<${#datas[@]};i++)) \n' +
                  '#do\n' +
                  '# echo ${datas[i]};\n' +
                  '#done;')
      } else {
        this.$refs.resultScriptCode.setValue('')
      }
      this.setCodeEditorMode()
    },
    // 选择适用场景
    changeSceneType(e) {
      if (e === 1) {
        this.$nextTick(async () => {
          // await this.$refs.resultScriptCode.initCodeMirror()
        })
      }
    },
    // 提交
    async onSubmit(implement) {
      this.$set(this.form, 'script', this.$tool.delTextEndBlankSpace(this.$refs.scriptCode.getValue()))

      this.$refs['form'].validate(async valid => {
        if (valid) {
          if (this.$refs.resultScriptCode) this.$set(this.resultExpressionForm, 'expression', this.$tool.delTextEndBlankSpace(this.$refs.resultScriptCode.getValue()))
          // 校验分析结果填写
          // let haveResultFormNull = false
          // Object.keys(this.resultExpressionForm).forEach(key => {
          //   if (this.resultExpressionForm[`${key}`] === '') {
          //     haveResultFormNull = true
          //   }
          // })

          const scriptModel = await this.saveScript()
          if (scriptModel.code === 1) {
            this.$message({
              type: 'success',
              message: scriptModel.msg
            })
            if (!this.id) {
              this.disabledImplement = false
              this.createScriptInSaveModel = scriptModel.model
            }
            if (implement) await this.implement()
          } else {
            this.$EventBus.$emit('implement-button-loading-statue', false)
            this.$message({
              type: 'error',
              message: scriptModel.msg
            })
          }

          // if (this.form.sceneType === 1) {
          //   this.createScriptResultMatchingInSaveModel = await this.saveResultMatchingData(scriptModel.model.id)
          // } else {
          //   if (this.resultExpressionForm.id) this.deleteHyitOpsResultExpression()
          // }
          this.createScriptResultMatchingInSaveModel = await this.saveResultMatchingData(scriptModel.model.id)
        }
      })
    },
    // 重置
    onReset() {
      this.$refs['form'].resetFields()
      Object.keys(this.resultExpressionForm).keys(key => {
        this.$set(this.resultExpressionForm, `${key}`, '')
      })
      this.$set(this.resultExpressionForm, 'expressionType', 2)
      this.$set(this.form, 'scriptStatue', '0')
      this.$set(this.form, 'sceneType', 1)
      this.$set(this.form, 'verifyStatue', 0)
      this.$refs.scriptCode.setValue('')
      this.$refs.resultScriptCode.setValue('')
    },
    // 保存脚本
    async saveScript() {
      const params = this.$tool.deepCopy(this.form)
      if (this.id) params.id = this.id
      if (this.createScriptInSaveModel.id) params.id = this.createScriptInSaveModel.id
      return await this.$request({
        url: this.id || this.createScriptInSaveModel.id ? this.api.automationOperations.updateHyitOpsScript : this.api.automationOperations.insertHyitOpsScript,
        data: params
      })
    },
    // 保存结果分析
    async saveResultMatchingData(scriptId) {
      const params = this.$tool.deepCopy(this.resultExpressionForm)
      params.scriptId = scriptId
      if (this.createScriptResultMatchingInSaveModel.id) params.id = this.createScriptResultMatchingInSaveModel.id
      const { code, model, msg } = await this.$request({
        url: this.resultExpressionForm.id || this.createScriptResultMatchingInSaveModel.id ? this.api.automationOperations.updateHyitOpsResultExpression : this.api.automationOperations.insertHyitOpsResultExpression,
        data: params
      })
      if (code !== 1) {
        this.$message.error(msg)
        return
      }
      return model
    },
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
    // 删除分析
    deleteHyitOpsResultExpression() {
      this.$request({
        url: this.api.automationOperations.deleteHyitOpsResultExpression,
        data: { id: this.resultExpressionForm.id }
      })
    },
    // 监听选择分组目录
    inputParent(val) {
      this.$set(this.form, 'scriptGroupId', Number(val))
    },
    // 查看分组
    async getHyitOpsScriptGroup(id) {
      if (!id) return
      console.log(id)
      const { code, model } = await this.$request({
        url: this.api.automationOperations.getHyitOpsScriptGroup,
        data: { id }
      })
      if (code !== 1) return
      return model
    },
    // 执行
    async implement() {
      this.scriptExecuteResult = []

      let serverIds = []

      this.$nextTick(() => {
        this.allSelection.forEach(item => {
          console.log(item)
          serverIds.push(item.opsServerId)
          this.$set(this.scriptExecuteResult, this.scriptExecuteResult.length, {
            serverId: item.opsServerId, // 服务器id
            serverName: item.hyMarkName, // 服务器名称
            executeStatue: -1, // 执行状态
            executeResult: '', // 执行结果
            analysisResult: '', // 输出结果
            analysisScript: this.resultExpressionForm.expression || '', // 分析脚本
            authAnalysis: [ // 自动分析数据
              {
                name: this.resultExpressionForm.name || '', // 表达式名称
                compareCharacter: this.resultExpressionForm.compareCharacter || '', // 判断符号
                compareValue: this.resultExpressionForm.compareValue || '', // 判断值
                analyseResult: '', // 实际结果
                analyseStatue: 0, // 分析状态
                analyseResultReturnOk: false // 分析结果是否返回
              }
            ]
          })
        })
        console.log(serverIds)
        this.serverIds = serverIds.toString()

        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        const getUserSessionResult = getUserSession()
        this.$ws.sendWebsocket(this.wsCmd.host.default, {
          cmd: this.wsCmd.automationOperations.execScript,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            scriptId: this.id || this.createScriptInSaveModel.id,
            serverIds: serverIds.toString(),
            agent: this.agent,
            fromAgent: this.fromAgent,
            fromHostId: '',
            timeout: this.executeTimeout
          }
        })
        this.inExecute = true
      })
    },
    // 打开选择设备
    openSelectionWindow() {
      this.$refs.scriptSelectDeviceDialog.open({ allSelection: this.allSelection})
    },
    // 删除设备
    handlerDeleteSelectDevice(item) {
      const idx = this.allSelection.findIndex(items => +items.hyHostId === +item.hyHostId)
      if (idx !== -1) this.allSelection.splice(idx, 1)
    },
    // 调试分析
    debugScript(res) {
      if (!this.createScriptResultMatchingInSaveModel.id) this.$message('请先添加分析脚本')
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      const getUserSessionResult = getUserSession()
      this.$ws.sendWebsocket(this.wsCmd.host.default, {
        cmd: this.wsCmd.automationOperations.debugScript,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: this.agent,
          fromAgent: this.fromAgent,
          fromHostId: '',
          timeout: this.executeTimeout,
          expression: this.$refs.resultScriptCode.getValue(),
          expressionType: this.resultExpressionForm.expressionType,
          compareCharacter: this.resultExpressionForm.compareCharacter,
          compareValue: this.resultExpressionForm.compareValue,
          inputAllData: res.buildResult,
          inputData: res.executeResult,
          serverId: this.allSelection[0].opsServerId
        }
      })
    },
    // 设置编辑器模式
    setCodeEditorMode() {
      this.scriptType.forEach(item => {
        if (this.form.scriptType === item.id) {
          if (+item.dictdataValue === 5) {
            this.$refs.scriptCode.handlerModeItem('python')
          }
          if (+item.dictdataValue === 3) {
            this.$refs.scriptCode.handlerModeItem('shell')
          }
        }
      })
      if (this.resultExpressionForm.expressionType === 2) {
        this.$refs.resultScriptCode.handlerModeItem('python')
      }
      if (this.resultExpressionForm.expressionType === 3) {
        this.$refs.resultScriptCode.handlerModeItem('shell')
      }
    }
  }
}
</script>
<style lang="scss">
#formScriptCode {
  .CodeMirror {
    height: 280px !important;
  }
}
#formResultScriptCode {
  .CodeMirror {
    height: 340px !important;
  }
}
</style>
<style lang="scss" scoped>
.script-form-item {
  display: inline-block !important;
  width: 50%;
  vertical-align: bottom;
}
.select-device-form {
  width: 100%;
}
.expression-form {
  background: #262626;
  width: 100%;
  color: #fff;
  padding: 14px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .title {
    padding: 0 10px;
    font-size: 13px;
  }
  .expression-form-item {
    display: inline-block;
    width: 32.5%;
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

.right-pane {
  overflow-y: auto;
  padding-left: 20px;
}

.console-spec {
  margin-left: 20px;
  .console-spec-title {
    font-size: 14px;
    font-weight: bold;
    padding: 10px 0;
  }
  .expression-form-title {
    padding: 0 10px;
  }
  .console-spec-main {
    width: 50%;
    display: inline-block;
    .console-code {
      .console-code-header {
        color: #fff;
        font-size: 13px;
        padding: 0 10px;
        background: #2f3033;
        display: flex;
        align-items: center;
        justify-content: space-between;
        line-height: 48px;
        .code-header-title {}
        .expression-form-title {
          padding: 10px 0;
        }
        .btns {
          display: flex;
          align-items: center;
          .btn-item {
            padding: 0 15px;
          }
        }
        .active {
          background: #202024;
          color: #FFD929;
        }
      }
      .expression-header {
        line-height: unset !important;
      }
    }
  }
  .console-result-main {
    width: 50%;
    display: inline-block;
    vertical-align: top;
  }
}

.submit-btn {
  margin-left: 20px;
  margin-top: 20px;
}

.facilityList{
  .facilityList-item{
    position: relative;
    background-color: #F2F6FB;
    border: #d6e6fa 1px solid;
    padding:10px 9px 10px 10px;
    margin-right: 10px;
    margin-top: 10px;
    line-height: 20px;
    box-sizing: content-box;
    height: 70px;
    width: 230px;
    .item-name{
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 220px;
    }
    .font-14{
      color: #999;
    }
    .el-icon-close{
      position: absolute;
      right: 10px;
      top: 10px;
      font-size: 18px !important;
    }
  }
}
</style>
