<template>
  <div class="wrp">
    <div class="headerBox">
      <el-input v-model="keyword" placeholder="请输入搜索内容" clearable />
      <el-button v-if="$store.role({api:'/admin/findMessageLogs'})" type="primary" @click="loadData({page:1})">搜索</el-button>
    </div>
    <div class="bodyBox">
      <el-table :data="data" stripe border style="width: 100%">

        <el-table-column prop="hyLinkId" label="联动ID"><template slot-scope="scope"><div>{{ scope.row.hyLinkId }}</div></template></el-table-column>
        <el-table-column prop="hyEventId" label="事件ID"><template slot-scope="scope"><div>{{ scope.row.hyEventId }}</div></template></el-table-column>
        <el-table-column prop="hySrcId" label="事件源ID"><template slot-scope="scope"><div>{{ scope.row.hySrcId }}</div></template></el-table-column>
        <el-table-column prop="hyAid" label="动作ID"><template slot-scope="scope"><div>{{ scope.row.hyAid }}</div></template></el-table-column>
        <el-table-column prop="hyActionClassId" label="动作类型"><template slot-scope="scope"><div>{{ scope.row.hyActionClassId }}</div></template></el-table-column>
        <el-table-column prop="hyAsId" label="动作源ID"><template slot-scope="scope"><div>{{ scope.row.hyAsId }}</div></template></el-table-column>
        <el-table-column prop="hyAlarmId" label="告警日志ID"><template slot-scope="scope"><div>{{ scope.row.hyAlarmId }}</div></template></el-table-column>
        <el-table-column prop="receiveId" label="接收名称"><template slot-scope="scope"><div>{{ scope.row.receiveId }}</div></template></el-table-column>
        <el-table-column prop="picUrl" label="图片地址"><template slot-scope="scope"><div>{{ scope.row.picUrl }}</div></template></el-table-column>
        <el-table-column prop="videoUrl" label="录像地址"><template slot-scope="scope"><div>{{ scope.row.videoUrl }}</div></template></el-table-column>
        <el-table-column prop="sendAccountId" label="发送账号ID"><template slot-scope="scope"><div>{{ scope.row.sendAccountId }}</div></template></el-table-column>
        <el-table-column prop="sendAccount" label="发送账号"><template slot-scope="scope"><div>{{ scope.row.sendAccount }}</div></template></el-table-column>
        <el-table-column prop="agentId" label="网关ID"><template slot-scope="scope"><div>{{ scope.row.agentId }}</div></template></el-table-column>
        <el-table-column prop="state" label="状态0失败1成功"><template slot-scope="scope"><div>{{ scope.row.state }}</div></template></el-table-column>
        <el-table-column prop="num" label="执行次数"><template slot-scope="scope"><div>{{ scope.row.num }}</div></template></el-table-column>
        <el-table-column prop="ctime" label="创建时间" width="120" />
        <el-table-column prop="utime" label="最后执行时间" width="120" />
        <el-table-column prop="alarmType" label="状态1告警2恢复"><template slot-scope="scope"><div>{{ scope.row.alarmType }}</div></template></el-table-column>
        <el-table-column prop="project" label="项目名称"><template slot-scope="scope"><div>{{ scope.row.project }}</div></template></el-table-column>
        <el-table-column prop="projectId" label="项目ID"><template slot-scope="scope"><div>{{ scope.row.projectId }}</div></template></el-table-column>
        <el-table-column prop="actionType" label="动作类型"><template slot-scope="scope"><div>{{ scope.row.actionType }}</div></template></el-table-column>
        <el-table-column prop="user" label="user"><template slot-scope="scope"><div>{{ scope.row.user }}</div></template></el-table-column>
        <el-table-column prop="template" label="template"><template slot-scope="scope"><div>{{ scope.row.template }}</div></template></el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="props">
            <el-button type="primary" icon="el-icon-view" circle @click="onView(props.row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footerBox">
      <el-pagination
        background
        :current-page="page"
        :page-sizes="pageSize"
        :page-size="limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-drawer
      title="日志应用管理"
      :wrapper-closable="false"
      :visible.sync="drawer"
      size="90%"
      direction="rtl"
    >
      <div class="drawer-form-box">
        <textarea v-model="params" autocomplete="off" class="el-textarea__inner" style="height: 300px;" />
      </div>
    </el-drawer>

  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  name: '',
  components: {},
  data() {
    return {
      keyword: null, page: 1, limit: 10, pageSize: [10, 20, 30, 50, 100, 200, 300, 500], data: [], loading: false, total: 0, drawer: false, params: null
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
        url: '/admin/findMessageLogs', data: {page: this.page, limit: this.limit, keyword: this.keyword}
      }).then(res => {
        res.data.forEach(item => {
          that.data.push(item)
        })
        this.total = parseInt(res.count)
      }).finally(() => {
        this.loading = false
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
    },
    onView(item) {
      this.drawer = true
      this.params = item.params
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/views/saas/style/css.scss";

.drawer-form-box{padding:20px;width:100%;}

</style>

