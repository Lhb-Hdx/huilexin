<template>
  <div class="topo-header-static">
    <div class="static-item">
      <div class="static-item-title">设备概况：</div>
      <div class="font-bold">{{ topoStatic.itemCount }} / <span class="danger">{{ topoStatic.itemOfflineCount }}</span></div>
    </div>
    <div class="static-item">
      <div class="static-item-title">业务链路：</div>
      <div class="font-bold">{{ topoStatic.itemLinkCount }} / <span class="danger">{{ topoStatic.itemLinkOffCount }}</span></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopoStatic',
  props: {
    topoStatic: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.topo-header-static {
  background: #FFFFBF;
  display: flex;
  justify-content: space-evenly;
  padding: 15px 0;
  .static-item {
    font-size: 14px;
    display: flex;
    align-items: center;
    .static-item-title {
      color: #999999;
    }
  }
}
</style>
