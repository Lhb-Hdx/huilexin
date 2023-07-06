<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button v-permission="['create']" class="mr-10" type="primary" icon="el-icon-plus" @click="handleAdd()">新增</el-button>

      <el-form ref="form" v-permission="['search']" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-input v-model="listQuery.hySendMail" placeholder="请输入名称" clearable @change="handleSearch" />
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
        <el-table-column label="序号" type="index" align="center" width="55" />
        <el-table-column label="发送账号" prop="hySendMail" show-overflow-tooltip align="center" />
        <el-table-column label="发送密码" prop="hySendPass" show-overflow-tooltip align="center" />
        <el-table-column label="发送服务器" prop="hySendServer" show-overflow-tooltip align="center" />
        <el-table-column label="发送端口" prop="hySendPort" show-overflow-tooltip align="center" />
        <el-table-column label="加密类型" prop="hyPassType" show-overflow-tooltip align="center" />
        <el-table-column label="失败数量" prop="hyFailNum" show-overflow-tooltip align="center" />
        <el-table-column label="发送成功数量" prop="hySuccessNum" show-overflow-tooltip align="center" />
        <el-table-column label="发送邮件的优先级" width="160" prop="hyPriority" show-overflow-tooltip align="center" />
        <el-table-column label="禁用/启用" prop="hyStatus">
          <template slot-scope="{row}">
            <el-switch v-permission="['status']" :value="!!row.hyStatus" @change="hyStatusChange($event,row)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="200px">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row.hyId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findComSendMailNo" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
export default {
  components: {
    Pagination
  },
  data() {
    return {
      listQuery: {
        hySendMail: '',
        // count: 1,
        page: 1,
        limit: 10
      },
      listCount: 1,
      tableData: []
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    this.findComSendMailNo()
  },
  methods: {
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findComSendMailNo()
    },
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddSendEmail' })
    },
    handleEdit(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'EditSendEmail', query: { hyId: row.hyId }})
    },
    handleDelete(hyId) {
      console.log('@删除的表单ID：', hyId)
      this.$confirm('确认删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.linkageManage.deleteComSendMailNo,
          data: { hyId }
        }).then(({ code }) => {
          if (code !== 1) return
          this.$message.success('删除成功')
          this.findComSendMailNo()
        }, () => {
          this.$message.error('删除失败')
        })
      }).catch(() => {})
    },
    async hyStatusChange(flag, row) {
      row.hyStatus = flag
      let { code } = await request({
        url: api.linkageManage.updateComSendMailNo,
        data: { ...row, hyStatus: +row.hyStatus }
      })
      this.$message({
        message: code === 1 ? '修改成功' : '修改失败',
        type: code === 1 ? 'success' : 'error'
      })
      this.$nextTick(() => {
        this.findComSendMailNo()
      })
    },
    async findComSendMailNo() {
      let { data, code, ...res } = await request({
        url: api.linkageManage.findComSendMailNo,
        data: this.listQuery
      })
      if (code !== 1) return
      this.tableData = data
      this.listCount = Number(res.count)
      // this.$set(this.listQuery, 'count', +res.count)
    }
  }
}
</script>

<style scoped>
.el-form-item {
    margin-bottom: 0;
}
</style>
