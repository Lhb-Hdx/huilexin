<template>
  <div class="table-wrapper width-100">
    <el-table
      :data="moduleData"
    >
      <el-table-column label="网卡名称" prop="itemValue" show-overflow-tooltip />
      <el-table-column label="MAC地址" prop="macItemValue" show-overflow-tooltip />
      <el-table-column label="连接状态" width="120" show-overflow-tooltip align="center">
        <template slot-scope="{row}">
          <el-tooltip class="item" effect="dark" :content="setConnectionStatus(row.connectionItemValue)" placement="top">
            <div class="icon-flex flex-center" :class="setConnectionStatus(row.connectionItemValue).indexOf('Up') === -1 ? 'danger' : ''">
              <img v-if="setConnectionStatus(row.connectionItemValue).indexOf('Up') !== -1" class="monitor-icon" src="image/common/right.png" alt="">
              <img v-if="setConnectionStatus(row.connectionItemValue).indexOf('Up') === -1" class="monitor-icon" src="image/common/alarm.png" alt="">
              {{ setConnectionStatus(row.connectionItemValue).indexOf('Up') !== -1 ? 'Up' : 'Down' }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'MonitorServiceNetworkCardTable',
  props: {
    moduleData: {
      type: Array,
      default() {
        return []
      }
    },
    faultStatusList: {
      type: Array,
      default() {
        return []
      }
    },
    connectionStatusList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    setFaultStatus() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.faultStatusList, 'value', status)
        return getStatus ? getStatus.newvalue : ''
      }
    },
    setConnectionStatus() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.connectionStatusList, 'value', status)
        return getStatus ? getStatus.newvalue : ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>
