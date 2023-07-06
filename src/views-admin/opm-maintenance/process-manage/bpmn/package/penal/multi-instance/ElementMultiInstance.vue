<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="90px" @submit.native.prevent>
      <el-form-item label="回路特性">
        <el-select v-model="loopCharacteristics" @change="changeLoopCharacteristicsType">
          <!--bpmn:MultiInstanceLoopCharacteristics-->
          <el-option label="并行多重事件" value="ParallelMultiInstance" />
          <el-option label="时序多重事件" value="SequentialMultiInstance" />
          <!--bpmn:StandardLoopCharacteristics-->
          <el-option label="循环事件" value="StandardLoop" />
          <el-option label="无" value="Null" />
        </el-select>
      </el-form-item>
      <template v-if="loopCharacteristics === 'ParallelMultiInstance' || loopCharacteristics === 'SequentialMultiInstance'">
        <el-form-item key="loopCardinality" label="循环基数">
          <el-input v-model="loopInstanceForm.loopCardinality" clearable @change="updateLoopCardinality" />
        </el-form-item>
        <el-form-item key="collection" label="人员">
          <!-- <el-input v-model="loopInstanceForm.collection" clearable @change="updateLoopBase" /> -->
          <el-button type="primary" size="mini" @click="openShowUserListDialog">选择人员</el-button>
          <div>
            <el-tag v-for="(it,index) in allSelection" :key="it.userId" class="ml-4" size="mini" effect="dark" closable @close="onDeleteSelectUser(index)">
              {{ it.realName }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item key="elementVariable" label="元素变量">
          <el-input v-model="loopInstanceForm.elementVariable" clearable @change="updateLoopBase" />
        </el-form-item>
        <el-form-item key="completionCondition" label="完成条件">
          <el-input v-model="loopInstanceForm.completionCondition" clearable @change="updateLoopCondition" />
        </el-form-item>
        <el-form-item key="async" label="异步状态">
          <el-checkbox v-model="loopInstanceForm.asyncBefore" label="异步前" @change="updateLoopAsync('asyncBefore')" />
          <el-checkbox v-model="loopInstanceForm.asyncAfter" label="异步后" @change="updateLoopAsync('asyncAfter')" />
          <el-checkbox
            v-if="loopInstanceForm.asyncAfter || loopInstanceForm.asyncBefore"
            v-model="loopInstanceForm.exclusive"
            label="排除"
            @change="updateLoopAsync('exclusive')"
          />
        </el-form-item>
        <el-form-item v-if="loopInstanceForm.asyncAfter || loopInstanceForm.asyncBefore" key="timeCycle" label="重试周期" prop="timeCycle">
          <el-input v-model="loopInstanceForm.timeCycle" clearable @change="updateLoopTimeCycle" />
        </el-form-item>
      </template>
    </el-form>
    <UserListTable ref="userListTable" @submitSelect="submitSelect" />
  </div>
</template>

<script>
import UserListTable from '@/views-admin/opm-maintenance/process-manage/bpmn/package/dialog/user-list-table'
export default {
  name: 'ElementMultiInstance',
  components: {
    UserListTable
  },
  props: {
    businessObject: {
      type: Object,
      default() {
        return {}
      }
    },
    type: {
      type: String,
      default: ''
    }
  },
  inject: {
    prefix: 'prefix'
  },
  data() {
    return {
      loopCharacteristics: '',
      // 默认配置，用来覆盖原始不存在的选项，避免报错
      defaultLoopInstanceForm: {
        completionCondition: '',
        loopCardinality: '',
        extensionElements: [],
        asyncAfter: false,
        asyncBefore: false,
        exclusive: false
      },
      loopInstanceForm: {collection: []},
      allSelection: []
    }
  },
  watch: {
    businessObject: {
      immediate: true,
      handler(val) {
        this.bpmnElement = window.bpmnInstances.bpmnElement
        this.getElementLoop(val)
      }
    }
  },
  beforeDestroy() {
    this.multiLoopInstance = null
    this.bpmnElement = null
  },
  methods: {
    onDeleteSelectUser(index) {
      this.allSelection.splice(index, 1)
      this.loopInstanceForm.collection = this.allSelection.map(it => it.userId).join(',')
    },
    openShowUserListDialog() {
      this.$refs.userListTable.open({
        isRadio: false,
        allSelection: this.allSelection || [],
        api: this.api.sys.findSysUser,
        keyField: 'userId',
        pageChangeFindDataEvType: 'request'
      })
    },
    submitSelect(selectList) {
      // this.$set(this.loopInstanceForm, 'collection', selectList)
      this.allSelection = selectList
      this.loopInstanceForm.collection = this.allSelection.map(it => it.userId).join(',')
      this.updateLoopBase()
    },
    getElementLoop(businessObject) {
      this.allSelection = []
      if (!businessObject.loopCharacteristics) {
        this.loopCharacteristics = 'Null'
        this.loopInstanceForm = {}
        return
      }
      if (businessObject.loopCharacteristics.$type === 'bpmn:StandardLoopCharacteristics') {
        this.loopCharacteristics = 'StandardLoop'
        this.loopInstanceForm = {}
        return
      }
      if (businessObject.loopCharacteristics.isSequential) {
        this.loopCharacteristics = 'SequentialMultiInstance'
      } else {
        this.loopCharacteristics = 'ParallelMultiInstance'
      }
      // 合并配置
      this.loopInstanceForm = {
        ...this.defaultLoopInstanceForm,
        ...businessObject.loopCharacteristics,
        completionCondition: businessObject.loopCharacteristics?.completionCondition?.body || '',
        loopCardinality: businessObject.loopCharacteristics?.loopCardinality?.body || ''
      }
      // 保留当前元素 businessObject 上的 loopCharacteristics 实例
      this.multiLoopInstance = window.bpmnInstances.bpmnElement.businessObject.loopCharacteristics
      // 更新表单
      if (
        businessObject.loopCharacteristics.extensionElements &&
        businessObject.loopCharacteristics.extensionElements.values &&
        businessObject.loopCharacteristics.extensionElements.values.length
      ) {
        this.$set(this.loopInstanceForm, 'timeCycle', businessObject.loopCharacteristics.extensionElements.values[0].body)
      }
      if (this.loopInstanceForm.collection?.length) this.getUserList({ids: this.loopInstanceForm.collection})
    },
    async getUserList(query) {
      const { code, data } = await this.$request({
        url: this.api.sys.findSysUser,
        data: query
      })
      if (code === 1) {
        this.allSelection = data
      }
    },
    changeLoopCharacteristicsType(type) {
      console.log('type: ', type)
      // this.loopInstanceForm = { ...this.defaultLoopInstanceForm }; // 切换类型取消原表单配置
      // 取消多实例配置
      if (type === 'Null') {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, { loopCharacteristics: null, assignee: '${userId}'})
        return
      }
      // 配置循环
      if (type === 'StandardLoop') {
        const loopCharacteristicsObject = window.bpmnInstances.moddle.create('bpmn:StandardLoopCharacteristics')
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          loopCharacteristics: loopCharacteristicsObject
        })
        this.multiLoopInstance = null
        return
      }
      // 时序
      if (type === 'SequentialMultiInstance') {
        this.multiLoopInstance = window.bpmnInstances.moddle.create('bpmn:MultiInstanceLoopCharacteristics', { isSequential: true })
      } else {
        this.multiLoopInstance = window.bpmnInstances.moddle.create('bpmn:MultiInstanceLoopCharacteristics')
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        loopCharacteristics: this.multiLoopInstance,
        assignee: '${assignee}'
      })
    },
    // 循环基数
    updateLoopCardinality(cardinality) {
      let loopCardinality = null
      if (cardinality && cardinality.length) {
        loopCardinality = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body: cardinality })
      }
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, { loopCardinality })
    },
    // 完成条件
    updateLoopCondition(condition) {
      let completionCondition = null
      if (condition && condition.length) {
        completionCondition = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body: condition })
      }
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, { completionCondition })
    },
    // 重试周期
    updateLoopTimeCycle(timeCycle) {
      const extensionElements = window.bpmnInstances.moddle.create('bpmn:ExtensionElements', {
        values: [
          window.bpmnInstances.moddle.create(`${this.prefix}:FailedJobRetryTimeCycle`, {
            body: timeCycle
          })
        ]
      })
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, { extensionElements })
    },
    // 直接更新的基础信息
    updateLoopBase() {
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, {
        collection: this.loopInstanceForm.collection || null,
        elementVariable: this.loopInstanceForm.elementVariable || null
      })
    },
    // 各异步状态
    updateLoopAsync(key) {
      const { asyncBefore, asyncAfter } = this.loopInstanceForm
      let asyncAttr = Object.create(null)
      if (!asyncBefore && !asyncAfter) {
        this.$set(this.loopInstanceForm, 'exclusive', false)
        asyncAttr = { asyncBefore: false, asyncAfter: false, exclusive: false, extensionElements: null }
      } else {
        asyncAttr[key] = this.loopInstanceForm[key]
      }
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, asyncAttr)
    }
  }
}
</script>
