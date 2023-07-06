<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="(echartData[0].data.length < 2 || echartData[1].data.length < 2) && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head head-bar">
        <div class="title">线程</div>
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
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="threadChart" :echart-data="echartData" :table-data="tableData" />
      <el-empty v-else description="暂无数据" />
    </div>
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :show-dialog="showUsedDetailDialog"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import UsedStatisticsContainer from '../../component/used-statistics-container'
import UsedDetailDialog from '../../component/used-detail-dialog'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorDbMySQLThread',
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    thread: {
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
          name: '线程缓存',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#3ba9ed',
          name: '连接的线程',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#9999FF',
          name: '每秒创建',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#99CCFF',
          name: '正在运行',
          data: [],
          units: [],
          time: []
        }
      ],
      tableData: [
        {
          col: [
            { label: '线程缓存', value: 0, unit: '' },
            { label: '连接的线程', value: 0, unit: '' },
            { label: '每秒创建', value: 0, unit: '' },
            { label: '每秒创建', value: 0, unit: '' }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'MySQLThread',
      watchItemShow: null,
      showEmpty: false
    }
  },
  computed: {
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    zbxHostId() { return this.$route.query.zbxHostId }
  },
  watch: {
    thread: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.cachedThreadltemId)
          this.$set(this.echartData[0], 'unit', '')
          this.$set(this.echartData[1], 'itemId', newVal.connectedThreadItemId)
          this.$set(this.echartData[1], 'unit', '')
          this.$set(this.echartData[2], 'itemId', newVal.secondThreadItemId)
          this.$set(this.echartData[2], 'unit', '')
          this.$set(this.echartData[3], 'itemId', newVal.runningThreadItemId)
          this.$set(this.echartData[3], 'unit', '')
          // 统计图
          if (newVal.cachedThreadValue) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.cachedThreadValue[newVal.cachedThreadValue.length - 1])
            this.$set(this.echartData[0].units, this.echartData[0].units.length, '')
          }
          if (newVal.connectedThreadValue) {
            this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.connectedThreadValue[newVal.connectedThreadValue.length - 1])
            this.$set(this.echartData[1].units, this.echartData[1].units.length, '')
          }
          if (newVal.secondThreadValue) {
            this.$set(this.echartData[2].data, this.echartData[2].data.length, newVal.secondThreadValue[newVal.secondThreadValue.length - 1])
            this.$set(this.echartData[2].units, this.echartData[2].units.length, '')
          }
          if (newVal.runningThreadValue) {
            this.$set(this.echartData[3].data, this.echartData[3].data.length, newVal.runningThreadValue[newVal.runningThreadValue.length - 1])
            this.$set(this.echartData[3].units, this.echartData[3].units.length, '')
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
          this.$set(this.tableData[0].col[0], 'value', newVal.cachedThreadValue[newVal.cachedThreadValue.length - 1])
          this.$set(this.tableData[0].col[0], 'unit', '')
          this.$set(this.tableData[0].col[1], 'value', newVal.connectedThreadValue[newVal.connectedThreadValue.length - 1])
          this.$set(this.tableData[0].col[1], 'unit', '')
          this.$set(this.tableData[0].col[2], 'value', newVal.secondThreadValue[newVal.secondThreadValue.length - 1])
          this.$set(this.tableData[0].col[2], 'unit', '')
          this.$set(this.tableData[0].col[3], 'value', newVal.runningThreadValue[newVal.runningThreadValue.length - 1])
          this.$set(this.tableData[0].col[3], 'unit', '')
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
          itemid: this.thread.cachedThreadltemId,
          valueType: this.thread.cachedThreadValueType,
          name: '线程缓存',
          color: '#87DEAF',
          unit: '',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.thread.connectedThreadItemId,
          valueType: this.thread.connectedThreadValueType,
          name: '连接的线程',
          color: '#3ba9ed',
          unit: '',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.thread.secondThreadItemId,
          valueType: this.thread.secondThreadValueType,
          name: '每秒创建',
          color: '#3ba9ed',
          unit: '',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.thread.runningThreadItemId,
          valueType: this.thread.runningThreadValueType,
          name: '每秒创建',
          color: '#3ba9ed',
          unit: '',
          data: [],
          units: [],
          time: []
        }
      ]
      this.tableParams = [
        {
          label: ['最高线程缓存', '平均线程缓存', '最低线程缓存'],
          value: 0,
          unit: '',
          itemid: this.thread.cachedThreadltemId,
          valueType: this.thread.cachedThreadValueType,
          type: ['max', 'avg', 'min']
        },
        {
          label: ['最高连接线程', '平均连接线程', '最低连接线程'],
          value: 0,
          unit: '',
          itemid: this.thread.connectedThreadItemId,
          valueType: this.thread.connectedThreadValueType,
          type: ['max', 'avg', 'min']
        },
        {
          label: ['每秒最高创建', '每秒平均创建', '每秒最低创建'],
          value: 0,
          unit: '',
          itemid: this.thread.secondThreadItemId,
          valueType: this.thread.secondThreadValueType,
          type: ['max', 'avg', 'min']
        },
        {
          label: ['每秒最高运行', '每秒平均运行', '每秒最低运行'],
          value: 0,
          unit: '',
          itemid: this.thread.runningThreadItemId,
          valueType: this.thread.runningThreadValueType,
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

