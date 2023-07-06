<template>
  <!-- 暂时留空 -->
  <div />
  <!-- <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
     v-loading="echartData[0].data.length < 2"
     element-loading-spinner="el-icon-loading"
     class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
     >
      <div class="head-bar head">
        <div class="title">存储池</div>
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
      <UsedStatisticsContainer echart-el="poolChart" :echart-data="echartData" :table-data="tableData" />
    </div>
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :show-dialog="showUsedDetailDialog"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div> -->
</template>

<script>
// import UsedDetailDialog from '../component/used-detail-dialog'
// import UsedStatisticsContainer from '../component/used-statistics-container'

export default {
  name: 'StorageDevicePool',
  components: {
    // UsedDetailDialog,
    // UsedStatisticsContainer
  },
  props: {
    poolData: {
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
      watchItemKey: 'storagePool',
      detailParams: [],
      tableParams: [],
      tableData: [
        {
          col: [
            { label: '空闲容量', value: 0, unit: '' },
            { label: '使用率', value: 0, unit: '' },
            { label: '总容量', value: 0, unit: '' }
          ]
        }
      ],
      echartData: [
        {
          color: '#87DEAF',
          name: '存储池使用率',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100
        }
      ]
    }
  },
  computed: {
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    zbxHostId() { return this.$route.query.zbxHostId }
  },
  watch: {
    poolData: {
      handler(newVal) {
        if (newVal) {
          if (newVal.value.length > 0) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.value[newVal.value.length - 1])
            this.$set(this.echartData[0].data, 0, newVal.value[newVal.value.length - 1])
          }
          if (newVal.poolUnits.length > 0) this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.poolUnits[newVal.poolUnits.length - 1])
          if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          this.$set(this.tableData[0].col[0], 'value', newVal.active) // 空闲容量
          this.$set(this.tableData[0].col[0], 'unit', newVal.poolOriginalUnit)
          this.$set(this.tableData[0].col[1], 'value', newVal.active) // 使用率
          this.$set(this.tableData[0].col[1], 'unit', newVal.poolOriginalUnit)
          this.$set(this.tableData[0].col[1], 'value', newVal.active) // 总容量
          this.$set(this.tableData[0].col[1], 'unit', newVal.poolOriginalUnit)
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
          itemid: this.poolData.poolItemId,
          valueType: this.poolData.poolValueType,
          name: '存储池使用率',
          color: '#87DEAF',
          unit: this.poolData.poolOriginalUnit,
          echartType: 'value',
          data: [0],
          units: ['%'],
          time: [this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date())],
          yAxisMax: 100
        }
      ]
      this.tableParams = [
        {
          label: ['最高存储池使用率', '平均存储池使用率', '最低存储池使用率'],
          value: 0,
          unit: this.poolData.poolOriginalUnit,
          itemid: this.poolData.poolItemId,
          valueType: this.poolData.poolValueType,
          type: ['max', 'avg', 'min']
        }
      ]
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '存储池',
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

