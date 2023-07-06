<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button v-permission="['create']" class="mr-10" type="primary" icon="el-icon-plus" @click="$router.push({name:'AddDevopsBpnm'})">新增</el-button>
      <el-form ref="form" v-permission="['search']" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-input v-model="listQuery.name" placeholder="请输入流程图名称" clearable @clear="handleSearch" />
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
        <el-table-column label="流程图名称" prop="name" show-overflow-tooltip align="center" />
        <el-table-column label="模型key" prop="modelKey" show-overflow-tooltip align="center" />
        <el-table-column label="版本" prop="version" show-overflow-tooltip align="center" />
        <el-table-column label="创建时间" prop="ctime" show-overflow-tooltip align="center" />
        <el-table-column label="最后一次修改时间" prop="utime" show-overflow-tooltip align="center" />
        <el-table-column label="操作" align="center" width="250px" fixed="right">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="handleEdit(row.id)">编辑</el-button>
            <el-button v-permission="['bind']" type="primary" size="mini" @click="handleDeploy(row.id)">部署</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listQuery.count > 0" :auto-scroll="false" :total="listQuery.count" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findOmProcessModel" />
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
        name: '',
        count: 1,
        page: 1,
        limit: 10
      },
      tableData: []
    }
  },
  created() {
    this.findOmProcessModel()
  },
  methods: {
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findOmProcessModel()
    },
    handleEdit(id) {
      this.$router.push({ name: 'EditDevopsBpnm', query: { id }})
    },
    async handleDeploy(id) {
      let { code, msg } = await request({
        url: `${api.linkageManage.modelDeploy}/${id}`
      })
      this.$message({
        message: code === 1 ? '部署成功' : msg,
        type: code === 1 ? 'success' : 'error'
      })
    },
    handleDelete(id) {
      this.$confirm('确认删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.linkageManage.deleteOmProcessModel,
          data: { id }
        }).then(({ code }) => {
          if (code !== 1) return
          this.$message.success('删除成功')
          this.findOmProcessModel()
        }, () => {
          this.$message.error('删除失败')
        })
      }).catch(() => {})
    },
    async findOmProcessModel() {
      let { data, code, ...res } = await request({
        url: api.linkageManage.findOmProcessModel,
        data: this.listQuery
      })
      if (code !== 1) return
      this.tableData = data
      this.$set(this.listQuery, 'count', +res.count)
    }
  }
}
</script>

<style scoped>
.el-form-item {
    margin-bottom: 0;
}
</style>
