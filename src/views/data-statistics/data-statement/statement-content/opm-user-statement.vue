<template>
  <div class="app-container">
    <ProjectTab @handleClick="handleClick" />
    <div class="filter-container">
      <el-date-picker
        v-model="dateValue"
        class="filter-item"
        type="month"
        placeholder="选择日期"
        value-format="yyyy-MM-dd HH:mm:ss"
      />
      <el-button class="filter-item" type="primary" @click="search">搜索</el-button>
      <OutputExcel ref="outputExcel" @submitQuery="submitQuery" />
      <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="statement"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" prop="hyKnowId" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="运维人员">
          <template slot-scope="{row}">{{ row.user }}</template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="工作日值班总小时数">
          <template slot-scope="{row}">{{ row.workDayTotalHours || 0 }}</template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="节假日值班总小时数">
          <template slot-scope="{row}">{{ row.holidayTotalHours || 0 }}</template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="请假总小时数">
          <template slot-scope="{row}">{{ row.leaveTotalHours || 0 }}</template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="加班总小时数">
          <template slot-scope="{row}">{{ row.overTimeTotalHours || 0 }}</template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="处理告警数量">
          <template slot-scope="{row}">{{ row.logCount || 0 }}</template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="generateStatement" />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ProjectTab from '../../components/data-statement/project-tab'
import OutputExcel from '@/components/outputExcel'
import ListControl from '@/components/ListControl'

export default {
  name: 'OpmUserStatement',
  components: {
    Pagination,
    ProjectTab,
    OutputExcel,
    ListControl
  },
  data() {
    return {
      activeName: '',
      listQuery: {
        page: 1,
        limit: 10
      },
      SEData: '',
      dateValue: '',
      statement: [],
      total: 0,
      // 显示控制数据 start
      checkList: ['运维人员', '工作日值班总小时数', '节假日值班总小时数', '请假总小时数', '加班总小时数', '处理告警数量'],
      lists: [],
      storageVal: 'personnel-report' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  mounted() {
    this.dateValue = this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(`${this.$tool.getFirstDay().text} 00:00:00`))
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    handleClick(val) {
      this.activeName = val.id
      this.generateStatement()
    },
    async generateStatement() {
      const data = await this.getDataSource()
      this.statement = data.data
      this.total = +data.count
    },
    /**
     * @description 获取主表数据
     * @param page 页码
     * @param limit 条数，全部则传-1
     */
    async getDataSource(page, limit) {
      const listQuery = { ...this.listQuery }
      if (limit === -1) {
        listQuery.page = 1
        listQuery.limit = -1
      } else {
        listQuery.page = page
        listQuery.limit = limit
      }

      const findHyitAgentGroupAuth = await this.findHyitAgentGroupAuth({ groupId: this.activeName })
      if (!findHyitAgentGroupAuth) return
      const roleIds = []
      findHyitAgentGroupAuth.forEach(item => roleIds.push(item.roleId))
      if (roleIds.length === 0) return
      const user = await this.findSysUserRole({ roleIds: roleIds.toString(), ...listQuery })
      if (user.code !== 1) return

      const userIds = []
      user.data.forEach(item => userIds.push(item.userId))
      if (userIds.length === 0) return

      let allUser = []
      const findSysUser = await this.$request({ url: this.api.sys.findSysUser, data: { ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, companyId: this.$auth.getUserSession().companyId } })
      if (findSysUser.code === 1 && findSysUser.data) allUser = findSysUser.data

      user.data.forEach((item, index) => {
        const getUserIdx = allUser.findIndex(items => +items.userId === +item.userId)
        if (getUserIdx !== -1) {
          this.$set(user.data[index], 'user', `${allUser[getUserIdx].realName} ${allUser[getUserIdx].tel}`)
        }
      })

      const getY = this.$tool.dateFormat('yyyy', new Date(this.dateValue))
      const getM = this.$tool.dateFormat('mm', new Date(this.dateValue))
      const dutyStartTime = `${this.$tool.getFirstDay(getY, getM).text} 00:00:00`
      const dutyEndTime = `${this.$tool.getLastDay(getY, getM).text} 23:59:59`

      const summary = await this.findHyitDutySummary({ userIds: userIds.toString(), dutyStartTime, dutyEndTime })
      if (!summary) return
      const summaryData = JSON.parse(summary)
      user.data.forEach((item, index) => {
        const summaryDataIdx = summaryData.findIndex(items => +items.userId === +item.userId)
        if (summaryDataIdx !== -1) {
          this.$set(user.data[index], 'workDayTotalHours', summaryData[summaryDataIdx].workDayTotalHours || 0)
          this.$set(user.data[index], 'holidayTotalHours', summaryData[summaryDataIdx].holidayTotalHours || 0)
          this.$set(user.data[index], 'leaveTotalHours', summaryData[summaryDataIdx].leaveTotalHours || 0)
          this.$set(user.data[index], 'overTimeTotalHours', summaryData[summaryDataIdx].overTimeTotalHours || 0)
          this.$set(user.data[index], 'logCount', summaryData[summaryDataIdx].logCount || 0)
        }
      })

      return user
    },
    async findHyitAgentGroupAuth(query) {
      const { code, data } = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroupAuth,
        data: query
      })
      if (code !== 1) return
      return data
    },
    async findSysUserRole(query) {
      return await this.$request({
        url: this.api.sys.findSysUserRole,
        data: query
      })
    },
    async findHyitDutySummary(query) {
      const { code, model } = await this.$request({
        url: this.api.opm.findHyitDutySummary,
        data: query
      })
      if (code !== 1) return
      return model
    },
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.generateStatement()
    },
    // 导出
    async submitQuery(excelQuery) {
      const data = await this.getDataSource(excelQuery.page, excelQuery.limit)
      const excelTitle = [
        {
          title: '运维人员',
          dataIndex: 'user'
        },
        {
          title: '工作日总小时数',
          dataIndex: 'workDayTotalHours'
        },
        {
          title: '节假日值班总小时数',
          dataIndex: 'holidayTotalHours'
        },
        {
          title: '请假总小时数',
          dataIndex: 'leaveTotalHours'
        },
        {
          title: '加班总小时数',
          dataIndex: 'overTimeTotalHours'
        },
        {
          title: '处理告警数量',
          dataIndex: 'logCount'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data.data)
    }
  }
}
</script>

<style scoped>

</style>
