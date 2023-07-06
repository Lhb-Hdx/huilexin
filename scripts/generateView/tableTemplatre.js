module.exports = {
  tableTemplate: compoenntName => {
    return `<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="success" icon="el-icon-plus" @click="handleCreate${compoenntName}">新增</el-button>
      <el-input v-model="${compoenntName}Query.keyword" placeholder="关键字搜索" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter${compoenntName}" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter${compoenntName}">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table></el-table>
      <pagination v-show="${compoenntName}Total > 0" :total="${compoenntName}Total" :page.sync="${compoenntName}Query.page" :limit.sync="${compoenntName}Query.limit" @pagination="find${compoenntName}" />
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: '${compoenntName}',
  data() {
    return {
      ${compoenntName}Query: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      ${compoenntName}Total: 0
    }
  },
  methods: {
    // 列表查询
    find${compoenntName}() {},
    // 新增
    handleCreate${compoenntName}() {},
    // 搜索
    handleFilter${compoenntName}() {}
  }
}
</script>
<style lang="less" scoped>
</style>
`
  }
}
