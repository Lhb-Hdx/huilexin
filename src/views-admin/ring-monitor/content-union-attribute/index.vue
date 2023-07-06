<template>
  <div class="app-container">
    <div v-permission="['search']" class="filter-container">
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
      <el-button class="filter-item" icon="el-icon-search" type="primary" @click="onFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="contentUnionAttributeList"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="NO" prop="id" type="index" width="80" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="所属设备(地址)" align="left" prop="device" show-overflow-tooltip width="200">
          <template slot-scope="item">
            {{ setDeviceName(item.row.hyDeviceId) }}({{ setDeviceAddr(item.row.hyDeviceId) }})
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="设备别名" align="left" prop="hyAlias" show-overflow-tooltip width="200">
          <template slot-scope="{row}">
            {{ sethyAlias(row.hyDeviceId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="所属子系统" align="left" width="160" prop="hySbId" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setSubSystem(item.row.hySbId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="属性名" align="left" prop="hyDes" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="别名" align="left" prop="hyVname" show-overflow-tooltip />
        <!-- <el-table-column label="模块" prop="hyAddr" width="80" show-overflow-tooltip /> -->
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="端口" align="right" prop="hyPort" show-overflow-tooltip width="80" />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="索引" align="right" prop="hyDatIndex" show-overflow-tooltip width="80" />
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="值类型" align="left" prop="hyType" show-overflow-tooltip width="120">
          <template slot-scope="item">
            {{ setValueType(item.row.hyType) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" label="当前值" align="right" prop="deviceValue" show-overflow-tooltip width="80">
          <template slot-scope="{row}">
            {{ setCurrValue(row) }}
          </template>
        </el-table-column>
        <!--        <el-table-column label="状态" show-overflow-tooltip>-->
        <!--          <template slot-scope="item">-->
        <!--            <div :class="item.row.hyState === 1 ? 'success' : 'danger'">-->
        <!--              <i :class="item.row.hyState === 1 ? 'el-icon-success' : 'el-icon-error'" />-->
        <!--              {{ item.row.hyState === 1 ? '在线' : '离线' }}-->
        <!--            </div>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" label="更新时间" align="right" prop="hyUtime" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[10].ispass : true" align="center" class-name="small-padding fixed-width" label="操作" width="320">
          <template slot-scope="{row}">
            <el-button size="mini" type="primary" @click="onAlarmRule(row)">
              报警规则
            </el-button>
            <el-button v-permission="['edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['define']" size="mini" type="primary" @click="onMappings(row)">
              值定义 {{ row.mappingLength }}
            </el-button>
            <el-button v-permission="['remove']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listTotal > 0" :auto-scroll="false" :limit.sync="contentUnionAttributeListQuery.limit" :page.sync="contentUnionAttributeListQuery.page" :total="listTotal" @pagination="findHyitDeviceValue" />
    <AlarmRules ref="alarmRules" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'ContentUnionAttributeList',
  components: { Pagination, ListControl, AlarmRules: () => import('./alarm-rules.vue') },
  data() {
    return {
      listLoading: false,
      contentUnionAttributeListQuery: {
        page: 1,
        limit: 10,
        hyHostId: '',
        hyType: '',
        hyDes: '',
        hyDeviceId: ''
        // total: 0
      },
      listTotal: 0,
      contentUnionAttributeList: [],
      areaList: [
        { id: 1, name: '中心网点' }
      ],
      hostList: [
        // { id: 1, name: '动环监控物联主机' }
      ],
      valueTypeList: [],
      deviceList: [],
      subSystemList: [],
      // 显示控制数据 start
      checkList: ['所属设备(地址)', '设备别名', '所属子系统', '属性名', '别名', '端口', '索引', '值类型', '当前值', '更新时间', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
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
        // console.log({ idx, row, val: row[this.$tool.humpStr(idx['hyFieldName'])] })
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
    this.findHyitDevice()
    this.findHyitValueType()
    this.findHyitDeviceValue()
    this.findHyitSubSystem()
    this.findHyitHost()
  },
  methods: {
    setLists(val) {
      this.lists = val
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
      this.contentUnionAttributeList = res.data
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
        url: api.powerEnv.findHyitDevice, data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceList = res.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
