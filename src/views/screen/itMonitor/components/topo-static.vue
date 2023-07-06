<template>
  <div class="topoStatistic">
    <!--    <div class="staticType"><h1 class="overflow-text-a">{{ topoInfo.name }}</h1></div>-->
    <div class="topo-header-static">
      <div class="static-item padding-right-10">
        <div class="static-item-title">设备概况：</div>
        <div class="font-bold">{{ topoStaticData.itemCount }} / <span class="danger">{{ topoStaticData.itemOfflineCount }}</span></div>
      </div>
      <div class="static-item">
        <div class="static-item-title">业务链路：</div>
        <div class="font-bold">{{ topoStaticData.itemLinkCount }} / <span class="danger">{{ topoStaticData.itemLinkOffCount }}</span></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    topoStaticData: {
      type: Object,
      default() {
        return {}
      }
    },
    topoInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.topo-header-static {
  display: flex;
  justify-content: space-evenly;
  padding: 15px 0;
  .static-item {
    font-size: 14px;
    display: flex;
    align-items: center;
    .static-item-title {
      //color: #999999;
    }
  }
  .padding-right-10 {
    padding-right: 10px;
  }
}
</style>
