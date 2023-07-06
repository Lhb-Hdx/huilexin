<template>
  <div class="app-container" style="padding-top:0">
    <div class="filter-container">
      <el-select v-model="listQuery.useStatue" size="mini" class="filter-item" clearable placeholder="选择使用状态">
        <el-option
          v-for="item in useType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select v-model="listQuery.pingStatue" size="mini" class="filter-item" clearable placeholder="选择连接状态">
        <el-option
          v-for="item in connectionType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input v-model="listQuery.keyword" size="mini" placeholder="请输入主机名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button size="mini" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button v-if="netSegmentIds !== ''" size="mini" class="filter-item" type="primary" @click="batchClose">禁用</el-button>

      <el-button size="mini" class="filter-item" type="primary" @click="autoBind">扫描关联</el-button>
      <ExportExcel size="mini" class="filter-item" :fillter-list="fillerList" :excel-title="ExcelTitle" :file-name="exportFileName" />
      <el-button v-if="netSegmentIds !== ''" size="mini" :loading="loading" class="filter-item" type="primary" @click="scanning">全局扫描</el-button>
      <div class="filter-item list">
        <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
      </div>
      <div class="list-type-select pointer filter-item">
        <img v-if="listType === 'list'" src="image/ip-manage/select_list.png" alt="">
        <img v-if="listType !== 'list'" src="image/ip-manage/no_select_list.png" alt="" @click="selectListType('list')">
        <img v-if="listType === 'view'" class="margin-left-5" src="image/ip-manage/select_icon.png" alt="">
        <img v-if="listType !== 'view'" class="margin-left-5" src="image/ip-manage/no_select_icon.png" alt="" @click="selectListType('view')">
      </div>
    </div>
    <div class="ip-detail-list">
      <div v-if="listType === 'view'" class="use-statue">
        <div v-for="item in useStatue" :key="item.value" class="use-statue-item">
          <div
            class="statue-item-tag"
            :style="{
              'color': item.color,
              'background': item.bg
            }"
          />
          {{ item.label }}
        </div>
      </div>
      <ip-detail-list v-if="listType === 'list'" ref="ipDetailList" :lists="lists" :list-query="listQuery" :sub-net="selectSubNetId" @exportList="exportList" @selectionListChange="selectionListChange" />
      <subnet-tab v-if="listType === 'view'" ref="subnet" :list-query="listQuery" @expandIp="expandIp">
        <ip-detail-view :sub-net="selectSubNetId" />
      </subnet-tab>
    </div>
    <IpScanningDialog ref="ipScanningDialog" :net-segment-ids="netSegmentIds" />
  </div>
</template>

<script>
import ExportExcel from '@/components/ExportExcel/export-excel'
import IpDetailList from './component/ip-detail-list'
import IpDetailView from './component/ip-detail-view'
import SubnetTab from './component/subnet-tab'
import request from '@/utils/request'
import api from '@/api/api'
import ListControl from '@/components/ListControl'

import IpScanningDialog from '@/views/ip-address-manage/component/ip-scanning-dialog'

export default {
  name: 'IpDetail',
  components: {
    ExportExcel, SubnetTab, IpDetailList, IpDetailView, IpScanningDialog, ListControl
  },
  data() {
    return {
      agent: '',
      agentList: [],
      groupData: [],
      portProps: { emitPath: false, label: 'portDeviceGroup', value: 'id', checkStrictly: true },
      loading: false,
      pingLoading: false,
      selectionListChangeValue: '',
      startScan: false,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        useStatue: '',
        pingStatue: '',
        ipAddressId: ''
      },
      netSegmentIds: null,
      addVideoDvrModal: false,
      showWsRes: [{ index: 0, total: 0 }],
      showWsResList: [],
      ststueNum: 0,
      noStstueNum: 0,
      stopStstueNum: 0,
      showResTotal: [],
      showSuccess: 0,
      showRes: [{
        id: '',
        index: 0,
        ip: '',
        ping: '',
        total: 2
      }],
      fillerList: [],
      ExcelTitle: [
        {
          title: 'IP地址',
          dataIndex: 'ip'
        },
        {
          title: '设备类型',
          dataIndex: 'deviceType'
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
          title: 'MAC',
          dataIndex: 'mac'
        },
        {
          title: '关联方式',
          dataIndex: 'bindType'
        },
        {
          title: '连接状态',
          dataIndex: 'pingStatue'
        },
        {
          title: '使用状态',
          dataIndex: 'useStatue'
        }
      ],
      exportFileName: 'IP详情',
      listType: 'list', // list view
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
      selectSubNetId: {},
      showBindDeviceDialog: false,
      subnetList: [],
      useStatue: [
        { value: 1, label: '已用', bg: '#00b285', color: 'red' },
        { value: 2, label: '可用', bg: '#d6d6d6', color: '#00B25F' },
        { value: 3, label: '禁用', bg: '#fe6162', color: 'red' }
      ],
      // 显示控制数据 start
      checkList: ['IP地址', '设备类型', '设备名称', '端口', 'MAC', '所属网关', '关联方式', '使用状态', '连接状态', '操作'],
      lists: [],
      storageVal: 'ip-address-manage-details' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  computed: {
    // 设置连接状态
    pingStatue() {
      return function(val) {
        const idx = this.pingStatueList.findIndex(item => item.value === Number(val))
        if (idx !== -1) {
          return this.pingStatueList[idx].label
        }
      }
    },
    // 设置状态
    setStatue() {
      return function(val) {
        const idx = this.useStatue.findIndex(item => item.value === val)
        if (idx !== -1) {
          return this.useStatue[idx].label
        }
      }
    },
    setStatusColor() {
      return function(val) {
        const idx = this.useStatue.findIndex(item => item.value === Number(val))
        if (idx !== -1) {
          return this.useStatue[idx].color
        }
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('change-ip,reloadData')
  },
  async mounted() {
    // 监听点击ip网段进入ip网段详情
    this.$EventBus.$on('change-ip', (msg) => {
      this.netSegmentIds = msg.id
      this.selectSubNetId = msg
      this.$set(this.listQuery, 'netSegment', msg.netSegment)
      // this.$nextTick(() => {
      //   this.listType === 'list' ? this.$refs.ipDetailList.findSubNetIp() : this.$refs.subnet.initIpDetail(msg)
      // })
      setTimeout(() => {
        this.listType === 'list' ? this.$refs.ipDetailList.findSubNetIp() : this.$refs.subnet.initIpDetail(msg)
      }, 500)
    })
    // 监听重新加载数据
    this.$EventBus.$on('reloadData', (msg) => {
      if (msg) {
        this.$set(this.listQuery, 'netSegment', '')
      }
    })
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 获取项目
    async findHyitAgent(agentTypes) {
      const res = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentTypes, agents: this.agentsIds, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (res.code !== 1) return
      return res.data
    },
    onClick() {
      console.log('开始扫描')
    },
    exportList(val) {
      const data = [...val]
      data.forEach(item => {
        Object.keys(item).forEach(keys => {
          if (keys === 'bindType') {
            item.bindType = item.bindType === 1 ? '自动绑定' : '手动绑定'
          }
          if (keys === 'pingStatue') {
            switch (item.pingStatue) {
              case 1:
                item.pingStatue = '在线'
                break
              case 2:
                item.pingStatue = '离线'
                break
              default:
                item.pingStatue = '未连接'
                break
            }
          }
          if (keys === 'useStatue') {
            switch (item.useStatue) {
              case 1:
                item.useStatue = '已用'
                break
              case 2:
                item.useStatue = '可用'
                break
              default:
                item.useStatue = '禁用'
                break
            }
          }
        })
      })
      this.fillerList = val
    },
    // 搜索
    handleFilter() {
      this.listType === 'list' ? this.$refs.ipDetailList.findSubNetIp(this.listQuery) : this.$refs.subnet.initIpDetail()
    },
    // 停止全局扫描
    onStop() {
      this.addVideoDvrModal = false
    },

    // 查询子网详情
    async findOpsIpAddressDetail(query) {
      return await request({ url: api.ipAddressManage.findOpsIpAddressDetail, data: query })
    },
    // 查询子网信息
    async findSubNetVal(val) {
      this.showSuccess = 0
      const res = await this.findOpsIpAddressDetail({
        netSegments: this.selectSubNetId.netSegment,
        page: 1,
        limit: -1
      })
      if (res.code === 1) this.showResTotal[0] = res.data
      this.showResTotal[0].forEach(item => {
        if (item.pingStatue === 1) {
          this.showSuccess = this.showSuccess + 1
        }
      })
    },

    // 选择列表类型
    selectListType(val) {
      this.listType = val
      setTimeout(() => {
        this.listType === 'list' ? this.$refs.ipDetailList.findSubNetIp() : this.$refs.subnet.initIpDetail()
      }, 500)
    },
    // 展开子网
    expandIp(val) {
      this.selectSubNetId = val
    },
    // 选择告警
    selectionListChange(val) {
      this.selectionListChangeValue = val
      console.log(this.selectionListChangeValue)
    },
    // 批量禁用按钮
    batchClose() {
      if (this.selectionListChangeValue.length === 0) {
        this.$message('请选择IP信息')
        return
      }
      const ids = []
      this.selectionListChangeValue.forEach(item => {
        ids.push(item.id)
      })
      this.$confirm('是否批量禁用选择的IP？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.updateOpsIp.updateOpsIpAddressDetailUse,
          data: {ipIds: ids.toString(), useStatue: 3}
        }).then(() => {
          this.$refs.ipDetailList.findSubNetIp()
        })
      })
    },
    // 全局扫描获取监控项数据 websocket
    scanning() {
      console.log(this.netSegmentIds)
      this.$refs.ipScanningDialog.open()
    },
    // ip修改日志
    insertOpsIpAddressLog(query) {
      request({
        url: api.ipAddressManage.insertOpsIpAddressLog,
        data: query
      })
    },
    // 扫描关联
    autoBind() {
      request({
        url: api.ipAddressManage.autoBindOpsIpAddress,
        data: { netSegmentId: String(this.netSegmentIds)}
      }).then(res => {
        if (res.code === 1) {
          this.$message({
            type: 'success',
            message: '扫描完成'
          })
          this.$refs.ipDetailList.findSubNetIp()
        }
      })
    }
    // 批量拨测 websocket
    // batchPing(row) {
    //   if (this.selectionListChangeValue.length === 0) {
    //     this.$message('请选择IP信息')
    //     return
    //   }
    //   this.pingLoading = true
    //   this.addVideoDvrModal = true
    //   this.pingLoading = false
    //   this.showWsRes = [{ index: 0, total: 0 }]
    //   this.showWsResList = []
    //   this.showRes[0].index = 0
    //   this.ststueNum = 0
    //   this.noStstueNum = 0
    //   this.stopStstueNum = 0
    //   this.showRes[0].total = 2
    //   const ids = []
    //   this.selectionListChangeValue.forEach(item => {
    //     ids.push(item.id)
    //   })
    //   const wsToken = this.sessionStorageOperation('get', 'wsToken')
    //   if (!wsToken) return
    //   const getUserSessionResult = getUserSession()
    //   sendWebsocket(socketCmd.host.default, {
    //     cmd: socketCmd.itMonitor.ansiblePingIp,
    //     data: {
    //       token: wsToken,
    //       companyId: String(getUserSessionResult.companyId),
    //       appId: String(getUserSessionResult.appId),
    //       netSegmentIds: '',
    //       ipIds: ids.toString()
    //     }
    //   },
    //   (res) => {
    //     const wsRes = isJSONString(res.data) ? JSON.parse(res.data) : res.data
    //     if (wsRes) {
    //       this.$set(this.showWsRes, 0, wsRes)
    //       this.$set(this.showRes, 0, wsRes)
    //       this.showWsResList.push(wsRes)
    //       if (Number(wsRes.useStatue) === 2) {
    //         this.ststueNum = this.ststueNum + 1
    //       } else if (Number(wsRes.useStatue) === 1) {
    //         this.noStstueNum = this.noStstueNum + 1
    //       } else if (Number(wsRes.useStatue) === 3) {
    //         this.stopStstueNum = this.stopStstueNum + 1
    //       }
    //       this.findSubNetVal()
    //     }
    //   }, (err) => {
    //     this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
    //     console.log(err)
    //   })
    // },
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  position: relative;
  .list-type-select {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translatey(-50%);
    img {
      width: 20px;
      height: 20px;
    }
  }
}
.use-statue, .use-statue-item {
  display: flex;
  align-items: center;
}
.use-statue {
  margin: 10px 0;
  .use-statue-item {
    margin-right: 20px;
    .statue-item-tag {
      width: 17px;
      height: 17px;
      margin-right: 5px;
    }
  }
}
.list {
  display: inline-block;
  margin-top: 8px;
}
</style>
