<template>
  <div class="topo-position-setting">
    <div class="line-type-map" :style="styleOptions || ''">
      <div class="map-title">图示说明</div>
      <div class="map-main">
        <div v-for="(item, index) in connectLineTypeListMap" :key="index" class="map-item margin-bottom-10 flexBox align-item-center space-between">
          {{ item.label }}<div class="item-line" :style="{'border': '1px ' + item.style.borderType + item.style.stroke }" />
        </div>
      </div>
    </div>
    <el-button class="width-100 margin-top-7" type="primary" icon="el-icon-download" @click="downloadTopoMap">导出拓扑图</el-button>
  </div>
</template>

<script>
import { connectLineTypeList } from '@/utils/define-data'

export default {
  name: 'ConnectLineType',
  props: {
    styleOptions: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      connectLineTypeListMap: connectLineTypeList()
    }
  },
  methods: {
    // 导入拓扑图
    downloadTopoMap() {
      this.$emit('downloadTopoMap')
    }
  }
}
</script>

<style lang="scss" scoped>
.topo-position-setting {
  position: absolute;
  width: 200px;
  .line-type-map {
    //border: 1px solid #e0e0e0;
    //background: #FFFFFF;
    .map-title {
      font-size: 14px;
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    .map-main {
      padding: 10px 10px 0 10px;
      .map-item {
        font-size: 14px;
        .item-line {
          width: 50%;
        }
      }
    }
  }
}
</style>
