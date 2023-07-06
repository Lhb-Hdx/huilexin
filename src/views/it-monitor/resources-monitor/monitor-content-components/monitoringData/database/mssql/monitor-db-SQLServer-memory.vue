<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="(echartData[0].data.length < 2 || echartData[1].data.length < 2) && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head head-bar">
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
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="SQLServermemoryChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
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
import UsedStatisticsContainer from '../../component/used-statistics-container'
import UsedDetailDialog from '../../component/used-detail-dialog'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorDbProcessCount',
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    memory: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      echartData: [
        {
          color: '#87DEAF',
          name: '授予工作区内存',
          data: [],
          units: [],
          time: [],
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'GB',
          toFixed: 2
        },
        {
          color: '#3ba9ed',
          name: '最大工作区内存',
          data: [],
          units: [],
          time: [],
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'GB',
          toFixed: 2
        },
        {
          color: '#9999FF',
          name: '目前服务器内存',
          data: [],
          units: [],
          time: [],
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'GB',
          toFixed: 2
        },
        {
          color: '#99CCFF',
          name: '服务器内存总量',
          data: [],
          units: [],
          time: [],
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true,
          assignUnit: 'GB',
          toFixed: 2
        }
      ],
      tableData: [
        {
          col: [
            { label: '授予工作区内存', value: 0, unit: '', fixed: 2 },
            { label: '最大工作区内存', value: 0, unit: '', fixed: 2 },
            { label: '目前服务器内存', value: 0, unit: '', fixed: 2 },
            { label: '服务器内存总量', value: 0, unit: '', fixed: 2 }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'SQLServermemory',
      watchItemShow: null,
      showEmpty: false,
      customConfiguration: {
        yAxisLabelUnit: 'GB'
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
    memory: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.grantMemoryltemId)
          this.$set(this.echartData[0], 'unit', '')
          this.$set(this.echartData[1], 'itemId', newVal.maxMemoryItemId)
          this.$set(this.echartData[1], 'unit', '')
          this.$set(this.echartData[2], 'itemId', newVal.currentMemoryItemId)
          this.$set(this.echartData[2], 'unit', '')
          this.$set(this.echartData[3], 'itemId', newVal.totalMemoryItemId)
          this.$set(this.echartData[3], 'unit', '')
          // 统计图
          if (newVal.grantMemoryValue) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.grantMemoryValue[newVal.grantMemoryValue.length - 1])
            this.$set(this.echartData[0].units, this.echartData[0].units.length, 'GB')
          }
          if (newVal.maxMemoryValue) {
            this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.maxMemoryValue[newVal.maxMemoryValue.length - 1])
            this.$set(this.echartData[1].units, this.echartData[1].units.length, 'GB')
          }
          if (newVal.currentMemoryValue) {
            this.$set(this.echartData[2].data, this.echartData[2].data.length, newVal.currentMemoryValue[newVal.currentMemoryValue.length - 1])
            this.$set(this.echartData[2].units, this.echartData[2].units.length, 'GB')
          }
          if (newVal.totalMemoryValue) {
            this.$set(this.echartData[3].data, this.echartData[3].data.length, newVal.totalMemoryValue[newVal.totalMemoryValue.length - 1])
            this.$set(this.echartData[3].units, this.echartData[3].units.length, 'GB')
          }
          if (this.echartData[0].data.length === 2) {
            this.$set(this.echartData[0].data, 0, this.echartData[0].data[1])
          }
          if (this.echartData[1].data.length === 2) {
            this.$set(this.echartData[1].data, 0, this.echartData[1].data[1])
          }
          if (this.echartData[2].data.length === 2) {
            this.$set(this.echartData[2].data, 0, this.echartData[2].data[1])
          }
          if (this.echartData[3].data.length === 2) {
            this.$set(this.echartData[3].data, 0, this.echartData[3].data[1])
          }
          if (newVal.time) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          // 表格
          this.$set(this.tableData[0].col[0], 'value', newVal.grantMemoryValue[newVal.grantMemoryValue.length - 1])
          this.$set(this.tableData[0].col[0], 'unit', 'GB')
          this.$set(this.tableData[0].col[1], 'value', newVal.maxMemoryValue[newVal.maxMemoryValue.length - 1])
          this.$set(this.tableData[0].col[1], 'unit', 'GB')
          this.$set(this.tableData[0].col[2], 'value', newVal.currentMemoryValue[newVal.currentMemoryValue.length - 1])
          this.$set(this.tableData[0].col[2], 'unit', 'GB')
          this.$set(this.tableData[0].col[3], 'value', newVal.totalMemoryValue[newVal.totalMemoryValue.length - 1])
          this.$set(this.tableData[0].col[3], 'unit', 'GB')
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
      if (that.echartData[0].data.length < 2 || that.echartData[1].data.length < 2) that.showEmpty = true
    }, 10000)
  },
  methods: {
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          itemid: this.memory.grantMemoryltemId,
          valueType: this.memory.grantMemoryValueType,
          name: '授予工作区内存',
          color: '#87DEAF',
          unit: 'B',
          echartType: 'value',
          isAssignUnit: true,
          assignUnit: 'GB',
          data: [],
          units: [],
          time: [],
          toFixed: 2
        },
        {
          itemid: this.memory.maxMemoryItemId,
          valueType: this.memory.maxMemoryValueType,
          name: '最大工作区内存',
          color: '#3ba9ed',
          unit: 'B',
          isConversion: 'true',
          isAssignUnit: true,
          assignUnit: 'GB',
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: [],
          toFixed: 2
        },
        {
          itemid: this.memory.currentMemoryItemId,
          valueType: this.memory.currentMemoryValueType,
          name: '目前服务器内存',
          color: '#3ba9ed',
          unit: 'B',
          isAssignUnit: true,
          assignUnit: 'GB',
          isConversion: 'true',
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: [],
          toFixed: 2
        },
        {
          itemid: this.memory.totalMemoryItemId,
          valueType: this.memory.totalMemoryValueType,
          name: '服务器内存总量',
          color: '#3ba9ed',
          unit: 'B',
          isAssignUnit: true,
          assignUnit: 'GB',
          isConversion: 'true',
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: [],
          toFixed: 2
        }
      ]
      this.tableParams = [
        {
          label: ['授予工作区内存'],
          value: 0,
          unit: '',
          itemid: this.memory.grantMemoryltemId,
          valueType: this.memory.grantMemoryValueType,
          type: ['max']
        },
        {
          label: ['最大工作区内存'],
          value: 0,
          unit: '',
          itemid: this.memory.maxMemoryItemId,
          valueType: this.memory.maxMemoryValueType,
          type: ['max']
        },
        {
          label: ['目前服务器内存'],
          value: 0,
          unit: '',
          itemid: this.memory.currentMemoryItemId,
          valueType: this.memory.currentMemoryValueType,
          type: ['max']
        },
        {
          label: ['服务器内存总量'],
          value: 0,
          unit: '',
          itemid: this.memory.totalMemoryItemId,
          valueType: this.memory.totalMemoryValueType,
          type: ['max']
        }
      ]
    },
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
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

