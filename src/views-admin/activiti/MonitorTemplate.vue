<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button class="mr-10" type="primary" icon="el-icon-plus" @click="handleAdd()">新增</el-button>
      <el-form ref="form" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-input v-model="listQuery.name" placeholder="请输入模板名称" clearable @change="handleSearch" />
        </el-form-item>
        <!--        <el-form-item>-->
        <!--          <el-select v-model="listQuery.hyStatus" placeholder="全部类型" clearable @click="handleSearch">-->
        <!--            <el-option v-for="item in states" :key="item.value" :label="item.label" :value="item.value" />-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
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
          label="监控模板名称"
          align="center"
          prop="name"
          show-overflow-tooltip
        />
        <el-table-column label="动作类型" prop="hyActionType" show-overflow-tooltip align="center">
          <template slot-scope="{row}">
            {{ $tool.matchData(actionClassList,row,'hyActionClassId','hyActionClassName','hyActionClassId') }}
          </template>
        </el-table-column>
        <!--        <el-table-column-->
        <!--          prop="hyModeInfo"-->
        <!--          label="适用设备类型"-->
        <!--          show-overflow-tooltip-->
        <!--          align="center"-->
        <!--        />-->
        <el-table-column
          prop="hyCtime"
          label="监控时间"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="{row}">
            {{ $tool.matchData(hyitTimes,row,'hyTid','hyTname','hyTid') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="hyUtime"
          label="最后修改时间"
          show-overflow-tooltip
          align="center"
        />
        <!--        <el-table-column-->
        <!--          prop="hyUtime"-->
        <!--          label="操作用户"-->
        <!--          show-overflow-tooltip-->
        <!--          align="center"-->
        <!--        />-->
        <el-table-column
          label="预置条件"
          show-overflow-tooltip
          align="center"
        >
          <template>
            <el-link>111</el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="hyStatus"
          label="启用状态"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="{row}">
            <el-switch :value="!!row.status" @change="hyStatusChange($event,row)" />
          </template>
        </el-table-column>
        <el-table-column align="center" width="300px" label="操作">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" @click="handleEdit(row.monitorId)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(row.monitorId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findLinkageMonitorTemplate" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
export default {
  name: 'MonitorTemplate',
  components: {
    Pagination
  },
  data() {
    return {
      listQuery: {
        name: '',
        hyModeName: '',
        // count: 1,
        page: 1,
        limit: 10
      },
      listCount: 1,
      tableData: [{}],
      states: [{ label: '无效', value: 0 }, { label: '有效', value: 1 }],
      actionClassList: [],
      hyitTimes: []
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    this.findLinkageMonitorTemplate()
    this.findLinkageActionClass()
    this.findHyitTime()
  },
  methods: {
    async findHyitTime() { // 时间模板
      let { data, code } = await request({
        url: api.video.findHyitTime,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.hyitTimes = data
    },
    async findLinkageActionClass() {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageActionClass
      })
      if (code !== 1) return
      this.actionClassList = data
    },
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findLinkageMonitorTemplate()
    },
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddMonitorTemplate' })
    },
    handleEdit(monitorId) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'EditMonitorTemplate', query: { monitorId }})
    },
    handleDelete(monitorId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.linkageManage.deleteLinkageMonitorTemplate,
          data: { monitorId }
        }).then(({ code }) => {
          this.$message.success('删除成功')
          this.$nextTick(() => {
            this.findLinkageMonitorTemplate()
          })
        }, () => {
          this.$message.error('删除失败')
        })
      })
    },
    async hyStatusChange(flag, row) {
      row.status = flag
      const { ...data } = row
      let { code } = await request({
        url: api.linkageManage.updateLinkageMonitorTemplate,
        data: { ...data, status: +data.status }
      })
      if (code !== 1) return
      this.$message.success('修改成功')
      await this.findLinkageMonitorTemplate()
    },
    async findLinkageMonitorTemplate() {
      let { data, code, count } = await request({
        url: api.linkageManage.findLinkageMonitorTemplate,
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
