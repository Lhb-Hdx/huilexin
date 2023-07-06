<template>
  <div class="table-wrapper width-100">
    <el-table :data="moduleData">
      <el-table-column label="CPU名称" prop="itemTag" show-overflow-tooltip />
      <el-table-column
        label="线程数"
        prop="threadItemValue"
        show-overflow-tooltip
      />
      <el-table-column
        label="核心数"
        prop="nuclearItemValue"
        show-overflow-tooltip
      />
      <el-table-column label="当前频率" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span>{{
            setStorage(row.frequencyItemValue, row.frequencyUnits)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="故障状态"
        show-overflow-tooltip
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tooltip
            class="item"
            effect="dark"
            :content="setFaultStatus(row.faultItemValue)"
            placement="top"
          >
            <div
              class="icon-flex flex-center"
              :class="
                setFaultStatus(row.faultItemValue).indexOf('OK') === -1
                  ? 'danger'
                  : ''
              "
            >
              <img
                v-if="setFaultStatus(row.faultItemValue).indexOf('OK') !== -1"
                class="monitor-icon"
                src="image/common/right.png"
                alt=""
              >
              <img
                v-if="setFaultStatus(row.faultItemValue).indexOf('OK') === -1"
                class="monitor-icon"
                src="image/common/alarm.png"
                alt=""
              >
              {{ setFaultStatus(row.faultItemValue) }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column
        label="告警日志"
        show-overflow-tooltip
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tooltip
            class="item"
            effect="dark"
            :content="setFaultStatus(row.faultItemValue)"
            placement="top"
          >
            <div
              class="icon-flex flex-center"
              :class="
                setFaultStatus(row.faultItemValue).indexOf('OK') === -1
                  ? 'danger'
                  : ''
              "
            >
              <img
                v-if="setFaultStatus(row.faultItemValue).indexOf('OK') !== -1"
                class="monitor-icon"
                src="image/common/right.png"
                alt=""
              >
              <img
                v-if="setFaultStatus(row.faultItemValue).indexOf('OK') === -1"
                class="monitor-icon"
                src="image/common/alarm.png"
                alt=""
              >
              {{
                setFaultStatus(row.faultItemValue).indexOf("OK") !== -1
                  ? "正常"
                  : "异常"
              }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { conversionData } from '@/utils/utils'

export default {
  name: 'MonitorServiceCpuTable',
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
    setStorage() {
      return function(value, units) {
        if (!value && !units) return
        const unit = units.indexOf('Hz') === 0 ? 'B' : units.split('Hz')[0]
        const conversionDataResult = conversionData('data', Number(value), unit)
        return conversionDataResult ? conversionDataResult.size + conversionDataResult.abbreviations + 'Hz' : ''
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
</style>
