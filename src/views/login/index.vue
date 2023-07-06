<template>
  <div class="login-container">
    <div class="login-header">
      <!--      {{ SYSTEM_TITLE }}-->
      <!-- <img :src="loginPic" alt=""> -->
      <!--      <input ref="upload" class="loginPic" style="opacity:0" type="file" @change="uploadLoginPic">-->
    </div>
    <div class="login-content">
      <div class="login_main">
        <div class="left-content">
          <img alt="图片" src="image/common/login.png">
        </div>
        <div class="right-content">
          <div class="login-form-wrapper">
            <el-form ref="loginForm" :model="loginForm" :rules="loginRules" autocomplete="on" class="login-form" label-position="left">
              <div class="title-container">
                <div class="title">用户登录</div>
              </div>
              <el-form-item prop="username">
                <span class="svg-container">
                  <svg-icon icon-class="user" />
                </span>
                <el-input ref="username" v-model="loginForm.username" autocomplete="on" name="username" placeholder="用户名" tabindex="1" type="text" @keyup.enter.native="handleLogin" />
              </el-form-item>
              <el-tooltip v-model="capsTooltip" content="Caps lock is On" manual placement="right">
                <el-form-item prop="password">
                  <span class="svg-container">
                    <svg-icon icon-class="password" />
                  </span>
                  <el-input
                    :key="passwordType"
                    ref="password"
                    v-model="loginForm.password"
                    :type="passwordType"
                    autocomplete="on"
                    name="password"
                    placeholder="密码"
                    tabindex="2"
                    @blur="capsTooltip = false"
                    @keyup.native="checkCapslock"
                    @keyup.enter.native="handleLogin"
                  />
                  <span class="show-pwd" @click="showPwd">
                    <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                  </span>
                </el-form-item>
              </el-tooltip>

              <el-form-item class="captcha-box" prop="captcha">
                <span class="svg-container">
                  <svg-icon icon-class="user" />
                </span>
                <el-input ref="captcha" v-model="loginForm.captcha" autocomplete="on" name="captcha" placeholder="验证码" tabindex="3" type="text" @keyup.enter.native="handleLogin" />
                <img v-if="captchaUrl !== ''" :src="captchaUrl" alt="" @click="getCaptchaUrl">
              </el-form-item>
              <el-button :loading="loading" class="login-btn" type="primary" @click.native.prevent="handleLogin">登 录
              </el-button>

            </el-form>
            <div class="login-form-footer">
              <i class="el-icon-info" />
              <span>如需帮助，请联系客服电话：400-8758857</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="menu-list">
      <div v-for="(item, index) in list" :key="index" class="menu-list-item">{{ item }}</div>
    </div>
    <div class="login-footer">
      广州慧云网络技术有限公司版权所有 粤ICP备17137131
      <div class="versionColor">版本号：{{ versionNum }}</div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import { guid } from '@/utils/utils'
import axios from 'axios'
import api from '@/api/api'

export default {
  name: 'Login',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (!value.length) {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }
    return {
      SYSTEM_TITLE: process.env.VUE_APP_SYSTEM_TITLE[process.env.VUE_APP_SYSTEM_NAME],
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      captchaUrl: '',
      loginRules: {
        username: [{ required: true, trigger: 'change', message: '请输入用户名' /*, validator: validateUsername*/ }],
        password: [{ required: true, trigger: 'change', validator: validatePassword }],
        captcha: [{ required: true, trigger: 'change', message: '请输入验证码' /*, validator: validateUsername*/ }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      redirect: undefined,
      otherQuery: {},
      list: [
        'IT监控',
        '视频监控',
        '动环监控',
        '运维管理',
        '资产管理',
        'CMDB',
        '数据统计',
        '运营管理',
        '运维智库'
        // '组态图',
        // '数据配置',
        // '厂家设置'
      ],
      captchaUrlId: '',
      loginPicId: '',
      loginPic: '',
      versionNum: '', // 版本号
      token: null
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
    var json = JSON.parse(process.env.VUE_APP_SYSTEM_TITLE)
    this.SYSTEM_TITLE = json[process.env.VUE_APP_SYSTEM_NAME]
    if (process.env.VUE_APP_AUTO_INPUT_UPC === 'true') {
      this.$set(this.loginForm, 'username', 'admin')
      this.$set(this.loginForm, 'password', 'Gzhy123!')
    }

    if (this.$route.query.token && this.$route.query.token !== null) {
      // 自动登录的情况下使用
      this.token = this.$route.query.token
      this.localStorageOperation('set', 'loginToken', this.token)
      this.$request({
        url: '/admin/token.login',
        data: {}
      }).then(async res => {
        if (res.code === 1) {
          console.log(res)
          const role = []
          res.map.role.forEach(item => {
            role.push(item.roleId)
          })
          res.model.password = this.loginForm.password
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
                  if (val.data.length > 0) { // 如果有配置项目，请求LOGO图片
                    request({
                      url: api.sysApp.getSysApp,
                      data: { appId: res.model.appId }
                    }).then(val => {
                      if (val.code === 1) {
                        this.localStorageOperation('set', 'logoUrl', val.model.picture) // 存储logo地址
                      }
                    })
                    // 不经过首页跳转的，默认使用第一个项目设置agentGroupId，agentProject
                    this.findHyitAgentGroup()
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
  },
  mounted() {
    this.captchaUrlId = guid()
    this.getCaptchaUrl()
    this.findLoginPic()
    this.getVersion()
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  methods: {
    async findLoginPic() {
      let { data, code } = await request({ url: api.common.findLoginPic, data: { dictCode: 'sys_login_logo' }})
      if (code !== 1) return
      this.loginPicId = data[0].id
      this.loginPic = data[0].remark
    },
    // 获取版本号
    async getVersion() {
      axios({
        url: 'getVersion',
        method: 'post'
      }).then(res => {
        if (res.data.code !== 1) return
        this.versionNum = JSON.parse(res.data.model).version
        const sysName = JSON.parse(res.data.model).systemName
        this.localStorageOperation('set', 'sysName', sysName)
        this.$tool.setBrowserTitle()
      })
    },
    // async updateLoginPic() {
    //   // let { data, code } = await request({ url: '/admin/uploadLogoPic', data: { dictCode: 'sys_login_logo' }})
    //   // console.log(123)
    //   this.$ref.upload.click()
    // },
    uploadLoginPic(e) {
      console.log(e)
      const file = e.target.files[0]
      const fileData = new FormData()
      fileData.append('file', file)

      const uploadTokenData = { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        ver: '',
        timestamp: '',
        sign: '',
        thumb_width: '',
        thumb_height: '',
        img_width: '',
        img_height: ''
      }
      request({
        url: '/filter/uploadLogoPic', data: uploadTokenData, form: fileData
      }).then(res => {
        if (res.code === 1) {
          request({
            url: '/filter/updateLoginPic',
            data: {
              id: this.loginPicId,
              remark: res.map.img,
              dictCode: 'sys_login_logo',
              dictdataName: '登录页面logo',
              dictdataValue: 1
            }
          }).then(res => {
            if (res.code === 1) {
              this.$message.success('更新成功')
              this.findLoginPic()
            }
          })
        }
      })
    },
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          request({
            url: '/admin.login3', data: {
              ...this.loginForm,
              uuid: this.captchaUrlId
            }
          }).then(async res => {
            if (res.code === 1) {
              console.log(res)
              // this.getCaptchaUrl()
              res.model.password = this.loginForm.password
              const role = []
              res.map.role.forEach(item => {
                role.push(item.roleId)
              })
              this.localStorageOperation('set', 'loginToken', res.token) // 存储token
              this.localStorageOperation('set', 'userInfo', res.model) // 存储用户信息
              this.localStorageOperation('set', 'roleInfo', res.map.role) // 存储角色信息
              this.localStorageOperation('set', 'role', role.toString())
              const loginIndex = await this.findLoginIndex()
              if (loginIndex.length > 0) { // 配置了指定首页
                this.$store.dispatch('permission/setLoginInex', loginIndex)
                if (loginIndex[0].indexMenuId === 11249) {
                  request({
                    url: api.sysApp.getSysApp,
                    data: { appId: res.model.appId }
                  }).then(val => {
                    if (val.code === 1) {
                      this.localStorageOperation('set', 'logoUrl', val.model.picture) // 存储logo地址
                    }
                  })
                  this.$router.push({ path: '/' })
                } else {
                  // 查询已授权网关
                  request({
                    url: api.itAgentGroup.findHyitAgentGroupAuth,
                    data: { page: 1, limit: -1, roleId: res.map.role[0].roleId }
                  }).then(val => {
                    if (val.code === 1) {
                      console.log(val.data)
                      if (val.data.length > 0) { // 请求LOGO图片
                        request({
                          url: api.sysApp.getSysApp,
                          data: { appId: res.model.appId }
                        }).then(val => {
                          if (val.code === 1) {
                            this.localStorageOperation('set', 'logoUrl', val.model.picture) // 存储logo地址
                          }
                        })
                        // 不经过首页跳转的，默认使用第一个项目设置agentGroupId，agentProject
                        this.findHyitAgentGroup()

                        this.$router.push({ path: '/' })
                      } else { // 如果没有配置项目，清除数据
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
              } else { // 没有配置
                request({
                  url: api.sysApp.getSysApp,
                  data: { appId: res.model.appId }
                // data: { appId: 48 }
                }).then(val => {
                  if (val.code === 1) {
                    console.log(val)
                    this.localStorageOperation('set', 'logoUrl', val.model.picture) // 存储logo地址
                    this.findHyitAgentGroup()
                  }
                })
                this.$router.push({ path: '/' })
              }
            } else {
              this.getCaptchaUrl()
              const errorMsg = res.msg ? res.msg : '登录失败'
              this.$message({
                message: errorMsg,
                type: 'error'
              })
            }
            this.loading = false
          })
        } else {
          this.getCaptchaUrl()
          console.log('error submit!!')
          return false
        }
      })
    },
    async findHyitAgentGroup() {
      let res = await request({
        url: api.itAgentGroup.findHyitAgentGroup,
        data: { page: 1, limit: -1}
      })
      if (res.code === 1) {
        let gateway = await this.findAgent()
        // 所有网关id赋值给对应的分组
        res.data.forEach(dataItem => {
          let agent = ''
          gateway.forEach(agentItem => {
            if (Number(dataItem.id) === Number(agentItem.groupId)) {
              agent += agentItem.agentId + ','
            }
          })
          if (agent.length > 0) {
            agent = agent.substring(0, agent.length - 1)
            dataItem.agentId = agent
          }
        })
        console.log(res.data)
        this.sessionStorageOperation('set', 'agentGroupId', res.data[0].id)
        this.sessionStorageOperation('set', 'agentProject', res.data[0].name)
      }
    },
    // 获取网关id
    async findAgent(val) {
      let res = await request({
        url: api.itAgentGroup.findHyitAgentGroupLink,
        data: {
          page: 1,
          limit: -1,
          groupId: val
        }
      })
      if (res.code === 1) {
        return res.data
      }
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    getCaptchaUrl() {
      const NowDate = new Date()
      this.captchaUrl = `${process.env.VUE_APP_BASE_API}/auth/AuthImage?uuid=${this.captchaUrlId}&${NowDate.getTime()}`
    },
    async findLoginIndex() {
      const userInfoStorage = this.localStorageOperation('get', 'userInfo') // 获取用户登录信息
      const { code, data } = await request({
        url: api.hyitIndex.findHyitIndex,
        data: { appId: userInfoStorage.appId, companyId: userInfoStorage.companyId, limit: -1, indexType: 1 }
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #f5f5f5;
$light_gray: #333;
$cursor: #333;
.captcha-box {
  position: relative;

  img {
    position: absolute;
    right: 8px;
    top: 8px;
  }
}

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 42px;
    width: 85%;

    input {
      // background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 44px;
      caret-color: $cursor;

      // &:-webkit-autofill {
      //   box-shadow: 0 0 0px 1000px $bg inset !important;
      //   -webkit-text-fill-color: $cursor !important;
      // }
    }
  }

  .el-form-item {
    border: 1px solid #ddd;
    // background: rgba(0, 0, 0, 0.1);
    border-radius: 0px;
    color: #454545;
    margin-bottom: 30px;
  }
}
</style>

<style lang="scss" scoped>
$bg: #f5f5f5;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;
  min-width: 1200px;

  .login-header {
    cursor: pointer;
    user-select: none;
    height: 80px;
    width: 1000px;
    margin: 0 auto;
    padding: 0 30px;
    display: flex;
    align-items: center;
    font-size: 36px;
    font-weight: bold;
    color: #0145ab;
    position: relative;

    img {
      width: 340px;
      height: 50px;
    }

    //.loginPic {
    //  position: absolute;
    //  z-index: -1;
    //  left: 0;
    //  top: 0;
    //}
  }

  .login-content {
    height: 520px;
    display: flex;
    align-items: center;
    background: #0145ab;
    /*login页主要内容部分控制1000px，居中即可
    & > div {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    */
    .login_main {
      width: 1000px;
      margin: 0 auto;

      .left-content {
        float: left;
      }

      .right-content {
        float: right;
      }
    }
  }

  .login-form-wrapper {
    background: #fff;
  }

  .login-form {
    position: relative;
    width: 360px;
    max-width: 100%;
    padding: 15px;
    margin: 0 auto;
    overflow: hidden;
  }
  .versionColor {
    // color: #888;
    margin-top: -20px;
  }
  .login-form-footer {
    padding: 0 15px;
    line-height: 44px;
    color: #888;
    background: #f6f6f6;
    font-size: 14px;

    i {
      margin-right: 5px;
    }
  }

  .login-btn {
    width: 100%;
    margin-bottom: 20px;
    padding: 15px 20px;
    border: 0;
    border-radius: 0;
    font-size: 16px;
  }

  .forget-password {
    text-align: right;
    margin-bottom: 20px;

    a {
      text-decoration: underline;
      font-size: 14px;
      color: #666;
    }
  }

  .svg-container {
    padding: 4px 15px 4px 15px;
    color: $dark_gray;
    // vertical-align: middle;
    width: 45px;
    display: inline-block;
    background: #f6f6f6;
  }

  .title-container {
    position: relative;
    padding: 10px 0 15px 0;
    margin-bottom: 20px;

    .title {
      font-size: 16px;
      color: #0145ab;
      font-weight: bold;
    }

    &::before {
      content: "";
      width: 35px;
      height: 5px;
      position: absolute;
      left: 0;
      bottom: 0;
      background: #0145ab;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .menu-list {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eeeeee;

    .menu-list-item {
      color: #666;
      font-size: 14px;
      padding: 0 20px;
    }
  }

  .login-footer {
    line-height: 40px;
    font-size: 12px;
    text-align: center;
    color: #444;
  }
}
</style>
