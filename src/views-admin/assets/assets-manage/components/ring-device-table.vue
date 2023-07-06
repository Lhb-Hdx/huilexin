<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="filter-container no-padding">
        <template>
          <el-select v-model="findDeviceQuery.hySbId" placeholder="请选择子系统" clearable class="filter-item" style="width: 200px">
            <el-option v-for="item in subSystemList" :key="item.hySbId" :label="item.hySbName" :value="item.hySbId" />
          </el-select>
          <el-input v-model="findDeviceQuery.hyHostName" placeholder="请输入物联主机名称" clearable style="width: 200px;" class="filter-item" />
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button class="filter-item" type="primary" @click="ibatchInsertAssetsInfos">批量转资产</el-button>
          <el-button class="filter-item" type="primary" @click="batchCloseAuth">批量删除资产</el-button>
        </template>
      </div>
      <div class="table-wrapper">
        <el-table ref="authDeviceTable" :data="deviceList" fit highlight-current-row style="width: 100%" @select="handleSelect" @select-all="handleSelectAll">
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="NO" width="50" />
          <el-table-column label="主机名称" prop="hyHostName" show-overflow-tooltip />
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
      <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="findDeviceQuery.page" :limit.sync="findDeviceQuery.limit" @pagination="loadDeviceList" />
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
  name: 'RingDeviceTable',
  components: { Pagination },
  mixins: [deviceAuthMixins, selectMixin],
  data() {
    return {
      keyField: 'hyHostId', // 设备列表主键id
      listField: 'deviceList', // 设备列表变量名称
      systemDeviceType: 3, // 1视频设备  2it监控设备 3动环设备
      findDeviceQuery: {
        page: 1,
        limit: 10,
        groupid: '',
        keyword: '',
        hyDevTypeId: 2
      },
      total: 0,
      subSystemList: [],
      devTypeList: []
    }
  },
  mounted() {
    this.findHyitSubSystem()
    this.$set(this.insertDeviceAuthParams, 'deviceType', 4)
  },
  methods: {
    // 加载设备
    async loadDeviceList() {
      // 全部设备
      // 加载动环设备
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
    // ids获取动环设备
    async findHyitHostIds(ids) {
      return await request({ url: api.itMonitor.findHyitHost, data: { ids: ids.toString(), hyDevTypeId: 2}})
    },
    // 动环设备
    async findHyitHost(data) {
      data.selectCompanyId = this.companyId
      return await request({ url: api.powerEnv.findHyitHost, data })
    },
    // 查询子系统
    findHyitSubSystem() {
      request({
        url: api.powerEnv.findHyitSubSystem,
        data: {}
      }).then(res => {
        if (res.code === 1) {
          this.subSystemList = res.data
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
        data.assetsName = this.handlerItem.hyHostName
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
      const hostData = await this.findHyitHost({page: 1, limit: -1})
      const dataList = []
      hostData.data.forEach(itemA => {
        this.assetsIds.forEach(itemIds => {
          if (Number(itemA.hyHostId) === Number(itemIds)) {
            this.$set(dataList, dataList.length, itemA)
          }
        })
      })
      const jsonData = []
      dataList.forEach(val => {
        const valList = {}
        valList.assetsName = val.hyHostName
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

<style lang="scss" scoped>

</style>
