<template>
  <div>
    <el-dialog title="选择设备" :visible.sync="dialogVisible" width="70%">
      <div class="app-container">
        <div class="filter-container">
          <el-select v-model="findHyitHostQuery.agent" placeholder="请选择网关" style="margin-right: 10px" class="filter-item">
            <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-select v-model="findHyitHostQuery.devType" placeholder="请选择设备类型" clearable class="filter-item" style="width: 200px">
            <el-option label="全部" value="" />
            <el-option v-for="item in devTypeList" :key="item.hyDevTypeId" :label="item.hyDevTypeName" :value="item.hyDevTypeId" />
          </el-select>

          <el-input v-model="findHyitHostQuery.keywords" placeholder="请输入关键词" class="filter-item" style="width: 200px" />
          <el-button class="filter-item" type="primary" @click="searchCat">查询</el-button>
        </div>
        <div class="table-wrapper">
          <el-table ref="deviceTable" :data="deviceList" fit highlight-current-row :row-key="getRowKeys" style="width: 100%" @select="handleSelect" @selection-change="handleSelectionChange">
            <!-- <el-table-column type="selection" />
            <el-table-column label="NO" prop="id" type="index" width="60" />
            <el-table-column label="主机名称" prop="hyMarkName" show-overflow-tooltip />
            <el-table-column label="主机IP" prop="hyIp" show-overflow-tooltip />
            <el-table-column label="主机端口" prop="hyPort" show-overflow-tooltip />
            <el-table-column label="别名" prop="serverAlias" show-overflow-tooltip />
            <el-table-column label="位置" prop="location" show-overflow-tooltip />
            <el-table-column label="备注" prop="remarks" show-overflow-tooltip /> -->
            <!-- <el-table-column label="操作" width="240px" align="center">
              <template slot-scope="scope">
                <el-button v-permission="['ExecutePing']" type="primary" size="small" @click="onExecutePing(scope.row)">Ping</el-button>
                <el-button v-permission="['ExecuteTelnet']" type="primary" size="small" @click="onExecuteCmd(scope.row, 'telnet')">Telnet</el-button>
                <el-button v-permission="['ExecuteShell']" type="primary" size="small" @click="onExecuteCmd(scope.row, 'ssh')">Shell</el-button>
              </template>
            </el-table-column> -->
          </el-table>
        </div>
        <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="findHyitHostQuery.page" :limit.sync="findHyitHostQuery.limit" @pagination="loadDeviceList" />
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleComfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'ChoiceDevice',
  components: {
    Pagination
  },
  props: {
    selectfacility: {
      type: Array,
      default: () => []
    },
    cmdbItemTypeId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      listQuery: {
        hyHostName: '',
        hyIp: '',
        hyLinkState: '',
        hyOrgId: '',
        count: 1,
        page: 1,
        limit: 10
      },
      keyTypeArr: [],
      keyType: '',
      keywords: null,
      page: 1,
      limit: 10,
      data: [],
      total: 0,
      totalTwo: 0,
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
      statusOptions: [
        {
          id: 0,
          label: '离线',
          value: 0
        },
        {
          id: 1,
          label: '在线',
          value: 1
        }
      ],
      findHyitHostQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        agent: [],
        devType: '',
        hostType: 1
        // status: '',
        // count: 1,
        // total: 0,
      },
      deviceList: [], // 全部设备列表
      activeName: 'first',
      tableData: [],
      tableDataTwo: [],
      facilityList: [], // 设备列表
      devTypeList: [],
      agentList: [],
      hyitOrg: [],
      subSystems: [],
      ideField: 'hyIp', // 匹配的字段，用id
      ideFieldTwo: 'appId',
      allSelection: [] // 所有页面选择的
    }
  },
  computed: {
    setDeviceType() {
      return function(deviceTypeCatId) {
        const idx = this.keyTypeArr.findIndex(item => Number(item.id) === Number(deviceTypeCatId))
        if (idx !== -1) return this.keyTypeArr[idx].dictdataName
      }
    },
    // 获取行键
    getRowKeys(row) {
      return row.hyHostId
    },
    // 设置主机可用性标签
    setHostStataTag() {
      return function(row) {
        return row.hyNetState === 1 ? 'success' : 'info'
      }
    },
    // 设置主机状态
    setHostStatus() {
      return function(row) {
        return row.hyNetState === 1 ? '在线' : '离线'
      }
    },
    // 设置主机类型
    setHostType() {
      return function(id) {
        const devTypeIdx = this.devTypeList.findIndex(item => item.id === id)
        if (devTypeIdx !== -1) {
          return id === 0 ? '' : this.devTypeList[devTypeIdx].dictdataName
        }
      }
    },
    setDevType() {
      return function(hyDevTypeId) {
        const idx = this.devTypeList.findIndex(item => item.hyDevTypeId === hyDevTypeId)
        if (idx !== -1) {
          return this.devTypeList[idx].hyDevTypeName
        }
      }
    },
    setSubsystem() {
      return function(hySbId) {
        const idx = this.subSystems.findIndex(item => item.hySbId === hySbId)
        if (idx !== -1) {
          return this.subSystems[idx].hySbName
        }
      }
    }
  },
  mounted() {},
  methods: {
    async open() {
      this.allSelection = this.selectfacility // 拿到父组件中已选的设备
      console.log(this.allSelection)
      const agent = await this.findHyitAgent()
      if (agent) {
        this.agentList = agent
        this.findHyitHostQuery.agent = agent[0].id
      }
      // await this.loadItType()
      await this.loadDeviceList()
      await this.findHyitDevType()
      // await this.getHyitSubSystem()
      // await this.findHyitOrg()
      // await this.findHyitHost()
      // await this.getTypeArr()
      // await this.loadCat()
      this.initTableSelection()
      // await this.initRepairSelection()
      this.dialogVisible = true
    },
    handleFilter() {
      this.page = 1
      this.dataTwo = []
      this.loadRepair()
    },

    // 获取类型select 02
    getTypeArr() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_dev_type ', limit: -1 }
      }).then(res => {
        this.keyTypeArr = res.data
      })
    },
    loadCat() {
      // 列表 02 搜索
      request({
        url: api.automationOperations.findHyitOpsServer,
        data: {
          page: this.page,
          limit: this.limit,
          keyword: this.keywords,
          deviceTypeCatId: this.keyType
        }
      }).then(res => {
        this.data = res.data
        console.log(this.data)
        this.totalTwo = Number(res.count)
      })
    },

    handleClick(tab, event) {},

    handleComfirm() {
      console.log(this.allSelection)
      if (!this.allSelection.length) {
        this.$message.error('请选择')
      }
      this.$emit('change', this.allSelection)
      this.dialogVisible = false
    },
    // 获取IT监控设备列表 01
    findHyitHost() {
      const data = { ...this.findHyitHostQuery }
      console.log(data, '111')
      if (data.devType === 0) data.devType = ''
      if (this.cmdbItemTypeId) data.cmdbItemTypeId = this.cmdbItemTypeId
      request({
        url: api.itMonitor.findHyitHost,
        data
      }).then(res => {
        if (res.code === 1) {
          // this.findHyitHostQuery.total = parseInt(res.count)
          this.tableData = res.data
          this.total = Number(res.count)
          this.listLoading = false
          this.$nextTick(() => {
            this.initTableSelection()
          })
        }
      })
    },
    // IT运维设备搜索 02
    searchCat() {
      this.page = 1
      this.data = []
      // this.loadCat()
      this.loadDeviceList()
    },
    // 设置可用性 01
    setAvailables(row, index) {
      let key = 'info'
      if ((row.hyAvailable === 1 && index === 0) || (row.hySnmpAvailable === 1 && index === 1) || (row.hyJmxAvailable === 1 && index === 2) || (row.hyIpmiAvailable === 1 && index === 3)) {
        key = 'success'
      }
      if ((row.hyAvailable === 2 && index === 0) || (row.hySnmpAvailable === 2 && index === 1) || (row.hyJmxAvailable === 2 && index === 2) || (row.hyIpmiAvailable === 2 && index === 3)) {
        key = 'danger'
      }
      return key
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map(it => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map(item => JSON.parse(item))
      this.allSelection = setPagingSelection
    },
    // 保存IT监控设备的选择 01
    handleSelect(rows, row) {
      let handleSelected = rows.length && rows.indexOf(row) !== -1
      if (!handleSelected) {
        this.allSelection = this.allSelection.filter(it => it[this.ideField] !== row[this.ideField])
      }
    },

    // 初始化IT监控设备列表 01
    initTableSelection() {
      console.log(this.allSelection)
      if (!this.allSelection || this.deviceList.length <= 0) {
        return
      }

      // 标识当前行的唯一键的名称
      const selectAllIds = []
      this.allSelection.forEach(row => {
        selectAllIds.push(row['hyHostId'])
      })
      setTimeout(() => {
        // this.$refs.deviceTable.clearSelection()
        for (let i = 0; i < this.deviceList.length; i++) {
          if (selectAllIds.indexOf(this.deviceList[i]['hyHostId']) >= 0) {
          // 设置选中，记住table组件需要使用ref="table"
            this.$refs.deviceTable.toggleRowSelection(this.deviceList[i], true)
          }
        }
      }, 0)
    },
    // 初始化IT运维设备列表 02
    initRepairSelection() {
      this.$nextTick(() => {
        for (let i = 0; i <= this.tableDataTwo.length; i++) {
          const tableSle = this.tableDataTwo[i]
          for (let j = 0; j < this.allSelection.length; j++) {
            const sls = this.allSelection[j]
            if (tableSle[this.ideFieldTwo] === sls[this.ideFieldTwo]) {
              this.$refs['tableTwo'].toggleRowSelection(tableSle, true)
            }
          }
        }
      })
    },
    async findHyitDevType() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevType,
        data: { hyDevTypeId: 2 }
      })
      if (code === 1) {
        this.devTypeList = data
      }
      console.log(this.devTypeList)
    },
    async getHyitSubSystem() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitSubSystem
      })
      if (code !== 1) return
      this.subSystems = data
    },
    async findHyitOrg() {
      // 部门区域
      let { data, code } = await request({
        url: api.org.findHyitOrg,
        limit: -1
      })
      if (code !== 1) return
      this.hyitOrg = data
    },
    // 新
    // 获取设备
    async loadDeviceList() {
      // 获取it监控设备
      const itHost = await request({ url: api.itMonitor.findHyitHost, data: this.findHyitHostQuery })
      if (itHost.code !== 1) return
      if (!itHost.data) return
      this.total = Number(itHost.count)
      const hostIds = []
      itHost.data.forEach(item => hostIds.push(item.hyHostId))
      // 根据it监控去获取运维设备
      const opsServer = await request({ url: api.automationOperations.findHyitOpsServer, data: { hostIds: hostIds.toString() } })
      itHost.data.forEach(item => {
        const getOpsServerIdx = opsServer.data.findIndex(getOpsServerItem => Number(getOpsServerItem.hostId) === Number(item.hyHostId))
        if (getOpsServerIdx !== -1) {
          item.opsServerId = opsServer.data[getOpsServerIdx].id
          item.userName = opsServer.data[getOpsServerIdx].userName
          item.pwd = opsServer.data[getOpsServerIdx].pwd
          item.location = opsServer.data[getOpsServerIdx].location
          item.serverAlias = opsServer.data[getOpsServerIdx].serverAlias
          item.remarks = opsServer.data[getOpsServerIdx].remarks
        }
      })
      this.deviceList = itHost.data
      console.log(this.deviceList)
    },
    // 获取网关
    async findHyitAgent() {
      const { code, data } = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (code !== 1) return
      return data
    },
    // 获取设备类型
    async  loadItType() {
      return await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__wrapper {
  .el-dialog--center {
    width: 60% !important;
  }
}
</style>
