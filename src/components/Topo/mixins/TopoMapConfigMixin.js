import { sleep } from '@/utils'
import request from '@/utils/request'
import api from '@/api/api'

/**
 * @description TopoMapConfigMixin.js
 * @author linhaojia
 * @date 2022/7/4 14:35:45
 */
export default {
  data() {
    return {
      portTooltip: false, // 是否显示端口弹窗
      itemHostTooltip: false, // 是否显示主机弹窗
      getMonitorDataInterval: null, // 获取弹窗数据定时器
      showHostEchartsInterval: null, // 获取图标数据定时器
      graphCenterPoint: {}, // 初始化时存储画布x、y轴
      nowPointValues: {}, // 当前时存储画布x、y轴偏移量
      lastDragendTimeStamp: null, // 上次拖拽画布结束事件触发时间戳
      lastNowPointValues: {}, // 上次画布拖拽后的偏移量
      lastInsertTopoItemPointValues: {}, // 上一次保存节点时拖拽画布后的偏移量
      isNodeSelectChange: false,
      showConextMenu: false, // 显示右击菜单
      contextmenuSelectId: '', // 右击选择的元素id
      handlerNodeStyle: {}, // 存储点击的节点样式
      selectChangeNodes: [], // 存储每次鼠标框选的元素
      selectGroupBg: '#ffffff', // 分组背景颜色
      selectGroupShape: {}, // 选择要款选生成的分组样式
      showDialog: false, // 新增链路关系弹窗
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
      isOnCreateSuccess: false, // 新增链路成功标识 如果没有新增成功关闭弹窗要删除图上的线条
      sourcePortLabel: '源端口',
      targetPortLabel: '目标端口',
      connectLineTypeList: [], // 链路类型列表
      topoPortAbbreviations: [], // 端口缩写匹配数据
      toolType: ''
    }
  },
  mounted() {},
  methods: {
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
    // 移出右键菜单
    conextMenuOut() {
      this.showConextMenu = false
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
      } else { // 分组
        const deleteGroupResult = await this.deleteGroup({ id: id.split('-')[1] })
        if (deleteGroupResult.code === 0) return
        // 删除分组查看分组有没有节点存在
        const nodeIds = []
        this.topoMapData.nodes.forEach(nodeItem => {
          if (nodeItem.comboId === id) nodeIds.push(nodeItem.id)
        })
        // 分组内不存在节点 直接删除元素
        if (nodeIds.length === 0) {
          this.topoGraph.removeItem(item)
        } else {
          // 给节点取消绑定分组id
          await this.updateHyitTopologyItemGroupValue({ itemIds: nodeIds.toString(), itemGroupId: 0, id: 0 })
          this.topoGraph.uncombo(item) // 如果分组内存在元素要使用拆开分组，使用removeItem会直接把分组以及里面的节点删除
        }
        this.deleteMapElItem('combos', [id])
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
    // 放大
    zoomInTool() {
      const zoom = this.topoGraph.getZoom()
      this.topoGraph.zoomTo(zoom + 0.1)
    },
    // 缩写
    zoomOutTool() {
      const zoom = this.topoGraph.getZoom()
      this.topoGraph.zoomTo(zoom - 0.1)
    },
    // 复原视图
    refreshTool() {
      this.topoGraph.fitView()
    },
    // 下载
    downloadTool() {
      this.downloadTopoMap()
    },
    // 指针
    pointerTool() {
      this.disabledTool = ['vertical', 'horizontal', 'combo']
      this.topoGraph.removeBehaviors('create-edge', 'default')
      this.topoGraph.setMode('default')
      this.handlerElAction = ''
    },
    // 选择
    selectTool() {
      this.topoGraph.setMode('altSelect')
      this.disabledTool = ['vertical', 'horizontal']
    },
    // 联线
    linkTool() {
      if (this.handlerElAction === 'link') return
      this.handlerElAction = 'link'
      this.topoGraph.addBehaviors('create-edge', 'default')
    },
    // 分组
    comboTool() {
      this.handlerElAction = 'combo'
    },
    // 垂直对齐
    async vertical() {
      await this.onUpdateElAlignPosition('x')
      await this.updateHyitTopologyItemXY2({ json: JSON.stringify(this.elPositionData) })
      await this.updateMapElItemXY('nodes', this.elPositionData)
      this.elPositionData = []
      this.upPositionLinkEl.forEach(item => {
        const getEdges = item.getEdges()[0]
        this.topoGraph.refreshItem(getEdges._cfg.id)
      })
    },
    // 水平对齐
    async horizontalTool() {
      await this.onUpdateElAlignPosition('y')
      await this.updateHyitTopologyItemXY2({ json: JSON.stringify(this.elPositionData) })
      await this.updateMapElItemXY('nodes', this.elPositionData)
      this.elPositionData = []
      this.upPositionLinkEl.forEach(item => {
        const getEdges = item.getEdges()[0]
        this.topoGraph.refreshItem(getEdges._cfg.id)
      })
    },
    // 关闭链路弹窗之前
    onBeforeCloseDialog() {
      if (!this.isOnCreateSuccess) this.topoGraph.removeItem(this.handlerEdge)
      this.showDialog = false
      this.isOnCreateSuccess = false
    },
    // 新增拓扑图节点
    async insertMapNode(val) {
      const { e, item } = val.item
      const { configContentMainTop, configContentMainLeft, configContentMainWidth, configContentMainHeight } = val
      if (this.$tool.findDataItemByAttr(this.mapNodes, 'hostId', item.hyHostId) !== null) return this.$message('设备节点已存在')
      if (
        (e.clientX > configContentMainLeft && e.clientY > configContentMainTop) &&
        ((e.clientX < (configContentMainLeft + configContentMainWidth)) && (e.clientY < (configContentMainTop + configContentMainHeight)))
      ) {
        // 批量修改图上节点
        if (this.nowPointValues.x && this.nowPointValues.y) {
          if (this.lastInsertTopoItemPointValues.x && this.lastInsertTopoItemPointValues.y) {
            if (this.lastInsertTopoItemPointValues.x !== this.nowPointValues.x && this.lastInsertTopoItemPointValues.y !== this.nowPointValues.y) {
              this.lastInsertTopoItemPointValues = { ...this.nowPointValues }
              await this.saveTopoGraph()
            }
          } else {
            this.lastInsertTopoItemPointValues = { ...this.nowPointValues }
            await this.saveTopoGraph()
          }
        }
        const topoItemGraph = { // 节点配置
          type: item.isDiy ? item.typeValue : 'image',
          x: parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).x),
          y: parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).y),
          size: [40, 40], // 元素宽高
          label: item.hyMarkName
        }
        if (!item.isDiy) { // 非自定义节点
          const idx = this.topoIco.findIndex(items => items.devTypeId === item.hyDevTypeId)
          topoItemGraph.img = idx !== -1 ? this.topoIco[idx].ico : 'image/topo/topo_server.png'
          topoItemGraph.hostId = item.hyHostId
          topoItemGraph.hyZhostId = item.hyZhostId
          topoItemGraph.labelCfg = { position: 'bottom' }
        } else {
          topoItemGraph.userDefineType = item.diyLabelType
        }
        const data = {
          topId: this.topoInfo.id,
          itemName: topoItemGraph.label,
          width: topoItemGraph.size[0],
          height: topoItemGraph.size[1],
          x: this.nowPointValues.x ? parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).x + this.nowPointValues.x) : parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).x),
          y: this.nowPointValues.y ? parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).y + this.nowPointValues.y) : parseInt(this.topoGraph.getPointByClient(e.pageX, e.pageY).y),
          imageUrl: topoItemGraph.img
        }
        if (topoItemGraph.hostId) data.hostId = topoItemGraph.hostId
        if (topoItemGraph.hyZhostId) data.zhostId = topoItemGraph.hyZhostId
        if (topoItemGraph.userDefineType) data.userDefineType = topoItemGraph.userDefineType
        const createNode = await this.insertHyitTopologyItem(data)
        if (createNode.code === 1) {
          topoItemGraph.id = String(createNode.model.id)
          this.topoGraph.addItem('node', topoItemGraph)
          this.addMapElItem('nodes', topoItemGraph)
        } else {
          this.$message({ type: 'error', message: createNode.msg })
        }
      }
    },
    // 新增链路配置
    async confirmDialog() {
      const sourcePortIdx = this.sourceHostPortList.findIndex(item => item.itemid === this.topoLineForm.sourceZbxItemId)
      const targetPortIdx = this.targetHostPortList.findIndex(item => item.itemid === this.topoLineForm.targetZbxItemId)
      if (sourcePortIdx !== -1) {
        this.$set(this.topoLineForm, 'sourceZbxItemName', this.sourceHostPortList[sourcePortIdx].itemName)
        this.$set(this.topoLineForm, 'sourceAgent', this.sourceHostPortList[sourcePortIdx].agent)
      }
      if (targetPortIdx !== -1) {
        this.$set(this.topoLineForm, 'targetZbxItemName', this.targetHostPortList[targetPortIdx].itemName)
        this.$set(this.topoLineForm, 'targetAgent', this.targetHostPortList[targetPortIdx].agent)
      }
      const data = { ...this.topoLineForm }
      delete data.id
      if (this.sourceHostPortList && this.sourceHostPortList[sourcePortIdx] && this.sourceHostPortList[sourcePortIdx].sourceHostPortListItemId) { data.sourceItemStatueItemId = this.sourceHostPortList[sourcePortIdx].sourceHostPortListItemId } else { data.sourceItemStatueItemId = 0 }
      if (this.targetHostPortList && this.targetHostPortList[targetPortIdx] && this.targetHostPortList[targetPortIdx].targetHostPortListItemId) { data.targetItemStatueItemId = this.targetHostPortList[targetPortIdx].targetHostPortListItemId } else { data.targetItemStatueItemId = 0 }
      const lineIdx = this.connectLineTypeList.findIndex(item => item.value === this.topoLineForm.linkType)
      this.insertHyitTopologyItemLink(data).then(res => {
        if (res.code === 1) {
          this.isOnCreateSuccess = true
          if (lineIdx !== -1) {
            // 更新线条样式
            this.handlerEdge.update({
              id: `edge-${res.model.id}`,
              style: this.connectLineTypeList[lineIdx].style,
              linkType: this.topoLineForm.linkType,
              sourceZbxItemId: this.topoLineForm.sourceZbxItemId,
              targetZbxItemId: this.topoLineForm.targetZbxItemId,
              sourceZbxItemName: this.topoLineForm.sourceZbxItemName,
              targetZbxItemName: this.topoLineForm.targetZbxItemName,
              sourceAgent: this.topoLineForm.sourceAgent,
              targetAgent: this.topoLineForm.targetAgent
            })
            this.addMapElItem('edges', this.handlerEdge.getModel())
          }
          this.showDialog = false
        }
      })
      await sleep(500)
      this.topoLineItems = await this.findHyitTopologyItemLink() || []
    },
    // 取消链路
    cancelLine() {
      this.showDialog = false
      this.topoGraph.removeItem(this.handlerEdge)
    },
    /**
     * @description 修改链路
     * @param requestData 请求修改节点元素接口的参数
     * @param itemUpData 修改实例上节点的参数
     */
    async updateHyitTopologyItemLink(requestData, itemUpData) {
      return await request({ url: api.itMonitor.updateHyitTopologyItemLink, data: requestData }).then(res => {
        if (res.code === 1) {
          if (itemUpData !== null) {
            // 请求修改接口数据成功后修改拓扑图上的链路数据
            const lineIdx = this.connectLineTypeList.findIndex(lineItem => lineItem.value === itemUpData.linkType)
            // 更新线条样式
            this.handlerEdge.update({
              id: `edge-${itemUpData.id}`,
              style: this.connectLineTypeList[lineIdx].style,
              linkType: itemUpData.linkType,
              sourceZbxItemId: itemUpData.sourceZbxItemId,
              targetZbxItemId: itemUpData.targetZbxItemId,
              sourceZbxItemName: itemUpData.sourceZbxItemName,
              targetZbxItemName: itemUpData.targetZbxItemName,
              sourceAgent: itemUpData.sourceAgent,
              targetAgent: itemUpData.targetAgent
            })
            this.topoGraph.refresh() // 修改样式需要刷新视图
            return ''
          }
        }
      })
    },
    /**
     * @description 修改分组
     * @param requestData 请求修改节点元素接口的参数
     * @param itemUpData 修改实例上节点的参数
     */
    updateHyitTopologyItemGroup(requestData, itemUpData) {
      request({ url: api.itMonitor.updateHyitTopologyItemGroup, data: requestData }).then(res => {
        if (res.code === 1) {
          const idx = this.topoShape.findIndex(item => Number(item.value) === Number(itemUpData.groupType))
          this.handlerCombo.update({ type: this.topoShape[idx].shapeTypeValue, style: { fill: itemUpData.groupColor }, label: itemUpData.groupName })
          this.topoGraph.refresh() // 修改样式需要刷新视图
        }
      })
    }
  }
}
