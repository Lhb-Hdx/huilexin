<template>
  <el-dialog title="选择模板" :visible.sync="selectionWindow" append-to-body width="50%" top="5vh">
    <div class="equipment_header">
      <el-input v-model="findHyitHostQuery.keyword" placeholder="搜索关键词" class="filter-item" style="width: 200px;margin-right: 10px;" />
      <el-button class="filter-item" type="primary" @click="search">查询</el-button>
    </div>
    <div class="table-wrapper" :class="isRadio ? 'has-gutter' : ''">
      <el-table
        ref="table"
        :data="deviceList"
        fit
        highlight-current-row
        style="width: 100%;"
        @select="handleSelect"
        @select-all="handleSelectAll"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="模板名称" prop="name" show-overflow-tooltip />
      </el-table>
      <pagination v-show="hostTotal > 0" :auto-scroll="true" :total="hostTotal" :page.sync="findHyitHostQuery.page" :limit.sync="findHyitHostQuery.limit" @pagination="loadDeviceList" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="selectionWindow = false">取 消</el-button>
      <el-button class="filter-item" type="primary" @click="completeSelection">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import selectMixin from '@/mixins/el-table-select-mixin'
import Pagination from '@/components/Pagination'

export default {
  name: 'ScriptRightPaneDevice',
  components: {
    Pagination
  },
  mixins: [selectMixin],
  props: {
    disabledImplement: {
      type: Boolean,
      default() {
        return true
      }
    },
    isRadio: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      deviceType: [],
      findHyitHostQuery: {
        page: 1,
        limit: 10,
        agent: '',
        keyword: ''
      },
      deviceList: [],
      keyField: 'zabbixTamplateId', // 列表主键id
      listField: 'deviceList', // 列表变量名称
      selectionWindow: false,
      hostTotal: 0,
      agentList: [],
      agentItem: {},
      agentItemId: '',
      childrenAgentItem: {},
      childrenAgentItemId: '',
      childrenAgentList: [],
      showChildrenAgentItem: false,
      agentsIds: '',
      selectType: 'radio'
    }
  },
  computed: {
    checkSelectable() {
      return function(row) {
        return (row.pwd != null && typeof (row.pwd) !== undefined && row.pwd !== '') && (row.userName != null && typeof (row.userName) !== undefined && row.userName !== '')
      }
    }
  },
  destroyed() {
    this.$EventBus.$off('implement-script')
  },
  methods: {
    // 获取选中的设备数据
    getSelectDeviceData() {},
    // 打开选择设备
    open(options) {
      this.selectionWindow = true
      this.allSelection = options.allSelection
      this.$set(this.findHyitHostQuery, 'agent', options.agent)
      this.loadDeviceList()
    },
    // 点击执行按钮
    implement() {
      this.$EventBus.$emit('implement-script', this.$tool.deepCopy({
        device: this.allSelection,
        agent: this.agentItem.agentType === 8 ? this.childrenAgentItemId : this.agentItemId,
        fromAgent: this.childrenAgentItemId
      }))
    },
    // 获取设备列表
    async loadDeviceList() {
      // 获取it监控设备
      const findZbxTamplate = await this.$request({ url: this.api.itMonitor.findZbxTamplate, data: this.findHyitHostQuery })
      this.deviceList = findZbxTamplate.data
      this.hostTotal = +findZbxTamplate.count
      this.$nextTick(() => {
        this.initTable()
      })
    },
    // 确定选择设备
    completeSelection() {
      this.allSelection.forEach((item, index) => {
        if (item.agent !== this.findHyitHostQuery.agent) {
          this.allSelection.splice(index, 1)
        }
      })
      this.selectionWindow = false
      this.selected = this.allSelection.length > 0
      this.$EventBus.$emit('complete-selection-device', this.$tool.deepCopy({
        device: this.allSelection,
        agent: this.agentItem.agentType === 8 ? this.childrenAgentItemId : this.agentItemId,
        fromAgent: this.childrenAgentItemId
      }))
    },
    // 搜索
    search() {
      this.$set(this.findHyitHostQuery, 'page', 1)
      this.loadDeviceList()
    }
  }
}
</script>

<style lang="scss" scoped>
.device-form {
  .device-form-item {
    margin-bottom: 20px;
    .form-item-label {
      font-size: 14px;
      margin-bottom: 10px;
    }
  }
}
/deep/ .has-gutter{
  .el-table__header-wrapper {
    .el-checkbox{
      display: none;
    }
  }
}
</style>
