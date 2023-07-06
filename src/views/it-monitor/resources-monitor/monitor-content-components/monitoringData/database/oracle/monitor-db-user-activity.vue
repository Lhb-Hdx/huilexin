<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length < 2 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head head-bar">
        <div class="title">用户活动</div>
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
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="userActivityChart" :echart-data="echartData" :table-data="tableData" />
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
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    userActivity: {
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
          name: '活跃用户数',
          data: [],
          units: [],
          time: []
        }
      ],
      tableData: [
        {
          col: [
            { label: '活跃用户数', value: 0, unit: '' }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'dbUserActivity',
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
    userActivity: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.itemId)
          this.$set(this.echartData[0], 'unit', '')
          // 统计图
          if (newVal.value) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.value[newVal.value.length - 1])
            this.$set(this.echartData[0].units, this.echartData[0].units.length, '')
          }
          this.$set(this.echartData[0].data, 0, this.echartData[0].data[1])
          if (newVal.time) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          // 表格
          this.$set(this.tableData[0].col[0], 'value', newVal.value[newVal.value.length - 1])
          this.$set(this.tableData[0].col[0], 'unit', '')
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
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          itemid: this.userActivity.itemId,
          valueType: this.userActivity.valueType,
          name: '活跃用户数',
          color: '#87DEAF',
          unit: '',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        }
      ]
      this.tableParams = [
        {
          label: ['最高活跃用户数', '平均活跃用户数', '最低活跃用户数'],
          value: 0,
          unit: '',
          itemid: this.userActivity.itemId,
          valueType: this.userActivity.valueType,
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
          showName: '用户活动',
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
