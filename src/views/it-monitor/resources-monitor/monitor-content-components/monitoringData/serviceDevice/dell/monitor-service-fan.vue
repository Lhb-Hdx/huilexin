<template>
  <div class="table-wrapper width-100">
    <el-table
      :data="moduleData"
    >
      <el-table-column label="风扇名称" prop="itemName" show-overflow-tooltip />
      <el-table-column label="转速" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ row.speedItemValue }}{{ row.speedUnits }}
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
  name: 'MonitorServiceFanTable',
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
    }
  },
  computed: {
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
</style>
