<template>
  <div>第三方跳转</div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'UnifyLink',
  data() {
    return {
      token: null
    }
  },
  mounted() {
    if (this.$route.query.token && this.$route.query.token !== null) {
      // 自动登录的情况下使用
      this.token = this.$route.query.token
      this.localStorageOperation('set', 'loginToken', this.token)
      request({
        url: '/admin/token.login',
        data: {}
      }).then(async res => {
        if (res.code === 1) {
          console.log(res)
          const role = []
          res.map.role.forEach(item => {
            role.push(item.roleId)
          })
          this.localStorageOperation('set', 'userInfo', res.model) // 存储用户信息
          this.localStorageOperation('set', 'roleInfo', res.map.role) // 存储角色信息
          this.localStorageOperation('set', 'role', role.toString())
          const loginIndex = await this.findLoginIndex()
          // 如果首页配置为首页导航
          if (loginIndex.length > 0) { // 配置了指定首页
            this.$store.dispatch('permission/setLoginInex', loginIndex)
            if (loginIndex[0].indexMenuId === 11249) {
              this.$router.push({ path: '/' })
            } else {
              // 查询已授权网关
              request({
                url: api.itAgentGroup.findHyitAgentGroupAuth,
                data: { page: 1, limit: -1, roleId: res.map.role[0].roleId }
              }).then(val => {
                if (val.code === 1) {
                  console.log(val.data)
                  if (val.data.length > 0) { // 如果有配置项目，请求LOGO图片
                    request({
                      url: api.sysApp.getSysApp,
                      data: { appId: res.model.appId }
                      // data: { appId: 48 }
                    }).then(val => {
                      if (val.code === 1) {
                        this.localStorageOperation('set', 'logoUrl', val.model.picture) // 存储logo地址
                      }
                    })
                    this.$router.push({ path: '/' })
                  } else { // 如果有配置项目，清除数据
                    this.localStorageOperation('clean', 'loginToken') // 存储token
                    this.localStorageOperation('clean', 'userInfo') // 存储用户信息
                    this.localStorageOperation('clean', 'roleInfo') // 存储角色信息
                    this.localStorageOperation('clean', 'role')
                    this.$message({
                      message: '当前用户没有配置项目，请联系管理员进行配置',
                      type: 'error'
                    })
                  }
                }
              })
            }
          } else {
            request({
              url: api.sysApp.getSysApp,
              data: { appId: res.model.appId }
              // data: { appId: 48 }
            }).then(val => {
              if (val.code === 1) {
                console.log(val)
                this.localStorageOperation('set', 'logoUrl', val.model.picture) // 存储logo地址
              }
            })
            this.$router.push({ path: '/' })
          }
        } else {
          const errorMsg = res.msg ? res.msg : '登录失败'
          this.$message({
            message: errorMsg,
            type: 'error'
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
