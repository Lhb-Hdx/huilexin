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
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model.trim="form.realName" placeholder="请输入真实姓名" />
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="手机号码" prop="tel">
                <el-input v-model.trim="form.tel" type="number" placeholder="请输入手机号码" />
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="部门" prop="organizationCatId">
                <el-cascader
                  v-model="form.organizationCatId"
                  placeholder="部门"
                  filterable
                  clearable
                  :options="orgTreeList"
                  :props="{ value: 'hyOrgId', label: 'hyOrgName', checkStrictly: true }"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="邮件" prop="email">
                <el-input v-model.trim="form.email" placeholder="请输入邮件地址" />
              </el-form-item>
            </el-col>

            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="上级领导" prop="leaderUserId">
                <el-select
                  v-model="form.leaderUserId"
                  filterable
                  placeholder="请选择上级领导"
                >
                  <el-option
                    v-for="item in userList"
                    :key="item.userId"
                    :label="item.realName"
                    :value="item.userId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="职位" prop="positionCatId">
                <el-cascader
                  v-model="form.positionCatId"
                  placeholder="职位"
                  :options="positionTreeList"
                  :props="{ value: 'catId', label: 'catName', checkStrictly: true }"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="学历" prop="educationCatId">
                <el-cascader
                  v-model="form.educationCatId"
                  placeholder="学历"
                  :options="eduTreeList"
                  :props="{ value: 'catId', label: 'catName', checkStrictly: true }"
                />
              </el-form-item>
            </el-col>
            <el-col v-permission="['SelectSysCompany']" :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="公司" prop="companyId">
                <el-select
                  v-model="form.companyId"
                  filterable
                  placeholder="请选择公司"
                  @change="companyRole"
                >
                  <el-option
                    v-for="item in companyList"
                    :key="item.companyId"
                    :label="item.companyName"
                    :value="item.companyId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="对应配置类目" prop="cmdbItemTypeId">
                <el-cascader
                  v-model="form.cmdbItemTypeId"
                  class="w-100"
                  placeholder="请选择配置类目"
                  disabled
                  :options="classifyTreeList"
                  :props="{ value: 'id', label: 'name', checkStrictly: true }"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="可登录用户">
                <el-select
                  v-model="isLoginUser"
                  filterable
                  placeholder="是否可登录"
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="账户有效期" prop="validityTime">
                <el-date-picker v-model="form.validityTime" type="datetime" placeholder="" value-format="timestamp" style="width: 200px;" />
              </el-form-item>
            </el-col>
            <template v-if="isLoginUser">
              <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                <el-form-item label="登录帐号" prop="userName">
                  <el-input v-model.trim="form.userName" placeholder="请输入登录账户" />
                </el-form-item>
              </el-col>
              <el-col v-if="isLoginUser && !form.userId" :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                <el-form-item label="登录密码" prop="password">
                  <el-input v-model.trim="form.password" :type="passwordType" placeholder="请输入登录密码" />
                  <span class="show-pwd" @click="showPwd">
                    <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                  </span>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <el-form-item label="" prop="">
                  <el-transfer v-model="currentRoleData" :data="roleData" :titles="['可用角色','已选角色']" @mouseover.native="addTitle" />
                </el-form-item>
              </el-col>
            </template>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
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
import { listToTree } from '@/utils'

export default {
  name: 'UsersCreateUpdate',
  data() {
    return {
      isLoginUser: false,
      roleData: [],
      currentRoleData: [],
      // 人员参数
      hrForm: {
        userRealName: '',
        email: '',
        mobile: '',
        organizationCatId: '',
        positionCatId: '',
        educationCatId: '',
        userId: '',
        id: '',
        cmdbItemTypeId: '',
        companyId: '',
        leaderUserId: '', // 上级领导
        validityTime: ''
      },
      // 用户参数
      userForm: {
        classify: 'admin',
        realName: '',
        tel: '',
        userName: '',
        password: '',
        companyId: '',
        appId: '',
        status: 1,
        userId: '',
        validityTime: ''
      },
      // 表单参数
      form: {
        classify: 'admin',
        realName: '',
        tel: '',
        userName: '',
        password: '',
        companyId: '',
        appId: '',
        status: 1,
        organizationCatId: '',
        positionCatId: '',
        educationCatId: '',
        userId: '',
        id: '',
        leaderUserId: '', // 上级领导
        cmdbItemTypeId: 9,
        email: '',
        validityTime: ''
      },
      rules: {
        realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        userName: [{ required: true, message: '请输入登录账户', trigger: 'blur' }],
        password: [{ required: true, message: '请输入登录密码', trigger: 'blur' }],
        companyId: [{ required: true, message: '请选择公司', trigger: 'blur' }],
        cmdbItemTypeId: [{ required: true, message: '请选择配置类目', trigger: 'blur' }],
        validityTime: [{ required: true, message: '请选择有效期', trigger: 'blur' }]
      },
      loading: false,
      departmentTreeList: [],
      educationList: [],
      confirmLoading: false,
      roles: [],
      userRole: [],
      companyList: [],
      orgTreeList: [],
      eduTreeList: [],
      positionTreeList: [],
      cmdbItemSourceType: 5,
      classifyTreeList: [],
      userList: [],
      passwordType: 'password'
    }
  },
  computed: {
    userId() {
      return this.$route.query.userId
    },
    validityTime() {
      return this.$route.query.validityTime
    },
    hrId() {
      return this.$route.query.hrId
    },
    navTitle() {
      return this.$route.meta.title
    },
    companyId() {
      return Number(this.$route.query.companyId)
    }
  },
  mounted() {
    this.findSysUser()
    this.findSysCompany()
    this.getOrganizationCat()
    this.getPositionCat()
    this.getEducationCat()
    this.findCmdbItemType()
    this.$set(this.form, 'validityTime', (this.$tool.getTimeF(this.validityTime) * 1000))
    if (this.hrId) {
      this.getHrUserInfo().then(res => {
        if (res.model) {
          this.form.realName = res.model.userRealName
          this.form.email = !res.model.email ? '' : res.model.email
          this.form.tel = res.model.mobile
          this.form.organizationCatId = res.model.organizationCatId
          this.form.positionCatId = res.model.positionCatId
          this.form.educationCatId = res.model.educationCatId
          this.form.id = res.model.id
          this.form.cmdbItemTypeId = res.model.cmdbItemTypeId
          this.form.leaderUserId = res.model.leaderUserId

          if (res.model.userId !== '') {
            this.form.userId = res.model.userId
            this.infoSysAdmin().then(res => {
              if (res) {
                this.isLoginUser = true
                this.form.userName = res.model.userName
                this.form.realName = res.model.realName

                this.form.appId = res.model.appId
                this.form.companyId = res.model.companyId
                this.form.tel = res.model.tel
                this.loadUserSysRole()
                this.getSysAppCompany()
                this.loadRoleData()
              } else {
                this.form.userId = 0
              }
            })
          }
        }
      })
    } else if (this.userId) {
      this.form.userId = this.userId
      this.infoSysAdmin().then(res => {
        this.isLoginUser = true
        this.form.userName = res.model.userName
        this.form.realName = res.model.realName
        this.form.email = res.model.email

        this.form.appId = res.model.appId
        this.form.companyId = res.model.companyId
        this.form.tel = res.model.tel
        this.loadUserSysRole()
        this.getSysAppCompany()
        this.loadRoleData()
      })
    } else { // 新增
      this.$set(this.form, 'companyId', this.companyId)
      this.getSysAppCompany()
      this.loadRoleData()
    }
  },
  methods: {
    addTitle(e) {
      let target_el = e.target
      if (target_el.title) return
      target_el.title = target_el.innerText
    },
    onReset() {
      this.$refs['form'].resetFields()
    },
    // 获取当前公司所有角色
    loadRoleData() {
      const that = this
      that.roleData = []
      request({
        url: api.sys.findSysRole, data: { limit: -1, companyId: this.form.companyId }
      }).then(res => {
        res.data.forEach(item => {
          that.$set(that.roleData, that.roleData.length, { key: item.roleId, label: item.roleName })
        })
      })
    },
    // 获取用户角色
    loadUserSysRole() {
      const that = this
      request({
        url: api.sys.findRoleByUser, data: { userId: that.form.userId }
      }).then(res => {
        res.data.forEach(item => {
          that.userRole.push(item.roleId)
          that.currentRoleData.push(item.roleId)
        })
      })
    },
    // 保存
    onSubmit() {
      if (this.userId) { // 编辑用户不修改密码
        delete this.userForm.password
      }

      const formData = { ...this.form }
      formData.educationCatId = formData.educationCatId ? formData.educationCatId[formData.educationCatId.length - 1] || formData.educationCatId : null
      formData.organizationCatId = formData.organizationCatId ? formData.organizationCatId[formData.organizationCatId.length - 1] || formData.organizationCatId : null
      formData.positionCatId = formData.positionCatId ? formData.positionCatId[formData.positionCatId.length - 1] || formData.positionCatId : null
      formData.cmdbItemTypeId = formData.cmdbItemTypeId ? formData.cmdbItemTypeId[formData.cmdbItemTypeId.length - 1] || formData.cmdbItemTypeId : null
      formData.validityTime = this.$tool.formatDate(formData.validityTime)
      // 用户数据
      Object.keys(this.userForm).forEach(key => { this.userForm[key] = formData[key] })
      // 人员数据
      Object.keys(this.hrForm).forEach(key => { this.hrForm[key] = formData[key] })
      this.hrForm.mobile = formData.tel
      this.hrForm.userRealName = formData.realName
      this.hrForm.cmdbItemTypeId = formData.cmdbItemTypeId
      this.hrForm.cmdbItemSourceType = this.cmdbItemSourceType
      this.hrForm.email = formData.email
      this.hrForm.validityTime = formData.validityTime

      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.isLoginUser) { // 可登录
            this.saveSysUser()
          } else { // 不可登录
            this.hrForm.userId = 0
            this.saveUserInfo().then((res) => {
              if (res.code === 1) {
                if (this.userId) {
                  this.deleteSysUser()
                  this.deleteSysUserRole()
                }
                this.$message({
                  type: 'success',
                  message: res.msg
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
        }
      })
    },
    // 删除用户角色
    deleteSysUserRole() {
      request({
        url: api.sys.deleteSysUserRole,
        data: { userId: this.userForm.userId }
      }).then(res => {
        if (res.code === 1) {
          if (this.currentRoleData.length > 0) {
            if (this.isLoginUser) {
              this.insertSysUserRole()
            }
          }
        }
      })
    },
    // 新增用户角色
    insertSysUserRole() {
      for (const item of this.currentRoleData) {
        request({
          url: api.sys.insertSysUserRole,
          data: { classify: 'admin', userId: this.userForm.userId, roleId: item }
        })
      }
    },
    // 保存人员信息
    async saveUserInfo() {
      if (this.hrForm.id === '') {
        delete this.hrForm.id
      }
      return await request({
        url: this.hrId ? api.hr.updateHrUserInfo : api.hr.saveHrUserInfo,
        data: this.hrForm
      }).then(res => {
        return res
      })
    },
    // 保存用户的角色数据
    saveRoleByUser() {
      const that = this
      request({
        url: api.sys.saveRoleByUser,
        data: { userId: this.userForm.userId, roleIds: this.currentRoleData.join(',') }
      }).then(res => {
        that.$notify({
          title: '温馨提示',
          message: res.msg,
          type: res.code === 1 ? 'success' : 'warning',
          onClose: function() {
            if (res.code === 1)that.$router.back()
          }
        })
      })
    },
    // 获取所有公司
    findSysCompany() {
      request({
        url: api.company.findSysCompany, data: {}
      }).then(res => {
        if (res.code === 1) {
          this.companyList = res.data
        }
      })
    },
    // 选择公司
    companyRole(val) {
      this.$set(this.form, 'companyId', val)
      this.getSysAppCompany()
      this.loadRoleData()
    },
    // 根据公司获取appid
    getSysAppCompany() {
      request({
        url: api.sys.getSysAppCompany, data: { companyId: this.form.companyId }
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.form, 'appId', res.model.appId)
        }
      })
    },
    // 获取部门
    getOrganizationCat() {
      request({
        url: api.org.findHyitOrg,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.orgTreeList = listToTree(res.data, 0, 0, 'hyOrgId', 'hyPid')
        }
      })
    },
    // 获取职位
    getPositionCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_职位'}
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          const firstLevel = res.data.findIndex(item => item.catName === '职位')
          this.positionTreeList = listToTree(res.data, res.data[firstLevel].catId, 0, 'catId', 'parentId')
        }
      })
    },
    // 获取学历
    getEducationCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_学历' }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          const firstLevel = res.data.findIndex(item => item.catName === '学历')
          this.eduTreeList = listToTree(res.data, res.data[firstLevel].catId, 0, 'catId', 'parentId')
        }
      })
    },
    // 删除用户
    deleteSysUser() {
      request({
        url: api.sys.deleteSysUser, data: { userId: this.userId }
      })
    },
    // 保存用户
    saveSysUser() {
      const data = this.userForm
      if (data.userId === '') delete data.userId
      data.roleIds = this.currentRoleData.join(',')
      if (this.currentRoleData.length === 0) return this.$message('请选择角色')
      request({
        url: this.userForm.userId ? api.sys.updateSysUser : api.sys.insertSysUser,
        data
      }).then(res => {
        if (res.code === 1) {
          this.userForm.userId = res.model.userId
          if (!this.form.userId) { // 新增用户
            this.hrForm.userId = res.model.userId
            // this.insertSysUserRole()
          } else { // 编辑用户
            // if (this.userRole.length > 0) {
            //   this.deleteSysUserRole()
            // } else {
            //   this.insertSysUserRole()
            // }
          }
          this.saveUserInfo()
          this.$message({
            type: 'success',
            message: res.msg
          })
          this.$router.back()
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      })
    },
    async getHrUserInfo() {
      return await request({ url: api.hr.getHrUserInfo, data: { id: this.$route.query.hrId }}).then(res => { // 查询人员
        if (res.code === 1 && res.model) {
          return res
        }
      })
    },
    async infoSysAdmin() {
      return await request({ url: api.sys.infoSysAdmin, data: { userId: this.form.userId }}).then(res => { // 查询用户
        if (res.code === 1 && res.model) {
          return res
        }
      })
    },
    // 获取类目列表
    findCmdbItemType() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: {
          page: 1,
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          this.classifyTreeList = listToTree(res.data, 0, 0, 'id', 'parentId')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 获取用户列表
    findSysUser() {
      request({
        url: api.sys.findSysUser,
        data: {
          page: 1,
          limit: -1,
          departmentId: this.departmentId,
          educationId: this.educationId,
          companyId: this.$route.query.companyId
        }
      }).then(res => {
        if (res.code === 1) {
          this.userList = res.data
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.show-pwd {
  position: absolute;
  right: 10px;
  top: 50%;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  transform: translateY(-50%);
}
</style>
