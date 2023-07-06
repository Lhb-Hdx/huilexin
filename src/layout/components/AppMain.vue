<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  width: 100%;
  position: relative;
  background-color: #f5f5f5;
  height: 100%;
}

.fixed-header+.app-main {
  padding-top: 86px;
}

.hasTagsView {
  .fixed-header+.app-main {
    padding-top: 180px;
  }
}
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
.fixed-header .el-menu-item,.fixed-header .el-submenu__title {
  font-weight: 600;
}
</style>
