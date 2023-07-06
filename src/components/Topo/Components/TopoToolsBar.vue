<template>
  <div class="action-buttons top-tool-bar">
    <div v-for="(item, index) in toolBar" :key="index">
      <el-tooltip class="item" effect="dark" :content="item.tip" placement="top">
        <el-button
          :disabled="disabledTool.indexOf(item.methodType) !== -1"
          class="tool-item"
          :class="toolType === item.methodType && (item.methodType === 'pointer' || item.methodType === 'select') ? 'active-item' : ''"
          type="text"
          :style="{ opacity: disabledTool.indexOf(item.methodType) !== -1 ? '0.4' : 1}"
          @click="onClickTool(item.methodType)"
        >
          <i v-if="item.iconType !== 'img'" :class="item.icon" :style="item.style ? item.style : {}" />
          <img v-if="item.iconType === 'img'" :src="item.icon" alt="">
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopoToolsBar',
  data() {
    return {
      toolBar: [
        { icon: 'image/topo/tool-bar-pointer-icon.png', tip: '指针', methodType: 'pointer', iconType: 'img', disabled: false },
        { icon: 'image/topo/tool-bar-select-icon.png', tip: '选择', methodType: 'select', iconType: 'img', disabled: false },
        { icon: 'el-icon-zoom-in', tip: '放大', methodType: 'zoom-in', disabled: false },
        { icon: 'el-icon-zoom-out', tip: '缩小', methodType: 'zoom-out', disabled: false },
        { icon: 'el-icon-refresh-left', tip: '复原', methodType: 'refresh', disabled: false },
        { icon: 'el-icon-sort', tip: '垂直对齐', methodType: 'vertical', disabled: true },
        { icon: 'el-icon-sort', tip: '水平对齐', methodType: 'horizontal', style: { transform: 'rotate(90deg)' }, disabled: true },
        { icon: 'image/topo/link-btn-icon.png', tip: '链路连接', methodType: 'link', iconType: 'img', disabled: true },
        { icon: 'image/topo/tool-bar-combo-icon.png', tip: '分组', methodType: 'combo', iconType: 'img', disabled: true },
        { icon: 'el-icon-download', tip: '下载', methodType: 'download' }
      ],
      toolType: '', // 当前工具栏选择类型
      disabledTool: ['vertical', 'horizontal', 'combo']
    }
  },
  methods: {
    onClickTool(item) {
      // 指针
      if (item === 'pointer') this.disabledTool = ['vertical', 'horizontal', 'combo']
      // 选择
      if (item === 'select') this.disabledTool = ['vertical', 'horizontal']
      this.toolType = item
      this.$emit('handlerTool', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-left: 41px;
  .tool-item {
    margin-left: 10px !important;
    font-size: 18px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    color: #000000;
    padding: 0;
  }
  .active-item {
    border: 1px solid #0145AB;
  }
  img {
    width: 20px;
    height: 20px
  }
  .el-select {
    width: 40%;
  }
}
</style>
