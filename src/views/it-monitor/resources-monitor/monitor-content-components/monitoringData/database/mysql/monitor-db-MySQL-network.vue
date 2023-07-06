<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="(echartData[0].data.length < 2 || echartData[1].data.length < 2) && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head head-bar">
        <div class="title">网络</div>
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
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="networkChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
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
  name: 'MonitorDbMySQLNetwork',
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    network: {
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
          name: '接受的字节数',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#3ba9ed',
          name: '发送的字节数',
          data: [],
          units: [],
          time: []
        }
      ],
      tableData: [
        {
          col: [
            { label: '接受的字节数', value: 0, unit: '' },
            { label: '发送的字节数', value: 0, unit: '' }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'MySQLNetwork',
      watchItemShow: null,
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
    network: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.receivedNetworkItemId)
          this.$set(this.echartData[0], 'unit', newVal.receivedNetworkItemUnits)
          this.$set(this.echartData[1], 'itemId', newVal.sentNetworkItemId)
          this.$set(this.echartData[1], 'unit', newVal.sentNetworkItemUnits)

          // 统计图
          if (newVal.receivedNetworkValue) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.receivedNetworkValue[newVal.receivedNetworkValue.length - 1])
            this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.receivedNetworkItemUnits)
          }
          if (newVal.sentNetworkValue) {
            this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.sentNetworkValue[newVal.sentNetworkValue.length - 1])
            this.$set(this.echartData[1].units, this.echartData[1].units.length, newVal.sentNetworkItemUnits)
          }
          if (this.echartData[0].data.length === 2) {
            this.$set(this.echartData[0].data, 0, this.echartData[0].data[1])
          }
          if (this.echartData[1].data.length === 2) {
            this.$set(this.echartData[1].data, 0, this.echartData[1].data[1])
          }
          if (newVal.time) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          // 表格
          this.$set(this.tableData[0].col[0], 'value', newVal.receivedNetworkValue[newVal.receivedNetworkValue.length - 1])
          this.$set(this.tableData[0].col[0], 'unit', newVal.receivedNetworkItemUnits)
          this.$set(this.tableData[0].col[1], 'value', newVal.sentNetworkValue[newVal.sentNetworkValue.length - 1])
          this.$set(this.tableData[0].col[1], 'unit', newVal.sentNetworkItemUnits)
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
          itemid: this.network.receivedNetworkItemId,
          valueType: this.network.receivedNetworkValueType,
          name: '接受的字节数',
          color: '#87DEAF',
          unit: 'B',
          echartType: 'value',
          isConversion: 'true',
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.network.sentNetworkItemId,
          valueType: this.network.sentNetworkValueType,
          name: '发送的字节数',
          color: '#3ba9ed',
          unit: 'B',
          echartType: 'value',
          isConversion: 'true',
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: []
        }
      ]
      this.tableParams = [
        {
          label: ['最高接收字节数', '平均接收字节数', '最低接收字节数'],
          value: 0,
          unit: '',
          itemid: this.network.receivedNetworkItemId,
          valueType: this.network.receivedNetworkValueType,
          type: ['max', 'avg', 'min']
        },
        {
          label: ['最高发送字节数', '平均发送字节数', '最低发送字节数'],
          value: 0,
          unit: '',
          itemid: this.network.sentNetworkItemId,
          valueType: this.network.sentNetworkValueType,
          type: ['max', 'avg', 'min']
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
          showName: '网络',
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

