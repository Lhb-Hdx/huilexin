<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="filter-container no-padding">
        <template>
          <el-input v-model="findDeviceQuery.title" placeholder="请输入设备名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
          <el-input v-model="findDeviceQuery.ip" placeholder="请输入IP" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
          <el-select v-model="findDeviceQuery.status" clearable placeholder="请选择设备状态" class="filter-item">
            <el-option
              v-for="item in statusArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select v-model="findDeviceQuery.devTypeId" clearable placeholder="请选择设备类型" class="filter-item">
            <el-option label="所有类型" value="" />
            <el-option
              v-for="item in typeArr"
              :key="item.hyDevTypeId"
              :label="item.hyDevTypeName"
              :value="item.hyDevTypeId"
            />
          </el-select>
          <el-select v-model="findDeviceQuery.orgId" clearable placeholder="请选择区域" class="filter-item">
            <el-option label="所有区域" value="" />
            <el-option
              v-for="item in areaArr"
              :key="item.hyAreaId"
              :label="item.hyAreaName"
              :value="item.hyAreaId"
            />
          </el-select>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="loadDeviceList">查询</el-button>
          <el-button class="filter-item" type="primary" @click="batchInsertAssetsInfos">批量新增资产</el-button>
          <el-button class="filter-item" type="primary" @click="batchCloseAuth">批量删除资产</el-button>
        </template>
      </div>
      <div class="table-wrapper">
        <el-table ref="authDeviceTable" :data="deviceList" fit highlight-current-row style="width: 100%" @select="handleSelect" @select-all="handleSelectAll">
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="NO" width="50" />
          <el-table-column label="设备名称" prop="dvrName" />
          <el-table-column label="IP" prop="ip" />
          <el-table-column label="区域" width="200">
            <template slot-scope="{row}">
              {{ setArea(row.orgId) }}
            </template>
          </el-table-column>
          <el-table-column label="通道名" prop="cname" />
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
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="findDeviceQuery.page" :limit.sync="findDeviceQuery.limit" @pagination="loadDeviceList" />
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import deviceAuthMixins from '../mixins/device-auth-mixins'
import selectMixin from '@/views-admin/activiti/mixin/selectMixin'

export default {
  name: 'VideoDeviceTable',
  components: { Pagination },
  mixins: [deviceAuthMixins, selectMixin],
  data() {
    return {
      keyField: 'cid', // 设备列表主键id
      listField: 'deviceList', // 设备列表变量名称
      systemDeviceType: 1, // 1视频设备  2it监控设备 3动环设备
      assetsIds: [],
      assetStatusId: [],
      findDeviceQuery: {
        title: '',
        ip: '',
        status: '',
        devTypeId: '',
        orgId: '',
        page: 1,
        limit: 10
      },
      total: 0,
      videoChnList: [],
      chnDvrList: [],
      areaArr: [],
      showDialog: false,
      form: {
        deviceType: 1
      },
      batchExtIds: '',
      batchDeviceIds: '',
      handlerItem: {},
      // 状态
      statusArr: [
        {
          value: '',
          label: '全部'
        },
        {
          value: 1,
          label: '在线'
        },
        {
          value: 0,
          label: '离线'
        }
      ],
      // 类型
      typeArr: [],
      authDevice: []
    }
  },
  computed: {
    // 区域
    setArea() {
      const that = this
      return function(orgId) {
        const idx = that.areaArr.findIndex(item => item.hyAreaId === orgId)
        if (idx !== -1) {
          return that.areaArr[idx].hyAreaName
        }
      }
    }
  },
  mounted() {
    this.getAreaArr()
    this.getTypeArr()
    this.$set(this.insertDeviceAuthParams, 'deviceType', 1)
  },
  methods: {
    // 加载设备
    async loadDeviceList() {
      // 全部设备
      const chn = await this.findVideoChn({ gid: this.gid, ...this.findDeviceQuery, selectCompanyId: this.companyId, authRoleId: this.roleId })
      if (chn.code !== 1 && !chn.data && chn.data.length < 1) return
      const dvrIds = []
      chn.data.forEach(chnItem => { dvrIds.push(chnItem.dvrId) })
      const dvr = await this.findVideoDvr(dvrIds.toString())
      chn.data.forEach(chnItem => {
        const idx = dvr.data.findIndex(item => Number(item.dvrId) === Number(chnItem.dvrId))
        if (idx !== -1) {
          chnItem.dvrName = dvr.data[idx].title
          chnItem.ip = dvr.data[idx].ip
          chnItem.orgId = dvr.data[idx].orgId
        }
      })
      const infoData = await this.findAssetsInfo()
      chn.data.forEach(item => {
        infoData.forEach(num => {
          if (Number(item.dvrId) === Number(num.systemDeviceId)) {
            this.$set(item, 'assetStatus', 1)
            this.$set(item, 'assetStatusId', num.assetsId)
          }
        })
      })
      this.deviceList = chn.data
      this.total = Number(chn.count)
      if (this.allSelection.length > 0) {
        this.allSelection.forEach(itemList => {
          this.$nextTick(() => {
            chn.data.forEach(dataList => {
              if (Number(itemList.cid) === Number(dataList.cid)) {
                this.$refs['authDeviceTable'].toggleRowSelection(dataList, true)
              }
            })
          })
        })
      }
    },
    // 获取通道
    async findVideoChn(data) {
      return await request({ url: api.video.findVideoChn, data })
    },
    // 获取通道dvr
    async findVideoDvr(ids) {
      return await request({ url: api.video.findVideoDvr, data: { ids: ids.toString(), selectCompanyId: this.companyId }})
    },
    // 获取类型select
    getTypeArr() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'video_dev_type', limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].hyDevTypeId = res.data[i].id
              res.data[i].hyDevTypeName = res.data[i].dictdataName
            }
            this.typeArr = res.data
          }
        })
    },
    // 获取区域
    getAreaArr() {
      request({ url: api.area.findHyitArea, data: {}}).then(res => {
        if (res.code === 1) {
          this.areaArr = res.data
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
        data.assetsName = this.handlerItem.dvrName
        data.cmdbItemTypeId = 12 // 固定新增为‘资产’，代号 12
        data.systemDeviceId = this.handlerItem.dvrId
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
    // 点击批量转资产
    async batchInsertAssetsInfos() {
      this.isBatch = true
      if (this.isBatch && this.allSelection.length < 1) {
        this.$message('请选择设备')
        return
      }

      let haveUse = false
      const assetsIds = []
      this.allSelection.forEach(item => {
        if (item.assetStatus) haveUse = true
        assetsIds.push(item.dvrId)
      })
      this.assetsIds = Array.from(new Set(assetsIds))
      if (haveUse) return this.$message('选择的设备包含已转资产设备，请先取消已转资产设备')
      const dataList = await this.findVideoDvr(this.assetsIds.toString())
      const jsonData = []
      dataList.data.forEach(val => {
        const valList = {}
        valList.assetsName = val.title
        valList.cmdbItemTypeId = 12
        valList.systemDeviceId = val.dvrId
        valList.systemDeviceType = this.systemDeviceType
        jsonData.push(valList)
      })
      const jsonList = JSON.stringify(jsonData)
      this.$confirm('确认将所选设备转为资产吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.insertAssetsInfos(jsonList)
      })
    },
    // 点击批量删除转资产
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
