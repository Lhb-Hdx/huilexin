<template>
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
        <div class="filter-item reload-tag">刷新时间 {{ $tool.formatSeconds(latestData) }}</div>
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
            <el-table-column label="CPU使用率（%）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.cpuUsagePercents }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="内存使用率（%）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.memoryUsagePercents }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="卷使用率（%）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.volumeUsagePercents }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="卷总空间（GB）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.volumeTotalSize }}
              </template>
            </el-table-column>
          </template>
          <!-- 虚拟资源 -->
          <template v-if="handelDevTypeId === 478">
            <el-table-column label="CPU使用率（%）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.cpuUsagePercents || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="内存大小（G）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.memoryTotal || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="内存使用率（%）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.memoryUsagePercents || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
          </template>
          <!-- 服务设备 -->
          <!--            <template v-if="handelDevTypeId === 479"></template>-->
          <!-- 网络设备 -->
          <template v-if="handelDevTypeId === 481">
            <el-table-column label="版卡总数" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.cardCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="使用端口的数量" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.portCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="发送速率（Mb/s）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.send || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="接收速率（Mb/s）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.receive || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
          </template>
          <!-- 中间件 -->
          <template v-if="handelDevTypeId === 482">
            <el-table-column label="请求数" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.requestCount }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="接收（Kbps）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.send || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="发送（Kbps）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.receive || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
          </template>
          <!-- 数据库 -->
          <template v-if="handelDevTypeId === 483">
            <el-table-column label="数据文件大小" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.fileSize || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="活跃用户" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.activeUser || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
          </template>
          <!-- 操作系统 -->
          <template v-if="handelDevTypeId === 484">
            <el-table-column label="CPU使用率（%）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.cpuUsagePercents || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="内存使用率（%）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.memoryUsagePercents || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
              </template>
            </el-table-column>
            <el-table-column label="磁盘使用率（%）" show-overflow-tooltip width="140">
              <template slot-scope="{row}">
                {{ row.diskUsagePercents || 0 }}
                <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart(row)">
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
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import ExportExcelWithStyle from '@/components/ExportExcelWithStyle/export-excel-with-style'

export default {
  name: 'DeviceList',
  components: {
    ExportExcelWithStyle
  },
  props: {
    devTypeList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      handelDevTypeId: '',
      findHyitHostQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        devType: '',
        status: '',
        hostType: 1
      },
      assetsDeviceList: [],
      paginationShow: true,
      pageSize: [10, 20, 30, 50, 100, 200, 300, 500],
      subDevType: [],
      requestTime: 60000, // 刷新时间
      latestData: 0, // 最新数据倒计时
      timer: null,
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      currentHandlerItemAgent: '',
      statusOptions: [
        { id: 0, label: '离线', value: 0}, { id: 1, label: '在线', value: 1 }
      ],
      rowHeight: [ // excel各行行高
        { num: 1, height: 70},
        { num: 2, height: 40},
        { num: 3, height: 40}
      ],
      ExcelTitle: [
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
        },
        {
          title: 'CPU数',
          dataIndex: 'CPUQuantity',
          width: 10
        },
        {
          title: 'CPU使用率(%)',
          dataIndex: 'CPU',
          width: 15
        },
        {
          title: '内存空间(G)',
          dataIndex: 'memorySize',
          width: 15
        },
        {
          title: '内存使用率(%)',
          dataIndex: 'memoryUsage',
          width: 15
        },
        {
          title: '磁盘总空间(G)',
          dataIndex: 'diskSize',
          width: 15
        },
        {
          title: '磁盘总使用率(%)',
          dataIndex: 'diskUsage',
          width: 15
        },

        {
          title: '各磁盘空间',
          dataIndex: 'eachDiskSize',
          width: 45
        },
        {
          title: '各磁盘使用率',
          dataIndex: 'eachDiskUsage',
          width: 30
        }
      ],
      exportFileName: 'IT资源监控',
      fillerList: [],
      fillerData: [],
      loading: false,
      showDialog: false,
      percentage: 0,
      wrapList: [], // 需换行的数组
      agentsIds: '',
      listLoading: false
    }
  },
  computed: {
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
    // 设置子类型
    setSubType() {
      return function(hySubdevTypeId) {
        const idx = this.subDevType.findIndex(item => Number(item.id) === Number(hySubdevTypeId))
        if (idx !== -1) return this.subDevType[idx].dictdataName
      }
    }
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')

    this.$EventBus.$on('handelDevTypeTab', (val) => {
      this.findHyitHostQuery.page = 1
      this.handelDevTypeId = val.id
      this.assetsDeviceList = []
      this.findHyitHostQuery.devType = val.id === 0 ? '' : val.id
      this.findHyitHost()
    })
  },
  methods: {
    // 获取主机
    findHyitHost() {
      this.latestData = this.requestTime / 1000 // 刷新倒计时
      const data = { ...this.findHyitHostQuery }
      if (data.devType === 0) data.devType = ''
      // if (this.cmdbItemTypeId) data.cmdbItemTypeId = this.cmdbItemTypeId
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
          this.setlatestData = setInterval(() => { // 倒计时时间
            this.latestData--
          }, 1000)
          this.timer = setInterval(() => {
            this.$nextTick(() => {
              this.latestData = this.requestTime / 1000 // 刷新倒计时
              // this.getDeviceItMonitorData(this.handelDevTypeId, 'tableColumn', this.assetsDeviceList)
            })
          }, this.requestTime)
        }
      })
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
      this.dataList = res
      const agents = this.agentsIds.split(',')
      const ids = []
      res.data.forEach(item => {
        ids.push(item.hyZhostId)
      })
      console.log(ids)
      // 这部分设备不取实时数据
      if (this.devTypeId === 479 || this.devTypeId === 481 || this.devTypeId === 483 || this.devTypeId === 482 || this.devTypeId === 490 || this.devTypeId === 480) {
        const datas = ['CPUQuantity', 'CPU', 'memorySize', 'memoryUsage', 'diskSize', 'diskUsage', 'eachDiskSize', 'eachDiskUsage']
        for (let i = 0; i < this.ExcelTitle.length; i++) {
          for (let j = 0; j < datas.length; j++) {
            if (String(this.ExcelTitle[i].dataIndex) === String(datas[j])) {
              this.ExcelTitle.splice(i, 1)
            }
          }
        }
        await this.exportFindHyitHost()
        this.percentage = 100
        this.loading = false
        setTimeout(() => {
          this.showDialog = false
          this.fillerList = this.fillerData
        }, 500)
      } else {
        this.ExcelTitle = [
          {title: '对象', dataIndex: 'hyMarkName', width: 40},
          {title: '类型', dataIndex: 'hyDevTypeId', width: 15},
          {title: '子类型', dataIndex: 'hySubdevTypeId', width: 15},
          {title: 'IP', dataIndex: 'hyIp', width: 30},
          {title: '监控项', dataIndex: 'hyItemCount', width: 10},
          {title: '在线状态', dataIndex: 'hyNetState', width: 10},
          {title: 'CPU数', dataIndex: 'CPUQuantity', width: 10},
          {title: 'CPU使用率(%)', dataIndex: 'CPU', width: 15},
          {title: '内存空间(G)', dataIndex: 'memorySize', width: 15},
          {title: '内存使用率(%)', dataIndex: 'memoryUsage', width: 15},
          {title: '磁盘总空间(G)', dataIndex: 'diskSize', width: 15},
          {title: '磁盘总使用率(%)', dataIndex: 'diskUsage', width: 15},
          {title: '各磁盘空间', dataIndex: 'eachDiskSize', width: 45},
          {title: '各磁盘使用率', dataIndex: 'eachDiskUsage', width: 30}
        ]
      }
      // 选择 所有
      if (!this.devTypeId || this.devTypeId === 0) {
        this.wrapList = ['M', 'N']
        const methed = ['getItemVMCpuData', 'getItemVMMemoryInfoData']
        if (ids.length > 100) {
          const idsArray = this.cutArray(ids, 100)
          const num = Number((100 / (agents.length * methed.length * 3 * idsArray.length)).toFixed(1))
          for (let c = 0; c < idsArray.length; c++) {
            for (let i = 0; i < agents.length; i++) {
              const storageData = await this.agentGetHostShowByWs(idsArray[c].toString(), agents[i].toString()) // 存储设备
              await this.exportFindHyitHost(storageData.data, 1)
              this.percentage = Number((this.percentage + num).toFixed(1))

              const systemData = await this.agentItAgentGetHostShow(idsArray[c].toString(), agents[i].toString()) // 操作系统
              await this.exportFindHyitHost(systemData.data, 2)
              this.percentage = Number((this.percentage + num).toFixed(1))

              for (let j = 0; j < methed.length; j++) { // 虚拟资源
                const cpuData = await this.agentGetHostData(idsArray[c].toString(), agents[i].toString(), methed[j])
                await this.exportFindHyitHost(cpuData, 3)
                this.percentage = Number((this.percentage + num).toFixed(1))

                const memoryInfoData = await this.agentGetHostData(idsArray[c].toString(), agents[i].toString(), methed[j])
                await this.exportFindHyitHost(memoryInfoData, 3)
                this.percentage = Number((this.percentage + num).toFixed(1))
              }
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        } else {
          const num = Number((100 / (agents.length * methed.length * 3)).toFixed(1))
          for (let i = 0; i < agents.length; i++) {
            const storageData = await this.agentGetHostShowByWs(ids.toString(), agents[i].toString()) // 存储设备
            await this.exportFindHyitHost(storageData.data, 1)
            this.percentage = Number((this.percentage + num).toFixed(1))

            const systemData = await this.agentItAgentGetHostShow(ids.toString(), agents[i].toString()) // 操作系统
            await this.exportFindHyitHost(systemData.data, 2)
            this.percentage = Number((this.percentage + num).toFixed(1))

            for (let j = 0; j < methed.length; j++) { // 虚拟资源
              const cpuData = await this.agentGetHostData(ids.toString(), agents[i].toString(), methed[j])
              await this.exportFindHyitHost(cpuData, 3)
              this.percentage = Number((this.percentage + num).toFixed(1))

              const memoryInfoData = await this.agentGetHostData(ids.toString(), agents[i].toString(), methed[j])
              await this.exportFindHyitHost(memoryInfoData, 3)
              this.percentage = Number((this.percentage + num).toFixed(1))
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        }
      }

      // 存储设备
      if (this.devTypeId === 477) {
        if (ids.length > 100) {
          const idsArray = this.cutArray(ids, 100)
          const num = Number((100 / (agents.length * idsArray.length)).toFixed(1))
          for (let c = 0; c < idsArray.length; c++) {
            for (let i = 0; i < agents.length; i++) {
              const storageData = await this.agentGetHostShowByWs(idsArray[c].toString(), agents[i].toString())
              await this.exportFindHyitHost(storageData.data)
              this.percentage = Number((this.percentage + num).toFixed(1))
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        } else {
          const num = Number((100 / agents.length).toFixed(1))
          for (let i = 0; i < agents.length; i++) {
            const storageData = await this.agentGetHostShowByWs(ids.toString(), agents[i].toString())
            console.log(storageData)
            await this.exportFindHyitHost(storageData.data)
            this.percentage = Number((this.percentage + num).toFixed(1))
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        }
      }
      // 虚拟资源
      if (this.devTypeId === 478) {
        const methed = ['getItemVMCpuData', 'getItemVMMemoryInfoData']
        if (ids.length > 100) {
          const idsArray = this.cutArray(ids, 100)
          const num = Number((100 / (agents.length * methed.length * 2 * idsArray.length)).toFixed(1))
          for (let c = 0; c < idsArray.length; c++) {
            for (let i = 0; i < agents.length; i++) {
              for (let j = 0; j < methed.length; j++) {
                const cpuData = await this.agentGetHostData(idsArray[c].toString(), agents[i].toString(), methed[j])
                await this.exportFindHyitHost(cpuData)
                this.percentage = Number((this.percentage + num).toFixed(1))
                const memoryInfoData = await this.agentGetHostData(idsArray[c].toString(), agents[i].toString(), methed[j])
                await this.exportFindHyitHost(memoryInfoData)
                this.percentage = Number((this.percentage + num).toFixed(1))
              }
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        } else {
          const num = Number((100 / (agents.length * methed.length * 2)).toFixed(1))
          console.log(num)
          for (let i = 0; i < agents.length; i++) {
            for (let j = 0; j < methed.length; j++) {
              const cpuData = await this.agentGetHostData(ids.toString(), agents[i].toString(), methed[j])
              await this.exportFindHyitHost(cpuData)
              this.percentage = Number((this.percentage + num).toFixed(1))
              const memoryInfoData = await this.agentGetHostData(ids.toString(), agents[i].toString(), methed[j])
              await this.exportFindHyitHost(memoryInfoData)
              this.percentage = Number((this.percentage + num).toFixed(1))
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        }
      }
      // 操作系统
      if (this.devTypeId === 484) {
        this.wrapList = ['M', 'N']
        if (ids.length > 100) {
          const idsArray = this.cutArray(ids, 100)
          const num = Number((100 / (agents.length * idsArray.length)).toFixed(1))
          for (let c = 0; c < idsArray.length; c++) {
            for (let i = 0; i < agents.length; i++) {
              const systemData = await this.agentItAgentGetHostShow(idsArray[c].toString(), agents[i].toString())
              await this.exportFindHyitHost(systemData.data)
              this.percentage = Number((this.percentage + num).toFixed(1))
            }
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
          this.percentage = 0
        } else {
          const num = Number((100 / agents.length).toFixed(1))
          for (let i = 0; i < agents.length; i++) {
            const systemData = await this.agentItAgentGetHostShow(ids.toString(), agents[i].toString())
            await this.exportFindHyitHost(systemData.data)
            this.percentage = Number((this.percentage + num).toFixed(1))
          }
          this.loading = false
          this.showDialog = false
          this.fillerList = this.fillerData
        }
      }
    },
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
          devTypeId: this.handelDevTypeId === '' ? row.hyDevTypeId : this.handelDevTypeId,
          subType: data && data.length > 0 ? data[0].dictdataValue : '',
          hySubdevTypeId: row.hySubdevTypeId && row.hySubdevTypeId > 0 ? row.hySubdevTypeId : ''
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
