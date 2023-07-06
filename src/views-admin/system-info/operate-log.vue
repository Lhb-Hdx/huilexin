<template>
  <div class="operate_container">
    <!-- 列表头部区：搜索框/按钮 -->
    <el-form :inline="true" :model="listQuery" class="demo-form-inline">
      <el-form-item>
        <el-date-picker
          v-model="listQuery.sTime"
          class="filter-item"
          type="datetime"
          placeholder="开始时间"
          value-format="yyyy-MM-dd"
        />
        <el-date-picker
          v-model="listQuery.eTime"
          class="filter-item"
          type="datetime"
          placeholder="结束时间"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>

      <el-form-item>
        <el-input
          v-model="listQuery.userName"
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
        <el-table-column label="序号" prop="id" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="操作人员" prop="userName" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="操作内容" prop="workDesc" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="操作接口" prop="url" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="操作时间" prop="workTime" align="left" />
      </el-table>
    </div>
    <!-- 列表底部：分页 -->
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findSysWorkLog" />

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
        userName: '',
        ip: '',
        sTime: '',
        eTime: '',
        page: 1,
        limit: 10
      },
      listCount: 1,
      // 显示控制数据 start
      checkList: ['操作人员', '操作内容', '操作接口', '操作时间'],
      lists: []
      // 显示控制数据 end
    }
  },
  created() {
    this.pageQueryList()
    this.findSysWorkLog()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 获取操作信息
    async findSysWorkLog() {
      const { data, code, ...res } = await request({
        url: api.common.findSysWorkLog,
        data: {...this.listQuery, sTime: String(this.listQuery.sTime), eTime: String(this.listQuery.eTime)}
      })
      if (code !== 1) return
      console.log('@成功后拿到信息：', res)
      this.tableData = data
      this.listCount = Number(res.count)
      this.$set(this.listQuery, 'count', +res.count)
    },
    pageQueryList() {
      const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
      console.log(`${this.$route.name}`)
      console.log(pageQuery)
      if (pageQuery) {
        delete pageQuery.route
        this.listQuery = pageQuery
      }
      console.log(this.listQuery)
    },
    // 查询功能
    handleFilter() {
      this.listQuery.page = 1
      this.findSysWorkLog() // 获取学员信息方法
    }
  }
}
</script>

<style scoped>
.operate_container{
padding: 10px;
}
.filter-item {
  /* margin-left: 10px; */
}
</style>
