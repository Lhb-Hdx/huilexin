<template>
  <dv-full-screen-container class="bg">
    <div class="power">
      <div class="power-header">
        <div class="header-left-btn pointer flex-v-between">
          <span>中心医院数据机房</span>
          <i class="el-icon-caret-right" />
        </div>
        <div class="header-right flex-v-between">
          <div ref="fullScreen" class="right-btn" @click="openfullScreen">
            动环信息
          </div>
          <div class="right-date">
            {{ time }}
          </div>
        </div>
      </div>
      <!--   内容-->
      <div class="power-main flex">
        <!-- 左侧 -->
        <div style="width: 200px">
          <powerDeviceList @sliceDeviceList="sliceDeviceList = $event" />
        </div>
        <!-- 中间底部 -->
        <div class="power-center flex mx-20" style="flex:1;flex-direction: column;">
          <powerDevice :slice-device-list="sliceDeviceList" style="flex-basis:60%;width: 100% !important;" />
          <dv-border-box-12 ref="border" :color="['#092B4B']" style="flex-shrink: 5;overflow: hidden">
            <deviceWorker />
          </dv-border-box-12>
        </div>
        <!-- 右侧 | 上-->
        <div class="power-right" style="width: 500px;">
          <dv-border-box-12 ref="border" :color="['#092B4B']" style="flex-basis: 20%">
            <deviceAver />
          </dv-border-box-12>
          <dv-border-box-12 ref="border" :color="['#092B4B']" style="flex:1;overflow:hidden;margin-top: 10px">
            <deviceAlarm />
          </dv-border-box-12>
        </div>
      </div>
    </div>
  </dv-full-screen-container>
</template>

<script>

import powerDeviceList from './components/power-device-list/power-device-list'
import deviceAver from './components/device-aver/device-aver'
import deviceAlarm from './components/device-alarm/device-alarm'
import deviceWorker from './components/device-worker/device-worker'
import powerDevice from './components/power-device/power-device'
var timer = null
export default {
  name: 'PowerDashboard',
  components: {
    powerDeviceList,
    deviceAver,
    deviceAlarm,
    deviceWorker,
    powerDevice
  },
  data() {
    return {
      time: '',
      sliceDeviceList: []
    }
  },
  mounted() {
    this.$nextTick(() => {
      // this.$refs.fullScreen.click()
      this.$tool.ADCfullScreen()
    })
    timer = setInterval(() => {
      this.nextTime()
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(timer)
  },
  methods: {
    nextTime() { // 获取当前时间
      this.time = this.$tool.getNowDate('')
    },
    openfullScreen() {
      this.$tool.openBrowserFullScreen()
    }
  }
}
</script>
<style lang="scss" scoped>
.power {
  --power-srceen-text-color:#EFEFEF;
}
.power{
  //background: url(/image/screen/pageBg.png) no-repeat center center;
  background:  #030D25 url(/image/dashboard/power/bg_head.png) no-repeat center -13px;
  //background-size: 100%;
  min-height: 100%;
  padding:16px;
  position: relative;
  transition: all .5s;
}
.power-center{
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom:20px;
}
.power-right{
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom:20px;
}
.power-header{
  height: 100px;
  width: 100%;
  //background: url(/image/dashboard/power/bg_head.png) no-repeat center;
  position: relative;
  background-size:100%;
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
    top: 44%;
    transform: translateY(-50%);
    background-color: #071F39;
    border: 1px solid #083744;
    color: #9EE6FF;
    padding:10px 20px;
    font-size: 18px;
  }
  .header-right{
    position: absolute;
    right: 0;
    top: 40%;
    width:50%;
    transform: translateY(-50%);
    color: var(--power-srceen-text-color);
    .right-btn{
      padding:10px 40px;
      font-size: 12px;
      clip-path: polygon(100% 0,74% 100%,0 100%,26% 0);
      background: rgba(23,103,132,.2);
      //border: 1px solid #176783;
      color: #9EE6FF;
      margin-left:220px;
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
.power-main{
  position: absolute;
  height: calc(100% - 100px);
  width: 100%;
  left: 0;
  right: 0;
  padding:16px;
  margin: 0 auto;
  //background-color: #fff;
}
</style>
