<template>
  <div ref="wrpBox" class="cmdb-container">
    <div id="container" :style="{width : mapWidth +'px'}" />
    <div v-if="showConextMenu" class="conext-menu" :style="{'left': menuLeft + 'px', 'top': menuTop + 'px'}">
      <div class="conext-menu-item pointer" @click="addBetween">新增关系</div>
      <div class="conext-menu-item pointer" @click="removeNode">删除</div>
    </div>

    <div v-if="showLabel" class="map-label" :style="{top:`${labelStyle.y}px`,left:`${labelStyle.x}px`,position:'absolute'}">
      {{ labelStyle.label }}
    </div>
  </div>
</template>

<script>
import G6 from '@antv/g6'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'CmdbMap',
  props: {
    // 配置项
    itemData: {
      type: Object,
      default() {
        return {}
      }
    },
    newAddNode: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      mapWidth: 0,
      mapHeight: 0,
      cmdbItemData: {},
      mapData: {},
      infoField: {},
      showConextMenu: false,
      menuLeft: 0,
      menuTop: 0,
      contextmenuSelectId: '',
      handlerMapNode: {},
      deviceDetailFnByKey: [
        { defineType: 1, fn: 'getVideoDetail' },
        { defineType: 2, fn: 'getItMonitorDetail' },
        { defineType: 3, fn: 'getOpmDetail' },
        { defineType: 4, fn: 'getRingDetail' },
        { defineType: 5, fn: 'getHrDetail' },
        { defineType: 6, fn: 'getOrgDetail' },
        { defineType: 7, fn: 'getAreaDetail' },
        { defineType: 8, fn: 'getAssetsDetail' },
        { defineType: 9, fn: 'getCmdbDetail' }
      ],
      bindItemIds: [],
      cmdbRelationshipType: [],
      cmdbRelationshipTypeData: [],
      mapItemCountNumber: [],
      relationshipItemIds: [],
      showLabel: false,
      labelStyle: {
        label: '',
        x: 0,
        y: 0
      }
    }
  },
  watch: {

    // 监听新增节点
    newAddNode: {
      async handler(newVal) {
        console.log('监听')
        const that = this
        const model = that.handlerMapNode.getModel()
        const nodeId = that.handlerMapNode.get('id')
        const children = model.children
        let cmdbRelationshipType = []

        // 子节点数量
        const getItemData = await that.findCmdbItemMap({ itemIds: model.isRoot ? model.data.dataId : model.isRelationshipItem ? model.itemId : model.data.relationshipItemId })
        let cmdbItems = []
        if (getItemData.map.count.length)cmdbItems = await this.findCmdbItem(getItemData.map.count.map(it => it.itemId).filter(Boolean))

        const childData = []
        if (getItemData.map) {
          getItemData.map.count.forEach(item => {
            const getItem = that.$tool.findDataItemByAttr(that.mapItemCountNumber, 'itemId', item.id)
            if (!getItem) if (item.count - 1 > 0) that.$set(that.mapItemCountNumber, that.mapItemCountNumber.length, { itemId: item.itemId, count: item.count - 1 })
          })
        }

        // 没有展开要展开出来
        if (children.length === 0) {
          if (getItemData.data.length > 0) {
            getItemData.data.forEach(dataItem => {
              cmdbRelationshipType.push(dataItem.relationshipId)
              const getItem = this.$tool.findDataItemByAttr(this.mapItemCountNumber, 'itemId', dataItem.relationshipItemId)
              childData.push({
                id: that.$tool.guid(),
                isRoot: false,
                label: that.formatText(dataItem.relationshipItemName),
                img: cmdbItems.find(it => +it.id === +dataItem.relationshipItemId)?.itemImageUrl,
                data: { ...dataItem },
                count: getItem ? getItem.count : null,
                children: [],
                dbMapNodeData: dataItem
              })
            })
          }
          const parentData = that.graph.findDataById(nodeId)
          if (!parentData.children) parentData.children = []
          parentData.children = childData
          cmdbRelationshipType = that.$tool.uniqueArray(cmdbRelationshipType)
          // eslint-disable-next-line require-atomic-updates
          that.cmdbRelationshipTypeData = await that.findCmdbRelationshipType(cmdbRelationshipType.toString())
          that.graph.changeData()
        } else {
          // 已经展开直接更新数据
          newVal.forEach(item => {
            cmdbRelationshipType.push(item.relationshipId)
            model.children.push({
              id: that.$tool.guid(),
              isRoot: false,
              label: that.formatText(item.relationshipItemName),
              data: { ...item },
              children: [],
              dbMapNodeData: item
            })
          })
          // eslint-disable-next-line require-atomic-updates
          that.cmdbRelationshipTypeData = await that.findCmdbRelationshipType(cmdbRelationshipType.toString())
          that.graph.updateChild(model, model.id)
        }
        that.graph.refresh()
      },
      deep: true
    }
  },
  mounted() {
    this.mapWidth = this.$refs.wrpBox.clientWidth
    this.mapHeight = window.innerHeight - this.$refs.wrpBox.getBoundingClientRect().top - 10
    this.createMapNodeByData()
  },
  methods: {
    async findCmdbItemTypeRelationship(itemTypeId) {
      const {data, code} = await this.$request({
        url: this.api.cmdb.findCmdbItemTypeRelationship,
        data: { page: 1, limit: -1, itemTypeId }
      })
      if (code === 1) return data
    },

    // 获取数据创建图
    async createMapNodeByData() {
      this.cmdbItemData = this.localStorageOperation('get', 'cmdbItem').row
      this.infoField = this.localStorageOperation('get', 'cmdbItem').infoField
      let newLable = this.formatText(this.cmdbItemData[this.infoField[1]])
      console.log('@存的数据', this.localStorageOperation('get', 'cmdbItem'))

      let labelName = newLable === '' ? this.formatText(this.cmdbItemData.name) : newLable
      let labelNameNull = this.formatText(this.cmdbItemData[this.infoField[1]]) === '' ? 1 : 2

      this.mapData = {
        id: this.$tool.guid(),
        label: labelName,
        oldlabel: labelName,
        img: this.cmdbItemData.itemImageUrl,
        // label: this.formatText(this.cmdbItemData[this.infoField[1]]),
        data: { ...this.cmdbItemData, dataId: this.cmdbItemData['id'], dataName: this.cmdbItemData['name'] },
        isRoot: true,
        children: []
      }
      // console.log('获取初始数据', this.cmdbItemData, this.infoField, this.infoField[0], this.cmdbItemData[this.infoField[0]])
      if (labelNameNull === 1) {
        await this.getCmdbMapItem({ itemIds: this.cmdbItemData.id })
        // const relationshipItem = await this.findCmdbItemTypeRelationship(this.cmdbItemData.itemTypeId)
        // const relationshipItemIds = relationshipItem.map(it => it.relationshipItemTypeId).filter(Boolean)
        await this.getCmdbMapRelationshipItem({ relationshipItemIds: this.cmdbItemData.id })
        // console.log('关系1', this.cmdbItemData, this.cmdbItemData.id, relationshipItemIds)
      } else {
        console.log('关系2', this.cmdbItemData, this.infoField, this.infoField[0], this.cmdbItemData[this.infoField[0]])
        // await this.getCmdbMapItem({ itemIds: 4819 })
        await this.getCmdbMapItem({ itemIds: this.cmdbItemData[this.infoField[0]] })
        await this.getCmdbMapRelationshipItem({ relationshipItemIds: this.cmdbItemData[this.infoField[0]] })
      }

      // 获取关系类型数据
      this.cmdbRelationshipType = this.$tool.uniqueArray(this.cmdbRelationshipType)
      this.cmdbRelationshipTypeData = await this.findCmdbRelationshipType(this.cmdbRelationshipType.toString())
      // 初始化图
      this.initMap()
    },

    // 初始化图
    initMap() {
      const that = this
      // 自定义节点
      G6.registerNode(
        'cmdb-tree-node',
        (cfg) => `
      <group>
         <image style={{ img: ${cfg.img},width:48,height:48,marginLeft: 55 }} />
            <text style={{
              marginTop: -10,
              marginLeft: 60,
              fontWeight: 'bold',
              fontSize: 8,
              fill: '#000'
            }}>{{label}}</text>
        <circle style={{
          stroke: '#f00',
          r: 6,
          fill: '#f00',
          cursor: 'pointer',
          marginTop: -48,
          marginLeft: 100,
          opacity: ${cfg.count ? 1 : 0}
        }} name="circle">
          <text style={{fill: '#fff', fontSize: 8, marginLeft: 98,marginTop: -12, opacity: ${cfg.count ? 1 : 0}}}>{{count}}</text>
        </circle>
      </group>`
      )

      G6.registerEdge('flow-line', {
        draw(cfg, group) {
          const startPoint = cfg.startPoint
          const endPoint = cfg.endPoint
          const { style } = cfg
          return group.addShape('path', {
            attrs: {
              stroke: style.stroke,
              endArrow: style.endArrow,
              path: [
                ['M', startPoint.x, startPoint.y],
                ['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
                ['L', endPoint.x, (startPoint.y + endPoint.y) / 2],
                ['L', endPoint.x, endPoint.y]
              ]
            }
          })
        }
      })

      this.graph = new G6.TreeGraph({
        container: 'container',
        width: this.mapWidth,
        height: this.mapHeight,
        linkCenter: true,
        modes: {
          default: [
            {
              type: 'collapse-expand',
              onChange: function onChange(item, collapsed) {
                const data = item.get('model')
                data.collapsed = collapsed
                return true
              }
            }, 'drag-canvas', 'zoom-canvas'
          ]
        },
        defaultNode: {
          type: 'cmdb-tree-node'
        },
        // defaultNode: {
        //   type: 'image'
        // },
        defaultEdge: {
          style: {
            stroke: '#aaa',
            endArrow: {
              path: 'M 0,0 L 12, 6 L 9,0 L 12, -6 Z',
              fill: '#aaa',
              d: 0
            }
          }
        },
        layout: {
          type: 'dendrogram',
          direction: 'LR',
          radial: true,
          center: [1900 / 2, 800 / 2]
        }
      })

      // 设置节点label内容
      this.graph.node(function(node) {
        return {
          // type: 'image',
          label: node.label,
          size: 16,
          anchorPoints: [
            [0, 0.5],
            [1, 0.5]
          ]
        }
      })

      this.graph.edge(function(edge) {
        const targetNode = that.graph.findById(edge.target).getModel()
        if (!targetNode.dbMapNodeData) return {}
        const getItem = that.$tool.findDataItemByAttr(that.cmdbRelationshipTypeData, 'id', Number(targetNode.dbMapNodeData.relationshipId))
        return {
          color: '#A3B1BF',
          label: getItem ? targetNode.isRelationshipItem ? getItem.relationshipReverse : getItem.relationshipForward : ''
        }
      })

      this.graph.on('node:mouseenter', async function(evt) {
        console.log('evt: ', evt)
        if (that.showLabel) return
        that.showLabel = true
        that.labelStyle.x = evt.canvasX
        that.labelStyle.y = evt.canvasY
        that.labelStyle.label = evt.item._cfg.model.oldlabel
      })

      this.graph.on('node:mouseleave', function(evt) {
        that.showLabel = false
      })
      // 点击元素节点
      this.graph.on('node:click', async function(evt) {
        const { item } = evt
        that.showConextMenu = false
        const model = item.getModel()
        console.log('model: ', model)
        const nodeId = item.get('id')
        const children = model.children
        let cmdbRelationshipType = []

        const getItem = that.$tool.findDataItemByAttr(that.mapItemCountNumber, 'itemId', model.isRelationshipItem ? model.data.itemId : model.data.relationshipItemId)
        model.count = model.count ? null : getItem ? getItem.count : null
        item.update(model)

        if (children.length === 0) {
          if (!model.data.itemId || !model.data.relationshipItemId) return
          // 正向

          console.log('@正向', children.length, model.isRelationshipItem, model.data.relationshipItemId)

          const getItemData = await that.findCmdbItemMap({ itemIds: model.isRelationshipItem ? model.data.itemId : model.data.relationshipItemId })

          const childData = []
          const filtrationId = []
          if (getItemData.data.length > 0) {
            const cmdbItems = await that.findCmdbItem(getItemData.map.count.map(it => it.itemId).filter(Boolean))
            const getItem = that.$tool.findDataItemByAttr(that.mapItemCountNumber, 'itemId', model.isRelationshipItem ? model.data.itemId : model.data.relationshipItemId)
            console.log('getItem: ', getItem)
            filtrationId.push(model.isRelationshipItem ? model.data.relationshipItemId : model.data.itemId)
            console.log(filtrationId)

            getItemData.data.forEach(dataItem => {
              if (filtrationId.indexOf(dataItem.relationshipItemId) === -1) {
                cmdbRelationshipType.push(dataItem.relationshipId)
                childData.push({
                  id: that.$tool.guid(),
                  isRoot: false,
                  label: that.formatText(dataItem.relationshipItemName),
                  oldlabel: dataItem.relationshipItemName,
                  img: cmdbItems.find(it => +it.id === +dataItem.relationshipItemId)?.itemImageUrl,
                  data: { ...dataItem },
                  children: [],
                  count: getItem ? getItem.count : null,
                  isRelationshipItem: false,
                  dbMapNodeData: dataItem
                })
              }
            })
          }
          // 反向

          const getCmdbRelationshipItem = await that.findCmdbItemMap({ relationshipItemIds: model.isRelationshipItem ? model.data.itemId : model.data.relationshipItemId })
          console.log('@反向', getCmdbRelationshipItem)
          if (getCmdbRelationshipItem.data.length > 0) {
            const cmdbItems = await that.findCmdbItem(getCmdbRelationshipItem.map.count.map(it => it.itemId).filter(Boolean))
            const getItem = that.$tool.findDataItemByAttr(that.mapItemCountNumber, 'itemId', model.isRelationshipItem ? model.data.relationshipItemId : model.data.itemId)
            filtrationId.push(model.isRelationshipItem ? model.data.relationshipItemId : model.data.itemId)
            getCmdbRelationshipItem.data.forEach(dataItem => {
              if (filtrationId.indexOf(dataItem.itemId) === -1) {
                cmdbRelationshipType.push(dataItem.relationshipId)
                childData.push({
                  id: that.$tool.guid(),
                  isRoot: false,
                  label: that.formatText(dataItem.itemName),
                  oldlabel: dataItem.itemName,
                  img: cmdbItems.find(it => +it.id === +dataItem.itemId)?.itemImageUrl,
                  data: { ...dataItem },
                  children: [],
                  isRelationshipItem: true,
                  count: getItem ? getItem.count : null,
                  dbMapNodeData: dataItem
                })
              }
            })
          }
          cmdbRelationshipType = that.$tool.uniqueArray(cmdbRelationshipType)
          // eslint-disable-next-line require-atomic-updates
          that.cmdbRelationshipTypeData = await that.findCmdbRelationshipType(cmdbRelationshipType.toString())
          const parentData = that.graph.findDataById(nodeId)
          if (!parentData.children) parentData.children = []
          parentData.children = childData
          that.graph.changeData()
          that.graph.refresh()
        }
      })

      // 点击画布背景
      this.graph.on('canvas:click', function() {
        that.showConextMenu = false
      })

      // 右击节点
      this.graph.on('node:contextmenu', function(evt) {
        evt.preventDefault()
        that.showConextMenu = true
        that.menuLeft = evt.canvasX
        that.menuTop = evt.canvasY
        that.handlerMapNode = evt.item
      })

      this.graph.data(this.mapData)
      this.graph.render()
      this.graph.fitView()

      if (typeof window !== 'undefined') {
        window.onresize = () => {
          this.mapWidth = this.$refs.wrpBox.offsetWidth - 250
          this.mapHeight = this.$refs.wrpBox.offsetHeight
          if (!this.graph || this.graph.get('destroyed')) return
          this.graph.changeSize(this.mapWidth, this.mapHeight)
        }
      }
    },

    // 截断长文本。length 为文本截断后长度，elipsis 是后缀
    formatText(text, length = 6, elipsis = '...') {
      if (!text) return ''
      if (text.length > length) {
        return `${text.substr(0, length)}${elipsis}`
      }
      return text
    },

    // 获取配置项关联关系节点
    async findCmdbItemMap(propData) {
      return new Promise(resolve => {
        request({ url: api.cmdb.findCmdbItemMap, data: { page: 1, limit: -1, ...propData }}).then(res => { if (res.code === 1) resolve(res) })
      })
    },

    // 点击新增关系右键菜单按钮
    async addBetween() {
      this.showConextMenu = false
      const model = this.handlerMapNode.getModel()
      const getItem = this.$tool.findDataItemByAttr(this.deviceDetailFnByKey, 'defineType', model.isRelationshipItem ? model.data.itemSoureceType : model.data.relationshipItemSoureceType)
      if (getItem) {
        if (model.depth !== 0) {
          const getDetail = await this[`${getItem.fn}`](model.isRelationshipItem ? model.data.itemId : model.data.relationshipItemId)
          model.data.dataId = model.isRelationshipItem ? model.data.itemId : model.data.relationshipItemId
          model.data.dataName = model.isRelationshipItem ? model.data.itemName : model.data.relationshipItemName
          model.data.cmdbItemSourceType = getDetail.cmdbItemSourceType || getDetail.itemDefineType
          model.data.cmdbItemTypeId = getDetail.cmdbItemTypeId || getDetail.itemTypeId
        }
      }
      this.$emit('handlerMapNode', { ...model })
      const getItemData = model.data.itemId ? await this.findCmdbItemMap({ itemIds: model.data.itemId }) : null
      const getRelationshipItemData = model.data.relationshipItemId ? await this.findCmdbItemMap({ relationshipItemIds: model.data.relationshipItemId }) : null
      if (getItemData) {
        getItemData.data.forEach(item => {
          this.$set(this.bindItemIds, this.bindItemIds.length, `${item.relationshipItemSoureceType}-${item.relationshipItemId}`)
        })
      }
      if (getRelationshipItemData) {
        getRelationshipItemData.data.forEach(item => {
          this.$set(this.bindItemIds, this.bindItemIds.length, `${item.itemSoureceType}-${item.itemId}`)
        })
      }
      this.bindItemIds = this.$tool.uniqueArray(this.bindItemIds)
      this.$emit('itemBindIds', this.bindItemIds)
    },

    // 点击删除节点
    removeNode() {
      this.showConextMenu = false
      const model = this.handlerMapNode.getModel()
      request({ url: api.cmdb.deleteCmdbItemMap, data: { id: model.data.id }}).then(res => {
        if (res.code === 1) {
          this.graph.removeChild(model.id)
          if (this.bindItemIds.length > 0) {
            const idx = this.bindItemIds.indexOf(`${model.data.itemSoureceType}-${model.data.itemId}`)
            if (idx !== -1) {
              this.bindItemIds.splice(idx, 1)
              this.$emit('itemBindIds', this.$tool.uniqueArray(this.bindItemIds))
            }
          }
        }
      })
    },

    // 查看设备详情 获取出设备绑定的配置项id
    // 资产
    async getAssetsDetail(assetsId) {
      return new Promise(resolve => {
        request({ url: api.assets.getAssetsInfo, data: { assetsId }}).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },
    // it监控
    async getItMonitorDetail(hyHostId) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.getHyitHost, data: { hyHostId }}).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },
    // it运维
    async getOpmDetail(id) {
      return new Promise(resolve => {
        request({ url: api.automationOperations.getHyitOpsServer, data: { id }}).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },
    // 动环
    async getRingDetail(hyHostId) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.getHyitHost, data: { hyHostId }}).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },
    // 人员
    async getHrDetail(id) {
      return new Promise(resolve => {
        request({ url: api.hr.getHrUserInfo, data: { id }}).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },
    // 组织机构
    async getOrgDetail(hyOrgId) {
      return new Promise(resolve => {
        request({ url: api.org.getHyitOrg, data: { hyOrgId }}).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },
    // 区域
    async getAreaDetail(hyAreaId) {
      return new Promise(resolve => {
        request({ url: api.area.getHyitArea, data: { hyAreaId }}).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },
    // cmdb
    async getCmdbDetail(id) {
      return new Promise(resolve => {
        request({ url: api.cmdb.getCmdbItem, data: { id }}).then(res => {
          if (res.code === 1) resolve(res.model)
        })
      })
    },
    // 获取关系信息
    async findCmdbRelationshipType(ids) {
      return new Promise(resolve => {
        request({ url: api.cmdb.findCmdbRelationshipType, data: { page: 1, limit: -1, ids }}).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    async findCmdbItem(ids) {
      const {data, code} = await this.$request({url: this.api.cmdb.findCmdbItem, data: {ids}})
      if (code === 1) return data
    },
    // 获取正向
    async getCmdbMapItem(data, type) {
      let cmdbRelationshipType = []
      const getCmdbItem = await this.findCmdbItemMap(data)
      console.log('getCmdbItem: ', getCmdbItem)
      let cmdbItems = []
      if (getCmdbItem.map.count.length)cmdbItems = await this.findCmdbItem(getCmdbItem.map.count.map(it => it.itemId).filter(Boolean))

      // 正向关系数据数量
      if (getCmdbItem.map) {
        getCmdbItem.map.count.forEach(item => {
          const getItem = this.$tool.findDataItemByAttr(this.mapItemCountNumber, 'itemId', item.itemId)
          if (item.count - 1 > 0) {
            this.$set(this.mapItemCountNumber, getItem ? getItem.index : this.mapItemCountNumber.length, {
              itemId: item.itemId,
              count: item.count - 1
            })
          }
        })
      }
      // 正向关系数据
      if (type !== 'clickNodeExpand' || !type) {
        getCmdbItem.data.forEach(item => {
          cmdbRelationshipType.push(item.relationshipId)
          const getItem = this.$tool.findDataItemByAttr(this.mapItemCountNumber, 'itemId', item.relationshipItemId)
          this.$set(this.mapData.children, this.mapData.children.length, {
            id: this.$tool.guid(),
            isRoot: false,
            label: this.formatText(item.relationshipItemName),
            oldlabel: item.relationshipItemName,
            data: { ...item },
            img: cmdbItems.find(it => +it.id === +item.relationshipItemId)?.itemImageUrl,
            isRelationshipItem: false,
            dbMapNodeData: item,
            count: getItem ? getItem.count : null,
            children: []
          })
        })
      }
      this.cmdbRelationshipType = [...this.cmdbRelationshipType, ...cmdbRelationshipType]
    },
    // 获取反向
    async getCmdbMapRelationshipItem(data, type) {
      let cmdbRelationshipType = []
      const getCmdbRelationshipItem = await this.findCmdbItemMap(data)
      let cmdbItems = []
      if (getCmdbRelationshipItem.map.count.length)cmdbItems = await this.findCmdbItem(getCmdbRelationshipItem.map.count.map(it => it.itemId).filter(Boolean))

      // 反向关系数据数量
      if (getCmdbRelationshipItem.map) {
        getCmdbRelationshipItem.map.count.forEach(item => {
          const getItem = this.$tool.findDataItemByAttr(this.mapItemCountNumber, 'itemId', item.itemId)
          if (item.count - 1 > 0) {
            this.$set(this.mapItemCountNumber, getItem ? getItem.index : this.mapItemCountNumber.length, {
              itemId: item.itemId,
              count: item.count - 1
            })
          }
        })
      }
      // 反向关系数据
      if (type !== 'clickNodeExpand' || !type) {
        getCmdbRelationshipItem.data.forEach(item => {
          cmdbRelationshipType.push(item.relationshipId)
          const getItem = this.$tool.findDataItemByAttr(this.mapItemCountNumber, 'itemId', item.itemId)
          this.$set(this.mapData.children, this.mapData.children.length, {
            id: this.$tool.guid(),
            isRoot: false,
            label: this.formatText(item.itemName),
            oldlabel: item.itemName,
            img: cmdbItems.find(it => +it.id === +item.itemId)?.itemImageUrl,
            isRelationshipItem: true,
            dbMapNodeData: item,
            data: { ...item, isRelationshipItem: true },
            count: getItem ? getItem.count : null,
            children: []
          })
        })
      }
      this.cmdbRelationshipType = [...this.cmdbRelationshipType, ...cmdbRelationshipType]
    }
  }
}
</script>

<style lang="scss" scoped>
.map-label{
  box-shadow: 0 0 5px 0 #eee;
  background-color: #fff;
  padding: 10px;
}
.cmdb-container {
  width: 100%;
}
// 右键菜单样式
.conext-menu {
  position: absolute;
  width: 5%;
  box-shadow: 0 0 15px 1px #ddd;
  border-right: 5px;
  .conext-menu-item {
    font-size: 12px;
    padding: 10px;
    background: #fff;
    width: 100%;
  }
}

</style>
