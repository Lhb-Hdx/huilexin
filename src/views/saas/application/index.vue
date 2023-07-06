<template>
  <div class="wrp">
    <div class="headerBox">
      <el-input v-model="keyword" placeholder="请输入搜索内容" clearable />
      <el-button v-if="$store.role({api:'/admin/findSysMobileApplication'})" type="primary" @click="loadData({page:1})">搜索</el-button>
      <el-button v-if="$store.role({api:'/admin/insertSysApp'})" type="primary" @click="onAdd()">新增</el-button>
    </div>
    <div class="bodyBox">
      <el-table :data="data" stripe border style="width: 100%">
        <el-table-column prop="applicationId" label="编号"><template slot-scope="scope"><div>{{ scope.row.applicationId }}</div></template></el-table-column>
        <el-table-column prop="parentId" label="上级编号"><template slot-scope="scope"><div>{{ scope.row.parentId }}</div></template></el-table-column>
        <el-table-column prop="applicationName" label="名称"><template slot-scope="scope"><div>{{ scope.row.applicationName }}</div></template></el-table-column>
        <el-table-column prop="appKey" label="APPKEY"><template slot-scope="scope"><div>{{ scope.row.appKey }}</div></template></el-table-column>
        <el-table-column prop="secret" label="密钥"><template slot-scope="scope"><div>{{ scope.row.secret }}</div></template></el-table-column>
        <el-table-column prop="crorpid" label="企业微信ID"><template slot-scope="scope"><div>{{ scope.row.crorpid }}</div></template></el-table-column>
        <el-table-column prop="corpsecret" label="企业微信密钥"><template slot-scope="scope"><div>{{ scope.row.corpsecret }}</div></template></el-table-column>

        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span style="margin-left: 10px">{{ scope.row.status == 'enable' ? "启用中" : "停用中" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220">
          <template slot-scope="props">
            <el-button v-if="$store.role({api:'/admin/updateSysApp'})" type="primary" icon="el-icon-edit" @click="onEdit(props.row.appId)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  name: '',
  data() {
    return {
      keyword: null, page: 1, limit: 10, pageSize: [10, 20, 30, 40, 50], data: [], loading: false, total: 0
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData(obj) {
      if (this.loading) return
      if (obj) {
        if (obj.page) this.page = obj.page
      }
      this.loading = true
      this.data = []
      var that = this
      request({
        url: '/admin/findSysMobileApplication', data: { page: this.page, limit: -1, keyword: this.keyword, classifys: 'weixin,wxapp' }
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
    onAdd() {
      this.$router.push({ path: 'app-detail', query: { appId: 0 }})
    },
    onEdit(appId) {
      this.$router.push({ path: 'app-detail', query: { appId: appId }})
    },
    onMenu(appId) {
      this.$router.push({ path: 'menu-list', query: { appId: appId }})
    },
    onDelete(appId) {
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
              onClose: function() {

              }
            })
          }
          this.loadData()
        })
      })
    },
    handleSizeChange(val) { // 切换页码条数，重新返回首页加载数据
      this.limit = val
      this.page = 1
      this.loadData()
    },
    handleCurrentChange(val) { // 切换当前页码，查询加载数据
      this.page = val
      this.loadData()
    }
  }
}
</script>

<style lang="scss" >
// @import '@/assets/css/style.scss';
</style>

<style lang="scss" scoped>

</style>

