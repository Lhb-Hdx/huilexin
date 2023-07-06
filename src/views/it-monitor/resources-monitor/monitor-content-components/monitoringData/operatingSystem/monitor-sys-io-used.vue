<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length < 2 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5"
    >
      <div class="head head-bar">
        <div class="title">磁盘 I/O</div>
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
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="ioChart" :echart-data="echartData" :table-data="tableData" :custom-configuration="customConfiguration" />
      <el-empty v-else description="暂无数据" />
    </div>
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :io-used="ioUsed"
      :show-dialog="showUsedDetailDialog"
      :custom-configuration="customConfiguration"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import UsedStatisticsContainer from '../component/used-statistics-container'
import UsedDetailDialog from '../component/used-detail-dialog'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    ioUsed: {
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
          name: '当前读',
          data: [],
          units: [],
          time: [],
          toFixed: 2,
          unit: 'r/s'
        },
        {
          color: '#3ba9ed',
          name: '当前写',
          data: [],
          units: [],
          time: [],
          toFixed: 2,
          unit: 'w/s'
        }
      ],
      tableData: [
        {
          col: [
            { label: '当前读', value: 0, unit: 'r/s', fixed: 2 },
            { label: '当前写', value: 0, unit: 'w/s', fixed: 2 },
            { label: '磁盘繁忙度', value: 0, unit: '%', fixed: 2 }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      watchItemSwitch: true,
      watchItemKey: 'sysIO',
      watchItemShow: null,
      showEmpty: false,
      customConfiguration: {
        yAxisLabelUnit: ''
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
    ioUsed: {
      handler(newVal) {
        if (newVal) {
          this.$set(this.echartData[0], 'itemId', newVal.readItemId)
          this.$set(this.echartData[0], 'unit', newVal.activeReadUnit.replace('!', ''))
          this.$set(this.echartData[1], 'itemId', newVal.writeItemId)
          this.$set(this.echartData[1], 'unit', newVal.activeWriteUnit.replace('!', ''))

          if (newVal.readValue.length > 0) {
            this.$set(this.echartData[0].data, this.echartData[0].data.length, newVal.readValue[newVal.readValue.length - 1])
            this.$set(this.echartData[0].data, 0, newVal.readValue[newVal.readValue.length - 1])
            this.$set(this.echartData[0].units, 0, newVal.readUnit[newVal.readUnit.length - 1].replace('!', ''))
            this.$set(this.echartData[0].units, this.echartData[0].units.length, newVal.readUnit[newVal.readUnit.length - 1].replace('!', ''))
          }

          if (newVal.writeValue.length > 0) {
            this.$set(this.echartData[1].data, this.echartData[1].data.length, newVal.writeValue[newVal.writeValue.length - 1])
            this.$set(this.echartData[1].data, 0, newVal.writeValue[newVal.writeValue.length - 1])
            this.$set(this.echartData[1].units, 0, newVal.writeUnit[newVal.writeUnit.length - 1].replace('!', ''))
            this.$set(this.echartData[1].units, this.echartData[1].units.length, newVal.writeUnit[newVal.writeUnit.length - 1].replace('!', ''))
          }

          if (newVal.time.length > 0) this.$set(this.echartData[0].time, this.echartData[0].time.length, newVal.time[newVal.time.length - 1])

          this.$set(this.tableData[0].col[0], 'value', newVal.activeReadValue)
          this.$set(this.tableData[0].col[0], 'unit', newVal.activeReadUnit.replace('!', ''))
          this.$set(this.tableData[0].col[1], 'value', newVal.activeWriteValue)
          this.$set(this.tableData[0].col[1], 'unit', newVal.activeWriteUnit.replace('!', ''))
          this.$set(this.tableData[0].col[2], 'value', newVal.activeUtilizationValue)
          this.$set(this.tableData[0].col[2], 'unit', newVal.activeUtilizationUnit.replace('!', ''))
        }
      },
      deep: true
    }
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
          itemid: this.ioUsed.readItemId,
          valueType: this.ioUsed.readValueType,
          name: '读',
          color: '#87DEAF',
          unit: 'r',
          echartType: 'value',
          data: [],
          time: [],
          units: [],
          toFixed: 2,
          unitSuffix: '/s'
        },
        {
          itemid: this.ioUsed.writeItemId,
          valueType: this.ioUsed.writeValueType,
          name: '写',
          color: '#3ba9ed',
          unit: 'w',
          echartType: 'value',
          data: [],
          time: [],
          units: [],
          toFixed: 2,
          unitSuffix: '/s'
        }
      ]
      this.tableParams = [
        {
          label: ['最高读取', '平均读取', '最低读取'],
          value: 0,
          unit: 'w',
          itemid: this.ioUsed.readItemId,
          valueType: this.ioUsed.readValueType,
          type: ['max', 'avg', 'min'],
          fixed: 2,
          unitSuffix: '/s'
        },
        {
          label: ['最高写入', '平均写入', '最低写入'],
          value: 0,
          unit: 'r',
          itemid: this.ioUsed.writeItemId,
          valueType: this.ioUsed.writeValueType,
          type: ['max', 'avg', 'min'],
          fixed: 2,
          unitSuffix: '/s'
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
          showName: '磁盘 I/O',
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
