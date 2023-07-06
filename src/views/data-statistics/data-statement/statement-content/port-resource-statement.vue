<template>
  <div class="app-container">
    <ProjectTab @handleClick="handleClick" />
    <div class="filter-container">
      <el-select v-model="listQuery.agent" placeholder="网关" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="请输入主机名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="search" />
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
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="设备名称" prop="deviceName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="设备IP" prop="ip" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="端口总数" prop="portCount" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="已用" prop="portUsedCount" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="可用" prop="freeCount" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="可用率" prop="freePercentage" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="所在位置" prop="location" show-overflow-tooltip />
      </el-table>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="generateStatement" />
    </div>
  </div>
</template>

<script>
import ProjectTab from '../../components/data-statement/project-tab'
import Pagination from '@/components/Pagination'
import OutputExcel from '@/components/outputExcel'
import ListControl from '@/components/ListControl'

export default {
  name: 'PortResourceStatement',
  components: {
    ProjectTab,
    Pagination,
    OutputExcel,
    ListControl
  },
  data() {
    return {
      listTotal: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      statement: [],
      agentList: [],
      // 显示控制数据 start
      checkList: ['设备名称', '设备IP', '端口总数', '已用', '可用', '可用率', '所在位置'],
      lists: [],
      storageVal: 'device-port-resource-report' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  methods: {
    setLists(val) {
      this.lists = val
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
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.generateStatement()
    },
    async generateStatement() {
      const findPortDevice = await this.getDataSource(this.listQuery.page, this.listQuery.limit)
      if (findPortDevice.code !== 1) return
      this.statement = findPortDevice.data
      this.listTotal = +findPortDevice.count
    },
    async findPortDevice(query) {
      return await this.$request({
        url: this.api.port.findPortDevice,
        data: query
      })
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
      const dataSourceData = await this.findPortDevice(listQuery)
      if (dataSourceData.code && dataSourceData.data && dataSourceData.data.length > 0) {
        return { ...dataSourceData, data: await this.setTypeDataByData(dataSourceData.data) }
      } else {
        return { ...dataSourceData }
      }
    },
    async setTypeDataByData(data) {
      data.forEach(item => {
        item.freeCount = item.portCount - item.portUsedCount
        item.freePercentage = `${parseFloat(((item.portUsedCount / item.portCount) * 100).toFixed(0))}%`
      })
      return data
    },
    // 导出
    async submitQuery(excelQuery) {
      const data = await this.getDataSource(excelQuery.page, excelQuery.limit)
      const excelTitle = [
        {
          title: '设备名称',
          dataIndex: 'deviceName'
        },
        {
          title: '设备IP',
          dataIndex: 'ip'
        },
        {
          title: '端口总数',
          dataIndex: 'portCount'
        },
        {
          title: '已用',
          dataIndex: 'portUsedCount'
        },
        {
          title: '可用',
          dataIndex: 'freeCount'
        },
        {
          title: '可用率',
          dataIndex: 'freePercentage'
        },
        {
          title: '所在位置',
          dataIndex: 'location'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data.data)
    }
  }
}
</script>

<style scoped>

</style>
