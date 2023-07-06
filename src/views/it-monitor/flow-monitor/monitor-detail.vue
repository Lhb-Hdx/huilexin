<template>
  <div>
    <el-page-header class="p-10" :content="navTitle" @back="$router.go(-1)" />
    <div class="flex">
      <div class="page-left">
        <DetailHostPort />
      </div>
      <div ref="pageRight" class="page-right" :style="{ 'height': pageRightHeight + 'px' }">
        <DetailPortEchart />
        <DetailPortTable />
      </div>
    </div>
  </div>
</template>

<script>
import DetailHostPort from './component/detail-host-port'
import DetailPortEchart from './component/detail-port-echart'
import DetailPortTable from './component/detail-port-table'

export default {
  name: 'MonitorDetail',
  components: {
    DetailHostPort, DetailPortEchart, DetailPortTable
  },
  data() {
    return {
      pageRightHeight: 0
    }
  },
  computed: {
    hostId() {
      return this.$route.query.hostId
    },
    navTitle() {
      return this.$route.meta.title
    }
  },
  mounted() {
    this.pageRightHeight = (this.$tool.getClientHeight() - this.$refs.pageRight.getBoundingClientRect().top) - 20
  }
}
</script>

<style lang="scss" scoped>
.page-left {
  width: 240px;
  background: #e5ecf6;
  position: fixed;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  .tree-header {
    background: #f2f6fb;
    padding: 8px 10px;
    height: 40px;
    .tree-header-title {
      font-size: 16px;
      color: #000;
      font-weight: bold;
    }
    .tree-header-action {
      color: #000;
      font-size: 14px;
    }
  }
}
.page-right {
  margin: 10px 10px 10px 250px;
  height: 100%;
  width: calc(100% - 260px);
  padding: 0 10px;
  background: #ffffff;
}
.ip-manage-tab {
  .el-tabs__header {
    margin-bottom: 0;
  }
}
</style>

