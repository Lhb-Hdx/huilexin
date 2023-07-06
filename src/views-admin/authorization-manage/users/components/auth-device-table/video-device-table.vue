<template>
  <div class="app-container">
    <div v-if="userId !== userInfo.userId" v-permission="['BatchCancelAuthDevice']" class="filter-container no-padding">
      <el-button class="filter-item" type="primary" @click="batchAuth">批量取消授权</el-button>
    </div>
    <div class="table-wrapper">
      <el-table ref="authDeviceTable" :data="authDevice" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column v-if="userId !== userInfo.userId" type="selection" width="55" />
        <el-table-column type="index" label="NO" width="50" />
        <el-table-column label="设备名称">
          <template slot-scope="{row}">
            {{ setTableField(row.extId, 'dvrList', 'dvrId', 'title') }}
          </template>
        </el-table-column>
        <el-table-column label="IP">
          <template slot-scope="{row}">
            {{ setTableField(row.extId, 'dvrList', 'dvrId', 'ip') }}
          </template>
        </el-table-column>
        <el-table-column label="区域" width="200">
          <template slot-scope="{row}">
            {{ setArea(row.extId) }}
          </template>
        </el-table-column>
        <el-table-column label="通道名">
          <template slot-scope="{row}">
            {{ setTableField(row.deviceId, 'chnList', 'cid', 'cname') }}
          </template>
        </el-table-column>
        <el-table-column v-if="userId !== userInfo.userId" v-permission="['CancelAuthDevice']" label="操作" align="center" width="140" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button size="mini" type="primary" @click="onCloseAuth(row)">
              取消授权
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="findDeviceAuthQuery.page" :limit.sync="findDeviceAuthQuery.limit" @pagination="findDeviceAuth" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import { getUserInfo } from '@/utils/auth'

export default {
  name: 'VideoDeviceTable',
  components: { Pagination },
  props: {
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      areaArr: [],
      authDevice: [],
      chnList: [],
      dvrList: [],
      findDeviceAuthQuery: {
        page: 1,
        limit: 10
      },
      total: 0,
      isBatch: false,
      batchDeviceIds: '',
      userInfo: getUserInfo()
    }
  },
  computed: {
    setTableField() {
      return function(id, dataName, idField, field) {
        const data = dataName === 'dvrList' ? this.dvrList : this.chnList
        const idx = data.findIndex(item => item[`${idField}`] === id)
        if (idx !== -1) {
          return data[idx][`${field}`]
        }
      }
    },
    setArea() {
      return function(id) {
        const dvrIdx = this.dvrList.findIndex(item => item.dvrId === id)
        if (dvrIdx !== -1) {
          const areaIdx = this.areaArr.findIndex(item => item.hyAreaId === this.dvrList[dvrIdx].orgId)
          if (areaIdx !== -1) {
            return this.areaArr[areaIdx].hyAreaName
          }
        }
      }
    }
  },
  mounted() {
    this.findDeviceAuth()
    this.getAreaArr()
  },
  methods: {
    handleSelectionChange(val) {
      const ids = []
      val.forEach(item => {
        ids.push(item.id)
      })
      this.batchDeviceIds = ids.toString()
    },
    // 获取区域
    getAreaArr() {
      request({ url: api.area.findHyitArea, data: {}}).then(res => {
        if (res.code === 1) {
          this.areaArr = res.data
        }
      })
    },
    findDeviceAuth() {
      request({
        url: api.deviceAuth.findDeviceAuth, data: {
          ...this.findDeviceAuthQuery,
          userId: this.userId
        }
      }).then(res => {
        if (res.code === 1) {
          const chnIds = []
          const dvrIds = []
          this.authDevice = res.data
          this.total = Number(res.count)
          this.authDevice.forEach(item => { chnIds.push(item.deviceId) })
          request({ url: api.video.findVideoChn, data: { ids: chnIds.toString() }}).then(chnRes => {
            if (chnRes.code === 1) {
              if (chnRes.data) {
                this.chnList = chnRes.data
              }
            }
          })
          this.authDevice.forEach(item => { dvrIds.push(item.extId) })
          request({ url: api.video.findVideoDvr, data: { ids: dvrIds.toString() }}).then(dvrRes => {
            if (dvrRes.code === 1) {
              if (dvrRes.data) {
                this.dvrList = dvrRes.data
              }
            }
          })
        }
      })
    },
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
    deleteDeviceAuth(id) {
      const apiName = this.isBatch ? api.deviceAuth.deleteDeviceAuthByIds : api.deviceAuth.deleteDeviceAuth
      const data = this.isBatch ? { ids: this.batchDeviceIds } : { id: id }
      request({ url: apiName, data }).then(res => {
        if (res.code === 1) {
          this.findDeviceAuth()
          this.$message.success(res.msg)
          this.$refs.authDeviceTable.clearSelection()
          this.batchDeviceIds = ''
        }
      })
    },
    batchAuth() {
      this.isBatch = true
      if (this.isBatch && this.batchDeviceIds === '') {
        this.$message('请选择设备')
        return
      }
      this.deleteDeviceAuth()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
