import request from '@/utils/request'
import api from '@/api/api'
import { getUserInfo } from '@/utils/auth'

/**
 * @description device-auth-mixins.js
 * @author linhaojia
 * @date 2022/6/28 22:53:05
 */
export default {
  data() {
    return {
      handlerItem: {},
      listType: '',
      batchExtIds: '',
      batchDeviceIds: '',
      insertDeviceAuthParams: {},
      userInfo: getUserInfo(),
      isBatch: false,
      deviceList: [],
      listData: ''
    }
  },
  computed: {
    roleId() {
      return this.$route.query.roleId
    },
    companyId() {
      return this.$route.query.companyId
    },
    validRole() {
      const roleInfo = this.localStorageOperation('get', 'roleInfo')
      console.log(roleInfo)
      let state = true
      roleInfo.forEach(item => {
        if (Number(item.roleId) === Number(this.$route.query.roleId)) {
          state = false
        }
      })
      return state
    }
  },
  mounted() {
    this.loadDeviceList()
    this.$EventBus.$off('handler-list-type')
    this.$EventBus.$on('handler-list-type', (msg) => {
      this.deviceList = []
      this.listType = msg.type
      this.listData = msg.val
      this.$set(this.findDeviceQuery, 'page', 1)
      this.$set(this.findDeviceQuery, 'limit', 10)
      this.loadDeviceList()
    })
  },
  methods: {
    // 查询授权设备
    async findDeviceAuth(query) {
      return await request({ url: api.deviceAuth.findDeviceAuth, data: query })
    },
    // 新增授权
    insertDeviceAuth(data) {
      request({ url: api.deviceAuth.insertDeviceAuth, data })
        .then(res => {
          if (res.code === 1) {
            this.$message.success(res.msg)
            this.$refs.authDeviceTable.clearSelection()
            this.batchDeviceIds = ''
            this.batchExtIds = ''
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    // 删除授权
    deleteDeviceAuth(id) {
      const apiName = this.isBatch ? api.deviceAuth.deleteDeviceAuthByIds : api.deviceAuth.deleteDeviceAuth
      const data = this.isBatch ? { ids: this.batchDeviceIds } : { id: id }
      request({ url: apiName, data }).then(res => {
        if (res.code === 1) {
          this.loadDeviceList()
          this.$message.success(res.msg)
          this.$refs.authDeviceTable.clearSelection()
          this.batchDeviceIds = ''
        }
      })
    }
  }
}
