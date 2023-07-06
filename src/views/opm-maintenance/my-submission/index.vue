<template>
  <div class="my-submission">
    <div class="sider-wrapper">
      <OpmSider ref="opmSider" @emitServiceChange="emitServiceChange" />
    </div>
    <div class="rightContainer">
      <div class="tabsAndTable">
        <MatterTabs ref="MatterTabs" item-type="submission" :statistics-count-param="statisticsCountParam" :tabs-list="tabsList" @emitSetTableList="emitSetTableList" @emitHandlerSearch="emitHandlerSearch" />
      </div>
      <div class="tableWrapper">
        <MatterTable item-type="submission" :table-data="tableData" :table-count="tableCount" @emitGetPagingTableData="emitGetPagingTableData" />
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
      statisticsCountParam: [],
      groupIds: [],
      currentServiceType: '' // 侧边栏选中的服务类型id
    }
  },
  computed: {
    menuQuery() {
      return this.$route.meta.menuQuery
    }
  },
  async mounted() {
    const typeTabs = await this.$store.dispatch('opm/getTypeTabs', {type: 'submission'})
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
      // 如果是 我的事项 - 我的提交就加上userId查询事项
      if (+this.menuQuery.tableDataType === 2) this.$set(this.listQuery, 'userId', this.$auth.getUserSession().userId)

      const serviceList = await this.findSysRoleService()
      if (serviceList.length) {
        this.listQuery.serviceTypes = [...new Set(serviceList.map(it => it.serviceId).filter(Boolean))]
        const findOpsOrderProblem = await this.findOpsOrderProblem({ ...this.listQuery, ...this.currentTab.query })
        if (findOpsOrderProblem) {
          this.tableData = findOpsOrderProblem.data
          this.tableCount = +findOpsOrderProblem.count
        }
      }

      if (+this.menuQuery.tableDataType === 1) {
        await this.$refs.opmSider.getCountNumByDateAndServiceTypeData('')
      } else {
        const groupIds = []
        const findHrUserGroupMap = await this.findHrUserGroupMap({ userId: this.$auth.getUserSession().userId, limit: -1 })
        if (findHrUserGroupMap && findHrUserGroupMap.data && findHrUserGroupMap.data.length > 0) {
          findHrUserGroupMap.data.forEach(item => groupIds.push(item.groupId))
          this.groupIds = groupIds
        }
        if (this.groupIds.length > 0) await this.$refs.opmSider.getCountNumByDateAndServiceTypeData(this.groupIds.toString())
      }
      await this.$refs.MatterTabs.getTabCount()
    },
    // 监听点击tab
    emitSetTableList(item) {
      this.currentTab = item
      this.listQuery = {
        page: 1,
        limit: 10,
        serviceType: this.currentServiceType
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
.my-submission{
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
