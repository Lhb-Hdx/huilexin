<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button v-permission="['create']" class="mr-10" type="primary" icon="el-icon-plus" @click="handleAdd()">新增</el-button>
      <el-form ref="form" v-permission="['search']" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-select v-model="listQuery.hyStatus" placeholder="全部状态" clearable @click="handleSearch">
            <el-option v-for="item in states" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="listQuery.hyModeName" placeholder="请输入模板名称" clearable @change="handleSearch" />
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
        />
        <el-table-column
          prop="hyModeName"
          label="模板名称"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="hyModeInfo"
          label="创建人"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="hyStatus"
          label="启用模板"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="{row}">
            <el-switch v-permission="['status']" :value="!!row.hyStatus" @change="hyStatusChange($event,row)" />
          </template>
        </el-table-column>
        <el-table-column
          prop="hyCtime"
          label="创建时间"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="hyUtime"
          label="更新时间"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column align="center" width="300px" label="操作">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="handleEdit(row.hyMhId)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row.hyMhId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitModelHtml" />
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
        hyStatus: '',
        hyModeName: '',
        // count: 1,
        page: 1,
        limit: 10
      },
      listCount: 1,
      tableData: [{}],
      states: [{ label: '无效', value: 0 }, { label: '有效', value: 1 }]
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    this.findHyitModelHtml()
  },
  methods: {
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findHyitModelHtml()
    },
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddLinkageTemplate' })
    },
    handleEdit(hyMhId) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'EditLinkageTemplate', query: { hyMhId }})
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
    },
    async hyStatusChange(flag, row) {
      row.hyStatus = flag
      const { ...data } = row
      let { code } = await request({
        url: api.linkageManage.updateHyitModelHtml,
        data: { ...data, hyStatus: +data.hyStatus }
      })
      if (code !== 1) return
      this.$message.success('修改成功')
      this.findHyitModelHtml()
    },
    async findHyitModelHtml() {
      let { data, code, count } = await request({
        url: api.linkageManage.findHyitModelHtml,
        data: this.listQuery
      })
      if (code !== 1) return
      this.listCount = Number(count)
      // this.$set(this.listQuery, 'count', +count)
      this.tableData = data
    }
  }
}
</script>

<style scoped>
.el-form-item {
    margin-bottom: 0;
}
</style>
