<template>
  <div class="app-container">
    <div class="filter-container">
      <div style="display:inline-block">
        <el-input v-model="query.hyDeviceName" placeholder="请输入物联设备名称" style="width: 200px;" class="filter-item" />
        <el-select v-model="query.hyOrgId" placeholder="请选择所属区域" clearable class="filter-item" style="width: 200px">
          <el-option v-for="item in areaList" :key="item.hyAreaId" :label="item.hyAreaName" :value="item.hyAreaId" />
        </el-select>
        <el-select v-model="query.hyHostId" placeholder="请选择所属物联主机" clearable class="filter-item" style="width: 200px">
          <el-option v-for="item in hostList" :key="item.hyHostId" :label="item.hyHostName" :value="item.hyHostId" />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
        <el-button class="filter-item" type="primary" @click="batchInsertAssetsInfos">批量转资产</el-button>
        <el-button class="filter-item" type="primary" @click="batchCloseAuth">批量删除资产</el-button>

      </div>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        ref="authDeviceTable"
        :data="contentUnionHostList"
        fit
        highlight-current-row
        style="width: 100%;"
        @select="handleSelect"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column label="设备名称(地址)" prop="hyDeviceName" show-overflow-tooltip width="400">
          <template slot-scope="{row}">
            {{ row.hyDeviceName }}
            ({{ row.hyAddr }})
          </template>
        </el-table-column>
        <el-table-column label="设备别名" prop="hyAlias" show-overflow-tooltip />
        <el-table-column label="所属物联主机" prop="hyHostId" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setHostName(item.row.hyHostId) }}
          </template>
        </el-table-column>
        <el-table-column label="所属子系统" prop="hySbId" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setSubSystem(item.row.hySbId) }}
          </template>
        </el-table-column>
        <el-table-column label="所在区域" prop="hyOrgid" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setAreaName(item.row.hyOrgid) }}
          </template>
        </el-table-column>
        <el-table-column label="类型值" prop="hyDevTypeValue" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setTypeValue(item.row.hyDevTypeValue) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="item">
            <div :class="item.row.hyState === 1 ? 'success' : 'danger'">
              <i :class="item.row.hyState === 1 ? 'el-icon-success' : 'el-icon-error'" />
              {{ item.row.hyState === 1 ? '在线' : '离线' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" class-name="small-padding fixed-width" align="center">
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
    <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="query.page" :limit.sync="query.limit" @pagination="loadDeviceList" />

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import deviceAuthMixins from '../mixins/device-auth-mixins'

export default {
  name: 'ContentUnionDeviceList',
  components: { Pagination },
  mixins: [deviceAuthMixins],

  data() {
    return {
      listLoading: false,
      systemDeviceType: 4,
      query: {
        hyDeviceName: '',
        page: 1,
        limit: 10,
        hyAddr: '',
        hyHostId: '',
        hyOrgId: ''
      },
      multipleSelection: [],
      allSelection: [],
      listTotal: 0,
      findHyitHostQuery: {
        hyDevTypeId: 2,
        limit: -1
      },
      contentUnionHostList: [],
      areaList: [],
      hostList: [],
      devTypeList: [],
      subSystemList: []
    }
  },
  computed: {
    setHostName() {
      return function(hyHostId) {
        const idx = this.hostList.findIndex(item => item.hyHostId === hyHostId)
        if (idx !== -1) {
          return this.hostList[idx].hyHostName
        }
      }
    },
    setAreaName() {
      return function(hyOrgid) {
        const idx = this.areaList.findIndex(item => item.hyAreaId === hyOrgid)
        if (idx !== -1) {
          return this.areaList[idx].hyAreaName
        }
      }
    },
    setTypeValue() {
      return function(hyDevTypeValue) {
        const idx = this.devTypeList.findIndex(item => item.hyDevTypeValue === hyDevTypeValue)
        if (idx !== -1) {
          return this.devTypeList[idx].hyDevTypeName
        }
      }
    },
    setSubSystem() {
      return function(hySbId) {
        const idx = this.subSystemList.findIndex(item => item.hySbId === hySbId)
        if (idx !== -1) {
          return this.subSystemList[idx].hySbName
        }
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.query = pageQuery
    }
  },
  mounted() {
    this.findHyitOrg()
    this.findHyitHost()
    this.findHyitDevType()
    this.loadDeviceList()
    this.findHyitSubSystem()
  },
  methods: {
    onCreate() {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'ContentUnionDeviceAdd' })
    },
    onEdit(row) {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'ContentUnionDeviceUpdate',
        query: {
          id: row.hyDeviceId || 0
        }
      })
    },
    loadDeviceList() {
      request({
        url: api.powerEnv.findHyitDevice, data: { ...this.query }
      }).then(async res => {
        const infoData = await this.findAssetsInfo()
        res.data.forEach(item => {
          infoData.forEach(num => {
            if (Number(item.hyDeviceId) === Number(num.systemDeviceId)) {
              this.$set(item, 'assetStatus', 1)
              this.$set(item, 'assetStatusId', num.assetsId)
            }
          })
        })
        this.contentUnionHostList = res.data
        console.log(this.contentUnionHostList)
        this.listTotal = Number(res.count)
        this.listLoading = false
      })
    },
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
    findHyitHost() {
      request({
        url: api.powerEnv.findHyitHost, data: { ...this.findHyitHostQuery }
      }).then(res => {
        this.hostList = res.data
      })
    },
    findHyitDevType() {
      request({
        url: api.powerEnv.findHyitDevType,
        data: { hyDevTypeId: 2, hyDevTypePid: 2, limit: -1, Pid: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map((it) => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map((item) =>
        JSON.parse(item)
      )
      this.allSelection = setPagingSelection
      console.log(this.allSelection)
    },
    handleSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1
      if (!selected) {
        this.allSelection = this.allSelection.filter(
          (it) => it[this.ideField] !== row[this.ideField]
        )
      }
    },
    findHyitOrg() {
      request({
        url: api.area.findHyitArea,
        data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.areaList = res.data
        }
      })
    },
    onFilter() {
      this.query.page = 1
      this.loadDeviceList()
    },
    handleSizeChange() {},
    handleCurrentChange() {},
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        request({ url: api.powerEnv.deleteHyitDevice, data: { hyDeviceId: row.hyDeviceId }}).then(res => {
          if (res.code === 1) {
            this.query.page = 1
            this.loadDeviceList()
            this.$message.success('删除成功')
          }
        })
      })
    },
    async queryLoadDeviceList(query) {
      const res = await request({
        url: api.powerEnv.findHyitDevice,
        data: { ...query }
      })
      if (res.code !== 1) return
      return res.data
    },
    // 点击新增资产
    handlerAuth(item) {
      console.log(item)
      this.handlerItem = item
      this.isBatch = false
      this.$confirm('确认将该设备转为资产吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const data = {}
        data.assetsName = this.handlerItem.hyDeviceName
        data.cmdbItemTypeId = 12 // 固定新增为‘资产’，代号 12
        data.systemDeviceId = this.handlerItem.hyDeviceId
        data.systemDeviceType = this.systemDeviceType
        await this.insertAssetsInfo(data)
        this.loadDeviceList()
      })
    },
    // 点击删除资产
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
      if (this.allSelection.length < 1) {
        this.$message('请选择设备')
        return
      }

      let haveUse = false
      const assetsIds = []
      this.allSelection.forEach(item => {
        if (item.assetStatus) haveUse = true
        assetsIds.push(item.hyDeviceId)
      })
      this.assetsIds = Array.from(new Set(assetsIds))
      console.log(this.assetsIds)
      if (haveUse) return this.$message('选择的设备包含已转资产设备，请先取消已转资产设备')
      const hostData = await this.queryLoadDeviceList({page: 1, limit: -1})
      console.log(hostData)
      const dataList = []
      hostData.forEach(itemA => {
        this.assetsIds.forEach(itemIds => {
          if (Number(itemA.hyDeviceId) === Number(itemIds)) {
            this.$set(dataList, dataList.length, itemA)
          }
        })
      })
      const jsonData = []
      console.log(dataList)
      dataList.forEach(val => {
        const valList = {}
        valList.assetsName = val.hyDeviceName
        valList.cmdbItemTypeId = 12
        valList.systemDeviceId = val.hyDeviceId
        valList.systemDeviceType = this.systemDeviceType
        jsonData.push(valList)
      })
      const jsonList = JSON.stringify(jsonData)
      console.log(jsonList)
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
      if (this.allSelection.length < 1) {
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
