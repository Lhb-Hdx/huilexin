<template>
  <div class="table-wrapper width-100">
    <el-table
      :data="moduleData"
    >
      <el-table-column label="电源名称" prop="name" show-overflow-tooltip />
      <el-table-column label="输入电压" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ row.voltageItemValue }}{{ row.voltageUnits }}
        </template>
      </el-table-column>
      <el-table-column label="最大功率" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ row.powerItemValue }}{{ row.powerUnits }}
        </template>
      </el-table-column>
      <el-table-column label="在线状态" width="120" show-overflow-tooltip align="center">
        <template slot-scope="{row}">
          <el-tooltip class="item" effect="dark" :content="setOnlineStatus(row.onlineItemValue)" placement="top">
            <div class="icon-flex flex-center" :class="setOnlineStatus(row.onlineItemValue).indexOf('Online') === -1 ? 'danger' : ''">
              <img v-if="setOnlineStatus(row.onlineItemValue).indexOf('Online') !== -1" class="monitor-icon" src="image/common/right.png" alt="">
              <img v-if="setOnlineStatus(row.onlineItemValue).indexOf('Online') === -1" class="monitor-icon" src="image/common/alarm.png" alt="">
              {{ setOnlineStatus(row.onlineItemValue).indexOf('Online') !== -1 ? '正常' : '异常' }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="故障状态" width="120" show-overflow-tooltip align="center">
        <template slot-scope="{row}">
          <el-tooltip class="item" effect="dark" :content="setFaultStatus(row.faultItemValue)" placement="top">
            <div class="icon-flex flex-center" :class="setFaultStatus(row.faultItemValue).indexOf('OK') === -1 ? 'danger' : ''">
              <img v-if="setFaultStatus(row.faultItemValue).indexOf('OK') !== -1" class="monitor-icon" src="image/common/right.png" alt="">
              <img v-if="setFaultStatus(row.faultItemValue).indexOf('OK') === -1" class="monitor-icon" src="image/common/alarm.png" alt="">
              {{ setFaultStatus(row.faultItemValue).indexOf('OK') !== -1 ? '正常' : '异常' }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'MonitorServicePowerTable',
  props: {
    moduleData: {
      type: Array,
      default() {
        return []
      }
    },
    onlineStatusList: {
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
    }
  },
  computed: {
    setOnlineStatus() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.onlineStatusList, 'value', status)
        return getStatus ? getStatus.newvalue : ''
      }
    },
    setFaultStatus() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.faultStatusList, 'value', status)
        return getStatus ? getStatus.newvalue : ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
.body-device-top {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  .storage-tag {
    background: #0145AB;
    color: #FFFFFF;
    font-size: 3em;
    display: inline;
    border-radius: 10px;
    padding: 10px;
  }
}
.body-device-info {
  padding: 14px;
}
</style>

