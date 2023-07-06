<template>
  <div class="wrp">
    <div class="headerBox">
      <el-input v-model="keyword" placeholder="请输入搜索内容" clearable />
      <el-button v-if="$store.role({api:'/admin/findSysMobileApplication'})" type="primary" @click="loadData({page:1})">搜索</el-button>
      <el-button v-if="$store.role({api:'/admin/insertSysApp'})" type="primary" @click="onAdd()">新增</el-button>
    </div>
    <div class="bodyBox">
      <el-table :data="data" stripe border style="width: 100%">
        <el-table-column prop="applicationId" label="编号" width="80"><template slot-scope="scope">
          <div>{{ scope.row.applicationId }}</div>
        </template></el-table-column>
        <el-table-column prop="applicationName" label="名称"><template slot-scope="scope">
          <div>{{ scope.row.applicationName }}</div>
        </template></el-table-column>
        <el-table-column prop="appKey" label="邮箱帐户"><template slot-scope="scope">
          <div>{{ scope.row.appKey }}</div>
        </template></el-table-column>
        <el-table-column prop="secret" label="密钥"><template slot-scope="scope">
          <div>{{ scope.row.secret }}</div>
        </template></el-table-column>
        <el-table-column prop="crorpid" label="SMTP"><template slot-scope="scope">
          <div>{{ scope.row.crorpid }}</div>
        </template></el-table-column>

        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <i v-if="scope.row.status === 'disable'" class="el-icon-remove-outline" />
            <i v-if="scope.row.status === 'enable'" class="el-icon-circle-check" />
            <span style="margin-left: 10px">{{ scope.row.status === 'enable' ? "发布" : "停用" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template slot-scope="props">
            <el-dropdown size="mini" type="primary" @command="handleCommand($event,props.row)">
              <el-button type="primary">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="props.row.status === 'disable'" command="editor">编辑</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status === 'disable'" command="delete">删除</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status === 'disable'" command="enable">启用</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status === 'enable'" command="disable">停用</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <el-drawer title="应用编辑" :visible.sync="editorDrawer" size="450px" :wrapper-closable="false" direction="rtl">
      <div class="drawer-wrp">
        <el-form label-position="left" class="demo-table-expand">
          <el-form-item label="应用名称">
            <el-input v-model="model.applicationName" type="text" />
          </el-form-item>
          <el-form-item label="appKey">
            <el-input v-model="model.appKey" type="text" />
          </el-form-item>
          <el-form-item label="密钥">
            <el-input v-model="model.secret" type="text" />
          </el-form-item>
          <el-form-item label="SMTP">
            <el-input v-model="model.crorpid" type="text" />
          </el-form-item>
          <el-form-item label="">
            <el-button class="el-icon-check" @click="onSave">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  name: '',
  data () {
    return {
      classify: 'email',
      keyword: null, page: 1, limit: 10, pageSize: [10, 20, 30, 40, 50], data: [], loading: false, total: 0, editorDrawer: false,
      model: { applicationId: null, applicationName: null, appKey: null, crorpid: null, corpToken: null, status: 'enable', classify: this.classify }
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
        url: '/admin/findSysMobileApplication', data: { page: this.page, limit: -1, keyword: this.keyword, classifys: this.classify }
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
      this.model = { applicationId: 0, applicationName: null, appKey: null, crorpid: null, corpToken: null, status: 'enable', classify: this.classify }
      this.editorDrawer = true
    },
    onDelete (applicationId) {
      this.$confirm('确认要删除当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/deleteSysMobileApplication', data: { applicationId: applicationId }
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
    onEnable (item) {
      this.$confirm('确认要发布当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/updateSysMobileApplication', data: { applicationId: item.applicationId, status: 'enable', classify: this.classify }
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
          url: '/admin/updateSysMobileApplication', data: { applicationId: item.applicationId, status: 'disable', classify: this.classify }
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
    handleCommand (command, item) {
      if (command === 'editor') {
        this.editorDrawer = true
        this.model = item
      } else if (command === 'delete') {
        this.onDelete(item.applicationId)
      } else if (command === 'enable') {
        this.onEnable(item)
      } else if (command === 'disable') {
        this.onDisable(item)
      }
    },
    onSave () {
      var that = this
      request({
        url: this.model.applicationId === 0 ? '/admin/insertSysMobileApplication' : '/admin/updateSysMobileApplication', data: this.model
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          that.editorDrawer = false
          that.loadData()
        } else {
          this.$message.error(res.msg)
        }
      }).finally(() => {
        this.loading = false
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

