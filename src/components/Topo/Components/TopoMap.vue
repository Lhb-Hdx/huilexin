<template>
  <div class="topo-map-component">
    <!-- 拓扑图 -->
    <div id="topoMap" :class="mapGridBg ? 'mapGridBg' : ''" />
    <div v-if="showConextMenu" class="conext-menu" :style="{'left': menuLeft + 'px', 'top': menuTop + 'px'}" @mouseout="conextMenuOut">
      <div class="conext-menu pointer" @click="removeNode">删除</div>
    </div>
    <!-- 新增链路关系配置弹窗 -->
    <el-dialog title="拓扑关系配置" :visible.sync="showDialog" width="50%" top="5vh" :before-close="onBeforeCloseDialog">
      <el-form ref="form" :model="topoLineForm" label-width="200px">
        <el-form-item :label="sourcePortLabel" prop="sourceZbxItemId">
          <el-select v-model="topoLineForm.sourceZbxItemId" placeholder="请选择源端口" style="width: 100%;">
            <el-option v-for="item in sourceHostPortList" :key="item.itemid" :label="setAbbreviations(item.itemName)" :value="item.itemid" />
          </el-select>
        </el-form-item>
        <el-form-item :label="targetPortLabel" prop="targetZbxItemId">
          <el-select v-model="topoLineForm.targetZbxItemId" placeholder="请选择目标端口" style="width: 100%;">
            <el-option v-for="item in targetHostPortList" :key="item.itemid" :label="setAbbreviations(item.itemName)" :value="item.itemid" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接类型" prop="linkType">
          <el-select v-model="topoLineForm.linkType" placeholder="请选择连接类型" style="width: 100%;">
            <el-option v-for="item in connectLineTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelLine">取 消</el-button>
        <el-button type="primary" @click="confirmDialog">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 拓扑主机节点详细信息 -->
    <TopoHostDetail v-if="showHostDetail" :host="hostDetail" :style-options="styleOptions.TopHostDetail" />
    <!-- 拓扑链路详细信息 -->
    <TopoLineDetail v-if="showLineDetail" ref="topoLineDetailDialog" :map-nodes="subNodes" :map-edges="subEdges" />
    <!-- it设备详细信息 -->
    <TopoITDeviceDetail />
    <!-- 拓扑流量 -->
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :prop-agent="Number(getHostAgent)"
      :show-dialog="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
    <!-- 主机端口 -->
    <TopoHostPort />
  </div>
</template>

<script>
import G6 from '@antv/g6'
import { connectLineTypeList, topoPortAbbreviations, topoShape, topoDiyLabel } from '@/utils/define-data'

import TopoLineDetail from '@/components/Topo/Components/TopoLineDetail'
import TopoHostDetail from '@/components/Topo/Components/TopoHostDetail'
import TopoITDeviceDetail from '@/components/Topo/Components/TopoITDeviceDetail'
import UsedDetailDialog
  from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/component/used-detail-dialog'
import TopoHostPort from '@/components/Topo/Components/TopoHostPort'

import TopoMapApiRequireMixin from '@/components/Topo/mixins/TopoMapApiRequireMixin'
import TopoMapConfigMixin from '@/components/Topo/mixins/TopoMapConfigMixin'
import TopoMapPreviewMixin from '@/components/Topo/mixins/TopoMapPreviewMixin'
import TopoItMonitorDevicePortMixin from '@/components/Topo/mixins/TopoItMonitorDevicePortMixin'

export default {
  name: 'TopoMap',
  components: { TopoHostDetail, TopoLineDetail, TopoITDeviceDetail, UsedDetailDialog, TopoHostPort },
  mixins: [TopoItMonitorDevicePortMixin, TopoMapApiRequireMixin, TopoMapConfigMixin, TopoMapPreviewMixin],
  props: {
    /**
     * @description 模式
     * @param mode 值（preview：预览模式 config：配置模式）
     */
    mode: {
      type: String,
      default() {
        return 'config'
      }
    },
    /**
     * @description 拓扑信息
     * @param topoInfo
     */
    topoInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * @description 预览地图
     * @param mapPreview 值（true：开启 false：关闭）
     */
    mapPreview: {
      type: Boolean,
      default() {
        return true
      }
    },
    // 是否显示网格背景
    mapGridBg: {
      type: Boolean,
      default() {
        return true
      }
    },
    /**
     * @description 实例配置
     * @param mapConfig G6实例配置
     */
    mapConfig: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * @description 实例配置
     * @param mapConfig G6节点
     */
    mapNodes: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * @description 实例配置
     * @param mapEdges G6链路
     */
    mapEdges: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * @description 实例配置
     * @param mapCombos G6分组
     */
    mapCombos: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * @description 样式配置
     * @param styleOptions 样式配置
     */
    styleOptions: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      topoGraph: null, // G6实例
      topoMapData: { // 拓扑图数据
        combos: [], // 分组
        nodes: [], // 节点
        edges: [] // 链路
      },
      handlerEdge: {}, // 点击的链路
      handlerNode: {}, // 点击的节点
      handlerCombo: {}, // 点击的分组
      topoIco: [ // 预定义元素默认icon
        { devTypeId: 484, ico: 'image/topo/topo_item_define_icon/3D-交换机2.png' },
        { devTypeId: 483, ico: 'image/topo/topo_item_define_icon/磁盘阵列.png' },
        { devTypeId: 482, ico: 'image/topo/topo_item_define_icon/堆叠交换机.png' },
        { devTypeId: 481, ico: 'image/topo/topo_item_define_icon/3D-交换机.png' },
        { devTypeId: 480, ico: 'image/topo/topo_item_define_icon/核心交换机.png' },
        { devTypeId: 479, ico: 'image/topo/topo_item_define_icon/3D-服务器2.png' },
        { devTypeId: 478, ico: 'image/topo/topo_item_define_icon/3D-虚拟资源.png' },
        { devTypeId: 477, ico: 'image/topo/topo_item_define_icon/存储.png' }
      ],
      // fn：获取端口的方法 getDetailFn：获取设备详情的方法
      itMonitorDeviceInGetPortFn: [
        { devTypeId: 490, fn: 'GetSDWANDevicePort', getDetailFn: 'GetSDWANDeviceDetail' }, // sdwan
        { devTypeId: 484, fn: 'GetOperatingSystemPort', getDetailFn: 'GetOperatingSystemDetail' }, // 操作系统
        { devTypeId: 483, fn: 'GetDBPort', getDetailFn: 'GetDBDetail' }, // 数据库
        // { devTypeId: 482, fn: '' }, // 中间件
        { devTypeId: 481, fn: 'GetNetWorkDevicePort', getDetailFn: 'GetNetWorkDeviceDetail' }, // 网络设备
        // { devTypeId: 480, fn: '' }, // 应用软件
        { devTypeId: 479, fn: 'GetServiceDevicePort', getDetailFn: 'GetServiceDeviceDetail' }, // 服务设备
        { devTypeId: 478, fn: 'GetVirtualDevicePort', getDetailFn: 'GetVirtualDeviceDetail' } // 虚拟资源
        // { devTypeId: 477, fn: '' } // 存储设备
      ]
    }
  },
  computed: {
    setAbbreviations() {
      return function(portName) {
        if (!portName) return
        const idx = this.topoPortAbbreviations.findIndex(item => portName.indexOf(item.fullName) !== -1) // 匹配缩写
        if (idx === -1) return portName
        const suffix = portName.split(`${this.topoPortAbbreviations[idx].fullName}`)[1] // 截取匹配字符后的字符
        return this.topoPortAbbreviations[idx].abbreviations + suffix
      }
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  mounted() {
    this.$EventBus.$on('monitorHandlerTool', (val) => {
      this.toolType = val
    })
    this.$EventBus.$on('emitActionStyle', (val) => {
      if (val.mapType === 'combo') this.selectGroupShape = val.value
    })
  },
  methods: {
    // 组装数据
    async generateData() {
      // 链路类型
      this.connectLineTypeList = connectLineTypeList()
      // 分组图形
      this.topoShape = topoShape()
      // 端口缩写
      this.topoPortAbbreviations = topoPortAbbreviations()

      // 节点分组
      const comboItems = []
      this.mapCombos.forEach(item => {
        const idx = this.topoShape.findIndex(items => Number(items.value) === Number(item.groupType))
        comboItems.push({
          id: `combo-${item.id}`,
          type: this.topoShape[idx === -1 ? 0 : idx].shapeTypeValue,
          style: { fill: item.groupColor },
          label: item.groupName,
          labelCfg: { position: 'bottom' }
        })
      })
      this.$set(this.topoMapData, 'combos', comboItems)

      // 获取节点
      const topoItem = []
      const hostIds = []
      this.mapNodes.forEach(item => {
        item.id = String(item.id)
        if (item.hostId) hostIds.push(item.hostId)
        const topoItemGraph = {
          id: item.id,
          x: item.x,
          y: item.y,
          size: [item.width, item.height],
          label: this.formatText(item.itemName, 6),
          userDefineType: item.userDefineType,
          alarmCount: 0
        }
        if (item.userDefineType) { // 自定义节点
          // 自定义标签
          if (item.userDefineType === 1) topoItemGraph.img = item.imageUrl
          // 文本标签
          if (item.userDefineType === 2) {
            if (item.fontBackColor) topoItemGraph.style = { fill: item.fontBackColor }
            topoItemGraph.labelCfg = {
              style: {
                fontSize: item.fontSize || 0,
                fill: this.styleOptions.TopoMap && this.styleOptions.TopoMap.nodeFontColor || item.fontColor || '#000',
                fontWeight: item.fontWeight || 0
              }
            }
          }
          // 设置节点类型
          const topoDiyLabelData = topoDiyLabel()
          const topoDiyLabelIdx = topoDiyLabelData.findIndex(topoDiyLabelItem => topoDiyLabelItem.devType === 'diyLabel')
          if (topoDiyLabelIdx === -1) return
          const diyLabelIdx = topoDiyLabelData[topoDiyLabelIdx].hostList.findIndex(diyLabelItem => Number(diyLabelItem.diyLabelType) === Number(item.userDefineType))
          if (diyLabelIdx === -1) return
          topoItemGraph.type = topoDiyLabelData[topoDiyLabelIdx].hostList[diyLabelIdx].typeValue
        } else { // 非自定义标签
          topoItemGraph.hostId = item.hostId
          topoItemGraph.hyZhostId = item.zhostId
          topoItemGraph.type = 'node—alarm-count'
          topoItemGraph.labelCfg = { position: 'bottom' }
          topoItemGraph.img = item.imageUrl
        }
        if (item.itemGroupId !== 0 && item.itemGroupId !== null) topoItemGraph.comboId = `combo-${item.itemGroupId}`
        if (this.styleOptions.TopoMap) topoItemGraph.nodeFontColor = this.styleOptions.TopoMap.nodeFontColor || ''
        topoItem.push(topoItemGraph)
      })
      this.$set(this.topoMapData, 'nodes', topoItem)

      const sDate = `${this.$tool.dateFormat('Y-m-d', new Date())}`
      const sDateStr = `${this.$tool.dateOperator(`${sDate}`, 30, '-')} 00:00:00`

      let alarmLogStatueCount = []
      if (hostIds.length > 0) alarmLogStatueCount = await this.getAlarmLogStatueCount({ hostIds: hostIds.toString(), status: 0, startCLock: new Date(sDateStr).getTime() / 1000, endClock: new Date(`${sDate} 23:59:59`).getTime() / 1000 })
      if (alarmLogStatueCount.length > 0) {
        alarmLogStatueCount.forEach(aItem => {
          const getTopoItemIdx = this.topoMapData.nodes.findIndex(tItem => Number(tItem.hostId) === Number(aItem.hostId))
          if (getTopoItemIdx !== -1) this.$set(this.topoMapData.nodes[getTopoItemIdx], 'alarmCount', Number(aItem.alarmCount))
        })
      }

      // 3、获取链路
      const edges = []
      this.mapEdges.forEach(item => {
        item.id = String(item.id)
        const topoLineGraph = {
          id: `edge-${item.id}`,
          source: String(item.sourceItemId),
          target: String(item.targetItemId),
          color: '#B7C2CBFF',
          lineAppendWidth: 10,
          linkType: item.linkType,
          sourceZbxItemId: item.sourceZbxItemId,
          targetZbxItemId: item.targetZbxItemId,
          sourceZbxItemName: item.sourceZbxItemName,
          targetZbxItemName: item.targetZbxItemName,
          sourceAgent: item.sourceAgent,
          targetAgent: item.targetAgent
        }

        // 链路数量计算
        const lineCountArr = this.mapEdges.filter(edgeItem => {
          return (edgeItem.sourceItemId === item.sourceItemId && edgeItem.targetZbxItemId === item.targetZbxItemId) || (edgeItem.sourceItemId === item.targetZbxItemId && edgeItem.targetZbxItemId === item.sourceItemId)
        })

        topoLineGraph.lineCount = lineCountArr.length
        const lineIdx = this.connectLineTypeList.findIndex(lineItem => lineItem.value === item.linkType)
        if (lineIdx !== -1) {
          topoLineGraph.style = item.sourceItemStatue === 1 && item.targetItemStatue === 1 ? this.connectLineTypeList[lineIdx].style : {
            stroke: '#ff0000',
            borderType: 'solid'
          }
          topoLineGraph.statue = item.sourceItemStatue === 1 && item.targetItemStatue === 1 ? 1 : 0
        }
        edges.push(topoLineGraph)
      })
      this.$set(this.topoMapData, 'edges', edges)

      // 隐藏提示窗口、关闭定时获取数据定时器
      this.portTooltip = false
      this.itemHostTooltip = false
      window.clearInterval(this.getMonitorDataInterval)
      window.clearInterval(this.showHostEchartsInterval)
    },
    // 初始化拓扑图
    initMap() {
      const that = this
      that.destroyMap()
      // 插件
      const plugins = []
      // 模式
      const modes = ['drag-canvas', 'zoom-canvas']
      let altSelect = []

      // 预览地图配置
      const miniMapOptions = {}
      // 配置模式获取出自定义的mini vue文件
      const topoMiniMapId = document.getElementById('topo-mini-map')
      if (topoMiniMapId) {
        miniMapOptions.container = topoMiniMapId
        miniMapOptions.size = [topoMiniMapId.clientWidth, topoMiniMapId.clientHeight]
      } else {
        miniMapOptions.size = [window.innerWidth / 6, window.innerHeight / 5]
      }
      const minimap = new G6.Minimap(miniMapOptions)
      // 开启地图预览插件
      if (this.mapPreview) plugins.push(minimap)
      // 模式判断
      if (this.mode === 'config') {
        modes.push('drag-node')
        altSelect = [{ type: 'brush-select', trigger: 'drag' }, 'drag-node']
      }

      // 自定义链路配置
      const lineDash = [4, 2, 1, 2]
      G6.registerEdge(
        'line-dash',
        {
          afterDraw(cfg, group) {
            const shape = group.get('children')[0]
            let index = 0

            // 获取路径图形的中点坐标
            const midPoint = shape.getPoint(0.5)

            if (that.mode === 'preview') {
              group.addShape('text', {
                attrs: {
                  text: cfg.lineCount,
                  fill: '#595959',
                  textAlign: 'start',
                  textBaseline: 'middle',
                  x: midPoint.x - 5,
                  y: midPoint.y - 5
                },
                name: 'left-text-shape'
              })
            }

            shape.animate(
              () => {
                index++
                if (index > 9) {
                  index = 0
                }
                const res = {
                  lineDash,
                  lineDashOffset: -index
                }
                return res
              },
              {
                repeat: true,
                duration: 3000
              }
            )
          }
        },
        'line'
      )

      // 自定义节点
      G6.registerNode(
        'node—alarm-count', {
          jsx: (cfg) => `
            <group>
              <rect style={{
                width: 50, height: 50
              }}>
                <image style={{ img: {{img}}, width: 50, height: 50 }} draggable="true" />
                <rect style={{
                  width: 50, height: 20
                }} draggable="true">
                  <text style={{
                    width: 50, height: 20, fontWeight: 'bold', marginLeft: 25, textAlign: 'center', fill: {{nodeFontColor}}
                  }}>{{label}}</text>
                </rect>
                <circle style={{
                  stroke: '#f00',
                  r: 10,
                  fill: '#f00',
                  cursor: 'pointer',
                  marginTop: -40,
                  marginLeft: 50,
                  opacity: ${cfg.alarmCount ? 1 : 0}
                }} name="circle">
                  <text style={{fill: '#fff', fontSize: 14, marginLeft: 45, marginTop: -10, opacity: ${cfg.alarmCount ? 1 : 0}}}>{{alarmCount}}</text>
                </circle>
              </rect>
            </group>`
        }
      )

      // 实例化元素配置
      this.topoGraph = new G6.Graph({
        container: 'topoMap', // 视图区域DOM
        width: this.mapConfig.width,
        height: this.mapConfig.height,
        defaultEdge: { // 线条默认配置
          // type: 'line-dash',
          color: '#B7C2CBFF',
          lineAppendWidth: 10,
          style: { lineWidth: 3 }
        },
        defaultNode: { // 节点默认配置
          size: [40, 40]
        },
        modes: { // 模式
          default: modes,
          altSelect
        },
        plugins,
        animate: true // 开启动画过渡
      })
      // 根据数据创建图
      this.topoGraph.data(this.topoMapData)
      // 加载
      this.topoGraph.render()
      // 进入中心
      this.topoGraph.fitCenter()
      // 拓扑图位置
      this.graphCenterPoint = that.topoGraph.getGraphCenterPoint()

      // 点击画图区域空白处
      this.topoGraph.on('canvas:click', function() {
        that.handlerItemType = ''
        that.clearElStatus()
        if (that.mode === 'preview') {
          that.showHostDetail = false
          that.showLineDetail = false
        }
      })

      // 拖拽画布结束
      this.topoGraph.on('canvas:dragend', function(evt) {
        that.isNodeSelectChange = false
        if (that.lastDragendTimeStamp !== evt.timeStamp && !that.isNodeSelectChange) {
          that.lastDragendTimeStamp = evt.timeStamp
          that.lastNowPointValues = { ...that.nowPointValues }
          that.nowPointValues = {
            x: parseInt((that.topoGraph.getGraphCenterPoint().x - that.graphCenterPoint.x) * that.topoGraph.getZoom()),
            y: parseInt((that.topoGraph.getGraphCenterPoint().y - that.graphCenterPoint.y) * that.topoGraph.getZoom())
          }
        }
        if (that.mode === 'preview') {
          that.showHostDetail = false
          that.showLineDetail = false
        }
      })

      // 移入元素节点
      this.topoGraph.on('node:mouseover', function(evt) {
        that.handlerItemType = 'node'
        that.handlerNode = evt.item
        that.handlerNodeStyle = { ...evt.item._cfg.model }
        if (evt.item._cfg.model.hostId && that.mode === 'preview') {
          that.showHostDetail = true
          that.setHostDetail(evt)
        }
      })
      // 移出元素节点
      this.topoGraph.on('node:mouseleave', function(evt) {
        that.showHostDetail = false
      })
      // 点击元素节点
      this.topoGraph.on('node:click', function(evt) {
        that.handlerItemType = 'node'
        that.handlerNode = evt.item
        that.handlerNodeStyle = { ...evt.item._cfg.model }
        that.$emit('handlerItem', {
          handlerItemType: 'node',
          handlerNode: evt.item,
          handlerNodeStyle: { ...evt.item._cfg.model }
        })
        that.$emit('handlerNode', {
          handlerNode: evt.item
        })
        if (evt.item._cfg.model.hostId && that.mode === 'preview') {
          that.showHostDetail = true
          that.setHostDetail(evt)
        }
      })
      // 节点拖拽结束 修改节点的位置
      this.topoGraph.on('node:dragend', async function(evt) {
        that.handlerItemType = ''
        // 批量修改图上节点
        if (that.nowPointValues.x && that.nowPointValues.y) {
          if (that.lastInsertTopoItemPointValues.x && that.lastInsertTopoItemPointValues.y) {
            if (that.lastInsertTopoItemPointValues.x !== that.nowPointValues.x && that.lastInsertTopoItemPointValues.y !== that.nowPointValues.y) {
              that.lastInsertTopoItemPointValues = { ...that.nowPointValues }
              await that.saveTopoGraph()
            }
          } else {
            that.lastInsertTopoItemPointValues = { ...that.nowPointValues }
            await that.saveTopoGraph()
          }
        }
        that.updateHyitTopologyItem({
          id: evt.item._cfg.model.id,
          x: parseInt(evt.item._cfg.model.x + (that.nowPointValues.x || 0)),
          y: parseInt(evt.item._cfg.model.y + (that.nowPointValues.y || 0))
        }, null).then(() => {
          // 如果当前的元素样式被选中
          if (that.handlerNodeStyle && that.handlerNodeStyle.id === evt.item._cfg.model.id) that.handlerNodeStyle = { ...evt.item._cfg.model }
        })
        if (evt.item._cfg.model.comboId) { // 移入分组
          const comboIdSplit = evt.item._cfg.model.comboId.split('-')
          that.updateHyitTopologyItemGroupValue({ itemIds: evt.item._cfg.model.id, itemGroupId: comboIdSplit[1], id: 0 })
        } else { // 移出分组
          that.updateHyitTopologyItemGroupValue({ itemIds: evt.item._cfg.model.id, itemGroupId: 0, id: 0 })
        }
      })
      // 右击节点
      this.topoGraph.on('node:contextmenu', function(evt) {
        that.contextmenuSelectId = evt.item._cfg.id
        evt.preventDefault()
        that.showConextMenu = true
        that.menuLeft = evt.canvasX
        that.menuTop = evt.canvasY
      })
      // 框选节点
      this.topoGraph.on('nodeselectchange', async(evt) => {
        that.isNodeSelectChange = true
        that.selectChangeNodes = []
        that.setElStatus(evt.selectedItems.nodes)
        if (evt.selectedItems.nodes.length > 1) {
          that.disabledTool = []
        }
        that.selectChangeNodes = evt.selectedItems.nodes
        if (that.toolType === 'combo') {
          if (evt.selectedItems.nodes.length === 0) return that.$message('请选择要款选的节点')
          const nodeIds = []
          // 过滤掉已经有分组的节点
          evt.selectedItems.nodes.forEach(item => {
            // if (!item._cfg.model.comboId) nodeIds.push(item._cfg.id)
            nodeIds.push(item._cfg.id)
          })
          // 新建分组
          const crateGroup = await that.insertHyitTopologyItemGroup({
            topId: this.topoInfo.id, groupType: that.selectGroupShape.value, groupColor: that.selectGroupShape.selectGroupBg, groupName: '分组'
          })
          if (crateGroup.code === 0) return
          // 给节点绑定分组id
          const bindTopoItemGroup = await this.updateHyitTopologyItemGroupValue({
            itemIds: nodeIds.toString(), itemGroupId: crateGroup.model.id, id: 0
          })
          if (bindTopoItemGroup.code === 0) return
          // 创建分组节点
          const createElData = {
            id: `combo-${crateGroup.model.id}`,
            type: that.selectGroupShape.shapeTypeValue,
            style: { fill: that.selectGroupShape.selectGroupBg },
            label: '分组',
            labelCfg: { position: 'bottom' }
          }
          that.topoGraph.createCombo(createElData, nodeIds)
          that.addMapElItem('combos', createElData)
          that.clearElStatus()
        }
      })

      // 右击链路
      this.topoGraph.on('edge:contextmenu', function(evt) {
        that.contextmenuSelectId = evt.item._cfg.id
        evt.preventDefault()
        that.showConextMenu = true
        that.menuLeft = evt.canvasX
        that.menuTop = evt.canvasY
      })
      // 节点完成连线
      this.topoGraph.on('aftercreateedge', (e) => {
        if (e.edge._cfg.sourceNode._cfg.model.type === 'rect' || e.edge._cfg.targetNode._cfg.model.type === 'rect') {
          setTimeout(() => {
            that.topoGraph.removeItem(e.edge)
          }, 100)
          that.$message('文本标签不可以进行链路连接')
          return
        }
        Object.keys(this.topoLineForm).forEach(key => {
          this.$set(this.topoLineForm, `${key}`, '')
        })
        that.handlerEdge = e.edge
        that.showDialog = true
        that.$set(that.topoLineForm, 'topId', that.topoInfo.id)
        that.$set(that.topoLineForm, 'sourceItemId', e.edge._cfg.sourceNode._cfg.model.id)
        that.$set(that.topoLineForm, 'targetItemId', e.edge._cfg.targetNode._cfg.model.id)
        that.$set(that.topoLineForm, 'linkType', that.mapLineTypeValue)

        that.sourcePortLabel = `${e.edge._cfg.sourceNode._cfg.model.label}端口`
        that.targetPortLabel = `${e.edge._cfg.targetNode._cfg.model.label}端口`

        that.getHostSetPortList(e.edge._cfg.sourceNode._cfg.model.hostId, null, 'sourceHostPortList')
        that.getHostSetPortList(e.edge._cfg.targetNode._cfg.model.hostId, null, 'targetHostPortList')

        const edges = that.topoGraph.save().edges
        // G6.Util.processParallelEdges(edges)
        that.topoGraph.getEdges().forEach((edge, i) => {
          that.topoGraph.updateItem(edge, {
            curveOffset: edges[i].curveOffset,
            curvePosition: edges[i].curvePosition
          })
        })
      })
      // 点击线节点
      this.topoGraph.on('edge:click', function(evt) {
        // 用节点的起始节点去获取节点存储的主机信息
        const sourceHostItem = that.topoGraph.findById(evt.item._cfg.model.source)
        const targetHostItem = that.topoGraph.findById(evt.item._cfg.model.target)
        that.$emit('handlerItem', {
          handlerItemType: 'line',
          handlerEdge: evt.item,
          sourceHostItem,
          targetHostItem
        })
        that.$emit('handlerEdge', {
          handlerEdge: evt.item
        })
        if (that.mode === 'preview') {
          that.showLineDetail = true
          const target = evt.item._cfg.model.target
          const source = evt.item._cfg.model.source
          const edges = []
          that.topoMapData.edges.forEach(edgeItem => {
            if (Number(edgeItem.target) === Number(target) && Number(edgeItem.source) === Number(source)) {
              edges.push(edgeItem)
            }
            if (Number(edgeItem.target) === Number(source) && Number(edgeItem.source) === Number(target)) {
              edges.push(edgeItem)
            }
          })
          that.subNodes = [sourceHostItem._cfg.model, targetHostItem._cfg.model]
          that.subEdges = edges
          that.$nextTick(() => {
            that.$refs.topoLineDetailDialog.openLineDetail()
          })
        }
      })

      // 右击分组
      this.topoGraph.on('combo:contextmenu', (evt) => {
        that.contextmenuSelectId = evt.item._cfg.id
        evt.preventDefault()
        that.showConextMenu = true
        that.menuLeft = evt.canvasX
        that.menuTop = evt.canvasY
      })
      // 点击分组
      this.topoGraph.on('combo:click', (evt) => {
        that.handlerCombo = evt.item
        const idx = that.topoShape.findIndex(item => item.shapeTypeValue === evt.item._cfg.model.type)
        const id = evt.item._cfg.model.id.split('-')[1]
        that.handlerItemType = 'combo'
        that.$emit('handlerItem', {
          handlerItemType: 'combo',
          handlerCombo: evt.item,
          handlerComboStyle: {
            id: id,
            groupColor: evt.item._cfg.model.style.fill,
            groupType: that.topoShape[idx].value,
            groupName: evt.item._cfg.model.label
          }
        })
      })
    },
    // 卸载实例
    async destroyMap() {
      if (this.topoGraph) return this.topoGraph.destroy()
    },
    // 监听生成拓扑图图片
    downloadTopoMap() {
      this.topoGraph.downloadFullImage(`${this.topoInfo.name}网络拓扑图`, 'image/png', {
        backgroundColor: '#ddd',
        padding: [30, 30, 30, 30]
      })
    },
    // 关闭节点主机
    closeHostDetail() {
      this.showHostDetail = false
    },
    // 截断长文本。length 为文本截断后长度，elipsis 是后缀
    formatText(text, length = 6, elipsis = '...') {
      if (!text) return ''
      if (text.length > length) {
        return `${text.substr(0, length)}${elipsis}`
      }
      return text
    }
  }
}
</script>

<style lang="scss" scoped>
.topo-map-component {
  position: relative;
}
.mapGridBg {
  background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=);
}
</style>
