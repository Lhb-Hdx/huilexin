<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['create']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <div v-permission="['search']" style="display: inline-block">
        <el-input v-model="query.hyDeviceName" placeholder="请输入物联设备名称" style="width: 200px" class="filter-item" />
        <el-select v-model="query.hyAreaId" placeholder="请选择所属区域" clearable class="filter-item" style="width: 200px">
          <el-option v-for="item in areaList" :key="item.hyAreaId" :label="item.hyAreaName" :value="item.hyAreaId" />
        </el-select>
        <el-select v-model="query.hyHostId" placeholder="请选择所属物联主机" clearable class="filter-item" style="width: 200px">
          <el-option v-for="item in hostList" :key="item.hyHostId" :label="item.hyHostName" :value="item.hyHostId" />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
        <el-button class="filter-item" type="primary" @click="onBatchTransferAssets">批量转资产</el-button>
      </div>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table ref="table" :data="contentUnionHostList" fit highlight-current-row style="width: 100%" @select="handleSelect" @selection-change="handleSelectionChange">
        <el-table-column type="selection" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="设备名称(地址)" prop="hyDeviceName" show-overflow-tooltip width="250">
          <template slot-scope="{ row }">
            {{ row.hyDeviceName }}
            ({{ row.hyAddr }})
            <!--            ({{ $tool.matchData(hostList,row,'hyHostId','hyAddr','hyHostId') }})-->
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="设备别名" prop="hyAlias" show-overflow-tooltip width="200" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="所属物联主机" prop="hyHostId" width="200" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setHostName(item.row.hyHostId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="所属子系统" prop="hySbId" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setSubSystem(item.row.hySbId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="所在区域" prop="hyOrgid" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setAreaName(item.row.hyOrgid) }}
          </template>
        </el-table-column>
        <!--        <el-table-column label="设备地址" prop="hyAddr" show-overflow-tooltip>-->
        <!--          <template slot-scope="{row}">-->
        <!--            {{ $tool.matchData(hostList,row,'hyHostId','hyAddr','hyHostId') }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="类型值" prop="hyDevTypeValue" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setTypeValue(item.row.hyDevTypeValue) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="right" label="添加时间" prop="hyCtime" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="right" label="更新时间" prop="hyUtime" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" align="left" label="状态" show-overflow-tooltip>
          <template slot-scope="item">
            <div :class="item.row.hyState === 1 ? 'success' : 'danger'">
              <i :class="item.row.hyState === 1 ? 'el-icon-success' : 'el-icon-error'" />
              {{ item.row.hyState === 1 ? '在线' : '离线' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" align="left" label="操作" width="200" class-name="small-padding fixed-width">
          <template slot-scope="{ row }">
            <el-button v-permission="['edit']" size="mini" type="primary" @click="onEdit(row)">编辑</el-button>
            <!-- <el-button size="mini" type="primary">
              开门
            </el-button> -->
            <el-button v-permission="['remove']" size="mini" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="query.page" :limit.sync="query.limit" @pagination="findHyitDevice" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'ContentUnionDeviceList',
  components: { Pagination, ListControl },

  data() {
    return {
      listLoading: false,
      query: {
        hyDeviceName: '',
        page: 1,
        limit: 10,
        hyAddr: '',
        hyHostId: '',
        hyAreaId: ''
        // total: 0
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
      subSystemList: [],
      // 显示控制数据 start
      checkList: ['设备名称(地址)', '设备别名', '所属物联主机', '所属子系统', '所在区域', '类型值', '添加时间', '更新时间', '状态', '操作'],
      lists: []
      // 显示控制数据 end
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
    this.findHyitDevice()
    this.findHyitSubSystem()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    onCreate() {
      const data = { ...this.query }
      this.localStorageOperation(
        'set',
        'pageQuery',
        JSON.stringify({
          ...data,
          route: this.$route.name
        })
      )
      this.$router.push({ name: 'ContentUnionDeviceAdd' })
    },
    onEdit(row) {
      const data = { ...this.query }
      this.localStorageOperation(
        'set',
        'pageQuery',
        JSON.stringify({
          ...data,
          route: this.$route.name
        })
      )
      this.$router.push({
        name: 'ContentUnionDeviceUpdate',
        query: {
          id: row.hyDeviceId || 0
        }
      })
    },
    findHyitDevice() {
      request({
        url: api.powerEnv.findHyitDevice,
        data: { ...this.query }
      }).then(res => {
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
        url: api.powerEnv.findHyitHost,
        data: { ...this.findHyitHostQuery }
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
      setPagingSelection = setPagingSelection.map(it => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map(item => JSON.parse(item))
      this.allSelection = setPagingSelection
      console.log(this.allSelection)
    },
    handleSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1
      if (!selected) {
        this.allSelection = this.allSelection.filter(it => it[this.ideField] !== row[this.ideField])
      }
    },
    // 批量转资产
    onBatchTransferAssets() {
      if (this.allSelection.length < 1) {
        this.$message('请选择设备')
        return
      }
      const jsonData = []
      this.allSelection.forEach(item => {
        const valList = {}
        valList.assetsName = item.hyDeviceName
        valList.cmdbItemTypeId = 12
        valList.systemDeviceId = item.hyDeviceId
        valList.systemDeviceType = 4
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
    // 批量新增资产
    insertAssetsInfos(data) {
      request({
        url: api.assets.insertAssetsInfos,
        data: { json: data }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.$refs.table.clearSelection()
          this.findHyitDevice()
          this.allSelection = []
        } else {
          this.$message.error(res.msg)
        }
      })
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
      this.findHyitDevice()
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
        request({ url: api.powerEnv.deleteHyitDevice, data: { hyDeviceId: row.hyDeviceId } }).then(res => {
          if (res.code === 1) {
            this.query.page = 1
            this.findHyitDevice()
            this.$message.success('删除成功')
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
