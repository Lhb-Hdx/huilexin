<template>
  <div>
    <el-page-header class="page-header" :content="navTitle" @back="$router.back()" />
    <div class="app-container flex" style="padding:0">
      <div class="page-left">
        <CabinetDevice />
      </div>
      <div ref="pageRight" class="page-right">
        <div class="map" :style="{ 'height': pageRightHeight + 'px' }">
          <CabinetMap :cabinet-id="String(id)" />
        </div>
        <div class="config" :style="{ 'height': pageRightHeight + 'px' }">
          <CabinetItemConfig />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CabinetDevice from '@/components/Cabinet/Components/CabinetDevice'
import CabinetMap from '@/components/Cabinet/Components/CabinetMap'
import CabinetItemConfig from '@/components/Cabinet/Components/CabinetItemConfig'

export default {
  components: {
    CabinetDevice,
    CabinetMap,
    CabinetItemConfig
  },
  data() {
    return {
      pageRightHeight: 0
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    }
  },
  mounted() {
    this.setSize()
  },
  beforeDestroy() {
    this.$EventBus.$off()
  },
  methods: {
    setSize() {
      const pageRight = this.$refs.pageRight
      this.pageRightHeight = window.innerHeight - pageRight.getBoundingClientRect().top - 10
    }
  }
}
</script>

<style lang="scss" scoped>
.page-left {
  width: 300px;
  background: #e5ecf6;
  position: fixed;
  height: 100%;
  overflow-x: hidden;
}
.page-right {
  padding-left: 300px;
  height: 100%;
  width: 100%;
  display: flex;
  .map {
    width: 70%;
    overflow-y: auto;
  }
  .config {
    width: 30%;
    overflow-y: auto;
  }
}
</style>
