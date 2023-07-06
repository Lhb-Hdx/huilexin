<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="(echartData[0].data.length < 2 || echartData[1].data.length < 2) && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head head-bar">
        <div class="title">性能</div>
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
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="performanceChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
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
  name: 'MonitorDbSQLServerPerformance',
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    performance: {
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
          name: '每秒完全扫描次数',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#3ba9ed',
          name: '每秒索引搜索次数',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#9999ff',
          name: '每秒闩锁等待次数',
          data: [],
          units: [],
          time: []
        }
      ],
      tableData: [
        {
          col: [
            { label: '每秒完全扫描次数', value: 0, unit: '' },
            { label: '每秒索引搜索次数', value: 0, unit: '' },
            { label: '每秒闩锁等待次数', value: 0, unit: '' }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'dbProcessCount',
      watchItemShow: null,
      showEmpty: false,
      customConfiguration: {
        yAxisLabelUnit: ''
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
    performance: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.fullItemId)
          this.$set(this.echartData[0], 'unit', '')
          this.$set(this.echartData[1], 'itemId', newVal.searchesItemId)
          this.$set(this.echartData[1], 'unit', '')
          this.$set(this.echartData[2], 'itemId', newVal.LatchItemId)
          this.$set(this.echartData[2], 'unit', '')
          // 统计图
          if (newVal.fullValue) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.fullValue[newVal.fullValue.length - 1])
            this.$set(this.echartData[0].units, this.echartData[0].units.length, '')
          }
          if (newVal.searchesValue) {
            this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.searchesValue[newVal.searchesValue.length - 1])
            this.$set(this.echartData[1].units, this.echartData[1].units.length, '')
          }
          if (newVal.LatchValue) {
            this.$set(this.echartData[2].data, this.echartData[2].data.length, newVal.LatchValue[newVal.LatchValue.length - 1])
            this.$set(this.echartData[2].units, this.echartData[2].units.length, newVal.LatchItemUnits)
          }
          if (this.echartData[0].data.length === 2) {
            this.$set(this.echartData[0].data, 0, this.echartData[0].data[1])
          }
          if (this.echartData[1].data.length === 2) {
            this.$set(this.echartData[1].data, 0, this.echartData[1].data[1])
          }
          if (this.echartData[1].data.length === 2) {
            this.$set(this.echartData[2].data, 0, this.echartData[2].data[1])
          }
          if (newVal.time) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          // 表格
          this.$set(this.tableData[0].col[0], 'value', newVal.fullValue[newVal.fullValue.length - 1])
          this.$set(this.tableData[0].col[0], 'unit', '')
          this.$set(this.tableData[0].col[1], 'value', newVal.searchesValue[newVal.searchesValue.length - 1])
          this.$set(this.tableData[0].col[1], 'unit', '')
          this.$set(this.tableData[0].col[2], 'value', newVal.LatchValue[newVal.LatchValue.length - 1])
          this.$set(this.tableData[0].col[2], 'unit', newVal.LatchItemUnits)
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
          itemid: this.performance.fullItemId,
          valueType: this.performance.fullValueType,
          name: '每秒完全扫描次数',
          color: '#87DEAF',
          unit: '',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.performance.searchesItemId,
          valueType: this.performance.searchesValueType,
          name: '每秒索引搜索次数',
          color: '#3ba9ed',
          unit: '',
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.performance.LatchItemId,
          valueType: this.performance.LatchValueType,
          name: '每秒闩锁等待次数',
          color: '#3ba9ed',
          unit: '',
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: []
        }
      ]
      this.tableParams = [
        {
          label: ['每秒完全扫描次数'],
          value: 0,
          unit: '',
          itemid: this.performance.fullItemId,
          valueType: this.performance.fullValueType,
          type: ['max']
        },
        {
          label: ['每秒索引搜索次数'],
          value: 0,
          unit: '',
          itemid: this.performance.searchesItemId,
          valueType: this.performance.searchesValueType,
          type: ['max']
        },
        {
          label: ['每秒闩锁等待次数'],
          value: 0,
          unit: '',
          itemid: this.performance.LatchItemId,
          valueType: this.performance.LatchValueType,
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
          showName: '性能',
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

