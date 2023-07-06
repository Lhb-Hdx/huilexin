<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length < 2 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head-bar head">
        <div class="title">内存</div>
        <div class="chunk-opts">
          <div v-if="isConfig" class="chunk-opts-select">
            <el-switch
              v-model="watchItemSwitch"
              @change="changeItemSwitch"
            />
          </div>
          <div class="chunk-opts-select margin-left-7-5">
            <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openUsedDetailDialog">
          </div>
        </div>
      </div>
      <UsedStatisticsContainer v-if="echartData[0].data.length > 0" echart-el="memoryChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
      <el-empty v-else description="暂无数据" />
    </div>
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :show-dialog="showUsedDetailDialog"
      :custom-configuration="customConfiguration"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import UsedDetailDialog from '../component/used-detail-dialog'
import UsedStatisticsContainer from '../component/used-statistics-container'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'
import DeviceStatisticsMixins from '@/views/it-monitor/resources-monitor/mixins/device-statistics.mixins'

export default {
  name: 'StorageDeviceMemory',
  components: {
    UsedDetailDialog,
    UsedStatisticsContainer
  },
  mixins: [MonitorDataMixin, DeviceStatisticsMixins],
  props: {
    memoryData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      showUsedDetailDialog: false,
      watchItemSwitch: true,
      watchItemShow: null,
      watchItemKey: 'storagememory',
      detailParams: [],
      tableParams: [],
      tableData: [
        {
          col: [
            { label: '当前', value: 0, unit: '' },
            { label: '占比', value: 0, unit: '' }
          ]
        }
      ],
      echartData: [
        {
          color: '#87DEAF',
          name: '内存使用率',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100,
          way: 'multiple',
          methods: 'monitorStorageDeviceMemoryStatistics'
        }
      ],
      showEmpty: false,
      customConfiguration: {
        yAxisLabelUnit: '%'
      }
    }
  },
  computed: {
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    zbxHostId() { return this.$route.query.zbxHostId }
  },
  watch: {
    memoryData: {
      handler(newVal) {
        if (newVal) {
          const objAttrDictionary = {
            totalMemoryItemId: newVal.totalMemoryItemId,
            ableValMemoryItemId: newVal.ableValMemoryItemId,
            totalMemoryValueType: newVal.totalMemoryValueType,
            ableValMemoryValueType: newVal.ableValMemoryValueType
          }
          this.$set(this.echartData[0], 'itemId', newVal.totalMemoryItemId)
          this.$set(this.echartData[0], 'unit', '%')
          this.$set(this.echartData[0], 'arithmeticOperatorValue', 100)
          this.$set(this.echartData[0], 'arithmeticOperator', '-')
          this.$set(this.echartData[0], 'objAttrDictionary', objAttrDictionary)

          if (newVal.value.length > 0) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.value[newVal.value.length - 1])
            this.$set(this.echartData[0].data, 0, newVal.value[newVal.value.length - 1])
          }
          if (newVal.memoryUnits.length > 0) this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.memoryOriginalUnit[newVal.memoryOriginalUnit.length - 1])
          if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          this.$set(this.tableData[0].col[0], 'value', newVal.occupy)
          this.$set(this.tableData[0].col[0], 'unit', newVal.memoryUnits[0])
          this.$set(this.tableData[0].col[1], 'value', newVal.active)
          this.$set(this.tableData[0].col[1], 'unit', newVal.memoryOriginalUnit)
        }
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-graph-show')
  },
  mounted() {
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    const that = this
    setTimeout(() => {
      if (that.echartData[0].data.length < 2) that.showEmpty = true
    }, 10000)
  },
  methods: {
    // 关闭弹窗
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    // 打开弹窗并处理数据
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
      const objAttrDictionary = {
        totalMemoryItemId: this.memoryData.totalMemoryItemId,
        ableValMemoryItemId: this.memoryData.ableValMemoryItemId,
        totalMemoryValueType: this.memoryData.totalMemoryValueType,
        ableValMemoryValueType: this.memoryData.ableValMemoryValueType
      }
      this.detailParams = [
        {
          itemid: [this.memoryData.totalMemoryItemId, this.memoryData.ableValMemoryItemId],
          valueType: [this.memoryData.totalMemoryValueType, this.memoryData.ableValMemoryValueType],
          name: '内存使用率',
          color: '#87DEAF',
          unit: '%',
          echartType: 'value',
          arithmeticOperatorValue: 100,
          arithmeticOperator: '-',
          conversionPercentage: true,
          conversionUnitType: 'data',
          isConversion: true,
          isAssignUnit: true,
          data: [],
          assignUnit: '%',
          units: [],
          time: [],
          yAxisMax: 100,
          way: 'multiple',
          methods: 'monitorStorageDeviceMemoryStatistics',
          objAttrDictionary
        }
      ]
      this.tableParams = [
        {
          label: ['最高内存使用率', '平均内存使用率', '最低内存使用率'],
          value: 0,
          unit: this.memoryData.memoryOriginalUnit,
          itemid: [this.memoryData.totalMemoryItemId, this.memoryData.ableValMemoryItemId],
          valueType: [this.memoryData.totalMemoryValueType, this.memoryData.ableValMemoryValueType],
          type: ['max', 'avg', 'min'],
          way: 'multiple',
          methods: 'monitorStorageDeviceMemoryStatistics',
          objAttrDictionary
        }
      ]
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '内存',
          isShow: Number(val),
          devType: this.devTypeId,
          hostId: this.id,
          zhostId: this.zbxHostId,
          graphType: 1
        })
      } else {
        this.$EventBus.$emit('change-item-switch', {
          id: this.watchItemShow.id,
          type: 1,
          isShow: Number(val),
          name: this.watchItemKey
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>

