<template>
  <div class="flex-container">
    <div class="left-tools">
      <div class="left-box">
        <div class="echart-box">
          <div ref="pieBar" class="pieBar" style="height: 200px;" />
        </div>
        <div class="cat-box">
          <div v-for="(item, index) in devTypeList" :key="item.catId" class="dev-type-item" :class="item.active ? 'active':''" @click="handelDevTypeTab(item, index)">
            <div class="title">
              <div class="icon"><img :src="item.thumb" alt=""></div>
              <div>{{ item.dictdataName }}</div>
            </div>
            <div class="count">{{ setHostTypeStatictics(item.id) }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="right-tools">
      <div class="app-container">
        <div v-permission="['Search']" class="filter-container">
          <el-select v-model="findHyitHostQuery.status" placeholder="请选择在线状态" clearable class="filter-item" style="width: 200px">
            <el-option label="全部" value="" />
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-model="findHyitHostQuery.keyword" placeholder="请输入对象名称或IP" style="width: 200px;" class="filter-item" />
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
          <ExportExcelWithStyle class="filter-item" :row-height="rowHeight" :loading="loading" :wrap-list="wrapList" :title="exportFileName" :fillter-list="fillerList" :excel-title="ExcelTitle" :file-name="exportFileName" @sendRequest="sendRequest" />
          <div v-if="showTimeBtn" class="filter-item reload-tag">刷新时间 {{ $tool.formatSeconds(latestData) }}</div>
        </div>
        <div v-loading="listLoading" class="table-wrapper">
          <el-table
            :data="assetsDeviceList"
            row-key="assetsDeviceId"
            default-expand-all
            fit
            highlight-current-row
            style="width: 100%;"
          >
            <el-table-column label="对象" width="180" show-overflow-tooltip>
              <template slot-scope="{row}">
                <el-link type="primary" @click="handleCheck(row)">{{ row.hyMarkName }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="类型" prop="assetsCatName" show-overflow-tooltip>
              <template slot-scope="item">
                {{ setHostType(item.row.hyDevTypeId) }}
              </template>
            </el-table-column>
            <el-table-column label="子类型" prop="assetsNo" show-overflow-tooltip>
              <template slot-scope="item">
                {{ setSubType(item.row.hySubdevTypeId) }}
              </template>
            </el-table-column>
            <el-table-column label="IP" prop="hyIp" show-overflow-tooltip />

            <!-- 存储设备 -->
            <template v-if="handelDevTypeId === 477">
              <el-table-column label="CPU使用率（%）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.cpuUsagePercents }}
                  <img src="image/common/ico_char.png" class="img_margin_float" alt="" @click="openMonitorNetListEchart('', row, 'storageDeviceCpuUsagePercents')">
                </template>
              </el-table-column>
              <el-table-column label="内存使用率（%）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.memoryUsagePercents }}
                  <img src="image/common/ico_char.png" class="img_margin_float" alt="" @click="openMonitorNetListEchart('', row, 'storageDeviceMemoryUsagePercents')">
                </template>
              </el-table-column>
              <el-table-column label="卷使用率（%）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.volumeUsagePercents }}
                  <img src="image/common/ico_char.png" class="img_margin_float" alt="" @click="openMonitorNetListEchart('', row, 'storageDeviceVolumeUsagePercents')">
                </template>
              </el-table-column>
              <el-table-column label="卷总空间（GB）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.volumeTotalSize }}
                </template>
              </el-table-column>
            </template>
            <!-- 虚拟资源 -->
            <template v-if="handelDevTypeId === 478">
              <el-table-column label="CPU使用率（%）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.cpuUsagePercents || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'vmDeviceCpuUsagePercents')">
                </template>
              </el-table-column>
              <el-table-column label="内存大小（G）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.memoryTotal || 0 }}
                </template>
              </el-table-column>
              <el-table-column label="内存使用率（%）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.memoryUsagePercents || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'vmMemoryUsagePercents')">
                </template>
              </el-table-column>
            </template>
            <!-- 服务设备 -->
            <!--            <template v-if="handelDevTypeId === 479"></template>-->
            <!-- 网络设备 -->
            <template v-if="handelDevTypeId === 481">
              <el-table-column label="版卡总数" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.cardCount || 0 }}
                </template>
              </el-table-column>
              <el-table-column label="使用端口的数量" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.portCount || 0 }}
                </template>
              </el-table-column>
              <el-table-column label="发送速率（Mb/s）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.send || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('send', row, 'NetWorkDeviceFlow')">
                </template>
              </el-table-column>
              <el-table-column label="接收速率（Mb/s）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.receive || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('receive', row, 'NetWorkDeviceFlow')">
                </template>
              </el-table-column>
            </template>
            <!-- 中间件 -->
            <template v-if="handelDevTypeId === 482">
              <el-table-column label="请求数" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.requestCount }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'middlewareRequireCount')">
                </template>
              </el-table-column>
              <el-table-column label="接收（Kbps）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.send || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'middlewareReceive')">
                </template>
              </el-table-column>
              <el-table-column label="发送（Kbps）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.receive || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'middlewareSend')">
                </template>
              </el-table-column>
            </template>
            <!-- 数据库 -->
            <template v-if="handelDevTypeId === 483">
              <el-table-column label="数据文件大小" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.fileSize || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'dataBseFileSize')">
                </template>
              </el-table-column>
              <el-table-column label="活跃用户" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.activeUser || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'dataBaseActiveUser')">
                </template>
              </el-table-column>
            </template>
            <!-- 操作系统 -->
            <template v-if="handelDevTypeId === 484">
              <el-table-column label="CPU使用率（%）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.cpuUsagePercents || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'operatingSystemCpuUsagePercents')">
                </template>
              </el-table-column>
              <el-table-column label="内存使用率（%）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.memoryUsagePercents || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'operatingSystemMemoryUsagePercents')">
                </template>
              </el-table-column>
              <el-table-column label="磁盘使用率（%）" show-overflow-tooltip width="140" align="right">
                <template slot-scope="{row}">
                  {{ row.diskUsagePercents || 0 }}
                  <img src="image/common/ico_char.png" alt="" class="img_margin_float" @click="openMonitorNetListEchart('', row, 'operatingSystemDiskUsagePercents')">
                </template>
              </el-table-column>
            </template>

            <el-table-column label="可用性" width="230" show-overflow-tooltip>
              <template slot-scope="{row}">
                <el-tag
                  v-for="(item, index) in availables"
                  :key="item.label"
                  size="mini"
                  :type="setAvailables(row, index)"
                  effect="dark"
                  style="margin-right: 1px;"
                >
                  {{ item.label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="监控项" prop="hyItemCount" show-overflow-tooltip />
            <el-table-column label="在线状态" prop="status" show-overflow-tooltip>
              <template slot-scope="{row}">
                <el-tag :type="setHostStataTag(row)">
                  {{ setHostStatus(row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" class-name="small-padding fixed-width">
              <template slot-scope="{row,$index}">
                <el-button v-permission="['Get']" type="primary" size="mini" @click="handleCheck(row,$index)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="paginationShow"
            background
            :current-page="findHyitHostQuery.page"
            :page-sizes="pageSize"
            :page-size="findHyitHostQuery.limit"
            layout="total, sizes, prev, pager, next, jumper"
            :total="findHyitHostQuery.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    <el-dialog title="导出" :visible.sync="showDialog" width="50%" top="5vh">
      <div class="dialog-body">
        <el-progress :percentage="percentage" />
      </div>
    </el-dialog>
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :show-dialog="showUsedDetailDialog"
      :prop-agent="currentHandlerItemAgent"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
import ExportExcelWithStyle from '@/components/ExportExcelWithStyle/export-excel-with-style'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import {isJSONString, sizeUnitsConversion} from '@/utils/utils'
import socketCmd from '@/api/socket-cmd.js'
import DeviceListMixins from '@/views/it-monitor/resources-monitor/mixins/device-list-mixins'
import UsedDetailDialog from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/component/used-detail-dialog.vue'

export default {
  name: 'ResourcesIndex',
  components: {
    ExportExcelWithStyle,
    UsedDetailDialog
  },
  mixins: [DeviceListMixins],
  props: {
    devTypeProp: {
      type: Number,
      default: -1
    },
    cmdbItemTypeId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      fillerList: [],
      fillerData: [],
      loading: false,
      showDialog: false,
      percentage: 0,
      wrapList: [], // 需换行的数组
      agentsIds: '',
      show: false,
      dataEcharts: [],
      assetsDeviceList: [],
      listLoading: false,
      pageSize: [10, 20, 30, 50, 100, 200, 300, 500],
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
      devTypeList: [],
      findHyitHostQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        devType: '',
        status: '',
        hostType: 1
      },
      availables: [
        {
          label: 'AGENT'
        },
        {
          label: 'SNMP'
        },
        {
          label: 'JMX'
        },
        {
          label: 'IPMI'
        }
      ],
      devStatus: [
        { value: 0, name: '在线设备' },
        { value: 0, name: '离线设备' }
      ],
      hostTypeStatictics: [],
      handelDevTypeId: '',
      subDevType: [],
      paginationShow: true,
      allSubDevType: [],
      rowHeight: [ // excel各行行高
        { num: 1, height: 70},
        { num: 2, height: 40},
        { num: 3, height: 40}
      ],
      excelTitleTmp: [
        {
          title: '对象',
          dataIndex: 'hyMarkName',
          width: 40
        },
        {
          title: '类型',
          dataIndex: 'hyDevTypeId',
          width: 15
        },
        {
          title: '子类型',
          dataIndex: 'hySubdevTypeId',
          width: 15
        },
        {
          title: 'IP',
          dataIndex: 'hyIp',
          width: 30
        },
        {
          title: '监控项',
          dataIndex: 'hyItemCount',
          width: 10
        },
        {
          title: '在线状态',
          dataIndex: 'hyNetState',
          width: 10
        }
      ],
      ExcelTitle: [],
      exportFileName: 'IT资源监控',
      devTypeId: '',
      dataList: '',
      // 存储设备
      cpuRatio: [],
      memoryUsage: [],
      // virtual: []
      // 虚拟资源
      fictitiousRatio: [], // cpu使用率
      fictitiousNumber: [], // cpu数
      memorySize: [], // 内存空间大小
      memoryTotal: [], // 内存总数
      // 操作系统
      systemRatio: [], // CPU使用率
      systemDiskSize: [], // 磁盘空间
      systemDiskUsage: [], // 磁盘使用率
      systemMemorySize: [], // 内存总空间
      systemMemoryUsage: [], // 内存使用率
      eachDiskSize: [], // 各个磁盘空间空间
      // eachDiskUsage: []// 各个磁盘使用空间
      requestTime: 60000, // 刷新时间
      latestData: 0, // 最新数据倒计时
      timer: null,
      setlatestData: null,
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      currentHandlerItemAgent: '',
      storageExportData: [],
      getExportDataProgress: [],
      showTimeBtn: false,
      exportDataWsOpt: {}
    }
  },
  computed: {
    // 设置主机类型
    setHostType() {
      return function(id) {
        const devTypeIdx = this.devTypeList.findIndex(item => item.id === id)
        if (devTypeIdx !== -1) {
          return id === 0 ? '' : this.devTypeList[devTypeIdx].dictdataName
        }
      }
    },
    // 设置主机状态
    setHostStatus() {
      return function(row) {
        return row.hyNetState === 1 ? '在线' : '离线'
      }
    },
    // 设置主机可用性标签
    setHostStataTag() {
      return function(row) {
        return row.hyNetState === 1 ? 'success' : 'info'
      }
    },
    // 设置主机类型下的主机数量
    setHostTypeStatictics() {
      return function(id) {
        const hostTypeStaticticsIdx = this.hostTypeStatictics.findIndex(item => item.devType === id)
        if (hostTypeStaticticsIdx !== -1) {
          return this.hostTypeStatictics[hostTypeStaticticsIdx].count
        }
      }
    },
    setSubType() {
      return function(hySubdevTypeId) {
        const idx = this.subDevType.findIndex(item => Number(item.id) === Number(hySubdevTypeId))
        if (idx !== -1) return this.subDevType[idx].dictdataName
      }
    },
    deviceTypeId() {
      return this.$route.query.deviceTypeId
    }
  },
  watch: {
    devTypeProp: {
      handler(newVal) {
        this.findHyitHostQuery.devType = newVal === 0 ? '' : newVal
        this.findHyitHost()
      },
      deep: true
    }
  },
  destroyed() {
    clearInterval(this.timer)
    clearInterval(this.setlatestData)
    this.timer = null
    this.setlatestData = null
  },
  async mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    // this.devTypeId = Number(this.localStorageOperation('get', 'devTypeId')) === 0 ? '' : Number(this.localStorageOperation('get', 'devTypeId'))
    this.getHyitHostTypeStatictics()
    this.loadItType()
    console.log('hahaha', this.devTypeProp)

    this.getHyitHostStatictics()
    this.loadEcharts()
    // this.findHyitHostQuery.devType = this.devTypeProp === 0 ? '' : this.devTypeProp
    const pageQuery = await this.$tool.getPageQuery(`${this.$route.name}`)
    console.log(pageQuery)
    if (pageQuery) {
      if (pageQuery.devType !== '') {
        this.showTimeBtn = true
        this.handelDevTypeId = +pageQuery.devType
      } else {
        this.handelDevTypeId = pageQuery.devType
      }
      this.findHyitHostQuery = pageQuery
      const idx = this.devTypeList.findIndex(item => item.id === +pageQuery.devType)
      this.devTypeList.forEach(item => {
        item.active = false
      })
      if (idx !== -1) {
        this.$set(this.devTypeList[idx], 'active', true)
      }
    }
    this.findHyitHost()

    window.addEventListener('watchWsMessage', async (res) => {
      if (res.detail.data.fromType && res.detail.data.fromType === 'tableColumn') {
        const watchDeviceItMonitorData = await this.watchDeviceItMonitorData(res.detail.data)
        if (watchDeviceItMonitorData) {
          this.setHostListColumn(watchDeviceItMonitorData, 'assetsDeviceList')
        }
      }
      if (res.detail.data.fromType && res.detail.data.fromType === 'tableExport') {
        const watchDeviceItMonitorData = await this.watchDeviceItMonitorData(res.detail.data)
        if (watchDeviceItMonitorData) {
          this.setHostListExport(watchDeviceItMonitorData)
        }
      }
    })
  },
  methods: {
    // 进入主机详情
    async handleCheck(row) {
      const queryData = { ...this.findHyitHostQuery }
      if (queryData.devType === '') queryData.devType = 0
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...queryData, route: this.$route.name
      }))
      const { data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids: row.hySubdevTypeId }
      })
      if (row.fromAgent) this.localStorageOperation('set', 'fromAgent', row.fromAgent)
      if (row.fromHostId) this.localStorageOperation('set', 'fromHostId', row.fromHostId)
      this.$router.push({
        name: 'ResourceMonitorDetail',
        query: {
          id: row.hyHostId || 0,
          zbxHostId: row.hyZhostId,
          agent: row.agent,
          devTypeId: this.handelDevTypeId === '' || this.handelDevTypeId === 0 ? row.hyDevTypeId : this.handelDevTypeId,
          subType: data && data.length > 0 ? data[0].dictdataValue : '',
          hySubdevTypeId: row.hySubdevTypeId && row.hySubdevTypeId > 0 ? row.hySubdevTypeId : ''
        }
      })
    },
    // 按固定长度分割数组
    cutArray(array, subLength) {
      let index = 0
      let newArr = []
      while (index < array.length) {
        newArr.push(array.slice(index, index += subLength))
      }
      return newArr
    },
    // 导出数据，ws、http
    async sendRequest() {
      this.showDialog = true
      this.loading = true
      this.percentage = 0
      this.allSubDevType = await this.findAllSysDictionaryDetail()
      const data = { ...this.findHyitHostQuery }
      if (data.devType === 0) data.devType = ''
      if (this.cmdbItemTypeId) data.cmdbItemTypeId = this.cmdbItemTypeId
      const res = await request({
        url: api.itMonitor.findHyitHost,
        data: { ...data, page: 1, agents: this.agentsIds, limit: -1 }
      })
      if (res.code !== 1) return
      if (this.handelDevTypeId) {
        this.storageExportData = res.data
        const classifiedJSONDataByField = this.$tool.classifiedJSONDataByField(res.data, 'agent')

        if (this.handelDevTypeId === 477) {
          const agentGroup = []
          Object.keys(classifiedJSONDataByField).forEach(key => {
            agentGroup.push({
              agent: key, statue: false, cmd: 'it-agentGetStorageData-websocket'
            })
          })
          this.exportDataWsOpt = {
            groupType: 'cmd',
            agentGroup
          }
        }
        if (this.handelDevTypeId === 478) {
          const agentGroup = []
          Object.keys(classifiedJSONDataByField).forEach(key => {
            agentGroup.push({
              agent: key, statue: false, methed: 'getItemVMCpuData'
            })
            agentGroup.push({
              agent: key, statue: false, methed: 'getItemVMMemoryInfoData'
            })
          })
          this.exportDataWsOpt = {
            groupType: 'methed',
            cmd: 'it-agentGetHostData-websocket',
            agentGroup
          }
        }
        if (this.handelDevTypeId === 481) {
          const agentGroup = []
          Object.keys(classifiedJSONDataByField).forEach(key => {
            agentGroup.push({
              agent: key, statue: false, cmd: 'it-agentGetHostShow-websocket'
            })
            agentGroup.push({
              agent: key, statue: false, cmd: 'it-agentGetHostPort-websocket'
            })
            agentGroup.push({
              agent: key, statue: false, cmd: 'it-agentGetHostPortTotal-websocket'
            })
          })
          this.exportDataWsOpt = {
            groupType: 'cmd',
            agentGroup
          }
        }
        if (this.handelDevTypeId === 482) {
          const agentGroup = []
          Object.keys(classifiedJSONDataByField).forEach(key => {
            agentGroup.push({
              agent: key, statue: false, cmd: 'it-agentGetMiddlewareData-websocket'
            })
          })
          this.exportDataWsOpt = {
            groupType: 'cmd',
            'it-agentGetMiddlewareData-websocket': agentGroup
          }
        }
        if (this.handelDevTypeId === 483) {
          const agentGroup = []
          Object.keys(classifiedJSONDataByField).forEach(key => {
            agentGroup.push({
              agent: key, statue: false, cmd: 'it-agentGetDBData-websocket'
            })
          })
          this.exportDataWsOpt = {
            groupType: 'cmd',
            agentGroup
          }
        }
        if (this.handelDevTypeId === 484) {
          const agentGroup = []
          Object.keys(classifiedJSONDataByField).forEach(key => {
            agentGroup.push({
              agent: key, statue: false, cmd: 'it-agentGetHostShow-websocket'
            })
          })
          this.exportDataWsOpt = {
            groupType: 'cmd',
            agentGroup
          }
        }
        this.getDeviceItMonitorData(this.handelDevTypeId, 'tableExport', res.data)
      } else {
        this.ExcelTitle = this.excelTitleTmp
        this.percentage = 100
        this.loading = false
        this.showDialog = false
        this.fillerList = res.data
      }
    },
    // 获取  websocket  存储设备
    agentGetHostShowByWs(ids, agent) {
      return new Promise((resolve, reject) => {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        if (!wsToken) return
        let timer = setTimeout(() => {
          resolve({data: ''})
        }, 5000)
        const getUserSessionResult = getUserSession()
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetStorageData,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: agent,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            hostid: ids,
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        },
        (res) => {
          clearTimeout(timer)
          const wsRes = isJSONString(res.HostStorageData) ? JSON.parse(res.HostStorageData) : res.HostStorageData
          if (wsRes) {
            resolve({
              data: wsRes
            })
          } else if (res === 'error') {
            resolve({
              data: ''
            })
          }
        }, (err) => {
          this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
          console.log(err)
        })
      })
    },
    // 获取  websocket  虚拟设备
    agentGetHostData(ids, agent, method) {
      return new Promise((resolve, reject) => {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        if (!wsToken) return
        let timer = setTimeout(() => {
          resolve({data: ''})
        }, 5000)
        const getUserSessionResult = getUserSession()
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetHostData,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: agent,
            hostid: ids,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            methed: method,
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        },
        (res) => {
          clearTimeout(timer)
          const wsRes = isJSONString(res[`${method}`]) ? JSON.parse(res[`${method}`]) : res[`${method}`]
          if (wsRes && res.methed === method) {
            resolve({
              data: wsRes,
              method
            })
          } else if (res === 'error') {
            resolve({
              data: ''
            })
          }
        }, (err) => {
          this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
          console.log(err)
        })
      })
    },
    // 获取 websocket  操作系统
    agentItAgentGetHostShow(ids, agent) {
      return new Promise((resolve, reject) => {
        const wsToken = this.sessionStorageOperation('get', 'wsToken')
        if (!wsToken) return
        let timer = setTimeout(() => {
          resolve({data: ''})
        }, 5000)
        const getUserSessionResult = getUserSession()
        sendWebsocket(socketCmd.host.default, {
          cmd: socketCmd.itMonitor.itAgentGetHostShow,
          data: {
            token: wsToken,
            companyId: getUserSessionResult.companyId,
            appId: getUserSessionResult.appId,
            agent: agent,
            fromAgent: this.localStorageOperation('get', 'fromAgent'),
            hostid: ids,
            fromHostId: this.localStorageOperation('get', 'fromHostId')
          }
        },
        (res) => {
          clearTimeout(timer)
          const wsRes = isJSONString(res.HostShowData) ? JSON.parse(res.HostShowData) : res.HostShowData
          if (wsRes) {
            // this.exportFindHyitHost(wsRes)
            resolve({
              data: wsRes
            })
          } else if (res === 'error') {
            resolve({
              data: ''
            })
          }
        }, (err) => {
          this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
          console.log(err)
        })
      })
    },
    // 导出的数据 http
    async exportFindHyitHost(wsRes, val) {
      console.log(wsRes, val)
      // 存储设备 数据
      if (this.devTypeId === 477 || val === 1) {
        if (wsRes) {
          if (wsRes.System.length > 0) {
            this.cpuRatio = []
            this.memoryUsage = []
            this.virtual = []
            // cpu百分比数据
            const cpu = []
            const memoryAble = [] // 可用内存
            const memoryMem = [] // 总内存
            wsRes.System.forEach(item => {
              if (item.itemName === 'CPU Idle') {
                cpu.push(item)
              }
            })
            this.cpuRatio = cpu.pop()
            // 内存百分比数据
            wsRes.Memory.forEach(item => {
              if (item.itemName === 'Total Physical Available') {
                memoryAble.push(item)
              } else if (item.itemName === 'Total Physical Memory') {
                memoryMem.push(item)
              }
            })
            const memoryAbleVal = sizeUnitsConversion(Number(memoryAble[0].itemValue), 'capital') // 可用内存
            const memoryMemVal = sizeUnitsConversion(Number(memoryMem[0].itemValue), 'capital') // 总内存
            const data = this.$tool.sizeUnitsTransform('B', 'GB', Number(memoryMem[0].itemValue))
            const memoryOccVal = Number((memoryMemVal.size - memoryAbleVal.size).toFixed(2)) // 已用内存
            const memoryVal = `${(Number((memoryOccVal / memoryMemVal.size).toFixed(2)) * 100)}`
            memoryMem[0].memory = memoryVal
            memoryMem[0].memorySize = `${(data.size).toFixed(2)}`
            this.memoryUsage = memoryMem[0]
          }
        }
      }

      // 操作系统
      if (this.devTypeId === 484 || val === 2) {
        if (wsRes) {
          // cpu
          if (wsRes.cpu.length > 0) {
            const cpuSize = []
            wsRes.cpu.forEach(val => {
              if (val.itemName.indexOf('CPU utilization') !== -1) {
                cpuSize.push(val)
              }
            })
            this.systemRatio = cpuSize
            console.log(this.systemRatio)
          }
          // 内存
          const totalMemory = wsRes['总内存'].length > 0 ? wsRes['总内存'] : []
          const freeMemoryPercentage = wsRes['可用内存百分比'].length > 0 ? wsRes['可用内存百分比'] : []
          if (totalMemory.length > 0) {
            this.systemMemorySize = totalMemory
          }
          console.log(this.systemMemorySize)
          if (freeMemoryPercentage.length > 0) {
            freeMemoryPercentage.forEach(item => {
              const data = (100 - item.itemValue).toFixed(2)
              item.usage = data
            })
            this.systemMemoryUsage = freeMemoryPercentage
            console.log(this.systemMemoryUsage)
          }
          // 磁盘IO
          const diskIO = wsRes['磁盘'].length > 0 ? wsRes['磁盘'] : []
          if (diskIO.length > 0) {
            const diskUsage = []
            const diskSize = []
            diskIO.forEach(val => {
              // 磁盘空间
              if (val.itemName.indexOf('Total space') !== -1) {
                diskSize.push(val)
              }
              // 磁盘使用数
              if (val.itemName.indexOf('Used space') !== -1) {
                diskUsage.push(val)
              }
            })

            // 磁盘空间总大小 ====================
            // 摘出相同id项目
            let data = []
            diskSize.forEach(items => {
              let {hostid} = items
              if (!data[hostid]) {
                data[hostid] = {
                  hostid,
                  children: []
                }
              }
              data[hostid].children.push(items)
            })
            let dataPush = Object.values(data)
            console.log(dataPush)
            // 合并相同id项磁盘大小
            const totalsize = []
            dataPush.forEach(itema => {
              if (itema.children.length > 1) {
                let a = 0
                itema.children.forEach(child => {
                  a += Number(child.itemValue)
                })
                const val = this.$tool.deepCopy(itema.children[0])
                val.itemValue = a
                totalsize.push(val)
              } else {
                totalsize.push(itema.children[0])
              }
            })
            // 磁盘空间总使用率 ====================
            // 摘出相同id 磁盘使用大小
            let dataUse = []
            diskUsage.forEach(items => {
              let {hostid} = items
              if (!dataUse[hostid]) {
                dataUse[hostid] = {
                  hostid,
                  children: []
                }
              }
              dataUse[hostid].children.push(items)
            })
            let dataPushUse = Object.values(dataUse)

            // 合并相同id项磁盘使用大小
            const totalUse = []
            dataPushUse.forEach(itema => {
              if (itema.children.length > 1) {
                let b = 0
                itema.children.forEach(child => {
                  b += Number(child.itemValue)
                })
                const val = this.$tool.deepCopy(itema.children[0])
                val.itemValue = b
                totalUse.push(val)
              } else {
                totalUse.push(itema.children[0])
              }
            })
            console.log(totalUse)

            // 磁盘使用百分比
            totalsize.forEach(items => {
              totalUse.forEach(itemUse => {
                if (+items.hostid === +itemUse.hostid) {
                  const data = (+itemUse.itemValue / +items.itemValue).toFixed(4)
                  itemUse.usage = data // 使用率
                }
              })
            })
            // 各个磁盘总量信息 diskTotalData
            dataPush.forEach(eachItem => {
              let arr1 = []
              let newArr = []
              eachItem.children.forEach(chilItem => {
                if (arr1.indexOf(chilItem.itemName) === -1) {
                  arr1.push(chilItem.itemName)
                  newArr.push(chilItem)
                }
              })
              eachItem.diskTotalData = newArr
            })
            console.log(dataPush)
            // 各个磁盘已用信息 diskTotalData
            dataPushUse.forEach(eachUseItem => {
              let arr1 = []
              let newArr = []
              eachUseItem.children.forEach(chilItem => {
                if (arr1.indexOf(chilItem.itemName) === -1) {
                  arr1.push(chilItem.itemName)
                  newArr.push(chilItem)
                }
              })
              eachUseItem.diskUseData = newArr
            })
            console.log(dataPushUse)
            dataPush.forEach(dataPushData => {
              dataPushUse.forEach(dataPushUseData => {
                if (+dataPushData.hostid === +dataPushUseData.hostid) {
                  dataPushData.diskTotalData.forEach(dataPushChile => {
                    dataPushChile.name = dataPushChile.itemName.split(':')[0]
                    dataPushUseData.diskUseData.forEach(dataPushUseChile => {
                      dataPushUseChile.name = dataPushUseChile.itemName.split(':')[0]
                      if (dataPushChile.name === dataPushUseChile.name) {
                        dataPushChile.itemUseValue = dataPushUseChile.itemValue
                      }
                    })
                  })
                }
              })
            })
            this.eachDiskSize = dataPush // 各个磁盘空间大小
            // this.eachDiskUsage = dataPushUse // 各个磁盘使用大小
            this.systemDiskSize = totalsize // 磁盘总大小
            this.systemDiskUsage = totalUse // 磁盘总使用率
            console.log(this.systemDiskSize, this.systemDiskUsage)
          }
        }
      }

      // 虚拟资源 数据
      if (this.devTypeId === 478 || val === 3) {
        if (wsRes) {
          if (wsRes.data.length > 0) {
            // cpu
            if (wsRes.method === 'getItemVMCpuData') {
              const cpuSd = []
              const cpuNumber = []
              wsRes.data.forEach(val => {
                if (val.itemName.indexOf('CPU usage') !== -1 && val.itemName.indexOf('in percents') !== -1) {
                  cpuSd.push(val)
                }
                if (val.itemName.indexOf('Number of virtual CPUs') !== -1) {
                  cpuNumber.push(val)
                }
              })
              this.fictitiousRatio = cpuSd
              this.fictitiousNumber = cpuNumber
              console.log(this.fictitiousRatio, this.fictitiousNumber)
            }
          }
          // 内存
          if (wsRes.method === 'getItemVMMemoryInfoData') {
            const memorySize = []
            const memoryAll = []
            wsRes.data.forEach(val => {
              if (val.itemName.indexOf('Guest memory usage') !== -1) {
                memorySize.push(val)
              }
              if (val.itemName.indexOf('Memory size') !== -1) {
                memoryAll.push(val)
              }
            })
            // 内存使用率
            memoryAll.forEach(aItem => {
              memorySize.forEach(bItem => {
                if (+aItem.hostid === +bItem.hostid) {
                  const a = (bItem.itemValue / aItem.itemValue).toFixed(4)
                  bItem.usage = a
                }
              })
            })
            this.memorySize = memorySize
            this.memoryTotal = memoryAll
          }
        }
      }

      this.dataList.data.forEach(item => {
        Object.keys(item).forEach(keys => {
          if (keys === 'hyDevTypeId') {
            const idx = this.devTypeList.findIndex(itemList => +itemList.id === +item.hyDevTypeId)
            if (idx !== -1) {
              if (item.hyDevTypeId === 0 || item.hyDevTypeId === '') {
                item.hyDevTypeId = ''
              } else {
                item.hyDevTypeId = this.devTypeList[idx].dictdataName
              }
            }
          }
          if (keys === 'hySubdevTypeId') {
            const idx = this.allSubDevType.findIndex(itemData => +itemData.id === +item.hySubdevTypeId)
            if (idx !== -1) {
              item.hySubdevTypeId === 0 ? item.hySubdevTypeId = '' : item.hySubdevTypeId = this.allSubDevType[idx].dictdataName
            } else {
              item.hySubdevTypeId = ''
            }
          }
          if (keys === 'hyNetState') {
            switch (item.hyNetState) {
              case 0:
                item.hyNetState = '离线'
                break
              case 1:
                item.hyNetState = '在线'
                break
            }
          }
        })
        // 存储设备
        if (this.devTypeId === 477 || val === 1) {
          if (this.cpuRatio) {
            if (+item.hyZhostId === +this.cpuRatio.hostid) {
              item.CPU = `${this.cpuRatio.itemValue}`
            }
            if (+item.hyZhostId === +this.memoryUsage.hostid) {
              item.memoryUsage = `${this.memoryUsage.memory}`
              item.memorySize = this.memoryUsage.memorySize
            }
          }
        }
        // 操作系统
        if (this.devTypeId === 484 || val === 2) {
          // cpu
          if (this.systemRatio.length > 0) {
            this.systemRatio.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                item.CPU = `${(+wsItem.itemValue).toFixed(2)}`
              }
            })
          }
          // 内存大小
          if (this.systemMemorySize.length > 0) {
            this.systemMemorySize.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                const totaldata = this.$tool.sizeUnitsTransform('B', 'GB', Number(wsItem.itemValue))
                item.memorySize = `${(totaldata.size).toFixed(2)}`
              }
            })
          }
          // 内存使用率
          if (this.systemMemoryUsage.length > 0) {
            this.systemMemoryUsage.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                item.memoryUsage = `${(100 - wsItem.usage).toFixed(2)}`
              }
            })
          }
          // 磁盘
          if (this.systemDiskSize.length > 0) {
            // 总空间
            this.systemDiskSize.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                const data = this.$tool.sizeUnitsTransform('B', 'GB', Number(wsItem.itemValue))
                item.diskSize = `${(data.size).toFixed(2)}`
              }
            })

            // 总使用率
            this.systemDiskUsage.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                item.diskUsage = `${(wsItem.usage * 100).toFixed(2)}`
              }
            })
            // 各个磁盘使用率
            // 拼接各个磁盘空间和使用空间
            this.eachDiskSize.forEach(eachItem => {
              if (+item.hyZhostId === +eachItem.hostid) {
                const Utilization = []
                const useSize = []
                eachItem.diskTotalData.forEach(diskItem => {
                  const rate = (diskItem.itemUseValue / diskItem.itemValue).toFixed(4)
                  const value = diskItem.itemName.split(':')[0]
                  let name = ''
                  value.indexOf('/') === -1 ? name = `${value}盘` : name = value
                  Utilization.push(`【${name}】使用率：${(rate * 100).toFixed(2)}%`)
                  const val = sizeUnitsConversion(Number(diskItem.itemValue), 'capital')
                  const use = sizeUnitsConversion(Number(diskItem.itemUseValue), 'capital')
                  useSize.push(`【${name}】空间：${val.size}${val.units} - 已用：${use.size}${use.units}`)
                })
                item.eachDiskUsage = Utilization.join('\n') // 各磁盘使用率
                item.eachDiskSize = useSize.join('\n') // 各磁盘空间
              }
            })
          }
        }
        // 虚拟资源
        if (this.devTypeId === 478 || val === 3) {
          // cpu
          if (this.fictitiousRatio.length > 0) {
            this.fictitiousRatio.forEach(wsItem => {
              if (+item.hyZhostId === +wsItem.hostid) {
                item.CPU = `${wsItem.itemValue}`
              }
            })
          }
          if (this.fictitiousNumber.length > 0) {
            this.fictitiousNumber.forEach(ficItem => {
              if (+item.hyZhostId === +ficItem.hostid) {
                item.CPUQuantity = ficItem.itemValue
              }
            })
          }
          // 内存
          if (this.memorySize.length > 0) {
            this.memorySize.forEach(memoryItem => {
              if (+item.hyZhostId === +memoryItem.hostid) {
                item.memoryUsage = `${(memoryItem.usage * 100).toFixed(2)}`
              }
            })
          }
          if (this.memoryTotal.length > 0) {
            this.memoryTotal.forEach(totalItem => {
              if (+item.hyZhostId === +totalItem.hostid) {
                const data = this.$tool.sizeUnitsTransform('B', 'GB', Number(totalItem.itemValue))
                item.memorySize = `${(data.size).toFixed(2)}`
              }
            })
          }
        }
      })
      console.log(this.dataList)
      this.fillerData = this.dataList.data
    },
    // 设置可用性
    setAvailables(row, index) {
      let key = 'info'
      if (row.hyAvailable === 1 && index === 0 || row.hySnmpAvailable === 1 && index === 1 || row.hyJmxAvailable === 1 && index === 2 || row.hyIpmiAvailable === 1 && index === 3) {
        key = 'success'
      }
      if (row.hyAvailable === 2 && index === 0 || row.hySnmpAvailable === 2 && index === 1 || row.hyJmxAvailable === 2 && index === 2 || row.hyIpmiAvailable === 2 && index === 3) {
        key = 'danger'
      }
      return key
    },
    // 加载统计图
    loadEcharts() {
      const self = this
      const myChart = echarts.init(self.$refs['pieBar'])
      const option = {
        color: ['#00b285', '#f4f4f5'],
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '10%',
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            labelLine: {
              show: false
            },
            data: self.devStatus
          }
        ]
      }
      myChart.setOption(option, true)
    },
    // 切换页码条数，重新返回首页加载数据
    handleSizeChange(val) {
      this.findHyitHostQuery.limit = val
      this.findHyitHostQuery.page = 1
      this.findHyitHost()
    },
    // 切换当前页码，查询加载数据
    handleCurrentChange(val) {
      this.findHyitHostQuery.page = val
      this.findHyitHost()
    },
    // 搜索
    handleFilter() {
      this.findHyitHostQuery.page = 1
      this.findHyitHost()
      // this.exportFindHyitHost()
      // this.sendRequest() // 请求导出的数据
    },
    // 获取设备类型
    loadItType() {
      this.paginationShow = false
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.thumb = `image/it-monitor/it-monitor-type-icon-${item.id}.png`
            item.count = 0
            item.active = false
          })
          this.devTypeList = res.data
          this.devTypeList.splice(0, 0, {
            id: 0,
            dictdataName: '所有',
            thumb: `image/it-monitor/it-monitor-type-icon.png`,
            count: 0,
            active: true
          })
          this.$nextTick(() => {
            if (this.devTypeList.length > 0) {
              this.findHyitHostQuery.devType = this.devTypeList[0].id === 0 ? '' : this.devTypeList[0].id
            }
            const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
            if (pageQuery && !this.deviceTypeId) {
              this.findHyitHostQuery = pageQuery
              const idx = this.devTypeList.findIndex(item => item.id === pageQuery.devType)
              this.devTypeList.forEach(item => {
                item.active = false
              })
              if (idx !== -1) {
                this.$set(this.devTypeList[idx], 'active', true)
                this.devTypeId = this.devTypeList[idx].id
              }
            }
            if (this.deviceTypeId) {
              const idx = this.devTypeList.findIndex(item => +item.id === +this.deviceTypeId)
              if (idx !== -1) {
                this.devTypeList.forEach(item => {
                  item.active = false
                })
                this.$set(this.findHyitHostQuery, 'devType', this.deviceTypeId)
                this.$set(this.findHyitHostQuery, 'page', 1)
                this.$set(this.findHyitHostQuery, 'limit', 10)
                this.$set(this.devTypeList[idx], 'active', true)
              }
            }
            this.findHyitHost()
          })
        }
      })
    },
    // 获取设备状态统计
    getHyitHostStatictics() {
      request({
        url: api.itMonitor.getHyitHostStatictics,
        data: { agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1) {
          this.devStatus[0].value = res.model.onlineCount
          this.devStatus[1].value = res.model.offlineCount
          this.loadEcharts()
        }
      })
    },
    // 获取主机
    findHyitHost() {
      clearInterval(this.timer)
      clearInterval(this.setlatestData)
      this.timer = null
      this.setlatestData = null
      this.latestData = this.requestTime / 1000 // 刷新倒计时
      const data = { ...this.findHyitHostQuery }
      if (data.devType === 0) data.devType = ''
      if (this.cmdbItemTypeId) data.cmdbItemTypeId = this.cmdbItemTypeId
      request({
        url: api.itMonitor.findHyitHost,
        data: { ...data, agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1) {
          this.paginationShow = false
          this.findHyitHostQuery.total = parseInt(res.count)
          this.assetsDeviceList = res.data
          this.listLoading = false
          const subDevType = []
          res.data.forEach(item => subDevType.push(item.hySubdevTypeId))
          this.findSysDictionaryDetail(this.$tool.uniqueArray(subDevType).toString())
          this.$nextTick(function() {
            this.paginationShow = true
          })
          this.getDeviceItMonitorData(this.handelDevTypeId, 'tableColumn', res.data)
          if (this.handelDevTypeId) {
            this.setlatestData = setInterval((e) => { // 倒计时时间
              console.log('setInterval', new Date().getTime())
              this.latestData--
            }, 1000)
            this.timer = setInterval(() => {
              this.$nextTick(() => {
                this.latestData = this.requestTime / 1000 // 刷新倒计时
                this.getDeviceItMonitorData(this.handelDevTypeId, 'tableColumn', this.assetsDeviceList)
              })
            }, this.requestTime)
          }
        }
      })
    },
    // 选择设备获取主机
    handelDevTypeTab(val, idx) {
      if (val.id === 0) {
        clearInterval(this.setlatestData)
        clearInterval(this.timer)
        this.showTimeBtn = false
      } else {
        this.showTimeBtn = true
      }
      val.id === 0 ? this.devTypeId = '' : this.devTypeId = val.id
      this.findHyitHostQuery.page = 1
      this.handelDevTypeId = val.id
      val.dictdataName === '所有' ? this.exportFileName = 'IT资源监控' : this.exportFileName = val.dictdataName
      if (this.devTypeList[idx].active) return
      this.devTypeList.forEach(item => {
        item.active = false
      })
      this.devTypeList[idx].active = true
      this.$nextTick(() => {
        this.assetsDeviceList = []
        this.findHyitHostQuery.devType = val.id === 0 ? '' : val.id
        this.findHyitHost()
        // this.exportFindHyitHost()
        // this.sendRequest() // 请求导出数据
      })
    },
    // 获取设备类型下的主机数量
    getHyitHostTypeStatictics() {
      request({
        url: api.itMonitor.getHyitHostTypeStatictics,
        data: { agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1) {
          this.hostTypeStatictics = res.data
        }
      })
    },
    findSysDictionaryDetail(ids) {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids }
      }).then(res => {
        this.subDevType = res.data
      })
    },
    async findAllSysDictionaryDetail() {
      const res = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1}
      })
      return res.data
    },
    setHostListColumn(watchDeviceItMonitorData, dataVar) {
      this[`${dataVar}`].forEach((item, index) => {
        // 存储设备
        if (this.handelDevTypeId === 477) {
          const cpuUsagePercentsFilter = watchDeviceItMonitorData.cpuUsagePercents.filter(el => +el.hostid === +item.hyZhostId)
          if (cpuUsagePercentsFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'cpuUsagePercents', cpuUsagePercentsFilter[0].cpuUsagePercents)
            this.$set(this[`${dataVar}`][index], 'cpuUsagePercentsItemId', cpuUsagePercentsFilter[0].itemid)
            this.$set(this[`${dataVar}`][index], 'cpuUsagePercentsValueType', cpuUsagePercentsFilter[0].valueType)
          }
          const menoryUsagePercentsFilter = watchDeviceItMonitorData.menoryUsagePercents.filter(el => +el.hostid === +item.hyZhostId)
          if (menoryUsagePercentsFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'memoryUsagePercents', menoryUsagePercentsFilter[0].memoryUsagePercents)
            this.$set(this[`${dataVar}`][index], 'totalMemoryItemId', menoryUsagePercentsFilter[0].totalMemoryItemId)
            this.$set(this[`${dataVar}`][index], 'totalMemoryValueType', menoryUsagePercentsFilter[0].totalMemoryValueType)
            this.$set(this[`${dataVar}`][index], 'ableValMemoryItemId', menoryUsagePercentsFilter[0].ableValMemoryItemId)
            this.$set(this[`${dataVar}`][index], 'ableValMemoryValueType', menoryUsagePercentsFilter[0].ableValMemoryValueType)
          }
          const volumeTotalFilter = watchDeviceItMonitorData.volumeTotal.filter(el => +el.hostid === +item.hyZhostId)
          if (volumeTotalFilter.length > 0) this.$set(this[`${dataVar}`][index], 'volumeTotalSize', volumeTotalFilter[0].volumeTotalSize.toFixed(2))
          const volumeUsagePercentsFilter = watchDeviceItMonitorData.volumeUsagePercents.filter(el => +el.hostid === +item.hyZhostId)
          if (volumeUsagePercentsFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'volumeUsagePercents', volumeUsagePercentsFilter[0].volumeUsagePercents)
            this.$set(this[`${dataVar}`][index], 'usedItemValueType', volumeUsagePercentsFilter[0].usedItemValueType)
            this.$set(this[`${dataVar}`][index], 'usedItemId', volumeUsagePercentsFilter[0].usedItemId)
            this.$set(this[`${dataVar}`][index], 'totalItemValueType', volumeUsagePercentsFilter[0].totalItemValueType)
            this.$set(this[`${dataVar}`][index], 'totalItemId', volumeUsagePercentsFilter[0].totalItemId)
          }
        }
        // 虚拟资源
        if (this.handelDevTypeId === 478) {
          const cpuUsagePercentsFilter = watchDeviceItMonitorData.cpuUsagePercents.filter(el => +el.hostid === +item.hyZhostId)
          if (cpuUsagePercentsFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'cpuUsagePercents', cpuUsagePercentsFilter[0].itemValue)
            this.$set(this[`${dataVar}`][index], 'cpuUsagePercentsItemId', cpuUsagePercentsFilter[0].itemid)
            this.$set(this[`${dataVar}`][index], 'cpuUsagePercentsValueType', cpuUsagePercentsFilter[0].valueType)
          }
          const memoryTotalFilter = watchDeviceItMonitorData.memorySize.filter(el => +el.hostid === +item.hyZhostId)
          if (memoryTotalFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'memoryTotal', memoryTotalFilter[0].transformItemValue)
            this.$set(this[`${dataVar}`][index], 'primitiveMemoryTotal', memoryTotalFilter[0].itemValue)
          }
          const memoryUsagePercentsFilter = watchDeviceItMonitorData.memoryUsagePercents.filter(el => +el.hostid === +item.hyZhostId)
          if (memoryUsagePercentsFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'memoryUsagePercents', memoryUsagePercentsFilter[0].memoryUsagePercents)
            this.$set(this[`${dataVar}`][index], 'memorySizeItemId', memoryUsagePercentsFilter[0].memorySizeItemId)
            this.$set(this[`${dataVar}`][index], 'memorySizeValueType', memoryUsagePercentsFilter[0].memorySizeValueType)
            this.$set(this[`${dataVar}`][index], 'memoryUsageItemId', memoryUsagePercentsFilter[0].memoryUsageItemId)
            this.$set(this[`${dataVar}`][index], 'memoryUsageValueType', memoryUsagePercentsFilter[0].memoryUsageValueType)
          }
        }
        // 网络设备
        if (this.handelDevTypeId === 481) {
          const cardCountFilter = (watchDeviceItMonitorData.cardCount || []).filter(el => +el.hostid === +item.hyZhostId)
          if (cardCountFilter.length > 0) this.$set(this[`${dataVar}`][index], 'cardCount', cardCountFilter[0].cardCount)
          const portCountFilter = (watchDeviceItMonitorData.portCount || []).filter(el => +el.hostid === +item.hyZhostId)
          if (portCountFilter.length > 0) this.$set(this[`${dataVar}`][index], 'portCount', portCountFilter[0].itemValue)
          const hostFlowFilter = (watchDeviceItMonitorData.hostFlow || []).filter(el => +el.hostid === +item.hyZhostId)
          if (hostFlowFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'send', hostFlowFilter[0].sendSize)
            this.$set(this[`${dataVar}`][index], 'sendItemId', hostFlowFilter[0].sendItemId)
            this.$set(this[`${dataVar}`][index], 'sendValueType', hostFlowFilter[0].sendValueType)
            this.$set(this[`${dataVar}`][index], 'sendUnits', hostFlowFilter[0].sendUnits)
            this.$set(this[`${dataVar}`][index], 'receive', hostFlowFilter[0].receiveSize)
            this.$set(this[`${dataVar}`][index], 'receiveItemId', hostFlowFilter[0].receiveItemId)
            this.$set(this[`${dataVar}`][index], 'receiveValueType', hostFlowFilter[0].receiveValueType)
            this.$set(this[`${dataVar}`][index], 'receiveUnits', hostFlowFilter[0].receiveUnits)
          }
        }
        // 中间件
        if (this.handelDevTypeId === 482) {
          const requestCountFilter = (watchDeviceItMonitorData.requestCount || []).filter(el => +el.hostid === +item.hyZhostId)
          if (requestCountFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'requestCount', requestCountFilter[0].itemValue)
            this.$set(this[`${dataVar}`][index], 'requestItemId', requestCountFilter[0].itemid)
            this.$set(this[`${dataVar}`][index], 'requestValueType', requestCountFilter[0].valueType)
          }
          const sendFilter = (watchDeviceItMonitorData.send || []).filter(el => +el.hostid === +item.hyZhostId)
          if (sendFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'send', sendFilter[0].size)
            this.$set(this[`${dataVar}`][index], 'sendItemId', sendFilter[0].itemid)
            this.$set(this[`${dataVar}`][index], 'sendValueType', sendFilter[0].valueType)
          }
          const receiveFilter = (watchDeviceItMonitorData.receive || []).filter(el => +el.hostid === +item.hyZhostId)
          if (receiveFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'receive', receiveFilter[0].size)
            this.$set(this[`${dataVar}`][index], 'receiveItemId', receiveFilter[0].itemid)
            this.$set(this[`${dataVar}`][index], 'receiveValueType', receiveFilter[0].valueType)
          }
        }
        // 数据库
        if (this.handelDevTypeId === 483) {
          const activeUserFilter = watchDeviceItMonitorData.activeUser.filter(el => +el.hostid === +item.hyZhostId)
          if (activeUserFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'activeUser', activeUserFilter[0].itemValue)
            this.$set(this[`${dataVar}`][index], 'activeUserItemId', activeUserFilter[0].itemid)
            this.$set(this[`${dataVar}`][index], 'activeUserValueType', activeUserFilter[0].valueType)
          }
          const fileSizeFilter = watchDeviceItMonitorData.fileSize.filter(el => +el.hostid === +item.hyZhostId)
          if (fileSizeFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'itemids', fileSizeFilter[0].itemids)
            this.$set(this[`${dataVar}`][index], 'valueTypes', fileSizeFilter[0].valueTypes)
            this.$set(this[`${dataVar}`][index], 'fileSize', fileSizeFilter[0].size)
            this.$set(this[`${dataVar}`][index], 'fileSizeValueType', fileSizeFilter[0].valueType)
            this.$set(this[`${dataVar}`][index], 'fileSizeItemId', fileSizeFilter[0].itemid)
            this.$set(this[`${dataVar}`][index], 'fileSizeUnits', fileSizeFilter[0].units)
          }
        }
        // 操作系统
        if (this.handelDevTypeId === 484) {
          const cpuUsagePercentsFilter = watchDeviceItMonitorData.cpuUsagePercents.filter(el => +el.hostid === +item.hyZhostId)
          if (cpuUsagePercentsFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'cpuUsagePercents', cpuUsagePercentsFilter[0].itemValue)
            this.$set(this[`${dataVar}`][index], 'cpuUsagePercentsItemId', cpuUsagePercentsFilter[0].itemid)
            this.$set(this[`${dataVar}`][index], 'cpuUsagePercentsValueType', cpuUsagePercentsFilter[0].valueType)
          }
          const memoryUsagePercentsFilter = watchDeviceItMonitorData.memoryUsagePercents.filter(el => +el.hostid === +item.hyZhostId)
          if (memoryUsagePercentsFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'memoryUsagePercents', memoryUsagePercentsFilter[0].itemValue)
            this.$set(this[`${dataVar}`][index], 'memoryUsagePercentsItemId', memoryUsagePercentsFilter[0].itemid)
            this.$set(this[`${dataVar}`][index], 'memoryUsagePercentsValueType', memoryUsagePercentsFilter[0].valueType)
          }
          const diskUsagePercentsFilter = watchDeviceItMonitorData.diskUsagePercents.filter(el => +el.hostid === +item.hyZhostId)
          if (diskUsagePercentsFilter.length > 0) {
            this.$set(this[`${dataVar}`][index], 'diskUsagePercents', diskUsagePercentsFilter[0].diskUsagePercents)
            this.$set(this[`${dataVar}`][index], 'usedItemId', diskUsagePercentsFilter[0].usedItemId)
            this.$set(this[`${dataVar}`][index], 'usedValueType', diskUsagePercentsFilter[0].usedValueType)
            this.$set(this[`${dataVar}`][index], 'totalItemId', diskUsagePercentsFilter[0].totalItemId)
            this.$set(this[`${dataVar}`][index], 'totalValueType', diskUsagePercentsFilter[0].totalValueType)
          }
        }
      })
    },
    async openMonitorNetListEchart(t, item, key) {
      console.log(t, item)
      this.localStorageOperation('set', 'fromAgent', item.fromAgent || '')
      this.localStorageOperation('set', 'fromHostId', item.fromHostId || '')
      this.currentHandlerItemAgent = item.agent
      /* 存储设备 */
      // cpu使用率
      if (key === 'storageDeviceCpuUsagePercents') {
        this.tableParams = [{
          label: ['最高使用率', '平均使用率', '最低使用率'],
          value: 0,
          unit: '%',
          itemid: item.cpuUsagePercentsItemId,
          valueType: item.cpuUsagePercentsValueType,
          type: ['max', 'avg', 'min']
        }]
        this.detailParams = [{
          itemid: item.cpuUsagePercentsItemId,
          valueType: item.cpuUsagePercentsValueType,
          name: 'CPU使用率',
          color: '#87DEAF',
          unit: '%',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        }]
      }
      // 内存使用率
      if (key === 'storageDeviceMemoryUsagePercents') {
        const objAttrDictionary = {
          totalMemoryItemId: item.totalMemoryItemId,
          ableValMemoryItemId: item.ableValMemoryItemId,
          totalMemoryValueType: item.totalMemoryValueType,
          ableValMemoryValueType: item.ableValMemoryValueType
        }
        this.detailParams = [
          {
            itemid: [item.totalMemoryItemId, item.ableValMemoryItemId],
            valueType: [item.totalMemoryValueType, item.ableValMemoryValueType],
            name: '内存使用率',
            color: '#87DEAF',
            unit: '%',
            echartType: 'value',
            arithmeticOperatorValue: 100,
            arithmeticOperator: '-',
            conversionPercentage: true,
            conversionUnitType: 'data',
            isConversion: true,
            isAssignUnit: true,
            data: [],
            assignUnit: '%',
            units: [],
            time: [],
            yAxisMax: 100,
            way: 'multiple',
            methods: 'monitorStorageDeviceMemoryStatistics',
            objAttrDictionary
          }
        ]
        this.tableParams = [
          {
            label: ['最高内存使用率', '平均内存使用率', '最低内存使用率'],
            value: 0,
            unit: '%',
            itemid: [item.totalMemoryItemId, item.ableValMemoryItemId],
            valueType: [item.totalMemoryValueType, item.ableValMemoryValueType],
            type: ['max', 'avg', 'min'],
            way: 'multiple',
            methods: 'monitorStorageDeviceMemoryStatistics',
            objAttrDictionary
          }
        ]
      }
      // 卷使用率
      if (key === 'storageDeviceVolumeUsagePercents') {
        this.detailParams = [
          {
            itemid: [...item.usedItemId, ...item.totalItemId],
            valueType: [...item.usedItemValueType, ...item.totalItemValueType],
            name: '卷使用率',
            color: '#87DEAF',
            data: [],
            units: [],
            time: [],
            yAxisMax: 100,
            way: 'multiple',
            methods: 'monitorStorageDeviceVolumeUsagePercentsStatistics',
            objAttrDictionary: {
              usedItemId: item.usedItemId, totalItemId: item.totalItemId
            }
          }
        ]
        this.tableParams = [
          {
            label: ['最高卷使用率', '平均卷使用率', '最低卷使用率'],
            value: 0,
            unit: '%',
            itemid: [...item.usedItemId, ...item.totalItemId],
            valueType: [...item.usedItemValueType, ...item.totalItemValueType],
            type: ['max', 'avg', 'min'],
            way: 'multiple',
            methods: 'monitorStorageDeviceVolumeUsagePercentsStatistics',
            objAttrDictionary: {
              usedItemId: item.usedItemId, totalItemId: item.totalItemId
            }
          }
        ]
      }
      /* 存储设备 */

      /* 虚拟资源 */
      // cpu使用率
      if (key === 'vmDeviceCpuUsagePercents') {
        this.tableParams = [{
          label: ['最高使用率', '平均使用率', '最低使用率'],
          value: 0,
          unit: '%',
          itemid: item.cpuUsagePercentsItemId,
          valueType: item.cpuUsagePercentsValueType,
          type: ['max', 'avg', 'min']
        }]
        this.detailParams = [{
          itemid: item.cpuUsagePercentsItemId,
          valueType: item.cpuUsagePercentsValueType,
          name: 'CPU使用率',
          color: '#87DEAF',
          unit: '%',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        }]
      }
      // 内存使用率
      if (key === 'vmMemoryUsagePercents') {
        const objAttrDictionary = {
          memorySizeItemId: item.memorySizeItemId,
          memorySizeValueType: item.memorySizeValueType,
          memoryUsageItemId: item.memoryUsageItemId,
          memoryUsageValueType: item.memoryUsageValueType,
          primitiveMemoryTotal: item.primitiveMemoryTotal
        }
        this.tableParams = [{
          label: ['最高使用率', '平均使用率', '最低使用率'],
          value: 0,
          unit: '%',
          itemid: [item.memorySizeItemId, item.memoryUsageItemId],
          valueType: [item.memorySizeValueType, item.memoryUsageValueType],
          type: ['max', 'avg', 'min'],
          way: 'multiple',
          methods: 'monitorVMDeviceMemoryUsagePercentsStatistics',
          objAttrDictionary
        }]
        this.detailParams = [{
          itemid: [item.memorySizeItemId, item.memoryUsageItemId],
          valueType: [item.memorySizeValueType, item.memoryUsageValueType],
          name: '内存使用率',
          color: '#87DEAF',
          unit: '%',
          echartType: 'value',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100,
          way: 'multiple',
          methods: 'monitorVMDeviceMemoryUsagePercentsStatistics',
          objAttrDictionary
        }]
      }
      /* 虚拟资源 */

      /* 网络设备 */
      // 上下行
      if (key === 'NetWorkDeviceFlow') {
        if (t === 'send' || !t) {
          this.detailParams = [{
            agent: item.agent,
            unit: item.sendUnits,
            itemid: item.sendItemId,
            valueType: item.sendValueType,
            name: '发送',
            color: '#87DEAF',
            echartType: 'value',
            unitSuffix: 'ps',
            isConversion: true,
            conversionUnitType: 'data',
            data: [],
            units: [],
            time: [],
            isAssignUnit: true,
            assignUnit: 'MB',
            toFixed: 2
          }]
          this.tableParams = [{
            agent: item.agent,
            label: ['最高发送', '最低发送', '平均发送'],
            value: 0,
            unit: item.sendUnits,
            itemid: item.sendItemId,
            valueType: item.sendValueType,
            isConversion: true,
            conversionUnitType: 'data',
            type: ['max', 'min', 'avg'],
            isAssignUnit: true,
            assignUnit: 'MB',
            fixed: 2
          }]
        }
        if (t === 'receive' || !t) {
          this.detailParams = [{
            agent: item.agent,
            unit: item.receiveUnits,
            itemid: item.receiveItemId,
            valueType: item.receiveValueType,
            name: '接收',
            color: '#3ba9ed',
            echartType: 'value',
            unitSuffix: 'ps',
            isConversion: true,
            conversionUnitType: 'data',
            data: [],
            units: [],
            time: [],
            isAssignUnit: true,
            assignUnit: 'MB',
            toFixed: 2
          }]
          this.tableParams = [{
            agent: item.agent,
            label: ['最高接收', '最低接收', '平均接收'],
            value: 0,
            unit: item.receiveUnits,
            itemid: item.receiveItemId,
            valueType: item.receiveValueType,
            isConversion: true,
            conversionUnitType: 'data',
            type: ['max', 'min', 'avg'],
            isAssignUnit: true,
            assignUnit: 'MB',
            fixed: 2
          }]
        }
      }
      /* 网络设备 */

      /* 中间件 */
      // 请求数
      if (key === 'middlewareRequireCount') {
        this.tableParams = [{
          label: ['最高请求数', '平均请求数', '最低请求数'],
          value: 0,
          unit: '',
          itemid: item.requestCount,
          valueType: item.requestValueType,
          type: ['max', 'avg', 'min']
        }]
        this.detailParams = [{
          itemid: item.requestItemId,
          valueType: item.requestValueType,
          name: '请求数',
          color: '#87DEAF',
          unit: '',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        }]
      }
      // 接收
      if (key === 'middlewareReceive') {
        this.tableParams = [{
          label: ['最高接收', '平均接收', '最低接收'],
          value: 0,
          unit: item.receiveUnits,
          itemid: item.receiveItemId,
          valueType: item.receiveValueType,
          type: ['max', 'avg', 'min'],
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'KB',
          fixed: 2
        }]
        this.detailParams = [{
          itemid: item.receiveItemId,
          valueType: item.receiveValueType,
          name: '请求数',
          color: '#87DEAF',
          unit: item.receiveUnits,
          data: [],
          units: [],
          time: [],
          echartType: 'value',
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'KB',
          toFixed: 2
        }]
      }
      // 发送
      if (key === 'middlewareSend') {
        this.tableParams = [{
          label: ['最高发送', '平均发送', '最低发送'],
          value: 0,
          unit: item.sendUnits,
          itemid: item.sendItemId,
          valueType: item.sendValueType,
          type: ['max', 'avg', 'min'],
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'KB',
          fixed: 2
        }]
        this.detailParams = [{
          itemid: item.sendItemId,
          valueType: item.sendValueType,
          name: '发送',
          color: '#87DEAF',
          unit: item.sendUnits,
          data: [],
          units: [],
          time: [],
          echartType: 'value',
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'KB',
          toFixed: 2
        }]
      }
      /* 中间件 */

      /* 操作系统 */
      // cpu使用率
      if (key === 'operatingSystemCpuUsagePercents') {
        this.tableParams = [{
          label: ['最高使用率', '平均使用率', '最低使用率'],
          value: 0,
          unit: '%',
          itemid: item.cpuUsagePercentsItemId,
          valueType: item.cpuUsagePercentsValueType,
          type: ['max', 'avg', 'min'],
          fixed: 2
        }]
        this.detailParams = [{
          itemid: item.cpuUsagePercentsItemId,
          valueType: item.cpuUsagePercentsValueType,
          name: 'CPU使用率',
          color: '#87DEAF',
          unit: '%',
          echartType: 'value',
          data: [],
          units: [],
          time: [],
          toFixed: 2
        }]
      }
      // 内存使用率
      if (key === 'operatingSystemMemoryUsagePercents') {
        this.tableParams = [{
          label: ['最高使用率', '平均使用率', '最低使用率'],
          value: 0,
          unit: '%',
          itemid: item.memoryUsagePercentsItemId,
          valueType: item.memoryUsagePercentsValueType,
          type: ['max', 'avg', 'min'],
          fixed: 2
        }]
        this.detailParams = [{
          itemid: item.memoryUsagePercentsItemId,
          valueType: item.memoryUsagePercentsValueType,
          name: '内存使用率',
          color: '#87DEAF',
          unit: '%',
          echartType: 'value',
          data: [],
          units: [],
          time: [],
          toFixed: 2
        }]
      }
      // 磁盘使用率
      if (key === 'operatingSystemDiskUsagePercents') {
        this.detailParams = [
          {
            itemid: [...item.usedItemId, ...item.totalItemId],
            valueType: [...item.usedValueType, ...item.totalValueType],
            name: '磁盘使用率',
            color: '#87DEAF',
            data: [],
            units: [],
            time: [],
            yAxisMax: 100,
            way: 'multiple',
            methods: 'operatingSystemDiskUsagePercentsStatistics',
            objAttrDictionary: {
              usedItemId: item.usedItemId, totalItemId: item.totalItemId
            }
          }
        ]
        this.tableParams = [
          {
            label: ['最高磁盘使用率', '平均磁盘使用率', '最低磁盘使用率'],
            value: 0,
            unit: '%',
            itemid: [...item.usedItemId, ...item.totalItemId],
            valueType: [...item.usedValueType, ...item.totalValueType],
            type: ['max', 'avg', 'min'],
            way: 'multiple',
            methods: 'operatingSystemDiskUsagePercentsStatistics',
            objAttrDictionary: {
              usedItemId: item.usedItemId, totalItemId: item.totalItemId
            }
          }
        ]
      }
      /* 操作系统 */

      /* 数据库 */
      // 活跃用户
      if (key === 'dataBaseActiveUser') {
        this.tableParams = [{
          label: ['最高活跃用户', '平均活跃用户', '最低活跃用户'],
          value: 0,
          unit: '',
          itemid: item.activeUserItemId,
          valueType: item.activeUserValueType,
          type: ['max', 'avg', 'min']
        }]
        this.detailParams = [{
          itemid: item.activeUserItemId,
          valueType: item.activeUserValueType,
          name: '活跃用户',
          color: '#87DEAF',
          unit: '%',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        }]
      }
      // 数据文件大小
      if (key === 'dataBseFileSize') {
        this.tableParams = [{
          label: ['最高数据文件大小', '平均数据文件大小', '最低数据文件大小'],
          value: 0,
          unit: item.fileSizeUnits,
          itemid: item.itemids,
          valueType: item.valueTypes,
          type: ['max', 'avg', 'min'],
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'GB',
          fixed: 2,
          way: 'multiple',
          methods: 'monitorDBDeviceFileSizeStatistics'
        }]
        this.detailParams = [{
          itemid: item.itemids,
          valueType: item.valueTypes,
          name: '数据文件大小',
          color: '#87DEAF',
          unit: item.fileSizeUnits,
          data: [],
          units: [],
          time: [],
          echartType: 'value',
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'GB',
          toFixed: 2,
          way: 'multiple',
          methods: 'monitorDBDeviceFileSizeStatistics'
        }]
      }
      /* 数据库 */
      this.showUsedDetailDialog = true
    },
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
      this.tableParams = []
      this.detailParams = []
    },
    setHostListExport(watchDeviceItMonitorData) {
      const excelTitleTmp = this.$tool.deepCopy(this.excelTitleTmp)
      // 存储设备
      if (this.handelDevTypeId === 477) {
        excelTitleTmp.splice(3, 0, ...[
          { title: 'CPU使用率（%）', dataIndex: 'cpuUsagePercents', width: 30 },
          { title: '内存使用率（%）', dataIndex: 'memoryUsagePercents', width: 30 },
          { title: '卷使用率（%）', dataIndex: 'volumeUsagePercents', width: 30 },
          { title: '卷总空间（GB）', dataIndex: 'volumeUsagePercents', width: 30 }
        ])
      }
      // 虚拟资源
      if (this.handelDevTypeId === 478) {
        excelTitleTmp.splice(3, 0, ...[
          { title: 'CPU使用率（%）', dataIndex: 'cpuUsagePercents', width: 30 },
          { title: '内存大小（G）', dataIndex: 'memoryTotal', width: 30 },
          { title: '内存使用率（%）', dataIndex: 'memoryUsagePercents', width: 30 }
        ])
      }
      // 网络设备
      if (this.handelDevTypeId === 481) {
        excelTitleTmp.splice(3, 0, ...[
          { title: '版卡总数', dataIndex: 'cardCount', width: 30 },
          { title: '使用端口的数量', dataIndex: 'portCount', width: 30 },
          { title: '发送速率（Mb/s）', dataIndex: 'send', width: 30 },
          { title: '接收速率（Mb/s）', dataIndex: 'receive', width: 30 }
        ])
      }
      // 中间件
      if (this.handelDevTypeId === 482) {
        excelTitleTmp.splice(3, 0, ...[
          { title: '请求数', dataIndex: 'requestCount', width: 30 },
          { title: '接收（Kbps）', dataIndex: 'send', width: 30 },
          { title: '发送（Kbps）', dataIndex: 'receive', width: 30 }
        ])
      }
      // 数据库
      if (this.handelDevTypeId === 483) {
        excelTitleTmp.splice(3, 0, ...[
          { title: '数据文件大小', dataIndex: 'fileSize', width: 30 },
          { title: '活跃用户', dataIndex: 'activeUser', width: 30 }
        ])
      }
      // 操作系统
      if (this.handelDevTypeId === 484) {
        excelTitleTmp.splice(3, 0, ...[
          { title: 'CPU使用率（%）', dataIndex: 'cpuUsagePercents', width: 30 },
          { title: '内存使用率（%）', dataIndex: 'memoryUsagePercents', width: 30 },
          { title: '磁盘使用率（%）', dataIndex: 'diskUsagePercents', width: 30 }
        ])
      }
      console.log(excelTitleTmp)
      this.ExcelTitle = excelTitleTmp
      if (this.exportDataWsOpt.groupType === 'cmd') {
        const getAgentGroupIndex = this.exportDataWsOpt.agentGroup.findIndex(el => +el.agent === +watchDeviceItMonitorData.agent && el.cmd === watchDeviceItMonitorData.cmd)
        if (getAgentGroupIndex !== -1) {
          this.$set(this.exportDataWsOpt.agentGroup[getAgentGroupIndex], 'statue', true)
        }
      }
      if (this.exportDataWsOpt.groupType === 'methed') {
        const getAgentGroupIndex = this.exportDataWsOpt.agentGroup.findIndex(el => +el.agent === +watchDeviceItMonitorData.agent && el.methed === watchDeviceItMonitorData.methed)
        if (getAgentGroupIndex !== -1) {
          this.$set(this.exportDataWsOpt.agentGroup[getAgentGroupIndex], 'statue', true)
        }
      }
      // console.log(watchDeviceItMonitorData)
      // console.log(this.exportDataWsOpt)
      this.setHostListColumn(watchDeviceItMonitorData, 'storageExportData')

      let allStatue = false
      this.exportDataWsOpt.agentGroup.forEach(item => {
        if (item.statue && !allStatue) allStatue = true
      })
      if (allStatue) {
        this.percentage = 100
        this.loading = false
        this.showDialog = false
        this.fillerList = this.storageExportData
      }
    }
  }
}

</script>

<style lang="scss" scoped>
.flex-container {
  width:100%;height:100%;position:relative;
  .left-tools {
    position: fixed;
    // position: absolute;top:0;left:0;bottom: 0;
    width: 240px;height: 100%;
    // min-height: calc(100vh - 146px);
    /*border-right: solid 1px #e6e6e6;*/
    background-color: #E5ECF6;
    overflow-y:scroll;
    overflow-x: hidden;
    .left-box{width: 100%;height: 100%;position: relative;}
    .echart-box{
      width: 240px;
      height: 200px;
      position: fixed;
      background-color: #E5ECF6;
      // top:0;
      // left:0;
      // right:0;
      .pieBar{
        flex: 1;
        width: 80%;
        height: 80%;
        margin: 0 10%;
      }
    }
    .cat-box{
      box-sizing: border-box;z-index: 50;padding-top:200px;
      .dev-type-item{
        padding:0 20px;box-sizing: border-box;cursor: pointer;
        height:45px;width:100%;line-height:45px;
        display:flex;justify-content: space-between;
        font-size: 14px;
        >div:first-child{
          display: flex;justify-content: flex-start;
          img{width:16px;height: 16px;margin-right: 10px; margin-top:15px}
        }
        .count{color: #999;}
      }
      .dev-type-item:hover,.dev-type-item.active {
        background:#B7CBE7;
      }
    }

  }
  .right-tools {
    // width: calc(100% - 300px);
    padding-left:240px;box-sizing: border-box;height: 100%;
  }
}
.monitoring-box{
  display: flex;flex-wrap:wrap;
  >div{margin-right: 5px;margin-bottom:5px;border: 1px solid #eee;padding:3px 5px;width: 70px;}
  >div.active{background: green;color:#fff;}
}
.el-tag--dark.el-tag--info { background: #cccccc;}
.reload-tag {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
  background: #f8f8f8;
  color: #b1b1b1;
}
</style>
