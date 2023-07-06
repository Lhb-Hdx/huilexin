<template>
  <div class="table-wrapper width-100">
    <el-table
      :data="moduleData"
    >
      <el-table-column label="风扇名称" prop="itemName" show-overflow-tooltip />
      <el-table-column label="故障状态" width="120" show-overflow-tooltip align="center">
        <template slot-scope="{row}">
          <el-tooltip class="item" effect="dark" :content="setStatus(row.statueItemValue)" placement="top">
            <div class="icon-flex flex-center" :class="!setStatusMap(row.statueItemValue) ? 'danger' : ''">
              <img v-if="setStatusMap(row.statueItemValue)" class="monitor-icon" src="image/common/right.png" alt="">
              <img v-if="!setStatusMap(row.statueItemValue)" class="monitor-icon" src="image/common/alarm.png" alt="">
              {{ setStatusMap(row.statueItemValue) ? '正常' : '异常' }}
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
    statusList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    setStatus() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.statusList, 'value', status)
        return getStatus ? getStatus.newvalue : ''
      }
    },
    setStatusMap() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.statusList, 'value', status)
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
