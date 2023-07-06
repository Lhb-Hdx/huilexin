<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button v-permission="['create']" class="mr-10" type="primary" icon="el-icon-plus" @click="handleAdd()">新增</el-button>
      <el-form ref="form" v-permission="['search']" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-input v-model="listQuery.configName" placeholder="请输入应用名称" clearable @change="handleSearch" />
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
        <el-table-column label="应用名称" prop="configName" show-overflow-tooltip align="center" />
        <el-table-column label="AppId" prop="applicationId" show-overflow-tooltip align="center" />
        <el-table-column label="AppSecret" prop="appsecret" show-overflow-tooltip align="center" />
        <el-table-column label="成功数量" prop="successNum" show-overflow-tooltip align="center" />
        <el-table-column label="失败数量" prop="failNum" show-overflow-tooltip align="center" />
        <el-table-column label="状态" prop="status" show-overflow-tooltip align="center">
          <template slot-scope="{row}">
            <el-switch v-permission="['status']" :value="!!row.status" @change="hyStatusChange($event,row)" />
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="200px" label="操作">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row.configId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findWeixinConfig" />
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
        configName: '',
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
    this.findWeixinConfig()
  },
  methods: {
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findWeixinConfig()
    },
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddSendPublic' })
    },
    handleEdit(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      console.log(this.$route.name)
      console.log(row)
      this.$router.push({ name: 'EditSendPublic', query: { configId: row.configId }})
    },
    handleDelete(configId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await request({
          url: api.linkageManage.deleteWeixinConfig,
          data: { configId }
        })
        if (code !== 1) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.findWeixinConfig()
        })
      })
    },
    async hyStatusChange(flag, row) {
      console.log(flag, 'flag')
      console.log(row, 'row')
      row.status = flag
      let { code } = await request({
        url: api.linkageManage.updateWeixinConfig,
        data: { ...row, status: +row.status }
      })
      this.$message({
        message: code === 1 ? '修改成功' : '修改失败',
        type: code === 1 ? 'success' : 'error'
      })
      this.$nextTick(() => {
        this.findWeixinConfig()
      })
    },
    async findWeixinConfig() {
      let { data, code, ...res } = await request({
        url: api.linkageManage.findWeixinConfig,
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
