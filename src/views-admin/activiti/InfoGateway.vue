<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-form ref="form" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd()">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-input v-model="listQuery.keyword" placeholder="请输入名称" clearable @change="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-wrapper">
      <el-table
        :data="data"
        style="width: 100%"
      >
        <el-table-column
          prop="prop"
          label="序号"
        />
        <el-table-column label="操作" align="center" width="200px">
          <template slot-scope="{row}">
            <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" />
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
        hyEventName: '',
        // count: 1,
        page: 1,
        limit: 10
      },
      listCount: 1,
      data: []
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
  },
  methods: {
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
    },
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddInfoGatewa' })
    },
    handleEdit(hyMhId) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      // this.$router.push({ name: 'EditLinkageTemplate', query: { hyMhId }})
    },
    handleDelete(hyMhId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.linkageManage.deleteHyitModelHtml,
          data: { hyMhId }
        }).then(({ code }) => {
          this.$message.success('删除成功')
          this.$nextTick(() => {
            this.findHyitModelHtml()
          })
        }, () => {
          this.$message.error('删除失败')
        })
      })
    }
  }
}
</script>

<style scoped>
.el-form-item {
    margin-bottom: 0;
}
</style>
