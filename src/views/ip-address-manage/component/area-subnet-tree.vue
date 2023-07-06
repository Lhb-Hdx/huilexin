<template>
  <div class="area-subnet-tree">
    <div
      v-for="item in treeList"
      :key="item.treeItemId"
      class="pointer"
    >
      <div
        class="tree-item flex space-between align-item-center"
        :class="item.isArea ? 'area-item' : ''"
        :style="{
          'text-indent' :item.level * 20 +'px',
          'font-weight': 'normal',
          'background': handlerTreeItemVal && handlerTreeItemVal.activeType === 'area' && handlerTreeItemVal.activeItemId === item.treeItemId ? '#cedbee' : ''
        }"
        @click="handlerTreeItem(item)"
      >
        {{ item.treeItemName }}
        <!-- <div @click.stop="treeItemClick(item)"> -->
        <div>
          <div v-if="item.expand === false"><i class="el-icon-caret-bottom" /></div>
          <div v-if="item.expand === true"><i class="el-icon-caret-top" /></div>
        </div>
      </div>
      <div v-if="item.expand" class="tree-children">
        <!-- ip -->
        <div
          v-for="ipItem in item.ip"
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
        <!-- 分组 -->
        <group-subnet-tree v-if="item.group.length > 0" :tree-list="item.group" />
        <!-- 子级区域 -->
        <!-- <AreaSubnetTree :tree-list="item.children" /> -->
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import GroupSubnetTree from './group-subnet-tree'

export default {
  name: 'AreaSubnetTree',
  components: {
    GroupSubnetTree
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
      agentGroupId: '',
      // 区域ip分组树形
      areaGroup: [],
      handlerTreeItemVal: null
    }
  },
  watch: {
    treeList() {
      return this.treeList
    }
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
    // 接收分组新增结束更新节点
    this.$EventBus.$on('add-subnet-group', (msg) => {
      if (msg.setInType === 'area') {
        const idx = this.treeList.findIndex(item => item.treeItemId === msg.setInId)
        if (idx !== -1) {
          if (!this.treeList[idx].expand) this.$set(this.treeList[idx], 'expand', true)
          this.$set(this.treeList[idx].group, this.treeList[idx].group.length, {
            isGroup: true,
            treeItemId: msg.data.id,
            treeItemName: msg.data.groupName,
            expand: false,
            group: [],
            ip: [],
            level: this.treeList[idx].level + 1
          })
        }
      }
    })
    // 接收ip新增结束更新节点
    this.$EventBus.$on('add-subnet-ip', (msg) => {
      if (msg.setInType === 'area') {
        const idx = this.treeList.findIndex(item => item.treeItemId === msg.setInId)
        if (idx !== -1) {
          if (!this.treeList[idx].expand) this.$set(this.treeList[idx], 'expand', true)
          msg.data.forEach(item => {
            console.log(item)
            this.$set(this.treeList[idx].ip, this.treeList[idx].ip.length, {
              isIp: true,
              treeItemId: item.id,
              treeItemName: item.netSegment,
              expand: false,
              level: this.treeList[idx].level + 1
            })
          })
        }
      }
    })
    // 接收ip删除结束更新节点
    this.$EventBus.$on('delete-subnet-ip', (msg) => {
      if (msg.deleteInType === 'area') {
        const pidx = this.treeList.findIndex(item => item.treeItemId === msg.deletePId)
        if (pidx !== -1) {
          const idx = this.treeList[pidx].ip.findIndex(item => item.treeItemId === msg.deleteId)
          this.treeList[pidx].ip.splice(idx, 1)
        }
      }
    })
    // 接收分组更新结束更新节点
    this.$EventBus.$on('update-subnet-group', (msg) => {
      if (msg.fromType === 'area') {
        const pidx = this.treeList.findIndex(item => item.treeItemId === msg.fromPid)
        if (pidx !== -1) {
          const idx = this.treeList[pidx].group.findIndex(item => item.treeItemId === msg.updateId)
          if (msg.toPid !== msg.fromPid) {
            // 如果更新前的区域id不等于更新后的区域id那么就删除掉节点
            if (idx !== -1) this.treeList[pidx].group.splice(idx, 1)
          }
        }
      }
      if (msg.toType === 'area') {
        const pidx = this.treeList.findIndex(item => item.treeItemId === msg.toPid)
        if (pidx !== -1) {
          if (msg.toPid !== msg.fromPid) {
            // 重新修改位置
            if (!this.treeList[pidx].expand) this.$set(this.treeList[pidx], 'expand', true)
            this.$set(this.treeList[pidx].group, this.treeList[pidx].group.length, {
              isGroup: true,
              treeItemId: msg.data.id,
              treeItemName: msg.data.groupName,
              expand: false,
              group: [],
              ip: [],
              level: this.treeList[pidx].level + 1
            })
          } else {
            const idx = this.treeList[pidx].group.findIndex(item => item.treeItemId === msg.updateId)
            if (idx !== -1) this.$set(this.treeList[pidx].group[idx], 'treeItemName', msg.data.groupName)
          }
        }
      }
    })
    // 接收ip更新结束更新节点
    this.$EventBus.$on('update-subnet-ip', (msg) => {
      if (msg.fromType === 'area') {
        const pidx = this.treeList.findIndex(item => item.treeItemId === msg.fromPid)
        if (pidx !== -1) {
          const idx = this.treeList[pidx].ip.findIndex(item => item.treeItemId === msg.updateId)
          if (msg.toPid !== msg.fromPid) {
            // 如果更新前的区域id不等于更新后的区域id那么就删除掉节点
            if (idx !== -1) this.treeList[pidx].ip.splice(idx, 1)
          }
        }
      }
      if (msg.toType === 'area') {
        const pidx = this.treeList.findIndex(item => item.treeItemId === msg.toPid)
        console.log(pidx, msg)
        if (pidx !== -1) {
          if (msg.toPid !== msg.fromPid) {
            // 重新修改位置
            if (!this.treeList[pidx].expand) this.$set(this.treeList[pidx], 'expand', true)
            this.$set(this.treeList[pidx].ip, this.treeList[pidx].ip.length, {
              isIp: true,
              treeItemId: msg.data.id,
              treeItemName: msg.data.netSegment,
              expand: false,
              level: this.treeList[pidx].level + 1
            })
          } else {
            const idx = this.treeList[pidx].ip.findIndex(item => item.treeItemId === msg.updateId)
            if (idx !== -1) this.$set(this.treeList[pidx].ip[idx], 'treeItemName', msg.data.groupName)
          }
        }
      }
    })
    // 点击树形节点
    this.$EventBus.$on('handler-tree-item', (msg) => {
      console.log(msg)
      this.handlerTreeItemVal = msg
    })
  },
  methods: {
    // 点击树形节点
    // async treeItemClick(item) {
    //   item.expand = !item.expand
    //   // 设置子级分组
    //   const getGroup = await this.findOpsIpGroup({ limit: -1, areaId: item.treeItemId })
    //   const getIp = await this.findOpsIpAddressNetSegment({ limit: -1, areaId: item.treeItemId })
    //   if (!getGroup && getGroup.length > 0) return
    //   getGroup.forEach(items => {
    //     items.isGroup = true
    //     items.treeItemId = items.id
    //     items.treeItemName = items.groupName
    //     items.expand = false
    //     items.group = []
    //     items.ip = []
    //     items.level = 1
    //   })
    //   // eslint-disable-next-line require-atomic-updates
    //   item.group = getGroup
    //   if (!getIp && getIp.length > 0) return
    //   getIp.forEach(items => {
    //     items.isIp = true
    //     items.treeItemId = items.id
    //     items.treeItemName = items.netSegment
    //     items.expand = false
    //     items.level = item.level + 1
    //   })
    //   // eslint-disable-next-line require-atomic-updates
    //   item.ip = getIp
    // },
    // 查询ip子网分组
    async findOpsIpGroup(query) {
      const { code, data } = await request({
        url: api.ipAddressManage.findOpsIpGroup,
        data: query
      })
      if (code !== 1) return
      return data
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
    // 点击树形节点 查询子网汇总
    async handlerTreeItem(val) {
      console.log(val)
      this.$EventBus.$emit('summary', { query: { areaId: val.treeItemId, agentGroupId: this.agentGroupId }, ...val })
      this.$EventBus.$emit('handler-tree-item', { activeItemId: val.treeItemId, activeType: 'area' })
      // =========================
      // val.expand = !val.expand
      if (val.expand) {
        val.expand = false
      } else {
      // 设置子级分组
        const getGroup = await this.findOpsIpGroup({ limit: -1, areaId: val.treeItemId })
        console.log(getGroup)
        const getIp = await this.findOpsIpAddressNetSegment({ limit: -1, areaId: val.treeItemId, agentGroupId: this.agentGroupId })
        console.log(getIp)

        if (!getGroup && getGroup.length > 0) return
        getGroup.forEach(items => {
          items.isGroup = true
          items.treeItemId = items.id
          items.treeItemName = items.groupName
          items.expand = false
          items.group = []
          items.ip = []
          items.level = 1
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
        if (val.hyAreaId !== undefined) {
          this.treeList.forEach(item => {
            if (item.hyAreaId === val.hyAreaId) {
              item.expand = true
            } else {
              item.expand = false
            }
          })
        }
      }
      // ========================
    },
    // 点击树形节点 查询子网详情
    handlerTreeDetail(val) {
      console.log(val)
      this.$EventBus.$emit('detail', val)
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
    }
  }
}
</script>

<style lang="scss" scoped>
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
