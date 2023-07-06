<template>
  <div class="config-content-right-component">
    <div class="right-config-group">
      <div class="config-group-title">
        网络拓扑图信息
        <i :class="isMenuDown === true ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="clickMenuDown" />
      </div>
      <div v-show="isMenuDown" class="config-group-main">
        <div class="group-main-item">
          <div class="group-main-title">拓扑图名称：</div>
          <div class="group-main-value text-value flexBox align-item-center">
            {{ topoInfo.name }}
          </div>
        </div>
        <div class="group-main-item">
          <div class="group-main-title">状态：</div>
          <div class="group-main-value text-value flexBox align-item-center">
            {{ topoInfo.statues === 1 ? '正常' : '异常' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapInfoConfig',
  props: {
    topoInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isMenuDown: true,
      statuesList: [
        { value: 1, label: '正常' },
        { value: 0, label: '异常' }
      ]
    }
  },
  mounted() {

  },
  created() {

  },
  methods: {
    // 菜单收缩
    clickMenuDown() {
      this.isMenuDown = !this.isMenuDown
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../Styles/TopoEditor.scss';
</style>
