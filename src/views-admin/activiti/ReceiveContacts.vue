<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button v-permission="['create']" type="primary" icon="el-icon-plus" class="mr-10" @click="handleAdd()">新增</el-button>
      <el-form ref="form" v-permission="['search']" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-input v-model="listQuery.hyRealName" placeholder="请输入姓名" clearable @change="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="55"
        />
        <el-table-column label="姓名" prop="hyRealName" align="center" show-overflow-tooltip />
        <el-table-column label="关联用户姓名" prop="hyUserId" align="center" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ $tool.matchData(users,row,'hyUserId','userName','userId') }}
          </template>
        </el-table-column>
        <el-table-column label="邮箱" prop="hyEmail" align="center" show-overflow-tooltip />
        <el-table-column label="联系手机" prop="hyMobile" align="center" show-overflow-tooltip />
        <el-table-column label="关联的微信号" prop="hyWechat" align="center" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="hyCtime" align="center" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="300px">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="handleEdit(row.hyBookId)">编辑</el-button>
            <el-button v-permission="['bind']" type="primary" size="mini" @click="handleBind(row)">微信账号关联</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row.hyBookId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount> 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitBook" />
    <RelationWx ref="RelationWx" @updateList="findHyitBook(),findWeixinbook()" />
  </div>
</template>

<script>
import RelationWx from '@/views-admin/activiti/components/relationWx'
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
export default {
  name: 'ReceiveContacts',
  components: {
    RelationWx,
    Pagination
  },
  data() {
    return {
      listQuery: {
        hyRealName: '',
        // count: 1,
        page: 1,
        limit: 10
      },
      listCount: 0,
      bookid: '',
      nickname: '',
      tableData: [],
      users: [],
      wxBooks: []
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    this.findHyitBook()
    this.findSysUser()
    this.findWeixinbook()
  },
  methods: {
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findHyitBook()
    },
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddReceiveContacts' })
    },
    handleEdit(hyBookId) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'EditReceiveContacts', query: { hyBookId }})
    },
    handleBind({ hyBookId, hyWechat }) {
      this.$refs.RelationWx.open(hyBookId, hyWechat)
    },
    async handleDelete(hyBookId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.linkageManage.deleteHyitBook,
          data: { hyBookId }
        }).then(async({ code }) => {
          await this.findWeixinbook()
          let wx = this.wxBooks.find(it => it.bookid === hyBookId)
          await request({ url: api.linkageManage.updateWeixinbook, data: { ...wx, bookid: 0, ctime: '' }}).then((res) => {})

          this.$message.success('删除成功')
          this.$nextTick(() => {
            this.findHyitBook()
          })
        }, () => {
          this.$message.error('删除失败')
        })
      })
    },
    async findHyitBook() {
      let { data, code, count } = await request({
        url: api.linkageManage.findHyitBook,
        data: this.listQuery
      })
      if (code !== 1) return
      // this.$set(this.listQuery, 'count', +count)
      this.listCount = Number(count)
      this.tableData = data
    },
    async findSysUser() {
      let { data, code } = await request({
        url: api.sys.findSysUser,
        data: { limit: -1, companyId: this.$auth.getUserSession().companyId }
      })
      if (code !== 1) return
      this.users = data
    },
    async findWeixinbook() {
      let { data, code } = await request({
        url: api.linkageManage.findWeixinbook, data: { limit: -1 }
      })
      if (code !== 1) return
      this.wxBooks = data
    }
  }
}
</script>

<style scoped>
.el-form-item {
    margin-bottom: 0;
}
</style>
