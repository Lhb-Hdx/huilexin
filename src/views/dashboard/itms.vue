<template>
  <div class="dashboard-box">
    <div class="dashboard-box-left">
      <!-- 待办事项 -->
      <!-- <itms-todo :is-show="isShow" /> -->
      <!-- 设备变更 电信定制 -->
      <device-change-show :is-show="isShow" />
      <!-- 设备统计 -->
      <device-statistical-info :agent-id="agentId" :is-show="isShow" />
      <div class="dashboard-box-group flexBox">
        <div class="dashboard-box-group-item width-50 margin-right-5 no-padding">
          <!-- cpu运行top5 -->
          <cpu-run-top :agent-id="agentId" :is-show="isShow" />
        </div>
        <div class="dashboard-box-group-item width-50 margin-left-5 no-padding">
          <!-- 内存运行top5 -->
          <memory-run-top :agent-id="agentId" :is-show="isShow" />
        </div>
      </div>
      <!-- 业务系统运行top -->
      <business-system-top :agent-group-id="agentGroupId" :is-show="isShow" />
    </div>
    <div class="dashboard-box-right">
      <!-- 告警趋势 -->
      <alarm-trend :agent-id="agentId" :is-show="isShow" />
      <!-- 最新告警 -->
      <new-alarm :agent-id="agentId" :is-show="isShow" />
      <!-- 运维信息 -->
      <ops-info :agent-id="agentId" :is-show="isShow" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
// import ItmsTodo from './component/itms/todo/todo'
import AlarmTrend from './component/itms/alarm-trend/alarm-trend.vue'
import CpuRunTop from './component/itms/cpu-run-top/cpu-run-top'
import MemoryRunTop from './component/itms/memory-run-top/memory-run-top.vue'
import DeviceStatisticalInfo from './component/itms/device-statistical-info/device-statistical-info'
import NewAlarm from './component/itms/new-alarm/new-alarm'
import OpsInfo from './component/itms/ops-info/ops-info'
import BusinessSystemTop from './component/itms/business-system-top/business-system-top'
import DeviceChangeShow from '@/views/dashboard/component/itms/device-change-show/device-change-show'

export default {
  name: 'ItmsDashboard',
  components: {
    // ItmsTodo,
    AlarmTrend,
    CpuRunTop,
    MemoryRunTop,
    DeviceStatisticalInfo,
    NewAlarm,
    OpsInfo,
    BusinessSystemTop,
    DeviceChangeShow
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      agentId: '',
      agentGroupId: ''
    }
  },
  mounted() {
    this.agentId = String(this.sessionStorageOperation('get', 'agentId'))
    this.agentGroupId = String(this.sessionStorageOperation('get', 'agentGroupId'))
    this.findDashboardShow()
  },
  methods: {
    // 查询显示配置
    findDashboardShow() {
      request({
        url: api.opm.findDashboardShow, data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.$EventBus.$emit('get-meter-show', res.data)
        }
      })
    }
  }

}
</script>

<style lang="scss">
.dashboard-box-group {
  padding: 10px !important;
}
</style>
