<template>
  <div class="wapper">
    <div class="application">
      <sLoading :loading="loading" :num="5" />
      <div v-for="(item,index) in applicationData" :key="index" class="item" :class="item.activi === true ? 'activi' : ''" @click="onLoadUserData(item)">{{ item.applicationName }}</div>
    </div>
    <div class="main">
      <div class="header">
        <div>
          <el-select v-model="appId">
            <el-option v-for="(item,index) in appData" :key="index" :label="item.appName" :value="item.appId" />
          </el-select>
        </div>
        <div>
          <el-select v-model="companyId">
            <el-option v-for="(item,index) in companyData" :key="index" :label="item.companyName" :value="item.companyId" />
          </el-select>
        </div>
        <div class="search"><el-input v-model="keyword" type="text" placeholder="搜索" /></div>
        <div><el-button type="button" @click="loadData">搜索</el-button></div>
      </div>
      <div class="table">
        <el-table :data="data" stripe border style="width: 100%">
          <el-table-column prop="userId" label="userId" width="100"><template slot-scope="scope">
            <div>{{ scope.row.userId }}</div>
          </template></el-table-column>
          <el-table-column prop="openid" label="openid" width="260"><template slot-scope="scope">
            <div>{{ scope.row.openid }}</div>
          </template></el-table-column>
          <el-table-column prop="realname" label="真实姓名" width="120"><template slot-scope="scope">
            <div>{{ scope.row.realname }}</div>
          </template></el-table-column>
          <el-table-column prop="mobile" label="手机号码" width="120"><template slot-scope="scope">
            <div>{{ scope.row.mobile }}</div>
          </template></el-table-column>
          <el-table-column prop="email" label="邮箱"><template slot-scope="scope">
            <div>{{ scope.row.email }}</div>
          </template></el-table-column>
          <el-table-column prop="customerName" label="客户名称"><template slot-scope="scope">
            <div>{{ scope.row.customerName }}</div>
          </template></el-table-column>

          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ formatStatus(scope.row.status) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="280">
            <template slot-scope="props">
              <el-button v-if="props.row.status === 'init'" type="primary" icon="el-icon-view" @click="auditSysMobileUser(props.row,'enable')">审核通过</el-button>
              <el-button v-if="props.row.status === 'enable'" type="primary" icon="el-icon-view" @click="auditSysMobileUser(props.row,'disenable')">冻结</el-button>
              <el-button v-if="props.row.status === 'init'" type="primary" icon="el-icon-edit" @click="auditSysMobileUser(props.row,'disenable')">不通过</el-button>
              <el-button v-if="props.row.status === 'disenable'" type="primary" icon="el-icon-edit" @click="auditSysMobileUser(props.row,'init')">启用</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager">
        <el-pagination background :current-page="page" :page-sizes="[10, 20, 30, 50, 100, 200, 300, 500]" :page-size="limit" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

  </div>
</template>

<script>
// import sLoading from '@/views/saas/components/loading'
import request from '@/utils/request'
export default {
  // components: { sLoading },
  data () {
    return {
      classify: 'qywx.3rd', appData: [], companyData: [], appId: null, companyId: null,
      applicationData: [], data: [], page: 1, limit: 10, total: 0, applicationId: 0, loading: false
    }
  },
  mounted () {
    this.loadApp()
    this.loadCompany()
    this.loadApplication()
  },
  methods: {
    loadApp() {
      request({
        url: '/admin/findSaasSysApp', data: { limit: -1 }
      }).then(res => {
        this.appData = res.data
        if (res.data && res.data.length > 0) this.appId = res.data[0].appId
      })
    },
    loadCompany() {
      request({
        url: '/admin/findSaasCompany', data: { limit: -1 }
      }).then(res => {
        this.companyData = res.data
        if (res.data && res.data.length > 0) this.companyId = res.data[0].companyId
      })
    },
    formatStatus (status) {
      if (status === 'init') return '待审'
      if (status === 'enable') return '通过'
      if (status === 'disenable') return '不通过'
      return ''
    },
    handleSizeChange (val) { // 切换页码条数，重新返回首页加载数据
      this.limit = val
      this.page = 1
      this.loadData()
    },
    handleCurrentChange (val) { // 切换当前页码，查询加载数据
      this.page = val
      this.loadData()
    },
    loadApplication () {
      this.loading = true
      request({
        url: '/admin/findSysMobileApplication', data: { classify: this.classify, limit: -1, status: 'enable' }
      }).then(res => {
        if (res && res.data) {
          res.data.forEach(item => {
            item.activi = false
            this.applicationData.push(item)
          })
          if (this.applicationData.length > 0) {
            this.applicationId = this.applicationData[0].applicationId
            this.applicationData[0].activi = true
            this.loadData()
          }

          this.loading = false
        }
      })
    },
    onLoadUserData (item) {
      this.applicationData.forEach(v => { v.activi = false })
      item.activi = true
      this.applicationId = item.applicationId
      this.page = 1
      this.loadData()
    },
    loadData () {
      this.data = []
      request({
        url: '/admin/findSysMobileUser', data: { applicationId: this.applicationId, appId: this.appId, companyId: this.companyId, classify: this.classify, page: this.page, limit: this.limit }
      }).then(res => {
        if (res && res.data) {
          res.data.forEach(item => {
            this.data.push(item)
          })
        }
        this.total = parseInt(res.count)
      })
    },
    auditSysMobileUser (item, status) {
      request({
        url: '/admin/auditSysMobileUser', data: { id: item.id, classify: this.classify, status: status }
      }).then(res => {
        if (res.code === 1) item.status = res.model.status
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/views/saas/style/css.scss";

</style>
