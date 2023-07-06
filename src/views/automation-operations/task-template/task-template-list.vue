<template>
  <div class="app-container flex" style="padding:0">
    <div class="page-left">
      <ScriptSceneList />
      <ScriptGroupAuction />
      <ScriptGroupTree :tree-list="groupTree" />
    </div>
    <div class="page-right">
      <div class="filter-container">
        <el-button v-permission="['Create']" class="filter-item" type="primary" @click="create">新增</el-button>
        <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="搜索关键词" class="filter-item" style="width: 200px" />
        <el-button v-permission="['Search']" class="filter-item" type="primary" @click="search">查询</el-button>
        <ListControl :check-list="checkList" @setLists="setLists" />
      </div>
      <div class="table-wrapper">
        <el-table :data="templateList">
          <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="作业模板名称" prop="tamplateName" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="适用场景" prop="sceneType" show-overflow-tooltip>
            <template slot-scope="{row}">{{ setUsageAcenarios(row.sceneType) }}</template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="更新人" show-overflow-tooltip>
            <template slot-scope="{row}">{{ $tool.matchData(users, row, 'userId', 'realName', 'userId') }}</template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="更新时间" prop="updateTime" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="操作" width="240" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button v-permission="['Log']" size="mini" type="primary" @click="onLog(row)">日志</el-button>
              <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">编辑</el-button>
              <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDel(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitOpsTamplate" />
      </div>
    </div>
    <ScriptExecuteLogDialog ref="scriptExecuteLogDialog" />
  </div>
</template>

<script>
import ScriptSceneList from '../../../components/AutomationOperationsComponent/ScriptSceneList'
import ScriptGroupTree from '../../../components/AutomationOperationsComponent/ScriptGroupTree'
import ScriptGroupAuction from '../../../components/AutomationOperationsComponent/ScriptGroupAuction'
import Pagination from '@/components/Pagination'
import ScriptExecuteLogDialog from '../../../components/AutomationOperationsComponent/ScriptExecuteLogDialog'
import ListControl from '@/components/ListControl'

export default {
  name: 'TaskTemplateList',
  components: {
    ScriptSceneList,
    ScriptGroupTree,
    ScriptGroupAuction,
    Pagination,
    ScriptExecuteLogDialog,
    ListControl
  },
  data() {
    return {
      groupData: [],
      groupTree: [],
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        tamplateTypeId: '',
        scriptGroupId: '',
        sceneType: ''
      },
      listTotal: 0,
      templateList: [],
      sceneType: this.$defineData.getOpsSceneType(),
      users: [],
      // 显示控制数据 start
      checkList: ['作业模板名称', '适用场景', '更新人', '更新时间', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setUsageAcenarios() {
      return function (key) {
        const idx = this.sceneType.findIndex(item => Number(item.value) === Number(key))
        if (idx !== -1) return this.sceneType[idx].label
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('handler-ops-group-item,handler-ops-scene-item')
  },
  mounted() {
    this.findHyitOpsScriptGroupData()
    this.findHyitOpsTamplate()
    this.$EventBus.$on('handler-ops-group-item', (val) => {
      this.$set(this.listQuery, 'scriptGroupId', val.treeItemId)
      this.search()
    })
    this.$EventBus.$on('handler-ops-scene-item', (val) => {
      this.$set(this.listQuery, 'sceneType', val.value === 0 ? '' : val.value)
      this.search()
    })
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 设置分组数据
    async findHyitOpsScriptGroupData() {
      // 查询第一级分组
      const firstLevelGroup = await this.findHyitOpsScriptGroup({ parentId: 0 })
      const allGroup = await this.findHyitOpsScriptGroup({ limit: -1 })
      const groupTree = []
      firstLevelGroup.forEach(item => {
        groupTree.push({
          isGroup: true,
          treeItemId: item.id,
          treeItemName: item.groupName,
          treeParentId: item.parentId,
          imageUrl: item.imageUrl,
          expand: false,
          group: [],
          level: 0
        })
      })
      this.groupTree = groupTree
      this.groupData = this.$tool.listToTree(allGroup, 0, 0, 'id', 'parentId')
    },
    // 查询分组目录
    async findHyitOpsScriptGroup(query) {
      const { code, data } = await this.$request({
        url: this.api.automationOperations.findHyitOpsScriptGroup,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 搜索
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.findHyitOpsTamplate()
    },
    // 新增
    create() {
      this.$router.push({
        name: 'TaskTemplateCreate'
      })
    },
    // 删除
    onDel(row) {
      this.$confirm('是否删除该模板？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: this.api.automationOperations.deleteHyitOpsTamplate,
          data: { id: row.id }
        })
          .then(async res => {
            if (res.code === 1) {
              this.findHyitOpsTamplate()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      })
    },
    // 日志
    onLog(val) {
      this.$refs.scriptExecuteLogDialog.open({ tamplateId: val.id })
    },
    // 编辑
    onEdit(row) {
      this.$router.push({
        name: 'TaskTemplateUpdate',
        query: {
          id: row.id
        }
      })
    },
    // 查询模板
    findHyitOpsTamplate() {
      this.$request({
        url: this.api.automationOperations.findHyitOpsTamplate,
        data: this.listQuery
      }).then(async res => {
        if (res.code === 1) {
          this.templateList = res.data
          this.listTotal = Number(res.count)
          const userIds = []
          res.data.forEach(item => {
            userIds.push(item.userId)
          })
          this.users = await this.commonRequestFn.findSysUser({
            ids: this.$tool.uniqueArray(userIds).toString(),
            limit: -1
          })
        }
      })
    }
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
  padding: 10px 10px 10px 310px;
  height: 100%;
  width: 100%;
}
</style>
