<template>
  <div class="app-container flex" style="padding:0">
    <div class="page-left">
      <ScriptSceneList />
      <ScriptGroupAuction />
      <ScriptGroupTree :tree-list="groupTree" />
    </div>
    <div class="page-right">
      <ScriptTable :show-script-statue="false" :show-state-switch="false" :show-verify-statue="false" :show-c-time="false" :show-u-time="true" :script-statue-prop="1" :verify-statue-prop="1">
        <el-table-column label="操作" width="200" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['Detail']" size="mini" type="primary" @click="onDetail(row)">查看</el-button>
            <el-button v-permission="['Log']" size="mini" type="primary" @click="onLog(row)">日志</el-button>
          </template>
        </el-table-column>
      </ScriptTable>
    </div>
    <ScriptExecuteLogDialog ref="scriptExecuteLogDialog" />
  </div>
</template>

<script>
import ScriptTable from '@/components/AutomationOperationsComponent/ScriptTable'
import ScriptSceneList from '@/components/AutomationOperationsComponent/ScriptSceneList'
import ScriptGroupTree from '@/components/AutomationOperationsComponent/ScriptGroupTree'
import ScriptGroupAuction from '@/components/AutomationOperationsComponent/ScriptGroupAuction'
import ScriptExecuteLogDialog from '@/components/AutomationOperationsComponent/ScriptExecuteLogDialog'
import {compareJson} from '@/utils/utils'

export default {
  name: 'ScriptList',
  components: {
    ScriptTable,
    ScriptSceneList,
    ScriptGroupTree,
    ScriptGroupAuction,
    ScriptExecuteLogDialog
  },
  data() {
    return {
      groupData: [],
      groupTree: []
    }
  },
  mounted() {
    this.findHyitOpsScriptGroupData()
    this.$EventBus.$on('add-group', (msg) => {
      if (msg.setInType === 'group') {
        this.findHyitOpsScriptGroupData()
      }
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('add-group')
  },
  methods: {
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
          level: 0,
          groupIndex: item.groupIndex
        })
      })

      this.groupTree = groupTree
      this.groupTree.sort(compareJson('groupIndex', 'up'))
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
    // 进入详情
    onDetail(row) {
      this.$router.push({
        name: 'FastScriptExecute',
        query: {
          id: row.id
        }
      })
    },
    // 打开日志
    onLog(row) {
      this.$refs.scriptExecuteLogDialog.open({ scriptId: row.id })
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
  padding-left: 300px;
  height: 100%;
  width: 100%;
}
</style>
