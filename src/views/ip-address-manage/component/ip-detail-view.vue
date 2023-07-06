<template>
  <div ref="ipDetailView" class="ip-detail-view">
    <div
      v-for="(item, index) in ipList"
      :key="item.id"
      class="ip-item ip-item-default pointer"
      :style="{
        width: boxWidth + 'px',
        margin: boxMargin + 'px',
        'line-height': boxWidth + 'px',
        background: setUseStatue('bg', item.useStatue),
        color: setUseStatue('color', item.useStatue)
      }"
      @contextmenu.prevent="selectIp(item)"
      @contextmenu="showMenu(item)"
      @mouseenter="mouseoverIpItem($event, item)"
      @mouseleave="mouseoutIpItem($event, item)"
    >
      <div class="item pointer">{{ index + 1 }}</div>
    </div>
    <vue-context-menu
      :context-menu-data="contextMenuData"
      @selectPing="selectPing"
      @selectEdit="selectEdit"
    />
    <BindDialog ref="bindDialog" :select-ip="selectIpItem" @updateIpCallBack="updateIpCallBack" />
    <PingDialog ref="pingDialog" :sub-net-id="subNet.id" />
    <div v-if="showIpDetailTip" class="ip-detail-tip" :style="{ 'top': tipTop + 'px', 'left': tipLeft + 'px' }">
      <div class="tip-item">
        <span class="item-label">IP地址：</span>
        <span class="item-value">{{ handlerIp.ip }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">设备类型：</span>
        <span class="item-value">{{ setIpBindDeviceType(handlerIp) }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">设备名称：</span>
        <span class="item-value">{{ handlerIp.deviceName }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">端口：</span>
        <span class="item-value">{{ handlerIp.port }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">MAC：</span>
        <span class="item-value">{{ handlerIp.mac }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">所属网关：</span>
        <span class="item-value">{{ setIpDeviceAgent(handlerIp.id, handlerIp.deviceId) }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">关联方式：</span>
        <span class="item-value">{{ setBindType(handlerIp.bindType) }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">使用状态：</span>
        <span class="item-value" :class="setUseStatue('class', handlerIp.useStatue)">
          <i class="el-icon-success" :class="setUseStatue('class', handlerIp.useStatue)" /> {{ setUseStatue('label', handlerIp.useStatue) }}
        </span>
      </div>
      <div class="tip-item">
        <span class="item-label">连接状态：</span>
        <span class="item-value" :class="setPingStatue('class', handlerIp.pingStatue)">
          <i class="el-icon-success" :class="setPingStatue('class', handlerIp.pingStatue)" /> {{ setPingStatue('text', handlerIp.pingStatue) }}
        </span>
      </div>
      <div class="tip-item">
        <span class="item-label">备注：</span>
        <span class="item-value">{{ handlerIp.backup }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import BindDialog from './bind-dialog'
import PingDialog from './ping-dialog'

export default {
  name: 'IpDetailView',
  components: {
    BindDialog, PingDialog
  },
  props: {
    subNet: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      boxWidth: 35,
      boxMargin: 5,
      boxNum: 0,
      ipList: [],
      useStatue: [
        { value: 1, label: '已用', bg: '#00b285', color: '#fff', class: 'success' },
        { value: 2, label: '可用', bg: '#d6d6d6', color: '#000', class: 'warning' },
        { value: 3, label: '禁用', bg: '#fe6162', color: '#fff', class: 'info' }
      ],
      contextMenuData: {
        menuName: 'flow',
        axis: {
          x: null,
          y: null
        },
        menulists: [
          {
            btnName: 'Ping',
            value: 1,
            fnHandler: 'selectPing'
          },
          {
            btnName: '编辑',
            value: 2,
            fnHandler: 'selectEdit'
          }
        ]
      },
      selectIpItem: {},
      shellResultQueue: '',
      dialogTitle: '',
      showShellInput: true,
      showShellDialog: false,
      loginServerInfo: {},
      tipTop: 0,
      tipLeft: 0,
      showIpDetailTip: false,
      handlerIp: {},
      ipDeviceAgent: [],
      itDeviceType: [],
      opsDeviceType: [],
      videoType: [],
      pingStatue: [
        { value: 1, label: '在线', class: 'success' },
        { value: 2, label: '离线', class: 'danger' },
        { value: 3, label: '未连接', class: 'info' }
      ],
      bindType: [
        { value: 1, label: '自动绑定' },
        { value: 2, label: '手动绑定' }
      ],
      pingAgent: ''
    }
  },
  computed: {
    setUseStatue() {
      return function(attr, val) {
        const idx = this.useStatue.findIndex(item => item.value === val)
        if (idx === -1) return ''
        return this.useStatue[idx][`${attr}`] || ''
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
  watch: {
    subNet: {
      handler() {
        if (this.subNet.netSegment) this.findSubNetIp()
      },
      deep: true
    }
  },
  mounted() {
    this.boxNum = Math.floor(this.$refs.ipDetailView.clientWidth / (this.boxWidth + (this.boxMargin * 2)))
    if (this.subNet.netSegment) this.findSubNetIp()
    this.$EventBus.$on('change-agent', (res) => {
      this.pingAgent = res
    })
    this.getDeviceType()
  },
  methods: {
    // 查询子网ip
    async findSubNetIp() {
      const res = await this.findOpsIpAddressDetail({
        netSegment: this.subNet.netSegment, limit: -1
      })
      this.ipList = res.data

      const hostIds = []
      const ipDevice = []
      this.ipList.forEach(ipItem => {
        if (ipItem.deviceId !== null) {
          hostIds.push(ipItem.deviceId)
          ipDevice.push({
            id: ipItem.id,
            deviceId: ipItem.deviceId
          })
        }
      })
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
              const getIpDeviceIndex = ipDevice.findIndex(ipDeviceItem => Number(ipDeviceItem.agentId) === Number(agentItem.id))
              if (getIpDeviceIndex !== -1) ipDevice[getIpDeviceIndex].agentName = agentItem.name
            })
          }
          this.ipDeviceAgent = ipDevice
        }
      }
    },
    // 查询子网详情
    async findOpsIpAddressDetail(query) {
      return await request({ url: api.ipAddressManage.findOpsIpAddressDetail, data: query })
    },
    // 选择ip
    selectIp(val) {
      this.selectIpItem = val
    },
    // 显示菜单
    showMenu() {
      event.preventDefault()
      const x = event.clientX
      const y = event.clientY
      this.contextMenuData.axis = { x, y }
    },
    // ping
    async selectPing() {
      await this.$refs.pingDialog.ping(this.selectIpItem)
    },
    // 编辑
    selectEdit() {
      this.$refs.bindDialog.open()
    },
    // 监听编辑ip完成
    updateIpCallBack() {
      this.findSubNetIp()
    },
    mouseoverIpItem(e, item) {
      if (item.id !== this.handlerIp) {
        console.log(e, item)
        if (!this.showIpDetailTip) this.showIpDetailTip = true
        this.tipLeft = e.layerX
        this.tipTop = e.layerY
        this.handlerIp = item
      }
    },
    mouseoutIpItem() {
      this.showIpDetailTip = false
    },
    updateOpsIpAddressDetailAgent(query) {
      request({
        url: api.ipAddressManage.updateOpsIpAddressDetailAgent,
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
    }
  }
}
</script>

<style lang="scss" scoped>
.ip-detail-view {
  position: relative;
  .ip-item {
    text-align: center;
    display: inline-block;
  }
  .ip-item-default {
    background: #d6d6d6;
    color: #000;
  }
  .ip-item-disable {
    background: #fe6162;
    color: #fff;
  }
  .ip-item-active {
    background: #00b285;
    color: #fff;
  }
}
.ip-detail-tip {
  width: 400px;
  position: absolute;
  color: white;
  top: 38px;
  left: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.54);
  padding: 10px;
  .tip-item {
    padding: 10px;
    font-size: 14px;
  }
}
</style>
