<template>
  <div class="app-container">
    <div>
      <el-tabs v-model="activeName" @tab-click="onTabChange">
        <el-tab-pane v-for="item in tabs" :key="item.id" :label="item.name" :name="item.id" />
      </el-tabs>
    </div>

    <div class="filter-container">
      <el-select v-model="listQuery.serviceType" placeholder="请选择服务类型" clearable class="filter-item">
        <el-option v-for="item in serviceList" :key="item.serviceId" :label="item.serviceName" :value="item.serviceId" />
      </el-select>
      <el-select v-model="listQuery.userIds" placeholder="请选择运维人员" clearable class="filter-item">
        <el-option v-for="item in userList" :key="item.userId" :label="item.realName" :value="item.userId" />
      </el-select>
      <el-select v-model="listQuery.statue" placeholder="请选择作业状态" clearable class="filter-item">
        <el-option v-for="item in audioStatus" :key="item.statue" :label="item.label" :value="item.statue" />
      </el-select>
      <el-date-picker v-model="listQuery.planTime" type="date" class="filter-item" value-format="yyyy-MM-dd" placeholder="选择日期" format="yyyy 年 MM 月 dd 日" />
      <OutputExcel ref="outputExcel" @submitQuery="submitQuery" />
      <el-button type="primary" class="filter-item" size="medium" @click="onSearch">查询</el-button>
      <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
    </div>

    <div v-loading="listLoading" class="table-wrapper">
      <el-table ref="table" :data="list" fit highlight-current-row>
        <el-table-column label="No" width="50">
          <template v-slot="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" show-overflow-tooltip prop="name" label="作业名称" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" show-overflow-tooltip prop="serviceName" label="服务类型" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" show-overflow-tooltip prop="" label="计划时间">
          <template v-slot="{ row }"> {{ row.workStime }} 至 {{ row.workEtime }} </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" show-overflow-tooltip prop="userAndGroup" label="运维人员" />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" show-overflow-tooltip prop="statueName" label="作业状态" width="100">
          <template v-slot="{ row }">
            <div :style="{ color: row.statueColor }">{{ row.statueName }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listQuery.total > 0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="onPageChange" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import OutputExcel from '@/components/outputExcel'
import workTaskType from '@/params-model/opm/function'
import ListControl from '@/components/ListControl'

export default {
  components: {
    Pagination,
    OutputExcel,
    ListControl
  },
  data() {
    return {
      tabs: [],
      activeName: '',
      listQuery: {
        limit: 10,
        page: 1,
        total: 0
      },
      audioStatus: workTaskType.get('workTaskType'),
      list: [],
      listLoading: false,
      userList: [],
      serviceList: [],
      // 显示控制数据 start
      checkList: ['作业名称', '服务类型', '计划时间', '运维人员', '作业状态'],
      lists: [],
      storageVal: 'job-report' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  async created() {
    await this.findTabsData()
    this.userList = await this.findSysUser()
    const serviceList = await this.findOpsOrderProblemService()
    this.serviceList = serviceList.filter(it => it.pid !== -1)
    const { taskList, count } = await this.initData()
    this.list = taskList
    this.listQuery.total = +count
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async findHyitAgentGroupAuth() {
      const { data, code } = await this.$request({ url: this.api.itAgentGroup.findHyitAgentGroupAuth, data: { groupId: this.listQuery.projectId, limit: -1 } })
      if (code === 1) return data
    },
    async findSysUserRole(roleIds) {
      const { data, code } = await this.$request({ url: this.api.sys.findSysUserRole, data: { roleIds, limit: -1 } })
      if (code === 1) return data
    },
    async initData(query) {
      const groupAuth = await this.findHyitAgentGroupAuth()
      if (!groupAuth.length) return
      const roleUserList = await this.findSysUserRole(groupAuth.map(it => it.roleId).filter(Boolean))
      if (!roleUserList.length) return
      // , roleUserList.map(it => it.userId).filter(Boolean)
      const { data: taskList, count } = await this.findOpsOrderWorkTask(query, roleUserList.map(it => it.userId).filter(Boolean))
      if (!taskList.length) return []
      this.listLoading = true
      // 事项
      const orderProblemIds = taskList
        .map(item => item.orderProblemId)
        .filter(Boolean)
        .toString()
      let orderProblemList = []
      let childServiceList = []
      let parentServiceList = []
      let groupList = []
      let groupMapList = []
      orderProblemList = await this.findOpsOrderProblem(orderProblemIds)

      if (orderProblemList.length) {
        groupMapList = await this.findOpsOrderProblemGroupMap(orderProblemList.map(it => it.id).filter(Boolean))
        groupList = await this.findHrUserGroup(
          groupMapList
            .map(item => item.groupId)
            .filter(Boolean)
            .toString()
        )
        childServiceList = await this.findOpsOrderProblemService(
          orderProblemList
            .map(item => item.serviceType)
            .filter(Boolean)
            .toString()
        )
      }
      if (childServiceList.length) {
        parentServiceList = await this.findOpsOrderProblemService(
          childServiceList
            .map(item => item.pid)
            .filter(Boolean)
            .toString()
        )
      }

      const userList = await this.findSysUser(
        taskList
          .map(item => item.userId)
          .filter(Boolean)
          .toString()
      )

      for (const it of taskList) {
        const orderProblem = orderProblemList.find(item => +item.id === it.orderProblemId) || {}
        if (orderProblem) {
          const childService = childServiceList.find(item => +item.serviceId === +orderProblem.serviceType)
          const childServiceName = childService?.serviceName || ''
          const parentServiceName = childService ? parentServiceList.find(item => +item.serviceId === +childService.pid)?.serviceName : ''
          it['serviceName'] = `${parentServiceName} > ${childServiceName}`

          // 查运维人员
          if (groupList.length) {
            const user = userList.find(item => +item.userId === +it.userId)
            let group = {}
            const groupMap = groupMapList.find(item => +item.problemId === +orderProblem.id)
            if (groupMap) {
              group = groupList.find(item => +item.groupId === +groupMap.groupId)
            }
            it['userAndGroup'] = `${user?.realName}  ${group?.groupName}`
          }
        }

        it['statueName'] = this.$tool.matchData(workTaskType.get('workTaskType'), it, 'statue', 'label')
        it['statueColor'] = ''
        it['seTime'] = `${it.workStime} 至 ${it.workEtime}`
      }

      this.listLoading = false
      return { taskList, count }
    },
    async submitQuery(excelQuery) {
      const { taskList } = await this.initData(excelQuery)
      const excelTitle = [
        {
          title: '作业名称',
          dataIndex: 'name'
        },
        {
          title: '服务类型',
          dataIndex: 'serviceName'
        },
        {
          title: '计划时间',
          dataIndex: 'seTime'
        },
        {
          title: '运维人员',
          dataIndex: 'userAndGroup'
        },
        {
          title: '作业状态',
          dataIndex: 'statueName'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, taskList)
    },
    async onTabChange(item) {
      this.listQuery.page = 1
      this.listQuery.projectId = item.name
      const { taskList, count } = await this.initData()
      this.list = taskList
      this.listQuery.total = +count
    },
    async onPageChange() {
      const { taskList } = await this.initData()
      this.list = taskList
    },
    async onSearch() {
      this.listQuery.page = 1
      const { taskList, count } = await this.initData()
      this.list = taskList
      this.listQuery.total = +count
    },
    async findTabsData() {
      const { data, code } = await this.$request({ url: this.api.itAgentGroup.findHyitAgentGroup, data: { limit: -1 } })
      if (code !== 1) return
      this.tabs = data.map(it => ({ ...it, id: String(it.id) }))
      this.listQuery.projectId = data[0]['id']
      this.activeName = '' + data[0]['id']
    },
    async findOpsOrderWorkTask(query, userIds) {
      const { data, code, count } = await this.$request({ url: this.api.opm.findOpsOrderWorkTask, data: { ...this.listQuery, ...query, userIds } })
      if (code !== 1) return
      return { data, count }
    },
    async findOpsOrderProblemService(ids) {
      const { data, code } = await this.$request({ url: this.api.opm.findOpsOrderProblemService, data: { ids, limit: -1 } })
      if (code === 1) return data
    },
    async findSysUser(ids) {
      const { data, code } = await this.$request({
        url: this.api.knowledge.findSysUser,
        data: { ids, limit: -1, companyId: this.localStorageOperation('get', 'userInfo')['companyId'] }
      })
      if (code === 1) return data
    },
    async findHrUserGroup(ids) {
      const { data, code } = await this.$request({ url: this.api.sys.findHrUserGroup, data: { ids, limit: -1 } })
      if (code === 1) return data
    },
    async findOpsOrderProblemGroupMap(problemIds) {
      const { data, code } = await this.$request({ url: this.api.opm.findOpsOrderProblemGroupMap, data: { problemIds, limit: -1 } })
      if (code === 1) return data
    },
    async findOpsOrderProblem(ids) {
      const { data, code } = await this.$request({ url: this.api.opm.findOpsOrderProblem, data: { ids, limit: -1 } })
      if (code === 1) return data
    }
  }
}
</script>

<style>
</style>
