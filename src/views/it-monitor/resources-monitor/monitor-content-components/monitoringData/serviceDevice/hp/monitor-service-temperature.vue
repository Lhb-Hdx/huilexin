<template>
  <div class="table-wrapper width-100">
    <el-table
      :data="moduleData"
    >
      <el-table-column label="温度名称" prop="name" show-overflow-tooltip />
      <el-table-column label="温度" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ row.temperature }}{{ row.temperatureUnits }}
        </template>
      </el-table-column>
      <el-table-column label="传感器状态" width="120" show-overflow-tooltip align="center">
        <template slot-scope="{row}">
          <el-tooltip class="item" effect="dark" :content="setStatus(row.sensorConditionItemValue)" placement="top">
            <div class="icon-flex flex-center" :class="!setStatusMap(row.sensorConditionItemValue) ? 'danger' : ''">
              <img v-if="setStatusMap(row.sensorConditionItemValue)" class="monitor-icon" src="image/common/right.png" alt="">
              <img v-if="!setStatusMap(row.sensorConditionItemValue)" class="monitor-icon" src="image/common/alarm.png" alt="">
              {{ setStatusMap(row.sensorConditionItemValue) ? '正常' : '异常' }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'MonitorServiceTemperature',
  props: {
    moduleData: {
      type: Array,
      default() {
        return []
      }
    },
    sensorConditionStatusList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    setStatus() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.sensorConditionStatusList, 'value', status)
        return getStatus ? getStatus.newvalue : ''
      }
    },
    setStatusMap() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.sensorConditionStatusList, 'value', status)
        if (getStatus) {
          return this.$defineData.valueMapDefine('normal', getStatus.newvalue) !== null
        } else {
          return false
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>

