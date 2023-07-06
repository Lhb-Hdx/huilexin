<template>
  <div class="config-content-right-component">
    <div class="right-config-group">
      <div class="config-group-title">
        选择样式
        <i :class="isMenuDown === true ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="clickMenuDown" />
      </div>
      <div v-show="isMenuDown" class="config-group-main">
        <div class="group-main-item">
          <div class="group-main-title">背景色：</div>
          <div class="group-main-value">
            <el-color-picker v-model="selectGroupBg" size="mini" />
          </div>
        </div>
        <div class="group-main-item">
          <div v-for="(item, index) in topoShape" :key="index" class="link-map-item pointer" :class="selectGroupShape.shapeTypeValue === item.shapeTypeValue ? 'primary primary-border' : ''" @click="onSelectGroupShape(item)">
            <div class="line-item" style="width: 40px"><div style="margin: 0 auto" :style="item.style" /></div>
            <div class="link-name">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { topoShape } from '@/utils/define-data'

export default {
  name: 'ComboSelectMap',
  data() {
    return {
      isMenuDown: true,
      topoShape: [],
      selectGroupShape: {},
      selectGroupBg: '#ffffff'
    }
  },
  watch: {
    selectGroupBg() {
      if (this.selectGroupShape.shapeTypeValue) this.$emit('emitActionStyle', { comboStyle: { ...this.selectGroupShape, selectGroupBg: this.selectGroupBg }, mapType: 'combo' })
    }
  },
  mounted() {
    this.topoShape = topoShape()
    this.selectGroupShape = this.topoShape[0]
  },
  methods: {
    clickMenuDown() {
      this.isMenuDown = !this.isMenuDown
    },
    onSelectGroupShape(val) {
      this.selectGroupShape = val
      this.$emit('emitActionStyle', { comboStyle: { ...val, selectGroupBg: this.selectGroupBg }, mapType: 'combo' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/configItemStyle.scss';
.link-map-item {
  width: calc(50% - 12px);
  display: inline-block;
  padding: 10px;
  background: #FFFFFF;
  border-radius: 10px;
  margin: 5px;
  text-align: center;
  border: 1px solid #FFFFFF;
  .line-item {
    margin: 5px auto 0;
  }
  .link-name {
    margin-top: 10px;
  }
}
</style>
