<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length === 1 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head-bar head">
        <div class="title">请求和提交</div>
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
      <UsedStatisticsContainer v-if="echartData[0].data.length > 0" echart-el="rsChart" :echart-data="echartData" :table-data="tableData" />
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
import UsedDetailDialog from '../component/used-detail-dialog'
import UsedStatisticsContainer from '../component/used-statistics-container'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorMiddlewareRs',
  components: {
    UsedDetailDialog,
    UsedStatisticsContainer
  },
  mixins: [MonitorDataMixin],
  props: {
    rsData: {
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
      watchItemKey: 'middlewareRs',
      detailParams: [],
      tableParams: [],
      tableData: [
        {
          col: [
            { label: '请求数', value: 0, unit: '' }
            // { label: '提交数', value: 0, unit: '' }
          ]
        }
      ],
      echartData: [
        {
          color: '#87DEAF',
          name: '请求数',
          data: [],
          units: [],
          time: []
          // yAxisMax: 100
        }
        // ,
        // {
        //   color: '#15519E',
        //   name: '提交数',
        //   data: [0],
        //   units: ['%'],
        //   time: [this.$tool.dateFormat('HH:MM:SS', new Date())],
        //   yAxisMax: 100
        // }
      ],
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
    rsData: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.rsItemId)
          this.$set(this.echartData[0], 'unit', '')

          if (newVal.value.length > 0) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.value[newVal.value.length - 1])
            this.$set(this.echartData[0].data, 0, newVal.value[newVal.value.length - 1])
          }
          this.$set(this.echartData[0].units, this.echartData[0].units.length, '')
          if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          this.$set(this.tableData[0].col[0], 'value', newVal.active)
          // this.$set(this.tableData[0].col[0], 'unit', newVal.rsUnits[0])
          // this.$set(this.tableData[0].col[1], 'value', newVal.active)
          // this.$set(this.tableData[0].col[1], 'unit', newVal.rsOriginalUnit)
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
      this.detailParams = [
        {
          itemid: this.rsData.rsItemId,
          valueType: this.rsData.rsValueType,
          name: '请求数',
          color: '#87DEAF',
          unit: this.rsData.rsOriginalUnit,
          echartType: 'value',
          data: [],
          units: [],
          time: []
          // yAxisMax: 100
        }
        // ,
        // {
        //   itemid: this.rsData.rsItemId,
        //   valueType: this.rsData.rsValueType,
        //   name: '提交数',
        //   color: '#15519E',
        //   unit: this.rsData.rsValueUnit,
        //   echartType: 'value',
        //   data: [0],
        //   units: ['%'],
        //   time: [this.$tool.dateFormat('HH:MM:SS', new Date())],
        //   yAxisMax: 100
        // }
      ]
      this.tableParams = [
        {
          label: ['最高请求数', '平均请求数', '最低请求数'],
          value: 0,
          unit: this.rsData.rsOriginalUnit,
          itemid: this.rsData.rsItemId,
          valueType: this.rsData.rsValueType,
          type: ['max', 'avg', 'min']
        }
        // ,
        // {
        //   label: ['最高提交数', '最低提交数'],
        //   value: 0,
        //   unit: this.rsData.rsOriginalUnit,
        //   itemid: this.rsData.rsItemId,
        //   valueType: this.rsData.rsValueType,
        //   type: ['max', 'min']
        // }
      ]
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '请求和提交',
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

