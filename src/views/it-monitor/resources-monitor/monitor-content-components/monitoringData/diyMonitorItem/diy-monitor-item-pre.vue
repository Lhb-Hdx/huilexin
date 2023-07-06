<template>
  <div>DiyMonitorItemPre</div>
</template>

<script>
import diyMonitorItemMixin from '@/views/it-monitor/resources-monitor/mixins/diy-monitor-item-mixin'
// 自定义监控项 —— 饼状图
export default {
  name: 'DiyMonitorItemEchart',
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
