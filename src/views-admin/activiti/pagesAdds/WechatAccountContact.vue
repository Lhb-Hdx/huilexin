<template>
  <div class="app-container actionTemplate">
    <el-card :header="title" shadow="never" style="height:90vh" class="card">
      <template #header>
        <el-page-header :title="title" @back="$router.back()" />
      </template>
      <div class="flex-h-center mb-20">
        <el-form ref="form" inline :model="rulesForm" class="flex-h-center">
          <el-form-item>
            <el-input v-model="rulesForm.keyword" placeholder="请输入查询信息" clearable />
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
          <el-table-column label="头像" prop="headimgurl" align="center" show-overflow-tooltip>
            <template slot-scope="{row}">
              <el-image
                style="width: 80px; height: 80px"
                :src="row.headimgurl"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="realname" align="center" show-overflow-tooltip />
          <el-table-column label="昵称" prop="nickname" align="center" show-overflow-tooltip />
          <el-table-column label="手机号" prop="mobile" align="center" show-overflow-tooltip />
          <el-table-column label="客户公司名称" prop="customerName" align="center" show-overflow-tooltip />
          <el-table-column label="状态" prop="status" show-overflow-tooltip align="center">
            <template slot-scope="{row}">
              {{ setLeaveType(row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="审核" align="center" width="300px">
            <template slot-scope="{row}">

              <el-button v-if="row.status === 'init'" type="primary" size="mini" @click="handleAdopt(row)">通过</el-button>
              <el-button type="danger" size="mini" @click="handleFail(row)">不通过</el-button>
              <el-button type="primary" size="mini" @click="handleEnable(row)">启用</el-button>
              <el-button type="danger" size="mini" @click="handleFrozen(row)">冻结</el-button>

            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="listCount> 0" :auto-scroll="false" :total="listCount" :page.sync="rulesForm.page" :limit.sync="rulesForm.limit" @pagination="findSysMobileUser" />

    </el-card>

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
      rulesForm: {
        applicationId: '',
        page: 1,
        limit: 10,
        keyword: ''
      },
      listCount: 1,
      fits: ['fill', 'contain', 'cover', 'none', 'scale-down'],
      tableData: [], // 用户数据
      statusType: [
        { data: 'init', value: '待审' },
        { data: 'enable', value: '启用' },
        { data: 'disable', value: '冻结' },
        { data: 'flow', value: '审核中' },
        { data: 'not_pass', value: '不通过' }
      ]
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    id() {
      return this.$route.query.applicationId
    },
    setLeaveType() {
      return function(status) {
        const idx = this.statusType.findIndex(item => item.data === status)
        return idx !== -1 ? this.statusType[idx].value : ''
      }
    }
  },
  created() {
    this.rulesForm.applicationId = this.id
    this.findSysMobileUser()
  },
  methods: {
    // 查询
    handleSearch() {
      this.findSysMobileUser()
    },
    // 通过
    async handleAdopt(row) {
      console.log(row)
      let res = await request({
        url: api.linkageManage.auditSysMobileUser,
        data: {
          id: row.id,
          status: 'enable'
        }
      })
      if (res.code !== 1) return this.$message.error('修改失败')
      this.$message.success('修改成功')
      this.$nextTick(() => {
        this.findSysMobileUser()
      })
    },
    // 不通过
    async handleFail(row) {
      console.log(row)
      let res = await request({
        url: api.linkageManage.auditSysMobileUser,
        data: {
          id: row.id,
          status: 'not_pass'
        }
      })
      if (res.code !== 1) return this.$message.error('修改失败')
      this.$message.success('修改成功')
      this.$nextTick(() => {
        this.findSysMobileUser()
      })
    },
    // 启用
    async handleEnable(row) {
      console.log(row)
      let res = await request({
        url: api.linkageManage.auditSysMobileUser,
        data: {
          id: row.id,
          status: 'enable'
        }
      })
      if (res.code !== 1) return this.$message.error('启用失败')
      this.$message.success('启用成功')
      this.$nextTick(() => {
        this.findSysMobileUser()
      })
    },
    // 冻结
    async handleFrozen(row) {
      console.log(row)
      let res = await request({
        url: api.linkageManage.auditSysMobileUser,
        data: {
          id: row.id,
          status: 'disable'
        }
      })
      if (res.code !== 1) return this.$message.error('冻结失败')
      this.$message.success('冻结成功')
      this.$nextTick(() => {
        this.findSysMobileUser()
      })
    },
    // 查询移动端用户信息
    async findSysMobileUser() {
      let res = await request({
        url: api.linkageManage.findSysMobileUser,
        data: { ...this.rulesForm }
      })
      if (res.code !== 1) return
      this.tableData = res.data
      console.log(this.tableData)
      this.listCount = Number(res.count)
    }
  }
}
</script>

<style scoped lang="scss">
 .actionTemplate{
 ::v-deep .card{
  position: relative;
}
.content{
  padding: 20px 20px 100px 20px;
  width: 700px;
  margin: auto;
}
.card-footer{
  padding: 20px;
}
}

</style>

