<template>
  <div style="margin-top: 16px">
    <el-form-item label="脚本格式">
      <el-input v-model="scriptTaskForm.scriptFormat" clearable @input="updateElementTask()" @change="updateElementTask()" />
    </el-form-item>
    <el-form-item label="脚本类型">
      <el-select v-model="scriptTaskForm.scriptType">
        <el-option label="内联脚本" value="inline" />
        <el-option label="外部资源" value="external" />
      </el-select>
    </el-form-item>
    <el-form-item v-show="scriptTaskForm.scriptType === 'inline'" label="脚本">
      <el-input
        v-model="scriptTaskForm.script"
        type="textarea"
        resize="vertical"
        :autosize="{ minRows: 2, maxRows: 4 }"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item v-show="scriptTaskForm.scriptType === 'external'" label="资源地址">
      <el-input v-model="scriptTaskForm.resource" clearable @input="updateElementTask()" @change="updateElementTask()" />
    </el-form-item>
    <el-form-item label="结果变量">
      <el-input v-model="scriptTaskForm.resultVariable" clearable @input="updateElementTask()" @change="updateElementTask()" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'ScriptTask',
  props: {
    id: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultTaskForm: {
        scriptFormat: '',
        script: '',
        resource: '',
        resultVariable: ''
      },
      scriptTaskForm: {}
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.bpmnElement = window.bpmnInstances.bpmnElement
        this.$nextTick(() => this.resetTaskForm())
      }
    }
  },
  beforeDestroy() {
    this.bpmnElement = null
  },
  methods: {
    resetTaskForm() {
      for (let key in this.defaultTaskForm) {
        let value = this.bpmnElement?.businessObject[key] || this.defaultTaskForm[key]
        this.$set(this.scriptTaskForm, key, value)
      }
      this.$set(this.scriptTaskForm, 'scriptType', this.scriptTaskForm.script ? 'inline' : 'external')
    },
    updateElementTask() {
      let taskAttr = Object.create(null)
      taskAttr.scriptFormat = this.scriptTaskForm.scriptFormat || null
      taskAttr.resultVariable = this.scriptTaskForm.resultVariable || null
      if (this.scriptTaskForm.scriptType === 'inline') {
        taskAttr.script = this.scriptTaskForm.script || null
        taskAttr.resource = null
      } else {
        taskAttr.resource = this.scriptTaskForm.resource || null
        taskAttr.script = null
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr)
    }
  }
}
</script>
