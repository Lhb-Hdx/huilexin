<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length < 2 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head-bar head">
        <div class="title">虚拟卷</div>
        <div class="chunk-opts">
          <div v-if="isConfig" class="chunk-opts-select">
            <el-switch
              v-model="watchItemSwitch"
              @change="changeItemSwitch"
            />
          </div>
          <div class="chunk-opts-select margin-left-7-5">
            <el-select v-model="selectVirtualItem" size="mini" placeholder="请选择" @change="changeVirtualItem">
              <el-option
                v-for="item in virtualData.virtualList"
                :key="item.virtualTotalItemId"
                :label="item.name"
                :value="item.virtualTotalItemId"
              />
            </el-select>
            <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openUsedDetailDialog">
          </div>
        </div>
      </div>
      <UsedStatisticsContainer v-if="echartData[0].data.length > 0" echart-el="virtualChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
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
  name: 'StorageDeviceVirtual',
  components: {
    UsedDetailDialog,
    UsedStatisticsContainer
  },
  mixins: [MonitorDataMixin],
  props: {
    virtualData: {
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
      selectVirtualItem: '',
      watchItemKey: 'storageVirtual',
      detailParams: [],
      tableParams: [],
      tableData: [
        {
          col: [
            { label: '总大小', value: 0, unit: '' },
            { label: '已使用', value: 0, unit: '' },
            { label: '使用率', value: 0, unit: '' }
          ]
        }
      ],
      echartData: [
        {
          color: '#87DEAF',
          name: '虚拟卷使用率',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100
        }
      ],
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
    virtualData: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.virtualItemId)
          this.$set(this.echartData[0], 'unit', '%')

          if (newVal.value.length > 0) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.value[newVal.value.length - 1])
            this.$set(this.echartData[0].data, 0, newVal.value[newVal.value.length - 1])
          }
          if (newVal.virtualUnits.length > 0) this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.virtualUnits[newVal.virtualUnits.length - 1])
          if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          this.$set(this.tableData[0].col[0], 'value', newVal.total)
          this.$set(this.tableData[0].col[0], 'unit', newVal.totalUnit)
          this.$set(this.tableData[0].col[1], 'value', newVal.user)
          this.$set(this.tableData[0].col[1], 'unit', newVal.userUnit)
          this.$set(this.tableData[0].col[2], 'value', newVal.active)
          this.$set(this.tableData[0].col[2], 'unit', newVal.virtualOriginalUnit)
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
      if (this.virtualData.virtualList && this.virtualData.virtualList.length > 0) {
        this.selectVirtualItem = this.virtualData.virtualList[0].virtualTotalItemId // 初始默认选择第一项
      }
    }, 2000)
    const that = this
    setTimeout(() => {
      if (that.echartData[0].data.length < 2) that.showEmpty = true
    }, 10000)
  },
  methods: {
    changeVirtualItem(val) {
      this.$emit('changeVirtualItem', val)
    },
    // 关闭弹窗
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    // 打开弹窗并处理数据
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          itemid: this.virtualData.virtualItemId,
          valueType: this.virtualData.virtualValueType,
          name: '虚拟卷使用率',
          color: '#87DEAF',
          unit: this.virtualData.virtualOriginalUnit,
          echartType: 'value',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100
        }
      ]
      this.tableParams = [
        {
          label: ['最高虚拟卷使用率', '平均虚拟卷使用率', '最低虚拟卷使用率'],
          value: 0,
          unit: this.virtualData.virtualOriginalUnit,
          itemid: this.virtualData.virtualItemId,
          valueType: this.virtualData.virtualValueType,
          type: ['max', 'avg', 'min']
        }
      ]
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '虚拟卷',
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

