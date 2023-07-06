<template>
  <el-dialog title="选择用户" :visible="showDialog" @close="showDialog = false">
    <div class="app-container">
      <div class="filter-container">
        <el-input v-model="listQuery.keyword" placeholder="请输入用户名称" style="width: 200px;" class="filter-item" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onSearch">
          查询
        </el-button>
      </div>
      <div class="table-wrapper" :class="isRadio ? 'has-gutter' : ''">
        <el-table
          ref="table"
          :data="list"
          fit
          highlight-current-row
          style="width: 100%;"
          @select="handleSelect"
          @select-all="handleSelectAll"
        >
          <el-table-column type="selection" />
          <!-- <el-table-column label="ID" prop="userId" align="center" width="80" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.userId }}</span>
            </template>
          </el-table-column> -->
          <el-table-column label="序号" type="index" :index="computedTableIndex" width="80" />
          <el-table-column label="用户名称" align="center" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.realName || row.realname }}</span>
            </template>
          </el-table-column>
          <template v-if="options.api === '/admin/findWinxinUser'">
            <el-table-column label="邮箱" align="center" prop="email" show-overflow-tooltip />
            <el-table-column label="手机号" align="center" prop="mobile" show-overflow-tooltip />
          </template>
        </el-table>
      </div>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findUserList" />
    </div>
    <div slot="footer">
      <el-button type="default" @click="showDialog = false">取消</el-button>
      <el-button type="primary" @click="submit()">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import selectMixin from '@/mixins/el-table-select-mixin'
import pagination from '@/components/Pagination'

export default {
  name: 'UserListTable',
  components: {
    pagination
  },
  mixins: [selectMixin],
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      list: [],
      listTotal: 0,
      showDialog: false,
      options: {},
      isRadio: false,
      keyField: '', // 列表主键id
      listField: 'list',
      allList: []
    }
  },
  computed: {

  },
  methods: {
    open(options) {
      this.options = options
      this.isRadio = options.isRadio
      this.keyField = options.keyField
      this.allSelection = options.allSelection
      this.list = []
      this.showDialog = true
      this.findUserList()
    },
    computedTableIndex(index) {
      return Number((this.listQuery.page - 1) * this.listQuery.limit + index + 1)
    },
    async findUserList() {
      const roleIds = []

      const findSysRole = await this.$request({ url: this.api.sys.findSysRole, data: { classify: 'engineer', limit: -1 } })
      if (findSysRole.code !== 1 && !findSysRole.data && findSysRole.data.length === 0) return
      findSysRole.data.forEach(item => roleIds.push(item.roleId))

      const findSysUserRole = await this.$request({ url: this.api.sys.findSysUserRole, data: { roleIds: this.$tool.uniqueArray(roleIds).toString(), ...this.listQuery, limit: -1 } })
      if (findSysUserRole.code !== 1 && !findSysUserRole.data && findSysUserRole.data.length === 0) return
      this.userRole = findSysUserRole.data
      const userIds = []
      findSysUserRole.data.forEach(item => userIds.push(item.userId))

      const findSysUser = await this.findSysUser({
        ...this.listQuery, companyId: this.$auth.getUserSession().companyId, ids: this.$tool.uniqueArray(userIds).toString()
      })
      if (findSysUser && findSysUser.data.length > 0) {
        // this.allSelection = [...this.allSelection, ...findSysUser.data]
        this.list = findSysUser.data
        this.listTotal = +findSysUser.count
      }
      //   const { code, data, model, count } = await this.$request({
      //     url: this.api.opm.api,
      //     data: {
      //       companyId: this.$auth.getUserSession().companyId,
      //       page: this.listQuery.page,
      //       limit: this.options.pageChangeFindDataEvType === 'local' ? -1 : this.listQuery.limit
      //     }
      //   })
      //   if (code === 1) {
      // if (this.options.api === this.api.sys.findWinxinUser) {
      //   if (model) {
      //     const allList = [
      //       { userId: 'assignee', realName: '审核用户', realname: '审核用户', type: 'fixedUser' },
      //       { userId: 'approval', realName: '申请用户', realname: '申请用户', type: 'fixedUser' },
      //       { userId: 'createUserId', realName: '创建用户', realname: '创建用户', type: 'fixedUser' },
      //       { userId: 'workUserId', realName: '作业人员', realname: '作业人员', type: 'fixedUser' },
      //       ...JSON.parse(model)
      //     ]
      //     this.allList = allList
      //     this.list = this.allList.slice(0, 10)
      //     this.listTotal = +this.allList.length
      //   }
      // } else {
      //   this.list = data
      //   this.listTotal = +count
      // }
      //   }
      this.$nextTick(() => {
        this.initTable()
      })
    },
    async findSysUser(query) {
      const { code, data, count } = await this.$request({
        url: this.api.sys.findSysUser,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    onSearch() {
      this.pagination()
    },
    submit() {
      this.showDialog = false
      console.log(this.allSelection)
      this.$emit('submitSelect', this.allSelection)
    },
    async pagination() {
      this.listQuery.companyId = this.$auth.getUserSession().companyId
      if (this.options.pageChangeFindDataEvType === 'local') {
        let data = []
        if (this.listQuery.keyword) {
          data = this.allList.filter(el => el.realname.indexOf(this.listQuery.keyword) !== -1)
        } else {
          data = this.allList
        }
        this.list = data.slice((this.listQuery.page - 1) * this.listQuery.limit, this.listQuery.limit * (this.listQuery.page + 1))
        this.listTotal = data.length
      } else {
        const { code, data, model, count } = await this.$request({
          url: this.options.api,
          data: this.listQuery
        })
        if (code === 1) {
          if (this.options.api === this.api.sys.findWinxinUser) {
            if (model) {
              this.list = JSON.parse(model)
            }
          } else {
            this.list = data
          }
          this.listTotal = +count
        }
      }
      this.$nextTick(() => {
        this.initTable()
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
