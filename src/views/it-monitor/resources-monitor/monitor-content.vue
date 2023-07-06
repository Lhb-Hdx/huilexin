<template>
  <div>
    <MonitorSys v-if="devTypeId == '484'" :usability="usability" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" @upTime="emitUpTime" /> <!-- 操作系统 -->
    <MonitorService v-else-if="devTypeId == '479'" :usability="usability" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" :prop-sub-type-id="propSubTypeId" /> <!-- 服务设备 -->
    <MonitorDatabase v-else-if="devTypeId == '483'" :usability="usability" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" /> <!-- 数据库 -->
    <MonitorVirtual v-else-if="devTypeId == '478'" :usability="usability" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" /> <!-- 虚拟设备 -->
    <MonitorDeviceNetWork v-else-if="devTypeId == '481'" :usability="usability" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" /> <!-- 网络设备 -->
    <SDWAN v-else-if="devTypeId == '490'" :usability="usability" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" /> <!-- sdwan -->
    <MonitorMiddleware v-else-if="devTypeId == '482'" :usability="usability" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" /> <!-- 中间件 -->
    <MonitorStorage v-else-if="devTypeId == '477'" :usability="usability" :prop-agent="propAgent" :prop-zbx-host-id="propZbxHostId" /> <!-- 中间件 -->
    <el-empty v-else description="设备未配置设备类型，请到网元管理配置设备类型" />
  </div>
</template>
<script>
import MonitorSys from './monitor-content-components/monitoringData/operatingSystem/monitor-sys'
import MonitorDeviceNetWork from './monitor-content-components/monitoringData/network/monitor-net'
import MonitorDatabase from './monitor-content-components/monitoringData/database/monitor-db'
import MonitorService from './monitor-content-components/monitoringData/serviceDevice/monitor-service'
import MonitorVirtual from './monitor-content-components/monitoringData/virtualDevice/monitor-virtual'
import SDWAN from './monitor-content-components/monitoringData/SDWAN/sdwan'
import MonitorMiddleware from './monitor-content-components/monitoringData/middleware/monitor-middleware'
import MonitorStorage from './monitor-content-components/monitoringData/storageDevice/monitor-storage'
export default {
  name: 'MonitorEcharts',
  components: {
    MonitorSys,
    MonitorDeviceNetWork,
    MonitorDatabase,
    MonitorService,
    MonitorVirtual,
    SDWAN,
    MonitorMiddleware,
    MonitorStorage
  },
  props: {
    usability: {
      type: Number,
      default() {
        return 0
      }
    },
    propDevTypeId: {
      type: Number,
      default() {
        return 0
      }
    },
    propAgent: {
      type: Number,
      default() {
        return 0
      }
    },
    propZbxHostId: {
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
  },
  computed: {
    devTypeId() {
      if (this.propDevTypeId === 0) {
        return this.$route.query.devTypeId
      } else {
        return String(this.propDevTypeId)
      }
    }
  },
  methods: {
    emitUpTime(val) {
      this.$emit('upTime', val)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
