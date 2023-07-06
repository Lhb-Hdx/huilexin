<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="(echartData[0].data.length === 1 || echartData[1].data.length === 1) && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head-bar head">
        <div class="title">服务器接收和发送</div>
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
      <UsedStatisticsContainer v-if="echartData[0].data.length > 0 || echartData[1].data.length > 0" echart-el="serverRsChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
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
import { conversionData } from '@/utils/utils'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorMiddlewareServerRs',
  components: {
    UsedDetailDialog,
    UsedStatisticsContainer
  },
  mixins: [MonitorDataMixin],
  props: {
    serverRsData: {
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
      watchItemKey: 'middlewareServerRs',
      detailParams: [],
      tableParams: [],
      totalData: '',
      tableData: [
        {
          col: [
            { label: '接收', value: 0, unit: '' },
            { label: '发送', value: 0, unit: '' },
            { label: '收发总数', value: 0, unit: '' }
          ]
        }
      ],
      echartData: [
        {
          color: '#87DEAF',
          name: '接收',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#15519E',
          name: '发送',
          data: [],
          units: [],
          time: []
        }
        // {
        //   color: '#FE830C',
        //   name: '收发总数',
        //   data: [0],
        //   units: ['Bps'],
        //   time: [this.$tool.dateFormat('HH:MM:SS', new Date())]
        // }
      ],
      showEmpty: false,
      customConfiguration: {
        yAxisLabelUnit: 'Bps'
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
    serverRsData: {
      handler(newVal) {
        this.$set(this.echartData[0], 'itemId', newVal.receivedItemId)
        this.$set(this.echartData[0], 'unit', 'Bps')
        this.$set(this.echartData[1], 'itemId', newVal.sentItemId)
        this.$set(this.echartData[1], 'unit', 'Bps')
        if (newVal) {
          if (newVal.judge === 'apache') {
            if (newVal.receivedvalue.length > 0 && newVal.sentvalue.length > 0) {
              let totalNum = Number(newVal.recActive) + Number(newVal.sentActive)
              this.totalData = conversionData('data', totalNum, 'b')
              console.log(this.totalData)
              this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.receivedvalue[newVal.receivedvalue.length - 1])
              this.$set(this.echartData[0].data, 0, newVal.receivedvalue[newVal.receivedvalue.length - 1])

              this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.sentvalue[newVal.sentvalue.length - 1])
              this.$set(this.echartData[1].data, 0, newVal.sentvalue[newVal.sentvalue.length - 1])
            }
            // 单位
            if (newVal.recUnits.length > 0) this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.recUnits[newVal.recUnits.length - 1])
            if (newVal.sentUnits.length > 0) this.$set(this.echartData[1].units, this.echartData[1].units.length, newVal.sentUnits[newVal.sentUnits.length - 1])
            // 时间
            if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
            this.$set(this.tableData[0].col[0], 'value', newVal.recActive)
            this.$set(this.tableData[0].col[0], 'unit', newVal.recUnits[0])
            this.$set(this.tableData[0].col[1], 'value', newVal.sentActive)
            this.$set(this.tableData[0].col[1], 'unit', newVal.sentUnits[0])
            this.$set(this.tableData[0].col[2], 'value', this.totalData.size)
            this.$set(this.tableData[0].col[2], 'unit', this.totalData.units)
          } else {
            // 值
            if (newVal.receivedvalue.length > 0 && newVal.sentvalue.length > 0 && newVal.totalvalue.length > 0) {
              this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.receivedvalue[newVal.receivedvalue.length - 1])
              this.$set(this.echartData[0].data, 0, newVal.receivedvalue[newVal.receivedvalue.length - 1])

              this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.sentvalue[newVal.sentvalue.length - 1])
              this.$set(this.echartData[1].data, 0, newVal.sentvalue[newVal.sentvalue.length - 1])

              // this.$set(this.echartData[2].data, this.echartData[2].data.length, newVal.totalvalue[newVal.totalvalue.length - 1])
              // this.$set(this.echartData[2].data, 0, newVal.totalvalue[newVal.totalvalue.length - 1])
            }
            // 单位
            if (newVal.recUnits.length > 0) this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.recUnits[newVal.recUnits.length - 1])
            if (newVal.sentUnits.length > 0) this.$set(this.echartData[1].units, this.echartData[1].units.length, newVal.sentUnits[newVal.sentUnits.length - 1])
            // if (newVal.totalUnits.length > 0) this.$set(this.echartData[2].units, this.echartData[2].units.length, newVal.totalUnits[newVal.totalUnits.length - 1])
            // 时间
            if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
            this.$set(this.tableData[0].col[0], 'value', newVal.recActive)
            this.$set(this.tableData[0].col[0], 'unit', newVal.recUnits[0])
            this.$set(this.tableData[0].col[1], 'value', newVal.sentActive)
            this.$set(this.tableData[0].col[1], 'unit', newVal.sentUnits[0])
            this.$set(this.tableData[0].col[2], 'value', newVal.totalActive)
            this.$set(this.tableData[0].col[2], 'unit', newVal.totalUnits[0])
          }
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
    // 关闭弹窗
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    // 打开弹窗并处理数据
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          itemid: this.serverRsData.receivedItemId,
          valueType: this.serverRsData.receivedValueType,
          name: '接收数',
          color: '#87DEAF',
          unit: this.serverRsData.receivedOriginalUnit,
          echartType: 'value',
          isConversion: true,
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.serverRsData.sentItemId,
          valueType: this.serverRsData.sentValueType,
          name: '发送数',
          color: '#15519E',
          unit: this.serverRsData.sentOriginalUnit,
          echartType: 'value',
          isConversion: true,
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: []
        }
        // {
        //   itemid: this.serverRsData.totalItemId,
        //   valueType: this.serverRsData.totalValueType,
        //   name: '收发总数',
        //   color: '#FE830C',
        //   unit: this.serverRsData.totalOriginalUnit,
        //   echartType: 'value',
        //   isConversion: true,
        //   conversionUnitType: 'data',
        //   data: [0],
        //   units: [''],
        //   time: [this.$tool.dateFormat('HH:MM:SS', new Date())]
        // }
      ]
      this.tableParams = [
        {
          label: ['最高接收数', '平均接收数', '最低接收数'],
          value: 0,
          unit: this.serverRsData.receivedOriginalUnit,
          itemid: this.serverRsData.receivedItemId,
          valueType: this.serverRsData.receivedValueType,
          type: ['max', 'avg', 'min']
        },
        {
          label: ['最高发送数', '平均发送数', '最低发送数'],
          value: 0,
          unit: this.serverRsData.sentOriginalUnit,
          itemid: this.serverRsData.sentItemId,
          valueType: this.serverRsData.sentValueType,
          type: ['max', 'avg', 'min']
        }
        // {
        //   label: ['最高收发总数', '最低收发总数'],
        //   value: 0,
        //   unit: this.serverRsData.totalOriginalUnit,
        //   itemid: this.serverRsData.totalItemId,
        //   valueType: this.serverRsData.totalValueType,
        //   type: ['max', 'min']
        // }
      ]
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '服务器接收和发送',
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

