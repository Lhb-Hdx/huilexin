<template>
  <div class="dashboard-box">
    <div class="dashboard-box-left">
      <!-- 系统概况 -->
      <system-situation :is-show="isShow" />
      <!-- 温湿度监控 -->
      <env-monitor :is-show="isShow" />
      <!--      <energy-statistical />-->
    </div>
    <div class="dashboard-box-right">
      <!-- 告警趋势 -->
      <alarm-trend :is-show="isShow" />
      <!-- 告警日志 -->
      <alarm-log :is-show="isShow" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import SystemSituation from './component/power/system-situation/system-situation'
import EnvMonitor from './component/power/env-monitor/env-monitor'
// import EnergyStatistical from './component/power/energy-statistical/energy-statistical'
import AlarmTrend from './component/power/alarm-trend/alarm-trend'
import AlarmLog from './component/power/alarm-log/alarm-log'

export default {
  name: 'PowerDashboard',
  components: {
    SystemSituation,
    EnvMonitor,
    // EnergyStatistical,
    AlarmTrend,
    AlarmLog
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
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
<style lang="scss" scoped>
.power{
  //background-color: #030D25;
  //min-height: 100%;
  padding:16px;
  position: relative;
}
//::v-deep .power{
//  .border-box-content,.dv-border-box-12,.dv-border-svg-container{
//    height: auto;
//  }
//}
.power-center{
  //display: flex;
  //flex-direction: column;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(1,100%);
  grid-template-rows: 50% 32%;
}
.power-right{
  height: 100%;
  display: grid;
  grid-template-columns: repeat(1,100%);
  grid-template-rows: 22% 60%;
}
.power-header{
  height: 100px;
  width: 100%;
  background: url(/image/dashboard/bg_head.png) no-repeat center;
  position: relative;
  padding-bottom: 20px;
  &:after{
    content: '';
    height: 100%;
    clear: both;
    zoom: 1;
    display: block;
  }
  .header-left-btn{
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    background-color: #061C38;
    border: 1px solid #1A728B;
    color: #EFEFEF;
    padding:10px 20px;
    font-size: 18px;
  }
  .header-right{
    position: absolute;
    right: 0;
    top: 50%;
    width:40%;
    transform: translateY(-50%);
      color: #EFEFEF;
    .right-btn{
      padding:6px 50px;
      clip-path: polygon(100% 0,80% 100%,0 100%,20% 0);
      background-color: #061C38;
      border: 1px solid #1A728B;
    }
    .right-date{
      position: relative;
      font-size:14px;
      &::before{
        content:'';
        position:absolute;
        left: -15px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 100%;
        background: #1A728B;
      }
    }
  }

}
  //.power-main{
  //  position: absolute;
  //  height: calc(100% - 100px);
  //  width: 100%;
  //  left: 0;
  //  right: 0;
  //  padding:16px;
  //  margin: 0 auto;
  //  //background-color: #fff;
  //}
</style>
