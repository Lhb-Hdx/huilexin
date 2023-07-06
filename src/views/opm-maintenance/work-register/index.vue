<template>
  <div class="work-register">
    <div class="siderWrapper">
      <div class="name">运维工程师</div>
      <div class="all" :class="chosenAll ? 'chosenAll' : ''" @click="findAllWorkRecord">全部</div>
      <div v-for="(item, index) in userList" :key="index" class="usersItem" :class="chosenIndex === index ? 'chosen' : ''" @click="findWorkRecord(index)">
        <span>{{ item.realName }}</span>
      </div>
    </div>
    <div class="main-content">
      <div class="top-btn">
        <el-button type="primary" class="successBtn" @click="addWorkRecord">工作登记</el-button>
        <div class="val">
          <ListControl :check-list="checkList" @setLists="setLists" />
        </div>
        <!-- <el-button disabled>批量导出</el-button> -->
        <!-- <ExportExcel  button-title="批量导出" :fillter-list="fillerList" :excel-title="ExcelTitle" :file-name="exportFileName" /> -->
      </div>
      <div class="table-wrapper">
        <el-table v-loading="loading" :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" prop="name" label="标题" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" prop="classify" label="类型" show-overflow-tooltip>
            <template slot-scope="{ row }">
              {{ setClassifyName(row.classify) }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" prop="userId" label="登记人" show-overflow-tooltip>
            <template slot-scope="{ row }">
              {{ setUserName(row.userId) }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" prop="createTime" label="时间" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="共享给..." show-overflow-tooltip>
            <template slot-scope="{ row }">
              <!-- {{ setOfferUserName(row.offerUserIds) }} -->
              {{ setofferUserName(row.offerUserIds) }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="操作" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <el-button type="primary" size="mini" @click="goUpdateRegister(row)">修改</el-button>
              <el-button type="primary" size="mini" @click="goSeeRegister(row)">查看</el-button>
              <el-button type="danger" size="mini" @click="deleteWorkReport(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="tableCount > 0" :auto-scroll="false" :total="tableCount" :page.sync="recordListQuery.page" :limit.sync="recordListQuery.limit" @pagination="findOpsOrderWorkRecords" />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'
// import ExportExcel from '@/components/ExportExcel/export-excel.vue'
export default {
  components: {
    Pagination,
    ListControl
    // ExportExcel
  },
  data() {
    return {
      loading: false,
      tableData: [],
      tableCount: 0,
      listQuery: {
        page: 1,
        limit: -1
      },
      classifyOptions: [
        {
          value: 'day',
          label: '工作日报'
        },
        {
          value: 'week',
          label: '工作周报'
        },
        {
          value: 'month',
          label: '工作月报'
        },
        {
          value: 'season',
          label: '季度报告'
        },
        {
          value: 'year',
          label: '年度报告'
        }
      ],
      ExcelTitle: [
        {
          title: 'IP地址',
          dataIndex: 'ip'
        },
        {
          title: '设备类型',
          dataIndex: 'deviceType'
        },
        {
          title: '设备名称',
          dataIndex: 'deviceName'
        },
        {
          title: '端口',
          dataIndex: 'port'
        },
        {
          title: 'MAC',
          dataIndex: 'mac'
        },
        {
          title: '关联方式',
          dataIndex: 'bindType'
        },
        {
          title: '连接状态',
          dataIndex: 'pingStatue'
        },
        {
          title: '使用状态',
          dataIndex: 'useStatue'
        }
      ],
      exportFileName: '工作汇报',
      recordListQuery: {
        page: 1,
        limit: 10
      },
      chosenIndex: '',
      chosenAll: false,
      userList: [],
      workRecordSumitUser: [],
      offerUserList: [],
      fillerList: [], // 导出文件数据
      // 显示控制数据 start
      checkList: ['标题', '类型', '登记人', '时间', '共享给...', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setUserName() {
      return function(userId) {
        const idx = this.workRecordSumitUser.findIndex(item => Number(item.userId) === Number(userId))
        if (idx !== -1) {
          return this.workRecordSumitUser[idx].realName
        }
      }
    },
    setClassifyName() {
      return function(classify) {
        const idx = this.classifyOptions.findIndex(item => item.value === classify)
        if (idx !== -1) {
          return this.classifyOptions[idx].label
        }
      }
    },
    setofferUserName() {
      return function(offerUserIds) {
        console.log(offerUserIds)
        if (offerUserIds.length <= 0) return
        let resultStr = ''
        offerUserIds.forEach(item => {
          const idx = this.offerUserList.findIndex(v => Number(v.userId) === Number(item))
          if (idx !== -1) {
            resultStr += `${resultStr ? '、' : ''}` + this.offerUserList[idx].realName
          }
        })
        return resultStr
      }
    }
  },
  async mounted() {
    // this.findOpsOrderWorkRecords()
    this.initSlideUserList()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async initSlideUserList() {
      // 找工程师用户
      const roleIds = []
      const findSysRole = await this.$request({ url: this.api.sys.findSysRole, data: { classify: 'engineer', limit: -1 } })
      if (findSysRole.code !== 1 && !findSysRole.data && findSysRole.data.length === 0) return
      findSysRole.data.forEach(item => roleIds.push(item.roleId))
      const findSysUserRole = await this.$request({ url: this.api.sys.findSysUserRole, data: { roleIds: this.$tool.uniqueArray(roleIds).toString(), ...this.listQuery } })
      if (findSysUserRole.code !== 1 && !findSysUserRole.data && findSysUserRole.data.length === 0) return
      this.userRole = findSysUserRole.data
      const userIds = []
      findSysUserRole.data.forEach(item => userIds.push(item.userId))

      const findSysUser = await this.findSysUser({
        ...this.findSysUserQuery,
        companyId: this.$auth.getUserSession().companyId,
        ids: this.$tool.uniqueArray(userIds).toString()
      })
      if (findSysUser && findSysUser.data.length > 0) {
        this.userList = findSysUser.data
        this.chosenIndex = ''
        this.chosenAll = true
        this.findOpsOrderWorkRecords()
      }
    },
    async findOpsOrderWorkRecords() {
      let userIds = []
      if (this.chosenAll && this.userList.length > 0) {
        // userIds = this.userList.forEach(item => userIds.push(item.userId))
        // console.log(userIds)
        // console.log(this.userList)
      } else {
        userIds = this.userList[this.chosenIndex].userId
      }
      this.loading = true
      const { data, code, count } = await this.$request({ url: this.api.opm.findOpsOrderWorkRecords, data: { userIds: userIds, ...this.recordListQuery } })
      let reportIds = []
      let ids = []

      if (code !== -1) {
        if (data.length > 0) {
          data.forEach(item => {
            reportIds.push(item.reportId)
            ids.push(item.userId)
            item.offerUserIds = []
          })
          // 查找分享的用户id
          const shareUsers = await this.findOpsOrderWorkRecordsUserMap(reportIds)
          if (shareUsers && shareUsers.data.length > 0) {
            const userIds = []
            shareUsers.data.forEach(item => {
              userIds.push(item.userId)
              const idx = data.findIndex(v => item.reportId === v.reportId)
              if (idx !== -1) {
                data[idx].offerUserIds.push(item.userId)
              }
            })
            // 分享者用户信息列表
            const offerUserList = await this.findSysUser({ ids: this.$tool.uniqueArray(userIds), companyId: this.$auth.getUserSession().companyId })
            if (offerUserList) {
              this.offerUserList = offerUserList.data
              console.log(this.offerUserList)
            }
          }
          // 查找登记人
          const workRecordSumitUser = await this.findSysUser({ ids: this.$tool.uniqueArray(ids), companyId: this.$auth.getUserSession().companyId })
          if (workRecordSumitUser) {
            this.workRecordSumitUser = workRecordSumitUser.data
            console.log(this.workRecordSumitUser)
          }
          console.log(data, 'zheshidata')
          this.loading = false
          this.tableData = data
          this.tableCount = Number(count)
          // this.fillerList = this.tableData
        } else {
          this.loading = false
          this.tableData = data
          this.tableCount = Number(count)
        }
      }
    },
    // 获取用户信息
    async findSysUser(query) {
      const { code, data, count } = await this.$request({
        url: this.api.sys.findSysUser,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    async findOpsOrderWorkRecordsUserMap(reportIds) {
      return await this.$request({ url: this.api.opm.findOpsOrderWorkRecordsUserMap, data: { reportIds } })
    },
    findWorkRecord(index) {
      this.chosenIndex = index
      this.chosenAll = false
      this.findOpsOrderWorkRecords()
    },
    findAllWorkRecord() {
      this.chosenIndex = ''
      this.chosenAll = true
      this.findOpsOrderWorkRecords()
    },
    addWorkRecord() {
      if (this.$auth.getVuexStoragePermissionByAll('CreateRegister') !== -1) {
        this.$router.push({ name: 'CreateRegister' })
      } else {
        this.$message({ type: 'error', message: '请联系管理员授权' })
      }
    },
    // 跳转修改
    goUpdateRegister(row) {
      // 不是提交人也不在分享用户里面就返回
      console.log(row.offerUserIds)
      console.log(row.userId)
      console.log(this.$auth.getUserSession().userId)
      // 判断登录用户是否是提交人
      if (Number(row.userId) !== Number(this.$auth.getUserSession().userId)) {
        const idx = row.offerUserIds.findIndex(item => Number(item) === Number(this.$auth.getUserSession().userId))
        console.log(idx)
        if (idx === -1) {
          this.$message({ type: 'error', message: '你没有权限访问' })
          return
        }
      }
      // 判断路由授权
      if (this.$auth.getVuexStoragePermissionByAll('UpdateRegister') !== -1) {
        this.$router.push({ name: 'UpdateRegister', query: { reportId: row.reportId } })
      } else {
        this.$message({ type: 'error', message: '请联系管理员授权' })
      }
    },
    // 跳转查看
    goSeeRegister(row) {
      if (Number(row.userId) !== Number(this.$auth.getUserSession().userId)) {
        const idx = row.offerUserIds.findIndex(item => Number(item) === Number(this.$auth.getUserSession().userId))
        if (idx === -1) {
          this.$message({ type: 'error', message: '你没有权限访问' })
          return
        }
      }
      console.log(this.$auth.getVuexStoragePermissionByAll('SeeRegister'))
      if (this.$auth.getVuexStoragePermissionByAll('SeeRegister') !== -1) {
        this.$router.push({ name: 'SeeRegister', query: { reportId: row.reportId } })
      } else {
        console.log('honoda')
        this.$message({ type: 'error', message: '暂无权限跳转，请联系管理员授权' })
      }
    },
    handleSelectionChange(val) {
      console.log(val, 'va;')
    },
    deleteWorkReport(item) {
      this.$confirm('确认删除此汇报记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (Number(item.userId) !== Number(this.$auth.getUserSession().userId)) {
          this.$message({ type: 'error', message: '你没有权限删除' })
        }
        const { code } = await this.$request({ url: this.api.opm.deleteOpsOrderWorkRecords, data: { reportId: item.reportId } })
        if (code !== 1) return this.$message({ type: 'error', message: '删除失败' })
        this.findOpsOrderWorkRecords()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.work-register {
  display: flex;
  height: 100%;
  width: 100%;
  .siderWrapper {
    overflow: scroll;
    width: 240px;
    background-color: #e5ecf6;
    min-height: 100%;
    margin-right: 12px;
    .name {
      font-size: 18px;
      font-weight: bold;
      padding: 8px 10px;
    }
    .all {
      font-size: 15px;
      font-weight: bold;
      padding: 8px 10px;
      transition: all 0.3s;
      &:hover {
        background-color: rgb(207, 219, 246);
      }
    }
    .chosenAll {
      background-color: rgb(207, 219, 246);
    }
    .usersItem {
      font-size: 15px;
      padding: 8px 10px;
      transition: all 0.3s;
      &:hover {
        background-color: rgb(207, 219, 246);
      }
    }
    .chosen {
      background-color: rgb(207, 219, 246);
    }
  }
  .main-content {
    flex: 1;
    .top-btn {
      display: flex;
      padding: 8px 0;
      .successBtn {
        margin: 0 10px 0 0;
      }
    }
  }
}
.val {
  position: absolute;
  right: 10px;
}
</style>
