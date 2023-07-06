<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-select v-model="findNewOaActivityQuery.type" class="filter-item" placeholder="选择流程类型" clearable>
        <el-option
          v-for="item in approveType"
          :key="item.id"
          :label="item.dictdataName"
          :value="item.id"
        />
      </el-select>
      <el-input v-model="findNewOaActivityQuery.name" placeholder="关键字搜索" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="activityList"
        style="width: 100%"
      >
        <el-table-column label="序号" width="80" align="left" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="流程名称" prop="name" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="流程类型" prop="name" show-overflow-tooltip>
          <template slot-scope="row">
            {{ setApproveType(row.row.type) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="流程Key" prop="bpmnKey" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="流程部署ID" prop="deploymentId" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="操作" width="250">
          <template slot-scope="row">
            <el-button size="mini" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="findNewOaActivityTotal > 0" :auto-scroll="false" :total="findNewOaActivityTotal" :page.sync="findNewOaActivityQuery.page" :limit.sync="findNewOaActivityQuery.limit" @pagination="findNewOaActivity" />
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'ActivityManageIndex',
  components: { Pagination, ListControl },
  data() {
    return {
      findNewOaActivityQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        type: '',
        name: ''
      },
      findNewOaActivityTotal: 0,
      listLoading: false,
      activityList: [],
      approveType: [],
      // 显示控制数据 start
      checkList: ['流程名称', '流程类型', '流程Key', '流程部署ID', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setApproveType() {
      return function(type) {
        const getItem = this.approveType.findIndex(item => Number(item.id) === Number(type))
        return getItem !== -1 ? this.approveType[getItem].dictdataName : ''
      }
    }
  },
  mounted() {
    this.findNewOaActivity()
    this.findApproveType()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 列表查询
    findNewOaActivity() {
      request({
        url: api.activity.findNewOaActivity, data: this.findNewOaActivityQuery
      }).then(res => {
        if (res.code === 1) {
          this.activityList = res.data
          this.findNewOaActivityTotal = Number(res.count)
        }
      })
    },
    // 新增
    handleCreate() {
      this.$router.push({
        name: 'ActivityCreate'
      })
    },
    // 编辑
    handleEdit(val) {
      this.$router.push({
        name: 'ActivityUpdate',
        query: {
          id: val.row.id
        }
      })
    },
    // 删除
    handleDelete(val) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const deleteDeploymentResult = await this.deleteDeployment(val.row.deploymentId)
        if (deleteDeploymentResult.code !== 1) return this.$message.error('删除部署流程失败')
        request({
          url: api.activity.deleteNewOaActivity,
          data: {
            id: val.row.id
          }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.findNewOaActivity()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    // 搜索
    handleFilter() {
      this.$set(this.findNewOaActivityQuery, 'page', 1)
      this.findNewOaActivity()
    },
    // 流程类型
    findApproveType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { page: 1, limit: -1, dictCode: 'oa_approve_type' }
      }).then(res => {
        if (res.code === 1) this.approveType = res.data
      })
    },
    // 删除已经部署的流程
    async deleteDeployment(deploymentId) {
      return new Promise(resolve => {
        request({
          url: api.activity.deleteDeployment,
          data: { deploymentId }
        }).then(res => {
          if (res.code === 1) resolve(res)
        })
      })
    }
  }
}
</script>
