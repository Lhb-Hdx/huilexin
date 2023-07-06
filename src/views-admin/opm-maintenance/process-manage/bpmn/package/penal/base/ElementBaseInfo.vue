<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="90px" @submit.native.prevent>
      <el-form-item label="ID">
        <el-input
          v-model="elementBaseInfo.id"
          :disabled="idEditDisabled || elementBaseInfo.$type === 'bpmn:Process'"
          clearable
          @change="updateBaseInfo('id')"
        />
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="elementBaseInfo.name" clearable @change="updateBaseInfo('name')" />
      </el-form-item>
      <!--流程的基础属性-->
      <!--      <template v-if="elementBaseInfo.$type === 'bpmn:Process'">-->
      <!--        <el-form-item label="版本标签">-->
      <!--          <el-input v-model="elementBaseInfo.versionTag" clearable @change="updateBaseInfo('versionTag')" />-->
      <!--        </el-form-item>-->
      <!--        <el-form-item label="key">-->
      <!--          <el-input v-model="elementBaseInfo.key" clearable @change="updateBaseInfo('key')" />-->
      <!--        </el-form-item>-->
      <!--        <el-form-item label="可执行">-->
      <!--          <el-switch v-model="elementBaseInfo.isExecutable" active-text="是" inactive-text="否" @change="updateBaseInfo('isExecutable')" />-->
      <!--        </el-form-item>-->
      <!--      </template>-->
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'ElementBaseInfo',
  props: {
    businessObject: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: ''
    },
    idEditDisabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      elementBaseInfo: {},
      initElementBaseInfoStorage: {} // 存储初始化的基础信息
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  watch: {
    businessObject: {
      immediate: false,
      handler: function(val) {
        if (val) {
          this.$nextTick(() => this.resetBaseInfo())
        }
      }
    }
  },
  beforeDestroy() {
    this.bpmnElement = null
  },
  methods: {
    resetBaseInfo() {
      this.bpmnElement = window?.bpmnInstances?.bpmnElement
      if (!this.elementBaseInfo.id) {
        this.initElementBaseInfoStorage = JSON.parse(JSON.stringify(this.bpmnElement.businessObject))
      }
      this.elementBaseInfo = JSON.parse(JSON.stringify(this.bpmnElement.businessObject))
      // 为了在编辑/新增的时候选择导入之前配置好的流程的时候不会使用导入的流程的key替换掉当前初始化好的流程key
      if (this.elementBaseInfo.$type === 'bpmn:Process' && this.initElementBaseInfoStorage.id) {
        this.$set(this.elementBaseInfo, 'id', this.initElementBaseInfoStorage.id)
        this.$set(this.elementBaseInfo, 'name', this.initElementBaseInfoStorage.name)
      }
    },
    updateBaseInfo(key) {
      const attrObj = Object.create(null)
      attrObj[key] = this.elementBaseInfo[key]
      if (key === 'id') {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          id: this.elementBaseInfo[key],
          di: { id: `${this.elementBaseInfo[key]}_di` }
        })
      } else {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, attrObj)
      }
    }
  }
}
</script>
