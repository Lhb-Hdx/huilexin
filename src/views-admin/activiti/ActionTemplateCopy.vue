<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button v-permission="['create']" type="primary" class="mr-10" icon="el-icon-plus" @click="handleAdd()">新增</el-button>
      <el-form ref="form" v-permission="['search']" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-input v-model="listQuery.hyActionName" placeholder="请输入名称" clearable @change="handleSearch" />
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
        <el-table-column label="序号" type="index" />
        <el-table-column label="动作名称" prop="hyActionName" show-overflow-tooltip align="center" />
        <el-table-column label="动作类型" prop="hyActionClassId" show-overflow-tooltip align="center">
          <template slot-scope="{row}">
            {{ $tool.matchData(actionClass,row,'hyActionClassId','hyActionClassName') }}
          </template>
        </el-table-column>
        <el-table-column label="动作源表名" prop="hyActionTable" show-overflow-tooltip align="center" />
        <el-table-column label="动作源字段名" prop="hyActionSrcName" show-overflow-tooltip align="center" />
        <el-table-column label="动作源id" prop="hyActionSrcId" show-overflow-tooltip align="center" />
        <el-table-column label="操作" width="200px">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitAction" />
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
        hyActionName: '',
        page: 1,
        limit: 10
      },
      listCount: 1,
      tableData: [],
      actionClass: []
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    this.findHyitAction()
    this.findHyitActionClass()
  },
  methods: {
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findHyitAction()
    },
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddActionTemplate' })
    },
    handleEdit(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'EditActionTemplate', query: { hyAid: row.hyAid }})
    },
    handleDelete({ hyAid }) {
      this.$confirm('确定删除这个动作吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.linkageManage.deleteHyitAction,
          data: { hyAid }
        }).then(({ code }) => {
          this.$message.success('删除成功')
          this.findHyitAction()
        }, () => {
          this.$message.error('删除失败')
        })
      })
    },
    async findHyitAction() {
      let { data, code, ...res } = await request({
        url: api.linkageManage.findHyitAction,
        data: this.listQuery
      })
      if (code !== 1) return
      this.tableData = data
      this.listCount = Number(res.count)
      // this.$set(this.listQuery, 'count', +res.count)
    },
    async findHyitActionClass() {
      let { data, code } = await request({
        url: api.linkageManage.findHyitActionClass
      })
      if (code !== 1) return
      this.actionClass = data
    }
  }
}
</script>

<style scoped>
.el-form-item {
    margin-bottom: 0;
}
</style>
