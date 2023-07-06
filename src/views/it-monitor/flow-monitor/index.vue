<template>
  <div class="flex-container">
    <div class="left-tools">
      <DeviceAreaList />
    </div>
    <div class="right-tools">
      <MonitorDeviceList />
    </div>
  </div>
</template>

<script>
import MonitorDeviceList from './component/monitor-device-list'
import DeviceAreaList from './component/device-area-list'

export default {
  components: {
    DeviceAreaList,
    MonitorDeviceList
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.flex-container {
  width:100%;
  height:100%;
  position:relative;
  .left-tools {
    position: fixed;
    width: 240px;
    height: 100%;
    background-color: #E5ECF6;
    overflow-y:scroll;
    overflow-x: hidden;
  }
  .right-tools {
    // width: calc(100% - 300px);
    padding-left:240px;box-sizing: border-box;height: 100%;
  }
}
.monitoring-box{
  display: flex;flex-wrap:wrap;
  >div{margin-right: 5px;margin-bottom:5px;border: 1px solid #eee;padding:3px 5px;width: 70px;}
  >div.active{background: green;color:#fff;}
}
.el-tag--dark.el-tag--info { background: #cccccc;}
</style>
