<template>
  <div class="wrp">
    <div class="wrp-box">
      <el-row>
        <el-col :span="3">
          <device-list-index
            @itMonitorDeviceData="getItMonitorDevice"
            @selectDevice="selectDevice"
            @topoMapData="getTopoMapData"
          />
        </el-col>
        <el-col :span="13">
          <map-index :map-data="mapData" :select-device-data="selectDeviceData" @ringDevice="getRingDevice" />
        </el-col>
        <el-col :span="8">
          <env-detail-index :it-monitor-device="itMonitorDeviceData" :right-device="ringDeviceData" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import DeviceListIndex from './component/deviceList/index'
import MapIndex from './component/map/index'
import EnvDetailIndex from './component/envDetail/index'

export default {
  name: 'ConfigurationWeb',
  components: {
    DeviceListIndex,
    MapIndex,
    EnvDetailIndex
  },
  data() {
    return {
      mapData: {},
      selectDeviceData: {},
      itMonitorDeviceData: [],
      ringDeviceData: {},
      ringDeviceDataKey: ''
    }
  },
  methods: {
    selectDevice(val) {
      this.selectDeviceData = val
    },
    getItMonitorDevice(val) {
      this.itMonitorDeviceData = val
    },
    getTopoMapData(val) {
      this.mapData = val
    },
    getRingDevice(val) {
      this.ringDeviceDataKey = this.$tool.guid()
      this.ringDeviceData = val
    }
  }
}
</script>

<style lang="scss" scoped>
.wrp {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  padding: 12px 5px 20px;
  box-sizing: border-box;
  position: relative;
  font-size: 14px;
  color: #333;

  .wrp-box {
    width: 100%;
    height: 100%;

    .el-row, .el-col {
      height: 100%;
    }
  }
}
</style>
