<template>
  <div ref="topoList" class="topo-list side-box" :style="{ 'height': + topoListHeight + 'px' }">
    <div class="side-title">拓扑列表</div>
    <div class="side-main" :style="{ 'height': + 'calc(' + topoListHeight + 'px - 40px)' }">
      <div v-for="item in topoList" :key="item.id" class="topo-item pointer" :class="+item.id === +activeTopoItem.id ? 'active' : ''" @click="handlerTopoItem(item)">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopoList',
  data() {
    return {
      topoList: [],
      activeTopoItem: {},
      findHyitTopologyQuery: {
        page: 1,
        limit: -1
      },
      topoListHeight: ''
    }
  },
  mounted() {
    this.findHyitTopology()
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setSize)
  },
  methods: {
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      const topoListTop = this.$refs.topoList.getBoundingClientRect().top
      this.topoListHeight = windowHeight - topoListTop - 200
    },
    handlerTopoItem(val) {
      this.activeTopoItem = val
      this.$emit('handlerTopoItem', { ... this.activeTopoItem, emitType: 'click' })
    },
    findHyitTopology() {
      this.$request({
        url: this.api.itMonitor.findHyitTopologyInfo,
        data: this.findHyitTopologyQuery
      }).then(res => {
        if (res.code === 1 && res.data && res.data.length > 0) {
          this.topoList = res.data
          this.activeTopoItem = res.data[0]
          this.$emit('handlerTopoItem', { ... this.activeTopoItem, emitType: 'auto' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.topo-list {
  width: 15%;
  position: absolute;
  z-index: 999;
  background: rgba(10, 15, 70,.9);
  overflow-y: auto;
  .side-main {
    overflow-y: auto;
    .topo-item {
      display: block;
      line-height: 40px;
      height: 40px;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: #cccccc;
      &:hover {
        color: #99E5FF;
      }
    }
    .active {
      color: #99E5FF;
    }
  }
}
</style>
