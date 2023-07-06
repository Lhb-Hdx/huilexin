<template>
  <div>
    <!-- <div class="filter-container">
        <el-input v-model="contentUnionAttributeListQuery.hyDes" class="filter-item" placeholder="请输入属性名称" style="width: 200px;" />
        <el-select v-model="contentUnionAttributeListQuery.hyHostId" class="filter-item" clearable placeholder="请选择所属物联主机" style="width: 200px">
          <el-option v-for="item in hostList" :key="item.hyHostId" :label="item.hyHostName" :value="item.hyHostId" />
        </el-select>
        <el-select v-model="contentUnionAttributeListQuery.hyDeviceId" class="filter-item" clearable placeholder="请选择所属设备(地址)" style="width: 200px">
          <el-option v-for="item in deviceList" :key="item.hyDeviceId" :label="(item.hyAlias || '')+`(${item.hyAddr})`" :value="item.hyDeviceId" />
        </el-select>
        <el-select v-model="contentUnionAttributeListQuery.hyType" class="filter-item" clearable placeholder="请选择所属值类型" style="width: 200px">
          <el-option v-for="item in valueTypeList" :key="item.hyTypeId" :label="item.hyDescription" :value="item.hyTypeId" />
        </el-select>
        <el-select v-model="contentUnionAttributeListQuery.hyAreaId" class="filter-item" clearable placeholder="请选择区域" style="width: 200px">
          <el-option v-for="item in areaList" :key="item.hyAreaId" :label="item.hyAreaName" :value="item.hyAreaId" />
        </el-select>
        <el-button class="filter-item" icon="el-icon-search" type="primary" @click="onFilter">查询</el-button>
      </div> -->
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        ref="table"
        :data="sliceTableData"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="No" type="index" show-overflow-tooltip />
        <el-table-column label="属性别名" prop="hyVname" show-overflow-tooltip />
        <el-table-column label="属性名" prop="hyDes" show-overflow-tooltip />
        <el-table-column label="所属区域" prop="device" show-overflow-tooltip width="200">
          <template slot-scope="{row}">
            {{ $tool.matchData(areaList,row,'hyOrgid','hyAreaName','hyAreaId') }}
          </template>
        </el-table-column>
        <el-table-column label="所属设备" prop="device" show-overflow-tooltip width="200">
          <template slot-scope="item">
            {{ setDeviceName(item.row.hyDeviceId) }}
            <span v-if="item.row.hyDeviceId">({{ setDeviceAddr(item.row.hyDeviceId) }})</span>
          </template>
        </el-table-column>
        <el-table-column label="所属主机" prop="device" show-overflow-tooltip width="200">
          <template slot-scope="{row}">
            {{ $tool.matchData(hostList,row,'hyHostId','hyHostName') }}
          </template>
        </el-table-column>
        <el-table-column label="值类型" prop="hyType" show-overflow-tooltip width="120">
          <template slot-scope="item">
            {{ setValueType(item.row.hyType) }}
          </template>
        </el-table-column>
        <el-table-column label="当前值" prop="deviceValue" show-overflow-tooltip width="80">
          <template slot-scope="{row}">
            {{ setCurrValue(row) }}
          </template>
        </el-table-column>
        <el-table-column label="所属子系统" prop="hySbId" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setSubSystem(item.row.hySbId) }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="模块" prop="hyAddr" width="80" show-overflow-tooltip /> -->
        <el-table-column label="端口" prop="hyPort" show-overflow-tooltip width="80" />
        <el-table-column label="索引" prop="hyDatIndex" show-overflow-tooltip width="80" />
        <!--          <el-table-column label="更新时间" prop="hyUtime" show-overflow-tooltip />-->
        <el-table-column label="操作" fixed="right">
          <template slot-scope="{$index}">
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteItem($index)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="dynamicList.length > 0" :auto-scroll="false" :limit.sync="contentUnionAttributeListQuery.limit" :page.sync="contentUnionAttributeListQuery.page" :total="dynamicList.length" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import selectMixin from '@/views-admin/activiti/mixin/selectMixin'
export default {
  name: 'DeviceTable',
  components: { Pagination },
  mixins: [selectMixin],
  props: {
    dynamicList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: true,
      listLoading: false,
      contentUnionAttributeListQuery: {
        page: 1,
        limit: 10,
        hyHostId: '',
        hyType: '',
        hyDes: '',
        hyDeviceId: ''
      },
      listTotal: 0,
      contentUnionAttributeList: [],
      hostList: [],
      valueTypeList: [],
      deviceList: [],
      subSystemList: [],
      keyField: 'hyVid',
      listField: 'contentUnionAttributeList',
      areaList: []
    }
  },
  computed: {
    sliceTableData() {
      return this.dynamicList.slice((this.contentUnionAttributeListQuery.page - 1) * this.contentUnionAttributeListQuery.limit, this.contentUnionAttributeListQuery.limit * this.contentUnionAttributeListQuery.page)
    },
    setValueType() {
      return function(hyDevTypeValue) {
        const idx = this.valueTypeList.findIndex(item => item.hyTypeId === hyDevTypeValue)
        if (idx !== -1) {
          return this.valueTypeList[idx].hyDescription
        }
      }
    },
    setDeviceName() {
      return function(hyDeviceId) {
        const idx = this.deviceList.findIndex(item => item.hyDeviceId === hyDeviceId)
        if (idx !== -1) {
          return this.deviceList[idx].hyDeviceName
        }
      }
    },
    sethyAlias() {
      return function(hyDeviceId) {
        const idx = this.deviceList.findIndex(item => item.hyDeviceId === hyDeviceId)
        if (idx !== -1) {
          return this.deviceList[idx].hyAlias
        }
      }
    },
    setDeviceAddr() {
      return function(hyDeviceId) {
        const idx = this.deviceList.findIndex(item => item.hyDeviceId === hyDeviceId)
        if (idx !== -1) {
          return this.deviceList[idx].hyAddr
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
    },
    setCurrValue() {
      return function(row) {
        const idx = this.valueTypeList.find(item => item.hyTypeId === row.hyType)
        if (idx && idx['hyFieldName']) {
          return row[this.$tool.humpStr(idx['hyFieldName'])] || 0
        }
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.contentUnionAttributeListQuery = pageQuery
    }
  },
  mounted() {
    this.findHyitArea()
    this.findHyitDevice()
    this.findHyitValueType()
    // this.findHyitDeviceValue()
    this.findHyitSubSystem()
    this.findHyitHost()
  },
  methods: {
    deleteItem(index) {
      this.dynamicList.splice(index, 1)
    },
    async findHyitArea() {
      let { data, code } = await request({ url: api.area.findHyitArea, data: { limit: -1 }})
      if (code === 1) this.areaList = data
    },
    async findHyitDeviceValueMappings(vid) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValueMappings, data: { hyVid: vid }})
      if (code === 1) return data
    },
    onMappings(row) {
      const data = { ...this.contentUnionAttributeListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'ValueMappingsList',
        query: {
          id: row.hyVid || 0
        }
      })
    },
    onEdit(row) {
      const data = { ...this.contentUnionAttributeListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'UpdateAttribute',
        query: {
          id: row.hyVid || 0
        }
      })
    },
    onAlarmRule(row) {
      this.$refs.alarmRules.open(row.hyVid)
    },
    onCreate() {
      const data = { ...this.contentUnionAttributeListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddAttribute' })
    },
    onFilter() {
      this.contentUnionAttributeListQuery.page = 1
      this.findHyitDeviceValue()
    },
    findHyitValueType() {
      request({
        url: api.powerEnv.findHyitValueType,
        data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.valueTypeList = res.data
        }
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
        data: { limit: -1, hyDevTypeId: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.hostList = res.data
        }
      })
    },
    async findHyitDeviceValue() {
      let res = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: this.contentUnionAttributeListQuery
      })
      if (res.code !== 1) return
      for (let i = 0; i < res.data.length; i++) {
        const item = res.data[i]
        let data = await this.findHyitDeviceValueMappings(item.hyVid)
        // eslint-disable-next-line require-atomic-updates
        item['mappingLength'] = data.length
        const idx = this.valueTypeList.findIndex(items => items.hyTypeId === item.hyType)
        if (idx !== -1) {
          const activeValueType = this.valueTypeList[idx]?.hyFieldName
          const splitTypeValue = activeValueType.split('_')
          let result = 'hy'
          splitTypeValue.forEach(item => {
            result += item.charAt(0).toUpperCase() + item.slice(1)
          })
          // eslint-disable-next-line require-atomic-updates
          item.deviceValue = item[`${result}`]
        }
      }
      this.deviceList.forEach(item => {
        res.data.forEach(it => {
          if (it.hyDeviceId === item.hyDeviceId) {
            it.hyOrgid = item.hyOrgid
          }
        })
      })
      this.contentUnionAttributeList = res.data
      this.$nextTick(() => {
        this.initTable()
      })
      this.listTotal = Number(res.count)
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        request({ url: api.powerEnv.deleteHyitDeviceValue, data: { hyVid: row.hyVid }}).then(res => {
          if (res.code === 1) {
            this.contentUnionAttributeListQuery.page = 1
            this.findHyitDeviceValue()
            this.$message.success('删除成功')
          }
        })
      })
    },
    findHyitDevice() {
      request({
        url: api.powerEnv.findHyitDevice, data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceList = res.data
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
