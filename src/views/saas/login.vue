<template>
  <div>
    <el-input v-model="username" type="text" placeholder="请输入用户名" />
    <el-input v-model="password" type="password" placeholder="请输入密码" />
    <el-input v-model="captcha" type="text" placeholder="请输入验证码" />
    <img v-if="captchaUrl !== ''" :src="captchaUrl" alt="" @click="getCaptchaUrl">
    <el-button type="button" @click="onLogin">登录</el-button>
  </div>
</template>

<script>
import request from '@/utils/request'
import { guid } from '@/utils/utils'
// import FileUpload from '@/components/Upload/file-upload'
export default {
  data() {
    return {
      username: null, password: null, captcha: null, captchaUrl: null
    }
  },
  mounted() {
    this.username = 'admin'
    this.password = 'Gzhy123!'

    this.captchaUrlId = guid()
    this.getCaptchaUrl()
  },
  methods: {
    onLogin() {
      this.localStorageOperation('set', 'loginToken', null)
      request({
        url: '/admin.saas.login',
        data: {
          company_id: 1,
          app_id: 1,
          username: this.username,
          password: this.password,
          captcha: this.captcha,
          uuid: this.captchaUrlId
        }
      }).then(res => {
        if (res.code === 1) {
          const role = []
          res.map.role.forEach(item => {
            role.push(item.roleId)
          })
          this.localStorageOperation('set', 'loginToken', res.token) // 存储token
          this.localStorageOperation('set', 'userInfo', res.model) // 存储用户信息
          this.localStorageOperation('set', 'role', role.toString())
          this.$router.replace({ path: '/saas/index' })
        }
      })
    },
    getCaptchaUrl() {
      const NowDate = new Date()
      this.captchaUrl = `${process.env.VUE_APP_BASE_API}/auth/AuthImage?uuid=${this.captchaUrlId}&${NowDate.getTime()}`
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
