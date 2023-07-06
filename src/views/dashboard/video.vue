<template>
  <div class="dashboard-box">
    <div class="dashboard-box-left">
      <!-- 系统概况 -->
      <system-situation :is-show="isShow" />
      <div class="dashboard-box-group flexBox">
        <div class="dashboard-box-group-item width-50 pr-10">
          <!-- 事件高发 -->
          <event-high-marks :is-show="isShow" />
        </div>
        <div class="dashboard-box-group-item width-50 pl-10">
          <!-- 流媒体带宽 -->
          <streaming-media-bandwidth :is-show="isShow" />
        </div>
      </div>
      <!-- 事件发生统计 -->
      <event-marks-statistical :is-show="isShow" />
    </div>
    <div class="dashboard-box-right">
      <!-- 告警趋势 -->
      <alarm-trend :is-show="isShow" />
      <!-- 最新告警 -->
      <new-alarm :is-show="isShow" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import SystemSituation from './component/video/system-situation/system-situation'
import EventHighMarks from './component/video/event-high-marks/event-high-marks'
import EventMarksStatistical from './component/video/event-marks-statistical/event-marks-statistical'
import AlarmTrend from './component/video/alarm-trend/alarm-trend'
import NewAlarm from './component/video/new-alarm/new-alarm'
import StreamingMediaBandwidth from './component/video/streaming-media-bandwidth/streaming-media-bandwidth'

export default {
  name: 'VideoDashboard',
  components: {
    EventHighMarks,
    AlarmTrend,
    NewAlarm,
    SystemSituation,
    EventMarksStatistical,
    StreamingMediaBandwidth
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    this.findDashboardShow()
  },
  methods: {
    // 查询显示配置
    findDashboardShow() {
      request({
        url: api.opm.findDashboardShow, data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          console.log(res)
          this.$EventBus.$emit('get-meter-show', res.data)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.dashboard-box-group {
  padding: 10px;
}
</style>
