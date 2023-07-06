<template>
  <div ref="equimentTopoGraph" class="equimentTopoGraph">
    <div id="topoMap" />
    <!-- 点击连线弹出 -->
    <div v-if="portTooltip" class="tooltip-group" :style="{ left: portTooltipPosition.x + 'px', top: portTooltipPosition.y + 'px' }">
      <div class="g6-component-tooltip margin-right-10">
        <div class="host-name margin-bottom-10">{{ sourcePort.label }}</div>
        <div class="host-ip margin-bottom-10">{{ sourcePort.ip }}</div>
        <div class="host-port margin-bottom-10"><span class="item-name">端口：</span>{{ sourcePort.port }}</div>
        <div class="host-port margin-bottom-10"><span class="item-name">链路类型：</span>{{ sourcePort.linkLabel }}</div>
        <div class="port-status margin-bottom-10"><span class="item-name">状态：</span><span :class="sourcePort.status == 1 ? 'success' : 'danger'">{{ sourcePort.status == 1 ? '正常' : '异常' }}</span></div>
        <div class="rate-num margin-bottom-10"><span class="item-name">上行数据：</span>{{ sourcePort.down }}</div>
        <div class="rate-num"><span class="item-name">下行数据：</span>{{ sourcePort.up }}</div>
        <el-button type="text" @click="showHostEcharts(sourcePort, 'sourcePort')">查看报表</el-button>
      </div>
      <div class="g6-component-tooltip">
        <div class="host-name margin-bottom-10">{{ targetPort.label }}</div>
        <div class="host-ip margin-bottom-10">{{ targetPort.ip }}</div>
        <div class="host-port margin-bottom-10"><span class="item-name">端口：</span>{{ targetPort.port }}</div>
        <div class="host-port margin-bottom-10"><span class="item-name">链路类型：</span>{{ targetPort.linkLabel }}</div>
        <div class="port-status margin-bottom-10"><span class="item-name">状态：</span><span :class="targetPort.status == 1 ? 'success' : 'danger'">{{ targetPort.status == 1 ? '正常' : '异常' }}</span></div>
        <div class="rate-num margin-bottom-10"><span class="item-name">上行数据：</span>{{ targetPort.down }}</div>
        <div class="rate-num"><span class="item-name">下行数据：</span>{{ targetPort.up }}</div>
        <el-button type="text" @click="showHostEcharts(targetPort, 'targetPort')">查看报表</el-button>
      </div>
    </div>
    <!-- 点击节点弹出 -->
    <div v-if="itemHostTooltip" class="g6-component-tooltip host-tooltip" :style="{ left: itemHost.layerX + 'px', top: itemHost.layerY + 'px' }">
      <div class="host-name margin-bottom-10">{{ itemHost.hyMarkName }}</div>
      <div class="host-ip margin-bottom-10">{{ itemHost.hyIp }}</div>
      <div class="port-status margin-bottom-10"><span class="item-name">状态：</span><span :class="setHostStataTag(itemHost)">{{ setHostStatus(itemHost) }}</span></div>
      <div class="device-type margin-bottom-10"><span class="item-name">设备类型：</span>{{ setDeviceType(itemHost.hyDevTypeId) }}</div>
      <div class="host-address"><span class="item-name">所在位置：</span>{{ itemHost.hyAddr }}</div>
    </div>
    <!-- 点击查看报表弹出 -->
    <el-dialog title="流量详情" :visible.sync="showDialog" width="50%" top="5vh" append-to-body @close="closeDialog">
      <div class="dialog-content">
        <div class="link-host-detail">
          <div class="host-detail-name overflow-text-a">{{ handlerLinkHost.label }}</div>
          <div class="host-info">
            <div class="host-ip margin-right-15">{{ handlerLinkHost.ip }}</div>
            <div class="host-port margin-right-15">端口：{{ handlerLinkHost.port }}</div>
            <div class="host-status">状态：<span :class="handlerLinkHost.status == 1 ? 'success' : 'danger'">{{ handlerLinkHost.status == 1 ? '正常' : '异常' }}</span></div>
          </div>
        </div>
        <UsedStatisticsContainer echart-el="topoHostDetailChart" :echart-data="getPropsEchartParams" :realtime="true" :show-new-data-tag="false" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import G6 from '@antv/g6'
import { dateFormat, isJSONString, conversionData } from '@/utils/utils'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
export default {
  props: {
    topoMapData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      findHyitTopologyInfoQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      //  echart数据收集
      getPropsEchartParams: [
        {
          name: '上行数据',
          color: '#87DEAF',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        },
        {
          name: '下数据',
          color: '#87DEAF',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        }
      ],
      // 来源端口节点信息
      sourcePort: {
        downData: [],
        downUtils: [],
        upData: [],
        upUtils: [],
        time: []
      },
      // 目标端口节点信息
      targetPort: {
        downData: [],
        downUtils: [],
        upData: [],
        upUtils: [],
        time: []
      },

      getMonitorDataInterval: null,
      showHostEchartsInterval: null,
      // topoGraph: {}, // 拓扑图实例对象
      portTooltipPosition: {},
      portTooltip: false,
      itemHostTooltip: false,
      itemHost: {},
      handlerEdge: {},
      handlerLinkHost: {},
      showDialog: false,
      deviceType: [],
      topoGraph: {}
    }
  },
  computed: {
    containerHeight() {
      return this.$refs.equimentTopoGraph.clientHeight
    },
    containerWidth() {
      return this.$refs.equimentTopoGraph.clientWidth
    },
    setDeviceType() {
      return function(deviceTypeId) {
        const idx = this.deviceType.findIndex(item => item.id === deviceTypeId)
        if (idx !== -1) {
          return this.deviceType[idx].dictdataName
        }
      }
    },
    setHostStatus() {
      return function(row) {
        const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        return count === 1 ? '在线' : '离线'
      }
    },
    setHostStataTag() {
      return function(row) {
        const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        return count === 1 ? 'success' : 'info'
      }
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  watch: {
    topoMapData: {
      handler() {
        console.log('test666666666')
        if (Object.keys(this.topoGraph).length > 0) { this.topoGraph.destroy() }
        window.clearInterval(this.getMonitorDataInterval)
        window.clearInterval(this.showHostEchartsInterval)
        this.getMonitorDataInterval = null
        this.showHostEchartsInterval = null
        this.portTooltip = false
        this.itemHostTooltip = false
        this.initMap()
      }
      // deep: true
      // this.$emit('clearBeforeMap',this.)
    }
  },
  async mounted() {
    this.loadItType()
    console.log(this.$refs.equimentTopoGraph.getBoundingClientRect())
    console.log(this.$refs.equimentTopoGraph.clientWidth)
    console.log('this.$refs.equimentTopoGraph.getBoundingClientRect()')
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostPort-websocket') {
        const portData = isJSONString(res.detail.data.HostPortData) ? JSON.parse(res.detail.data.HostPortData)[0] : res.HostPortData
        if (portData) {
          if (res.detail.data.dataType === 'sourceNode') this.watchSourceData(portData, res.detail.data.isPushReal)
          if (res.detail.data.dataType === 'targetNode') this.watchTargetData(portData, res.detail.data.isPushReal)
        }
      }
    })
    // 获取拓扑列表
    // let { data: topoList } = await this.loadTopoList()
    // console.log(topoList, '111111111111')
    // 如果拓扑列表不为零，则初始化拓扑图
    // if (topoList.length > 0) {
    //   this.initTopoMap()
    // }
    // this.topoHeaderTop = this.$refs.topoHeader.scrollTop + this.$refs.topoHeader.clientHeight
  },
  beforeDestroy() {
    window.clearInterval(this.getMonitorDataInterval)
    this.getMonitorDataInterval = null
    window.clearInterval(this.showHostEchartsInterval)
    this.showHostEchartsInterval = null
  },
  methods: {

    // 初始化topo图
    initMap() {
      const that = this
      // 存在实例则销毁

      const minimap = new G6.Minimap({
        size: [window.innerWidth / 8, window.innerHeight / 5]
      })
      // 实例化元素配置

      this.topoGraph = new G6.Graph({
        container: 'topoMap', // 视图区域DOM
        width: this.$refs.equimentTopoGraph.clientWidth,
        height: this.containerHeight,
        defaultEdge: { // 线条默认配置
          color: '#B7C2CBFF',
          lineAppendWidth: 10,
          style: { lineWidth: 3 }
        },
        defaultNode: { // 节点默认配置
          size: [40, 40],
          labelCfg: {
            style: {
              fill: '#fff',
              fontSize: 12
            }
          }
        },
        modes: { // 模式
          default: ['drag-canvas', 'zoom-canvas']
        },
        plugins: [minimap],
        animate: true // 开启动画过渡
      })

      // 点击元素节点
      this.topoGraph.on('node:click', (evt) => {
        console.log('111')
        window.clearInterval(this.getMonitorDataInterval)
        this.getMonitorDataInterval = null
        window.clearInterval(this.showHostEchartsInterval)
        this.showHostEchartsInterval = null
        if (evt.item._cfg.model.userDefineType === 1 || evt.item._cfg.model.userDefineType === 2) return
        this.getHyitHost(evt.item._cfg.model.hostId).then(res => {
          if (res) {
            this.itemHost = { ...res, ...evt.item._cfg.model, layerX: evt.originalEvent.layerX, layerY: evt.originalEvent.layerY }
            this.itemHostTooltip = true
            this.portTooltip = false
          } else {
            this.$message('主机不存在')
          }
        })
      })
      this.topoGraph.on('click', () => {
        console.log('evil')
      })
      // 点击画布
      this.topoGraph.on('canvas:click', function() {
        console.log('2222')
        window.clearInterval(that.getMonitorDataInterval)
        window.clearInterval(that.showHostEchartsInterval)
        that.getMonitorDataInterval = null
        that.showHostEchartsInterval = null
        that.portTooltip = false
        that.itemHostTooltip = false
      })

      // 拖拽画布结束
      this.topoGraph.on('canvas:dragend', function(evt) {
        window.clearInterval(that.getMonitorDataInterval)
        that.getMonitorDataInterval = null
        window.clearInterval(that.showHostEchartsInterval)
        that.showHostEchartsInterval = null
        that.portTooltip = false
        that.itemHostTooltip = false
      })

      // 移出链路
      this.topoGraph.on('edge:mouseleave', function() {
        that.linkTypeTooltip = false
      })

      // 点击链路
      this.topoGraph.on('edge:click', function(evt) {
        console.log('333')
        const getLink = that.$tool.findDataItemByAttr(that.connectLineTypeListMap, 'value', evt.item._cfg.model.linkType)
        window.clearInterval(that.getMonitorDataInterval)
        that.getMonitorDataInterval = null
        window.clearInterval(that.showHostEchartsInterval)
        that.showHostEchartsInterval = null
        that.portTooltip = true
        that.portTooltipPosition = {
          x: evt.originalEvent.layerX,
          y: evt.originalEvent.layerY
        }
        that.handlerEdge = evt.item._cfg.model
        that.sourcePort = evt.item._cfg.source._cfg.model
        that.targetPort = evt.item._cfg.target._cfg.model

        that.getHyitHost(evt.item._cfg.source._cfg.model.hostId).then(res => {
          if (res) {
            that.$set(that.sourcePort, 'ip', res.hyIp)
            that.$set(that.sourcePort, 'linkLabel', getLink.label)
          }
        })

        that.getHyitHost(evt.item._cfg.target._cfg.model.hostId).then(res => {
          if (res) {
            that.$set(that.targetPort, 'ip', res.hyIp)
            that.$set(that.targetPort, 'linkLabel', getLink.label)
          }
        })

        that.$set(that.sourcePort, 'port', that.handlerEdge.sourceZbxItemName)
        that.$set(that.targetPort, 'port', that.handlerEdge.targetZbxItemName)

        that.setMonitorItemData()
        that.getMonitorDataInterval = setInterval(() => {
          that.setMonitorItemData()
        }, 30000)
      })

      this.topoGraph.data(this.topoMapData)
      G6.Util.processParallelEdges(this.topoMapData.edges) // 多边渲染
      this.topoGraph.render()
      this.topoGraph.fitView() // 居中
    },

    // 获取主机端口情况
    async agentGetHostPort(query, wsQuery) {
      if (this.itMonitorRequireAgreement !== 'WS') {
        return new Promise(resolve => {
          request({
            url: api.itMonitor.agentGetHostPort, data: query
          }).then(res => {
            if (res.code === 1 && res.map) {
              Object.keys(res.map).forEach(key => {
                if (res[key] !== '') {
                  res.map[key] = this.$tool.isJSONString(res.map[key]) ? JSON.parse(res.map[key]) : []
                }
              })
              resolve(res.map)
            }
          })
        })
      } else {
        return new Promise(resolve => {
          const wsToken = this.sessionStorageOperation('get', 'wsToken')
          if (!wsToken) return
          const getUserSessionResult = getUserSession()
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostPort,
            data: {
              token: wsToken,
              companyId: getUserSessionResult.companyId,
              appId: getUserSessionResult.appId,
              ...query,
              ...wsQuery,
              fromAgent: this.localStorageOperation('get', 'fromAgent'),
              fromHostId: this.localStorageOperation('get', 'fromHostId')
            }
          },
          (res) => {
            const wsRes = this.$tool.isJSONString(res.HostPortData) ? JSON.parse(res.HostPortData) : res.HostPortData
            if (wsRes) {
              resolve(wsRes)
            }
          }, (err) => {
            this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
            console.log(err)
          })
        })
      }
    },
    // 获取主机信息
    async getHyitHost(hostId) {
      return await request({
        url: api.itMonitor.getHyitHost,
        data: { hyHostId: hostId }
      }).then(res => {
        if (res.code === 1 && res.model) {
          return res.model
        }
      })
    },
    // 获取设备类型
    loadItType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceType = res.data
        }
      })
    },
    // 设置端口数据
    setMonitorItemData(isPushReal) {
      const that = this
      const clock = new Date()
      if (isPushReal) {
        that.$set(that.sourcePort.time, that.sourcePort.time.length, `${dateFormat('HH:MM:SS', clock)}`)
        that.$set(that.targetPort.time, that.targetPort.time.length, `${dateFormat('HH:MM:SS', clock)}`)
      }
      // 起点链路
      const sourceNodeIdx = that.topoMapData.nodes.findIndex(nodeItem => Number(nodeItem.id) === Number(that.handlerEdge.source))
      if (that.handlerEdge.sourceAgent && sourceNodeIdx !== -1) {
        if (that.topoMapData.nodes[sourceNodeIdx].userDefineType === 1 || that.topoMapData.nodes[sourceNodeIdx].userDefineType === 2) return
        that.agentGetHostPort({
          agent: that.handlerEdge.sourceAgent,
          hostid: that.topoMapData.nodes[sourceNodeIdx].hyZhostId
        }, { dataType: 'sourceNode', isPushReal }).then(res => {
          if (res) this.watchSourceData(res, isPushReal)
        })
      }

      // 终点链路
      const targetNodeIdx = that.topoMapData.nodes.findIndex(nodeItem => Number(nodeItem.id) === Number(that.handlerEdge.target))
      if (that.handlerEdge.targetAgent && targetNodeIdx !== -1) {
        if (that.topoMapData.nodes[targetNodeIdx].userDefineType === 1 || that.topoMapData.nodes[targetNodeIdx].userDefineType === 2) return
        that.agentGetHostPort({
          agent: that.handlerEdge.targetAgent,
          hostid: that.topoMapData.nodes[targetNodeIdx].hyZhostId
        }, { dataType: 'targetNode', isPushReal }).then(res => {
          if (res) that.watchTargetData(res, isPushReal)
        })
      }
    },
    closeDialog() {
      window.clearInterval(this.showHostEchartsInterval)
      this.showHostEchartsInterval = null
    },
    showHostEcharts(data, attrName) {
      this.handlerLinkHost = data
      this.showDialog = true
      this.showHostEchartsInterval = setInterval(() => {
        const clock = new Date()
        this.setMonitorItemData(true)
        this.$set(this.getPropsEchartParams[0], 'data', this[`${attrName}`].upData)
        this.$set(this.getPropsEchartParams[0], 'units', this[`${attrName}`].upUtils)
        this.$set(this.getPropsEchartParams[1], 'data', this[`${attrName}`].downData)
        this.$set(this.getPropsEchartParams[1], 'units', this[`${attrName}`].downUtils)
        this.$set(this.getPropsEchartParams[0].time, this.getPropsEchartParams[0].time.length, `${dateFormat('HH:MM:SS', clock)}`)
      }, 5000)
    },
    watchSourceData(res, isPushReal) {
      const down = []
      const up = []
      const status = []
      down.push(...res['端口每秒接收速率'])
      down.push(...res['端口每秒接收速率vlan'])
      up.push(...res['端口每秒发送速率'])
      up.push(...res['端口每秒发送速率vlan'])
      status.push(...res['端口物理连接状态'])
      status.push(...res['端口物理连接状态vlan'])
      const sourcePortDownIdx = down.findIndex(item => item.itemName.indexOf(this.handlerEdge.sourceZbxItemName) !== -1)
      const sourcePortUpIdx = up.findIndex(item => item.itemName.indexOf(this.handlerEdge.sourceZbxItemName) !== -1)
      const statusIdx = status.findIndex(item => item.itemName.indexOf(this.handlerEdge.sourceZbxItemName) !== -1)
      if (sourcePortDownIdx !== -1) {
        const conversionDataResult = conversionData('data', Number(down[sourcePortDownIdx].itemValue), down[sourcePortDownIdx].units)
        const size = conversionDataResult.size
        const units = conversionDataResult.lowerUnits
        const suffix = conversionDataResult.suffix
        if (!isPushReal) {
          this.$set(this.sourcePort, 'down', `${size}${units}${suffix}`)
        } else {
          this.$set(this.sourcePort.downData, this.sourcePort.downData.length, size)
          this.$set(this.sourcePort.downUtils, this.sourcePort.downUtils.length, `${units}${suffix}`)
        }
      } else {
        if (!isPushReal) {
          this.$set(this.sourcePort, 'down', '')
        }
      }
      if (sourcePortUpIdx !== -1) {
        const conversionDataResult = conversionData('data', Number(up[sourcePortUpIdx].itemValue), up[sourcePortUpIdx].units)
        const size = conversionDataResult.size
        const units = conversionDataResult.lowerUnits
        const suffix = conversionDataResult.suffix
        if (!isPushReal) {
          this.$set(this.sourcePort, 'up', `${size}${units || ''}${suffix}`)
        } else {
          this.$set(this.sourcePort.upData, this.sourcePort.upData.length, size)
          this.$set(this.sourcePort.upUtils, this.sourcePort.upUtils.length, `${units}${suffix}`)
        }
      } else {
        if (!isPushReal) {
          this.$set(this.sourcePort, 'up', '')
        }
      }
      if (statusIdx !== -1) {
        this.$set(this.sourcePort, 'status', status[statusIdx].itemValue)
      }
    },

    watchTargetData(res, isPushReal) {
      const down = []
      const up = []
      const status = []
      down.push(...res['端口每秒接收速率'])
      down.push(...res['端口每秒接收速率vlan'])
      up.push(...res['端口每秒发送速率'])
      up.push(...res['端口每秒发送速率vlan'])
      status.push(...res['端口物理连接状态'])
      status.push(...res['端口物理连接状态vlan'])
      const targetPortDownIdx = down.findIndex(item => item.itemName.indexOf(this.handlerEdge.targetZbxItemName) !== -1)
      const targetPortUpIdx = up.findIndex(item => item.itemName.indexOf(this.handlerEdge.targetZbxItemName) !== -1)
      const statusIdx = status.findIndex(item => item.itemName.indexOf(this.handlerEdge.targetZbxItemName) !== -1)
      if (targetPortDownIdx !== -1) {
        const conversionDataResult = conversionData('data', Number(down[targetPortDownIdx].itemValue), down[targetPortDownIdx].units)
        const size = conversionDataResult.size ? conversionDataResult.size : 0
        const units = conversionDataResult.lowerUnits ? conversionDataResult.lowerUnits : down[targetPortDownIdx].units
        const suffix = conversionDataResult.lowerUnits ? conversionDataResult.suffix : ''
        if (!isPushReal) {
          this.$set(this.targetPort, 'down', `${size}${units}${suffix}`)
        } else {
          this.$set(this.targetPort.downData, this.targetPort.downData.length, size)
          this.$set(this.targetPort.downUtils, this.targetPort.downUtils.length, `${units}${suffix}`)
        }
      } else {
        if (!isPushReal) {
          this.$set(this.targetPort, 'down', '')
        }
      }
      if (targetPortUpIdx !== -1) {
        const conversionDataResult = conversionData('data', Number(up[targetPortUpIdx].itemValue), up[targetPortUpIdx].units)
        const size = conversionDataResult.size ? conversionDataResult.size : 0
        const units = conversionDataResult.lowerUnits ? conversionDataResult.lowerUnits : up[targetPortUpIdx].units
        const suffix = conversionDataResult.lowerUnits ? conversionDataResult.suffix : ''
        if (!isPushReal) {
          this.$set(this.targetPort, 'up', `${size}${units}${suffix}`)
        } else {
          this.$set(this.targetPort.upData, this.targetPort.upData.length, size)
          this.$set(this.targetPort.upUtils, this.targetPort.upUtils.length, `${units}${suffix}`)
        }
      } else {
        if (!isPushReal) {
          this.$set(this.targetPort, 'up', '')
        }
      }
      if (statusIdx !== -1) {
        this.$set(this.targetPort, 'status', status[statusIdx].itemValue)
      }
    }

  }
}
</script>

<style lang="scss" scoped>
 .equimentTopoGraph{

  // height: 100%;

  #topoMap{
     width: 100%;
     height: 625px;
  }
  // background-color: aliceblue;

 }
  /deep/ .g6-minimap{
    position:absolute !important;
    right: 0 !important;
    // bottom: 13%;
  }
</style>
