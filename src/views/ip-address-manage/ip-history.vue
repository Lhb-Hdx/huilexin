<template>
  <div class="app-container" style="padding-top:0">
    <div class="filter-container">
      <el-select v-model="findOpsIpAddressLogQuery.logType" clearable placeholder="请选择类型" class="filter-item" style="width: 200px">
        <el-option v-for="item in logTypeList" :key="item.id" :label="item.value" :value="item.id" />
      </el-select>
      <el-input v-model="findOpsIpAddressLogQuery.keyword" placeholder="请输入名称或IP地址" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="logData"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="IP地址" prop="ip" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="MAC" prop="mac" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="日期" prop="createTime" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="日志类型" align="left" width="100" prop="logType" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setlogType(row) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="设备类型" align="left" width="100" prop="deviceType" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setIpBindDeviceType(row) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="描述" align="left" width="350" prop="ipLog" show-overflow-tooltip />
      </el-table>
      <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="findOpsIpAddressLogQuery.page" :limit.sync="findOpsIpAddressLogQuery.limit" @pagination="findOpsIpAddressLog" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'IpHistory',
  components: {
    Pagination, ListControl
  },
  data() {
    return {
      findOpsIpAddressLogQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        logType: ''
      },
      logData: [],
      total: 0,
      itDeviceType: [],
      opsDeviceType: [],
      videoType: [],
      logTypeList: [
        { id: 1, value: '事件' },
        { id: 2, value: '告警' }
      ],
      // 显示控制数据 start
      checkList: ['IP地址', 'MAC', '日期', '日志类型', '设备类型', '描述'],
      lists: [],
      storageVal: 'ip-address-manage-history' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  computed: {
    // 计算绑定的设备类型
    setIpBindDeviceType() {
      return function(row) {
        if (row.deviceModelType === 1) {
          const idx = this.itDeviceType.findIndex(item => item.id === row.deviceType)
          if (idx !== -1) return this.itDeviceType[idx].dictdataName
        } else if (row.deviceModelType === 2) {
          const idx = this.opsDeviceType.findIndex(item => item.id === row.deviceType)
          if (idx !== -1) return this.opsDeviceType[idx].dictdataName
        } else if (row.deviceModelType === 4) {
          const idx = this.videoType.findIndex(item => item.id === row.deviceType)
          if (idx !== -1) return this.videoType[idx].dictdataName
        } else {
          return ''
        }
      }
    },
    setlogType() {
      return function(row) {
        const idx = this.logTypeList.findIndex(item => item.id === row.logType)
        return idx !== -1 ? this.logTypeList[idx].value : ''
      }
    }
  },
  mounted() {
    this.findOpsIpAddressLog()
    this.getDeviceType()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    handleFilter() {
      this.findOpsIpAddressLogQuery.page = 1
      this.findOpsIpAddressLog()
    },
    // 查询日志
    findOpsIpAddressLog() {
      request({
        url: api.ipAddressManage.findOpsIpAddressLog,
        data: this.findOpsIpAddressLogQuery
      }).then(async res => {
        if (res.code === 1) {
          this.logData = res.data
          console.log(this.logData, 'this.logData')
          this.total = Number(res.count)
        }
      })
    },
    // 获取设备类型
    getDeviceType() {
      // 获取运维设备
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) this.opsDeviceType = res.data
      })
      // 获取it监控设备
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type', limit: -1 }
      }).then(res => {
        if (res.code === 1) this.itDeviceType = res.data
      })
      // 获取视频设备
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'video_dev_type', limit: -1 }
      }).then(res => {
        if (res.code === 1) this.videoType = res.data
      })
    }
  }
}
</script>

<style scoped>

</style>
