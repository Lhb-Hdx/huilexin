<template>
  <div class="my-accraditation">
    <div class="sider-wrapper">
      <OpmSider ref="opmSider" @emitServiceChange="emitServiceChange" />
    </div>
    <div class="rightContainer">
      <div class="tabsAndTable">
        <MatterTabs
          ref="MatterTabs"
          item-type="my-accraditation"
          :statistics-count-param="statisticsCountParam"
          :tabs-list="tabsList"
          :approve-tab-count="approveTabCount"
          @emitSetTableList="emitSetTableList"
          @emitHandlerSearch="emitHandlerSearch"
        />
      </div>
      <div class="tableWrapper">
        <MatterTable ref="MatterTable" item-type="my-accraditation" :table-data="tableData" :table-count="tableCount" @emitGetPagingTableData="emitGetPagingTableData" />
      </div>
    </div>
  </div>
</template>

<script>
import OpmSider from '../components/opmSider.vue'
import MatterTabs from '../components/matterTabs.vue'
import MatterTable from '../components/matterTable.vue'
import MatterMixins from '@/views/opm-maintenance/accraditation/mixins/matter-mixins'
import { mapState } from 'vuex'

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
      approveTabCount: 0
    }
  },
  computed: {
    ...mapState('opm', ['tabsItemCode']),
    menuQuery() {
      return this.$route.meta.menuQuery
    }
  },
  async mounted() {
    const typeTabs = await this.$store.dispatch('opm/getTypeTabs', { type: 'my-accraditation' })
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
      let tableData = []
      let tableCount = 0
      delete this.listQuery.userId
      delete this.listQuery.approveUserId
      this.$set(this.listQuery, `${this.currentTab.findMyKey}`, this.$auth.getUserSession().userId)
      if (this.currentTab.code === 'pass' || this.currentTab.code === 'failApprove' || this.currentTab.code === 'reject') {
        const findApprove = await this.findNewOaApproveLogEx({
          approveType: this.$defineData.projectActivityProcessDefine('accraditation', 'key', 'id'),
          ...this.listQuery,
          ...this.currentTab.query
        })
        if (findApprove && findApprove.data) {
          tableData = findApprove.data
          tableCount = findApprove.count
        }
      } else {
        const findApprove = await this.findApprove({
          approveType: this.$defineData.projectActivityProcessDefine('accraditation', 'key', 'id'),
          ...this.listQuery,
          ...this.currentTab.query
        })
        if (findApprove && findApprove.data) {
          tableData = findApprove.data
          tableCount = findApprove.count
        }
      }
      if (tableData.length > 0) {
        const approveIds = []
        const orderProblem = []
        tableData.forEach(item => approveIds.push(item.approveId))
        let serviceTypes = []
        const serviceList = await this.findSysRoleService()
        if (serviceList.length) {
          serviceTypes = [...new Set(serviceList.map(it => it.serviceId).filter(Boolean))]
          const findOpsOrderProblem = await this.findOpsOrderProblem({type: 1, ids: this.$tool.uniqueArray(approveIds).toString(), limit: -1, serviceTypes})
          if (findOpsOrderProblem && findOpsOrderProblem.data) {
            tableData.forEach(item => {
              const getOpsOrderProblemIndex = findOpsOrderProblem.data.findIndex(items => +items.id === +item.approveId)
              if (getOpsOrderProblemIndex !== -1) {
                orderProblem.push({
                  ...findOpsOrderProblem.data[getOpsOrderProblemIndex],
                  taskId: item.taskId,
                  instanceId: item.instanceId
                })
              }
            })
          }
        }
        this.tableData = orderProblem
        this.tableCount = +tableCount
      } else {
        this.tableData = []
        this.tableCount = 0
      }
      if (this.tabsItemCode === 'approve') this.approveTabCount = this.tableCount

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
      await this.$refs.MatterTabs.getTabCount(this.groupIds)
    //   await this.findTask()
    },
    async findNewOaApproveLog(approveIds) {
      const { code, data } = await this.$request({
        url: this.api.approveLog.findNewOaApproveLog,
        data: { approveIds, approveType: 496, page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    // 查找下一个审批人
    async findTask() {
      const approveIds = this.tableData.map(it => it.id).filter(Boolean)
      const logData = await this.findNewOaApproveLog(approveIds)

      for (let it of this.tableData) {
        // 返回来的taskModel没有数据就是流程走完了
        const itLogData = logData.filter(item => +item.approveId === +it.id)
        const { model: taskModel, code: taskCode } = await this.$request({ url: this.api.opm.findTask, data: { instanceId: itLogData[0].instanceId || '' } })
        if (taskCode !== 1) return
        const taskModelObj = JSON.parse(taskModel)[0] || []
        // it.nextApproveObj = taskModelObj
        // 判断流程是否走完
        if (taskModelObj.length !== 0) {
          // taskModelObj根据配置的不同返回来的对象结构属性不同
          //  一个是配置了特定用户，
          if (taskModelObj.userId) {
            it.isApprove = taskModelObj.userId.includes('' + this.localStorageOperation('get', 'userInfo')['userId'])
            it.nextApprove = true
            // 一个是配置了特定角色
          } else if (taskModelObj.roleId) {
            let form = { page: -1, limit: -1 }
            const { data: roleData } = await this.$request({ url: this.api.sys.findSysUserRole, data: form })
            let finalArr = roleData.filter(item => +item.roleId === +taskModelObj.roleId)

            it.isApprove = finalArr.findIndex(item => +item.userId === +this.localStorageOperation('get', 'userInfo')['userId']) !== -1
          }
        } else {
          it.nextApprove = false
        }
      }
    },
    // 监听侧边栏类型选择
    emitServiceChange(service) {
      this.listQuery.page = 1
      this.listQuery.serviceType = service
      this.generateData()
    },
    // 监听点击tab
    emitSetTableList(item) {
      this.currentTab = item
      this.listQuery = {
        page: 1,
        limit: 10
      }
      this.$refs.MatterTable.listQuery.page = 1
      this.generateData()
    },
    // 监听表格页码切换
    emitGetPagingTableData(item) {
      console.log('item: ', item)
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
.my-accraditation {
  height: 100%;
  display: flex;
  .sider-wrapper {
    height: 100%;
    min-height: 100%;
  }
  .rightContainer {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 20px;
    .tabsAndTable {
      margin: 0 0 10px 0;
    }
  }
}
</style>
