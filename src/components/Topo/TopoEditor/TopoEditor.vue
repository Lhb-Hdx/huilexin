<template>
  <div ref="appContainer" class="app-container">
    <div ref="filterContainer" class="filter-container margin-bottom-10">
      <el-page-header :content="navTitle" @back="$router.go(-1)" />
      <TopoToolsBar @handlerTool="monitorHandlerTool" />
    </div>
    <div class="config-content">
      <div class="config-content-left" :style="{'height': containerHeight + 'px'}">
        <TopoItemDeviceList @handleDragHostEnd="handleDragEnd" />
      </div>
      <div ref="configContentMain" class="config-content-main" :style="{'height': containerHeight + 'px', 'width': '85%'}">
        <TopoMap
          ref="topoMapComponent"
          mode="config"
          :topo-info="topoInfo"
          :map-config="mapConfig"
          :map-combos="mapCombos"
          :map-edges="mapEdges"
          :map-nodes="mapNodes"
          :map-grid-bg="true"
          @handlerItem="monitorHandlerItem"
        />
      </div>
      <div ref="configContentRight" class="config-content-right" :style="{'height': containerHeight + 'px'}">
        <template v-if="handlerElAction !== ''">
          <!-- 链路选择 -->
          <TopoLinkSelectMap v-if="handlerElAction === 'link'" @emitActionStyle="emitActionStyle" />
          <!-- 分组配置选择 -->
          <TopoComboSelectMap v-if="handlerElAction === 'combo'" @emitActionStyle="emitActionStyle" />
        </template>
        <template v-if="handlerElAction === ''">
          <!-- 拓扑图mini地图 -->
          <TopoMiniMap :style="{ 'height': topoMiniMapHeight + 'px' }" />
          <!-- 拓扑图信息 -->
          <TopoMapInfo v-if="handlerItemType === ''" :topo-info="topoInfo" />
          <!-- 节点配置 -->
          <TopoNodeConfig v-if="handlerItemType === 'node'" :el-style="handlerNodeStyle" @updateElStyle="updateElStyle" />
          <!-- 链路配置 -->
          <TopoLinkConfig
            v-if="handlerItemType === 'line'"
            :topo-line="topoLineForm"
            :source-port-list="sourceHostPortList"
            :target-port-list="targetHostPortList"
            :source-port-label="sourcePortLabel"
            :target-port-label="targetPortLabel"
            @updateLineData="updateLineData"
          />
          <!-- 分组配置 -->
          <TopoComboConfig v-if="handlerItemType === 'combo'" :topo-combo="topoComboForm" @updateCombo="updateCombo" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import TopoNodeConfig from '@/components/Topo/Components/TopoNodeConfig'
import TopoComboConfig from '@/components/Topo/Components/TopoComboConfig'
import TopoComboSelectMap from '@/components/Topo/Components/TopoComboSelectMap'
import TopoLinkConfig from '@/components/Topo/Components/TopoLinkConfig'
import TopoLinkSelectMap from '@/components/Topo/Components/TopoLinkSelectMap'
import TopoMapInfo from '@/components/Topo/Components/TopoMapInfo'
import TopoToolsBar from '@/components/Topo/Components/TopoToolsBar'
import TopoMap from '@/components/Topo/Components/TopoMap'
import TopoItemDeviceList from '@/components/Topo/Components/TopoItemDeviceList'
import TopoMiniMap from '@/components/Topo/Components/TopoMiniMap'

import request from '@/utils/request'
import api from '@/api/api'
import { connectLineTypeList } from '@/utils/define-data'
import TopoItMonitorDevicePortMixin from '@/components/Topo/mixins/TopoItMonitorDevicePortMixin'

import '../Styles/TopoEditor.scss'

export default {
  name: 'TopoEditor',
  components: {
    TopoItemDeviceList,
    TopoNodeConfig,
    TopoComboConfig,
    TopoComboSelectMap,
    TopoLinkConfig,
    TopoLinkSelectMap,
    TopoMapInfo,
    TopoToolsBar,
    TopoMap,
    TopoMiniMap
  },
  mixins: [TopoItMonitorDevicePortMixin],
  data() {
    return {
      topoInfo: { name: '', statues: '' }, // 拓扑信息
      containerHeight: '', // 画布高度
      containerWidth: 0, // 画布高度
      sourceHostPortList: [], // 源端口列表
      targetHostPortList: [], // 目标端口列表
      topoLineForm: { // 节点线条关系
        id: '',
        linkType: '',
        sourceZbxItemId: '', // 来源监控项
        targetZbxItemId: '', // 目标监控项
        sourceZbxItemName: '', // 来源监控项名称
        targetZbxItemName: '', // 目标监控项名称
        sourceAgent: '', // 来源网关
        targetAgent: '' // 目标网关
      },
      handlerEdge: {}, // 点击的链路
      handlerNode: {}, // 点击的节点
      handlerCombo: {}, // 点击的分组
      handlerNodeStyle: {}, // 存储点击的节点样式
      connectLineTypeList: [], // 链路类型列表
      sourcePortLabel: '源端口',
      targetPortLabel: '目标端口',
      topoLineItems: [], // 获取线条元素
      handlerItemType: '', // 点击元素类型 节点或者线条
      mapLineTypeValue: '', // 选择的链路类型
      topoItemGroup: [], // 获取拓扑分组
      topoComboForm: {}, // 存储当前点击的分组数据
      handlerElAction: '',
      itMonitorDeviceInGetPortFn: [
        { devTypeId: 490, fn: 'GetSDWANDevicePort' }, // sdwan
        { devTypeId: 484, fn: 'GetOperatingSystemPort' }, // 操作系统
        { devTypeId: 483, fn: 'GetDBPort' }, // 数据库
        // { devTypeId: 482, fn: '' }, // 中间件
        { devTypeId: 481, fn: 'GetNetWorkDevicePort' }, // 网络设备
        // { devTypeId: 480, fn: '' }, // 应用软件
        { devTypeId: 479, fn: 'GetServiceDevicePort' }, // 服务设备
        { devTypeId: 478, fn: 'GetVirtualDevicePort' } // 虚拟资源
        // { devTypeId: 477, fn: '' } // 存储设备
      ],
      mapConfig: {
        height: 0,
        width: 0
      },
      mapCombos: [],
      mapEdges: [],
      mapNodes: [],
      topoMiniMapHeight: ''
    }
  },
  computed: {
    id() { return this.$route.query.id },
    navTitle() { return this.$route.meta.title }
  },
  async mounted() {
    this.topoMiniMapHeight = window.innerHeight / 4
    // 获取预定义数据
    this.connectLineTypeList = connectLineTypeList()
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
        this.$refs.topoMapComponent.clearElStatus()
      }
    })
    // 数据获取
    if (this.id) {
      // 获取拓扑信息
      this.topoInfo = await this.getHyitTopologyInfo() || {}
      this.mapConfig = {
        width: this.$refs.configContentMain.clientWidth,
        height: this.containerHeight
      }
      this.mapCombos = await this.findHyitTopologyItemGroup() || []
      this.mapNodes = await this.findHyitTopologyItem() || []
      this.mapEdges = await this.findHyitTopologyItemLink() || []
      setTimeout(async() => {
        // 调用拓扑组件生成数据
        await this.$refs.topoMapComponent.generateData()
        // 调用拓扑组件初始化拓扑图
        this.$refs.topoMapComponent.initMap()
      }, 100)
    }
  },
  methods: {
    // 获取拓扑信息
    async getHyitTopologyInfo() {
      return new Promise(resolve => {
        request({
          url: api.itMonitor.getHyitTopologyInfo,
          data: { id: this.id }
        }).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },

    // 监听结束拖拽生成
    async handleDragEnd(val) {
      this.$refs.topoMapComponent.insertMapNode({
        item: val,
        configContentMainTop: this.$refs.configContentMain.getBoundingClientRect().top,
        configContentMainLeft: this.$refs.configContentMain.getBoundingClientRect().left,
        configContentMainWidth: this.$refs.configContentMain.clientWidth,
        configContentMainHeight: this.$refs.configContentMain.clientHeight
      })
    },

    /**
     * @description 获取主机信息
     * @param hostId 主机id
     * @param itemId 监控项id
     * @param postListName 端口列表名称（起始端口、目标端口）
     * @param linkId 链路id
     */
    async getHyitHost(hostId, itemId, postListName, linkId) {
      request({
        url: api.itMonitor.getHyitHost,
        data: { hyHostId: hostId }
      }).then(async res => {
        if (res.code === 1 && res.model) {
          const getItem = this.$tool.findDataItemByAttr(this.itMonitorDeviceInGetPortFn, 'devTypeId', Number(res.model.hyDevTypeId))
          if (getItem) {
            await this[getItem.fn](res, hostId, itemId, postListName)
          }
          // 传入的itemid不为空
          const getActicePortList = [...this[`${postListName}`]]
          if (itemId !== null) {
            getActicePortList.forEach((portItem, portIdx) => {
              const sourceItemIdx = this.$tool.findDataItemByAttr(this.topoLineItems, 'sourceZbxItemId', portItem.itemid)
              const targetItemIdx = this.$tool.findDataItemByAttr(this.topoLineItems, 'targetZbxItemId', portItem.itemid)
              if (sourceItemIdx !== null || targetItemIdx !== null) {
                const linkSourceItemIdx = this.topoLineItems.findIndex(tlitem => tlitem.id === linkId && tlitem.sourceZbxItemId === portItem.itemid)
                const linkTargetItemIdx = this.topoLineItems.findIndex(tlitem => tlitem.id === linkId && tlitem.targetZbxItemId === portItem.itemid)
                if (linkSourceItemIdx !== -1) return
                if (linkTargetItemIdx !== -1) return
                getActicePortList.splice(portIdx, 1)
              }
            })
          } else {
            getActicePortList.forEach((portItem, portIdx) => {
              const sourceItemIdx = this.$tool.findDataItemByAttr(this.topoLineItems, 'sourceZbxItemId', portItem.itemid)
              const targetItemIdx = this.$tool.findDataItemByAttr(this.topoLineItems, 'targetZbxItemId', portItem.itemid)
              if (sourceItemIdx !== null || targetItemIdx !== null) {
                getActicePortList.splice(portIdx, 1)
              }
            })
          }
          this[`${postListName}`] = getActicePortList
        }
      })
    },

    // 监测选择的操作样式
    emitActionStyle(val) {
      if (val.mapType === 'link') {
        this.mapLineTypeValue = this.mapLineTypeValue === val.mapLineTypeValue ? '' : val.mapLineTypeValue
        this.$EventBus.$emit('emitActionStyle', {
          mapType: 'link',
          value: this.mapLineTypeValue === val.mapLineTypeValue ? '' : val.mapLineTypeValue
        })
      }
      if (val.mapType === 'combo') {
        this.$EventBus.$emit('emitActionStyle', {
          mapType: 'combo',
          value: val.comboStyle
        })
      }
    },
    /* 节点 START */
    // 获取节点
    findHyitTopologyItem() {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitTopologyItem, data: { page: 1, limit: -1, topId: this.id }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 监听修改节点样式参数
    updateElStyle(val) {
      const itemUpData = {
        label: val.itemName,
        size: [Number(val.width), Number(val.height)],
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
      this.$refs.topoMapComponent.updateHyitTopologyItem(val, itemUpData)
    },
    /* 节点 END */

    /* 链路线条 START */
    // 查询节点连线关系
    async findHyitTopologyItemLink() {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitTopologyItemLink, data: { page: 1, limit: -1, topId: this.id }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 监听修改链路参数
    updateLineData(val) {
      const data = { ...val }
      const sourceStatusIdx = data.sourceZbxItemId ? this.sourceHostPortList.findIndex(item => item.itemid === data.sourceZbxItemId) : -1
      const targetStatusIdx = data.targetZbxItemId ? this.targetHostPortList.findIndex(item => item.itemid === data.targetZbxItemId) : -1
      if (sourceStatusIdx !== -1 && this.sourceHostPortList[sourceStatusIdx].sourceHostPortListItemId) data.sourceItemStatueItemId = this.sourceHostPortList[sourceStatusIdx].sourceHostPortListItemId
      if (targetStatusIdx !== -1 && this.targetHostPortList[targetStatusIdx].targetHostPortListItemId) data.targetItemStatueItemId = this.targetHostPortList[targetStatusIdx].targetHostPortListItemId
      this.$refs.topoMapComponent.updateHyitTopologyItemLink(data, { ...data })
    },
    /* 链路线条 END */

    /* 节点分组 START */
    // 查询节点分组
    async findHyitTopologyItemGroup() {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitTopologyItemGroup, data: { topId: this.id }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 监听修改分组样式
    updateCombo(val) { this.$refs.topoMapComponent.updateHyitTopologyItemGroup(val, val) },
    /* 节点分组 END */

    // 监听拓扑图点击元素
    monitorHandlerItem(val) {
      this.handlerItemType = val.handlerItemType
      if (val.handlerItemType === 'node') {
        this.handlerNode = val.handlerNode
        this.handlerNodeStyle = val.handlerNodeStyle
      } else if (val.handlerItemType === 'line') {
        this.sourceHostPortList = []
        this.targetHostPortList = []
        // 存储当前点击的线条
        this.handlerEdge = val.handlerEdge
        this.sourcePortLabel = `${val.sourceHostItem._cfg.model.label}端口`
        this.targetPortLabel = `${val.targetHostItem._cfg.model.label}端口`
        // 用主机信息去获取出网关
        this.getHyitHost(val.sourceHostItem._cfg.model.hostId, val.handlerEdge._cfg.model.sourceZbxItemId, 'sourceHostPortList', val.handlerEdge._cfg.model.id.split('-')[1])
        this.getHyitHost(val.targetHostItem._cfg.model.hostId, val.handlerEdge._cfg.model.targetZbxItemId, 'targetHostPortList', val.handlerEdge._cfg.model.id.split('-')[1])
        // 填充表单信息
        this.$set(this.topoLineForm, 'id', val.handlerEdge._cfg.model.id.split('-')[1])
        this.$set(this.topoLineForm, 'sourceZbxItemId', val.handlerEdge._cfg.model.sourceZbxItemId)
        this.$set(this.topoLineForm, 'targetZbxItemId', val.handlerEdge._cfg.model.targetZbxItemId)
        this.$set(this.topoLineForm, 'sourceZbxItemName', val.handlerEdge._cfg.model.sourceZbxItemName)
        this.$set(this.topoLineForm, 'targetZbxItemName', val.handlerEdge._cfg.model.targetZbxItemName)
        this.$set(this.topoLineForm, 'sourceAgent', val.handlerEdge._cfg.model.sourceAgent)
        this.$set(this.topoLineForm, 'targetAgent', val.handlerEdge._cfg.model.targetAgent)
        this.$set(this.topoLineForm, 'linkType', val.handlerEdge._cfg.model.linkType)
      } else if (val.handlerItemType === 'combo') {
        this.topoComboForm = val.handlerComboStyle
        this.handlerCombo = val.handlerCombo
      }
    },
    // 监听点击工具栏
    monitorHandlerTool(val) {
      this.$EventBus.$emit('monitorHandlerTool', val)
      // 放大
      if (val === 'zoom-in') this.$refs.topoMapComponent.zoomInTool()
      // 缩小
      if (val === 'zoom-out') this.$refs.topoMapComponent.zoomOutTool()
      // 复原
      if (val === 'refresh') this.$refs.topoMapComponent.refreshTool()
      // 下载
      if (val === 'download') this.$refs.topoMapComponent.downloadTool()
      // 指针
      if (val === 'pointer') {
        this.$refs.topoMapComponent.pointerTool()
        this.handlerElAction = ''
      }
      // 选择
      if (val === 'select') {
        this.$refs.topoMapComponent.selectTool()
      }
      // 链路
      if (val === 'link') {
        if (this.handlerElAction === 'link') return
        this.handlerElAction = 'link'
        this.$refs.topoMapComponent.linkTool()
      }
      // 分组
      if (val === 'combo') {
        this.handlerElAction = 'combo'
      }
      // 垂直对齐
      if (val === 'vertical') {
        this.$refs.topoMapComponent.vertical()
      }
      // 水平对齐
      if (val === 'horizontal') {
        this.$refs.topoMapComponent.horizontal()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  display: flex;
  align-items: center;
}
</style>
