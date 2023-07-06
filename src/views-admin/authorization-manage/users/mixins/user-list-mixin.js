import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import VideoDeviceTable from '../components/auth-device-table/video-device-table'
import { guid } from '@/utils/utils'
import { getVuexStoragePermission } from '@/utils/auth'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  components: { VideoDeviceTable, Pagination, ListControl },
  props: {
    isUserDataProp: {
      type: Boolean,
      default: true
    },
    cmdbItemTypeId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      isLoginUser: true,
      listLoading: false,
      showImportExcelDialog: false,
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10
      },
      departmentId: 0,
      educationId: 0,
      list: [],
      listTotal: 0,
      departmentList: [],
      educationList: [],
      companyList: [],
      fileList: [],
      companyId: '',
      showDialog: false,
      resetPasswordQuery: {
        userId: '',
        password: ''
      },
      isUserData: 'user', // user hr
      showAuthDialog: false,
      authDevice: [],
      activeDeviceType: '1',
      deviceTypeTab: [
        { label: '视频设备', value: '1', pKey: 'UserVideoDeviceAuth' },
        { label: 'IT监控设备', value: '2', pKey: 'UserItMonitorDeviceAuth' },
        { label: 'IT运维设备', value: '3', pKey: 'UserOpsDeviceAuth' },
        { label: '动环设备', value: '4', pKey: 'UserRingDeviceAuth' },
        { label: '资产设备', value: '5', pKey: 'UserAssetsDeviceAuth' }
      ],
      handlerUserAuth: '',
      updateKey: '',
      getVuexStoragePermissionData: [],
      synchLoading: false,
      showResetPwdDialog: false,
      resetPwdForm: {
        newPwd: '',
        confirmPwd: ''
      },
      resetPwdFormRules: {
        newPwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' }
        ],
        confirmPwd: [
          { required: true, message: '请确认新密码', trigger: 'blur' }
        ]
      },
      newPasswordType: 'password',
      confirmPasswordType: 'password',
      // 显示控制数据 start
      checkList: ['ID', '用户名称', '用户姓名', '用户角色', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  created() {
    if (this.isUserDataProp !== undefined) {
      this.isUserData = this.isUserDataProp
      this.isLoginUser = this.isUserDataProp
    }
    this.companyId = getUserSession().companyId
    console.log('companyId', getUserSession())
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      this.isLoginUser = pageQuery.isLoginUser
      delete pageQuery.route
      delete pageQuery.isLoginUser
      this.listQuery = pageQuery
    }
    this.onLoadData()
    this.findSysCompany()
  },
  mounted() {
    this.getVuexStoragePermissionData = getVuexStoragePermission()
    if (this.getVuexStoragePermissionData.length === 0) {
      this.slider = []
      this.activeDeviceType = ''
    } else {
      const getSlide = this.deviceTypeTab
      const result = []
      getSlide.forEach(item => {
        const getPItem = this.getVuexStoragePermissionData.indexOf(item.pKey)
        if (getPItem !== -1) {
          result.push(item)
        }
      })
      this.deviceTypeTab = result
    }
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    onLoadData() {
      const that = this
      this.listLoading = true
      const apiName = this.isLoginUser ? api.sys.findSysUser : api.hr.findHrUserInfo
      if (this.isLoginUser) {
        this.listQuery = {
          ...this.listQuery, departmentId: this.departmentId, educationId: this.educationId, companyId: this.companyId
        }
      } else {
        delete this.listQuery.departmentId
        delete this.listQuery.educationId
        this.listQuery = {
          ...this.listQuery, companyId: this.companyId
        }
      }
      request({ url: apiName, data: this.listQuery })
        .then(res => {
          this.isUserData = this.isLoginUser
          this.list = []
          const userIds = []
          res.data.forEach(item => {
            item.roles = []
            if (!this.isUserData) {
              item.realName = item.userRealName
              item.userId = item.id
            }
            that.list.push(item)
            userIds.push(item.userId)
          })
          this.listTotal = +res.count
          this.listLoading = false
          if (this.isUserData && userIds.length > 0) {
            request({
              url: api.sys.findRoleByUser, data: { userId: userIds.join(',') }
            }).then(res2 => {
              res2.data.forEach(item2 => {
                that.list.forEach(item => {
                  if (parseFloat(item.userId) === parseFloat(item2.userId)) {
                    item.roles.push(item2.roleName)
                  }
                })
              })
            })
          }
          this.$nextTick(() => {
            this.initTable && this.initTable()
          })
        })
    },
    onLoadDepartment() {
      request({
        url: api.department.departmentList, data: { limit: -1 }
      }).then(res => {
        this.departmentList = res.data
      })
    },
    onLoadEducation() {
      request({
        url: api.education.educationList, data: { limit: -1 }
      }).then(res => {
        this.educationList = res.data
      })
    },
    handleSizeChange(limit) {
      this.page = 1
      this.limit = limit
      this.onLoadData()
    },
    handleCurrentChange(val) {
      this.listQuery.limit = val.limit
      this.onLoadData()
    },
    onSearch() {
      if (this.isUserData !== this.isLoginUser) this.listQuery.page = 1
      this.onLoadData()
    },
    onSynchronization() { // 同步所有第三方的系统去
      this.synchLoading = true
      request({
        url: api.unify.indentificationAllUserSynchronization, data: { limit: -1 }
      }).then(() => {
        this.synchLoading = false
      })
    },
    // 批量导入
    handleImprotExcel() {
      this.fileList = []
      this.showImportExcelDialog = true
    },
    // 上传文件
    upload(param) {
      this.formData = new FormData()
      this.formData.append('uploadfile', param.file)
      this.formData.append('company_id', this.companyId)
    },
    async onImprotExcel() {
      try {
        const { data, code } = await request({ url: api.sys.importSysUser, form: this.formData })
        if (code !== 1) return
        if (data.length <= 0) return this.$message.warning('excel表为空/或使用模板不对')
        this.$message.success('导入成功')
        this.onLoadData()
      } catch (error) {
        this.$message.error('导入失败')
      } finally {
        this.showImportExcelDialog = false
      }
    },
    onCreate() { // 新增
      // 记录跳转前的页数
      const data = { ...this.listQuery, isLoginUser: this.isLoginUser }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'UsersCreate',
        query: {
          companyId: this.companyId
        }
      })
    },
    onEdit(row) { // 编辑
      const that = this
      const data = { ...this.listQuery, isLoginUser: this.isLoginUser }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      if (this.isLoginUser) {
        request({ url: api.hr.findHrUserInfo, data: { page: 1, limit: -1, userId: row.userId }}).then(res => {
          const query = { userId: row.userId || 0, validityTime: row.validityTime || ''}
          console.log(row.userId)
          if (res.data.length > 0) {
            query.hrId = res.data[0].id
          }
          that.$router.push({
            name: 'UsersUpdate',
            query
          })
        })
      } else {
        this.$router.push({
          name: 'UsersUpdate',
          query: {
            hrId: row.userId || 0,
            validityTime: row.validityTime || ''
          }
        })
      }
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(
        () => {
          const apiName = this.isLoginUser ? api.sys.deleteSysUser : api.hr.deleteHrUserInfo
          const data = this.isLoginUser ? { userId: row.userId } : { id: row.userId }
          request({
            url: apiName, data
          }).then(res => {
            if (res.code === 1) {
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
              this.onLoadData()
            }
          }).finally(() => {
            this.loading = false
          })
        },
        () => {}
      )
    },
    findSysCompany() {
      request({
        url: api.company.findSysCompany, data: {}
      }).then(res => {
        if (res.code === 1) {
          this.companyList = res.data
        }
      })
    },
    onResetPassword(val) {
      this.$set(this.resetPasswordQuery, 'userId', val.userId)
      this.showResetPwdDialog = true
    },
    onAuthDevice(item) {
      this.showAuthDialog = true
      this.handlerUserAuth = item.userId
      this.updateKey = guid()
    },
    handleClick(val) {
      this.activeDeviceType = val.name
    },
    closeResetPwdDialog() {
      this.showResetPwdDialog = false
      this.$set(this.resetPwdForm, 'newPwd', '')
      this.$set(this.resetPwdForm, 'confirmPwd', '')
    },
    saveResetPwd() {
      if (this.resetPwdForm.newPwd !== this.resetPwdForm.confirmPwd) {
        this.$message('两次密码不一致')
        return
      }
      this.$set(this.resetPasswordQuery, 'password', this.resetPwdForm.newPwd)
      request({
        url: api.sys.resetPassword, data: this.resetPasswordQuery
      }).then(res => {
        this.$notify({
          title: '成功',
          message: res.msg,
          type: 'success',
          duration: 2000
        })
        this.onLoadData()
        this.showResetPwdDialog = false
      }).finally(() => {
        this.loading = false
      })
    },
    showPwd(attr) {
      if (this[`${attr}`] === 'password') {
        this[`${attr}`] = ''
      } else {
        this[`${attr}`] = 'password'
      }
    }
  }
}
