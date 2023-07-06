<template>
  <div class="operate_container">
    <!-- 列表头部区：搜索框/按钮 -->
    <el-form :inline="true" :model="listQuery" class="demo-form-inline">
      <el-form-item>
        <el-input
          v-model="listQuery.keyword"
          placeholder="请输入人员名称"
          clearable
          @click="handleFilter"
          @keyup.enter.native="handleFilter"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleFilter">查询</el-button>
      </el-form-item>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </el-form>

    <!-- 列表内容区域 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="序号" prop="id" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="操作人员" prop="userName" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="ip" prop="ip" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="登录时间" prop="createTime" align="left" />
      </el-table>
    </div>
    <!-- 列表底部：分页 -->
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findSysUserLoginLog" />

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  components: {
    Pagination, ListControl
  },
  data() {
    return {
      tableData: [],
      listQuery: {
        page: 1,
        limit: 10,
        keyword: ''

      },
      listCount: 1,
      // 显示控制数据 start
      checkList: ['序号', '操作人员', 'ip', '登录时间'],
      lists: []
      // 显示控制数据 end
    }
  },
  created() {
    this.findSysUserLoginLog()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 获取登录日志
    async findSysUserLoginLog() {
      const res = await request({
        url: api.common.findSysUserLoginLog,
        data: this.listQuery
      })
      if (res.code !== 1) return
      this.tableData = res.data
      this.listCount = Number(res.count)
      console.log(this.tableData)
    },
    // 查询功能
    handleFilter() {
      this.listQuery.page = 1
      this.findSysUserLoginLog()
    }
  }
}
</script>

<style scoped>
.operate_container{
padding: 10px;
}
</style>
