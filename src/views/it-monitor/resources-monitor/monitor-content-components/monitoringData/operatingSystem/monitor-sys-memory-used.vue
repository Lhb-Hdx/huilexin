<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length < 2 && !showEmpty"
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
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="memoryChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
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
import UsedStatisticsContainer from '../component/used-statistics-container'
import UsedDetailDialog from '../component/used-detail-dialog'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    memoryUsed: {
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
          name: '内存使用率',
          data: [],
          units: [],
          time: [],
          toFixed: 2
        }
      ],
      tableData: [
        {
          col: [
            { label: '总大小', value: 0, unit: '' }/*,
            { label: '物理内存', value: 0, unit: '' }*/
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'sysMemory',
      watchItemShow: null,
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
    memoryUsed: {
      handler(newVal) {
        console.log(newVal)
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.memoryItemId)
          this.$set(this.echartData[0], 'unit', '%')

          this.$set(this.echartData[0], 'yAxisMax', 100)
          if (newVal.memoryValue) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.memoryValue[newVal.memoryValue.length - 1])
            this.$set(this.echartData[0].data, 0, newVal.memoryValue[newVal.memoryValue.length - 1])
          }
          if (newVal.memoryValueUnits) this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.memoryValueUnits[newVal.memoryValueUnits.length - 1])
          if (newVal.time) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          // 表格
          this.$set(this.tableData[0].col[0], 'value', newVal.memoryCount)
          this.$set(this.tableData[0].col[0], 'unit', newVal.memoryCountUnit)
          // this.$set(this.tableData[0].col[1], 'value', newVal.swapCount)
          // this.$set(this.tableData[0].col[1], 'unit', newVal.swapCountUnit)
        }
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.$EventBus.$off('get-graph-show')
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
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          itemid: this.memoryUsed.memoryItemId,
          valueType: this.memoryUsed.memoryValueType,
          name: '内存使用率',
          color: '#87DEAF',
          unit: this.memoryUsed.memoryOriginalUnit,
          echartType: 'value',
          isConversion: false,
          data: [],
          units: [],
          time: [],
          toFixed: 2
        }
      ]
      this.tableParams = [
        {
          label: ['最高内存使用率', '平均内存使用率', '最低内存使用率'],
          value: 0,
          unit: this.memoryUsed.memoryOriginalUnit,
          itemid: this.memoryUsed.memoryItemId,
          valueType: this.memoryUsed.memoryValueType,
          isConversion: false,
          type: ['max', 'avg', 'min'],
          fixed: 2
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
