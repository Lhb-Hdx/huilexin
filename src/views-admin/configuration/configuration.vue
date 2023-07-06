<template>
  <div ref="appContainer" class="app-container">
    <div ref="filterContainer" class="filter-container margin-bottom-10">
      <el-page-header :content="navTitle" @back="$router.go(-1)" />
      <div class="action-buttons top-tool-bar">
        <template v-for="(item, index) in toolBar">
          <el-tooltip :key="index" :content="item.tip" class="item" effect="dark" placement="top">
            <el-button
              :class="toolType === item.methodType && (item.methodType === 'pointer' || item.methodType === 'select') ? 'active-item' : ''"
              :disabled="disabledTool.indexOf(item.methodType) !== -1"
              :style="{ opacity: disabledTool.indexOf(item.methodType) !== -1 ? '0.4' : 1 }"
              class="tool-item"
              type="text"
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
      <div :style="{ height: containerHeight + 'px' }" class="config-content-left">
        <topo-el ref="topoel" @handleDragHostEnd="handleDragEnd" @updateCabinet="currentCabinet = $event" />
      </div>
      <div ref="configContentMain" :style="{ height: 600 + 'px', border: 'none' }" class="config-content-main">
        <div id="topoMap" :style="{ height: 600 + 'px' }" />
        <div v-if="showConextMenu" :style="{ left: menuLeft + 'px', top: menuTop + 'px' }" class="conext-menu" @mouseout="conextMenuOut">
          <div class="conext-menu pointer" @click="removeNode">删除</div>
        </div>
        <div v-if="showOc" :style="{ left: ocLeft + 'px', top: ocTop + 'px' }" class="conext-oC">
          <div>{{ deviceInfo.deviceName }}</div>
          <div class="mt-14">温度：{{ deviceInfo.temperature }}</div>
          <div class="mt-6">湿度：{{ deviceInfo.humidity }}</div>
        </div>
      </div>
      <div ref="configContentRight" :style="{ height: containerHeight + 'px' }" class="config-content-right">
        <template v-if="handlerElAction === ''">
          <!--          || handlerItemType === 'map'-->
          <node-config v-if="handlerItemType === 'node'" :el-style="handlerNodeStyle" @updateElStyle="updateElStyle" />
        </template>
        <!-- <ModuleConfig v-if="handlerItemType === 'cabinet'" :current-cabinet="currentCabinet" @updateCabinet="$refs.topoel.findDiagramCabinet()" /> -->
      </div>
    </div>
  </div>
</template>

<script>
import G6 from '@antv/g6'
import request from '@/utils/request'
import api from '@/api/api'
import { connectLineTypeList, diagramItemIcon, topoShape } from '@/utils/define-data'
import TopoEl from './component/topoEl'
import NodeConfig from './component/nodeConfig'
import ModuleConfig from './component/moduleConfig'
import './style/configItemStyle.scss'

export default {
  name: 'Configuration',
  // eslint-disable-next-line vue/no-unused-components
  components: { TopoEl, NodeConfig, ModuleConfig },
  data() {
    return {
      topoInfo: { name: '', statues: '' }, // 拓扑信息
      containerHeight: '', // 画布高度
      containerWidth: 0, // 画布高度
      topoGraph: null, // 拓扑元素实例
      showConextMenu: false, // 显示右击菜单
      contextmenuSelectId: '', // 右击选择的元素id
      topoIco: [],
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
        {
          icon: 'image/topo/tool-bar-pointer-icon.png',
          tip: '指针',
          methodType: 'pointer',
          iconType: 'img',
          disabled: false
        },
        {
          icon: 'image/topo/tool-bar-select-icon.png',
          tip: '选择',
          methodType: 'select',
          iconType: 'img',
          disabled: false
        },
        { icon: 'el-icon-zoom-in', tip: '放大', methodType: 'zoom-in', disabled: false },
        { icon: 'el-icon-zoom-out', tip: '缩小', methodType: 'zoom-out', disabled: false },
        { icon: 'el-icon-refresh-left', tip: '复原', methodType: 'refresh', disabled: false },
        { icon: 'el-icon-sort', tip: '垂直对齐', methodType: 'vertical', disabled: true },
        {
          icon: 'el-icon-sort',
          tip: '水平对齐',
          methodType: 'horizontal',
          style: { transform: 'rotate(90deg)' },
          disabled: true
        },
        { icon: 'image/topo/link-btn-icon.png', tip: '链路连接', methodType: 'link', iconType: 'img', disabled: true }
        // { icon: 'el-icon-download', tip: '下载', methodType: 'download' }
      ],
      toolType: '', // 当前工具栏选择类型
      disabledTool: ['vertical', 'horizontal', 'combo'],
      selectChangeNodes: [], // 存储每次鼠标框选的元素
      elPositionData: [], // 需要修改位置的元素
      isNodeSelectChange: false,
      upPositionLinkEl: [], // 需要更新的链路节点
      handleDragEndNode: {},
      handleDragEndNodeData: {},
      mapBgColor: '/manage/images//null/0/202202/1644996856954a3d0bx4aq1_img.png',
      mapWidth: 0,
      mapHeight: 0,
      currentCabinet: {},
      showOc: false,
      ocLeft: 0,
      ocTop: 0,
      deviceInfo: {
        temperature: 0,
        humidity: 0,
        deviceName: ''
      },
      ringIcon: {
        10060: 'image/configuration/精密空调.png',
        1016: 'image/configuration/ups.png',
        1000: 'image/configuration/温湿度.png',
        10058: 'image/configuration/供配电.png',
        1017: 'image/configuration/蓄电池.png',
        10069: 'image/configuration/声光报警.png',
        10068: 'image/configuration/漏水监控.png',
        10066: 'image/configuration/列头柜.png',
        1012: 'image/configuration/新风系统.png'
      }
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    navTitle() {
      return this.$route.meta.title
    }
  },
  async mounted() {
    this.topoIco = diagramItemIcon()
    // 获取预定义数据
    this.connectLineTypeList = connectLineTypeList()
    this.topoShape = topoShape()
    // 设置内容区域高度宽度
    this.containerHeight = this.$refs.appContainer.clientHeight - 30 - this.$refs.filterContainer.clientHeight
    this.containerWidth = this.$refs.configContentMain.clientWidth
    // 数据获取
    if (this.id) {
      // 获取拓扑信息
      this.topoInfo = (await this.getDiagram()) || {}
      // 设置内容区域高度宽度
      this.containerHeight = this.$refs.appContainer.clientHeight - 30 - this.$refs.filterContainer.clientHeight
      this.containerWidth = this.$refs.configContentMain.clientWidth
      this.mapWidth = this.topoInfo.width
      this.mapHeight = this.topoInfo.height

      // 1、获取节点
      const topoItemResult = (await this.findDiagramItem()) || []
      const topoItem = []
      topoItemResult.forEach((item) => {
        item.id = String(item.id)
        const topoItemGraph = {
          id: item.id,
          x: item.x,
          y: item.y,
          size: [item.width, item.height],
          label: item.itemName,
          userDefineType: item.userDefineType,
          ...item
        }
        if (item.userDefineType === 8 || item.userDefineType !== 9) {
          topoItemGraph.labelCfg = { position: 'bottom' }
          topoItemGraph.type = 'node-template'
          topoItemGraph.img = item.imageUrl || 'image/configuration/node_item_icon_default.png'
        }
        if (item.userDefineType === 9) {
          topoItemGraph.type = 'rect'
          if (item.fontBackColor) topoItemGraph.style = { fill: item.fontBackColor }
          topoItemGraph.labelCfg = {
            style: { fontSize: item.fontSize || 0, fill: item.fontColor || '#000', fontWeight: item.fontWeight || 0 }
          }
        }
        if (item.userDefineType === 10) {
          topoItemGraph.type = 'cabinet'
          topoItemGraph.img = item.imageUrl || 'image/configuration/node_item_icon_default.png'
        }
        topoItem.push(topoItemGraph)
      })
      this.$set(this.topoMapData, 'nodes', topoItem)

      // 2、获取节点链路
      this.topoLineItems = (await this.findDiagramItemLink()) || []
      const edges = []
      this.topoLineItems.forEach((item) => {
        item.id = String(item.id)
        edges.push({
          id: `edge-${item.id}`,
          source: String(item.sourceItemId),
          target: String(item.targetItemId)
        })
      })
      this.$set(this.topoMapData, 'edges', edges)
      await this.initMap()
      // this.topoGraph.fitView()
      this.handlerItemType = 'map'
      this.handlerNodeStyle = {
        type: 'map',
        label: this.topoInfo.name,
        img: this.topoInfo.imageUrl,
        size: [this.topoInfo.width, this.topoInfo.height]
      }
    }
  },
  methods: {
    // 初始化topo图
    async initMap() {
      const that = this
      // 自定义节点
      G6.registerNode(
        'node-template',
        (cfg) => `
          <group style={{ width: ${cfg.size[0]}, height: ${cfg.size[1]} }}>
            <image draggable="true" style={{ img: 'image/configuration/item_tag_bg_success.png', width: ${cfg.size[0]}, height: ${cfg.size[1]} }} />
            <image draggable="true" style={{ img: ${cfg.img}, width: 18, height: 18, marginLeft: 16,  marginTop: -35, sIndex: 999 }} />
          </group>`
      )
      G6.registerNode(
        'cabinet',
        (cfg) => `
          <group style={{ width: ${cfg.size[0]}, height: ${cfg.size[1]} }}>
            <image draggable="true" style={{ img: 'image/configuration/item_tag_bg_success.png', width: ${cfg.size[0]}, height: ${cfg.size[1]} }} />
            <image draggable="true" style={{ img: ${cfg.img}, width: 18, height: 18, marginLeft: 16,  marginTop: -35, sIndex: 999 }} />
          </group>`
      )
      G6.registerNode(
        'ring',
        (cfg) => `
          <group style={{ width: ${cfg.size[0]}, height: ${cfg.size[1]} }}>
            <image draggable="true" style={{ img: 'image/configuration/item_tag_bg_success.png', width: ${cfg.size[0]}, height: ${cfg.size[1]} }} />
            <image draggable="true" style={{ img: ${cfg.img}, width: 18, height: 18, marginLeft: 16,  marginTop: -35, sIndex: 999 }} />
          </group>`
      )
      // 实例化配置
      this.topoGraph = new G6.Graph({
        container: 'topoMap', // 视图区域DOM
        width: 1000,
        height: 600,
        defaultEdge: {
          // 线条默认配置
          color: '#B7C2CBFF',
          lineAppendWidth: 10,
          style: { lineWidth: 3 }
        },
        defaultNode: {
          // 节点默认配置
          type: 'node-template',
          size: [40, 40]
        },
        modes: {
          // 模式
          default: ['drag-canvas', 'drag-node'],
          altSelect: [{ type: 'brush-select', trigger: 'drag' }, 'drag-node']
        },
        animate: true
      })

      this.topoGraph.data(this.topoMapData)
      // console.log('graphCenterPoint|:', this.topoMapData)
      G6.Util.processParallelEdges(this.topoMapData.edges) // 多边渲染
      this.topoGraph.render()
      // this.graphCenterPoint = that.topoGraph.getGraphCenterPoint()

      let backgroundImag = this.topoGraph.getGroup().addShape('image', {
        attrs: {
          width: this.topoGraph.getWidth(),
          height: this.topoGraph.getHeight(),
          img: that.topoInfo.imageUrl,
          x: 0,
          y: 0
        },
        capture: false
      })
      backgroundImag.toBack()

      // 画图区域空白处
      this.topoGraph.on('canvas:click', function () {
        if (that.handlerItemType !== 'map') {
          that.handlerItemType = 'map'
          that.clearElStatus()
          that.handlerNodeStyle = {
            type: 'map',
            label: that.topoInfo.name,
            img: that.topoInfo.imageUrl,
            size: [that.topoInfo.width, that.topoInfo.height]
          }
        }
      })
      // 点击元素节点
      this.topoGraph.on('node:click', function (evt) {
        console.log(evt)
        if (evt.item._cfg.currentShape === 'cabinet') {
          // that.handlerItemType = 'cabinet'
          // that.currentCabinet = { type: 'edit', hostId: evt.item._cfg.model.hostId }
          that.$refs.topoel.addcabinet(evt.item._cfg.model.hostId)
        } else that.handlerItemType = 'node'

        that.handlerNode = evt.item
        that.handlerNodeStyle = { ...evt.item._cfg.model }
      })
      // 双击跳转
      this.topoGraph.on('node:dblclick', function (evt) {
        if (evt.item._cfg.model.userDefineType !== 10) return
        that.$router.push({
          name: 'configCabinet',
          query: { id: that.$route.query.id, cabinetId: evt.item._cfg.model.hostId }
        })
      })
      // 隐藏温湿度
      this.topoGraph.on('node:mouseout', function (evt) {
        that.showOc = false
      })
      // 移动元素上方显示温湿度
      // this.topoGraph.on('node:mouseenter', async function(evt) {
      //   const that = this
      //   evt.preventDefault()
      //   if (evt.item._cfg.model.userDefineType !== 4) return
      //   const deviceId = evt.item._cfg.model.hostId
      //   const device = await that.getHyitDevice(deviceId)
      //   if (device.hyDevTypeValue !== 1000) return
      //   that.deviceInfo.deviceName = device.hyAlias
      //   that.deviceInfo.humidity = 0
      //   that.deviceInfo.temperature = 0
      //   let deviceValuelist = await that.findHyitDeviceValue(device.hyDeviceId)
      //   const ValueTypes = await that.findHyitValueType(deviceValuelist.map(it => it.hyType).join(','))
      //   for (let k = 0; k < ValueTypes.length; k++) {
      //     const type = ValueTypes[k]
      //     for (let j = 0; j < deviceValuelist.length; j++) {
      //       const deviceValue = deviceValuelist[j]
      //       const boole = await that.init(deviceValue, type, '温度')
      //       if (boole) break
      //     }
      //   }
      //   for (let k = 0; k < ValueTypes.length; k++) {
      //     const type = ValueTypes[k]
      //     for (let j = 0; j < deviceValuelist.length; j++) {
      //       const deviceValue = deviceValuelist[j]
      //       const boole = await that.init(deviceValue, type, '湿度')
      //       if (boole) break
      //     }
      //   }
      //   that.showOc = true
      //   that.ocLeft = evt.canvasX - 140
      //   that.ocTop = evt.canvasY - 120
      // })
      // 节点拖拽结束 修改节点的位置
      this.topoGraph.on('node:dragend', function (evt) {
        that.handlerItemType = ''
        const upData = {
          id: evt.item._cfg.model.id,
          x: parseInt(evt.item._cfg.model.x),
          y: parseInt(evt.item._cfg.model.y)
        }
        if (evt.item._cfg.model.agent) upData.agent = evt.item._cfg.model.agent
        that.updateDiagramItem(upData, null).then(() => {
          // 如果当前的元素样式被选中
          if (that.handlerNodeStyle.id === evt.item._cfg.model.id) that.handlerNodeStyle = { ...evt.item._cfg.model }
        })
      })
      // 右击节点
      this.topoGraph.on('edge:contextmenu', function (evt) {
        that.contextmenuSelectId = evt.item._cfg.id
        evt.preventDefault()
        that.showConextMenu = true
        that.menuLeft = evt.canvasX
        that.menuTop = evt.canvasY
      })
      // 框选节点
      this.topoGraph.on('nodeselectchange', async (evt) => {
        that.isNodeSelectChange = true
        this.selectChangeNodes = []
        that.setElStatus(evt.selectedItems.nodes)
        if (evt.selectedItems.nodes.length > 1) {
          that.disabledTool = []
        }
        that.selectChangeNodes = evt.selectedItems.nodes
      })

      // 右击线条
      this.topoGraph.on('node:contextmenu', function (evt) {
        that.contextmenuSelectId = evt.item._cfg.id
        evt.preventDefault()
        that.showConextMenu = true
        that.menuLeft = evt.canvasX
        that.menuTop = evt.canvasY
      })
      // 节点完成连线
      this.topoGraph.on('aftercreateedge', async (e) => {
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
        const createLink = await this.insertDiagramItemLink({
          diagramId: that.id,
          sourceItemId: e.edge._cfg.sourceNode._cfg.model.id,
          targetItemId: e.edge._cfg.targetNode._cfg.model.id
        })
        if (createLink.code === 1) {
          this.addMapElItem('edges', {
            id: `edge-${createLink.model.id}`,
            source: createLink.model.sourceItemId,
            target: createLink.model.targetItemId
          })
        } else {
          that.topoGraph.removeItem(that.handlerEdge)
        }
      })
    },
    async getHyitDevice(hyDeviceId) {
      let { model, code } = await request({ url: api.powerEnv.getHyitDevice, data: { hyDeviceId } })
      if (code === 1) return model
    },

    async init(deviceValue, type, name) {
      if (deviceValue['hyType'] === type['hyTypeId']) {
        const str = this.$tool.humpStr(type['hyFieldName'])
        if (deviceValue.hyDes.indexOf(name) !== -1) {
          // console.log(12132)
          if (name === '温度') this.deviceInfo.temperature = deviceValue[str]
          if (name === '湿度') this.deviceInfo.humidity = deviceValue[str]
          return true
        }
      }
    },
    async findHyitDeviceValue(hyDeviceId) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, hyDeviceId }
      })
      if (code !== 1) return
      return data
    },
    async findHyitValueType(hyTypes) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitValueType,
        data: { limit: -1, ids: hyTypes }
      })
      if (code !== 1) return
      return data
    },
    // 获取拓扑信息
    async getDiagram() {
      return new Promise((resolve) => {
        request({
          url: api.diagram.getDiagram,
          data: { id: this.id }
        }).then((res) => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },

    // 监听结束拖拽生成
    async handleDragEnd(val) {
      // console.log('生成拖拽', val)
      const { e, item } = val
      // if (this.$tool.findDataItemByAttr(this.topoMapData.nodes, 'hostId', item.hostId) !== null) return
      const configContentMainTop = this.$refs.configContentMain.getBoundingClientRect().top
      const configContentMainLeft = this.$refs.configContentMain.getBoundingClientRect().left
      const configContentMainWidth = this.$refs.configContentMain.clientWidth
      const configContentMainHeight = this.$refs.configContentMain.clientHeight
      if (
        e.clientX > configContentMainLeft &&
        e.clientY > configContentMainTop &&
        e.clientX < configContentMainLeft + configContentMainWidth &&
        e.clientY < configContentMainTop + configContentMainHeight
      ) {
        const topoItemGraph = {
          // 节点配置
          type: item.isDiy && item.diyNodeType !== 1 ? item.typeValue : item.userDefineType === 10 ? 'cabinet' : item.userDefineType === 4 ? 'ring' : 'node-template',
          x: parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).x),
          y: parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).y),
          size: [50, 50], // 元素宽高
          label: item.elName || item.name
        }
        if (!item.isDiy) {
          // 非自定义节点
          const idx = this.topoIco.findIndex((items) => items.devTypeId === item.devTypeId && items.userDefineType === item.userDefineType)
          topoItemGraph.img = idx !== -1 ? this.topoIco[idx].nodeIcon : 'image/configuration/node_item_icon_default.png'
          topoItemGraph.hostId = item.hostId || item.cabinetId
          topoItemGraph.zhostId = item.hyZhostId
          topoItemGraph.labelCfg = { position: 'bottom' }
        } else {
          topoItemGraph.userDefineType = item.userDefineType
          if (item.diyNodeType === 1) topoItemGraph.img = 'image/configuration/node_item_icon_default.png'
        }
        if (item.userDefineType === 10) {
          topoItemGraph.img = 'image/configuration/cabinet.png'
        }
        const data = {
          diagramId: this.id,
          itemName: topoItemGraph.label || item.name,
          width: topoItemGraph.size[0],
          height: topoItemGraph.size[1],
          x: this.nowPointValues.x
            ? parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).x - this.topoGraph.getPointByClient(this.nowPointValues.x, this.nowPointValues.y).x) - topoItemGraph.size[0]
            : parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).x) - topoItemGraph.size[0],
          y: this.nowPointValues.y
            ? parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).y - this.topoGraph.getPointByClient(this.nowPointValues.x, this.nowPointValues.y).y) - topoItemGraph.size[1]
            : parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).y) - topoItemGraph.size[1],
          imageUrl: topoItemGraph.img,
          userDefineType: item.userDefineType,
          statue: item.status
        }
        if (item.userDefineType === 10) {
          data.statue = 1
        }
        if (item.userDefineType === 9) {
          if (item.fontBackColor) topoItemGraph.style = { fill: item.fontBackColor }
          topoItemGraph.labelCfg = {
            style: { fontSize: 14, fill: '#000', fontWeight: 0 }
          }
          topoItemGraph.size = [item.elName.length * 14, 40]
          data.fontSize = 14
          data.fontBackColor = ''
          data.fontWeight = 0
          data.fontColor = '#000'
          data.width = topoItemGraph.size[0]
          data.height = topoItemGraph.size[1]
        }
        if (item.userDefineType === 4) {
          // console.log(12313)
          data.imageUrl = this.ringIcon[item.hyDevTypeValue]
          topoItemGraph.img = this.ringIcon[item.hyDevTypeValue]
        }

        if (topoItemGraph.hostId) data.hostId = topoItemGraph.hostId
        if (item.cabinetId) data.hostId = item.cabinetId
        if (topoItemGraph.zhostId) data.zhostId = topoItemGraph.zhostId
        const createNode = await this.insertDiagramItem(data)
        if (createNode.code === 1) {
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
      if (elType === 'node') {
        // 节点
        // 删除节点查询出线条数据中包含了起点或者目标是该节点线条
        const deleteTopoNodeResult = await this.deleteTopoNode({ id })
        if (deleteTopoNodeResult.code === 1) this.topoGraph.removeItem(item)
        // 删除实例上的节点元素
        this.deleteMapElItem('nodes', [id])
        // 如果删除的节点有链路连接，要把链路也删除
        const lineIds = [] // 要删除的链路数据
        const elLineIds = [] // 要从实例上删除的
        this.topoMapData.edges.forEach((lineItem) => {
          if (Number(lineItem.source) === Number(id) || Number(lineItem.target) === Number(id)) {
            lineIds.push(lineItem.id.split('-')[1])
            elLineIds.push(lineItem.id)
          }
        })
        // 多条链路删除
        if (lineIds.length > 1) await this.deleteTopoLines({ ids: lineIds.toString() })
        // 单条链路删除
        // console.log(lineIds.length)
        if (lineIds.length === 1) await this.deleteTopoLine({ id: lineIds.toString() })
        // 从实例上删除链路
        if (elLineIds.length > 0) this.deleteMapElItem('edges', elLineIds)
      } else if (elType === 'edge') {
        // 线条
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
      await this.updateDiagramItemXY({
        systemId: this.id,
        x: this.nowPointValues.x,
        y: this.nowPointValues.y
      })
    },

    // 修改组态图
    updateDiagram(data) {
      request({ url: api.diagram.updateDiagram, data }).then(async (res) => {
        if (res.code === 1) {
          this.topoInfo = (await this.getDiagram()) || {}
          this.topoGraph.refresh() // 修改样式需要刷新视图
        }
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
        if (this.elPositionData.length > 0) await this.updateDiagramItemXY2({ json: JSON.stringify(this.elPositionData) })
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
        await this.updateDiagramItemXY2({ json: JSON.stringify(this.elPositionData) })
        this.elPositionData = []
        this.upPositionLinkEl.forEach((item) => {
          const getEdges = item.getEdges()[0]
          this.topoGraph.refreshItem(getEdges._cfg.id)
        })
      }
      // 水平对齐
      if (type === 'horizontal') {
        await this.onUpdateElAlignPosition('y')
        await this.updateDiagramItemXY2({ json: JSON.stringify(this.elPositionData) })
        this.elPositionData = []
        this.upPositionLinkEl.forEach((item) => {
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
      elIds.forEach((item) => {
        const itemIdx = this.topoMapData[`${elType}`].findIndex((elItem) => String(elItem.id) === String(item))
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
      nodes.forEach((nodeItem) => {
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
      return new Promise((resolve) => {
        const position = []
        this.upPositionLinkEl = []
        this.selectChangeNodes.forEach((item) => position.push(item._cfg.model[`${positionType}`]))
        const maxPosition = Math.max(...position)
        const minPosition = Math.min(...position)
        const setPosition = (maxPosition & minPosition) + ((maxPosition ^ minPosition) >> 1)
        this.selectChangeNodes.forEach((item) => {
          this.$set(this.upPositionLinkEl, this.upPositionLinkEl.length, item)
          const updateEl = positionType === 'x' ? { x: setPosition } : { y: setPosition }
          item.update(updateEl)
          const idx = this.elPositionData.findIndex((items) => items.itemId === item._cfg.model.id)
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
    async updateDiagramItemXY(data) {
      return new Promise((resolve) => {
        request({ url: api.diagram.updateDiagramItemXY, data }).then((res) => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    async updateDiagramItemXY2(data) {
      return new Promise((resolve) => {
        request({ url: api.diagram.updateDiagramItemXY2, data }).then((res) => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },

    /* 节点 START */
    // 添加节点
    async insertDiagramItem(data) {
      return new Promise((resolve) => {
        request({ url: api.diagram.insertDiagramItem, data }).then((res) => {
          if (res.code === 1) resolve(res)
        })
      })
    },
    // 获取节点
    async findDiagramItem() {
      return new Promise((resolve) => {
        request({
          url: api.diagram.findDiagramItem,
          data: { page: 1, limit: -1, diagramId: this.id }
        }).then((res) => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    /**
     * @description 修改节点
     * @param requestData 请求修改节点元素接口的参数
     * @param itemUpData 修改实例上节点的参数
     */
    async updateDiagramItem(requestData, itemUpData) {
      return await request({ url: api.diagram.updateDiagramItem, data: requestData }).then((res) => {
        if (res.code === 1) {
          if (itemUpData !== null) {
            // 请求修改数据成功后修改拓扑图上的节点数据
            this.handlerNode.update(itemUpData)
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
        img: val.imageUrl
      }
      if (val.type === 'rect') {
        if (val.fontBackColor) itemUpData.style = { fill: val.fontBackColor }
        itemUpData.labelCfg = {
          style: { fontSize: val.fontSize || 0, fill: val.fontColor, fontWeight: val.fontWeight || 0 }
        }
        itemUpData.size = [val.fontSize * val.itemName.length, val.height]
        val.width = val.fontSize * val.itemName.length
      }
      if (val.type === 'map') {
        this.updateDiagram({
          id: this.id,
          name: val.itemName,
          imageUrl: val.imageUrl
        })
      } else {
        const node = this.topoGraph.findById(val.id)
        // console.log(node)
        const nodeInEdges = node.getInEdges()
        nodeInEdges.forEach((item) => {
          // console.log('入边')
          // console.log(item.getModel().endPoint.x, item.getModel().endPoint.y)
          const itemModel = item.getModel()
          itemModel.endPoint.x = val.x
          itemModel.endPoint.y = val.y
          item.update(itemModel)
        })
        const nodeOutEdges = node.getOutEdges()
        nodeOutEdges.forEach((item) => {
          // console.log('出边')
          const itemModel = item.getModel()
          const getPointByClient = this.topoGraph.getPointByClient(val.x, val.y)
          itemModel.startPoint.x = getPointByClient.x
          itemModel.startPoint.y = getPointByClient.y
          // console.log(val.y + (val.height))
          item.update(itemModel)
        })
        this.updateDiagramItem(val, itemUpData)
      }
    },
    // 删除节点
    async deleteTopoNode(data) {
      return new Promise((resolve) => {
        request({ url: api.diagram.deleteDiagramItem, data }).then((res) => {
          resolve(res)
        })
      })
    },
    /* 节点 END */

    /* 链路线条 START */
    // 插入节点连线关系
    async insertDiagramItemLink(topoLine) {
      return new Promise((resolve) => {
        request({
          url: api.diagram.insertDiagramItemLink,
          data: topoLine
        }).then((res) => {
          if (res.code === 1) resolve(res)
        })
      })
    },
    // 查询节点连线关系
    async findDiagramItemLink() {
      return new Promise((resolve) => {
        request({
          url: api.diagram.findDiagramItemLink,
          data: { page: 1, limit: -1, diagramId: this.id }
        }).then((res) => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 删除线条
    async deleteTopoLine(data) {
      return new Promise((resolve) => {
        request({ url: api.diagram.deleteDiagramItemLink, data }).then((res) => {
          resolve(res)
        })
      })
    },
    // 删除多个线条
    async deleteTopoLines(data) {
      return new Promise((resolve) => {
        request({ url: api.diagram.deleteDiagramItemLinkByIds, data }).then((res) => {
          resolve(res)
        })
      })
    }
    /* 链路线条 END */
  }
}
</script>

<style lang="scss" scoped>
.config-content-main {
  overflow: hidden;
  background-size: 100% !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  width: 1200px;
}

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
      border: 1px solid #0145ab;
    }

    img {
      width: 20px;
      height: 20px;
    }

    .el-select {
      width: 40%;
    }
  }
}

.conext-oC {
  position: absolute;
  background-color: #fff;
  padding: 10px;
  width: 140px;
}
</style>
