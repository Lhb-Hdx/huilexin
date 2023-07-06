<template>
  <div class="monitor-device">
    <!-- 概况 -->
    <monitorHostInfo
      :up-status="upStatus"
      :usability="usability"
      :up-time="upTime"
      :device-s-n="deviceSN"
    />
    <!-- 戴尔模板 -->
    <MonitorServiceByDell v-if="Number(subType) === 152" />
    <!-- 华三模板 -->
    <MonitorServiceByH3C v-if="Number(subType) === 150" />
    <!-- 惠普模板 -->
    <MonitorServiceByHP v-if="Number(subType) === 153" />
    <div class="chunk margin-left-7-5 margin-right-7-5">
      <template v-for="item in diyItem">
        <!-- 自定义监控项趋势图 -->
        <DiyMonitorItemEchart v-if="Number(item.graphType) === 1" :key="item.id" :monitor-item="item" />
        <!-- 自定义监控项仪表盘 -->
        <DiyMonitorItemDash v-if="Number(item.graphType) === 3" :key="item.id" :monitor-item="item" />
      </template>
    </div>
    <!-- 自定义监控项表单 -->
    <DiyMonitorItemForm v-if="isConfig" />
  </div>
</template>

<script>
import monitorHostInfo from '../../common/monitor-host-info'
import DiyMonitorItemForm from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-form'
import DiyMonitorItemEchart from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-echart'
import DiyMonitorItemDash from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-dash'
import MonitorServiceByDell from './dell/dell'
import MonitorServiceByH3C from './h3c/h3c'
import monitorServiceMixins from './mixins/monitor-service-mixins'
import MonitorServiceByHP from './hp/hp.vue'

export default {
  name: 'MonitorService',
  components: {
    monitorHostInfo,
    DiyMonitorItemForm,
    DiyMonitorItemEchart,
    DiyMonitorItemDash,
    MonitorServiceByDell,
    MonitorServiceByH3C,
    MonitorServiceByHP
  },
  mixins: [monitorServiceMixins],
  props: {
    usability: {
      type: Number,
      default() {
        return 0
      }
    },
    propSubTypeId: {
      type: Number,
      default() {
        return 0
      }
    }
  }
}
</script>
