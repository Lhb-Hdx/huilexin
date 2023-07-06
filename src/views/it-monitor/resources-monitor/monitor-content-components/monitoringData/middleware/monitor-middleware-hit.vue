<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="(echartData[0].data.length === 1 || echartData[1].data.length === 1) && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head-bar head">
        <div class="title">命中率</div>
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
      <UsedStatisticsContainer v-if="echartData[0].data.length > 0 || echartData[1].data.length > 0" echart-el="hitChart" :echart-data="echartData" :table-data="tableData" />
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
  name: 'MonitorMiddlewareHit',
  components: {
    UsedDetailDialog,
    UsedStatisticsContainer
  },
  mixins: [MonitorDataMixin],
  props: {
    hitData: {
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
      watchItemKey: 'middlewareHit',
      detailParams: [],
      tableParams: [],
      tableData: [
        {
          col: [
            { label: '缓存服务器的缓存命中率', value: 0, unit: '' },
            // { label: '缓存元数据缓存命中率', value: 0, unit: '' },
            { label: 'URL的缓存命中率', value: 0, unit: '' }
          ]
        }
      ],
      echartData: [
        {
          color: '#87DEAF',
          name: '缓存服务器的缓存命中率',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100,
          showLegend: 'true'
        },
        // {
        //   color: '#15519E',
        //   name: '缓存元数据缓存命中率',
        //   data: [0],
        //   units: ['%'],
        //   time: [this.$tool.dateFormat('HH:MM:SS', new Date())],
        //   yAxisMax: 100,
        //   showLegend: 'true'
        // },
        {
          color: '#FE830C',
          name: 'URL的缓存命中率',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100,
          showLegend: 'true'
        }
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
    hitData: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.hitItemId)
          this.$set(this.echartData[0], 'unit', '%')
          this.$set(this.echartData[1], 'itemId', newVal.urlHitItemId)
          this.$set(this.echartData[1], 'unit', '%')

          if (newVal.value.length > 0) {
            // 数据
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.value[newVal.value.length - 1])
            this.$set(this.echartData[0].data, 0, newVal.value[newVal.value.length - 1])

            this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.urlValue[newVal.urlValue.length - 1])
            this.$set(this.echartData[1].data, 0, newVal.urlValue[newVal.urlValue.length - 1])
          }
          // 单位
          if (newVal.hitUnits.length > 0) this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.hitOriginalUnit[newVal.hitOriginalUnit.length - 1])
          if (newVal.hitUnits.length > 0) this.$set(this.echartData[1].units, this.echartData[1].units.length, newVal.urlHitOriginalUnit[newVal.urlHitOriginalUnit.length - 1])
          // 时间
          if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          this.$set(this.tableData[0].col[0], 'value', newVal.active)
          this.$set(this.tableData[0].col[0], 'unit', newVal.hitOriginalUnit)
          this.$set(this.tableData[0].col[1], 'value', newVal.urlActive)
          this.$set(this.tableData[0].col[1], 'unit', newVal.urlHitOriginalUnit)
          // this.$set(this.tableData[0].col[2], 'value', newVal.active)
          // this.$set(this.tableData[0].col[2], 'unit', newVal.hitOriginalUnit)
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
      if (that.echartData[0].data.length === 1 || that.echartData[1].data.length === 1) that.showEmpty = true
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
          itemid: this.hitData.hitItemId,
          valueType: this.hitData.hitValueType,
          name: '缓存服务器的缓存命中率',
          color: '#87DEAF',
          unit: this.hitData.hitOriginalUnit,
          echartType: 'value',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100
        },
        // {
        //   itemid: this.hitData.hitItemId,
        //   valueType: this.hitData.hitValueType,
        //   name: '缓存元数据缓存命中率',
        //   color: '#15519E',
        //   unit: this.hitData.hitOriginalUnit,
        //   echartType: 'value',
        //   data: [0],
        //   units: ['%'],
        //   time: [this.$tool.dateFormat('HH:MM:SS', new Date())],
        //   yAxisMax: 100
        // },
        {
          itemid: this.hitData.urlHitItemId,
          valueType: this.hitData.urlHitValueType,
          name: 'URL的缓存命中率',
          color: '#FE830C',
          unit: this.hitData.urlHitOriginalUnit,
          echartType: 'value',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100
        }
      ]
      this.tableParams = [
        {
          label: ['最高缓存服务器的缓存命中率', '平均缓存服务器的缓存命中率', '最低缓存服务器的缓存命中率'],
          value: 0,
          unit: this.hitData.hitOriginalUnit,
          itemid: this.hitData.hitItemId,
          valueType: this.hitData.hitValueType,
          type: ['max', 'avg', 'min']
        },
        // {
        //   label: ['最高缓存元数据缓存命中率', '最低缓存元数据缓存命中率'],
        //   value: 0,
        //   unit: this.hitData.hitOriginalUnit,
        //   itemid: this.hitData.hitItemId,
        //   valueType: this.hitData.hitValueType,
        //   type: ['max', 'min']
        // },
        {
          label: ['最高URL的缓存命中率', '平均URL的缓存命中率', '最低URL的缓存命中率'],
          value: 0,
          unit: this.hitData.urlHitOriginalUnit,
          itemid: this.hitData.urlHitItemId,
          valueType: this.hitData.urlHitValueType,
          type: ['max', 'avg', 'min']
        }
      ]
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '命中率',
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

