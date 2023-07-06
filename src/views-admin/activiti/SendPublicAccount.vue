<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <!-- <el-button v-permission="['create']" class="mr-10" type="primary" icon="el-icon-plus" @click="handleAdd()">新增</el-button> -->
      <el-dropdown @command="handleCommand">
        <el-button type="primary">
          新增<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">公众号</el-dropdown-item>
          <el-dropdown-item command="b">小程序</el-dropdown-item>
          <el-dropdown-item command="c">企业微信</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-form ref="form" v-permission="['search']" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-input v-model="listQuery.keyword" placeholder="请输入应用名称" clearable @change="handleSearch" />
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
        row-key="applicationId"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column label="应用名称" prop="applicationName" show-overflow-tooltip align="left" />
        <!-- <el-table-column label="类型" prop="classify" show-overflow-tooltip align="left" /> -->
        <el-table-column label="类型" prop="classify" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            {{ setLeaveType(row.classify) }}
          </template>
        </el-table-column>
        <el-table-column label="AppId/AppSecret" prop="appKey" show-overflow-tooltip align="left" />
        <el-table-column label="状态" prop="status" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            <el-switch v-permission="['status']" :value="row.status" @change="hyStatusChange($event,row)" />
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="300px" label="操作">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row.applicationId)">删除</el-button>
            <el-button v-if="row.classify === 'weixin'" type="primary" size="mini" @click="addApplet(row)">小程序</el-button>
            <el-button type="primary" size="mini" @click="handleContacts(row)">联系人</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findWeixinConfig" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import { listToTree } from '@/utils'
export default {
  components: {
    Pagination
  },
  data() {
    return {
      listQuery: {
        keyword: '',
        classify: '',
        page: 1,
        limit: 10
      },
      listCount: 1,
      tableData: [],
      tree: [],
      sta: '',
      dataList: [], // 暂存列表数据
      nameType: [
        { classify: 'weixin', value: '微信公众号' },
        { classify: 'wxapp', value: '微信小程序' },
        { classify: 'qywx', value: '企业微信' }
      ]
    }
  },
  computed: {
    setLeaveType() {
      return function(classify) {
        const idx = this.nameType.findIndex(item => item.classify === classify)
        return idx !== -1 ? this.nameType[idx].value : ''
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    if (this.listQuery.keyword) {
      this.getWeixinConfig()
    } else {
      this.findWeixinConfig()
    }
  },
  methods: {
    // 新增
    handleCommand(command) {
      if (command === 'a') {
        this.$router.push({ name: 'AddSendPublic' })
      } else if (command === 'b') {
        this.$router.push({ name: 'AddSendApplet' })
      } else if (command === 'c') {
        this.$router.push({ name: 'AddSendEnterprise' })
      }
    },
    // 查询
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      if (this.listQuery.keyword) {
        this.getWeixinConfig()
      } else {
        this.findWeixinConfig()
      }
    },
    // 旧新增
    // handleAdd() {
    //   const data = { ...this.listQuery }
    //   this.localStorageOperation('set', 'pageQuery', JSON.stringify({
    //     ...data, route: this.$route.name
    //   }))
    //   this.$router.push({ name: 'AddSendPublic' })
    // },

    // 编辑跳转
    handleEdit(row) {
      console.log(this.tableData)
      console.log(row)
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      if (row.classify === 'weixin') {
        this.$router.push({ name: 'EditSendPublic', query: { applicationId: row.applicationId }})
      } else if (row.classify === 'wxapp') {
        this.$router.push({ name: 'EditSendApplet', query: { applicationId: row.applicationId }})
      } else if (row.classify === 'qywx') {
        this.$router.push({ name: 'EditSendEnterprise', query: { applicationId: row.applicationId }})
      }
    },
    // 删除按钮
    handleDelete(applicationId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await request({
          url: api.linkageManage.deleteSysMobileApplication,
          data: { applicationId }
        })
        if (code !== 1) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.findWeixinConfig()
        })
      })
    },
    // 联系人
    handleContacts(row) {
      this.$router.push({ name: 'WechatAccountContact', query: { applicationId: row.applicationId }})
    },
    // 状态栏改变
    async hyStatusChange(flag, row) {
      console.log(flag, 'flag')
      console.log(row, 'row')
      this.sta = flag
      if (flag === true) {
        row.status = 'enable'
      } else if (flag === false) {
        row.status = 'disable'
      }
      // row.status = flag
      let { code, model } = await request({
        url: api.linkageManage.updateSysMobileApplication,
        data: { ...row, status: row.status }
      })
      console.log(model)
      this.$message({
        message: code === 1 ? '修改成功' : '修改失败',
        type: code === 1 ? 'success' : 'error'
      })
      this.$nextTick(() => {
        this.findWeixinConfig()
      })
    },
    // 添加小程序
    addApplet(row) {
      console.log(row)
      this.$router.push({ name: 'AddSendApplet', query: { appId: row.applicationId }})
    },
    // 获取列表数据
    async findWeixinConfig() {
      let { data, code, ...res } = await request({
        url: api.linkageManage.findSysMobileApplication,
        data: this.listQuery
      })
      // console.log(data)
      if (code !== 1) return
      for (let i = 0; i < data.length; i++) {
        if (data[i].parentId === null) {
          this.$set(data[i], 'parentId', 0)
        }
      }
      this.dataList = data
      for (let i = 0; i < this.dataList.length; i++) {
        if (this.dataList[i].status === 'enable') {
          this.$set(this.dataList[i], 'status', true)
        } else if (this.dataList[i].status === 'disable') {
          this.$set(this.dataList[i], 'status', false)
        }
      }
      console.log(this.dataList)
      this.tree = listToTree(this.dataList, 0, 0, 'applicationId', 'parentId')
      this.tableData = this.tree
      console.log(this.tableData)
      this.listCount = Number(res.count)
      // this.$set(this.listQuery, 'count', +res.count)
    },
    // 输入查询获取列表数据
    async getWeixinConfig() {
      let { data, code, ...res } = await request({
        url: api.linkageManage.findSysMobileApplication,
        data: this.listQuery
      })
      // console.log(data)
      if (code !== 1) return
      for (let i = 0; i < data.length; i++) {
        if (data[i].parentId === null) {
          this.$set(data[i], 'parentId', 0)
        }
      }
      this.dataList = data
      for (let i = 0; i < this.dataList.length; i++) {
        if (this.dataList[i].status === 'enable') {
          this.$set(this.dataList[i], 'status', true)
        } else if (this.dataList[i].status === 'disable') {
          this.$set(this.dataList[i], 'status', false)
        }
      }
      // console.log(this.dataList)
      // this.tree = listToTree(this.dataList, 0, 0, 'applicationId', 'parentId')
      this.tableData = this.dataList
      console.log(this.tableData)
      this.listCount = Number(res.count)
    }
  }
}
</script>

<style scoped>
.el-form-item {
    margin-bottom: 0;
}
.flex-h-center {
  margin-left: 10px;
}
</style>
