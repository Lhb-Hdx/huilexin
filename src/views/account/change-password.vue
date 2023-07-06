<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="旧密码" prop="oldPw">
                <el-input v-model.trim="form.oldPw" type="password" placeholder="请输入旧密码" />
              </el-form-item>
              <el-form-item label="新密码" prop="newPw">
                <el-input v-model.trim="form.newPw" type="password" placeholder="请输入新密码" />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPw">
                <el-input v-model.trim="form.confirmPw" type="password" placeholder="请再次输入新密码" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="" prop="">
                <el-button type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
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
/* import crypto from 'crypto' */
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'ChangePassword',
  data() {
    return {
      navTitle: '',
      form: {
        oldPw: '',
        newPw: '',
        confirmPw: ''
      },
      rules: {
        oldPw: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPw: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
        confirmPw: [{ required: true, message: '请再次输入新密码', trigger: 'blur' }]
      },
      loading: false,
      confirmLoading: false
    }
  },
  mounted() {
    this.navTitle = this.$route.meta.title
  },
  methods: {
    onSubmit() {
      /* let oldPw = this.form.oldPw
      const oldPwMd5 = crypto.createHash('md5')
      oldPwMd5.update(oldPw)
      oldPw = oldPwMd5.digest('hex')

      let newPw = this.form.newPw
      const newPwMd5 = crypto.createHash('md5')
      newPwMd5.update(newPw)
      newPw = newPwMd5.digest('hex')

      let confirmPw = this.form.confirmPw
      const confirmPwMd5 = crypto.createHash('md5')
      confirmPwMd5.update(confirmPw)
      confirmPw = confirmPwMd5.digest('hex') */

      if (this.form.newPw !== this.form.confirmPw) {
        this.$message({
          type: 'error',
          message: '两次密码不一致'
        })
      } else {
        request({
          url: api.sys.editAdminPassword,
          data: this.form
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: '修改密码成功'
            })
            this.$router.back()
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        })
      }
    },
    onReset() {
      this.$set(this.form, 'oldPwd', '')
      this.$set(this.form, 'newPwd', '')
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
