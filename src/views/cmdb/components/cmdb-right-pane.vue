<template>
  <div v-if="drawerCmdbItemBox" class="cmdb-right-pane">
    <div class="right-pane-header">
      <div class="pane-header-title">新增关系</div>
    </div>
    <div class="right-pane-body">
      <el-tree
        ref="treeMenu"
        lazy
        :load="loadNode"
        :data="itemTreeData"
        :show-checkbox="true"
        node-key="id"
        :default-expanded-keys="itemTreeExpandedData"
        :default-checked-keys="itemTreeCheckedData"
        :props="itemTreeProps"
        :check-on-click-node="false"
        :expand-on-click-node="false"
        check-strictly
        @check-change="checkChange"
        @check="handleNode"
      />
    </div>
    <div class="right-pane-footer">
      <el-button type="primary" @click="saveCmdbItemBetweenMap">保存</el-button>
      <el-button type="default" @click="drawerCmdbItemBox = false">取消</el-button>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'CmdbRightPane',
  props: {
    changePaneKey: {
      type: String,
      default: ''
    },
    mapNodeData: {
      type: Object,
      default() {
        return {}
      }
    },
    mapBindIds: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      drawerCmdbItemBox: false,
      itemTreeData: [],
      itemTreeProps: {
        children: 'children',
        label: 'name'
      },
      itemTreeCheckedData: [],
      itemTreeExpandedData: [],
      itemDataByList: [],
      defineCmdbItemKey: [
        { ids: [43, 42, 41, 40, 39], key: 'findOpm' },
        { ids: [1], key: 'findVideo' },
        { ids: [9], key: 'findHr' },
        { ids: [8], key: 'findRing' },
        { ids: [38, 37, 36, 35, 34, 33, 32, 31], key: 'findItMonitor' },
        { ids: [10], key: 'findOrg' },
        { ids: [12], key: 'findAssets' },
        { ids: [11], key: 'findArea' }
      ],
      relationshipItemTypeIds: [],
      allRelationshipItemTypeIds: [],
      itemSoureceType: ''
    }
  },
  watch: {
    mapNodeData: {
      async handler() {
        this.drawerCmdbItemBox = true
        this.itemTreeData = []
        // 查询被绑定的配置项的关系配置
        // 配置项的正向关系
        const cmdbItemTypeRelationsData = await this.findCmdbItemTypeRelations({ itemTypeId: this.mapNodeData.data.cmdbItemTypeId })
        // 配置项的反向关系
        const cmdbItemTypeRelationsDataByRelationship = await this.findCmdbItemTypeRelations({ relationshipItemTypeId: this.mapNodeData.data.cmdbItemTypeId })
        console.log(cmdbItemTypeRelationsDataByRelationship)
        const relationshipItemTypeIds = []
        const allRelationshipItemTypeIds = []
        if (cmdbItemTypeRelationsData.length > 0) {
          let ids = []
          cmdbItemTypeRelationsData.forEach(item => {
            if (item.relationshipItemTypeId !== null) ids.push(item.relationshipItemTypeId)
          })
          cmdbItemTypeRelationsDataByRelationship.forEach(item => {
            const idx = ids.indexOf(item.itemTypeId)
            if (item.itemTypeId !== null && idx === -1) ids.push(item.itemTypeId)
          })
          ids = this.$tool.uniqueArray(ids)
          const getCmdbItemType = await this.findCmdbItemType(ids.toString())
          if (getCmdbItemType.length > 0) {
            getCmdbItemType.forEach(items => {
              relationshipItemTypeIds.push(items.rootId === 0 ? items.id : items.rootId)
              allRelationshipItemTypeIds.push(items.id)
              allRelationshipItemTypeIds.push(items.rootId)
            })
          }
          this.relationshipItemTypeIds = relationshipItemTypeIds
          this.allRelationshipItemTypeIds = allRelationshipItemTypeIds
          this.findCmdbConfigItem(relationshipItemTypeIds)
        }
      },
      deep: true
    }
  },
  methods: {
    // 获取cmdb配置项列表
    findCmdbConfigItem(ids) {
      request({ url: api.cmdb.findCmdbItemType, data: { page: 1, limit: -1 }}).then(res => {
        if (res.code === 1) {
          this.itemDataByList = res.data
          const firstLevel = []
          res.data.forEach(item => {
            item.isCmdbConfigItem = true
            item.disabled = true
            if (!item.parentId && ids.indexOf(item.id) !== -1) firstLevel.push(item)
          })
          this.itemTreeData = this.$tool.listToTree(firstLevel, 0, 0, 'id', 'parentId')
        }
      })
    },
    async loadNode(node, resolve) {
      if (node.data.length === 0) return resolve([])
      if (!node.data.isCmdbConfigItem) return resolve([])
      let getCmdbItem = []
      this.itemDataByList.forEach(item => {
        if (item.parentId === node.data.id) {
          if (this.allRelationshipItemTypeIds.indexOf(item.rootId) !== -1 && this.allRelationshipItemTypeIds.indexOf(item.id) !== -1) {
            item.level = node.data.level + 1
            item.expand = false
            item.parentId = node.data.id
            item.isCmdbConfigItem = true
            item.disabled = true
            getCmdbItem = [...getCmdbItem, item]
          }
        }
      })
      if (getCmdbItem.length === 0) {
        let key = ''
        this.defineCmdbItemKey.forEach(item => { if (item.ids.indexOf(node.data.id) !== -1) key = item.key })
        // eslint-disable-next-line require-atomic-updates
        getCmdbItem = key !== '' ? await this[key](node.data) : await this.findCmdbItem(node.data)
      }
      const getCmdbItemResult = []
      getCmdbItem.forEach(item => {
        if (this.mapBindIds.indexOf(item.id) === -1) getCmdbItemResult.push(item)
      })
      resolve(getCmdbItemResult)
    },
    checkChange(a, b, c) {
      this.reloadTemplate = this.$tool.guid()
      this.checkStatus = b
      // 如果为取消
      if (b === false) {
      // 如果当前节点有子集
        if (a.children) {
        // 循环子集将他们的选中取消
          a.children.map(item => {
            this.$refs.treeMenu.setChecked(item.menuId, false)
          })
        }
      } else {
      // 否则(为选中状态)
      // 判断父节点id是否为空
        if (a.parentId !== 0) {
        // 如果不为空则将其选中
          this.$refs.treeMenu.setChecked(a.parentId, true)
        }
      }
    },
    handleNode(nodeData) {
      const node = this.$refs.treeMenu.getNode(nodeData) // 获取节点node数据
      setTimeout(() => {
        this.childNodesChange(node)
      }, 1)
    },
    childNodesChange(node) {
      const len = node.childNodes.length
      for (let i = 0; i < len; i++) {
        node.childNodes[i].checked = this.checkStatus
        this.childNodesChange(node.childNodes[i])
      }
    },
    // 查询设备列表
    // 1 视频设备 2 it监控设备 3 it运维设备 4 动环设备 5 人员 6 组织机构 7 区域 8 资产 9 自定义
    // 资产
    async findAssets(node) {
      return new Promise(resolve => {
        request({ url: api.assets.findAssetsInfo, data: { page: 1, limit: -1, cmdbItemTypeId: node.id }}).then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              item.relationshipItemId = item.assetsId
              item.dataId = item.assetsId
              item.id = `8-${item.assetsId}`
              item.name = item.assetsName
              item.level = node.level + 1
              item.expand = true
              item.children = []
              item.parentId = node.id
              item.isCmdbConfigItem = false
              item.relationshipItemTypeId = node.id
              item.relationshipItemSoureceType = 8
            })
            resolve(res.data)
          }
        })
      })
    },
    // 区域
    async findArea(node) {
      return new Promise(resolve => {
        request({ url: api.area.findHyitArea, data: { page: 1, limit: -1, cmdbItemTypeId: node.id }}).then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              item.relationshipItemId = item.hyAreaId
              item.dataId = item.hyAreaId
              item.id = `7-${item.hyAreaId}`
              item.name = item.hyAreaName
              item.level = node.level + 1
              item.expand = true
              item.children = []
              item.parentId = node.id
              item.isCmdbConfigItem = false
              item.relationshipItemTypeId = node.id
              item.relationshipItemSoureceType = 7
            })
            resolve(res.data)
          }
        })
      })
    },
    // 组织机构
    async findOrg(node) {
      return new Promise(resolve => {
        request({ url: api.org.findHyitOrg, data: { page: 1, limit: -1, cmdbItemTypeId: node.id }}).then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              item.relationshipItemId = item.hyOrgId
              item.dataId = item.hyOrgId
              item.id = `6-${item.hyOrgId}`
              item.name = item.hyOrgName
              item.level = node.level + 1
              item.expand = true
              item.children = []
              item.parentId = node.id
              item.isCmdbConfigItem = false
              item.relationshipItemTypeId = node.id
              item.relationshipItemSoureceType = 6
            })
            resolve(res.data)
          }
        })
      })
    },
    // 人员
    async findHr(node) {
      return new Promise(resolve => {
        request({ url: api.hr.findHrUserInfo, data: { page: 1, limit: -1, cmdbItemTypeId: node.id, companyId: this.$auth.getUserSession().companyId }}).then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              item.relationshipItemId = item.id
              item.dataId = item.id
              item.id = `5-${item.id}`
              item.name = item.userRealName
              item.level = node.level + 1
              item.expand = true
              item.children = []
              item.parentId = node.id
              item.isCmdbConfigItem = false
              item.relationshipItemTypeId = node.id
              item.relationshipItemSoureceType = 5
            })
            resolve(res.data)
          }
        })
      })
    },
    // 动环设备
    async findRing(node) {
      return new Promise(resolve => {
        request({ url: api.powerEnv.findHyitHost, data: { page: 1, limit: -1, hyDevTypeId: 2, cmdbItemTypeId: node.id }}).then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              item.relationshipItemId = item.hyHostId
              item.dataId = item.hyHostId
              item.id = `4-${item.hyHostId}`
              item.name = item.hyHostName
              item.level = node.level + 1
              item.expand = true
              item.children = []
              item.parentId = node.id
              item.isCmdbConfigItem = false
              item.relationshipItemTypeId = node.id
              item.relationshipItemSoureceType = 4
            })
            resolve(res.data)
          }
        })
      })
    },
    // it运维设备
    async findOpm(node) {
      return new Promise(resolve => {
        request({ url: api.automationOperations.findHyitOpsServer, data: { page: 1, limit: -1, cmdbItemTypeId: node.id }}).then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              item.relationshipItemId = item.id
              item.dataId = item.id
              item.id = `3-${item.id}`
              item.name = item.serverName
              item.level = node.level + 1
              item.expand = true
              item.children = []
              item.parentId = node.id
              item.isCmdbConfigItem = false
              item.relationshipItemTypeId = node.id
              item.relationshipItemSoureceType = 3
            })
            resolve(res.data)
          }
        })
      })
    },
    // it监控设备
    async findItMonitor(node) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitHost, data: { page: 1, limit: -1, hyDevTypeId: 1, cmdbItemTypeId: node.id, agents: this.sessionStorageOperation('get', 'agentId') }}).then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              item.relationshipItemId = item.hyHostId
              item.dataId = item.hyHostId
              item.id = `2-${item.hyHostId}`
              item.name = item.hyMarkName
              item.level = node.level + 1
              item.expand = true
              item.children = []
              item.parentId = node.id
              item.isCmdbConfigItem = false
              item.relationshipItemTypeId = node.id
              item.relationshipItemSoureceType = 2
            })
            resolve(res.data)
          }
        })
      })
    },
    // 视频设备
    async findVideo(node) {
      return new Promise(resolve => {
        request({ url: api.video.findVideoDvr, data: { page: 1, limit: -1, cmdbItemTypeId: node.id }}).then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              item.relationshipItemId = item.dvrId
              item.dataId = item.dvrId
              item.id = `1-${item.dvrId}`
              item.name = item.title
              item.level = node.level + 1
              item.expand = true
              item.children = []
              item.parentId = node.id
              item.isCmdbConfigItem = false
              item.relationshipItemTypeId = node.id
              item.relationshipItemSoureceType = 1
            })
            resolve(res.data)
          }
        })
      })
    },
    // 自定义的cmdb配置项
    async findCmdbItem(node) {
      return new Promise(resolve => {
        request({ url: api.cmdb.findCmdbItem, data: { page: 1, limit: -1, itemTypeId: node.id }}).then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              item.relationshipItemId = item.id
              item.dataId = item.id
              item.id = `9-${item.id}`
              item.level = node.level + 1
              item.expand = true
              item.children = []
              item.parentId = node.id
              item.isCmdbConfigItem = false
              item.relationshipItemTypeId = node.id
              item.relationshipItemSoureceType = 9
            })
            resolve(res.data)
          }
        })
      })
    },
    // 保存关系
    async saveCmdbItemBetweenMap() {
      // 查询被绑定的配置项的关系配置
      const cmdbItemTypeRelationsData = await this.findCmdbItemTypeRelations({ itemTypeId: this.mapNodeData.data.cmdbItemTypeId })
      // 关系为空
      if (cmdbItemTypeRelationsData.length === 0) return this.$message.error('请先为被关系的配置项关联配置关系')
      // 存在关系
      const selectIds = this.$refs.treeMenu.getCheckedNodes()
      const saveData = []
      selectIds.forEach(item => {
        if (!item.isCmdbConfigItem) {
          const getItem = this.$tool.findDataItemByAttr(cmdbItemTypeRelationsData, 'relationshipItemTypeId', Number(item.relationshipItemTypeId))
          if (getItem) {
            const itemSoureceTypeStorage = this.localStorageOperation('get', 'itemSoureceType')
            saveData.push({
              itemId: this.mapNodeData.data.dataId,
              itemName: this.mapNodeData.data.dataName,
              itemSoureceType: itemSoureceTypeStorage.itemSoureceType,
              relationshipItemId: item.relationshipItemId,
              relationshipItemSoureceType: item.relationshipItemSoureceType,
              relationshipItemName: item.name,
              relationshipId: getItem.relationshipTypeId
            })
          }
        }
      })
      this.insertCmdbItemMaps(saveData)
    },
    // 获取多个配置项关联关系
    async findCmdbItemTypeRelations(data) {
      return new Promise(resolve => {
        request({ url: api.cmdb.findCmdbItemTypeRelationship, data: { page: 1, limit: -1, ...data }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 获取关系类型
    async findCmdbRelationshipType(id) {
      return new Promise(resolve => {
        request({ url: api.cmdb.findCmdbRelationshipType, data: { page: 1, limit: -1, id }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 批量新增配置关联
    insertCmdbItemMaps(data) {
      request({ url: api.cmdb.insertCmdbItemMaps, data: { json: JSON.stringify(data) }}).then(res => {
        if (res.code === 1) {
          if (res.code === 1) this.$emit('addMapNodeSuccess', data)
          this.drawerCmdbItemBox = false
        }
      })
    },
    async findCmdbItemType(ids) {
      return new Promise(resolve => {
        request({ url: api.cmdb.findCmdbItemType, data: { page: 1, limit: -1, ids }}).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.cmdb-right-pane {
  width: 30%;
  position: absolute;
  right: 0;
  top: 0;
  background: #f3f6fa;
  height: 100%;
  .right-pane-header {
    background: #e7edf6;
    padding: 14px;
    font-size: 14px;
    // .pane-header-title {}
  }
  .right-pane-body {
    padding: 14px;
    height: calc(100% - 164px);
    overflow-y: scroll;
  }
  .right-pane-footer {
    height: 100px;
    width: 100%;
    padding: 14px;
    position: absolute;
    bottom: 0;
  }
}
::v-deep .el-checkbox__input.is-disabled {
  display: none;
}
</style>
