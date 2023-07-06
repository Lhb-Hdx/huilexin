<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length < 2 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head-bar head">
        <div class="title">CPU</div>
        <div class="chunk-opts">
          <div v-if="isConfig" class="chunk-opts-select">
            <el-switch
              v-model="watchItemSwitch"
              @change="changeItemSwitch"
            />
          </div>
          <div class="chunk-opts-select margin-left-7-5">
            <el-select v-model="selectCpuItem" size="mini" placeholder="请选择" @change="changeCpuItem">
              <el-option
                v-for="item in cpuUsed.cpuList"
                :key="item.itemId"
                :label="item.name"
                :value="item.itemId"
              />
            </el-select>
            <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openUsedDetailDialog">
          </div>
        </div>
      </div>
      <UsedStatisticsContainer v-if="echartData[0].data.length > 0" echart-el="cpuChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
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

export default {
  name: 'StorageDeviceCpu',
  components: {
    UsedDetailDialog,
    UsedStatisticsContainer
  },
  mixins: [MonitorDataMixin],
  props: {
    cpuUsed: {
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
      watchItemKey: 'storageCpu',
      selectCpuItem: '',
      detailParams: [],
      tableParams: [],
      tableData: [
        {
          col: [
            { label: 'CPU使用率', value: 0, unit: '' }
          ]
        }
      ],
      echartData: [
        {
          color: '#87DEAF',
          name: 'CPU使用率',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100,
          arithmeticOperatorValue: '100', // 算术运算符比较值
          arithmeticOperator: '-'
        }
      ],
      loading: true,
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
    cpuUsed: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.cpuList[0].itemId)
          this.$set(this.echartData[0], 'unit', '%')

          if (newVal.value.length > 0) {
            // 数据1
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.value[newVal.value.length - 1])
            this.$set(this.echartData[0].data, 0, newVal.value[newVal.value.length - 1])
          }
          // 单位%
          if (newVal.cpuUnits.length > 0) this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.cpuUnits[newVal.cpuUnits.length - 1])
          // 时间
          if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          this.$set(this.tableData[0].col[0], 'value', newVal.active)
          this.$set(this.tableData[0].col[0], 'unit', newVal.cpuOriginalUnit)
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
    setTimeout(() => {
      if (this.cpuUsed.cpuList && this.cpuUsed.cpuList.length > 0) {
        this.selectCpuItem = this.cpuUsed.cpuList[0].itemId // 初始默认选择第一项
      }
    }, 1000)
    const that = this
    setTimeout(() => {
      if (that.echartData[0].data.length < 2) that.showEmpty = true
    }, 10000)
  },
  methods: {
    changeCpuItem(val) {
      this.$emit('selectCpuItem', val)
    },
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          itemid: this.cpuUsed.cpuItemId,
          valueType: this.cpuUsed.cpuValueType,
          name: 'CPU使用率',
          color: '#87DEAF',
          unit: this.cpuUsed.cpuOriginalUnit,
          echartType: 'value',
          arithmeticOperatorValue: '100',
          arithmeticOperator: '-',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100
        }
      ]
      this.tableParams = [
        {
          label: ['最高CPU空闲率', '平均CPU空闲率', '最低CPU空闲率'],
          value: 0,
          unit: this.cpuUsed.cpuOriginalUnit,
          itemid: this.cpuUsed.cpuItemId,
          valueType: this.cpuUsed.cpuValueType,
          type: ['max', 'avg', 'min']
        }
      ]
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: 'CPU',
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
