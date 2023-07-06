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
      <el-table-column label="状态" width="120" show-overflow-tooltip align="center">
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
      <el-table-column label="SMART状态" width="120" show-overflow-tooltip align="center">
        <template slot-scope="{row}">
          <el-tooltip class="item" effect="dark" :content="setSmartStatus(row.SMARTStatueItemValue)" placement="top">
            <div class="icon-flex flex-center" :class="!setSmartStatusMap(row.SMARTStatueItemValue) ? 'danger' : ''">
              <img v-if="setSmartStatusMap(row.SMARTStatueItemValue)" class="monitor-icon" src="image/common/right.png" alt="">
              <img v-if="!setSmartStatusMap(row.SMARTStatueItemValue)" class="monitor-icon" src="image/common/alarm.png" alt="">
              {{ setSmartStatusMap(row.SMARTStatueItemValue) ? '正常' : '异常' }}
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
    statusList: {
      type: Array,
      default() {
        return []
      }
    },
    smartStatusList: {
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
    setType() {
      return function(type) {
        const getStatus = this.$tool.findDataItemByAttr(this.typeList, 'value', type)
        return getStatus ? getStatus.newvalue : type
      }
    },
    setSmartStatusMap() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.statusList, 'value', status)
        if (getStatus) {
          return this.$defineData.valueMapDefine('normal', getStatus.newvalue) !== null
        } else {
          return false
        }
      }
    },
    setStatus() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.statusList, 'value', status)
        return getStatus ? getStatus.newvalue : ''
      }
    },
    setStatusMap() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.smartStatusList, 'value', status)
        if (getStatus) {
          return this.$defineData.valueMapDefine('normal', getStatus.newvalue) !== null
        } else {
          return false
        }
      }
    },
    setSmartStatus() {
      return function(status) {
        const getStatus = this.$tool.findDataItemByAttr(this.smartStatusList, 'value', status)
        return getStatus ? getStatus.newvalue : ''
      }
    }
  },
  mounted() {
    this.typeList = diskType()
    console.log('mounted', this.typeList)
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>
