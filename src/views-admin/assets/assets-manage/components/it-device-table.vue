<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="filter-container no-padding">
        <template>
          <el-input v-model="findDeviceQuery.keyword" placeholder="请输入设备名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
          <el-select v-model="findDeviceQuery.devType" placeholder="请选择设备类型" clearable class="filter-item" style="width: 200px">
            <el-option v-for="item in devTypeList" :key="item.id" :label="item.dictdataName" :value="item.id" />
          </el-select>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button class="filter-item" type="primary" @click="ibatchInsertAssetsInfos">批量转资产</el-button>
          <el-button class="filter-item" type="primary" @click="batchCloseAuth">批量删除资产</el-button>

        </template>
      </div>
      <div class="table-wrapper">
        <el-table ref="authDeviceTable" :data="deviceList" fit highlight-current-row style="width: 100%" @select="handleSelect" @select-all="handleSelectAll">
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="NO" width="50" />
          <el-table-column label="主机名称" prop="hyMarkName" show-overflow-tooltip />
          <el-table-column label="主机IP" prop="hyIp" show-overflow-tooltip />
          <el-table-column label="主机端口" prop="hyPort" show-overflow-tooltip />
          <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button v-if="row.assetStatus !== 1" size="mini" type="primary" @click="handlerAuth(row)">
                新增资产
              </el-button>
              <el-button v-if="row.assetStatus === 1" size="mini" type="success" @click="onCloseAuth(row)">
                删除资产
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="total > 0" :total="total" :auto-scroll="false" :page.sync="findDeviceQuery.page" :limit.sync="findDeviceQuery.limit" @pagination="loadDeviceList" />
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import deviceAuthMixins from '../mixins/device-auth-mixins'
import Pagination from '@/components/Pagination'
import selectMixin from '@/views-admin/activiti/mixin/selectMixin'

export default {
  name: 'ItDeviceTable',
  components: { Pagination },
  mixins: [deviceAuthMixins, selectMixin],
  data() {
    return {
      keyField: 'hyHostId', // 设备列表主键id
      listField: 'deviceList', // 设备列表变量名称
      systemDeviceType: 2, // 1视频设备  2it监控设备 3动环设备
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
      devTypeList: [],
      batchDeviceIds: ''
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
      // 加载it监控设备
      const host = await this.findHyitHost({ ...this.findDeviceQuery, authRoleId: this.roleId })
      if (host.code === 1) {
        const infoData = await this.findAssetsInfo()
        host.data.forEach(item => {
          infoData.forEach(num => {
            if (Number(item.hyHostId) === Number(num.systemDeviceId)) {
              this.$set(item, 'assetStatus', 1)
              this.$set(item, 'assetStatusId', num.assetsId)
            }
          })
        })

        this.deviceList = host.data
        this.total = Number(host.count)

        if (this.allSelection.length > 0) {
          this.allSelection.forEach(itemList => {
            this.$nextTick(() => {
              host.data.forEach(dataList => {
                if (Number(itemList.hyHostId) === Number(dataList.hyHostId)) {
                  this.$refs['authDeviceTable'].toggleRowSelection(dataList, true)
                }
              })
            })
          })
        }
      }
    },
    // 搜索查询
    async search() {
      const host = await this.findHyitHost(this.findDeviceQuery)
      if (host.code === 1) {
        this.deviceList = host.data
        this.total = Number(host.count)
      }
    },
    // 获取it监控设备
    async findHyitHostIds(ids) {
      return await request({ url: api.itMonitor.findHyitHost, data: { ids: ids.toString()}})
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
    // 点击转资产
    handlerAuth(item) {
      console.log(item)
      this.handlerItem = item
      this.isBatch = false
      this.$confirm('确认将该设备转为资产吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const data = { ...this.insertDeviceAuthParams }
        data.assetsName = this.handlerItem.hyMarkName
        data.cmdbItemTypeId = 12 // 固定新增为‘资产’，代号 12
        data.systemDeviceId = this.handlerItem.hyHostId
        data.systemDeviceType = this.systemDeviceType
        await this.insertAssetsInfo(data)
        this.loadDeviceList()
      })
    },
    // 点击删除转资产
    onCloseAuth(item) {
      console.log(item)
      this.isBatch = false
      this.$confirm('确认将该设备从资产中移除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteAssetsInfo(item.assetStatusId)
      }).catch(() => {})
    },
    // 点击批量授权
    async ibatchInsertAssetsInfos() {
      this.isBatch = true
      if (this.isBatch && this.allSelection.length < 1) {
        this.$message('请选择设备')
        return
      }
      let haveUse = false
      const assetsIds = []
      this.allSelection.forEach(item => {
        if (item.assetStatus) haveUse = true
        assetsIds.push(item.hyHostId)
      })
      this.assetsIds = Array.from(new Set(assetsIds))
      if (haveUse) return this.$message('选择的设备包含已转资产设备，请先取消已转资产设备')
      const dataList = await this.findHyitHostIds(this.assetsIds.toString())
      const jsonData = []
      dataList.data.forEach(val => {
        const valList = {}
        valList.assetsName = val.hyMarkName
        valList.cmdbItemTypeId = 12
        valList.systemDeviceId = val.hyHostId
        valList.systemDeviceType = this.systemDeviceType
        jsonData.push(valList)
      })
      const jsonList = JSON.stringify(jsonData)
      this.$confirm('确认为该角色授权设备吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.insertAssetsInfos(jsonList)
      })
    },
    // 点击批量取消授权
    batchCloseAuth() {
      this.isBatch = true
      if (this.isBatch && this.allSelection.length < 1) {
        this.$message('请选择设备')
        return
      }
      let isUse = false
      const assetStatusId = []
      this.allSelection.forEach(item => {
        if (!item.assetStatus) isUse = true
        assetStatusId.push(item.assetStatusId)
      })
      this.assetStatusId = Array.from(new Set(assetStatusId))
      if (isUse) return this.$message('选择的设备包含未转资产设备，请先取消未转资产设备')

      this.$confirm('确认取消授权吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteAssetsInfos(this.assetStatusId)
      }).catch(() => {})
    }
  }
}
</script>
