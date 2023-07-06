<template>
  <div class="todo-plan">
    <div class="sider-wrapper">
      <OpmSider ref="opmSider" @emitServiceChange="emitServiceChange" />
    </div>
    <div class="rightContainer">
      <div class="tabsAndTable">
        <MatterTabs ref="MatterTabs" item-type="todo-plan" :statistics-count-param="statisticsCountParam" :tabs-list="tabsList" @emitSetTableList="emitSetTableList" @emitHandlerSearch="emitHandlerSearch" />
      </div>
      <div class="tableWrapper">
        <MatterTable item-type="todo-plan" :table-data="tableData" :table-count="tableCount" @emitGetPagingTableData="emitGetPagingTableData" />
      </div>
    </div>
  </div>
</template>

<script>
import OpmSider from '../components/opmSider.vue'
import MatterTabs from '../components/matterTabs.vue'
import MatterTable from '../components/matterTable.vue'
import MatterMixins from '@/views/opm-maintenance/mixins/matter-mixins'

export default {
  components: {
    OpmSider,
    MatterTabs,
    MatterTable
  },
  mixins: [MatterMixins],
  data() {
    return {
      tableData: [], // 表格列表
      tableCount: 0, // 表格总量
      listQuery: {
        page: 1,
        limit: 10
      },
      loginUser: '',
      tabsList: [],
      currentTab: {},
      groupIds: [],
      statisticsCountParam: [],
      currentServiceType: ''
    }
  },
  computed: {
    menuQuery() {
      return this.$route.meta.menuQuery
    }
  },
  async mounted() {
    const typeTabs = await this.$store.dispatch('opm/getTypeTabs', {type: 'todo-plan'})
    if (typeTabs.statisticsCountParam) this.statisticsCountParam = typeTabs.statisticsCountParam
    if (typeTabs.tabsList && typeTabs.tabsList.length > 0) {
      this.currentTab = typeTabs.tabsList[0]
      this.tabsList = typeTabs.tabsList
      this.$store.dispatch('opm/setState', { stateName: 'tabsItemCode', stateData: this.tabsList[0].code })
    }
    await this.generateData()
  },
  methods: {
    // 组装数据
    async generateData() {
      if (+this.menuQuery.tableDataType === 1) {
        // 所有事项 - 待处理
        const serviceList = await this.findSysRoleService()
        if (serviceList.length) {
          this.listQuery.serviceTypes = [...new Set(serviceList.map(it => it.serviceId).filter(Boolean))]
          const findOpsOrderProblem = await this.findOpsOrderProblem({ ...this.listQuery, ...this.currentTab.query })
          if (findOpsOrderProblem && findOpsOrderProblem.data) {
            this.tableData = findOpsOrderProblem.data
            this.tableCount = +findOpsOrderProblem.count
          }
        }

        await this.$refs.opmSider.getCountNumByDateAndServiceTypeData('')
        await this.$refs.MatterTabs.getTabCount(this.groupIds)
      } else {
        // 我的事项 - 待处理
        const groupIds = []

        if (this.groupIds.length === 0) {
          // 查询当前用户小组事项
          const findHrUserGroupMap = await this.findHrUserGroupMap({ userId: this.$auth.getUserSession().userId, limit: -1 })
          if (findHrUserGroupMap && findHrUserGroupMap.data && findHrUserGroupMap.data.length > 0) {
            findHrUserGroupMap.data.forEach(item => groupIds.push(item.groupId))
            this.groupIds = groupIds
          } else {
            this.tableData = []
            this.tableCount = 0
          }
        }

        const serviceList = await this.findSysRoleService()
        // 用分组ids查事项列表
        if (this.groupIds.length > 0 && serviceList.length) {
          let serviceTypes = []
          serviceTypes = [...new Set(serviceList.map(it => it.serviceId).filter(Boolean))]
          const findOpsOrderProblem = await this.findOpsOrderProblem({ groupIds: this.$tool.uniqueArray(this.groupIds).toString(), ...this.listQuery, ...this.currentTab.query, serviceTypes })
          if (findOpsOrderProblem.data) {
            this.tableData = findOpsOrderProblem.data
            this.tableCount = +findOpsOrderProblem.count
          }
        }

        if (this.groupIds.length > 0) await this.$refs.opmSider.getCountNumByDateAndServiceTypeData(this.groupIds.toString())
        this.groupIds.length > 0 ? await this.$refs.MatterTabs.getTabCount(this.groupIds) : ''
      }
    },
    // 监听点击tab
    emitSetTableList(item) {
      this.currentTab = item
      this.listQuery = {
        page: 1,
        limit: 10
      }
      this.generateData()
    },
    // 监听侧边栏类型选择
    emitServiceChange(service) {
      this.listQuery.page = 1
      this.listQuery.serviceType = service
      this.currentServiceType = service
      this.generateData()
    },
    // 监听表格页码切换
    emitGetPagingTableData(item) {
      this.listQuery = item
      this.generateData(true)
    },
    // 监听点击搜索
    emitHandlerSearch(keyword) {
      this.$set(this.listQuery, 'keyword', keyword)
      this.generateData()
    }
  }
}
</script>

<style lang="scss" scoped>
.todo-plan{
   height: 100%;
  display: flex;
  .sider-wrapper{
    height: 100%;
    min-height: 100%;
  }
  .rightContainer{
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 20px;
    .tabsAndTable{
        margin: 0 0 10px 0;
    }

  }
}
</style>
