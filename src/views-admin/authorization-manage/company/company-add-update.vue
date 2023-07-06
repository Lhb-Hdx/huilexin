<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="公司名称" prop="companyName">
                <el-input v-model="form.companyName" placeholder="请输入公司名称" />
              </el-form-item>
              <el-form-item label="公司地址" prop="address">
                <el-input v-model="form.address" placeholder="请输入公司地址" />
              </el-form-item>
              <el-form-item label="联系人" prop="linkMan">
                <el-input v-model="form.linkMan" placeholder="请输入公司联系人" />
              </el-form-item>
              <el-form-item label="手机号码" prop="mobile">
                <el-input v-model="form.mobile" placeholder="请输入联系人手机号码" />
              </el-form-item>
              <el-form-item label="状态">
                <el-switch v-model="form.status" />
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button v-permission="['Submit']" type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
                <el-button @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'CompanyAddUpdate',
  data() {
    return {
      form: {
        companyName: '',
        address: '',
        status: 0,
        mobile: '',
        linkMan: ''
      },
      rules: {
        companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }]
      },
      loading: false,
      confirmLoading: false,
      reloadParent: false,
      reloadKey: 'reloadKey',
      inputParentId: 0
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    }
  },
  mounted() {
    if (this.id) {
      this.loadDetail()
    }
  },
  methods: {
    loadDetail() {
      request({
        url: api.company.getSysCompany, data: { companyId: this.id }
      }).then(res => {
        if (res.code === 1) {
          res.model.status = Boolean(res.model.status)
          this.form = res.model
        }
      }).finally(() => {
        this.loading = false
      })
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          this.form.status = this.form.status ? 1 : 0
          request({
            url: (this.form.companyId && this.form.companyId > 0) ? api.company.updateSysCompany : api.company.insertSysCompany, data: this.form
          }).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.$router.back()
            } else {
              this.$message.error(res.msg)
            }
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    onReset() {
      this.$refs['form'].resetFields()
    }
  }
}
</script>

<style lang="scss"  scoped>
.router-list {
  border: 1px solid #ebeef5;
  .router-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #ebeef5;
  }
  .router-list-content {
    padding: 10px;
    .list-content-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      .router-menu-info {
        .router-menu-name {
          margin-left: 10px;
        }
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
}
</style>
