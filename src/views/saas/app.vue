<template>
  <div class="wrp">
    <div class="headerBox">
      <el-input v-model="keyword" placeholder="请输入搜索内容" clearable />
      <el-button v-if="$store.role({api:'/admin/findSysApp'})" type="primary" @click="loadData({page:1})">搜索</el-button>
      <el-button v-if="$store.role({api:'/admin/insertSysApp'})" type="primary" @click="onAdd()">新增</el-button>
    </div>
    <div class="bodyBox">
      <el-table :data="data" stripe border style="width: 100%">
        <el-table-column prop="appId" label="编号" width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.appId }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="appName" label="名称"><template slot-scope="scope">
          <div>{{ scope.row.appName }}</div>
        </template></el-table-column>
        <el-table-column prop="appDesc" label="应用描述"><template slot-scope="scope">
          <div>{{ scope.row.appDesc }}</div>
        </template></el-table-column>

        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <i v-if="scope.row.status !== 1" class="el-icon-remove-outline" />
            <i v-if="scope.row.status === 1" class="el-icon-circle-check" />
            <span style="margin-left: 10px">{{ scope.row.status == 1 ? "发布" : "停用" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template slot-scope="props">
            <el-dropdown size="mini" type="primary" @command="handleCommand($event,props.row)">
              <el-button type="primary">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="props.row.status !== 1" command="editor">编辑</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status !== 1" command="delete">删除</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status !== 1" command="enable">启用</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status === 1" command="disable">停用</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footerBox">
      <el-pagination background :current-page="page" :page-sizes="pageSize" :page-size="limit" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-drawer title="应用编辑" :visible.sync="appEditorDrawer" size="450px" :wrapper-closable="false" direction="rtl">
      <div class="drawer-wrp">
        <el-form label-position="left" class="demo-table-expand">
          <el-form-item label="应用名称">
            <el-input v-model="model.appName" type="text" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="model.appDesc" type="text" />
          </el-form-item>
          <el-form-item label="">
            <el-button class="el-icon-check" @click="onSaveApp">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import request from '@/utils/request'
// import {tableColumnData} from 'vue-auto-input-search/src/vue-auto-data';
export default {
  name: '',
  data () {
    return {
      keyword: null, page: 1, limit: 10, pageSize: [10, 20, 30, 50, 100, 200, 300, 500], data: [], loading: false, total: 0, appEditorDrawer: false, model: { appId: null, appName: null, appDesc: null }
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    loadData (obj) {
      if (this.loading) return
      if (obj) {
        if (obj.page) this.page = obj.page
      }
      this.loading = true
      this.data = []
      var that = this
      request({
        url: '/admin/findSaasSysApp', data: { page: this.page, limit: this.limit, keyword: this.keyword }
      }).then(res => {
        res.data.forEach(item => {
          item.parentName = ''

          item.details = []
          that.data.push(item)
        })
        this.total = parseInt(res.count)
      }).finally(() => {
        this.loading = false
      })
    },
    onAdd () {
      this.appEditorDrawer = true
      this.model = { appId: 0, appName: null, appDesc: null }
    },
    handleCommand (command, item) {
      if (command === 'editor') {
        this.appEditorDrawer = true
        this.model = item
      } else if (command === 'delete') {
        this.onDelete(item.appId)
      } else if (command === 'enable') {
        this.onEnable(item)
      } else if (command === 'disable') {
        this.onDisable(item)
      }
    },
    onSaveApp () {
      var that = this
      request({
        url: this.model.appId === 0 ? '/admin/insertSysApp' : '/admin/updateSysApp', data: this.model
      }).then(res => {
        if (res.code === 1) {
          that.appEditorDrawer = false
          that.loadData()
        }
      }).finally(() => {
        this.loading = false
      })
    },
    onEnable (item) {
      this.$confirm('确认要发布当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/updateSysApp', data: { appId: item.appId, status: 1 }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: (res.code === 1) ? 'success' : 'warning',
              onClose: function () {

              }
            })
          }
          this.loadData()
        })
      })
    },
    onDisable (item) {
      this.$confirm('确认要停止当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/updateSysApp', data: { appId: item.appId, status: 0 }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: (res.code === 1) ? 'success' : 'warning',
              onClose: function () {

              }
            })
          }
          this.loadData()
        })
      })
    },
    onDelete (appId) {
      this.$confirm('确认要删除当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/deleteSaasSysApp', data: { appId: appId }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: (res.code === 1) ? 'success' : 'warning',
              onClose: function () {

              }
            })
          }
          this.loadData()
        })
      })
    },
    handleSizeChange (val) { // 切换页码条数，重新返回首页加载数据
      this.limit = val
      this.page = 1
      this.loadData()
    },
    handleCurrentChange (val) { // 切换当前页码，查询加载数据
      this.page = val
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/views/saas/style/css.scss";
</style>

