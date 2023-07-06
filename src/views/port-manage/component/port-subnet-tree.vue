<template>
  <div class="area-subnet-tree">
    <transition-group class="transition-wrapper" name="sort">
      <div
        v-for="item in getTreeList"
        :key="item.id"
        class="pointer"
        :draggable="item.level === 0"
        :style="{'margin-left': item.level * 20 +'px'}"
        @dragstart="dragstart(item)"
        @dragenter="dragenter(item, $event)"
        @dragend="dragend(item, $event)"
        @dragover="dragover($event)"
      >
        <div
          class="tree-item flex space-between align-item-center"
          :class="item.isArea ? 'area-item' : ''"
          :style="{
            'font-weight': 'normal',
            'background': handlerTreeItemVal && handlerTreeItemVal.activeType === 'area' && handlerTreeItemVal.activeItemId === item.treeItemId ? '#cedbee' : ''
          }"
          @click="handlerTreeItem(item)"
        >
          <div class="group-header flex align-item-center space-between">
            <div class="flex align-item-center">
              <img v-if="item.imageUrl" :src="item.imageUrl" alt="">
              <img v-else src="image/ip-manage/group-default-icon.png" alt="">
              <div class="group-header-name">
                {{ item.treeItemName }}
              </div>
            </div>
            <div>
              <div v-if="item.expand === false"><i class="el-icon-caret-bottom" /></div>
              <div v-if="item.expand === true"><i class="el-icon-caret-top" /></div>
            </div>
          </div>
        </div>
        <div v-if="item.expand" class="tree-children">
          <!-- ip -->
          <div
            v-for="ipItem in item.ip"
            :key="ipItem.treeItemId"
            class="ip-item"
            :style="{
              'margin-left': ipItem.level * 20 +'px',
              'background': handlerTreeItemVal && handlerTreeItemVal.activeType === 'ip' && handlerTreeItemVal.activeItemId === ipItem.treeItemId ? '#cedbee' : ''
            }"
            @click="handlerTreeDetail(ipItem)"
          >
            <div class="ItemName overflow-text-a" :title="ipItem.treeItemName">{{ ipItem.treeItemName }}</div>
            <div class="ItemIp">{{ ipItem.treeItemIp }}</div>
          </div>
          <!-- 分组 -->
          <PortSubnetTree :tree-list="item.group" />
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
// import GroupSubnetTree from './group-subnet-tree'

export default {
  name: 'PortSubnetTree',
  components: {
    // GroupSubnetTree
  },
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
      agentsIds: '',
      // 区域ip分组树形
      areaGroup: [],
      handlerTreeItemVal: null,
      propTreeList: [],
      hostData: [],
      oldData: null, // 开始排序时按住的旧数据
      newData: null, // 拖拽过程的数据
      getTreeList: []
    }
  },
  watch: {
    treeList: {
      handler(newVal) {
        this.getTreeList = this.$tool.deepCopy(newVal)
      },
      deep: true
    }
  },
  mounted() {
    this.getTreeList = this.$tool.deepCopy(this.treeList)
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    // 接收设备新增结束更新节点
    this.$EventBus.$on('add-subnet-equipment', (msg) => {
      if (msg.setInType === 'area') {
        const idx = this.getTreeList.findIndex(item => item.treeItemId === msg.setInId)
        if (idx !== -1) {
          if (!this.getTreeList[idx].expand) {
            this.$set(this.getTreeList[idx], 'expand', true)
          } else if (this.getTreeList[idx].expand) {
            this.$set(this.getTreeList[idx], 'expand', false)
          }
          this.$set(this.getTreeList[idx], 'expand', true)
          this.$set(this.getTreeList[idx], 'ip', [])
          msg.data.forEach(item => {
            this.$set(this.getTreeList[idx].ip, this.getTreeList[idx].ip.length, {
              isIp: true,
              treeItemId: item.id,
              treeItemName: item.deviceName,
              treeItemIp: item.ip,
              groupId: item.groupId,
              expand: false,
              level: this.getTreeList[idx].level + 1
            })
          })
        }
      }
    })
    // 接收设备删除结束更新节点
    this.$EventBus.$on('delete-equipment-ip', (msg) => {
      if (msg.deleteInType === 'area') {
        const pidx = this.getTreeList.findIndex(item => item.treeItemId === msg.deletePId)
        if (pidx !== -1) {
          // 因为视图不刷新，就把树关了再打开以更新树
          if (!this.getTreeList[pidx].expand) {
            this.$set(this.getTreeList[pidx], 'expand', true)
          } else if (this.getTreeList[pidx].expand) {
            this.$set(this.getTreeList[pidx], 'expand', false)
          }
          this.$set(this.getTreeList[pidx], 'expand', true)
          const idx = this.getTreeList[pidx].ip.findIndex(item => item.treeItemId === msg.deleteId)
          this.getTreeList[pidx].ip.splice(idx, 1)
        }
      }
    })
    // 点击树形节点
    this.$EventBus.$on('handler-tree-item-equipment', (msg) => {
      this.handlerTreeItemVal = msg
    })
  },
  methods: {
    async findPortDeviceData(query) {
      const res = await request({
        url: api.port.findPortDevice,
        data: query || this.listQuery
      })
      if (res.code !== 1) return
      return res.data
    },
    async findPortDevice(query) {
      const { code, data } = await request({
        url: api.port.findPortDevice,
        data: { ...query }
      })
      if (code !== 1) return
      return data
    },
    // 点击树形分组节点 查询设备
    async handlerTreeItem(val) {
      this.$EventBus.$emit('summary-equipment', { query: { groupId: val.treeItemId, agents: this.agentsIds }, ...val })
      this.$EventBus.$emit('handler-tree-item-equipment', { activeItemId: val.id, activeType: 'area' })
      if (val.expand) {
        val.expand = false
      } else {
        // 设置子级分组
        const getGroup = await this.findPortDeviceGroup({ limit: -1, parentId: val.treeItemId })
        if (!getGroup && getGroup.length > 0) return
        getGroup.forEach(items => {
          items.isArea = true
          items.treeItemId = items.id
          items.treeItemName = items.portDeviceGroup
          items.expand = false
          items.group = []
          items.level = val.level + 1
        })
        // eslint-disable-next-line require-atomic-updates
        val.group = getGroup
        const getIp = await this.findPortDeviceData({ limit: -1, groupId: val.treeItemId })
        if (!getIp && getIp.length > 0) return
        console.log(getIp)
        getIp.forEach(items => {
          items.isIp = true
          items.treeItemId = items.id
          items.treeItemName = items.deviceName
          items.treeItemIp = items.ip
          items.expand = false
          items.level = val.level + 1
        })
        const ids = []
        getIp.forEach(item => {
          ids.push(item.hostid)
        })
        await request({
          url: api.itMonitor.findHyitHost,
          data: { ids }
        }).then(res => {
          if (res.code === 1) {
            this.hostData = res.data
          }
        })
        getIp.forEach(item => {
          this.hostData.forEach(lostItem => {
            if (Number(item.hostid) === Number(lostItem.hyHostId)) {
              this.$set(item, 'hyNetState', lostItem.hyNetState)
            }
          })
        })
        // eslint-disable-next-line require-atomic-updates
        val.ip = getIp
        // eslint-disable-next-line require-atomic-updates
        if (val.id !== undefined) {
          this.getTreeList.forEach(item => {
            item.expand = item.id === val.id
          })
        }
        console.log(val)
      }
    },
    // 点击树形节点 查询子网详情
    handlerTreeDetail(val) {
      this.handlerTreeItem({ treeItemId: val.groupId })
      this.$EventBus.$emit('handler-tree-item-equipment', { activeItemId: val.treeItemId, activeType: 'ip' })
      this.$EventBus.$emit('handler-tree-show-details', { val: val })
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
          url: this.api.port.updatePortDeviceGroupIndex,
          data: {
            json: JSON.stringify(json)
          }
        })
      }
    },
    // 拖动事件（主要是为了拖动时鼠标光标不变为禁止）
    dragover(e) {
      e.preventDefault()
    },
    // 查询上级分组
    async findPortDeviceGroup(query) {
      const { code, data } = await request({
        url: api.port.findPortDeviceGroup,
        data: query
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.ItemName {
  font-size: 16px;
}
.group-header {
  width: 100%;
        img {
          width: 24px;
          margin-right: 5px;
        }
        .group-header-name {
          //font-weight: bold;
        }
      }
.ItemIp {
  font-size: 14px;
  color: rgb(170,170,170);
}
.area-subnet-tree {
  .tree-item {
    display: block;
    font-size: 14px;
  }
  .area-item {
    color: #000;
    font-weight: bold;
    padding: 8px 10px;
  }
  .ip-item {}
  .ip-goup-item {}
  .active-item {
    background: #d9e3f2;
  }
  .tree-children {
    .ip-item {
      font-size: 14px;
      padding: 8px 10px;
    }
  }
}
</style>
