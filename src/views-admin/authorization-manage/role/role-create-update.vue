<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card class="table-card" shadow="never">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="角色名称：" prop="roleName">
                <el-input v-model.trim="form.roleName" placeholder="请输入角色名称" />
              </el-form-item>
              <el-form-item v-permission="['SelectCompany']" label="公司：" prop="companyId">
                <el-select
                  v-model="form.companyId"
                  filterable
                  placeholder="请选择公司"
                >
                  <el-option
                    v-for="item in companyList"
                    :key="item.companyId"
                    :label="item.companyName"
                    :value="item.companyId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="备注：" prop="roleDesc">
                <el-input v-model.trim="form.roleDesc" type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" placeholder="请输入备注" />
              </el-form-item>
              <el-form-item label="使用状态：" prop="remark">
                <el-radio v-model="form.status" label="1">可用</el-radio>
                <el-radio v-model="form.status" label="0">停用</el-radio>
              </el-form-item>
              <el-form-item label="角色类型：" prop="classify">
                <el-select v-model="form.classify" placeholder="请选择角色类型" clearable class="filter-item" style="width: 200px">
                  <el-option v-for="item in roleTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button v-permission="['Submit']" type="primary" :loading="loading" @click="onSubmit">保存</el-button>
                <el-button :loading="loading" @click="onReset">重置</el-button>
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
import { getUserInfo, getVuexStoragePermission } from '@/utils/auth'

export default {
  name: 'RoleCreateUpdate',
  data() {
    return {
      form: {
        roleId: 0,
        roleName: null,
        status: '1',
        roleDesc: null,
        classify: null,
        companyId: ''
      },
      classifyDisabled: false,
      rules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        classify: [{ required: true, message: '请选择角色类型', trigger: 'blur' }]
      },
      loading: false,
      companyList: [],
      roleTypes: this.$paramsModel.common.get('roleTypes')
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    navTitle() {
      return this.$route.meta.title
    }
  },
  mounted() {
    if (this.$route.query.id && this.$route.query.id > 0) {
      this.form.roleId = this.$route.query.id
      this.loadData()
    }
    this.findSysCompany()
    // 没有选择公司的权限就使用登录用户的公司
    if (getVuexStoragePermission('SelectCompany') === -1 && !this.id) {
      const userInfo = getUserInfo()
      this.$set(this.form, 'companyId', userInfo.companyId)
    }
  },
  methods: {
    findSysCompany() {
      request({
        url: api.company.findSysCompany, data: {}
      }).then(res => {
        if (res.code === 1) {
          this.companyList = res.data
        }
      })
    },
    loadData() {
      request({
        url: api.sys.getSysRole, data: { roleId: this.form.roleId }
      }).then(res => {
        this.form = res.model
        this.form.status = res.model.status.toString()
        if (res.model.classify === 'admin') {
          this.classifyDisabled = true
        }
      })
    },
    change(value) {
      console.log(value)
    },
    onSubmit() {
      const that = this
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          request({
            url: (that.form.roleId && that.form.roleId > 0) ? api.sys.updateSysRole : api.sys.insertSysRole,
            data: that.form
          }).then(res => {
            this.loading = false
            that.$notify({
              title: '温馨提示',
              message: res.msg,
              type: res.code === 1 ? 'success' : 'warning'
            })
            this.$router.back()
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
