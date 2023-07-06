<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="(echartData[0].data.length < 2 || echartData[1].data.length < 2) && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head head-bar">
        <div class="title">等待时间</div>
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
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="TimeChart" :echart-data="echartData" :table-data="tableData" />
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
  name: 'MonitorDbProcessCount',
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    waitTime: {
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
          name: '队列等待时间',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#3ba9ed',
          name: '锁存器空闲等待时间',
          data: [],
          units: [],
          time: []
        }
      ],
      tableData: [
        {
          col: [
            { label: '队列等待时间', value: 0, unit: '' },
            { label: '锁存器空闲等待时间', value: 0, unit: '' }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'dbTime',
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
    waitTime: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.timeId)
          this.$set(this.echartData[0], 'unit', '')
          this.$set(this.echartData[1], 'itemId', newVal.freeTimeId)
          this.$set(this.echartData[1], 'unit', '')
          // 统计图
          if (newVal.timeValue) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.timeValue[newVal.timeValue.length - 1])
            this.$set(this.echartData[0].units, this.echartData[0].units.length, '')
          }
          if (newVal.freeTimeValue) {
            this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.freeTimeValue[newVal.freeTimeValue.length - 1])
            this.$set(this.echartData[1].units, this.echartData[1].units.length, '')
          }
          if (this.echartData[0].data.length === 2) {
            this.$set(this.echartData[0].data, 0, this.echartData[0].data[1])
          }
          if (this.echartData[1].data.length === 2) {
            this.$set(this.echartData[1].data, 0, this.echartData[1].data[1])
          }
          if (newVal.time) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          // 表格
          this.$set(this.tableData[0].col[0], 'value', newVal.timeValue[newVal.timeValue.length - 1])
          this.$set(this.tableData[0].col[0], 'unit', '')
          this.$set(this.tableData[0].col[1], 'value', newVal.freeTimeValue[newVal.freeTimeValue.length - 1])
          this.$set(this.tableData[0].col[1], 'unit', '')
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
          itemid: this.waitTime.timeId,
          valueType: this.waitTime.timeType,
          name: '队列等待时间',
          color: '#87DEAF',
          unit: '',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.waitTime.freeTimeId,
          valueType: this.waitTime.freeTimeType,
          name: '锁存器空闲等待时间',
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
          label: ['最高队列等待时间', '平均队列等待时间', '最低队列等待时间'],
          value: 0,
          unit: '',
          itemid: this.waitTime.timeId,
          valueType: this.waitTime.timeType,
          type: ['max', 'avg', 'min']
        },
        {
          label: ['最高锁存器空闲等待时间', '平均锁存器空闲等待时间', '最低锁存器空闲等待时间'],
          value: 0,
          unit: '',
          itemid: this.waitTime.freeTimeId,
          valueType: this.waitTime.freeTimeType,
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
          showName: '等待时间',
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

