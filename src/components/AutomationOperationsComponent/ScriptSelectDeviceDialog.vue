<template>
  <el-dialog title="选择设备" :visible.sync="selectionWindow" append-to-body width="60%" top="5vh">
    <div class="equipment_header">
      <el-select
        v-model="agentItemId"
        placeholder="请选择网关"
        style="margin-right: 10px"
        @change="changeAgent"
      >
        <el-option
          v-for="item in agentList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-select
        v-if="showChildrenAgentItem"
        v-model="childrenAgentItemId"
        filterable
        placeholder="请选择下级网关"
        class="filter-item"
        style="margin-right: 10px"
        @change="changeChildrenAgent"
      >
        <el-option
          v-for="item in childrenAgentList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-select v-model="findHyitHostQuery.devType" placeholder="请选择设备类型" clearable class="filter-item" style="width: 200px;margin-right: 10px;" @change="loadDeviceList">
        <el-option label="全部" value="" />
        <el-option v-for="item in deviceType" :key="item.id" :label="item.dictdataName" :value="item.id" />
      </el-select>
      <el-input v-model="findHyitHostQuery.keyword" placeholder="搜索关键词" class="filter-item" style="width: 200px;margin-right: 10px;" />
      <el-button class="filter-item" type="primary" @click="search">查询</el-button>
    </div>
    <div class="equipment_table" :class="isRadio ? 'has-gutter' : ''">
      <el-table
        ref="table"
        :data="deviceList"
        fit
        highlight-current-row
        style="width: 100%;"
        @select="handleSelect"
        @select-all="handleSelectAll"
      >
        <el-table-column type="selection" :selectable="checkSelectable" width="55" />
        <el-table-column label="NO" prop="id" type="index" width="60" />
        <el-table-column label="主机名称" prop="hyMarkName" show-overflow-tooltip />
        <el-table-column label="主机IP" prop="hyIp" show-overflow-tooltip />
        <el-table-column label="主机端口" prop="hyPort" show-overflow-tooltip />
        <el-table-column label="用户名" prop="userName" width="120" show-overflow-tooltip />
        <el-table-column label="密码" prop="pwd" width="120" show-overflow-tooltip>
          <template slot-scope="{row}">
            <div class="pointer" @mouseenter="pwdEnter(row)" @mouseleave="pwdLeave(row)">
              <span v-show="row.pwdState">{{ row.pwd }}</span>
              <span v-show="!row.pwdState">******</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="可用性" width="120">
          <template slot-scope="{row}">
            <el-tooltip :disabled="checkSelectable(row)" content="该设备没有配置管理账号信息，请在网元管理中进行配置" placement="top">
              <i class="el-icon-success" :class="checkSelectable(row) ? 'success' : 'info'" />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="配置" width="120">
          <template slot-scope="{row}">
            <el-button v-permission="['Config']" type="primary" size="mini" @click="onConfig(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="hostTotal > 0" :auto-scroll="false" :total="hostTotal" :page.sync="findHyitHostQuery.page" :limit.sync="findHyitHostQuery.limit" @pagination="loadDeviceList" />
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
        devType: '',
        keyword: '',
        hostType: 1
      },
      deviceList: [],
      keyField: 'hyHostId', // 列表主键id
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
  async mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.agentList = await this.findHyitAgent('1,8')
    if (this.agentList.length > 0) {
      this.agentItemId = this.agentList[0].id
      this.agentItem = this.agentList[0]
      if (this.agentItem.agentType === 8) {
        this.showChildrenAgentItem = true
        this.childrenAgentList = await this.findHyitAgent('1')
        if (this.childrenAgentList.length > 0) {
          this.childrenAgentItemId = this.childrenAgentList[0].id
          this.childrenAgentItem = this.childrenAgentList[0]
        }
        this.$set(this.findHyitHostQuery, 'agent', this.childrenAgentList[0].id)
      } else {
        this.$set(this.findHyitHostQuery, 'agent', this.agentList[0].id)
      }
    }
    this.findItDeviceType()
  },
  methods: {
    // 获取选中的设备数据
    getSelectDeviceData() {},
    // 打开选择设备
    open(options) {
      this.selectionWindow = true
      this.allSelection = options.allSelection
      this.loadDeviceList()
    },
    // 点击执行按钮
    implement() {
      if (this.allSelection.length === 0) return this.$message('请选择执行设备')
      this.$EventBus.$emit('implement-script', this.$tool.deepCopy({
        device: this.allSelection,
        agent: this.agentItem.agentType === 8 ? this.childrenAgentItemId : this.agentItemId,
        fromAgent: this.childrenAgentItemId
      }))
    },
    // 删除选择设备
    deleteSelectDevice(row) {
      const idx = this.allSelection.findIndex(item => Number(item.hyHostId) === Number(row.hyHostId))
      if (idx !== -1) this.allSelection.splice(idx, 1)
    },
    // 获取设备列表
    async loadDeviceList() {
      // 获取it监控设备
      const itHost = await this.$request({ url: this.api.itMonitor.findHyitHost, data: this.findHyitHostQuery })
      if (itHost.code !== 1 && !itHost.data) return
      this.hostTotal = Number(itHost.count)
      const hostIds = []
      itHost.data.forEach(item => hostIds.push(item.hyHostId))
      // 根据it监控去获取运维设备
      const opsServer = await this.$request({ url: this.api.automationOperations.findHyitOpsServer, data: { hostIds: hostIds.toString() }})
      itHost.data.forEach(item => {
        const getOpsServerIdx = opsServer.data.findIndex(getOpsServerItem => Number(getOpsServerItem.hostId) === Number(item.hyHostId))
        if (getOpsServerIdx !== -1) {
          item.opsServerId = opsServer.data[getOpsServerIdx].id
          item.userName = opsServer.data[getOpsServerIdx].userName
          item.pwd = opsServer.data[getOpsServerIdx].pwd
        }
      })
      this.deviceList = itHost.data
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
    // 显示 隐藏密码
    pwdEnter(row) { row.pwdState = true },
    pwdLeave(row) { row.pwdState = false },
    // 搜索
    search() {
      this.$set(this.findHyitHostQuery, 'page', 1)
      this.loadDeviceList()
    },
    async changeAgent(val) {
      const idx = this.agentList.findIndex(item => Number(item.id) === Number(val))
      if (idx === -1) return
      this.agentItem = this.agentList[idx]
      if (this.agentList[idx].agentType === 8) {
        this.childrenAgentList = await this.findHyitAgent('9')
        this.showChildrenAgentItem = true
        if (this.childrenAgentList.length > 0) {
          this.childrenAgentItemId = this.childrenAgentList[0].id
          this.childrenAgentItem = this.childrenAgentList[0]
          this.$set(this.findHyitHostQuery, 'agent', Number(this.childrenAgentList[0].id))
          this.loadDeviceList()
        }
      } else {
        this.childrenAgentList = []
        this.childrenAgentItem = {}
        this.childrenAgentItemId = ''
        this.showChildrenAgentItem = false
        this.$set(this.findHyitHostQuery, 'agent', Number(val))
        this.loadDeviceList()
      }
    },
    changeChildrenAgent(val) {
      this.$set(this.findHyitHostQuery, 'agent', Number(val))
      this.loadDeviceList()
    },
    // 获取网关
    async findHyitAgent(agentTypes) {
      const res = await this.$request({
        url: this.api.itMonitor.findHyitAgent,
        data: { agentTypes, agents: this.agentsIds, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (res.code !== 1) return
      return res.data
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
    // 进入配置
    onConfig(row) {
      this.$router.push({
        name: 'HostUpdate',
        query: {
          id: row.hyHostId || 0,
          hyZhostId: row.hyZhostId || 0,
          hyHostId: row.hyHostId || 0
        }
      })
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
