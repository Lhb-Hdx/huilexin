<template>
  <div class="equipment-failure bottom-center-box">
    <div class="top-title">
      设备流量TOP
    </div>
    <div class="bottom-center-box-box">
      <div class="bottom-center-box-tabs pointer">
        <div class="tabs-tab" :class="{active:currType===0}" @click="changeColorA(0)">接收</div>
        <div class="tabs-tab" :class="{active:currType===1}" @click="changeColorA(1)">发送</div>
      </div>
      <div class="bottom-center-box-content">
        <div class="content-list">
          <div v-for="item in tableList" :key="item.id" class="list-item flex-v-between py-10">
            <div class="flex-1">
              <div>{{ item.hyMarkName }}</div>
              <div class="list-item-ip font-12 mt-6">{{ item.hyIp }}</div>
            </div>
            <div class="font-12">{{ item.Value }} {{ item.Symbol }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

export default {
  name: 'EquipmentFailure',
  data() {
    return {
      currType: 0,
      form: {
        page: 1,
        limit: 10,
        dataType: 4 // 设备类型 1cpu使用率 2内存使用率 3硬盘使用率 4上行流量 5下行流量
        // sTime: '', // 开始时间
        // eTime: '' // 结束时间
      },
      aTitle: 1,
      Subtitle: 1,
      tableList: {}, // 存设备排行数据
      agent: '',
      agentList: [],
      agentsIds: '',
      itemData: [], //
      hyOrgId: '',
      deviceType: [],
      allHost: [],
      hostKeyValues: [
        { name: '端口数量', key: 'portCount', getVlan: false, portCount: true },
        { name: '端口启用管理状态', key: 'portStartStatus', getVlan: true },
        { name: '端口物理连接状态', key: 'portConnectionStatus', getVlan: true },
        { name: '端口每秒发送速率', key: 'portSendRate', getVlan: true },
        { name: '端口每秒接收速率', key: 'portReceiveRate', getVlan: true },
        { name: '端口每秒发送丢包数', key: 'portSendLoss', getVlan: true },
        { name: '端口每秒接收丢包数', key: 'portReceiveLoss', getVlan: true }
      ],
      zhostids: []
    }
  },
  async mounted() {
    // this.findWeek()
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    // 获取网关
    const agentData = await this.findHyitAgent()
    if (agentData && agentData.length > 0) {
      let agentDataList = []
      let agentIdsList = this.agentsIds.split(',')
      agentData.forEach(item => {
        agentIdsList.forEach(itemVal => {
          if (Number(item.id) === Number(itemVal)) agentDataList.push(item)
        })
      })
      this.agentList = agentDataList
      this.agent = agentDataList[0].id
    }
    // await this.getDeviceType()

    // 获取主机
    await this.findHyitHost()

    // 监听websocket服务端返回的数据
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostPortTotal-websocket') {
        this.watchAgentGetHostPortTotal(res.detail.data)
      }
      // if (res.detail.data.cmd === 'it-agentGetHostPort-websocket') {
      //   this.watchAgentGetHostPort(res.detail.data)
      // }
    })
  },
  methods: {
    changeColorA(id) {
      this.currType = id
      this.Subtitle = 1
      this.findWeek()
    },

    findWeek(id) {
      if (id === 1 || !id) {
        const startTime = `${this.$tool.getFirstDayOfWeek(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      } else if (id === 2) {
        const startTime = `${this.$tool.getFirstDayOfMonth(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      } else if (id === 3) {
        const startTime = `${this.$tool.getFirstDayOfSeason(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      } else if (id === 4) {
        const startTime = `${this.$tool.getFirstDayOfYear(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      }
      if (this.currType === 0) {
        this.form.dataType = 4
      } else if (this.currType === 1) {
        this.form.dataType = 5
      }
      // 设备排行
      request({
        url: api.Summary.findZbxTrendHostFlowStatistics,
        data: this.form
      }).then(async res => {
        if (res.code === 1) {
          this.tableList = JSON.parse(res.model)
          console.log(this.tableList)
          const ids = []
          this.tableList.forEach(item => {
            ids.push(item.hostId)
          })
          const logData = await request({ url: api.itMonitor.findHyitHost, data: { ids }})

          if (logData.code === 1) {
            for (let i = 0; i < this.tableList.length; i++) {
              const tableL = this.tableList[i]
              for (let j = 0; j < logData.data.length; j++) {
                const log = logData.data[j]
                if (tableL.hostId === log.hyHostId) {
                  this.tableList[i].hyIp = log.hyIp
                  this.tableList[i].hyMarkName = log.hyMarkName
                }
              }
            }
          }

          this.tableList.forEach((item, index) => {
            this.$set(this.tableList[index], 'Value', this.$tool.conversionData('data', Number(this.tableList[index].totalValue), 'b').size)
            this.$set(this.tableList[index], 'Symbol', this.$tool.conversionData('data', Number(this.tableList[index].totalValue), 'b').units)
          })
          const tableLength = 10 - this.tableList.length
          if (this.tableList.length < 10) {
            for (let i = 0; i < tableLength; i++) {
              this.tableList.push({ hyMarkName: '暂无数据' })
            }
          }
        }
      })
    },
    // 获取主机
    async findHyitHost() {
      // 过滤提取host
      const host = []
      // 网络设备

      let networkDevice = await request({
        url: api.itMonitor.findHyitHost,
        data: {
          page: 1,
          limit: -1,
          devType: 481,
          hostType: 1,
          keyword: this.keyword,
          // hyOrgId: this.hyOrgId,
          agent: this.agent
        }
      })
      if (networkDevice.code === 1) host.push(...networkDevice.data)
      // sdwan
      let sdwan = await request({
        url: api.itMonitor.findHyitHost,
        data: {
          page: 1,
          limit: -1,
          devType: 490,
          hostType: 1,
          keyword: this.keyword,
          // hyOrgId: this.hyOrgId
          agent: this.agent
        }
      })
      if (sdwan.code === 1) host.push(...sdwan.data)
      // this.allHost初始化
      host.forEach(hostItem => {
        this.$set(this.allHost, this.allHost.length, {
          hyHostId: hostItem.hyHostId,
          agent: hostItem.agent,
          hostid: hostItem.hyZhostId,
          hostName: hostItem.hyMarkName,
          hostIp: hostItem.hyIp,
          hostType: hostItem.hyDevTypeId,
          portStartStatus: 0,
          portConnectionStatus: 0,
          portSendRate: 0,
          portReceiveRate: 0,
          portSendLoss: 0,
          portReceiveLoss: 0,
          portCount: 0,
          children: [],
          orgId: hostItem.hyOrgId
        })
      })
      const zhostids = []
      // itemData:有指定orgId或者为空的主机数据 allHost提取的多个设备的主机信息
      this.allHost.forEach(hostItem => {
        if (hostItem.orgId === this.hyOrgId || this.hyOrgId === '') {
          this.$set(this.itemData, this.itemData.length, { ...hostItem })
        }
        zhostids.push(hostItem.hyZhostId)
      })
      this.zhostids = zhostids
      console.log(JSON.stringify(this.allHost))
      console.log(JSON.stringify(this.itemData))
      if (host.length > 0) {
        // 获取流量数据
        this.agentGetHostPortTotal()
        // 定时获取流量统计数据、展开的主机端口数据
        this.getMonitorDataInterval = setInterval(() => {
          this.agentGetHostPortTotal()
          // if (this.expandHostIds.length > 0) {
          //   this.expandHostIds.forEach(item => {
          //     this.agentGetHostPort({ agent: this.agent, hostid: item })
          //   })
          // }
        }, 5000)
      }
    },
    // 获取所有的设备类型
    async getDeviceType() {
      const { code, data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      })
      if (code !== 1) return
      this.deviceType = data
    },
    // 获取网关
    async findHyitAgent() {
      const { code, data } = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, page: 1, limit: -1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (code !== 1) return
      return data
    },
    // 流量汇总
    agentGetHostPortTotal() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      const hostid = []
      this.zhostids.forEach(item => hostid.push(item))
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHostPortTotal,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: this.agent,
          fromAgent: this.localStorageOperation('get', 'fromAgent'),
          fromHostId: this.localStorageOperation('get', 'fromHostId'),
          hostid: hostid.toString()
        }
      })
    },
    destroyed() {
      clearInterval(this.getMonitorDataInterval)
    },
    // 监听流量汇总
    watchAgentGetHostPortTotal(res) {
      const data = this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData)[0] : []
      this.hostKeyValues.forEach(item => { // 遍历要显示的监控项字段，根据这些字段去找监控项的数据
        const itemData = item.portCount ? data['端口数量'] : data[`${item.name}汇总`] // 物理端口
        // websocket拿到的总数项根据hostKeyValues分离后得到itemData
        itemData.forEach(dataItem => {
          const idx = this.allHost.findIndex(items => Number(items.hostid) === Number(dataItem.hostid))
          if (idx !== -1) {
            this.$set(this.allHost[idx], `${item.key}`, Number(dataItem.itemValue))
            this.$set(this.allHost[idx], `${item.key}Units`, dataItem.units)
          }
          const itemDataIdx = this.itemData.findIndex(items => Number(items.hostid) === Number(dataItem.hostid))
          if (itemDataIdx !== -1) {
            this.$set(this.itemData[itemDataIdx], `${item.key}`, Number(dataItem.itemValue))
            this.$set(this.itemData[itemDataIdx], `${item.key}Units`, dataItem.units)
          }
        })
      })
      // console.log(this.allHost, '144444444444')
      // console.log(this.itemData, '666666666666')
      // 这个是传值给list的，这里用不上
      // const areaStatus = []
      // this.allHost.forEach(item => {
      //   const idx = areaStatus.findIndex(items => Number(items.orgId) === Number(item.orgId))
      //   if (idx === -1) {
      //     areaStatus.push({
      //       orgId: Number(item.orgId),
      //       status: item.portCount - item.portConnectionStatus === 0
      //     })
      //   } else {
      //     areaStatus[idx].status = !areaStatus[idx].status ? false : item.portCount - item.portConnectionStatus === 0
      //   }
      // })
      // this.$EventBus.$emit('watch-org-host-statue', areaStatus)
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-failure{
  flex: 1;
  /* height: 100%; */
  height: 300px;
}
</style>

