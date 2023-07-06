<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="(echartData[0].data.length < 2 || echartData[1].data.length < 2) && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head head-bar">
        <div class="title">查询</div>
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
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="queryChart" :echart-data="echartData" :table-data="tableData" />
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
  name: 'MonitorDbMySQLQuery',
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    query: {
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
          name: '每秒查询数',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#3ba9ed',
          name: '每秒问题数',
          data: [],
          units: [],
          time: []
        },
        {
          color: '#9999FF',
          name: '每秒慢速查询',
          data: [],
          units: [],
          time: []
        }
      ],
      tableData: [
        {
          col: [
            { label: '每秒查询数', value: 0, unit: '' },
            { label: '每秒问题数', value: 0, unit: '' },
            { label: '每秒慢速查询', value: 0, unit: '' }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'MySQLQuery',
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
    query: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.queriesQueryItemId)
          this.$set(this.echartData[0], 'unit', '')
          this.$set(this.echartData[1], 'itemId', newVal.questionsQueryItemId)
          this.$set(this.echartData[1], 'unit', '')
          this.$set(this.echartData[2], 'itemId', newVal.slowQueryItemId)
          this.$set(this.echartData[2], 'unit', '')
          // 统计图
          if (newVal.queriesQueryValue) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.queriesQueryValue[newVal.queriesQueryValue.length - 1])
            this.$set(this.echartData[0].units, this.echartData[0].units.length, '')
          }
          if (newVal.questionsQueryValue) {
            this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.questionsQueryValue[newVal.questionsQueryValue.length - 1])
            this.$set(this.echartData[1].units, this.echartData[1].units.length, '')
          }
          if (newVal.slowQueryValue) {
            this.$set(this.echartData[2].data, this.echartData[2].data.length, newVal.slowQueryValue[newVal.slowQueryValue.length - 1])
            this.$set(this.echartData[2].units, this.echartData[2].units.length, '')
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
          if (newVal.time) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          // 表格
          this.$set(this.tableData[0].col[0], 'value', newVal.queriesQueryValue[newVal.queriesQueryValue.length - 1])
          this.$set(this.tableData[0].col[0], 'unit', '')
          this.$set(this.tableData[0].col[1], 'value', newVal.questionsQueryValue[newVal.questionsQueryValue.length - 1])
          this.$set(this.tableData[0].col[1], 'unit', '')
          this.$set(this.tableData[0].col[2], 'value', newVal.slowQueryValue[newVal.slowQueryValue.length - 1])
          this.$set(this.tableData[0].col[2], 'unit', '')
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
          itemid: this.query.queriesQueryItemId,
          valueType: this.query.queriesQueryValueType,
          name: '每秒查询数',
          color: '#87DEAF',
          unit: '',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.query.questionsQueryItemId,
          valueType: this.query.questionsQueryValueType,
          name: '每秒问题数',
          color: '#3ba9ed',
          unit: '',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: this.query.slowQueryItemId,
          valueType: this.query.slowQueryValueType,
          name: '每秒慢速查询',
          color: '#3ba9ed',
          unit: '',
          data: [],
          units: [],
          time: []
        }
      ]
      this.tableParams = [
        {
          label: ['每秒最高查询数', '每秒平均查询数', '每秒最低查询数'],
          value: 0,
          unit: '',
          itemid: this.query.queriesQueryItemId,
          valueType: this.query.queriesQueryValueType,
          type: ['max', 'avg', 'min']
        },
        {
          label: ['每秒最高问题数', '每秒平均问题数', '每秒最低问题数'],
          value: 0,
          unit: '',
          itemid: this.query.questionsQueryItemId,
          valueType: this.query.questionsQueryValueType,
          type: ['max', 'avg', 'min']
        },
        {
          label: ['每秒最高慢速查询', '每秒平均慢速查询', '每秒最低慢速查询'],
          value: 0,
          unit: '',
          itemid: this.query.slowQueryItemId,
          valueType: this.query.slowQueryValueType,
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
          showName: '查询',
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

