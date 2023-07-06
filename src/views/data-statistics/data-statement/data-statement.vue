<template>
  <div class="app-container flex" style="padding: 0">
    <div class="page-left">
      <StatementType />
    </div>
    <div ref="pageRight" class="page-right">
      <!-- 每个类型的数据报表都新建一个组件，然后在params-model/data-statistical/params.js的statementType中定义报表类型，才可以切换组件 -->
      <component :is="dynaComponent" v-if="!showEmpty" />
      <el-empty v-else class="empty" description="暂无数据" />
    </div>
  </div>
</template>

<script>
import StatementType from '@/views/data-statistics/components/data-statement/statement-type'
import OpmUserStatement from '@/views/data-statistics/data-statement/statement-content/opm-user-statement'
import ItDeviceStatement from '@/views/data-statistics/data-statement/statement-content/it-device-statement'
import FlowStatement from '@/views/data-statistics/data-statement/statement-content/flow-statement'
import IpResourceStatement from '@/views/data-statistics/data-statement/statement-content/ip-resource-statement'
import AlarmStatement from '@/views/data-statistics/data-statement/statement-content/alarm-statement'
import PortResourceStatement from '@/views/data-statistics/data-statement/statement-content/port-resource-statement'
import MatterServiceStatement from '@/views/data-statistics/data-statement/statement-content/matter-service-statement'
import AssetsReport from '@/views/data-statistics/assets-report/assets-report.vue'
import TaskStatement from '@/views/data-statistics/data-statement/statement-content/task-statement'
import AlarmDealStatement from '@/views/data-statistics/data-statement/statement-content/alarm-deal-statement.vue'
export default {
  name: 'DataStatement',
  components: {
    StatementType,
    OpmUserStatement,
    ItDeviceStatement,
    FlowStatement,
    IpResourceStatement,
    AlarmStatement,
    PortResourceStatement,
    MatterServiceStatement,
    AssetsReport,
    TaskStatement,
    AlarmDealStatement
  },
  data() {
    return {
      dynaComponent: '',
      showEmpty: true
    }
  },
  beforeDestroy() {
    this.$EventBus.$off('handlerStatementType')
  },
  mounted() {
    this.$EventBus.$on('handlerStatementType', res => {
      console.log('res: ', res)
      if (res.componentName) {
        this.dynaComponent = res.componentName
        this.showEmpty = false
      } else {
        this.showEmpty = true
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.page-left {
  width: 300px;
  background: #e5ecf6;
  position: fixed;
  height: 100%;
  overflow-x: hidden;
}
.page-right {
  padding-left: 300px;
  height: 100%;
  width: 100%;
  .empty {
    margin-top: 10%;
  }
}
</style>
