<template>
  <div class="app-container">
    <el-card shadow="never">
      <div v-permission="['Search']" class="filter-container no-padding">
        <template v-if="listType === 'all_device' || listType === ''">
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
          <el-button v-permission="['Authorization']" class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button v-permission="['BatchAuthorization']" class="filter-item" type="primary" @click="batchAuth">批量授权</el-button>
        </template>
        <template v-if="(listType === 'auth_device' && listData === 1 || listData === 2 || listData === 4)">
          <el-input v-model="findDeviceQuery.keyword" placeholder="请输入关键字" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
          <el-button v-permission="['Authorization']" class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
        </template>
      </div>
      <div class="table-wrapper">
        <el-table ref="authDeviceTable" :data="deviceList" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="NO" width="50" />
          <el-table-column label="设备名称" prop="dvrName">
            <template slot-scope="{row}">
              {{ row.title }} {{ row.cname }}
            </template>
          </el-table-column>
          <el-table-column label="IP" prop="ip" />
          <el-table-column label="区域" width="200">
            <template slot-scope="{row}">
              {{ setArea(row.orgId) }}
            </template>
          </el-table-column>
          <el-table-column label="通道名" prop="cname" />
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
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="findDeviceQuery.page" :limit.sync="findDeviceQuery.limit" @pagination="loadDeviceList" />
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import deviceAuthMixins from '../../mixins/device-auth-mixins'

export default {
  name: 'VideoDeviceTable',
  components: { Pagination },
  mixins: [deviceAuthMixins],
  data() {
    return {
      findDeviceQuery: {
        title: '',
        ip: '',
        status: '',
        devTypeId: '',
        orgId: '',
        page: 1,
        limit: 10,
        keyword: ''
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
      if (this.listType === 'all_device' || this.listType === '') {
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
        this.deviceList = chn.data
        this.total = Number(chn.count)
      } else {
        // 已授权设备
        const deviceAuth = await this.findDeviceAuth({ page: this.findDeviceQuery.page, limit: this.findDeviceQuery.limit, roleId: this.roleId, deviceType: 1, keyword: this.findDeviceQuery.keyword })
        if (deviceAuth.code === 1) {
          // const ids = []
          this.total = Number(deviceAuth.count)
          // deviceAuth.map.data.forEach(item => { ids.push(item.deviceId) })
          // const chn = await this.findVideoChn({ ids: ids.toString() })
          // if (chn.code !== 1 && !chn.data && chn.data.length < 1) return
          // const dvrIds = []
          // chn.data.forEach(chnItem => { dvrIds.push(chnItem.dvrId) })
          // const dvr = await this.findVideoDvr(dvrIds.toString())
          // deviceAuth.map.data.forEach(item => {
          //   const chnIdx = chn.data.findIndex(chnItem => Number(chnItem.cid) === Number(item.deviceId))
          //   const dvrIdx = dvr.data.findIndex(chnItem => Number(chnItem.dvrId) === Number(item.extId))
          //   if (chnIdx !== -1) {
          //     item.cname = chn.data[chnIdx].cname
          //   }
          //   if (dvrIdx !== -1) {
          //     item.dvrName = dvr.data[dvrIdx].title
          //     item.ip = dvr.data[dvrIdx].ip
          //     item.orgId = dvr.data[dvrIdx].orgId
          //   }
          // })
          this.deviceList = deviceAuth.map.data
          this.total = Number(deviceAuth.count)
        }
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
    // 选择设备
    handleSelectionChange(val) {
      let extIds = []
      let deviceIds = []
      if (val.length > 0) {
        val.forEach(item => {
          extIds.push(item.dvrId)
          if (this.listType === 'all_device' || this.listType === '') {
            deviceIds.push(item.cid)
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
        data.extId = this.handlerItem.dvrId
        data.deviceId = this.handlerItem.cid
        data.roleId = this.roleId
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
    },
    // 搜索
    search() {
      this.$set(this.findDeviceQuery, 'page', 1)
      this.loadDeviceList()
    }
  }
}
</script>
