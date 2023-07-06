<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="select-width-fill">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="子系统名称" prop="hySbName">
                <el-input v-model.trim="form.hySbName" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="子系统编码" prop="hyCoding">
                <el-input v-model.trim="form.hyCoding" placeholder="请输入子系统编码" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="所属区域" prop="hyOrgId">
                <el-select
                  v-model="form.hyOrgId"
                  filterable
                  placeholder="请选择区域"
                >
                  <el-option
                    v-for="item in area"
                    :key="item.hyAreaId"
                    :label="item.hyAreaName"
                    :value="item.hyAreaId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="用户名" prop="hyUserName">
                <el-input v-model.trim="form.hyUserName" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="密码" prop="hyPassword">
                <el-input v-model.trim="form.hyPassword" placeholder="请输入密码" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="IP或域名" prop="hyIp">
                <el-input ref="mark" v-model.trim="form.hyIp" placeholder="请输入IP" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="端口" prop="hyPort">
                <el-input v-model.trim="form.hyPort" placeholder="请输入端口" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="" prop="">
                <el-button v-permission="['save']" type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
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
import { isIp, dns } from '@/utils/validate.js'
export default {
  name: 'SubSystemAddUpdate',
  data() {
    var checkIp = (rule, val, callback) => {
      let x = val.split('.')[0]
      if (!val) callback(new Error('IP或域名不能为空'))
      if (isNaN(x)) {
        if (!dns(val)) callback(new Error('域名格式不正确'))
      } else {
        if (!isIp(val)) callback(new Error('IP格式不正确'))
      }
      callback()
    }
    return {
      loading: false,
      confirmLoading: false,
      form: {
        hyOrgId: '',
        hyUserName: '',
        hyIp: '',
        hyPassword: '',
        hyPort: '',
        hySbName: '',
        hyCoding: ''
      },
      rules: {
        hySbName: [
          { required: true, message: '请输入子系统名称', trigger: 'blur' }
        ],
        hyOrgId: [
          { required: true, message: '请选择区域', trigger: 'blur' }
        ],
        hyUserName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        hyIp: [
          { validator: checkIp, trigger: 'blur' }
        ],
        hyPassword: [
          { required: true, message: '请选择区域', trigger: 'blur' }
        ],
        hyPort: [
          { required: true, message: '请输入端口', trigger: 'blur' }
        ],
        hyCoding: [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ]
      },
      area: [],
      version: [
        { id: 1, name: '1.0' }
      ]
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
    this.findHyitOrg()
    if (this.id) {
      this.fetchData()
    }
  },
  methods: {
    onReset() {
      this.$refs.form.resetFields()
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiName = this.id ? api.powerEnv.updateHyitSubSystem : api.powerEnv.insertHyitSubSystem
          const msg = this.id ? '编辑成功' : '新增成功'
          request({ url: apiName, data: (Object.assign(this.form)) }).then(res => {
            if (res.code === 1) {
              this.$message.success(msg)
              this.$router.back()
            } else {
              this.$message.warning(res.errors[0])
            }
          }).finally(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    findHyitOrg() {
      request({
        url: api.area.findHyitArea,
        data: {isDh: 1}
      }).then(res => {
        if (res.code === 1) {
          this.area = res.data
        }
      })
    },
    fetchData() { // 获取编辑信息并展示
      request({
        url: api.powerEnv.getHyitSubSystem,
        data: { hySbId: this.id }
      }).then(res => {
        if (res.code === 1) {
          const form = {}
          Object.keys(this.form).forEach(key => {
            form[key] = res.model[key]
          })
          form.hySbId = res.model.hySbId
          this.form = form
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
