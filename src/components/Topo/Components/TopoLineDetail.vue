<template>
  <el-dialog v-set-dialog-main-height="'80%'" class="dialog-body-scroll dialog-not-footer" append-to-body title="查看链路" :visible.sync="showLineDetail" width="80%" height="50%" top="5vh">
    <div ref="dialogBody" class="dialog-body">
      <div id="subMap" />
      <div class="line-host">
        <div class="line-host-item">
          <div class="host-name">{{ sourceHost.hostName }}</div>
          <div class="host-ip">{{ sourceHost.ip }}</div>
        </div>
        <div class="line-host-item">
          <div class="host-name">{{ targetHost.hostName }}</div>
          <div class="host-ip">{{ targetHost.ip }}</div>
        </div>
      </div>
      <el-table
        :data="port"
        fit
        highlight-current-row
        style="width: 100%"
        max-height="250"
        border
      >
        <el-table-column
          label="状态"
          align="center"
          width="100"
        >
          <template slot-scope="{row}">
            <div :class="row.statue === 1 ? 'success' : 'danger'">{{ row.statue === 1 ? '正常' : '异常' }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="图形"
          align="center"
          width="50"
        >
          <template slot-scope="item">
            <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart('source', item.row)">
          </template>
        </el-table-column>
        <el-table-column
          label="流量"
          align="center"
          width="200"
        >
          <template slot-scope="{row}">
            <div>发送：{{ row.sourceSend }}</div>
            <div>接收：{{ row.sourceReceive }}</div>
          </template>
        </el-table-column>
        <el-table-column label="端口" prop="sourceZbxItemName" align="center" show-overflow-tooltip min-width="220" />
        <el-table-column label="端口" prop="targetZbxItemName" align="center" show-overflow-tooltip min-width="220" />
        <el-table-column
          label="流量"
          align="center"
          width="200"
        >
          <template slot-scope="{row}">
            <div>发送：{{ row.targetSend }}</div>
            <div>接收：{{ row.targetReceive }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="图形"
          align="center"
          width="50"
        >
          <template slot-scope="item">
            <img src="image/common/ico_char.png" alt="" style="margin-top:5px" @click="openMonitorNetListEchart('target', item.row)">
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script>
import G6 from '@antv/g6'
import { connectLineTypeList, topoPortAbbreviations, topoShape } from '@/utils/define-data'
import TopoMapApiRequireMixin from '@/components/Topo/mixins/TopoMapApiRequireMixin'
import { conversionSymbols, isJSONString } from '@/utils/utils'

export default {
  name: 'TopoLineDetail',
  mixins: [TopoMapApiRequireMixin],
  props: {
    /**
     * @description G6节点
     * @param mapNodes G6节点
     */
    mapNodes: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * @description G6链路
     * @param mapEdges G6链路
     */
    mapEdges: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      subTopoGraph: null, // G6实例
      subTopoMapData: { // 拓扑图数据
        nodes: [], // 节点
        edges: [] // 链路
      },
      showLineDetail: false,
      port: [],
      sourceHost: {},
      targetHost: {},
      topoLineDetailComponentGuid: this.$tool.guid(),
      getMonitorDataInterval: null
    }
  },
  computed: {
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  mounted() {
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.isTopoLineDetail === true && res.detail.data.componentGuid === this.topoLineDetailComponentGuid && res.detail.data.cmd === 'it-agentGetHostPort-websocket') {
        this.setHostPortFlow({
          dataType: res.detail.data.dataType,
          componentGuid: res.detail.data.componentGuid,
          isTopoLineDetail: res.detail.data.isTopoLineDetail,
          data: isJSONString(res.detail.data.HostPortData) ? JSON.parse(res.detail.data.HostPortData)[0] : res.HostPortData
        })
      }
    })
  },
  methods: {
    // 组装数据
    async generateData() {
      // 图节点 链路
      // 链路类型
      this.connectLineTypeList = connectLineTypeList()
      // 分组图形
      this.topoShape = topoShape()
      // 端口缩写
      this.topoPortAbbreviations = topoPortAbbreviations()

      this.mapNodes.forEach(item => {
        item.y = 300 / 2
      })
      this.$set(this.mapNodes[0], 'x', 100)
      this.$set(this.mapNodes[1], 'x', this.$refs.dialogBody.clientWidth - 100)
      this.$set(this.subTopoMapData, 'nodes', this.mapNodes)

      this.mapEdges.forEach(item => {
        item.label = `${item.sourceZbxItemName} —— ${item.targetZbxItemName}`
      })
      this.$set(this.subTopoMapData, 'edges', this.mapEdges)

      // 主机
      const sourceHost = await this.getHyitHost({ hyHostId: this.mapNodes[0].hostId })
      const targetHost = await this.getHyitHost({ hyHostId: this.mapNodes[1].hostId })
      if (sourceHost.code === 1 && sourceHost.model) {
        this.sourceHost = {
          hostName: sourceHost.model.hyMarkName,
          agent: sourceHost.model.agent,
          ip: sourceHost.model.hyIp,
          hyHostId: sourceHost.model.hyHostId,
          hyZhostId: sourceHost.model.hyZhostId
        }
      }
      if (targetHost.code === 1 && targetHost.model) {
        this.targetHost = {
          hostName: targetHost.model.hyMarkName,
          ip: targetHost.model.hyIp,
          agent: targetHost.model.agent,
          hyZhostId: targetHost.model.hyZhostId,
          hyHostId: targetHost.model.hyHostId
        }
      }

      // 设置流量表格
      this.mapEdges.forEach(item => {
        this.$set(this.port, this.port.length, {
          sourceZbxItemName: item.sourceZbxItemName,
          targetZbxItemName: item.targetZbxItemName,
          sourceZbxItemId: '',
          targetZbxItemId: '',
          sourceValueType: '',
          targetValueType: '',
          sourceUnit: '',
          targetUnit: '',
          sourceAgent: item.sourceAgent,
          targetAgent: item.targetAgent,
          statue: item.statue,
          sourceSend: 0,
          sourceReceive: 0,
          targetSend: 0,
          targetReceive: 0
        })
      })

      this.setMonitorItemData()
      this.getMonitorDataInterval = setInterval(() => {
        this.setMonitorItemData()
      }, 30000)
    },
    // 初始化图
    async initSubTopo() {
      await this.destroyMap()
      // 实例化元素配置
      this.subTopoGraph = new G6.Graph({
        container: 'subMap', // 视图区域DOM
        width: this.$refs.dialogBody.clientWidth,
        height: 300,
        defaultEdge: { // 线条默认配置
          color: '#B7C2CBFF',
          lineAppendWidth: 10,
          style: {
            lineWidth: 3
          }
        },
        defaultNode: { // 节点默认配置
          size: [40, 40]
        },
        animate: true // 开启动画过渡
      })
      this.subTopoGraph.data(this.subTopoMapData)
      G6.Util.processParallelEdges(this.subTopoMapData.edges) // 多边渲染
      this.subTopoGraph.render()
      this.subTopoGraph.fitCenter()
    },
    // 打开弹窗
    openLineDetail() {
      this.showLineDetail = true
      this.$nextTick(async() => {
        this.port = []
        await this.generateData()
        await this.initSubTopo()
      })
    },
    // 卸载实例
    async destroyMap() {
      if (this.subTopoGraph) return this.subTopoGraph.destroy()
    },
    // 设置端口监控数据
    async setMonitorItemData() {
      const sourceHostQuery = {
        dataType: 'sourceHost', componentGuid: this.topoLineDetailComponentGuid, isTopoLineDetail: true
      }
      const targetHostQuery = {
        dataType: 'targetHost', componentGuid: this.topoLineDetailComponentGuid, isTopoLineDetail: true
      }
      // 获取主机端口流量
      console.log(this.sourceHost.agent)
      this.agentGetHostPort({
        agent: this.sourceHost.agent,
        hostid: this.sourceHost.hyZhostId
      }, sourceHostQuery).then(res => {
        if (res) {
          this.setHostPortFlow({ ...sourceHostQuery, data: res })
        }
      })
      this.agentGetHostPort({
        agent: this.targetHost.agent,
        hostid: this.targetHost.hyZhostId
      }, targetHostQuery).then(res => {
        if (res) {
          this.setHostPortFlow({ ...sourceHostQuery, data: res })
        }
      })
    },
    // 设置主机端口流量
    setHostPortFlow(val) {
      const { data } = val
      const down = []
      const up = []
      down.push(...data['端口每秒接收速率'])
      down.push(...data['端口每秒接收速率vlan'])
      up.push(...data['端口每秒发送速率'])
      up.push(...data['端口每秒发送速率vlan'])
      up.forEach(upItem => {
        if (upItem.itemName.length > 0) {
          const rawItemName = upItem.itemName
          const dataName = conversionSymbols(upItem.itemName)
          let splitItemName = ''
          if (dataName.indexOf('(') !== -1) {
            splitItemName = dataName.split('(')[0]
          }
          if (dataName.indexOf('Bitssent') !== -1) {
            splitItemName = rawItemName.split(': Bits sent')[0]
          }
          const portItemIdx = this.port.findIndex(portFindItem => portFindItem[val.dataType === 'sourceHost' ? 'sourceZbxItemName' : 'targetZbxItemName'] === splitItemName)
          if (portItemIdx !== -1) {
            let suffix = ''
            let units = ''
            if (upItem.units.indexOf('/') !== -1) {
              suffix = `/${upItem.units.split('/')[1]}`
              units = upItem.units.split('/')[0]
            }
            if (upItem.units.indexOf('ps') !== -1) {
              suffix = upItem.units.split('ps')[1]
              units = upItem.units.split('ps')[0]
            }
            const sizeUnitsTransform = this.$tool.sizeUnitsTransform(units, 'mb', upItem.itemValue)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceSend' : 'targetSend'}`, `${sizeUnitsTransform.size.toFixed(2)}MB${suffix}`)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceSendValueType' : 'targetSendValueType'}`, upItem.valueType)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceSendZbxItemId' : 'targetSendZbxItemId'}`, upItem.itemid)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceSendUnit' : 'targetSendUnit'}`, upItem.units)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceSendAgent' : 'targetSendAgent'}`, upItem.agent)
          }
        }
      })
      down.forEach(downItem => {
        if (downItem.itemName.length > 0) {
          const rawItemName = downItem.itemName
          const dataName = conversionSymbols(downItem.itemName)
          let splitItemName = ''
          if (dataName.indexOf('(') !== -1) {
            splitItemName = dataName.split('(')[0]
          }
          if (dataName.indexOf('Bitsreceived') !== -1) {
            splitItemName = rawItemName.split(': Bits received')[0]
          }
          const portItemIdx = this.port.findIndex(portFindItem => portFindItem[val.dataType === 'sourceHost' ? 'sourceZbxItemName' : 'targetZbxItemName'] === splitItemName)
          if (portItemIdx !== -1) {
            let suffix = ''
            let units = ''
            if (downItem.units.indexOf('/') !== -1) {
              suffix = `/${downItem.units.split('/')[1]}`
              units = downItem.units.split('/')[0]
            }
            if (downItem.units.indexOf('ps') !== -1) {
              suffix = downItem.units.split('ps')[1]
              units = downItem.units.split('ps')[0]
            }
            const sizeUnitsTransform = this.$tool.sizeUnitsTransform(units, 'mb', downItem.itemValue)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceReceive' : 'targetReceive'}`, `${sizeUnitsTransform.size.toFixed(2)}MB${suffix}`)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceReceiveValueType' : 'targetReceiveValueType'}`, downItem.valueType)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceReceiveZbxItemId' : 'targetReceiveZbxItemId'}`, downItem.itemid)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceReceiveUnit' : 'targetReceiveUnit'}`, downItem.units)
            this.$set(this.port[portItemIdx], `${val.dataType === 'sourceHost' ? 'sourceReceiveAgent' : 'targetReceiveAgent'}`, downItem.agent)
          }
        }
      })
    },
    // 打开端口流量
    openMonitorNetListEchart(type, val) {
      this.$EventBus.$emit('openMonitorNetListEchart', {
        sendUnit: val[`${type}SendUnit`],
        sendItemId: val[`${type}SendZbxItemId`],
        sendValueType: val[`${type}SendValueType`],
        receiveUnit: val[`${type}ReceiveUnit`],
        receiveItemId: val[`${type}ReceiveZbxItemId`],
        receiveValueType: val[`${type}ReceiveValueType`],
        SendAgent: val[`${type}SendAgent`],
        ReceiveAgent: val[`${type}ReceiveAgent`]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.line-host {
  background: #f8f8f8;
  .line-host-item {
    width: 50%;
    text-align: center;
    display: inline-block;
    padding: 8px 0;
    .host-name {
      font-weight: bold;
      font-size: 16px;
      color: #000;
      padding-bottom: 8px;
    }
    .host-ip {
      font-size: 12px;
      color: #878787;
    }
  }
}
</style>
