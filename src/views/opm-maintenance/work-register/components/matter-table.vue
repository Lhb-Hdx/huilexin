<template>
  <div class="matter-table">
    <el-table v-loading="loading" :data="tableData">
      <el-table-column label="编号" type="index" width="auto" min-width="10%" />
      <el-table-column prop="name" show-overflow-tooltip width="auto" min-width="19%" label="事项名称" />
      <el-table-column prop="userId" label="请求部门及提交人" width="auto" min-width="25%" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <div>{{ getOrgInfo(row.userId) }} {{ ` / ` }} {{ getUserInfo(row.userId) }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="提交时间" width="auto" min-width="20%" show-overflow-tooltip />
      <el-table-column label="状态" width="auto" min-width="10%" show-overflow-tooltip>
        <template slot-scope="{ row }">
          {{ row.statue === null ? '待处理' : setMatterStatue(row.processState) }}
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-show="tableCount > 0" :auto-scroll="false" :total.sync="tableCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="initTroubleLog" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'MatterTable',
  components: {
    Pagination
  },
  props: {},
  data() {
    return {
      matterStatue: [
        { processState: 1, value: '处理中', color: 'warning', colorCode: '#E6A23C' },
        { processState: 2, value: '处理成功', color: 'success', colorCode: '#67C23A' },
        { processState: 3, value: '处理失败', color: 'danger', colorCode: '#F56C6C' }
      ],
      listQuery: {
        page: 1,
        limit: 10
      },
      userList: [],
      HrUserInfoList: [],
      orgList: [],
      loading: false,
      tableCount: 0,
      tableData: [],
      groupIds: [],
      processState: '',
      sTime: '',
      eTime: ''
    }
  },
  computed: {
    setMatterStatue() {
      return function(processState) {
        const idx = this.matterStatue.findIndex(item => item.processState === processState)
        if (idx !== -1) {
          return this.matterStatue[idx].value
        } else {
          return '未处理'
        }
      }
    },
    getUserInfo() {
      return function(userId) {
        const idx = this.userList.findIndex(item => Number(item.userId) === Number(userId))
        if (idx !== -1) {
          return this.userList[idx].realName
        }
      }
    },
    getOrgInfo() {
      return function(userId) {
        const idx = this.HrUserInfoList.findIndex(item => Number(item.userId) === Number(userId))
        console.log(idx)
        if (idx !== -1) {
          const orgIdx = this.orgList.findIndex(item => Number(item.hyOrgId) === Number(this.HrUserInfoList[idx].organizationCatId))
          console.log(orgIdx)
          console.log(this.orgList)
          console.log(this.HrUserInfoList[idx].organizationCatId)

          if (orgIdx !== -1) {
            return this.orgList[orgIdx].hyOrgName
          }
        }
      }
    }
  },
  watch: {},
  mounted() {},
  methods: {
    async initTroubleLog(val) {
      console.log(val, 'val')
      this.processState = val.processState
      this.sTime = val.sTime
      this.eTime = val.eTime
      // console.log(query, 'qeru')
      // this.alarmLogQuery.startCLock = query?.startCLock
      // await this.loadAlarmLevel()
      // await this.findZbxAlarmLog(val)
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
      // 用分组ids查事项列表
      if (this.groupIds.length > 0) {
        const findOpsOrderProblem = await this.findOpsOrderProblem({
          groupIds: this.$tool.uniqueArray(this.groupIds).toString(),
          ...this.listQuery,
          processState: this.processState,
          sTime: this.sTime,
          eTime: this.eTime
        })
        if (findOpsOrderProblem.data && findOpsOrderProblem.data.length > 0) {
          //  this.tableData = findOpsOrderProblem.map.problemc
          const userIds = []
          const orgIds = []
          findOpsOrderProblem.data.forEach(item => userIds.push(item.userId))

          if (userIds.length > 0) {
            const findSysUser = await this.findSysUser({
              ids: this.$tool.uniqueArray(userIds).toString(),
              companyId: this.$auth.getUserSession().companyId,
              limit: -1
            })
            if (findSysUser && findSysUser.data && findSysUser.data.length > 0) {
              this.userList = findSysUser.data
              const findHrUserInfo = await this.findHrUserInfo({
                ids: this.$tool.uniqueArray(userIds).toString(),
                companyId: this.$auth.getUserSession().companyId,
                limit: -1
              })

              if (findHrUserInfo && findHrUserInfo.data && findHrUserInfo.data.length > 0) {
                this.HrUserInfoList = findHrUserInfo.data
                findHrUserInfo.data.forEach(item => {
                  if (item.organizationCatId) orgIds.push(item.organizationCatId)
                })
              }
            }

            if (orgIds.length > 0) {
              const findHyitOrg = await this.findHyitOrg({
                ids: this.$tool.uniqueArray(orgIds).toString(),
                limit: -1
              })
              if (findHyitOrg && findHyitOrg.data && findHyitOrg.data.length > 0) {
                this.orgList = findHyitOrg.data

                console.log(this.orgList)
                console.log(findHyitOrg.data)
              }
            }
          }
          this.tableData = findOpsOrderProblem.data
          this.tableCount = +findOpsOrderProblem.count
        }
      }
    },
    // 用户关联人员分组
    async findHrUserGroupMap(query) {
      const { code, data, count } = await this.$request({
        url: this.api.sys.findHrUserGroupMap,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询人员
    async findHrUserInfo(query) {
      let { code, data, count } = await this.$request({
        url: this.api.hr.findHrUserInfo,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询事项
    async findOpsOrderProblem(query) {
      this.loading = true
      let { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblem,
        data: query
      })
      this.loading = false
      if (code !== 1) return
      return { data, count }
    },
    // 查询部门
    async findHyitOrg(query) {
      const { code, data, count } = await this.$request({
        url: this.api.org.findHyitOrg,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询用户
    async findSysUser(query) {
      let { code, data, count } = await this.$request({
        url: this.api.sys.findSysUser,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    getPagingTableData() {
      console.log('111')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
