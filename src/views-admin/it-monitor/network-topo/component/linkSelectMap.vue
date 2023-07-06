<template>
  <div class="config-content-right-component">
    <div class="right-config-group">
      <div class="config-group-title">
        选择链路
        <i :class="isMenuDown === true ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="clickMenuDown" />
      </div>
      <div v-show="isMenuDown" class="config-group-main">
        <div v-for="(item, index) in connectLineTypeList" :key="index" class="link-map-item pointer" :class="mapLineTypeValue === item.value ? 'primary primary-border' : ''" @click="handleLineType(item)">
          <div class="line-item" :style="{'border': '1px ' + item.style.borderType + item.style.stroke }" />
          <div class="link-name">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { connectLineTypeList } from '@/utils/define-data'

export default {
  name: 'LinkSelectMap',
  data() {
    return {
      isMenuDown: true,
      connectLineTypeList: [],
      mapLineTypeValue: ''
    }
  },
  mounted() {
    this.connectLineTypeList = connectLineTypeList()
  },
  methods: {
    clickMenuDown() {
      this.isMenuDown = !this.isMenuDown
    },
    handleLineType(val) {
      console.log(val.value, this.mapLineTypeValue)
      this.mapLineTypeValue = this.mapLineTypeValue === val.value ? '' : val.value
      this.$emit('emitActionStyle', { mapLineTypeValue: this.mapLineTypeValue, mapType: 'link' })
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
    margin-top: 5px;
  }
  .link-name {
    margin-top: 10px;
  }
}
.active {
  background: #FFFFFF;
}
</style>
