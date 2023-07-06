<template>
  <div class="table-wrapper width-100">
    <el-table
      :data="moduleData"
    >
      <el-table-column label="磁盘名称" prop="itemValue" show-overflow-tooltip />
      <el-table-column label="型号" prop="modelItemValue" show-overflow-tooltip />
      <el-table-column label="序列号" prop="snItemValue" width="200" show-overflow-tooltip />
      <el-table-column label="类型" width="120" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ setType(row.typeItemValue) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="容量" width="150" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ setStorage(row.storageItemValue, row.storageUnits) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="在线状态" width="120" show-overflow-tooltip align="center">
        <template slot-scope="{row}">
          <el-tooltip class="item" effect="dark" :content="setOnlineStatus(row.onlineItemValue)" placement="top">
            <div class="icon-flex flex-center" :class="!setStatusMap(row.onlineItemValue) ? 'danger' : ''">
              <img v-if="setStatusMap(row.onlineItemValue)" class="monitor-icon" src="image/common/right.png" alt="">
              <img v-if="!setStatusMap(row.onlineItemValue)" class="monitor-icon" src="image/common/alarm.png" alt="">
              {{ setStatusMap(row.onlineItemValue) ? '正常' : '异常' }}
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
import { conversionData } from '@/utils/utils'
import { diskType } from '@/utils/define-data'

export default {
  name: 'MonitorServiceDiskTable',
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
  data() {
    return {
      typeList: []
    }
  },
  computed: {
    setStorage() {
      return function(value, units) {
        if (!value && !units) return
        const conversionDataResult = conversionData('data', Number(value), units)
        return conversionDataResult ? conversionDataResult.size + conversionDataResult.units : ''
      }
    },
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
    },
    setType() {
      return function(type) {
        const getStatus = this.$tool.findDataItemByAttr(this.typeList, 'value', type)
        return getStatus ? getStatus.newvalue : type
      }
    },
    setStatusMap() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.onlineStatusList, 'value', status)
        if (getStatus) {
          return getStatus.newvalue.indexOf('Ready') !== -1 || getStatus.newvalue.indexOf('Online') !== -1 || getStatus.newvalue.indexOf('Non-RAID') !== -1 || getStatus.newvalue.indexOf('Removed') !== -1
        } else {
          return false
        }
      }
    }
  },
  mounted() {
    this.typeList = diskType()
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>
