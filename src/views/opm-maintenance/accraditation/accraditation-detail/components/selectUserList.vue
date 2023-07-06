<template>
  <el-dialog title="选择人员" :visible.sync="showUserDialog" width="80%" top="5vh">
    <div class="dialog-body">
      <div class="app-container">
        <div class="filter-container">
          <el-input v-model="listQuery.keyword" placeholder="请输入用户名称" style="width: 200px" class="filter-item" clearable @keyup.enter.native="handleFilter" />
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
        </div>
        <div class="table-wrapper">
          <el-table ref="table" :data="userList">
            <el-table-column label="" align="center" prop="projectId" width="100">
              <template slot-scope="{ row }">
                <el-radio v-model="radio" :label="row.userId">{{ '' }}</el-radio>
              </template>
            </el-table-column>
            <el-table-column label="NO" prop="id" type="index" width="80" />
            <el-table-column label="用户名" prop="userName" show-overflow-tooltip />
            <el-table-column label="用户姓名" prop="realName" show-overflow-tooltip />
            <el-table-column label="用户角色" prop="roleName" align="center" show-overflow-tooltip />
          </el-table>
          <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="loadUserList" />
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showUserDialog = false">取 消</el-button>
      <el-button class="filter-item" type="primary" @click="comfirmUser">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'SelectUserList',
  components: {
    Pagination
  },
  data() {
    return {
      userList: [],
      listQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      total: 0,
      limit: 10,
      page: 1,
      ideField: 'userId',
      allSelection: [],
      radio: '',
      showUserDialog: false,
      roleData: [],
      userRole: [],
      matter: {}
    }
  },
  computed: {
    setRoleName() {
      const that = this
      return function (userId) {
        const userRoleIdx = that.userRole.findIndex(item => +item.userId === +userId)
        if (userRoleIdx === -1) return
        const roleDataIdx = that.roleData.findIndex(item => +item.roleId === that.userRole[userRoleIdx].roleId)
        if (roleDataIdx === -1) return
        return this.roleData[roleDataIdx].roleName
      }
    }
  },
  methods: {
    open(matter) {
      this.matter = matter
      this.showUserDialog = true
      this.$set(this.listQuery, 'keyword', '')
      this.$set(this.listQuery, 'page', 1)
      this.$set(this.listQuery, 'limit', 10)
      this.loadUserList()
    },
    async getOpsOrderProblemService(query) {
      const { code, model } = await this.$request({ url: this.api.opm.getOpsOrderProblemService, data: query })
      if (code !== 1) return
      return model
    },
    async findOpsOrderProblemGroupMap(problemIds) {
      const { data, code } = await this.$request({ url: this.api.opm.findOpsOrderProblemGroupMap, data: { problemIds, limit: -1 } })
      if (code === 1) return data
    },
    async findHrUserGroupMap(query) {
      const { code, data, count } = await this.$request({ url: this.api.sys.findHrUserGroupMap, data: query })
      if (code !== 1) return
      return { code, data, count }
    },
    async findSysUserRole(query) {
      const { code, data } = await this.$request({ url: this.api.sys.findSysUserRole, data: query })
      if (code !== 1) return
      return data
    },
    async findSysRole(query) {
      const { code, data } = await this.$request({ url: this.api.sys.findSysRole, data: query })
      if (code !== 1) return
      return data
    },
    async loadUserList() {
      let userIds = []
      // const getOpsOrderProblemService = await this.getOpsOrderProblemService({ serviceId: this.matter.serviceType })
      const getOpsOrderProblemService = await this.findOpsOrderProblemGroupMap(this.matter.id)
      if (getOpsOrderProblemService.length) {
        const findHrUserGroupMap = await this.findHrUserGroupMap({ ...this.listQuery, groupId: getOpsOrderProblemService[0].groupId })
        if (findHrUserGroupMap.code !== 1) return
        findHrUserGroupMap.data.forEach(item => {
          userIds.push(item.userId)
        })
        const findSysUser = await this.$request({ url: this.api.sys.findSysUser, data: { ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, keyword: this.listQuery.keyword } })
        const findSysUserRole = await this.findSysUserRole({ userIds: this.$tool.uniqueArray(userIds).toString(), limit: -1 })

        const roleIds = []
        let role = []
        if (findSysUserRole) {
          findSysUserRole.forEach(item => {
            roleIds.push(item.roleId)
          })
          const findSysRole = await this.findSysRole({ ids: this.$tool.uniqueArray(roleIds).toString() })
          if (findSysUserRole) role = findSysRole
        }

        const userList = findSysUser.data
        if (roleIds.length > 0) {
          userList.forEach(item => {
            const userRoles = findSysUserRole.filter(el => +el.userId === +item.userId)
            if (userRoles.length > 0) {
              let currentUserRole = []
              userRoles.forEach(userRoleItem => {
                currentUserRole = role.filter(el => +el.roleId === +userRoleItem.roleId)
              })
              if (currentUserRole.length > 0) {
                const roleName = []
                currentUserRole.forEach(currentUserRoleItem => roleName.push(currentUserRoleItem.roleName))
                item.roleName = roleName.toString()
                console.log(roleName)
              }
            }
          })
        }

        this.userList = userList
        console.log(userList)
        this.total = +findHrUserGroupMap.count
        this.$nextTick(() => {
          this.initTableSelection()
        })
      }
    },
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.loadUserList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map(it => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map(item => JSON.parse(item))
      this.allSelection = setPagingSelection
    },
    handleSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1
      if (!selected) {
        this.allSelection = this.allSelection.filter(it => it[this.ideField] !== row[this.ideField])
      }
    },
    initTableSelection() {
      this.$nextTick(() => {
        for (let i = 0; i < this.userList.length; i++) {
          const tableEle = this.userList[i]
          for (let j = 0; j < this.allSelection.length; j++) {
            const ele = this.allSelection[j]
            if (tableEle[this.ideField] === ele[this.ideField]) {
              this.$refs['table'].toggleRowSelection(tableEle, true)
            }
          }
        }
      })
    },
    comfirmUser() {
      this.$emit('selectUser', this.radio)
      console.log(this.radio)
      this.showUserDialog = false
    }
  }
}
</script>

<style scoped>
</style>
