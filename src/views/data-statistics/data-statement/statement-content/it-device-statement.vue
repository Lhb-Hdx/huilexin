<template>
  <div class="app-container">
    <ProjectTab @handleClick="handleClick" />
    <div class="filter-container">
      <el-select v-model="listQuery.agent" placeholder="网关" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="请输入主机名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="search" />
      <el-select v-model="listQuery.devType" class="filter-item" clearable placeholder="选择类型">
        <el-option
          v-for="item in devTypeList"
          :key="item.id"
          :label="item.dictdataName"
          :value="item.id"
        />
      </el-select>
      <el-select v-model="listQuery.status" class="filter-item" clearable placeholder="选择状态">
        <el-option
          v-for="item in statusOptions"
          :key="item.id"
          :label="item.label"
          :value="item.id"
        />
      </el-select>
      <el-cascader
        v-model="listQuery.hyOrgId"
        clearable
        class="filter-item"
        multiple="false"
        :options="areaTreeArr"
        :props="orgProps"
        placeholder="选择位置"
      />
      <el-button class="filter-item" type="primary" @click="search">搜索</el-button>
      <OutputExcel ref="outputExcel" @submitQuery="submitQuery" />
      <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="statement"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="设备名称" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-link type="primary" @click="handlerToItMonitorDevice(row)">{{ row.hyMarkName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="IP地址" prop="hyIp" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="类型" prop="devTypeName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="所在位置" prop="areaName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="状态" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span :class="row.hyNetState === 1 ? 'success' : 'danger'">{{ row.stateName }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="generateStatement" />
    </div>
  </div>
</template>

<script>
import ProjectTab from '../../components/data-statement/project-tab'
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'
import Pagination from '@/components/Pagination'
import OutputExcel from '@/components/outputExcel'
import ListControl from '@/components/ListControl'

export default {
  name: 'ItDeviceStatement',
  components: {
    ProjectTab,
    Pagination,
    OutputExcel,
    ListControl
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10,
        hostType: 1,
        agent: '',
        keyword: '',
        devType: '',
        status: '',
        hyOrgId: ''
      },
      listTotal: 0,
      agentList: [],
      devTypeList: [],
      statusOptions: [
        {
          id: 0,
          label: '离线',
          value: 0
        }, {
          id: 1,
          label: '在线',
          value: 1
        }
      ],
      orgProps: { label: 'hyAreaName', value: 'hyAreaId', checkStrictly: true },
      areaTreeArr: [],
      allArea: [],
      statement: [],
      // 显示控制数据 start
      checkList: ['设备名称', 'IP地址', '类型', '所在位置', '状态'],
      lists: [],
      storageVal: 'it-equipment-list' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  mounted() {
    this.loadItType()
    this.loadOrgList()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 点击告警设备名称跳转到it监控设备详情
    async handlerToItMonitorDevice(row) {
      const { data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids: row.hySubdevTypeId }
      })
      this.$router.push({
        name: 'ResourceMonitorDetail',
        query: {
          id: row.hyHostId || 0,
          zbxHostId: row.hyZhostId,
          agent: row.agent,
          devTypeId: row.hyDevTypeId,
          subType: data && data.length > 0 ? data[0].dictdataValue : '',
          hySubdevTypeId: row.hySubdevTypeId && row.hySubdevTypeId > 0 ? row.hySubdevTypeId : ''
        }
      })
    },
    async handleClick(val) {
      await this.findHyitAgent(val.agent)
    },
    async findHyitAgent(agent) {
      this.$request({
        url: this.api.itMonitor.findHyitAgent,
        data: { ids: agent.toString(), limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.agentList = res.data
          this.$set(this.listQuery, 'agent', res.data[0].id)
          this.generateStatement()
        }
      })
    },
    // 获取区域列表
    loadOrgList() {
      request({ url: api.area.findHyitArea, data: { limit: -1 }})
        .then(res => {
          this.listLoading = false
          if (res.code === 1) {
            this.allArea = res.data
            this.areaTreeArr = listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
          }
        })
    },
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.generateStatement()
    },
    async generateStatement() {
      const findHyitHost = await this.getDataSource(this.listQuery.page, this.listQuery.limit)
      if (findHyitHost.code === 1) {
        this.statement = findHyitHost.data
        this.listTotal = +findHyitHost.count
      }
    },
    /**
     * @description 获取主表数据
     * @param page 页码
     * @param limit 条数，全部则传-1
     */
    async getDataSource(page, limit) {
      const listQuery = { ...this.listQuery }
      if (limit === -1) {
        listQuery.page = 1
        listQuery.limit = -1
      } else {
        listQuery.page = page
        listQuery.limit = limit
      }
      const dataSourceData = await this.findHyitHost(listQuery)
      if (dataSourceData.code && dataSourceData.data && dataSourceData.data.length > 0) {
        return { ...dataSourceData, data: await this.setTypeDataByData(dataSourceData.data) }
      } else {
        return { ...dataSourceData }
      }
    },
    async setTypeDataByData(data) {
      data.forEach(item => {
        const devTypeIndex = this.devTypeList.findIndex(items => items.id === item.hyDevTypeId)
        item.devTypeName = item.hyDevTypeId === 0 || devTypeIndex === -1 ? '' : this.devTypeList[devTypeIndex].dictdataName
        const areaIndex = this.allArea.findIndex(items => +items.hyAreaId === +item.hyOrgId)
        item.areaName = areaIndex !== -1 ? this.allArea[areaIndex].hyAreaName : ''
        item.stateName = item.hyNetState === 1 ? '在线' : '离线'
      })
      return data
    },
    async findHyitHost(query) {
      return this.$request({
        url: this.api.itMonitor.findHyitHost,
        data: query
      })
    },
    // 获取设备类型
    loadItType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    // 导出
    async submitQuery(excelQuery) {
      const data = await this.getDataSource(excelQuery.page, excelQuery.limit)
      const excelTitle = [
        {
          title: '设备名称',
          dataIndex: 'hyMarkName'
        },
        {
          title: 'IP地址',
          dataIndex: 'hyIp'
        },
        {
          title: '类型',
          dataIndex: 'devTypeName'
        },
        {
          title: '所在位置',
          dataIndex: 'areaName'
        },
        {
          title: '状态',
          dataIndex: 'stateName'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data.data)
    }
  }
}
</script>

<style scoped>

</style>
