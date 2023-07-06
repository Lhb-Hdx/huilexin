<template>
  <div class="config-content-right-component no-border text-center flexBox align-item-center">
    <div v-for="(item, index) in actionBtns" :key="index" style="flex: 1">
      <el-button :type="btnKey === item.btnKey ? 'primary' : ''" style="padding: 6px 20px !important;" @click="handlerActionButton(item)">
        <img :src="btnKey === item.btnKey ? item.activeIcon : item.icon" style="width: 20px; height: 20px" alt="">
      </el-button>
      <div class="margin-top-5" :class="btnKey === item.btnKey ? 'primary' : ''">{{ item.tipContent }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElAction',
  data() {
    return {
      isMenuDown: false,
      btnKey: '',
      actionBtns: [
        { tipContent: '指针', icon: 'image/topo/pointer-btn-icon.png', activeIcon: 'image/topo/pointer-btn-icon-active.png', btnKey: 'pointer' },
        { tipContent: '连线', icon: 'image/topo/link-btn-icon.png', activeIcon: 'image/topo/link-btn-icon-active.png', btnKey: 'link' },
        { tipContent: '分组', icon: 'image/topo/combo-btn-icon.png', activeIcon: 'image/topo/combo-btn-icon-active.png', btnKey: 'combo' }
      ]
    }
  },
  methods: {
    // 选择按钮
    handlerActionButton(item) {
      this.btnKey = item.btnKey
      this.$emit('emitConfigAction', item)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/configItemStyle.scss';
.map-item {
  font-size: 14px;
  padding: 6px 10px;
  .item-line {
    width: 50%;
  }
}
.active {
  background: #FFFFFF;
}
.config-action-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  padding: 5px 0;
}
</style>
