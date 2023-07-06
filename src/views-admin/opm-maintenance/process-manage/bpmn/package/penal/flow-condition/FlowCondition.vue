<template>
  <div class="panel-tab__content">
    <el-form :model="flowConditionForm" label-width="90px" size="mini" @submit.native.prevent>
      <el-form-item label="流转类型">
        <el-select v-model="flowConditionForm.type" @change="updateFlowType">
          <el-option label="普通流转路径" value="normal" />
          <el-option label="默认流转路径" value="default" />
          <el-option label="条件流转路径" value="condition" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="flowConditionForm.type === 'condition'" key="condition" label="条件格式">
        <el-select v-model="flowConditionForm.conditionType">
          <el-option label="表达式" value="expression" />
          <el-option label="脚本" value="script" />
        </el-select>
      </el-form-item>
      <template v-if="flowConditionForm.conditionType && flowConditionForm.conditionType === 'expression'">
        <el-form-item key="express" label="表达式">
          <el-input v-model="flowConditionForm.body" readonly @change="updateFlowCondition" />
        </el-form-item>
        <el-button type="success" size="mini" @click="openExpressionConfig">配置表达式</el-button>
      </template>
      <template v-if="flowConditionForm.conditionType && flowConditionForm.conditionType === 'script'">
        <el-form-item key="language" label="脚本语言">
          <el-input v-model="flowConditionForm.language" clearable @change="updateFlowCondition" />
        </el-form-item>
        <el-form-item key="scriptType" label="脚本类型">
          <el-select v-model="flowConditionForm.scriptType">
            <el-option label="内联脚本" value="inlineScript" />
            <el-option label="外部脚本" value="externalScript" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="flowConditionForm.scriptType === 'inlineScript'" key="body" label="脚本">
          <el-input v-model="flowConditionForm.body" type="textarea" clearable @change="updateFlowCondition" />
        </el-form-item>
        <el-form-item v-if="flowConditionForm.scriptType === 'externalScript'" key="resource" label="资源地址">
          <el-input v-model="flowConditionForm.resource" clearable @change="updateFlowCondition" />
        </el-form-item>
      </template>
    </el-form>
    <el-dialog :visible.sync="dialogVisible" title="配置表达式">
      <div class="dialog-body">
        <div class="now-expression">
          <div class="expression-title">已配置的表达式：</div>
          <div class="expression-list">
            <div class="expression-list-item">
              <template v-if="expressionList.length > 0">
                <el-tag v-for="item in expressionList" :key="item.id" closable @close="onCloseTag(item)">
                  {{ item.value }}
                </el-tag>
              </template>
              <el-empty v-else description="暂无表达式" style="height: 150px" />
            </div>
          </div>
        </div>
        <div class="expression-form">
          <div class="expression-title">插入表达式：</div>
          <el-select v-if="expressionList.length > 0" v-model="expressionStore.logic" class="expression-form-item" size="mini">
            <el-option
              v-for="(item, index) in logic"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
          <el-select v-model="expressionStore.field" class="expression-form-item" size="mini" @change="changeField">
            <el-option
              v-for="item in field"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
          <el-select v-model="expressionStore.conditions" class="expression-form-item" size="mini">
            <el-option
              v-for="(item, index) in conditions"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
          <el-input v-model="expressionStore.value" class="expression-form-item" size="mini" placeholder="匹配值" style="width: 100px" />
          <el-button type="success" size="mini" @click="insertExpressionConfig">插入</el-button>
          <div v-if="showApproveStatueTip" class="margin-top-7 margin-bottom-7">
            审批状态: 1通过 2不通过 3审批中 4新建 5提交 6驳回
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'FlowCondition',
  props: {
    businessObject: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      flowConditionForm: {},
      dialogVisible: false,
      expressionList: [],
      logic: ['&&', '||'],
      conditions: ['>', '<', '==', '>=', '<=', '!=='],
      field: [],
      expressionStore: {
        logic: '&&',
        field: '',
        conditions: '>',
        value: ''
      },
      showApproveStatueTip: false
    }
  },
  watch: {
    businessObject: {
      immediate: true,
      handler() {
        this.$nextTick(() => this.resetFlowCondition())
      }
    }
  },
  beforeDestroy() {
    this.bpmnElement = null
    this.bpmnElementSource = null
    this.bpmnElementSourceRef = null
  },
  mounted() {
    if (this.$store.getters.bpmnModelInfo.type) {
      const tableKeyApi = this.$defineData.projectActivityProcessDefine(this.$store.getters.bpmnModelInfo.type, 'id', 'tableKeyApi')
      if (tableKeyApi === null) return
      request({
        url: tableKeyApi,
        data: {}
      }).then(res => {
        const list = []
        Object.keys(res.model).forEach(key => {
          list.push({ text: res.model[`${key}`], value: key })
        })
        this.field = list
        this.$set(this.expressionStore, 'field', this.field[0].value)
      })
    }
  },
  methods: {
    resetFlowCondition() {
      this.bpmnElement = window.bpmnInstances.bpmnElement
      this.bpmnElementSource = this.bpmnElement.source
      this.bpmnElementSourceRef = this.bpmnElement.businessObject.sourceRef
      if (this.bpmnElementSourceRef && this.bpmnElementSourceRef.default && this.bpmnElementSourceRef.default.id === this.bpmnElement.id) {
        // 默认
        this.flowConditionForm = { type: 'default' }
      } else if (!this.bpmnElement.businessObject.conditionExpression) {
        // 普通
        this.flowConditionForm = { type: 'normal' }
      } else {
        // 带条件
        const conditionExpression = this.bpmnElement.businessObject.conditionExpression
        this.flowConditionForm = { ...conditionExpression, type: 'condition' }
        // resource 可直接标识 是否是外部资源脚本
        if (this.flowConditionForm.resource) {
          this.$set(this.flowConditionForm, 'conditionType', 'script')
          this.$set(this.flowConditionForm, 'scriptType', 'externalScript')
          return
        }
        if (conditionExpression.language) {
          this.$set(this.flowConditionForm, 'conditionType', 'script')
          this.$set(this.flowConditionForm, 'scriptType', 'inlineScript')
          return
        }
        this.$set(this.flowConditionForm, 'conditionType', 'expression')
      }
    },
    updateFlowType(flowType) {
      // 正常条件类
      if (flowType === 'condition') {
        this.flowConditionRef = window.bpmnInstances.moddle.create('bpmn:FormalExpression')
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          conditionExpression: this.flowConditionRef
        })
        return
      }
      // 默认路径
      if (flowType === 'default') {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          conditionExpression: null
        })
        window.bpmnInstances.modeling.updateProperties(this.bpmnElementSource, {
          default: this.bpmnElement
        })
        return
      }
      // 正常路径，如果来源节点的默认路径是当前连线时，清除父元素的默认路径配置
      if (this.bpmnElementSourceRef.default && this.bpmnElementSourceRef.default.id === this.bpmnElement.id) {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElementSource, {
          default: null
        })
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        conditionExpression: null
      })
    },
    updateFlowCondition() {
      const { conditionType, scriptType, body, resource, language } = this.flowConditionForm
      let condition
      if (conditionType === 'expression') {
        condition = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body })
      } else {
        if (scriptType === 'inlineScript') {
          condition = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body, language })
          this.$set(this.flowConditionForm, 'resource', '')
        } else {
          this.$set(this.flowConditionForm, 'body', '')
          condition = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { resource, language })
        }
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, { conditionExpression: condition })
    },
    openExpressionConfig() {
      this.dialogVisible = true
      this.expressionList = []
      if (!this.flowConditionForm.body) return
      const splitLeft = this.flowConditionForm.body.split('${')[1]
      const splitRight = splitLeft.split('}')[0]
      const result = splitRight.match(/.+?\d+/g)
      result.forEach(item => {
        this.$set(this.expressionList, this.expressionList.length, {
          id: this.$tool.guid(),
          value: item
        })
      })
    },
    insertExpressionConfig() {
      if (this.expressionStore.value === '') return this.$message({ message: '请输入匹配值' })
      let value = ''
      if (this.expressionList.length > 0) {
        value += ` ${this.expressionStore.logic} `
      }
      value += `${this.expressionStore.field}`
      value += ` ${this.expressionStore.conditions}`
      value += ` ${this.expressionStore.value}`
      this.$set(this.expressionList, this.expressionList.length, {
        id: this.$tool.guid(),
        value: value
      })
      this.$set(this.expressionStore, 'value', '')
    },
    handleSubmit() {
      let expressionValue = '${'
      this.expressionList.forEach(item => {
        if (expressionValue.length === 2) {
          expressionValue += item.value
        } else {
          expressionValue += `${item.value}`
        }
      })
      expressionValue += '}'
      this.$set(this.flowConditionForm, 'body', expressionValue)
      this.expressionList = []
      this.updateFlowCondition()
      this.dialogVisible = false
    },
    onCloseTag(val) {
      const getItem = this.expressionList.findIndex(item => item.id === val.id)
      if (getItem !== -1) this.expressionList.splice(getItem, 1)
      if (this.expressionList.length === 0) return
      if (getItem > 0 && getItem !== -1) return
      const value = this.expressionList[0].value
      this.$set(this.expressionList[0], 'value', value.slice(4))
    },
    changeField(e) {
      this.showApproveStatueTip = e === 'approveStatue'
    }
  }
}
</script>

<style lang="scss" scoped>
.expression-title { font-size: 16px; }
.expression-list {
  margin: 10px 0;
  height: 200px;
  overflow-y: auto;
}
.el-tag {
  margin: 4px 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.expression-form {
  .expression-form-item {
    width: 100px;
    margin-right: 5px;
  }
}
</style>
