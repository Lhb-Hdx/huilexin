<template>
  <div ref="appContainer" class="app-container">
    <div ref="filterContainer" class="filter-container margin-bottom-10">
      <el-page-header :content="navTitle" @back="$router.go(-1)" />
      <div class="action-buttons top-tool-bar">
        <template v-for="(item, index) in toolBar">
          <el-tooltip :key="index" class="item" effect="dark" :content="item.tip" placement="top">
            <el-button
              :disabled="disabledTool.indexOf(item.methodType) !== -1"
              class="tool-item"
              :class="toolType === item.methodType && (item.methodType === 'pointer' || item.methodType === 'select') ? 'active-item' : ''"
              type="text"
              :style="{ opacity: disabledTool.indexOf(item.methodType) !== -1 ? '0.4' : 1}"
              @click="onClickTool(item.methodType)"
            >
              <i v-if="item.iconType !== 'img'" :class="item.icon" :style="item.style ? item.style : {}" />
              <img v-if="item.iconType === 'img'" :src="item.icon" alt="">
            </el-button>
          </el-tooltip>
        </template>
      </div>
    </div>
    <div class="config-content">
      <div class="config-content-left" :style="{'height': containerHeight + 'px'}">
        <topo-el @handleDragHostEnd="handleDragEnd" />
      </div>
      <div ref="configContentMain" class="config-content-main" :style="{'height': containerHeight + 'px', 'width': '85%'}">
        <div id="topoMap" />
        <div v-if="showConextMenu" class="conext-menu" :style="{'left': menuLeft + 'px', 'top': menuTop + 'px'}" @mouseout="conextMenuOut">
          <div class="conext-menu pointer" @click="removeNode">删除</div>
        </div>
      </div>
      <div ref="configContentRight" class="config-content-right" :style="{'height': containerHeight + 'px'}">
        <template v-if="handlerElAction === ''">
          <!-- 拓扑图信息 -->
          <map-info-config v-if="handlerItemType === ''" :topo-info="topoInfo" />
          <!-- 节点配置 -->
          <node-config v-if="handlerItemType === 'node'" :el-style="handlerNodeStyle" @updateElStyle="updateElStyle" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import G6 from '@antv/g6'
import request from '@/utils/request'
import api from '@/api/api'
import { connectLineTypeList, topoShape } from '@/utils/define-data'
import './style/configItemStyle.scss'
import NodeConfig from './component/nodeConfig'
import MapInfoConfig from './component/mapInfoConfig'
import TopoEl from './component/topoEl'

export default {
  name: 'TopoConfig',
  components: { NodeConfig, MapInfoConfig, TopoEl },
  data() {
    return {
      topoInfo: { name: '', statues: '' }, // 拓扑信息
      containerHeight: '', // 画布高度
      containerWidth: 0, // 画布高度
      topoGraph: null, // 拓扑元素实例
      showConextMenu: false, // 显示右击菜单
      contextmenuSelectId: '', // 右击选择的元素id
      topoIco: [ // 预定义元素默认icon
        { userDefineType: 2, ico: 'image/topo/topo_server.png' },
        { userDefineType: 3, ico: 'image/topo/topo_virtual.png' }
      ],
      handlerEdge: {}, // 点击的链路
      handlerNode: {}, // 点击的节点
      handlerNodeStyle: {}, // 存储点击的节点样式
      connectLineTypeList: [], // 链路类型列表
      topoLineItems: [], // 获取线条元素
      topoMapData: {}, // 拓扑图元素数据
      handlerItemType: '', // 点击元素类型 节点或者线条
      mapLineTypeValue: '', // 选择的链路类型
      isOnCreateSuccess: false, // 新增链路成功标识 如果没有新增成功关闭弹窗要删除图上的线条
      isOnBrushSelect: false, // 当前为框选状态
      topoShape: [], // 拓扑图形
      handlerElAction: '',
      graphCenterPoint: {}, // 初始化时存储画布x、y轴
      nowPointValues: {}, // 当前时存储画布x、y轴偏移量
      toolBar: [
        { icon: 'image/topo/tool-bar-pointer-icon.png', tip: '指针', methodType: 'pointer', iconType: 'img', disabled: false },
        { icon: 'image/topo/tool-bar-select-icon.png', tip: '选择', methodType: 'select', iconType: 'img', disabled: false },
        { icon: 'el-icon-zoom-in', tip: '放大', methodType: 'zoom-in', disabled: false },
        { icon: 'el-icon-zoom-out', tip: '缩小', methodType: 'zoom-out', disabled: false },
        { icon: 'el-icon-refresh-left', tip: '复原', methodType: 'refresh', disabled: false },
        { icon: 'el-icon-sort', tip: '垂直对齐', methodType: 'vertical', disabled: true },
        { icon: 'el-icon-sort', tip: '水平对齐', methodType: 'horizontal', style: { transform: 'rotate(90deg)' }, disabled: true },
        { icon: 'image/topo/link-btn-icon.png', tip: '链路连接', methodType: 'link', iconType: 'img', disabled: true },
        { icon: 'el-icon-download', tip: '下载', methodType: 'download' }
      ],
      toolType: '', // 当前工具栏选择类型
      disabledTool: ['vertical', 'horizontal', 'combo'],
      selectChangeNodes: [], // 存储每次鼠标框选的元素
      elPositionData: [], // 需要修改位置的元素
      isNodeSelectChange: false,
      upPositionLinkEl: [], // 需要更新的链路节点
      handleDragEndNode: {},
      handleDragEndNodeData: {}
    }
  },
  computed: {
    id() { return this.$route.query.id },
    navTitle() { return this.$route.meta.title }
  },
  async mounted() {
    // 获取预定义数据
    this.connectLineTypeList = connectLineTypeList()
    this.topoShape = topoShape()
    // 设置内容区域高度宽度
    this.containerHeight = this.$refs.appContainer.clientHeight - 30 - this.$refs.filterContainer.clientHeight
    this.containerWidth = this.$refs.configContentMain.clientWidth
    // 添加监听点击
    document.addEventListener('click', (e) => {
      if (!this.$refs.configContentMain) return
      const isConfigContentWrap = this.$refs.configContentMain.contains(e.target)
      const isConfigRightMenu = this.$refs.configContentRight.contains(e.target)
      if (!isConfigContentWrap && !isConfigRightMenu) {
        this.handlerItemType = ''
        this.clearElStatus()
      }
    })
    // 数据获取
    if (this.id) {
      // 获取拓扑信息
      this.topoInfo = await this.getHyitTopologyInfo() || {}
      // 1、获取节点
      const topoItemResult = await this.findBsTopItem() || []
      const topoItem = []
      topoItemResult.forEach(item => {
        item.id = String(item.id)
        topoItem.push({
          id: item.id,
          x: item.x,
          y: item.y,
          size: [item.width, item.height],
          label: item.itemName,
          hostId: item.hostId,
          hyZhostId: item.hyZhostId,
          type: 'image',
          labelCfg: { position: 'bottom' },
          img: item.imageUrl,
          ip: item.ip,
          port: item.port,
          checkPort: item.checkPort,
          agent: item.agent
        })
      })
      this.$set(this.topoMapData, 'nodes', topoItem)
      // 2、获取节点链路
      this.topoLineItems = await this.findBsTopItemLink() || []
      const edges = []
      this.topoLineItems.forEach(item => {
        item.id = String(item.id)
        edges.push({
          id: `edge-${item.id}`,
          source: String(item.sourceItemId),
          target: String(item.targetItemId)
        })
      })
      this.$set(this.topoMapData, 'edges', edges)
      await this.initMap()
      this.topoGraph.fitView()
    }
  },
  methods: {
    // 初始化topo图
    async initMap() {
      const that = this
      // 实例化配置
      this.topoGraph = new G6.Graph({
        container: 'topoMap', // 视图区域DOM
        width: this.containerWidth,
        height: this.containerHeight,
        defaultEdge: { // 线条默认配置
          color: '#B7C2CBFF',
          lineAppendWidth: 10,
          style: { lineWidth: 3 }
        },
        defaultNode: { // 节点默认配置
          size: [40, 40]
        },
        modes: { // 模式
          default: ['drag-canvas', 'drag-node'],
          altSelect: [{ type: 'brush-select', trigger: 'drag' }, 'drag-node']
        },
        animate: true
      })

      this.topoGraph.data(this.topoMapData)
      G6.Util.processParallelEdges(this.topoMapData.edges) // 多边渲染
      this.topoGraph.render()
      this.graphCenterPoint = that.topoGraph.getGraphCenterPoint()
      // 画图区域空白处
      this.topoGraph.on('canvas:click', function() {
        that.handlerItemType = ''
        that.clearElStatus()
      })
      // 拖拽画布结束
      this.topoGraph.on('canvas:dragend', function() {
        if (!that.isNodeSelectChange) {
          that.nowPointValues = {
            x: parseInt(that.topoGraph.getGraphCenterPoint().x - that.graphCenterPoint.x),
            y: parseInt(that.topoGraph.getGraphCenterPoint().y - that.graphCenterPoint.y)
          }
        }
        that.isNodeSelectChange = false
        if (that.nowPointValues.x && that.nowPointValues.y) that.saveTopoGraph()
      })

      // 点击元素节点
      this.topoGraph.on('node:click', function(evt) {
        that.handlerItemType = 'node'
        that.handlerNode = evt.item
        that.handlerNodeStyle = { ...evt.item._cfg.model }
      })
      // 节点拖拽结束 修改节点的位置
      this.topoGraph.on('node:dragend', function(evt) {
        that.handlerItemType = ''
        const upData = {
          id: evt.item._cfg.model.id,
          x: parseInt(evt.item._cfg.model.x),
          y: parseInt(evt.item._cfg.model.y)
        }
        if (evt.item._cfg.model.agent) upData.agent = evt.item._cfg.model.agent
        that.updateBsTopItem(upData, null).then(() => {
          // 如果当前的元素样式被选中
          if (that.handlerNodeStyle.id === evt.item._cfg.model.id) that.handlerNodeStyle = { ...evt.item._cfg.model }
        })
      })
      // 右击节点
      this.topoGraph.on('edge:contextmenu', function(evt) {
        that.contextmenuSelectId = evt.item._cfg.id
        evt.preventDefault()
        that.showConextMenu = true
        that.menuLeft = evt.canvasX
        that.menuTop = evt.canvasY
      })
      // 框选节点
      this.topoGraph.on('nodeselectchange', async(evt) => {
        that.isNodeSelectChange = true
        this.selectChangeNodes = []
        that.setElStatus(evt.selectedItems.nodes)
        if (evt.selectedItems.nodes.length > 1) {
          that.disabledTool = []
        }
        that.selectChangeNodes = evt.selectedItems.nodes
      })

      // 右击线条
      this.topoGraph.on('node:contextmenu', function(evt) {
        that.contextmenuSelectId = evt.item._cfg.id
        evt.preventDefault()
        that.showConextMenu = true
        that.menuLeft = evt.canvasX
        that.menuTop = evt.canvasY
      })
      // 节点完成连线
      this.topoGraph.on('aftercreateedge', async(e) => {
        that.handlerEdge = e.edge
        const edges = that.topoGraph.save().edges
        G6.Util.processParallelEdges(edges)
        if (e.edge._cfg.sourceNode._cfg.model.id === e.edge._cfg.targetNode._cfg.model.id) {
          setTimeout(() => {
            that.topoGraph.removeItem(that.handlerEdge)
          }, 100)
          return
        }
        that.topoGraph.getEdges().forEach((edge, i) => {
          that.topoGraph.updateItem(edge, {
            curveOffset: edges[i].curveOffset,
            curvePosition: edges[i].curvePosition
          })
        })
        const createLink = await this.insertBsTopItemLink({
          systemId: that.id,
          sourceItemId: e.edge._cfg.sourceNode._cfg.model.id,
          targetItemId: e.edge._cfg.targetNode._cfg.model.id
        })
        if (createLink.code === 1) {
          this.$message({ type: 'success', message: createLink.msg })
        } else {
          that.topoGraph.removeItem(that.handlerEdge)
        }
      })
    },

    // 获取拓扑信息
    async getHyitTopologyInfo() {
      return new Promise(resolve => {
        request({
          url: api.bsTopSystem.getBsTopSystem,
          data: { id: this.id }
        }).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },

    // 监听结束拖拽生成
    async handleDragEnd(val) {
      const { e, item } = val
      const configContentMainTop = this.$refs.configContentMain.getBoundingClientRect().top
      const configContentMainLeft = this.$refs.configContentMain.getBoundingClientRect().left
      const configContentMainWidth = this.$refs.configContentMain.clientWidth
      const configContentMainHeight = this.$refs.configContentMain.clientHeight
      if (
        (e.clientX > configContentMainLeft && e.clientY > configContentMainTop) &&
        ((e.clientX < (configContentMainLeft + configContentMainWidth)) && (e.clientY < (configContentMainTop + configContentMainHeight)))
      ) {
        const topoItemGraph = { // 节点配置
          type: 'image',
          x: parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).x),
          y: parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).y),
          size: [40, 40], // 元素宽高
          label: item.hostName,
          ip: item.ip || '',
          port: item.port || '',
          checkPort: 1
        }
        const idx = this.topoIco.findIndex(items => items.userDefineType === item.userDefineType)
        topoItemGraph.img = idx !== -1 ? this.topoIco[idx].ico : 'image/topo/topo_storage.png'
        if (item.userDefineType !== 8) topoItemGraph.hostId = item.hostId
        if (item.userDefineType !== 8 && item.hyZhostId) topoItemGraph.zhostId = item.hyZhostId
        if (item.userDefineType !== 8 && item.agent) topoItemGraph.agent = item.agent
        topoItemGraph.labelCfg = { position: 'bottom' }
        const data = {
          systemId: this.id,
          itemName: topoItemGraph.label,
          width: topoItemGraph.size[0],
          height: topoItemGraph.size[1],
          x: this.nowPointValues.x ? parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).x - this.topoGraph.getPointByClient(this.nowPointValues.x, this.nowPointValues.y).x) : parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).x),
          y: this.nowPointValues.y ? parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).y - this.topoGraph.getPointByClient(this.nowPointValues.x, this.nowPointValues.y).y) : parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).y),
          imageUrl: topoItemGraph.img,
          userDefineType: item.userDefineType,
          ip: item.ip || '',
          port: item.port || '',
          checkPort: 1
        }
        if (topoItemGraph.hostId) data.hostId = topoItemGraph.hostId
        if (topoItemGraph.zhostId) data.zhostId = topoItemGraph.zhostId
        if (topoItemGraph.agent) data.agent = topoItemGraph.agent
        if (topoItemGraph.userDefineType) data.userDefineType = topoItemGraph.userDefineType
        this.handleDragEndNode = topoItemGraph
        this.handleDragEndNodeData = data
        const createNode = await this.insertBsTopItem(data)
        if (createNode.code === 1) {
          this.$message({ type: 'success', message: createNode.msg })
          topoItemGraph.id = String(createNode.model.id)
          this.topoGraph.addItem('node', topoItemGraph)
          this.addMapElItem('nodes', topoItemGraph)
        } else {
          this.$message({ type: 'error', message: createNode.msg })
        }
      }
    },

    // 移出右键菜单
    conextMenuOut() {
      this.showConextMenu = false
    },
    // 点击删除图上的元素
    removeNode() {
      const item = this.topoGraph.findById(this.contextmenuSelectId)
      this.showConextMenu = false
      this.deleteHyitTopologyItem(item)
    },

    // 删除元素
    async deleteHyitTopologyItem(item) {
      const elType = item._cfg.type
      const id = item._cfg.model.id
      if (elType === 'node') { // 节点
        // 删除节点查询出线条数据中包含了起点或者目标是该节点线条
        const deleteTopoNodeResult = await this.deleteTopoNode({ id })
        if (deleteTopoNodeResult.code === 1) this.topoGraph.removeItem(item)
        // 删除实例上的节点元素
        this.deleteMapElItem('nodes', [id])
        // 如果删除的节点有链路连接，要把链路也删除
        const lineIds = [] // 要删除的链路数据
        const elLineIds = [] // 要从实例上删除的
        this.topoMapData.edges.forEach(lineItem => {
          if (Number(lineItem.source) === Number(id) || Number(lineItem.target) === Number(id)) {
            lineIds.push(lineItem.id.split('-')[1])
            elLineIds.push(lineItem.id)
          }
        })
        // 多条链路删除
        if (lineIds.length > 1) await this.deleteTopoLines({ ids: lineIds.toString() })
        // 单条链路删除
        if (lineIds.length === 1) await this.deleteTopoLine({ id: lineIds.toString() })
        // 从实例上删除链路
        if (elLineIds.length > 0) this.deleteMapElItem('edges', elLineIds)
      } else if (elType === 'edge') { // 线条
        const deleteTopoLineResult = await this.deleteTopoLine({ id: id.split('-')[1] })
        if (deleteTopoLineResult.code === 0) return
        this.topoGraph.removeItem(item)
        this.deleteMapElItem('edges', [id])
      }
    },

    // 导出拓扑图
    downloadTopoMap() {
      this.topoGraph.downloadFullImage(`${this.topoInfo.name}网络拓扑图`, 'image/png', {
        backgroundColor: '#ddd',
        padding: [30, 30, 30, 30]
      })
    },

    // 保存画布尺寸
    async saveTopoGraph() {
      await this.updateBsTopItemXY({
        systemId: this.id,
        x: this.nowPointValues.x,
        y: this.nowPointValues.y
      })
    },

    // 点击工具栏
    async onClickTool(type) {
      const zoom = this.topoGraph.getZoom()
      this.toolType = type
      // 放大
      if (type === 'zoom-in') this.topoGraph.zoomTo(zoom + 0.1)
      // 缩小
      if (type === 'zoom-out') this.topoGraph.zoomTo(zoom - 0.1)
      // 复原
      if (type === 'refresh') this.topoGraph.fitView()
      // 保存
      if (type === 'check') {
        if (this.elPositionData.length > 0) await this.updateBsTopItemXY2({ json: JSON.stringify(this.elPositionData) })
        if (this.nowPointValues.x && this.nowPointValues.y) this.saveTopoGraph()
      }
      // 下载
      if (type === 'download') this.downloadTopoMap()
      // 指针
      if (type === 'pointer') {
        this.disabledTool = ['vertical', 'horizontal', 'combo']
        this.topoGraph.removeBehaviors('create-edge', 'default')
        this.topoGraph.setMode('default')
        this.handlerElAction = ''
      }
      // 选择
      if (type === 'select') {
        this.topoGraph.setMode('altSelect')
        this.disabledTool = ['vertical', 'horizontal']
      }
      // 链路
      if (type === 'link') {
        if (this.handlerElAction === 'link') return
        this.handlerElAction = 'link'
        this.topoGraph.addBehaviors('create-edge', 'default')
      }
      // 分组
      if (type === 'combo') {
        this.handlerElAction = 'combo'
      }
      // 垂直对齐
      if (type === 'vertical') {
        await this.onUpdateElAlignPosition('x')
        await this.updateBsTopItemXY2({ json: JSON.stringify(this.elPositionData) })
        this.elPositionData = []
        this.upPositionLinkEl.forEach(item => {
          const getEdges = item.getEdges()[0]
          this.topoGraph.refreshItem(getEdges._cfg.id)
        })
      }
      // 水平对齐
      if (type === 'horizontal') {
        await this.onUpdateElAlignPosition('y')
        await this.updateBsTopItemXY2({ json: JSON.stringify(this.elPositionData) })
        this.elPositionData = []
        this.upPositionLinkEl.forEach(item => {
          const getEdges = item.getEdges()[0]
          this.topoGraph.refreshItem(getEdges._cfg.id)
        })
      }
    },

    /**
     * @description 删除拓扑图实例元数据
     * @param elType 元素类型 nodes：节点 edges：链路 combos：节点分组
     * @param elIds 元素id 可多个
     */
    deleteMapElItem(elType, elIds) {
      // 避免不存在属性报错
      if (!Object.prototype.hasOwnProperty.call(this.topoMapData, `${elType}`)) return
      if (elIds.length === 0) return
      elIds.forEach(item => {
        const itemIdx = this.topoMapData[`${elType}`].findIndex(elItem => String(elItem.id) === String(item))
        if (itemIdx !== -1) this.topoMapData[`${elType}`].splice(itemIdx, 1)
      })
    },

    /**
     * @description 拓扑图实例添加元素
     * @param elType 元素类型 nodes：节点 edges：链路 combos：节点分组
     * @param elData 添加的元素数据
     */
    addMapElItem(elType, elData) {
      // 避免不存在属性报错
      if (!Object.prototype.hasOwnProperty.call(this.topoMapData, `${elType}`)) return
      this.$set(this.topoMapData[`${elType}`], this.topoMapData[`${elType}`].length, elData)
    },

    // 清除元素状态
    clearElStatus() {
      // 清除状态
      this.topoGraph.getCombos().forEach((combo) => {
        this.topoGraph.clearItemStates(combo)
      })
      this.topoGraph.getNodes().forEach((node) => {
        this.topoGraph.clearItemStates(node)
        node.update({
          labelCfg: {
            style: {
              fill: '#000',
              fontWeight: 500
            }
          }
        })
      })
    },

    // 设置元素选择样式
    setElStatus(nodes) {
      nodes.forEach(nodeItem => {
        nodeItem.update({
          labelCfg: {
            style: {
              fill: '#0145AB',
              fontWeight: 500
            }
          }
        })
      })
    },

    async onUpdateElAlignPosition(positionType) {
      return new Promise(resolve => {
        const position = []
        this.upPositionLinkEl = []
        this.selectChangeNodes.forEach(item => position.push(item._cfg.model[`${positionType}`]))
        const maxPosition = Math.max(...position)
        const minPosition = Math.min(...position)
        const setPosition = (maxPosition & minPosition) + ((maxPosition ^ minPosition) >> 1)
        this.selectChangeNodes.forEach(item => {
          this.$set(this.upPositionLinkEl, this.upPositionLinkEl.length, item)
          const updateEl = positionType === 'x' ? { x: setPosition } : { y: setPosition }
          item.update(updateEl)
          const idx = this.elPositionData.findIndex(items => items.itemId === item._cfg.model.id)
          const dataIdx = idx === -1 ? this.elPositionData.length : idx
          const setPositionData = { itemId: item._cfg.model.id }
          if (positionType === 'x') {
            const x = parseInt(setPosition)
            const y = parseInt(item._cfg.model.y)
            setPositionData.x = String(x)
            setPositionData.y = String(y)
          }
          if (positionType === 'y') {
            const x = item._cfg.model.x
            const y = setPosition
            setPositionData.x = String(x)
            setPositionData.y = String(y)
          }
          this.$set(this.elPositionData, dataIdx, setPositionData)
        })
        resolve()
      })
    },

    // 批量修改节点元素x、y轴
    async updateBsTopItemXY(data) {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.updateBsTopItemXY, data }).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    async updateBsTopItemXY2(data) {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.updateBsTopItemXY2, data }).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },

    /* 节点 START */
    // 添加节点
    async insertBsTopItem(data) {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.insertBsTopItem, data }).then(res => { if (res.code === 1) resolve(res) })
      })
    },
    // 获取节点
    async findBsTopItem() {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.findBsTopItem, data: { page: 1, limit: -1, systemId: this.id }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    /**
     * @description 修改节点
     * @param requestData 请求修改节点元素接口的参数
     * @param itemUpData 修改实例上节点的参数
     */
    async updateBsTopItem(requestData, itemUpData) {
      return await request({ url: api.bsTopSystem.updateBsTopItem, data: requestData }).then(res => {
        if (res.code === 1) {
          if (itemUpData !== null) {
            // 请求修改数据成功后修改拓扑图上的节点数据
            this.handlerNode.update(itemUpData)
            // this.topoGraph.update(this.handlerNode, { ...itemUpData })
            this.topoGraph.refresh() // 修改样式需要刷新视图
            return ''
          }
        }
      })
    },
    // 监听修改节点样式参数
    updateElStyle(val) {
      const itemUpData = {
        label: val.itemName,
        size: [val.width, val.height],
        x: val.x,
        y: val.y,
        img: val.imageUrl,
        port: val.port,
        ip: val.ip,
        checkPort: val.checkPort
      }
      if (val.type === 'rect') {
        if (val.fontBackColor) itemUpData.style = { fill: val.fontBackColor }
        itemUpData.labelCfg = {
          style: { fontSize: val.fontSize || 0, fill: val.fontColor, fontWeight: val.fontWeight || 0 }
        }
      }
      this.updateBsTopItem(val, itemUpData)
    },
    // 删除节点
    async deleteTopoNode(data) {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.deleteBsTopItem, data }).then(res => { resolve(res) })
      })
    },
    /* 节点 END */

    /* 链路线条 START */
    // 插入节点连线关系
    async insertBsTopItemLink(topoLine) {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.insertBsTopItemLink, data: topoLine }).then(res => { if (res.code === 1) resolve(res) })
      })
    },
    // 查询节点连线关系
    async findBsTopItemLink() {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.findBsTopItemLink, data: { page: 1, limit: -1, systemId: this.id }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 删除线条
    async deleteTopoLine(data) {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.deleteBsTopItemLink, data }).then(res => { resolve(res) })
      })
    },
    // 删除多个线条
    async deleteTopoLines(data) {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.deleteBsTopItemLinkByIds, data }).then(res => { resolve(res) })
      })
    }
    /* 链路线条 END */
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  display: flex;
  //justify-content: space-between;
  align-items: center;

  .filter-item {
    margin: 0 !important;
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    margin-left: 41px;
    .tool-item {
      margin-left: 10px !important;
      font-size: 18px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      color: #000000;
      padding: 0;
    }
    .active-item {
      border: 1px solid #0145AB;
    }
    img {
      width: 20px;
      height: 20px
    }
    .el-select {
      width: 40%;
    }
  }
}
</style>
