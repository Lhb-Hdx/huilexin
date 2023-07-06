<template>
  <div class="app-container">
    <ProjectTab @handleClick="handleClick" />
    <div class="filter-container">
      <el-select v-model="listQuery.agent" placeholder="网关" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="请输入主机名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="search" />
      <el-select v-model="listQuery.netSegment" class="filter-item" clearable placeholder="选择子网">
        <el-option
          v-for="item in netSegmentList"
          :key="item.netSegment"
          :label="item.netSegment"
          :value="item.netSegment"
        />
      </el-select>
      <el-select v-model="listQuery.useStatue" class="filter-item" clearable placeholder="选择使用状态">
        <el-option
          v-for="item in useType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select v-model="listQuery.pingStatue" class="filter-item" clearable placeholder="选择连接状态">
        <el-option
          v-for="item in connectionType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
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
        <el-table-column label="序号" prop="hyKnowId" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="IP地址" prop="ip" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="所属网关" prop="agentName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="设备类型" prop="deviceModelTypeName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="设备名称" prop="deviceName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="端口" prop="port" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="使用状态" show-overflow-tooltip>
          <template slot-scope="{row}">
            <div v-if="row.useStatue !== null" :class="row.useStatueClass">
              <i class="el-icon-success" :class="row.useStatueClass" /> {{ row.useStatueName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="连接状态" show-overflow-tooltip>
          <template v-if="row.pingStatue" slot-scope="{row}">
            <el-tag :type="row.pingStatueClass">
              {{ row.pingStatueName }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="generateStatement" />
    </div>
  </div>
</template>

<script>
import ProjectTab from '../../components/data-statement/project-tab'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import OutputExcel from '@/components/outputExcel'
import ListControl from '@/components/ListControl'

export default {
  name: 'IpResourceStatement',
  components: {
    ProjectTab,
    Pagination,
    OutputExcel,
    ListControl
  },
  data() {
    return {
      agentList: [],
      listQuery: {
        page: 1,
        limit: 10,
        agent: '',
        keyword: '',
        netSegment: ''
      },
      statement: [],
      listTotal: 0,
      ipDeviceAgent: [],
      opsDeviceType: [],
      itDeviceType: [],
      videoType: [],
      useStatue: [
        { value: 1, label: '已用', class: 'success' },
        { value: 2, label: '可用', class: 'warning' },
        { value: 3, label: '禁用', class: 'info' }
      ],
      pingStatue: [
        { value: 1, label: '在线', class: 'success' },
        { value: 2, label: '离线', class: 'danger' },
        { value: 3, label: '未连接', class: 'info' }
      ],
      useType: [
        { value: 1, label: '已用' },
        { value: 2, label: '可用' },
        { value: 3, label: '禁用' }
      ],
      connectionType: [
        { value: 1, label: '在线' },
        { value: 2, label: '离线' }
      ],
      pingStatueList: [
        { value: 1, label: '连接' },
        { value: 0, label: '未连接' }
      ],
      netSegmentList: [],
      findOpsIpAddressNetSegmentQuery: {
        page: 1,
        limit: 10,
        agent: ''
      },
      // 显示控制数据 start
      checkList: ['IP地址', '所属网关', '设备类型', '设备名称', '端口', '使用状态', '连接状态'],
      lists: [],
      storageVal: 'ip-resource-report' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  mounted() {
    this.getDeviceType()
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
          this.$set(this.findOpsIpAddressNetSegmentQuery, 'agent', res.data[0].id)
          this.generateStatement()
          this.findOpsIpAddressNetSegment()
        }
      })
    },
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.generateStatement()
    },
    async generateStatement() {
      const findOpsIpAddressDetail = await this.getDataSource(this.listQuery.page, this.listQuery.limit)
      if (findOpsIpAddressDetail.code !== 1) return
      this.statement = findOpsIpAddressDetail.data
      this.listTotal = +findOpsIpAddressDetail.count
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
      const dataSourceData = await this.findOpsIpAddressDetail(listQuery)
      if (dataSourceData.code && dataSourceData.data && dataSourceData.data.length > 0) {
        return { ...dataSourceData, data: await this.setTypeDataByData(dataSourceData.data) }
      } else {
        return { ...dataSourceData }
      }
    },
    async setTypeDataByData(data) {
      const ipDevice = []
      const ipIds = []
      const agentGroup = []
      const netSegmentIds = []
      const hostIds = []

      data.forEach(item => {
        if (item.deviceId) {
          hostIds.push(item.deviceId)
          ipDevice.push({
            id: item.id,
            deviceId: item.deviceId
          })
        } else {
          ipIds.push(item.id)
          agentGroup.push(item.agentGroupId)
          netSegmentIds.push(item.netSegmentId)
        }
      })
      const getHost = await this.findHyitHost({ ids: this.$tool.uniqueArray(hostIds).toString() })
      if (getHost.data && getHost.data.length > 0) {
        const agentIds = []
        getHost.data.forEach(hostItem => {
          agentIds.push(hostItem.agent)
          const getIpDeviceIndex = ipDevice.findIndex(ipDeviceItem => Number(ipDeviceItem.deviceId) === Number(hostItem.hyHostId))
          if (getIpDeviceIndex !== -1) ipDevice[getIpDeviceIndex].agentId = hostItem.agent
        })
        const getAgent = await request({ url: api.itMonitor.findHyitAgent, data: { ids: this.$tool.uniqueArray(agentIds).toString(), limit: -1 } })
        if (getAgent.data && getAgent.data.length > 0) {
          getAgent.data.forEach(agentItem => {
            ipDevice.forEach(ipDeviceItem => {
              if (+ipDeviceItem.agentId === +agentItem.id) ipDeviceItem.agentName = agentItem.name
            })
          })
        }
        this.ipDeviceAgent = ipDevice
      }

      data.forEach(item => {
        const getIdx = this.ipDeviceAgent.findIndex(items => Number(items.id) === Number(item.id) && Number(items.deviceId) === Number(item.deviceId))
        if (getIdx !== -1) item.agentName = this.ipDeviceAgent[getIdx].agentName

        if (item.deviceModelType === 1) {
          const idx = this.itDeviceType.findIndex(items => items.id === item.deviceType)
          if (idx !== -1) item.deviceModelTypeName = this.itDeviceType[idx].dictdataName
        } else if (item.deviceModelType === 2) {
          const idx = this.opsDeviceType.findIndex(items => items.id === item.deviceType)
          if (idx !== -1) item.deviceModelTypeName = this.opsDeviceType[idx].dictdataName
        } else if (item.deviceModelType === 4) {
          const idx = this.videoType.findIndex(items => items.id === item.deviceType)
          if (idx !== -1) item.deviceModelTypeName = this.videoType[idx].dictdataName
        } else {
          item.deviceModelTypeName = ''
        }

        const useStatueIndex = this.useStatue.findIndex(items => items.value === item.useStatue)
        if (useStatueIndex !== -1) {
          item.useStatueName = this.useStatue[useStatueIndex].label
          item.useStatueClass = this.useStatue[useStatueIndex].class
        }

        const pingStatueIndex = this.pingStatue.findIndex(items => items.value === item.pingStatue)
        if (pingStatueIndex !== -1) {
          item.pingStatueName = this.pingStatue[pingStatueIndex].label
          item.pingStatueClass = this.pingStatue[pingStatueIndex].class
        }
      })

      return data
    },
    async findOpsIpAddressDetail(query) {
      return await this.$request({
        url: this.api.ipAddressManage.findOpsIpAddressDetail,
        data: query
      })
    },
    async findHyitHost(query) {
      return await this.$request({
        url: this.api.itMonitor.findHyitHost,
        data: query
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
    },
    findOpsIpAddressNetSegment() {
      this.$request({
        url: this.api.ipAddressManage.findOpsIpAddressNetSegment,
        data: this.findOpsIpAddressNetSegmentQuery
      }).then(res => {
        if (res.code === 1) {
          this.netSegmentList = res.data
        }
      })
    },
    // 导出
    async submitQuery(excelQuery) {
      const data = await this.getDataSource(excelQuery.page, excelQuery.limit)
      const excelTitle = [
        {
          title: 'IP地址',
          dataIndex: 'ip'
        },
        {
          title: '所属网关',
          dataIndex: 'agentName'
        },
        {
          title: '设备类型',
          dataIndex: 'deviceModelTypeName'
        },
        {
          title: '设备名称',
          dataIndex: 'deviceName'
        },
        {
          title: '端口',
          dataIndex: 'port'
        },
        {
          title: '使用状态',
          dataIndex: 'useStatueName'
        },
        {
          title: '连接状态',
          dataIndex: 'pingStatueName'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data.data)
    }
  }
}
</script>

<style scoped>

</style>
