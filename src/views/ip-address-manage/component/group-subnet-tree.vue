<template>
  <div class="group-subnet-tree">
    <transition-group class="transition-wrapper" name="sort">
      <div
        v-for="groupItem in getTreeList"
        :key="groupItem.treeItemId"
        class="group-tree-item"
        :draggable="groupItem.level === 0"
        @dragstart="dragstart(groupItem)"
        @dragenter="dragenter(groupItem, $event)"
        @dragend="dragend(groupItem, $event)"
        @dragover="dragover($event)"
      >
        <div
          class="tree-item"
          :style="{
            'background': handlerTreeItemVal && handlerTreeItemVal.activeType === 'group' && handlerTreeItemVal.activeItemId === groupItem.treeItemId ? '#cedbee' : ''
          }"
          @click="handlerTreeItem(groupItem)"
        >
          <div class="group-header flex align-item-center space-between">
            <div class="flex align-item-center">
              <img v-if="groupItem.imageUrl" :style="{'margin-left': groupItem.level * 20 +'px'}" :src="groupItem.imageUrl" alt="">
              <img v-else :style="{'margin-left': groupItem.level * 20 +'px'}" src="image/ip-manage/group-default-icon.png" alt="">
              <div class="group-header-name">
                {{ groupItem.treeItemName }}
              </div>
            </div>
            <div>
              <div v-if="groupItem.expand === false"><i class="el-icon-caret-bottom" /></div>
              <div v-if="groupItem.expand === true"><i class="el-icon-caret-top" /></div>
            </div>
          </div>
        </div>
        <div v-if="groupItem.expand" class="tree-children">
          <!-- ip -->
          <div
            v-for="ipItem in groupItem.ip"
            :key="ipItem.treeItemId"
            class="ip-item"
            :style="{
              'padding-left': ipItem.level * 20 +'px',
              'background': handlerTreeItemVal && handlerTreeItemVal.activeType === 'ip' && handlerTreeItemVal.activeItemId === ipItem.treeItemId ? '#cedbee' : ''
            }"
            @click="handlerTreeDetail(ipItem)"
          >
            {{ ipItem.treeItemName }} / {{ ipItem.maskBit }}
          </div>
          <!-- 子级分组 -->
          <group-subnet-tree v-if="groupItem.group.length > 0" :tree-list="groupItem.group" />
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'GroupSubnetTree',
  props: {
    treeList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      // 区域ip分组树形
      getTreeList: [],
      areaGroup: [],
      handlerTreeItemVal: null,
      agentsIds: '',
      agentGroupId: '',
      oldData: null, // 开始排序时按住的旧数据
      newData: null // 拖拽过程的数据
    }
  },
  watch: {
    treeList() {
      this.getTreeList = this.$tool.deepCopy(this.treeList)
    }
  },
  mounted() {
    this.getTreeList = this.$tool.deepCopy(this.treeList)
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
    // 接收分组新增结束更新节点
    this.$EventBus.$on('add-subnet-group', (msg) => {
      if (msg.setInType === 'group') {
        // 查询索引 根据挂载在那个分组的挂载id去查询树形的id
        const getIdxByItemId = this.getTreeList.findIndex(item => item.treeItemId === msg.setInId)
        if (getIdxByItemId !== -1) {
          if (!this.getTreeList[getIdxByItemId].expand) this.$set(this.getTreeList[getIdxByItemId], 'expand', true)
          this.$set(this.getTreeList[getIdxByItemId].group, this.getTreeList[getIdxByItemId].group.length, {
            isGroup: true,
            treeItemId: msg.data.id,
            treeItemName: msg.data.groupName,
            treeParentId: msg.data.parentId,
            expand: false,
            group: [],
            ip: [],
            level: this.getTreeList[getIdxByItemId].level + 1
          })
        }

        // 查询索引 根据挂载在那个分组的挂载id去查询树形的挂载id
        const getIdxByItemParentId = this.getTreeList.findIndex(item => item.treeParentId === msg.setInId)
        if (getIdxByItemParentId !== -1 && msg.setInId === 0) {
          this.$set(this.getTreeList, this.getTreeList.length, {
            isGroup: true,
            treeItemId: msg.data.id,
            treeItemName: msg.data.groupName,
            treeParentId: msg.data.parentId,
            expand: false,
            group: [],
            ip: [],
            level: this.getTreeList[getIdxByItemParentId].level
          })
        }
      }
    })
    // 接收ip新增结束更新节点
    this.$EventBus.$on('add-subnet-ip', (msg) => {
      if (msg.setInType === 'group') {
        const idx = this.getTreeList.findIndex(item => item.treeItemId === msg.setInId)
        console.log(idx, msg.data, this.getTreeList[idx])
        if (idx !== -1) {
          if (!this.getTreeList[idx].expand) this.$set(this.getTreeList[idx], 'expand', true)
          msg.data.forEach(item => {
            this.$set(this.getTreeList[idx].ip, this.getTreeList[idx].ip.length, {
              isIp: true,
              treeItemId: item.id,
              treeItemName: item.netSegment,
              expand: false,
              level: this.getTreeList[idx].level + 1
            })
          })
        }
      }
    })
    // 接收分组删除结束后更新节点
    this.$EventBus.$on('delete-subnet-group', (msg) => {
      const idx = this.getTreeList.findIndex(item => item.treeItemId === msg.deleteId)
      if (idx !== -1) this.getTreeList.splice(idx, 1)
    })
    // 接收ip删除结束更新节点
    this.$EventBus.$on('delete-subnet-ip', (msg) => {
      if (msg.deleteInType === 'group') {
        const pidx = this.getTreeList.findIndex(item => item.treeItemId === msg.deletePId)
        if (pidx !== -1) {
          const idx = this.getTreeList[pidx].ip.findIndex(item => item.treeItemId === msg.deleteId)
          this.getTreeList[pidx].ip.splice(idx, 1)
        }
      }
    })
    // 接收分组更新结束更新节点
    this.$EventBus.$on('update-subnet-group', (msg) => {
      console.log(msg)
      if (msg.fromType === 'group') {
        const pidx = this.getTreeList.findIndex(item => item.treeItemId === msg.fromPid)
        if (pidx !== -1) {
          const idx = this.getTreeList[pidx].group.findIndex(item => item.treeItemId === msg.updateId)
          if (msg.toPid !== msg.fromPid) {
            // 如果更新前的区域id不等于更新后的区域id那么就删除掉节点
            if (idx !== -1) this.getTreeList[pidx].group.splice(idx, 1)
          }
        }
      }
      if (msg.toType === 'group') {
        const pidx = this.getTreeList.findIndex(item => item.treeItemId === msg.toPid)
        if (pidx !== -1) {
          if (msg.toPid !== msg.fromPid) {
            // 重新修改位置
            if (!this.getTreeList[pidx].expand) this.$set(this.getTreeList[pidx], 'expand', true)
            this.$set(this.getTreeList[pidx].group, this.getTreeList[pidx].group.length, {
              isGroup: true,
              treeItemId: msg.data.id,
              treeItemName: msg.data.groupName,
              expand: false,
              group: [],
              ip: [],
              level: this.getTreeList[pidx].level + 1
            })
          } else {
            const idx = this.getTreeList[pidx].group.findIndex(item => item.treeItemId === msg.updateId)
            if (idx !== -1) this.$set(this.getTreeList[pidx].group[idx], 'treeItemName', msg.data.groupName)
          }
        } else {
          const idx = this.getTreeList.findIndex(item => item.treeItemId === msg.updateId)
          if (idx !== -1) this.$set(this.getTreeList[idx], 'treeItemName', msg.data.groupName)
        }
      }
    })
    // 接收ip更新结束更新节点
    this.$EventBus.$on('update-subnet-ip', (msg) => {
      if (msg.fromType === 'group') {
        const pidx = this.getTreeList.findIndex(item => item.treeItemId === msg.fromPid)
        if (pidx !== -1) {
          const idx = this.getTreeList[pidx].ip.findIndex(item => item.treeItemId === msg.updateId)
          if (msg.toPid !== msg.fromPid) {
            // 如果更新前的区域id不等于更新后的区域id那么就删除掉节点
            if (idx !== -1) this.getTreeList[pidx].ip.splice(idx, 1)
          }
        }
      }
      if (msg.toType === 'group') {
        const pidx = this.getTreeList.findIndex(item => item.treeItemId === msg.toPid)
        if (pidx !== -1) {
          if (msg.toPid !== msg.fromPid) {
            // 重新修改位置
            if (!this.getTreeList[pidx].expand) this.$set(this.getTreeList[pidx], 'expand', true)
            this.$set(this.getTreeList[pidx].ip, this.getTreeList[pidx].ip.length, {
              isIp: true,
              treeItemId: msg.data.id,
              treeItemName: msg.data.netSegment,
              expand: false,
              level: this.getTreeList[pidx].level + 1
            })
          } else {
            const idx = this.getTreeList[pidx].ip.findIndex(item => item.treeItemId === msg.updateId)
            if (idx !== -1) this.$set(this.getTreeList[pidx].ip[idx], 'treeItemName', msg.data.groupName)
          }
        }
      }
    })
    // 点击树形节点
    this.$EventBus.$on('handler-tree-item', (msg) => {
      this.handlerTreeItemVal = msg
    })
  },
  methods: {
    // 点击树形节点
    async treeItemClick(item) {
      console.log(item)
      item.expand = !item.expand
      // 设置子级分组
      const getGroup = await this.findOpsIpGroup({ limit: -1, parentId: item.treeItemId })
      // const getIp = await this.findOpsIpAddress({ limit: -1, ipGroupId: item.treeItemId })
      const ipAddressIds = []
      // getIp.forEach(items => ipAddressIds.push(items.id))
      const ipNetSegment = await this.findOpsIpAddressDetailNetSegment({ limit: -1, ipAddressIds: ipAddressIds.toString() })

      if (!getGroup && getGroup.length > 0) return
      getGroup.forEach(items => {
        items.isGroup = true
        items.treeItemId = items.id
        items.treeItemName = items.groupName
        items.expand = false
        items.group = []
        items.ip = []
        items.level = item.level + 1
      })
      // eslint-disable-next-line require-atomic-updates
      item.group = getGroup
      if (!ipNetSegment && ipNetSegment.length > 0) return
      ipNetSegment.forEach(items => {
        items.isIp = true
        items.treeItemId = items.id
        items.treeItemName = items.ip
        items.expand = false
        items.level = item.level + 1
      })
      // eslint-disable-next-line require-atomic-updates
      item.ip = ipNetSegment
    },
    // 查询ip子网分组
    async findOpsIpGroup(query) {
      const { code, data } = await request({
        url: api.ipAddressManage.findOpsIpGroup,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // // 查询ip
    // async findOpsIpAddress(query) {
    //   const { code, data } = await request({
    //     url: api.ipAddressManage.findOpsIpAddress,
    //     data: query
    //   })
    //   if (code !== 1) return
    //   return data
    // },
    // 点击树形节点 查询子网汇总
    async handlerTreeItem(val) {
      val.query = {
        ipGroupId: val.treeItemId, agentGroupId: this.agentGroupId
      }
      this.$EventBus.$emit('summary', val)
      this.$EventBus.$emit('handler-tree-item', { activeItemId: val.treeItemId, activeType: 'group' })
      if (val.expand) {
        val.expand = false
      } else {
        val.expand = !val.expand
        // 设置子级分组
        const getGroup = await this.findOpsIpGroup({ limit: -1, parentId: val.treeItemId })
        // const ipAddressIds = []
        // const ipNetSegment = await this.findOpsIpAddressDetailNetSegment({ limit: -1, ipAddressIds: ipAddressIds.toString() })
        const getIp = await this.findOpsIpAddressNetSegment({ limit: -1, ipGroupId: val.treeItemId, agentGroupId: this.agentGroupId })
        if (!getGroup && getGroup.length > 0) return
        getGroup.forEach(items => {
          items.isGroup = true
          items.treeItemId = items.id
          items.treeItemName = items.groupName
          items.expand = false
          items.group = []
          items.ip = []
          items.level = val.level + 1
        })
        // eslint-disable-next-line require-atomic-updates
        val.group = getGroup
        if (!getIp && getIp.length > 0) return
        getIp.forEach(items => {
          items.isIp = true
          items.treeItemId = items.id
          items.treeItemName = items.netSegment
          items.expand = false
          items.level = val.level + 1
        })
        // eslint-disable-next-line require-atomic-updates
        val.ip = getIp
      }
    },
    // 查询ip
    async findOpsIpAddressNetSegment(query) {
      const { code, data } = await request({
        url: api.ipAddressManage.findOpsIpAddressNetSegment,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 点击树形节点 查询子网详情
    handlerTreeDetail(val) {
      this.$EventBus.$emit('detail', this.$tool.deepCopy(val))
      this.$EventBus.$emit('handler-tree-item', { activeItemId: val.treeItemId, activeType: 'ip' })
    },
    // 查询子网下的网段
    async findOpsIpAddressDetailNetSegment(query) {
      const { data, code } = await request({
        url: api.ipAddressManage.findOpsIpAddressDetailNetSegment,
        data: query
      })
      if (code !== 1) return
      return data
    },
    dragstart(value) {
      this.oldData = value
    },
    // 记录移动过程中信息
    dragenter(value, e) {
      this.newData = value
      e.preventDefault()
    },
    // 拖拽最终操作
    dragend(value, e) {
      console.log(value, e)
      console.log(this.oldData, this.newData)
      if (this.oldData !== this.newData) {
        let oldIndex = this.getTreeList.indexOf(this.oldData)
        let newIndex = this.getTreeList.indexOf(this.newData)
        let newItems = [...this.getTreeList]
        // 删除老的节点
        newItems.splice(oldIndex, 1)
        // 在列表中目标位置增加新的节点
        newItems.splice(newIndex, 0, this.oldData)
        this.getTreeList = [...newItems]
        console.log(oldIndex, newIndex)
        const json = [
          { id: this.oldData.treeItemId, groupIndex: newIndex },
          { id: this.newData.treeItemId, groupIndex: oldIndex }
        ]
        this.$request({
          url: this.api.ipAddressManage.updateOpsIpGroupIndex,
          data: {
            json: JSON.stringify(json)
          }
        })
      }
    },
    // 拖动事件（主要是为了拖动时鼠标光标不变为禁止）
    dragover(e) {
      e.preventDefault()
    }
  }
}
</script>

<style lang="scss" scoped>
.group-subnet-tree {
  .group-tree-item {
    font-size: 14px;
    .tree-item {
      padding: 8px 10px;
      display: block;
      font-size: 14px;
      .group-header {
        img {
          width: 24px;
          margin-right: 5px;
        }
        .group-header-name {
          //font-weight: bold;
        }
      }
    }
    .ip-item {
      font-size: 14px;
      padding: 8px 10px;
    }
  }
}
.sort-move {
  transition: transform 0.3s;
}
</style>
