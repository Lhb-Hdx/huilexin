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
      <UsedStatisticsContainer :echart-el="$tool.guid()" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
    </div>
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :show-dialog="showUsedDetailDialog"
      :custom-configuration="customConfiguration"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import diyMonitorItemMixin from '@/views/it-monitor/resources-monitor/mixins/diy-monitor-item-mixin'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'
// 自定义监控项 —— 趋势图
export default {
  name: 'DiyMonitorItemEchart',
  mixins: [diyMonitorItemMixin, MonitorDataMixin],
  data() {
    return {
      initGetMonitorItemHistoryData: false,
      echartData: [],
      tableData: [
        {
          col: [
            { label: '当前值', value: 0, unit: '' },
            { label: '最大值', value: 0, unit: '' },
            { label: '最小值', value: 0, unit: '' },
            { label: '平均值', value: 0, unit: '' }
          ]
        }
      ],
      detailParams: [],
      tableParams: []
    }
  }
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
