<template>
  <div class="table-wrapper">
    <el-table
      :data="ipList"
      fit
      highlight-current-row
      @selection-change="selectionListChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="IP地址" show-overflow-tooltip>
        <template slot="header" slot-scope="scope">
          {{ scope.column.label }}
          <span class="caret-wrapper">
            <i class="sort-caret ascending" @click="handlerSort('ip', 1)" />
            <i class="sort-caret descending" @click="handlerSort('ip', 0)" />
          </span>
        </template>
        <template slot-scope="{row}">
          {{ row.ip }} / {{ row.maskBit }}
        </template>
      </el-table-column>
      <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="设备类型" prop="deviceType" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ setIpBindDeviceType(row) }}
        </template>
      </el-table-column>
      <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="设备名称" width="200" align="left" prop="deviceName" show-overflow-tooltip />
      <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="端口" align="left" prop="port" show-overflow-tooltip />
      <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="MAC" align="left" prop="mac" show-overflow-tooltip />
      <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="所属网关" align="right" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ setIpDeviceAgent(row.id, row.deviceId) }}
        </template>
      </el-table-column>
      <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="关联方式" align="left" prop="bindType" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ setBindType(row.bindType) }}
        </template>
      </el-table-column>
      <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="使用状态" align="left" show-overflow-tooltip>
        <template slot="header" slot-scope="scope">
          {{ scope.column.label }}
          <span class="caret-wrapper">
            <i class="sort-caret ascending" @click="handlerSort('use_statue', 1)" />
            <i class="sort-caret descending" @click="handlerSort('use_statue', 0)" />
          </span>
        </template>
        <template slot-scope="{row}">
          <div v-if="row.useStatue !== null" :class="setUseStatue('class', row.useStatue)">
            <i class="el-icon-success" :class="setUseStatue('class', row.useStatue)" /> {{ setUseStatue('text', row.useStatue) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" label="连接状态" align="left" prop="pingStatue" show-overflow-tooltip>
        <template v-if="row.pingStatue" slot-scope="{row}">
          <el-tag :type="setPingStatue('class', row.pingStatue)">
            {{ setPingStatue('text', row.pingStatue) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" label="操作" align="left" class-name="small-padding fixed-width" width="200">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="onPing(row)">Ping</el-button>
          <el-button type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findSubNetIp" />
    <BindDialog ref="bindDialog" :select-ip="selectIp" @updateIpCallBack="updateIpCallBack" />
    <PingDialog ref="pingDialog" :sub-net-id="subNet.id" />
    <el-dialog title="选择网关" :visible.sync="showAgentDialog" width="30%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="form" :rules="rules" label-width="50px">
          <el-form-item label="网关" prop="agent">
            <el-select
              v-model="form.agent"
              filterable
              placeholder="请选择网关"
              class="width-100"
            >
              <el-option
                v-for="item in agentList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAgentDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmAgentPing">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import BindDialog from './bind-dialog'
import PingDialog from './ping-dialog'
import {sendWebsocket} from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import {getUserSession} from '@/utils/auth'

export default {
  name: 'IpDetailList',
  components: {
    Pagination, BindDialog, PingDialog
  },
  props: {
    subNet: {
      type: [Object, String],
      default() {
        return {}
      }
    },
    listQuery: {
      type: [Object, String],
      default() {
        return {}
      }
    },
    lists: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      agentsIds: '',
      selectionListChangeValue: '',
      opsDeviceType: [],
      itDeviceType: [],
      videoType: [],
      ipList: [],
      exportIpList: [],
      // listQuery: {
      //   page: 1,
      //   limit: 10
      // },
      total: 0,
      selectIp: {},
      fillerList: [],
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
      bindType: [
        { value: 1, label: '自动绑定' },
        { value: 2, label: '手动绑定' }
      ],
      dataQuery: {
        page: 1,
        limit: 10
      },
      showAgentDialog: false,
      agentList: [],
      form: {
        agent: ''
      },
      rules: {
        agent: [
          {required: true, message: '请选择监控网关', trigger: 'blur'}
        ]
      },
      handlerIp: {},
      ipDeviceAgent: [],
      ansiblePingIpQuery: {
        ipIds: '',
        agent: '',
        agentGroup: '',
        netSegmentIds: ''
      },
      pingAgent: ''
    }
  },
  computed: {
    setUseStatue() {
      return function(valueType, val) {
        const idx = this.useStatue.findIndex(item => item.value === val)
        if (idx === -1) return
        if (valueType === 'text') return this.useStatue[idx].label
        if (valueType === 'class') return this.useStatue[idx].class
      }
    },
    setPingStatue() {
      return function(valueType, val) {
        const idx = this.pingStatue.findIndex(item => item.value === val)
        if (idx === -1) return
        if (valueType === 'text') return this.pingStatue[idx].label
        if (valueType === 'class') return this.pingStatue[idx].class
      }
    },
    setBindType() {
      return function(val) {
        const idx = this.bindType.findIndex(item => item.value === val)
        if (idx === -1) return ''
        return this.bindType[idx].label
      }
    },
    setIpBindDeviceType() {
      return function(row) {
        if (row.deviceModelType === 1) {
          const idx = this.itDeviceType.findIndex(item => item.id === row.deviceType)
          if (idx !== -1) return this.itDeviceType[idx].dictdataName
        } else if (row.deviceModelType === 2) {
          const idx = this.opsDeviceType.findIndex(item => item.id === row.deviceType)
          if (idx !== -1) return this.opsDeviceType[idx].dictdataName
        } else if (row.deviceModelType === 4) {
          const idx = this.videoType.findIndex(item => item.id === row.deviceType)
          if (idx !== -1) return this.videoType[idx].dictdataName
        } else {
          return ''
        }
      }
    },
    setIpDeviceAgent() {
      return function(ipId, deviceId) {
        const getIdx = this.ipDeviceAgent.findIndex(item => Number(item.id) === Number(ipId) && Number(item.deviceId) === Number(deviceId))
        if (getIdx !== -1) return this.ipDeviceAgent[getIdx].agentName
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('change-agent')
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.getDeviceType()
    this.findSubNetIp()
    this.$EventBus.$on('change-agent', (res) => {
      this.pingAgent = res
    })
  },
  methods: {
    // 选择IP
    selectionListChange(val) {
      this.selectionListChangeValue = val
      console.log(this.selectionListChangeValue)
      this.$emit('selectionListChange', val)
    },
    // 查询子网详情
    async findOpsIpAddressDetail(query) {
      return await request({ url: api.ipAddressManage.findOpsIpAddressDetail, data: { ...query, agents: this.agentsIds }})
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
    // 查询子网ip
    async findSubNetIp(val) {
      const allNetSegmentIds = []

      const res = await this.findOpsIpAddressDetail({
        netSegments: this.subNet.netSegment !== '' ? this.subNet.netSegment : '', ...this.listQuery
      })
      res.data.forEach(item => {
        allNetSegmentIds.push(item.netSegmentId)
        if (item.pingStatue !== 1 && item.pingStatue !== 2) {
          item.pingStatue = 3
        }
      })

      if (allNetSegmentIds.length > 0) {
        const findOpsIpAddressNetSegment = await this.findOpsIpAddressNetSegment({ ids: this.$tool.uniqueArray(allNetSegmentIds), limit: -1 })
        if (findOpsIpAddressNetSegment) {
          res.data.forEach(ipItem => {
            const idx = findOpsIpAddressNetSegment.findIndex(el => +el.id === +ipItem.netSegmentId)
            if (idx !== -1) {
              ipItem.maskBit = findOpsIpAddressNetSegment[idx].maskBit
            }
          })
        }
      }

      this.ipList = res.data
      const hostIds = []
      const ipDevice = []
      const ipIds = []
      const agentGroup = []
      const netSegmentIds = []
      this.ipList.forEach(ipItem => {
        if (ipItem.deviceId !== null) {
          hostIds.push(ipItem.deviceId)
          ipDevice.push({
            id: ipItem.id,
            deviceId: ipItem.deviceId
          })
        } else {
          ipIds.push(ipItem.id)
          agentGroup.push(ipItem.agentGroupId)
          netSegmentIds.push(ipItem.netSegmentId)
        }
      })
      this.$set(this.ansiblePingIpQuery, 'ipIds', ipIds.toString())
      this.$set(this.ansiblePingIpQuery, 'agentGroup', this.$tool.uniqueArray(agentGroup).toString())
      this.$set(this.ansiblePingIpQuery, 'netSegmentIds', netSegmentIds.toString())
      this.ansiblePingIp()

      if (hostIds.length > 0) {
        const getHost = await request({ url: api.itMonitor.findHyitHost, data: { ids: this.$tool.uniqueArray(hostIds).toString(), hostType: 1, limit: -1 } })
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
      }
      // 导出数据
      const Num = await this.findOpsIpAddressDetail({
        netSegments: this.subNet.netSegment !== '' ? this.subNet.netSegment : '', ...this.listQuery, page: 1, limit: -1
      })
      Num.data.forEach(item => {
        if (item.pingStatue !== 1 && item.pingStatue !== 2) {
          item.pingStatue = 3
        }
      })
      this.exportIpList = Num.data
      this.$emit('exportList', this.$tool.deepCopy(this.exportIpList))
      this.total = Number(res.count)
    },
    // 点击编辑
    onEdit(val) {
      this.selectIp = val
      this.$refs.bindDialog.open()
    },
    // 点击ping
    async onPing(val) {
      this.handlerIp = val
      console.log(this.handlerIp)
      const pingQuery = { ...this.handlerIp }
      if (pingQuery.agent === null) {
        pingQuery.agent = this.pingAgent
        this.updateOpsIpAddressDetailAgent({
          agent: this.pingAgent,
          netSegmentId: val.netSegmentId
        })
      }
      this.$refs.pingDialog.ping(pingQuery)
    },
    // 监听编辑ip完成
    updateIpCallBack() {
      this.findSubNetIp()
    },
    // 查询子网的网段
    async findOpsIpAddressDetailNetSegment(ipAddressId) {
      const { code, data } = await request({ url: api.ipAddressManage.findOpsIpAddressDetailNetSegment, data: { page: 1, limit: -1, ipAddressId }})
      if (code !== 1) return
      return data
    },
    // 查询ip的网段
    async findOpsIpAddressNetSegment(query) {
      const { code, data } = await request({ url: api.ipAddressManage.findOpsIpAddressNetSegment, data: query})
      if (code !== 1) return
      return data
    },
    // 字段排序
    handlerSort(order, isAsc) {
      if (this.listQuery.isAsc !== undefined && this.listQuery.isAsc === isAsc) {
        this.$set(this.listQuery, 'isAsc', '')
        this.$set(this.listQuery, 'order', '')
      } else {
        this.$set(this.listQuery, 'isAsc', isAsc)
        this.$set(this.listQuery, 'order', order)
      }
      this.findSubNetIp()
    },
    confirmAgentPing() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.$refs.pingDialog.ping({ ...this.handlerIp, agent: this.form.agent })
        }
      })
    },
    // 获取项目
    async findHyitAgent() {
      const res = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agents: this.agentsIds, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (res.code !== 1) return
      this.agentList = res.data
    },
    ansiblePingIp() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.ansiblePingIp,
        data: {
          token: wsToken,
          companyId: String(getUserSessionResult.companyId),
          appId: String(getUserSessionResult.appId),
          ...this.ansiblePingIpQuery
        }
      })
    },
    updateOpsIpAddressDetailAgent(query) {
      request({
        url: api.ipAddressManage.updateOpsIpAddressDetailAgent,
        data: query
      })
    }
  }
}
</script>
