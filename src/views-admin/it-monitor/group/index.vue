<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="listQuery.keyword" placeholder="请输入群组名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.agent" v-loadmore="loadMoreAgent" placeholder="请选择网关" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
      >
        <el-table-column label="群组名称">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              修改
            </el-button>
            <el-button type="danger" size="mini" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listQuery.total > 0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findZbxHstgrp" />
    </div>

    <el-drawer
      :title="title"
      :visible.sync="drawer"
      direction="rtl"
    >
      <div class="drawer-dialog">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="网关" prop="agent">
            <el-select v-model="form.agent" placeholder="请选择网关" clearable class="filter-item" style="width: 200px">
              <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="群组名称" prop="groupName">
            <el-input v-model.trim="form.groupName" />
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" type="primary" @click="saveGroup">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import loadmore from '@/directive/el-select-loadmore/loadmore'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'NetworkConfig',
  components: { Pagination },
  directives: { waves, loadmore },
  data() {
    return {
      list: [],
      title: '',
      drawer: false,
      loading: false,
      form: {
        agent: '',
        groupName: ''
      },
      rules: {
        agent: [
          { required: true, message: '请选择网关', trigger: 'blur' }
        ],
        groupName: [
          { required: true, message: '请输入群组名称', trigger: 'blur' }
        ]
      },
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        agent: '',
        keyword: '',
        total: 0
      },
      agentList: []
    }
  },
  computed: {

  },
  created() {
    this.findHyitAgent()
  },
  methods: {
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) {
            this.agentList.push(...res.data)
            this.listQuery.agent = res.data[0].id
          } else {
            this.listQuery.page = this.listQuery.page > 0 ? this.listQuery.page - 1 : 0
          }
        }
        this.findZbxHstgrp()
      })
    },
    findZbxHstgrp() {
      const params = { ...this.listQuery }
      delete params.total
      request({
        url: api.itMonitor.findZbxHstgrp, data: { ...params }
      }).then(res => {
        this.list = res.data
        this.listQuery.total = Number(res.count)
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.findZbxHstgrp()
    },
    handleCreate() {
      this.form = {}
      this.title = '新增群组'
      this.drawer = true
    },
    handleUpdate(row) {
      this.title = '编辑群组'
      this.drawer = true
      this.getZbxHstgrp(row.groupid)
    },
    handleDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({ url: api.itMonitor.agentDeleteGroup, data: { agent: this.listQuery.agent, groupid: row.groupid, groupName: row.name }}).then(res => {
          if (res.code === 1) {
            this.listQuery.page = 1
            this.$message.success('删除成功')
            this.findZbxHstgrp()
          }
        })
      })
    },
    getZbxHstgrp(groupid) {
      request({ url: api.itMonitor.getZbxHstgrp, data: { agent: this.listQuery.agent, groupid }}).then(res => {
        if (res.code === 1) {
          this.form = {
            id: res.model.groupid,
            agent: res.model.sbid,
            groupName: res.model.name
          }
        } else {
          this.form = {
            id: '',
            agent: '',
            groupName: ''
          }
        }
      })
    },
    handleOrgChange(e) {
      if (e.length > 0) {
        this.form.hyOrgId = e[e.length - 1]
      } else {
        this.form.hyOrgId = 0
      }
    },
    saveGroup() { // 保存
      this.loading = true
      let apiUrl = ''
      let data = {}
      if (this.form.id) {
        apiUrl = api.itMonitor.agentUpdateGroup
        data.agent = this.form.agent
        data.groupName = this.form.groupName
        data.groupid = this.form.id
      } else {
        delete this.form.id
        data = this.form
        apiUrl = api.itMonitor.agentAddGroup
      }
      request({
        url: apiUrl, data: data
      }).then(res => {
        this.loading = false
        if (res.code === 1) {
          this.drawer = false
          this.$message.success('新增成功')
          this.listQuery.page = 1
          this.findZbxHstgrp()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    loadMoreAgent() {
      this.listQuery.page = this.listQuery.page + 1
      this.findHyitAgent()
    }
  }
}
</script>
<style lang="scss" scoped>
.drawer-dialog{padding-right: 60px;}
</style>
