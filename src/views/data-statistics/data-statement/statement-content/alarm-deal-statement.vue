<template>
  <div class="app-container">
    <div>
      <el-tabs v-model="activeName" @tab-click="onTabChange">
        <el-tab-pane v-for="item in tabs" :key="item.id" :label="item.name" :name="item.id" />
      </el-tabs>
    </div>

    <div class="filter-container">
      <el-select v-model="searchQuery.level" placeholder="请选择故障级别" clearable class="filter-item">
        <el-option v-for="item in levelList" :key="item.dictdataValue" :label="item.dictdataName" :value="item.dictdataValue" />
      </el-select>
      <el-select v-model="searchQuery.alarmType" placeholder="请选择故障类型" clearable class="filter-item">
        <el-option v-for="item in faultTypeList" :key="item.catId" :label="item.catName" :value="item.catId" />
      </el-select>
      <el-select v-model="searchQuery.userId" placeholder="请选择运维人员" clearable class="filter-item">
        <el-option v-for="item in userList" :key="item.userId" :label="item.realName" :value="item.userId" />
      </el-select>
      <el-date-picker v-model="searchQuery.current" type="date" class="filter-item" value-format="yyyy-MM-dd" placeholder="告警日期" format="yyyy 年 MM 月 dd 日" />
      <el-date-picker v-model="listQuery.responseTime" type="date" class="filter-item" value-format="yyyy-MM-dd" placeholder="响应时间" format="yyyy 年 MM 月 dd 日" />
      <el-select v-model="searchQuery.status" placeholder="请选择处理结果" clearable class="filter-item">
        <el-option v-for="item in statueList" :key="item.statue" :label="item.label" :value="item.statue" />
      </el-select>
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
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" show-overflow-tooltip prop="levelName" label="级别" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" show-overflow-tooltip prop="description" label="故障名称" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" show-overflow-tooltip prop="faultName" label="故障类型" />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" show-overflow-tooltip prop="realName" label="处理人员" />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" show-overflow-tooltip prop="clockTime" label="告警时间" />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" show-overflow-tooltip prop="responseTime" label="响应时间" />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" show-overflow-tooltip prop="statueName" label="处理结果" />
      </el-table>
    </div>
    <pagination v-show="listQuery.total > 0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="onPageChange" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import OutputExcel from '@/components/outputExcel'
import ListControl from '@/components/ListControl'
// import workTaskType from '@/params-model/opm/function'

export default {
  name: 'AlarmDealStatement',
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
      list: [],
      listLoading: false,
      userList: [],
      serviceList: [],
      statueList: [
        { statue: 1, label: '未确认' },
        { statue: 2, label: '已确认' },
        { statue: 3, label: '自动恢复' },
        { statue: 4, label: '处理中' },
        { statue: 5, label: '相同类型告警' }
      ],
      levelList: [],
      searchQuery: {},
      faultTypeList: [],
      // 显示控制数据 start
      checkList: ['级别', '故障名称', '故障类型', '处理人员', '告警时间', '响应时间', '处理结果'],
      lists: [],
      storageVal: 'fault-handling-report' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  async created() {
    await this.findTabsData()
    this.userList = await this.findSysUser()
    const { alarmLog, count } = await this.initData()
    this.list = alarmLog
    this.listQuery.total = +count
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async findHyitAgentGroupAuth() {
      const { data, code } = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroupAuth,
        data: { groupId: this.listQuery.projectId, limit: -1 }
      })
      if (code === 1) return data
    },
    async findSysUserRole(roleIds) {
      const { data, code } = await this.$request({
        url: this.api.sys.findSysUserRole,
        data: { roleIds, limit: -1 }
      })
      if (code === 1) return data
    },
    async findSysCat() {
      const { data, code } = await this.$request({
        url: this.api.sys.findSysCat,
        data: {
          page: 1,
          limit: -1,
          systemName: 'userDefine',
          classify: 'userDefine_故障类型',
          parentId: -1,
          module: 2
        }
      })
      if (code === 1) return data
    },
    async initData(query) {
      try {
        const groupAuth = await this.findHyitAgentGroupAuth()
        if (!groupAuth.length) throw new Error()
        const roleUserList = await this.findSysUserRole(groupAuth.map((it) => it.roleId).filter(Boolean))
        if (!roleUserList.length) throw new Error()
        let {data: problemList, count} = await this.findOpsOrderProblem(1, {userIds: roleUserList.map((it) => it.userId).filter(Boolean).toString(), ...query})
        if (!problemList.length) throw new Error()
        const { data: alarmLog } = await this.findZbxAlarmLog(problemList.map((it) => it.alarmId).filter(Boolean).toString())
        if (!alarmLog.length) throw new Error()

        this.levelList = await this.findAlarmLevel()
        this.faultTypeList = await this.findSysCat()
        const userList = await this.findSysUser(alarmLog.map((it) => it.userId).filter(Boolean).toString())

        for (const it of alarmLog) {
          it['levelName'] = this.$tool.matchData(this.levelList, it, 'alevel', 'dictdataName', 'dictdataValue')
          it['realName'] = this.$tool.matchData(userList, it, 'userId', 'realName')
          it['statueName'] = this.$tool.matchData(this.statueList, it, 'status', 'label', 'statue')
          it['faultName'] = this.$tool.matchData(this.faultTypeList, it, 'alarmType', 'catName', 'catId')
          it['clockTime'] = this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(it.clock * 1000))
          it['responseTime'] = this.$tool.matchData(this.problemList, it, 'alarmId', 'responseTime', 'id')
        }
        this.listLoading = false
        count = +count
        return { alarmLog, count }
      } catch (error) {
        console.error('error: ', error)
        this.listLoading = false
        return { alarmLog: [], count: 0 }
      }
    },
    // 获取告警级别
    async findAlarmLevel() {
      const { code, data } = await this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      })
      if (code === 1) return data
    },
    async findZbxAlarmLog(ids) {
      const { data, code, count } = await this.$request({
        url: this.api.opm.findZbxAlarmLog,
        data: { ids, limit: -1, ...this.searchQuery }
      })
      if (code === 1) return { data, count }
    },
    async submitQuery(excelQuery) {
      console.log('excelQuery: ', excelQuery)
      const { alarmLog } = await this.initData(excelQuery)
      const excelTitle = [
        {
          title: '级别',
          dataIndex: 'levelName'
        },
        {
          title: '故障名称',
          dataIndex: 'description'
        },
        {
          title: '故障类型',
          dataIndex: 'faultName'
        },
        {
          title: '处理人员',
          dataIndex: 'realName'
        },
        {
          title: '告警时间',
          dataIndex: 'clockTime'
        },
        {
          title: '响应时间',
          dataIndex: 'responseTime'
        },
        {
          title: '处理结果',
          dataIndex: 'statueName'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, alarmLog)
    },
    async onTabChange(item) {
      this.listQuery.page = 1
      this.listQuery.projectId = item.name
      const { alarmLog, count } = await this.initData()
      this.list = alarmLog
      this.listQuery.total = +count
    },
    async onPageChange() {
      const { alarmLog } = await this.initData()
      this.list = alarmLog
    },
    async onSearch() {
      this.listQuery.page = 1
      const { alarmLog, count } = await this.initData()
      this.list = alarmLog
      this.listQuery.total = +count
    },
    async findTabsData() {
      const { data, code } = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroup,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.tabs = data.map((it) => ({ ...it, id: String(it.id) }))
      this.listQuery.projectId = data[0]['id']
      this.activeName = '' + data[0]['id']
    },
    async findSysUser(ids) {
      const { data, code } = await this.$request({
        url: this.api.knowledge.findSysUser,
        data: {
          ids,
          limit: -1,
          companyId: this.localStorageOperation('get', 'userInfo')['companyId']
        }
      })
      if (code === 1) return data
    },
    async findHrUserGroup(ids) {
      const { data, code } = await this.$request({
        url: this.api.sys.findHrUserGroup,
        data: { ids, limit: -1 }
      })
      if (code === 1) return data
    },
    async findOpsOrderProblemGroupMap(problemIds) {
      const { data, code } = await this.$request({
        url: this.api.opm.findOpsOrderProblemGroupMap,
        data: { problemIds, limit: -1 }
      })
      if (code === 1) return data
    },
    async findOpsOrderProblem(isAlarm, query) {
      const { data, code, count} = await this.$request({
        url: this.api.opm.findOpsOrderProblem,
        data: { isAlarm, ...this.listQuery, ...query }
      })
      if (code === 1) return {data, count}
    }
  }
}
</script>

<style></style>
