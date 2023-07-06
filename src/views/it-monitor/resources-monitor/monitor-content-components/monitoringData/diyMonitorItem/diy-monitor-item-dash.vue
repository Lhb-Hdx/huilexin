<template>
  <div v-if="isConfig || (!isConfig && watchItemSwitch)" ref="chuckBox" class="chuck-box">
    <div class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15">
      <div class="head-bar head">
        <div class="title">{{ monitorItem.showName }}</div>
        <div class="chunk-opts">
          <div v-if="isConfig" class="chunk-opts select opts-icon pointer" @click="handlerDeleteMonitorItem">
            <i class="el-icon-delete" />
          </div>
          <div v-if="isConfig" class="chunk-opts-select margin-left-7-5">
            <el-switch
              v-model="watchItemSwitch"
              @change="changeItemSwitch"
            />
          </div>
          <div class="chunk-opts-select margin-left-7-5">
            <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openUsedDetailDialog">
          </div>
        </div>
      </div>
      <UsedStatisticsContainer echart-type="dash" :echart-el="$tool.guid()" :echart-data="echartData" :table-data="tableData" />
    </div>
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :show-dialog="showUsedDetailDialog"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import diyMonitorItemMixin from '@/views/it-monitor/resources-monitor/mixins/diy-monitor-item-mixin'
// 自定义监控项 —— 仪表盘
export default {
  name: 'DiyMonitorItemDash',
  mixins: [diyMonitorItemMixin]
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
.opts-icon {
  font-size: 18px;
  i {
    font-weight: bold;
  }
}
</style>
