<template>
  <div class="app-container">
    <el-card shadow="never">
      <div v-permission="['Search']" class="filter-container no-padding">
        <template v-if="listType === 'all_device' || listType === ''">
          <el-input v-model="findDeviceQuery.keyword" placeholder="请输入设备名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
          <el-select v-model="findDeviceQuery.devType" v-permission="['Search']" placeholder="请选择设备类型" clearable class="filter-item" style="width: 200px">
            <el-option v-for="item in devTypeList" :key="item.id" :label="item.dictdataName" :value="item.id" />
          </el-select>
          <el-button v-permission="['Authorization']" class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button v-permission="['BatchAuthorization']" class="filter-item" type="primary" @click="batchAuth">批量授权</el-button>
        </template>
        <template v-if="(listType === 'auth_device' && listData === 1 || listData === 2 || listData === 4)">
          <el-input v-model="findDeviceQuery.keyword" placeholder="请输入关键字" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
          <el-button v-permission="['Authorization']" class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button v-if=" validRole" v-permission="['BatchCloseAuthorization']" class="filter-item" type="primary" @click="batchCloseAuth">批量取消授权</el-button>

        </template>
      </div>
      <div class="table-wrapper">
        <el-table ref="authDeviceTable" :data="deviceList" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="NO" width="50" />
          <el-table-column label="主机名称" prop="hyMarkName" show-overflow-tooltip />
          <el-table-column label="主机IP" prop="hyIp" show-overflow-tooltip />
          <el-table-column label="主机端口" prop="hyPort" show-overflow-tooltip />
          <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button v-if="listType === 'all_device' || listType === ''" v-permission="['Authorization']" size="mini" type="primary" @click="handlerAuth(row)">
                授权
              </el-button>
              <el-button v-if="listType === 'auth_device' && validRole" v-permission="['CloseAuthorization']" size="mini" type="primary" @click="onCloseAuth(row)">
                取消授权
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="findDeviceQuery.page" :limit.sync="findDeviceQuery.limit" @pagination="loadDeviceList" />
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import deviceAuthMixins from '../../mixins/device-auth-mixins'
import Pagination from '@/components/Pagination'

export default {
  name: 'ItDeviceTable',
  components: { Pagination },
  mixins: [deviceAuthMixins],
  data() {
    return {
      findDeviceQuery: {
        agent: '',
        devType: '',
        keyword: '',
        hostType: 1,
        page: 1,
        limit: 10,
        agents: ''
      },
      total: 0,
      agent: [],
      devTypeList: []
    }
  },
  mounted() {
    this.$set(this.findDeviceQuery, 'agents', this.sessionStorageOperation('get', 'agentId'))
    this.findHyitAgent()
    this.loadItType()
    this.$set(this.insertDeviceAuthParams, 'deviceType', 2)
  },
  methods: {
    // 加载设备
    async loadDeviceList() {
      // 全部设备
      if (this.listType === 'all_device' || this.listType === '') {
        // 加载it监控设备
        const host = await this.findHyitHost({ ...this.findDeviceQuery, authRoleId: this.roleId })
        if (host.code === 1) {
          this.deviceList = host.data
          this.total = Number(host.count)
        }
      } else {
        // 已授权设备
        const deviceAuth = await this.findDeviceAuth({ page: this.findDeviceQuery.page, limit: this.findDeviceQuery.limit, roleId: this.roleId, deviceType: 2, keyword: this.findDeviceQuery.keyword })
        if (deviceAuth.code === 1) {
          const ids = []
          this.total = Number(deviceAuth.count)
          deviceAuth.map.data.forEach(item => {
            ids.push(item.deviceId)
          })
          // const host = await this.findHyitHost({ ids: ids.toString(), limit: -1 })
          // deviceAuth.map.data.forEach(item => {
          //   const idx = host.data.findIndex(hostItem => Number(hostItem.hyHostId) === Number(item.deviceId))
          //   if (idx !== -1) {
          //     item.hyMarkName = host.data[idx].hyMarkName
          //     item.hyIp = host.data[idx].hyIp
          //     item.hyPort = host.data[idx].hyPort
          //     item.hyZhostId = host.data[idx].hyZhostId
          //     item.hyHostId = host.data[idx].hyHostId
          //   }
          // })
          this.deviceList = deviceAuth.map.data
        }
      }
    },
    // 搜索查询
    async search() {
      // const host = await this.findHyitHost(this.findDeviceQuery)
      // if (host.code === 1) {
      //   this.deviceList = host.data
      //   this.total = Number(host.count)
      // }
      this.$set(this.findDeviceQuery, 'page', 1)
      await this.loadDeviceList()
    },
    // it监控设备
    async findHyitHost(data) {
      data.selectCompanyId = this.companyId
      return await request({ url: api.itMonitor.findHyitHost, data })
    },
    // it监控网关
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { limit: -1, agentType: 1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) this.agent = res.data
      })
    },
    // 获取设备类型
    loadItType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    // 选择设备
    handleSelectionChange(val) {
      let extIds = []
      let deviceIds = []
      if (val.length > 0) {
        val.forEach(item => {
          extIds.push(item.hyZhostId)
          if (this.listType === 'all_device' || this.listType === '') {
            deviceIds.push(item.hyHostId)
          } else {
            deviceIds.push(item.id)
          }
        })
      } else {
        extIds = []
        deviceIds = []
      }
      this.batchDeviceIds = deviceIds.toString()
      this.batchExtIds = extIds.toString()
    },
    // 点击授权
    handlerAuth(item) {
      this.handlerItem = item
      this.isBatch = false
      this.$confirm('确认为该角色授权设备吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = { ...this.insertDeviceAuthParams }
        data.extId = this.handlerItem.hyZhostId
        data.deviceId = this.handlerItem.hyHostId
        data.roleId = this.roleId
        data.deviceType = 2
        this.insertDeviceAuth(data)
      })
    },
    // 点击取消授权
    onCloseAuth(item) {
      this.isBatch = false
      this.$confirm('确认取消授权吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteDeviceAuth(item.id)
      }).catch(() => {})
    },
    // 点击批量授权
    batchAuth() {
      this.isBatch = true
      if (this.isBatch && this.batchDeviceIds === '') {
        this.$message('请选择设备')
        return
      }
      this.$confirm('确认为该角色授权设备吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = { ...this.insertDeviceAuthParams }
        data.extIds = this.batchExtIds
        data.deviceIds = this.batchDeviceIds
        data.roleIds = this.roleId
        this.insertDeviceAuth(data)
      })
    },
    // 点击批量取消授权
    batchCloseAuth() {
      this.isBatch = true
      if (this.isBatch && this.batchDeviceIds === '') {
        this.$message('请选择设备')
        return
      }
      this.$confirm('确认取消授权吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteDeviceAuth()
      }).catch(() => {})
    }
  }
}
</script>
