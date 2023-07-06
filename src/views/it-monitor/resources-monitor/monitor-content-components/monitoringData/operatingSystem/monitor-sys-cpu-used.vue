<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length < 2 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5"
    >
      <div class="head-bar head">
        <div class="title">CPU</div>
        <div class="chunk-opts">
          <div v-if="isConfig" class="chunk-opts-select">
            <el-switch
              v-model="watchItemSwitch"
              @change="changeItemSwitch"
            />
          </div>
          <div class="chunk-opts-select margin-left-7-5">
            <el-select v-model="selectCpuItem" size="mini" placeholder="请选择" @change="changeCpuItem">
              <el-option
                v-for="item in cpuUsed.cpuList"
                :key="item.itemId"
                :label="item.name"
                :value="item.itemId"
              />
            </el-select>
            <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openUsedDetailDialog">
          </div>
        </div>
      </div>
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="cpuChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
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
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    cpuUsed: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      selectCpuItem: '',
      echartData: [
        {
          color: '#87DEAF',
          name: 'CPU使用率',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100,
          toFixed: 2
        }
      ],
      tableData: [
        {
          col: [
            { label: 'CPU', value: 0, unit: '%', fixed: 2 }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'sysCpu',
      watchItemShow: null,
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
    cpuUsed: {
      handler(newVal) {
        if (newVal) {
          this.selectCpuItem = newVal.cpuList[0].itemId
          this.$set(this.echartData[0], 'itemId', newVal.cpuList[0].itemId)
          this.$set(this.echartData[0], 'unit', '%')
          if (newVal.value.length > 0) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.value[newVal.value.length - 1])
            this.$set(this.echartData[0].data, 0, newVal.value[newVal.value.length - 1])
          }
          if (newVal.cpuUnits.length > 0) this.$set(this.echartData[0].units, this.echartData[0].units.length, '%')
          if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])
          this.$set(this.tableData[0].col[0], 'value', newVal.active)
        }
      },
      deep: true
    }
  },
  mounted() {
    if (this.cpuUsed > 0) {
      this.selectCpuItem = this.cpuUsed.cpuList[0].itemId
    }
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
    changeCpuItem(val) {
      this.$emit('selectCpuItem', val)
    },
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          itemid: this.cpuUsed.cpuItemId,
          valueType: this.cpuUsed.cpuValueType,
          name: 'CPU使用率',
          color: '#87DEAF',
          unit: '%',
          echartType: 'value',
          data: [],
          units: [],
          time: [],
          yAxisMax: 100,
          toFixed: 2
        }
      ]
      this.tableParams = [
        {
          label: ['最高CPU使用率', '平均CPU使用率', '最低CPU使用率'],
          value: 0,
          unit: '%',
          itemid: this.cpuUsed.cpuItemId,
          valueType: this.cpuUsed.cpuValueType,
          type: ['max', 'avg', 'min'],
          fixed: 2
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
          showName: 'CPU',
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
