<template>
  <div class="list-wrapper">
    <ul class="list">
      <li v-for="item in topoList" :key="item.id" class="flexBox space-between" :class="['list-item', { active: activeId == item.id }]" @click="onItemClick(item)">
        <span class="topo-name overflow-text-a">{{ item.name }}</span>
        <span class="font-bold" :class="item.statues == 1 ? 'success' : 'danger'">{{ item.statues == 1 ? '启用' : '禁用' }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TopoList',
  props: {
    topoList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      findHyitTopologyInfoQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      agentGroupId: '',
      list: [],
      activeId: ''
    }
  },
  mounted() {
    this.agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
    if (this.topoList.length > 0) this.activeId = this.topoList[0].id
  },
  methods: {
    // 点击拓扑列表项
    onItemClick(item) {
      this.activeId = item.id
      this.$emit('handlerTopo', item)
    }
  }
}

</script>
<style lang="scss" scoped>
.full-left-header-right-icon {
  width: 40px;
  text-align: center;
  cursor: pointer;
}
.list-wrapper {
  .list, .list-item {
    padding: 0;
    margin: 0;
  }
  .topo-name {
    width: 70%;
  }
  .list-item {
    list-style: none;
    line-height: 20px;
    padding: 10px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    color: #666;
    &:hover {
      background: rgb(220, 228, 241);
    }
    &.active {
      background: rgb(187, 203, 229);
      color: #000;
      &::after {
        display: none;
        content: '';
        width: 16px;
        height: 16px;
        position: absolute;
        top: 12px;
        right: -9px;
        background: #f5f5f5;
        transform: rotate(45deg);
        /*box-shadow: inset 0px 1px 2px 1px rgba(0, 0, 0, 0.6);*/
      }
    }
  }
}
</style>
