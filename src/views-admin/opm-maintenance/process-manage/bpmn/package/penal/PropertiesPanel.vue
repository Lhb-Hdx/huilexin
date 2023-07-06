<template>
  <div class="process-panel__container" :style="{ width: `${width}px` }">
    <el-collapse v-model="activeTab">
      <el-collapse-item name="base">
        <div slot="title" class="panel-tab__title"><i class="el-icon-info" />常规</div>
        <element-base-info :id-edit-disabled="idEditDisabled" :business-object="elementBusinessObject" :type="elementType" />
      </el-collapse-item>
      <!--      <el-collapse-item v-if="elementType === 'Process'" key="message" name="condition">-->
      <!--        <div slot="title" class="panel-tab__title"><i class="el-icon-s-comment" />消息与信号</div>-->
      <!--        <signal-and-massage />-->
      <!--      </el-collapse-item>-->
      <el-collapse-item v-if="conditionFormVisible" key="condition" name="condition">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-promotion" />流转条件</div>
        <flow-condition :business-object="elementBusinessObject" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item v-if="formVisible" key="form" name="condition">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-order" />表单</div>
        <element-form :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item v-if="elementType.indexOf('Task') !== -1 && elementBusinessObject.assignee!=='${assignee}'" key="task" name="task">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-claim" />任务</div>
        <element-task :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item v-if="elementType.indexOf('Task') !== -1" key="multiInstance" name="multiInstance">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-help" />多人任务</div>
        <element-multi-instance :business-object="elementBusinessObject" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item key="listeners" name="listeners">
        <div slot="title" class="panel-tab__title"><i class="el-icon-message-solid" />执行监听器</div>
        <element-listeners :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item v-if="elementType === 'UserTask'" key="taskListeners" name="taskListeners">
        <div slot="title" class="panel-tab__title"><i class="el-icon-message-solid" />任务监听器</div>
        <user-task-listeners :id="elementId" :type="elementType" />
      </el-collapse-item>
      <!--      <el-collapse-item key="extensions" name="extensions">-->
      <!--        <div slot="title" class="panel-tab__title"><i class="el-icon-circle-plus" />扩展属性</div>-->
      <!--        <element-properties :id="elementId" :type="elementType" />-->
      <!--      </el-collapse-item>-->
      <!--      <el-collapse-item key="other" name="other">-->
      <!--        <div slot="title" class="panel-tab__title"><i class="el-icon-s-promotion" />其他</div>-->
      <!--        <element-other-config :id="elementId" />-->
      <!--      </el-collapse-item>-->
    </el-collapse>
  </div>
</template>
<script>
import ElementBaseInfo from './base/ElementBaseInfo'
// import ElementOtherConfig from './other/ElementOtherConfig'
import ElementTask from './task/ElementTask'
import ElementMultiInstance from './multi-instance/ElementMultiInstance'
import FlowCondition from './flow-condition/FlowCondition'
// import SignalAndMassage from './signal-message/SignalAndMessage'
import ElementListeners from './listeners/ElementListeners'
// import ElementProperties from './properties/ElementProperties'
import ElementForm from './form/ElementForm'
import UserTaskListeners from './listeners/UserTaskListeners'

export default {
  name: 'MyPropertiesPanel',
  components: {
    UserTaskListeners,
    ElementForm,
    // ElementProperties,
    ElementListeners,
    // SignalAndMassage,
    FlowCondition,
    ElementMultiInstance,
    ElementTask,
    // ElementOtherConfig,
    ElementBaseInfo
  },
  componentName: 'MyPropertiesPanel',
  props: {
    bpmnModeler: {
      type: Object,
      default: () => {}
    },
    prefix: {
      type: String,
      default: 'camunda'
    },
    width: {
      type: Number,
      default: 480
    },
    idEditDisabled: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      prefix: this.prefix,
      width: this.width
    }
  },
  data() {
    return {
      activeTab: 'base',
      elementId: '',
      elementType: '',
      elementBusinessObject: {}, // 元素 businessObject 镜像，提供给需要做判断的组件使用
      conditionFormVisible: false, // 流转条件设置
      formVisible: false, // 表单配置
      isCreateKey: false
    }
  },
  watch: {
    elementId: {
      handler() {
        this.activeTab = 'base'
      }
    }
  },
  created() {
    this.initModels()
  },
  methods: {
    initModels() {
      // 初始化 modeler 以及其他 moddle
      if (!this.bpmnModeler) {
        // 避免加载时 流程图 并未加载完成
        this.timer = setTimeout(() => this.initModels(), 10)
        return
      }
      if (this.timer) clearTimeout(this.timer)
      window.bpmnInstances = {
        modeler: this.bpmnModeler,
        modeling: this.bpmnModeler.get('modeling'),
        moddle: this.bpmnModeler.get('moddle'),
        eventBus: this.bpmnModeler.get('eventBus'),
        bpmnFactory: this.bpmnModeler.get('bpmnFactory'),
        elementFactory: this.bpmnModeler.get('elementFactory'),
        elementRegistry: this.bpmnModeler.get('elementRegistry'),
        replace: this.bpmnModeler.get('replace'),
        selection: this.bpmnModeler.get('selection')
      }
      this.getActiveElement()
    },
    getActiveElement() {
      // 初始第一个选中元素 bpmn:Process
      this.initFormOnChanged(null)
      this.bpmnModeler.on('import.done', e => {
        this.initFormOnChanged(null)
      })
      // 监听选择事件，修改当前激活的元素以及表单
      this.bpmnModeler.on('selection.changed', ({ newSelection }) => {
        this.initFormOnChanged(newSelection[0] || null)
      })
      this.bpmnModeler.on('element.changed', ({ element }) => {
        // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
        if (element && element.id === this.elementId) {
          this.initFormOnChanged(element)
        }
      })
    },
    // 初始化数据
    initFormOnChanged(element) {
      let activatedElement = element
      if (!activatedElement) {
        activatedElement =
          window.bpmnInstances.elementRegistry.find(el => el.type === 'bpmn:Process') ||
          window.bpmnInstances.elementRegistry.find(el => el.type === 'bpmn:Collaboration')
      }
      if (!activatedElement) return
      console.log(`
              ----------
      select element changed:
                id:  ${activatedElement.id}
              type:  ${activatedElement.businessObject.$type}
              ----------
              `)
      // if (this.isCreateKey !== true) {
      //   this.isCreateKey = true
      //   const newId = `Process_${new Date().getTime()}`
      //   let bpmnModelInfo = this.$store.getters.bpmnModelInfo
      //   if (bpmnModelInfo === null) {
      //     bpmnModelInfo = {
      //       processId: newId
      //     }
      //   } else {
      //     bpmnModelInfo.processId = newId
      //   }
      //   console.log(this.isCreateKey)
      //   this.$store.dispatch('bpmn/setBpmnModelInfo', { ...bpmnModelInfo })
      //   console.log(this.$store.getters.bpmnModelInfo, newId)
      //   activatedElement.businessObject.id = newId
      // }
      // console.log('businessObject: ', activatedElement.businessObject, activatedElement.businessObject.$type)

      // 默认审核人员是登录用户,如果有审核人员则跳过
      if (!activatedElement.businessObject.assignee && !activatedElement.businessObject.candidateUsers && activatedElement.businessObject.$type === 'bpmn:UserTask')activatedElement.businessObject.assignee = '${userId}'

      window.bpmnInstances.bpmnElement = activatedElement
      this.bpmnElement = activatedElement
      this.elementId = activatedElement.id
      this.elementType = activatedElement.type.split(':')[1] || ''
      this.elementBusinessObject = JSON.parse(JSON.stringify(activatedElement.businessObject))
      this.conditionFormVisible = !!(
        this.elementType === 'SequenceFlow' &&
        activatedElement.source &&
        activatedElement.source.type.indexOf('StartEvent') === -1
      )
      this.formVisible = this.elementType === 'UserTask' || this.elementType === 'StartEvent'
    },
    beforeDestroy() {
      window.bpmnInstances = null
    }
  }
}
</script>
<style lang="scss" scoped>
.process-panel__container {
  box-sizing: border-box;
  padding: 0 8px;
  border-left: 1px solid #eeeeee;
  box-shadow: 0 0 8px #cccccc;
  max-height: 100%;
  overflow-y: scroll;
}
.panel-tab__title {
  font-weight: 600;
  padding: 0 8px;
  font-size: 1.1em;
  line-height: 1.2em;
  i {
    margin-right: 8px;
    font-size: 1.2em;
  }
}
.panel-tab__content {
  width: 100%;
  box-sizing: border-box;
  border-top: 1px solid #eeeeee;
  padding: 8px 16px;
  .panel-tab__content--title {
    display: flex;
    justify-content: space-between;
    padding-bottom: 8px;
    span {
      flex: 1;
      text-align: left;
    }
  }
}
.element-property {
  width: 100%;
  display: flex;
  align-items: flex-start;
  margin: 8px 0;
  .element-property__label {
    display: block;
    width: 90px;
    text-align: right;
    overflow: hidden;
    padding-right: 12px;
    line-height: 32px;
    font-size: 14px;
    box-sizing: border-box;
  }
  .element-property__value {
    flex: 1;
    line-height: 32px;
  }
  .el-form-item {
    width: 100%;
    margin-bottom: 0;
    padding-bottom: 18px;
  }
}
.list-property {
  flex-direction: column;
  .element-listener-item {
    width: 100%;
    display: inline-grid;
    grid-template-columns: 16px auto 32px 32px;
    grid-column-gap: 8px;
  }
  .element-listener-item + .element-listener-item {
    margin-top: 8px;
  }
}
.listener-filed__title {
  display: inline-flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-top: 0;
  span {
    width: 200px;
    text-align: left;
    font-size: 14px;
  }
  i {
    margin-right: 8px;
  }
}
.element-drawer__button {
  margin-top: 8px;
  width: 100%;
  display: inline-flex;
  justify-content: space-around;
}
.element-drawer__button > .el-button {
  width: 100%;
}

.el-collapse-item__content {
  padding-bottom: 0;
}
.el-input.is-disabled .el-input__inner {
  color: #999999;
}
.el-form-item.el-form-item--mini {
  margin-bottom: 0;
  & + .el-form-item {
    margin-top: 16px;
  }
}

</style>
