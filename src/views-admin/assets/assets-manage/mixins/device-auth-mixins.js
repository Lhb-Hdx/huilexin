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
      deviceList: []
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
  },
  methods: {
    // 查询授权设备
    async findDeviceAuth(query) {
      return await request({ url: api.deviceAuth.findDeviceAuth, data: query })
    },
    // 查询资产表
    async findAssetsInfo() {
      const res = await request({
        url: api.assets.findAssetsInfo,
        data: {page: 1, limit: -1}
      })
      if (res.code !== 1) return
      return res.data
    },
    // 新增转资产
    insertAssetsInfo(data) {
      request({ url: api.assets.insertAssetsInfo, data })
        .then(res => {
          if (res.code === 1) {
            this.$message.success(res.msg)
            this.$refs.authDeviceTable.clearSelection()
            this.batchDeviceIds = ''
            this.batchExtIds = ''
            this.allSelection = []
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    // 删除资产
    deleteAssetsInfo(id) {
      const apiName = this.isBatch ? api.assets.deleteAssetsInfoByIds : api.assets.deleteAssetsInfo
      const data = this.isBatch ? { ids: this.batchDeviceIds } : { assetsId: id }
      request({ url: apiName, data }).then(res => {
        if (res.code === 1) {
          this.loadDeviceList()
          this.$message.success(res.msg)
          this.$refs.authDeviceTable.clearSelection()
          this.batchDeviceIds = ''
          this.allSelection = []
        }
      })
    },
    // 批量新增资产
    insertAssetsInfos(data) {
      request({
        url: api.assets.insertAssetsInfos,
        data: { json: data }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.$refs.authDeviceTable.clearSelection()
          this.loadDeviceList()
          this.assetsIds = []
          this.allSelection = []
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 批量删除资产
    deleteAssetsInfos(data) {
      request({
        url: api.assets.deleteAssetsInfos,
        data: { assetsIds: data }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.$refs.authDeviceTable.clearSelection()
          this.loadDeviceList()
          this.assetStatusId = []
          this.allSelection = []
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
